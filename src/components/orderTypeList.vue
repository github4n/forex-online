<template>
	<div id="orderTypeList" v-if="isshow">
		<div class="bg" @tap="clickEvent"></div>
		<div class="list">
			<ul>
				<template v-for="key in parameters">
					<li :value="key.CommodityName + '&' + key.CommodityNo + '&' + key.MainContract" @tap="selectEvent">{{key.CommodityName}} {{key.CommodityNo}} {{key.MainContract}}</li>
				</template>
			</ul>
		</div>
	</div>
</template>

<script>
	import tipsDialog from '../components/tipsDialog.vue'
	import pro from '../assets/common.js'
	export default {
		name: 'orderTypeList',
		components: {
			tipsDialog
		},
		props: [],
		data() {
			return {
				isshow: false,
				tradeTime:[],
				commodityNo:'',
				commodityCode:'',
				nextTrade:'',
			}
		},
		computed:{
			parameters(){
				return this.$store.state.market.Parameters;
			},
			PATH: function(){
				return this.$store.getters.PATH;
			},
		},
		methods: {
			selectEvent: function(e){
				this.commodityCode = $(e.currentTarget).attr('value');
				this.commodityNo = $(e.currentTarget).attr('value').split('&')[1];
				// this.$store.state.market.selectId = this.commodityCode;
				this.canTrade();
				this.isshow = false;
			},
			clickEvent: function(){
				this.isshow = false;
			},
			//判断是否可交易
			canTrade(){
				if(localStorage.user=='null'||!localStorage.user){
					//未登录平台账号
					this.$parent.$refs.dialog.isShow = true;
					this.$parent.msg = '暂未登录平台账号,无法获取交易时间';
					return;
				}
				var userInfo = JSON.parse(localStorage.user);
				this.tradeTime = [];

				var fb = new FormData();
				fb.append("commodityCode",this.commodityCode);

        this.$http.post(this.PATH + '/commodity/tradeRules',{
          commodityCode: this.commodityNo
        },{emulateJSON: true},{
          headers: {
            'token':  userInfo.token,
            'secret': userInfo.secret
          }
        }).then(function(e){
          var data = e.body;
          if(data.success == true){
            if(data.code == 1){
              var timeList = JSON.parse(data.data.tradingTimeSeg.substr(0,data.data.tradingTimeSeg.length-1));
							var timeRange = [];
              for(var i=0;i<timeList.length;i++){
                timeRange.push(timeList[i].TimeBucketBeginTime);
                if(timeRange.length == 2){
                  this.tradeTime.push(timeRange);
                  timeRange = [];
                }
              }
              this.getCurrentTime();
            }
          }else{
            switch (data.code){
              case '3':
                this.$parent.$refs.dialog.isShow = true;
                this.$parent.msg = '用户信息不存在';
                break;
              default:
                break;
            }
          }
        }.bind(this), function(){
          this.$parent.$refs.dialog.isShow = true;
          this.$parent.msg = '网络不给力，请稍后再试！';
        });

				// this.$http.post(this.PATH + '/commodity/tradeRules', {emulateJSON: true},{
				// 	headers: {
				// 		'token':  userInfo.token,
				// 		'secret': userInfo.secret
				// 	},
				// 	params: {
				// 		commodityCode: this.commodityNo
				// 	},
				// 	timeout: 5000
				// }).then(function(e){
				// 	var data = e.body;
				// 	if(data.success == true){
				// 		if(data.code == 1){
				// 			var timeList = data.data.tradingTimeSeg;
				// 			var timeRange = [];
				// 			for(var i=0;i<timeList.length;i++){
				// 				timeRange.push(JSON.parse(timeList[i]).TimeBucketBeginTime);
				// 				if(timeRange.length == 2){
				// 					this.tradeTime.push(timeRange);
				// 					timeRange = [];
				// 				}
				// 			}
				// 			this.getCurrentTime();
				// 		}
				// 	}else{
				// 		switch (data.code){
				// 			case '3':
				// 				this.$parent.$refs.dialog.isShow = true;
				// 				this.$parent.msg = '用户信息不存在';
				// 				break;
				// 			default:
				// 				break;
				// 		}
				// 	}
				// }.bind(this), function(){
				// 	this.$parent.$refs.dialog.isShow = true;
				// 	this.$parent.msg = '网络不给力，请稍后再试！';
				// });
			},
			//获取当前时间
			getCurrentTime(){
				var currentYMD = pro.getDate(new Date().getTime(),'y-m-d');
				currentYMD = currentYMD.replace(/-/g,'/');
				var currentTime = new Date().getTime();
				for(var i = 0;i<this.tradeTime.length;i++){
					if(this.tradeTime[i][0]<this.tradeTime[i][1]){
						//开始时间小于结束时间说明开始和结束是同一天
						if(currentTime>new Date(currentYMD+' '+this.tradeTime[i][0]).getTime()&&currentTime<new Date(currentYMD+' '+this.tradeTime[i][1]).getTime()){
							//在交易是时间中
							this.$store.state.market.selectId = this.commodityCode;
							return;
						}else{
						}
					}else{
						//说明结束是第二天
						if(currentTime>new Date(currentYMD+' '+this.tradeTime[i][0]).getTime()||currentTime<new Date(currentYMD+' '+this.tradeTime[i][1]).getTime()){
							//在交易是时间中
							this.$store.state.market.selectId = this.commodityCode;
							return;
						}else{
						}
					}
				}
				this.nextTrade = this.tradeTime[0][0];
				this.$parent.$refs.dialog.isShow = true;
				this.$parent.msg = '休市中,下次交易时间' + this.nextTrade;
			},
		},
	}
</script>

<style scoped lang="less">
@import url("../assets/css/base.less");
.bg{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1110;
	background: #000;
	opacity: 0.7;
}
/*ip6p及以上*/
@media (min-width:411px) {
	.list{
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 1111;
		width: 100%;
		height: 225px;
		overflow-y: scroll;
		background: @deepblue;
		li{
			height: 45px;
			line-height: 45px;
			text-align: center;
			border-bottom: 1px solid @black;
			color: @blue;
			font-size: @fs16;
		}
	}
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
	.list{
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 1111;
		width: 100%;
		height: 225px*@ip6;
		overflow-y: scroll;
		background: @deepblue;
		li{
			height: 45px*@ip6;
			line-height: 45px*@ip6;
			text-align: center;
			border-bottom: 1px solid @black;
			color: @blue;
			font-size: @fs16*@ip6;
		}
	}
}
/*ip5*/
@media(max-width:370px) {
	.list{
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 1111;
		width: 100%;
		height: 225px*@ip5;
		overflow-y: scroll;
		background: @deepblue;
		li{
			height: 45px*@ip5;
			line-height: 45px*@ip5;
			text-align: center;
			border-bottom: 1px solid @black;
			color: @blue;
			font-size: @fs16*@ip5;
		}
	}
}
</style>
