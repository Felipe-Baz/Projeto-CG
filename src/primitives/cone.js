export class Cone {
    constructor(gl, segments = 16) {
        this.gl = gl;
        this.segments = segments;
        this.initBuffers();
    }

    initBuffers() {
        const positions = [];
        const colors = [];
        const indices = [];

        // Tip of the cone (apex)
        positions.push(0.0, 1.0, 0.0);
        colors.push(1.0, 0.0, 0.0, 1.0); // Red tip

        // Base vertices
        for (let i = 0; i <= this.segments; i++) {
            const angle = (i / this.segments) * Math.PI * 2;
            const x = Math.cos(angle);
            const z = Math.sin(angle);
            
            positions.push(x, 0.0, z);
            colors.push(0.8, 0.8, 0.8, 1.0); // Gray base
        }

        // Center of base
        const baseCenterIndex = this.segments + 2;
        positions.push(0.0, 0.0, 0.0);
        colors.push(0.6, 0.6, 0.6, 1.0);

        // Indices for sides (triangles from tip to base)
        for (let i = 0; i < this.segments; i++) {
            indices.push(0, i + 1, i + 2);
        }

        // Indices for base (triangles from center to edge)
        for (let i = 0; i < this.segments; i++) {
            indices.push(baseCenterIndex, i + 2, i + 1);
        }

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

    draw(programInfo) {
        // Position attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.position,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.position);

        // Color attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.color,
            4,
            this.gl.FLOAT,
            false,
            0,
            0);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.color);

        // Index buffer
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}
