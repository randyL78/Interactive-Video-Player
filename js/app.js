/*jshint esversion: 6 */ 

//  ================================================
// 			Custom Video Player v1.0 alpha
//				by: Randy Layne
//	================================================

document.addEventListener('DOMContentLoaded', function () {
	"use strict";
	//	global variables
		// constants
	const skin = document.createElement('div');
	const player = document.querySelector('.custom_player');
	const container = player.parentNode;
	const content = document.querySelector('main');
	const navUL = document.createElement('ul');
	const volumeSlider = document.createElement('input');
	const captions = document.querySelectorAll('.captions');
	const main = document.querySelector('main');
		// modal elements
	const modal = document.createElement('div');	
	const settings = document.createElement('ul');	
	const closeButton = document.createElement("button");
		// variables, set to defaults
	let isFullScreen = false;
	let isIE = false;
	let theme = "rgb(63,202,135)"; // default theme color
	let themeText = "fff"; // default theme color
	let url = window.location.pathname; // get root directory
	url = url.slice(0, url.lastIndexOf("/") + 1);

	//	let ccMode = 1;				// default showing only one line at a time, use in later functionality
	content.style.display = 'hidden';
	
	////////////////////////////////////////////////////////////////////////////////
	// functions 
	////////////////////////////////////////////////////////////////////////////////
	
	// ****************** Layout functions *********************************
	
	// programatically create the player controls as li elements
	function createControlsLI(text, type) {	
		const li = document.createElement('li');
		li.className = "mevp_" + text;

		if (type === "link") {
			const a = document.createElement('a');
			a.textContent = text;	
			li.appendChild(a);
		} else if (type === "time") {
			const p = document.createElement('p');
			p.textContent = "0:00";		
			li.appendChild(p);
		} else if (type === "progress") {
			const div = document.createElement('div');
			div.className = "mevp_" + text + "--bar";
			li.appendChild(div);
 		} else if (type === "dropdown") {
			const ul = document.createElement('p');
			ul.className = "mevp_" + text + "--drop";
			li.appendChild(ul);
		}

		return li;
	}
	
	// Calculate the difference between the heights of 2 elements so that one can float at the bottom of the other
	function placeAtBottom(baseElement, topElement) {
		const baseHeight = getPosition(baseElement, "bottom");
		const topHeight = getDimension(topElement, "height");
		let scrollOffset = window.scrollY;
		let iEoffSet = 0;
		// IE workaround
		if (isIE) {
			scrollOffset = window.pageYOffset;
			iEoffSet = -15;
		}
		const computeHeight = (baseHeight - topHeight + scrollOffset + iEoffSet) + "px";
//		console.log(baseHeight + ", " + topHeight + ", " + scrollOffset);
		return computeHeight;
	}
	
	// Get the coordinates to place one element at the right hand side of another element (buggy)
	function placeAtRight(baseElement, topWidth) {
		const baseWidth = getPosition(baseElement, "right");
		const parentWidth = getPosition(skin, "left");
		return (baseWidth - topWidth - parentWidth) + "px";
	}
	
	// Place the player controls at bottom of video
	function placeNav() {
		navUL.style.top = placeAtBottom(player, navUL);
		if (isFullScreen === false) {
			content.style.marginTop = getDimension(player, 'height') + "px";
		}
	}
	
	
	// Get top, botom, left or right position of an element
	function getPosition(element, position) {
		return (element.getBoundingClientRect()[position]);
	}
	
	// Get height or width of an element as a number
	function getDimension(element, dimension) {
		let elemHeight = window.getComputedStyle(element).getPropertyValue(dimension);
		elemHeight = elemHeight.replace("px", "");
		return(elemHeight);
	}
	
	// set the attributes of an element using an attributes object
	function setAttributes(element, attributes) {
		for (let attr in attributes) {
			if (attr !== "") {
				element.setAttribute(attr.toUpperCase(), attributes[attr]);
			}
		}
		return element;
	}
	
	// ************* Volume controls/ slider functions ***********************************
	
	// create volume slider
	function createVolumeControl() {
		const volumeLI = document.querySelector('.mevp_volume');
		const volumeDiv = document.createElement('div');
		setAttributes(volumeSlider, {"TYPE"	: "range",
									"MIN"	: "0",
									"MAX"	: "100",
									"VALUE"	: "100",
									"CLASS"	: "mevp_volume--slider"});
		
		volumeDiv.setAttribute("ID","volume__content");
		volumeDiv.style.bottom = "45px";
		volumeDiv.style.left = placeAtRight(volumeLI, "30");
		volumeDiv.appendChild(volumeSlider);
		volumeDiv.style.display = "none";
		return volumeDiv;
	}
	
	function adjustVolume() {
		player.volume = (volumeSlider.value / 100);
		const volumeButton = document.querySelector(".mevp_volume");
		if (player.volume === 0 && !volumeButton.hasAttribute("ID")) {
			volumeButton.setAttribute("ID", "mevp_mute");
		} else if (player.volume !== 0 && volumeButton.hasAttribute("ID")) {
			volumeButton.removeAttribute("ID");
		}
		
	}
	
	// Place the volume slider over the volume button
	function placeVolume() {
		const volumeDiv = volumeSlider.parentElement;
		const volumeLI = volumeDiv.parentElement;
		volumeSlider.parentElement.style.left = placeAtRight(volumeLI, "30");
	}
	
		// Show the volume slider
	function showVolume() {
		const volumeDiv = document.querySelector("#volume__content");
		if (volumeDiv.style.display === "none") {
			volumeDiv.style.display = "block";
		} else {
			volumeDiv.style.display = "none";	
		}
	}
	
	
	// ************** player controls functions (other than volume) *******************
	
	// Toggle the player to play or pause
	function togglePause() {
		if (document.querySelector(".mevp_play")) {
			const play = document.querySelector(".mevp_play");
			player.play();
			play.className = 'mevp_pause';
		} else {
			const pause = document.querySelector(".mevp_pause");	
			player.pause();
			pause.className = 'mevp_play';

		}
	}
	
		// find out where user clicked in progress bar and use to set video player time
	function getProgress(e) {
		const progress = document.querySelector(".mevp_progress");
		const x = getPosition(progress, "left");
		const totalWidth = getPosition(progress, "right") - x;
		const clickWidth = e.clientX - x;
		setTime((clickWidth / totalWidth) * player.duration);
	
	}
	
	function updateDuration() {
		updateTime(".mevp_total", player.duration);
	}
	
	function updateCurrent() {
		updateTime(".mevp_current", player.currentTime);
		updateDuration();
		updateProgress();
		updateCaptions();
	}
	
		
	// set the current time of the video player
	function setTime(time) {
		player.currentTime = time;
		if (document.querySelector(".mevp_play")) {
			togglePause();
		}

	}
	
	// update progress bar width
	function updateProgress() {
		const bar = document.querySelector(".mevp_progress--bar");
		const width = ((player.currentTime / player.duration) * 100) + "%";
		bar.style.width = width;
	}
	
	// **************** functions for switching to and from fullscreen ******************
	
	// set style properties of element when in fullscreen or when going back to normal screen
	function fullProperties(element) {
		element.style.maxWidth = "100%";
		element.style.width = "100%";
	}
	
	// eventually will set any element to its pre fullscreen styles, currently it is project specific
	function normalProperties(element) {
		element.style.maxWidth = "700px";
		element.style.width = "100%";
	}
	
	// handle full screen mode	
	function toggleFullScreen() {

		if (!document.fullscreenElement && !document.mozFullScreenElement &&
    	  !document.webkitFullscreenElement && !document.msFullscreenElement) {
			fullProperties(player);
			fullProperties(navUL);
			const fullButton = document.querySelector(".mevp_fullscreen");
			fullButton.className = "mevp_normalscreen";
			if (skin.requestFullscreen) {
				skin.requestFullscreen();
			} else if (skin.webkitRequestFullscreen) {
				skin.webkitRequestFullscreen();

			} else if (skin.mozRequestFullScreen) {
				skin.mozRequestFullScreen();
			} else if (skin.msRequestFullscreen) {
				skin.msRequestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
			  document.exitFullscreen();
			} else if (document.msExitFullscreen) {
			  document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
			  document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
			  document.webkitExitFullscreen();
			}
		}
	}

	function changeFullscreen() {
		if (isFullScreen === false) {
			isFullScreen = true;
		} else {
			const fullButton = document.querySelector(".mevp_normalscreen");
			fullButton.className = "mevp_fullscreen";
			normalProperties(player);
			normalProperties(navUL);
			isFullScreen = false;
		}	
		placeNav();
	}
	
	function changeFullscreenIE() {
		changeFullscreen();
		// manually set full screen width and height properties for IE
		if (isFullScreen === true) {
				skin.style.maxWidth = "100%";
				skin.style.height = "100%";
		} 
	}
	
	// ****************** Closed captioning ***********************************
	// later implement loading of a .vtt file for this portion, for now just have in html
	
	// highlight captions by changing background color to theme color
		// changed for .. of loop to traditional for loop for better compatibility with IE 11-
	function updateCaptions() {
		const time = player.currentTime;
		for (let i = 0;  i < captions.length; i++) {
			const caption = captions[i];
			const start = stringTimeToNumber(caption.getAttribute('data-startTime'));
			const end = stringTimeToNumber(caption.getAttribute('data-endTime'));
			if (time >= start && time < end) {
				caption.style.backgroundColor = theme;
				caption.style.color = themeText;
			} else {
				caption.style.backgroundColor = "#fff";
				caption.style.color = "#111";
			}
		}
	}
	
	// convert times in captions to numbers
	function stringTimeToNumber(timeString) {
		const times = timeString.split(":");
		let sec = parseFloat(times[2]);
		let min = 0;
		let hour = 0;
		if (times.length >= 2) {
			min = parseFloat(times[1]);
			if (times.length >= 3) {
				hour = parseFloat(times[0]);
			}
		}
		return (((hour * 60) + min) * 60) + sec;	
	
	}
	
	function updateTime(elementName, getTime) {
		const timer = document.querySelector(elementName);
		const time = timer.firstElementChild;
		time.textContent = timeToString(getTime);
	}
	
	function timeToString(time) {
		let timeString = "";
		let min = parseInt(time / 60);
		const hour = parseInt(min);
		min = parseInt(min % 60);
		const sec = parseInt(time % 60);
		if (hour > 0) {
			timeString += hour + ":";
		}
		timeString += min + ":";
		if (sec < 10) {
			timeString += "0" + sec;
		} else {
			timeString += sec;	
		}
		return timeString;
	}
	
// ****************** modal functions **********
	function createRGB(name) {
		const slide = document.createElement("input");
		setAttributes(slide, {"TYPE"	: "range",
							"MIN"	: "0",
							"MAX"	: "255",
							"VALUE"	: "100",
							"CLASS"	: "mevp--slider",
							 "ID" 	: name});
		return slide;
	}
	
	// allow users to change control colors
	function changeTheme() {
		const sliders = document.querySelectorAll(".mevp--slider");
		let r = parseInt(sliders[0].value);
		let g = parseInt(sliders[1].value);
		let b = parseInt(sliders[2].value);
		theme = "rgb(" + r + ", " + g + ", " + b + ")";
		if (((r + g + b)/3) > 125) {
			themeText = "#111";
		} else {
			themeText = "#fff";
		}
		let prog = document.querySelector(".mevp_progress--bar");
		prog.style.backgroundColor = theme;//"rgb(" + r + ", " + g + ", " + b + "0.9)";
		player.style.boxShadow = "0 0 10px 13px " + theme;
		updateCaptions();
	}
	
	///////////////////////////////////////////
	//	 Initial setup and loading of player
	//////////////////////////////////////////
	
	function loadPlayer() {
		// wrap video element in custom container
		skin.className	= "mevp_skin";
		container.insertBefore(skin, player);
		container.removeChild(player);
		skin.appendChild(player);

		// hide browser player controls
		player.removeAttribute("controls");
		
		// keep browser from loading subtitles by default
		for (let i = 0; i < player.textTracks.length; i++) {
			player.textTracks[i].mode = 'hidden';
		}
		
		// add custom controls to container
		const navLI = {
			settings	:	"link",
			play		:	"link",
			current		:	"time",
			progress	:	"progress",
			total		:	"time",
			volume		:	"dropdown",
			fullscreen	:	"link"
		};
		
		for (let text in navLI) {
			if (text !== "") {
				navUL.appendChild(createControlsLI(text, navLI[text]));
			}
		}
		// TODO: add player controls .svgs inline with javascript so colors can be manipulated
		
		navUL.className = "mevp_nav";
		skin.appendChild(navUL);
		navUL.style.top = placeAtBottom(player, navUL);
		
		if (window.scrollY === undefined) {
			isIE = true;
		}
		
		const volumeUL = document.querySelector('.mevp_volume--drop');
		volumeUL.appendChild(createVolumeControl());
		
		// Create modal for color picker
		closeButton.textContent = "Close";
		closeButton.className = "mevp_close";
		settings.appendChild(createRGB("red"));		
		settings.appendChild(createRGB("green"));		
		settings.appendChild(createRGB("blue"));		
		settings.className = "mevp_settingsUL";
		modal.appendChild(settings);
		modal.appendChild(closeButton);
		modal.className = "mevp_modal";
		container.appendChild(modal);
		
		
	} // end load player
	


	
	////////////////////////////////////////////////////////////////////////////////
	// event handlers
	////////////////////////////////////////////////////////////////////////////////
	
	skin.addEventListener('click', function (e) {
		const name = e.target.className;
		
		if (name === 'mevp_fullscreen' || 
			name === 'mevp_normalscreen') {
			
			toggleFullScreen();	
		} else if (name === 'mevp_progress' ||
				   name === 'mevp_progress--bar') {
			
			getProgress(e);
		} else if (name === 'mevp_volume') {
			showVolume();
	
		} else if (name === 'mevp_volume--slider') {
			adjustVolume();
		
		} else if (name === 'mevp_settings') {
			modal.style.display = "block";
			
		} else if (name	!== 'mevp_nav') {
			togglePause();
		}	
	});
	
	// keep users from right clicking and showing browser controls
	skin.addEventListener('contextmenu', function (e) {
		if (e.target.className	=== 'custom_player') {
			e.preventDefault();
		}
	});
	
	player.addEventListener("canplay", function () {
		placeNav();
		updateDuration();
	});
	
	player.onended = function() {
		togglePause();
	};
	
	player.addEventListener("timeupdate", function () {
		updateCurrent();
	});
	
	player.addEventListener("resize", function () {
		placeNav();
		updateDuration();
	});
	
	window.addEventListener("resize", function () {
		placeNav();
		placeVolume();
	});
	
	document.addEventListener("webkitfullscreenchange", function () {
		changeFullscreen();
	});
	
	document.addEventListener("mozfullscreenchange", function () {
		changeFullscreen();
	});
		
	document.addEventListener("fullscreenchange", function () {
		changeFullscreen();
	});
	
	document.addEventListener("MSFullscreenChange", function () {
		changeFullscreenIE();
	});


	volumeSlider.oninput = function() {
	  adjustVolume();
	};
	
	// let click on captions bubble up to main tag for better compatibility with Edge and IE
	main.addEventListener('click', function (e) {
		if (e.target.className === 'captions') {
			const selectTime = stringTimeToNumber(e.target.getAttribute("data-startTime"));
			setTime(selectTime);		}
	});
	
	// removed for incompatibility with Edge and IE
//	for (let caption of captions) {
//		caption.addEventListener('click', function () {		
//			const selectTime = stringTimeToNumber(caption.getAttribute("data-startTime"));
//			setTime(selectTime);
//		});
//	}
	
	settings.addEventListener('change', function (e) {
		const slide = e.target;
		if (slide.className === "mevp--slider") {
			changeTheme();
		}
	});
	
	closeButton.addEventListener('click', function () {
		modal.style.display = "none";
	});
	
	//////////////////////////////////////////////////////////////////////
	// Main
	//////////////////////////////////////////////////////////////////////
	
	loadPlayer();
	
});




