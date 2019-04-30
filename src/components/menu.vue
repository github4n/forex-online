<template>
	<div id="menus">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
		<div>
			<div class="icon icon_menu" @tap='openmenu'></div>
			<div class="shade" v-show="shadeShow" @tap="openShade"></div>
			<div class="menulist" v-show="open">
				<ul>
					<li class="fontgray" @tap="toConditions" v-show="hasTradeLoginShow">条件单</li>
					<li class="fontgray" @tap="toStopMoney" v-show="hasTradeLoginShow">止损止盈</li>
					<li class="fontgray" @tap="toMoneyDetails" v-show="hasTradeLoginShow">资金详情</li>
					<li class="fontgray" @tap="toHistoryTrade" v-show="hasTradeLoginShow">历史成交</li>
					<li class="fontgray" @tap="planDetail(1)" v-show="hasTradeLoginShow&&hasLoginShow">方案详情</li>
					<li class="fontgray" @tap="planDetail(2)" v-show="hasTradeLoginShow&&hasLoginShow">追加保证金</li>
					<li class="fontgray" @tap="planDetail(5)" v-show="hasTradeLoginShow&&hasLoginShow">盈利提取</li>
					<li class="fontgray" @tap="planDetail(3)" v-show="hasTradeLoginShow&&hasLoginShow">快速结算</li>
					<li class="fontgray" @tap.stop="toTradeLogin">{{userTitle}}</li>
					<li class="fontgray" @tap="planDetail(4)" v-show="!hasTradeLoginShow">开户记录</li>
				</ul>
			</div>
		</div>
		<alert title="提示" :line1="promptMsg" :jump="'true'" status="1" ref="alert"></alert>
		<div class="tip-box" v-show="isfinish">
			<div class="tip-content">
				<div class="tip-header">
					<span>快速结算</span>
					<img @click="finishFunc(0)" src="../assets/img/x.png"/>
				</div>
				<div class="tip-text">
					<div>是否终结该开户方案</div>
					<div style="color:#555769">(终结后该交易账户无法使用)</div>
					<div>
						<span class="choose-box" @click.stop="knowResult">
							<img v-show="isKnow" src="../assets/img/finish_gou.png" />
						</span>
						<span class="choose-box-tip">已知悉功能特性</span>
					</div>
				</div>
				<div class="tip-btn">
					<span @click="finishFunc(1)" class="tip-confirm">先看看方案</span><span @click="finishFunc(2)" class="tip-cancel">确定，直接终结</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	var url1 = require('../assets/img/menuo.png');
	var url2 = require('../assets/img/menu.png');
	import alert from './Tradealert.vue'
	import tipsDialog from './tipsDialog.vue'
	export default {
		name: 'menus',
		components: {alert,tipsDialog},
		data() {
			return {
				open: false,
				shadeShow: false,
				hasLoginShow: false, //是否登录平台
				hasTradeLoginShow:false, //是否登录交易
				userTitle: '切换账号',
				promptMsg: '',
				status: 0,
				msg:'',
				isfinish:false, //是否结算方案
				isKnow:false, //是否知悉
				tradeID:'',
			}
		},
		computed: {
			positionListCont(){
				return this.$store.state.market.positionListCont;
			},
			msgTips: function(){
				return this.msg;
			},
			PATH() {
				return this.$store.getters.PATH;
			},
		},
		watch: {
			status: function(n, o){
				if(!n) return;
				localStorage.removeItem("tradeUser");
				this.hasTradeLoginShow = false;
				this.userTitle = '登录账号';
				this.$router.push({path:'/tradeLogin'});
			},
			$route:function(){
				this.open = false;
			}
		},
		methods: {
			toTradeLogin: function(e){
				if(this.hasTradeLoginShow == true){
					this.$refs.alert.isshow = true;
					if(this.positionListCont.length > 0){
						this.promptMsg = '您当前账户中有持仓合约，确认切换？';
					}else{
						this.promptMsg = '确认切换账户？';
					}
				}else{
					this.$router.push({path:'/tradeLogin'});
				}
				this.open = false;
				this.shadeShow = false;
				$(".icon_menu").css('background-image', 'url(' + url2 + ')');
			},
			toHistoryTrade: function(){
				this.open = false;
				this.shadeShow = false;
				$(".icon_menu").css('background-image', 'url(' + url2 + ')');
				this.$router.push({path:'/historyTrade'});
			},
			toConditions: function(){
				this.open = false;
				this.shadeShow = false;
				$(".icon_menu").css('background-image', 'url(' + url2 + ')');
				this.$router.push({path:'/conditions'});
			},
			toStopMoney: function(){
				this.open = false;
				this.shadeShow = false;
				$(".icon_menu").css('background-image', 'url(' + url2 + ')');
				this.$router.push({path:'/stopMoney'});
			},
			toMoneyDetails: function(){
				this.open = false;
				this.shadeShow = false;
				$(".icon_menu").css('background-image', 'url(' + url2 + ')');
				this.$router.push({path:'/moneyDetails'});
			},
			openmenu: function(e) {
				if(this.open == false) {
					this.open = true;
					this.shadeShow = true;
					$(e.target).css('background-image', 'url(' + url1 + ')');
				} else {
					this.open = false;
					this.shadeShow = false;
					$(e.target).css('background-image', 'url(' + url2 + ')');
				}
			},
			openShade: function(e){
				if(this.open == false) {
					this.open = true;
					this.shadeShow = true;
					$(e.target).siblings('.icon').css('background-image', 'url(' + url1 + ')');
				} else {
					this.open = false;
					this.shadeShow = false;
					$(e.target).siblings('.icon').css('background-image', 'url(' + url2 + ')');
				}
			},
			//快速结算
			applyStopOrder: function(id){

				var num =  this.$store.state.appVersion =='v1'?8:99;
				var obj = JSON.parse(localStorage.user);
				this.$http.post(this.PATH + '/user/ftrade/endtrade', {emulateJSON: true}, {
						headers: {
							'token': obj.token,
							'secret': obj.secret
						},
						params: {
							"id": id,
//							"cId": "",
							"businessType": num
						},
						timeout: 5000
					}).then(function(e) {
						var data = e.body;
						if(data.success == true) {
							if(data.code == 1){
								this.$refs.dialog.isShow = true;
								this.msg = '操作成功';
								localStorage.removeItem("tradeUser");
								setTimeout(function(){
									this.$router.push({path:'/tradeDetails',query:{type:6,id:id}});
								}.bind(this), 1000);
							}
						}else{
							switch (data.code){
								case '-1':
									this.$refs.dialog.isShow = true;
									this.msg = '账号已变更，请重新重新登录';
									break;
								case '2':
									this.$refs.dialog.isShow = true;
									this.msg = '系统异常，结算失败';
									break;
								case '3':
									this.$refs.dialog.isShow = true;
									this.msg = '已申请终结';
									break;
								case '4':
									this.$refs.dialog.isShow = true;
									this.msg = '非操盘中';
									break;
								case '5':
									this.$refs.dialog.isShow = true;
									this.msg = '未找到该优惠劵';
									break;
								case '6':
									this.$refs.dialog.isShow = true;
									this.msg = '折扣劵无法使用';
									break;
								case '7':
									this.$refs.dialog.isShow = true;
									this.msg = '方案编号不能为空';
									break;
								case '8':
									this.$refs.dialog.isShow = true;
									this.msg = '参数错误';
									break;
								case '9':
									this.$refs.dialog.isShow = true;
									this.msg = '参数错误';
									break;
								case '10':
									this.$refs.dialog.isShow = true;
									this.msg = '有持仓，不能结算';
									break;
								case '11':
									this.$refs.dialog.isShow = true;
									this.msg = data.message;
									break;
								case '20':
									this.$refs.dialog.isShow = true;
									this.msg = '连接服务不成功';
									break;
								case '22':
									this.$refs.dialog.isShow = true;
									this.msg = '交易账户不存在';
									break;
								default:
									break;
							}
						}
					}.bind(this), function() {
						this.$refs.dialog.isShow = true;
						this.msg = '网络不给力，请稍后再试！'
					});
			},
			knowResult(){
				this.isKnow = !this.isKnow;
			},
			//确认结算方案
			finishFunc(index){
				if(index == 0){
					//关闭提示
					this.isfinish = false;
				}else if(index == 1){
					//看方案
					this.$router.push({path:'/tradeDetails',query:{type:4,id:this.tradeID}});
				}else if(index == 2){
					//终结
					if(this.isKnow){
						this.applyStopOrder(this.tradeID);
					}else{
						this.$refs.dialog.isShow = true;
						this.msg = '请勾选后再结算';
						return;
					}
				}
				this.isfinish = false;
				this.isKnow = false;
			},
			//方案详情
			planDetail:function(index){
				if(index == 3&&this.positionListCont.length > 0){
					this.$refs.dialog.isShow = true;
					this.msg = '当前账户有持仓，无法快速结算';
					return;
				}
				if(index == 5&&this.positionListCont.length > 0){
					this.$refs.dialog.isShow = true;
					this.msg = '当前账户有持仓，无法提取盈利';
					return;
				}
				if(index == 4){
					this.$router.push({path:'historyTradeApply',query:{type:1}});
					return;
				}
				this.open = false;
				this.shadeShow = false;
				var userInfo = localStorage.user ? JSON.parse(localStorage.user) : '';
				var num =  this.$store.state.appVersion =='v1'?8:99;
				var tradeList = [];
				this.$http.post(this.PATH + '/user/ftrade/list', {emulateJSON: true}, {
					headers: {
						'token':  userInfo.token,
						'secret': userInfo.secret
					},
					params: {
						"businessType":num
					},
					timeout: 5000
				}).then(function(e) {
					var data = e.body;
					if(data.success == true ){
						if(data.code == 1){
							tradeList = data.data.tradeList;
							if(!tradeList){
								this.$refs.dialog.isShow = true;
								this.msg = '无法获取方案列表';
							}else{
								for(var i=0,l=tradeList.length;i<l;i++){
									if(tradeList[i].tranAccount == JSON.parse(localStorage.tradeUser).username){
										if(index == 1){
											//方案详情
											this.$router.push({path:'/tradeDetails',query:{type:4,id:tradeList[i].id}});
										}else if(index == 2){
											//最加保证金
											this.$router.push({path: '/addMoney',query: {id:tradeList[i].id,total:tradeList[i].traderTotal,loss:tradeList[i].lineLoss}});
										}else if(index == 3){
											//快速结算
											this.tradeID = tradeList[i].id;
											this.isfinish = true;
										}else if(index == 5){
											//盈利提取
											// if(localStorage.user == 'null'||!localStorage.user){
											// 	this.$refs.dialog.isShow = true;
											// 	this.msg = '请先登录平台账号';
											// 	return
											// }else{
											// 	this.$router.push({path:'profitOut',query:{username:tradeList[i].tranAccount,password:tradeList[i].tranPassword,total:tradeList[i].traderTotal,append:tradeList[i].appendTraderBond,id:tradeList[i].id}});
											// }
											var num = tradeList[i].id;
											this.$http.post(this.PATH + '/user/ftrade/qryProfit', {emulateJSON: true}, {
												headers: {
													'token': userInfo.token,
													'secret': userInfo.secret
												},
												params: {
													id: num
												},
												timeout: 5000
											}).then(function(res){
												if(res.body.code == 1&&res.body.success){
													this.$router.push({path:'profitOut',query:{profit:res.body.data,id:num}});		
												}else{
													this.$children[0].isShow = true;
													this.msg = res.body.message;
												}
											}.bind(this),function(){
												this.$children[0].isShow = true;
												this.msg = '网络不给力，请稍后再试！';
											})	
										}
										return;
									}
								}
							}
						}
					}else{
						switch (data.code){
							case '-1':
								this.$refs.dialog.isShow = true;
								this.msg = '账号已变更，请重新重新登录';
								break;
							default:
								this.$refs.dialog.isShow = true;
								this.msg = '系统错误';
								break;
						}
					}
				}.bind(this), function() {
					this.$refs.dialog.isShow = true;
					this.msg = '网络不给力，请稍后再试！'
				});
			}
		},
		mounted: function() {
			//判断是否已登录平台账号
			if(localStorage.user == undefined||localStorage.user == 'null'||!localStorage.user){
				this.hasLoginShow = false;
			}else{
				this.hasLoginShow = true;
			}
			//判断是否登录交易
			if(localStorage.tradeUser == undefined||localStorage.tradeUser == 'null'||!localStorage.tradeUser){
				this.hasTradeLoginShow = false;
				this.userTitle = '登录账号';
			}else{
				this.hasTradeLoginShow = true;
				this.userTitle = '切换账号';
			}
		},
		updated(){
			//判断是否已登录平台账号
			if(localStorage.user == undefined||localStorage.user == 'null'||!localStorage.user){
				this.hasLoginShow = false;
			}else{
				this.hasLoginShow = true;
			}
			//判断是否登录交易
			if(localStorage.tradeUser == undefined||localStorage.tradeUser == 'null'||!localStorage.tradeUser){
				this.hasTradeLoginShow = false;
				this.userTitle = '登录账号';
			}else{
				this.hasTradeLoginShow = true;
				this.userTitle = '切换账号';
			}
		},
	}
