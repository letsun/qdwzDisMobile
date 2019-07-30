/**
 * 工具类方法
 */

import md5 from '@/util/md5';
import statusCode from '@/util/statusCode';
import ip from '@/util/ipAddress';

const util = {}

/**
 * 获取地址栏的参数
 * @param  string name 		参数名
 * @return string      		参数值
 */
util.getUrlParam = (name) => {
	let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	let r = window.location.search.substr(1).match(reg); //匹配目标参数
	if (r != null) return decodeURI(unescape(r[2]));
	return null; //返回参数值
}

/**
 * 更新session数据
 * @return 	string 			信息
 */
util.updateSessionKeys = (context) => {
	let session = window.sessionStorage;
	let headerInfor = {};

	if (session.getItem('headerInfor') !== null) {
		headerInfor = JSON.parse(session.getItem('headerInfor'));
		let timestamp = +(new Date());

		headerInfor.timestamp = timestamp;
		headerInfor.keys = md5(headerInfor.openid + headerInfor.companyId + headerInfor.consumerId + headerInfor.sign + headerInfor.timestamp).toUpperCase();
		session.setItem('headerInfor', JSON.stringify(headerInfor));

		context.commit('updateKeys', headerInfor.keys);
		context.commit('updateTimestamp', headerInfor.timestamp);

		return '密钥更新成功';
	} else {
		return '没有用户信息！';
	}
}

/**
 * 重新跳转更新微信用户信息
 * @return null
 */
util.updateWechatInfor = () => {
	let url = `${ip}/shop/wx`;

	let companyId = util.getUrlParam('companyId'); 												// 企业ID
	let mallType = util.getUrlParam('mallType'); 												// 商品类型
	let distributorId = util.getUrlParam('distributorId') || 0; 								// 分销商ID
	let redirectUri = `${url}/${mallType}/${companyId}?disId=${distributorId}&pType=1`;

	window.location.href = redirectUri;
}

/**
 * 判断是否是微信客户端
 * @return boolean
 */
util.isWeixinPage = () => {
	let ua = navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == "micromessenger") {
		return true;
	} else {
		return false;
	}
}

/**
 * 如果不是微信客户端，则跳到提示页
 * @param  object router 路由
 * @return null
 */
util.goErrorPage = (router) => {
	if (!util.isWeixinPage()) {
		router.push({
			path: '/error',
			query: {
				errorMsg: '请使用微信客户端浏览'
			}
		});
	}
}

/**
 * 过滤字符前后空格
 * @param  string str 	需要过滤的字符串
 * @return string 	 	返回过滤后的字符串
 */
util.trim = (str) => {
	let reg = /^\s*|\s*$/g;
	return str.replace(reg, '');
}

/**
 * 检查接口，处理不同状态的行为
 * @param  object    	that     		组件对象
 * @param  object    	res      		接口响应的数据
 * @param  function  	callback 		超时回调
 * @param  {...type} 	args     		参数
 * @return null
 */
util.checkStatus = (that, res, callback, ...args) => {
	if (res.code === statusCode.TIME_INVALID) {
		// 更新时间
		util.updateSessionKeys(that.$store);

		callback(args[0], args[1], args[2], args[3]);
	} else if (res.code === statusCode.USER_DATA_INVALID || res.code === statusCode.USER_DATA_ABNORMAL) {

		// 重定向重新获取微信信息
		that.showModel = true;
		that.isConfirm = true;
		that.okType = util.updateWechatInfor;
		that.errorTip = res.msg;
	} else {

		// 其它情况只提示信息
		that.showModel = true;
		that.isConfirm = false;
		that.errorTipBtnText = '确定';
		that.errorTip = res.msg ? res.msg : res.content;
	}
}

// 导出
export default util;