
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import { Book, Language } from '@/types';

export default function WriterDashboardScreen() {
  const [writerBooks, setWriterBooks] = useState<Book[]>([]);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    summary: '',
    price: '',
  });
  const dataService = DataService.getInstance();

  useEffect(() => {
    loadWriterBooks();
  }, []);

  const loadWriterBooks = async () => {
    try {
      // For demo purposes, we'll filter books that could be from this writer
      const allBooks = await dataService.getBooks();
      // In a real app, you'd filter by writerId
      setWriterBooks(allBooks.slice(0, 2)); // Show first 2 as demo writer books
    } catch (error) {
      console.log('Error loading writer books:', error);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title.trim() || !newBook.summary.trim()) {
      Alert.alert('Error', 'Please fill in at least the title and summary');
      return;
    }

    try {
      const bookData = {
        ...newBook,
        price: parseFloat(newBook.price) || 0,
        writerId: 'current-writer-id', // In real app, get from current user
      };

      await dataService.addBookToPersonalLibrary(bookData);
      setShowAddBookModal(false);
      setNewBook({
        title: '',
        author: '',
        description: '',
        summary: '',
        price: '',
      });
      Alert.alert('Success', 'Book added to library!');
      loadWriterBooks();
    } catch (error) {
      console.log('Error adding book:', error);
      Alert.alert('Error', 'Failed to add book');
    }
  };

  const renderBookItem = (book: Book) => (
    <View key={book.id} style={[commonStyles.card, { marginHorizontal: 16 }]}>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <View style={styles.bookCover}>
          <IconSymbol name="book.fill" size={32} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[commonStyles.subtitle, { fontSize: 16, marginBottom: 4 }]}>
            {book.title}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
            by {book.author}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
              ${book.price?.toFixed(2) || '0.00'}
            </Text>
            <Text style={[commonStyles.textSecondary, { marginLeft: 16 }]}>
              {Object.keys(book.translations).length + 1} languages
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={() => Alert.alert('Coming Soon', 'Edit book functionality coming soon!')}
        >
          <IconSymbol name="pencil" size={16} color={colors.card} />
          <Text style={[styles.actionButtonText, { marginLeft: 4 }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={() => Alert.alert('Coming Soon', 'Add translation functionality coming soon!')}
        >
          <IconSymbol name="globe" size={16} color={colors.text} />
          <Text style={[styles.actionButtonText, { marginLeft: 4, color: colors.text }]}>
            Translate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.highlight }]}
          onPress={() => Alert.alert('Coming Soon', 'Add audio functionality coming soon!')}
        >
          <IconSymbol name="speaker.wave.2" size={16} color={colors.text} />
          <Text style={[styles.actionButtonText, { marginLeft: 4, color: colors.text }]}>
            Audio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddBookModal = () => (
    <Modal
      visible={showAddBookModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[commonStyles.container, { padding: 16 }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddBookModal(false)}>
            <Text style={[commonStyles.text, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[commonStyles.subtitle, { fontSize: 18 }]}>Add New Book</Text>
          <TouchableOpacity onPress={handleAddBook}>
            <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter book title"
              placeholderTextColor={colors.textSecondary}
              value={newBook.title}
              onChangeText={(text) => setNewBook({ ...newBook, title: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Author</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter author name"
              placeholderTextColor={colors.textSecondary}
              value={newBook.author}
              onChangeText={(text) => setNewBook({ ...newBook, author: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Enter book description"
              placeholderTextColor={colors.textSecondary}
              value={newBook.description}
              onChangeText={(text) => setNewBook({ ...newBook, description: text })}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>30-Page Summary *</Text>
            <TextInput
              style={[commonStyles.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="Enter the 30-page summary of your book"
              placeholderTextColor={colors.textSecondary}
              value={newBook.summary}
              onChangeText={(text) => setNewBook({ ...newBook, summary: text })}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Price ($)</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={newBook.price}
              onChangeText={(text) => setNewBook({ ...newBook, price: text })}
              keyboardType="decimal-pad"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Writer Dashboard',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowAddBookModal(true)}
              style={{ padding: 8 }}
            >
              <IconSymbol name="plus" color={colors.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={commonStyles.title}>My Published Books</Text>
            <Text style={commonStyles.textSecondary}>
              Manage your books, translations, and audio content
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[commonStyles.card, { flex: 1, marginRight: 8, marginLeft: 16 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', textAlign: 'center' }]}>
                {writerBooks.length}
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', fontSize: 12 }]}>
                Books Published
              </Text>
            </View>
            <View style={[commonStyles.card, { flex: 1, marginLeft: 8, marginRight: 16 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', textAlign: 'center' }]}>
                {writerBooks.reduce((total, book) => total + Object.keys(book.translations).length + 1, 0)}
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', fontSize: 12 }]}>
                Total Languages
              </Text>
            </View>
          </View>

          {/* Add Book Prompt */}
          <View style={[commonStyles.card, { marginHorizontal: 16, backgroundColor: colors.accent }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8 }]}>
                Add New Book
              </Text>
            </View>
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Share your knowledge with readers around the world
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddBookModal(true)}
            >
              <Text style={commonStyles.buttonText}>Add Book</Text>
            </TouchableOpacity>
          </View>

          {/* Books List */}
          {writerBooks.length > 0 ? (
            writerBooks.map(renderBookItem)
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="book" size={64} color={colors.highlight} />
              <Text style={[commonStyles.subtitle, { marginTop: 16, textAlign: 'center' }]}>
                No Books Published Yet
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                Start by adding your first book to the library
              </Text>
            </View>
          )}
        </ScrollView>
        {renderAddBookModal()}
      </View>
    </>
  );
}

const styles = {
  header: {
    padding: 16,
    alignItems: 'center' as const,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    marginBottom: 16,
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
    justifyContent: 'space-between' as const,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.card,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
};
