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
//	const settingsButton = document.createElement('li');
		// modal elements
	const modal = document.createElement('div');	
	const settings = document.createElement('ul');	
	const closeButton = document.createElement("button");
		// variables, set to defaults
	let isFullScreen = false;
	let isIE = false;
	let theme = "rgb(73,202,135)"; // default theme color
	let themeText = "fff"; // default theme color
	let url = window.location.pathname; // get root directory
	url = url.slice(0, url.lastIndexOf("/") + 1);

	//	let ccMode = 1;				// default showing only one line at a time, use in later functionality
	content.style.display = 'hidden';
	
	////////////////////////////////////////////////////////////////////////////////
	// functions 
	////////////////////////////////////////////////////////////////////////////////
	
	// ****************** Layout functions *********************************
	
	// one step element creation with class type and text content
	function createElement (elType, elClass, elContent) {
		const el = document.createElement(elType);
		if (elClass !== "") {
			el.className = elClass;
		}
		if (elContent !== "") {
			el.textContent = elContent;
		}
		return el;
	}
	
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
		const vol = document.querySelector(".mevp_volume--slider");
		player.volume = (vol.value / 100);
		const volumeButton = document.querySelector(".muted");
		if (player.volume === 0) {
			volumeButton.style.display = "block";
		} else if (player.volume !== 0) {
			volumeButton.style.display = "none";
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
		togglePlaySVG();
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
		addFullScreenSVG();
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
		modal.style.border = "3px solid " + theme;
//		alert(timeElements.length);

		updateCaptions();
		updateTimers();
		updateSVG();
	
	}
	function updateTimers() {
		let timeElements = document.querySelectorAll(".mevp_nav p");
		for (let i in timeElements) {
			if (timeElements[i].style !== undefined) {
				const timeElement = timeElements[i];
				
				timeElement.style.color = theme;
			}
		}
	}
 	
	// chang colors of svgs
	function updateSVG() {
		let themeElements = document.querySelectorAll(".theme");
		for (let i in themeElements) {
			if (themeElements[i].style !== undefined) {
				const themeElement = themeElements[i];
				themeElement.style.fill = theme;
			}
		}
		themeElements = document.querySelectorAll(".theme-stroke");
		for (let i in themeElements) {
			if (themeElements[i].style !== undefined) {
				const themeElement = themeElements[i];
				themeElement.style.stroke = theme;
			}
		}

		
	}
	
	// add svg's inline to their respective buttons, I know there are better ways to do this, but....
	function addPlaySVG() {
		if (document.querySelector(".mevp_play")) {
			const playButton = document.querySelector(".mevp_play");
			playButton.innerHTML += '<svg id="playButton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><style>.theme{fill:' + theme + ';}</style><g id="play"><path d="M43.2 26.5L12.1 44 12 8l31.2 17.3z"/><path class="theme" d="M41.2 24.5L10.1 42 10 6l31.2 17.3z"/></g><g id="pause"><path d="M12.5 7.5h11v39h-11zm20 0h11v39h-11z"/><path class="theme" d="M30.5 5.5h11v39h-11zm-20 0h11v39h-11z"/></g></svg>';
			const pauseSVG = document.querySelectorAll("#pause path");
			for (let i in pauseSVG) {
				if (pauseSVG[i].style !== undefined) {
					const path = pauseSVG[i];
					path.style.display = "none";
				}
			}
			
		}
	}
	
		function togglePlaySVG() {
		if (document.querySelector(".mevp_play")) {
			const playSVG = document.querySelectorAll("#play path");
			for (let i in playSVG) {
				if (playSVG[i].style !== undefined) {
					const path = playSVG[i];
					path.style.display = "block";
				}
			}
			const pauseSVG = document.querySelectorAll("#pause path");
			for (let i in pauseSVG) {
				if (pauseSVG[i].style !== undefined) {
					const path = pauseSVG[i];
					path.style.display = "none";
				}
			}
		} else if (document.querySelector(".mevp_pause")) {
			const playSVG = document.querySelectorAll("#play path");
			for (let i in playSVG) {
				if (playSVG[i].style !== undefined) {
					const path = playSVG[i];
					path.style.display = "none";
				}
			}
			const pauseSVG = document.querySelectorAll("#pause path");
			for (let i in pauseSVG) {
				if (pauseSVG[i].style !== undefined) {
					const path = pauseSVG[i];
					path.style.display = "block";
				}
			}
		}
	}
	
	function addSettingsSVG() {
		const settingsButton = document.querySelector('.mevp_settings');
		settingsButton.innerHTML += '<svg id="settings" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><style>.theme{fill:' + theme + ';}</style><path class="settingsButton"d="M46.7 33.1c.2 0 .3-.1.4-.3l.8-3.1c0-.2-.1-.4-.2-.4L43.9 27c-.1-.1-.2-.3-.2-.4v-1.1c0-.7-.1-1.8-.1-1.8 0-.2.1-.4.2-.5l3.7-2.4c.1-.1.2-.3.2-.5l-1-3.1c-.1-.2-.2-.3-.4-.3l-4.3.4c-.2 0-.4-.1-.5-.2l-1.7-2.5c-.1-.1-.1-.4-.1-.5l1.8-4.1c.1-.2 0-.4-.1-.5l-2.4-2c-.1-.1-.3-.1-.5 0L34.9 10h-.3l-3-1.4c-.2-.1-.3-.2-.3-.4l-.7-4.4c0-.2-.2-.3-.3-.3l-3-.5c-.2 0-.3.1-.4.3l-1.6 4c-.1.2-.2.3-.4.3l-3.6.5c-.2 0-.4 0-.5-.2l-2.9-3.3c-.1-.1-.3-.2-.5-.1l-2.6 1.2c-.1.1-.2.3-.2.4l.8 4.3c0 .2 0 .4-.2.5l-2.9 2.6c-.1.1-.3.2-.5.1l-4.2-1.2c-.2 0-.4 0-.5.2l-1.4 2.3c-.1.1-.1.4.1.5l3 3.2c.1 0 .2.2.1.4l-1 3.9c0 .2-.2.3-.3.4l-4.2 1.2c-.2 0-.3.2-.3.4v.7c0 .8.1 2 .1 2 0 .2.2.3.3.4l4.3 1c.2 0 .3.2.4.4L9.3 33c.1.2 0 .4-.1.5l-2.8 3.3c-.1.1-.1.3 0 .5L8 39.6c.1.1.3.2.5.1l4.2-1.4c.2-.1.4 0 .5.1l2.9 2.3c.1.1.2.3.2.5l-.6 4.3c0 .2.1.4.2.4l2.7 1.1c.2.1.4 0 .5-.1l2.8-3.5c.1-.1.3-.2.5-.2 0 0 2.1.3 3.3.3h.1c.1 0 .3.1.4.3l1.8 4c.1.1.3.3.4.2l3-.6c.2 0 .3-.2.3-.4l.4-4.4c0-.2.2-.4.3-.4l2.7-1.4c.1-.1.4-.1.5 0l3.7 2.3c.1.1.4.1.5 0l2.3-2.2c.1-.1.1-.3.1-.5l-2-3.9c-.1-.1-.1-.4 0-.5l1.5-2.5c.1-.1.3-.3.4-.3l4.6-.1zm-21.2 4.4c-6.7 0-12.1-5.4-12.1-12s5.4-12 12.1-12 12.1 5.4 12.1 12-5.4 12-12.1 12z"/><path class="theme settingsButton" d="M44.7 31.1c.2 0 .3-.1.4-.3l.8-3.1c0-.2-.1-.4-.2-.4L41.9 25c-.1-.1-.2-.3-.2-.4v-1.1c0-.7-.1-1.8-.1-1.8 0-.2.1-.4.2-.5l3.7-2.4c.1-.1.2-.3.2-.5l-1-3.1c-.1-.2-.2-.3-.4-.3l-4.3.4c-.2 0-.4-.1-.5-.2l-1.7-2.5c-.1-.1-.1-.4-.1-.5L39.5 8c.1-.2 0-.4-.1-.5l-2.4-2c-.1-.1-.3-.1-.5 0L32.9 8h-.3l-3-1.4c-.2-.1-.3-.2-.3-.4l-.7-4.4c0-.2-.2-.3-.3-.3l-3-.5c-.2 0-.3.1-.4.3l-1.6 4c-.1.2-.2.3-.4.3l-3.6.5c-.2 0-.4 0-.5-.2l-2.9-3.3c-.1-.1-.3-.2-.5-.1l-2.6 1.2c-.1.1-.2.3-.2.4l.8 4.3c0 .2 0 .4-.2.5l-2.9 2.6c-.1.1-.3.2-.5.1l-4.2-1.2c-.2 0-.4 0-.5.2l-1.4 2.3c-.1.1-.1.4.1.5l3 3.2c.1 0 .2.2.1.4l-1 3.9c0 .2-.2.3-.3.4l-4.2 1.2c-.2 0-.3.2-.3.4v.7c0 .8.1 2 .1 2 0 .2.2.3.3.4l4.3 1c.2 0 .3.2.4.4L7.3 31c.1.2 0 .4-.1.5l-2.8 3.3c-.1.1-.1.3 0 .5L6 37.6c.1.1.3.2.5.1l4.2-1.4c.2-.1.4 0 .5.1l2.9 2.3c.1.1.2.3.2.5l-.6 4.3c0 .2.1.4.2.4l2.7 1.1c.2.1.4 0 .5-.1l2.8-3.5c.1-.1.3-.2.5-.2 0 0 2.1.3 3.3.3h.1c.1 0 .3.1.4.3l1.8 4c.1.1.3.3.4.2l3-.6c.2 0 .3-.2.3-.4l.4-4.4c0-.2.2-.4.3-.4l2.7-1.4c.1-.1.4-.1.5 0l3.7 2.3c.1.1.4.1.5 0l2.3-2.2c.1-.1.1-.3.1-.5l-2-3.9c-.1-.1-.1-.4 0-.5l1.5-2.5c.1-.1.3-.3.4-.3l4.6-.1zm-21.2 4.4c-6.7 0-12.1-5.4-12.1-12s5.4-12 12.1-12 12.1 5.4 12.1 12-5.4 12-12.1 12z"/></svg>';
	}
	
	function addVolumeSVG () {
		const settingsButton = document.querySelector('.mevp_volume');
		settingsButton.innerHTML += '<svg id="volumeButton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><style>.theme{fill:' + theme + ';} .st1{fill:none;stroke:#000000;stroke-width:2;stroke-miterlimit:10;} .theme-stroke{fill:none;stroke:' + theme + ';stroke-width:2;stroke-miterlimit:10;} .st3{fill:none;stroke:#000000;stroke-width:3;stroke-miterlimit:10;display:none;} .muted{fill:none;stroke:#CC0000;stroke-width:5;stroke-miterlimit:10;display:none;}</style><path d="M2.3 16.3H21l9.3-7.7v34.9L21 35.9H2.3z"/><path class="theme" d="M0 13.8h18.7L28 6.2v34.9l-9.3-7.7H0z"/><path class="st1" d="M41.1 3.1c1.9 3.1 6.8 11.8 6.4 24-.3 11-4.7 18.8-6.7 21.9"/><path class="theme" d="M38.8.7c1.9 3.1 6.8 11.8 6.4 24-.3 11-4.7 18.8-6.7 21.9"/><path class="st1" d="M34.7 8.9c1.2 2.2 3.6 7.3 4 14.5.5 10.6-3.8 18.1-4.9 19.9"/><path class="theme-stroke" d="M32.4 6.4c1.2 2.2 3.6 7.3 4 14.5.5 10.6-3.8 18.1-4.9 19.9"/><path class="st3" d="M4.5 4.8l41.7 43.5m-42.1-.5L46.6 4.4"/><path class="muted" d="M3.5 3.1l41.7 43.5m-42.5 0L45.2 3.1"/></svg>';
	}
	
	function addFullScreenSVG () {
		if (document.querySelector(".mevp_fullscreen")) {
			const fullButton = document.querySelector(".mevp_fullscreen");
			if (fullButton.querySelector('svg')) {
				const oldSvg = fullButton.querySelector('svg');
				fullButton.removeChild(oldSvg);
			}
			fullButton.innerHTML += '<svg id="full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><style>.theme{fill:' + theme + ';}</style><path d="M2 50V29l21 21zM49.9 2l.1 21L29 2.1zM2 23V2h21"/><path class="theme" d="M0 0h21L0 21zm50 50H25l25-25zM47.9 0l.1 21L27 .1zM0 48V27l21 21z"/><path d="M50 50H26l24-24z"/><path class="theme" d="M48 48H27l21-21z"/></svg>';
		} else if (document.querySelector(".mevp_normalscreen")) {
			const fullButton = document.querySelector(".mevp_normalscreen");
			if (fullButton.querySelector('svg')) {
				const oldSvg = fullButton.querySelector('svg');
				fullButton.removeChild(oldSvg);
			}
			fullButton.innerHTML += '<svg id="normal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><style>.theme{fill:' + theme + ';}</style><path d="M31.5 30h18v5h-18zM2 30h18v5H2zm30-15h18v5H32zM2 15h18v5H2z"/><path d="M15 32h5v18h-5zm15 0h5v18h-5zm0-30h5v18h-5zM15 2h5v18h-5z"/><path class="theme" d="M13 0h5v18h-5zm15 0h5v18h-5zM13 30h5v18h-5zm15 0h5v18h-5z"/><path class="theme" d="M0 13h18v5H0zm30 0h18v5H30zM0 28h18v5H0zm30 0h18v5H30z"/></svg>';
		}		
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
		
		addPlaySVG();
		addSettingsSVG();
		addVolumeSVG();
		addFullScreenSVG();
		
		
		// Create modal for color picker
		closeButton.textContent = "Close";
		closeButton.className = "mevp_close";
		settings.appendChild(createRGB("red"));		
		settings.appendChild(createRGB("green"));		
		settings.appendChild(createRGB("blue"));		
		settings.className = "mevp_settingsUL";
		modal.appendChild(createElement("h2", "mevp_modal--title", "Choose your rgb color theme"));
		modal.appendChild(settings);
		modal.appendChild(closeButton);
		modal.className = "mevp_modal";
		container.appendChild(modal);


	} // end load player
	


	
	////////////////////////////////////////////////////////////////////////////////
	// event handlers
	////////////////////////////////////////////////////////////////////////////////
	
	settings.addEventListener('click', function () {
		modal.style.display = "block";
	});
	
	skin.addEventListener('input', function (e) {
		const slider = e.target;
		if (slider.className === "mevp_volume--slider") {
			adjustVolume();	
		}
	});

	
	skin.addEventListener('click', function (e) {
		let element = e.target;
		let name = "";
		if (isIE) {
			if (element.nodeName === 'path') {
				element = element.parentNode.parentNode;
			} else if (element.nodeName === 'svg') {
				element = element.parentNode;
			}

			name = "" + element.className;		} else {
			if (element.nodeName === 'path') {
				element = element.parentElement.parentElement;
			} else if (element.nodeName === 'svg') {
				element = element.parentElement;
			}

			name = "" + element.className;
		}
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
	
//	player.onloadstart(placeNav());
	
	
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
	settings.addEventListener('input', function (e) {
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
	placeNav();
	
});




