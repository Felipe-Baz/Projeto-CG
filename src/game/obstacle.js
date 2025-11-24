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
    
    isPassed(shipZ) {
        // Check if asteroid passed the ship (scored)
        return this.z < shipZ - 2;
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
        
        // Spawn settings - initial values
        this.spawnTimer = 0;
        this.baseSpawnInterval = 0.8; // Base spawn interval (mais rápido)
        this.spawnInterval = this.baseSpawnInterval;
        this.spawnDistance = 15; // Distance ahead of ship
        this.baseSpawnRangeX = 10; // Initial horizontal spawn range
        this.spawnRangeX = this.baseSpawnRangeX;
        this.baseMinSpeed = 4;
        this.baseMaxSpeed = 7;
        this.minSpeed = this.baseMinSpeed;
        this.maxSpeed = this.baseMaxSpeed;
        
        // Difficulty progression
        this.gameTime = 0;
        this.difficultyLevel = 0;
        this.difficultyInterval = 10; // Increase difficulty every 10 seconds
        this.nextDifficultyTime = this.difficultyInterval;
        
        // Wave system - spawn clusters of asteroids
        this.waveTimer = 0;
        this.waveInterval = 5; // Wave every 5 seconds
        this.isWaveActive = false;
    }
    
    update(deltaTime) {
        // Update game time and difficulty
        this.gameTime += deltaTime;
        
        // Check if should increase difficulty
        if (this.gameTime >= this.nextDifficultyTime) {
            this.increaseDifficulty();
            this.nextDifficultyTime += this.difficultyInterval;
        }
        
        // Update wave timer
        this.waveTimer += deltaTime;
        if (this.waveTimer >= this.waveInterval) {
            this.spawnWave();
            this.waveTimer = 0;
        }
        
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new asteroid
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }
        
        const shipPos = this.ship.getPosition();
        let scoreGained = 0;
        
        // Update all asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.update(deltaTime);
            
            // Remove inactive asteroids
            if (!asteroid.isActive()) {
                this.asteroids.splice(i, 1);
                continue;
            }
            
            // Check if player dodged asteroid (score points)
            if (asteroid.isPassed(shipPos[2]) && !asteroid.scored) {
                asteroid.scored = true;
                scoreGained += 10;
            }
            
            // Check collision with ship
            if (asteroid.checkCollision(shipPos)) {
                console.log('Collision detected!');
                this.asteroids.splice(i, 1);
                // Return collision event
                return { collision: true, position: asteroid.getPosition(), scoreGained: 0 };
            }
        }
        
        return { collision: false, scoreGained: scoreGained };
    }
    
    increaseDifficulty() {
        this.difficultyLevel++;
        
        // Increase spawn rate (reduce interval, minimum 0.3 seconds)
        this.spawnInterval = Math.max(0.3, this.baseSpawnInterval - (this.difficultyLevel * 0.08));
        
        // Increase asteroid speed gradually
        this.minSpeed = this.baseMinSpeed + (this.difficultyLevel * 0.4);
        this.maxSpeed = this.baseMaxSpeed + (this.difficultyLevel * 0.6);
        
        // Increase spawn range moderately - aumenta 2 unidades por nível
        this.spawnRangeX = this.baseSpawnRangeX + (this.difficultyLevel * 2);
        
        // Slightly increase spawn distance as difficulty increases
        this.spawnDistance = 15 + (this.difficultyLevel * 0.3);
        
        console.log(`🔥 Difficulty Level ${this.difficultyLevel}:`, {
            spawnInterval: this.spawnInterval.toFixed(2) + 's',
            speed: `${this.minSpeed.toFixed(1)} - ${this.maxSpeed.toFixed(1)}`,
            spawnRange: `±${(this.spawnRangeX/2).toFixed(1)} units`,
            spawnDistance: this.spawnDistance.toFixed(1) + ' units ahead'
        });
    }
    
    spawnWave() {
        // Spawn 2-4 asteroids in a cluster pattern
        const waveSize = 2 + Math.floor(Math.random() * 3);
        const shipPos = this.ship.getPosition();
        
        for (let i = 0; i < waveSize; i++) {
            // Spawn in a horizontal line pattern with some variation
            const spacing = 2.5;
            const offset = (i - waveSize / 2) * spacing;
            const x = shipPos[0] + offset + (Math.random() - 0.5) * 1;
            const z = shipPos[2] + this.spawnDistance + (Math.random() - 0.5) * 2;
            
            const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
            const asteroid = new Asteroid(this.gl, x, z, speed);
            this.asteroids.push(asteroid);
        }
    }
    
    spawnAsteroid() {
        const shipPos = this.ship.getPosition();
        
        // 75% chance de spawnar perto da trajetória da nave (corredor central)
        // 25% chance de spawnar nas laterais (variação)
        let x;
        const spawnInCorridor = Math.random() < 0.75;
        
        if (spawnInCorridor) {
            // Spawn em um corredor mais estreito perto da nave
            const corridorWidth = 5; // Largura do corredor central
            x = shipPos[0] + (Math.random() - 0.5) * corridorWidth;
        } else {
            // Spawn nas laterais (mais longe)
            const sideOffset = 4 + Math.random() * (this.spawnRangeX - 4);
            x = shipPos[0] + (Math.random() < 0.5 ? -sideOffset : sideOffset);
        }
        
        const z = shipPos[2] + this.spawnDistance;
        
        // Random speed
        const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
        
        const asteroid = new Asteroid(this.gl, x, z, speed);
        this.asteroids.push(asteroid);
    }
    
    reset() {
        // Reset all properties to initial values
        this.asteroids = [];
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.gameTime = 0;
        this.difficultyLevel = 0;
        this.nextDifficultyTime = this.difficultyInterval;
        this.spawnInterval = this.baseSpawnInterval;
        this.spawnRangeX = this.baseSpawnRangeX;
        this.minSpeed = this.baseMinSpeed;
        this.maxSpeed = this.baseMaxSpeed;
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        for (const asteroid of this.asteroids) {
            asteroid.draw(programInfo, viewMatrix, projectionMatrix);
        }
    }
    
    getAsteroidCount() {
        return this.asteroids.length;
    }
    
    getDifficultyLevel() {
        return this.difficultyLevel;
    }
    
    getGameTime() {
        return this.gameTime;
    }
}
