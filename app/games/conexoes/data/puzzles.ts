export type Group = { title: string; words: [string, string, string, string] };
export type Puzzle = { id: string; groups: [Group, Group, Group, Group] };

// Mude o id ao editar um puzzle para invalidar partidas com respostas antigas.
export const PUZZLES: Puzzle[] = [
  {
    id: "cotidiano-1",
    groups: [
      { title: "Frutas", words: ["MAÇÃ", "PERA", "UVA", "BANANA"] },
      { title: "Cores", words: ["AZUL", "VERDE", "ROXO", "AMARELO"] },
      { title: "Animais de estimação", words: ["GATO", "CÃO", "HAMSTER", "PERIQUITO"] },
      { title: "Meios de transporte", words: ["CARRO", "TREM", "AVIÃO", "BARCO"] },
    ],
  },
  {
    id: "lazer-1",
    groups: [
      { title: "Instrumentos musicais", words: ["PIANO", "VIOLÃO", "FLAUTA", "TAMBOR"] },
      { title: "Esportes", words: ["FUTEBOL", "VÔLEI", "NATAÇÃO", "JUDÔ"] },
      { title: "Itens de cozinha", words: ["PANELA", "GARFO", "PRATO", "COPO"] },
      { title: "Planetas", words: ["MARTE", "VÊNUS", "JÚPITER", "SATURNO"] },
    ],
  },
  {
    id: "natureza-1",
    groups: [
      { title: "Flores", words: ["ROSA", "TULIPA", "LÍRIO", "GIRASSOL"] },
      { title: "Partes do corpo", words: ["BRAÇO", "PERNA", "CABEÇA", "OMBRO"] },
      { title: "Formas geométricas", words: ["CÍRCULO", "QUADRADO", "TRIÂNGULO", "LOSANGO"] },
      { title: "Fenômenos do tempo", words: ["CHUVA", "NEVE", "VENTO", "GRANIZO"] },
    ],
  },
];
