import { BlindRules } from "../shared/BlindRules";

class Card {
  visible: boolean;
  value: string | undefined;
  suit: string | undefined;
}

class Player {
  name: string;
  is_self: boolean;
  is_turn: boolean;
  is_connected: boolean;
  is_admin: boolean;
  is_dealer: boolean;
  is_bb: boolean;
  is_sb: boolean;
  is_out: boolean;
  has_fold: boolean;
  cards: Card[];
  chips_bank: number;
  chips_bet: number;
  pot: number;
}

export class GameState {
  players: Player[];
  board: Card[];
  started: boolean;
  blind_rules: BlindRules;
}
