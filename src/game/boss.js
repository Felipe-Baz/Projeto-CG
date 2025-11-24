import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';
import { Cone } from '../primitives/cone.js';
import { Cube } from '../primitives/cube.js';
import { Sphere } from '../primitives/sphere.js';

export class Boss {
    constructor(gl) {
        this.gl = gl;
        
        // Create geometry
        this.cone = new Cone(gl, 16);
        this.cube = new Cube(gl);
        this.sphere = new Sphere(gl, 16);
        
        // Boss properties
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.isActive = false;
        this.isDestroyed = false;
        
        // Position - well ahead of the player
        this.baseDistance = 25; // Distance ahead of player
        this.x = 0;
        this.y = 1.5; // Higher than player
        this.z = 0;
        
        // Size
        this.scale = 2.5; // Bem maior que a nave do player
        
        // Visual effects
        this.hitFlashTimer = 0;
        this.flashDuration = 0.3;
        
        // Oscillation for visual interest
        this.oscillationTimer = 0;
        this.oscillationSpeed = 1.5;
        this.oscillationAmount = 0.3;
    }
    
    activate(playerZ) {
        this.isActive = true;
        this.isDestroyed = false;
        this.health = this.maxHealth;
        this.z = playerZ + this.baseDistance;
        console.log('🚨 BOSS APPEARED! Health:', this.health);
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    takeDamage(damage = 1) {
        if (!this.isActive || this.isDestroyed) return false;
        
        this.health -= damage;
        this.hitFlashTimer = this.flashDuration;
        
        console.log(`💥 Boss hit! Health: ${this.health}/${this.maxHealth}`);
        
        if (this.health <= 0) {
            this.destroy();
            return true; // Boss destroyed
        }
        
        return false; // Boss still alive
    }
    
    destroy() {
        this.isDestroyed = true;
        console.log('💀 BOSS DESTROYED!');
    }
    
    update(deltaTime, playerPos) {
        if (!this.isActive) return;
        
        // Update flash timer
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
        }
        
        // Update oscillation
        this.oscillationTimer += deltaTime * this.oscillationSpeed;
        
        // Keep boss ahead of player
        this.x = playerPos[0];
        this.z = playerPos[2] + this.baseDistance;
        
        // Add slight vertical oscillation
        this.y = 1.5 + Math.sin(this.oscillationTimer) * this.oscillationAmount;
    }
    
    getPosition() {
        return [this.x, this.y, this.z];
    }
    
    getRadius() {
        return this.scale * 1.5; // Collision radius
    }
    
    isActiveBoss() {
        return this.isActive && !this.isDestroyed;
    }
    
    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        if (!this.isActive) return;
        
        const modelMatrix = mat4.create();
        const modelViewMatrix = mat4.create();
        
        // Translate to boss position
        mat4.translate(modelMatrix, modelMatrix, [this.x, this.y, this.z]);
        
        // Flash effect when hit
        const isFlashing = this.hitFlashTimer > 0 && Math.floor(this.hitFlashTimer * 20) % 2 === 0;
        
        // Rotate to face player (180 degrees)
        mat4.rotateY(modelMatrix, modelMatrix, Math.PI);
        
        // Draw main body (large sphere)
        const bodyModel = mat4.clone(modelMatrix);
        mat4.scale(bodyModel, bodyModel, [this.scale, this.scale * 0.8, this.scale]);
        
        mat4.multiply(modelViewMatrix, viewMatrix, bodyModel);
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        this.sphere.draw(programInfo);
        
        // Draw front cone (nose)
        const noseModel = mat4.clone(modelMatrix);
        mat4.translate(noseModel, noseModel, [0, 0, this.scale * 0.8]);
        mat4.rotateX(noseModel, noseModel, Math.PI / 2);
        mat4.scale(noseModel, noseModel, [this.scale * 0.6, this.scale * 0.8, this.scale * 0.6]);
        
