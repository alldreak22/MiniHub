# AGENTS.md — Games

Estas instruções se aplicam aos jogos deste projeto.

Cada novo jogo deve seguir estas regras, além das instruções gerais do `AGENTS.md` da raiz.

## Princípios

Cada jogo deve ser:

- simples de entender
- rápido de começar
- responsivo
- independente dos outros jogos
- consistente com a interface geral do projeto

Evite adicionar elementos ou textos que atrapalhem o jogador antes de ele começar a jogar.

## Interface

A tela principal do jogo deve priorizar o próprio jogo.

Evite grandes blocos de:

- instruções
- explicações
- regras
- exemplos
- textos introdutórios

Mantenha visível apenas o que for essencial para jogar.

## Estrutura das telas de jogo

As páginas internas dos jogos utilizam uma estrutura visual compartilhada quando apropriado.

No desktop:

- utilize a navegação lateral compartilhada existente
- mantenha a navegação visualmente secundária ao jogo
- destaque de forma discreta o jogo atual
- preserve o seletor de tema Light / Dark / System

No mobile:

- não mantenha a sidebar fixa
- utilize o padrão existente de botão de menu flutuante + drawer
- não crie uma appbar superior apenas para substituir a sidebar

Cada jogo deve controlar a largura da sua própria área principal.

Não force todos os jogos ao mesmo `max-width`.

Jogos compactos podem utilizar uma coluna estreita, enquanto jogos que dependem de espaço horizontal podem utilizar uma área maior.

## Densidade da interface

Prefira layouts compactos para os jogos.

- evite grandes espaços vazios entre o cabeçalho local e a área principal do jogo
- evite paddings e margens verticais maiores do que o necessário
- mantenha respiro visual suficiente para leitura sem afastar excessivamente elementos relacionados
- priorize deixar a área interativa principal visível sem exigir rolagem desnecessária, especialmente em telas menores
- não centralize verticalmente de uma forma que faça telas estruturalmente semelhantes começarem em alturas diferentes

## Ajuda e regras

Explicações detalhadas devem ficar em uma área de ajuda separada.

Por padrão:

- disponibilize um botão discreto com ícone `?`
- esse botão deve abrir o modal compartilhado de ajuda
- não repita todo o conteúdo do modal na tela principal

Reutilize a estrutura compartilhada do modal de ajuda para:

- backdrop
- container
- título
- botão fechar
- botão de confirmação
- responsividade
- comportamento de fechamento
- acessibilidade

O conteúdo interno continua pertencendo a cada jogo.

Prefira instruções visuais quando a mecânica puder ser explicada melhor por exemplos do próprio jogo.

O modal deve:

- possuir forma clara de fechar
- fechar com `Escape`
- permitir fechar clicando fora, quando apropriado
- possuir atributos de acessibilidade necessários
- funcionar em telas pequenas sem overflow horizontal

## Consistência

Jogos diferentes podem possuir interfaces e mecânicas diferentes.

Não tente forçar todos a utilizar o mesmo layout interno.

Compartilhe apenas elementos realmente comuns, como:

- estrutura geral de página
- ajuda
- navegação
- controles realmente compartilhados

Não crie abstrações genéricas para mecânicas específicas apenas para tentar reutilizá-las em outros jogos.

## Lógica do jogo

Mantenha a lógica específica dentro do módulo do próprio jogo.

Sempre que possível, separe:

- lógica/regras
- estado
- interface
- dados

Funções importantes da regra do jogo devem ser independentes da interface quando isso facilitar testes e manutenção.

Evite concentrar lógica, estado e grandes blocos visuais em um único arquivo quando a separação em poucos componentes claros melhorar a manutenção.

Não fragmente excessivamente um jogo em componentes pequenos sem benefício real.

## Interação

Use apenas as formas de interação que fazem sentido para a mecânica de cada jogo.

Suporte adequadamente mouse, touch e teclado quando forem realmente relevantes.

Não adicione uma modalidade de controle apenas por consistência com outro jogo.

Por exemplo, um jogo pode ser mouse/touch enquanto outro também utiliza teclado.

Interações importantes devem possuir feedback visual claro e discreto.

Durante drag/reorder, quando essa interação fizer parte da mecânica:

- o elemento arrastado deve possuir feedback visual de que está sendo segurado
- a posição candidata deve ficar clara antes do drop
- quando apropriado, os demais elementos devem se reorganizar visualmente durante o drag
- preserve suporte a mouse e touch

Evite animações excessivas ou efeitos que atrapalhem a leitura.

Respeite `prefers-reduced-motion` quando houver animações não essenciais.

## Ações secundárias

A ação `Pular jogo`, quando existir durante uma partida, deve permanecer visualmente secundária.

Por padrão:

- use texto centralizado
- sem fundo sólido
- sem borda de botão principal
- utilize cor de texto secundária
- mantenha hover/foco adequados e cursor de elemento clicável

Não aplique automaticamente esse tratamento a ações de resultado como `Próximo jogo`, que podem continuar sendo ações visuais mais fortes.

## Resultado

Quando uma partida terminar, apresente o resultado de forma clara.

Se o jogo possuir uma tela ou estado específico de resultado, faça a transição para ele naturalmente após o término da partida.

Evite exigir passos desnecessários entre o fim do jogo e a visualização do resultado.

O resultado não deve alterar ou perder o estado final da partida.

Telas de resultado não precisam compartilhar a mesma estrutura interna entre jogos.

Reutilize apenas elementos de resultado que forem realmente comuns.

## Responsividade

Todo jogo deve funcionar corretamente em:

- desktop
- tablet
- celular

O jogo não deve depender de hover para funcionalidades essenciais.

Evite overflow horizontal da página.

Elementos que existem apenas para complementar dispositivos desktop podem ser omitidos no mobile quando o próprio dispositivo já oferece uma alternativa adequada.

Não preserve componentes desktop no mobile apenas para manter simetria visual.

## Novos jogos

Ao implementar um novo jogo:

1. leia estas instruções antes de começar
2. observe jogos existentes apenas quando necessário para manter padrões compartilhados
3. não copie arquitetura específica de outro jogo se ela não fizer sentido
4. reutilize componentes globais existentes antes de criar equivalentes
5. mantenha a primeira implementação pequena
6. não implemente funcionalidades futuras sem solicitação

## Escopo

Ao alterar um jogo existente:

- trabalhe preferencialmente apenas no módulo desse jogo
- não altere outros jogos sem necessidade
- não faça refatorações globais não relacionadas
- não transforme uma necessidade específica em um sistema global sem benefício real

## Testes

Para lógica de jogo:

- prefira testes automatizados de funções e regras
- teste casos importantes e edge cases quando necessário
- mantenha testes simples e focados

Não execute ou documente testes manuais de interface por padrão.

Não simule longos fluxos de jogo manualmente apenas para validação.

A validação visual e de interação será feita pelo usuário, salvo solicitação explícita.
