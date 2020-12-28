<template lang="html">
  <div class="full-height">
    <lobby v-if="showLobby"></lobby>
    <ingame v-if="showIngame"></ingame>
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
    gameHasLoaded() {
      return !!this.$store.state.game_state;
    },
    showLobby() {
      return this.gameHasLoaded && !this.$store.state.game_state.started;
    },
    showIngame() {
      return this.gameHasLoaded && this.$store.state.game_state.started;
    },
    game_code() {
      return this.$route.query.code;
    },
  },
  async mounted() {
    const socket = io.connect("http://localhost:8081", {
      extraHeaders: {
        Authorization: `Bearer ${await this.$auth.getTokenSilently()}`,
        game_code: this.game_code,
      }
    });
    socket.on('message', (data) => {
      this.$store.commit('setGameState', { game_state: data.game });
      console.log(this.$store.state.game_state);
      this.$store.dispatch('updateFormUsernameFromGameState');
    });
    this.$store.commit('setSocket', { socket: socket });
  },
  beforeDestroy() {
    this.$store.state.socket.disconnect();
    this.$store.commit('setSocket', { socket: undefined });
  }
};
</script>

<style lang="css" scoped>
.full-height {
  height: 100%;
}
</style>
