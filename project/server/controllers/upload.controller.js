import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import exifParser from 'exif-parser';
import { ExifTool } from 'exiftool-vendored';
import ImageMetadata from '../models/ImageMetadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize ExifTool
const exiftool = new ExifTool();

// @desc    Upload an image and extract metadata
// @route   POST /api/upload
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    
    // Extract metadata using ExifTool for comprehensive metadata
    let metadata;
    try {
      metadata = await exiftool.read(filePath);
    } catch (error) {
      console.error('ExifTool error:', error);
      
      // Fallback to exif-parser for basic EXIF data
      try {
        const buffer = fs.readFileSync(filePath);
        const parser = exifParser.create(buffer);
        metadata = parser.parse();
      } catch (parserError) {
        console.error('Exif parser error:', parserError);
        metadata = { error: 'Failed to extract metadata' };
      }
    }
    
    // Process and organize metadata
    const processedMetadata = processMetadata(metadata);
    
    // Save metadata to database
    const imageMetadata = await ImageMetadata.create({
      userId: req.user.id,
      filename: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadDate: new Date(),
      metadataRaw: metadata,
      ...processedMetadata
    });
    
    // Return processed metadata
    res.status(201).json({
      message: 'Image uploaded and metadata extracted',
      metadata: imageMetadata
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process and organize metadata
const processMetadata = (metadata) => {
  // The structure depends on which library extracted the metadata
  
  // For ExifTool results
  if (metadata.Make || metadata.Model) {
    return {
      // Camera information
      make: metadata.Make || null,
      model: metadata.Model || null,
      lens: metadata.LensModel || metadata.Lens || null,
      
      // Image details
      width: metadata.ImageWidth || metadata.ExifImageWidth || null,
      height: metadata.ImageHeight || metadata.ExifImageHeight || null,
      
      // GPS data
      latitude: metadata.GPSLatitude || null,
      longitude: metadata.GPSLongitude || null,
      altitude: metadata.GPSAltitude || null,
      
      // Date information
      creationDate: metadata.CreateDate || metadata.DateTimeOriginal || null,
      modificationDate: metadata.ModifyDate || null,
      
      // Software information
      software: metadata.Software || null,
      
      // EXIF-specific
      exposureTime: metadata.ExposureTime || null,
      fNumber: metadata.FNumber || null,
      iso: metadata.ISO || null,
      focalLength: metadata.FocalLength || null
    };
  }
  
  // For exif-parser results
  if (metadata.tags) {
    const { tags } = metadata;
    return {
      // Camera information
      make: tags.Make || null,
      model: tags.Model || null,
      
      // Image details
      width: tags.ImageWidth || null,
      height: tags.ImageHeight || null,
      
      // GPS data
      latitude: tags.GPSLatitude || null,
      longitude: tags.GPSLongitude || null,
      altitude: tags.GPSAltitude || null,
      
      // Date information
      creationDate: tags.CreateDate || tags.DateTimeOriginal 
        ? new Date(tags.CreateDate || tags.DateTimeOriginal * 1000) 
        : null,
      modificationDate: tags.ModifyDate 
        ? new Date(tags.ModifyDate * 1000) 
        : null,
      
      // EXIF-specific
      exposureTime: tags.ExposureTime || null,
      fNumber: tags.FNumber || null,
      iso: tags.ISO || null,
      focalLength: tags.FocalLength || null
    };
  }
  
  // Default empty result if no metadata found
  return {
    make: null,
    model: null,
    lens: null,
    width: null,
    height: null,
    latitude: null,
    longitude: null,
    altitude: null,
    creationDate: null,
    modificationDate: null,
    software: null,
    exposureTime: null,
    fNumber: null,
    iso: null,
    focalLength: null
  };
};