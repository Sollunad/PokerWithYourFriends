<template lang="html">
  <div class="full-height">
    <lobby v-if="!gameHasStarted"></lobby>
    <ingame v-else></ingame>
  </div>
</template>

<script type="text/javascript">
import { io } from "socket.io-client";
import Lobby from "../components/game/lobby/Lobby.vue";
import Ingame from "../components/game/ingame/Ingame.vue";
export default {
  name: "Game",
  components: {
    Ingame,
    Lobby
  },
  computed: {
    gameHasStarted() {
      return this.$store.state.started;
    }
  },
  beforeCreate() {
    this.$store.commit("loginUser", {
      user_id: this.$auth.user.sub,
      name: "random_name"
    });
  },
  async mounted() {
    this.socket = io.connect("http://localhost:8081", {
      extraHeaders: {
        Authorization: `Bearer ${await this.$auth.getTokenSilently()}`,
        game_code: this.game_code
      }
    });
    this.socket.on("message", data => {
      //this.game_state = data.game;
      console.log(data.game);
      if (this.form_username === "")
        this.form_username = this.current_user.name;
    });
  }
};
</script>

<style lang="css" scoped>
.full-height {
  height: 100%;
}
</style>
