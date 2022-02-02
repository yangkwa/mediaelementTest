//각종 설정값 세팅
//제일 처음 실행될때 한번 만 불려진다.
function initialize(contentsURL, checkBrower) {
	//$('head').append('<script src=\'' + contentsDir + '/contents.json' + '\'><\/script>');

	if (checkBrower && bowser.name == 'Internet Explorer' && bowser.version <= 8)
		alert('Internet Explorer의 버전이 낮습니다. 최신 버전으로 업그레이드 하세요.');

	if (document.addEventListener)
	{
		document.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
		document.addEventListener('mozfullscreenchange', onFullScreenChange, false);
		document.addEventListener('fullscreenchange', onFullScreenChange, false);
		document.addEventListener('MSFullscreenChange', onFullScreenChange, false);
	}

	//기본 색상 정의
	defaultBkgColor = '#000000';
	loadingColor = '#6AC7F3';

	//playingGrad 정보 설정
	playingGrad_xPos = 0;

	onBookmarking = false;
	boomarkingBegin_xPos = -1, boomarkingEnd_xPos = -1;
	annotationButtonWidth = 20, annotationButtonHeight = 20;

	//jquery media(video) object 설정
	ps = {'ready':0, 'playing':1, 'stopped':2, 'paused':3};
	playStatus = ps.ready;

	ls = {'default':0, 'pageFullScreen':1, 'pageMediaSwitch':2, 'paused':3};
	layoutState = ls.default;

	player = jwplayer("media");
	player.setup({
		file: contents.mediaURL,
		image: contents.posterURL,
		mediaid: contents.id,
		playbackRateControls: true,
		tracks: [{
            file: contents.vttURL,
            kind: "thumbnails"
        }]
	});
/*
	player.addButton(
		"LPlayer/Resource/SwitchBtn.svg",
		"화면전환",
		function() {
			switch (layoutState) {
				case ls.default:
//					resizeMediaControl(slide_xPos, slide_yPos, initSlideControlWidth, initSlideControlHeight);
					var slidePos = $('#slide').offset();
					$('#media').animate({'top': slidePos.top + 'px', 'left': slidePos.left + 'px'}, 200, function(){
						//end of animation.. if you want to add some code here
					});
					//$('#media').hide();
					//resizeSlideControl(0, 0, $('#media').width(), $('#media').height(), 30, 30);
					layoutState = ls.pageMediaSwitch;
					break
				default:
//					resizeMediaControl(0, 0, initMediaControlWidth, initMediaControlHeight);
					resizeSlideControl(initMediaControlWidth + 2, 0, mainWidth - initMediaControlWidth - 2, mainHeight * 0.4, 20, 20);
					layoutState = ls.default;
			}
		},
		"lp_switch_view"
	);
*/
	player.addButton(
		"LPlayer/Resource/BookmarkListBtn.svg",
		"북마크 모아보기",
		function() {
			$('#comment').hide();
			$('#bookmark').show();
		},
		"lp_bookmark_list"
	);

	player.addButton(
		"LPlayer/Resource/BookmarkBtn.svg",
		"북마킹",
		function() {
			var offsetY = annotationButtonHeight / 2;

			var grad_xPos = player.getCurrentTime() * gradSpace;
			annotation_xPos = grad_xPos - (annotationButtonWidth / 2);

			if (onBookmarking) {
				onBookmarking = false;
				bookmarkEndAnnotation = timelineRaphael.image("LPlayer/Resource/AM_HotSpot.png", annotation_xPos, timelineAND_Mine_yPos + offsetY, annotationButtonWidth, annotationButtonHeight);
			} else {
				onBookmarking = true;
				boomarkingBegin_xPos = grad_xPos;
				bookmarkBeginAnnotation = timelineRaphael.image("LPlayer/Resource/AM_HotSpot.png", annotation_xPos, timelineAND_Mine_yPos + offsetY, annotationButtonWidth, annotationButtonHeight);
				bookmarkRange = timelineRaphael.rect(boomarkingBegin_xPos, timelineAND_Mine_yPos + timelineANDHeight - 4, 0, 4).attr({stroke:"#FFFFFF", fill:"#FFFFFF", "opacity": 1.0});
			}
		},
		"lp_bookmarking"
	);

	player.addButton(
		"LPlayer/Resource/MemoBtn.svg",
		"코멘트",
		function() {
//		  window.location.href = player.getPlaylistItem()['file'];
		},
		"lp_comment"
	);

	player.on('ready', function(e) {
	});

	player.on('time', function(e) {
		console.log(timeToString(e.position) + ": Playing");
		setPlayingGrad(e.position);

		for (var index in contents.slide) {
			if (e.position > contents.slide[index].beginTime && e.position < contents.slide[index].endTime) {
				if (currentSlideIndex != contents.slide[index].index) {
					slideControl.pageControl.attr({"src": contents.slideURL + (contents.slide[index].index + 1) + '.jpg'});
					sectionText.attr({"text": '[' + contents.slide[index].section + ']'});
					pageText.attr({"text": (contents.slide[index].index + 1) + ' / ' + contents.totalSlide});
					currentSlideIndex = contents.slide[index].index;

					console.log(timeToString(player.getPosition()) + ": Goto Slide " + "[" + (currentSlideIndex + 1) + "]");
				}
			}
		}
	});

	player.on('pause', function(e) {
		console.log(timeToString(player.getPosition()) + ": Paused");
	});

	player.on('complete', function(e) {
		console.log(timeToString(player.getPosition()) + ": Completed");
	});

	player.on('playbackRateChanged', function(e) {
		console.log(timeToString(e.position) + ": playbackRateChanged" + "[" + e.playbackRate + "]");
	});

	player.on('seeked', function(e) {
		console.log(timeToString(player.getPosition()) + ": seeked");
	});

	player.on('volume', function(e) {
		console.log(timeToString(player.getPosition()) + ": Volume Changed" + "[" + e.volume + "]");
	});

	player.on('mute', function(e) {
		console.log(timeToString(player.getPosition()) + ": Muted" + "[" + e.mute + "]");
	});

	player.on('fullscreen', function(e) {
		console.log(timeToString(player.getPosition()) + ": fullscreen" + "[" + e.fullscreen + "]");
	});

	//slide 정보 설정
	currentSlideIndex = 0;
	defaultSlideWidth = 1024, defaultSlideHeight = 576;
	slideScale = defaultSlideHeight / defaultSlideWidth;;
	initSlideWidth = $('#slide').width();
	initSlideHeight = $('#slide').width() * slideScale;
	slide_xPos = 0;
	slide_yPos = ($('#slide').height() - initSlideHeight) / 2;

	sectionTextHeight = 30;
	sectionText_xPos = 10;
	sectionText_yPos = 10;

	pageTextWidth = 60;
	pageTextHeight = 30;
	pageText_xPos = $('#slide').width() - pageTextWidth;
	pageText_yPos = $('#slide').height() - pageTextHeight;

	slideButtonWidth = 20, slideButtonHeight = 20;
	slideButton_yPos = $('#slide').height() - slideButtonHeight - 5;
	previousSlideButton_xPos = 10, nextSlideButton_xPos = previousSlideButton_xPos + slideButtonWidth + 10;
	scriptSlideButton_xPos = nextSlideButton_xPos + slideButtonWidth + 10, fullscreenSlideButton_xPos = scriptSlideButton_xPos + slideButtonWidth + 10;

	slideRaphael = Raphael("slide", $('#slide').width(), $('#slide').height());

	slideControl = {};
	slideControl.bkgControl = slideRaphael.rect(0.00, 0.00, $('#slide').width(), $('#slide').height()).attr({stroke:defaultBkgColor, fill:defaultBkgColor});
	slideControl.pageControl = slideRaphael.image(contents.slideURL + "1.jpg", slide_xPos, slide_yPos, initSlideWidth, initSlideHeight);
	slideControl.sectionText = slideRaphael.text(sectionText_xPos, sectionText_yPos + (sectionTextHeight / 2), '[' + contents.slide[0].section + ']').attr({"font-family": "gothic", "font-size": 16.00, stroke: "#ffffff", "stroke-width": 0.1, fill: "#ffffff", "text-anchor": "start"});
	slideControl.pageText = slideRaphael.text(pageText_xPos, pageText_yPos + (pageTextHeight / 2), '1 / ' + contents.totalSlide).attr({"font-family": "Geogia", "font-size": 16.00, stroke: "#ffffff", "stroke-width": 0.1, fill: "#ffffff", "text-anchor": "start"});

	slideControl.previousSlideButton = slideRaphael.image("LPlayer/Resource/PreviousSlideBtn.png", previousSlideButton_xPos, slideButton_yPos, slideButtonWidth, slideButtonHeight).attr({"cursor":"pointer"});
	slideControl.previousSlideButton.click(function() {
		if (currentSlideIndex > 0) {
			updateSlide(currentSlideIndex - 1);
		}
	});

	slideControl.nextSlideButton = slideRaphael.image("LPlayer/Resource/NextSlideBtn.png", nextSlideButton_xPos, slideButton_yPos, slideButtonWidth, slideButtonHeight).attr({"cursor":"pointer"});
	slideControl.nextSlideButton.click(function() {
		if (currentSlideIndex < contents.totalSlide - 1) {
			updateSlide(currentSlideIndex + 1);
		}
	});

	slideControl.scriptSlideButton = slideRaphael.image("LPlayer/Resource/ScriptSlideBtn.png", scriptSlideButton_xPos, slideButton_yPos, slideButtonWidth, slideButtonHeight).attr({"cursor":"pointer"});
	slideControl.scriptSlideButton.click(function() {
		player.hide();
	});

	slideControl.fullscreenSlideButton = slideRaphael.image("LPlayer/Resource/FullscreenSlideBtn.png", fullscreenSlideButton_xPos, slideButton_yPos, slideButtonWidth, slideButtonHeight).attr({"cursor":"pointer"});
	slideControl.fullscreenSlideButton.click(function() {
		fullscreenSlideButtonClicked = true;
		switch (layoutState) {
			case ls.default:
				fullScreenApi.requestFullScreen(document.getElementById('slide'));
				break
			default:
				fullScreenApi.cancelFullScreen(document.getElementById('slide'));
		}
	});

	gradSHeight = 2, gradMHeight = 4, gradLHeight = 60;

	timelineFilterHeight = 35;
	timelineCVBHeight = 20;
	timelineOVBHeight = 20;
	timelineANDHeight = 35;

	timelineFilter_yPos = 0;
	timelineCVB_yPos = timelineFilterHeight;
	timelineOVB_yPos = timelineCVB_yPos + timelineCVBHeight;
	timelineAND_Instructor_yPos = timelineOVB_yPos + timelineOVBHeight;
	timelineAND_Learner_yPos = timelineAND_Instructor_yPos + timelineANDHeight;
	timelineAND_Graduate_yPos = timelineAND_Learner_yPos + timelineANDHeight;
	timelineAND_Mine_yPos = timelineAND_Graduate_yPos + timelineANDHeight;

	timelineHeight = timelineFilterHeight + timelineCVBHeight + timelineOVBHeight + timelineANDHeight * 4;

	drawTimeLine(3);

	drawAnnonation();

	playingGrad = timelineRaphael.set();
	playingGrad.push(timelineRaphael.path("M" + playingGrad_xPos + " " + timelineCVB_yPos + "L" + playingGrad_xPos + " " +  timelineHeight).attr({stroke: "#980000", "stroke-width": 2, fill: "#980000"}));
};

