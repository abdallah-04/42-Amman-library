import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BookCover from '@/components/BookCover';
import BackButton from '@/components/BackButton';
import PrimaryButton from '@/components/PrimaryButton';
import {
  getBook,
  getBookCoverUrl,
  returnBook,
  updateBookStatus,
} from '@/services/pocketbase';
import { Book } from '@/components/BookGridCard';
import { colors } from '@/constants/Colors';

function StarRating({ rating, onRate }: any) {
  return (
    <View>
      <View style={starStyles.row}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onRate(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? colors.borrowed : colors.surface}
            />
          </TouchableOpacity>
        ))}
      </View>
      <ThemedText variant="caption" color="muted" style={starStyles.label}>
        {rating > 0 ? `${rating}/5 stars` : 'Tap a star to rate'}
      </ThemedText>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
    marginBottom: 4,
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
  },
});

function mapBook(item: any): Book {
  return {
    id: item.documentId ?? item.id.toString(),
    title: item.title ?? '',
    author: item.author ?? '',
    coverUrl: item.coverUrl ?? '',
    cover: item.cover,
    collectionId: item.collectionId,
    collectionName: item.collectionName,
    state: item.status ?? 'available',
    pages: item.pages ?? 0,
    rating: item.rating ?? 0,
    description: item.description ?? '',
    borrowedBy: item.borrowedBy,
    borrowDate: item.borrowDate,
  };
}

export default function RateReviewScreen() {
  const { id, borrowId } = useLocalSearchParams<{
    id: string;
    borrowId: string;
  }>();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // ✅ NEW UI STATE
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadBook();
  }, []);

  async function loadBook() {
    setLoading(true);
    try {
      const data = await getBook(id);
      setBook(mapBook(data));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ThemedView>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!book) {
    return (
      <ThemedView>
        <BackButton onPress={() => router.back()} />
        <ThemedText variant="body" center style={{ marginTop: 40 }}>
          Book not found
        </ThemedText>
      </ThemedView>
    );
  }

  async function handleReturn() {
    if (rating === 0) {
      setSuccessMessage('You are returning without rating');
      setShowSuccess(true);

      setTimeout(() => submitReturn(0, ''), 800);
      return;
    }

    submitReturn(rating, feedback);
  }

  async function submitReturn(stars: number, comment: string) {
    try {
      if (borrowId) {
        await returnBook(borrowId, book!.id, stars, comment);
      }

      await updateBookStatus(book!.id, 'available');

      setSuccessMessage(`"${book!.title}" returned successfully`);
      setShowSuccess(true);

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (e) {
      console.log(e);
      setSuccessMessage('Failed to return book. Try again.');
      setShowSuccess(true);
    }
  }

  return (
    <ThemedView showAmman={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BackButton onPress={() => router.back()} />

          <View style={styles.bookInfo}>
            <BookCover imageUrl={getBookCoverUrl(book)} width={160} height={220} />
            <ThemedText variant="h3" center style={styles.bookTitle}>
              {book.title}
            </ThemedText>
            <ThemedText variant="author" color="muted" center>
              {book.author}
            </ThemedText>
          </View>

          <ThemedText variant="bookTitle" style={styles.sectionLabel}>
            Rate this book
          </ThemedText>
          <StarRating rating={rating} onRate={setRating} />

          <ThemedText variant="bookTitle" style={styles.sectionLabel}>
            Your feedback
          </ThemedText>

          <TextInput
            style={styles.feedbackInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="What did you think about this book?"
            placeholderTextColor={colors.textDark + '50'}
            multiline
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton label="Return Book" onPress={handleReturn} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ SUCCESS UI (NO ALERTS) */}
      {showSuccess && (
        <View style={successStyles.overlay}>
          <View style={successStyles.box}>
            <ThemedText variant="h3" center>
              Success
            </ThemedText>

            <ThemedText center style={{ marginTop: 8 }}>
              {successMessage}
            </ThemedText>

            <TouchableOpacity
              style={successStyles.button}
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
            >
              <ThemedText color="white">OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bookInfo: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
    marginTop: 16,
  },
  bookTitle: {
    marginTop: 8,
  },
  sectionLabel: {
    marginBottom: 12,
    marginTop: 16,
  },
  feedbackInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    color: colors.textDark,
  },
  buttonContainer: {
    marginTop: 32,
  },
});

const successStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 280,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});