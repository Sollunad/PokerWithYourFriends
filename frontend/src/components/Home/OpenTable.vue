<template lang="html">
  <div class="table">
    <div class="table-info">
      <h3>{{ name }}</h3>
      <p>Starting Chips: {{ startChips }}</p>
    </div>

    <div class="table-join">
      <form @submit.prevent="JoinTable">
        <label for="table-pwd"></label>
        <input />
        <button type="submit">Join Table</button>
      </form>
    </div>

    <!-- <single-table></single-table> -->
    <!-- <button v-if="$auth.isAuthenticated" @click="joinGame">Join Game</button> -->
  </div>
</template>

<script>
export default {
  name: "OpenTable",
  props: ["startChips", "password", "name"],
  methods: {
    JoinTable() {
      console.log("Hello");
    }
  }
};
</script>

<style lang="css" scoped>
.table {
  border: 2px solid #2c3e50;
  text-align: left;
  padding: 5px;
  display: grid;
  grid-template-columns: 1fr auto;
}

h3 {
  margin-top: 5px;
}
</style>
