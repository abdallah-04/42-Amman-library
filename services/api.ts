export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL!;

export async function getAllBooks() {
  try {
    const response = await fetch(`${BASE_URL}/books?populate=*`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    throw new Error("Failed to fetch books");
  }
}

export async function getBook(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}?populate=*`);
    if (!response.ok) throw new Error(`Book not found: ${response.status}`);
    const json = await response.json();
    if (!json.data) throw new Error("Book not found");
    return json.data;
  } catch (error) {
    throw new Error("Failed to fetch book");
  }
}

export async function searchBooks(query: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/books?filters[title][$containsi]=${encodeURIComponent(query)}&populate=*`,
    );
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    throw new Error("Search failed");
  }
}

export async function addBook(book: object) {
  try {
    const response = await fetch(`${BASE_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: book }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  } catch (error) {
    throw new Error("Failed to add book");
  }
}

export async function deleteBook(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
    return true;
  } catch (error) {
    throw new Error("Failed to delete book");
  }
}

export async function getBooksByUser(intraLogin: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/books?filters[added_by][$eq]=${intraLogin}&populate=*`,
    );
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    throw new Error("Failed to fetch user books");
  }
}

export async function getUserBorrows(intraLogin: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/borrows?filters[intraLogin][$eq]=${intraLogin}&populate=book`,
    );
    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    throw new Error("Failed to fetch borrows");
  }
}

export async function borrowBook(bookId: string, intraLogin: string) {
  try {
    const response = await fetch(`${BASE_URL}/borrows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          book: bookId,
          intraLogin: intraLogin,
          borrowDate: new Date().toISOString().split("T")[0],
        },
      }),
    });
    if (!response.ok) throw new Error("Failed to borrow");
    return response.json();
  } catch (error) {
    throw new Error("Failed to borrow book");
  }
}

export async function returnBook(
  borrowId: string,
  rating: number,
  feedback: string,
) {
  try {
    const response = await fetch(`${BASE_URL}/borrows/${borrowId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          returnDate: new Date().toISOString().split("T")[0],
          rating,
          feedback,
        },
      }),
    });
    if (!response.ok) throw new Error("Failed to return");
    return response.json();
  } catch (error) {
    throw new Error("Failed to return book");
  }
}

export async function updateBookStatus(
  bookId: string,
  state: "available" | "borrowed",
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/books/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { state } }),
    });
    if (!response.ok) throw new Error("Failed to update");
    return response.json();
  } catch (error) {
    throw new Error("Failed to update book state");
  }
}

export async function getBookReviews(bookId: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/borrows?filters[book][documentId][$eq]=${bookId}&filters[rating][$notNull]=true&populate=*`
    );
    if (!response.ok) throw new Error('Failed to fetch reviews');
    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    throw new Error('Failed to fetch reviews');
  }
}