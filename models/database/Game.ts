class Player {
    // User ID extracted from the JWT sub
    user_id: string;
    // Player given display name
    name: string;
    // Current count of chips, 0 when eliminated
    chips: number;
}

class BlindRules {
    small: number[];
    big: number[];
    raise_every_n_rounds: number;
}

export class Game {
    // Game ID, used to join the Game
    code: string;
    // Timestamp when the Game was opened
    opened: Date;
    // Timestamp when the last round finished
    last_round: Date;
    // Array of participating players
    players: Player[];
    // References user_id from admin player
    admin: string;
    // References user_id from next dealer
    next_dealer: string;
    // Number of rounds played in the game
    rounds_played: number;
    // Blind rules
    blinds: BlindRules;
}