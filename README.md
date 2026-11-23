# Mini Hub

Hub de minigames diários desenvolvido com Next.js, TypeScript, Tailwind CSS e App Router.

O projeto foi estruturado para crescer de forma incremental, com jogos independentes e um registro central responsável pela navegação entre eles.

## Requisitos

* Node.js 22.13 ou superior
* npm

## Executar em desenvolvimento

```sh
npm ci
npm run dev
```

Depois, abra:

```text
http://localhost:3000
```

Durante o desenvolvimento, um menu lateral de debug fica disponível automaticamente quando o projeto é executado com `next dev`.

Não é necessário criar `.env` nem definir `NODE_ENV` manualmente.

## Validação e produção

Para validar o projeto:

```sh
npm run lint
npm run build
```

Para executar o build de produção:

```sh
npm start
```

O menu de debug não é exibido em produção.

## Fluxo atual

O fluxo demonstrativo é:

```text
Home
→ Começar
→ Termo
→ Resultado
→ Conexões
→ Resultado
→ Cronologia
→ Resultado
→ Resumo final
```

Comportamentos atuais:

* `Entregar` abre o resultado do jogo atual.
* `Próximo jogo` segue a ordem definida em `lib/games.ts`.
* `Pular jogo` avança diretamente para o próximo jogo.
* Ao pular o último jogo, o usuário é levado para `/resumo`.
* O resultado do último jogo também leva ao resumo final.
* A Home apresenta os jogos registrados e inicia o fluxo pelo botão `Começar`.

## Estrutura principal

```text
app/
  page.tsx
  layout.tsx

  games/
    AGENTS.md

    termo/
      page.tsx
      resultado/

    conexoes/
      page.tsx
      resultado/

    cronologia/
      page.tsx
      resultado/

  resumo/
    page.tsx

components/
lib/
  games.ts

types/
  game.ts
```

### Arquivos importantes

* `app/page.tsx`: Home e entrada do fluxo.
* `app/games/`: páginas e implementações dos jogos.
* `app/games/AGENTS.md`: regras compartilhadas para implementação dos jogos.
* `app/resumo/page.tsx`: encerramento do fluxo atual.
* `app/layout.tsx`: layout global e elementos compartilhados.
* `components/`: componentes reutilizáveis da aplicação.
* `lib/games.ts`: registro central dos jogos e ordem do fluxo.
* `types/game.ts`: tipos compartilhados relacionados aos jogos.

## Adicionando um novo jogo

De forma geral:

1. Adicione o jogo ao registro em `lib/games.ts`.
2. Crie sua pasta dentro de `app/games/`.
3. Crie a página principal do jogo.
4. Crie sua página ou estado de resultado quando necessário.
5. Siga as instruções de `app/games/AGENTS.md`.

A Home e a navegação devem utilizar o registro central sempre que possível, evitando listas duplicadas de jogos espalhadas pelo projeto.

## Estado atual

O projeto ainda está em desenvolvimento incremental.

Algumas áreas podem funcionar apenas como demonstração enquanto suas mecânicas definitivas ainda não foram implementadas.

Funcionalidades como as seguintes devem ser adicionadas conforme forem necessárias:

* desafios diários
* persistência de progresso
* streaks
* estatísticas
* autenticação
* backend
* banco de dados

Evite assumir que um fluxo demonstrativo atual representa o comportamento final do produto.

## Observação sobre navegação

As rotas podem ser acessadas diretamente pela URL.

Ocultar elementos da interface, como o menu de debug, não representa controle de acesso.

Caso futuramente seja necessário impedir que usuários avancem para desafios antes da hora, essa validação deverá acontecer através do estado ou sessão apropriada da aplicação.
