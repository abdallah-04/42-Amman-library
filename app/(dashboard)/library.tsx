import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import SearchBar from '@/components/SearchBar';
import BookGridCard from '@/components/BookGridCard';
import { mockBooks } from '@/data/mockBooks';

export default function LibraryScreen() {
  const [search, setSearch] = useState('');

  const filteredBooks = mockBooks.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ThemedView showAmman={false}>
      <FlatList
        data={filteredBooks}
        numColumns={2}
        keyExtractor={(item) => item.id}

        ListHeaderComponent={
          <View style={{ paddingTop: 16, marginBottom: 8 }}>
            {/* <ThemedText variant="h1">Library</ThemedText> */}
            <SearchBar value={search} onChangeText={setSearch} />
          </View>
        }

        renderItem={({ item }) => (
          <BookGridCard
            book={item}
            onPress={() => console.log('pressed', item.title)}
          />
        )}

        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        columnWrapperStyle={{ gap: 12 }}
      />
    </ThemedView>
  );
}