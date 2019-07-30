import Vue from 'vue'
import Router from 'vue-router'

import Register from '@/views/register/register'

import PersonCenter from '@/views/personCenter/personCenter'

import AccountBalance from '@/views/accountBalance/accountBalance'

import MyCommission from '@/views/myCommission/myCommission'

import MyAddress from '@/views/myAddress/myAddress'  // 我的地址

import MyOrder from '@/views/myOrder/myOrder'
import OrderDetail from '@/views/orderDetail/orderDetail'

import MyTeam from '@/views/myTeam/myTeam'
import RebatesDetails from '@/views/rebatesDetails/rebatesDetails'

import WithdrawalsRecord from '@/views/withdrawalsRecord/withdrawalsRecord'
import ErrorComponent from '@/views/error/error'

Vue.use(Router);

let router = new Router({
    mode: 'hash',
    linkActiveClass: 'active',
    routes: [{
        path: '/register',
        name: 'register',
        component: Register
    }, {
        path: '/personCenter',
        name: 'personCenter',
        component: PersonCenter
    }, {
        path: '/accountBalance',
        name: 'accountBalance',
        component: AccountBalance
    }, {
        path: '/myCommission',
        name: 'myCommission',
        component: MyCommission
    }, {
        path: '/myAddress',
        name: 'myAddress',
        component: MyAddress
    }, {
        path: '/myOrder',
        name: 'myOrder',
        component: MyOrder
    }, {
        path: '/orderDetail',
        name: 'orderDetail',
        component: OrderDetail
    }, {
        path: '/myTeam',
        name: 'myTeam',
        component: MyTeam
    }, {
        path: '/rebatesDetails',
        name: 'rebatesDetails',
        component: RebatesDetails
    }, {
        path: '/withdrawalsRecord',
        name: 'withdrawalsRecord',
        component: WithdrawalsRecord
    }, {
        path: '/error',
        name: 'error',
        component: ErrorComponent
    }, {
        path: '*',
        redirect: '/register'
    }]
});


export default router;