<template lang="html">
  <div>
    <p>Create a new Game:</p>
    <form @submit.prevent="publishTable" class="createForm">
      <div class="createForm-item">
        <label for="table-name">Table Name: </label>
        <input v-model="newTable.name" id="table-name" />
      </div>

      <div class="createForm-item">
        <label for="table-pwd">Table Password: </label>
        <input v-model="newTable.password" id="table-pwd" />
      </div>

      <div class="createForm-item">
        <label for="start-chips"> Starting chips: </label>
        <input v-model="newTable.startChips" id="start-chips" />
      </div>

      <button class="createForm-btn" type="submit">
        Publish Table
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "newTable",
  data() {
    return {
      newTable: {
        id: 0,
        name: `Table of ${this.$auth._data.user.nickname}`,
        startChips: 5000,
        password: null
      }
    };
  },
  methods: {
    publishTable() {
      this.$emit("publish-table", this.newTable);
      this.newTable = {
        id: 0,
        name: `Table of ${this.$auth._data.user.nickname}`,
        startChips: 5000,
        password: null
      };
      this.$parent.selectedTab = "Join Table";
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

.createForm-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.createForm-btn {
  margin-top: 2rem;
}
</style>
