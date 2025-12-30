const SiteCustomization = require('../models/SiteCustomization');
const cloudinary = require('../config/cloudinary');

// Get site customization
const getCustomization = async (req, res) => {
  try {
    const customization = await SiteCustomization.getSiteCustomization();
    res.json({
      success: true,
      data: customization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update site customization
const updateCustomization = async (req, res) => {
  try {
    let updates = req.body;

    // Parse JSON data if sent as FormData
    if (req.body.data && typeof req.body.data === 'string') {
      try {
        updates = JSON.parse(req.body.data);
      } catch (parseError) {
        console.log('Error parsing JSON data:', parseError);
        updates = req.body;
      }
    }

    // Handle file uploads
    if (req.files) {
      console.log('📁 Processing uploaded files:', Object.keys(req.files));

      // Handle logo upload
      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.files.logo[0];
        updates.logo = {
          ...updates.logo,
          url: `/uploads/images/${logoFile.filename}`,
          alt: 'Company Logo'
        };
        console.log('📷 Logo uploaded:', updates.logo);
      }

      // Handle favicon upload
      if (req.files.favicon && req.files.favicon[0]) {
        const faviconFile = req.files.favicon[0];
        updates.favicon = {
          ...updates.favicon,
          url: `/uploads/images/${faviconFile.filename}`
        };
        console.log('🎨 Favicon uploaded:', updates.favicon);
      }

      // Handle background image upload
      if (req.files.backgroundImage && req.files.backgroundImage[0]) {
        const bgFile = req.files.backgroundImage[0];
        updates.backgroundImage = {
          ...updates.backgroundImage,
          url: `/uploads/images/${bgFile.filename}`
        };
        console.log('🖼️ Background image uploaded:', updates.backgroundImage);
      }
    }

    console.log('🔄 Updating customization with data:', JSON.stringify(updates, null, 2));

    const customization = await SiteCustomization.updateSiteCustomization(updates);

    console.log('✅ Customization updated successfully:', customization);

    res.json({
      success: true,
      message: 'Customization updated successfully',
      data: customization
    });
  } catch (error) {
    console.error('❌ Customization update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset to default customization
const resetCustomization = async (req, res) => {
  try {
    // Delete current customization
    await SiteCustomization.deleteMany({});
    
    // Create new default customization
    const customization = await SiteCustomization.getSiteCustomization();
    
    res.json({
      success: true,
      message: 'Customization reset to defaults',
      data: customization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available fonts
const getAvailableFonts = (req, res) => {
  const fonts = [
    { name: 'Inter', value: 'Inter', category: 'Sans Serif' },
    { name: 'Roboto', value: 'Roboto', category: 'Sans Serif' },
    { name: 'Open Sans', value: 'Open Sans', category: 'Sans Serif' },
    { name: 'Lato', value: 'Lato', category: 'Sans Serif' },
    { name: 'Montserrat', value: 'Montserrat', category: 'Sans Serif' },
    { name: 'Poppins', value: 'Poppins', category: 'Sans Serif' },
    { name: 'Nunito', value: 'Nunito', category: 'Sans Serif' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro', category: 'Sans Serif' }
  ];

  res.json({
    success: true,
    data: fonts
  });
};

module.exports = {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getAvailableFonts
};
