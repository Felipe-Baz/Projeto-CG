
import { mat4, vec3 } from 'https://cdn.skypack.dev/gl-matrix';


export class Camera {
    constructor() {
        // Camera modes: 'third', 'first'
        this.modes = ['third', 'first'];
        this.mode = 'third';

        // Nave (objeto de referência)
        this.shipPosition = [0, 0, 0];
        this.shipDirection = [0, 0, 1]; // Z+ para frente

        // Camera state
        this.position = [0, 2, -6]; // Terceira pessoa padrão
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.fov = 45 * Math.PI / 180;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 100.0;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
    }


    setShipTransform(position, direction) {
        // Atualiza a posição e direção da nave (para câmeras dinâmicas)
        this.shipPosition = position;
        this.shipDirection = direction;
    }

    switchMode(modeIndex) {
        if (modeIndex >= 0 && modeIndex < this.modes.length) {
            this.mode = this.modes[modeIndex];
        }
    }

    updateViewMatrix() {
        // Atualiza posição, target e FOV conforme o modo
        const shipPos = this.shipPosition;
        const shipDir = this.shipDirection;
        const up = [0, 1, 0];
        let pos, target, fov;

        if (this.mode === 'third') {
            // Atrás e acima da nave
            pos = [
                shipPos[0] - shipDir[0] * 6 + up[0] * 2,
                shipPos[1] + 2,
                shipPos[2] - shipDir[2] * 6 + up[2] * 2
            ];
            target = [
                shipPos[0] + shipDir[0] * 2,
                shipPos[1],
                shipPos[2] + shipDir[2] * 2
            ];
            fov = 45 * Math.PI / 180;
        } else if (this.mode === 'first') {
            // Dentro da nave
            pos = [
                shipPos[0] + shipDir[0] * 0.5,
                shipPos[1] + 0.5,
                shipPos[2] + shipDir[2] * 0.5
            ];
            target = [
                shipPos[0] + shipDir[0] * 2,
                shipPos[1] + 0.5,
                shipPos[2] + shipDir[2] * 2
            ];
            fov = 60 * Math.PI / 180;
        } else if (this.mode === 'side') {
            // Lateral melhorada - vista de lado com perspectiva diagonal
            // Posiciona câmera à direita e ligeiramente atrás da nave
            pos = [
                shipPos[0] + 8,  // Mais à direita
                shipPos[1] + 3,  // Mais alto para melhor visão
                shipPos[2] - 2   // Ligeiramente atrás
            ];
            // Mira ligeiramente à frente da nave para ver a direção do movimento
            target = [
                shipPos[0],
                shipPos[1] + 0.3,  // Foca um pouco acima do centro da nave
                shipPos[2] + 1     // Mira ligeiramente à frente
            ];
            fov = 55 * Math.PI / 180;  // FOV um pouco maior para melhor contexto
        } else {
            // fallback
            pos = this.position;
            target = this.target;
            fov = this.fov;
        }

        this.position = pos;
        this.target = target;
        this.fov = fov;
        mat4.lookAt(this.viewMatrix, this.position, this.target, up);
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

    getMode() {
        return this.mode;
    }
}
