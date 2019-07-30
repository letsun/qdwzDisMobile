import Vue from 'vue'
import Vuex from 'vuex'

import setUserSessionInfor from '@/util/setUserSessionInfor';
import setHeaderSessionInfor from '@/util/setHeaderSessionInfor';

Vue.use(Vuex);

let store = new Vuex.Store({
	state: {
		direction: '',
		keepAlList: '',
		tabName: '',
		thisloginDistributorId: 0, 				// 是否注册
		companyId: 0, 							// 企业ID
		consumerId: 0, 							// 消费者ID
		openid: '', 							// 微信openid
		timestamp: '',							// 时间戳
		keys: '',								// md5密钥
		nickname: '', 							// 用户昵称
		headimgurl: '',							// 用户头像
		sign: '',								// 我们约定好的密钥
		mallType: 0, 							// 商品类型
	},
	getters: {
		getHeaders(state) {
			let header = {
				mt: state.mallType,
				oi: state.openid,
				cpi: state.companyId,
				csi: state.consumerId,
				times: state.timestamp,
				s: state.keys
			}

			return header;
		}
	},
	mutations: {
		updateDirection(state, newValue) {
			state.direction = newValue;
		},
		updateKeepAlList(state, newValue) {
			state.keepAlList = newValue;
		},
		updateTabName(state, newValue) {
			state.tabName = newValue;
		},
		updateMallType(state, newValue) {
			state.mallType = newValue;
		},
		updateThisloginDistributorId(state, newValue) {
			state.thisloginDistributorId = newValue;
		},
		updateCompanyId(state, newValue) {
			state.companyId = newValue;
		},
		updateConsumerId(state, newValue) {
			state.consumerId = newValue;
		},
		updateOpenid(state, newValue) {
			state.openid = newValue;
		},
		updateNickname(state, newValue) {
			state.nickname = newValue;
		},
		updateHeadimgurl(state, newValue) {
			state.headimgurl = newValue;
		},
		updateSign(state, newValue) {
			state.sign = newValue;
		},
		updateTimestamp(state, newValue) {
			state.timestamp = newValue;
		},
		updateKeys(state, newValue) {
			state.keys = newValue;
		}
	},
	actions: {
		async getInfor (context, isClearSession = true) {

			// 重置session
			if (isClearSession) {
				let session = window.sessionStorage;
				session.clear();
			}
			
			// 设置头部全局信息
			let headerSessionInfor = setHeaderSessionInfor(context);

		}
	}
});

export default store;