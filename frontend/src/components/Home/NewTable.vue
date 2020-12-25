<template lang="html">
  <div>
    <p>Create a new Game:</p>
    <form @submit.prevent="publishTable" class="createForm">
      <div class="createForm-items">
        <label for="start-chips"> Starting chips: </label>
        <input v-model="newTable.startChips" id="start-chips" />
      </div>

      <div class="createForm-items">
        <label for="lobby-pwd">Lobby Password: </label>
        <input v-model="newTable.password" id="lobby-pwd" />
      </div>

      <input class="createForm-btn" type="submit" value="Publish Table" />
    </form>
  </div>
</template>

<script>
export default {
  name: "newTable",
  data() {
    return {
      newTable: { id: 0, startChips: null, password: null }
    };
  },
  methods: {
    publishTable() {
      this.$root.$emit("publish-table", this.newTable);
      this.newTable = { startChips: null, password: null };
    }
  }
};
</script>

<style lang="css" scoped>
.createForm {
  max-width: 300px;
  margin: 0 auto;
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr;
}

.createForm-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.createForm-btn {
  margin-top: 2rem;
}
</style>
