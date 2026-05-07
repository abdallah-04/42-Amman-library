import PocketBase from "pocketbase";
import { Platform } from "react-native";

const DEFAULT_PB_URL =
  Platform.select({
    android: `http://172.16.8.111:8090`,
    ios: `http://172.16.8.111:8090`,
    web: "http://localhost:8090",
    default: `http://172.16.8.111:8090`,
  }) ?? `http://172.16.8.111:8090`;

export const PB_URL = ' http://172.16.8.111:8090';

export const pb = new PocketBase(PB_URL);
console.log("📡 PocketBase initialized at:", PB_URL);

pb.autoCancellation(false);

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

export function calculateBorrowProgress(borrowDate: string) {
  const start = new Date(borrowDate);
  if (isNaN(start.getTime())) return DEFAULT_PROGRESS;

  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const elapsed = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysElapsed = elapsed > 0 ? elapsed : 0;
  const isOverdue = daysElapsed > BORROW_PERIOD_DAYS;
  const daysRemaining = isOverdue ? 0 : BORROW_PERIOD_DAYS - daysElapsed;
  const progressPercentage = Math.min(
    100,
    Math.round((daysElapsed / BORROW_PERIOD_DAYS) * 100),
  );
  return { daysElapsed, daysRemaining, isOverdue, progressPercentage };
}

export function getBookCoverUrl(book?: BookRecord | null): string {
  if (!book) return "";

  const cover = Array.isArray(book.cover) ? book.cover[0] : book.cover;
  if (cover) {
    return pb.files.getURL(book as any, cover);
  }

  return book.coverUrl ?? "";
}

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

export async function addBook(book: object, imageUri?: string | null) {
  try {
    if (!imageUri) {
      return pb.collection("book").create(book);
    }

    const formData = new FormData();
    Object.entries(book).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("cover", createCoverFile(imageUri));

    return pb.collection("book").create(formData);
  } catch (error) {
    console.error("addBook error:", error);
    throw new Error("Failed to add book");
  }
}

export async function deleteBook(id: string) {
  try {
    await pb.collection("book").delete(id);
    return true;
  } catch (error) {
    console.error("deleteBook error:", error);
    throw new Error("Failed to delete book");
  }
}

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

export async function returnBook(
  borrowId: string,
  rating: number,
  feedback: string,
) {
  try {
    return pb.collection("borrow").update(borrowId, {
      returnDate: toDateOnly(new Date()),
      rating,
      feedback,
    });
  } catch (error) {
    console.error("returnBook error:", error);
    throw new Error("Failed to return book");
  }
}

export async function updateBookStatus(
  bookId: string,
  state: "available" | "borrowed",
): Promise<any> {
  try {
    return pb.collection("book").update(bookId, { state });
  } catch (error) {
    console.error("updateBookStatus error:", error);
    throw new Error("Failed to update book state");
  }
}

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
