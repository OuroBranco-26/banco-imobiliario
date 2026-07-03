export const BOARD_SPACES = [
  { id: 0, type: 'go', name: 'Início', price: null, color: null, rent: null, houseCost: null },
  { id: 1, type: 'property', name: 'Gutierrez', price: 120, color: 'brown', rent: [4, 20, 60, 180, 320, 500], houseCost: 100 },
  { id: 2, type: 'chance', name: 'Cartas de Notícias', price: null, color: null, rent: null, houseCost: null },
  { id: 3, type: 'property', name: 'Santa Helena', price: 120, color: 'brown', rent: [8, 40, 120, 360, 640, 900], houseCost: 100 },
  { id: 4, type: 'tax', name: 'Imposto Renda', price: 400, color: null, rent: null, houseCost: null },
  { id: 5, type: 'railroad', name: 'Aeroporto Araguari', price: 400, color: null, rent: [50, 100, 200, 400], houseCost: null },
  { id: 6, type: 'property', name: 'São Sebastião', price: 200, color: 'lightblue', rent: [12, 60, 180, 540, 800, 1100], houseCost: 100 },
  { id: 7, type: 'chance', name: 'Cartas de Notícias', price: null, color: null, rent: null, houseCost: null },
  { id: 8, type: 'property', name: 'Miranda', price: 200, color: 'lightblue', rent: [12, 60, 180, 540, 800, 1100], houseCost: 100 },
  { id: 9, type: 'property', name: 'Brasília', price: 240, color: 'lightblue', rent: [16, 80, 200, 600, 900, 1200], houseCost: 100 },
  { id: 10, type: 'jail', name: 'Presídio (Visita)', price: null, color: null, rent: null, houseCost: null },
  { id: 11, type: 'property', name: 'Goiás', price: 280, color: 'pink', rent: [20, 100, 300, 900, 1250, 1500], houseCost: 200 },
  { id: 12, type: 'utility', name: 'CEMIG', price: 300, color: null, rent: null, houseCost: null },
  { id: 13, type: 'property', name: 'Santo Antônio', price: 280, color: 'pink', rent: [20, 100, 300, 900, 1250, 1500], houseCost: 200 },
  { id: 14, type: 'property', name: 'Bela Suíça', price: 320, color: 'pink', rent: [24, 120, 360, 1000, 1400, 1800], houseCost: 200 },
  { id: 15, type: 'railroad', name: 'UPA', price: 400, color: null, rent: [50, 100, 200, 400], houseCost: null },
  { id: 16, type: 'property', name: 'Industrial', price: 360, color: 'orange', rent: [28, 140, 400, 1100, 1500, 1900], houseCost: 200 },
  { id: 17, type: 'tax', name: 'Imposto Renda', price: 400, color: null, rent: null, houseCost: null },
  { id: 18, type: 'property', name: 'Ouro Verde', price: 360, color: 'orange', rent: [28, 140, 400, 1100, 1500, 1900], houseCost: 200 },
  { id: 19, type: 'property', name: 'Milênio', price: 400, color: 'orange', rent: [32, 160, 440, 1200, 1600, 2000], houseCost: 200 },
  { id: 20, type: 'parking', name: 'Férias', price: null, color: null, rent: null, houseCost: null },
  { id: 21, type: 'property', name: 'Paraíso', price: 440, color: 'red', rent: [36, 180, 500, 1400, 1750, 2100], houseCost: 300 },
  { id: 22, type: 'chance', name: 'Cartas de Notícias', price: null, color: null, rent: null, houseCost: null },
  { id: 23, type: 'property', name: 'Interlagos', price: 440, color: 'red', rent: [36, 180, 500, 1400, 1750, 2100], houseCost: 300 },
  { id: 24, type: 'property', name: 'Santa Terezinha', price: 480, color: 'red', rent: [40, 200, 600, 1500, 1850, 2200], houseCost: 300 },
  { id: 25, type: 'railroad', name: 'Rodoviária', price: 400, color: null, rent: [50, 100, 200, 400], houseCost: null },
  { id: 26, type: 'property', name: 'Parque dos Verdes', price: 520, color: 'yellow', rent: [44, 220, 660, 1600, 1950, 2300], houseCost: 300 },
  { id: 27, type: 'property', name: 'Flamboyant', price: 520, color: 'yellow', rent: [44, 220, 660, 1600, 1950, 2300], houseCost: 300 },
  { id: 28, type: 'utility', name: 'SAE', price: 300, color: null, rent: null, houseCost: null },
  { id: 29, type: 'property', name: 'Independência', price: 560, color: 'yellow', rent: [48, 240, 720, 1700, 2050, 2400], houseCost: 300 },
  { id: 30, type: 'go-to-jail', name: 'Vá p/ Presídio', price: null, color: null, rent: null, houseCost: null },
  { id: 31, type: 'property', name: 'Santiago', price: 600, color: 'green', rent: [52, 260, 780, 1800, 2200, 2550], houseCost: 400 },
  { id: 32, type: 'property', name: 'Jóquei Clube', price: 600, color: 'green', rent: [52, 260, 780, 1800, 2200, 2550], houseCost: 400 },
  { id: 33, type: 'tax', name: 'Receita Federal', price: 500, color: null, rent: null, houseCost: null },
  { id: 34, type: 'property', name: 'Bosque', price: 640, color: 'green', rent: [56, 300, 900, 2000, 2400, 2800], houseCost: 400 },
  { id: 35, type: 'railroad', name: 'Ferrovia Mauá', price: 400, color: null, rent: [50, 100, 200, 400], houseCost: null },
  { id: 36, type: 'tax', name: 'Receita Federal', price: 500, color: null, rent: null, houseCost: null },
  { id: 37, type: 'property', name: 'Fátima', price: 700, color: 'blue', rent: [70, 350, 1000, 2200, 2600, 3000], houseCost: 400 },
  { id: 38, type: 'tax', name: 'Imposto Renda', price: 200, color: null, rent: null, houseCost: null },
  { id: 39, type: 'property', name: 'Centro', price: 800, color: 'blue', rent: [100, 400, 1200, 2800, 3400, 4000], houseCost: 400 }
];

export const BOARD_COLORS = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFD700',
  green: '#22c55e',
  blue: '#3b82f6'
};

// Color groups: which space IDs belong to each color
export const COLOR_GROUPS = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  blue: [37, 39]
};

// Railroad IDs
export const RAILROAD_IDS = [5, 15, 25, 35];
