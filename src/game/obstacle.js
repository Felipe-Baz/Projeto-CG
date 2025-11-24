import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';
import { Sphere } from '../primitives/sphere.js';

export class Asteroid {
    constructor(gl, x, z, speed) {
        this.gl = gl;
        this.sphere = new Sphere(gl, 12);
        
        // Position
        this.x = x;
        this.y = 0.5; // Height above ground
        this.z = z;
        
        // Movement
        this.speed = speed;
        this.velocityZ = -speed; // Moving towards the camera (negative Z)
        
        // Random properties for variety
        this.scale = 0.3 + Math.random() * 0.4; // Random size between 0.3 and 0.7
        this.rotationX = Math.random() * Math.PI * 2;
        this.rotationY = Math.random() * Math.PI * 2;
        this.rotationZ = Math.random() * Math.PI * 2;
        this.rotationSpeedX = (Math.random() - 0.5) * 2;
        this.rotationSpeedY = (Math.random() - 0.5) * 2;
        this.rotationSpeedZ = (Math.random() - 0.5) * 2;
        
        this.active = true;
    }
    
    update(deltaTime) {
        // Move towards camera
        this.z += this.velocityZ * deltaTime;
        
        // Rotate for visual effect
        this.rotationX += this.rotationSpeedX * deltaTime;
        this.rotationY += this.rotationSpeedY * deltaTime;
        this.rotationZ += this.rotationSpeedZ * deltaTime;
        
        // Deactivate if passed the camera
        if (this.z < -15) {
            this.active = false;
        }
    }
    
    getPosition() {
        return [this.x, this.y, this.z];
    }
    
    getRadius() {
        return this.scale;
    }
    
    isActive() {
        return this.active;
    }
    
    checkCollision(shipPosition, shipRadius = 0.5) {
        const dx = this.x - shipPosition[0];
        const dy = this.y - shipPosition[1];
        const dz = this.z - shipPosition[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance < (this.scale + shipRadius);
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        const modelMatrix = mat4.create();
        const modelViewMatrix = mat4.create();
        
        // Position
        mat4.translate(modelMatrix, modelMatrix, [this.x, this.y, this.z]);
        
        // Rotation
        mat4.rotateX(modelMatrix, modelMatrix, this.rotationX);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotationY);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotationZ);
        
        // Scale
        mat4.scale(modelMatrix, modelMatrix, [this.scale, this.scale, this.scale]);
        
        // Apply view matrix
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        
        // Set uniforms
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        
        // Draw sphere
        this.sphere.draw(programInfo);
    }
}

export class AsteroidManager {
    constructor(gl, shipReference) {
        this.gl = gl;
        this.ship = shipReference;
        this.asteroids = [];
        
        // Spawn settings
        this.spawnTimer = 0;
        this.spawnInterval = 1.5; // Spawn every 1.5 seconds
        this.spawnDistance = 15; // Distance ahead of ship
        this.spawnRangeX = 8; // How far left/right asteroids can spawn
        this.minSpeed = 3;
        this.maxSpeed = 6;
    }
    
    update(deltaTime) {
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new asteroid
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }
        
        // Update all asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.update(deltaTime);
            
            // Remove inactive asteroids
            if (!asteroid.isActive()) {
                this.asteroids.splice(i, 1);
                continue;
            }
            
            // Check collision with ship
            const shipPos = this.ship.getPosition();
            if (asteroid.checkCollision(shipPos)) {
                console.log('Collision detected!');
                this.asteroids.splice(i, 1);
                // Return collision event
                return { collision: true, position: asteroid.getPosition() };
            }
        }
        
        return { collision: false };
    }
    
    spawnAsteroid() {
        const shipPos = this.ship.getPosition();
        
        // Random position ahead of ship, with horizontal offset
        const x = shipPos[0] + (Math.random() - 0.5) * this.spawnRangeX;
        const z = shipPos[2] + this.spawnDistance;
        
        // Random speed
        const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
        
        const asteroid = new Asteroid(this.gl, x, z, speed);
        this.asteroids.push(asteroid);
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        for (const asteroid of this.asteroids) {
            asteroid.draw(programInfo, viewMatrix, projectionMatrix);
        }
    }
    
    getAsteroidCount() {
        return this.asteroids.length;
    }
}
