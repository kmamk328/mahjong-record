export type RootStackParamList = {
  Inquire: undefined;
  HanchanList: { gameId: string };
  GameDetails: { hanchan: Hanchan };
  ScoreInput: {
    gameId: string;
    hanchanId: string;
    round: Round; // ここで修正
    // round: {
    //   id: string;
    //   roundNumber: { place: string; round: string; honba: string };
    //   winner: string;
    //   discarder: string;
    //   winnerPoints: string;
    //   isRyuukyoku: boolean;
    //   createdAt: Date;
    // };
  };
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
  id: string;  // ここで修正
  roundSeq: number;
  roundNumber: {
    place: string;
    round: string;
    honba: string;
  };
  winner: string;
  discarder: string;
  winnerName?: string;
  winnerPoints: string;
  discarderName?: string;
  isRyuukyoku: boolean;
  createdAt: Date;
}
