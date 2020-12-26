<template lang="html">
  <div class="game">
    <v-container class="table">
      <v-container v-if="game.started">
        Game has started
      </v-container>
      <v-container v-else>
        <h2>Players in game:</h2>
        <v-list>
          <p v-for="player in game.players" :key="player.user_id">
            {{ player.name }}
          </p>
        </v-list>
      </v-container>
    </v-container>

    <v-container class="settings">
      <div v-if="current_user.user_id == game.admin">
        <div v-if="game.started">
          <p>Card 1 / Card 2</p>
          <v-btn>Fold</v-btn>
          <v-btn>Check</v-btn>
          <v-btn>Call</v-btn>
          <v-btn>Raise</v-btn>
        </div>
        <div class="admin-settings" v-else>
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
                      v-if="current_user.user_id == game.admin"
                      @click="startGame"
                      >Start game</v-btn
                    >
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </div>
      </div>
      <div v-if="current_user.user_id != game.admin">
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
      game: {
        _id: 123,
        code: 123,
        started: false,
        players: [{ user_id: 123, name: "admin", chips: 5000 }],
        admin: 123,
        next_dealer: "p2",
        rounds_played: 0
      },
      current_user: { user_id: 123, name: "admin", chips: 5000 }
    };
  },
  methods: {
    startGame() {
      this.game.started = true;
    },
    saveSettings() {}
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
}
.table {
  background-color: #2c3e50;
  height: 60vh;
}
.settings {
  height: calc(40vh - 50px);
  background-color: #42b983;
  text-align: left;
}
</style>
