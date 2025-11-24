import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export class Projectile {
    constructor(gl, x, y, z) {
        this.gl = gl;
        this.initSphere();
        
        // Position
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Movement
        this.speed = 20; // Velocidade rápida para frente
        this.velocityZ = this.speed;
        
        this.active = true;
        this.scale = 0.15; // Projétil pequeno
    }
    
    initSphere() {
        const segments = 8;
        const positions = [];
        const colors = [];
        const indices = [];

        // Generate sphere vertices with cyan/blue color
        for (let lat = 0; lat <= segments; lat++) {
            const theta = (lat * Math.PI) / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= segments; lon++) {
                const phi = (lon * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                positions.push(x, y, z);
                
                // Bright cyan/blue color for projectiles
                colors.push(0.0, 1.0, 1.0, 1.0); // Cyan
            }
        }

        // Generate indices
        for (let lat = 0; lat < segments; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const first = lat * (segments + 1) + lon;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        // Create buffers
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.indexCount = indices.length;
    }
    
    update(deltaTime) {
        // Move towards horizon (positive Z)
        this.z += this.velocityZ * deltaTime;
        
        // Deactivate if too far
        if (this.z > 50) {
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
    
    deactivate() {
        this.active = false;
    }
    
    checkCollisionWithAsteroid(asteroidPos, asteroidRadius) {
        const dx = this.x - asteroidPos[0];
        const dy = this.y - asteroidPos[1];
        const dz = this.z - asteroidPos[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance < (this.scale + asteroidRadius);
    }
    
    checkCollisionWithBoss(bossPos, bossRadius) {
        const dx = this.x - bossPos[0];
        const dy = this.y - bossPos[1];
        const dz = this.z - bossPos[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance < (this.scale + bossRadius);
    }
    
    draw(programInfo, viewMatrix, projectionMatrix) {
        const modelMatrix = mat4.create();
        const modelViewMatrix = mat4.create();
        
        // Position
        mat4.translate(modelMatrix, modelMatrix, [this.x, this.y, this.z]);
        
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
        // Position attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.position,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(programInfo.attribLocations.position);

        // Color attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.color,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(programInfo.attribLocations.color);

        // Draw
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}
