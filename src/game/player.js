import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';
import { Cone } from '../primitives/cone.js';
import { Cube } from '../primitives/cube.js';

export class Ship {
    constructor(gl) {
        this.gl = gl;
        
        // Create geometry
        this.cone = new Cone(gl, 16);
        this.cube = new Cube(gl);
        
        // Ship position on grid
        this.gridX = 0;
        this.gridZ = 0;
        this.gridSize = 1.0; // Size of each grid cell
        
        // Movement
        this.speed = 0.1; // Grid cells per update
        this.velocity = { x: 0, z: 0 };
        
        // Input state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Setup input listeners
        this.setupInput();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = false;
            }
        });
    }
    
    update(deltaTime) {
        // Update velocity based on input
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        if (this.keys.w) {
            this.velocity.z += this.speed;
        }
        if (this.keys.s) {
            this.velocity.z -= this.speed;
        }
        if (this.keys.a) {
            this.velocity.x += this.speed; // Invertido: A agora move para a direita (positivo)
        }
        if (this.keys.d) {
            this.velocity.x -= this.speed; // Invertido: D agora move para a esquerda (negativo)
        }
        
        // Update position
        this.gridX += this.velocity.x;
        this.gridZ += this.velocity.z;
        
        // Limit movement area (optional)
        const maxRange = 10;
        this.gridX = Math.max(-maxRange, Math.min(maxRange, this.gridX));
        this.gridZ = Math.max(-maxRange, Math.min(maxRange, this.gridZ));
    }
    
    getPosition() {
        return [
            this.gridX * this.gridSize,
            0.3, // Elevate ship above grid
            this.gridZ * this.gridSize
        ];
    }
    
    getDirection() {
        // Ship always faces forward (Z+)
        return [0, 0, 1];
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        const modelMatrix = mat4.create();
        const modelViewMatrix = mat4.create();
        
        // Translate to ship position
        const position = this.getPosition();
        mat4.translate(modelMatrix, modelMatrix, position);
        
        // Debug: log once
        if (!this._loggedOnce) {
            console.log('Drawing ship at:', position);
            this._loggedOnce = true;
        }
        
        // Draw cone (body of the ship)
        const coneModel = mat4.clone(modelMatrix);
        // Rotate cone to point forward (Z+) - cone tip points up by default, rotate to point forward
        mat4.rotateX(coneModel, coneModel, -Math.PI / 2);
        mat4.scale(coneModel, coneModel, [0.3, 0.5, 0.3]);
        
        mat4.multiply(modelViewMatrix, viewMatrix, coneModel);
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        this.cone.draw(programInfo);
        
        // Draw left wing
        const leftWingModel = mat4.clone(modelMatrix);
        mat4.translate(leftWingModel, leftWingModel, [-0.4, 0, -0.1]);
        mat4.scale(leftWingModel, leftWingModel, [0.3, 0.05, 0.4]);
        
        mat4.multiply(modelViewMatrix, viewMatrix, leftWingModel);
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        this.cube.draw(programInfo);
        
        // Draw right wing
        const rightWingModel = mat4.clone(modelMatrix);
        mat4.translate(rightWingModel, rightWingModel, [0.4, 0, -0.1]);
        mat4.scale(rightWingModel, rightWingModel, [0.3, 0.05, 0.4]);
        
        mat4.multiply(modelViewMatrix, viewMatrix, rightWingModel);
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        this.cube.draw(programInfo);
    }
}
