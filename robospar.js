//ROBOSPAR

/* 
F - forward by one
R - turn right (anticlockwise)
Z - zap forward
*/

console.log("Loading robospar.js");
var tileset;
var player1;
var player2;
var end;
var strP1;
var strP2;

var speed;
var frame;

var gameStarted;

var blinkRate;

var p1Input;
var p2Input;
var maxInput;

var board;
var side;
var p1;
var p2;
var dead;
var ray;

var zapArray;
var buttonArray;

var winShown;
var winner;

var notificationText;
var notificationLife;
var notificationRate;

function mouseClicked() {
    "use strict";
    //check buttons
    for (let i = buttonArray.length -1; i >= 0; i--) {
        let xValid = buttonArray[i].x <= mouseX 
                     && buttonArray[i].width + buttonArray[i].x >= mouseX;
        let yValid = buttonArray[i].y <= mouseY 
                     && buttonArray[i].height + buttonArray[i].y >= mouseY;
        
        if(xValid && yValid) {
            buttonArray[i].action();
            buttonArray[i].buttonActivate();
            break;
        }
        /*
        else {
            buttonArray[i].backgroundcolour="rgb(13,161,52)";
        }
        */
    }
}

function InTheSameSquare(obj1, obj2) {
    return obj1.x == obj2.x && obj1.y == obj2.y;
}

console.log("Player Object");
function Player(x,y,d) {
    this.x = x;
    this.y = y;
    this.direction = d;
    this.alive = true;

    this.image = null;
    this.drawS = function() {
        if(!this.alive) {
            this.image = dead;
        }
        push();
        //image(this.image, this.x*100,this.y*100+20);
        translate(this.x*100+50,this.y*100+70); rotate((this.direction*Math.PI/2));
        imageMode(CENTER);
        image(this.image, this.x,this.y);
        pop();
        
    }
    
    this.move = function(step) {
        if (step=="F") {
            //switch case () IDEA
            //https://www.w3schools.com/js/js_switch.asp

            if (this.direction==0) { //right
                this.x++;
            } 
            else if (this.direction==2) { //left
                this.x--;
            }
            else if (this.direction==1) { //down
                this.y++;
            } 
            else { //up
                this.y--;
            }

            if(this.direction%2 == 0) this.x=constrain(this.x, 0, 4);
            else                      this.y=constrain(this.y, 0, 4); //TO DO add extra space so ships can navigate of the map
        }

        else if (step=="R") {
            this.direction+=1;
            this.direction%=4;
        }

        else if (step=="Z") {
            if      (this.direction == 0) for (let i = this.x + 1; i < 5; i++)  zapArray.push(new Zap(i, this.y, this.direction)); //right
            else if (this.direction == 2) for (let i = this.x - 1; i >= 0; i--) zapArray.push(new Zap(i, this.y, this.direction)); //left

            else if (this.direction == 1) for (let i = this.y + 1; i < 5; i++)  zapArray.push(new Zap(this.x, i, this.direction)); //down
            else                          for (let i = this.y - 1; i >= 0; i--) zapArray.push(new Zap(this.x, i, this.direction)); //up

            //awesome 360 no scope one liners
        }
    }
}

console.log("Zap Object");
function Zap(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.life = speed / 2 - speed % 2;
    this.image = ray;
    this.drawZap = function() {
        push();
        translate(this.x*100+50,this.y*100+70); rotate((this.direction*Math.PI/2));
        imageMode(CENTER);
        image(this.image, this.x,this.y);
        pop();
        this.life--;
    }
}

function defaultButtonAction() {
    console.log("Button clicked");
}

function startGame() {
    if(!gameStarted) {
        if(p1Input.text.length == p2Input.text.length) {
            if(p1Input.text === "") {
                notify("Inputs empty");
            } else {
                console.log("Starting Game");
                gameStarted = true;
                p1Input.active = false;
                p2Input.active = false;
                frame = 0;
            }
        } else {
            notify("Inputs aren't equal in length.");
        }
    } 
}

function replayGame() {
    if(gameStarted && winShown) {
        gameStarted = false;
        softReset();
        startGame();
        notify("", 0, 1);
        startGame();
    } else {
        notify("Nothing to replay");
    }
}

function softReset() {
    winShown = false;
    player1.alive = true;
    player2.alive = true;
    player1.x = 2;
    player2.x = 2;
    player1.y = 0;
    player2.y = 4;
    player1.direction = 2;
    player2.direction = 0;
    player1.image = p1;
    player2.image = p2;
    frame = 0;
}

function restartGame() {
    gameStarted = false;
    winner = undefined;
    p1Input.text = "";
    p2Input.text = "";
    softReset();
    notify("Game Reset");
}

