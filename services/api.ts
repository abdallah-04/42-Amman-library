const BASE_URL = 'http://192.168.1.15:1337/api';

export async function getAllBooks() {
  try {
    const response = await fetch(`${BASE_URL}/books?populate=*`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('getAllBooks error:', error);
    throw new Error('Failed to fetch books');
  }
}

export async function getBook(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}?populate=*`);

    if (!response.ok) {
      throw new Error(`Book not found: ${response.status}`);
    }

    const json = await response.json();

    console.log('Raw API response:', JSON.stringify(json));

    if (!json.data) {
      throw new Error('Book not found');
    }

    return json.data;
  } catch (error) {
    console.error('getBook error:', error);
    throw new Error('Failed to fetch book');
  }
}

export async function searchBooks(query: string) {
  try {
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `${BASE_URL}/books?filters[title][$containsi]=${encodedQuery}&populate=*`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('searchBooks error:', error);
    throw new Error('Search failed');
  }
}

export async function addBook(book: object) {
  try {
    const response = await fetch(`${BASE_URL}/books`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ data: book }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw new Error('Failed to add book');
  }
}

export async function updateBook(id: string, book: any) {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: book }),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('updateBook error:', error);
    throw new Error('Failed to update book');
  }
}

export async function deleteBook(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('deleteBook error:', error);
    throw new Error('Failed to delete book');
  }
}

export async function getUserBorrows(intraLogin: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/borrows?filters[intraLogin][$eq]=${intraLogin}&populate=book`
    );
    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    throw new Error('Failed to fetch borrows');
  }
}

export async function borrowBook(bookId: string, intraLogin: string) {
  try {
    const response = await fetch(`${BASE_URL}/borrows`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          book:       bookId,
          intraLogin: intraLogin,
          borrowDate: new Date().toISOString().split('T')[0],
        }
      }),
    });

    if (!response.ok) throw new Error('Failed to borrow');
    return response.json();
  } catch (error) {
    throw new Error('Failed to borrow book');
  }
}

export async function returnBook(
  borrowId: string,
  rating: number,
  feedback: string
) {
  try {
    const response = await fetch(`${BASE_URL}/borrows/${borrowId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          returnDate: new Date().toISOString().split('T')[0],
          rating,
          feedback,
        }
      }),
    });

    if (!response.ok) throw new Error('Failed to return');
    return response.json();
  } catch (error) {
    throw new Error('Failed to return book');
  }
}

export async function updateBookStatus(
  bookId: string,
  status: 'available' | 'borrowed'
) {
  try {
    const response = await fetch(`${BASE_URL}/books/${bookId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { status } }),
    });

    if (!response.ok) throw new Error('Failed to update');
    return response.json();
  } catch (error) {
    throw new Error('Failed to update book status');
  }
}