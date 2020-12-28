import Vue from "vue";
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

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
