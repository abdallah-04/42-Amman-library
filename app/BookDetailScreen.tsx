import AvailabilityBadge from "@/components/AvailabilityBadge";
import BackButton from "@/components/BackButton";
import BookCover from "@/components/BookCover";
import { Book } from "@/components/BookGridCard";
import BookStatsRow from "@/components/BookStatsRow";
import PrimaryButton from "@/components/PrimaryButton";
import ReviewCard from "@/components/ReviewCard";       
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { colors } from "@/constants/Colors";
import {
  getBook,
  borrowBook,
  updateBookStatus,
  getBookReviews,                                         
} from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import SuccessModal from "@/components/SuccessModal";

interface Review {
  id: string;
  intraLogin: string;
  rating: number;
  feedback: string;
  returnDate?: string;
}

function mapStringBook(item: any): Book {
  return {
    id:          item.documentId ?? item.id.toString(),
    title:       item.title       ?? '',
    author:      item.author      ?? '',
    coverUrl:    item.coverUrl    ?? '',
    state:       item.state       ?? 'available',
    pages:       item.pages       ?? 0,
    rating:      item.rating      ?? 0,
    description: item.description ?? '',
    borrowedBy:  item.borrowedBy  ?? undefined,
    borrowDate:  item.borrowDate  ?? undefined,
    added_by:    item.added_by    ?? '',
  };
}

function mapReview(item: any): Review {
  return {
    id:          item.id.toString(),
    intraLogin:  item.intraLogin  ?? 'Anonymous',
    rating:      item.rating      ?? 0,
    feedback:    item.feedback    ?? '',
    returnDate:  item.returnDate  ?? undefined,
  };
}

export default function BooksDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook]           = useState<Book | null>(null);
  const [reviews, setReviews]     = useState<Review[]>([]);   // ✅ new
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  async function loadBook() {
    setLoading(true);
    setError('');
    try {
      const bookData = await getBook(bookId);
      setBook(mapStringBook(bookData));
    } catch (err) {
      console.log('Error loading book:', err);
      setError('Failed to load book.');
      setLoading(false);
      return;
    }

    try {
      const reviewsData = await getBookReviews(bookId);
      setReviews(reviewsData.map(mapReview));
    } catch (err) {
      console.log('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBorrow() {
    if (!book || book.state === 'borrowed') return;

    setBorrowing(true);
    try {
      await borrowBook(book.id, 'amufleh');
      await updateBookStatus(book.id, 'borrowed');
      setShowSuccess(true);
    } catch {
      Alert.alert('Error', 'Failed to borrow book. Try again.');
    } finally {
      setBorrowing(false);
    }
  }

  if (loading) {
    return (
      <ThemedView>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ flex: 1, marginTop: 100 }}
        />
      </ThemedView>
    );
  }

  if (error || !book) {
    return (
      <ThemedView>
        <BackButton onPress={() => router.back()} />
        <ThemedText
          variant="body"
          color="primary"
          center
          style={{ marginTop: 40 }}
        >
          {error || 'Book not found'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView showAmman={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BackButton onPress={() => router.back()} />


        <View style={styles.coverContainer}>
          <BookCover imageUrl={book.coverUrl} width={209} height={294} />
        </View>

  
        <View style={styles.centered}>
          <AvailabilityBadge state={book.state} />
        </View>

  
        <ThemedText variant="h2" center style={styles.title}>
          {book.title}
        </ThemedText>

  
        <ThemedText variant="byline" color="primary" center>
          By {book.author}
        </ThemedText>

   
        <BookStatsRow
          rating={book.rating || '--'}
          pages={book.pages}
          intraLogin={book.added_by || 'N/A'}
        />

 
        <ThemedText variant="h3" color="primary" style={styles.aboutHeading}>
          About
        </ThemedText>

        <ThemedText
          variant="body"
          numberOfLines={expanded ? undefined : 3}
          style={styles.description}
        >
          {book.description || 'No description available.'}
        </ThemedText>

        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <ThemedText variant="link" color="primary">
            {expanded ? 'Read less ∧' : 'Read more ∨'}
          </ThemedText>
        </TouchableOpacity>


        <View style={styles.buttonContainer}>
          <PrimaryButton
            label={
              borrowing ? 'Borrowing...' :
              book.state === 'borrowed' ? 'Already Borrowed' :
              'Borrow'
            }
            color={colors.primaryLight}
            disabled={book.state === 'borrowed' || borrowing}
            onPress={handleBorrow}
          />
        </View>


        <View style={styles.reviewsSection}>
          <ThemedText variant="h3" color="primary" style={styles.reviewsTitle}>
            Reviews
            {reviews.length > 0 && (
              <ThemedText variant="caption" color="muted">
                {` (${reviews.length})`}
              </ThemedText>
            )}
          </ThemedText>

          {reviews.length > 0 ? (
            reviews.map(review => (
              <ReviewCard
                key={review.id}
                intraLogin={review.intraLogin}
                rating={review.rating}
                feedback={review.feedback}
                returnDate={review.returnDate}
              />
            ))
          ) : (
            <View style={styles.noReviews}>
              <ThemedText variant="body" color="muted" center opacity={0.6}>
                No reviews yet.{'\n'}Be the first to borrow and review!
              </ThemedText>
            </View>
          )}
        </View>

      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        title="Book Borrowed! "
        message={`"${book.title}" has been added to your borrowed books.`}
        buttonLabel="Go to Library"
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  centered: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginTop: 8,
    marginBottom: 4,
  },
  aboutHeading: {
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },

  reviewsSection: {
    marginTop: 24,
  },
  reviewsTitle: {
    marginBottom: 16,
  },
  noReviews: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
});
