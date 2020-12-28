<template lang="html">
  <div class="game">
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container
      v-show="game_state && !game_state.started"
      grid-list-md
      fluid
      class="settings"
    >
      <div>
        <div v-if="!selected_player_by_admin" class="admin-settings">
          <v-layout row wrap>
            <v-flex md8>
              <v-card>
                <v-card-title>Blind settings</v-card-title>
                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex v-if="isAdmin" xs8 md4>
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
                              <v-chip :close="isAdmin" @click:close="removeBlindStep(step)"
                                >{{ step.small }}/{{ step.big }}</v-chip
                              >
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-flex>
                      <v-flex md2>
                        <h5>Increase after n steps</h5>
                        <v-text-field
                          :disabled="!isAdmin"
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
    <!-- ++++++++++++++++++++++++++++++ End of Settings ++++++++++++++++++++++++++++++-->
    <!-- ++++++++++++++++++++++++++++++ Lobby / Table ++++++++++++++++++++++++++++++-->
    <v-container
      v-show="game_state && game_state.started"
      grid-list-md
      fluid
      class="ingame_settings"
    >
      <v-layout row wrap>
        <v-btn v-if="isAdmin && !game_state.round_running" @click="startRound" block>Start next round</v-btn>
        <v-btn v-if="isAdmin && game_state.round_finished" @click="finishRound" block>Finish round</v-btn>
        <v-container v-if="isTurn" grid-list-md>
          <v-slider v-model="raise_amount" :min="minRaise" :max="maxRaise" step="5">
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
            <v-flex v-if="canCheck" @click="btnCheck" md2>
              <v-btn block>Check</v-btn>
            </v-flex>
            <v-flex v-else-if="current_user.call_value < current_user.chips_bank" @click="btnCall" md2>
              <v-btn block>Call {{ current_user.call_value }}</v-btn>
            </v-flex>
            <v-flex v-else @click="btnCall" md2>
              <v-btn block color="red">Call All In</v-btn>
            </v-flex>
            <v-flex v-if="raise_amount === maxRaise" @click="btnRaise" md2>
              <v-btn block color="red">Raise All In</v-btn>
            </v-flex>
            <v-flex v-else @click="btnRaise" md2>
              <v-btn block>Raise {{ raise_amount }} => Bet {{ raise_amount + current_user.call_value }}</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-layout>
    </v-container>
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
    <!-- ++++++++++++++++++++++++++++++ End of Lobby/ Table ++++++++++++++++++++++++++++++-->
  </div>
</template>

<script type="text/javascript">
import {io} from "socket.io-client";

export default {
  name: "Lobby",
  data() {
    return {
      form_username: '',
    };
  },
  computed: {


  },
  methods: {
    saveUsername() {
      this.socket.emit('message', {action: 'setUsername', name: this.form_username });
    },
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
