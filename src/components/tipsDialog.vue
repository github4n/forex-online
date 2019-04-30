<template>
	<div id="tipsDialog" v-if="isShow">{{msg}}</div>
</template>

<script>
	export default{
		name:'tipsDialog',
		props: ['msg','time'],
		data(){
			return {
				isShow: false,
				times: 2000
			}
		},
		updated: function(){
			if(this.time) this.times = this.time;
			if(this.isShow == true){
				setTimeout(function(){
					this.isShow = false;
				}.bind(this), this.times);
			}
		}
	}
</script>

<style scoped lang="less">
@import url("../assets/css/base.less");
/*ip6p及以上*/
@media (min-width:411px) {
    #tipsDialog{
    	position: fixed;
    	bottom: 125px;
    	left: 50%;
    	z-index: 99999999;
    	width: 240px;
    	line-height: 24px;
    	padding: 10px;
    	text-align: center;
    	overflow: hidden;
    	margin-left: -110px;
    	background: rgba(0,0,0,.6);
    	color: @white;
    	font-size: @fs14;
    	border-radius: 5px;
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #tipsDialog{
    	position: fixed;
    	bottom: 125px*@ip6;
    	left: 50%;
    	z-index: 99999999;
    	width: 220px*@ip6;
    	line-height: 24px*@ip6;
    	padding: 10px*@ip6;
    	text-align: center;
    	overflow: hidden;
    	margin-left: -110px*@ip6;
    	background: rgba(0,0,0,.6);
    	color: @white;
    	font-size: @fs14*@ip6;
    	border-radius: 5px*@ip6;
    }
}
/*ip5*/
@media(max-width:370px) {
	#tipsDialog{
    	position: fixed;
    	bottom: 125px*@ip5;
    	left: 50%;
    	z-index: 99999999;
    	width: 220px*@ip5;
    	line-height: 24px*@ip5;
    	padding: 10px*@ip5;
    	text-align: center;
    	overflow: hidden;
    	margin-left: -110px*@ip5;
    	background: rgba(0,0,0,.6);
    	color: @white;
    	font-size: @fs14*@ip5;
    	border-radius: 5px*@ip5;
    }
}
</style>