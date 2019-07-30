<template>
    <div class="container">
        <nav-header back="true">
            <div class="title" slot="title">提现记录</div>
        </nav-header>
        <div class="withdraw-title">
            <div class="withdraw-title-left">
                金额
            </div>
            <div class="withdraw-title-mid">
                状态
            </div>
            <div class="withdraw-title-right">
                时间
            </div>
        </div>
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                
                <div class="withdraw-list">

                    <div class="withdraw-item" v-for="(item, index) in withdrawList">
                        <div class="withdraw-item-left">{{item.withdrawMoney | currency('￥')}}</div>
                        <div class="withdraw-item-mid">{{statusText[item.status]}}</div>
                        <div class="withdraw-item-right">
                            {{item.createDate | format('yyyy.MM.dd hh:mm:ss')}}
                        </div>
                    </div>
                </div>

                <!-- 下拉加载更多 -->
                <loading-tip :loadingTip="loadingTip" :isShow="withdrawList.length >= pageNum" :hasNext="hasNext"></loading-tip>
                
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
    import LoadingTip from '@/components/loadingTip/loadingTip'
    import LoadingPage from '@/components/loadingPage/loadingPage';
    import ModelWin from '@/components/modelWin/modelWin'

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';

    export default {
        components: {
            NavHeader,
            LoadingTip,
            LoadingPage,
            ModelWin
        },
        data() {
            return {
                showModel:false,
                modelTitle:'温馨提示',
                isConfirm:true,
                okType: '',
                errorTip:'',
                scroll: null,
                pageSize: 1,
                pageNum: 12,
                hasNext: false,
                loadingTip: '下拉加载更多',
                withdrawList: [],
                statusText: {
                    '0': '新提交',
                    '1': '审核中',
                    '2': '审核通过',
                    '3': '审核不通过'
                },
                isLoadCompleted: false
            }
        },
        computed: {
            
        },
        updated() {
            this.finish();
        },
        mounted() {
            this.$nextTick(() => {
                this.initWithdrawList();
                this.initScroll();
                util.goErrorPage(this.$router);
            });
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
                        
                        this.initWithdrawList('loading');
                    } else {
                        this.loadingTip = '已经没有更多了';
                    }
                });
            },
            initWithdrawList(type) {

                this.$http.get(api.withdraw.findAll, {
                    params: {
                        pageSize: this.pageSize,
                        pageNum: this.pageNum
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.hasNext = res.data.hasNext;

                        if (type === 'loading') {
                            this.withdrawList = [...this.withdrawList, ...res.data.wthdrawList];
                        } else {
                            this.withdrawList = res.data.wthdrawList; 
                            this.isLoadCompleted = true;
                        }
                    } else {
                        util.checkStatus(this, res, this.initWithdrawList, type);
                    }
                });
            },
            finish() {
                this.scroll.finishPullUp();
                this.scroll.refresh();
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;
                this.modelTitle = '温馨提示';
            },
            okModelWin(type) {
                type();
            }
        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "./withdrawalsRecord.less";
</style>