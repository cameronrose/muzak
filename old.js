var demo = angular.module("demo", []);

// gets artist from Spotify
demo.factory("artist", function($http){
	return function(artistName){
	    return $http ({ 
	        method: "GET", 
	        url: "https://api.spotify.com/v1/search/",
	        params: {
			  	q: artistName,
			  	type: "artist"
		  	}
	    })
	};
}); // end of artist
// gets songs from Spotify
demo.factory("songs", function($http){
	return function(artist_id){
	    return $http ({ 
	        method: "GET", 
	        url: "https://api.spotify.com/v1/artists/" + artist_id + "/top-tracks?country=US"
	    })
	};
}); // end of songs
// gets artist from Discogs
demo.factory("artistInfo", function($http){
	return function(artistName){
	    var secret_key = "OcuHHDfOEJrlKlNaLVAFCjBLzQqPfmvq";
	    return $http ({ 
	        method: "GET", 
	        url: "https://api.discogs.com//database/search?",
	        params: {
			  	q: artistName,
			  	type: "artist",
			  	key: "FrEJfCEeKbnHxmsEAvJA",
			  	secret: secret_key
		  	}
	    })
	};
}); // end of artist
// gets artist info from Discogs
demo.factory("info", function($http){
	return function(artist_id){
	    return $http ({ 
	        method: "GET", 
	        url: "https://api.discogs.com/artists/" + artist_id
	    })
	};
}); // end of songs

