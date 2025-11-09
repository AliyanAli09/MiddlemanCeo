import Lead from '../models/Lead.js';
import { body, validationResult } from 'express-validator';
import { sendLeadCaptureNotification } from '../services/emailService.js';

/**
 * Lead Controller
 * Handles lead capture and management
 * Updated with immediate email notifications
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
    let isNewLead = false;

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

      isNewLead = true;
      console.log(`✅ New lead created: ${email}`);

      // 🎯 SEND IMMEDIATE EMAIL NOTIFICATION TO ADMIN
      // This happens BEFORE the user selects a package
      try {
        await sendLeadCaptureNotification({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          leadId: lead._id,
        });
        console.log(`📧 Lead capture notification sent to admin for ${email}`);
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('❌ Failed to send lead capture notification:', emailError);
        // Continue anyway - lead is created, email is secondary
      }
    }

    res.status(201).json({
      success: true,
      message: isNewLead ? 'Lead captured successfully' : 'Welcome back! Redirecting to Blueprint...',
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

// Get Lead Statistics (Admin Dashboard)
export const getLeadStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const converted = await Lead.countDocuments({ convertedToCustomer: true });
    const notConverted = total - converted;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(2) : 0;

    // Get leads from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLeads = await Lead.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get leads from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyLeads = await Lead.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        converted,
        notConverted,
        conversionRate: parseFloat(conversionRate),
        recentLeads,
        monthlyLeads,
      },
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead statistics',
      error: error.message,
    });
  }
};

// Update Lead Status
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { convertedToCustomer, notes } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Update fields
    if (convertedToCustomer !== undefined) {
      lead.convertedToCustomer = convertedToCustomer;
    }
    if (notes !== undefined) {
      lead.notes = notes;
    }

    await lead.save();

    console.log(`✅ Lead updated: ${id} - Converted: ${convertedToCustomer}`);

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message,
    });
  }
};

// Delete Lead (Admin)
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    console.log(`✅ Lead deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message,
    });
  }
};

export default {
  validateLead,
  createLead,
  getLeadById,
  getAllLeads,
  getLeadStats,
  updateLeadStatus,
  deleteLead,
};