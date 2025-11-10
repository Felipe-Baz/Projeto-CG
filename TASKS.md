# 🚀 Space Runner 3D (WebGL Puro)

## 🧩 Descrição

Space Runner 3D é um jogo desenvolvido em **WebGL puro (sem Three.js)**.  
O jogador controla uma nave dentro de um túnel espacial, desviando de meteoros e obstáculos,  
com o objetivo de percorrer a maior distância possível.

---

## 👥 Equipe e Papéis

| Dev | Responsável | Principais Áreas |
|-----|--------------|------------------|
| **Dev 1** | Motor WebGL | Inicialização, buffers, shaders, câmeras e iluminação |
| **Dev 2** | Gameplay | Movimento da nave, obstáculos, colisão e pontuação |
| **Dev 3** | Modelagem & Primitivas | Geração de formas 3D simples (nave, meteoros, túnel) |
| **Dev 4** | Interface & Polimento | HUD, menus, câmeras, sons e integração final |

---

## 🗂️ Estrutura inicial do projeto

```

/src
    webgl/
        initGL.js
        shaderUtils.js
        camera.js
        light.js
    primitives/
        cube.js
        cone.js
        cylinder.js
        sphere.js
    game/
        player.js
        obstacle.js
        boss.js
        world.js
        gameLoop.js
    ui/
        hud.js
        menu.js
    shaders/
        vertex.glsl
        fragment.glsl
    main.js
    index.html

```

---

## ✅ Lista de Tarefas (Organizada por ordem lógica e assignee)

### 🧱 Fase 1 — Configuração e Fundamentos (Semana 1)

**🎯 Objetivo:** montar o ambiente 3D e o loop principal.

#### Dev 1 — Motor WebGL
- [ ] Criar `initGL.js` para inicializar o contexto WebGL.  
- [ ] Criar `shaderUtils.js` para carregar e compilar shaders.  
- [ ] Implementar `camera.js` com matriz perspectiva e view.  
- [ ] Criar shaders básicos (`vertex.glsl`, `fragment.glsl`) com cores sólidas.  

#### Dev 3 — Primitivas
- [ ] Implementar `cube.js` (vértices, normais e índices).  
- [ ] Implementar `cone.js` (para corpo da nave).  
- [ ] Implementar `cylinder.js` (para túnel).  
- [ ] Implementar `sphere.js` (para meteoros e base do boss).  

#### Dev 2 — Estrutura de jogo
- [ ] Criar `gameLoop.js` com `update()` e `draw()`.  
- [ ] Criar `world.js` para armazenar entidades (player, obstáculos, boss).  

#### Dev 4 — Interface inicial
- [ ] Criar `index.html` com `<canvas>` + overlay de HUD.  
- [ ] Adicionar pontuação base (`hud.js` simples).

🧩 **Integração mínima:**  
Dev 1 e Dev 3 cuidam de renderização isoladamente; Dev 2 integra no final da semana.

---

### ☄️ Fase 2 — Movimento, Obstáculos e Colisão (Semana 2)

**🎯 Objetivo:** jogo básico funcional com obstáculos.

#### Dev 2 — Gameplay
- [ ] Criar `player.js` com controle WASD e física simples.  
- [ ] Criar `obstacle.js` com geração aleatória e velocidade.  
- [ ] Implementar colisão por distância (bounding sphere).  
- [ ] Adicionar pontuação baseada na distância percorrida.  

#### Dev 1 — Luzes e câmera
- [ ] Implementar luz ambiente e luz direcional.  
- [ ] Ajustar shaders para iluminação difusa.  
- [ ] Criar câmera em 3ª pessoa.  

#### Dev 3 — Modelagem
- [ ] Criar nave (cone + cubos achatados como asas).  
- [ ] Criar meteoro (esfera deformada aleatoriamente).  
- [ ] Criar túnel (cilindro invertido).  

