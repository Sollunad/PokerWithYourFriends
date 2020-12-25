<template>
  <div class="home">
    <div v-if="!$auth.loading">
      <!-- show login when not authenticated -->
      <button v-if="!$auth.isAuthenticated" @click="login">Log in</button>
      <!-- show logout when authenticated -->
      <button v-if="$auth.isAuthenticated" @click="logout">Log out</button>

      <tabs></tabs>
      <!-- :tables="tables" -->
    </div>
  </div>
</template>

<script>
import Tabs from "../components/Home/Tabs.vue";
export default {
  name: "Home",
  components: {
    tabs: Tabs
  },
  /* data() {
    return {
      tables: []
    };
  }, */
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
