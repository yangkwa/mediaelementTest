function lxpInitialize(id) {
	//기본 색상 정의
	const defaultBkgColor = '#000000';

	//mediaelementjs object 설정
	const ps = {'ready':0, 'playing':1, 'stopped':2, 'paused':3};
	let playStatus = ps.ready;

	document.addEventListener('DOMContentLoaded', function () {

		mejs.i18n.language('ko');
	
		var mediaElements = document.querySelectorAll('video, audio');
	
		for (var i = 0; i < mediaElements.length; i++) {
			new MediaElementPlayer(mediaElements[i], {
				stretching: 'auto',
				pluginPath: 'lxplayer',
				success: function (media) {

					lxpData = [];
					lxpCurrentTime = 0;

					media.addEventListener('loadedmetadata', function (e) {

						lxpDuration = media.duration;

						for (var i = 0; i < lxpDuration; i++) {
							lxpData.push({hitCount : 0});
						}

						var src = media.originalNode.getAttribute('src').replace('&amp;', '&');
						if (src !== null && src !== undefined) {
							console.log('Source : ' + src);
							console.log('Renderer : ' + media.renderername);
							
						}
					});

					media.addEventListener('timeupdate', function (e) {
						var currentTime = parseInt(media.currentTime); 
						if (typeof lxpCurrentTime != 'undefined') {
							if (currentTime == 0)
								lxpData[0].hitCount++;

							if (lxpCurrentTime != currentTime) {
								lxpCurrentTime = currentTime;
								lxpData[lxpCurrentTime].hitCount++;
								console.log('currentTime : ' + lxpCurrentTime);
							}						
						}
					});
	
					media.addEventListener('error', function (e) {
						alert('Error : ' + e.message);
					});
				}
			});
		} 
	});
};

function lxpGetProgress(type, accumulated) {
	var hitCount = 0, progress = 0;

	lxpData.forEach(element => {
		if (element.hitCount > 0) {
			accumulated == true ? hitCount += element.hitCount : hitCount++;
		}
	});

	if (type == 'time') {
		progress = hitCount;
	}
	else if (type == 'rate') {
		lxpData.length > 0 ? progress = (hitCount / lxpData.length).toFixed(2) : progress = 0;;
	}

	return progress;
}

