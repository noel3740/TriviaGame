var triviaGame = {

    //Declare variables
    triviaQuestions: [],
    timeRemaining: undefined,
    currentTriviaQuestion: undefined,
    currentTriviaQuestionIndex: undefined,
    timeRemainingInterval: undefined,
    startTheGameSection: $(".startTheGameSection"),
    theGameSection: $(".theGameSection"),
    endOfGameResultsSection: $(".endOfGameResultsSection"),
    timeRemainingSpan: $("#timeRemaining"),
    resultsDiv: $("#resultsDiv"),
    triviaModal: $("#triviaModal"),
    questionElement: $("#question"),
    answersElement: $("#answers"),
    answerButtonDivTemplate: "<div class='col-sm-12'><button type='button' class='btn btn-outline-secondary btn-block mb-1 answerButton'></button></div>",
    answerIndexAttrib: "answer-index",
    answersCorrect: 0,
    answersIncorrect: 0,
    unanswered: 0,
    defaultTimeRemaining: 30,

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
        triviaGame.theGameSection.show();
        triviaGame.endOfGameResultsSection.hide();
        
        //Get a new question from the array of questions
        triviaGame.getNewQuestion();
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
            triviaGame.showMoal("<p>You ran out of time!</p>");
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
            triviaGame.showMoal("<p>You are correct!</p>");
        } else {
            triviaGame.answersIncorrect++;
            triviaGame.showMoal("<p><strong>Sorry. Incorrect answer!</strong></p><p>The correct answer is '" + triviaGame.getCorrectAnswer().answer + "'.</p>");
        }
    },

    //Function to show the modal with the provided html
    showMoal: function (resultHtml) {
        clearInterval(triviaGame.timeRemainingInterval);
        triviaGame.resultsDiv.html(resultHtml);
        triviaGame.triviaModal.modal('show'); 
        //Close the window after 5 seconds
        setTimeout(() => triviaGame.triviaModal.modal('hide'), 5000);
    },


    //Get the next trivia question
    getNewQuestion: function () {
        triviaGame.currentTriviaQuestionIndex++;

        if (triviaGame.currentTriviaQuestionIndex < triviaGame.triviaQuestions.length) {
            triviaGame.answersElement.empty();
            triviaGame.currentTriviaQuestion = triviaGame.triviaQuestions[triviaGame.currentTriviaQuestionIndex];

            triviaGame.questionElement.text(triviaGame.currentTriviaQuestion.question);

            triviaGame.currentTriviaQuestion.answers.forEach((answer, index, answersArray) => {

                var answerButtonDiv = $(triviaGame.answerButtonDivTemplate).find("button").text(answer.answer).attr(triviaGame.answerIndexAttrib, index);
                answerButtonDiv.on("click", triviaGame.onAnswerChosen);
                triviaGame.answersElement.append(answerButtonDiv);
            });

            //Set time remaining to default and display on screen
            triviaGame.timeRemaining = triviaGame.defaultTimeRemaining;
            triviaGame.updateTimeRemaining();

            //Update time remaining every 1 second
            triviaGame.timeRemainingInterval = setInterval(triviaGame.updateTimeRemaining, 1000);
        } else {
            triviaGame.gameOver();
        }
    },

    //Function is run when the results modal is closed. 
    onResultsModalClosed: function () {
        triviaGame.getNewQuestion();
    }

}

//Define trivia questions
var myTriviaQuestions = [
    {
        question: "Which of these is NOT a name of one of the Spice Girls?",
        answers: [
            { 
                answer: "Sporty Spice",
                isCorrectAnswer: false
            },
            { 
                answer: "Fred Spice",
                isCorrectAnswer: true
            },
            { 
                answer: "Scary Spice",
                isCorrectAnswer: false
            },
            { 
                answer: "Posh Spice",
                isCorrectAnswer: false 
            }
        ]
    },
    {
        question: "Which NBA team won the most titles in the 90s?",
        answers: [
            { 
                answer: "New York Knicks",
                isCorrectAnswer: false
            },
            { 
                answer: "Portland Trailblazers",
                isCorrectAnswer: false
            },
            { 
                answer: "Los Angeles Lakers",
                isCorrectAnswer: false
            },
            { 
                answer: "Chicago Bulls",
                isCorrectAnswer: true 
            }
        ]
    }
]

//Initialize game
triviaGame.initialize(myTriviaQuestions);