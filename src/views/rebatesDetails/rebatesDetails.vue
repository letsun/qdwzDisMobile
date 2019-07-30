<template>
    <div class="container">
        <nav-header back="true">
            <div class="title" slot="title">我的团队</div>
        </nav-header>
        <div class="rebate-title">
            <div class="rebate-title-left">
                分销商名称
            </div>
            <div class="rebate-title-mid">
                返利佣金
            </div>
            <div class="rebate-title-right">
                操作
            </div>
        </div>
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                
                <div class="rebate-list">

                    <div class="rebate-item" v-for="(item,index) in childDisList" :key="index">
                        <div class="rebate-item-wrapper">
                            <div class="rebate-item-left">{{item.distributorName}}</div>
                            <div class="rebate-item-mid">{{item.toParentRebateSum | currency('￥')}}</div>
                            <div class="rebate-item-right">
                                <a class="rad-btn" href="javascript:void(0);" @click="showEdit(item)">{{text[item.status]}}</a>
                            </div>
                        </div>
                    </div>

                </div>
                <!-- 下拉加载更多 -->
                <loading-tip :loadingTip="loadingTip" :isShow="childDisList.length >= pageNum" :hasNext="hasNext"></loading-tip>
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
                    <a href="javascript:void(0);" class="btn" @click="closeModelWin">取消</a>
                    <a href="javascript:void(0);" class="btn btn-last active" @click="okModelWin(okType)">确定</a>
                </template>
                <template  v-else>
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
                pageSize: 1,
                pageNum: 12,
                hasNext: false,
                loadingTip: '下拉加载更多',
                childDisList: [],
                text: {
                    '0': '禁用',
                    '1': '启用'
                },
                isLoadCompleted: false
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.initChildDisList();
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
                        
                        this.initChildDisList('loading');
                    } else {
                        this.loadingTip = '已经没有更多了';
                    }
                });
            },
            initChildDisList(type) {

                this.$http.get(api.myTeam.getChildDisList, {
                    params: {
                        pageSize: this.pageSize,
                        pageNum: this.pageNum
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {

                        if (type === 'loading') {
                            this.childDisList = [...this.childDisList, ...res.data.childList];
                        } else {
                            this.childDisList = res.data.childList; 
                            this.isLoadCompleted = true;
                        }
                        
                        this.hasNext = res.data.hasNext;
                        
                    } else {
                        util.checkStatus(this, res, this.initChildDisList, type);
                    }
                });
            },
            closeModelWin() {
                this.showModel = false;
            },
            
            okModelWin(type) {
                type();
            },
            showEdit(distributor) {
                this.distributor = distributor;

                this.showModel = true;
                this.isConfirm = true;
                this.okType = this.edit;

                this.errorTip = `您确定要${this.distributor.status === 0 ? '禁用' : '启用'}该分销商吗？`;
            },
            edit() {

                for (let i = 0, len = this.childDisList.length; i < len; i++) {
                    if (this.childDisList[i].distributorId === this.distributor.distributorId) {
                        if (this.distributor.status === 0) {
                            this.distributor.status = 1;
                        } else {
                            this.distributor.status = 0;
                        }
                    }
                }

                this.$http.get(api.myTeam.updateDisStatus, {
                    params: {
                        distributorId: this.distributor.distributorId,
                        status: this.distributor.status
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === 200) {
                        this.showModel = false;
                        this.isConfirm = false;
                        // this.errorTip = '操作成功';
                    } else {
                        util.checkStatus(this, res, this.edit);
                    }
                });
            },
            finish() {
                this.scroll.finishPullUp();
                this.scroll.refresh();
            },
        }
    }
</script>
<style scoped lang="less" rel="stylesheet">
    @import "./rebatesDetails.less";
</style>