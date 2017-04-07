//importing the various node packages required for this app
let fs = require('fs');

//setting the user command to a variable, or to a string if no arguments are included
let userCmd = process.argv[2] || 'No arguments passed.';

//similarly, setting anything after the command argument to a search term, or to a blank string if nothing is provided
let searchTerm = process.argv[3] || '';

//turning that potential array into a string
for( var i = 4; i < process.argv.length ; i++){
	searchTerm += ' ' + process.argv[i];
}

//log out the search performed
fs.appendFile('log.txt', userCmd + ' ' + searchTerm + '\n', 'utf-8', function(err){
		if(err){
			console.log('There were errors: ' + err);
		}
});

runCommands( userCmd, searchTerm );

function runCommands( cmd, search ){
	//switch statement to perform the appropriate action
	switch( cmd ){

		case 'my-tweets':
			getTweets();
			break;

		case 'spotify-this-song':
			songSpotify( search );
			break;

		case 'movie-this':
			movieLookup( search );
			break;

		case 'do-what-it-says':
			doRandom();
			break;

		//if no command issued, prompt the user to enter one.
		default:
			console.log('Please add a command: my-tweets, spotify-this-song, movie-this, or do-what-it-says')
	}

}



function songSpotify( searchTerm ){
	//importing the various node packages required for this function
	let spotify = require('spotify');
	//if nothing is entered for a searchTerm, it sets a default
	if( searchTerm == ''){
		searchTerm = 'The Sign Ace of Base';
	}

	//spotify API call
	spotify.search({ type: 'track', query: searchTerm }, function(err, data) {
	    if ( err ) { //error handling
	        console.log('Error occurred: ' + err);
	        return;
	    }
	 	
	 	//output the requested info
	    let output = 'Artist: ' + data.tracks.items[0].artists[0].name + '\n' +
	    			 'Song Title: ' + data.tracks.items[0].name + '\n' +
	    			 'Album: ' + data.tracks.items[0].album.name + '\n' +
	    			 'Preview: ' + data.tracks.items[0].preview_url + '\n' 

	    //display and log the output	 	     
	  	displayAndLog( output ); 
	});
}

function getTweets(){
	//importing the various node packages required for this function
	let twitter = require('twitter');
	let twitterKeys = require('./keys.js');
	let client = twitter( twitterKeys.twitterKeys );
	//gets tweets and retweets made by user, limited to 20 responses
	client.get('statuses/user_timeline', {count: 20}, function(error, tweets, response) {
	  if(error) throw error;
	  //parse and store the response body
	  let body = JSON.parse( response.body );
	  
	  //iterate through body array and display the tweet creation time + the tweet itself
	  for(let i = 0; i < body.length; i++){
	  	let output = '------------' + '\n' + 
	  				 body[i].created_at  + '\n' + 
	  				 body[i].text  + '\n'
	  	//display and log the output
	  	displayAndLog( output ); 			 
	  }
	  
	});
}

function movieLookup( searchTerm ){
	//importing the various node packages required for this function
	let request = require('request');
	if( searchTerm == ''){
		searchTerm = 'Mr. Nobody';
	}
	//build the queryURL
	var queryURL = "http://www.omdbapi.com/?t=" + searchTerm + "&y=&plot=short&r=json"; 
	//run the request with the above queryURL
	request( queryURL, function(error, response, body){ 
		if( !error && response.statusCode === 200){ // if the request is successful, do the below
			
			if(JSON.parse(body).Response === 'False' ){//if the API doesn't find a movie, say so
				console.log('No movie was found.')
			}

			else{ //otherwise print a whole bunch of stuff
				let movie = JSON.parse(body);
				let output = 'Title: ' + movie.Title  + '\n' + 
	  				 	     'Year: ' + movie.Year  + '\n' + 
	  				 	     'IMDb Rating: ' + movie.imdbRating  + '\n' + 
	  				 	     'Country: ' + movie.Country  + '\n' + 
	  				 	     'Language: ' + movie.Language  + '\n' + 
	  				 	     'Plot: ' + movie.Plot  + '\n' + 
	  				 	     'Starring: ' + movie.Actors  + '\n'
	  			//display and log the output	 	     
	  			displayAndLog( output ); 	     
			}
			

		}

	})
}

function displayAndLog( output ){
	//display output on screen			 
  	console.log( output );
  	//log output to log file
  	fs.appendFile('log.txt', output + '\n', 'utf-8', function(err){
		if(err){
			console.log('There were errors: ' + err);
		}
  	});
}

function doRandom(){
	//use fs to read contents of random.txt
	fs.readFile('random.txt', 'utf8', function(err, data){
	 	//splits string at every comma
	 	let args = data.split(',');
	 	//call the commands function with the data from the txt file as arguments
	 	runCommands(args[0], args[1])
	});
}