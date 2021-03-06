<template>
  <div class="ingame">
    <!-- ++++++++++++++++++ Table ++++++++++++++++++-->
    <v-container fill-height fluid grid-list-md class="ingame_table">
      <v-dialog v-if="isAdmin" v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="red lighten-2"
            class="leave-btn"
            dark
            v-bind="attrs"
            v-on="on"
          >
            Delete the game
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline grey lighten-2 justify-space-between">
            Are you sure?
            <v-btn color="red" @click="deleteGame">
              Delete
            </v-btn>
          </v-card-title>
        </v-card>
      </v-dialog>
      <v-row>
        <div class="table my-0 mx-auto ">
          <div class="table-left"></div>
          <div class="table-right"></div>
          <v-container fill-height grid-list-md>
            <v-layout align-center justify-space-around>
              <v-flex md1>
                <h2>Pot:</h2>
                <h2>{{ gameState.pot }}$</h2>
              </v-flex>
              <v-flex md6>
                <v-container class="board">
                  <v-layout row>
                    <v-flex v-for="(idx, i) in [0, 1, 2, 3, 4]" :key="i">
                      <v-img
                        max-height="150"
                        max-width="60"
                        v-if="gameState.round_running"
                        :src="getCardBoard(gameState.board[idx])"
                      ></v-img>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-flex>
              <v-flex md3>
                <div class="mb-2" v-if="gameState.round_running">Round {{ gameState.rounds_played + 1 }}</div>
                <div class="mb-2" v-else>Coming up: Round {{ gameState.rounds_played + 1 }}</div>
                <div class="mb-2" v-if="currentBlindStep">
                  Blinds:
                  <v-chip>
                    {{ currentBlindStep.small }}/{{ currentBlindStep.big }}</v-chip
                  >
                </div>
                <div v-if="nextBlindStep">
                  Next:
                  <v-chip
                    >{{ nextBlindStep.small }}/{{ nextBlindStep.big }}</v-chip
                  >
                  starting Round {{ roundForNextBlindStep }}
                </div>
              </v-flex>
            </v-layout>
          </v-container>

          <div
            v-for="(player, idx) in gameState.players"
            :key="idx"
            :class="playerClass({ player: player, idx: idx + 1 })"
          >
            <v-img
              v-if="player.is_admin"
              class="admin-crown"
              max-height="20"
              max-width="30"
              :src="adminLogo"
            ></v-img>
            <v-card
              class="player-card"
              elevation="10"
              :color="
                player.is_turn
                  ? 'green'
                  : player.is_round_winner
                  ? 'yellow'
                  : ''
              "
            >
              <v-card-title class="player-title justify-space-between">
                <span class="you" v-if="player.is_self">
                  <p v-if="player.is_turn" class="greencolor">Your turn</p>
                  <p v-else>You</p>
                </span>
                <span class="player-name">{{ player.name }}</span>
                <v-chip v-if="player.is_dealer">D</v-chip>
                <v-chip v-if="player.is_sb">SB</v-chip>
                <v-chip v-if="player.is_bb">BB</v-chip>
              </v-card-title>
              <v-card-text
                >Bank: {{ player.chips_bank }}$ | Bet:
                {{ player.chips_bet }}$</v-card-text
              >
            </v-card>
            <v-img
              v-if="
                gameState.round_running &&
                  !player.has_fold &&
                  player.cards[0]
              "
              :src="getCard(player.cards[0])"
              max-height="150"
              max-width="60"
              class="player-card1"
            ></v-img>
            <v-img
              v-if="
                gameState.round_running &&
                  !player.has_fold &&
                  player.cards[1]
              "
              :src="getCard(player.cards[1])"
              max-height="150"
              max-width="60"
              class="player-card2"
            ></v-img>
          </div>
        </div>
      </v-row>
    </v-container>
    <!-- ++++++++++++++++++ End of Table ++++++++++++++++++-->
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container fluid class="ingame_settings">
      <v-layout row wrap>
        <v-flex md5 class="game_log">
          <v-virtual-scroll
            :items="gameState.event_list"
            height="150"
            item-height="25"
          >
            <template v-slot:default="{ item }">
              {{ item }}
            </template>
          </v-virtual-scroll>
        </v-flex>
        <v-flex md1></v-flex>
        <v-flex md5>
          <div class="between_rounds">
            <v-btn v-if="isAdmin && !round_running" @click="startRound" block
              >Start next round</v-btn
            >
            <v-btn v-if="isAdmin && round_finished" @click="finishRound" block
              >Finish round</v-btn
            >
            <v-btn v-if="canShowCards" @click="showCards" block
              >Show your cards</v-btn
            >
          </div>

          <v-container v-if="isTurn" grid-list-md>
            <v-layout row wrap>
              <v-flex md10>
                <v-slider
                  v-model="raise_amount"
                  :min="minRaise"
                  :max="maxRaise"
                  step="5"
                >
                  <template v-slot:prepend>
                    <v-icon @click="decrement_raise">
                      mdi-minus
                    </v-icon>
                  </template>

                  <template v-slot:append>
                    <v-icon @click="increment_raise">
                      mdi-plus
                    </v-icon>
                  </template>
                  <template v-slot:append>
                    <v-icon @click="increment_raise">
                      mdi-plus
                    </v-icon>
                  </template>
                </v-slider>
              </v-flex>
              <v-flex md2 v-if="raise_amount > 0">
                <v-text-field
                  v-model="raise_amount"
                  class="mt-0 pt-0"
                  type="number"
                  style="width: 60px"
                  step="5"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row wrap>
              <v-flex md2>
                <v-btn @click="btnFold" block>Fold</v-btn>
              </v-flex>
              <v-flex md2></v-flex>
              <v-flex v-if="canCheck" @click="btnCheck" md2>
                <v-btn block>Check</v-btn>
              </v-flex>
              <v-flex v-else-if="canCallWithoutAllIn" @click="btnCall" md2>
                <v-btn block>{{ callButtonText }}</v-btn>
              </v-flex>
              <v-flex v-else @click="btnCall" md2>
                <v-btn block color="red">Call All In</v-btn>
              </v-flex>
              <v-flex md2></v-flex>
              <v-flex v-if="raise_amount === maxRaise && canCallWithoutAllIn" @click="btnRaise" md2>
                <v-btn block color="red">Raise All In</v-btn>
              </v-flex>
              <v-flex v-else-if="canCallWithoutAllIn" @click="btnRaise" md2>
                <v-btn block>{{ raiseButtonText }}</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- ++++++++++++++++++ End of Settings ++++++++++++++++++-->
  </div>
