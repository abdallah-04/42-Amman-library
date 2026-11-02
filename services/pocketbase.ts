import PocketBase from "pocketbase";
import { Platform } from "react-native";

// ─────────────────────────────────────────────
// URL SETUP
// ─────────────────────────────────────────────

const DEFAULT_PB_URL =
  Platform.select({
    android: "http://10.0.2.2:8090", // Android emulator -> host machine
    ios: "http://localhost:8090",
    web: "http://localhost:8090",
    default: "http://localhost:8090",
  }) ?? "http://localhost:8090";

function normalizePocketBaseUrl(url?: string) {
  const trimmed = url?.trim();
  if (!trimmed) return DEFAULT_PB_URL;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;

  return /:\d+(\/)?$/.test(withProtocol)
    ? withProtocol
    : `${withProtocol}:8090`;
}

export const PB_URL = normalizePocketBaseUrl(process.env.EXPO_PUBLIC_BASE_URL);

export const pb = new PocketBase(PB_URL);
console.log("📡 PocketBase initialized at:", PB_URL);

pb.autoCancellation(false);

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const BORROW_PERIOD_DAYS = 30;

const DEFAULT_PROGRESS = {
  daysElapsed: 0,
  daysRemaining: 30,
  isOverdue: false,
  progressPercentage: 0,
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type BookRecord = {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  cover?: string | string[];
  coverUrl?: string;
  rating?: number;
  ratingCount?: number;
  [key: string]: any;
};

// ─────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────

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
  return date.toISOString().split("T")[0];
}

function createCoverFile(imageUri: string) {
  const filename = imageUri.split("/").pop() ?? "cover.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

  return {
    uri: imageUri,
    name: filename,
    type,
  } as any;
}

// ─────────────────────────────────────────────
// EXPORTED HELPERS
// ─────────────────────────────────────────────

/**
 * Calculates how far along a 30-day borrow period the user is.
 */
export function calculateBorrowProgress(borrowDate: string) {
  const start = new Date(borrowDate);
  if (isNaN(start.getTime())) return DEFAULT_PROGRESS;

  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const elapsed = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = elapsed > 0 ? elapsed : 0;
  const isOverdue = daysElapsed > BORROW_PERIOD_DAYS;
  const daysRemaining = isOverdue ? 0 : BORROW_PERIOD_DAYS - daysElapsed;
  const progressPercentage = Math.min(
    100,
    Math.round((daysElapsed / BORROW_PERIOD_DAYS) * 100)
  );

  return { daysElapsed, daysRemaining, isOverdue, progressPercentage };
}

/**
 * Returns the full URL for a book's cover image.
 * Falls back to coverUrl (Open Library) if no uploaded file exists.
 */
export function getBookCoverUrl(book?: BookRecord | null): string {
  if (!book) return "";

  const cover = Array.isArray(book.cover) ? book.cover[0] : book.cover;
  if (cover) {
    return pb.files.getURL(book as any, cover);
  }

  return book.coverUrl ?? "";
}

// ─────────────────────────────────────────────
// BOOK API
// ─────────────────────────────────────────────

/**
 * Returns every book in the library, newest first.
 */
export async function getAllBooks() {
  try {
    const records = await pb.collection("book").getFullList({
      sort: "-created",
      requestKey: null,
    });
    return records.map(normalizeBook);
  } catch (error) {
    console.error("getAllBooks error:", error);
    throw new Error("Failed to fetch books");
  }
}

/**
 * Returns a single book by its PocketBase record ID.
 */
export async function getBook(id: string) {
  try {
    const record = await pb.collection("book").getOne(id, {
      requestKey: null,
    });
    return normalizeBook(record);
  } catch (error) {
    console.error("getBook error:", error);
    throw new Error("Failed to fetch book");
  }
}

/**
 * Searches books by title or author (case-insensitive contains).
 */
