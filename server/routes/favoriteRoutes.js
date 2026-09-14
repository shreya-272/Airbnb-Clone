import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/favoriteController.js';

const router = express.Router();

// POST /api/favorites - Add a favorite
router.post('/favorites', addFavorite);

// DELETE /api/favorites/:listingId - Remove a favorite
router.delete('/favorites/:listingId', removeFavorite);

// GET /api/favorites - Check favorite status or list favorites
router.get('/favorites', getFavorites);

export default router;
