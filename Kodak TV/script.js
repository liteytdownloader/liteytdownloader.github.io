var totalFilmsDuration = 0, 
setplayerTime = -1, 
delayHandler = -1, 
lastUpdatedOffline = -1, 
_filmsContainer = document.querySelector(".filmsContainer");

var player = videojs('my-player');

var qualityLevels = player.qualityLevels();

var activeURL = null, activeID = -1, IsLiveStream = false, refreshingTimer = null, errorsOnRow = 0, _isFullScreen = false;

function loadLastPlayed() {
	let lastMovie = localStorage.getItem("lastMovie");
	if (lastMovie != null) {
		lastMovie = JSON.parse(lastMovie);
		document.querySelector("video").setAttribute("poster", "https://s35.upera.net/thumb?w=450&h=666&q=90&src=" + lastMovie.Thumb);
		setplayerTime = lastMovie.currentTime;
		activeID = lastMovie.EID;
		activeURL = lastMovie.HLS;
		
		let movieType = ((lastMovie.HLS.includes(".m3u8")) ? ('application/x-mpegURL') : ('video/mp4'));
		
		player.src({
		  src: lastMovie.HLS,
		  type: movieType
		});
	}
}

var searchQueryInput = document.querySelector("input"), unmuteElement = document.querySelector(".Unmute");
searchQueryInput.oninput = function() {
	SearchFilm(this.value);
};

document.querySelector(".PlaybackStatus").onclick = function() {
	SwitchStatus();
};

unmuteElement.onclick = function() {
	UnmuteStream();
};

document.querySelector(".aboutUS").onclick = function() {
	document.querySelector(".Credits").style.display = "block";
};

_filmsContainer.addEventListener("scroll", scrollHandler);

qualityLevels.on('addqualitylevel', function(event) {	
	let qualitLevel = event.qualityLevel;
	let height = qualitLevel.height;
	
	if (qualitLevel.width < qualitLevel.height) {
		qualitLevel.height = qualitLevel.width;	
		qualitLevel.width = height;
	}
});

player.ready(function() {
	player.qualityMenu();
	
	player.on('play', () => {
		if (refreshingTimer != null) {
			clearTimeout(refreshingTimer);
			refreshingTimer = null;
		}
	});
	
	player.on("ended", function(){
		if (IsLiveStreamOn()) {
			LoadLiveTVStream(true, false);
		}
		else {
			PlayNextMovieEpisode();
		}
	});
	
	player.on('timeupdate', function () {
		if (!IsLiveStream) {
			if (lastUpdatedOffline == -1) {
				lastUpdatedOffline = this.currentTime();		
				UpdatedOfflinePosition(lastUpdatedOffline);
			}
			else if (Math.abs(this.currentTime() - lastUpdatedOffline) >= 10) {
				lastUpdatedOffline = this.currentTime();
				UpdatedOfflinePosition(lastUpdatedOffline);
			}
		}	
	});
	
	player.on("canplaythrough", function() {
		errorsOnRow = 0;
		if (setplayerTime != -1) {
			if (delayHandler != -1) { // accurate live stream
				player.currentTime(setplayerTime + ((Date.now() - delayHandler) / 1000));
			}
			else { // offline playback
				player.currentTime(setplayerTime);
			}				
			setplayerTime = -1;
		}
	});
	
	player.on("error", function() {
		
		errorsOnRow++;
		if (errorsOnRow > 2) {
			//errorsOnRow = 0;
			//ShowInternetError();
		}
		if (IsLiveStreamOn()) {
			refreshingTimer = setTimeout(function() {
				LoadLiveTVStream(true, false);
			}, 1000);	
		}
		else {
			refreshingTimer = setTimeout(function() {
				loadLastPlayed();
			}, 1000);
		}
	});
	
	player.on("fullscreenchange", function() {
		_isFullScreen = player.isFullscreen();
		
		if (!_isFullScreen) {
			ResetVideoScale();
		}
		else {
			let videoPlayerElement = document.querySelector("video");
			videoPlayerElement.style.transition = "transform 0.1s ease";
		}
	});
	
	loadLastPlayed();
	
	parseMoviesList();
	
	HandleTouchZoom();
});

function UpdatedOfflinePosition(position) {
	let lastMovie = localStorage.getItem("lastMovie");
	if (lastMovie != null) {
		lastMovie = JSON.parse(lastMovie);
		lastMovie.currentTime = position;
		
		localStorage.setItem("lastMovie", JSON.stringify(lastMovie));
	}
}

