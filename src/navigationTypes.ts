export type RootStackParamList = {
  Inquire: undefined;
  HanchanList: { gameId: string };
  GameDetails: { hanchan: Hanchan };
};

export interface Game {
  id: string;
  createdAt: string;
  members: string[];
  hanchan: Hanchan[];
}

export interface Hanchan {
  id: string;
  createdAt: FirebaseFirestore.Timestamp;
  gameId: string;
  rounds: Round[];
  members?: string[];
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
  winnerName?: string;
  discarderName?: string;
}
