import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";
import { domain, clientId, audience } from "../config.json";
import { Auth0Plugin } from "./auth";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  }
});
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    game_state: undefined,
    socket: undefined,
    form_username: '',
  },
  getters: {
    current_user(state) {
      if (!state.game_state) return undefined;
      return state.game_state.players.find(p => p.is_self) || { not_joined: true };
    }
  },
  mutations: {
    setGameState(state, { game_state }) {
      state.game_state = game_state;
    },
    addBlindStep(state, { small, big }) {
      state.game_state.blind_rules.steps.push({ small, big });
      state.game_state.blind_rules.steps.sort((a, b) => a.small - b.small);
    },
    removeBlindStep(state, { step }) {
      state.game_state.blind_rules.steps = state.game_state.blind_rules.steps.filter(
        item => item !== step
      );
    },
    setSocket(state, { socket }) {
      state.socket = socket;
    },
    setFormUsername(state, { name }) {
      state.form_username = name;
    }
  },
  actions: {
    updateFormUsernameFromGameState(store) {
      if (!store.getters.current_user) return;
      const gameStateUsername = store.getters.current_user.name;
      if (store.state.form_username === '' && gameStateUsername) store.commit('setFormUsername', { name: gameStateUsername });
    }
  },
});

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount("#app");
