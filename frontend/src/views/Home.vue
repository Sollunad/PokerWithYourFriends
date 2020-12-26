<template>
  <div v-if="$auth.isAuthenticated" class="home">
    <v-container>
      <v-btn @click="createLobby" elevation="5" outlined medium>
        Create new lobby</v-btn
      >
    </v-container>
    <v-container>
      <p>Join Game by passing the right code:</p>
      <v-form @submit.prevent="joinGame">
        <v-text-field :rules="rules"></v-text-field>

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
      rules: [value => !!value || "Required."]
    };
  },
  methods: {
    async createLobby() {
      const response = await fetch(this, "games", "post", {});
      console.log(response);
      await this.$router.push(`/lobby?code=${response.game_code}`);
    },
    async joinGame(game_code) {
      const response = await fetch(this, "games/join", "post", { game_code });
      console.log(response);
    }
  }
};
</script>
