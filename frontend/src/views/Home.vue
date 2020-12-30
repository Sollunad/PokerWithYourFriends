<template>
  <div v-if="$auth.isAuthenticated">
    <v-container>
      <v-btn @click="createLobby" elevation="5" outlined medium>
        Create new lobby</v-btn
      >
    </v-container>
    <v-container>
      <p>Join Game by passing the right code</p>
      <v-form @submit.prevent="joinGame">
        <v-text-field v-model="game_code" :rules="rules" solo></v-text-field>

        <v-btn type="submit" elevation="5" outlined medium> Join Lobby</v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import fetch from "../services/connector";

export default {
  name: "Home",
  data() {
    return {
      rules: [value => !!value || "Required."],
      game_code: ""
    };
  },
  methods: {
    async createLobby() {
      const response = await fetch(this, "games", "post", {});
      await this.$router.push(`/game?code=${response.game_code}`);
    },
    async joinGame() {
      await this.$router.push(`/game?code=${this.game_code}`);
    }
  }
};
</script>
