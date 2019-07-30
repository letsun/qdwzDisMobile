// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import store from './store/store';
import currency from './util/currency';
import format from './util/format';

Vue.config.productionTip = false;

Vue.prototype.$http = axios;

Vue.filter('currency', currency);
Vue.filter('format', format);

const contentType = {
	'Content-type': 'application/x-www-form-urlencoded'
}

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	components: {
		App
	},
	template: '<App/>',
	computed: {
		getHeaders() {
            return this.$store.getters.getHeaders;
        }
	},
	mounted() {
		
		axios.defaults.headers = Object.assign({}, contentType, this.getHeaders || {});

		this.$http.interceptors.request.use((xhr) => {
			console.log('request init...');

			// xhr.withCredentials = true;
			return xhr;
		});

		this.$http.interceptors.response.use((response) => {
			console.log('response init...');
			return response;
		});
	}
})