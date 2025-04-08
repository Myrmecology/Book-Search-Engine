import { Schema, model, type Document } from 'mongoose';

// Define the BookDocument interface to type the documents
export interface BookDocument extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

// Define the book schema for the Book collection
export const bookSchema = new Schema<BookDocument>({
  authors: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  // saved book id from GoogleBooks
  bookId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
});

// Create the Mongoose model based on the book schema
const Book = model<BookDocument>('Book', bookSchema);

// Export the model so it can be used in other files
export default Book;