# Autiversi

Protótipo de plataforma mobile-first para apoio sensorial, emocional e social, pensado para melhorar a experiência de pessoas em contextos de sobrecarga sensorial, rotina intensa e necessidade de acolhimento.

## Visão geral

Este projeto foi desenvolvido como uma interface web estática em HTML, CSS e JavaScript. A proposta é oferecer uma experiência simples, acessível e acolhedora, com navegação focada em:

- rotina diária
- suporte emocional
- mapa sensorial
- organização de tarefas
- filtros de acessibilidade
- visualização de locais e cenários de apoio

## Funcionalidades principais

- interface responsiva para mobile
- tema claro e escuro
- ajustes de acessibilidade
- modo para crianças e usuários com suporte adicional
- rotina e checklist personalizados
- páginas de apoio e orientação
- navegação em uma SPA simples

## Estrutura do projeto

```text
.
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── data.js
├── .gitignore
├── .nojekyll
├── index.html
├── package.json
├── README.md
├── _server.js
└── package-lock.json
```

## Como executar localmente

No diretório do projeto, execute:

```bash
python -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

Também é possível usar o script do projeto:

```bash
npm start
```

## Publicação no GitHub Pages

1. Faça o push do projeto para o GitHub.
2. Acesse o repositório no GitHub.
3. Vá em Settings > Pages.
4. Em Source, selecione "Deploy from a branch".
5. Escolha a branch principal e a pasta raiz `/`.
6. Salve.

A aplicação ficará disponível em algo como:

```text
https://seu-usuario.github.io/seu-repositorio/
```

> O arquivo [.nojekyll](.nojekyll) foi incluído para garantir que o GitHub Pages não trate o projeto como um site Jekyll.

## Tecnologias

- HTML5
- CSS3
- JavaScript vanilla
- Git/GitHub

## Observações

- O projeto é estático e não exige build ou framework.
- O código foi pensado para ser fácil de entender, personalizar e publicar.

## Próximos passos

- integrar mapa interativo com dados reais
- conectar com backend ou banco de dados
- adicionar autenticação e perfil do usuário
- ampliar acessibilidade e testes com usuários
- otimizar a experiência para diferentes públicos

## Licença

Este projeto está em desenvolvimento e pode ser adaptado conforme a necessidade do uso acadêmico, pessoal ou profissional.
