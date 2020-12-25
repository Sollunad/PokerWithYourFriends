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
    <div v-show="selectedTab === 'Join Table'">
      <p v-if="!tables.length">There are currently no open tables</p>
      <open-table
        v-for="{ id, startChips, password } in tables"
        :key="id"
        :password="password"
        :startChips="startChips"
      ></open-table>
    </div>

    <new-table v-show="selectedTab === 'Create new Table'"></new-table>
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
  props: ["tables"],
  data() {
    return {
      tabs: ["Join Table", "Create new Table"],
      selectedTab: "Join Table"
    };
  }
};
</script>

<style lang="css" scoped>
.activeTab {
  color: red;
  text-decoration: underline;
}
</style>
