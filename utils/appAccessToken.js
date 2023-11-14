const { default:axios } = require('axios');
const Token = require('../models/token');
const dayjs = require('dayjs');

async function fetchNewAppAccessToken(){
  try{
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`);
    return response.data;
  }catch(err){
    switch(err.response.status){
      case 429: throw { status:429, message:'Too Many Requests' };
      default: throw { status:500, message:'Unexpected Server Error' };
    }
  }
}

async function getAppAccessToken(force = false){
  try{
    const foundToken= await Token.findOne({ tokenLookup:'appAccessToken' }).lean().exec();
    if(!foundToken || dayjs(foundToken.expirationDate).diff(dayjs(),'days')<10 || force){
      const data = await fetchNewAppAccessToken();
      const newToken = await Token.findOneAndUpdate(
        { tokenLookup:'appAccessToken' }, 
        { appAccessToken:data.access_token, 
          expirationDate:data.expires_in}, 
        { upsert: true, new:true});

      return newToken.appAccessToken;
    }else{
      return foundToken.appAccessToken;
    }
  }catch(err){
    throw err;
  }
}

module.exports = {
  getAppAccessToken,
};
