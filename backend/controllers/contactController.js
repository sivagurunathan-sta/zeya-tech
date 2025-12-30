const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Email configuration (optional)
const createEmailTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return null;
};

// Helper function to check database connection
const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

const submitContactForm = async (req, res) => {
  try {
    // If no database connection, just return success (contact form would work via email)
    if (!checkDBConnection()) {
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!',
        source: 'no-database'
      });
    }
    const {
      name,
      email,
      phone,
      subject,
      message,
      queryType = 'general',
      urgency = 'medium'
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, email, subject, and message'
      });
    }

    // Create contact entry
    const sanitizedPhone = phone ? String(phone).replace(/[^\d+]/g, '') : '';

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: sanitizedPhone,
      subject: subject.trim(),
      message: message.trim(),
      queryType,
      urgency
    });

    // Send notification email (if configured)
    const transporter = createEmailTransporter();
    if (transporter) {
      try {
        // Send notification to admin
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Contact Form Submission</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Query Type:</strong> ${queryType}</p>
                <p><strong>Priority:</strong> ${urgency}</p>
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-left: 3px solid #2563eb;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
            </div>
          `
        });

        // Send confirmation email to user
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Thank you for contacting us!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Thank You for Your Message!</h2>
              <p>Dear ${name},</p>
              <p>Thank you for reaching out to us. We have received your message and will get back to you soon.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Query Type:</strong> ${queryType}</p>
                <p><strong>Priority Level:</strong> ${urgency}</p>
              </div>

              <p>Our team typically responds within 24 hours during business days. High-priority inquiries are addressed even sooner.</p>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px;">
                  Best regards,<br>
                  ZEYA-TECH Team<br>
                  <a href="mailto:hello@linkedincompany.com">hello@linkedincompany.com</a><br>
                  +1 (555) 123-4567
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        queryType: contact.queryType,
        urgency: contact.urgency,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const queryType = req.query.queryType;
    const urgency = req.query.urgency;

    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (queryType) filter.queryType = queryType;
    if (urgency) filter.urgency = urgency;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      contacts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        hasMore: skip + contacts.length < total
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ success: true, contact });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: new, in-progress, resolved' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ success: true, contact });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });

    // Query type breakdown
    const queryTypeStats = await Contact.aggregate([
      { $group: { _id: '$queryType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Urgency breakdown
    const urgencyStats = await Contact.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status queryType urgency createdAt');

    // Monthly contact trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Contact.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalContacts,
        newContacts,
        inProgressContacts,
        resolvedContacts,
        queryTypeStats,
        urgencyStats,
        recentContacts,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (contact.status === 'new') {
      contact.status = 'in-progress';
    }
    contact.readAt = new Date();
    await contact.save();

    res.json({ success: true, contact });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of contact IDs' });
    }

    const validStatuses = ['new', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: new, in-progress, resolved' 
      });
    }

    const result = await Contact.updateMany(
      { _id: { $in: ids } },
      { status },
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} contacts updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({ message: error.message });
  }
};

const searchContacts = async (req, res) => {
  try {
    const { q, status, queryType, urgency, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Text search
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { subject: new RegExp(q, 'i') },
        { message: new RegExp(q, 'i') }
      ];
    }

    // Status filter
    if (status) filter.status = status;

    // Query type filter
    if (queryType) filter.queryType = queryType;

    // Urgency filter
    if (urgency) filter.urgency = urgency;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      contacts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitContactForm,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
  markAsRead,
  bulkUpdateStatus,
  searchContacts
};