function notify(t, duration=1, rate=0.01) {
    notificationText = t;
    notificationLife = duration;
    notificationRate = rate;
}

console.log("Button Object");
function Button(x, y, buttonWidth, buttonHeight, textObject, 
                backgroundcolour=color("#aaa"), strokecolour=color("#bbb"),
                textColour=color("#222"), action=defaultButtonAction) {
    //Initial values of the button
    //Required values
    this.x = x;                                      //The x position on the canvas
    this.y = y;                                      //The y position on the canvas
    this.width = buttonWidth;                        //The width of the button
    this.height = buttonHeight;                      //The height of the button
    this.textObject = textObject;                    //Either string or image to be displayed
    
    //Optional values
    this.backgroundcolour = color(backgroundcolour); //The colour of the inside of the button
    this.strokecolour = color(strokecolour);         //The colour of the outside of the button
    this.textColour = color(textColour);             //The colour of the text inside the button
    this.action = action;                            //The action that will be executed if the button is clicked
    
    //Static values
    this.rectModeSetting = CORNER;                   //The rectMode value
    this.textAlignment = CENTER;                     //The textAlign value
    this.textSize = 24;
    
    //Compute values
    this.down = false;
    this.above = false;

    //Draw function
    this.drawButton = function() {
        
        this.above = this.x <= mouseX && this.width + this.x >= mouseX && 
                     this.y <= mouseY && this.height + this.y >= mouseY;
        
        this.down = mouseIsPressed && this.above;

        rectMode(this.rectModeSetting);
        
        //fill(this.backgroundcolour);
        noFill();
        strokeWeight(4);
        stroke(this.strokecolour);
        
        rect(this.x, this.y, this.width, this.height,10);
        
        noStroke();
        if (typeof this.textObject == typeof "string") {
            fill(this.textColour);
            textSize(this.textSize);
            textAlign(this.textAlignment, this.textAlignment);
            //Don't understand why it's not centering properly so plus 3
            text(this.textObject, this.x + 3, this.y, this.width, this.height);
            textAlign(CENTER, BASELINE); //just in case
        } else {
            //assuming image
            imageMode(this.textAlignment);
            image(this.textObject, this.x + this.width / 2, this.y);
        }
        
        if (this.down) {
            fill("rgba(0,0,0,0.3)");
            noStroke();
            rect(this.x, this.y, this.width, this.height,10);
        } else if (this.above) {
            fill("rgba(28,57,84,0.3)");
            noStroke();
            rect(this.x, this.y, this.width, this.height,10);
        }
    }

    //This button adds itself to the button array when created
    buttonArray.push(this);
}



function Input(x, y, inwidth, inheight, textFill) {
    this.x = x;
    this.y = y;
    this.width = inwidth;
    this.height = inheight;
    
    this.active = false;
    this.text = "";

    this.textFill = textFill;
    this.blinkFrame = null;


    this.drawInput = function() {
        let blinker = (this.blinkFrame / blinkRate) % 2 < 1 ? " " : "|";
        if(this.active) this.blinkFrame++;
        else this.blinkFrame = blinkRate -1;
        fill(this.textFill);
        noStroke();
        textSize(32);
        text(this.text + blinker, this.x, this.y+4, this.width, this.height);
    }
    
    this.autoAdd = function(letter) {
        if(this.active) this.addLetter(letter);
    }
    
    this.addLetter = function (letter) {
        if(this.text.length + 1 > maxInput) notify("You can't have more than " + maxInput + " commands");
        else this.text+=letter;
    }
    
    this.removeLast = function() {
        this.text = this.text.slice(0, -1);
    }
    
    this.autoRemove = function() {
        if(this.active) this.removeLast();
    }
}

function keyPressed() {
    if(!gameStarted) {
        if (key == "1") {
            p1Input.active = true;
            p2Input.active = false;
        } else if (key == "2") {
            p1Input.active = false;
            p2Input.active = true;
        } else {
            console.log(key);
            console.log(p1Input.active);
            switch(key.toLowerCase()) {
                case "f":
                case "r":
                case "z":
                    p1Input.autoAdd(key);
                    p2Input.autoAdd(key);
                    break;
            }

            if(keyCode === 46) { //delete key. (backspace will not work because it would send the site backwards)
                p1Input.autoRemove();
                p2Input.autoRemove();
            }
            
        }
    }
}

function preload() {
    console.log("Preloading started");
    board = loadImage("img/boardsimple.png");
    side = loadImage("img/side1.png");
    p1 = loadImage("img/bluebb.png");
    p2 = loadImage("img/redbb.png");
    dead = loadImage("img/dead.png");
    ray = loadImage("img/ray.png");
    console.log("Preloading finished");
}

