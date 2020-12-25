<template>
  <div id="app">
    <v-toolbar dense>
      <router-link to="/">Home</router-link>
      <v-spacer></v-spacer>
      <v-btn v-if="!$auth.isAuthenticated" @click="login">Log in</v-btn>
      <v-btn v-else @click="logout">Log out</v-btn>
    </v-toolbar>

    <router-view />
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
