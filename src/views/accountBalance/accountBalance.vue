<template>
    <div>
        <nav-header back="true">
            <div class="title" slot="title">账户余额</div>
        </nav-header>


        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">

                <!--余额-->
                <div class="balance">
                    <div class="balance-name">{{personCenterData.companyName}}</div>
                    <div class="balance-num">{{personCenterData.balance | currency('￥')}}</div>
                </div>

                <!--提现-->
                <div class="form">
                    <div class="form-item">
                        <div class="form-left">
                            <input class="form-input" v-model="withdrawMoney" type="text" placeholder="请输入提现金额">
                        </div>
                        <div class="form-right">
                            <button class="form-btn" @click="showWithdraw">提&nbsp;&nbsp;现</button>
                        </div>
                    </div>

                    <!-- <div class="prompt">注：一天最多只能3次,提现金额只能是1-200元的整数</div> -->

                    <div class="form-submit">
                        <submit-btn @clickEvent="toPersonCenter">个人中心</submit-btn>
                    </div>

                </div>
            </div>
        </div>

        <!-- 页面加载状态 -->
        <transition name="fade">
            <loading-page v-if="!isLoadCompleted"></loading-page>
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
                    <a href="javascript:void(0);" class="btn active" @click="closeModelWin">确定</a>
                </template>
            </template>
        </model-win>

    </div>
</template>
<script>
    // 插件
    import BetterScroll from 'better-scroll';

    // 组件
    import NavHeader from '@/components/navHeader/navHeader'
    import SubmitBtn from '@/components/submitBtn/submitBtn'
    import ModelWin from '@/components/modelWin/modelWin'
    import LoadingPage from '@/components/loadingPage/loadingPage';

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';
    import currency from '@/util/currency';

    export default {
        components: {
            NavHeader,
            SubmitBtn,
            ModelWin,
            LoadingPage
        },
        data() {
            return {
                showModel:false,
                modelTitle:'温馨提示',
                errorTip:'提现成功',
                isConfirm:false,
                isSubmiting: false,
                personCenterData: {},
                withdrawMoney: '',
                okType: '',
                isLoadCompleted: false
            }
        },
        computed: {
            
        },
        mounted() {
            this.$nextTick(() => {
                this.initPersonCenter();
                this.initScroll();
                util.goErrorPage(this.$router);
            });
        },
        methods: {
            initScroll() {
                var scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    click: true
                });
            },
            initPersonCenter(type) {
                this.$http.get(api.personCenter.getDistributor).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.personCenterData = res.data;
                    } else {
                        util.checkStatus(this, res, this.initPersonCenter, type);
                    }

                    if (type === 'withdraw') {
                        this.isSubmiting = false;
                    }

                    this.isLoadCompleted = true;
                });
            },
            withdraw() {

                if (this.isSubmiting) {
                    return;
                }

                this.isSubmiting = true;

                this.$http.get(api.withdraw.withdraw, {
                    params: {
                        mobile: this.personCenterData.mobile,
                        name: this.personCenterData.distributorName,
                        withdrawMoney: this.withdrawMoney
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.showModel = true;
                        this.isConfirm = false;
                        this.errorTip = '申请提现成功<br>工作人员稍后会联系您进行后续操作';
                        this.withdrawMoney = '';
                        
                        this.initPersonCenter('withdraw');
                    } else {
                        util.checkStatus(this, res, this.withdraw);
                    }
                });
            },
            toPersonCenter() {
                this.$store.commit('updateDirection', 'right');
                this.$router.push({path:'/personCenter'});
            },
            okModelWin(type) {
                type();
            },
            showWithdraw() {

                if (!this.withdrawMoney) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '提现金额不能为空';
                    return;
                }

                if (!/^\d+\.?\d{0,2}$/.test(this.withdrawMoney)) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '提现金额不合法';
                    return;
                }

                if (this.withdrawMoney < 1) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '提现金额不能少于1元';
                    return;
                }

                if (this.withdrawMoney > this.personCenterData.balance) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '提现金额已经超出范围';
                    return;
                }

                this.showModel = true;
                this.isConfirm = true;
                this.okType = this.withdraw;

                let money = currency(this.withdrawMoney, '￥');
                this.errorTip = `确定提现${money}元吗？`;
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;
            },
            okModelWin(type) {
                type();
            }

        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "./accountBalance.less";
</style>