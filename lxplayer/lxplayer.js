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
				stretching: stretching,
				pluginPath: '../lxplayer/dist',
				success: function (media) {
					media.addEventListener('loadedmetadata', function () {
						var src = media.originalNode.getAttribute('src').replace('&amp;', '&');
						if (src !== null && src !== undefined) {
							console.log('Source : ' + src);
							console.log('Renderer : ' + media.renderername);
							
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

