import React from 'react';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BookCover from '@/components/BookCover';
import { colors } from '@/constants/Colors';
import { mockBooks, mockUser } from '@/data/mockBooks';
import { Book } from '@/components/BookGridCard';

interface BookActionCardProps
{
  book: Book;
  buttonLabel: string;
  buttonColor?: string;
  onAction: () => void;
}

function BookActionCard({
  book,
  buttonLabel,
  buttonColor = colors.primary,
  onAction,
}: BookActionCardProps) 
{
  return(
<View style={cardStyles.container}>

      {/* Left — book cover */}
      <BookCover
        imageUrl={book.coverUrl}
        width={70}
        height={100}
        radius={8}
      />

      {/* Right — info + button */}
      <View style={cardStyles.info}>
        <ThemedText variant="bookTitle" numberOfLines={1}>
          {book.title}
        </ThemedText>
        <ThemedText variant="author" opacity={0.8}>
          {book.author}
        </ThemedText>
        <ThemedText variant="caption" opacity={0.8}>
          Borrowed: {book.borrowDate ?? 'Unknown'}
        </ThemedText>

        {/* Action button — full width below text */}
        <TouchableOpacity
          style={[cardStyles.actionButton, { backgroundColor: buttonColor }]}
          onPress={onAction}
        >
          {buttonLabel === 'Return' && (
            <Ionicons name="refresh" size={14} color={colors.white} />
          )}
          <ThemedText variant="caption" color="white">
            {buttonLabel}
          </ThemedText>
        </TouchableOpacity>

      </View>
    </View>
  )
}
const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
    marginTop: 4,
  },
});

export default function ProfileScreen() {
  const borrowedBooks = mockBooks.filter(b => b.status === 'borrowed');
  const donatedBooks  = mockBooks.filter(b => b.status === 'donated');

  const ListHeader = () => (
    <View>
      <ThemedText variant="h1" style={styles.title}>profile</ThemedText>

      <View style={styles.avatarSection}>
        <View style={styles.avatarRing}>
          <Image
            source={{ uri: mockUser.avatarUrl }}
            style={styles.avatarImage}
          />
        </View>
      </View>

      <ThemedText variant="statValue" center style={styles.username}>
        {mockUser.username}
      </ThemedText>

      <ThemedText variant="h3" style={styles.sectionLabel}>
        Currently Borrowing
      </ThemedText>

      {borrowedBooks.length > 0 ? (
        borrowedBooks.map(book => (
          <BookActionCard
            key={book.id}
            book={book}
            buttonLabel="Return"
            onAction={() => console.log('Return:', book.title)}
          />
        ))
      ) : (
        <ThemedText variant="body" opacity={0.5} style={styles.emptyText}>
          No books currently borrowed
        </ThemedText>
      )}

      <ThemedText variant="h3" style={styles.sectionLabel}>
        Books you brought
      </ThemedText>
    </View>
  );

  return (
    <ThemedView showAmman={true}>
      <FlatList
        data={donatedBooks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <BookActionCard
            book={item}
            buttonLabel="Delete"
            onAction={() => console.log('Delete:', item.title)}
          />
        )}
        ListEmptyComponent={
          <ThemedText variant="body" opacity={0.5} style={styles.emptyText}>
            No books donated yet
          </ThemedText>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    paddingTop: 16,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.avatarRing,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  username: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
});