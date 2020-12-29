import { BlindRules } from "../shared/BlindRules";

class Card {
  visible: boolean;
  value: string | undefined;
  suit: string | undefined;
}

class FEPlayer {
  name: string;
  is_self: boolean;
  is_turn: boolean;
  is_connected: boolean;
  is_admin: boolean;
  is_dealer: boolean;
  is_bb: boolean;
  is_sb: boolean;
  is_round_winner: boolean;
  is_out: boolean;
  has_fold: boolean;
  cards: Card[];
  chips_bank: number;
  chips_bet: number;
  chips_pot: number;
}

export class GameState {
  players: FEPlayer[];
  board: Card[];
  started: boolean;
  round_running: boolean;
  round_finished: boolean;
  blind_rules: BlindRules;
  pot: number;
  call_value: number;
  min_raise: number;
  event_list: string[];
}
