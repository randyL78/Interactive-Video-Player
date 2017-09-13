/*jshint esversion: 6 */ 

//  ================================================
// 			Custom Video Player v1.0 alpha
//				by: Randy Layne
//	================================================

document.addEventListener('DOMContentLoaded', () => {
	"use strict";
	//	global variables
		// constants
	const skin = document.createElement('div');
	const player = document.querySelector('.custom_player');
	const container = player.parentNode;
	const navUL = document.createElement('ul');
	const volumeSlider = document.createElement('input');
		// variables, set to defaults
	let isFullScreen = false;
	//	let ccMode = 1;				// default showing only one line at a time
	
	
	////////////////////////////////////////////////////////////////////////////////
	// functions 
	////////////////////////////////////////////////////////////////////////////////
	
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
		const topHeight = getHeight(topElement);
		const computeHeight = (baseHeight - topHeight) + "px";
		
		return computeHeight;
	}
	
	function placeAtRight(baseElement, topElement) {
		const baseWidth = getPosition(baseElement, "right");
		const topWidth = "30";
		const parentWidth = getPosition(skin, "left");
		return (baseWidth - topWidth - parentWidth) + "px";
	}
	
	function placeNav() {
		navUL.style.top = placeAtBottom(player, navUL);
	}
	
	function placeVolume() {
		const volumeDiv = volumeSlider.parentElement;
		const volumeLI = volumeDiv.parentElement;
		volumeSlider.parentElement.style.left = placeAtRight(volumeLI, volumeDiv);
	}

	// Get top, botom, left or right position of an element
	function getPosition(element, position) {
		return (element.getBoundingClientRect()[position]);
	}
	
	function getHeight(element, dimension = "height") {
		let elemHeight = window.getComputedStyle(element).getPropertyValue(dimension);
		elemHeight = elemHeight.replace("px", "");
		return(elemHeight);
	}
	
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
	
	function showVolume() {
		const volumeDiv = document.querySelector("#volume__content");
		if (volumeDiv.style.display === "none") {
			volumeDiv.style.display = "block";
		} else {
				volumeDiv.style.display = "none";	
		}
	}
	
	// set style properties of element when in fullscreen or when going back to normal screen
	function fullProperties(element) {
		element.style.maxWidth = "100%";
		element.style.Width = "100%";
	}
	
	function normalProperties(element) {
		element.style.maxWidth = "1100px";
		element.style.Width = "100%";
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
	
	// set the current time of the video player
	function setTime(time) {
		player.currentTime = time;
		if (document.querySelector(".mevp_play")) {
			togglePause();
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
	}
	
	function updateTime(elementName, getTime) {
		const timer = document.querySelector(elementName);
		const time = timer.firstElementChild;
		time.textContent = timeToString(getTime);
	}
	
	function timeToString(time) {
		const min = parseInt(time / 60);
		const sec = parseInt(time % 60);
		if (sec < 10) {
			return min + ":0" + sec;
		} else {
			return min + ":" + sec;	
		}
	}
	
	function updateProgress() {
		const bar = document.querySelector(".mevp_progress--bar");
		const width = ((player.currentTime / player.duration) * 100) + "%";
		bar.style.width = width;
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

		
		// add custom controls to container
		const navLI = {
			play		:	"link",
			current		:	"time",
			progress	:	"progress",
			total		:	"time",
			volume		:	"dropdown",
			fullscreen	:	"link"
		};
		
		for (let text in navLI) {
			navUL.appendChild(createControlsLI(text, navLI[text]));
		}
		navUL.className = "mevp_nav";
		skin.appendChild(navUL);
		navUL.style.top = placeAtBottom(player, navUL);
		
		const volumeUL = document.querySelector('.mevp_volume--drop');
		volumeUL.appendChild(createVolumeControl());
	}
	
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
		volumeDiv.style.left = placeAtRight(volumeLI, volumeDiv);
		volumeDiv.appendChild(volumeSlider);
		volumeDiv.style.display = "none";
		return volumeDiv;
	}
	
	function adjustVolume() {
		player.volume = (volumeSlider.value / 100);
	}
	
	function setAttributes(element, attributes) {
		for (let attr in attributes) {
			element.setAttribute(attr.toUpperCase(), attributes[attr]);
		}
		return element;
	}
	// implement closed captioning



	// allow users to change control colors
	
	////////////////////////////////////////////////////////////////////////////////
	// event handlers
	////////////////////////////////////////////////////////////////////////////////
	
	skin.addEventListener('click', (e) => {
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

		} else if (name	!== 'mevp_nav') {
			togglePause();
		}	
	});
	
	// keep users from right clicking and showing browser controls
	skin.addEventListener('contextmenu', (e) => {
		if (e.target.className	=== 'custom_player') {
			e.preventDefault();
		}
	});
	
	player.addEventListener("timeupdate", () => {
		updateCurrent();
	});
	
	player.addEventListener("resize", () => {
		placeNav();
		updateDuration();
	});
	
	window.addEventListener("resize", () => {
		placeNav();
		placeVolume();
	});
	
	document.addEventListener("webkitfullscreenchange", () => {
		if (isFullScreen === false) {
			isFullScreen = true;
		} else {
			const fullButton = document.querySelector(".mevp_normalscreen");
			fullButton.className = "mevp_fullscreen";
			normalProperties(player);
			normalProperties(navUL);
			isFullScreen = false;
		}	
	});
	
	volumeSlider.oninput = function() {
	  adjustVolume();
	};
	
	//////////////////////////////////////////////////////////////////////
	// Main
	//////////////////////////////////////////////////////////////////////
	
	loadPlayer();
	
});




