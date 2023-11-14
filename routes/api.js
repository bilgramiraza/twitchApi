const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();
const Stream = require('../models/stream');
const Token = require('../models/token');
const dayjs = require('dayjs');

function formatApiData(streamData, userLogin){
  const uncleanData = streamData.data.data[0];
  let extractedData;
  if(typeof uncleanData === "undefined"){
    extractedData = {
      userName: userLogin,
      isLive: false,
      streamTitle: null,
      game: null,
      viewerCount: null,
      startedAt: null,
      latestThumbnail: null,
      tags: null,
    };
  }else{
    extractedData = {
      userName: uncleanData.user_name,
      isLive: true,
      streamTitle: uncleanData.title,
      game: uncleanData.game_name,
      viewerCount: uncleanData.viewer_count,
      startedAt: uncleanData.started_at,
      latestThumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${uncleanData.user_login}-1920x1080.jpg`,
      tags: uncleanData.tags,
    };
  }
  return extractedData;
}

async function getAppAccessToken(){
  try{
    const foundToken= await Token.findOne({ tokenLookup:'appAccessToken' }).exec();
    if(!foundToken || dayjs(foundToken.expirationDate).diff(dayjs(),'days'<10)){
      const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`);
      const newToken = await Token.findOneAndUpdate(
        { tokenLookup:'appAccessToken' }, 
        { appAccessToken:response.data.access_token, 
          expirationDate:response.data.expires_in}, 
        { upsert: true, new:true});

      return newToken.appAccessToken;
    }else{
      return foundToken.appAccessToken;
    }
  }catch(err){
    throw new Error(err);
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
      const appAccessToken = await getAppAccessToken();
      const streamData= await axios.get(`https://api.twitch.tv/helix/streams?user_login=${streamerName}`, {
        headers: {
          'Client-ID': process.env.CLIENT_ID,
          'Authorization': `Bearer ${appAccessToken}`
        }
      });
      const newStreamData = formatApiData(streamData, streamerName);
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
    throw new Error(err);
  }
}

router.use('/:streamerName', async (req, res)=>{
  const streamerName = req.params.streamerName;
  try{
    const streamData = await getStreamInfo(streamerName);
    return res.status(200).json({ streamData });
  }catch(err){
    return res.status(500).json({ err });
  }
});

module.exports = router;
