import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import BackButton from '@/components/BackButton';
import BookCover from '@/components/BookCover';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import BookStatsRow from '@/components/BookStatsRow';
import PrimaryButton from '@/components/PrimaryButton';
import { mockBooks } from '@/data/mockBooks';
import { colors } from '@/constants/Colors';

export default function BooksDetailScreen()
{
    const {id} = useLocalSearchParams<{id : string}>();
    const book = mockBooks.find(b => b.id === id);
    const [expanded, setExpanded] = useState(false);

    if (!book)
    {
        return(
            <ThemedView>
                <BackButton onPress={() => router.back()}/>
                <ThemedText variant='body'center>
                    Book not found
                </ThemedText>
            </ThemedView>
        )
    }
    return(
        <ThemedView showAmman={false}>
            <ScrollView 
            showsVerticalScrollIndicator = {false}
            contentContainerStyle = {styles.scrollContent}
            >
                <BackButton onPress={() => router.back()}/>

                <View style={styles.coverContainer}>
                    <BookCover
                        imageUrl={book.coverUrl}
                        width={209}
                        height={294}
                    />
                </View>

                <View style={styles.centered}>
                    <AvailabilityBadge status={book.status}/>
                </View>

                <ThemedText variant='h2' center style={styles.title}>
                    {book.title}
                </ThemedText>

                <ThemedText variant='byline' color='primary' center>
                    By {book.author}
                </ThemedText>
                
                <BookStatsRow
                    rating={book.rating}
                    pages={book.pages}
                    intraLogin={book.intraLogin}
                />

                <ThemedText variant='h3' color='primary' style={styles.aboutHeading}>
                    About
                </ThemedText>

                <ThemedText
                    variant='body'
                    numberOfLines={expanded ? undefined : 3}
                    style={styles.description}
                >
                    {book.description ?? 'No description available.'}
                </ThemedText>
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                    <ThemedText variant='link' color='primary'>
                        {expanded ? 'Read less ∧' : 'Read more ∨'}
                    </ThemedText>
                </TouchableOpacity>
                <View style={styles.buttonContainer}>

                    <PrimaryButton
                        label="Borrow"
                        color={colors.primaryLight}
                        onPress={() => console.log('Borrow pressed:', book.title)} disabeld={false}
                        />
             </View>
             
            </ScrollView>
        </ThemedView>
    )
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
  },
  description: {
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
});