function parseMoviesList() {	
	let shuffledIDS = ShuffleList(moviesList.Movies.length);
	totalFilmsDuration = +moviesList.FullLoop;
	let filmsContainer = document.querySelector(".filmsContainer");
	filmsContainer.innerHTML = "";
	
	for (let a = (moviesList.Movies.length - 1), c = 0; a >= 0; a--) {
		
		let i = shuffledIDS[a];
		let filmItem = document.createElement("div");
		filmItem.className = "filmItem";
		filmItem.id = "F" + i;			
		if (c > 50) {
			filmItem.className += " hideItem";
		}
		c++;
		let filmItemPic = document.createElement("div");
		filmItemPic.className = "filmItemPic";
		filmItemPic.style = "--thumb: url('https://s35.upera.net/thumb?w=450&h=666&q=90&src=" + moviesList.Movies[i].Thumb + "')";
		let myID = i;
		filmItemPic.onclick = function() {
			if (!PlayMyEpisodeIfNeccessary(filmItem, myID)) {
				ShowFilmEpisodes(filmItem, myID);
			}
		};
		
		let filmItemText = document.createElement("div");
		filmItemText.className = "filmItemText";
		if (moviesList.Movies[i].Episodes.length == 1) {		
			filmItemText.innerHTML = '<i class="fa-solid fa-camera-movie fa-flip-horizontal"></i> ' + moviesList.Movies[i].Title.replace(/\s+/g,' ');
		}
		else {
			filmItemText.innerHTML = '<i class="fa-solid fa-clapperboard-play"></i> ' + moviesList.Movies[i].Title.replace(/\s+/g,' ');
		}
		filmItemText.setAttribute("eid", i);
		filmItemPic.appendChild(filmItemText);
		
		filmItem.appendChild(filmItemPic);

		if (activeID == myID) {
			filmItem.className = "filmItem";
			filmsContainer.insertBefore(filmItem, filmsContainer.firstChild);
		}
		else {
			filmsContainer.appendChild(filmItem);
		}
	}
	
	if (IsLiveStreamOn()) {
		LoadLiveTVStream(false, false);
	}
	else {
		document.querySelector(".Unmute").style.display = "none";
		SetStreamStatus(false);
	}
}

function ShowFilmEpisodes(parentElem, filmID) {
	let episodesShower = document.querySelector(".filmEpisodesContainer");
	episodesShower.style.opacity = 0;
	
	episodesShower.innerHTML = "";
	
	let filmCover = document.createElement("div");
	filmCover.className = "filmCover";
	filmCover.style = "--thumb: url('https://s35.upera.net/thumb?w=450&h=666&q=90&src=" + moviesList.Movies[filmID].Thumb + "')";
	episodesShower.appendChild(filmCover);
	
	let episodeID = 1, seaseonID = -1;
	for (let a = 0; a < moviesList.Movies[filmID].Episodes.length; a++) {
		let filmEpisode = document.createElement("div");
		filmEpisode.className = "filmEpisode";
		filmEpisode.id = StringToINT(moviesList.Movies[filmID].Episodes[a].hls);
		if ('Title' in moviesList.Movies[filmID].Episodes[a]) {
			filmEpisode.innerText = moviesList.Movies[filmID].Episodes[a].Title;
		}
		else {
			filmEpisode.className = "filmEpisode serial";
			if ('SE' in moviesList.Movies[filmID].Episodes[a]) {
				if (seaseonID != moviesList.Movies[filmID].Episodes[a].SE) {					
					episodeID = 1;
					
					if (seaseonID != -1) {
						episodesShower.appendChild(document.createElement("br"));
						episodesShower.appendChild(document.createElement("br"));
					}
					
					seaseonID = moviesList.Movies[filmID].Episodes[a].SE;
				}
			
				filmEpisode.innerText = "فصل " + NumbersToPersian(moviesList.Movies[filmID].Episodes[a].SE) + " - قسمت " + NumbersToPersian(episodeID);
			}
			else {			
				if (seaseonID != -1) {
					episodeID = 1;
					seaseonID = -1;
				}
				
				filmEpisode.innerText = "قسمت " + NumbersToPersian(episodeID);
			}
			episodeID++;
		}
		
		if (activeURL != null && moviesList.Movies[filmID].Episodes[a].hls === activeURL) {
			filmEpisode.className += " Active";
		}
		
		let mythumb = moviesList.Movies[filmID].Thumb;
		let myfilmID = filmID, myEpisode = a;
		filmEpisode.onclick = function() {
			localStorage.setItem("lastMovie", JSON.stringify({Thumb: mythumb, HLS: moviesList.Movies[myfilmID].Episodes[myEpisode].hls, EID: myfilmID, EP: myEpisode, currentTime: 0}));		
			setplayerTime = -1;
			PlayEpisode(myfilmID, moviesList.Movies[myfilmID].Episodes[myEpisode].hls, mythumb, false);
			SetStreamStatus(false);
			
			let activeOne = document.querySelector(".filmEpisode.Active");
			if (activeOne != null) {
				activeOne.className = activeOne.className.replace(" Active", "");
			}
			filmEpisode.className += " Active";
			
			// Make first
			let filmsContainer = document.querySelector(".filmsContainer");
			filmsContainer.insertBefore(parentElem, filmsContainer.firstChild);
		};
		episodesShower.appendChild(filmEpisode);
	}
	
	let gobackScript = document.createElement("div");
	gobackScript.className = "filmgoBack";
	gobackScript.innerHTML = 'بازگشت به عقب <i class="fa-duotone fa-solid fa-circle-arrow-left" style="--fa-primary-color: #000000; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 1;"></i>';
	
	gobackScript.onclick = function() {
		HideFilmEpisodes();
	};
	episodesShower.appendChild(gobackScript);
	
	episodesShower.style.display = "block";
	requestAnimationFrame(function() {
		episodesShower.style.opacity = 1;
	});
}

