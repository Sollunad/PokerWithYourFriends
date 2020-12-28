<template lang="html">
  <div class="game">
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container
      v-show="game_state && !game_state.started"
      grid-list-md
      fluid
      class="settings"
    >
      <div v-if="current_user.user_id == game_state.admin">
        <div v-if="!selected_player_by_admin" class="admin-settings">
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
                              <v-chip close @click:close="removeBlindStep(step)"
                                >{{ step.small }}/{{ step.big }}</v-chip
                              >
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-flex>
                      <v-flex md2>
                        <h5>Increase after n steps</h5>
                        <v-text-field
                          v-model="game_state.blind_rules.raise_every_n_rounds"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-btn
                            v-if="isAdmin"
                            @click="saveBlinds"
                    >Save Blind Settings</v-btn>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex md4>
              <v-card>
                <v-card-title>User settings </v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="form_username"
                    label="Username:"
                  ></v-text-field>
                  <v-btn @click="saveUsername">Save Username</v-btn>
                </v-card-text>
              </v-card>
              <v-container>
                <v-btn
                  v-if="isAdmin"
                  @click="startGame"
                  >Start game</v-btn>
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
      <div v-if="!isAdmin">
        Wait for the admin to start the game
      </div>
    </v-container>

    <v-container
      v-show="game_state && game_state.started"
      grid-list-md
      fluid
      class="ingame_settings"
    >
      <v-layout row wrap>
        <v-flex md6> </v-flex>
        <v-flex md6>
          <v-container grid-list-md>
            <v-slider v-model="raise_amount" :min="0" :max="300">
              <template v-slot:prepend>
                <v-icon @click="decrement">
                  mdi-minus
                </v-icon>
              </template>

              <template v-slot:append>
                <v-icon @click="increment">
                  mdi-plus
                </v-icon>
              </template>
            </v-slider>
            <v-layout row wrap justify-space-around>
              <v-flex md2>
                <v-btn @click="btnFold" block>Fold</v-btn>
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
    <!-- ++++++++++++++++++++++++++++++ End of Settings ++++++++++++++++++++++++++++++-->
    <!-- ++++++++++++++++++++++++++++++ Lobby/ Table ++++++++++++++++++++++++++++++-->
    <v-container
      v-show="game_state.started"
      fill-height
      fluid
      grid-list-md
      class="ingame"
    >
      <v-row>
        <div class="table my-0 mx-auto ">
          <div class="table-left"></div>
          <div class="table-right"></div></div
      ></v-row>
    </v-container>
    <v-container
      v-show="!game_state.started"
      fluid
      grid-list-md
      class="lobby"
      @click="returnToGeneral"
    >
      <v-layout row wrap>
        <v-flex xs12>
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
        </v-flex>
      </v-layout>
    </v-container>
    <!-- ++++++++++++++++++++++++++++++ End of Lobby/ Table ++++++++++++++++++++++++++++++-->
  </div>
</template>

<script type="text/javascript">
import {io} from "socket.io-client";

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
      admin: this.$auth.user.sub,
      selected_player_by_admin: null,
      form_username: '',
      new_sb: 10,
      new_bb: 20,
      raise_amount: 0,
      socket: undefined,
    };
  },
  async mounted() {
    this.socket = io.connect("http://localhost:8081", {
      extraHeaders: {
        Authorization: `Bearer ${await this.$auth.getTokenSilently()}`,
        game_code: this.game_code,
      }
    });
    this.socket.on('message', (data) => {
      //this.game_state = data.game;
      console.log(data.game);
      if (this.form_username === '') this.form_username = this.current_user.name;
    })
  },
  computed: {
    game_code() {
      return this.$route.query.code;
    },
    current_user() {
      return this.game_state.players.find(p => p.is_self);
    },
    isAdmin() {
      return this.current_user.is_admin;
    }
  },
  methods: {
    startGame() {
      this.socket.emit('message', {action: 'startGame'});
    },
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
      this.game_state.blind_rules.steps.sort((a, b) => a.small - b.small);
      this.new_sb *= 2;
      this.new_bb *= 2;
    },
    removeBlindStep(step) {
      this.game_state.blind_rules.steps = this.game_state.blind_rules.steps.filter(
        item => item !== step
      );
    },
    saveBlinds() {
      this.socket.emit('message', {action: 'adjustBlinds', blinds: this.game_state.blind_rules });
    },
    saveUsername() {
      this.socket.emit('message', {action: 'setUsername', name: this.form_username });
    },
    decrement() {
      this.raise_amount--;
    },
    increment() {
      this.raise_amount++;
    },
    btnFold() {
      this.socket.emit('message', {action: 'fold'});
    }
  },
  beforeDestroy() {
      this.socket.disconnect();
  }
};
</script>

<style lang="css" scoped>
.game {
  height: 100%;
  color: white;
  display: grid;
  grid-template-rows: auto 1fr;
  text-align: left;
}

.lobby,
.ingame {
  background-color: #2c3e50;
  width: 100%;
}

.settings,
.ingame_settings {
  background-color: #42b983;
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
