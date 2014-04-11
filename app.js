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
        this.loadTemplates();
        this.init();
        this.rank = new Ranking();
    }
    
    Quiz.prototype.loadTemplates = function() {
        var header, footer, login, 
            splash, ask, endGame;
        
        header  = document.getElementById('header-tpl').innerHTML;
        footer  = document.getElementById('footer-tpl').innerHTML;
        login   = document.getElementById('login-tpl').innerHTML;
        splash  = document.getElementById('splash-tpl').innerHTML;
        ask     = document.getElementById('choices-tpl').innerHTML;
        endGame = document.getElementById('endGame-tpl').innerHTML;
        
        this.headerTpl  = Handlebars.compile(header);
        this.footerTpl  = Handlebars.compile(footer);
        this.loginTpl   = Handlebars.compile(login);
        this.splashTpl  = Handlebars.compile(splash);
        this.askTpl     = Handlebars.compile(ask);
        this.endGameTpl = Handlebars.compile(endGame);
    };
  
    Quiz.prototype.init = function() {

        var fragment, header, footer, container;

        this.stage.innerHTML = '';

        fragment = document.createDocumentFragment();
 
        header   = document.createElement('div');
        header.className = 'quizHeader panel-heading';
 
        container = document.createElement('div');
        container.className = 'quizContainer panel-body';
     
        footer = document.createElement('div');
        footer.className = 'quizFooter panel-footer clearfix';
     
        fragment.appendChild(header);
        fragment.appendChild(container);
        fragment.appendChild(footer);
 
        this.stage.appendChild(fragment);

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

        var button, self = this;
      
        this.header.innerHTML    = this.headerTpl({title: 'Bem Vindo ao Super Quiz NFL!'});
        this.container.innerHTML = this.splashTpl();
        this.footer.innerHTML    = this.footerTpl({buttonRight: 'Começar Agora!'});
        
        button = this.footer.getElementsByTagName('button')[0];
        Utils.addEvent(button, 'click', function(){ self.showAsk(); });

    };    

    Quiz.prototype.isLogged = function(){
        var nome = sessionStorage.getItem('nome');
        if(nome) return true;
    };

    Quiz.prototype.showLogin = function(){

        var name, dataHeader, dataLogin, 
            hasLogin, button, buttonChange, 
            novoLogin, self = this;
        
        name       = localStorage.getItem('nome') || 'Visitante';
        hasLogin   = localStorage.getItem('nome');
        dataHeader = {title: "Olá, "+name};
        dataLogin  = { hasLogin: hasLogin, name: name};

        this.header.innerHTML    = this.headerTpl(dataHeader);
        this.container.innerHTML = this.loginTpl(dataLogin);

        novoLogin  = this.container.getElementsByTagName('div')[1];
        if(hasLogin){
            buttonChange = this.container.getElementsByTagName('button')[0];
            Utils.addEvent(buttonChange, 'click', function(){ 
                Utils.removeClass('invisible', novoLogin);
            });
        }

        this.footer.innerHTML = this.footerTpl({buttonRight: 'Enviar!'});
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
            actualChoice, ask, dataAsk, 
            alternatives, callSelectAlternative,
            self = this;

        actual   = this.actual;
        question = this.questions[actual];
        choices  = question.choices;
        ask      = question.question;
        
        actualChoice = this.answers[actual];
        dataAsk = {choices: choices, actualAnswer: actualChoice};


        this.setHeader( actual+1, ask);
        this.container.innerHTML = this.askTpl(dataAsk);

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
            Utils.removeClass('list-group-item-warning', formChoices[actualAnswer]);
        }
        
        if ( formChoices[answer]) {
            Utils.addClass('list-group-item-warning', formChoices[answer]);
            this.answers[this.actual] = answer;
        }

    };

    Quiz.prototype.setHeader = function(pos, text){
        var title = (pos ? pos + '. ' : '') + text;
        this.header.innerHTML = this.headerTpl({title: title}) ;
    };    

    Quiz.prototype.setAskFooter  = function(pos, text){
        var buttons, nextBtn, callDirection, dataFooter, 
             prevBtn = '', self = this;

        nextBtn = (this.isTheLast()) ? 'Finalizar' : 'Próxima';

        if( !this.isTheFirst() ){
            prevBtn = 'Voltar';
        }
      
        dataFooter = {buttonLeft: prevBtn, buttonRight: nextBtn};
        this.footer.innerHTML = this.footerTpl(dataFooter);

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
            dataEnd, button, name,  dataFooter,
            self = this, rigthAnswers = 0;

        name = localStorage.getItem('nome');
        numQuestions = this.questions.length;
        questions    = this.questions;
        answers      = this.answers;
        
        for(i = 0; i < numQuestions; i++ ) {
            rigthAnswers += questions[i].answer === answers[i] ? 1 : 0;
        }

        this.rank.save(name, rigthAnswers);

        this.setHeader(0, 'Fim de Jogo!');

        dataEnd = {
          name: name,
          numQuestions: numQuestions,
          rightAnswers: rigthAnswers,
          win:  rigthAnswers >= (numQuestions/2),
          ranking: this.rank.getAll()
        };
        dataFooter = {buttonRight: 'Jogar Novamente !'};
        
        this.container.innerHTML = this.endGameTpl(dataEnd);
        this.footer.innerHTML     = this.footerTpl(dataFooter);

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

    function Ranking() {
        var rank = localStorage.getItem('ranking');
        if(rank)
            this.rank = JSON.parse(rank);
        else
            this.rank = [];
     }
    
    Ranking.prototype.getAll = function(){
        this.rank.sort(function(x,y) {
            if(x.points > y.points) return -1;
            if(x.points < y.points) return 1;
            return 0;
        });
        return this.rank;
    };

    Ranking.prototype.search = function(nick) {
        for( var i = 0, len = this.rank.length; i < len; i++ ) {
            if(this.rank[i].nick === nick) {
                return i;    
            }
        }
        return false;
    };
    Ranking.prototype.save = function(nick, points) {
        var id, rankString;

        id = this.search(nick);
        
        if( id === false ) {
            this.rank.push({nick: nick, points: points});
        } else {
            this.rank[id].points += points;
        }

        rankString = JSON.stringify(this.rank);
        localStorage.setItem('ranking', rankString);
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