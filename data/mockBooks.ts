import { Book, BookCategory, BookCondition } from '@/types';

const categories: BookCategory[] = [
 
  'computer-science',
  'electronics',
  'mechanical',
  'civil',
  'electrical',
  'power',
  'non-technical',
];

const conditions: BookCondition[] = ['new', 'like-new', 'good', 'fair'];

const bookTitles = [
  { title: 'Engineering Mathematics Vol. 1', author: 'B.S. Grewal', category: 'mathematics' as BookCategory },
  { title: 'Data Structures & Algorithms', author: 'Narasimha Karumanchi', category: 'computer-science' as BookCategory },
  { title: 'Digital Electronics', author: 'Morris Mano', category: 'electronics' as BookCategory },
  { title: 'Strength of Materials', author: 'R.K. Bansal', category: 'mechanical' as BookCategory },
  { title: 'Basic Electrical Engineering', author: 'D.P. Kothari', category: 'electrical' as BookCategory },
  { title: 'Surveying Vol. 1', author: 'B.C. Punmia', category: 'civil' as BookCategory },
  { title: 'C Programming Language', author: 'Dennis Ritchie', category: 'computer-science' as BookCategory },
  { title: 'Engineering Physics', author: 'H.K. Malik', category: 'science' as BookCategory },
  { title: 'Principles of Management', author: 'P.C. Tripathi', category: 'business' as BookCategory },
  { title: 'Technical English', author: 'M. Ashraf Rizvi', category: 'language' as BookCategory },
  { title: 'Thermodynamics', author: 'P.K. Nag', category: 'mechanical' as BookCategory },
  { title: 'Computer Networks', author: 'Andrew Tanenbaum', category: 'computer-science' as BookCategory },
  { title: 'Microprocessors', author: 'Ramesh Gaonkar', category: 'electronics' as BookCategory },
  { title: 'Engineering Drawing', author: 'N.D. Bhatt', category: 'engineering' as BookCategory },
  { title: 'Applied Mathematics', author: 'Erwin Kreyszig', category: 'mathematics' as BookCategory },
];

const locations = [
  'Main Campus - Block A',
  'Main Campus - Block B',
  'Hostel Area',
  'Library Building',
  'Canteen Area',
  'Engineering Block',
];

const sellerNames = [
  'Rahim Khan',
  'Fatima Begum',
  'Mohammad Ali',
  'Ayesha Rahman',
  'Karim Hossain',
  'Nadia Islam',
  'Tanvir Ahmed',
  'Sadia Akter',
];

export const generateMockBooks = (count: number = 20): Book[] => {
  const books: Book[] = [];
  
  for (let i = 0; i < count; i++) {
    const bookData = bookTitles[i % bookTitles.length];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const originalPrice = Math.floor(Math.random() * 800) + 200;
    const discount = condition === 'new' ? 0.1 : condition === 'like-new' ? 0.3 : condition === 'good' ? 0.5 : 0.6;
    const price = Math.floor(originalPrice * (1 - discount));
    
    books.push({
      id: `book-${i + 1}`,
      title: bookData.title,
      author: bookData.author,
      price,
      originalPrice,
      condition,
      category: bookData.category,
      semester: Math.floor(Math.random() * 8) + 1,
      description: `${condition === 'new' ? 'Brand new' : condition === 'like-new' ? 'Almost like new' : condition === 'good' ? 'Good condition' : 'Fair condition'} copy of ${bookData.title}. Perfect for ${bookData.category} students. All pages intact, ${condition === 'new' || condition === 'like-new' ? 'no markings' : 'some highlights and notes included'}.`,
      images: [
        `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop&q=80`,
        `https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop&q=80`,
      ],
      sellerId: `seller-${(i % 8) + 1}`,
      sellerName: sellerNames[i % sellerNames.length],
      sellerRating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      location: locations[Math.floor(Math.random() * locations.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 500) + 10,
      isFeatured: i < 4,
    });
  }
  
  return books;
};

export const mockBooks = generateMockBooks(20);

export const categoryLabels: Record<BookCategory, string> = {
  
  'computer-science': 'Computer Science',
  'electronics': 'Electronics',
  'mechanical': 'Mechanical',
  'civil': 'Civil',
  'electrical': 'Electrical',
  'power': 'Power',
  'non-technical': 'Non-Technical',
 'other': 'Other',
};

export const conditionLabels: Record<BookCondition, string> = {
  'new': 'New',
  'like-new': 'Like New',
  'good': 'Good',
  'fair': 'Fair',
};
