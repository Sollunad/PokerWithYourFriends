<template lang="html">
  <div class="tabs">
    <span
      :class="{ activeTab: selectedTab === tab }"
      v-for="(tab, index) in tabs"
      :key="index"
      @click="selectedTab = tab"
    >
      {{ tab }}</span
    >
    <div class="section"></div>
    <div v-show="selectedTab === 'Join Table'" class="section-center">
      <p v-if="!tables.length">There are currently no open tables</p>
      <open-table
        v-for="{ id, startChips, password, name } in tables"
        :key="id"
        :password="password"
        :startChips="startChips"
        :name="name"
      ></open-table>
    </div>

    <new-table
      @publish-table="addTable"
      v-show="selectedTab === 'Create new Table'"
    ></new-table>
  </div>
</template>

<script>
import NewTable from "./NewTable.vue";
import OpenTable from "./OpenTable.vue";
export default {
  name: "Tabs",
  components: {
    newTable: NewTable,
    openTable: OpenTable
  },
  data() {
    return {
      tabs: ["Join Table", "Create new Table"],
      selectedTab: "Join Table",
      tables: []
    };
  },
  methods: {
    addTable(table) {
      this.tables.push(table);
    }
  }
};
</script>

<style lang="css" scoped>
.tabs {
  margin-top: 2rem;
}

.section {
  margin: 2rem 0;
}

.section-center {
  width: 90vw;
  max-width: 1170px;
  margin: 0 auto;
}
span {
  cursor: pointer;
  margin: 0 5px;
}
.activeTab {
  color: red;
  text-decoration: underline;
}
</style>
