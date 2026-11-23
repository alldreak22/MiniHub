# AGENTS.md

Este projeto é um hub web de minigames diários.

O projeto deve crescer de forma incremental, mantendo uma base simples, modular e fácil de manter.

## Stack

Use apenas a stack já definida no projeto:

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- npm

Não adicione novas bibliotecas sem necessidade clara.

Antes de instalar qualquer dependência, verifique se o problema pode ser resolvido com as ferramentas já existentes no projeto.

## Princípios gerais

Priorize:

- código simples
- legibilidade
- tipagem clara
- baixo acoplamento
- reutilização somente quando houver benefício real
- alterações pequenas e focadas

Evite:

- abstrações prematuras
- arquiteturas complexas
- sistemas genéricos para necessidades futuras hipotéticas
- dependências desnecessárias
- arquivos excessivamente grandes
- uso de `any`

Implemente apenas o necessário para a tarefa atual.

## Instruções específicas por área

Algumas áreas do projeto possuem seus próprios arquivos `AGENTS.md`.

Ao trabalhar dentro de uma área que possui instruções próprias, siga:

1. este `AGENTS.md` da raiz
2. o `AGENTS.md` mais próximo dos arquivos alterados

Por exemplo:

- alterações em `app/games/**` também devem seguir `app/games/AGENTS.md`

As instruções específicas complementam estas regras gerais.

## Escopo

O projeto cresce por etapas.

Não implemente funcionalidades futuras sem solicitação explícita.

Isso inclui, quando ainda não forem necessárias:

- autenticação
- backend
- banco de dados
- estatísticas
- compartilhamento
- sistemas globais adicionais
- novas abstrações

Não transforme uma necessidade local em um sistema global sem benefício real.

## Estrutura existente

Antes de alterar o projeto:

- observe a estrutura atual
- reutilize padrões existentes quando fizer sentido
- evite mover arquivos sem necessidade
- evite renomear pastas ou módulos sem benefício claro

Não reorganize o projeto apenas por preferência arquitetural.

## Componentes

Crie componentes compartilhados apenas para elementos realmente reutilizados.

Evite transformar pequenos trechos de JSX em componentes sem necessidade.

Prefira clareza a excesso de fragmentação.

Quando um padrão já estiver sendo usado por mais de uma área do projeto, considere extrair apenas a estrutura realmente comum e mantenha o conteúdo específico próximo de quem o utiliza.

## TypeScript

Use tipagem clara e simples.

Evite `any`.

Prefira:

- `type`
- `interface`
- tipos derivados simples

Não crie generics complexos sem necessidade real.

Não ignore erros de TypeScript.

## Estilo

Use Tailwind CSS.

Não adicione sem necessidade:

- CSS-in-JS
- bibliotecas de componentes
- frameworks adicionais de estilo

Mantenha a interface:

- limpa
- responsiva
- consistente
- funcional em desktop e mobile

Não faça redesign geral sem que a tarefa peça isso.

### Design system

O projeto possui tokens visuais compartilhados definidos em `app/globals.css`.

Sempre que possível:

- reutilize cores semânticas existentes
- reutilize accents específicos dos jogos
- reutilize radius, tipografia e sombras existentes
- prefira classes baseadas nos tokens do projeto

Evite:

- repetir valores hex diretamente nos componentes
- recriar tokens locais equivalentes aos globais
- introduzir um segundo sistema visual paralelo

Ao adaptar designs externos ou referências visuais, traduza-os para o design system existente em vez de copiar seus tokens literalmente.

## Next.js

Utilize o App Router.

Prefira Server Components quando possível.

Use `"use client"` apenas quando necessário para:

- estado
- eventos
- hooks
- APIs do navegador
- interação do usuário

Evite transformar páginas inteiras em Client Components se apenas uma parte precisar disso.

## Alterações

Ao receber uma tarefa:

1. leia apenas os arquivos necessários
2. entenda o comportamento existente antes de alterar
3. faça somente as mudanças relacionadas à tarefa
4. preserve funcionalidades existentes
5. evite refatorações paralelas
6. não altere outras áreas do projeto sem necessidade

Se encontrar algo que poderia ser melhorado, mas não interfere na tarefa atual, deixe como está.

## Uso eficiente de contexto

- leia apenas os arquivos necessários para a tarefa atual
- não explore o repositório inteiro sem necessidade
- não releia arquivos já analisados na mesma tarefa, salvo se necessário
- não faça análises arquiteturais extensas sem solicitação
- não proponha melhorias fora do escopo
- evite explicações longas

## Validação

Após alterações relevantes:

- rode lint
- rode build quando apropriado
- execute os testes automatizados existentes relacionados à alteração
- adicione testes automatizados apenas quando fizer sentido para a lógica modificada
- corrija erros causados pelas alterações

Não realize testes manuais extensos nem descreva passo a passo de validação manual, salvo quando solicitado.

O usuário fará a validação manual da interface e do comportamento no navegador.

Não crie scripts, páginas temporárias ou fluxos extras apenas para testes manuais.

Não faça mudanças extras apenas para corrigir warnings ou problemas antigos não relacionados à tarefa.

## Comunicação

Ao finalizar uma tarefa, responda de forma breve.

Informe apenas:

- o que foi alterado
- arquivos principais envolvidos
- validações executadas
- limitações relevantes, se existirem

Evite explicações extensas.

## Regra principal

Prefira uma solução pequena, clara e correta para o problema atual a uma solução sofisticada criada para problemas futuros.
