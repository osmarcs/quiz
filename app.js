var questions = [
    {
        question: "Como é chamada a jogada onde o defensor derruba o ataquante em sua própria endzone?",
        choices: ['Touchdown', 'Safety', 'Field Goal', 'Fumble', 'False Start'],
        answer: 1
    },
    {
        question: "Qual a jogada de maior pontuação do football e quantos pontos ela vale?",
        choices: ['Field Goal - 2', 'Safety - 7', 'Touchdown - 6', 'Touchdown - 7', 'Field Goal - 7'],
        answer: 2
    },
    {
        question: "Qual é a posição do jogador mais importante do time de futebol americano?",
        choices: ['Wide Receiver', 'Quarterback', 'Tight End', 'Running Back', 'Cornerback'],
        answer: 1
    }
];

function Quiz(elt, questions){

    if( typeof elt === 'string') elt = document.getElementById(elt);
    if(elt.length === 0) return false;

    this.container = elt;
    this.questions = questions;
    this.init();
}

Quiz.prototype.init = function(){

    Utils.clear(this.container);
    this.currentQuestion = 0;
    this.myChoice = null;
    this.rightChoices = (function(){
        var oks = 0;
        return {
            set: function(){ oks++;},
            get: function(){ return oks;}
        };
    }());

    this.header = document.createElement('div');
    Utils.addClass('quizHeader', this.header);
    this.container.appendChild(this.header);    

    this.listQuestions = document.createElement('ul');
    Utils.addClass('quizListQuestions', this.listQuestions);
    
    this.container.appendChild(this.listQuestions);

    this.footer = document.createElement('div');
    Utils.addClass('quizFooter', this.footer);
    this.container.appendChild(this.footer);

    this.showQuestion();

};

Quiz.prototype.setHeader = function(text){
    Utils.clear(this.header);
    this.header.appendChild( document.createTextNode(text) ); 
};

Quiz.prototype.setFooter = function(){
    
    var text = 'Proxima';
    var self = this;
    
    Utils.clear(this.footer);
    
    if( this.questions.length === 1 || this.questions.length === (this.currentQuestion + 1)) {
        text = 'Finalizar';
    }

    this.button  = document.createElement('button');
    this.button.appendChild(document.createTextNode(text));
    this.footer.appendChild( this.button ); 
    this.button.onclick = function(){ self.checkAnswer(); };
};

Quiz.prototype.showQuestion = function(){
    var question = this.questions[this.currentQuestion].question;
    this.setHeader(question);
    this.showChoices();
    this.setFooter();
};

Quiz.prototype.showChoices = function(){
    Utils.clear(this.listQuestions);
    
    var choices = this.questions[this.currentQuestion].choices;
    var li, text, self = this;

    var onClickChoice =  function(elt){
        return function(){
            self.iChoice(elt);
        };
    };

    for(i = 0, len = choices.length; i < len; i++ ) {
        li   = document.createElement('li');
        text = document.createTextNode( choices[i]);
        li.appendChild(text);
        this.listQuestions.appendChild(li);

        li.onclick = onClickChoice(li);
    }
};

Quiz.prototype.iChoice = function(elt){
    var choices = this.listQuestions.childNodes;
    for(i = 0, len = choices.length; i < len; i++ ) {
        Utils.removeClass('quizSelected', choices[i]);
        if( choices[i] === elt) {
            Utils.addClass('quizSelected', choices[i]);
            this.myChoice = i;
        }
    }
};

Quiz.prototype.checkAnswer = function(){
    var answerRight = this.questions[this.currentQuestion].answer;
    var choices     = this.listQuestions.childNodes;
    var self = this;

    if( this.myChoice === null || this.myChoice < 0)  return false;

    this.button.onclick = '';
    if(answerRight === this.myChoice) {
        Utils.removeClass('quizSelected', choices[answerRight]);
        Utils.addClass('quizRight', choices[answerRight]);
        this.rightChoices.set();
    } else {
        Utils.removeClass('quizSelected', choices[this.myChoice ]);
        Utils.addClass('quizWrong', choices[this.myChoice ]);

        Utils.addClass('quizRight', choices[answerRight]);
    }
    this.myChoice = null;
    setTimeout(function(){
        if( (self.questions.length - 1) === self.currentQuestion ) {
            self.endGame();
        } else {
            self.currentQuestion++;
            self.showQuestion();
        }

    },1000);
};

Quiz.prototype.endGame = function(){

    var message, button;
    var oks  = this.rightChoices.get();
    var questions = this.questions.length;
    var text = 'Você Perdeu';  
    var self = this;

    Utils.clear(this.footer);

    if( oks >= (questions/2) )
        text = 'Você Ganhou';
        

    text += ' Score: ' + oks + '/' + questions;

    message = document.createElement('p');
    message.appendChild( document.createTextNode(text) );

    button = document.createElement('button');
    button.appendChild( document.createTextNode('Joga Novamente!') );

    
    button.onclick = function(){
        self.init();
    };

    this.footer.appendChild(message);
    this.footer.appendChild(button);

};

Utils = {};
Utils.removeClass = function(c, e) {
    if (c.length === 0 || c.indexOf(" ") != -1) return;
    var pattern = new RegExp("\\b" + c + "\\b\\s*", "g");
    e.className = e.className.replace(pattern, "");
};

Utils.containsClass = function(c, e) {
    if (c.length === 0 || c.indexOf(" ") != -1) return;
    var classes = e.className;
    if (!classes) return false;
    if (classes === c) return true;
    return classes.search("\\b" + c + "\\b") != -1;
};

Utils.addClass = function(c, e) {
    if (this.containsClass(c, e)) return;
    var classes = e.className;
    if (classes && classes[classes.length-1] != " ")
        c = " " + c;

    e.className += c;
};

Utils.clear = function(elt) {
    for(;elt.firstChild;) { elt.removeChild(elt.firstChild); }
};