const { default:axios } = require('axios');
const Stream = require('../models/stream');
const dayjs = require('dayjs');
const { getAppAccessToken } = require('./appAccessToken');
const { formatApiData } = require('./formatApiData');

async function fetchStreamData(streamerName, retry=false){
  try{
    const appAccessToken = await getAppAccessToken(retry);
    const streamData= await axios.get(`https://api.twitch.tv/helix/streams?user_login=${streamerName}`, {
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${appAccessToken}`
      }
    });
    return formatApiData(streamData, streamerName);
  }catch(err){
    switch(err.response.status){
      case 400: throw { status:400, message:'Invalid Streamer Username' };
      case 401:
        if(!retry){
          const streamData = await fetchStreamData(streamerName, true);

          return formatApiData(streamData, streamerName);
        }else{
          throw { status:500, message: 'Unexpected Server Error'};
        }
      case 429: throw { status:429, message:'Too Many Requests' };
      default: throw { status:500, message:'Unexpected Error' };
    }
  }
}

async function getStreamInfo(streamerName) {
  try{
    const foundStream = await Stream.findOne(
      { userName:streamerName },
      'userName isLive streamTitle game viewerCount startedAt latestThumbnail tags updatedAt -_id')
      .lean()
      .exec();
    if(!foundStream || (dayjs().diff(dayjs(foundStream.updatedAt),'minute') >=5)){
      const newStreamData = await fetchStreamData(streamerName);
      const updatedData = await Stream.findOneAndUpdate(
        { userName:streamerName }, 
        newStreamData, 
        { upsert:true, new:true});
      return {
        userName: updatedData.userName,
        isLive: updatedData.isLive,
        streamTitle: updatedData.streamTitle,
        game: updatedData.game,
        viewerCount: updatedData.viewerCount,
        startedAt: updatedData.startedAt,
        latestThumbnail: updatedData.latestThumbnail,
        tags: updatedData.tags,
        updatedAt: updatedData.updatedAt,
      };
    }else{
      return foundStream;
    }
  }catch(err){
    throw err;
  }
}

module.exports = {
  getStreamInfo,
};
