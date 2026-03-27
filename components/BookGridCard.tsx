import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/Colors";
import AvailabilityBadge from "./AvailabilityBadge";
import BookCover from "./BookCover";
import ThemedText from "./ThemedText";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  state: "available" | "borrowed" | "donated";
  pages: number;
  rating: number;
  borrowedBy?: string;
  borrowDate?: string;
  description?: string;
  added_by?: "amufleh";
  borrowId?: string;
}

interface BookGridCardProps {
  book: Book;
  onPress: () => void;
}
export default function BookGridCard({ book, onPress }: BookGridCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <BookCover imageUrl={book.coverUrl} width={165} height={220} />
      <View style={styles.info}>
        <ThemedText variant="bookTitle" numberOfLines={1}>
          {book.title}
        </ThemedText>

        <ThemedText variant="author" opacity={0.8} numberOfLines={1}>
          {book.author}
        </ThemedText>

        <AvailabilityBadge state={book.state} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 16,
    borderRadius: 10,
  },
  shelf: {
    width: "100%",
    height: 12,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    paddingTop: 8,
    paddingHorizontal: 4,
    gap: 3,
  },
});
