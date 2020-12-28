<template>
  <div class="lobby">
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container grid-list-md fluid class="lobby_settings">
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
                              v-for="(step, index) in blindRules.steps"
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
                        <h5>Increase after n rounds</h5>
                        <v-text-field
                          :disabled="!isAdmin"
                          v-model="blindRules.raise_every_n_rounds"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                  <v-btn
                          v-if="isAdmin"
                          @click="saveBlinds"
                  >Save Blind Settings</v-btn>
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex md4>
              <v-card>
                <v-card-title>User settings </v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="localUsername"
                    label="Username:"
                  ></v-text-field>
                  <v-btn @click="saveUsername">Save Username</v-btn>
                </v-card-text>
              </v-card>
              <v-container>
                <v-btn v-if="isAdmin" @click="startGame">Start game</v-btn>
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
                v-model="edited_chips"
                label="Chips:"
              ></v-text-field>
              <v-btn @click="saveChips">Save chips</v-btn>
            </v-card-text>
          </v-card>
        </div>
      <div v-if="!isAdmin">
        Wait for the admin to start the game
      </div>
    </v-container>
    <!-- ++++++++++++++++++++++ End of Settings ++++++++++++++++++++-->
    <!-- +++++++++++++++++++++++ Player List ++++++++++++++++++++++++-->
    <v-container
      fluid
      grid-list-md
      class="lobby_players"
    >
      <v-layout row wrap>
        <v-flex xs12>
          <h2>Players in lobby:</h2>
          <v-list>
            <v-list-item
              @click="selectPlayer(player)"
              dense
              v-for="player in $store.state.game_state.players"
              :key="player.user_id"
            >
              <v-list-item-content>
                {{ player.name }} ({{ player.chips_bank }})
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- +++++++++++++++++++++++ End of player list ++++++++++++++++++++++++-->
  </div>
</template>

<script type="text/javascript">
export default {
  name: "Lobby",
  data() {
    return {
      selected_player_by_admin: null,
      new_sb: 10,
      new_bb: 20,
      edited_chips: 0,
    };
  },
  methods: {
    startGame() {
      this.$store.state.socket.emit('message', {action: 'startGame'});
    },
    addBlindStep() {
      this.$store.commit("addBlindStep", {
        small: this.new_sb,
        big: this.new_bb
      });
      this.new_sb *= 2;
      this.new_bb *= 2;
    },
    removeBlindStep(step) {
      this.$store.commit("removeBlindStep", { step: step });
    },
    saveBlinds() {
      this.$store.state.socket.emit('message', {action: 'adjustBlinds', blinds: this.$store.state.game_state.blind_rules });
    },
    saveUsername() {
      this.$store.state.socket.emit('message', {action: 'setUsername', name: this.$store.state.form_username });
    },
    selectPlayer(player) {
      if (this.isAdmin) {
        this.selected_player_by_admin = player;
        this.edited_chips = player.chips_bank;
      }
    },
    saveChips() {
      this.$store.state.socket.emit('message', {
        action: 'saveChips',
        user_name: this.selected_player_by_admin.name,
        chips: this.edited_chips,
      });
      this.selected_player_by_admin = null;
    }
  },
  computed: {
    blindRules() {
      return this.$store.state.game_state.blind_rules;
    },
    isAdmin() {
      return this.$store.getters.current_user.is_admin;
    },
    localUsername: {
      get() {
        return this.$store.state.form_username;
      },
      set(value) {
        this.$store.commit('setFormUsername', { name: value });
      }
    }
  }
};
</script>

<style lang="css" scoped>
.lobby {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  text-align: left;
  color: white;
}
.lobby_settings {
  background-color: var(--clr-green);
}

.lobby_players {
  background-color: var(--clr-grey);
}
</style>
