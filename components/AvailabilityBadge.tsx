import { colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";

interface Availability {
  state: "available" | "borrowed";
}
export default function AvailabilityBadge({ state: status }: Availability) {
  const isAvailable = status === "available";
  const badgeColors = {
    dot: isAvailable ? colors.available : colors.borrowed,
    text: isAvailable ? "available" : "borrowed",
    background: isAvailable ? colors.badgeAvailableBg : colors.badgeBorrowedBg,
  } as const;

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <View style={[styles.dot, { backgroundColor: badgeColors.dot }]} />
      <ThemedText variant="badge" color={badgeColors.text}>
        {isAvailable ? "Available" : "Borrowed"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 60,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
