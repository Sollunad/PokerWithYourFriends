<template>
  <div v-if="$auth.isAuthenticated" class="home">
    <v-container>
      <v-btn elevation="5" outlined medium>
        <router-link :to="{ name: '/lobby', params: {} }"
          >Create new lobby</router-link
        ></v-btn
      >
      <v-btn elevation="5" outlined medium> Join Lobby</v-btn>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "Home"
};
</script>
