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
        
        // Movement with level-based speed increase
        this.baseSpeed = 0.12; // Velocidade base
        this.currentSpeed = this.baseSpeed;
        this.speedMultiplier = 1.0; // Multiplicador de velocidade baseado no nível
        this.velocity = { x: 0, z: 0 };
        
        // Movement state
        this.isMoving = false;
        this.currentLevel = 1;
        
        // Progressive acceleration (unlocked at level 7)
        this.accelerationUnlocked = false;
        this.accelerationMultiplier = 1.0; // Multiplicador adicional por segurar teclas
        this.maxAccelerationMultiplier = 1.40; // Até 40% mais rápido
        this.accelerationRate = 0.3; // Taxa de aceleração por segundo
        this.decelerationRate = 2.0; // Taxa de desaceleração (muito rápida)
        
        // Input state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };
        
        // Shooting
        this.canShoot = true;
        this.shootCooldown = 0.3; // 0.3 seconds between shots
        this.shootTimer = 0;
        
        // Setup input listeners
        this.setupInput();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === ' ' || key === 'space') {
                this.keys.space = true;
            } else if (key in this.keys) {
                this.keys[key] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === ' ' || key === 'space') {
                this.keys.space = false;
            } else if (key in this.keys) {
                this.keys[key] = false;
            }
        });
    }
    
    update(deltaTime) {
        // Check if any movement key is pressed
        this.isMoving = this.keys.w || this.keys.s || this.keys.a || this.keys.d;
        
        // Update shoot cooldown
        if (this.shootTimer > 0) {
            this.shootTimer -= deltaTime;
            if (this.shootTimer <= 0) {
                this.canShoot = true;
            }
        }
        
        // Progressive acceleration system (only if level 7+)
        if (this.accelerationUnlocked) {
            if (this.isMoving) {
                // Acelera gradualmente enquanto mantém teclas pressionadas
                this.accelerationMultiplier = Math.min(
                    this.maxAccelerationMultiplier,
                    this.accelerationMultiplier + (this.accelerationRate * deltaTime)
                );
            } else {
                // Desacelera drasticamente quando solta as teclas
                this.accelerationMultiplier = Math.max(
                    1.0,
                    this.accelerationMultiplier - (this.decelerationRate * deltaTime)
                );
            }
        } else {
            // Se ainda não desbloqueou, mantém em 1.0
            this.accelerationMultiplier = 1.0;
        }
        
        // Calculate current speed (base * level boost * acceleration boost)
        this.currentSpeed = this.baseSpeed * this.speedMultiplier * this.accelerationMultiplier;
        
        // Update velocity based on input
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        if (this.keys.w) {
            this.velocity.z += this.currentSpeed;
        }
        if (this.keys.s) {
            this.velocity.z -= this.currentSpeed;
        }
        if (this.keys.a) {
            this.velocity.x += this.currentSpeed; // Invertido: A agora move para a direita (positivo)
        }
        if (this.keys.d) {
            this.velocity.x -= this.currentSpeed; // Invertido: D agora move para a esquerda (negativo)
        }
        
        // Update position
        this.gridX += this.velocity.x;
        this.gridZ += this.velocity.z;
        
        // Limit movement area (optional)
        const maxRange = 10;
        this.gridX = Math.max(-maxRange, Math.min(maxRange, this.gridX));
        this.gridZ = Math.max(-maxRange, Math.min(maxRange, this.gridZ));
    }
    
    updateLevel(level) {
        this.currentLevel = level;
        
        // Aumenta 2.5% a cada 5 níveis
        const levelTiers = Math.floor(level / 5);
        this.speedMultiplier = 1.0 + (levelTiers * 0.025);
        
        if (levelTiers > 0 && level % 5 === 0) {
            console.log(`⚡ Speed boost! Level ${level}: ${(this.speedMultiplier * 100).toFixed(1)}% speed`);
        }
        
        // Unlock progressive acceleration at level 7
        if (level >= 7 && !this.accelerationUnlocked) {
            this.accelerationUnlocked = true;
            console.log('🚀 ACCELERATION UNLOCKED! Hold movement keys to build up speed!');
        }
    }
    
    tryShoot() {
        if (this.canShoot && this.keys.space) {
            this.canShoot = false;
            this.shootTimer = this.shootCooldown;
            return true;
        }
        return false;
    }
    
    getCurrentSpeed() {
        return this.currentSpeed;
    }
    
    getSpeedPercentage() {
        // Retorna a porcentagem do multiplicador de nível (100% = velocidade base)
        return (this.speedMultiplier - 1.0) * 100;
    }
    
    getAccelerationPercentage() {
        // Retorna a porcentagem do boost de aceleração (0% a 50%)
        return (this.accelerationMultiplier - 1.0) * 100;
    }
    
    getTotalSpeedMultiplier() {
        return this.speedMultiplier * this.accelerationMultiplier;
    }
    
    getSpeedMultiplier() {
        return this.speedMultiplier;
    }
    
    isAccelerationActive() {
        return this.accelerationUnlocked && this.accelerationMultiplier > 1.0;
    }
    
    resetSpeed() {
        this.speedMultiplier = 1.0;
        this.currentLevel = 1;
        this.currentSpeed = this.baseSpeed;
        this.accelerationMultiplier = 1.0;
        this.accelerationUnlocked = false;
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
