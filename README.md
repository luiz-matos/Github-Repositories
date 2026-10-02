# 🐙 GitHub Repositories

<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8">
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router 7">
  <img src="https://img.shields.io/badge/styled--components-6-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white" alt="styled-components 6">
  <img src="https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github" alt="GitHub API">
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow?style=for-the-badge" alt="Licença MIT">
</div>

<br>

> 🎯 **App em React que guarda uma lista de repositórios do GitHub e mostra os detalhes e as issues de cada um**, consumindo a API pública do GitHub.

Fiz em 2020 como projeto de estudo de React. Em 2026 voltei a ele, troquei o Create React App, descontinuado, pelo Vite, atualizei as dependências, corrigi os bugs e completei o app com mensagens de erro, remoção de repositórios, filtro e paginação das issues.

## 📋 Índice

- [🎓 O que aprendi](#-o-que-aprendi)
- [🚀 Como rodar](#-como-rodar)
- [🧠 Decisões técnicas](#-decisões-técnicas)
- [🔄 Revisitando o projeto em 2026](#-revisitando-o-projeto-em-2026)
- [📄 Licença](#-licença)

## 🎓 O que aprendi

- **Ferramenta parada deixa de rodar.** O `react-scripts` 3.4 usa o webpack 4, que calcula hashes com MD4, e o OpenSSL 3 do Node 17 em diante não aceita: o build parava com `ERR_OSSL_EVP_UNSUPPORTED`.
- **O endpoint nem sempre entrega o que o nome promete.** O `/repos/{repo}/issues` devolve issues e pull requests juntos; nos repositórios que conferi, os pull requests eram de 57% a 87% dos itens. A lista passou a usar o `/search/issues` com `is:issue`.
- **Requisição sem tratamento de erro trava a tela.** Adicionar um repositório inexistente deixava o botão carregando para sempre, e a página de detalhes ficava em "Carregando" sem fim.
- **Respostas podem voltar fora de ordem.** Trocar de filtro ou de página rápido dispara buscas que voltam em qualquer ordem. Cada busca recebe um número, e só a resposta da última atualiza a tela.
- **O que está guardado no navegador não é confiável.** Um `localStorage` com conteúdo inválido quebrava a tela principal. O `loadRepositories()` devolve lista vazia nesse caso.
- **Trocar a forma do código sem mudar o comportamento pede testes antes.** Conferi a troca das classes por componentes de função com 34 testes automatizados, fora deste repositório, que cobrem o comportamento original e passaram antes e depois.

## 🚀 Como rodar

Precisa de Node 20.19, 22.13 ou mais novo, e do Yarn.

```bash
yarn       # dependências
yarn dev   # app em http://localhost:5173
```

Digite um repositório no formato `dono/nome`, como `facebook/react`, e clique em +. Em "Detalhes" aparecem o dono, a descrição e as issues, com filtro de abertas e fechadas e 5 por página. A API do GitHub sem autenticação aceita 60 requisições por hora para repositórios e 10 buscas de issues por minuto, por IP.

## 🧠 Decisões técnicas

| Decisão | Alternativa | Por quê |
|---|---|---|
| Vite | Create React App | O CRA foi descontinuado, e o Vite troca só o ponto de entrada, sem mudar a arquitetura |
| `/search/issues` com `is:issue` | `/repos/{repo}/issues`, filtrando no navegador | Filtrar os pull requests deixaria páginas quase vazias; o custo é o limite menor e o teto de 1000 resultados |
| Guardar o `full_name` que a API devolve | Guardar o nome digitado | Repositório renomeado responde pelo nome antigo (`facebook/react` vira `react/react`), mas a busca recusa o nome antigo |
| Número em cada busca de issues | Aceitar a resposta que chegar | Só a busca mais recente atualiza a tela |
| Componentes de função com hooks | Componentes de classe | É o padrão atual do React |

## 🔄 Revisitando o projeto em 2026

Seis anos depois, o projeto não rodava mais. Depois de atualizar, a revisão encontrou bugs de tratamento de erro e uma lista de issues que misturava pull requests. Dos 8 bugs corrigidos, os principais:

| O que estava errado | O que mudou |
|---|---|
| Botão travado depois de adicionar um repositório inexistente | `try/catch/finally` no `handleSubmit`, com mensagem de erro |
| O mesmo repositório entrava duas vezes | `isInList()` confere, ignorando maiúsculas |
| A página de detalhes ficava em "Carregando" para sempre | Mensagem de erro e link de volta |
| A tela principal quebrava com `localStorage` inválido | `loadRepositories()` descarta o conteúdo inválido |
| Pull requests na lista de issues | Busca no `/search/issues` com `is:issue` |

## 📄 Licença

[MIT](LICENSE)

---

<div align="center">
  <p>Desenvolvido por <strong>Luiz Matos</strong></p>
  <p>
    <a href="https://github.com/luiz-matos">GitHub</a> •
    <a href="https://www.linkedin.com/in/luizeduardomatos/">LinkedIn</a>
  </p>
</div>
