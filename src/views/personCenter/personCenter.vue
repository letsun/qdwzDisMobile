<template>
    <div>

        <div class="wrapper">
            <div class="person-header">
                <div class="person-infor">
                    <div class="infor-left">
                        <img :src="personCenterData.headimage" class="avatar" />
                    </div>

                    <div class="infor-right">
                        <div class="infor-name">{{personCenterData.distributorName}}</div>
                        <div class="infor-code">
                            <span class="code-key">编码：</span>
                            <span class="code-val">{{personCenterData.distributorCode}}</span>
                        </div>
                    </div>

                </div>
            </div>
            <div class="scroll-wrapper" ref="scrollWrapper">
                <div class="person-detail">

                    <!--我的余额-->
                    <div class="my-balance">
                        <div class="my-balance-left">
                            <div class="balance-title">我的余额</div>
                            <div class="balance-num">
                                {{personCenterData.balance | currency('￥')}}
                            </div>
                        </div>

                        <div class="my-balance-right" @click="withdraw">提现</div>
                    </div>
                    <ul class="person-list">
                        <li class="person-item" @click="toMyOrder">
                            <img class="item-img" src="./1_7.png" />
                            <div class="person-right">
                                <div class="person-title">我的订单</div>
                                <div class="item-num">{{personCenterData.orderSum}}</div>
                                <i class="person-icon iconfont icon-jiantou"></i>
                            </div>
                        </li>
                        <li class="person-item" @click="toComm">
                            <img class="item-img" src="./1_8.png" />
                            <div class="person-right">
                                <div class="person-title">累计佣金</div>
                                <div class="item-num">{{personCenterData.amount | currency('￥')}}</div>
                                <i class="person-icon iconfont icon-jiantou"></i>
                            </div>
                        </li>

                        <li class="person-item" @click="toMyTeam">
                            <img class="item-img" src="./1_9.png" />
                            <div class="person-right">
                                <div class="person-title">我的团队</div>
                                <div class="item-num">{{personCenterData.childDisNumber}}</div>
                                <i class="person-icon iconfont icon-jiantou"></i>
                            </div>
                        </li>

                        <li class="person-item" @click="toWithdraw">
                            <img class="item-img" src="./1_10.png" />
                            <div class="person-right">
                                <div class="person-title">提现记录</div>
                                <div class="item-num"></div>
                                <i class="person-icon iconfont icon-jiantou"></i>
                            </div>
                        </li>

                        <li class="person-item" @click="toMyAddress" v-if="isParent">
                            <img class="item-img" src="./1_17.png" />
                            <div class="person-right">
                                <div class="person-title">我的提货地址</div>
                                <div class="item-num"></div>
                                <i class="person-icon iconfont icon-jiantou"></i>
                            </div>
                        </li>
                    </ul>
                    <div class="btn-wra">
                        <submit-btn @clickEvent="toModel('myShop')">我的商城</submit-btn>
                        <submit-btn @clickEvent="toModel()">下级分销商注册</submit-btn>
                    </div>
                </div>

                

            </div>
        </div>

        <!-- 页面加载状态 -->
        <transition name="fade">
            <loading-page v-if="!isLoadCompleted" page="noTop"></loading-page>
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

    </div>
</template>
<script>
    // 插件
    import BetterScroll from 'better-scroll';
    import QRCode from 'qrcode';

    // 组件
    import ModelWin from '@/components/modelWin/modelWin'
    import SubmitBtn from '@/components/submitBtn/submitBtn'
    import LoadingPage from '@/components/loadingPage/loadingPage';

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';
    import ip from '@/util/ipAddress';

    export default {
        components: {
            ModelWin,
            SubmitBtn,
            LoadingPage
        },
        data() {
            return {
                showModel: false,
                modelTitle:'温馨提示',
                errorTipBtnText: '我知道了',
                isConfirm:true,
                errorTip: '',
                okType: '',
                personCenterData: {},
                isLoadCompleted: false,
                isParent: false,
            }
        },
        mounted() {
            this.$nextTick(() => {

                this.initScroll();
                this.initPersonCenter();
                util.goErrorPage(this.$router);
            });
        },
        computed: {
            mallType() {
                return this.$store.state.mallType;
            },
            companyId() {
                return this.$store.state.companyId;
            },
            thisloginDistributorId() {
                return this.$store.state.thisloginDistributorId;
            }
        },
        methods: {
            initScroll() {
                var scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    click: true
                });
            },
            initPersonCenter() {
                this.$http.get(api.personCenter.getDistributor).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.personCenterData = res.data;
                        if (this.personCenterData.parentId > 0) {
                            this.isParent = false;
                        } else {
                            this.isParent = true;
                        }

                    } else {
                        util.checkStatus(this, res, this.initPersonCenter);
                    }

                    this.isLoadCompleted = true;
                });
            },
            withdraw() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/accountBalance'});
            },
            toComm() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/myCommission'});
            },
            toMyOrder() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/myOrder'});
            },
            toMyTeam() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/myTeam'});
            },
            toWithdraw() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/withdrawalsRecord'});
            },
            toMyAddress () {
                this.$store.commit('updateDirection', 'left');
                this.$router.push({path:'/myAddress'});
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;
                this.modelTitle = '温馨提示';
            },
            okModelWin(type) {
                type();
            },
            toModel(type) {

                let url = `${ip}/shop/wx/${this.mallType}/${this.companyId}?disId=${this.thisloginDistributorId}`;
                
                let options = {
                    errorCorrectionLevel: 'H',
                    type: 'image/jpeg'
                }

                if (type !== 'myShop') {
                    url += `&pType=1`;
                }

                // console.log(url);

                // 生成二维码并转换成图片
                QRCode.toDataURL(url, options, (err, url) => {
                  
                  if (err) {
                       this.showModel = true;
                       this.isConfirm = false;
                       this.modelTitle = '温馨提示';
                       this.errorTip = err;
                       this.errorTipBtnText = '确定';
                       return; 
                  }

                  this.modelTitle = '长按二维码保存到相册';
                  this.errorTipBtnText = '我知道了';
                  this.showModel = true;
                  this.isConfirm = false;
                  this.errorTip = `<img src="${url}" style="width: 100%; height: 100%;" />`;

                })

                
            }
        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "./personCenter.less";
</style>