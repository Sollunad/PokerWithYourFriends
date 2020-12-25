<template lang="html">
  <div class="lobbies">
    <p>{{ startChips }} {{ password }}</p>

    <!-- <single-lobby></single-lobby> -->
    <!-- <button v-if="$auth.isAuthenticated" @click="joinGame">Join Game</button> -->
  </div>
</template>

<script>
export default {
  name: "OpenTable",
  props: ["startChips", "password"]
};
</script>

<style lang="css" scoped></style>
