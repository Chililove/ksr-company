const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { GridFSBucket } = require('mongodb');

const fs = require('fs');

let gridfsBucket;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));  // Static folder for media files*/
app.use((req, res, next) => {
    if (conn.readyState !== 1) {
        return res.status(500).json({
            error: 'Database connection not ready'
        });
    }
    next();

});
// Connect to MongoDB
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');

        const conn = mongoose.connection;
        // Log the connection state
        console.log('Connection state:', conn.readyState); // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        // Check if the connection is already open
        if (conn.readyState === 1) {
            console.log('Connection already open. Initializing GridFSBucket directly...');
            gridfsBucket = new GridFSBucket(conn.db, { bucketName: 'upload' });
            console.log('GridFSBucket initialized');
        } else {
            conn.once('open', () => {
                console.log('Connection opened. Initializing GridFSBucket...');

                gridfsBucket = new GridFSBucket(conn.db, { bucketName: 'upload' });
                console.log('GridFSBucket initialized');
            });
        }
    })
    .catch(err => console.error('MongoDB connection error', err));

// Schema and Model for Media
const mediaSchema = new mongoose.Schema({
    title: String,
    description: String,
    mediaType: { type: String, enum: ['image', 'video'] },
    /*filePath: String,*/
    fileId: mongoose.Schema.Types.ObjectId,
    uploadedAt: { type: Date, default: Date.now },
    boxIndex: Number,
});

const Media = mongoose.model('Media', mediaSchema);

// Multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024  // Set a maximum file size limit (e.g., 50MB)
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            console.error('Invalid file type!', {
                originalname: file.originalname,
                mimetype: file.mimetype,
            });
            cb(new Error('Invalid file type! Only images and videos are allowed.'));
        }
    }
});


// API Routes
app.post('/upload', upload.single('media'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype,
        });

        uploadStream.end(req.file.buffer);
        uploadStream.on('finish', async (file) => {

            try {
                const newMedia = new Media({
                    title: req.body.title || 'Untitled',
                    description: req.body.description || '',
                    mediaType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
                    fileId: file._id,
                    boxIndex: req.body.boxIndex,
                });

                await newMedia.save();
                res.status(200).json({
                    message: 'File uploaded succesfully!',
                    fileId: file._id,
                    mediaType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({
                    error: 'Error saving media to the database'
                });
            }
        });

        /*  newMedia.save()
              .then((savedMedia) => res.status(200).json({
                  message: 'File uploaded successfully!',
                  fileId: savedMedia.fileId,
                  mediaType: savedMedia.mediaType
              }))
              .catch(err => {
                  console.error(err);
                  res.status(500).json({ error: 'Error saving media to the database' });
              });
*/
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during file upload' });
    }
});

app.get('/media', (req, res) => {
    Media.find()
        .then(media => {
            console.log(media);  // Log the media items being returned
            res.json(media);
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

app.get('/file/:id', (req, res) => {
    gridfsBucket.find({ _id: new mongoose.Types.ObjectId(req.params.id) }, toArray((err, files) => {
        if (err || !files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        const downloadStream = gridfsBucket.openUploadStream(files[0]._id);
        downloadStream.pipe(res);
    }))
});

app.post('/test-upload', upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', (file) => {
        res.status(200).json({
            message: 'File uploaded successfully!',
            fileId: file._id,
        });
    });

    uploadStream.on('error', (err) => {
        console.error('GridFS upload error:', err);
        res.status(500).json({ error: 'Error uploading file' });
    });
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
