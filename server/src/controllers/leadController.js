import Lead from '../models/Lead.js';
import { body, validationResult } from 'express-validator';

/**
 * Lead Controller
 * Handles lead capture and management
 */

// Validation rules
export const validateLead = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\d\s\-\(\)]+$/).withMessage('Please enter a valid phone number'),
];

// Create Lead
export const createLead = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { name, email, phone } = req.body;

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Check if lead already exists
    let lead = await Lead.findOne({ email });

    if (lead) {
      // Update existing lead
      lead.name = name;
      lead.phone = phone;
      lead.ipAddress = ipAddress;
      lead.userAgent = userAgent;
      await lead.save();

      console.log(`📝 Updated existing lead: ${email}`);
    } else {
      // Create new lead
      lead = await Lead.create({
        name,
        email,
        phone,
        ipAddress,
        userAgent,
      });

      console.log(`✅ New lead created: ${email}`);
    }

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      leadId: lead._id,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture lead',
      error: error.message,
    });
  }
};

// Get Lead by ID
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message,
    });
  }
};

// Get All Leads (Admin)
export const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 50, converted } = req.query;

    const query = {};
    if (converted !== undefined) {
      query.convertedToCustomer = converted === 'true';
    }

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      leads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message,
    });
  }
};

export default {
  validateLead,
  createLead,
  getLeadById,
  getAllLeads,
};