function PlayMyEpisodeIfNeccessary(parentElem, myfilmID) {
	if (moviesList.Movies[myfilmID].Episodes.length == 1) {
		localStorage.setItem("lastMovie", JSON.stringify({Thumb: moviesList.Movies[myfilmID].Thumb, HLS: moviesList.Movies[myfilmID].Episodes[0].hls, EID: myfilmID, EP: 0, currentTime: 0}));		
		setplayerTime = -1;
		PlayEpisode(myfilmID, moviesList.Movies[myfilmID].Episodes[0].hls, moviesList.Movies[myfilmID].Thumb, false);
		SetStreamStatus(false);
		
		let activeOne = document.querySelector(".filmEpisode.Active");
		if (activeOne != null) {
			activeOne.className = activeOne.className.replace(" Active", "");
		}
		
		// Make first
		
		setTimeout(function() {
			parentElem = document.getElementById(parentElem.id);
			let filmsContainer = document.querySelector(".filmsContainer");
			filmsContainer.insertBefore(parentElem, filmsContainer.firstChild);
		}, 2000);
	
		return true;
	}
	else {
		return false;
	}
}

function HideFilmEpisodes() {
	let episodesShower = document.querySelector(".filmEpisodesContainer");
	episodesShower.style.opacity = 0;
	setTimeout(function() {
		episodesShower.style.display = "none";
		episodesShower.innerHTML = "";
	}, 270);
}

function PlayEpisode(filmID, episodehls, thumbnail, autoplay) {
	if (autoplay) {		 
		player.muted(true);
	}
	else {
		player.muted(false);
		ShowRatingIfNeccessary();
	}

	let videoElem = document.querySelector("video");
	if (videoElem != null) {
		videoElem.setAttribute("poster", "https://s35.upera.net/thumb?w=450&h=666&q=90&src=" + thumbnail);
	}

	activeID = filmID;
	activeURL = episodehls;
	player.currentTime(0);
	
	let movieType = ((episodehls.includes(".m3u8")) ? ('application/x-mpegURL') : ('video/mp4'));
	player.src({
	  src: episodehls,
	  type: movieType
	});
	player.play();		
}

function NumbersToPersian(input) {
	input = input + "";
	var id = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
	 return input.replace(/[0-9]/g, function(w){
		return id[+w];
	 });
}

