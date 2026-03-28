import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BookCover from '@/components/BookCover';
import BackButton from '@/components/BackButton';
import PrimaryButton from '@/components/PrimaryButton';
import { getBook, returnBook, updateBookStatus } from '@/services/api';
import { Book } from '@/components/BookGridCard';
import { colors } from '@/constants/Colors';

interface StarRatingProps {
  rating: number;
  onRate: (star: number) => void;
}

function StarRating({ rating, onRate }: StarRatingProps) {
  return (
    <View>
      <View style={starStyles.row}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => onRate(star)}
            activeOpacity={0.7}
          >
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
    id:          item.documentId ?? item.id.toString(),
    title:       item.title       ?? '',
    author:      item.author      ?? '',
    coverUrl:    item.coverUrl    ?? '',
    state:      item.status      ?? 'available',
    pages:       item.pages       ?? 0,
    rating:      item.rating      ?? 0,
    description: item.description ?? '',
    borrowedBy:  item.borrowedBy,
    borrowDate:  item.borrowDate,
  };
}

export default function RateReviewScreen() {
  const { id, borrowId } = useLocalSearchParams<{
    id: string;
    borrowId: string;
  }>();

  const [book, setBook]         = useState<Book | null>(null);
  const [loading, setLoading]   = useState(true);
  const [rating, setRating]     = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadBook();
  }, []);

  async function loadBook() {
    setLoading(true);
    try {
      const data = await getBook(id);
      setBook(mapBook(data));
    } catch {
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
      Alert.alert(
        'No Rating',
        'Would you like to return without rating?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Return Anyway',
            onPress: () => submitReturn(0, ''),
          },
        ]
      );
      return;
    }
    submitReturn(rating, feedback);
  }

  async function submitReturn(stars: number, comment: string) {
    try {
      if (borrowId) {
        await returnBook(borrowId, stars, comment);
      }

      await updateBookStatus(book!.id, 'available');

      Alert.alert(
        'Book Returned!',
        `Thank you for returning "${book!.title}"`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to return book. Try again.');
    }
  }

  return (
    <ThemedView showAmman={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton onPress={() => router.back()} />

          <View style={styles.bookInfo}>
            <BookCover imageUrl={book.coverUrl} width={160} height={220} />
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
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
            autoCorrect={false}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="Return Book"
              onPress={handleReturn}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textDark,
    fontFamily: 'Lexend_400Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 32,
  },
});