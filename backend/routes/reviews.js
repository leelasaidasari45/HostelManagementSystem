import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// GET /api/reviews
// Fetch all reviews to display on the landing page
router.get('/', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('app_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Server error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews
// Submit a new review
router.post('/', async (req, res) => {
  try {
    const { user_id, name, role, pg_name, rating, quote } = req.body;

    if (!user_id || !name || !role || !rating || !quote) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('app_reviews')
      .insert([{
        user_id,
        name,
        role,
        pg_name: pg_name || null,
        rating,
        quote
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting review:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Server error submitting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
