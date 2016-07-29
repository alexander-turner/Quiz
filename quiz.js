/**
 * Created by Alex on 28/07/2016.
 */
/*
 TO DO
 1 Show which questions were correct using a table and CSS
 2 Animate question transition with JQuery
 3 Store in an external JSON file
 4 Add user authentication: allow users to log in, save login credentials to local storage (HTML5 browser storage)
 5 Test on IE 8/9, fix bugs
 */

var questionID, numCorrect,
    questions = [], scores = [], answers = [];

var start = $("#start"), back = $("#back"),
    next = $("#next"), both = back.add(next),
    options = $("#options"), question = $("#question"),
    questionBox = $("#questionBox"),
    text = $("p"), textEntry = $("p input");

// Animation parameters
var fadeDuration = 400;

// Add a question to the given array (correct denotes the correct answer's index)
questions.addQuestion = function(question, choices, correct) {
    // Make sure the index is within bounds
    if (correct < 0 || correct >= choices.length) return;
    this.push({
        question: question,
        choices: choices,
        correct: correct
    });
};

// Records whether the user answered the current question correctly
scores.scoreAnswer = function () {
    var correctIndex = questions[questionID].correct;
    if(answers[questionID] === correctIndex)
        this[questionID] = 1;
    else
        this[questionID] = 0;
};

// Input questions here!
questions.addQuestion(
    "Which Star Wars episode is the best?",
    ["1", "2", "3", "4", "5", "6", "7"],
    0);
questions.addQuestion(
    "Which movie is better?",
    ["Shrek", "Inception"],
    0);

// If the cookie already exists, greet them!
if(document.cookie !== "") {
    question.append(", " + document.cookie);
    text.empty();
    start.prop("disabled", false);
}

// Shouldn't be able to see these yet
both.hide();

// Allow the user to continue if they've typed at least two letters
textEntry.on("keyup", function(){
    start.prop("disabled", this.value.length <= 1);
});

start.click(function() {
    // Store their name if it's their first visit
    if(document.cookie === "")
        document.cookie = textEntry.val();

    // Prepare the page
    text.empty();
    both.show();
    start.hide();

    // Start the quiz
    numCorrect = 0;
    if ((questionID = 0) < questions.length)
        loadNewQuestion(questions[questionID]);
});

// Navigate back, retaining their previous answers
back.click(function(){
    scores.pop();

    fadeFunction(questionBox, fadeDuration,
        loadNewQuestion, questions[--questionID]);

    // By way of client-side validation, we know that this question has been answered
    next.prop("disabled", false);
});

// If they've selected an answer, move on
next.click(function() {
    scores.scoreAnswer();

    if (++questionID < questions.length) {
        fadeFunction(questionBox, fadeDuration,
            loadNewQuestion, questions[questionID]);
        this.disabled = answers.length <= questionID;
    } else {
        questionBox.hide(fadeDuration);
        finish();
    }
});

/*
Fades out the given DOM object over a given time (in ms, each way)
 around the function f and its parameters (optional).
 */
function fadeFunction(object, time, f, params) {
    params = params || null;
    object.hide(time);
    f(params);
    object.show(time);
}

function finish() {
    // Calculate score
    scores.forEach(function(score) {
        numCorrect += score;
    });

    // Show how well they did
    var resultStr = "You got " + numCorrect + " out of " + questions.length + " correct.";
    question.text("Results");
    text.append(resultStr);
}

function loadNewQuestion(newQuestion) {
    // Manage the visibility of the back button
    back.prop("disabled", false);
    if(questionID <= 0 || questionID > questions.length)
        back.prop("disabled", true);

    // Show the question (add one because zero-indexing)
    question.text("Question " + (questionID+1) + ": " + newQuestion.question);

    // Show the choices
    loadNewChoices(newQuestion.choices);
}

function loadNewChoices(newChoices) {
    // Clear out any prior options
    options.empty();

    newChoices.forEach(function (choice, index) {
        // Create a new radio input
        var radio = document.createElement("INPUT");
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", "current");
        // Store which answer this radio button corresponds to
        radio.setAttribute("value", "" + index);

        // See if the user has already answered the question
        if (index === answers[questionID])
            radio.setAttribute("checked", true);

        // Update the stored answer on selection
        radio.addEventListener("click", function () {
            answers[questionID] = parseInt(this.value);
            next.prop("disabled", false);
        });

        // Add the button, the text, and a newline
        options.append(radio, choice, "<br>");
    });
}