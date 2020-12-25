<template>
  <div v-if="$auth.isAuthenticated" class="home">
    <v-container>
      <v-btn @click="createNewGame" elevation="5" outlined medium>
        Create new lobby</v-btn
      >
      <v-btn elevation="5" outlined medium> Join Lobby</v-btn>
    </v-container>
  </div>
</template>

<script>
import fetch from "../services/connector";

export default {
  name: "Home",
  methods: {
    async createNewGame() {
      const response = await fetch(this, "games", "post", {});
      console.log(response);
      await this.$router.push(`/lobby?code=${response.game_code}`);
    }
  }
};
</script>
