<template>
    <div @click="closeFn">
        <nav-header back="true">
            <div class="title" slot="title">我的订单</div>
        </nav-header>
        
        <div class="order-state">
            <div class="order-state-key">订单状态</div>

            <div class="order-state-val">
                <div class="order-status" @click.stop="showPicker">{{selectedText ? selectedText: '全部'}}</div>
                <i class="iconfont icon-jiantouarrow486 lxcy-icon"></i>
            </div>
        </div>

        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <div class="content">
                    <div class="order-list">
                        <div class="order-item" v-for="(item, index) in orderList" :key="index" @click="toDetail(item.orderId)">
                            <div class="order-num">{{item.orderNo}}</div>
                            <div class="order-type">{{statusMapped[item.status]}}</div>
                            <div class="order-price">{{item.realMoney | currency('￥')}}</div>
                            <div class="iconfont icon-jiantou lxcy-icon"></div>
                        </div>
                    </div>
                    <!-- 下拉加载更多 -->
                    <loading-tip :loadingTip="loadingTip" :isShow="orderList.length >= pageNum" :hasNext="hasNext"></loading-tip>
                </div>
            </div>
            <!-- 页面加载状态 -->
            <transition name="fade">
                <loading-page v-if="!isLoadCompleted" page="noTop"></loading-page>
            </transition>
        </div>
        <transition name="showPicker">
            <picker v-show="isShowPicker" valueKey="text" :slots="slots" :itemHeight="itemHeight" :showToolbar="showToolbar" @change="onValuesChange">
                <a href="javascript:void(0)" @click="cancelPicker" class="cancel-btn">取消</a>
                <a href="javascript:void(0)" @click="okPicker" class="ok-btn">确定</a>
            </picker>
        </transition>

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
            <loading-page v-if="!isLoadPageCompleted"></loading-page>
        </transition>

    </div>
</template>
<script>
    // 插件
    import BetterScroll from 'better-scroll';

    // 组件
    import NavHeader from '@/components/navHeader/navHeader'
    import SubmitBtn from '@/components/submitBtn/submitBtn'
    import LoadingTip from '@/components/loadingTip/loadingTip'
    import LoadingPage from '@/components/loadingPage/loadingPage';
    import ModelWin from '@/components/modelWin/modelWin'
    import { Picker } from 'mint-ui';

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';

    export default {
        components: {
            NavHeader,
            Picker,
            LoadingTip,
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
                picker: null,
                slots: [
                    {
                      defaultIndex: 0,
                      values: [{
                        value: 0,
                        text: '全部'
                      }, {
                        value: 3,
                        text: '待发货'
                      }, {
                        value: 4,
                        text: '已发货'
                      }, {
                        value: 5,
                        text: '已签收'
                      }],
                      className: 'orderStatus',
                      textAlign: 'center'
                    }
                ],
                itemHeight: 69,
                showToolbar: true,
                isShowPicker: false,
                waitSelectedValue: '',
                waitSelectedText: '',
                selectedValue: '',
                selectedText: '',
                scroll: null,
                pageSize: 1,
                pageNum: 12,
                status: 0,
                hasNext: false,
                loadingTip: '下拉加载更多',
                orderList: [],
                statusMapped: {
                    '1': '新订单',
                    '2': '已取消',
                    '3': '待发货',
                    '4': '已发货',
                    '5': '已签收'
                },
                isLoadPageCompleted: false,
                isLoadCompleted: true

            }
        },
        mounted() {
            this.$nextTick(() => {

                this.initOrderList();

                this.initScroll();

                util.goErrorPage(this.$router);
            });
        },
        computed: {
            
        },
        updated() {
            this.finish();
        },
        methods: {
            initScroll() {
                this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    scrollbar: {
                        fade: true
                    },
                    click: true,
                    pullUpLoad: {
                      threshold: 0
                    }
                });
                this.scroll.on('pullingUp', () => {
                    if (this.hasNext) {
                        this.pageSize++;
                        this.loadingTip = '数据正在加载中....';
                        
                        this.initOrderList('loading');
                    } else {
                        this.loadingTip = '已经没有更多了';
                    }
                });
            },
            initOrderList(type) {

                let params = {
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                };

                if (this.status !== 0) {
                    params.status = this.status;
                }

                this.$http.get(api.order.getOrderList, {
                    params: params
                }).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        
                        if (type === 'loading') {
                            this.orderList = [...this.orderList, ...res.data.orderList];
                        } else {
                            this.orderList = res.data.orderList;

                            if (this.isLoadPageCompleted) {
                                this.isLoadCompleted = true;
                            }

                            this.isLoadPageCompleted = true;
                            
                        }
                        
                        this.hasNext = res.data.hasNext;
                    } else {
                        util.checkStatus(this, res, this.initOrderList, type);
                    }
                });
            },
            toDetail(orderId) {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/orderDetail', query: {orderId: orderId}});
            },
            onValuesChange(picker, values) {
                this.waitSelectedValue = values[0].value;
                this.waitSelectedText = values[0].text;
                this.picker = picker;
            },
            showPicker() {
                this.isShowPicker = true;
            },
            cancelPicker() {
                this.isShowPicker = false;
            },
            okPicker() {
                this.isShowPicker = false;
                this.selectedValue = this.waitSelectedValue;
                this.selectedText = this.waitSelectedText;
                this.status = this.selectedValue;
                this.pageSize = 1;
                this.loadingTip = '下拉加载更多';
                this.isLoadCompleted = false;
                this.initOrderList('select');
                this.finish();
            },
            closeFn() {
                this.isShowPicker = false;  
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;
                this.modelTitle = '温馨提示';
            },
            okModelWin(type) {
                type();
            },
            finish() {
                this.scroll.finishPullUp();
                this.scroll.refresh();
            },

        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "myOrder.less";
</style>