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

Fiz em 2020 como projeto de estudo de React. Em 2026 voltei a ele, troquei o Create React App (descontinuado) pelo Vite, atualizei as dependências, corrigi os bugs e completei o app com mensagens de erro, remoção de repositórios, filtro e paginação das issues.

## 📋 Índice

- [🚀 Como rodar](#-como-rodar)
- [✨ Recursos](#-recursos)
- [🧩 Como o código funciona](#-como-o-código-funciona)
- [🔄 Revisitando o projeto em 2026](#-revisitando-o-projeto-em-2026)
- [📄 Licença](#-licença)

## 🚀 Como rodar

Precisa de Node 20.19, 22.13 ou mais novo, e do Yarn.

```bash
yarn
```

```bash
yarn dev
```

Depois abra http://localhost:5173.

Digite um repositório no formato `dono/nome` (por exemplo `facebook/react`) e clique em +. Em "Detalhes" aparecem o dono, a descrição e as issues do repositório.

Outros comandos:

| Comando | O que faz |
|---|---|
| `yarn build` | Gera a versão de produção na pasta `dist` |
| `yarn preview` | Serve a pasta `dist` localmente |
| `yarn lint` | Roda o ESLint |

O app usa a API do GitHub sem autenticação. O limite é de 60 requisições por hora para repositórios e de 10 por minuto para a busca de issues, contados por IP.

## ✨ Recursos

- Adicionar repositórios pelo nome, com a lista salva no navegador (`localStorage`)
- Mensagem de erro para campo vazio, formato inválido, repositório repetido, repositório inexistente, limite da API e falha de conexão
- Remover repositórios da lista
- Página de detalhes com avatar do dono, nome e descrição
- Issues com autor, labels e link para o GitHub
- Filtro de issues abertas, fechadas ou todas
- Paginação das issues, 5 por página

## 🧩 Como o código funciona

```
index.html                  página base; o Vite injeta o src/main.jsx
src/
├── main.jsx                ponto de entrada: monta o App no #root
├── App.jsx                 rotas e estilo global
├── routes.jsx              / (lista) e /repository/:repository (detalhes)
├── services/api.js         instância do axios apontando para api.github.com
├── styles/global.js        reset e cores de fundo
├── components/Container/   caixa branca centralizada usada pelas duas páginas
└── pages/
    ├── Main/               lista de repositórios
    └── Repository/         detalhes e issues
```

- **Páginas.** Cada página tem um `index.jsx` com o componente e um `styles.js` com os componentes do styled-components usados só nela.
- **Lista (`Main`).** O nome digitado é validado antes de qualquer requisição. A API confirma que o repositório existe, e a lista guarda o `full_name` que ela devolve. `saveRepositories()` é o único lugar que altera a lista, e grava no estado e no `localStorage` ao mesmo tempo.
- **Detalhes (`Repository`).** Ao abrir, busca o repositório e a primeira página de issues. Filtro e paginação passam por `loadIssues(filter, page)`, que refaz só a busca das issues.
- **Rotas.** O nome do repositório vai na URL com `encodeURIComponent`, porque a barra de `dono/nome` separaria a rota em dois segmentos.

## 🔄 Revisitando o projeto em 2026

Seis anos depois, o projeto não rodava mais. O `react-scripts 3.4` usa o webpack 4, que calcula hashes com MD4, algoritmo que o OpenSSL 3 do Node 17 em diante não aceita, e o build parava com `ERR_OSSL_EVP_UNSUPPORTED`. Depois de atualizar, a revisão encontrou bugs de tratamento de erro e uma lista de issues que misturava pull requests.

### 🐛 Bugs corrigidos

| Bug | Causa | Correção |
|---|---|---|
| Botão travado depois de adicionar um repositório inexistente | A requisição não tinha `try/catch`, e o carregamento nunca terminava | `try/catch/finally` em `handleSubmit`, com mensagem de erro |
| Campo vazio fazia requisição | O texto ia direto para a API | Validação do formato `dono/nome` antes da requisição |
| Mesmo repositório entrava duas vezes | Não havia verificação | `isInList()` compara ignorando maiúsculas, antes e depois da requisição |
| Todas as issues com a mesma `key` | Usava `issues.id` (o array) em vez de `issue.id` | `key={issue.id}` |
| Página de detalhes em "Carregando" para sempre | A requisição não tinha `catch` | Mensagem de erro e link de volta |
| Atributo `loading` no `<button>` do HTML | A prop do styled-components chegava ao DOM | Prop transitória `$loading` |
| Tela principal quebrava com `localStorage` inválido | `JSON.parse` sem tratamento, e o resultado era usado como lista sem conferir | `loadRepositories()` devolve lista vazia para conteúdo inválido e descarta itens sem nome |
| Pull requests na lista de issues | O endpoint `/repos/{repo}/issues` devolve issues e pull requests juntos | Busca em `/search/issues` com `is:issue` |

### 🧠 Decisões técnicas

**Vite no lugar do Create React App**

O Create React App foi descontinuado. O Vite é o substituto mais direto para um app só de front-end: não exige mudar a arquitetura, só o ponto de entrada (`index.html` na raiz e arquivos com JSX em `.jsx`).

- React 16 para 19, com `createRoot`.
- React Router 5 para 7: `Routes` e `element` no lugar de `Switch` e `component`, e `useParams` no lugar da prop `match`.
- `prop-types` saiu, porque o React 19 não confere mais `propTypes`.
- ESLint 10 com configuração flat, no lugar do `eslintConfig` do CRA.

**Busca em vez do endpoint de issues**

O endpoint `/repos/{repo}/issues` mistura pull requests. Nos repositórios que conferi, eles eram de 57% a 87% dos itens. Filtrar no navegador deixaria páginas quase vazias, então a lista usa `/search/issues` com `repo:dono/nome is:issue`.

- A busca aceita o filtro de estado (`is:open`, `is:closed`) e devolve o `total_count`, que dá o número de páginas.
- Ordenada por data de criação, a mais nova primeiro, como no endpoint original.
- O custo é o limite menor, de 10 buscas por minuto sem autenticação, e o teto de 1000 resultados. A paginação respeita esse teto.

**Nome oficial do repositório**

Repositórios renomeados continuam respondendo pelo nome antigo. `facebook/react` devolve `react/react`. A lista guarda o `full_name` da resposta, e a busca de issues usa esse nome, porque a busca não segue o redirecionamento e recusa o nome antigo.

**Respostas fora de ordem**

Trocar de filtro ou de página rápido dispara buscas que podem voltar fora de ordem. Cada busca recebe um número (`issuesRequest`), e só a resposta da última atualiza a tela. Enquanto carrega, a lista fica esmaecida e os botões de página ficam desabilitados.

**Organização do código**

- **Componentes de função com hooks.** As páginas eram classes. Agora são funções com `useState`, `useEffect` e `useRef`, o padrão atual do React.
- **Nomes corrigidos.** `hundleSubmit` e `hundleInputChange` viraram `handleSubmit` e `handleInputChange`, e as rotas deixaram de ser um componente anônimo (`AppRoutes`).
- **Sem `import React`.** O JSX atual não precisa dele.
- **Mesmo resultado.** Conferi a troca de classes por funções com 34 testes automatizados (Vitest e Testing Library, fora deste repositório), que cobrem o comportamento original, os bugs e os recursos. Todos passaram antes e depois.

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