</template>

<script type="text/javascript">
export default {
  name: "Ingame",
  data() {
    return {
      raise_amount: 0,
      dialog: false
    };
  },
  computed: {
    gameState() {
      return this.$store.state.game_state;
    },
    currentUser() {
      return this.$store.getters.current_user;
    },
    minRaise() {
      return this.gameState.min_raise;
    },
    maxRaise() {
      return (
        this.currentUser.chips_bank -
        this.currentUser.call_value
      );
    },
    round_running() {
      return this.gameState.round_running;
    },
    round_finished() {
      return this.gameState.round_finished;
    },
    isAdmin() {
      return this.currentUser.is_admin;
    },
    isTurn() {
      return this.currentUser.is_turn;
    },
    canCheck() {
      return this.currentUser.call_value === 0;
    },
    canShowCards() {
      return (
        this.round_finished &&
        !this.currentUser.shows_cards &&
        !this.currentUser.has_fold
      );
    },
    canCallWithoutAllIn() {
      return (
        this.currentUser.call_value <
        this.currentUser.chips_bank
      );
    },
    callButtonText() {
      return `Call ${this.currentUser.call_value}`;
    },
    raiseButtonText() {
      return `Raise ${this.raise_amount} => Bet ${this.raise_amount +
        this.currentUser.call_value}`;
    },
    baseUrl() {
      return window.location.origin;
    },
    adminLogo() {
      return `${this.baseUrl}/admin_crown.svg`;
    },
    roundForNextBlindStep() {
      const maxBlindNum = this.gameState.blind_rules.steps.length - 1;
      if (this.currentBlindNum === maxBlindNum) return undefined;
      return 1 + this.gameState.blind_rules.raise_every_n_rounds * (this.currentBlindNum + 1);
    },
    currentBlindNum() {
      const num = Math.floor(this.gameState.rounds_played / this.gameState.blind_rules.raise_every_n_rounds);
      const maxBlindNum = this.gameState.blind_rules.steps.length - 1;
      return num > maxBlindNum ? maxBlindNum : num;
    },
    currentBlindStep() {
      return this.gameState.blind_rules.steps[this.currentBlindNum];
    },
    nextBlindStep() {
      const maxBlindNum = this.gameState.blind_rules.steps.length - 1;
      if (this.currentBlindNum === maxBlindNum) return undefined;
      return this.gameState.blind_rules.steps[this.currentBlindNum + 1];
    }
  },
  methods: {
    deleteGame() {
      this.dialog = false;
      this.$store.state.socket.emit("message", { action: "deleteGame" });
      this.$router.push("/");
    },
    decrement_raise() {
      this.raise_amount -= 5;
    },
    increment_raise() {
      this.raise_amount += 5;
    },
    startRound() {
      this.$store.state.socket.emit("message", { action: "startRound" });
    },
    finishRound() {
      this.$store.state.socket.emit("message", { action: "finishRound" });
    },
    btnFold() {
      this.$store.state.socket.emit("message", {
        action: "playMove",
        move: "fold"
      });
    },
    btnCheck() {
      this.$store.state.socket.emit("message", {
        action: "playMove",
        move: "check"
      });
    },
    btnCall() {
      this.$store.state.socket.emit("message", {
        action: "playMove",
        move: "call"
      });
    },
    btnRaise() {
      this.$store.state.socket.emit("message", {
        action: "playMove",
        move: "raise",
        value: this.raise_amount
      });
    },
    showCards() {
      this.$store.state.socket.emit("message", {
        action: "showCards"
      });
    },
    getCard(card) {
      if (card.visible) {
        return `${this.baseUrl}/cards/${card.value}${card.suit}.svg`;
      } else {
        return `${this.baseUrl}/cards/card_back.svg`;
      }
    },
    getCardBoard(card) {
      if (card) {
        return `${this.baseUrl}/cards/${card.value}${card.suit}.svg`;
      } else {
        return `${this.baseUrl}/cards/card_back.svg`;
      }
    },
    playerClass({ player, idx }) {
      return [`player-${idx}`, player.is_fold ? "player_is_fold" : ""];
    },
    lastActionClass(idx) {
      return `last-action-player-${idx}`;
    }
  },
  watch: {
    isTurn() {
      if (this.isTurn) {
        this.raise_amount = this.minRaise;
      }
    }
  }
};
</script>

