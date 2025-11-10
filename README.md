# Projeto-CG - WebGL 3D Game

Um jogo 3D desenvolvido com WebGL, apresentando gráficos interativos e uma experiência de jogo imersiva.

## 📋 Pré-requisitos

Para rodar este projeto, você precisará de:

- Um navegador web moderno com suporte a WebGL (Chrome, Firefox, Edge, etc.)
- Um servidor web local para desenvolvimento
- Git instalado (para clonar o repositório)

## 🚀 Como Executar o Projeto

### Clonando o Repositório

```bash
git clone https://github.com/Felipe-Baz/Projeto-CG.git
cd Projeto-CG
```

### Iniciando o Servidor Local

Você pode escolher um dos seguintes métodos para iniciar um servidor local:

#### Usando Node.js (com http-server):
```bash
# Instalar http-server globalmente (uma única vez)
npm install -g http-server

# Iniciar o servidor
http-server
```

### Acessando o Jogo

Após iniciar o servidor local, abra seu navegador e acesse:

- Se usando http-server: `http://localhost:8080/src`

## 📁 Estrutura do Projeto

```
src/
├── index.html          # Arquivo HTML principal
├── main.js            # Ponto de entrada e loop do jogo
├── game/              # Lógica do jogo
│   ├── boss.js        # Implementação do chefe
│   ├── gameLoop.js    # Loop principal do jogo
│   ├── obstacle.js    # Sistema de obstáculos
│   ├── player.js      # Controle do jogador
│   └── world.js       # Gerenciamento do mundo do jogo
├── primitives/        # Objetos 3D primitivos
│   ├── cone.js
│   ├── cube.js
│   ├── cylinder.js
│   └── sphere.js
├── shaders/           # Shaders GLSL
│   ├── fragment.glsl
│   └── vertex.glsl
├── ui/                # Componentes da interface
│   ├── hud.js
│   └── menu.js
└── webgl/            # Utilitários WebGL
    ├── camera.js
    ├── initGL.js
    ├── light.js
    └── shaderUtils.js
```

## 🎮 Como Jogar

Ao abrir o jogo, você verá um cubo 3D rotacionando no centro da tela. Esta é a cena inicial que confirma que o ambiente WebGL está funcionando corretamente.

## 🛠️ Desenvolvimento

### Ambiente de Desenvolvimento

1. Clone o repositório
2. Inicie um servidor local
3. Faça suas modificações
4. Teste no navegador
5. Commit e push das alterações

### Adicionando Novos Recursos

- Novos modelos 3D podem ser adicionados em `primitives/`
- Componentes do jogo devem ser adicionados em `game/`
- Shaders personalizados podem ser criados em `shaders/`
- Elementos de UI devem ser adicionados em `ui/`

## ⚠️ Resolução de Problemas

Se você encontrar problemas:

1. **Tela em Branco**
   - Verifique o console do navegador para erros
   - Confirme se o WebGL está habilitado em seu navegador
   - Verifique se está usando um servidor local (não abra o arquivo diretamente)

2. **Erros de Shader**
   - Verifique se todos os arquivos de shader estão sendo carregados corretamente
   - Confirme se o caminho para os arquivos de shader está correto

3. **Problemas de Performance**
   - Verifique a compatibilidade do seu navegador com WebGL
   - Atualize seus drivers de vídeo
   - Feche outras aplicações pesadas

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ✍️ Autores

* **Felipe Baz** - *Trabalho Inicial* - [Felipe-Baz](https://github.com/Felipe-Baz)

## 📝 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎁 Agradecimentos

* Professor e monitores pelo suporte
* Colegas de classe pelas sugestões e feedback
* Comunidade WebGL pelos recursos e documentação