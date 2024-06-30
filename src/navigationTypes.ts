export type RootStackParamList = {
    Inquire: undefined;
    GameDetails: { game: Game };
  };
  
  export interface Game {
    id: string;
    createdAt: string;
    members: string[];
    rounds: Round[];
  }
  
  export interface Round {
    roundNumber: {
      round: string;
    };
    winner: string;
  }
  