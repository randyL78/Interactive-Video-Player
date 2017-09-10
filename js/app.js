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
	
		// variables, set to defaults
	let isFullScreen = false;
//	let ccMode = 1;				// default showing only one line at a time
	
	// functions
	function createControlsLI(text) {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.textContent = text;
		li.className = "mevp_" + text;
		li.appendChild(a);
		return li;
	}
	
	// Calculate the difference between the heights of 2 elements so that one can float at the bottom of the other
	function placeAtBottom(baseElement, topElement) {
		const baseHeight = getPosition(baseElement, "bottom");
		const topHeight = getHeight(topElement);
		const computeHeight = (baseHeight - topHeight) + "px";
		
		return computeHeight;
	}
	
	
	// Get top, botom, left or right position of an element
	function getPosition(element, position) {
		return (element.getBoundingClientRect()[position]);
	}
	
	function getHeight(element) {
		let elemHeight = window.getComputedStyle(element).getPropertyValue("height");
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
	
	// wrap video element in custom container
	skin.className	= "mevp_skin";
	container.insertBefore(skin, player);
	container.removeChild(player);
	skin.appendChild(player);
	
	// add custom controls to container
	if (player.getAttribute("controls")) {
		player.removeAttribute("controls");
		navUL.appendChild(createControlsLI("play"));
		navUL.appendChild(createControlsLI("fullscreen"));
		navUL.className = "mevp_nav";
		skin.appendChild(navUL);
		navUL.style.top = placeAtBottom(player, navUL);

	}

	// implement closed captioning



	// allow users to change control colors
	
// event handlers
	skin.addEventListener('click', (e) => {
		const controlClicked = e.target;
		if (controlClicked.className	=== 'mevp_fullscreen') {
			toggleFullScreen();
		} else if (controlClicked.className	!== 'mevp_nav') {
			togglePause();
		}	
	
	});
	
	player.addEventListener("resize", () => {
		navUL.style.top = placeAtBottom(player, navUL);
	});
	
	window.addEventListener("resize", () => {
		navUL.style.top = placeAtBottom(player, navUL);
	});
	
	document.addEventListener("webkitfullscreenchange", () => {
		if (isFullScreen === false) {
			isFullScreen = true;
		} else {
			normalProperties(player);
			normalProperties(navUL);
			isFullScreen = false;
		}
	});

	
});


