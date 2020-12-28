<template>
  <div class="ingame">
    <!-- ++++++++++++++++++ Table ++++++++++++++++++-->
    <v-container fill-height fluid grid-list-md class="ingame_table">
      <v-row>
        <div class="table my-0 mx-auto ">
          <div class="table-left"></div>
          <div class="table-right"></div></div
      ></v-row>
    </v-container>
    <!-- ++++++++++++++++++ End of Table ++++++++++++++++++-->
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container grid-list-md fluid class="ingame_settings">
      <v-layout row wrap>
        <v-btn v-if="isAdmin && !round_running" @click="startRound" block>Start next round</v-btn>
        <v-btn v-if="isAdmin && round_finished" @click="finishRound" block>Finish round</v-btn>
        <v-container v-if="isTurn" grid-list-md>
          <v-slider v-model="raise_amount" :min="minRaise" :max="maxRaise" step="5">
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
              <v-btn block>{{callButtonText}}</v-btn>
            </v-flex>
            <v-flex v-else @click="btnCall" md2>
              <v-btn block color="red">Call All In</v-btn>
            </v-flex>
            <v-flex v-if="raise_amount === maxRaise" @click="btnRaise" md2>
              <v-btn block color="red">Raise All In</v-btn>
            </v-flex>
            <v-flex v-else @click="btnRaise" md2>
              <v-btn block>{{raiseButtonText}}</v-btn>
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
      return this.$store.getters.current_user.chips_bank - this.$store.getters.current_user.call_value;
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
      return this.$store.getters.current_user.call_value < this.$store.getters.current_user.chips_bank;
    },
    callButtonText() {
      return `Call ${this.$store.getters.current_user.call_value}`;
    },
    raiseButtonText() {
      return `Raise ${this.raise_amount} => Bet ${this.raise_amount + this.$store.getters.current_user.call_value}`;
    }
  },
  methods: {
    decrement_raise() {
      this.raise_amount -= 5;
    },
    increment_raise() {
      this.raise_amount += 5;
    },
    startRound() {
      this.$store.state.socket.emit('message', {action: 'startRound'});
    },
    finishRound() {
      this.$store.state.socket.emit('message', {action: 'finishRound'});
    },
    btnFold() {
      this.$store.state.socket.emit('message', {action: 'playMove', move: 'fold'});
    },
    btnCheck() {
      this.$store.state.socket.emit('message', {action: 'playMove', move: 'check'});
    },
    btnCall() {
      this.$store.state.socket.emit('message', {action: 'playMove', move: 'call'});
    },
    btnRaise() {
      this.$store.state.socket.emit('message', {action: 'playMove', move: 'raise', value: this.raise_amount });
    }
  },
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
}
.ingame_setting {
  background-color: var(--clr-green);
}

.ingame_table {
  background-color: var(--clr-grey);
}
.table {
  height: 200px;
  width: 800px;
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
</style>
