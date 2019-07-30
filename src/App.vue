<template>
  <div id="app" @touchmove.prevent="">
    <transition :name="direction">
    	<router-view class="view keep"></router-view>
    	<!-- <keep-alive v-if="$route.meta.keepAlive">
    		<router-view class="view keep"></router-view>
    	</keep-alive>
    	<router-view class="view nokeep" v-if="!$route.meta.keepAlive"></router-view> -->
    </transition>
  </div>
</template>
<script>
import 'static/less/common/reset.less';
import 'static/less/common/common.less';
import 'static/less/common/picker.less';

export default {
	name: 'App',
	mounted() {
		this.$store.dispatch('getInfor');

		this.$nextTick(() => {

			if (this.thisloginDistributorId != 0 ) {
				
				let path = window.location.href.split('#')[1];
				
				if (path && path !== '/register') {
					this.$router.push({
						path: path
					});
				} else {
					this.$router.push({
						path: '/personCenter'
					});
				}
				
			}
		});
	},
	computed: {
		direction() {
			return this.$store.state.direction;
		},
		thisloginDistributorId() {
			return this.$store.state.thisloginDistributorId;
		}
	}
}

</script>

<style scoped lang="less" rel="stylesheet">
	@import '../static/less/common/index.less';
	@import '../static/less/common/animate.less';
	#app {
		width: 100%;
		height: 100%;
		overflow: hidden;
		.view {
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			background: #fff;
			box-shadow: 0 0 10px -3px  #000;
		}
	}
</style>