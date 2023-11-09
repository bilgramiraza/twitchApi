const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const streamSchema = new Schema({
  userName: { type:String, required:true },
  isLive: { type:Boolean, required:true },
  streamTitle: { type:String },
  game: { type:String },
  viewerCount: { type: Number },
  startedAt: { type:Date },
  latestThumbnail: { type:String },
  tags: [String],
},{ timestamps: true });

module.exports = mongoose.model('stream', streamSchema);
