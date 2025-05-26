import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import User from './User.js';

const ImageMetadata = db.define('imageMetadata', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // General metadata
  metadataRaw: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  // Camera information
  make: {
    type: DataTypes.STRING,
    allowNull: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lens: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Image details
  width: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // GPS data
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  altitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // Date information
  creationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  modificationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Software information
  software: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // EXIF-specific
  exposureTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fNumber: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  iso: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  focalLength: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
});

// Association
ImageMetadata.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ImageMetadata, { foreignKey: 'userId' });

export default ImageMetadata;