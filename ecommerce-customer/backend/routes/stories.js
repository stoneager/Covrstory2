const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { quote, description } = req.body;

    if (!quote || !description || !req.file) {
      return res.status(400).json({ message: 'Quote, description, and image are required' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `stories/${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const imageLink = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    const story = new Story({
      userId: req.user.id,
      quote,
      description,
      imageLink,
      approved: false
    });

    await story.save();
    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const stories = await Story.find({ approved: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    if (story.imageLink) {
      const key = story.imageLink.split('.com/')[1];
      if (key) {
        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      }
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
});

module.exports = router;
