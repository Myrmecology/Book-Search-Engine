import { Request, Response } from 'express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';
// Import the AuthRequest interface
import type { AuthRequest } from '../types/express/index.js';

// get a single user by either their id or their username
export const getSingleUser = async (req: AuthRequest, res: Response) => {
  try {
    const foundUser = await User.findOne({
      $or: [{ _id: req.user ? req.user._id : req.params.id }, { username: req.params.username }],
    });

    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }

    return res.json(foundUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// create a user, sign a token, and send it back
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);

    if (!user) {
      return res.status(400).json({ message: 'Something is wrong!' });
    }
    const token = signToken(user.username, user.email, user._id);
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// login a user, sign a token, and send it back
export const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(req.body.password);

    if (!correctPw) {
      return res.status(400).json({ message: 'Wrong password!' });
    }
    const token = signToken(user.username, user.email, user._id);
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// save a book to a user's `savedBooks` field
export const saveBook = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $addToSet: { savedBooks: req.body } },
      { new: true, runValidators: true }
    );
    return res.json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};

// remove a book from `savedBooks`
export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { savedBooks: { bookId: req.params.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};