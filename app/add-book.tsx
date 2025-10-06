
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import * as DocumentPicker from 'expo-document-picker';

export default function AddBookScreen() {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    summary: '',
    pdfUri: '',
    pdfName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const dataService = DataService.getInstance();

  const handleSelectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setBookData({
          ...bookData,
          pdfUri: file.uri,
          pdfName: file.name,
        });
      }
    } catch (error) {
      console.log('Error selecting PDF:', error);
      Alert.alert('Error', 'Failed to select PDF file');
    }
  };

  const handleAddBook = async () => {
    if (!bookData.title.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    setIsLoading(true);
    try {
      const newBook = await dataService.addBookToPersonalLibrary({
        title: bookData.title.trim(),
        author: bookData.author.trim() || 'Unknown Author',
        description: bookData.description.trim() || 'Personal book',
        summary: bookData.summary.trim() || 'Added to personal library',
        pdfUrl: bookData.pdfUri,
      });

      Alert.alert(
        'Success',
        'Book added to your library!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log('Error adding book:', error);
      Alert.alert('Error', 'Failed to add book to library');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Book',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddBook}
              disabled={isLoading || !bookData.title.trim()}
              style={{ 
                padding: 8,
                opacity: (isLoading || !bookData.title.trim()) ? 0.5 : 1,
              }}
            >
              <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                {isLoading ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconSymbol name="plus.circle.fill" size={64} color={colors.primary} />
            <Text style={[commonStyles.title, { marginTop: 16, textAlign: 'center' }]}>
              Add Your Book
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
              Add PDF books to your personal library
            </Text>
          </View>

          {/* PDF Selection */}
          <View style={[commonStyles.card, { backgroundColor: colors.accent }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconSymbol name="doc.text.fill" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8 }]}>
                Select PDF File
              </Text>
            </View>
            {bookData.pdfName ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                  Selected file:
                </Text>
                <Text style={[commonStyles.text, { fontWeight: '500' }]}>
                  {bookData.pdfName}
                </Text>
              </View>
            ) : (
              <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
                Choose a PDF file from your device
              </Text>
            )}
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: colors.primary }]}
              onPress={handleSelectPDF}
            >
              <Text style={commonStyles.buttonText}>
                {bookData.pdfName ? 'Change PDF' : 'Select PDF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Book Details */}
          <View style={commonStyles.section}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Book Details
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter book title"
                placeholderTextColor={colors.textSecondary}
                value={bookData.title}
                onChangeText={(text) => setBookData({ ...bookData, title: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Author</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter author name"
                placeholderTextColor={colors.textSecondary}
                value={bookData.author}
                onChangeText={(text) => setBookData({ ...bookData, author: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter book description (optional)"
                placeholderTextColor={colors.textSecondary}
                value={bookData.description}
                onChangeText={(text) => setBookData({ ...bookData, description: text })}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Summary</Text>
              <TextInput
                style={[commonStyles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Enter a brief summary (optional)"
                placeholderTextColor={colors.textSecondary}
                value={bookData.summary}
                onChangeText={(text) => setBookData({ ...bookData, summary: text })}
                multiline
              />
            </View>
          </View>

          {/* Features Info */}
          <View style={[commonStyles.card, { backgroundColor: colors.background }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
              Available Features:
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <IconSymbol name="note.text" size={16} color={colors.primary} />
                <Text style={[commonStyles.textSecondary, { marginLeft: 8 }]}>
                  Add notes while reading
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="highlighter" size={16} color={colors.primary} />
                <Text style={[commonStyles.textSecondary, { marginLeft: 8 }]}>
                  Highlight important text
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="globe" size={16} color={colors.primary} />
                <Text style={[commonStyles.textSecondary, { marginLeft: 8 }]}>
                  Translation support (coming soon)
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="speaker.wave.2" size={16} color={colors.primary} />
                <Text style={[commonStyles.textSecondary, { marginLeft: 8 }]}>
                  Audio playback (coming soon)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = {
  header: {
    alignItems: 'center' as const,
    marginBottom: 24,
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
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
};
