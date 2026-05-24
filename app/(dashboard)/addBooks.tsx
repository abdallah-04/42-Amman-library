import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import PrimaryButton from '@/components/PrimaryButton';
import { colors } from '@/constants/Colors';
import SuccessModal from '@/components/SuccessModal';
import { addBook } from '@/services/pocketbase';

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
}

interface TabToggleProps {
  activeTab: 'search' | 'manual';
  onTabChange: (tab: 'search' | 'manual') => void;
}

function TabToggle({ activeTab, onTabChange }: TabToggleProps) {
  return (
    <View style={tabStyles.container}>
      <TouchableOpacity
        style={[
          tabStyles.tab,
          activeTab === 'search' && tabStyles.activeTab,
        ]}
        onPress={() => onTabChange('search')}
      >
        <ThemedText
          variant="bookTitle"
          color={activeTab === 'search' ? 'white' : 'default'}
        >
          Search for Book
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          tabStyles.tab,
          activeTab === 'manual' && tabStyles.activeTab,
        ]}
        onPress={() => onTabChange('manual')}
      >
        <ThemedText
          variant="bookTitle"
          color={activeTab === 'manual' ? 'white' : 'default'}
        >
          Manual Entry
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
});

function SearchMode() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedTitle, setAddedTitle]   = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const delay = setTimeout(() => {
      searchBooks(query);
    }, 600);

    return () => clearTimeout(delay);
  }, [query]);

  async function searchBooks(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const url =
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}` +
        `&limit=10&fields=key,title,author_name,number_of_pages_median,cover_i`;

      const response = await fetch(url);
      const data     = await response.json();
      setResults(data.docs ?? []);
    } catch {
      Alert.alert('Error', 'Failed to search. Check your connection.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function getCoverUrl(coverId?: number): string {
    if (!coverId) return '';
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  }

async function fetchDescription(workKey: string): Promise<string> {
  try {
    const res  = await fetch(`https://openlibrary.org${workKey}.json`);
    const data = await res.json();
    const desc = data.description;
    if (!desc) return '';
    return typeof desc === 'string' ? desc : desc.value ?? '';
  } catch {
    return '';
  }
}

