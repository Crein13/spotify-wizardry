import { Router } from 'express';
import { sortHouseByGenres } from '../utils/houseSort';

const router = Router();

router.post('/sort-house', (req, res) => {
  const { genres } = req.body;
  if (!Array.isArray(genres)) {
    return res.status(400).json({ error: 'Genres must be an array of strings.' });
  }
  const house = sortHouseByGenres(genres);
  res.json({ house });
});

export default router;