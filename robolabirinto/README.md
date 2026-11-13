# Robô no labirinto

Jogo de lógica de programação: o aluno monta um fluxograma com os blocos **Início, Andar, Virar ←, Virar →, Decisão e Fim** e leva o robô 3D até a bandeira.

- 6 fases: sequência, curva, repetição, padrão, decisão com sensores e labirinto.
- Sensores da Decisão: livre à frente, à esquerda, à direita, parede à frente, chegou à bandeira.
- Resultados: chegou, bateu na parede, laço infinito, faltou uma seta, fim antes da bandeira.
- O progresso fica salvo no navegador (localStorage).

Basta abrir `index.html` no navegador (precisa de internet para carregar o three.js do cdnjs).
Para publicar com GitHub Pages: Settings → Pages → Branch `main`, pasta `/`.
