import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types';
import { COLORS } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';

interface Props {
  message: ChatMessage;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: Props) {
  return (
    <View style={[styles.row, isOwn ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleBuddy]}>
        <Text style={styles.text}>{message.text}</Text>
        <Text style={styles.time}>{formatTimestamp(message.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: COLORS.chatSent,
    borderBottomRightRadius: 4,
  },
  bubbleBuddy: {
    backgroundColor: COLORS.chatReceived,
    borderBottomLeftRadius: 4,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
});
