<template lang="html">
  <div class="game">
    <v-container class="lobby" @click="returnToGeneral">
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
    </v-container>

    <v-container class="settings">
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
              <v-col cols="4">
                <v-card>
                  <v-card-title>Start values</v-card-title>
                  <v-card-text
                    ><v-text-field label="Chips:"></v-text-field>
                    <v-text-field label="Small blind:"></v-text-field>
                    <v-text-field label="Big blind:"></v-text-field>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card>
                  <v-card-title>Increase blinds</v-card-title>
                  <v-card-text
                    ><v-text-field label="After n rounds:"></v-text-field>
                    <v-text-field label="Amount:"></v-text-field>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card>
                  <v-card-title>User settings </v-card-title>
                  <v-card-text>
                    <v-text-field label="Username:"></v-text-field>
                  </v-card-text>
                </v-card>
                <v-container>
                  <v-row>
                    <v-col>
                      <v-btn @click="saveSettings">Save</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn
                        v-if="current_user.user_id == game_state.admin"
                        @click="startGame"
                        >Start game</v-btn
                      >
                    </v-col>
                  </v-row>
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
          raise_every_n_rounds: 0
        }
      },
      current_user: this.$auth.user.sub,
      admin: this.$auth.user.sub,
      selected_player_by_admin: null
    };
  },
  methods: {
    startGame() {
      this.game_state.started = true;
    },
    saveSettings() {},
    selectPlayer(event) {
      if (this.current_user === this.admin) {
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
