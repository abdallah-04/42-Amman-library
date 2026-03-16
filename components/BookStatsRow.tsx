import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';
import ThemedText from './ThemedText';

interface BookStatsRowProps
{
    rating: number;
    pages: number;
    intraLogin: string;
}
interface StatColumnProps {
  label: string;
  value: string;
}

function StatColumn({ label, value }: StatColumnProps) {
  return (
    <View style={styles.column}>
      <ThemedText variant="statLabel" color="muted" opacity={0.8}>
        {label}
      </ThemedText>
      <ThemedText variant="statValue" color="default">
        {value}
      </ThemedText>
    </View>
  );
}

export default function BookStatsRow({
  rating,
  pages,
  intraLogin,
}: BookStatsRowProps) {

    return(
        <View style={styles.container}>
            <StatColumn label='RATING' value={`⭐ ${rating}`} />
              <View style={styles.divider} />

            <StatColumn label="PAGES" value={`${pages}`} />

             <View style={styles.divider} />

             <StatColumn label="INTRA" value={intraLogin} />

        </View>
    );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',        // vertically centered
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 16,
  },
  column: {
    flex: 1,    
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 40, 
    backgroundColor: colors.textDark,
    opacity: 0.15,
  },
});