<style lang="css" scoped>
.ingame {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  text-align: left;
  /* color: white; */
  position: relative;

  --table-width: 650px;
  --table-height: 130px;
}

.ingame_setting {
  background-color: var(--clr-green);
}

.ingame_table {
  background-color: var(--clr-grey);
}
.table {
  height: var(--table-height);
  width: var(--table-width);
  background-color: white;
  position: relative;
  z-index: 2;
}
.table-left,
.table-right {
  height: var(--table-height);
  width: 200px;
  border-radius: 50%;
  position: absolute;
  background-color: white;
  transform: translateX(-50%);
  z-index: -1;
}
.table-right {
  right: 0;
  transform: translateX(50%);
}

.board {
  height: 115px;
  border: 2px solid black;
}

.leave-btn {
  position: absolute;
  top: 10px;
  left: 10px;
}

.admin-crown {
  position: absolute;
  top: -28px;
  right: 0;
}
.you {
  position: absolute;
  top: -35px;
  color: white;
}

.player-name {
  font-size: 14px;
}

.player-1,
.player-2,
.player-3,
.player-4,
.player-5,
.player-6,
.player-7,
.player-8,
.player-9 {
  position: absolute;
  width: var(--player-card-width);
  transform: scale(0.8);
}

.player-1 {
  top: -230px;
}
.player-2 {
  left: 225px;
  top: -230px;
}
.player-3 {
  right: 0;
  top: -230px;
}
.player-4 {
  right: -350px;
  top: -150px;
}
.player-5 {
  right: -350px;
  bottom: -100px;
}
.player-6 {
  right: 0;
  bottom: -125px;
}
.player-7 {
  left: 225px;
  bottom: -125px;
}
.player-8 {
  bottom: -125px;
}
.player-9 {
  left: -350px;
  top: 50%;
  transform: translateY(-50%) scale(0.8);
}

@media screen and (min-width: 1450px) {
  .ingame {
    --table-width: 800px;
    --table-height: 200px;
  }
  .player-1,
  .player-2,
  .player-3,
  .player-4,
  .player-5,
  .player-6,
  .player-7,
  .player-8,
  .player-9 {
    transform: scale(1);
  }
  .player-9 {
    transform: translateY(-50%);
  }
  .player-2,
  .player-7 {
    left: 300px;
  }

  .player-4,
  .player-5 {
    right: -400px;
  }

  .player-9 {
    left: -400px;
  }
}

.last-action-player-1,
.last-action-player-2,
.last-action-player-3 {
  position: absolute;
  bottom: -130px;
}
.last-action-player-6,
.last-action-player-7,
.last-action-player-8 {
  position: absolute;
  top: -30px;
}

.last-action-player-9 {
  position: absolute;
  right: -80px;
  top: 50%;
  transform: translate(-50%, -50%);
}

.last-action-player-4 {
  position: absolute;
  left: -70px;
  transform: translate(0, -50%);
}
.last-action-player-5 {
  position: absolute;
  left: -70px;
  top: 0;
}
.player-card {
  position: relative;
}
.player-card1 {
  position: absolute;
  bottom: -100px;
}
.player-card2 {
  position: absolute;
  bottom: -100px;
  left: 80px;
}

.player-title {
  position: relative;
}

.between_rounds {
  margin: 16px 0;
}

.game_log {
  margin-left: 16px;
}

.greencolor {
  color: green;
}
.player_is_turn {
  background-color: green;
}

.player_is_fold {
  opacity: 0.2;
}
</style>
