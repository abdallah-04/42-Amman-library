const BASE_URL = 'http://10.0.2.2:1337/api';

export async function getAllBooks()
{
    try{
        const response = await fetch(`${BASE_URL}/books`);
        const data = await response.json();
        return (data.data);
    }    
    catch(error)
    {
        throw new Error('Failed to fetch books');
    }
}

export async function getBook(id: string)
{
    try
    {
        const response =   await fetch(`${BASE_URL}/books/${id}`);
        const data     = await response.json();
        return(data.data);
    } 
    catch (error) 
    {
        throw new Error('Failed to fetch book');
    }
}

export async function searchBooks(query: string) 
{
    try
    {
        const response = await fetch(`${BASE_URL}/books?filters[title][$containsi]=${query}`);
        const data = await response.json();
        return (data.data);
    }
    catch(error)
    {
        throw new Error ('Search failed');
    }
}

export async function addBook(book: object) {
  try {
    const response = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: book }),
    });
    return response.json();
  } catch (error) {
    throw new Error('Failed to add book');
  }
}