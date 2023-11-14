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

module.exports = {
  formatApiData,
};
