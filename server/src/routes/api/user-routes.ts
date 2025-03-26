import express from 'express';
import {
  createUser,
  getSingleUser,
  saveBook,
  deleteBook,
  login,
} from '../../controllers/user-controller.js';
import { authenticateToken } from '../../services/auth.js';

const router = express.Router();

// /api/users
router.route('/').post(createUser);

// /api/users/login
router.route('/login').post(login);

// /api/users/me
// Use authenticateToken middleware
router.route('/me').get(authenticateToken, getSingleUser);

// /api/users/books
router.route('/books').put(authenticateToken, saveBook);

// /api/users/books/:bookId
router.route('/books/:bookId').delete(authenticateToken, deleteBook);

export default router;