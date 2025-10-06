
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
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import { Book, Note, Highlight } from '@/types';

export default function BookReaderScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const dataService = DataService.getInstance();

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const bookData = await dataService.getBookById(bookId);
      if (bookData) {
        setBook(bookData);
        // Set default language to first available translation or English
        const availableLanguages = Object.keys(bookData.translations);
        if (availableLanguages.length > 0) {
          setSelectedLanguage(availableLanguages[0]);
        }
      }
    } catch (error) {
      console.log('Error loading book:', error);
    }
  };

  const handleAddNote = async () => {
    if (!book || !noteText.trim()) return;

    try {
      await dataService.addNote(book.id, noteText.trim());
      setNoteText('');
      setShowNoteModal(false);
      Alert.alert('Success', 'Note added successfully!');
      loadBook(); // Reload to get updated notes
    } catch (error) {
      console.log('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const handleAddHighlight = async (color: string) => {
    if (!book || !selectedText.trim()) return;

    try {
      await dataService.addHighlight(book.id, selectedText.trim(), color);
      setSelectedText('');
      setShowHighlightModal(false);
      Alert.alert('Success', 'Text highlighted successfully!');
      loadBook(); // Reload to get updated highlights
    } catch (error) {
      console.log('Error adding highlight:', error);
      Alert.alert('Error', 'Failed to add highlight');
    }
  };

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    setShowHighlightModal(true);
  };

  const toggleAudioPlayback = () => {
    setIsPlaying(!isPlaying);
    Alert.alert(
      isPlaying ? 'Audio Paused' : 'Audio Playing',
      'Audio playback feature will be implemented with expo-av'
    );
  };

  const renderLanguageSelector = () => {
    if (!book) return null;

    const availableLanguages = ['en', ...Object.keys(book.translations)];
    const languages = dataService.getAvailableLanguages();

    return (
      <View style={styles.languageSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableLanguages.map((langCode) => {
            const language = languages.find(l => l.code === langCode);
            if (!language) return null;

            return (
              <TouchableOpacity
                key={langCode}
                style={[
                  styles.languageButton,
                  selectedLanguage === langCode && styles.languageButtonActive,
                ]}
                onPress={() => setSelectedLanguage(langCode)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    selectedLanguage === langCode && styles.languageButtonTextActive,
                  ]}
                >
                  {language.nativeName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderBookContent = () => {
    if (!book) return null;

    const translation = book.translations[selectedLanguage];
    const displayTitle = translation?.title || book.title;
    const displaySummary = translation?.summary || book.summary;

    return (
      <View style={styles.contentContainer}>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          {displayTitle}
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 24 }]}>
          by {book.author}
        </Text>

        <View style={styles.summaryContainer}>
          <Text style={[commonStyles.subtitle, { fontSize: 18, marginBottom: 16 }]}>
            30-Page Summary
          </Text>
          <Text
            style={[commonStyles.text, { lineHeight: 28 }]}
            selectable
            onSelectionChange={(event) => {
              const { text } = event.nativeEvent;
              if (text && text.length > 0) {
                handleTextSelection(text);
              }
            }}
          >
            {displaySummary}
          </Text>
        </View>

        {!book.isPurchased && (
          <View style={styles.purchasePrompt}>
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 16 }]}>
              This is a preview. Purchase the full book to access all content.
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Purchase', 'Purchase functionality coming soon!')}
            >
              <Text style={commonStyles.buttonText}>
                Purchase Full Book - ${book.price?.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderNoteModal = () => (
    <Modal
      visible={showNoteModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[commonStyles.container, { padding: 16 }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowNoteModal(false)}>
            <Text style={[commonStyles.text, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[commonStyles.subtitle, { fontSize: 18 }]}>Add Note</Text>
          <TouchableOpacity onPress={handleAddNote}>
            <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[commonStyles.input, { height: 120, textAlignVertical: 'top' }]}
          placeholder="Write your note here..."
          placeholderTextColor={colors.textSecondary}
          value={noteText}
          onChangeText={setNoteText}
          multiline
          autoFocus
        />
      </View>
    </Modal>
  );

  const renderHighlightModal = () => (
    <Modal
      visible={showHighlightModal}
      animationType="fade"
      transparent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.highlightModal}>
          <Text style={[commonStyles.text, { marginBottom: 16, textAlign: 'center' }]}>
            Highlight selected text
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 16, fontStyle: 'italic' }]}>
            "{selectedText}"
          </Text>
          <View style={styles.colorOptions}>
            {['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }]}
                onPress={() => handleAddHighlight(color)}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowHighlightModal(false)}
          >
            <Text style={[commonStyles.text, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!book) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading book...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: book.title,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={toggleAudioPlayback}
                style={{ padding: 8, marginRight: 8 }}
              >
                <IconSymbol 
                  name={isPlaying ? "pause.fill" : "play.fill"} 
                  color={colors.primary} 
                  size={24} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowNoteModal(true)}
                style={{ padding: 8 }}
              >
                <IconSymbol name="note.text" color={colors.primary} size={24} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={commonStyles.container}>
        {renderLanguageSelector()}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {renderBookContent()}
        </ScrollView>
        {renderNoteModal()}
        {renderHighlightModal()}
      </View>
    </>
  );
}

const styles = {
  languageSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
  languageButtonTextActive: {
    color: colors.card,
    fontWeight: '600' as const,
  },
  contentContainer: {
    padding: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  purchasePrompt: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  highlightModal: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  colorOptions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  cancelButton: {
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
};
