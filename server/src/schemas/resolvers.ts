import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import type { Context } from '../types/express/index.js';

const resolvers = {
  Query: {
    // Get the logged in user data
    me: async (_parent: any, _args: any, context: Context) => {
      // If context has user property (set by auth middleware), get and return user data
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

        return userData;
      }
      // If no context.user, user is not authenticated
      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    // Login mutation
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // Check password
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // Create token and return
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Add user mutation
    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      // Create user
      const user = await User.create({ username, email, password });
      
      // Create token and return
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Save book mutation
    saveBook: async (_parent: any, { bookData }: any, context: Context) => {
      // Check if user is authenticated
      if (context.user) {
        // Add book to user's savedBooks
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } }, // addToSet prevents duplicates
          { new: true, runValidators: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      
      throw new AuthenticationError('You need to be logged in!');
    },

    // Remove book mutation
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: Context) => {
      // Check if user is authenticated
      if (context.user) {
        // Remove book from user's savedBooks
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      
      throw new AuthenticationError('You need to be logged in!');
    }
  }
};

export default resolvers;