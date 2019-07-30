<template>
	<div>
		<div class="header-wrapper">
			<i class="back iconfont icon-jiantou-copy" @click="backPage" v-if="back"></i>
			<slot name="title"></slot>
			<slot name="addAddressBtn"></slot>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
	export default {
		props: {
			back: {
				type: String,
				default: ''
			}
		},

		methods: {
			backPage() {
				this.$router.back();
				this.$store.commit('updateDirection', 'right');
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "./navHeader.less";
</style>