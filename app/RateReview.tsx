import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BookCover from '@/components/BookCover';
import BackButton from '@/components/BackButton';
import PrimaryButton from '@/components/PrimaryButton';
import { mockBooks } from '@/data/mockBooks';
import { colors } from '@/constants/Colors';
import Spacer from '@/components/Spacer';

interface StarRatingProps 
{
  rating: number;
  onRate: (star: number) => void;
}

function StarRating({rating, onRate}: StarRatingProps)
{
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
                            color={star <= rating ? colors.primary : colors.surface}
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
    textAlign: 'center'
  },
});

export default function RateReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = mockBooks.find(b => b.id === id);
  const [rating, setRating]     = useState(0);
  const [feedback, setFeedback] = useState('');

  if (!book) {
    return (
      <ThemedView>
        <BackButton onPress={() => router.back()} />
        <ThemedText variant="body" center>Book not found</ThemedText>
      </ThemedView>
    );
  }

  function handleReturn() {
    if (rating === 0) {
      Alert.alert(
        'No Rating',
        'Would you like to return without rating?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Return Anyway', onPress: () => router.back() },
        ]
      );
      return;
    }
    console.log('Rating:', rating, '| Feedback:', feedback);
    Alert.alert(
      'Book Returned!',
      `Thank you for rating "${book.title}" ${rating}/5 ⭐`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
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
            
            <Spacer/>
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
            placeholder="What did you think about this book? Share your thoughts..."
            placeholderTextColor={colors.textDark + '50'}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
            autoCorrect={false}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton label="Return Book" onPress={handleReturn} disabeld={false} />
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
  screenTitle: {
    marginTop: 16,
    marginBottom: 24,
  },
  bookInfo: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
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