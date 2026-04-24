export const BASE_URL = "https://library-backend-production-e8bd.up.railway.app/api";

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

export async function uploadImage(imageUri: string): Promise<string> {
  try {
    const CLOUD_NAME = 'dj1jhzfrj';
    const UPLOAD_PRESET = 'library_books';

    const formData = new FormData();
    const filename = imageUri.split('/').pop() ?? 'cover.jpg';
    const match    = /\.(\w+)$/.exec(filename);
    const type     = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri:  imageUri,
      name: filename,
      type: type,
    } as any);

    formData.append('upload_preset', UPLOAD_PRESET);

    console.log('Uploading directly to Cloudinary...');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body:   formData,
      }
    );

    console.log('Cloudinary response status:', response.status);

    const data = await response.json();
    console.log('Cloudinary response:', JSON.stringify(data));

    if (data.error) {
      throw new Error(data.error.message);
    }

    console.log('Upload success! URL:', data.secure_url);
    return data.secure_url;

  } catch (error) {
    console.error('uploadImage error:', error);
    throw new Error('Failed to upload image');
  }
}