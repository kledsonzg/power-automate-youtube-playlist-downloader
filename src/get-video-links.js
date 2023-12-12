function ExecuteScript()
{
    let height = 0;
    while(height != document.documentElement.scrollHeight)
    {
        height = document.documentElement.scrollHeight;
        document.documentElement.scrollTo(0, height);
    }
    
    const linkElements = Array.from(document.getElementsByTagName('a') );
    let videoLinks = '';

    for(let i = 0; i < linkElements.length; i++)
    {
        let element = linkElements[i];

        if(element.href.includes('/watch?v=') == false || element.id != 'video-title')
            continue;

        let link =  element.href.substring(0, element.href.indexOf('&list=') );
        if(videoLinks.includes(link) )
            continue;

        videoLinks += link + '\n';
    }

    videoLinks = videoLinks.substring(0, videoLinks.lastIndexOf('\n') );

    return videoLinks;
}