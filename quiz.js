/**
 * Created by Alex on 28/07/2016.
 */
// Variables dealing with the quiz itself
var questionID = 0, numCorrect = 0,
    scores = [], answers = [], questions = [];
$.getJSON("questions.json", null, function(data) { questions = data; });

// Variables dealing with startSpan
var startSpan = $("#startSpan"), start = $("#start"),
    welcome = $("#welcome"), text = $("#text"),
    textIn = $("#textIn");

// Variables dealing with questionSpan
var questionSpan = $("#questionSpan"), question = $("#question"),
    options = $("#options"),
    back = $("#back"), next = $("#next");

// Animation parameters
var fadeDuration = 400;

// Shouldn't be able to see these yet
questionSpan.hide();

// If the cookie already exists, greet them!
if(document.cookie !== "") {
    welcome.append(", " + document.cookie);
    text.empty();
    start.prop("disabled", false);
}
// TODO: Add user authentication: allow users to log in, save login credentials to local browser storage (HTML5 browser storage)

// Allow the user to continue if they've typed at least two letters
textIn.keyup(function(){
    start.prop("disabled", this.value.length <= 1);
});

start.click(function() {
    // Store their name if it's their first visit
    if(document.cookie === "")
        document.cookie = textIn.val();

    // Prepare the page
    welcome.empty();
    startSpan.hide(fadeDuration);
    questionSpan.show(fadeDuration);

    // Start the quiz
    if (questionID < questions.length) {
        loadNewQuestion(questions[questionID]);
    }
});

// Navigate back, retaining their previous answers
back.click(function(){
    scores.pop();

    fadeFunction(questionSpan, fadeDuration,
        loadNewQuestion, questions[--questionID]);

    // By way of client-side validation, we know that this question has been answered
    next.prop("disabled", false);
});

// Records whether the user answered the current question correctly
scores.scoreAnswer = function () {
    var correctIndex = questions[questionID].correct;
    if(answers[questionID] === correctIndex)
        this[questionID] = 1;
    else
        this[questionID] = 0;
};

// If they've selected an answer, move on
next.click(function() {
    scores.scoreAnswer();

    if (++questionID < questions.length) {
        fadeFunction(questionSpan, fadeDuration,
            loadNewQuestion, questions[questionID]);
        this.disabled = answers.length <= questionID;
    } else {
        questionSpan.hide(fadeDuration);
        startSpan.show(fadeDuration);
        finish();
    }
});

// Load a new question on the page
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

// Clear old radio buttons and load the new ones
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
            radio.setAttribute("checked", "true");

        // Update the stored answer on selection
        radio.addEventListener("click", function () {
            answers[questionID] = parseInt(this.value);
            next.prop("disabled", false);
        });

        // Add the button, the text, and a newline
        options.append(radio, choice, "<br>");
    });
}

// Tidy up and display results
function finish() {
    // Calculate score
    scores.forEach(function(score) {
        numCorrect += score;
    });

    // Show how well they did
    var resultStr = "You got " + numCorrect + " out of " + questions.length + " correct.";
    question.text("Results");
    text.append(resultStr);
    // TODO: Show which questions were correct using a table and CSS
}

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