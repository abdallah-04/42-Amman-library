import PocketBase from 'pocketbase';
import { Platform } from 'react-native';

const DEFAULT_PB_URL = Platform.select({
  android: `http://${process.env.MY_COMPUTER_IP}:8090`,
  ios: `http://${process.env.MY_COMPUTER_IP}:8090`,    
  web: 'http://localhost:8090',           
  default: `http://${process.env.MY_COMPUTER_IP}:8090`,
}) ?? `http://${process.env.MY_COMPUTER_IP}:8090`;

export const PB_URL = process.env.EXPO_PUBLIC_BASE_URL ?? DEFAULT_PB_URL;

export const pb = new PocketBase(DEFAULT_PB_URL);

const BORROW_PERIOD_DAYS = 30;
const DEFAULT_PROGRESS = {
  daysElapsed: 0,
  daysRemaining: 30,
  isOverdue: false,
  progressPercentage: 0,
};

type BookRecord = {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  cover?: string | string[];
  coverUrl?: string;
  [key: string]: any;
};

function firstRelation(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeBook(record: any) {
  return {
    ...record,
    documentId: record.id,
  };
}

function normalizeBorrow(record: any) {
  const expandedBook = firstRelation(record.expand?.book);
  const progress = record.borrowDate
    ? calculateBorrowProgress(record.borrowDate)
    : DEFAULT_PROGRESS;

  return {
    ...record,
    documentId: record.id,
    book: expandedBook ? normalizeBook(expandedBook) : undefined,
    ...progress,
  };
}

function toDateOnly(date: Date) {
  return date.toISOString().split('T')[0];
}

function createCoverFile(imageUri: string) {
  const filename = imageUri.split('/').pop() ?? 'cover.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  return {
    uri: imageUri,
    name: filename,
    type,
  } as any;
}

export function calculateBorrowProgress(borrowDate: string) {
  const start = new Date(borrowDate);
  if (isNaN(start.getTime())) return DEFAULT_PROGRESS;

  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = elapsed > 0 ? elapsed : 0;
  const isOverdue = daysElapsed > BORROW_PERIOD_DAYS;
  const daysRemaining = isOverdue ? 0 : BORROW_PERIOD_DAYS - daysElapsed;
  const progressPercentage = Math.min(100, Math.round((daysElapsed / BORROW_PERIOD_DAYS) * 100));
  return { daysElapsed, daysRemaining, isOverdue, progressPercentage };
}

export function getBookCoverUrl(book?: BookRecord | null): string {
  if (!book) return '';

  const cover = Array.isArray(book.cover) ? book.cover[0] : book.cover;
  if (cover) {
    return pb.files.getURL(book as any, cover);
  }

  return book.coverUrl ?? '';
}

export async function getAllBooks() {
  try {
    const records = await pb.collection('book').getFullList({
      sort: '-created',
    });
    return records.map(normalizeBook);
  } catch (error) {
    throw new Error('Failed to fetch books');
  }
}

export async function getBook(id: string) {
  try {
    const record = await pb.collection('book').getOne(id);
    return normalizeBook(record);
  } catch (error) {
    throw new Error('Failed to fetch book');
  }
}

export async function searchBooks(query: string) {
  try {
    const escaped = query.replace(/"/g, '\\"');
    const records = await pb.collection('book').getFullList({
      filter: `title ~ "${escaped}" || author ~ "${escaped}"`,
      sort: '-created',
    });
    return records.map(normalizeBook);
  } catch (error) {
    throw new Error('Search failed');
  }
}

export async function addBook(book: object, imageUri?: string | null) {
  try {
    if (!imageUri) {
      return pb.collection('book').create(book);
    }

    const formData = new FormData();
    Object.entries(book).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append('cover', createCoverFile(imageUri));

    return pb.collection('book').create(formData);
  } catch (error) {
    throw new Error('Failed to add book');
  }
}

export async function deleteBook(id: string) {
  try {
    await pb.collection('book').delete(id);
    return true;
  } catch (error) {
    throw new Error('Failed to delete book');
  }
}

export async function getBooksByUser(intraLogin: string) {
  try {
    const records = await pb.collection('book').getFullList({
      filter: `added_by = "${intraLogin}"`,
      sort: '-created',
    });
    return records.map(normalizeBook);
  } catch (error) {
    throw new Error('Failed to fetch user books');
  }
}

export async function getUserBorrows(intraLogin: string) {
  try {
    const records = await pb.collection('borrow').getFullList({
      filter: `intraLogin = "${intraLogin}"`,
      expand: 'book',
      sort: '-created',
    });
    return records.map(normalizeBorrow);
  } catch (error) {
    throw new Error('Failed to fetch borrows');
  }
}

export async function borrowBook(bookId: string, intraLogin: string) {
  try {
    return pb.collection('borrow').create({
      book: [bookId],
      intraLogin,
      borrowDate: toDateOnly(new Date()),
    });
  } catch (error) {
    throw new Error('Failed to borrow book');
  }
}

export async function returnBook(
  borrowId: string,
  rating: number,
  feedback: string,
) {
  try {
    return pb.collection('borrow').update(borrowId, {
      returnDate: toDateOnly(new Date()),
      rating,
      feedback,
    });
  } catch (error) {
    throw new Error('Failed to return book');
  }
}

export async function updateBookStatus(
  bookId: string,
  state: 'available' | 'borrowed',
): Promise<any> {
  try {
    return pb.collection('book').update(bookId, { state });
  } catch (error) {
    throw new Error('Failed to update book state');
  }
}

export async function getBookReviews(bookId: string) {
  try {
    const records = await pb.collection('borrow').getFullList({
      filter: `book ?= "${bookId}" && rating != null`,
      sort: '-returnDate',
    });
    return records.map((record) => ({
      ...record,
      documentId: record.id,
    }));
  } catch (error) {
    throw new Error('Failed to fetch reviews');
  }
}

export async function isBookCurrentlyBorrowed(bookId: string) {
  try {
    const records = await pb.collection('borrow').getList(1, 1, {
      filter: `book ?= "${bookId}" && returnDate = null`,
    });
    return records.totalItems > 0;
  } catch (error) {
    throw new Error('Failed to check book status');
  }
}
