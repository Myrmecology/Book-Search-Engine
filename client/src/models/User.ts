import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcryptjs'; // or 'bcrypt' depending on which one you're using
import { BookDocument } from './Book'; // Import the BookDocument type for typing
import Book from './Book'; // Import the Book model

// Define the User document interface
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[]; // Reference to Book model
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number;
}

// Define the User schema for MongoDB
const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: [
      {
        type: Schema.Types.ObjectId, // ObjectId type for reference to Book model
        ref: 'Book', // Reference to the 'Book' model
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to compare and validate passwords
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Virtual field to get the book count
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

// Create the User model based on the schema
const User = model<UserDocument>('User', userSchema);

export default User;
