<template lang="html">
  <div class="full-height">
    <lobby v-if="!gameHasStarted"></lobby>
    <ingame v-else></ingame>
  </div>
</template>

<script type="text/javascript">
/* import {io} from "socket.io-client"; */
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
  }
  /* async mounted() {
    const socket = io.connect("http://localhost:8081", {
      extraHeaders: {
        Authorization: `Bearer ${await this.$auth.getTokenSilently()}`
      }
    });
    socket
      .on("connect", () => {
        console.log("Auth erfolgreich!");
      })
      .on("unauthorized", msg => {
        console.log(`unauthorized: ${JSON.stringify(msg.data)}`);
        throw new Error(msg.data.type);
      });
  }, */
};
</script>

<style lang="css" scoped>
.full-height {
  height: 100%;
}
</style>
