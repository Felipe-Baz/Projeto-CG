import { initWebGL, resizeCanvasToDisplaySize } from './webgl/initGL.js';
import { createShader, createProgram, loadShader } from './webgl/shaderUtils.js';
import { Camera } from './webgl/camera.js';
import { Cube } from './primitives/cube.js';
import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';

let gl;
let programInfo;
let cube;
let camera;
let rotation = 0.0;

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
    cube = new Cube(gl);
    camera = new Camera();

    // Start render loop
    requestAnimationFrame(render);
}

function render() {
    // Update canvas size if needed
    if (resizeCanvasToDisplaySize(gl.canvas)) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        camera.updateProjectionMatrix(gl.canvas.width / gl.canvas.height);
    }

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update camera
    camera.updateViewMatrix();

    // Create and update model matrix
    const modelMatrix = mat4.create();
    rotation += 0.01;
    mat4.rotate(modelMatrix, modelMatrix, rotation, [0.5, 1, 0]);
    mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]); // Make the cube smaller

    // Combine matrices
    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, camera.getViewMatrix(), modelMatrix);

    // Use shader program
    gl.useProgram(programInfo.program);

    // Set uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        camera.getProjectionMatrix()
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    // Draw the cube
    cube.draw(programInfo);

    // Request next frame
    requestAnimationFrame(render);
}

// Start the application
init().catch(console.error);