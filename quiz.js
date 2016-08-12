/**
 * Created by Alex on 28/07/2016.
 */
// Variables dealing with the quiz itself
var questionID = 0, numCorrect = 0,
    scores = [], answers = [], questions = [];
$.getJSON("questions.json", null, function(data) { questions = data; });

// New bootstrap variables

// Variables dealing with startSpan
var loginForm = $(".form-horizontal"), welcome = $("#welcome"),
    start = $("#start");

// Variables dealing with questionSpan
var questionSpan = $("#questionSpan"), question = $("#question"),
    options = $("#options"),
    back = $("#back"), next = $("#next");

// Animation parameters
var fadeDuration = 400;

// Table parameters
var table = $("table"), tableBody = $("tbody");

// Shouldn't be able to see these yet
questionSpan.hide();
start.hide();
table.hide();

// User has already logged in this session
if (sessionStorage.username)
    finishLogin();

start.click(function() {
    // Prepare the page
    welcome.hide();
    questionSpan.show(fadeDuration);

    // Prepare the quiz
    table.hide();
    tableBody.empty();
    scores = [];
    answers = [];
    questionID = 0;

    // Start the quiz
    if (questionID < questions.length) {
        loadNewQuestion(questions[questionID]);
    }
    start.hide();
});

// Navigate back, retaining their previous answers
back.click(function(){
    scores.pop();

    fadeFunction(questionSpan, fadeDuration,
        loadNewQuestion, questions[--questionID]);

    // Via client-side validation, we know that this question has been answered
    next.prop("disabled", false);
});

//TODO: Change text to 'finish' and style to 'btn-warning'if it's the last
// question
// If they've selected an answer, move on
next.click(function() {
    scoreAnswer();

    if (++questionID < questions.length) {
        fadeFunction(questionSpan, fadeDuration,
            loadNewQuestion, questions[questionID]);
        // See if this is second-to-last question
        if (questionID + 1 === questions.length)
            this.class += 'btn-warning';
        this.disabled = answers.length <= questionID;
    } else {
        finish();
    }
});

// Login using the values in the input fields
function loginWrapper() {
    login($("#userField")[0].value, $("#passField")[0].value);
}

function login(username, password) {
    if(localStorage.username === username &&
        localStorage.password === password)
        finishLogin();
}

function finishLogin() {
    // Save for the rest of the session
    sessionStorage.username = localStorage.username;
    sessionStorage.password = localStorage.password;
    // Greet the user
    welcome.show();
    welcome.append(", " + sessionStorage.username);
    // Put away the login form
    loginForm.hide();
    // Allow the user to continue
    start.prop("disabled", false);
    start.show();
}

// Register using the values in the input fields
function registerWrapper() {
    register($("#userField")[0].value, $("#passField")[0].value);
}

function register(username, password) {
    localStorage.username = username;
    localStorage.password = password;
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
    scores[questionID] = answers[questionID] === correctIndex ? 1 : 0;
}

/*
Generates a table
Format: # | question text | user's choice | correct choice
 */
function generateTable() {
    // Generate the headers
    var row = document.createElement('tr');
    ["#", "Question", "Your answer", "Correct answer"].forEach(
        function(str) {
            var head = document.createElement('th');
            head.className = "center-text";
            head.innerHTML = str;

            row.appendChild(head);
        });
    tableBody.append(row);

    // Fill in the data
    questions.forEach(function(question, index) {
        row = document.createElement('tr');
        row.className = scores[index] ?  'success' : 'danger';

        // Insert the question number
        var td = document.createElement('td');
        td.innerHTML = index+1;
        row.appendChild(td);

        // Insert the question text
        td = document.createElement('td');
        td.innerHTML = question.question;
        row.appendChild(td);

        // Insert what they chose
        td = document.createElement('td');
        td.innerHTML = question.choices[answers[index]];
        row.appendChild(td);

        // Insert the correct choice
        td = document.createElement('td');
        td.innerHTML = question.choices[question.correct];
        row.appendChild(td);

        // Add it to the existing table
        tableBody.append(row);
    });
}

// Tidy up and display results
function finish() {
    questionSpan.hide(fadeDuration);
    start.show(fadeDuration);

    // Calculate score
    numCorrect = 0;
    scores.forEach(function(score) {
        numCorrect += score;
    });

    // Show how well they did
    var resultStr = "You got " + numCorrect + " out of " + questions.length + " correct.";
    question.text("Results");
    welcome.append(resultStr);
    table.show();
    generateTable();

    // Prepare the quiz for another round
    start.html("Restart");
    next.prop("disabled", "disabled");
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