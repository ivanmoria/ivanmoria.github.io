

var players = {};

function onYouTubeIframeAPIReady() {
    document.querySelectorAll('.buttoon-container').forEach(function(container, index) {
        var playerId = 'player' + index;
        var videoId = container.querySelector('.uia-btn').getAttribute('data-video-id');
        var playerElement = document.createElement('div'); // Cria um elemento div para o player
        playerElement.id = playerId;
        container.querySelector('.miniatura').appendChild(playerElement); // Adiciona a div ao container da miniatura

        players[playerId] = new YT.Player(playerId, {
            height: '200',
            width: '460',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady
            }
        });
    });
}

function onPlayerReady(event) {
    var player = event.target;
    var container = player.getIframe().closest('.buttoon-container');
    var button = container.querySelector('.uia-btn');
    var miniatura = container.querySelector('.miniatura');
    

    function playVideo() {
        player.playVideo();
    }

    function pauseVideo() {
        player.pauseVideo();
    }

    button.addEventListener('mouseenter', playVideo);
    button.addEventListener('mouseleave', pauseVideo);
    miniatura.addEventListener('mouseenter', playVideo);
    miniatura.addEventListener('mouseleave', pauseVideo);
    
}

function showPreview(event, previewId) {
    var preview = document.getElementById(previewId);
    if (preview) {
        preview.style.left = (event.pageX + 10) + 'px'; // Ajuste a posição conforme necessário
        preview.style.top = (event.pageY + 10) + 'px'; // Ajuste a posição conforme necessário
        preview.style.display = 'block';
    }
}

function hidePreview() {
    var previews = document.querySelectorAll('.pdf-preview, .video-preview');
    previews.forEach(preview => preview.style.display = 'none');
}

