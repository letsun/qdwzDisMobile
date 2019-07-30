<template>
    <div class="container">
        <nav-header back="true">
            <div class="title" slot="title">我的地址</div>
        </nav-header>
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <div class="form">
                    <div class="form-item">
                        <div class="form-key">提货地址：</div>
                        <div class="form-val">
                            <textarea type="text" class="form-input" :readonly="submitText == '保存' ? false : 'readonly'" :unselectable="submitText == '保存' ? '' : 'on'" :onfocus="submitText == '保存' ? '' : 'this.blur()'" placeholder="请输入详细地址" v-model="address"></textarea>
                        </div>
                    </div>
                    <div class="form-tips">注：该信息将会作为提货地址展示给消费者，请准确填写</div>
                </div>
                <a class="submit-btn" href="javascript:void(0);" @click="submitAction">{{submitText}}</a>
            </div>
        </div>

        <model-win :show="showModel">
            <template slot="title">
                {{modelTitle}}
            </template>
            <template slot="content">
                {{errorTip}}
            </template>
            <template slot="btn">
                <template  v-if="showModel">
                    <a href="javascript:void(0);" class="btn active" @click="closeModelWin">确定</a>
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
    import ModelWin from '@/components/modelWin/modelWin'
    import LoadingTip from '@/components/loadingTip/loadingTip'
    import LoadingPage from '@/components/loadingPage/loadingPage';

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';

    export default {
        components: {
            NavHeader,
            ModelWin,
            LoadingTip,
            LoadingPage
        },
        data() {
            return {
                showModel:false,
                modelTitle:'温馨提示',
                isConfirm:true,
                okType: '',
                errorTip:'',
                scroll: null,
                address: '',
                submitText:'修改',
                isLoadCompleted: true
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.distributorId = this.$store.state.thisloginDistributorId;
                this.getDisAddress();
                this.initScroll();
                util.goErrorPage(this.$router);
            });
        },
        computed: {

        },
        methods: {
            initScroll() {
                this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    click: true,
                });
            },
            closeModelWin() {
                this.showModel = false;
            },
            getDisAddress () {
                this.$http.get(api.myTeam.getDisAddress, {
                    params: {
                        distributorId: this.distributorId,
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        console.log(res);
                        this.address = res.data.address;
                    }
                });
            },
            submitAction () {
                if (this.submitText == '修改') {
                    this.submitText = '保存';
                } else {
                    if (this.address == '') {
                        this.showModel = true;
                        this.isConfirm = true;
                        this.errorTip = '地址不能为空';
                        return false;
                    }
                    this.$http.get(api.myTeam.updateDisAddress, {
                        params: {
                            distributorId: this.distributorId,
                            address:this.address,
                        }
                    }).then((response) => {
                        let res = response.data;

                        if (res.code === 200) {
                            this.submitText = '修改';
                            this.getDisAddress();
                            this.showModel = true;
                            this.isConfirm = true;
                            this.errorTip = res.msg;
                        }
                    });
                }
            }
        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "./myAddress.less";
</style>