
$(function () {
	var transcript;
	var wordArray = [];

	//This section is what runs our speech recognition tool
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	//all the words are going to go 
	//into this array individually
	var stopClicked = false;
	//grabs our button that starts listening
	$(".mic-start-button").click(function (){
		wordArray = [];
		

		recognition.continuous = true;
		//starts the speech timer
		timer();
		//defines the recognition function --
		//not sure if this needs to be 
		//inside the onclick. Ask.
		
		recognition.onresult = function(event) { 
			recognition.continuous = true;
			console.log("onresult true");
			
			// "event.results[0][0].transcript" is our transcript of all the words
			transcript = event.results[0][0].transcript;
			console.log("Innitial transcript: " ,transcript);
			
			// This pushes each of the transcripts into the temp array,
			// and then adds each of the words into the wordArray
			tempArray = transcript.split(" ");
			for (i=0; i < tempArray.length; i++){
				wordArray.push(tempArray[i]);
			}
			
			console.log("WordArray: ", wordArray);
			
			// puts the words the user entered
			// onto the page next to the number of 
			// times the user used them

			//SHOW RESULTS --taken from here and put in stopclick
			
			//puts the transcript on the page REMOVED FROM HERE
			
		}
		recognition.start();
		console.log("starting!!")
		//calls listener function

		//console.log(fillers);
		
	}); //end onclick start

	var fillers = [];
	$('.actualWord').each(function() { 
	fillers.push($(this).html());
	});

	var pickFillers = function(transcript, fillers){
		fillers = fillers.map(function(value) {
    		return value.toLowerCase();
		});
		//console.log("transcript: " + transcript);
		// initializes an array that's the 
		// length of the filler words array
		var counts = counts || fillers.slice();
		counts.forEach(function(el,id,arr){
			arr[id] = 0;
		});
		if (fillers.indexOf("*swears") === -1 && counts.length < fillers.length + 1 ){
		counts.push(0);
		}

		// this is to add one at the end to count swears
		
		//cycles through filler words
		for (var k = 0; k < fillers.length; k++ ){
			var filler = fillers[k];
			counts[k] = 0;
			//counts[k] = counts[k] || 0;
			//if there's a space in the filler word...
			//which means that there are two words in the filler
			if (filler.indexOf(" ") != -1){
				var doubleWord = filler.split(" ");
				var d = doubleWord[0];
				var w = doubleWord[1];
				for (var i = 0; i < transcript.length-1; i++){
					// second comparison
					var j = i + 1;
					if (d === transcript[i] && w === transcript[j]){
						counts[k] += 1;
					}
				}
			} else {
				//cycles through whole transcript
				counts[counts.length-1] = 0;
				for (var q = 0; q < transcript.length; q++){
					if (transcript[q] === filler){
						counts[k] += 1;
					} else if (transcript[q][1] === "*"){ //THIS NEEDS TO BE MADE CONDITIONAL
						counts[counts.length-1] += 1;
					}
				} 
			}
		}
		console.log("fillers:", fillers);
		console.log("Counts: ", counts);
		//counts[counts.length-1] = counts[counts.length-1];//fillers.length;
		return counts;
	};

	//grabs the form where users enter words
	var $addWordForm = $("#fillerWordInput");
	//when user clicks submit...
	$addWordForm.on("submit", function (event) {
		//so that the page doesn't reload onclick
		//event.preventDefault();
		var word = $("#newFiller").val();
		fillers.push(word);
		$.post("/words.json", {
			word: {
				word: word
			}
		}).done(function (createdWord){
			console.log(fillers);
			$("#displayFillers").append(createdWord.word + "<button class=\"delete-user-word\" data-word-id=\"<%= w.id %>\"> X </button>" +"<br>");
		})
	});



$(".delete-user-word").click(function(){
	var wordId = $(this).data("word-id");
	var wordVal = $(this).data("word");
	console.log("word ID" + wordId);
	var $word = this.closest(".fillerItem");
	console.log("$word  :::" , $word);
	$.ajax({
		url: "/words/"+ wordId + ".json",
		type: "PATCH"
	}).done(function(){
		indexWord = fillers.indexOf(wordVal);
		fillers.splice(indexWord, 1);
		console.log(fillers);
		//console.log()
		$word.remove();
		console.log(this)
		console.log("DELETED!!!");
	});
});


 
//.done(function (done){
// 			console.log("Deleted");
// 			$("#displayFillers").append(createdWord.word + "<br>");
// 		})
		
// this function is going to find our filler 
// words in the array of total words
// and count them	
	var newTimer;
	var seconds;
	function timer(){
		var s = -1;
		var m = 0;
		var timeCount = 0;
		seconds = 0;
		newTimer = setInterval(function(){myTimer()},1000);
		
		$("#timer").html("00:00");
		function myTimer() {
			seconds += 1;
			s+=1;
			timeCount +=1;
			//hacky a.f. way to get the 
			//recognition session to refresh
			if (timeCount === 55){
				recognition.stop();
			};
			if (timeCount === 57){
				recognition.start();
				timeCount = 0;
			};
		  if (s < 60){
		    if (s < 10){
		      $("#timer").html(m + ":0" + s);
		   //   s+=1;
		    } else {
		      $("#timer").html(m + ":" + s);
		     // s+=1;
		    }
		  } else {
		      s = 0;
		      m += 1;
		      $("#timer").html(m + ":0" + s);
		  }
		};

	
	}; // end timer
	var fillerWordCounts;

	var showResults = function(){
			str = "";

			for (var x = 0; x < fillers.length; x++){
				//console.log("Fillers[x]: " + fillers[x]);
				str += (fillers[x] + ": " + fillerWordCounts[x] + "<br>");
			}
			console.log("fillers in show results: ", fillers);
			return str;
	};
	


	$(".stop-button").click(function(){
		console.log("CLICKED!! Now. Clicked.");
		recognition.stop();

		setTimeout(function(){
			console.log("TRANSCRIPT!!!! : ", wordArray);
			fillerWordCounts = pickFillers(wordArray, fillers);
			console.log("FillerWordCounts???? ", fillerWordCounts);
		}, 2000);
		

		
		//console.log("stopClicked in stop button: " + stopClicked);
		clearInterval(newTimer);

		//adds speech attempt to database
		// $.post("/speech_attempts.json",{
		// 	speech_attempt: {
		// 			time: seconds

		// 	}
	//});

		myVar = setTimeout(function(){
			//editing this right now 
			if (fillers.indexOf("*swears") === -1){
				fillers.push("*swears");
				console.log("adding swears");
			};

			console.log("FillerWordCounts!!! ", fillerWordCounts.length, fillers.length);
			obj = toObj(fillers, fillerWordCounts);

			console.log("THESE FILLERS RIGHT NOW...", fillers);
			console.log("OBJ IS", obj)

			$.post('/messing', {wordHash: obj, speech_attempt: {time: seconds}}, function(data) {
				console.log(data);
			})

			$("#textHere").html(wordArray);
			$("#count").html(showResults());
		},4000);

	});
		
			
	var toObj = function(fillers, counts){
	  var obj = {};
	  console.log("Filler!!: ", fillers);
	  console.log("Counts!!: ", counts);
	  for (var i = 0; i < fillers.length; i++){
	  obj[fillers[i]] = counts[i];
	  }
	return obj;
	};
		
		



});
