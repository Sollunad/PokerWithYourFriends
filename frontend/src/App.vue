<template>
  <div id="app">
    <v-app>
      <v-app-bar height="50" dense app>
        <v-toolbar-title
          ><router-link to="/"
            >PlayPokerWithYourFriends</router-link
          ></v-toolbar-title
        >
        <v-spacer></v-spacer>

        <v-btn v-if="!$auth.isAuthenticated" @click="login">Log in</v-btn>
        <v-btn v-else @click="logout">Log out</v-btn>
      </v-app-bar>
      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </div>
</template>

<script type="text/javascript">
export default {
  name: "App",
  methods: {
    // Log the user in
    login() {
      this.$auth.loginWithRedirect();
    },
    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
};
</script>

<style>
:root {
  --clr-grey: #2c3e50;
  --clr-green: #42b983;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--clr-grey);
  background-color: var(--clr-green);
}
</style>