demo.controller("ctrl", function($scope, artist, songs, artistInfo, info, $sce){
// Variables used with ng-show
	$scope.showAudioPlayer = false;
	$scope.showSearchResults = false;
	$scope.showInfoIcon = false;
	$scope.showArtistSearchResults = false;
	$scope.showArtistInfo = false;
	$scope.mobileBack = false;
	$scope.activePlay = false;
	$scope.activePause = false;
	$scope.artistInfoWidth = "0";
	$scope.multiResultsWidth = "0";
	$scope.sectionOpacity = "1";
	$scope.headerPadding = "padding-top: 20px;";
	$scope.audioSource = "#";
	$scope.artistImageSource = "#";
	$scope.albumImageSource = "#";
	$scope.albumSongInfo = "#";
	$scope.songName = "DEMO";
	$scope.albumName = "DEMO";
	$scope.screenSizeCheck = window.innerWidth < 1099 || window.innerHeight < 500;

// Grabs the artist Name from the search bar
	$scope.sendArtistData = function(currentArtistName) {
		$scope.findArtist(currentArtistName);
	};
// Uses Spotify to find artist id. If there are multiple results a div will pop up. If not than it skips that step
	$scope.findArtist =  function(artistName) {			
		artist(artistName).success(function (results) {
		  	$scope.artist_list = results.artists.items;
		  	$scope.currentArtistId = $scope.artist_list[0].id;
		  	$scope.artist_list_length = $scope.artist_list.length;

		  	if($scope.artist_list_length > 1) {
		  		$scope.multipleResults();
		  	} else if ($scope.artist_list_length === 1) {
		  		$scope.getSongs(currentArtistId);
		  		$scope.findArtistInfo(artistName);
		  	} else {
		  		alert("That artist was not found!");
		  	}
		})
	};
// Uses Discogs to search for artist info
	$scope.findArtistInfo = function(artistName) {
		artistInfo(artistName).success(function (artistInfo_results) {
		  	$scope.artistNames = [];
		  	$scope.result_length = artistInfo_results.results.length;
		  	$scope.artistNameData = artistInfo_results.results[i].title;
		  	$scope.artistId = artistInfo_results.results[i].id;
		  	for(i = 0; i < $scope.result_length; i++) {
		  		$scope.paren = artistInfo_results.results[i].title.indexOf("(");
		  		$scope.artistNames_item = {
		  			name: $scope.artistNameData,
		  			id: $scope.artistId
		  		};
		  		if($scope.paren != -1) {
			  		$scope.artistNames_item = {
			  			name: $scope.artistNameData.slice(0, -4),
			  			id: $scope.artistId
			  		};
		  		}
		  		$scope.artistNames.push($scope.artistNames_item);

		  		if (artistName === $scope.artistNames[i].name) {
                    $scope.newId = $scope.artistNames[i].id;
                  	$scope.artistImageSource = artistInfo_results.results[i].thumb;
                    $scope.getArtistInfo($scope.newId);
                    break;
				};
		  	};
		});
	};
// Displays multiple results
	$scope.multipleResults = function() {
		$scope.showArtistSearchResults = true;

		if ($scope.screenSizeCheck) {
			$scope.multiResultsWidth = "100%";
		} else {
			$scope.multiResultsWidth = "30%";
		}
	};
// Goes back to Spotify to find the artist ID for whatever artist the user selects from the listing
	$scope.multipleResultsFindArtist = function(){
		$scope.newArtistName = this.item.name;
		$scope.newArtistId = this.item.id;
		$scope.getSongs($scope.newArtistId);
		$scope.findArtistInfo($scope.newArtistName);
		$scope.showSearchResults = true;
		$scope.showInfoIcon = true;
		$scope.showArtistSearchResults = false;
	};
// Pulls the artist info to populate the aside
	$scope.getArtistInfo = function(newId, artistName) {
		info(newId).success(function (artist_bio) {
		  	$scope.name = $scope.artistName;
		  	$scope.bio = artist_bio.uri;
		  	$scope.artist_urls = artist_bio.urls;
		});
	};
// Displays the aside
	$scope.showInfo = function() {
		$scope.showArtistInfo = !$scope.showArtistInfo;
		if ($scope.screenSizeCheck) {
			$scope.artistInfoWidth = "80%";
		} else {
			$scope.artistInfoWidth = "30%";
		}
	};
// Displays the custom audio player
	$scope.showPlayer = function() {
		if ($scope.screenSizeCheck) {
			$scope.showAudioPlayer = true;
			$scope.mobileBack = true;
			$scope.sectionOpacity = "0.2";
		}
		$scope.headerPadding = "padding: 20px 20px 0px 20px;";
	};
// Hides the player
	$scope.hidePlayer = function() {
		if ($scope.screenSizeCheck) {
			$scope.showAudioPlayer = false;
			$scope.sectionOpacity = "1";
		}
		$scope.headerPadding = "padding: 20px;";
		document.querySelector("#music").pause();
	};
// Retrieves songs from Spotify based on artist ID and pushes into array of tracks
	$scope.getSongs = function(artistId) {
		$scope.artist_id = artistId;
		songs($scope.artist_id).success(function (song_results) {
		  	$scope.tracks_list = [];
		  	for(i = 0; i < 10; i++) {
		  		$scope.track_item = {
					name: song_results.tracks[i].name,
					albumName: song_results.tracks[i].album.name,
					track_url: song_results.tracks[i].preview_url,
					albumArt: song_results.tracks[i].album.images[1].url,
					id: i
				}; 
				$scope.tracks_list.push($scope.track_item);
		  	};
		});
	};
// Plays the selected song and locates it in the tracks array
	$scope.playSongs = function(id) {
		$scope.itemNumber = id;
		$scope.audioSource = $sce.trustAsResourceUrl($scope.tracks_list[$scope.itemNumber].track_url); // Need to pass url from Spotify as a trusted url, otherwise it throws an error
		$scope.albumImageSource = $scope.tracks_list[$scope.itemNumber].albumArt;
		$scope.songName = $scope.tracks_list[$scope.itemNumber].name;
		$scope.albumName = $scope.tracks_list[$scope.itemNumber].albumName;
		document.querySelector("#music").load();
		$scope.showAudioPlayer = true;
		document.querySelector("#music").play();
		$scope.activePlay = true;
		$scope.activePause = false;
	};
// Stops song in player
	$scope.pauseSongs = function() {
		document.querySelector("#music").pause();
		$scope.activePause = true;
		$scope.activePlay = false;
	};
// Restarts song in player
	$scope.replaySongs = function() {
		document.querySelector("#music").play();
		$scope.activePlay = true;
		$scope.activePause = false;
	};

})
// Sets the audioPlayer directive for easy future use
demo.directive("audioPlayer", function() {
	return {
		templateUrl: "audio_player.html",
		restrict: "E",
		scope: true,
		transclude: true
	}
})