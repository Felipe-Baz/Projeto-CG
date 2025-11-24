import { initWebGL, resizeCanvasToDisplaySize } from './webgl/initGL.js';
import { createShader, createProgram, loadShader } from './webgl/shaderUtils.js';
import { Camera } from './webgl/camera.js';
import { Ship } from './game/player.js';
import { World } from './game/world.js';
import { AsteroidManager } from './game/obstacle.js';
import { BossManager } from './game/boss.js';
import { Projectile } from './game/projectile.js';
import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';

let gl;
let programInfo;
let ship;
let world;
let camera;
let asteroidManager;
let bossManager;
let projectiles = [];
// Para controle de câmera
let cameraModeIndex = 0;
// Game timing
let lastTime = 0;

async function init() {
    // Get WebGL context
    const canvas = document.querySelector('#glCanvas');
    gl = initWebGL(canvas);

    // Load and compile shaders
    const vertexShaderSource = await loadShader('./shaders/vertex.glsl');
    const fragmentShaderSource = await loadShader('./shaders/fragment.glsl');

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    // Store program info
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            position: gl.getAttribLocation(shaderProgram, 'aPosition'),
            color: gl.getAttribLocation(shaderProgram, 'aColor'),
        },
        uniformLocations: {
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        },
    };

    // Initialize objects
    ship = new Ship(gl);
    world = new World(gl, 20);
    asteroidManager = new AsteroidManager(gl, ship);
    bossManager = new BossManager(gl, asteroidManager);
    projectiles = [];
    console.log('Ship created at position:', ship.getPosition());

    camera = new Camera();
    camera.updateProjectionMatrix(gl.canvas.width / gl.canvas.height);

    // Listener para troca de câmera
    window.addEventListener('keydown', (e) => {
        if (e.key === '1') {
            cameraModeIndex = 0;
            camera.switchMode(0);
        } else if (e.key === '2') {
            cameraModeIndex = 1;
            camera.switchMode(1);
        }
    });

    // Start render loop
    requestAnimationFrame(render);
}

function update(deltaTime) {
    // Don't update if game over
    if (gameOverScreen && gameOverScreen.isGameOverActive()) {
        return;
    }
    
    // Update ship
    ship.update(deltaTime);
    
    // Handle shooting
    if (ship.tryShoot()) {
        const shipPos = ship.getPosition();
        const projectile = new Projectile(gl, shipPos[0], shipPos[1], shipPos[2]);
        projectiles.push(projectile);
    }
    
    // Update projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.update(deltaTime);
        
        if (!proj.isActive()) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with asteroids (projectile stops)
        let hitAsteroid = false;
        for (const asteroid of asteroidManager.asteroids) {
            if (proj.checkCollisionWithAsteroid(asteroid.getPosition(), asteroid.getRadius())) {
                proj.deactivate();
                hitAsteroid = true;
                break;
            }
        }
        
        if (hitAsteroid) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with boss
        const bossHitResult = bossManager.checkProjectileHit(proj.getPosition(), proj.getRadius());
        if (bossHitResult.hit) {
            projectiles.splice(i, 1);
            
            if (hud) {
                if (bossHitResult.destroyed) {
                    // Big bonus for defeating boss
                    hud.addScore(bossHitResult.scoreBonus);
                    showBossDefeatedMessage();
                } else {
                    // Points for hitting boss
                    hud.addScore(50);
                }
            }
        }
    }
    
    // Update speed indicator
    updateSpeedIndicator();
    
    // Update asteroids and check collisions
    const collisionResult = asteroidManager.update(deltaTime);
    
    // Get current level
    const currentLevel = asteroidManager.getDifficultyLevel() + 1;
    
    // Update ship speed based on level
    ship.updateLevel(currentLevel);
    
    // Update boss
    const shipPosition = ship.getPosition();
    bossManager.update(deltaTime, currentLevel, shipPosition);
    
    // Update difficulty level in HUD
    if (hud) {
        hud.updateLevel(currentLevel);
        
        // Update boss health bar if boss is active
        updateBossHealthBar();
    }
    
    // Add score for dodged asteroids
    if (collisionResult.scoreGained > 0 && hud) {
        hud.addScore(collisionResult.scoreGained);
    }
    
    // Handle collision
    if (collisionResult.collision && hud) {
        hud.loseLife();
        if (hud.isGameOver()) {
            handleGameOver();
        }
    }
    
    // Update camera to follow ship
    const shipDirection = ship.getDirection();
    camera.setShipTransform(shipPosition, shipDirection);
    camera.updateViewMatrix();
}

