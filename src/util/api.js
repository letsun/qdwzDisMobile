// let ip = 'http://192.168.1.8:8085/qdwz';
import ipAddress from '@/util/ipAddress';

let ip = `${ipAddress}`;

// 当前环境名称
console.log(process.env.NODE_ENV);

const api = {
	register: {
		register: `${ip}/qdwz/dis/register`,
		getVerCode: `${ip}/qdwz/getVerCode`
	},
	personCenter: {
		getDistributor: `${ip}/qdwz/dis/distributor/getDistributor`
	},
	myTeam: {
		getChildDisList: `${ip}/qdwz/dis/distributor/getChildDisList`, 			// 我的下级分销商列表
		getChildDisNumber: `${ip}/qdwz/dis/distributor/getChildDisNumber`, 		// 我的下级分销商数量		
		updateDisStatus: `${ip}/qdwz/dis/distributor/updateDisStatus`,							// 禁用和启用下级分销商
		getMyParentDist: `${ip}/qdwz/dis/distributor/getMyParentDist`,
        getDisAddress: `${ip}/qdwz/dis/distributor/getDisAddress`,    // 获取地址
        updateDisAddress: `${ip}/qdwz/dis/distributor/updateDisAddress`,     // 提交地址
	},
	order: {
		getOrderList: `${ip}/qdwz/dis/order/getOrderList`, 			// 我的下级分销商列表
		getOrderById: `${ip}/qdwz/order/getOrderById`, 			// 我的下级分销商列表
	},
	rebate: {
		getRebateAmount: `${ip}/qdwz/dis/rebate/getRebateAmount`,
		getDirectRebateRecord: `${ip}/qdwz/dis/rebate/getDirectRebateRecord`,
		getInDirectRebateRecord: `${ip}/qdwz/dis/rebate/getInDirectRebateRecord`
	},
	withdraw: {
		findAll: `${ip}/qdwz/dis/withdraw/findAll`,
		withdraw: `${ip}/qdwz/dis/withdraw/application`
	}
};

export default api;