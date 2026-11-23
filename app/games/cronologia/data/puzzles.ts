export type TimelineEvent = {
  id: string;
  title: string;
  year: number;
  description: string;
  metadata?: {
    left: string;
    right?: string;
  };
};

export type Puzzle = {
  id: string;
  theme: string;
  initialEventId: string;
  events: TimelineEvent[];
};

// Mude o id ao editar um puzzle para invalidar partidas com respostas antigas.
export const PUZZLES: Puzzle[] = [
  {
    id: "videogames-2",
    theme: "História dos videogames",
    initialEventId: "playstation",
    events: [
      { id: "pong", title: "Pong é lançado", year: 1972, description: "Um dos primeiros grandes sucessos comerciais da história dos arcades.", metadata: { left: "Atari", right: "Arcade" } },
      { id: "atari-2600", title: "Atari 2600 é lançado", year: 1977, description: "Popularizou os consoles domésticos com jogos distribuídos em cartuchos.", metadata: { left: "Atari", right: "Console doméstico" } },
      { id: "famicom", title: "Famicom é lançado", year: 1983, description: "Console japonês que serviu de base para o Nintendo Entertainment System.", metadata: { left: "Nintendo", right: "Japão" } },
      { id: "game-boy", title: "Game Boy é lançado", year: 1989, description: "Consolidou os videogames portáteis com cartuchos intercambiáveis.", metadata: { left: "Nintendo", right: "Portátil" } },
      { id: "super-famicom", title: "Super Famicom é lançado", year: 1990, description: "Sucessor de 16 bits do Famicom, lançado no Ocidente como Super Nintendo.", metadata: { left: "Nintendo", right: "Japão" } },
      { id: "playstation", title: "PlayStation é lançado", year: 1994, description: "Marcou a entrada da Sony no mercado de consoles domésticos.", metadata: { left: "Sony", right: "Console doméstico" } },
      { id: "nintendo-64", title: "Nintendo 64 é lançado", year: 1996, description: "Levou jogos tridimensionais e controle analógico ao grande público.", metadata: { left: "Nintendo", right: "64 bits" } },
      { id: "playstation-2", title: "PlayStation 2 é lançado", year: 2000, description: "Uniu jogos e reprodução de filmes em DVD em um console doméstico.", metadata: { left: "Sony", right: "DVD" } },
      { id: "steam", title: "Steam é lançado", year: 2003, description: "Ampliou a distribuição digital de jogos e atualizações para computadores.", metadata: { left: "Valve Corporation", right: "PC Gaming" } },
      { id: "wii", title: "Nintendo Wii é lançado", year: 2006, description: "Popularizou controles sensíveis a movimento entre públicos variados.", metadata: { left: "Nintendo", right: "Controle por movimento" } },
      { id: "minecraft", title: "Minecraft tem seu lançamento oficial", year: 2011, description: "O jogo de construção em blocos chegou à versão completa após o acesso antecipado.", metadata: { left: "Mojang", right: "Sandbox" } },
    ],
  },
  {
    id: "brasil-2",
    theme: "História do Brasil",
    initialEventId: "independencia",
    events: [
      { id: "chegada-portugueses", title: "Chegada dos portugueses ao Brasil", year: 1500, description: "A expedição de Pedro Álvares Cabral chegou ao litoral sul da Bahia.", metadata: { left: "Coroa portuguesa", right: "Porto Seguro" } },
      { id: "chegada-corte", title: "Corte portuguesa chega ao Brasil", year: 1808, description: "A família real transferiu a sede do governo português para o Rio de Janeiro.", metadata: { left: "Monarquia portuguesa", right: "Rio de Janeiro" } },
      { id: "independencia", title: "Independência do Brasil", year: 1822, description: "A separação política de Portugal deu origem ao Império do Brasil.", metadata: { left: "Dom Pedro I", right: "São Paulo" } },
      { id: "abolicao", title: "Abolição da escravidão", year: 1888, description: "A Lei Áurea extinguiu legalmente a escravidão no país.", metadata: { left: "Lei Áurea", right: "Rio de Janeiro" } },
      { id: "republica", title: "Proclamação da República", year: 1889, description: "O movimento militar encerrou a monarquia e instaurou o regime republicano.", metadata: { left: "Marechal Deodoro", right: "Rio de Janeiro" } },
      { id: "radio", title: "Primeira transmissão de rádio no Brasil", year: 1922, description: "Uma transmissão pública marcou o centenário da Independência.", metadata: { left: "Radiodifusão", right: "Rio de Janeiro" } },
      { id: "maracana", title: "Maracanã é inaugurado", year: 1950, description: "O estádio foi aberto para receber partidas da Copa do Mundo.", metadata: { left: "Futebol", right: "Rio de Janeiro" } },
      { id: "brasilia", title: "Brasília é inaugurada", year: 1960, description: "A nova capital federal foi construída no Planalto Central.", metadata: { left: "Governo JK", right: "Distrito Federal" } },
      { id: "constituicao", title: "Constituição Cidadã é promulgada", year: 1988, description: "A nova Constituição consolidou a redemocratização brasileira.", metadata: { left: "Assembleia Constituinte", right: "Brasília" } },
      { id: "real", title: "Plano Real é lançado", year: 1994, description: "O programa econômico introduziu uma nova moeda e conteve a hiperinflação.", metadata: { left: "Governo Itamar", right: "Economia" } },
      { id: "rio-2016", title: "Jogos Olímpicos do Rio", year: 2016, description: "O Brasil sediou a primeira edição dos Jogos Olímpicos realizada na América do Sul.", metadata: { left: "Jogos Olímpicos", right: "Rio de Janeiro" } },
    ],
  },
  {
    id: "espaco-2",
    theme: "Exploração espacial",
    initialEventId: "apollo-11",
    events: [
      { id: "sputnik-1", title: "Sputnik 1 entra em órbita", year: 1957, description: "O primeiro satélite artificial iniciou a era espacial.", metadata: { left: "União Soviética", right: "Satélite" } },
      { id: "explorer-1", title: "Explorer 1 é lançado", year: 1958, description: "O primeiro satélite dos Estados Unidos identificou os cinturões de Van Allen.", metadata: { left: "Estados Unidos", right: "Satélite" } },
      { id: "gagarin", title: "Yuri Gagarin vai ao espaço", year: 1961, description: "O cosmonauta realizou o primeiro voo espacial tripulado da história.", metadata: { left: "União Soviética", right: "Vostok 1" } },
      { id: "apollo-11", title: "Apollo 11 pousa na Lua", year: 1969, description: "A missão levou seres humanos à superfície lunar pela primeira vez.", metadata: { left: "NASA", right: "Lua" } },
      { id: "voyager-1", title: "Voyager 1 é lançada", year: 1977, description: "A sonda partiu para estudar os planetas exteriores do Sistema Solar.", metadata: { left: "NASA", right: "Sonda espacial" } },
      { id: "columbia", title: "Columbia faz seu primeiro voo", year: 1981, description: "O ônibus espacial inaugurou o programa de naves orbitais reutilizáveis.", metadata: { left: "NASA", right: "Ônibus espacial" } },
      { id: "hubble", title: "Telescópio Hubble é lançado", year: 1990, description: "O observatório passou a registrar o Universo acima da atmosfera terrestre.", metadata: { left: "NASA e ESA", right: "Telescópio" } },
      { id: "iss", title: "Primeiro módulo da ISS é lançado", year: 1998, description: "O módulo Zarya iniciou a montagem da Estação Espacial Internacional.", metadata: { left: "Cooperação internacional", right: "Órbita terrestre" } },
      { id: "curiosity", title: "Curiosity chega a Marte", year: 2012, description: "O rover pousou na cratera Gale para investigar a história ambiental marciana.", metadata: { left: "NASA", right: "Marte" } },
      { id: "falcon-heavy", title: "Falcon Heavy faz seu primeiro voo", year: 2018, description: "O foguete pesado realizou seu lançamento inaugural a partir da Flórida.", metadata: { left: "SpaceX", right: "Foguete" } },
      { id: "james-webb", title: "Telescópio James Webb é lançado", year: 2021, description: "O observatório infravermelho foi enviado para estudar a formação de estrelas e galáxias.", metadata: { left: "NASA, ESA e CSA", right: "Telescópio" } },
    ],
  },
];
