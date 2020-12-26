import {BlindRules} from "../shared/BlindRules";

class Player {
    // User ID extracted from the JWT sub
    user_id: string;
    // Player given display name
    name: string;
    // Current count of chips, 0 when eliminated
    chips: number;
}

export class Game {
    // Game ID, used to join the Game
    code: string;
    // Timestamp when the Game was opened
    opened: Date;
    // True, when the game left the lobby state and started the table
    started: boolean;
    // Timestamp when the last round finished
    last_round: Date | undefined;
    // Array of participating players
    players: Player[];
    // References user_id from admin player
    admin: string;
    // References seat_number from next dealer
    next_dealer: number;
    // Number of rounds played in the game
    rounds_played: number;
    // Blind rules
    blind_rules: BlindRules;
}