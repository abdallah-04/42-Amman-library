import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { colors } from '@/constants/Colors';

const OVERDUE_RED = '#E53E3E';

interface BorrowTimerCardProps {
  daysElapsed: number;
  daysRemaining: number;
  isOverdue: boolean;
  progressPercentage: number;
}

function barColor(progressPercentage: number, isOverdue: boolean): string {
  if (isOverdue) return OVERDUE_RED;
  if (progressPercentage >= 77) return colors.borrowed;
  return colors.available;
}

export default function BorrowTimerCard({
  daysElapsed,
  daysRemaining,
  isOverdue,
  progressPercentage,
}: BorrowTimerCardProps) {
  const fill = barColor(progressPercentage, isOverdue);
  const overdueDays = daysElapsed - 30;

  const statusText = isOverdue
    ? `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`
    : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;

  return (
    <View style={styles.container}>
      <ThemedText variant="caption" color="muted">
        Borrowing Duration
      </ThemedText>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${progressPercentage}%` as any, backgroundColor: fill },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText variant="caption" style={{ color: fill }}>
          {statusText}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          Day {Math.min(daysElapsed, 30)} of 30
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
    gap: 4,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
