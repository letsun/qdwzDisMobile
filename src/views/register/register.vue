<template>
    <div @click="closeFn">
        
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <div class="header">
                    <img class="logo" src="./1_1.png" alt="">
                </div>
                <div class="form" ref="formList">
                    <div class="form-item">
                        <input type="text" class="form-input" maxlength="28" v-model="disName" placeholder="请输入分销商名称">
                    </div>
                    
                    <div class="form-item">
                        <input type="text" class="form-input" maxlength="10" v-model="contactName" placeholder="请输入联系人">
                    </div>
                    <div class="form-item">
                        <input type="text" class="form-input" maxlength="11" v-model="mobile" placeholder="请输入手机号">
                    </div>

                    <div class="form-item form-btn-item">

                        <input type="text" class="form-input" maxlength="6" v-model="verCode" placeholder="验证码">
                        <button class="form-btn" :class="{disabled: isDisabled}" @click="getCode" :disabled="isDisabled">{{getCodeText}}</button>
                    </div>

                    <div class="form-item form-prov-item">
                        <div class="inputBox first-inputBox">
                            <div class="form-select" @click.stop="selectProvince">{{province}}</div>
                            <i class="iconfont icon-jiantouarrow486 lxcy-icon"></i>
                        </div>
                        <div class="inputBox cityBox" v-if="isShowCity">
                            <div class="form-select" @click.stop="selectCity">{{city}}</div>
                            <i class="iconfont icon-jiantouarrow486 lxcy-icon"></i>
                        </div>
                        <div class="inputBox areaBox" v-if="isShowArea">
                            <div class="form-select" @click.stop="selectArea">{{district}}</div>
                            <i class="iconfont icon-jiantouarrow486 lxcy-icon"></i>
                        </div>
                    </div>

                    <div class="form-submit">
                        <submit-btn @clickEvent="validate">{{submitTitle}}</submit-btn>
                    </div>

                </div>

                <div class="bottom">深圳市立信创源科技有限公司</div>

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
                <template  v-if="isConfirm">
                    <a href="javascript:void(0);" class="btn active" @click="closeModelWin">取消</a>
                    <a href="javascript:void(0);" class="btn btn-last" @click="okModelWin(okType)">确定</a>
                </template>
                <template  v-else>
                    <a href="javascript:void(0);" class="btn active" @click="closeModelWin">确定</a>
                </template>
            </template>
        </model-win>
        
        <transition name="showPicker">
            <picker v-if="isShowProvincePicker" valueKey="text" :slots="provinceSlots" :itemHeight="itemHeight" :showToolbar="showToolbar" @change="onProvinceChange">
                <a href="javascript:void(0)" @click="cancelPicker" class="cancel-btn">取消</a>
                <a href="javascript:void(0)" @click="okProvincePicker" class="ok-btn">确定</a>
            </picker>
        </transition>
    
        <transition name="showPicker">
            <picker v-if="isShowCityPicker" valueKey="text" :slots="citySlots" :itemHeight="itemHeight" :showToolbar="showToolbar" @change="onCityChange">
                <a href="javascript:void(0)" @click="cancelPicker" class="cancel-btn">取消</a>
                <a href="javascript:void(0)" @click="okCityPicker" class="ok-btn">确定</a>
            </picker>
        </transition>
        
        <transition name="showPicker">
            <picker v-if="isShowAreaPicker" valueKey="text" :slots="areaSlots" :itemHeight="itemHeight" :showToolbar="showToolbar" @change="onAreaChange">
                <a href="javascript:void(0)" @click="cancelPicker" class="cancel-btn">取消</a>
                <a href="javascript:void(0)" @click="okAreaPicker" class="ok-btn">确定</a>
            </picker>
        </transition>
    </div>
</template>

