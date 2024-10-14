const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));  // Static folder for media files

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mediaDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Schema and Model for Media
const mediaSchema = new mongoose.Schema({
    title: String,
    description: String,
    mediaType: { type: String, enum: ['image', 'video'] },
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
});

const Media = mongoose.model('Media', mediaSchema);

// Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },  // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images and videos only!');
        }
    }
});


// API Routes
app.post('/upload', upload.single('media'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const newMedia = new Media({
            title: req.body.title,
            description: req.body.description,
            mediaType: req.body.mediaType,
            filePath: req.file.path
        });

        newMedia.save()
            .then(() => res.status(200).json({ message: 'File uploaded successfully!' }))
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error saving media to the database' });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during file upload' });
    }
});


app.get('/media', (req, res) => {
    Media.find()
        .then(media => res.json(media))
        .catch(err => res.status(400).json('Error: ' + err));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