function SearchFilm(filmName) {
	filmName = filmName.replace(/[\u200B-\u200D\uFEFF]/g, ' ').replace(/\s+/g,' ').trim();
	if (filmName.length > 2) {
		let availableMovies = document.querySelectorAll(".filmItemText");
		for (let i = (availableMovies.length - 1); i > -1; i--) {
			if (!availableMovies[i].innerText.replace(/[\u200B-\u200D\uFEFF]/g, ' ').replace(/\s+/g,' ').includes(filmName)) {
				availableMovies[i].parentNode.parentNode.className = "filmItem hideItem";
			}
			else {
				availableMovies[i].parentNode.parentNode.className = "filmItem";
			}
		}
	}
	else {
		let hidElements = document.querySelectorAll(".filmItem");
		for (let i = 0, j = hidElements.length; i < j; i++) {
			hidElements[i].className = "filmItem";
			if (i > 50) {
				hidElements[i].className = "filmItem hideItem";
			}
		}
	}
}

function ShuffleList(listLength) {
	let baseThing = Array.from(Array(listLength).keys());
	
	let outputList = [];
	while (listLength > 0) {
		let currentID = Math.floor(Math.random() * listLength);
		outputList.push(baseThing[currentID]);
		baseThing.splice(currentID, 1);
		
		listLength--;
	}
	
	return outputList;
}

function LoadLiveTVStream(NextMovie, UserTrigger) {
	if (totalFilmsDuration == 0) {
		SetStreamStatus(false);
		return;
	}
	
	SetStreamStatus(true);
	
	let timeStamped = (Date.now() - moviesList.Updated) / 1000;
	if (NextMovie) {
		timeStamped += 1;
	}
	
	if (timeStamped > totalFilmsDuration) {
		timeStamped -= totalFilmsDuration * Math.floor(timeStamped / totalFilmsDuration);
	}
	
	localStorage.removeItem("lastMovie");
	
	let totalCounted = 0, episodeID = 0;
	for (let i = 0, j = moviesList.Movies.length; i < j; i++) {	
		let howEpisodes = moviesList.Movies[i].Episodes.length;
		
		let whichEpisode = episodeID;
		if (howEpisodes <= episodeID) {
			whichEpisode -= howEpisodes * Math.floor(episodeID / howEpisodes);
		}
		
		if ('duration' in moviesList.Movies[i].Episodes[whichEpisode] && !(episodeID > 0 && howEpisodes == 1)) {
			totalCounted += +moviesList.Movies[i].Episodes[whichEpisode].duration;
			if (totalCounted >= timeStamped) {
				totalCounted -= +moviesList.Movies[i].Episodes[whichEpisode].duration;
				
				let setcurrenTimeAt = timeStamped - totalCounted;
				setplayerTime = setcurrenTimeAt;
				delayHandler = Date.now();
				
				PlayEpisode(i, moviesList.Movies[i].Episodes[whichEpisode].hls, moviesList.Movies[i].Thumb, (NextMovie == false && UserTrigger == false));
				
				let filmItem = document.getElementById("F" + i);
				if (filmItem != null) {
					if (filmItem.className.includes("hideItem") && searchQueryInput.value.length < 3) { 
						filmItem.className = "filmItem";
					}
					filmItem.parentNode.insertBefore(filmItem, filmItem.parentNode.firstChild);
				}
				break;
			}
		}
		
		if (i == (j - 1)) {
			episodeID++;
			i = 0;
		}
	}
}

function IsLiveStreamOn() {
	return (localStorage.getItem("lastMovie") == null);
}

function PlayNextMovieEpisode() {
	let lastPlay = localStorage.getItem("lastMovie");
	if (lastPlay != null) {
		lastPlay = JSON.parse(lastPlay);

		let episodesCount = moviesList.Movies[lastPlay.EID].Episodes.length, nextEpisode = (lastPlay.EP + 1);
		if (nextEpisode >= episodesCount) {
			nextEpisode = 0;
		}
		
		let myfilmID = lastPlay.EID, myEpisode = nextEpisode, mythumb = moviesList.Movies[myfilmID].Thumb;
		localStorage.setItem("lastMovie", JSON.stringify({Thumb: mythumb, HLS: moviesList.Movies[myfilmID].Episodes[myEpisode].hls, EID: myfilmID, EP: myEpisode, currentTime: 0}));		
		setplayerTime = -1;
		PlayEpisode(myfilmID, moviesList.Movies[myfilmID].Episodes[myEpisode].hls, mythumb, false);
		
		let activeOne = document.querySelector(".filmEpisode.Active");
		if (activeOne != null) {
			activeOne.className = activeOne.className.replace(" Active", "");
		}
		
		let filmEpisode = document.getElementById(StringToINT(moviesList.Movies[myfilmID].Episodes[myEpisode].hls));
		if (filmEpisode != null) {
			filmEpisode.className += " Active";
		}
	}
}

