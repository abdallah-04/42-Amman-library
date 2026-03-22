import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import SearchBar from '@/components/SearchBar';
import BookGridCard from '@/components/BookGridCard';
import { mockBooks } from '@/data/mockBooks';
import { router } from 'expo-router';
import { getAllBooks } from '@/services/api';

export default function LibraryScreen() {
  useEffect(() => 
{
  getAllBooks().then(data =>
  {
    console.log('Books from API:', data);
  }
  ).catch(err => 
  {
   console.log('API Error:', err.message);
  });
}, []);
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
            
           {/* <ThemedText variant="h2" >
              Library
            </ThemedText> */}
            <SearchBar value={search} onChangeText={setSearch} />
          </View>
        }

        renderItem={({ item }) => (
          <BookGridCard
            book={item}
            onPress={() => router.push({
              pathname: '/BookDetailScreen',
              params: {id: item.id}
            })}
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