const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  tokenLookup: { type:String, default:'appAccessToken' },
  appAccessToken: { type:String, required:true },
  expirationDate: { type:Date, required:true },
});

module.exports = mongoose.model('token', tokenSchema);
