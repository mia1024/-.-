import { createApp } from "vue";
import App from "./App.vue";
import * as Pinia from "pinia";

createApp(App).use(Pinia.createPinia()).mount("#app");
import "@/lib/common/compression"
// compress('')