function handleGameOver() {
    console.log('Game Over!');
    const finalScore = hud.getScore();
    const finalLevel = asteroidManager.getDifficultyLevel() + 1;
    const gameTime = asteroidManager.getGameTime();
    gameOverScreen.show(finalScore, finalLevel, gameTime);
}

function updateSpeedIndicator() {
    const speedBoostPercentage = ship.getSpeedPercentage();
    const speedMultiplier = ship.getSpeedMultiplier();
    const speedBarFill = document.getElementById('speed-bar-fill');
    const speedValue = document.getElementById('speed-value');
    
    if (speedBarFill && speedValue) {
        // Barra vai de 0% a 100% (representando 0% a 50% de boost)
        const barPercentage = Math.min(100, (speedBoostPercentage / 50) * 100);
        speedBarFill.style.width = barPercentage + '%';
        speedValue.textContent = '+' + speedBoostPercentage.toFixed(1) + '%';
    }
}

function updateBossHealthBar() {
    const bossHealthBar = document.getElementById('boss-health-bar');
    const bossHealthFill = document.getElementById('boss-health-fill');
    const bossHealthText = document.getElementById('boss-health-text');
    
    if (bossManager.isBossActive()) {
        const boss = bossManager.getBoss();
        const healthPercent = boss.getHealthPercentage();
        
        if (bossHealthBar) {
            bossHealthBar.style.display = 'flex';
            if (bossHealthFill) {
                bossHealthFill.style.width = healthPercent + '%';
            }
            if (bossHealthText) {
                bossHealthText.textContent = `${boss.health}/${boss.maxHealth}`;
            }
        }
    } else {
        if (bossHealthBar) {
            bossHealthBar.style.display = 'none';
        }
    }
}

function showBossDefeatedMessage() {
    console.log('🎉 BOSS DEFEATED! +500 points');
    // You can add a visual message here later
}

function draw() {
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use shader program
    gl.useProgram(programInfo.program);

    // Set projection matrix
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        camera.getProjectionMatrix()
    );

    // Draw the world grid
    world.draw(programInfo, camera.getViewMatrix(), camera.getProjectionMatrix());

    // Draw asteroids
    asteroidManager.draw(programInfo, camera.getViewMatrix(), camera.getProjectionMatrix());

    // Draw boss
    bossManager.draw(programInfo, camera.getViewMatrix(), camera.getProjectionMatrix());

    // Draw projectiles
    for (const proj of projectiles) {
        proj.draw(programInfo, camera.getViewMatrix(), camera.getProjectionMatrix());
    }

    // Draw the ship
    ship.draw(programInfo, camera.getViewMatrix(), camera.getProjectionMatrix());
}

function render(currentTime) {
    // Calculate delta time
    currentTime *= 0.001; // Convert to seconds
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update canvas size if needed
    if (resizeCanvasToDisplaySize(gl.canvas)) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        camera.updateProjectionMatrix(gl.canvas.width / gl.canvas.height);
    }

    // Game loop
    update(deltaTime);
    draw();

    // Request next frame
    requestAnimationFrame(render);
}

// HUD DURANTE O JOGO
import { HUD } from './ui/hud.js';
import { GameOverScreen } from './ui/gameOver.js';

let hud;
let gameOverScreen;

function resetGame() {
    // Reset HUD
    hud.reset();
    
    // Reset ship position and speed
    ship.gridX = 0;
    ship.gridZ = 0;
    ship.velocity = { x: 0, z: 0 };
    ship.resetSpeed();
    
    // Reset asteroid manager (clears asteroids and difficulty)
    asteroidManager.reset();
    
    // Reset boss manager
    bossManager.reset();
    
    // Clear projectiles
    projectiles = [];
    
    console.log('Game restarted!');
}

async function initGame() {
    await init();
    
    // Inicializa HUD após carregar tudo
    hud = new HUD();
    
    // Inicializa tela de Game Over
    gameOverScreen = new GameOverScreen();
    gameOverScreen.onRestart(() => {
        resetGame();
    });
}

// Start the application
initGame().catch(console.error);