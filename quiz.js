/**
 * Created by Alex on 28/07/2016.
 */
/*
 TO DO
 1 Show which questions were correct using a table and CSS
 2 Animate question transition with JQuery
 3 Client-side validation
 4 Show back as disabled, not hidden
 */

var questionID, selected,
    questions = [], scores = [], answers = [];

// Add a question to the given array (correct denotes the correct answer's index)
questions.addQuestion = function(question, choices, correct) {
    // Make sure the index is within bounds
    if (correct < 0 || correct >= choices.length)
        return;
    this.push({
        question: question,
        choices: choices,
        correct: correct
    });
};

// Records whether the user answered the current question correctly
scores.scoreAnswer = function () {
    var correctIndex = questions[questionID].correct;
    answers[questionID] == correctIndex ?
        this.push(1) : this.push(0);
}

questions.addQuestion("Which Star Wars episode is the best?", ["1", "2", "3", "4", "5", "6", "7"], 0);

questions.addQuestion("Which movie is better?", ["Shrek", "Inception"], 0);

// If the cookie already exists, greet them!
if(document.cookie != "") {
    $("#question").append(", " + document.cookie);
    $("p").empty();
    $("#start").prop("disabled", false);
}

// Allow the user to continue if they've typed at least two letters
$("p input").on("keyup", function(){
    $("#start").prop("disabled", !(this.value.length > 1));
});

$("#start").click(function() {
    // Store their name if it's their first visit
    if(document.cookie == "")
        document.cookie = $("p input").val();

    // Prepare the page
    $("p").empty();
    $("#back,#next").css('visibility', 'visible');
    this.style.display = 'none';

    // Start the quiz
    numCorrect = 0;
    if ((questionID = 0) < questions.length) {
        loadNewQuestion(questions[questionID]);
    }
});

// Navigate back, retaining their previous answers
$("#back").click(function(){
    scores.pop();

    // By way of client-side validation, we know that this question has been answered
    $("#next").prop("disabled", false);

    loadNewQuestion(questions[--questionID]);
});

// If they've selected an answer, move on
$("#next").click(function() {
    scores.scoreAnswer();

    if (++questionID < questions.length) {
        loadNewQuestion(questions[questionID]);
        this.disabled = !(answers[questionID] >= 0);
    } else {
        finish();
    }
});

function finish() {
    // Clear out formatting and calculate score
    $("#options").empty();
    $("#next, #back").css('visibility', 'hidden');
    scores.forEach(function(score) {
        numCorrect += score;
    });

    // Show how well they did
    var resultStr = "You got " + numCorrect + " out of " + questions.length + " correct.";
    $("#question").text("Results");
    console.log($("p"));
    $("p").append(resultStr);
}

function loadNewQuestion(newQuestion) {
    // Manage the visibility of the back button
    $("#back").prop("disabled", false);
    if(questionID <= 0 || questionID > questions.length)
        $("#back").prop("disabled", true);

    // Show the question (add one because zero-indexing)
    $("#question").text("Question " + (questionID+1) + ": " + newQuestion.question);
    // Show the choices
    loadNewChoices(newQuestion.choices);
}

function loadNewChoices(newChoices) {
    var options = $("#options");
    // Clear out any prior options
    options.empty();

    newChoices.forEach(function(choice, index) {
        // Create a new radio input
        var radio = document.createElement("INPUT");
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", "current"); // necessary?
        // See if the user has already answered the question
        if (index == answers[questionID])
            radio.setAttribute("checked", true);

        // Store which answer this radio button corresponds to
        radio.setAttribute("value", index);

        // Update the stored answer on selection
        radio.addEventListener("click", function() {
            answers[questionID] = this.value;
            $("#next").prop("disabled", false);
        });

        // Add the button, the text, and a newline
        options.append(radio, choice, "<br>");
    });

// get on github, figure out what .idea is 
