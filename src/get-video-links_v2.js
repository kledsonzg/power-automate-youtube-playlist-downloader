function ExecuteScript()
{
    let playlistVideoCount = parseInt(ytInitialData.header.playlistHeaderRenderer.briefStats[0].runs[0].text);
    let ytData = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    window.playlistMissingVideosCount = playlistVideoCount - ytData.length;
    
    let videoLinks = '';

    ytData.forEach((e) =>
    {
        if(!(videoLinks === '') )
            videoLinks += '\n';

        videoLinks += `https://www.youtube.com/watch?v=${e.playlistVideoRenderer.videoId}`;
    } );

    return videoLinks;
}