function drawTimeLine(gs) {
	gradSpace = gs;
	timelineWidth = contents.mediaDuration * gradSpace;

	cvbData = [];

	for (var i = 0; i < contents.mediaDuration; i++) {
		cvbData.push({hitCount : 0});
	}

	if (timelineWidth < $('#timeline').width()) {
		gradSpace = $('#timeline').width() / contents.mediaDuration;
		timelineWidth = $('#timeline').width();
	}

	$('#timeline').css('height', timelineHeight);
	timelineRaphael = Raphael("timeline", timelineWidth, timelineHeight);
//	timelineRaphael.rect(0.00, 0, timelineWidth, timelineAND_Instructor_yPos).attr({stroke:"#FFFFFF", fill:"#FFFFFF"});
//	timelineRaphael.rect(0.00, timelineAND_Instructor_yPos, timelineWidth, timelineHeight - timelineAND_Instructor_yPos).attr({stroke:defaultBkgColor, fill:defaultBkgColor});
	timelineRect = timelineRaphael.rect(0.00, 0.00, timelineWidth, timelineHeight).attr({stroke:defaultBkgColor, fill:defaultBkgColor});
	timelineRect.click(function(e) {
		player.seek(e.offsetX / gradSpace);
	});

/*	$("document").keypress(function(event) {
		if ( event.which == 13 ) {
			player.stop();
		}
	  });*/

	timelineRaphael.path("M0" + " " + timelineCVB_yPos  + "L" + timelineWidth + " " +  timelineCVB_yPos).attr({stroke: "#FFFFFF", "stroke-width": 1.0, fill: "#FFFFFF"});
	timelineRaphael.path("M0" + " " + timelineOVB_yPos  + "L" + timelineWidth + " " +  timelineOVB_yPos).attr({stroke: "#FFFFFF", "stroke-width": 1.0, fill: "#FFFFFF"});
	timelineRaphael.path("M0" + " " + timelineAND_Instructor_yPos  + "L" + timelineWidth + " " +  timelineAND_Instructor_yPos).attr({stroke: "#FFFFFF", "stroke-width": 1.0, fill: "#FFFFFF"});

	filterText = timelineRaphael.text(10, timelineFilterHeight / 2, "FILTER : ").attr({"font-family": "gulim", "font-size": 12.00, stroke: "#ffffff", "stroke-width": 0.1, fill: "#ffffff", "text-anchor": "start"});

	//필터 버튼
	filterButtonWidth = 46, filterButtonHeight = 20;
	filterButton_yPos = (timelineFilterHeight - filterButtonHeight) / 2;

	AT_HotSpotButton_xPos = 20 + filterText.getBBox().width;
	AT_LinkButton_xPos = AT_HotSpotButton_xPos + filterButtonWidth + 10;
	AT_CommentButton_xPos = AT_LinkButton_xPos + filterButtonWidth + 10;
	lockButton_xPos = AT_CommentButton_xPos + filterButtonWidth + 15;
	unlockButton_xPos = lockButton_xPos + filterButtonWidth + 10;
	VB_InstructorButton_xPos = unlockButton_xPos + filterButtonWidth + 15;
	VB_LearnerButton_xPos = VB_InstructorButton_xPos + filterButtonWidth + 10;
	VB_GraduateButton_xPos = VB_LearnerButton_xPos + filterButtonWidth + 10;
//	VB_MineButton_xPos = VB_GraduateButton_xPos + filterButtonWidth + 10;

	AT_HotSpotButtonChecked = true;
	AT_HotSpotButton = timelineRaphael.image("LPlayer/Resource/AF_HotSpot_CButton.png", AT_HotSpotButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	AT_HotSpotButton.click(function() {
		AT_HotSpotButtonChecked = !AT_HotSpotButtonChecked;
		AT_HotSpotButtonChecked ? AT_HotSpotButton.attr({"src": "LPlayer/Resource/AF_HotSpot_CButton.png"}) : AT_HotSpotButton.attr({"src": "LPlayer/Resource/AF_HotSpot_NButton.png"});
		filtering_AT(AT.HotSpot, AT_HotSpotButtonChecked);
	});

	AT_LinkButtonChecked = true;
	AT_LinkButton = timelineRaphael.image("LPlayer/Resource/AF_Link_CButton.png", AT_LinkButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	AT_LinkButton.click(function() {
		AT_LinkButtonChecked = !AT_LinkButtonChecked;
		AT_LinkButtonChecked ? AT_LinkButton.attr({"src": "LPlayer/Resource/AF_Link_CButton.png"}) : AT_LinkButton.attr({"src": "LPlayer/Resource/AF_Link_NButton.png"});
		filtering_AT(AT.Link, AT_LinkButtonChecked);
	});

	AT_CommentButtonChecked = true;
	AT_CommentButton = timelineRaphael.image("LPlayer/Resource/AF_Comment_CButton.png", AT_CommentButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	AT_CommentButton.click(function() {
		AT_CommentButtonChecked = !AT_CommentButtonChecked;
		AT_CommentButtonChecked ? AT_CommentButton.attr({"src": "LPlayer/Resource/AF_Comment_CButton.png"}) : AT_CommentButton.attr({"src": "LPlayer/Resource/AF_Comment_NButton.png"});
		filtering_AT(AT.Comment, AT_CommentButtonChecked);
	});

	lockButtonChecked = true;
	lockButton = timelineRaphael.image("LPlayer/Resource/AF_Lock_CButton.png", lockButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	lockButton.click(function() {
		lockButtonChecked = !lockButtonChecked;
		lockButtonChecked ? lockButton.attr({"src": "LPlayer/Resource/AF_Lock_CButton.png"}) : lockButton.attr({"src": "LPlayer/Resource/AF_Lock_NButton.png"});
		filtering_LC(LC.Lock, lockButtonChecked);
	});

	unlockButtonChecked = true;
	unlockButton = timelineRaphael.image("LPlayer/Resource/AF_UnLock_CButton.png", unlockButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	unlockButton.click(function() {
		unlockButtonChecked = !unlockButtonChecked;
		unlockButtonChecked ? unlockButton.attr({"src": "LPlayer/Resource/AF_UnLock_CButton.png"}) : unlockButton.attr({"src": "LPlayer/Resource/AF_UnLock_NButton.png"});
		filtering_LC(LC.UnLock, unlockButtonChecked);
	});

	VB_InstructorButtonChecked = true;
	VB_InstructorButton = timelineRaphael.image("LPlayer/Resource/VF_Instructor_CButton.png", VB_InstructorButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	VB_InstructorButton.click(function() {
		VB_InstructorButtonChecked = !VB_InstructorButtonChecked;
		VB_InstructorButtonChecked ? VB_InstructorButton.attr({"src": "LPlayer/Resource/VF_Instructor_CButton.png"}) : VB_InstructorButton.attr({"src": "LPlayer/Resource/VF_Instructor_NButton.png"});
		filtering_VB(VB.Instructor, VB_InstructorButtonChecked);
	});

	VB_LearnerButtonChecked = true;
	VB_LearnerButton = timelineRaphael.image("LPlayer/Resource/VF_Learner_CButton.png", VB_LearnerButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	VB_LearnerButton.click(function() {
		VB_LearnerButtonChecked = !VB_LearnerButtonChecked;
		VB_LearnerButtonChecked ? VB_LearnerButton.attr({"src": "LPlayer/Resource/VF_Learner_CButton.png"}) : VB_LearnerButton.attr({"src": "LPlayer/Resource/VF_Learner_NButton.png"});
		filtering_VB(VB.Learner, VB_LearnerButtonChecked);
	});

	VB_GraduateButtonChecked = true;
	VB_GraduateButton = timelineRaphael.image("LPlayer/Resource/VF_Graduate_CButton.png", VB_GraduateButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	VB_GraduateButton.click(function() {
		VB_GraduateButtonChecked = !VB_GraduateButtonChecked;
		VB_GraduateButtonChecked ? VB_GraduateButton.attr({"src": "LPlayer/Resource/VF_Graduate_CButton.png"}) : VB_GraduateButton.attr({"src": "LPlayer/Resource/VF_Graduate_NButton.png"});
		filtering_VB(VB.Graduate, VB_GraduateButtonChecked);
	});

/*	VB_MineButtonChecked = true;
	VB_MineButton = timelineRaphael.image("LPlayer/Resource/VB_Mine_CButton.png", VB_MineButton_xPos, filterButton_yPos, filterButtonWidth, filterButtonHeight).attr({"cursor":"pointer"});
	VB_MineButton.click(function() {
		VB_MineButtonChecked = !VB_MineButtonChecked;
		VB_MineButtonChecked ? VB_MineButton.attr({"src": "LPlayer/Resource/VB_Mine_CButton.png"}) : VB_MineButton.attr({"src": "LPlayer/Resource/VB_Mine_NButton.png.png"});
	});
*/
	var gs = 0;
	for (var i = 0; i < timelineWidth; i += gradSpace) {
		if (gs == 10)	{
			timelineRaphael.path("M" + i + " " + timelineCVB_yPos  + "L" + i + " " +  (timelineCVB_yPos + gradMHeight)).attr({stroke: "#ffbb00", "stroke-width": 1.0, fill: "#ffbb00"});
//			timelineRaphael.text(i, timelineCVB_yPos + gradMHeight + 10, timeToString(i / gradSpace / 10, false)).attr({"font-family": "gulim", "font-size": 10.00, stroke: "#ffffff", "stroke-width": 0.1, fill: "#ffffff", "text-anchor": "middle"});
			gs = 1;
		}
		else {
			if (gs == 5)
				timelineRaphael.path("M" + i + " " + timelineCVB_yPos  + "L" + i + " " +  (timelineCVB_yPos + gradSHeight)).attr({stroke: "#dbdbdb", "stroke-width": 0.7, fill: "#dbdbdb"});
			gs++;
		}
	}
}

function drawAnnonation() {
	var workQueue = $({});
	workQueue.clearQueue();

	annotationList = [];

	var updateProgress = function(i) {
		return function(next) {
//			console.log(i);
			next();
		};
	};

	var drawAnnotationFunc = function(index) {
		return function(next) {
			var type = contents.annotation[index].type;
			var behavior = contents.annotation[index].behavior;
			var time = contents.annotation[index].time;
			var author = contents.annotation[index].author;
			var linkType = contents.annotation[index].type == AT.Link ? contents.annotation[index].linkType : "";
			var comment = contents.annotation[index].type == AT.Comment ? contents.annotation[index].comment : "";
			var reply = contents.annotation[index].type == AT.Comment ? contents.annotation[index].reply : 0;
			var read = contents.annotation[index].type == AT.Comment ? contents.annotation[index].read : 0;
			var endTime = contents.annotation[index].type == AT.HotSpot ? contents.annotation[index].endTime : 0;

			addAnnonation(type, behavior, time, author, linkType, comment, reply, read, endTime);

			next();
		};
	};

	for (var index in contents.annotation) {
		workQueue.queue(drawAnnotationFunc(index)).delay(0.1).queue(updateProgress(index));
	}

	workQueue.queue(function(next) {
		//You can add a finished callback here.
		next();
	});
}

function addAnnonation(type, behavior, time, author, linkType, comment, reply, read, endTime) {
	var offsetY = annotationButtonHeight / 2;
	var readIconWidth = 14, readIconHeight = 14;

	if (type == AT.HotSpot) {
		if (behavior == VB.Instructor)
			annotationURL = "LPlayer/Resource/AI_HotSpot.png";
		else if (behavior == VB.Learner)
			annotationURL = "LPlayer/Resource/AL_HotSpot.png";
		else if (behavior == VB.Graduate)
			annotationURL = "LPlayer/Resource/AG_HotSpot.png";
		else if (behavior == VB.Mine)
			annotationURL = "LPlayer/Resource/AM_HotSpot.png";
	}

	if (type == AT.Link)
		annotationURL = "LPlayer/Resource/AD_Link.png";

	if (type == AT.Comment)
		annotationURL = "LPlayer/Resource/AD_Comment.png";

	 annotation_xPos = time * gradSpace - annotationButtonWidth / 2;

	if (behavior == VB.Instructor)
		annotation_yPos = timelineAND_Instructor_yPos + offsetY;
	else if (behavior == VB.Learner)
		annotation_yPos = timelineAND_Learner_yPos + offsetY;
	else if (behavior == VB.Graduate)
		annotation_yPos = timelineAND_Graduate_yPos + offsetY;
	else if (behavior == VB.Mine)
		annotation_yPos = timelineAND_Mine_yPos + offsetY;

	tooltipText = '작성자 : ' + author;

	if (type == AT.HotSpot) {
		tooltipText += ('newline시간 : ' + timeToString(time));
	}

	if (type == AT.Link) {
		tooltipText += ('newline종류 : ' + linkType);
	}

	if (type == AT.Comment || type == AT.Link) {
		if (typeof comment == 'object') {
			if (comment.length > 0) {
				var shorString  = comment.substring(0, 8);
				if (comment.length > 8)
					shorString += '...';
				tooltipText += ('newline내용 : ' + shorString);
			}
		}
	}

	if (type == AT.Comment) {
		tooltipText += ('newline답변 : ' + (reply ? "완료" : "미완료"));
	}

	var annotationElement = {};
	annotationElement.type = type;
	annotationElement.behavior = behavior;
	annotationElement.time = time;
	annotationElement.author = author;

	if (type == AT.Link)
		annotationElement.linkType = linkType;

	if (type == AT.Comment) {
		annotationElement.comment = comment;
		annotationElement.reply = reply;
		annotationElement.read = read;
	}

	annotationElement.image = timelineRaphael.set();
	annotationElement.image.push(timelineRaphael.image(annotationURL, annotation_xPos, annotation_yPos, annotationButtonWidth, annotationButtonHeight));

	if (type == AT.Link || type == AT.Comment) {
		readCheckURL = read ? "LPlayer/Resource/AD_Unlock.png" : "LPlayer/Resource/AD_Lock.png";
		annotationElement.image.push(timelineRaphael.image(readCheckURL, annotation_xPos + 10, annotation_yPos - 5, readIconWidth, readIconHeight));
	} else {
		annotationElement.image.push(timelineRaphael.image("LPlayer/Resource/AD_Unlock.png", annotation_xPos + 10, annotation_yPos - 5, 0, 0));
	}

	annotationElement.image.push(timelineRaphael.text(annotation_xPos, annotation_yPos, tooltipText).hide());
	annotationElement.image.push(timelineRaphael.text(annotation_xPos, annotation_yPos, annotationList.length).hide());

	annotationList.push(annotationElement);

	var cvdIndex = parseInt(time);

	if (typeof cvbData[cvdIndex].annotation == 'undefined') {
		cvbData[cvdIndex].annotation = [];
	}

	var annotationImageIndex = {};
	annotationImageIndex.image = annotationElement.image;
	annotationImageIndex.index = annotationList.length - 1;
	cvbData[cvdIndex].annotation.push(annotationImageIndex);

	annotationElement.image[0].mouseover(function(e) {
		if (typeof tooltipText == 'object') {
			tooltipText.remove();
			tooltipBox.remove();
		}

		var tooltip_xPos = parseFloat(e.currentTarget.attributes[0].nodeValue) + annotationButtonWidth;
		var tooltip_yPos = parseFloat(e.currentTarget.attributes[1].nodeValue) - annotationButtonHeight;
		if (bowser.name == 'Internet Explorer' || bowser.name == 'Microsoft Edge') {
			tooltip_xPos = parseFloat(e.currentTarget.attributes[7].nodeValue) + annotationButtonWidth;
			tooltip_yPos = parseFloat(e.currentTarget.attributes[8].nodeValue) - annotationButtonHeight;
		}

		var text = e.currentTarget.nextSibling.nextSibling.textContent;
		var result = text.replace(/newline/gi, '\n');
		tooltipText = timelineRaphael.text(tooltip_xPos + 5, tooltip_yPos + 25, result).attr({"font-family": "gulim", "font-size": 12.00, stroke: "#000000", "stroke-width": 0.1, fill: "#000000", "text-anchor": "start", "cursor":"pointer"});
		tooltipBox = timelineRaphael.rect(tooltip_xPos, tooltip_yPos, 150, 50).attr({stroke:"#FAF4C0", "stroke-width": 1, fill:"#FAF4C0"});
		tooltipText.toFront();

		annotationElement.image.mouseout(function(e) {
			tooltipText.remove();
			tooltipBox.remove();
		});

		tooltipText.click(function(e) {
			//var annotation_xPos = (bowser.name == 'Internet Explorer' || bowser.name == 'Microsoft Edge') ? e.currentTarget.attributes[7].nodeValue : e.currentTarget.attributes[0].nodeValue;
		});

	});

	annotationElement.image.click(function(e) {
		if (type == AT.Link || type == AT.Comment) {
			$('#comment').show();
			$('#bookmark').hide();
			var index = Number(e.currentTarget.nextSibling.nextSibling.nextSibling.textContent);
			var cvbIndex = parseInt(time);
			if (!annotationList[index].read && cvbData[cvbIndex].hitCount > 0) {
				annotationList[index].read = 1;
				annotationList[index].image[1].attr({"src": "LPlayer/Resource/AS_Unlock.png"});
			}
		}
	});
}

function setPlayingGrad(time) {
	var xPos = time * gradSpace;
	var index = parseInt(time);

	if (typeof cvbData[index].annotation == 'object' && cvbData[index].hitCount == 0) {
		for (var ii in cvbData[index].annotation) {
			var contentsIndex = cvbData[index].annotation[ii].index;
			if (contents.annotation[contentsIndex].type != AT.HotSpot) {//HotSpot을 제외하고 hitCount가 0인 Annotation을 활성화 시킨다.
				if (contents.annotation[contentsIndex].type == AT.Link) {
					if (contents.annotation[contentsIndex].behavior == VB.Instructor)
						annotationURL = "LPlayer/Resource/AI_Link.png";
					else if (contents.annotation[contentsIndex].behavior == VB.Learner)
						annotationURL = "LPlayer/Resource/AL_Link.png";
					else if (contents.annotation[contentsIndex].behavior == VB.Graduate)
						annotationURL = "LPlayer/Resource/AG_Link.png";
					else if (contents.annotation[contentsIndex].behavior == VB.Mine)
						annotationURL = "LPlayer/Resource/AM_Link.png";
				}

				if (contents.annotation[contentsIndex].type == AT.Comment) {
					if (contents.annotation[contentsIndex].behavior == VB.Instructor)
						annotationURL = "LPlayer/Resource/AI_Comment.png";
					else if (contents.annotation[contentsIndex].behavior == VB.Learner)
						annotationURL = "LPlayer/Resource/AL_Comment.png";
					else if (contents.annotation[contentsIndex].behavior == VB.Graduate)
						annotationURL = "LPlayer/Resource/AG_Comment.png";
					else if (contents.annotation[contentsIndex].behavior == VB.Mine)
						annotationURL = "LPlayer/Resource/AM_Comment.png";
				}
				cvbData[index].annotation[ii].image[0].attr({"src": annotationURL, "cursor":"pointer"});

				if (contents.annotation[contentsIndex].type == AT.Link || contents.annotation[contentsIndex].type == AT.Comment)
					readCheckURL = contents.annotation[contentsIndex].read ? "LPlayer/Resource/AS_Unlock.png" : "LPlayer/Resource/AS_Lock.png";

				cvbData[index].annotation[ii].image[1].attr({"src": readCheckURL});
			}
		}
	}

	cvbData[index].hitCount++;
	var hitHeight = 1 + cvbData[index].hitCount * 0.3;
	if (hitHeight > timelineCVBHeight)
		hitHeight = timelineCVBHeight - 1;

	//CVB 히스토그램을 그린다.
	timelineRaphael.rect(xPos, timelineCVB_yPos + timelineCVBHeight - hitHeight - 1, gradSpace, hitHeight).attr({stroke:"#6799FF", fill:"#6799FF", "opacity": 1.0});

	//북마킹 중인 경우 북마킹 영역을 그린다.
	if (onBookmarking && boomarkingBegin_xPos > -1) {
		if (xPos < boomarkingBegin_xPos) {
			onBookmarking = false;
			boomarkingBegin_xPos = -1;
			boomarkingEnd_XPos = -1;
			bookmarkBeginAnnotation.remove();
			bookmarkRange.remove();
		} else {
			bookmarkRange.attr({"x": boomarkingBegin_xPos, "width": (xPos - boomarkingBegin_xPos)});
		}
	}

	//플레이바를 이동시킨다.
	playingGrad.translate(xPos - playingGrad_xPos, 0).toFront();
	playingGrad_xPos = xPos;
}

function onFullScreenChange() {
	if (fullscreenSlideButtonClicked) {
		slideRaphael.setSize($('#slide').width(), $('#slide').height());
		switch (layoutState) {
			case ls.default:
				var slideWidth = screen.width * 0.8;
				resizeSlideControl((screen.width - slideWidth) / 2, 0, slideWidth, screen.height, 30, 30);
				layoutState = ls.pageFullScreen;
				break
			default:
				resizeSlideControl(0, 0, $('#slide').width(), $('#slide').height(), slideButtonWidth, slideButtonHeight);
				layoutState = ls.default;
				fullscreenSlideButtonClicked = false;
		}
	}
}

function resizeSlideControl(x, y, width, height, buttonWidth, buttonHeight) {
	slideScaledHeight = width * slideScale;
	slide_xPos = x;
	slide_yPos = (height - slideScaledHeight) / 2;

	//alert(slide_yPos);

	sectionText_xPos = x + 10;
	sectionText_yPos = y + 10;
	pageText_xPos = x + width - pageTextWidth;
	pageText_yPos = y + height - pageTextHeight;
	slideButton_yPos = y + height - buttonHeight - 5;
	previousSlideButton_xPos = x + 10, nextSlideButton_xPos = previousSlideButton_xPos + buttonWidth + 10;
	scriptSlideButton_xPos = nextSlideButton_xPos + buttonWidth + 10, fullscreenSlideButton_xPos = scriptSlideButton_xPos + buttonWidth + 10;

	slideControl.bkgControl.attr({"x": x, "y": y, "width": width, "height": height}).toFront();
	slideControl.pageControl.attr({"x": x, "y": slide_yPos, "width": width, "height": slideScaledHeight}).toFront();
	slideControl.sectionText.attr({"x": sectionText_xPos, "y": sectionText_yPos + (sectionTextHeight / 2)}).toFront();
	slideControl.pageText.attr({"x": pageText_xPos, "y": pageText_yPos + (pageTextHeight / 2)}).toFront();
	slideControl.previousSlideButton.attr({"x": previousSlideButton_xPos, "y": slideButton_yPos, "width": buttonWidth, "height": buttonHeight}).toFront();
	slideControl.nextSlideButton.attr({"x": nextSlideButton_xPos, "y": slideButton_yPos, "width": buttonWidth, "height": buttonHeight}).toFront();
	slideControl.scriptSlideButton.attr({"x": scriptSlideButton_xPos, "y": slideButton_yPos, "width": buttonWidth, "height": buttonHeight}).toFront();
	slideControl.fullscreenSlideButton.attr({"x": fullscreenSlideButton_xPos, "y": slideButton_yPos, "width": buttonWidth, "height": buttonHeight}).toFront();
}

function updateSlide(index) {
	player.seek(contents.slide[index].beginTime);
	slideControl.pageControl.attr({"src": contents.slideURL + (contents.slide[index].index + 1) + '.jpg'});
	slideControl.sectionText.attr({"text": '[' + contents.slide[index].section + ']'});
	slideControl.pageText.attr({"text": (contents.slide[index].index + 1) + ' / ' + contents.totalSlide});
	currentSlideIndex = index;

	console.log(timeToString(player.getPosition()) + ": Goto Slide " + "[" + (currentSlideIndex + 1) + "]");
}

function filtering_AT(filterType, value) {
	for (var index in annotationList) {
		if (annotationList[index].type == filterType) {
			if (value) {
				annotationList[index].image[0].show();
				annotationList[index].image[1].show();
			} else {
				annotationList[index].image[0].hide();
				annotationList[index].image[1].hide();
			}
		}
	}
}

function filtering_LC(lockType, value) {
	for (var index in annotationList) {
		if (annotationList[index].type == AT.Link || annotationList[index].type == AT.Comment) {
			if (lockType == LC.Lock && !annotationList[index].read) {
					if (value) {
						annotationList[index].image[0].show();
						annotationList[index].image[1].show();
				} else {
					annotationList[index].image[0].hide();
					annotationList[index].image[1].hide();
				}
			}

			if (lockType == LC.UnLock && annotationList[index].read) {
				if (value) {
					annotationList[index].image[0].show();
					annotationList[index].image[1].show();
				} else {
					annotationList[index].image[0].hide();
					annotationList[index].image[1].hide();
				}
			}
		}
	}
}

function filtering_VB(filterType, value) {
	for (var index in annotationList) {
		if (annotationList[index].behavior == filterType) {
			if (value) {
				annotationList[index].image[0].show();
				annotationList[index].image[1].show();
			} else {
				annotationList[index].image[0].hide();
				annotationList[index].image[1].hide();
			}
		}
	}
}

function initializeLoadingBar() {
	//loadingBar 설정
	loadingBar = {};
	loadingBar.currentStep = 0;
	loadingBar.ignoreStep = 0;
	loadingBar.progressing = false;
	loadingBar.visible = true;

	loadingBar.width = mediaLayerWidth;
	loadingBar.height = mediaLayerHeight - line2_yPos;
	loadingBar.totalStep = 0;
	loadingBar.stepWidth = 0;
	loadingBar.xPos = 0;
	loadingBar.yPos = line2_yPos + 1;
	loadingBar.progressbar = mediaRaphael.rect(loadingBar.xPos , loadingBar.yPos, loadingBar.stepWidth * loadingBar.currentStep, loadingBar.height, 0.00).attr({stroke:loadingColor, "stroke-width": 1, fill:loadingColor});
}

function progressLoadingBar() {
	loadingBar.progressing = true;
	loadingBar.currentStep++;

	var currentPercent = parseInt(loadingBar.currentStep * 100 / loadingBar.totalStep, 10);
	if (currentPercent == 0)
		return;

	loadingBar.progressbar.attr({"width" : loadingBar.stepWidth * loadingBar.currentStep});
	if (loadingBar.currentStep == loadingBar.totalStep)
		endLoadingProgress();
}

function endLoadingProgress() {
	loadingBar.progressing = false;
//	alert("Complete");
}

function incGradZoomSlider(incValue) {
	gradZoomSlider.setVal(gradZoomSlider.getVal() + incValue);
	timelineRaphael.remove();
	drawTimeLine(gradZoomSlider.getVal(), $videoCam[0].getCurrentTime());

}

function timeToString(time, viewHour) {
	var hour = parseInt(time / 3600);
	var hh = hour < 10 ? '0' + hour : hour;
	time = time - hour * 3600;
	var minute = parseInt(time / 60);
	var mm = minute < 10 ? '0' + minute : minute;
	var second = (time - minute * 60).toFixed(2);
	var ss = second < 10 ? '0' + second : second;

	if (typeof viewHour != 'undefined' && viewHour == false)
		return mm + ":" + ss;
	else
		return hh + ":" + mm + ":" + ss;
}

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

/*
Native FullScreen JavaScript API
-------------
Assumes Mozilla naming conventions instead of W3C for now
*/

(function() {
	var
		fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() { return false; },
			requestFullScreen: function() {},
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');

	// check for native support
	if (typeof document.cancelFullScreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];

			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;

				break;
			}
		}
	}

	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}
	}

	// jQuery plugin
	if (typeof jQuery != 'undefined') {
		jQuery.fn.requestFullScreen = function() {

			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();