<script>
    // 插件
    import BetterScroll from 'better-scroll';
    import qs from 'qs';
    import cityData from '../../../static/js/cityData';

    // 组件
    import SubmitBtn from '@/components/submitBtn/submitBtn'
    import ModelWin from '@/components/modelWin/modelWin';
    import { Picker } from 'mint-ui';

    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';
    import ip from '@/util/ipAddress';

    export default {
        components: {
            SubmitBtn,
            ModelWin,
            Picker
        },
        data() {
            return {
                submitTitle: '注册',
                showModel:false,
                isConfirm:false,
                isRouter: false,
                okType: '',
                modelTitle:'温馨提示',
                errorTip:'',
                disName:'',
                contactName:'',
                mobile:'',
                verCode:'',
                getCodeText:'获取验证码',
                countdown: 60,
                isDisabled:false,
                province: '省',
                city: '市',
                district: '区',
                isShowCity: true,
                isShowArea: true,
                provinceSlots: [
                    {
                      defaultIndex: 0,
                      values: cityData,
                      className: 'orderStatus',
                      textAlign: 'center'
                    }
                ],
                citySlots: [
                    {
                      defaultIndex: 0,
                      values: [{text: '请选择', sub: [], type: 0}],
                      className: 'orderStatus',
                      textAlign: 'center'
                    }
                ],
                areaSlots: [
                    {
                      defaultIndex: 0,
                      values: [{text: '请选择', sub: [], type: 0}],
                      className: 'orderStatus',
                      textAlign: 'center'
                    }
                ],
                itemHeight: 69,
                showToolbar: true,
                isShowProvincePicker: false,
                isShowCityPicker: false,
                isShowAreaPicker: false,
                waitReceiveProvince: '',
                waitReceiveCity: '',
                citySub: [],
                waitReceiveArea: '',
                areaSub: []
            }
        },
        mounted() {
            if (this.thisloginDistributorId != 0) {
                this.$store.commit('updateDirection', '');
                this.$router.push({
                    path: '/personCenter'
                });
                return;
            }

            this.$nextTick(() => {

                this.initScroll();
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
                    scrollbar: {
                        fade: true
                    },
                    click: true
                });
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;

                if (this.isRouter) {
                    window.location.href = `${ip}/shop/wx/${this.mallType}/${this.companyId}?disId=${this.thisloginDistributorId}&pType=1`;
                }
            },
            okModelWin(type) {
                type();
            },
            getCode() {

                let phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;

                if (!this.mobile) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '请输入手机号码';
                    return;
                }

                if (!phoneReg.test(this.mobile)) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '手机号码格式有错';
                    return;
                }

                this.$http.get(api.register.getVerCode, {
                   params: {
                    mobile: this.mobile
                   }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.errorTip = '验证码发送成功,请注意查收';
                        this.showModel = true;
                        this.isConfirm = false;
                        this.isRouter = false;

                        this.verCodeCountdown();
                    } else {
                        util.checkStatus(this, res, this.getCode);
                    }
                });
            },
            verCodeCountdown() {
                let timer = null;

                this.isDisabled = true;

                this.getCodeText = '('+this.countdown+')秒后重发';

                timer = setInterval(() => {
                    this.countdown--;
                    if (this.countdown < 10) {
                        this.countdown = '0' + this.countdown;
                    }

                    this.getCodeText = '('+this.countdown+')秒后重发';

                    if (this.countdown <= 0) {
                        this.isDisabled=false;
                        this.getCodeText = '获取验证码';
                        clearInterval(timer);
                        this.countdown = 60;
                    }
                }, 1000);
            },
            selectProvince() {
                this.inputBlur();
                this.isShowProvincePicker = true;
                this.isShowCityPicker = false;
                this.isShowAreaPicker = false;
            },
            selectCity() {
                this.inputBlur();
                this.isShowProvincePicker = false;
                this.isShowCityPicker = true;
                this.isShowAreaPicker = false;
            },
            selectArea() {
                this.inputBlur();
                this.isShowProvincePicker = false;
                this.isShowCityPicker = false;
                this.isShowAreaPicker = true;
            },
            onProvinceChange(picker, values) {
                this.waitReceiveProvince = values[0].text;
                this.citySub = values[0].sub;
            },
            okProvincePicker() {
                this.cancelPicker();
                this.citySlots[0].values = [{text: '请选择', sub: [], type: 0}];
                this.areaSlots[0].values = [{text: '请选择', sub: [], type: 0}];
                this.city = '市';
                this.district = '区';
                
                if (this.waitReceiveProvince !== '请选择') {
                    this.province = this.waitReceiveProvince;
                    this.citySlots[0].values = this.citySub;
                } else {
                   this.province = '省' 
                }
            },
            onCityChange(picker, values) {
                this.waitReceiveCity = values[0].text;
                this.areaSub = values[0].sub;
            },
            okCityPicker() {
                this.cancelPicker();
                this.areaSlots[0].values = [{text: '请选择', sub: [], type: 0}];
                this.district = '区';

                if (this.waitReceiveCity !== '请选择') {
                    this.city = this.waitReceiveCity;
                    if (typeof this.areaSub !== 'undefined' && this.areaSub.length) {
                        this.areaSlots[0].values = this.areaSub;
                        this.isShowArea = true;
                    } else {
                        this.isShowArea = false;
                    }
                } else {
                    this.city = '市';
                    this.isShowArea = true;
                }
            },
            onAreaChange(picker, values) {
                this.waitReceiveArea = values[0].text;
            },
            okAreaPicker() {
                this.cancelPicker();
                if (this.waitReceiveCity !== '请选择') {
                    this.district = this.waitReceiveArea;
                }
            },
            cancelPicker() {
                this.isShowProvincePicker = false;
                this.isShowCityPicker = false;
                this.isShowAreaPicker = false;
            },

            validate() {
                let phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
                let codeReg = /^\d{6}$/;

                this.inputBlur();

                if (!util.trim(this.disName)) {
                    this.showModel = true;
                    this.errorTip = '分销商名称不能为空';
                    return;
                }

                if (!util.trim(this.contactName)) {
                    this.showModel = true;
                    this.errorTip = '联系人不能为空';
                    return;
                }

                if (!util.trim(this.mobile)) {
                    this.showModel = true;
                    this.errorTip = '手机号不能为空';
                    return;
                }
                if (!phoneReg.test(this.mobile)) {
                    this.showModel = true;
                    this.errorTip = '手机号格式不正确';
                    return;
                }

                if (!this.verCode) {
                    this.showModel = true;
                    this.errorTip = '验证码不能为空';
                    return;
                }

                if (!codeReg.test(this.verCode)) {
                    this.showModel = true;
                    this.errorTip = '验证码格式不正确';
                    return;
                }

                if (this.province === '省') {
                    this.showModel = true;
                    this.errorTip = '省份不能为空';
                    return;
                }

                if (this.city === '请选择') {
                    this.showModel = true;
                    this.errorTip = '城市不能为空';
                    return;
                }

                if (this.district === '请选择') {
                    this.showModel = true;
                    this.errorTip = '区域不能为空';
                    return;
                }

                this.submit();

            },
            submit() {
                
                if (this.submitTitle === '注册') {
                    this.submitTitle = '正在注册中...';
                } else {
                    return;
                }
                
                this.$http.post(api.register.register, qs.stringify({
                    city: this.city,
                    contactName: this.contactName,
                    disName: this.disName,
                    district: this.district,
                    mobile: this.mobile,
                    province: this.province,
                    verCode: this.verCode
                })).then((response) => {
                    let res = response.data;

                    this.submitTitle = '注册';

                    if (res.code === statusCode.SUCCESS) {
                        this.errorTip = '注册成功';
                        this.showModel = true;
                        this.isConfirm = false;
                        this.isRouter = true;
                    } else {
                        util.checkStatus(this, res, this.submit);
                    }
                });
            },
            closeFn() {
                this.isShowProvincePicker = false;
                this.isShowCityPicker = false;
                this.isShowAreaPicker = false;
            },
            inputBlur() {
                let inputs = this.$refs.formList.getElementsByTagName('input');
                
                for (let i = 0, len = inputs.length; i < len; i++) {
                    inputs[i].blur();
                }
            }

        }
    }
</script>

<style lang="less" scoped rel="stylesheet">
    @import "register.less";
</style>