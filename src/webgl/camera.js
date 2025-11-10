import { mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export class Camera {
    constructor() {
        this.position = [0, 0, -5];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.fov = 45 * Math.PI / 180;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 100.0;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    updateProjectionMatrix(aspect) {
        this.aspect = aspect;
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }
}
