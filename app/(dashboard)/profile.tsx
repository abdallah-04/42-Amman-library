import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BookCover from '@/components/BookCover';
import { colors } from '@/constants/Colors';
import {
  BASE_URL,
  getUserBorrows,
  getBooksByUser,
  deleteBook,
} from '@/services/api';
import { Book } from '@/components/BookGridCard';
import { mockUser } from '@/data/mockBooks';

const CURRENT_USER = 'amufleh';

interface BookActionCardProps {
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
}: BookActionCardProps) {
  return (
    <View style={cardStyles.container}>
      <BookCover imageUrl={book.coverUrl} width={70} height={100} radius={8} />
      <View style={cardStyles.info}>
        <ThemedText variant="bookTitle" numberOfLines={1}>
          {book.title}
        </ThemedText>
        <ThemedText variant="author" opacity={0.8}>
          {book.author}
        </ThemedText>
        <ThemedText variant="caption" opacity={0.8}>
          {book.borrowDate
            ? `Borrowed: ${book.borrowDate}`
            : `Added by: ${book.added_by ?? CURRENT_USER}`
          }
        </ThemedText>

        <TouchableOpacity
          style={[cardStyles.actionButton, { backgroundColor: buttonColor }]}
          onPress={onAction}
        >
          {buttonLabel === 'Return' && (
            <Ionicons name="refresh" size={14} color={colors.white} />
          )}
          {buttonLabel === 'Delete' && (
            <Ionicons name="trash-outline" size={14} color={colors.white} />
          )}
          <ThemedText variant="caption" color="white">
            {buttonLabel}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks]             = useState<Book[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    setLoading(true);
    try {
      const borrows = await getUserBorrows(CURRENT_USER);
      const mappedBorrows: Book[] = borrows
        .filter((b: any) => !b.returnDate) 
        .map((borrow: any) => ({
          id:          borrow.book?.documentId ?? borrow.id.toString(),
          title:       borrow.book?.title      ?? '',
          author:      borrow.book?.author     ?? '',
          coverUrl:    borrow.book?.coverUrl   ?? '',
          state:      'borrowed' as const,
          pages:       borrow.book?.pages      ?? 0,
          rating:      borrow.book?.rating     ?? 0,
          description: borrow.book?.description ?? '',
          borrowDate:  borrow.borrowDate,
          borrowId:    borrow.documentId ?? borrow.id.toString(),
        }));
      setBorrowedBooks(mappedBorrows);

      const addedBooks = await getBooksByUser(CURRENT_USER);
      const mappedAdded: Book[] = addedBooks.map((item: any) => ({
        id:          item.documentId ?? item.id.toString(),
        title:       item.title      ?? '',
        author:      item.author     ?? '',
        coverUrl:    item.coverUrl   ?? '',
        state:       item.state     ?? 'available',
        pages:       item.pages      ?? 0,
        rating:      item.rating     ?? 0,
        description: item.description ?? '',
        added_by:    item.added_by   ?? CURRENT_USER,
      }));
      setMyBooks(mappedAdded);

    } catch (err) {
      console.log('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(book: Book) {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}" from the library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(book.id);
              setMyBooks(prev => prev.filter(b => b.id !== book.id));
              Alert.alert('Deleted', `"${book.title}" has been removed.`);
            } catch {
              Alert.alert('Error', 'Failed to delete book. Try again.');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <ThemedView>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  const ListHeader = () => (
    <View>
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
            onAction={() => router.push({
              pathname: '/RateReview',
              params: {
                id:       book.id,
                borrowId: book.borrowId ?? '',
              }
            })}
          />
        ))
      ) : (
        <ThemedText variant="body" opacity={0.5} style={styles.emptyText}>
          No books currently borrowed
        </ThemedText>
      )}

      <ThemedText variant="h3" style={styles.sectionLabel}>
        Books I Added
      </ThemedText>
    </View>
  );

  return (
    <ThemedView showAmman={true}>
      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <BookActionCard
            book={item}
            buttonLabel="Delete"
            buttonColor={colors.primary}
            onAction={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <ThemedText variant="body" opacity={0.5} style={styles.emptyText}>
            You haven't added any books yet
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
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