import ImageMetadata from "../models/ImageMetadata.js";
import { Op } from "sequelize";
import sequelize from "../config/database.js"; // oder an den korrekten Pfad anpassen

// @desc    Get metadata for a specific image
// @route   GET /api/metadata/:id
// @access  Private
export const getMetadata = async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await ImageMetadata.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!metadata) {
      return res.status(404).json({ message: "Metadata not found" });
    }

    res.status(200).json(metadata);
  } catch (error) {
    console.error("Get metadata error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete metadata and associated image
// @route   DELETE /api/metadata/:id
// @access  Private
export const deleteMetadata = async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await ImageMetadata.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!metadata) {
      return res.status(404).json({ message: "Metadata not found" });
    }

    // Delete from database
    await metadata.destroy();

    res.status(200).json({ message: "Metadata deleted successfully" });
  } catch (error) {
    console.error("Delete metadata error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get metadata statistics (counts by category)
// @route   GET /api/metadata/stats
// @access  Private
export const getMetadataStats = async (req, res) => {
  try {
    // Count total uploads
    const totalUploads = await ImageMetadata.count({
      where: {
        userId: req.user.id,
      },
    });

    // Count images with GPS data
    const withGPS = await ImageMetadata.count({
      where: {
        userId: req.user.id,
        latitude: {
          [Op.not]: null,
        },
        longitude: {
          [Op.not]: null,
        },
      },
    });

    // Count images by camera make (top 5)
    const cameraStats = await ImageMetadata.findAll({
      attributes: [
        "make",
        [sequelize.fn("COUNT", sequelize.col("make")), "count"],
      ],
      where: {
        userId: req.user.id,
        make: {
          [Op.not]: null,
        },
      },
      group: ["make"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 5,
    });

    res.status(200).json({
      totalUploads,
      withGPS,
      cameraStats,
    });
  } catch (error) {
    console.error("Get metadata stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