</script>

<style scoped lang="less">
	@import url("../assets/css/main.less");
	@icon_width: 19px;
	@icon_height: 19px;
	@li_width: 88px;
	@li_height: 43px;
	li:last-child {
		border: none;
	}
	/*ip6p及以上*/
	@media (min-width:411px) {
		.tip-box{
			position: fixed;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: rgba(0, 0, 0, 0.8);
			z-index: 1100;
			.tip-content{
				width: 330px;
				height: 200px;
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
				background-color: #1a1924;
				text-align: center;
				color: #949bbb;
				.tip-header{
					height: 42px;
					line-height: 42px;
					font-size: 16px;
					position: relative;
					box-shadow: 0px 0px 1px #000;
					background-color: #242633;
					img{
						position: absolute;
						top: 0;
						right: 0;
						width: 32px;
					}
				}
				.tip-text{
					height: 100px;
					font-size: 14px;
					box-shadow: 0px 0px 1px #000;
					background-color: #242633;
					padding-top: 15px;
					color:#fff;
					.choose-box{
						width: 20px;
						height: 20px;
						border: solid 2px #ffd400;
						border-radius: 5px;
						display: inline-block;
						vertical-align: middle;
						margin-right: 5px;
						position: relative;
						img{
							width: 15px;
							position:absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%,-50%);
						}
					}
					.choose-box-tip{
						color:#7e829c;
					}
				}
				.tip-btn{    
					position: absolute;
					width: 100%;
					bottom: 0;
					left: 0;
					height: 48px;
					line-height: 48px;
					font-size: 14px;
					box-shadow: 0px 0px 1px #000;
					background-color: #242633;
					.tip-confirm{
						display: inline-block;
						width: 50%;
					}
					.tip-cancel{
						display: inline-block;
						width: 50%;
					}
				}
			}
		}
		.icon {
			width: 50px;
			height: 50px;
			background: url('../assets/img/menu.png') no-repeat 15px 15px;
			background-size: 20px 20px;
		}
		.menulist{
			border-radius: 3px;
			background-color: #242633;
			box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5), -1px -1px 1px rgba(0, 0, 0, 0.5);
			position: absolute;
			top: 51px;
			right: 15px;
			z-index: 1111;
		}
		li {
			width: @li_width;
			height: @li_height;
			border-bottom: 1px solid #1f202c;
			line-height: @li_height;
			text-align: center;
			font-size: 14px;
		}
		.shade{
			position: fixed;
			top: 50px*@ip6p;
			left: 0;
			z-index: 1110;
			width: 100%;
			height: 100%;
			overflow: hidden;
			background: transparent;
		}
	}
	
	/*ip6*/
	@media (min-width:371px) and (max-width:410px) {
		.tip-box{
			position: fixed;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: rgba(0, 0, 0, 0.8);
			z-index: 1100;
			.tip-content{
				width: 330px*@ip6;
				height: 200px*@ip6;
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
				background-color: #1a1924;
				text-align: center;
				color: #949bbb;
				.tip-header{
					height: 42px*@ip6;
					line-height: 42px*@ip6;
					font-size: 16px*@ip6;
					position: relative;
					box-shadow: 0px*@ip6 0px*@ip6 1px*@ip6 #000;
					background-color: #242633;
					img{
						position: absolute;
						top: 0;
						right: 0;
						width: 32px*@ip6;
					}
				}
				.tip-text{
					height: 100px*@ip6;
					font-size: 14px*@ip6;
					box-shadow: 0px*@ip6 0px*@ip6 1px*@ip6 #000;
					background-color: #242633;
					padding-top: 15px*@ip6;
					color:#fff;
					.choose-box{
						width: 20px*@ip6;
						height: 20px*@ip6;
						border: solid 2px*@ip6 #ffd400;
						border-radius: 5px*@ip6;
						display: inline-block;
						vertical-align: middle;
						margin-right: 5px*@ip6;
						position: relative;
						img{
							width: 15px*@ip6;
							position:absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%,-50%);
						}
					}
					.choose-box-tip{
						color:#7e829c;
					}
				}
				.tip-btn{    
					position: absolute;
					width: 100%;
					bottom: 0;
					left: 0;
					height: 48px*@ip6;
					line-height: 48px*@ip6;
					font-size: 14px*@ip6;
					box-shadow: 0px*@ip6 0px*@ip6 1px*@ip6 #000;
					background-color: #242633;
					.tip-confirm{
						display: inline-block;
						width: 50%;
					}
					.tip-cancel{
						display: inline-block;
						width: 50%;
					}
				}
			}
		}
		.icon {
			width: 50px*@ip6;
			height: 50px*@ip6;
			background: url('../assets/img/menu.png') no-repeat 15px*@ip6 15px*@ip6;
			background-size: 20px*@ip6 20px*@ip6;
		}
		.menulist{
			position: fixed;
			top: 51px*@ip6;
			right: 15px*@ip6;
			z-index: 1111;
			background-color: #242633;
			border-radius: 3px*@ip6;
			box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5), -1px -1px 1px rgba(0, 0, 0, 0.5);
			li {
				width: @li_width*@ip6;
				height: @li_height*@ip6;
				border-bottom: 1px solid #1f202c;
				line-height: @li_height*@ip6;
				text-align: center;
				font-size: 14px*@ip6;
			}
		}
		.shade{
			position: fixed;
			top: 50px*@ip6;
			left: 0;
			z-index: 1110;
			width: 100%;
			height: 100%;
			overflow: hidden;
			background: transparent;
		}
	}
	/*ip5*/
	@media(max-width:370px) {
		.tip-box{
			position: fixed;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: rgba(0, 0, 0, 0.8);
			z-index: 1100;
			.tip-content{
				width: 330px*@ip5;
				height: 200px*@ip5;
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
				background-color: #1a1924;
				text-align: center;
				color: #949bbb;
				.tip-header{
					height: 42px*@ip5;
					line-height: 42px*@ip5;
					font-size: 16px*@ip5;
					position: relative;
					box-shadow: 0px*@ip5 0px*@ip5 1px*@ip5 #000;
					background-color: #242633;
					img{
						position: absolute;
						top: 0;
						right: 0;
						width: 32px*@ip5;
					}
				}
				.tip-text{
					height: 100px*@ip5;
					font-size: 14px*@ip5;
					box-shadow: 0px*@ip5 0px*@ip5 1px*@ip5 #000;
					background-color: #242633;
					padding-top: 15px*@ip5;
					color:#fff;
					.choose-box{
						width: 20px*@ip5;
						height: 20px*@ip5;
						border: solid 2px*@ip5 #ffd400;
						border-radius: 5px*@ip5;
						display: inline-block;
						vertical-align: middle;
						margin-right: 5px*@ip5;
						position: relative;
						img{
							width: 15px*@ip5;
							position:absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%,-50%);
						}
					}
					.choose-box-tip{
						color:#7e829c;
					}
				}
				.tip-btn{    
					position: absolute;
					width: 100%;
					bottom: 0;
					left: 0;
					height: 48px*@ip5;
					line-height: 48px*@ip5;
					font-size: 14px*@ip5;
					box-shadow: 0px*@ip5 0px*@ip5 1px*@ip5 #000;
					background-color: #242633;
					.tip-confirm{
						display: inline-block;
						width: 50%;
					}
					.tip-cancel{
						display: inline-block;
						width: 50%;
					}
				}
			}
		}
		.icon {
			width: 50px*@ip5;
			height: 50px*@ip5;
			background: url('../assets/img/menu.png') no-repeat 15px*@ip5 15px*@ip5;
			background-size: 20px*@ip5 20px*@ip5;
		}
		.menulist{
			position: fixed;
			top: 51px*@ip5;
			right: 15px*@ip5;
			z-index: 1111;
			background-color: #242633;
			border-radius: 3px*@ip5;
			box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5), -1px -1px 1px rgba(0, 0, 0, 0.5);
			li {
				width: @li_width*@ip5;
				height: @li_height*@ip5;
				border-bottom: 1px solid #1f202c;
				line-height: @li_height*@ip5;
				text-align: center;
				font-size: 14px*@ip5;
			}
		}
		.shade{
			position: fixed;
			top: 50px*@ip5;
			left: 0;
			z-index: 1110;
			width: 100%;
			height: 100%;
			overflow: hidden;
			background: transparent;
		}
	}
</style>