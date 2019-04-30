<template>
	<div id="service">
		<topbar title="在线客服"></topbar>
		<back></back>
		<iframe :src="iframe"></iframe>
	</div>
</template>

<script>
	import topbar from '../components/Topbar.vue'
	import back from '../components/back.vue'
	export default{
		name:'service',
		//组件
		components:{
			topbar,
			back
		},
		computed: {
			userInfo: function(){
				return this.$store.state.account;
			},
			PATH: function(){
				return this.$store.getters.PATH;
			},
			iframe: function() {
				// return  /*this.PATH + */this.$store.state.account.currentUrlHead+'//www.vs.com/topic/consistentBeauty/qiw_quoteApp_service.html?phone=' + this.$store.state.account.phone + '&userName=' + this.$store.state.account.username;
				return 'https://u7.53kf.com/m.php?cid=72171124&style=1&keyword=http%3A%2F%2Flocalhost%3A8090%2F&referer=http%3A%2F%2Flocalhost%3A8090%2F%23%2Fservice&guest_id=10543085698007&tpl=crystal_blue&uid=98a51b1cb6f487fd2c00a95132ed2134&u_stat_id=&talktitle=vue-professiomal&tfrom=50&device=&zdkf_type=1&kf=&kflist=off'
			}
		},
		mounted(){
			// this.init();
		},
		methods: {
			init(){
				var _53code=document.createElement("script");
				_53code.src = 'https://tb.53kf.com/code/code/10171124/1'; 
				var s = document.getElementsByTagName("script")[0];s.parentNode.insertBefore(_53code, s);
			}
		}
	}
</script>
<style scoped lang="less">
	iframe {
		width: 100%;
		height: 100%;
		position: fixed;
		bottom: 0;
		border: none;
	}
</style>