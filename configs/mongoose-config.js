const mongoose = require('mongoose');
require('dotenv').config();

const mongodbURI = process.env.MONGODB_URI;
mongoose.connect(mongodbURI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
