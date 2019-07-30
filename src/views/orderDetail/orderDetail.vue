<template>
    <div>
        <nav-header back="true">
            <div class="title" slot="title">我的订单</div>
        </nav-header>
        
        <div class="order-infor">
            <div class="order-infor-title">订单信息：</div>

            <ul class="infor-list">
                <li class="infor-item">
                    <div class="infor-item-key">订单编号：</div>
                    <div class="infor-item-val">{{orderDetail.orderNo}}</div>
                </li>

                <li class="infor-item">
                    <div class="infor-item-key">订单总额：</div>
                    <div class="infor-item-val">{{orderDetail.payMoney | currency('￥')}}</div>
                </li>

                <li class="infor-item">
                    <div class="infor-item-key">返利金额：</div>
                    <div class="infor-item-val">{{orderDetail.directDistributorRebatesum | currency('￥')}}</div>
                </li>
                <li class="infor-item">
                    <div class="infor-item-key">下单时间：</div>
                    <div class="infor-item-val">{{orderDetail.createDate}}</div>
                </li>

            </ul>
        </div>

       <div class="container">
            <div class="scroll-wrapper" ref="scrollWrapper">
                <div class="wrapper">
                    <div class="order-wrapper">
                        
                        <ul class="goods-list">
                            
                            <li class="goods-item" v-for="(item, index) in orderDetail.orderItem">
                                <div class="goods-item-left">
                                    <img :src="item.imagesUrl" alt="">
                                </div>

                                <div class="goods-item-mid">
                                    {{item.goodsName}}
                                </div>

                                <div class="goods-item-right">
                                    <div class="goods-item-price">{{item.goodsSalePrice | currency('￥')}}</div>
                                    <div class="goods-item-num">{{item.amount}}</div>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
       </div>

       <model-win :show="showModel">
            <template slot="title">
                {{modelTitle}}
            </template>
            <template slot="content">
                <span v-html="errorTip"></span>
            </template>
            <template slot="btn">
                <template  v-if="isConfirm">
                    <a href="javascript:void(0);" class="btn" @click="closeModelWin">取消</a>
                    <a href="javascript:void(0);" class="btn btn-last active" @click="okModelWin(okType)">确定</a>
                </template>
                <template  v-else>
                    <a href="javascript:void(0);" class="btn active" @click="closeModelWin">{{errorTipBtnText}}</a>
                </template>
            </template>
        </model-win>

        <!-- 页面加载状态 -->
        <transition name="fade">
            <loading-page v-if="!isLoadCompleted"></loading-page>
        </transition>

    </div>
</template>
<script>
    // 插件
    import BetterScroll from 'better-scroll';

    // 组件
    import NavHeader from '@/components/navHeader/navHeader'
    import LoadingPage from '@/components/loadingPage/loadingPage';
    import ModelWin from '@/components/modelWin/modelWin'

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';

    export default {
        components: {
            NavHeader,
            LoadingPage,
            ModelWin
        },
        data() {
            return {
                showModel: false,
                modelTitle:'温馨提示',
                errorTipBtnText: '确定',
                isConfirm:true,
                errorTip: '',
                okType: '',
                orderDetail: {},
                isLoadCompleted: false
            }
        },
        mounted() {
            this.$nextTick(() => {

                this.initOrderDetail();
                this.initScroll();

                util.goErrorPage(this.$router);
            });
        },
        computed: {
            
        },
        methods: {
            initScroll() {
                var scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    click: true,
                    scrollbar: {
                        fade: true
                    }
                });
            },
            initOrderDetail() {
                
                this.$http.get(api.order.getOrderById, {
                    params: {
                        orderId: this.$route.query.orderId
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.orderDetail = res.data.orderList[0];
                        this.isLoadCompleted = true;
                    } else {
                        util.checkStatus(this, res, this.initOrderDetail);
                    }
                });
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;
                this.modelTitle = '温馨提示';
            },
            okModelWin(type) {
                type();
            },
        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "./orderDetail.less";
</style>