(function (modules) {
    var cache = {}, require = function (id) {
            var module = cache[id];
            if (!module) {
                module = cache[id] = {};
                var exports = module.exports = {};
                modules[id].call(exports, require, module, exports, typeof window == 'undefined' ? {} : window);
            }
            return module.exports;
        };
    require('0');
}({
    '0': function (require, module, exports, global) {
        require('1')();
    },
    '1': function (require, module, exports, global) {
        module.exports = function () {
            var stage = new PIXI.Stage(0);
            var v = require('2');
            var onclick = [], birds = [];
            var stageWidth = 768;
            var stageHeight = 800;
            var renderer = PIXI.autoDetectRenderer(stageWidth, stageHeight);
            document.body.appendChild(renderer.view);
            var gravity = v(0, 1);
            var backgroundScrollSpeed = 5;
            var scrollSpeed = 3.75;
            var floorHeight = 130;
            var floorPosition = stageHeight - floorHeight;
            var NUM_PIPES = 6;
            var backgroundTexture = PIXI.Texture.fromImage('images/background.png');
            var pipesTexture = PIXI.Texture.fromImage('images/pipe.png');
            var topPipesTexture = PIXI.Texture.fromImage('images/pipe.png');
            var bottomPipes = [];
            var topPipes = [];
            var first_pipe_position = stageWidth + 200, distance_between_pipes = 500;
            for (var i = 0; i < NUM_PIPES; i++) {
                bottomPipes.push(new PIXI.Sprite(pipesTexture));
                bottomPipes[i].velocity = v(-scrollSpeed, 0);
                var randomOffset = Math.random() * 400;
                var topY = randomOffset - stageHeight;
                var bottomY = topY + 1000;
                bottomPipes[i].position = v(first_pipe_position + i * distance_between_pipes, bottomY);
                bottomPipes[i].acceleration = v(0, 0);
                bottomPipes[i].scale.x = 0.8;
                topPipes.push(new PIXI.Sprite(pipesTexture));
                topPipes[i].anchor.y = 1;
                topPipes[i].scale.y = -1;
                topPipes[i].scale.x = 0.8;
                topPipes[i].velocity = v(-scrollSpeed, 0);
                topPipes[i].position = v(first_pipe_position + i * distance_between_pipes, topY);
                topPipes[i].acceleration = v(0, 0);
            }
            var background = new PIXI.TilingSprite(backgroundTexture, stageWidth, stageHeight);
            background.position.x = 0;
            background.position.y = 0;
            background.tilePosition.x = 0;
            background.tilePosition.y = stageHeight - 896 - floorHeight;
            stage.addChild(background);
            var groundTexture = PIXI.Texture.fromImage('images/ground.png');
            var ground = new PIXI.TilingSprite(groundTexture, stageWidth, floorHeight);
            ground.position.x = 0;
            ground.position.y = stageHeight - floorHeight;
            ground.tilePosition.x = 0;
            ground.tilePosition.y = 0;
            stage.addChild(ground);
            var assetsToLoader = ['images/birdspritesheet.json'];
            loader = new PIXI.AssetLoader(assetsToLoader);
            loader.onComplete = onAssetsLoaded;
            loader.load();
            function create(clone) {
                var bird = new PIXI.MovieClip(anibird);
                bird.animationSpeed = 1 / 5;
                bird.gotoAndPlay(0);
                bird.anchor.x = 0.5;
                bird.anchor.y = 0.5;
                bird.scale.x = 0.6;
                bird.scale.y = 0.6;
                bird.position.x = 60;
                bird.position.y = 150;
                bird.acceleration = gravity;
                if (clone) {
                    if (birds.indexOf(clone) == -1) {
                        clone = birds.filter(function (b) {
                            return !b.isDead;
                        })[0];
                        console.log('new spawner', clone);
                    }
                    bird.velocity = v(0, 0);
                    bird.velocity.y = -18;
                    bird.position.y = clone.position.y;
                }
                bird.onclick = function () {
                    if (!bird.isDead) {
                        bird.velocity.y = -15;
                    }
                    if (!clone || birds.indexOf(bird) == 0) {
                        var cloned = create(bird);
                        birds.push(cloned);
                        stage.addChild(cloned);
                    }
                };
                onclick.push(bird.onclick);
                return bird;
            }
            var scoreText;
            var anibird, score = 0;
            function onAssetsLoaded() {
                anibird = [
                    PIXI.Texture.fromFrame('bird1.png'),
                    PIXI.Texture.fromFrame('bird2.png'),
                    PIXI.Texture.fromFrame('bird3.png')
                ];
                var bird = create();
                birds.push(bird);
                stage.addChild(bird);
                for (i = 0; i < bottomPipes.length; i++) {
                    stage.addChild(bottomPipes[i]);
                }
                for (i = 0; i < topPipes.length; i++) {
                    stage.addChild(topPipes[i]);
                }
                var style = {
                        font: '40px Tahoma',
                        fill: 'whitesmoke'
                    };
                scoreText = new PIXI.Text('0', style);
                scoreText.position.y = 100;
                scoreText.position.x = stageWidth / 2;
                stage.addChild(scoreText);
            }
            function checkAndRemoveClick(bird) {
                var clickHandler = onclick.indexOf(bird.onclick);
                if (clickHandler !== -1)
                    onclick.splice(clickHandler, 1);
            }
            function animate() {
                if (birds.length) {
                    background.tilePosition.x -= backgroundScrollSpeed;
                    ground.tilePosition.x -= backgroundScrollSpeed;
                    var deaths = [];
                    var i, max = birds.length;
                    for (i = 0; i < max; i++) {
                        accelerate(birds[i]);
                        checkCollisions(birds[i]);
                        checkBottomPipeCollisions(birds[i]);
                        checkTopPipeCollisions(birds[i]);
                        checkDead(birds[i], deaths);
                    }
                    function remove(bird) {
                        var idx = birds.indexOf(bird);
                        birds.splice(idx, 1);
                    }
                    for (i = 0, max = deaths.length; i < max; i++) {
                        remove(deaths[i]);
                    }
                    for (i = 0, max = bottomPipes.length; i < max; i++) {
                        bottomPipes[i].position.x -= scrollSpeed;
                    }
                    for (i = 0, max = topPipes.length; i < max; i++) {
                        topPipes[i].position.x -= scrollSpeed;
                    }
                    resetPipes();
                }
                requestAnimFrame(animate);
                renderer.render(stage);
            }
            var accelerate = require('3');
            function checkCollisions(bird) {
                var maxYPos = floorPosition - bird.texture.height * 0.5;
                if (bird.position.y > maxYPos) {
                    bird.acceleration = v(0, 0);
                    bird.position.y = maxYPos;
                    bird.velocity.x = -scrollSpeed;
                    deadise(bird);
                }
            }
            function click() {
                for (var i = 0, max = onclick.length; i < max; i++) {
                    onclick[i]();
                }
            }
            function updateScore(delta) {
                score += delta;
                scoreText.setText(score);
            }
            function resetPipes() {
                for (var i = 0; i < bottomPipes.length; i++) {
                    if (bottomPipes[i].position.x < -200) {
                        bottomPipes[i].position.x = bottomPipes[i].position.x + NUM_PIPES * distance_between_pipes;
                        updateScore(birds.length);
                    }
                }
                for (var i = 0; i < topPipes.length; i++) {
                    if (topPipes[i].position.x < -200) {
                        topPipes[i].position.x = topPipes[i].position.x + NUM_PIPES * distance_between_pipes;
                    }
                }
            }
            function checkBottomPipeCollisions(currentBird) {
                for (var i = 0; i < bottomPipes.length; i++) {
                    var currentPipe = bottomPipes[i];
                    var leftOverlap = currentBird.position.x + currentBird.width / 2 - currentPipe.position.x;
                    var topOverlap = currentBird.position.y + currentBird.height / 2 - currentPipe.position.y;
                    var rightOverlap = currentPipe.position.x + currentPipe.width - (currentBird.position.x - currentBird.width / 2);
                    if (leftOverlap > 0 && topOverlap > 0 && rightOverlap > 0) {
                        if (leftOverlap < topOverlap && leftOverlap < rightOverlap) {
                            currentBird.velocity.x = -scrollSpeed;
                            deadise(currentBird);
                        } else if (topOverlap < leftOverlap && topOverlap < rightOverlap) {
                            currentBird.velocity.y = -10;
                            deadise(currentBird);
                        }
                    }
                }
            }
            function checkTopPipeCollisions(currentBird) {
                for (var i = 0; i < topPipes.length; i++) {
                    var currentPipe = topPipes[i];
                    var topPipeHeight = -currentPipe.height;
                    var leftOverlap = currentBird.position.x + currentBird.width / 2 - currentPipe.position.x;
                    var bottomOverlap = currentPipe.position.y + topPipeHeight - (currentBird.position.y - currentBird.height / 2);
                    var rightOverlap = currentPipe.position.x + currentPipe.width - (currentBird.position.x - currentBird.width / 2);
                    if (leftOverlap > 0 && bottomOverlap > 0 && rightOverlap > 0) {
                        if (leftOverlap < bottomOverlap && leftOverlap < rightOverlap) {
                            currentBird.velocity.x = -scrollSpeed;
                            deadise(currentBird);
                        } else if (bottomOverlap < leftOverlap && bottomOverlap < rightOverlap) {
                            currentBird.velocity.y = 0;
                            deadise(currentBird);
                        }
                    }
                }
            }
            function checkDead(currentBird, deaths) {
                if (currentBird.position.x + currentBird.width / 2 < 0) {
                    deaths.push(currentBird);
                }
            }
            function deadise(bird) {
                if (!bird.isDead) {
                    updateScore(-2);
                    bird.blendMode = PIXI.blendModes.MULTIPLY;
                    bird.isDead = true;
                    bird.stop();
                    checkAndRemoveClick(bird);
                }
            }
            document.addEventListener('keydown', function (event) {
                if (event.keyCode == 32) {
                    click();
                }
            });
            document.addEventListener('mousedown', function (event) {
                click();
            });
            requestAnimFrame(animate);
        };
    },
    '2': function (require, module, exports, global) {
        module.exports = function vector(x, y) {
            return {
                x: x,
                y: y,
                add: function (vector) {
                    this.x += vector.x;
                    this.y += vector.y;
                }
            };
        };
    },
    '3': function (require, module, exports, global) {
        var v = require('2');
        module.exports = function accelerate(object) {
            if (!object.velocity) {
                object.velocity = v(0, 0);
            }
            object.velocity.add(object.acceleration);
            object.position.x += object.velocity.x;
            object.position.y += object.velocity.y;
            object.rotation = Math.PI / 2 * Math.sin(object.velocity.y / 100);
        };
    }
}));
