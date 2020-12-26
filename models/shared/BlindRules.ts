class BlindStep {
    small: number;
    big: number;
}

export class BlindRules {
    // Blind steps
    steps: BlindStep[];
    // Number of rounds, after which blinds are raised
    raise_every_n_rounds: number;
}