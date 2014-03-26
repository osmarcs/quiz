Quiz = (function(){

    function Quiz(stage, questions) {

        if(typeof stage === 'string')
            stage = document.getElementById(stage);

        if(questions.length === 0) {
            console.log('Sem questoes');
            return false;
        }

        this.stage = stage;
        this.questions = questions;
        this.init();
    }

    Quiz.prototype.init = function() {

        var header, footer, container;

        this.stage.innerHTML = '';

        header = document.createElement('div');
        header.className = 'quizHeader';

        footer = document.createElement('div');
        footer.className = 'quizFooter'; 

        container = document.createElement('div');
        container.className = 'quizContainer'; 

        this.stage.appendChild(header);
        this.stage.appendChild(container);
        this.stage.appendChild(footer);

        this.header    = header;
        this.footer    = footer;
        this.container = container;
        this.answers   = [];
        this.actual    = 0;

        if( this.isLogged() )
            this.showSplash();
        else
            this.showLogin();
    };

    Quiz.prototype.showSplash = function(){

        var htmlFooter, htmlContainer, button;
        var self = this;

        this.header.innerHTML = "<h2>Bem Vindo ao Super Quiz NFL!</h2>";
        
        htmlContainer = '<p class="quizFirstPSplash"> Teste aqui seus conhecimento sobre futebol americano.</p>';
        htmlContainer += '<p class="quizSecondPSplash"> Jogue, apreenda e se divirta com esse super quiz.</p>';

        this.container.innerHTML = htmlContainer;

        this.footer.innerHTML = '<button class="quizBtnGreen pullRight">Começar Agora!</button>';
        button = this.footer.getElementsByTagName('button')[0];
        Utils.addEvent(button, 'click', function(){ self.showAsk(); });

    };    

    Quiz.prototype.isLogged = function(){
        var nome = sessionStorage.getItem('nome');
        if(nome) return true;
    };

    Quiz.prototype.showLogin = function(){

        var name, htmlFooter, htmlContainer, htmlChangeLogin, 
            button, buttonChange, novoLogin;
        var self = this;
        name = localStorage.getItem('nome') || 'Visitante';
        
        this.header.innerHTML = "<h2>Olá, " + name  +"</h2>";
        htmlContainer = '<div class="quizLogin">';
        htmlContainer += '<p>' + name +', não é você?</p>';
        htmlContainer += '<button class="quizBtnBlue">Trocar</button>';
        htmlContainer += '<div class="quizLoginChange"><p>Digite seu nick de usuário!</p>';
        htmlContainer += '<input name="nome" placeholder="nick"></div>';
        htmlContainer += "</div>";

        this.container.innerHTML = htmlContainer;

        buttonChange = this.container.getElementsByTagName('button')[0];
        novoLogin    = this.container.getElementsByTagName('div')[1];
        Utils.addEvent(buttonChange, 'click', function(){ 
            novoLogin.style.display = "block";
        });

        this.footer.innerHTML = '<button class="quizBtnGreen pullRight">Entrar!</button>';
        button = this.footer.getElementsByTagName('button')[0];
        Utils.addEvent(button, 'click', function(){ self.validLogin(); });

    };

    Quiz.prototype.validLogin = function(){
        var nameLocal, newName;

        nameLocal = localStorage.getItem('nome');
        newName   = this.container.getElementsByTagName('input')[0].value;
        
        if( !nameLocal && !newName )
            return false;
        
        if(newName) {
            localStorage.setItem('nome', newName);
            sessionStorage.setItem('nome', newName);
        } else {
            sessionStorage.setItem('nome', nameLocal);
        }

        this.showSplash();

    };

    Quiz.prototype.showAsk = function () {
        
        var actual, question, choices, 
            actualChoice, ask, displayChoices, 
            alternatives, className, callSelectAlternative,
            self = this;

        actual   = this.actual;
        
        question = this.questions[actual];
        choices  = question.choices;
        ask      = question.question;
        
        actualChoice = this.answers[actual];

        displayChoices = '<ul>';
        for(i = 0, len = choices.length; i < len; i++){
            className = i === actualChoice ? 'quizSelected' : '';
            
            displayChoices += '<li class="' + className +'"';
            displayChoices += 'data-index="' + i + '">';
            displayChoices += choices[i] + '</li>';
        }

        displayChoices += '</ul>';

        this.setHeader( actual+1, ask);
        this.container.innerHTML = displayChoices;

        alternatives = this.container.getElementsByTagName('li');
        
        callSelectAlternative = function(e){
            self.onClickSelectAlternative(e);
        };

        for(i = 0, len = alternatives.length;  i < len; i++){
            Utils.addEvent(alternatives[i], 'click', callSelectAlternative );
        }

        this.setAskFooter();
    };

    Quiz.prototype.onClickSelectAlternative = function(e) {
        var target, index;

        target = Utils.getTarget(e);
        index  = Utils.getData(target, 'index');
        index  = parseInt(index, 10);

        this.setAnswer(index);
    };

    Quiz.prototype.setAnswer = function(answer) {

        var actualAnswer, formChoices;

        actualAnswer = this.answers[this.actual];
        formChoices  = this.container.getElementsByTagName('li');

        if(answer === undefined || answer === null) {
            return;
        }

        if(actualAnswer !== undefined && actualAnswer !== null) {
            formChoices[actualAnswer].className = '';
        }
        
        if ( formChoices[answer]) {
            formChoices[answer].className = 'quizSelected';
            this.answers[this.actual] = answer;
        }

    };

    Quiz.prototype.setHeader = function(pos, text){
        this.header.innerHTML    = '<h2>' + (pos ? pos + '. ' : '') + text  + '</h2>';
    };    

    Quiz.prototype.setAskFooter  = function(pos, text){
        var buttons, nextBtn, callDirection,
             prevBtn = '', self = this;

        nextBtn = '<button class="quizBtnGreen pullRight" data-direction="next">';
        nextBtn += (this.isTheLast()) ? 'Finalizar' : 'Próxima';

        if( !this.isTheFirst() ){
            prevBtn = '<button class="quizBtnRed pullLeft" data-direction="back">Voltar!';
            prevBtn += '</button>';
        }

        this.footer.innerHTML = prevBtn + nextBtn;

        buttons = this.footer.getElementsByTagName('button');
        
        callDirection = function(evt) {
            // IE8 ealier attach this = window;
            var target = Utils.getTarget(evt);
            var direction = Utils.getData(target, 'direction');
            self.onClickDirectionBtn(direction);
        };

        for(i = 0, len = buttons.length; i < len; i++) {
            Utils.addEvent( buttons[i], 'click', callDirection);
        }
    };

    Quiz.prototype.onClickDirectionBtn = function(direction){
        
        var actualAnswer = this.answers[this.actual];

        if(direction === 'next') {
            if(actualAnswer === undefined || actualAnswer === null) {
                return false;     
            }

            if( this.isTheLast()) {
                this.endGame();
                return;
            }

            this.actual++;
        } else {
            this.actual--;
        }

        this.showAsk();
    };

    Quiz.prototype.endGame = function() {
        var questions, answers, numQuestions,
            containerHtml, button, name,  
            self = this, rigthAnswers = 0;

        name = localStorage.getItem('nome');
        numQuestions = this.questions.length;
        questions    = this.questions;
        answers      = this.answers;
        
        for(i = 0; i < numQuestions; i++ ) {
            rigthAnswers += questions[i].answer === answers[i] ? 1 : 0;
        }

        this.setHeader(0, 'Fim de Jogo!');

        if( rigthAnswers >= (numQuestions/2) ) {
            containerHtml = '<p class="quizEndWin">';
            containerHtml += 'Parabéns ' + name + ' é o grande ganhador da noite!';
            containerHtml += '</p>';
        } else {
            containerHtml = '<p class="quizEndLose">';
            containerHtml += 'Oh não,  ' + name + ' perdeu, que tal tentar de novo?';
            containerHtml += '</p>';
        }

        containerHtml += '<p class="quizScore">Score: ';
        containerHtml += rigthAnswers + '/' + numQuestions + '</p>'; 

        this.container.innerHTML = containerHtml;

        this.footer.innerHTML = '<button class="quizBtnGreen pullRight">Jogar Novamente !</button>';

        button  = this.footer.getElementsByTagName('button')[0];
        Utils.addEvent(button, 'click', function(){ self.init(); });
    };

    Quiz.prototype.isTheLast = function(){
        if( this.actual === (this.questions.length-1))
            return true;
    };    

    Quiz.prototype.isTheFirst = function(){
        if( this.actual === 0)
            return true;
    };

    var Utils = {};
    Utils.removeClass = function(c, e) {
        if (c.length === 0 || c.indexOf(" ") != -1) return;
        var pattern = new RegExp("\\b" + c + "\\b\\s*", "g");
        e.className = e.className.replace(pattern, "");
    };    

    Utils.addEvent = function(elt, evt,  f) {

        if( elt.addEventListener)
            elt.addEventListener(evt, f, false);
        else 
            elt.attachEvent('on'+evt, f);

    };    
   
    Utils.removeEvent = function(elt, evt,  f) {

        if( elt.removeEventListener)
            elt.removeEventListener(evt, f, false);
        else 
            elt.detachEvent('on'+evt, f);

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

    Utils.getData = function(elt, name) {
        if(elt.dataset)
            return elt.dataset[name];
        else 
            return elt.getAttribute('data-'+name);
    };

    Utils.getTarget = function(evt) {
        // IE Attach return event object no-standard
        evt = evt || window.event;
        return evt.target ? evt.target : evt.srcElement;
    };
    
    Utils.clear = function(elt) {
        for(;elt.firstChild;) { elt.removeChild(elt.firstChild); }
    };

    return Quiz;

}());
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

window.onload = function () {
    q = new Quiz('arena', questions);
};