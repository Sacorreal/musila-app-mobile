import { StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import type { Message } from '@/domains/chat/types/chat.types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && (
          <Text style={styles.senderName}>
            {message.sender?.name} {message.sender?.lastName}
          </Text>
        )}
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={[styles.timeText, isOwn && styles.timeTextOwn]}>{time}</Text>
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
});