function setup() {
    "use strict";
    let canvas=createCanvas(1000, 540);


    canvas.parent("sketchholder");

    console.log("Setup started");
    //angleMode(DEGREES);
    player1 = new Player(2, 0, 2); //blue player
    player1.image = p1;
    player2 = new Player(2, 4, 0); //red player
    player2.image = p2;
    
    //frameRate(10);
    speed = 40;
    frame = 1;
    
    blinkRate = 30;
    
    p1Input = new Input(640,320,320,40,"rgb(115,135,219)");
    p2Input = new Input(640,396,320,40,"rgb(226,124,161)");
    
    zapArray = []; 
    buttonArray = [];
    
    winShown = false;
    
    gameStarted = false;
    
    maxInput = 12; //Maximum number of moves
    
    new Button(580, 462, 100, 40, "start", color("#3c664c"), color("#203c0f"), color("#203c0f")).action=startGame;
    new Button(705, 462, 100, 40, "replay", color("#3c664c"), color("#203c0f"), color("#203c0f")).action=replayGame;
    new Button(830, 462, 100, 40, "restart", color("#3c664c"), color("#203c0f"), color("#203c0f")).action=restartGame;
    
}

console.log("Draw function");

function draw() {
    image(board, 0, 0);
    image(side, 500, 0);
    
    player1.drawS();
    player2.drawS();
    
    for(let i = 0; i < buttonArray.length; i++) {
        buttonArray[i].drawButton();
    }
    
    fill(20,20,200);
    stroke(10,10,120);
    p1Input.drawInput();
    

    fill(200,20,20);
    stroke(120,10,10);
    p2Input.drawInput();
    
    if(notificationLife > 0) {
        
        rectMode(CENTER);
        
        let tmpAlpha = notificationLife > 1 ? 1 : notificationLife;
        tmpAlpha = tmpAlpha < 0 ? 0 : tmpAlpha;
        
        let tmpCol = color("rgba(69,31,120," + tmpAlpha + ")");
        
        fill(tmpCol);
        rect(width/4, height/2, width/2, 100);
        
        tmpCol = color("rgba(172,115,255," + tmpAlpha + ")");
        fill(tmpCol);
        rect(width/4, height/2, width/2, 70);
        
        tmpCol = color("rgba(43,14,85," + tmpAlpha + ")");
        fill(tmpCol);
        textSize(28);
        textAlign(CENTER);
        text(notificationText, width/4, height/2+7);
        notificationLife-=notificationRate;
    }
    
    //Game Logic
    if(gameStarted) {
        if (frame%speed === 0) {
            if(winShown) {
                
            }
            //P1=BLUE (2,0,2)
            //P2=RED (2,4,0)
            else if ((player1.y==4 && player1.direction==1) && (player2.y==0 && player2.direction==3)){
                winner="Player 1 & Player 2";
                winShown=true;
                notify(winner+" draw!",1,0.005);
                }


            else if(player1.y==4 && player1.direction==1) {
                winner="Player 1";
                winShown=true;
                notify(winner+" won!",1,0.005);
                }
            else if(player2.y==0 && player2.direction==3) {
                winner="Player 2";
                winShown=true;
                notify(winner+" won!",1,0.005);
                }
            else if(!(player1.alive && player2.alive)) {
                //Here we show who won
                if      (player1.alive) winner = "Player 1";
                else if (player2.alive) winner = "Player 2";
                else                    winner = "No one";
                console.log(winner + " won");
                winShown = true;
                notify(winner + " won!", 1, 0.005);
            } 
            //If they're not alive, you can't move them
            else if (p1Input.text.length>(frame/speed)-1) {
                player1.move(p1Input.text[(frame/speed)-1]);
                player2.move(p2Input.text[(frame/speed)-1]);

                if(InTheSameSquare(player1, player2)) { //They crash if they're on the same square
                    player1.alive = false;
                    player2.alive = false;
                }
            } else {
                if(!winShown) {
                    winner = "No one";
                    winShown = true;
                    notify(winner + " won!", 1, 0.005);
                }
            }
        }

        if(zapArray.length != 0) {
            for (let i = zapArray.length - 1; i >= 0; i--) {
                zapArray[i].drawZap();
                if(InTheSameSquare(zapArray[i], player1)) player1.alive = false;
                if(InTheSameSquare(zapArray[i], player2)) player2.alive = false;
            }

            if(!zapArray[0].life) zapArray = [];
        }
        
        frame++;
    }
}

console.log("EOF");