#### Dev 4 — HUD
- [ ] Atualizar `hud.js` com pontuação em tempo real.  
- [ ] Criar `menu.js` com botão “Iniciar Jogo”.  

🧩 **Integração mínima:**  
Dev 2 integra obstáculos e player com as primitivas geradas por Dev 3.

---

### 💫 Fase 3 — Boss e câmeras (Semana 3)

**🎯 Objetivo:** adicionar o boss e variedade visual.

#### Dev 2 — Boss e lógica
- [ ] Criar `boss.js` (classe do chefão).  
- [ ] Implementar comportamento do boss:
  - [ ] Movimento lateral (padrões aleatórios).  
  - [ ] Disparo de lasers (intervalos de tempo).  
  - [ ] Detecção de dano (se atingido pelo jogador).  
- [ ] Adicionar condição de vitória (boss derrotado).  

#### Dev 1 — Câmeras
- [ ] Implementar três modos:
  - [ ] 3ª pessoa (atrás da nave)  
  - [ ] cockpit (dentro da nave)  
  - [ ] lateral (seguindo o lado)
- [ ] Alternância de câmera com tecla `C`.  

#### Dev 3 — Modelagem do Boss
- [ ] Criar modelo do boss combinando:
  - [ ] Corpo principal = esfera grande.  
  - [ ] “Canhões” = cilindros laterais.  
  - [ ] Olhos = pequenas esferas.  
- [ ] Criar pequenas variações de cor e tamanho para os ataques.  

#### Dev 4 — Interface e efeitos
- [ ] Mostrar barra de vida do boss no topo da tela.  
- [ ] Adicionar som de alerta quando o boss aparece.  
- [ ] Mostrar mensagem “Boss approaching…” antes da luta.  

🧩 **Integração mínima:**  
Dev 2 controla spawn e comportamento; Dev 4 apenas lê estado do boss.

---

### 🌌 Fase 4 — Polimento, Dificuldade e Ranking (Semana 4)

**🎯 Objetivo:** finalizar o jogo e deixá-lo fluido.

#### Dev 1 — Performance e shader
- [ ] Otimizar buffers (uso de VAOs).  
- [ ] Ajustar FPS e reduzir draw calls.  
- [ ] Adicionar brilho leve (specular highlight).  

#### Dev 2 — Dificuldade e progressão
- [ ] Aumentar velocidade gradualmente.  
- [ ] Alternar entre fases: obstáculos → boss → obstáculos.  
- [ ] Reinício após vitória ou derrota.  

#### Dev 3 — Refinamento de modelos
- [ ] Ajustar escala e proporção da nave e boss.  
- [ ] Garantir centralização dos vértices para colisão precisa.  
- [ ] Melhorar partículas de explosão (usando `gl.POINTS`).  

#### Dev 4 — Polimento e UI final
- [ ] Adicionar tela de Game Over / Victory.  
- [ ] Salvar pontuação máxima em `localStorage`.  
- [ ] Criar menu de reinício e créditos.  

---

## 🧠 Dicas de Workflow

- Cada dev mantém branch própria (`dev1-engine`, `dev2-gameplay`, etc.).  
- Integrações apenas aos sábados, com revisão conjunta.  
- Testar FPS e colisão toda semana em `main.js`.  
- Dev 2 e Dev 4 devem coordenar eventos do boss (som, HUD e spawn).

---

## 🏁 Entrega esperada

Ao final de 4 semanas:
- Nave controlável com 3 modos de câmera.  
- Obstáculos e colisão funcionando.  
- Boss funcional com ataques e barra de vida.  
- Sistema de pontuação e ranking.  
- Menu, HUD e telas finais completas.  
- FPS estável e experiência 3D coerente.

---

## 📜 Créditos

- **Dev 1:** Motor WebGL, shaders, câmeras e otimização  
- **Dev 2:** Gameplay, colisão, boss e lógica geral  
- **Dev 3:** Modelagem procedural e efeitos 3D  
- **Dev 4:** Interface, menus, sons e integração final
