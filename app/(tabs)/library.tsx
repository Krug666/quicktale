
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import { Book } from '@/types';
import * as DocumentPicker from 'expo-document-picker';

export default function LibraryScreen() {
  const [personalBooks, setPersonalBooks] = useState<Book[]>([]);
  const [purchasedBooks, setPurchasedBooks] = useState<Book[]>([]);
  const dataService = DataService.getInstance();

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const [personal, purchased] = await Promise.all([
        dataService.getPersonalLibrary(),
        dataService.getPurchasedBooks(),
      ]);
      setPersonalBooks(personal);
      setPurchasedBooks(purchased);
    } catch (error) {
      console.log('Error loading library:', error);
    }
  };

  const handleAddPDFBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        Alert.prompt(
          'Add Book Details',
          'Enter book title:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add',
              onPress: async (title) => {
                if (title) {
                  Alert.prompt(
                    'Book Author',
                    'Enter author name:',
                    [
                      { text: 'Skip', style: 'cancel' },
                      {
                        text: 'Add',
                        onPress: async (author) => {
                          const newBook = await dataService.addBookToPersonalLibrary({
                            title,
                            author: author || 'Unknown Author',
                            description: 'Personal PDF book',
                            summary: 'Added from personal collection',
                            pdfUrl: file.uri,
                          });
                          
                          Alert.alert('Success', 'Book added to your library!');
                          loadLibrary();
                        },
                      },
                    ]
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log('Error adding PDF book:', error);
      Alert.alert('Error', 'Failed to add book to library');
    }
  };

  const handleReadBook = (book: Book) => {
    router.push({
      pathname: '/book-reader',
      params: { bookId: book.id },
    });
  };

  const renderBookItem = (book: Book, isPersonal: boolean = false) => (
    <TouchableOpacity
      key={book.id}
      style={[commonStyles.card, { marginHorizontal: 16 }]}
      onPress={() => handleReadBook(book)}
    >
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.bookCover}>
          <IconSymbol 
            name={isPersonal ? "doc.text.fill" : "book.fill"} 
            size={32} 
            color={colors.primary} 
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[commonStyles.subtitle, { fontSize: 16, marginBottom: 4 }]}>
            {book.title}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
            by {book.author}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconSymbol name="checkmark.circle.fill" size={16} color={colors.primary} />
            <Text style={[commonStyles.textSecondary, { marginLeft: 4, fontSize: 12 }]}>
              {isPersonal ? 'Personal Library' : 'Purchased'}
            </Text>
          </View>
        </View>
        <View style={styles.bookActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/book-notes',
              params: { bookId: book.id },
            })}
          >
            <IconSymbol name="note.text" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Audio playback coming soon!')}
          >
            <IconSymbol name="speaker.wave.2" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Library',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddPDFBook}
              style={{ padding: 8 }}
            >
              <IconSymbol name="plus" color={colors.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            Platform.OS !== 'ios' && { paddingBottom: 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={commonStyles.title}>My Library</Text>
            <Text style={commonStyles.textSecondary}>
              Your personal collection and purchased books
            </Text>
          </View>

          {/* Add Book Section */}
          <View style={[commonStyles.card, { marginHorizontal: 16, backgroundColor: colors.accent }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8 }]}>
                Add Your Own Books
              </Text>
            </View>
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Upload PDF books to your personal library
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: colors.primary }]}
              onPress={handleAddPDFBook}
            >
              <Text style={commonStyles.buttonText}>Upload PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Library Section */}
          {personalBooks.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[commonStyles.subtitle, { fontSize: 20 }]}>
                  Personal Library ({personalBooks.length})
                </Text>
              </View>
              {personalBooks.map(book => renderBookItem(book, true))}
            </>
          )}

          {/* Purchased Books Section */}
          {purchasedBooks.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[commonStyles.subtitle, { fontSize: 20 }]}>
                  Purchased Books ({purchasedBooks.length})
                </Text>
              </View>
              {purchasedBooks.map(book => renderBookItem(book, false))}
            </>
          )}

          {personalBooks.length === 0 && purchasedBooks.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="book" size={64} color={colors.highlight} />
              <Text style={[commonStyles.subtitle, { marginTop: 16, textAlign: 'center' }]}>
                Your Library is Empty
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 24 }]}>
                Add your own PDF books or purchase books from the store
              </Text>
              <TouchableOpacity
                style={[commonStyles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/(home)/')}
              >
                <Text style={commonStyles.buttonText}>Browse Books</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = {
  scrollContainer: {
    paddingVertical: 16,
  },
  header: {
    padding: 16,
    alignItems: 'center' as const,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookCover: {
    width: 50,
    height: 60,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  bookActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
};
