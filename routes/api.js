const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();
const Stream = require('../models/stream');
const dayjs = require('dayjs');

function formatData(streamData, userLogin){
  let extractedData;
  if(typeof streamData === "undefined"){
    extractedData = {
      userName: userLogin,
      isLive: false,
    };
  }else{
    const uncleanData = streamData.data.data[0];
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
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
    return response.data.access_token;
    
  }catch(err){
    res.status(500).send(err);
  }
}

async function getNewStreamData(userLogin, getAppAccessToken){
  try{
    const appAccessToken = getAppAccessToken();
    const streamData= await axios.get(`https://api.twitch.tv/helix/streams?user_login=${userLogin}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${appAccessToken}`
      }
    });
  }catch(err){
    res.status(500).send(err);
  }
}

async function getStreamerInfo(userLogin) {
  const extractedData = formatData(streamData, userLogin);
  return extractedData;
}/*Format the shape of the returned data as per the DB*/
    /* Is the 'thumbnailUrl' auto generated? Yes*/

router.use('/:streamerName', async (req, res)=>{
  const streamerName = req.params.streamerName;
  try{
    const foundStream = await Stream.findOne({ userName:streamerName }).exec();
    if(!foundStream || (dayjs().diff(dayjs(foundStream?.updatedAt),'minute') >=5)){
      const newStreamData = await getStreamerInfo(streamerName); 
      const updatedData = await Stream.findOneAndUpdate({ userName:streamerName }, newStreamData, { upsert:true, new:true});
      return res.status(200).json({ updatedData });
    }else{
      return res.status(200).json({ foundStream });
    }
  }catch(err){
    return res.status(500).send(err);
  }
});

module.exports = router;
