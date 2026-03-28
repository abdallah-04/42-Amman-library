import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList, View, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import SearchBar from '@/components/SearchBar';
import BookGridCard, { Book } from '@/components/BookGridCard';
import { getAllBooks, searchBooks } from '@/services/api';
import { colors } from '@/constants/Colors';

function mapStringBook(item: any): Book {
  return {
    id: item.documentId,
    title: item.title ?? '',
    author: item.author ?? '',
    coverUrl: item.coverUrl ?? '',
    state: item.state ?? 'available',
    pages: item.pages ?? 0,
    rating: item.rating ?? 0,
    description: item.description ?? '',
    borrowedBy: item.borrowedBy,
    borrowDate: item.borrowDate,
    added_by: item.added_by ?? ''
  };
}

export default function LibraryScreen() {
  const [books, setBooks]     = useState<Book[]>([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
    setRefreshing(true); 
    await loadBooks();  
    setRefreshing(false);
  };
  useFocusEffect(
    useCallback(() => {
      if (!search.trim()) loadBooks();
    }, [])
  );
 useEffect(() => {
    if (!search.trim()) {
      loadBooks();
      return;
    }
    const delay = setTimeout(() => {
      handleSearch(search);
    }, 600);
    return () => clearTimeout(delay);
  }, [search]);

  async function loadBooks() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllBooks();
      setBooks(data.map(mapStringBook));
    } catch {
      setError('Failed to load books. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setLoading(true);
    setError('');
    try {
      const data = await searchBooks(query);
      setBooks(data.map(mapStringBook));
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <ThemedView>
        <ThemedText
          variant="body"
          color="primary"
          center
          style={{ marginTop: 100 }}
        >
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView showAmman={false}>
      <FlatList
        data={books}
        numColumns={2}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ paddingTop: 16, marginBottom: 8 }}>
            <ThemedText variant="h1">Library</ThemedText>
            <SearchBar value={search} onChangeText={setSearch} />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing = {refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            />
        }
        renderItem={({ item }) => (
        <BookGridCard
        book={item}
        onPress={() => {
          console.log('Book tapped:', item.id, item.title); // ← add this
          router.push({
            pathname: '/BookDetailScreen',
            params: { id: item.id }
          });
        }}
      />
    )}
        ListEmptyComponent={
          <ThemedText variant="body" center opacity={0.5}>
            No books found
          </ThemedText>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        columnWrapperStyle={{ gap: 12 }}
      />
    </ThemedView>
  );
}