const { getStreamInfo } = require('../utils/streamData');

const streamInfoRoute= async (req, res)=>{
  const streamerName = req.params.streamerName;
  try{
    const streamData = await getStreamInfo(streamerName);
    return res.status(200).json( streamData );
  }catch(err){
    console.log(err);
    return res.status(500).json({ err });
  }
}

module.exports = {
  streamInfoRoute,
};

