import Vue from 'vue';
import VueCompositionApi, { createApp, h } from '@vue/composition-api';
import { QueryPlugin } from '../src/queryPlugin';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';

Vue.use(ElementUI);
Vue.use(VueCompositionApi)
Vue.use(QueryPlugin)

createApp({
  render() {
    return h(App)
  },
}).mount('#app')
