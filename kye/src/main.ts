import * as Vue from "vue";
import * as Pinia from "pinia";
import App from "./App.vue";

Vue.createApp(App).use(Pinia.createPinia()).mount("#app");
