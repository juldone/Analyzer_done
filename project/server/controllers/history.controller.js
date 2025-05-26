import { Op } from 'sequelize';
import ImageMetadata from '../models/ImageMetadata.js';

// @desc    Get user's upload history
// @route   GET /api/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'uploadDate', order = 'DESC' } = req.query;
    
    const offset = (page - 1) * limit;
    
    const history = await ImageMetadata.findAndCountAll({
      where: {
        userId: req.user.id
      },
      attributes: [
        'id', 
        'originalName', 
        'fileSize', 
        'fileType', 
        'uploadDate', 
        'make', 
        'model', 
        'latitude', 
        'longitude'
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
    
    const totalPages = Math.ceil(history.count / limit);
    
    res.status(200).json({
      items: history.rows,
      page: parseInt(page, 10),
      totalPages,
      totalItems: history.count
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search user's upload history
// @route   GET /api/history/search
// @access  Private
export const searchHistory = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const history = await ImageMetadata.findAndCountAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { originalName: { [Op.iLike]: `%${query}%` } },
          { make: { [Op.iLike]: `%${query}%` } },
          { model: { [Op.iLike]: `%${query}%` } },
          { software: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: [
        'id', 
        'originalName', 
        'fileSize', 
        'fileType', 
        'uploadDate', 
        'make', 
        'model', 
        'latitude', 
        'longitude'
      ],
      order: [['uploadDate', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
    
    const totalPages = Math.ceil(history.count / limit);
    
    res.status(200).json({
      items: history.rows,
      page: parseInt(page, 10),
      totalPages,
      totalItems: history.count
    });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete all history for user
// @route   DELETE /api/history
// @access  Private
export const deleteAllHistory = async (req, res) => {
  try {
    await ImageMetadata.destroy({
      where: {
        userId: req.user.id
      }
    });
    
    res.status(200).json({ message: 'All history deleted successfully' });
  } catch (error) {
    console.error('Delete all history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};