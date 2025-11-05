import express from 'express';
import {
  validateLead,
  createLead,
  getLeadById,
  getAllLeads,
} from '../controllers/leadController.js';

const router = express.Router();

/**
 * Lead Routes
 * @route /api/leads
 */

// POST /api/leads - Create a new lead
router.post('/', validateLead, createLead);

// GET /api/leads/:id - Get lead by ID
router.get('/:id', getLeadById);

// GET /api/leads - Get all leads (Admin)
router.get('/', getAllLeads);

export default router;