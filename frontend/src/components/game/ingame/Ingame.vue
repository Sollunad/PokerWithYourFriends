<template>
  <div class="ingame">
    <!-- ++++++++++++++++++ Table ++++++++++++++++++-->
    <v-container fill-height fluid grid-list-md class="ingame_table">
      <v-row>
        <div class="table my-0 mx-auto ">
          <div class="table-left"></div>
          <div class="table-right"></div></div
      ></v-row>
    </v-container>
    <!-- ++++++++++++++++++ End of Table ++++++++++++++++++-->
    <!-- ++++++++++++++++++++++++++++++ Settings ++++++++++++++++++++++++++++++-->
    <v-container grid-list-md fluid class="ingame_settings">
      <v-layout row wrap>
        <v-flex md6> </v-flex>
        <v-flex md6>
          <v-container grid-list-md>
            <v-slider v-model="raise_amount" :min="0" :max="300">
              <template v-slot:prepend>
                <v-icon @click="decrement_raise">
                  mdi-minus
                </v-icon>
              </template>

              <template v-slot:append>
                <v-icon @click="increment_raise">
                  mdi-plus
                </v-icon>
              </template>
            </v-slider>
            <v-layout row wrap justify-space-around>
              <v-flex md2>
                <v-btn block>Fold</v-btn>
              </v-flex>
              <v-flex md2>
                <v-btn block>Check</v-btn>
              </v-flex>
              <v-flex md2>
                <v-btn block>Call</v-btn>
              </v-flex>
              <v-flex md2>
                <v-btn block>Raise {{ raise_amount }}</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- ++++++++++++++++++ End of Settings ++++++++++++++++++-->
  </div>
</template>

<script type="text/javascript">
export default {
  name: "Ingame",
  data() {
    return {
      raise_amount: 0
    };
  },
  methods: {
    decrement_raise() {
      this.raise_amount--;
    },
    increment_raise() {
      this.raise_amount++;
    }
  },
  beforeCreate() {
    this.$store.commit("loginUser", {
      user_id: this.$auth.user.sub,
      name: "random_name"
    });
  },
  destroyed() {
    this.$store.commit("startGame");
  }
};
</script>

<style lang="css" scoped>
.ingame {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  text-align: left;
  color: white;
}
.ingame_setting {
  background-color: var(--clr-green);
}

.ingame_table {
  background-color: var(--clr-grey);
}
.table {
  height: 200px;
  width: 800px;
  background-color: white;
  position: relative;
}
.table-left,
.table-right {
  height: 200px;
  width: 200px;
  border-radius: 50%;
  position: absolute;
  background-color: white;
  transform: translateX(-50%);
}
.table-right {
  right: 0;
  transform: translateX(50%);
}
</style>
