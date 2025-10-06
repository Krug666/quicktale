
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import { Book, Note, Highlight } from '@/types';

export default function BookNotesScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'highlights'>('notes');
  const dataService = DataService.getInstance();

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const bookData = await dataService.getBookById(bookId);
      setBook(bookData);
    } catch (error) {
      console.log('Error loading book:', error);
    }
  };

  const renderNote = (note: Note) => (
    <View key={note.id} style={[commonStyles.card, { marginHorizontal: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
          {new Date(note.createdAt).toLocaleDateString()}
        </Text>
        {note.page && (
          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
            Page {note.page}
          </Text>
        )}
      </View>
      <Text style={[commonStyles.text, { lineHeight: 22 }]}>
        {note.content}
      </Text>
    </View>
  );

  const renderHighlight = (highlight: Highlight) => (
    <View key={highlight.id} style={[commonStyles.card, { marginHorizontal: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
          {new Date(highlight.createdAt).toLocaleDateString()}
        </Text>
        {highlight.page && (
          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
            Page {highlight.page}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 4,
            height: '100%',
            backgroundColor: highlight.color,
            borderRadius: 2,
            marginRight: 12,
            minHeight: 20,
          }}
        />
        <Text style={[commonStyles.text, { flex: 1, lineHeight: 22 }]}>
          {highlight.text}
        </Text>
      </View>
    </View>
  );

  const renderTabButton = (tab: 'notes' | 'highlights', label: string, count: number) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.tabButtonActive,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = (type: 'notes' | 'highlights') => (
    <View style={styles.emptyState}>
      <IconSymbol 
        name={type === 'notes' ? 'note.text' : 'highlighter'} 
        size={64} 
        color={colors.highlight} 
      />
      <Text style={[commonStyles.subtitle, { marginTop: 16, textAlign: 'center' }]}>
        No {type === 'notes' ? 'Notes' : 'Highlights'} Yet
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
        {type === 'notes' 
          ? 'Add notes while reading to remember important thoughts'
          : 'Highlight text while reading to save important passages'
        }
      </Text>
    </View>
  );

  if (!book) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${book.title} - Notes`,
        }}
      />
      <View style={commonStyles.container}>
        {/* Tab Header */}
        <View style={styles.tabContainer}>
          {renderTabButton('notes', 'Notes', book.notes.length)}
          {renderTabButton('highlights', 'Highlights', book.highlights.length)}
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'notes' ? (
            book.notes.length > 0 ? (
              book.notes.map(renderNote)
            ) : (
              renderEmptyState('notes')
            )
          ) : (
            book.highlights.length > 0 ? (
              book.highlights.map(renderHighlight)
            ) : (
              renderEmptyState('highlights')
            )
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = {
  tabContainer: {
    flexDirection: 'row' as const,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.card,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
};
