
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import { Book, User } from '@/types';

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const dataService = DataService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksData, userData] = await Promise.all([
        dataService.getBooks(),
        dataService.getCurrentUser(),
      ]);
      setBooks(booksData);
      setUser(userData);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handlePurchaseBook = async (bookId: string) => {
    Alert.alert(
      'Purchase Book',
      'Would you like to purchase this book?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            const success = await dataService.purchaseBook(bookId);
            if (success) {
              Alert.alert('Success', 'Book purchased successfully!');
              loadData();
            } else {
              Alert.alert('Error', 'Failed to purchase book');
            }
          },
        },
      ]
    );
  };

  const handleReadBook = (book: Book) => {
    router.push({
      pathname: '/book-reader',
      params: { bookId: book.id },
    });
  };

  const renderBookCard = (book: Book) => {
    const translation = book.translations[selectedLanguage];
    const displayTitle = translation?.title || book.title;
    const displayDescription = translation?.description || book.description;
    const displaySummary = translation?.summary || book.summary;

    return (
      <View key={book.id} style={[commonStyles.card, { marginHorizontal: 16 }]}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={styles.bookCover}>
            <IconSymbol name="book.fill" size={40} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[commonStyles.subtitle, { fontSize: 18, marginBottom: 4 }]}>
              {displayTitle}
            </Text>
            <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
              by {book.author}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {book.languages.map((lang) => (
                <View key={lang} style={styles.languageTag}>
                  <Text style={styles.languageText}>{lang.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>
          {displayDescription}
        </Text>

        <View style={styles.summaryContainer}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            30-Page Summary:
          </Text>
          <Text style={[commonStyles.textSecondary, { lineHeight: 20 }]}>
            {displaySummary}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {book.isPurchased ? (
            <TouchableOpacity
              style={[commonStyles.button, { flex: 1 }]}
              onPress={() => handleReadBook(book)}
            >
              <Text style={commonStyles.buttonText}>Read Book</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.previewButton, { flex: 1, marginRight: 8 }]}
                onPress={() => handleReadBook(book)}
              >
                <Text style={[commonStyles.buttonText, { color: colors.primary }]}>
                  Preview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, { flex: 1 }]}
                onPress={() => handlePurchaseBook(book.id)}
              >
                <Text style={commonStyles.buttonText}>
                  ${book.price?.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <IconSymbol name="doc.text" size={16} color={colors.textSecondary} />
            <Text style={styles.featureText}>PDF</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="speaker.wave.2" size={16} color={colors.textSecondary} />
            <Text style={styles.featureText}>Audio</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="globe" size={16} color={colors.textSecondary} />
            <Text style={styles.featureText}>Translate</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLanguageSelector = () => {
    const languages = dataService.getAvailableLanguages();
    
    return (
      <View style={styles.languageSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageSelectorButton,
                selectedLanguage === lang.code && styles.languageSelectorButtonActive,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
            >
              <Text
                style={[
                  styles.languageSelectorText,
                  selectedLanguage === lang.code && styles.languageSelectorTextActive,
                ]}
              >
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Book Library',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/add-book')}
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
            <Text style={commonStyles.title}>Discover Books</Text>
            <Text style={commonStyles.textSecondary}>
              Explore 30-page summaries in multiple languages
            </Text>
          </View>

          {renderLanguageSelector()}

          {user?.type === 'writer' && (
            <View style={[commonStyles.card, { marginHorizontal: 16, backgroundColor: colors.accent }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                Writer Dashboard
              </Text>
              <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>
                Add your books to the library and reach more readers
              </Text>
              <TouchableOpacity
                style={[commonStyles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/writer-dashboard')}
              >
                <Text style={commonStyles.buttonText}>Manage My Books</Text>
              </TouchableOpacity>
            </View>
          )}

          {books.map(renderBookCard)}

          <View style={styles.subscriptionCard}>
            <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 8 }]}>
              Unlimited Access
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 16 }]}>
              Subscribe to access the entire library
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: colors.secondary }]}
              onPress={() => Alert.alert('Coming Soon', 'Subscription feature coming soon!')}
            >
              <Text style={commonStyles.buttonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>
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
  bookCover: {
    width: 60,
    height: 80,
    backgroundColor: colors.accent,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  languageTag: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600' as const,
  },
  summaryContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row' as const,
    marginBottom: 12,
  },
  previewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  featuresContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.highlight,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  languageSelectorContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  languageSelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  languageSelectorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageSelectorText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
  languageSelectorTextActive: {
    color: colors.card,
    fontWeight: '600' as const,
  },
  subscriptionCard: {
    ...commonStyles.card,
    marginHorizontal: 16,
    backgroundColor: colors.secondary,
    marginTop: 16,
  },
};
