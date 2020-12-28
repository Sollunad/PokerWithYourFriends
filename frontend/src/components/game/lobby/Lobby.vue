<template>
  <div class="lobby">
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container grid-list-md fluid class="lobby_settings">
      <div v-if="isAdmin">
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
                              v-for="(step, index) in $store.state.blind_rules
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
                          v-model="
                            $store.state.blind_rules.raise_every_n_rounds
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
                    v-model="$store.state.current_user.name"
                    label="Username:"
                  ></v-text-field>
                </v-card-text>
              </v-card>
              <v-container>
                <v-btn @click="startGame">Start game</v-btn>
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
    <!-- ++++++++++++++++++++++ End of Settings ++++++++++++++++++++-->
    <!-- +++++++++++++++++++++++ Player List ++++++++++++++++++++++++-->
    <v-container
      fluid
      grid-list-md
      class="lobby_players"
      @click="returnToGeneral"
    >
      <v-layout row wrap>
        <v-flex xs12>
          <h2>Players in lobby:</h2>
          <v-list>
            <v-list-item
              @click="selectPlayer"
              dense
              v-for="player in $store.state.players"
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
      new_bb: 20
    };
  },
  methods: {
    startGame() {
      this.$store.commit("startGame");
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
    selectPlayer(event) {
      if (this.isAdmin()) {
        const selected_player_name = `${event.target.textContent
          .split(" ")
          .join("")}`;
        this.selected_player_by_admin = this.$store.state.players.filter(
          player => player.name === selected_player_name
        )[0];
      }
    },
    returnToGeneral(event) {
      if (event.target.classList.contains(".lobby_players")) {
        this.selected_player_by_admin = null;
      }
    }
  },
  beforeCreate() {
    this.$store.commit("loginUser", {
      user_id: this.$auth.user.sub,
      name: "random_name"
    });
    this.$store.commit("createLobby", {
      admin_id: this.$auth.user.sub
    });
  },
  computed: {
    isAdmin() {
      return (
        this.$store.state.current_user.user_id == this.$store.state.admin_id
      );
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
