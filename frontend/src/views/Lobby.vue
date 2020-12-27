<template lang="html">
  <div class="game">
    <div v-if="!game_state.started" class="settings">
      <v-container grid-list-md>
        <div v-if="current_user.user_id == game_state.admin">
          <div class="admin-settings">
            <div v-if="!selected_player_by_admin">
              <v-layout row wrap>
                <v-flex md8>
                  <v-card>
                    <v-card-title>Blind settings</v-card-title>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout row wrap>
                          <v-flex xs8 md4>
                            <h5>Add blind steps:</h5>
                            <v-container>
                              <v-layout row wrap justify-space-around>
                                <v-flex xs2>
                                  <v-text-field
                                    dense
                                    class="blind-field"
                                    v-model="new_sb"
                                    label="Small:"
                                  ></v-text-field>
                                </v-flex>
                                <v-flex xs2>
                                  <v-text-field
                                    dense
                                    class="blind-field"
                                    v-model="new_bb"
                                    label="Big:"
                                  ></v-text-field>
                                </v-flex>
                                <v-flex xs4>
                                  <v-btn dense @click="addBlindStep">Add</v-btn>
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-flex>
                          <v-flex xs12 md6>
                            <h5>Current blind steps:</h5>
                            <v-container>
                              <v-layout row wrap>
                                <v-flex
                                  xs3
                                  sm2
                                  v-for="(step, index) in game_state.blind_rules
                                    .steps"
                                  :key="index"
                                >
                                  <!-- <p>Blind steps:</p> -->
                                  <v-chip
                                    close
                                    @click:close="removeBlindStep(step)"
                                    >{{ step.small }}/{{ step.big }}</v-chip
                                  >
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-flex>
                          <v-flex md2>
                            <h5>Increase after n steps</h5>
                            <v-text-field
                              v-model="
                                game_state.blind_rules.raise_every_n_rounds
                              "
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-flex>

                <v-flex md4>
                  <v-card>
                    <v-card-title>User settings </v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="current_user.name"
                        label="Username:"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                  <v-container>
                    <v-btn
                      v-if="current_user.user_id == game_state.admin"
                      @click="startGame"
                      >Start game</v-btn
                    >
                  </v-container>
                </v-flex>
              </v-layout>
            </div>
            <div v-if="selected_player_by_admin">
              <v-card>
                <v-card-title
                  >Adjust chips of player
                  {{ selected_player_by_admin.name }}</v-card-title
                >
                <v-card-text
                  ><v-text-field
                    v-model="selected_player_by_admin.chips_bank"
                    label="Chips:"
                  ></v-text-field>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
        <div v-if="current_user.user_id != game_state.admin">
          Wait for the admin to start the game
        </div>
      </v-container>
    </div>
    <div v-if="game_state.started" class="ingame_settings">
      <v-container>
        <v-layout row wrap>
          <v-flex md6> </v-flex>
          <v-flex md6>
            <v-container grid-list-md>
              <v-slider v-model="raise_amount" :min="0" :max="300">
                <template v-slot:prepend>
                  <v-icon :color="color" @click="decrement">
                    mdi-minus
                  </v-icon>
                </template>

                <template v-slot:append>
                  <v-icon :color="color" @click="increment">
                    mdi-plus
                  </v-icon>
                </template>
              </v-slider>
              <v-layout row wrap justify-space-around>
                <v-flex md2>
                  <v-btn block>Fold</v-btn>
                </v-flex>
                <v-flex md2>
                  <v-btn block>Check</v-btn>
                </v-flex>
                <v-flex md2>
                  <v-btn block>Call</v-btn>
                </v-flex>
                <v-flex md2>
                  <v-btn block>Raise {{ raise_amount }}</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
    <div v-if="game_state.started" class="table"></div>
    <div v-else class="lobby" @click="returnToGeneral">
      <v-container>
        <h2>Players in lobby:</h2>
        <v-list>
          <v-list-item
            @click="selectPlayer"
            dense
            v-for="player in game_state.players"
            :key="player.user_id"
          >
            <v-list-item-content>
              {{ player.name }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-container>
    </div>
  </div>
</template>

<script type="text/javascript">
/* import {io} from "socket.io-client"; */

export default {
  name: "Lobby",
  data() {
    return {
      game_state: {
        players: [
          {
            name: "admin",
            is_self: true,
            is_turn: true,
            is_connected: true,
            is_admin: true,
            is_dealer: true,
            is_bb: false,
            is_sb: false,
            is_out: false,
            has_fold: false,
            cards: [
              { card: { visible: false, value: "K", suit: "D" } },
              { card: { visible: false, value: "K", suit: "D" } }
            ],
            chips_bank: 100,
            chips_bet: 10,
            pot: 0
          },
          {
            name: "player2",
            is_self: false,
            is_turn: true,
            is_connected: true,
            is_admin: true,
            is_dealer: true,
            is_bb: false,
            is_sb: false,
            is_out: false,
            has_fold: false,
            cards: [
              { card: { visible: false, value: "K", suit: "D" } },
              { card: { visible: false, value: "K", suit: "D" } }
            ],
            chips_bank: 100,
            chips_bet: 10,
            pot: 0
          }
        ],
        board: [
          { card: { visible: false, value: "K", suit: "D" } },
          { card: { visible: false, value: "K", suit: "D" } },
          { card: { visible: false, value: "K", suit: "D" } },
          { card: { visible: false, value: "K", suit: "D" } },
          { card: { visible: false, value: "K", suit: "D" } }
        ],
        started: false,
        blind_rules: {
          steps: [
            { small: 5, big: 10 },
            { small: 10, big: 20 }
          ],
          raise_every_n_rounds: 3
        }
      },
      current_user: { id: this.$auth.user.sub, name: "random name" },
      admin: this.$auth.user.sub,
      selected_player_by_admin: null,
      new_sb: 10,
      new_bb: 20,
      raise_amount: 0
    };
  },
  /* async mounted() {
    const socket = io.connect("http://localhost:8081", {
      extraHeaders: {
        Authorization: `Bearer ${await this.$auth.getTokenSilently()}`
      }
    });
    socket
      .on("connect", () => {
        console.log("Auth erfolgreich!");
      })
      .on("unauthorized", msg => {
        console.log(`unauthorized: ${JSON.stringify(msg.data)}`);
        throw new Error(msg.data.type);
      });
  }, */
  methods: {
    startGame() {
      this.game_state.started = true;
    },
    saveSettings() {},
    selectPlayer(event) {
      if (this.current_user.id === this.admin) {
        const selected_player_name = `${event.target.textContent
          .split(" ")
          .join("")}`;
        this.selected_player_by_admin = this.game_state.players.filter(
          player => player.name === selected_player_name
        )[0];
      }
    },
    returnToGeneral(event) {
      if (event.target.classList.contains("lobby")) {
        this.selected_player_by_admin = null;
      }
    },
    addBlindStep() {
      this.game_state.blind_rules.steps.push({
        small: this.new_sb,
        big: this.new_bb
      });
      this.new_sb *= 2;
      this.new_bb *= 2;
    },
    removeBlindStep(step) {
      this.game_state.blind_rules.steps = this.game_state.blind_rules.steps.filter(
        item => item !== step
      );
    },
    decrement() {
      this.raise_amount--;
    },
    increment() {
      this.raise_amount++;
    }
  },
  computed: {
    color() {
      return "red";
    }
  }
};
</script>

<style lang="css" scoped>
h4 {
  margin-bottom: 1rem;
  text-align: center;
}
.game {
  color: white;
  min-height: calc(100vh - 60px);
}
.lobby {
  background-color: #2c3e50;
  height: 60vh;
}

.table {
  background-color: #2c3e50;
}
.settings {
  background-color: #42b983;
  text-align: left;
}

.ingame_settings {
  height: calc(20vh - 50px);
  background-color: #42b983;
  text-align: left;
}

.space-around {
  justify-content: space-around;
}
</style>
