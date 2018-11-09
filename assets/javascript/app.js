$( document ).ready(function() {
    //Declare triviaGame global object
    var triviaGame = {

        //Declare variables
        triviaQuestions: [],
        timeRemaining: undefined,
        defaultTimeRemaining: 15,
        currentTriviaQuestion: undefined,
        currentTriviaQuestionIndex: undefined,
        timeRemainingInterval: undefined,
        startTheGameSection: $(".startTheGameSection"),
        theGameSection: $(".theGameSection"),
        endOfGameResultsSection: $(".endOfGameResultsSection"),
        timeRemainingSpan: $("#timeRemaining"),
        triviaModalTitle: $("#triviaModalTitle"),
        resultsDiv: $("#resultsDiv"),
        triviaModal: $("#triviaModal"),
        questionElement: $("#question"),
        answersElement: $("#answers"),
        introAudio: $("#introAudio"),
        correctResultAudio: $("#correctResultAudio"),
        incorrectResultsAudio: $("#incorrectResultsAudio"),
        timesUpResultsAudio: $("#timesUpResultsAudio"),
        answerButtonTemplate: "<button type='button' class='btn btn-success btn-block mb-1 font-weight-bold btn-lg answerButton'></button>",
        answerIndexAttrib: "answer-index",
        answersCorrect: 0,
        answersIncorrect: 0,
        unanswered: 0,

        //This function initializes the screen divs and global variables
        initialize: function (myTriviaQuestions) {
            triviaGame.triviaQuestions = myTriviaQuestions;
            triviaGame.startTheGameSection.show();
            triviaGame.theGameSection.hide();
            triviaGame.endOfGameResultsSection.hide();
            triviaGame.currentTriviaQuestion = undefined;
            
            //Attach events
            $("#startButton").on("click", triviaGame.startTheGame);
            triviaGame.triviaModal.on('hidden.bs.modal', triviaGame.onResultsModalClosed);
        },

        //This function will run when the game starts
        startTheGame: function () {
            triviaGame.currentTriviaQuestionIndex = -1;
            triviaGame.answersCorrect = 0;
            triviaGame.answersIncorrect = 0;
            triviaGame.unanswered = 0;
            triviaGame.startTheGameSection.hide();
            triviaGame.endOfGameResultsSection.hide();

            //Get a new question from the array of questions
            triviaGame.getNewQuestion(false);

            //Play the intro audio
            triviaGame.introAudio[0].currentTime = 0; 
            triviaGame.introAudio[0].play(); 

            //Disable the game answer buttons so the user can't select until the timer starts
            triviaGame.answersElement.find("button").attr('disabled', true);

            //Slowly show the game section then start the timer and enable the answer buttons after it is shown
            triviaGame.theGameSection.show(3000, ()=> {
                triviaGame.timeRemainingInterval = setInterval(triviaGame.updateTimeRemaining, 1000);
                triviaGame.theGameSection.find("button").removeAttr('disabled');
            });
        },

        //Function that will run when the game is over and all questions have been answered
        gameOver: function () {
            //Show the end of game screen with and fill out the text on that screen
            $(".correctAnswersCount").text(triviaGame.answersCorrect);
            $(".incorrectAnswersCount").text(triviaGame.answersIncorrect);
            $(".unanswerCount").text(triviaGame.unanswered);

            triviaGame.startTheGameSection.show();
            triviaGame.theGameSection.hide();
            triviaGame.endOfGameResultsSection.show();
        },

        //Update the time remaining on screen and in the global variable
        //If time is 0 then display modal that they ran out of time
        updateTimeRemaining: function () {
            
            triviaGame.timeRemainingSpan.text(triviaGame.timeRemaining);

            if (triviaGame.timeRemaining > 0) {
                triviaGame.timeRemaining--;
            } else {
                triviaGame.unanswered++;
                triviaGame.showMoal("Out of Time!", "<p>You ran out of time!</p><p>The correct answer is '" + triviaGame.getCorrectAnswer().answer + "'.</p>");
                triviaGame.timesUpResultsAudio[0].currentTime = 0;
                triviaGame.timesUpResultsAudio[0].play();
            }
        },

        //Get the correct answer object from the current trivia question
        getCorrectAnswer: function () {
            return triviaGame.currentTriviaQuestion.answers.find((element) => element.isCorrectAnswer === true);
        },

        //Get the index of the correct answer object from the current trivia question
        getCorrectAnswerIndex: function () {
            return triviaGame.currentTriviaQuestion.answers.indexOf(triviaGame.getCorrectAnswer());
        }, 

        //Function is run when an answer is chosen
        onAnswerChosen: function (event) {

            //Clear timer if there is currently one running
            clearInterval(triviaGame.timeRemainingInterval);

            //Stop the intro audio if it's still playing
            triviaGame.introAudio[0].pause();

            //If the user selected the correct answer
            if (triviaGame.getCorrectAnswerIndex() == $(event.currentTarget).attr(triviaGame.answerIndexAttrib)) {
                //Increment answers correct count, show a modeal to display to the user that they were correct,
                //and play correct answer audio
                triviaGame.answersCorrect++;
                triviaGame.showMoal("Correct!", "<p>You are correct!</p><img class='imageCorrect' src='" + triviaGame.currentTriviaQuestion.correctAnswerImageUrl + "'>");
                triviaGame.correctResultAudio[0].currentTime = 0;
                triviaGame.correctResultAudio[0].play();
            } 
            //User did not choose the correct answer
            else {
                //Increment incorrect answers count, display a modal that tells the user they lost,
                //and play incorrect answer audio.
                triviaGame.answersIncorrect++;
                triviaGame.showMoal("Wrong!", "<p><strong>Sorry. Incorrect answer!</strong></p><p>The correct answer is '" + triviaGame.getCorrectAnswer().answer + "'.</p><img class='imageCorrect' src='" + triviaGame.currentTriviaQuestion.incorrectAnswerImageUrl + "'>");
                triviaGame.incorrectResultsAudio[0].currentTime = 0;
                triviaGame.incorrectResultsAudio[0].play();
            }
        },

        //Function to show the modal with the provided html
        showMoal: function (title, resultHtml) {
            clearInterval(triviaGame.timeRemainingInterval);
            triviaGame.resultsDiv.html(resultHtml);
            triviaGame.triviaModalTitle.text(title);
            triviaGame.triviaModal.modal('show'); 
            //Close the window after 7 seconds
            setTimeout(() => triviaGame.triviaModal.modal('hide'), 7000);
        },


        //Get the next trivia question
        getNewQuestion: function (startTimer) {
            triviaGame.currentTriviaQuestionIndex++;

            //If we are not out of questions
            if (triviaGame.currentTriviaQuestionIndex < triviaGame.triviaQuestions.length) {
                //Clear out the answers div and set the current question text
                triviaGame.answersElement.empty();
                triviaGame.currentTriviaQuestion = triviaGame.triviaQuestions[triviaGame.currentTriviaQuestionIndex];

                triviaGame.questionElement.text(triviaGame.currentTriviaQuestion.question);

                //Loop through all the answers associted with the current question and create buttons for each
                triviaGame.currentTriviaQuestion.answers.forEach((answer, index, answersArray) => {

                    var answerButton = $(triviaGame.answerButtonTemplate);
                    answerButton.text(answer.answer).attr(triviaGame.answerIndexAttrib, index);
                    answerButton.on("click", triviaGame.onAnswerChosen);
                    triviaGame.answersElement.append(answerButton);
                });

                //Set modal audio
                var correctAnswerAudioSource = triviaGame.currentTriviaQuestion.correctAnswerAudioUrl ? triviaGame.currentTriviaQuestion.correctAnswerAudioUrl : "assets/sounds/Generic-Correct.mp3";
                triviaGame.correctResultAudio.find("source").attr("src", correctAnswerAudioSource);
                triviaGame.correctResultAudio[0].load();

                var incorrectAnswerAudioSource = triviaGame.currentTriviaQuestion.incorrectAnswerAudioUrl ? triviaGame.currentTriviaQuestion.incorrectAnswerAudioUrl : "assets/sounds/Generic-Incorrect.mp3";
                triviaGame.incorrectResultsAudio.find("source").attr("src", incorrectAnswerAudioSource);
                triviaGame.incorrectResultsAudio[0].load();

                //Set time remaining to default and display on screen
                triviaGame.timeRemaining = triviaGame.defaultTimeRemaining;
                triviaGame.updateTimeRemaining();

                if (startTimer) {
                    //Clear the timer if there is currently one running
                    clearInterval(triviaGame.timeRemainingInterval);
                    //Update time remaining every 1 second
                    triviaGame.timeRemainingInterval = setInterval(triviaGame.updateTimeRemaining, 1000);
                }
            } 
            //We are out of questions so run the game over function
            else {
                triviaGame.gameOver();
            }
        },

        //Function is run when the results modal is closed. 
        onResultsModalClosed: function () {
            triviaGame.correctResultAudio[0].pause();
            triviaGame.getNewQuestion(true);
        }

    }

    //Define trivia questions
    var myTriviaQuestions = [
        {
            question: "What is the name of Mario's brother?",
            correctAnswerImageUrl: "assets/images/marioCorrect.gif",
            incorrectAnswerImageUrl: "assets/images/marioIncorrect.gif",
            correctAnswerAudioUrl: "assets/sounds/Mario-Correct.mp3",
            incorrectAnswerAudioUrl: "assets/sounds/Mario-Incorrect.mp3",
            answers: [
                { 
                    answer: "Zelda"
                },
                { 
                    answer: "Lugi",
                    isCorrectAnswer: true
                },
                { 
                    answer: "Bob"
                },
                { 
                    answer: "Yoshi"
                }
            ]
        },
        {
            question: "What is the name of the hero that rescues Zelda?",
            correctAnswerImageUrl: "assets/images/zeldaCorrect.gif",
            incorrectAnswerImageUrl: "assets/images/zeldaIncorrect.gif",
            correctAnswerAudioUrl: "assets/sounds/Zelda-Correct.mp3",
            incorrectAnswerAudioUrl: "assets/sounds/Zelda-Incorrect.mp3",
            answers: [
                { 
                    answer: "Majora"
                },
                { 
                    answer: "Cia"
                },
                { 
                    answer: "Ganon"
                },
                { 
                    answer: "Link",
                    isCorrectAnswer: true 
                }
            ]
        },
        {
            question: "What is the name of Sonic's sidekick?",
            correctAnswerImageUrl: "assets/images/sonicCorrect.gif",
            incorrectAnswerImageUrl: "assets/images/sonicIncorrect.gif",
            correctAnswerAudioUrl: "assets/sounds/Sonic-Correct.mp3",
            incorrectAnswerAudioUrl: "assets/sounds/Sonic-Incorrect.mp3",
            answers: [
                { 
                    answer: "Tails",
                    isCorrectAnswer: true
                },
                { 
                    answer: "Knuckles"
                },
                { 
                    answer: "Eggman"
                },
                { 
                    answer: "Rachel"
                }
            ]
        },
        {
            question: "What is the main character of Metal Gear Solid?",
            correctAnswerImageUrl: "assets/images/metalGearCorrect.gif",
            incorrectAnswerImageUrl: "assets/images/metalGearIncorrect.gif",
            correctAnswerAudioUrl: "assets/sounds/Metal-Gear-Correct.mp3",
            incorrectAnswerAudioUrl: "assets/sounds/Metal-Gear-Incorrect.mp3",
            answers: [
                { 
                    answer: "Ocelot"
                },
                { 
                    answer: "Liquid Snake"
                },
                { 
                    answer: "Snake",
                    isCorrectAnswer: true
                },
                { 
                    answer: "Big Boss"
                }
            ]
        },
        {
            question: "What company developed Pac-Man?",
            correctAnswerImageUrl: "assets/images/pacManCorrect.gif",
            incorrectAnswerImageUrl: "assets/images/pacManIncorrect.gif",
            correctAnswerAudioUrl: "assets/sounds/Pac-Man-Correct.mp3",
            incorrectAnswerAudioUrl: "assets/sounds/Pac-Man-Incorrect.mp3",
            answers: [
                { 
                    answer: "Namco",
                    isCorrectAnswer: true
                },
                { 
                    answer: "Square Enix"
                },
                { 
                    answer: "Nintendo"
                },
                { 
                    answer: "Sony"
                }
            ]
        }
    ]

    //Initialize game
    triviaGame.initialize(myTriviaQuestions);
});