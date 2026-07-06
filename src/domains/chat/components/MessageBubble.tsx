import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import { MessageType, type Message } from '@/domains/chat/types/chat.types';
import { formatFullName } from '@/shared/utils/formatName';
import { formatFileSize } from '../utils/chatFile';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isPending?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

function getFileIcon(mimeType?: string | null): keyof typeof MaterialCommunityIcons.glyphMap {
  if (!mimeType) return 'file-document-outline';
  if (mimeType.startsWith('audio/')) return 'file-music-outline';
  if (mimeType === 'application/pdf') return 'file-pdf-box';
  return 'file-document-outline';
}

export function MessageBubble({ message, isOwn, isPending, isUploading, uploadProgress }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasCaption = !!message.content && message.content !== message.fileName;

  const handleOpenFile = () => {
    if (message.fileUrl) Linking.openURL(message.fileUrl).catch(() => {});
  };

  const renderContent = () => {
    if (isUploading) {
      return (
        <View style={styles.uploadingRow}>
          <MaterialCommunityIcons name={getFileIcon(message.mimeType)} size={18} color="rgba(255,255,255,0.6)" />
          <Text style={styles.uploadingText} numberOfLines={1}>
            Subiendo {message.fileName ?? 'archivo'}…
          </Text>
        </View>
      );
    }

    if (message.type === MessageType.IMAGE && message.fileUrl) {
      return (
        <Pressable onPress={handleOpenFile}>
          <Image source={{ uri: message.fileUrl }} style={styles.imagePreview} contentFit="cover" />
          {hasCaption && <Text style={styles.messageText}>{message.content}</Text>}
        </Pressable>
      );
    }

    if (message.type === MessageType.FILE && message.fileUrl) {
      return (
        <>
          <Pressable style={styles.fileRow} onPress={handleOpenFile}>
            <View style={styles.fileIconWrapper}>
              <MaterialCommunityIcons name={getFileIcon(message.mimeType)} size={20} color={Brand.accent} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {message.fileName ?? 'Archivo'}
              </Text>
              {!!message.fileSize && <Text style={styles.fileSize}>{formatFileSize(message.fileSize)}</Text>}
            </View>
            <MaterialCommunityIcons name="download-outline" size={16} color="rgba(255,255,255,0.4)" />
          </Pressable>
          {hasCaption && <Text style={styles.messageText}>{message.content}</Text>}
        </>
      );
    }

    return <Text style={styles.messageText}>{message.content}</Text>;
  };

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther, isPending && styles.bubblePending]}>
        {!isOwn && (
          <Text style={styles.senderName}>
            {formatFullName(message.sender?.name, message.sender?.lastName)}
          </Text>
        )}
        {renderContent()}
        {isUploading && !!uploadProgress && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
        )}
        <Text style={[styles.timeText, isOwn && styles.timeTextOwn]}>
          {isUploading ? 'Subiendo…' : isPending ? 'Enviando…' : time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  bubblePending: {
    opacity: 0.7,
  },
  bubbleOwn: {
    backgroundColor: Brand.primaryDark,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontSize: 14,
  },
  timeText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'right',
  },
  timeTextOwn: {
    color: 'rgba(255,255,255,0.6)',
  },
  imagePreview: {
    width: 220,
    height: 160,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 10,
  },
  fileIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fileSize: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.accent,
  },
});
