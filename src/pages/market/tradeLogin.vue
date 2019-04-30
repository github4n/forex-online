<template>
	<div id="login">
		<tipsDialog :msg="msgTips"></tipsDialog>
		<topbar title="交易登录"></topbar>
		<back></back>
		<cs title="客服"></cs>
		<div class="page_cont">
			<div class="ipt_row mt15">
				<label for="username">交易账号</label>
				<input type="text" id="username" placeholder="请输入您的交易账号" v-model.trim="username" />
				<div class="change-account" @tap = 'changeAccount'>
					切换账号
				</div>
				<!--<span class="code">切换账号</span>
				<select class="switchUser" v-model="tradeUser">
					<option value="CP1008611">CP1008611</option>
					<option value="CP1008612">CP1008612</option>
					<option value="CP1008613">CP1008613</option>
					<option value="CP1008614">CP1008614</option>
					<option value="CP1008615">CP1008615</option>
					<option value="CP1008616">CP1008616</option>
				</select>-->
			</div>
			<div class="ipt_row">
				<label for="pwd">密码</label>
				<input type="password" id="pwd" placeholder="请输入您的交易密码" v-model.trim="pwd" @keyup.enter="login"/>
				<i class="eye" @tap="eyeEvent"></i>
			</div>
			<btn name="立即登录" color="blue" @tap.native='login'></btn>
			<btn name="开户申请" color="yellow" @tap.native='openApply'></btn>
			<p class="tips">点击登录，表示同意<span class="yellow" @tap="toAgreement">《期货大赛用户协议》</span></p>
			<div class="mark">
				<h3>操盘交易账户≠注册登录账户</h3>
				<p><span>交易账户：</span>申请方案后系统自动发放，用于实盘或模拟盘交易的账号。可查询交易明细，结算后将会更换。</p>
				<p><span>登录账户：</span>使用手机注册后的平台账号，用于登录APP和网站，进行充值、提现、查看资金明细等。</p>
			</div>
		</div>
		<div @tap="cancelAccount" class="shade" v-show="shadeShow"></div>
		<novice v-if="helpshow"></novice>
		<div class="action-sheet" v-show="isShowAccount">
			<ul>
				<li class="account-item" @tap="chooseAccount(item)" v-for="(item,index) in accountList" :key="index">
					<span class="account-item-left">{{item.tranAccount}}</span>
					<span class="account-item-right">￥{{item.traderBond}}</span>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
	import {mapState,mapMutations, mapActions} from 'vuex'
	import topbar from '../../components/Topbar.vue'
	import back from '../../components/back.vue'
	import cs from '../../components/customerService.vue'
	import btn from '../../components/bigBtn.vue'
	import tipsDialog from '../../components/tipsDialog.vue'
	import pro from '../../assets/common.js'
	import novice from '../noviceLogin.vue'
	export default{
		name:'login',
		components: {topbar, back, cs, btn, tipsDialog, novice},
		computed: {
			msgTips: function(){
				return this.msg;
			},
			PATH: function(){
				return this.$store.getters.PATH;
			},
			helpshow(){
				return this.$store.state.isshow.helpshow;
			},
			tradeSocket() {
				return this.$store.state.tradeSocket;
			},
			tradeConfig(){
				return this.$store.state.market.tradeConfig;
			},
			Parameters(){
				return this.$store.state.market.Parameters;
			},
			loginStatus(){
				return this.$store.state.loginStatus;
			},
			// ...mapState('market',[
			// 	'loginStatus'
			// ])
		},
		data(){
			return {
				eyeShow: false,
				msg: '',
				username: '',
				pwd: '',
				token: '',
				secret: '',
				tradeUser: '',
				shadeShow: false,
				accountList:'',
				isShowAccount:false,
			}
		},
		methods:{
			...mapActions([
				'handleTradeMessage',
				'initTrade'
			]),
			eyeEvent: function(e){
				if(this.eyeShow == false){
					this.eyeShow = true;
					$(e.target).addClass("current").siblings("#pwd").attr("type",'text');
				}else{
					this.eyeShow = false;
					$(e.target).removeClass("current").siblings("#pwd").attr("type",'password');
				}
			},
			toAgreement: function(){
				this.$router.push({path: '/agreement'})
			},
			login: function(){
				if(this.username == ''||this.username == undefined||this.username == null){
					this.$children[0].isShow = true;
					this.msg = '请输入您的交易账号';
					return;
				}else if(this.pwd == ''||this.pwd == undefined||this.pwd == null){
					this.$children[0].isShow = true;
					this.msg = '请输入您的交易密码';
					return;
				}else{
					// var tradeSocket = new WebSocket(this.tradeConfig.url_real);
					// //登录
					// tradeSocket.onopen = function(evt){
					// 	if(tradeSocket.readyState==1){ //连接已建立，可以进行通信。
					// 		tradeSocket.send('{"Method":"Login","Parameters":{"ClientNo":"'+ this.username +'","PassWord":"'+ Base64.encode(this.pwd) +'","IsMock":'+this.tradeConfig.model+',"Version":"'+this.tradeConfig.version+'","Source":"'+this.tradeConfig.client_source+'"}}');
					// 	}
					// }.bind(this);
					var param = '{"Method":"Login","Parameters":{"ClientNo":"'+ this.username +'","PassWord":"'+ Base64.encode(this.pwd) +'","IsMock":'+this.tradeConfig.model+',"Version":"'+this.tradeConfig.version+'","Source":"'+this.tradeConfig.client_source+'"}}';
					this.$store.dispatch('initTrade',param);
					// if(this.tradeSocket){
					// 	this.tradeSocket.send('{"Method":"Login","Parameters":{"ClientNo":"'+ this.username +'","PassWord":"'+ Base64.encode(this.pwd) +'","IsMock":'+this.tradeConfig.model+',"Version":"'+this.tradeConfig.version+'","Source":"'+this.tradeConfig.client_source+'"}}');
					// }
					// tradeSocket.onmessage = function(evt) {
					// 	var data = JSON.parse(evt.data);
					// 	var parameters = data.Parameters;
					// 	switch (data.Method){
					// 		case 'OnRtnHeartBeat':
					// 			break;
					// 		case 'OnRspLogin'://登录回复
					// 			if(parameters.Code==0){
					// 				this.shadeShow = true;
					// 				this.$children[0].isShow = true;
					// 				this.msg = '登录成功';
					// 				this.$store.state.market.tradeConfig.username = this.username;
					// 				this.$store.state.market.tradeConfig.password = Base64.encode(this.pwd);
					// 				var userData = {'username': this.username, 'password': Base64.encode(this.pwd)};  
					// 				localStorage.setItem("tradeUser", JSON.stringify(userData));
					// 				setTimeout(function(){
					// 					// this.$router.push({path: '/index', query: {isBack: 1}});
					// 					this.Parameters.forEach(function(e){
					// 						console.log(e.CommodityName);
					// 						if(e.CommodityName == '国际原油'){
					// 							this.$store.state.market.currentdetail = e;
					// 						}
					// 					}.bind(this));
					// 					this.$router.replace({path: '/orderdetail'});
					// 					this.shadeShow = false;
					// 				}.bind(this),100);
					// 			}else{
					// 				this.$children[0].isShow = true;
					// 				this.msg = parameters.Message;
					// 			}
					// 			break;
					// 		default:
					// 			break;
					// 	}
					// }.bind(this);
				}
			},
			//切换账号
			changeAccount(){
				if(this.accountList.length>0){
					this.shadeShow = true;
					this.isShowAccount = true;
				}else if(this.accountList.length==0){
					this.$children[0].isShow = true;
					this.msg = '暂无已注册的交易账号';
				}else{
					this.$children[0].isShow = true;
					this.msg = '未登录平台账号，无法获取已有交易账号,请手动输入';
				}
			},
			//取消切换
			cancelAccount(){
				this.isShowAccount = false;
				this.shadeShow = false;
			},
			//选择账号
			chooseAccount(item){
				this.username = item.tranAccount;
				this.pwd = item.tranPassword;
				this.cancelAccount();
			},
			//获取账号信息
			getAccount:function(index){
				var userInfo = localStorage.user ? JSON.parse(localStorage.user) : '';
				var num =  this.$store.state.appVersion =='v1'?8:99;
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
							this.accountList = [];
							var accountList = data.data.tradeList;
							for(var i = 0;i<accountList.length;i++){
								if(accountList[i].stateType == 4){
									this.accountList.push(accountList[i]);
								}
							}
							if(!this.accountList){
								this.$children[0].isShow = true;
								this.msg = '无法获取方案列表';
								return;
							}
							if(index == 'first'&&this.accountList.length>0){
								this.username = this.accountList[0].tranAccount;
								this.pwd = this.accountList[0].tranPassword;
							}
						}
					}else{
						switch (data.code){
							case '-1':
								this.$children[0].isShow = true;
								this.msg = '账号已变更，请重新重新登录';
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
			openApply: function(){
				this.$router.push({path: '/tradeapply'});
			}
		},
		watch: {
// 			tradeUser: function(n, o){
// 				this.username = n;
// 			},
			loginStatus:function(){
				if(this.$route.name == 'tradeLogin'){
					if(this.loginStatus == 1){
						this.$children[0].isShow = true;
						this.msg = '登录成功';
						this.$store.state.market.tradeConfig.username = this.username;
						this.$store.state.market.tradeConfig.password = Base64.encode(this.pwd);
						var userData = {'username': this.username, 'password': Base64.encode(this.pwd)};
						localStorage.setItem("tradeUser", JSON.stringify(userData));
						this.$store.dispatch('qryHisTrade');
						if(this.$route.query.from == 'profit'){
							this.$router.go(-1);
						}else{
							// this.$store.state.market.positionListCont = [];
							// this.$store.state.market.OnRspQryTradeDealListCont = [];
							// this.$store.state.market.orderListCont = [];
							// this.$store.state.market.OnRspOrderInsertEntrustCont = [];
							// this.$store.state.markethasNostopLossList = [];
							// this.$store.state.hasYesstopLossList = [];
							// this.$store.state.market.conditionList = [];
							// this.$store.state.market.triggerConditionList = [];
							setTimeout(function(){
								// this.$router.push({path: '/index', query: {isBack: 1}});
								this.Parameters.forEach(function(e){
									if(e.CommodityName == '国际原油'){
										this.$store.state.market.currentdetail = e;
									}
								}.bind(this));
								this.$store.state.menuType = 5;
								this.$store.state.isshow.bottomshow = true;
								this.$router.replace({path: '/orderdetail'});
								this.shadeShow = false;
							}.bind(this),100);
						}
					}else if(this.loginStatus == 2){	
						this.$children[0].isShow = true;
						this.msg = this.$store.state.market.tradeLoginSuccessMsg;
						this.$store.state.loginStatus = 0;
					}
				}
			}
		},
		mounted: function(){
			//页面高度计算
			var h = window.screen.height - 20 - $("#topbar").height();
			$("#login").height(h);
			this.$store.state.loginStatus = 0;
			//判断是否进入新手指引
//			if(localStorage.helpeshow){
//				this.helpshow = JSON.parse(localStorage.helpeshow);
//			}
		},
		activated: function(){
			if(localStorage.user&&!this.$route.query.user&&!this.$route.query.pwd){
				this.getAccount('first');
			}else if(this.$route.query.user&&this.$route.query.pwd){
				this.username = this.$route.query.user;
				this.pwd = this.$route.query.pwd;
				this.getAccount('no-first');
			}
			//不更新画图
			this.$store.state.isshow.isklineshow = false;
			this.$store.state.isshow.isfensshow = false;
			this.$store.state.isshow.islightshow =  false;
			
		}
	}
</script>

<style scoped lang="less">
@import url("../../assets/css/base.less");
input:-webkit-autofill{
	-webkit-box-shadow: 0 0 0 1000px #1b1b26 inset;
    -webkit-text-fill-color: #fff;
}
.shade{
	width: 100%;
	height: 100%;
	overflow: hidden;
	background: #000;
	opacity: 0.3;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1010;
}
.action-sheet{
	position: absolute;
	width: 100%;
	bottom: 0;
	background: #242633;
	border-top: solid 1px #1b1b26;
	z-index: 1011;
	.account-item{
		height: 50px;
		line-height: 50px;
		border-bottom: solid 1px #1b1b26;
		display: flex;
		justify-content: space-between;
		padding: 0 10px;
		.account-item-left{
			color:#fff;
			font-size: 16px;
		}
		.account-item-right{
			color:#9da3c4;
			font-size: 14px;
		}
	}
}
/*ip6p及以上*/
@media (min-width:411px) {
    #login{
    	width: 100%;
    	overflow: hidden;
    	background: @deepblue;
    	padding-top: 50px;
    	.page_cont{
    		.mt15{
				margin-top: 15px;
				.change-account{
					position: absolute;
					width: 70px;
					background: #242633;
					color: #a3aacc;
					z-index: 99;
					right: 0;
					border: solid 1px #12121a;
					text-align: center;
					height: 54px;
					line-height: 54px;
					font-size: 14px;
					border-top-right-radius: 5px;
    				border-bottom-right-radius: 5px;
				}
    		}
    		.switchUser{
    			position: absolute;
	            top: 1px;
	            right: 1px;
	            z-index: 5;
	            width: 85px;
	            height: 52px;
	            line-height: 52px;
	            opacity: 0;
    		}
    		.btn{
    			margin-bottom: 15px;
    		}
    		.tips{
    			text-align: center;
    			margin-top: 15px;
    		}
    		.mark{
    			width: 100%;
    			padding: 0 15px;
    			margin-top: 10px;
    			h3{
    				font-size: @fs18;
    				color: @white;
    				padding: 20px 0;
    			}
    			p{
    				line-height: 20px;
    				font-size: @fs14;
    				margin-bottom: 15px;
    				span{
    					color: @white;
    				}
    			}
    		}
    	}
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
	#login{
    	width: 100%;
    	overflow: hidden;
    	background: @deepblue;
    	padding-top: 50px*@ip6;
    	.page_cont{
    		.mt15{
    			margin-top: 15px*@ip6;
				.change-account{
					position: absolute;
					width: 70px*@ip6;
					background: #242633;
					color: #a3aacc;
					z-index: 99;
					right: 0;
					border: solid 1px*@ip6 #12121a;
					text-align: center;
					height: 54px*@ip6;
					line-height: 54px*@ip6;
					font-size: 14px*@ip6;
					border-top-right-radius: 5px*@ip6;
    				border-bottom-right-radius: 5px*@ip6;
				}
    		}
    		.switchUser{
    			position: absolute;
	            top: 1px;
	            right: 1px;
	            z-index: 5;
	            width: 85px*@ip6;
	            height: 52px*@ip6;
	            line-height: 52px*@ip6;
	            opacity: 0;
    		}
    		.btn{
    			margin-bottom: 15px*@ip6;
    		}
    		.tips{
    			text-align: center;
    			margin-top: 15px*@ip6;
    		}
    		.mark{
    			width: 100%;
    			padding: 0 15px*@ip6;
    			margin-top: 10px*@ip6;
    			h3{
    				font-size: @fs18*@ip6;
    				color: @white;
    				padding: 20px*@ip6 0;
    			}
    			p{
    				line-height: 20px*@ip6;
    				font-size: @fs14*@ip6;
    				margin-bottom: 15px*@ip6;
    				span{
    					color: @white;
    				}
    			}
    		}
    	}
    }
}
/*ip5*/
@media(max-width:370px) {
	#login{
    	width: 100%;
    	overflow: hidden;
    	background: @deepblue;
    	padding-top: 50px*@ip5;
    	.page_cont{
    		.mt15{
    			margin-top: 15px*@ip5;
				.change-account{
					position: absolute;
					width: 70px*@ip5;
					background: #242633;
					color: #a3aacc;
					z-index: 99;
					right: 0;
					border: solid 1px*@ip5 #12121a;
					text-align: center;
					height: 54px*@ip5;
					line-height: 54px*@ip5;
					font-size: 14px*@ip5;
					border-top-right-radius: 5px*@ip5;
    				border-bottom-right-radius: 5px*@ip5;
				}
    		}
    		.switchUser{
    			position: absolute;
	            top: 1px;
	            right: 1px;
	            z-index: 5;
	            width: 85px*@ip5;
	            height: 52px*@ip5;
	            line-height: 52px*@ip5;
	            opacity: 0;
    		}
    		.btn{
    			margin-bottom: 15px*@ip5;
    		}
    		.tips{
    			text-align: center;
    			margin-top: 15px*@ip5;
    		}
    		.mark{
    			width: 100%;
    			padding: 0 15px*@ip5;
    			margin-top: 10px*@ip5;
    			h3{
    				font-size: @fs18*@ip5;
    				color: @white;
    				padding: 20px*@ip5 0;
    			}
    			p{
    				line-height: 20px*@ip5;
    				font-size: @fs14*@ip5;
    				margin-bottom: 15px*@ip5;
    				span{
    					color: @white;
    				}
    			}
    		}
    	}
    }
}
</style>