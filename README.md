# Autiversi — protótipo

Protótipo inicial do Autiversi: plataforma mobile-first de apoio sensorial e social.

Este projeto é um site estático em HTML, CSS e JavaScript, então ele pode ser publicado diretamente no GitHub Pages sem build ou framework.

## Como rodar localmente

Abra a pasta do projeto e rode um servidor local simples, por exemplo:

```bash
python -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos do projeto para o repositório.
3. No GitHub, vá em Settings > Pages.
4. Em Source, escolha "Deploy from a branch".
5. Selecione a branch principal e a pasta raiz `/`.
6. Salve.

O site ficará disponível em algo como:

```text
https://seu-usuario.github.io/seu-repositorio/
```

## Observações

- O arquivo `.nojekyll` foi adicionado para evitar que o GitHub Pages trate o projeto como site Jekyll.
- Como o projeto é estático, não há necessidade de instalar dependências do Node para a publicação final.

## Próximos passos

- Implementar mapa interativo
- Backend para salvar perfis e avaliações
- Ajustes de acessibilidade e testes com usuários
