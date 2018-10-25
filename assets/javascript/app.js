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
    introAudio: document.getElementById("introAudio"),
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
        introAudio.currentTime = 0; 
        introAudio.play(); 

        //Slowly show the game section then start the timer after it is shown
        triviaGame.theGameSection.show(3000, ()=> {triviaGame.timeRemainingInterval = setInterval(triviaGame.updateTimeRemaining, 1000);});
    },

    gameOver: function () {
        $(".correctAnswersCount").text(triviaGame.answersCorrect);
        $(".incorrectAnswersCount").text(triviaGame.answersIncorrect);
        $(".unanswerCount").text(triviaGame.unanswered);

        triviaGame.startTheGameSection.show();
        triviaGame.theGameSection.hide();
        triviaGame.endOfGameResultsSection.show();
    },

    //Update the time remaining on screen and in the global variable
    updateTimeRemaining: function () {
        
        triviaGame.timeRemainingSpan.text(triviaGame.timeRemaining);

        if (triviaGame.timeRemaining > 0) {
            triviaGame.timeRemaining--;
        } else {
            triviaGame.unanswered++;
            triviaGame.showMoal("Out of Time!", "<p>You ran out of time!</p>");
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

        if (triviaGame.getCorrectAnswerIndex() == $(event.currentTarget).attr(triviaGame.answerIndexAttrib)) {
            triviaGame.answersCorrect++;
            triviaGame.showMoal("Correct!", "<p>You are correct!</p><img class='imageCorrect' src='" + triviaGame.currentTriviaQuestion.correctAnswerImageUrl + "'>");
        } else {
            triviaGame.answersIncorrect++;
            triviaGame.showMoal("Wrong!", "<p><strong>Sorry. Incorrect answer!</strong></p><p>The correct answer is '" + triviaGame.getCorrectAnswer().answer + "'.</p><img class='imageCorrect' src='" + triviaGame.currentTriviaQuestion.incorrectAnswerImageUtl + "'>");
        }
    },

    //Function to show the modal with the provided html
    showMoal: function (title, resultHtml) {
        clearInterval(triviaGame.timeRemainingInterval);
        triviaGame.resultsDiv.html(resultHtml);
        triviaGame.triviaModalTitle.text(title);
        triviaGame.triviaModal.modal('show'); 
        //Close the window after 5 seconds
        setTimeout(() => triviaGame.triviaModal.modal('hide'), 5000);
    },


    //Get the next trivia question
    getNewQuestion: function (startTimer) {
        triviaGame.currentTriviaQuestionIndex++;

        if (triviaGame.currentTriviaQuestionIndex < triviaGame.triviaQuestions.length) {
            triviaGame.answersElement.empty();
            triviaGame.currentTriviaQuestion = triviaGame.triviaQuestions[triviaGame.currentTriviaQuestionIndex];

            triviaGame.questionElement.text(triviaGame.currentTriviaQuestion.question);

            triviaGame.currentTriviaQuestion.answers.forEach((answer, index, answersArray) => {

                var answerButton = $(triviaGame.answerButtonTemplate);
                answerButton.text(answer.answer).attr(triviaGame.answerIndexAttrib, index);
                answerButton.on("click", triviaGame.onAnswerChosen);
                triviaGame.answersElement.append(answerButton);
            });

            //Set time remaining to default and display on screen
            triviaGame.timeRemaining = triviaGame.defaultTimeRemaining;
            triviaGame.updateTimeRemaining();

            if (startTimer) {
                //Update time remaining every 1 second
                triviaGame.timeRemainingInterval = setInterval(triviaGame.updateTimeRemaining, 1000);
            }
        } else {
            triviaGame.gameOver();
        }
    },

    //Function is run when the results modal is closed. 
    onResultsModalClosed: function () {
        triviaGame.getNewQuestion(true);
    }

}

//Define trivia questions
var myTriviaQuestions = [
    {
        question: "What is the name of Mario's brother?",
        correctAnswerImageUrl: "assets/images/marioCorrect.gif",
        incorrectAnswerImageUtl: "assets/images/marioIncorrect.gif",
        answers: [
            { 
                answer: "Zelda",
                isCorrectAnswer: false
            },
            { 
                answer: "Lugi",
                isCorrectAnswer: true
            },
            { 
                answer: "Bob",
                isCorrectAnswer: false
            },
            { 
                answer: "Yoshi",
                isCorrectAnswer: false 
            }
        ]
    },
    {
        question: "What is the name of the hero that rescues Zelda?",
        correctAnswerImageUrl: "assets/images/zeldaCorrect.gif",
        incorrectAnswerImageUtl: "assets/images/zeldaIncorrect.gif",
        answers: [
            { 
                answer: "Majora",
                isCorrectAnswer: false
            },
            { 
                answer: "Cia",
                isCorrectAnswer: false
            },
            { 
                answer: "Ganon",
                isCorrectAnswer: false
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
        incorrectAnswerImageUtl: "assets/images/sonicIncorrect.gif",
        answers: [
            { 
                answer: "Tails",
                isCorrectAnswer: true
            },
            { 
                answer: "Knuckles",
                isCorrectAnswer: false
            },
            { 
                answer: "Eggman",
                isCorrectAnswer: false
            },
            { 
                answer: "Rachel",
                isCorrectAnswer: false 
            }
        ]
    },
    {
        question: "What is the main character of Metal Gear Solid?",
        correctAnswerImageUrl: "assets/images/metalGearCorrect.gif",
        incorrectAnswerImageUtl: "assets/images/metalGearIncorrect.gif",
        answers: [
            { 
                answer: "Ocelot",
                isCorrectAnswer: false
            },
            { 
                answer: "Liquid Snake",
                isCorrectAnswer: false
            },
            { 
                answer: "Snake",
                isCorrectAnswer: true
            },
            { 
                answer: "Big Boss",
                isCorrectAnswer: false 
            }
        ]
    },
    {
        question: "What company developed Pac-Man?",
        correctAnswerImageUrl: "assets/images/pacManCorrect.gif",
        incorrectAnswerImageUtl: "assets/images/pacManIncorrect.gif",
        answers: [
            { 
                answer: "Namco",
                isCorrectAnswer: true
            },
            { 
                answer: "Square Enix",
                isCorrectAnswer: false
            },
            { 
                answer: "Nintendo",
                isCorrectAnswer: true
            },
            { 
                answer: "Sony",
                isCorrectAnswer: false 
            }
        ]
    }
]

//Initialize game
triviaGame.initialize(myTriviaQuestions);