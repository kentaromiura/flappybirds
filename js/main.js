module.exports = function(){
// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x000000);
var v = require("./vector")


var onclick = [], birds = []
// create a renderer instance.
var stageWidth = 768;
var stageHeight = 800;
var renderer = PIXI.autoDetectRenderer(stageWidth, stageHeight);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

//Game params
var gravity = v(0,1);
var backgroundScrollSpeed = 5; //Pixels per frame (I think)
var scrollSpeed = 3.75;
var floorHeight = 130;
var floorPosition = stageHeight - floorHeight;
var NUM_PIPES = 6;
//Background
var backgroundTexture = PIXI.Texture.fromImage("images/background.png")

// Pipes !!!!
var pipesTexture = PIXI.Texture.fromImage("images/pipe.png")
var topPipesTexture = PIXI.Texture.fromImage("images/pipe.png")
var bottomPipes = []
var topPipes = []


var first_pipe_position = stageWidth + 200,
    distance_between_pipes = 500
    
var randomOffset = Math.random() * 400
var topY = randomOffset - stageHeight
var bottomY = topY + 1000

function insertPipes() {
    var removePipeFromStage = function(pipe){
        stage.removeChild(pipe);
    }
    bottomPipes.forEach(removePipeFromStage);
    topPipes.forEach(removePipeFromStage);
    bottomPipes = [];
    topPipes = [];
    for (var i = 0; i < NUM_PIPES; i++) {
        bottomPipes.push(new PIXI.Sprite(pipesTexture));
        bottomPipes[i].velocity = v(-scrollSpeed, 0)

        bottomPipes[i].position = v(first_pipe_position + i*distance_between_pipes, bottomY)
        bottomPipes[i].acceleration = v(0,0)
        bottomPipes[i].scale.x = 0.8

        topPipes.push(new PIXI.Sprite(pipesTexture));
        topPipes[i].anchor.y = 1
        topPipes[i].scale.y = -1
        topPipes[i].scale.x = 0.8
        topPipes[i].velocity = v(-scrollSpeed, 0)
        topPipes[i].position = v(first_pipe_position + i*distance_between_pipes, topY)
        topPipes[i].acceleration = v(0,0)
    }
}
insertPipes();

var background = new PIXI.TilingSprite(backgroundTexture, stageWidth, stageHeight)
background.position.x = 0;
background.position.y = 0//stageHeight - 896;
background.tilePosition.x = 0;
background.tilePosition.y = stageHeight - 896 - floorHeight;
stage.addChild(background);
//Ground
var groundTexture = PIXI.Texture.fromImage("images/ground.png");

var ground = new PIXI.TilingSprite(groundTexture, stageWidth, floorHeight)
ground.position.x = 0;
ground.position.y = stageHeight-floorHeight;
ground.tilePosition.x = 0;
ground.tilePosition.y = 0;
stage.addChild(ground);

var assetsToLoader = ["images/birdspritesheet.json"];
loader = new PIXI.AssetLoader(assetsToLoader);
loader.onComplete = onAssetsLoaded;
loader.load();

    
function create(clone){
    var bird = new PIXI.MovieClip(anibird)
    bird.animationSpeed = 1/5
    bird.gotoAndPlay(0)
    // center the sprites anchor point
    
    bird.anchor.x = 0.5;
    bird.anchor.y = 0.5;
    bird.scale.x = 0.6;
    bird.scale.y = 0.6;
    
    
    bird.position.x = 60;
    bird.position.y = 150;
    bird.acceleration = gravity;
    if(clone){
        if(birds.indexOf(clone) == -1){
            clone = birds.filter(function(b){return !b.isDead})[0]
            console.log("new spawner" ,clone)
        }
        
        // adding clone differencies
        bird.velocity = v(0,0)
        bird.velocity.y = -18
        bird.position.y = clone.position.y
        //bird.position.x = 30
    }
    
    bird.onclick = function(e){
        // click on the modal.
        if (!bird.velocity) return;
        if (!bird.isDead) {
            bird.velocity.y = -15
        }
        
        if(!clone || birds.indexOf(bird)==0){
            var cloned = create(bird)
            birds.push(cloned)
            stage.addChild(cloned)
        }
        
    };
    onclick.push(bird.onclick)
    return bird;
}

var scoreText
var anibird, score = 0;    
function onAssetsLoaded() {
    anibird = [PIXI.Texture.fromFrame("bird1.png"), PIXI.Texture.fromFrame("bird2.png"), PIXI.Texture.fromFrame("bird3.png")]
    var bird = create();
    birds.push(bird)
    
    stage.addChild(bird);
    for(i = 0; i < bottomPipes.length; i++){
      stage.addChild(bottomPipes[i])
    }
    for(i = 0; i < topPipes.length; i++){
      stage.addChild(topPipes[i])
    }
    
    var style = {font:"40px Tahoma", fill:"whitesmoke"};
     
    scoreText = new PIXI.Text("0", style);
    scoreText.position.y = 100
    scoreText.position.x = stageWidth / 2    
    stage.addChild(scoreText);

}
    
function checkAndRemoveClick(bird){
    var clickHandler = onclick.indexOf(bird.onclick)
    if(clickHandler !== -1) onclick.splice(clickHandler, 1)
}
    
    
function animate()
{
    if (birds.length) {
        background.tilePosition.x -= backgroundScrollSpeed;
        ground.tilePosition.x -= backgroundScrollSpeed;
        
        var deaths = []
        var i, max = birds.length;
        for(i=0; i<max; i++){
            accelerate(birds[i]);
            checkCollisions(birds[i]);
            checkBottomPipeCollisions(birds[i])
            checkTopPipeCollisions(birds[i])
            checkDead(birds[i], deaths)
        }
        
        
        function remove(bird){
         var idx = birds.indexOf(bird)
            birds.splice(idx, 1)
        }
        for(i=0, max = deaths.length; i < max; i++){
            remove(deaths[i])
        }
        
        for(i=0, max = bottomPipes.length; i < max; i++){
            bottomPipes[i].position.x -= scrollSpeed
        }
        for(i=0, max = topPipes.length; i < max; i++){
            topPipes[i].position.x -= scrollSpeed
        }
        resetPipes()
        requestAnimationFrame(animate);

    } else {
        showDeadMessage();
    }

    // render the stage
    renderer.render(stage);
}
    
var accelerate = require("./accelerate")

function checkCollisions(bird) {
    var maxYPos = floorPosition - (bird.texture.height * 0.5);
    if (bird.position.y > maxYPos) {
        //Stop the bird falling
        bird.acceleration = v(0,0);
        bird.position.y = maxYPos;
        bird.velocity.x = -scrollSpeed
        deadise(bird)
    }
}

function click() {
  //raw event handler :)    
  for(var i = 0, max = onclick.length; i < max; i++){
    onclick[i]()
  }    
}
function updateScore(delta) {
    score += delta
    scoreText.setText(score)
}
    
function resetPipes() {
    for (var i = 0; i < bottomPipes.length; i++) {
        if (bottomPipes[i].position.x < -200) {
            bottomPipes[i].position.x = bottomPipes[i].position.x + (NUM_PIPES * distance_between_pipes)
            updateScore(birds.length)
        }
    }
    for (var i = 0; i < topPipes.length; i++) {
        if (topPipes[i].position.x < -200) {
            topPipes[i].position.x = topPipes[i].position.x + (NUM_PIPES * distance_between_pipes)
        }
    }
}
    
function checkBottomPipeCollisions(currentBird) {
    for (var i = 0; i < bottomPipes.length; i++) {
        var currentPipe = bottomPipes[i];
        var leftOverlap = currentBird.position.x + currentBird.width/2 - currentPipe.position.x;
        var topOverlap = currentBird.position.y + currentBird.height/2 - currentPipe.position.y;
        var rightOverlap = currentPipe.position.x + currentPipe.width - (currentBird.position.x - currentBird.width/2);
        if (leftOverlap > 0 && topOverlap > 0 && rightOverlap > 0) {
            if (leftOverlap < topOverlap && leftOverlap < rightOverlap) {
                currentBird.velocity.x = -scrollSpeed
                deadise(currentBird)
            }else if (topOverlap < leftOverlap && topOverlap < rightOverlap) {
                currentBird.velocity.y = -10
                deadise(currentBird)
            }
        }
    }
}

function checkTopPipeCollisions(currentBird) {
    for (var i = 0; i < topPipes.length; i++) {
        var currentPipe = topPipes[i];
        var topPipeHeight = -currentPipe.height
        var leftOverlap = currentBird.position.x + currentBird.width/2 - currentPipe.position.x;
        var bottomOverlap = (currentPipe.position.y + topPipeHeight) - (currentBird.position.y - currentBird.height/2);
        var rightOverlap = currentPipe.position.x + currentPipe.width - (currentBird.position.x - currentBird.width/2);
        if (leftOverlap > 0 && bottomOverlap > 0 && rightOverlap > 0) {
            if (leftOverlap < bottomOverlap && leftOverlap < rightOverlap) {
                currentBird.velocity.x = -scrollSpeed
                deadise(currentBird)
            }else if (bottomOverlap < leftOverlap && bottomOverlap < rightOverlap) {
                currentBird.velocity.y = 0
                deadise(currentBird)
            }
        }
    }
}
    
function checkDead(currentBird, deaths) {
    if (currentBird.position.x + currentBird.width /2 < 0) {
        deaths.push(currentBird)
    }
}

function deadise(bird) {
    if (!bird.isDead) {
        updateScore(-1)
        bird.blendMode = PIXI.blendModes.MULTIPLY
        bird.isDead = true
        bird.stop()
        checkAndRemoveClick(bird)
    }
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 32) {
        click();
    }
});

document.addEventListener('mousedown', function(event) {
    click();
});

document.addEventListener('touchend', function(event) {
   if (event.path && event.path[0] instanceof HTMLCanvasElement) click();
});

window.onload = function(){
    document.getElementById('animated').open();
}

var started = false;
window.start = function() {
    if (!started) {
        started = true; 
        requestAnimationFrame(animate);
    }
}

window.restart = function() {
    score = 0;
    updateScore(0);
    insertPipes();
    for(i = 0; i < bottomPipes.length; i++){
      stage.addChild(bottomPipes[i])
    }
    for(i = 0; i < topPipes.length; i++){
      stage.addChild(topPipes[i])
    }
    setTimeout(function(){
    var bird = create();
        birds.push(bird)

        stage.addChild(bird);
        requestAnimationFrame(animate);
    }, 300); // wait for animation to end.
}

function showDeadMessage(){
    var scoreDialog = document.getElementById('score');
    scoreDialog.querySelector('p span').innerHTML = score;
    started = false;
    scoreDialog.open();
}


}