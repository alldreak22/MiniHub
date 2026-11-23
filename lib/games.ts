import type { GameDefinition } from "@/types/game";

// A ordem do registro define a sequência do modo jogável e do menu de debug.
export const games: GameDefinition[] = [
  {
    id: "termo",
    name: "Termo",
    description: "Adivinhe a palavra secreta do dia em 6 tentativas.",
    route: "/games/termo",
    status: "available",
  },
  {
    id: "conexoes",
    name: "Conexões",
    description: "Encontre 4 grupos de palavras que compartilham um tema.",
    route: "/games/conexoes",
    status: "available",
    badge: "Novo",
  },
  {
    id: "cronologia",
    name: "Cronologia",
    description: "Ordene os eventos históricos na linha do tempo correta.",
    route: "/games/cronologia",
    status: "available",
  },
];

export function getGameStep(id: string) {
  const index = games.findIndex((game) => game.id === id);

  if (index === -1) {
    throw new Error(`Jogo não registrado: ${id}`);
  }

  return {
    game: games[index],
    position: index + 1,
    total: games.length,
    nextGame: games[index + 1],
  };
}
