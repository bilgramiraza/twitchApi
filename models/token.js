const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');

const tokenSchema = new Schema({
  tokenLookup: { type:String, default:'appAccessToken' },
  appAccessToken: { type:String, required:true },
  expirationDate: { type:Date, required:true },
});

tokenSchema.pre('findOneAndUpdate', function(next) {
  const update = this?.getUpdate();
  if(update?.expirationDate){
    update.expirationDate= dayjs().add(update.expirationDate,'second').toDate();
  }
  next();
});

module.exports = mongoose.model('token', tokenSchema);