async function handleSelectBook(book: OpenLibraryBook) {
  Alert.alert(
    'Add Book',
    `Add "${book.title}" to the library?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        onPress: async () => {
          try {
            const description = await fetchDescription(book.key);
            await addBook({
              title: book.title,
              author: book.author_name?.[0] ?? 'Unknown',
              pages: book.number_of_pages_median ?? 0,
              description,
              state: 'available',
              rating: null,
              coverUrl: book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                : '',
              added_by: null,
            });
            setAddedTitle(book.title);
            setShowSuccess(true);
          } catch (err) {
            Alert.alert('Error', 'Failed to add book');
          }
        },
      },
    ]
  );
}

  return (
    <View style={searchStyles.container}>

      <View style={searchStyles.inputContainer}>
        <Ionicons name="search" size={20} color={colors.textDark} />
        <TextInput
          style={searchStyles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title, author"
          placeholderTextColor={colors.textDark + '50'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={searchStyles.resultsBox}>

        {loading && (
          <View style={searchStyles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText variant="caption" color="muted" style={{ marginTop: 8 }}>
              Searching...
            </ThemedText>
          </View>
        )}

        {!loading && !searched && (
          <View style={searchStyles.center}>
            <Ionicons name="search" size={40} color={colors.textMuted} />
            <ThemedText variant="bookTitle" style={searchStyles.emptyTitle}>
              SEARCH RESULTS
            </ThemedText>
            <ThemedText
              variant="caption"
              color="muted"
              style={searchStyles.emptySubtitle}
            >
              Enter a book name above automatic data entry.
            </ThemedText>
          </View>
        )}

        {!loading && searched && results.length === 0 && (
          <View style={searchStyles.center}>
            <Ionicons name="book-outline" size={40} color={colors.textMuted} />
            <ThemedText variant="caption" color="muted">
              No books found. Try a different search.
            </ThemedText>
          </View>
        )}

        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.key}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={searchStyles.resultItem}
                onPress={() => handleSelectBook(item)}
                activeOpacity={0.8}
              >
                {item.cover_i ? (
                  <Image
                    source={{ uri: getCoverUrl(item.cover_i) }}
                    style={searchStyles.thumbnail}
                  />
                ) : (
                  <View style={searchStyles.nocover}>
                    <Ionicons name="book" size={20} color={colors.textMuted} />
                  </View>
                )}

                <View style={searchStyles.resultInfo}>
                  <ThemedText variant="bookTitle" numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="author" opacity={0.8} numberOfLines={1}>
                    {item.author_name?.[0] ?? 'Unknown Author'}
                  </ThemedText>
                  {item.number_of_pages_median && (
                    <ThemedText variant="caption" color="muted">
                      {item.number_of_pages_median} pages
                    </ThemedText>
                  )}
                </View>

                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (
              <View style={searchStyles.separator} />
            )}
          />
        )}

      </View>
          <SuccessModal
        visible={showSuccess}
        title="Book Added!"
        message={`"${addedTitle}" has been successfully added to the library.`}
        buttonLabel="Go to Library"
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </View>
  );
}

function ManualMode() {
  const [title, setTitle]           = useState('');
  const [author, setAuthor]         = useState('');
  const [description, setDesc]      = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedTitle, setAddedTitle]   = useState('');
  const [uploading, setUploading] = useState(false);

  async function pickImage() {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter the book title.');
      return;
    }
    if (!author.trim()) {
      Alert.alert('Missing Field', 'Please enter the author name.');
      return;
    }
    try {
        setUploading(true);
      await addBook({
        title:       title.trim(),
        author:      author.trim(),
        description: description.trim(),
        state:      'available',
        added_by:    'amufleh',
      }, coverImage);

      setAddedTitle(title.trim());
      setShowSuccess(true);
    } 
    catch {
      Alert.alert('Error', 'Failed to add book. Try again.');
    }
}

  return (
    <View style={manualStyles.wrapper}>

      <ThemedText variant="caption" color="muted" style={manualStyles.label}>
        BOOK TITLE
      </ThemedText>
      <TextInput
        style={manualStyles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={colors.textDark + '40'}
      />

      <ThemedText variant="caption" color="muted" style={manualStyles.label}>
        AUTHOR NAME
      </ThemedText>
      <TextInput
        style={manualStyles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="Author"
        placeholderTextColor={colors.textDark + '40'}
      />

      <ThemedText variant="caption" color="muted" style={manualStyles.label}>
        DESCRIPTION
      </ThemedText>
      <TextInput
        style={[manualStyles.input, manualStyles.textArea]}
        value={description}
        onChangeText={setDesc}
        placeholder="Brief summary of the book..."
        placeholderTextColor={colors.textDark + '40'}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />

      <ThemedText variant="caption" color="muted" style={manualStyles.label}>
        COVER IMAGE
      </ThemedText>
      <TouchableOpacity
        style={manualStyles.uploadBox}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={manualStyles.previewImage}
          />
        ) : (
          <View style={manualStyles.uploadPrompt}>
            <Ionicons name="camera" size={32} color={colors.primary} />
            <ThemedText variant="bookTitle">Upload Cover</ThemedText>
            <ThemedText variant="caption" color="muted">
              JPG, PNG OR WEBP
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>


      <View style={manualStyles.buttonContainer}>
          <PrimaryButton
            label={uploading ? 'Uploading...' : 'Add Book to Library'}
            onPress={handleSubmit}
            disabled={uploading}
          />
      </View>

        <SuccessModal
          visible={showSuccess}
          title="Book Added"
          message={`"${addedTitle}" has been successfully added to the library.`}
          buttonLabel="Go to Library"
          onClose={() => {
            setShowSuccess(false);
            router.back();
        }}
      />
    </View>
  );
}

export default function AddBookScreen() {
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');

  return (
    <ThemedView showAmman={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText variant="h2" center style={styles.title}>
            Add New Book
          </ThemedText>
          <ThemedText
            variant="subtitle"
            center
            opacity={0.6}
            style={styles.subtitle}
          >
            Expand the library collection
          </ThemedText>

          <TabToggle
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'search'
            ? <SearchMode />
            : <ManualMode />
          }

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
});

const manualStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  label: {
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
    fontFamily: 'Lexend_400Regular',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 120,
  },
  uploadPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
});

const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
    fontFamily: 'Lexend_400Regular',
    padding: 0,
  },
  resultsBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    minHeight: 200,
    padding: 16,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    letterSpacing: 1,
    marginTop: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  thumbnail: {
    width: 44,
    height: 60,
    borderRadius: 4,
  },
  nocover: {
    width: 44,
    height: 60,
    borderRadius: 4,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: 4,
  },
});
