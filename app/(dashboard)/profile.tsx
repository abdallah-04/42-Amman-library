import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BookCover from '@/components/BookCover';
import BorrowTimerCard from '@/components/BorrowTimerCard';
import { colors } from '@/constants/Colors';
import {
  getBookCoverUrl,
  getUserBorrows,
  getBooksByUser,
  deleteBook,
  isBookCurrentlyBorrowed,
} from '@/services/pocketbase';
import { Book } from '@/components/BookGridCard';
import { mockUser } from '@/data/mockBooks';
import SuccessModal from '@/components/SuccessModal';

const CURRENT_USER = 'amufleh';

interface BookActionCardProps {
  book: Book;
  buttonLabel: string;
  buttonColor?: string;
  onAction: () => void;
  children?: React.ReactNode;
}

function BookActionCard({
  book,
  buttonLabel,
  buttonColor = colors.primary,
  onAction,
  children,
}: BookActionCardProps) {
  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.row}>
        <BookCover imageUrl={getBookCoverUrl(book)} width={70} height={100} radius={8} />
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
              : `Added by: ${book.added_by ?? CURRENT_USER}`}
          </ThemedText>
        </View>
      </View>

      {children}

      <TouchableOpacity
        style={[cardStyles.actionButton, { backgroundColor: buttonColor }]}
        onPress={onAction}
      >
        {buttonLabel === 'Return' && (
          <Ionicons name="refresh" size={20} color={colors.white} />
        )}
        {buttonLabel === 'Delete' && (
          <Ionicons name="trash-outline" size={20} color={colors.white} />
        )}

        <ThemedText variant="caption" color="white" style={{ fontSize: 14 }}>
          {buttonLabel}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    gap: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSuccess, setShowSuccess] = useState(false);
  const [deletedTitle, setDeletedTitle] = useState('');

  // ✅ NEW DELETE MODAL STATE
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  async function loadProfileData() {
    setLoading(true);
    try {
      const borrows = await getUserBorrows(CURRENT_USER);

      const mappedBorrows: Book[] = borrows
        .filter((b: any) => !b.returnDate)
        .map((borrow: any) => ({
          id: borrow.book?.documentId ?? borrow.id.toString(),
          title: borrow.book?.title ?? '',
          author: borrow.book?.author ?? '',
          coverUrl: borrow.book?.coverUrl ?? '',
          cover: borrow.book?.cover,
          collectionId: borrow.book?.collectionId,
          collectionName: borrow.book?.collectionName,
          state: 'borrowed' as const,
          pages: borrow.book?.pages ?? 0,
          rating: borrow.book?.rating ?? 0,
          description: borrow.book?.description ?? '',
          borrowDate: borrow.borrowDate?.split('T')[0],
          borrowId: borrow.documentId ?? borrow.id.toString(),
          daysElapsed: borrow.daysElapsed ?? 0,
          daysRemaining: borrow.daysRemaining ?? 30,
          isOverdue: borrow.isOverdue ?? false,
          progressPercentage: borrow.progressPercentage ?? 0,
        }));

      setBorrowedBooks(mappedBorrows);

      const addedBooks = await getBooksByUser(CURRENT_USER);

      const mappedAdded: Book[] = addedBooks.map((item: any) => ({
        id: item.documentId ?? item.id.toString(),
        title: item.title ?? '',
        author: item.author ?? '',
        coverUrl: item.coverUrl ?? '',
        cover: item.cover,
        collectionId: item.collectionId,
        collectionName: item.collectionName,
        state: item.state ?? 'available',
        pages: item.pages ?? 0,
        rating: item.rating ?? 0,
        description: item.description ?? '',
        added_by: item.added_by ?? CURRENT_USER,
      }));

      setMyBooks(mappedAdded);
    } catch (err) {
      console.log('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ CLEAN DELETE HANDLER (NO POPUPS)
  function handleDelete(book: Book) {
    if (book.state === 'borrowed') {
      setDeletedTitle(`"${book.title}" is currently borrowed and cannot be deleted.`);
      setShowSuccess(true);
      return;
    }

    setBookToDelete(book);
    setShowDeleteConfirm(true);
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBookToDelete(null);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      const isBorrowed = await isBookCurrentlyBorrowed(bookToDelete.id);

      if (isBorrowed) {
        setDeletedTitle('This book is currently borrowed.');
        setShowSuccess(true);
        return;
      }

      await deleteBook(bookToDelete.id);

      setMyBooks(prev => prev.filter(b => b.id !== bookToDelete.id));

      setDeletedTitle(bookToDelete.title);
      setShowSuccess(true);
    } catch (error) {
      console.log('Failed to delete book:', error);
      setDeletedTitle('Failed to delete book. Try again.');
      setShowSuccess(true);
    } finally {
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    }
  };

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
          <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatarImage} />
        </View>
      </View>

      <ThemedText variant="statValue" center style={styles.username}>
        {mockUser.username}
      </ThemedText>

      <ThemedText variant="h3" style={styles.sectionLabel}>
        Currently Borrowing
      </ThemedText>

      {borrowedBooks.map(book => (
        <BookActionCard
          key={book.borrowId ?? book.id}
          book={book}
          buttonLabel="Return"
          onAction={() =>
            router.push({
              pathname: '/RateReview',
              params: {
                id: book.id,
                borrowId: book.borrowId ?? '',
              },
            })
          }
        >
          <BorrowTimerCard
            daysElapsed={book.daysElapsed ?? 0}
            daysRemaining={book.daysRemaining ?? 30}
            isOverdue={book.isOverdue ?? false}
            progressPercentage={book.progressPercentage ?? 0}
          />
        </BookActionCard>
      ))}

      <ThemedText variant="h3" style={styles.sectionLabel}>
        Books I Added
      </ThemedText>
    </View>
  );

  return (
    <ThemedView showAmman={true}>
      <FlatList
        data={myBooks}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <BookActionCard
            book={item}
            buttonLabel="Delete"
            buttonColor={colors.red}
            onAction={() => handleDelete(item)}
          />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* ✅ DELETE CONFIRM MODAL */}
      {showDeleteConfirm && bookToDelete && (
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <ThemedText variant="h3" style={{ marginBottom: 10 }}>
              Delete Book
            </ThemedText>

            <ThemedText style={{ marginBottom: 16 }}>
              Are you sure you want to delete "{bookToDelete.title}"?
            </ThemedText>

            <View style={modalStyles.row}>
              <TouchableOpacity onPress={cancelDelete} style={modalStyles.cancelBtn}>
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmDelete} style={modalStyles.deleteBtn}>
                <ThemedText color="white">Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <SuccessModal
        visible={showSuccess}
        title="Notice"
        message={deletedTitle}
        buttonLabel="OK"
        onClose={() => setShowSuccess(false)}
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
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  box: {
    width: 300,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    padding: 10,
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: colors.red,
    borderRadius: 8,
  },
});