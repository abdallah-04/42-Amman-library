import { Book } from '../components/BookGridCard';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverUrl: 'https://covers.openlibrary.org/b/id/10909258-L.jpg',
    status: 'available',
    pages: 304,
    rating: 4.0,
    description: 'The Midnight Library is a 2020 speculative novel by Matt Haig about a woman named Nora Seed, who after reaching a breaking point in her life, finds herself in a mystical library that allows her to explore the infinite versions of her life.',
    intraLogin: 'amufleh'
  },
  {
    id: '2',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    coverUrl: 'https://covers.openlibrary.org/b/id/10909266-L.jpg',
    status: 'borrowed',
    pages: 336,
    rating: 4.5,
    borrowedBy: 'amufleh',
    borrowDate: 'Dec 30 2024',
    description: 'The Silent Patient is a shocking psychological thriller of a woman\'s act of violence against her husband and of the therapist obsessed with uncovering her motive.',
    intraLogin: 'amufleh'
  },
  {
    id: '3',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://covers.openlibrary.org/b/id/10361120-L.jpg',
    status: 'available',
    pages: 320,
    rating: 4.8,
    description: 'Atomic Habits is a practical guide to building good habits and breaking bad ones through small, incremental changes that lead to remarkable results.',
      intraLogin: 'amufleh'
  },
  {
    id: '4',
    title: 'ثلاثية غرناطة',
    author: 'رضوى عاشور',
    coverUrl: 'https://covers.openlibrary.org/b/id/12818862-L.jpg',
    status: 'available',
    pages: 752,
    rating: 4.7,
    description: 'رواية تاريخية تحكي عن عائلة مسلمة في غرناطة إبان سقوط الأندلس، وما عاشته من مآسٍ وصراعات.',
    intraLogin: 'amufleh'
  },
  {
    id: '5',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://covers.openlibrary.org/b/id/10535955-L.jpg',
    status: 'borrowed',
    pages: 688,
    rating: 4.6,
    borrowedBy: 'jdoe',
    borrowDate: 'Jan 5 2025',
    description: 'Dune is a 1965 science fiction novel set in the distant future amidst a feudal interstellar society in which various noble houses control planetary fiefs.',
    intraLogin: 'amufleh'
  },
  {
    id: '6',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231432-L.jpg',
    status: 'available',
    pages: 208,
    rating: 4.3,
    description: 'The Alchemist follows a young Andalusian shepherd named Santiago in his journey to Egypt, after having a recurring dream of finding treasure there.',
    intraLogin: 'amufleh'
  },
];