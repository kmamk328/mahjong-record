export type RootStackParamList = {
  Inquire: undefined;
  GameDetails: { game: Game };
  ScoreInput: { gameId: string };
  HanchanList: { gameId: string };
  EditRound: { gameId: string, round: Round };
};

export interface Game {
  id: string;
  createdAt: string;
  members: string[];
  hanchan: Hanchan[];
}

export interface Hanchan {
  id: string;
  createdAt: string;
  rounds: Round[];
}

export interface Round {
  roundSeq: number;
  roundNumber: {
    place: string;
    round: string;
    honba: string;
  };
  winner: string;
  discarder: string;
  isTsumo: boolean;
  isNaki: boolean;
  isReach: boolean;
  isRyuukyoku: boolean;
  winnerPoints: string;
  discarderPoints: string;
  roles: string[];
  dora: number;
  uraDora: number;
}
