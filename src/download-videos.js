function ExecuteScript() {
    let startProccess = function() {
        console.log('starting proccess...');
        let playlistVideoCount = parseInt(ytInitialData.header.playlistHeaderRenderer.briefStats[0].runs[0].text);
        let ytData = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
        window.playlistMissingVideosCount = playlistVideoCount - ytData.length;

        let videoLinks = [];
        let downloadQueue = {
            requests : [],
            videos : []
        };
        let running = true;
        let count = 0;

        ytData.forEach((e) => {
            videoLinks.push(`https://www.youtube.com/watch?v=${e.playlistVideoRenderer.videoId}`);
        });
        let maxLength = videoLinks.length;

        let getDownloadVideoLinkStatus = function (body, video) {
            request = new XMLHttpRequest();
            request.open('POST', 'https://savemp3.net/wp-json/api/v1/status');
            request.setRequestHeader('Content-Type', 'application/json');
            request.addEventListener('loadend', () => { OnStatusRequestUpdate(request, video); });
            request.send(body);
        };
        let OnStatusRequestUpdate = function (request, video) {
            if (!(request.status === 200)) {
                console.log('Falha ao obter o status do download do vídeo: ' + {link: video, res: request} );
                return;
            }

            let result = JSON.parse(request.response);
            if (result.download === undefined) {
                setTimeout(() => {
                    getDownloadVideoLinkStatus(JSON.stringify({
                        taskId: result.taskId
                    }), video)
                }, 1000);
            }
            else {
                let element = document.createElement('a');
                element.href = result.download;
                element.download = result.title;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);

                downloadQueue.requests.shift();
                downloadQueue.videos.shift();
                count++;
                console.log(`downloading: ${video}`);
                console.log(`Downloads: [${count} de ${maxLength}].`);
                if(count === maxLength)
                    running = false;

                getLinkForDownload();
                //element.remove();
            }
        };
        let OnDownloadRequestResponse = function (request, video) {
            if (!(request.status === 200)) {
                console.log('Falha ao obter o taskId para o vídeo: ' + video);
                return;
            }

            downloadQueue.requests.push(request);
            downloadQueue.videos.push(video);
            console.log('download queue modified. new length: ' + downloadQueue.requests.length);
        }
        let OnVideoInfoReceived = function (request, video) {
            console.log('video info received: ' + video);
            console.log(request);
            if (!(request.status === 200)) {
                console.log('Falha ao obter as informações do vídeo: ' + video);

                return;
            }

            let videoInfo = JSON.parse(request.response);
            let videoLength = parseInt(videoInfo.lengthSeconds);
            let videoHash = '';

            try{
                for(let i = 0; i < videoInfo.tasks.length; i++)
                {
                    let container = videoInfo.tasks[i];
                    if(!(container.bitrate === 128) )
                        continue;

                    videoHash = container.hash;
                    break;
                }
            } 
            catch{}
            finally{
                if (videoHash === '') {
                    console.log('Falha ao obter as informações do vídeo: ' + video);
                    if(videoInfo.error === true){
                        console.log('video error: ' + videoInfo.errorCode + '\n' + videoInfo.errorMessage);
                    }
                    maxLength--;
                    return;
                }
            }    

            request = new XMLHttpRequest();
            request.open('POST', 'https://savemp3.net/wp-json/api/v1/download');
            request.setRequestHeader('Content-Type', 'application/json');
            request.addEventListener('loadend', () => { OnDownloadRequestResponse(request, video); });
            request.send(JSON.stringify({
                from: null,
                to: null,
                length: videoLength,
                hash: videoHash
            }));
        };

        let currentRequestInQueue = null;
        let getLinkForDownload = function() {
            if(currentRequestInQueue != downloadQueue.requests[0] || currentRequestInQueue === null && downloadQueue.requests.length > 0){
                if(running !== true)
                {
                    console.log(`Todos os downloads foram processados! [${count} de ${maxLength}].`);
                    return;
                }

                currentRequestInQueue = downloadQueue.requests[0];
                setTimeout(() => {
                    console.log('Iniciando requisições de status de conversão do video: ' + downloadQueue.videos[0] );
                    getDownloadVideoLinkStatus(currentRequestInQueue.response, downloadQueue.videos[0] );
                }, 1000);    
            }   
            else if(running === true)
                setTimeout(() => { getLinkForDownload(); }, 1000);
            else return;
        }
        let startDownloadVideos = function () {
            for (let i = 0; i < videoLinks.length; i++) {
                console.log('Iniciando processo com: ' + videoLinks[i]);
                let request = new XMLHttpRequest();
                request.open('POST', 'https://savemp3.net/wp-json/api/v1/get_video_info');
                request.setRequestHeader('Content-Type', 'application/json');
                request.addEventListener('loadend', () => { OnVideoInfoReceived(request, videoLinks[i]); });
                request.send(JSON.stringify({
                    url: videoLinks[i]
                }));
            }
        }

        getLinkForDownload();
        startDownloadVideos();
    }

    let scrollToEnd = function(){
        let lastYPositions = [];
        let action = function(){
            window.scrollTo(0, 10000 + window.scrollY);
            lastYPositions.push(window.scrollY);
        }
        let timerId = setInterval(() => {
            action();
            if(lastYPositions.length > 10)
            {
                lastYPositions.shift();
                let canStopTimer = true;
                for(let i = 0; i < lastYPositions.length; i++)
                {
                    let toCompare = [lastYPositions[i], lastYPositions[++i] ];

                    if(toCompare[0] === toCompare[1] )
                        continue;

                    canStopTimer = false;
                    break;
                }
                if(canStopTimer === true){
                    console.log('Fim da rolagem.');
                    clearInterval(timerId);
                    startProccess();
                }
                    
            }
        }, 500);
    }

    scrollToEnd();
}