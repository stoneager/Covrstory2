const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching all stories:', error);
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

router.put('/:id/approve', auth, async (req, res) => {
  try {
    const { approved } = req.body;
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    ).populate('userId', 'name email');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json(story);
  } catch (error) {
    console.error('Error updating story approval:', error);
    res.status(500).json({ message: 'Error updating story', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
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
