
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, User, Note, Highlight, Language } from '../types';

class DataService {
  private static instance: DataService;
  
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Sample data
  private sampleBooks: Book[] = [
    {
      id: '1',
      title: 'The Art of Programming',
      author: 'John Smith',
      description: 'A comprehensive guide to modern programming techniques and best practices.',
      summary: 'This book covers fundamental programming concepts, design patterns, and advanced techniques used in software development. Perfect for both beginners and experienced developers.',
      languages: ['en', 'es', 'fr'],
      translations: {
        es: {
          title: 'El Arte de la Programación',
          description: 'Una guía completa de técnicas de programación modernas y mejores prácticas.',
          summary: 'Este libro cubre conceptos fundamentales de programación, patrones de diseño y técnicas avanzadas utilizadas en el desarrollo de software.',
        },
        fr: {
          title: 'L\'Art de la Programmation',
          description: 'Un guide complet des techniques de programmation modernes et des meilleures pratiques.',
          summary: 'Ce livre couvre les concepts fondamentaux de programmation, les modèles de conception et les techniques avancées utilisées dans le développement logiciel.',
        }
      },
      price: 29.99,
      isPurchased: false,
      isInLibrary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      highlights: [],
    },
    {
      id: '2',
      title: 'Digital Marketing Mastery',
      author: 'Sarah Johnson',
      description: 'Master the art of digital marketing in the modern age.',
      summary: 'Learn how to create effective digital marketing campaigns, understand analytics, and grow your online presence through proven strategies.',
      languages: ['en', 'de', 'it'],
      translations: {
        de: {
          title: 'Digitales Marketing Meisterschaft',
          description: 'Meistern Sie die Kunst des digitalen Marketings im modernen Zeitalter.',
          summary: 'Lernen Sie, wie Sie effektive digitale Marketingkampagnen erstellen, Analysen verstehen und Ihre Online-Präsenz durch bewährte Strategien ausbauen.',
        },
        it: {
          title: 'Padronanza del Marketing Digitale',
          description: 'Padroneggia l\'arte del marketing digitale nell\'era moderna.',
          summary: 'Impara come creare campagne di marketing digitale efficaci, comprendere le analisi e far crescere la tua presenza online attraverso strategie comprovate.',
        }
      },
      price: 24.99,
      isPurchased: false,
      isInLibrary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      highlights: [],
    },
    {
      id: '3',
      title: 'Mindful Living',
      author: 'Dr. Emily Chen',
      description: 'A guide to living mindfully in a busy world.',
      summary: 'Discover practical techniques for mindfulness, stress reduction, and finding balance in your daily life through ancient wisdom and modern science.',
      languages: ['en', 'zh', 'ja'],
      translations: {
        zh: {
          title: '正念生活',
          description: '在忙碌世界中正念生活的指南。',
          summary: '通过古老智慧和现代科学，发现正念、减压和在日常生活中找到平衡的实用技巧。',
        },
        ja: {
          title: 'マインドフルな生活',
          description: '忙しい世界でマインドフルに生きるためのガイド。',
          summary: '古代の知恵と現代科学を通じて、マインドフルネス、ストレス軽減、日常生活でのバランスを見つけるための実践的なテクニックを発見してください。',
        }
      },
      price: 19.99,
      isPurchased: true,
      isInLibrary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      highlights: [],
    }
  ];

  private availableLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  ];

  async getBooks(): Promise<Book[]> {
    try {
      const storedBooks = await AsyncStorage.getItem('books');
      if (storedBooks) {
        return JSON.parse(storedBooks);
      }
      // Return sample data if no stored books
      await this.saveBooks(this.sampleBooks);
      return this.sampleBooks;
    } catch (error) {
      console.log('Error getting books:', error);
      return this.sampleBooks;
    }
  }

  async saveBooks(books: Book[]): Promise<void> {
    try {
      await AsyncStorage.setItem('books', JSON.stringify(books));
    } catch (error) {
      console.log('Error saving books:', error);
    }
  }

  async getBookById(id: string): Promise<Book | null> {
    const books = await this.getBooks();
    return books.find(book => book.id === id) || null;
  }

  async addBookToPersonalLibrary(bookData: Partial<Book>): Promise<Book> {
    const books = await this.getBooks();
    const newBook: Book = {
      id: Date.now().toString(),
      title: bookData.title || 'Untitled',
      author: bookData.author || 'Unknown Author',
      description: bookData.description || '',
      summary: bookData.summary || '',
      languages: bookData.languages || ['en'],
      translations: bookData.translations || {},
      price: 0,
      isPurchased: true,
      isInLibrary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      highlights: [],
      ...bookData,
    };
    
    books.push(newBook);
    await this.saveBooks(books);
    return newBook;
  }

  async purchaseBook(bookId: string): Promise<boolean> {
    try {
      const books = await this.getBooks();
      const bookIndex = books.findIndex(book => book.id === bookId);
      if (bookIndex !== -1) {
        books[bookIndex].isPurchased = true;
        books[bookIndex].isInLibrary = true;
        await this.saveBooks(books);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error purchasing book:', error);
      return false;
    }
  }

  async addNote(bookId: string, content: string, page?: number): Promise<Note> {
    const books = await this.getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
      const note: Note = {
        id: Date.now().toString(),
        bookId,
        content,
        page,
        createdAt: new Date().toISOString(),
      };
      
      books[bookIndex].notes.push(note);
      await this.saveBooks(books);
      return note;
    }
    
    throw new Error('Book not found');
  }

  async addHighlight(bookId: string, text: string, color: string, page?: number): Promise<Highlight> {
    const books = await this.getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
      const highlight: Highlight = {
        id: Date.now().toString(),
        bookId,
        text,
        color,
        page,
        createdAt: new Date().toISOString(),
      };
      
      books[bookIndex].highlights.push(highlight);
      await this.saveBooks(books);
      return highlight;
    }
    
    throw new Error('Book not found');
  }

  async getPersonalLibrary(): Promise<Book[]> {
    const books = await this.getBooks();
    return books.filter(book => book.isInLibrary);
  }

  async getPurchasedBooks(): Promise<Book[]> {
    const books = await this.getBooks();
    return books.filter(book => book.isPurchased);
  }

  getAvailableLanguages(): Language[] {
    return this.availableLanguages;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        return JSON.parse(userData);
      }
      
      // Create a default user
      const defaultUser: User = {
        id: '1',
        email: 'user@example.com',
        name: 'Demo User',
        type: 'reader',
        purchasedBooks: ['3'],
        personalLibrary: ['3'],
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(defaultUser));
      return defaultUser;
    } catch (error) {
      console.log('Error getting current user:', error);
      return null;
    }
  }

  async updateUserType(type: 'reader' | 'writer'): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        user.type = type;
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (error) {
      console.log('Error updating user type:', error);
    }
  }
}

export default DataService;
