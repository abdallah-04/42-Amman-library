import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { colors } from '@/constants/Colors';

interface ReviewCardProps {
  intraLogin: string;
  rating: number;
  feedback: string;
  returnDate?: string;
}

export default function ReviewCard({
  intraLogin,
  rating,
  feedback,
  returnDate,
}: ReviewCardProps) {
  return (
    <View style={styles.container}>

      <View style={styles.topRow}>
        <ThemedText variant="bookTitle">
          {intraLogin}
        </ThemedText>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(star => (
            <Ionicons
              key={star}
              name={star <= rating ? 'star' : 'star-outline'}
              size={14}
              color={star <= rating ? colors.borrowed : colors.surface}
            />
          ))}
        </View>
      </View>

      {feedback ? (
        <ThemedText variant="body" style={styles.feedback}>
          "{feedback}"
        </ThemedText>
      ) : (
        <ThemedText variant="caption" color="muted" style={styles.feedback}>
          No written feedback
        </ThemedText>
      )}

      {returnDate && (
        <ThemedText variant="caption" color="muted" style={styles.date}>
          Returned: {returnDate}
        </ThemedText>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  feedback: {
    lineHeight: 22,
  },
  date: {
    marginTop: 4,
  },
});