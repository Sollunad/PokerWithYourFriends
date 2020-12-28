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
    players: [
      {
        name: "admin",
        is_self: true,
        is_turn: true,
        is_connected: true,
        is_admin: true,
        is_dealer: true,
        is_bb: false,
        is_sb: false,
        is_out: false,
        has_fold: false,
        cards: [
          { card: { visible: false, value: "K", suit: "D" } },
          { card: { visible: false, value: "K", suit: "D" } }
        ],
        chips_bank: 100,
        chips_bet: 10,
        pot: 0
      },
      {
        name: "player2",
        is_self: false,
        is_turn: true,
        is_connected: true,
        is_admin: true,
        is_dealer: true,
        is_bb: false,
        is_sb: false,
        is_out: false,
        has_fold: false,
        cards: [
          { card: { visible: false, value: "K", suit: "D" } },
          { card: { visible: false, value: "K", suit: "D" } }
        ],
        chips_bank: 100,
        chips_bet: 10,
        pot: 0
      }
    ],
    board: [
      { card: { visible: false, value: "K", suit: "D" } },
      { card: { visible: false, value: "K", suit: "D" } },
      { card: { visible: false, value: "K", suit: "D" } },
      { card: { visible: false, value: "K", suit: "D" } },
      { card: { visible: false, value: "K", suit: "D" } }
    ],
    started: false,
    blind_rules: {
      steps: [
        { small: 5, big: 10 },
        { small: 10, big: 20 }
      ],
      raise_every_n_rounds: 3
    },
    current_user: null,
    admin_id: null
  },
  mutations: {
    startGame(state) {
      state.started = !state.started;
    },
    addBlindStep(state, { small, big }) {
      state.blind_rules.steps.push({ small, big });
    },
    removeBlindStep(state, { step }) {
      state.blind_rules.steps = state.blind_rules.steps.filter(
        item => item !== step
      );
    },
    loginUser(state, { user_id, name }) {
      state.current_user = { user_id, name };
    },
    logoutUser(state) {
      state.current_user = null;
    },
    createLobby(state, { admin_id }) {
      state.admin_id = admin_id;
    },
    closeLobby(state) {
      state.admin_id = null;
    }
  }
});

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount("#app");
