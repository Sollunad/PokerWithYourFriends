<template>
  <div class="ingame">
    <!-- ++++++++++++++++++ Table ++++++++++++++++++-->
    <v-container fill-height fluid grid-list-md class="ingame_table">
      <v-btn v-if="isAdmin" class="leave-btn" @click="deleteGame">
        Delete the game
      </v-btn>
      <v-row>
        <div class="table my-0 mx-auto ">
          <div class="table-left"></div>
          <div class="table-right"></div>
          <div class="pot">
            <h2>Pot:</h2>
            <h2>{{ $store.state.game_state.pot }}$</h2>
          </div>
          <v-container class="board">
            <v-layout row>
              <v-flex v-for="(idx, i) in [0, 1, 2, 3, 4]" :key="i">
                <v-img
                  max-height="150"
                  max-width="60"
                  v-if="$store.state.game_state.round_running"
                  :src="getCardBoard($store.state.game_state.board[idx])"
                ></v-img>
              </v-flex>
            </v-layout>
          </v-container>
          <div
            v-for="(player, idx) in $store.state.game_state.players"
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
              :color="player.is_turn ? 'green' : player.is_round_winner ? 'yellow' : ''"
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
              <v-card-text>Bank: {{ player.chips_bank }}$ | Bet: {{ player.chips_bet }}$</v-card-text>
            </v-card>
            <v-img
              v-if="$store.state.game_state.round_running && !player.has_fold"
              :src="getCard(player.cards[0])"
              max-height="150"
              max-width="60"
              class="player-card1"
            ></v-img>
            <v-img
              v-if="$store.state.game_state.round_running && !player.has_fold"
              :src="getCard(player.cards[1])"
              max-height="150"
              max-width="60"
              class="player-card2"
            ></v-img>
            <!-- <span :class="lastActionClass(idx + 1)">$store.state.game_state.player.last_action</span> -->
            <span :class="lastActionClass(idx + 1)">Check</span>
          </div>
        </div>
      </v-row>
    </v-container>
    <!-- ++++++++++++++++++ End of Table ++++++++++++++++++-->
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container grid-list-md fluid class="ingame_settings">
      <v-layout row wrap>
        <v-btn v-if="isAdmin && !round_running" @click="startRound" block
          >Start next round</v-btn
        >
        <v-btn v-if="isAdmin && round_finished" @click="finishRound" block
          >Finish round</v-btn
        >
        <v-container v-if="isTurn" grid-list-md>
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
          </v-slider>
          <v-layout row wrap justify-space-around>
            <v-flex md2>
              <v-btn @click="btnFold" block>Fold</v-btn>
            </v-flex>
            <v-flex v-if="canCheck" @click="btnCheck" md2>
              <v-btn block>Check</v-btn>
            </v-flex>
            <v-flex v-else-if="canCallWithoutAllIn" @click="btnCall" md2>
              <v-btn block>{{ callButtonText }}</v-btn>
            </v-flex>
            <v-flex v-else @click="btnCall" md2>
              <v-btn block color="red">Call All In</v-btn>
            </v-flex>
            <v-flex v-if="raise_amount === maxRaise" @click="btnRaise" md2>
              <v-btn block color="red">Raise All In</v-btn>
            </v-flex>
            <v-flex v-else @click="btnRaise" md2>
              <v-btn block>{{ raiseButtonText }}</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
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
      raise_amount: 0
    };
  },
  computed: {
    minRaise() {
      return this.$store.state.game_state.min_raise;
    },
    maxRaise() {
      return (
        this.$store.getters.current_user.chips_bank -
        this.$store.getters.current_user.call_value
      );
    },
    round_running() {
      return this.$store.state.game_state.round_running;
    },
    round_finished() {
      return this.$store.state.game_state.round_finished;
    },
    isAdmin() {
      return this.$store.getters.current_user.is_admin;
    },
    isTurn() {
      return this.$store.getters.current_user.is_turn;
    },
    canCheck() {
      return this.$store.getters.current_user.call_value === 0;
    },
    canCallWithoutAllIn() {
      return (
        this.$store.getters.current_user.call_value <
        this.$store.getters.current_user.chips_bank
      );
    },
    callButtonText() {
      return `Call ${this.$store.getters.current_user.call_value}`;
    },
    raiseButtonText() {
      return `Raise ${this.raise_amount} => Bet ${this.raise_amount +
        this.$store.getters.current_user.call_value}`;
    },
    baseUrl() {
      return window.location.origin;
    },
    adminLogo() {
      return `${this.baseUrl}/admin_crown.svg`;
    }
  },
  methods: {
    deleteGame() {
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
  color: white;
  position: relative;

  --table-width: 800px;
  --table-height: 200px;

  --player-card-width: 200px;
  --player-card-height: 150px;
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
}
.table-left,
.table-right {
  height: 200px;
  width: 200px;
  border-radius: 50%;
  position: absolute;
  background-color: white;
  transform: translateX(-50%);
}
.table-right {
  right: 0;
  transform: translateX(50%);
}

.board {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
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
  /* height: var(--player-card-height); */
  width: var(--player-card-width);
  /* border: 2px solid green; */
}

.player-1 {
  top: -240px;
}
.player-2 {
  left: 300px;
  top: -240px;
}
.player-3 {
  right: 0;
  top: -240px;
}
.player-4 {
  right: -400px;
  top: -80px;
}
.player-5 {
  right: -400px;
  bottom: -80px;
}
.player-6 {
  right: 0;
  bottom: -140px;
}
.player-7 {
  left: 300px;
  bottom: -140px;
}
.player-8 {
  bottom: -140px;
}
.player-9 {
  left: -400px;
  top: 50%;
  transform: translateY(-50%);
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

.pot {
  position: absolute;
  top: 50%;
  left: 75px;
  color: black;
  transform: translate(-50%, -50%);
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