function SetStreamStatus(Online) {
	let targetStatus = document.querySelector(".PlaybackStatus");
	if (targetStatus == null)
		return;
		
	if (Online) {
		player.controlBar.progressControl.disable();
		IsLiveStream = true;
		targetStatus.className = "PlaybackStatus Online";
	}
	else {
		player.controlBar.progressControl.enable();
		IsLiveStream = false;
		targetStatus.className = "PlaybackStatus Offline";
	}
}

function SwitchStatus() {
	let targetStatus = document.querySelector(".PlaybackStatus");
	if (targetStatus == null)
		return;
		
	if (!targetStatus.className.includes("Online")) {
		targetStatus.className = "PlaybackStatus Online";
		LoadLiveTVStream(false, true);
	}
}

function UnmuteStream() {
	player.muted(false);
		
	unmuteElement.style.display = "none";
}

function StringToINT(inputString) {
  var hash = 0, i, chr;
  if (inputString.length === 0) return hash;
  
  for (i = 0; i < inputString.length; i++) {
	chr = inputString.charCodeAt(i);
	hash = ((hash << 5) - hash) + chr;
	hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function PerformBackAction() {
	let episodesShower = document.querySelector(".filmEpisodesContainer"),
		rateContainerHolder = document.querySelector(".rateContainerHolder");
	
	if (rateContainerHolder.style.display === "block") {
		HideRating(rateContainerHolder, true);
		return true;
	}
	else if (episodesShower.style.display === "block") {
		HideFilmEpisodes();
		return true;
	}
	else if (searchQueryInput.value.length >= 3) {
		searchQueryInput.value = "";
		SearchFilm("");
		return true;
	}
	else if (document.querySelector(".Credits").style.display === "block") {
		document.querySelector(".Credits").style.display = "none";
		return true;
	}
	return false;
}

function ReloadMoviesList() {
	let oldScript = document.getElementById("moviesList");
	if (oldScript != null)
		oldScript.remove();

	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.id = "moviesList";
	script.src = 'movies.js?i=' + Date.now();
	script.onload = function() {
		parseMoviesList();
		//console.log(moviesList);
	};
	head.appendChild(script);	
}

function scrollHandler(event) {
	if (searchQueryInput.value.length >= 3)
		return;

	let hiddenElements = document.querySelector(".filmItem.hideItem");
	if (hiddenElements != null) {
		let scrollPositionAt = _filmsContainer.scrollTop + _filmsContainer.offsetHeight, lastItemAt = hiddenElements.previousSibling.offsetTop;
		if ((scrollPositionAt + 300) >= lastItemAt) {
			hiddenElements = document.querySelectorAll(".filmItem.hideItem");
			for (let i = 0, j = hiddenElements.length; i < j && i < 50; i++) {
				hiddenElements[i].className = "filmItem";
			}
		}
	}
}

/*
function PlayRandomFilm(element) {
	let episodes = element.parentNode.querySelector(".filmEpisodes").children;
	episodes[Math.floor(Math.random() * episodes.length)].click();
}
*/

function ShowInternetError() {
	let internetElement = document.querySelector(".internerError");
	if (internetElement != null && internetElement.style.display !== "block") {
		internetElement.innerHTML = '<i class="fa-duotone fa-solid fa-wifi-exclamation"></i> از وصل بودن اینترنت مطمئن شوید';
		
		internetElement.style.opacity = 0;
		internetElement.style.display = "block";
		
		requestAnimationFrame(function() {
			internetElement.style.opacity = 1;
			setTimeout(function() {
				internetElement.style.opacity = 0;
				setTimeout(function() {
					internetElement.style.display = "none";
				}, 200);
			}, 3000);
		});
	}
}

function ShowVPNError() {
	let internetElement = document.querySelector(".internerError");
	if (internetElement != null && internetElement.style.display !== "block") {
		internetElement.innerHTML = '<i class="fa-duotone fa-solid fa-wifi-exclamation"></i> وی‌پی‌ان خودرا خاموش کنید';
		
		internetElement.style.opacity = 0;
		internetElement.style.display = "block";
		
		requestAnimationFrame(function() {
			internetElement.style.opacity = 1;
			setTimeout(function() {
				internetElement.style.opacity = 0;
				setTimeout(function() {
					internetElement.style.display = "none";
				}, 200);
			}, 3000);
		});
	}
}

function HandleTouchZoom() {
	let videoElement = document.querySelector("video");
	
	let touchOne = null, touchTwo = null;
	
	function currentTransformValue(inputScale) {
		if (inputScale == null)
			return 1.00;
		
		let where = inputScale.indexOf('(');
		if (where == -1) {
			return 1.00;
		}
		else {
			finish = inputScale.indexOf(')', where);
			where++;
			
			return parseFloat(inputScale.substr(where, finish - where));
		}
	}
	
	videoElement.addEventListener("touchstart", function(event) {
		if (_isFullScreen && event.touches.length == 2) {
			touchOne = [event.touches[0].clientX, event.touches[0].clientY];
			touchTwo = [event.touches[1].clientX, event.touches[1].clientY];
		}
		else if (!_isFullScreen || event.touches.length < 2) {
			touchOne = null;
			touchTwo = null;
		}
	});
	videoElement.addEventListener("touchmove", function(event) {
		if (_isFullScreen && event.touches.length == 2 && touchOne != null && touchTwo != null) {
			let oldDistance = Math.abs(touchOne[0] - touchTwo[0]) + Math.abs(touchOne[1] - touchTwo[1]),
			newDistance = Math.abs(event.touches[0].clientX - event.touches[1].clientX) + Math.abs(event.touches[0].clientY - event.touches[1].clientY);
			
			let setScale = Math.round((newDistance - oldDistance) / 2.7);
			if (Math.abs(setScale) < 1)
				return;
			
			if (setScale < -50)
				setScale = -50;
			
			if (setScale > 50)
				setScale = 50;
			
			let videoPlayerElement = document.querySelector("video");
			let newValue = currentTransformValue(videoPlayerElement.style.transform) + parseFloat((setScale / 100).toFixed(2));
			if (newValue < 1)
				newValue = 1;
			
			if (newValue > 1.5)
				newValue = 1.5;
				
			videoPlayerElement.style.transform = "scale(" + newValue + ")";
			touchOne = [event.touches[0].clientX, event.touches[0].clientY];
			touchTwo = [event.touches[1].clientX, event.touches[1].clientY];
		}
		else if (!_isFullScreen || event.touches.length < 2) {
			touchOne = null;
			touchTwo = null;
		}
	});
}

function ResetVideoScale() {
	let videoPlayerElement = document.querySelector("video");
	videoPlayerElement.style.transition = "none";
	videoPlayerElement.style.transform = "none";
}

var ratingAlreadyShowed = false;
function ShowRatingIfNeccessary() {
	if (ratingAlreadyShowed)
		return;
	
	let playedCount = localStorage.getItem("playedEpisodes");
	if (playedCount != null)
		playedCount = parseInt(playedCount);
	else
		playedCount = 0;
	
	if (playedCount > 4) {
		ratingAlreadyShowed = true;
		return;
	}
	
	playedCount++;
	
	if (playedCount == 4) {
		ratingAlreadyShowed = true;
		playedCount++;
		ShowRating();
	}
	
	localStorage.setItem("playedEpisodes", playedCount);
}

function ShowRating() {
	let rateContainerHolder = document.querySelector(".rateContainerHolder");
	rateContainerHolder.style.opacity = 0;
	rateContainerHolder.style.display = "block";
	
	setTimeout(function() {
		rateContainerHolder.style.opacity = 1;
	}, 50);
	
	let rateButtons = rateContainerHolder.querySelectorAll(".rateButton");
	
	if (rateButtons.length == 2) {
			rateButtons[0].onclick = function() {
				if (typeof(JavaInstance) != null) {
					JavaInstance.myKetRate();
				}
				HideRating(rateContainerHolder, false);
			};
			
			rateButtons[1].onclick = function() {
				HideRating(rateContainerHolder, false);
			};
	}
}

function HideRating(rateContainerHolder, showAgain) {
	rateContainerHolder.style.opacity = 0;
	setTimeout(function() {
		rateContainerHolder.style.display = "none";
	}, 200);
	
	if (showAgain) {
		localStorage.setItem("playedEpisodes", -5);
	}
}