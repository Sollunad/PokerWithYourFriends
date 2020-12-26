<template lang="html">
  <div class="game">
    <div class="lobby" @click="returnToGeneral">
      <v-container v-if="game_state.started">
        Game has started
      </v-container>
      <v-container v-else>
        <h2>Players in lobby:</h2>
        <v-list>
          <v-list-item
            @click="selectPlayer"
            v-model="selected_player_by_admin"
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

    <div class="settings">
      <v-container>
        <div v-if="current_user.user_id == game_state.admin">
          <div v-if="game_state.started">
            <p>Card 1 / Card 2</p>
            <v-btn>Fold</v-btn>
            <v-btn>Check</v-btn>
            <v-btn>Call</v-btn>
            <v-btn>Raise</v-btn>
          </div>
          <div v-else class="admin-settings">
            <div v-if="!selected_player_by_admin">
              <v-row justify="space-around">
                <v-col cols="3">
                  <v-card>
                    <v-card-title>Blind settings</v-card-title>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout justify-start align-start>
                          <v-flex>
                            <v-text-field
                              dense
                              class="blind-field"
                              v-model="new_sb"
                              label="Small:"
                            ></v-text-field>
                          </v-flex>
                          <v-flex>
                            <v-text-field
                              dense
                              class="blind-field"
                              v-model="new_bb"
                              label="Big:"
                            ></v-text-field>
                          </v-flex>
                          <v-flex justify-start>
                            <v-btn dense @click="addBlindStep"
                              >Add blind step</v-btn
                            >
                          </v-flex>
                        </v-layout>
                      </v-container>
                      <v-container>
                        <p>Blind steps:</p>
                        <v-chip
                          v-for="(step, index) in game_state.blind_rules.steps"
                          :key="index"
                          close
                          @click:close="removeBlindStep(step)"
                          >{{ step.small }}/{{ step.big }}</v-chip
                        >
                      </v-container>

                      <v-text-field
                        v-model="game_state.blind_rules.raise_every_n_rounds"
                        label="Increase after n rounds:"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4">
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
                </v-col>
              </v-row>
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
  </div>
</template>

<script type="text/javascript">
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
      new_bb: 20
    };
  },
  methods: {
    startGame() {
      this.game_state.started = true;
    },
    saveSettings() {},
    selectPlayer(event) {
      console.log(this.current_user);
      if (this.current_user.id === this.admin) {
        const selected_player_name = `${event.target.textContent
          .split(" ")
          .join("")}`;
        this.selected_player_by_admin = this.game_state.players.filter(
          player => player.name === selected_player_name
        )[0];
        console.log(this.selected_player_by_admin.name);
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
    }
  },
  mounted() {}
};
</script>

<style lang="css" scoped>
h4 {
  margin-bottom: 1rem;
  text-align: center;
}
.game {
  color: white;
}
.lobby {
  background-color: #2c3e50;
  height: 60vh;
}
.settings {
  height: calc(40vh - 50px);
  background-color: #42b983;
  text-align: left;
}
</style>