        mat4.multiply(modelViewMatrix, viewMatrix, noseModel);
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        this.cone.draw(programInfo);
        
        // Draw wings
        for (let side of [-1, 1]) {
            const wingModel = mat4.clone(modelMatrix);
            mat4.translate(wingModel, wingModel, [side * this.scale * 1.2, 0, 0]);
            mat4.scale(wingModel, wingModel, [this.scale * 0.8, this.scale * 0.2, this.scale * 1.5]);
            
            mat4.multiply(modelViewMatrix, viewMatrix, wingModel);
            this.gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix
            );
            this.cube.draw(programInfo);
        }
        
        // Draw engines (back spheres)
        for (let side of [-0.7, 0.7]) {
            const engineModel = mat4.clone(modelMatrix);
            mat4.translate(engineModel, engineModel, [side * this.scale, 0, -this.scale * 0.7]);
            mat4.scale(engineModel, engineModel, [this.scale * 0.4, this.scale * 0.4, this.scale * 0.4]);
            
            mat4.multiply(modelViewMatrix, viewMatrix, engineModel);
            this.gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix
            );
            this.sphere.draw(programInfo);
        }
    }
}

export class BossManager {
    constructor(gl, asteroidManager) {
        this.gl = gl;
        this.asteroidManager = asteroidManager;
        this.boss = new Boss(gl);
        
        // Boss appearance settings
        this.bossLevel = 10; // Boss appears every 10 levels
        this.nextBossLevel = this.bossLevel;
        this.bossActive = false;
    }
    
    update(deltaTime, currentLevel, playerPos) {
        // Check if boss should appear
        if (currentLevel >= this.nextBossLevel && !this.bossActive && !this.boss.isActiveBoss()) {
            this.activateBoss(playerPos);
        }
        
        // Update boss
        if (this.boss.isActiveBoss()) {
            this.boss.update(deltaTime, playerPos);
        }
    }
    
    activateBoss(playerPos) {
        this.bossActive = true;
        this.boss.activate(playerPos[2]);
        
        // Slow down asteroid spawn during boss fight
        this.asteroidManager.spawnInterval *= 1.5;
    }
    
    checkProjectileHit(projectilePos, projectileRadius) {
        if (!this.boss.isActiveBoss()) return { hit: false };
        
        const bossPos = this.boss.getPosition();
        const bossRadius = this.boss.getRadius();
        
        const dx = projectilePos[0] - bossPos[0];
        const dy = projectilePos[1] - bossPos[1];
        const dz = projectilePos[2] - bossPos[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < (projectileRadius + bossRadius)) {
            const destroyed = this.boss.takeDamage(1);
            if (destroyed) {
                const result = this.onBossDefeated();
                return { hit: true, destroyed: true, scoreBonus: result.scoreBonus };
            }
            return { hit: true, destroyed: false };
        }
        
        return { hit: false };
    }
    
    onBossDefeated() {
        this.bossActive = false;
        this.nextBossLevel += this.bossLevel;
        
        // Restore normal asteroid spawn rate
        this.asteroidManager.spawnInterval = this.asteroidManager.baseSpawnInterval - 
            (this.asteroidManager.difficultyLevel * 0.08);
        this.asteroidManager.spawnInterval = Math.max(0.3, this.asteroidManager.spawnInterval);
        
        console.log('🎉 Boss defeated! Next boss at level:', this.nextBossLevel);
        
        return { defeated: true, scoreBonus: 500 }; // Big score bonus
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        if (this.boss.isActiveBoss()) {
            this.boss.draw(programInfo, viewMatrix, projectionMatrix);
        }
    }
    
    reset() {
        this.boss.deactivate();
        this.bossActive = false;
        this.nextBossLevel = this.bossLevel;
    }
    
    isBossActive() {
        return this.boss.isActiveBoss();
    }
    
    getBoss() {
        return this.boss;
    }
}
