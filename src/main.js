import { initWebGL, resizeCanvasToDisplaySize } from './webgl/initGL.js';
import { createShader, createProgram, loadShader } from './webgl/shaderUtils.js';
import { Camera } from './webgl/camera.js';
import { Ship } from './game/player.js';
import { World } from './game/world.js';
import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';

let gl;
let programInfo;
let ship;
let world;
let camera;
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
    // Update ship
    ship.update(deltaTime);
    
    // Update camera to follow ship
    const shipPosition = ship.getPosition();
    const shipDirection = ship.getDirection();
    camera.setShipTransform(shipPosition, shipDirection);
    camera.updateViewMatrix();
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

let hud;

async function initGame() {
    await init();
    
    // Inicializa HUD após carregar tudo
    hud = new HUD();
    
    // Exemplo de uso:
    hud.updateScore(100);

    hud.loseLife();

    hud.loseLife();

    hud.gainLife();

    if (hud.isGameOver()) {
        console.log('Game Over!');
    }
}

// Start the application
initGame().catch(console.error);