export async function searchBooks(query: string) {
  try {
    const escaped = query.replace(/"/g, '\\"');
    const records = await pb.collection("book").getFullList({
      filter: `title ~ "${escaped}" || author ~ "${escaped}"`,
      sort: "-created",
      requestKey: null,
    });
    return records.map(normalizeBook);
  } catch (error) {
    console.error("searchBooks error:", error);
    throw new Error("Search failed");
  }
}

/**
 * Adds a new book. Pass a cover image as the second argument to upload a photo.
 *
 * Accepts two formats:
 *   - string  -> native URI (iOS/Android), wrapped by createCoverFile for RN FormData
 *   - File    -> web File object from <input type="file">, appended directly to FormData
 *
 * Never set Content-Type manually — fetch adds the multipart boundary automatically.
 */
export async function addBook(book: object, image?: string | File | null) {
  try {
    if (!image) {
      return pb.collection("book").create(book);
    }

    const formData = new FormData();
    Object.entries(book).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (image instanceof File) {
      // Web: File object — append directly, browser FormData handles it natively
      formData.append("cover", image);
    } else {
      // Native: URI string — wrap in RN-style { uri, name, type } object
      formData.append("cover", createCoverFile(image));
    }

    return pb.collection("book").create(formData);
  } catch (error) {
    console.error("addBook error:", error);
    throw new Error("Failed to add book");
  }
}

/**
 * Deletes a book by ID.
 * Always call isBookCurrentlyBorrowed() first — do not delete borrowed books.
 */
export async function deleteBook(id: string) {
  try {
    await pb.collection("book").delete(id);
    return true;
  } catch (error) {
    console.error("deleteBook error:", error);
    throw new Error("Failed to delete book");
  }
}

/**
 * Returns all books added by a specific intra login.
 */
export async function getBooksByUser(intraLogin: string) {
  try {
    const records = await pb.collection("book").getFullList({
      filter: `added_by = "${intraLogin}"`,
      sort: "-created",
      requestKey: null,
    });
    return records.map(normalizeBook);
  } catch (error) {
    console.error("getBooksByUser error:", error);
    throw new Error("Failed to fetch user books");
  }
}

/**
 * Updates the book's state field to "available" or "borrowed".
 */
export async function updateBookStatus(
  bookId: string,
  state: "available" | "borrowed"
): Promise<any> {
  try {
    return pb.collection("book").update(bookId, { state });
  } catch (error) {
    console.error("updateBookStatus error:", error);
    throw new Error("Failed to update book state");
  }
}

/**
 * Returns true if a book has an active borrow with no returnDate.
 * Use this before deleteBook to prevent deleting a borrowed book.
 */
export async function isBookCurrentlyBorrowed(bookId: string) {
  try {
    const records = await pb.collection("borrow").getList(1, 1, {
      filter: `book ?= "${bookId}" && returnDate = null`,
    });
    return records.totalItems > 0;
  } catch (error) {
    console.error("isBookCurrentlyBorrowed error:", error);
    throw new Error("Failed to check book status");
  }
}

/**
 * Returns true if a book with the exact same title already exists.
 * Use before addBook to prevent duplicates.
 */
export async function checkBookExists(title: string) {
  try {
    const escaped = title.replace(/"/g, '\\"');
    const records = await pb.collection("book").getList(1, 1, {
      filter: `title = "${escaped}"`,
    });
    return records.totalItems > 0;
  } catch (error) {
    console.error("checkBookExists error:", error);
    return false;
  }
}

// ─────────────────────────────────────────────
// BORROW API
// ─────────────────────────────────────────────

/**
 * Returns all borrow records for a user, with the related book expanded.
 * Each record includes daysElapsed, daysRemaining, isOverdue, progressPercentage.
 */
export async function getUserBorrows(intraLogin: string) {
  try {
    const records = await pb.collection("borrow").getFullList({
      filter: `intraLogin = "${intraLogin}"`,
      expand: "book",          
      sort: "-created",
      requestKey: null,
    });

    return records.map(normalizeBorrow);
  } catch (error) {
    console.error("getUserBorrows error:", error);
    throw new Error("Failed to fetch borrows");
  }
}

/**
 * Creates a new borrow record for a book.
 * borrowDate is set automatically to today.
 */
export async function borrowBook(bookId: string, intraLogin: string) {
  try {
    return pb.collection("borrow").create({
      book: [bookId],
      intraLogin,
      borrowDate: toDateOnly(new Date()),
    });
  } catch (error) {
    console.error("borrowBook error:", error);
    throw new Error("Failed to borrow book");
  }
}

/**
 * Returns a book and updates the book's running average rating.
 *
 * Rating formula (weighted average):
 *   newRating = (oldRating × oldRatingCount + userRating) / (oldRatingCount + 1)
 *
 * Example:
 *   Book has rating=4, ratingCount=1
 *   User rates 3 → (4×1 + 3) / 2 = 3.5  ✅
 *
 * Both the borrow record and the book record are updated simultaneously
 * using Promise.all for efficiency.
 *
 * @param borrowId  - The ID of the borrow record to close
 * @param bookId    - The ID of the book being returned (needed to update its rating)
 * @param rating    - The user's rating (1–5)
 * @param feedback  - The user's written review
 */
export async function returnBook(
  borrowId: string,
  bookId: string | string[],
  rating: number,
  feedback: string
) {
  try {
    const resolvedBookId = Array.isArray(bookId) ? bookId[0] : bookId;

    if (!resolvedBookId) throw new Error("bookId is empty");

    const book = await pb.collection("book").getOne(resolvedBookId, {
      requestKey: null,
    });

    const oldRating: number = book.rating ?? 0;
    const oldRatingCount: number = book.ratingCount ?? 0;

    const newRatingCount = oldRatingCount + 1;
    const newRating = parseFloat(
      ((oldRating * oldRatingCount + rating) / newRatingCount).toFixed(2)
    );

    // Step 3: Update both records at the same time (faster than sequential awaits)
    const [updatedBorrow] = await Promise.all([
      // Close the borrow record
      pb.collection("borrow").update(borrowId, {
        returnDate: toDateOnly(new Date()),
        rating,
        feedback,
      }),
      // Persist the new average rating on the book
      pb.collection("book").update(
        
        resolvedBookId, {
        rating: newRating,
        ratingCount: newRatingCount,
      }),
    ]);

    return updatedBorrow;
  } catch (error) {
    console.error("returnBook error:", error);
    throw new Error("Failed to return book");
  }
}

// ─────────────────────────────────────────────
// REVIEWS API
// ─────────────────────────────────────────────

/**
 * Returns all borrow records for a book that include a rating (i.e. completed borrows with reviews).
 * Used to render the reviews list on BookDetailScreen.
 */
export async function getBookReviews(bookId: string) {
  try {
    const records = await pb.collection("borrow").getFullList({
      filter: `book ?= "${bookId}" && rating != null`,
      sort: "-returnDate",
      requestKey: null,
    });
    return records.map((record) => ({
      ...record,
      documentId: record.id,
    }));
  } catch (error) {
    console.error("getBookReviews error:", error);
    throw new Error("Failed to fetch reviews");
  }
}