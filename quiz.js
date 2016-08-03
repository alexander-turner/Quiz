/**
 * Created by Alex on 28/07/2016.
 */
// Variables dealing with the quiz itself
var questionID = 0, numCorrect = 0,
    scores = [], answers = [], questions = [];
$.getJSON("questions.json", null, function(data) { questions = data; });

// Variables dealing with startSpan
var startSpan = $("#startSpan"), welcome = $("#welcome"),
    text = $("#text"),
    start = $("#start"), loginForm;

// Variables dealing with questionSpan
var questionSpan = $("#questionSpan"), question = $("#question"),
    options = $("#options"),
    back = $("#back"), next = $("#next");

// Animation parameters
var fadeDuration = 400;

// Shouldn't be able to see these yet
questionSpan.hide();
welcome.hide();

// Login process - useless at the moment, but good practice!
populateLogin();

start.click(function() {
    // Prepare the page
    welcome.empty();
    startSpan.hide(fadeDuration);
    questionSpan.show(fadeDuration);

    // Prepare the quiz
    text.empty();
    scores = [];
    answers = [];
    questionID = 0;

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

    // Via client-side validation, we know that this question has been answered
    next.prop("disabled", false);
});

// If they've selected an answer, move on
next.click(function() {
    scoreAnswer();

    if (++questionID < questions.length) {
        fadeFunction(questionSpan, fadeDuration,
            loadNewQuestion, questions[questionID]);
        this.disabled = answers.length <= questionID;
    } else {
        finish();
    }
});

function populateLogin() {
    // Create the form
    loginForm = document.createElement('span');
    loginForm.id = "loginForm";
    start.before(loginForm);
    loginForm = $("#loginForm");

    // User has already logged in this session
    if(sessionStorage.userName) {
        finishLogin();
        return;
    }

    // Append the fields
    loginForm.append("Username: ");
    var userField = document.createElement('input');
    userField.type = "text";
    userField.id = "userField";
    loginForm.append(userField, "<br>");

    loginForm.append("Password: ");
    var passField = document.createElement('input');
    passField.type = "password";
    passField.id = "passField";
    loginForm.append(passField, "<br>");

    // Append the buttons
    var loginButton = document.createElement('button');
    loginButton.innerHTML = "Login";
    loginButton.addEventListener("click", loginWrapper);
    loginForm.append(loginButton);

    // Append the buttons
    var registerButton = document.createElement('button');
    registerButton.innerHTML = "Register";
    registerButton.addEventListener("click", registerWrapper);
    loginForm.append(registerButton, "<br>");
}

// Login using the values in the input fields
function loginWrapper() {
    login($("#userField")[0].value, $("#passField")[0].value);
}

function login(username, password) {
    if(localStorage.userName === username &&
        localStorage.password === password)
        finishLogin();

    sessionStorage.userName = username;
    sessionStorage.password = password;
}

function finishLogin() {
    // Greet the user
    welcome.show();
    welcome.append(", " + sessionStorage.userName);
    // Put away the login form
    loginForm.empty();
    // Allow the user to continue
    start.prop("disabled", false);
}

// Register using the values in the input fields
function registerWrapper() {
    register($("#userField")[0].value, $("#passField")[0].value);
}

function register(username, password) {
    localStorage.userName = username;
    localStorage.password = password;
    sessionStorage.userName = username;
    sessionStorage.password = password;
    finishLogin();
}

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

// Records whether the user answered the current question correctly using scores
function scoreAnswer () {
    var correctIndex = questions[questionID].correct;
    if(answers[questionID] === correctIndex)
        scores[questionID] = 1;
    else
        scores[questionID] = 0;
}

// Tidy up and display results
function finish() {
    questionSpan.hide(fadeDuration);
    startSpan.show(fadeDuration);

    // Calculate score
    numCorrect = 0;
    scores.forEach(function(score) {
        numCorrect += score;
    });

    // Show how well they did
    var resultStr = "You got " + numCorrect + " out of " + questions.length + " correct.";
    question.text("Results");
    text.append(resultStr);
    // TODO: Show which questions were correct using a table and CSS

    // Prepare the quiz for another round
    start.innerHTML = "Restart";
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