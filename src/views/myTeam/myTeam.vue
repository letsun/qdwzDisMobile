<template>
    <div>
        <nav-header back="true">
            <div class="title" slot="title">我的团队</div>
        </nav-header>


        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <div class="team-infor">
                    <div class="team-item">
                        <div class="team-item-key">我的上级：</div>
                        <div class="team-item-val">{{myParentDist}}</div>
                    </div>

                    <div class="team-item">
                        <div class="team-item-key">我的下级数量：</div>
                        <div class="team-item-val">{{childDisNumber}}</div>
                    </div>

                    <div class="team-item" @click="toDetail">
                        <div class="team-item-key">累计为我返利：</div>
                        <div class="team-item-val">
                            <div class="rebate-num">{{amount | currency('￥')}}</div>
                            <div class="iconfont icon-jiantou lxcy-icon"></div>
                        </div>
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

    const CONSUMER_REBATE = 0;              // 消费者直接返利;
    const NEXT_DISTRIBUTOR_REBATE = 1;      // 下级经销商的返利;
    const ALL_REBATE = 2;                   // 我的所有返利;

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
                childDisNumber: '',
                amount: '',
                myParentDist: '',
                isLoadCompleted: false
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.getDisCount();
                this.getAmount();
                this.getMyParentDist();
                this.initScroll();
                util.goErrorPage(this.$router);
            });
        },
        computed: {
           
        },
        methods: {
            initScroll() {
                var scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    click: true
                });
            },
            getDisCount() {

                this.$http.get(api.myTeam.getChildDisNumber).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.childDisNumber = res.data.childDisNumber; 
                    } else {
                        util.checkStatus(this, res, this.getDisCount);
                    }
                });
            },
            getAmount() {

                this.$http.get(api.rebate.getRebateAmount, {
                    params: {
                        rebateObj: NEXT_DISTRIBUTOR_REBATE
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.amount = res.data.amount; 
                    } else {
                        util.checkStatus(this, res, this.getAmount);
                    }
                });
            },
            getMyParentDist() {

                this.$http.get(api.myTeam.getMyParentDist).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.myParentDist = res.data.distributorName; 
                        this.isLoadCompleted = true;
                    } else {
                        util.checkStatus(this, res, this.getMyParentDist);
                    }
                });
            },
            toDetail() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/rebatesDetails'});
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
    @import "./myTeam.less";
</style>