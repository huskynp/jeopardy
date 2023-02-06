let money = 0;
let correctqs = 0;
const addMoney = amount => {
    money += amount;
    $("#money").text(money.toLocaleString())
}

const endScreen = () => {
    $("#money").hide();
    $("#val").hide();
    $("#cat").hide();
    $("h3").text("");
    $("input").val("");
    $("input").prop("disabled", true);
    $("#q").html("You got " + correctqs + "/" + questions.length + " questions right<br/>Final Money: $" + money.toLocaleString());
}

class Question{
    constructor(d, i){
        this.SIMILAR_THRESHOLD = 0.7;

        this.money = d.value;
        if(d.value === null){
            this.money = 400;
        }
        this.answer = d.answer;
        this.question = d.question;
        this.date = d.airdate;
        this.airyear = parseInt(d.airdate.slice(0,4));
        let category = d.category;
        this.category = category.title; 
        this.num = i;

        this.ANSWER_TIME = 15; // sec
        this.timer = ((this.question.split(' ').length)/125)*60; // q reading time
        this.timer += this.ANSWER_TIME;

        console.log(this.money);
    }

    checkAnswer(answer){
        let similarity = stringSimilarity.compareTwoStrings(this.answer, answer);
        console.log(similarity);
        // is correct?
        if(similarity >= this.SIMILAR_THRESHOLD){
            this.showAnswer(true);
        }else{
            if(similarity >= 0.6){
                $("h3").text("Almost...");
            }else if (similarity>0.4){
                $("h3").text("Close!");
            }else if (similarity>0.2){
                $("h3").text("Not really.");
            }else{
                $("h3").text("Nope!");
            }

            if($("progress").val() > 2){
                $("#submit").prop("disabled",true);
                $("#skip").prop("disabled", true);
                setTimeout(() => {
                    $("#submit").prop("disabled", false);
                    $("#skip").prop("disabled", false);
                    $("h3").text("");
                }, 1500);
            }
            

        }
    }

    inputAnswer(e){
        e.preventDefault();
        if($("input").val() === ""){return;}
        questions[qnum-1].checkAnswer($("input").val());
    }

    skip(e){
        $("h3").text("The answer was " + questions[qnum-1].answer);
        clearInterval(questions[qnum-1].progressTimer);
        $("#submit").unbind("click", questions[qnum-1].inputAnswer);
        $("#submit").prop("disabled", true);
        $("#skip").unbind("click", questions[qnum-1].skip);
        $("#skip").prop("disabled", true);
        e.preventDefault();
        // load other one
        if(qnum === questions.length){ //done?
            setTimeout(endScreen, 2000);
        }else{
            setTimeout(() => {questions[qnum].load()}, 2000);
        }
    }

    showAnswer(correct){
        console.log(correct===true);
        let CORRECT_ANSWERS = ["Corrrect!", "You got it!", "Nice job!", "Good work!"];
        let correct_txt = CORRECT_ANSWERS[Math.floor(Math.random()*CORRECT_ANSWERS.length)];
        if(correct===true){
            correctqs++;
            addMoney(this.money);
            $("h3").text(correct_txt + " (" + this.answer + ")");
            clearInterval(this.progressTimer);
            $("#submit").unbind("click", this.inputAnswer);
            $("#submit").prop("disabled", true);
            $("#skip").unbind("click", this.skip);
            $("#skip").prop("disabled", true);
        }else{
            clearInterval(this.progressTimer);
            $("#submit").prop("disabled", true);
            $("#skip").prop("disabled", true);
            $("h3").text("The answer was: " + this.answer);
        }

        // load other one
        if(qnum === questions.length){ //done?
            setTimeout(endScreen, 2000);
        }else{
            setTimeout(() => {questions[qnum].load()}, 2000);
        }
    }

    speak(){
        let msg = new SpeechSynthesisUtterance();
        msg.text = this.question;
        window.speechSynthesis.speak(msg);
    }

    load(){
        // deload first
        $("input").val("");
        $("h3").text("");

        console.log(this.question);

        qnum++;
        $("#q").text(this.question);
        $("#val").text(this.money.toString());
        $("#cat").text(`Question ${qnum}/${questions.length} - Category: ${this.category} (${this.airyear})`);

        $("#submit").bind("click", this.inputAnswer);
        $("#submit").prop("disabled", false);

        $("#skip").bind("click", this.skip);
        $("#skip").prop("disabled", false);

        //progress bar
        let progress = $("progress");
        progress.attr("max",this.timer);
        progress.attr("value",this.timer);

        let time = this.timer;
        this.progressTimer = setInterval(() => {
            time -= .05;
            progress.attr("value", time);
            if(time <= 0){
                this.showAnswer(false);
            }
        }, 50);
    }

}

let qnum = 0;
let questions = [];




const getCategories = () => {
    $.get("https://jservice.io/api/random", {"count":10}, data => {
        console.log(data);
        for(q of data){
            console.log(q);
            questions.push(new Question(q, questions.length));
        }
        console.log("loaded");
        questions[0].load();
    });
};

getCategories();
