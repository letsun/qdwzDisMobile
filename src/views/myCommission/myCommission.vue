<template>
    <div class="container" @click="closeFn">
        <nav-header back="true">
            <div class="title" slot="title">我的佣金</div>
        </nav-header>
        
        <!--头部-->
        <div class="header">
            <div class="header-left" @click.stop="showPicker">
                <div class="header-year">{{selectedYearValue}}年</div>
                <div class="header-month">
                    <div class="month-num">{{selectedMonthValue}}</div>
                    <div class="month-unit">月</div>
                    <div class="iconfont icon-jiantouarrow486 lxcy-icon"></div>
                </div>
            </div>
            <div class="header-right">
                <div class="header-title">累计金额</div>
                <div class="header-num">{{amount | currency('￥')}}</div>
            </div>
        </div>

        <div class="container">
            <div class="nav">
                <div class="nav-item" :class="{active:flag==item.tabIndex}" v-for="(item ,index) in navList" :key="index" @click="nav(item.tabIndex)">
                    <div class="nav-title">{{item.price | currency('￥')}}</div>
                    <div class="nav-dec">{{item.text}}</div>
                </div>
            </div>

            <div class="comm-wra">
                <div class="comm-list1" v-show="flag === 0">
                    <div class="scroll-wrapper" ref="scrollWrapperOne">
                        <div class="wrapper">
                            <div class="content-list">
                                <div class="comm-item" v-for="(item, index) in rebateRecordList1" :key="index">
                                    <div class="row1">
                                        <div class="goods-name">{{item.goodsName}}</div>
                                        <div class="price">{{item.realMoney | currency('￥')}}</div>
                                    </div>
                                    <div class="row2">
                                        <div class="preson-name">{{item.consumerName}}</div>
                                        <div class="time">{{item.rebateDate | format('yyyy-MM-dd hh:mm:ss')}}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 下拉加载更多 -->
                            <loading-tip :loadingTip="loadingTip1" :isShow="rebateRecordList1.length >= pageNum1" :hasNext="hasNext1"></loading-tip>
                        </div>
                    </div>
                </div>

                <div class="comm-list" v-show="flag === 1">
                    <div class="scroll-wrapper" ref="scrollWrapperTwo">
                        <div class="wrapper">
                            <div class="content-list">
                                <div class="comm-item" v-for="(item, index) in rebateRecordList2" :key="index">
                                    <div class="comm-left">{{item.distributorName}}</div>
                                    <div class="comm-midd">{{item.realMoney | currency('￥')}}</div>
                                    <div class="comm-right">{{item.rebateDate | format('yyyy-MM-dd hh:mm:ss')}}</div>
                                </div>
                            </div>
                            <!-- 下拉加载更多 -->
                            <loading-tip :loadingTip="loadingTip2" :isShow="rebateRecordList2.length >= pageNum2" :hasNext="hasNext2"></loading-tip>
                        </div>
                    </div>
                </div>

            </div>
            <!-- 页面加载状态 -->
            <transition name="fade">
                <loading-page v-if="!isLoadCompleted" page="commissionTop"></loading-page>
            </transition>
        </div>
        <transition name="showPicker">
            <picker v-show="isShowPicker" :slots="slots" valueKey="text" :itemHeight="itemHeight" :showToolbar="showToolbar" @change="onValuesChange">
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
    import LoadingTip from '@/components/loadingTip/loadingTip'
    import LoadingPage from '@/components/loadingPage/loadingPage';
    import ModelWin from '@/components/modelWin/modelWin'
    import { Picker } from 'mint-ui';

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';

    let currentYear = (new Date()).getFullYear();
    let currentMonth = `(new Date()).getMonth() + 1`.length === 2 ? (new Date()).getMonth() + 1 : `0${(new Date()).getMonth() + 1}`;

    const CONSUMER_REBATE = 0; // 消费者直接返利;
    const NEXT_DISTRIBUTOR_REBATE = 1; // 下级经销商的返利;
    const ALL_REBATE = 2; // 我的所有返利;

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
                slots: [
                    {
                      flex: 1,
                      defaultIndex: 0,
                      values: [],
                      className: 'orderStatus',
                      textAlign: 'center'
                    },
                    {
                        flex: 1,
                        divider: true,
                        content: '-'
                    },
                    {
                      flex: 1,
                      defaultIndex: 0,
                      values: [],
                      className: 'orderStatus',
                      textAlign: 'center'
                    }
                ],
                itemHeight: 69,
                showToolbar: true,
                isShowPicker: false,
                waitSelectedYearValue: '',
                waitSelectedYearText: '',
                selectedYearValue: currentYear,
                waitSelectedMonthValue: '',
                waitSelectedMonthText: '',
                selectedMonthValue: currentMonth,
                flag:0,
                navList:[
                    {
                        price:0,
                        tabIndex:0,
                        text:'消费者下单返利',
                    },
                    {
                        price:0,
                        tabIndex:1,
                        text:'下级分销商返利',
                    }
                ],
                scroll1: null,
                scroll2: null,
                hasNext1: false,
                hasNext2: false,
                pageSize1: 1,
                pageNum1: 7,
                pageSize2: 1,
                pageNum2: 8,
                loadingTip1: '下拉加载更多',
                loadingTip2: '下拉加载更多',
                amount: '',
                rebateRecordList1: [],
                rebateRecordList2: [],
                isLoadPageCompleted: false,
                isLoadCompleted: false
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.initYearPicker();
                this.initMonthPicker();

                this.initData();

                this.initScroll();

                util.goErrorPage(this.$router);
            });
        },
        updated() {
            this.finish();
        },
        computed: {
           
        },
        methods: {
            initScroll() {

                // 消费者下单返利
                this.scroll1 = new BetterScroll(this.$refs.scrollWrapperOne, {
                    scrollbar: {
                        fade: true
                    },
                    click: true,
                    pullUpLoad: {
                      threshold: 0
                    }
                });
                this.scroll1.on('pullingUp', () => {
                    if (this.hasNext1) {
                        this.pageSize1++;
                        this.loadingTip1 = '数据正在加载中....';
                        
                        this.getDirectRebateRecord('loading');
                    } else {
                        this.loadingTip1 = '已经没有更多了';
                    }
                });

                // 下级分销商返利
                this.scroll2 = new BetterScroll(this.$refs.scrollWrapperTwo, {
                    scrollbar: {
                        fade: true
                    },
                    click: true,
                    pullUpLoad: {
                      threshold: 0
                    }
                });
                this.scroll2.on('pullingUp', () => {
                    if (this.hasNext2) {
                        this.pageSize2++;
                        this.loadingTip2 = '数据正在加载中....';
                        
                        this.getInDirectRebateRecord('loading');
                    } else {
                        this.loadingTip2 = '已经没有更多了';
                    }
                });
                
            },
            initData() {
                this.getAmount(ALL_REBATE);
                this.getAmount(NEXT_DISTRIBUTOR_REBATE);
                this.getAmount(CONSUMER_REBATE);
                this.getDirectRebateRecord();
                this.getInDirectRebateRecord();
            },
            getAmount(rebate) {

                this.$http.get(api.rebate.getRebateAmount, {
                    params: {
                        queryDate: `${this.selectedYearValue}-${this.selectedMonthValue}`,
                        rebateObj: rebate
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        if (rebate === ALL_REBATE) {
                            this.amount = res.data.amount; 
                        } else if (rebate === NEXT_DISTRIBUTOR_REBATE) {
                            this.navList[1].price = res.data.amount
                        } else if (rebate === CONSUMER_REBATE) {
                            this.navList[0].price = res.data.amount
                        }
                    } else {
                        util.checkStatus(this, res, this.getAmount);
                    }
                });
            },
            getDirectRebateRecord(type) {
                this.$http.get(api.rebate.getDirectRebateRecord, {
                    params: {
                        pageSize: this.pageSize1,
                        pageNum: this.pageNum1,
                        queryDate: `${this.selectedYearValue}-${this.selectedMonthValue}`
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.hasNext1 = res.data.hasNext;

                        if (type === 'loading') {
                            this.rebateRecordList1 = [...this.rebateRecordList1, ...res.data.rebateRecordList]; 
                        } else {
                            this.rebateRecordList1 = res.data.rebateRecordList;
                            this.isLoadPageCompleted = true;
                            this.isLoadCompleted = true;
                        }
                        
                    } else {
                        util.checkStatus(this, res, this.getDirectRebateRecord, type);
                    }
                });
            },
            getInDirectRebateRecord(type) {
                this.$http.get(api.rebate.getInDirectRebateRecord, {
                    params: {
                        pageSize: this.pageSize2,
                        pageNum: this.pageNum2,
                        queryDate: `${this.selectedYearValue}-${this.selectedMonthValue}`
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.hasNext2 = res.data.hasNext;

                        if (type === 'loading') {
                            this.rebateRecordList2 = [...this.rebateRecordList2, ...res.data.rebateRecordList]; 
                        } else {
                            this.rebateRecordList2 = res.data.rebateRecordList; 
                            this.isLoadPageCompleted = true;
                            this.isLoadCompleted = true;
                        }
                    } else {
                        util.checkStatus(this, res, this.getInDirectRebateRecord, type);
                    }
                });
            },
            nav(tabIndex) {
                this.flag = tabIndex;
                this.finish();
            },
            onValuesChange(picker, values) {
                // picker.setSlotValue(1, 0);
                if (values[0]) {
                    this.waitSelectedYearValue = values[0].value;
                }

                if (values[1]) {
                    this.waitSelectedMonthValue = values[1].value;
                }

            },
            showPicker() {
                this.isShowPicker = true;
            },
            cancelPicker() {
                this.isShowPicker = false;
            },
            okPicker() {
                this.isShowPicker = false;
                this.isLoadCompleted = false;
                this.selectedYearValue = this.waitSelectedYearValue;
                this.selectedMonthValue = this.waitSelectedMonthValue;

                this.pageSize1 = 1;
                this.pageSize2 = 1;
                this.loadingTip1 = '下拉加载更多';
                this.loadingTip2 = '下拉加载更多';
                this.initData();

            },
            initYearPicker() {
                for (let i = 2017; i < 2050; i++) {
                    this.slots[0].values.push({value: i, text: `${i}年`});
                }
            },
            initMonthPicker() {
                for (let i = 1; i < 13; i++) {
                    let value = `${i}`.length === 2 ? i : `0${i}`;
                    this.slots[2].values.push({value: value, text: `${value}月`});
                }
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
               
                this.scroll1.finishPullUp();
                this.scroll1.refresh();
                this.scroll2.finishPullUp();
                this.scroll2.refresh();
            },
            closeFn() {
                this.isShowPicker = false;
            }
        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "myCommission.less";
</style>