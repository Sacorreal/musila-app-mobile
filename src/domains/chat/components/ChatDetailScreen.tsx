import { useEffect, useMemo, useRef, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { useChatMessages } from '@/domains/chat/hooks/use-chat.hooks';
import { MessageBubble } from '@/domains/chat/components/MessageBubble';
import { chatService } from '@/domains/chat/services/chat.service';
import { chatSocketService } from '@/domains/chat/services/chat-socket.service';
import { resolveMessageType, formatFileSize } from '@/domains/chat/utils/chatFile';
import { MessageType, type IncomingMessagePayload, type Message } from '@/domains/chat/types/chat.types';
import { useUploadStorage } from '@/domains/storage/hooks/use-upload-storage.hooks';

const MAX_FILE_SIZE_MB = 25;

type LiveMessage = Message & { isUploading?: boolean };

interface PendingAttachment {
  uri: string;
  mimeType: string;
  name: string;
  size?: number;
}

export function ChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id ?? '';
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useChatMessages(chatId);
  const { uploadFiles, progresses, isUploading } = useUploadStorage();

  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const lastMarkedChatRef = useRef<string | null>(null);

  useEffect(() => {
    setLiveMessages([]);
    setInputValue('');
    setPendingAttachment(null);
  }, [chatId]);

  useEffect(() => {
    if (history.length > 0) {
      setLiveMessages((prev) => prev.filter((m) => !m.id.startsWith('optimistic-')));
    }
  }, [history]);

  const allMessages = useMemo(() => {
    const historyIds = new Set(history.map((m) => m.id));
    const uniqueLive = liveMessages.filter((m) => !historyIds.has(m.id));
    return [...history, ...uniqueLive];
  }, [history, liveMessages]);

  const markRead = () => {
    if (lastMarkedChatRef.current === chatId) return;
    lastMarkedChatRef.current = chatId;
    chatService
      .markAsRead(chatId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['requests'] }))
      .catch(() => {});
  };

  useEffect(() => {
    if (history.length > 0) {
      lastMarkedChatRef.current = null;
      markRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, history.length]);

  useEffect(() => {
    const hasNewFromOther = liveMessages.some(
      (m) => m.sender?.id !== user?.id && !m.id.startsWith('optimistic-'),
    );
    if (hasNewFromOther) {
      lastMarkedChatRef.current = null;
      markRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMessages.length]);

  useEffect(() => {
    if (!token || !user?.id || !chatId) return;

    const socket = chatSocketService.connect(token);
    if (!socket) return;

    chatSocketService.joinChat(chatId);

    const handleIncoming = (payload: IncomingMessagePayload) => {
      if (payload.chatId !== chatId) return;
      setLiveMessages((prev) => {
        if (prev.some((m) => m.id === payload.messageId)) return prev;

        const isFromMe = payload.senderId === user.id;
        const filtered = isFromMe
          ? prev.filter((m) => !m.id.startsWith('optimistic-') || m.content.trim() !== payload.content.trim())
          : prev;

        return [
          ...filtered,
          {
            id: payload.messageId,
            chatId: payload.chatId,
            content: payload.content,
            sender: { id: payload.senderId, name: '', lastName: '' },
            type: payload.type,
            fileUrl: payload.fileUrl,
            fileKey: payload.fileKey,
            fileName: payload.fileName,
            fileSize: payload.fileSize,
            mimeType: payload.mimeType,
            createdAt: new Date().toISOString(),
          },
        ];
      });

      queryClient.invalidateQueries({ queryKey: ['chat', chatId, 'messages'] });
    };

    socket.on('chat.message.sent', handleIncoming);

    return () => {
      socket.off('chat.message.sent', handleIncoming);
    };
  }, [chatId, token, user?.id, queryClient]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
        Toast.show({ type: 'error', text1: `El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB` });
        return;
      }
      setPendingAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'imagen.jpg',
        size: asset.fileSize,
      });
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'audio/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.size && asset.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        Toast.show({ type: 'error', text1: `El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB` });
        return;
      }
      setPendingAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'application/pdf',
        name: asset.name,
        size: asset.size,
      });
    }
  };

  const handleSend = async () => {
    if (isUploading || !user) return;

    if (pendingAttachment) {
      const attachment = pendingAttachment;
      const type = resolveMessageType(attachment.mimeType);
      const content = inputValue.trim() || attachment.name;
      const optimisticId = `optimistic-${Date.now()}`;

      setLiveMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          chatId,
          content,
          sender: { id: user.id, name: '', lastName: '' },
          type,
          fileName: attachment.name,
          mimeType: attachment.mimeType,
          isUploading: true,
          createdAt: new Date().toISOString(),
        },
      ]);
      setPendingAttachment(null);
      setInputValue('');

      try {
        const [uploaded] = await uploadFiles([
          { uri: attachment.uri, mimeType: attachment.mimeType, folder: `chat/${chatId}/documents`, field: 'chatFile' },
        ]);

        chatSocketService.sendMessage({
          chatId,
          content,
          type,
          fileUrl: uploaded?.publicUrl,
          filekey: uploaded?.key,
          fileName: attachment.name,
        });

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['chat', chatId, 'messages'] });
        }, 1500);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error al subir el archivo', text2: 'Intenta de nuevo' });
        setLiveMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
      return;
    }

    if (!inputValue.trim()) return;
    const content = inputValue.trim();
    const optimisticId = `optimistic-${Date.now()}`;

    setLiveMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        chatId,
        content,
        sender: { id: user.id, name: '', lastName: '' },
        type: MessageType.TEXT,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInputValue('');

    chatSocketService.sendMessage({ chatId, content, type: MessageType.TEXT });

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId, 'messages'] });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Conversación</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.primary} size="large" />
          </View>
        ) : allMessages.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>Sin mensajes aún</Text>
          </View>
        ) : (
          <FlatList
            data={[...allMessages].reverse()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwn={item.sender?.id === user?.id}
                isPending={item.id.startsWith('optimistic-')}
                isUploading={(item as LiveMessage).isUploading}
                uploadProgress={progresses.chatFile}
              />
            )}
            inverted
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {pendingAttachment && (
          <View style={styles.attachmentPreview}>
            {pendingAttachment.mimeType.startsWith('image/') ? (
              <Image source={{ uri: pendingAttachment.uri }} style={styles.attachmentThumb} contentFit="cover" />
            ) : (
              <View style={styles.attachmentIconBox}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color={Brand.accent} />
              </View>
            )}
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {pendingAttachment.name}
              </Text>
              {!!pendingAttachment.size && (
                <Text style={styles.attachmentSize}>{formatFileSize(pendingAttachment.size)}</Text>
              )}
            </View>
            <Pressable onPress={() => setPendingAttachment(null)} hitSlop={8} disabled={isUploading}>
              <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>
        )}

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <Pressable style={styles.iconBtn} onPress={handlePickImage} disabled={isUploading} hitSlop={8}>
            <MaterialCommunityIcons name="image-outline" size={22} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={handlePickDocument} disabled={isUploading} hitSlop={8}>
            <MaterialCommunityIcons name="paperclip" size={22} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={pendingAttachment ? 'Agrega un mensaje (opcional)…' : 'Escribe un mensaje…'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            editable={!isUploading}
          />
          <Pressable
            style={[styles.sendBtn, (!inputValue.trim() && !pendingAttachment) || isUploading ? styles.sendBtnDisabled : null]}
            onPress={handleSend}
            disabled={(!inputValue.trim() && !pendingAttachment) || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(32,138,239,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(32,138,239,0.2)',
  },
  attachmentThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  attachmentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  attachmentName: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  attachmentSize: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
