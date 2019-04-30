import Vue from 'vue'
import navbar from './components/NavBar.vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
import tipsDialog from './components/tipsDialog.vue'
import popBox from './forex/components/popBox'
import load from './forex/components/load'
import {mapState,mapActions} from 'vuex'
import echarts from 'echarts'

Vue.use(VueResource);
Vue.component('tipsDialog',tipsDialog);
Vue.component('popBox',popBox);
Vue.component('loading',load);
Vue.config.productionTip = false;
Vue.prototype.$echarts = echarts;

new Vue({
	el: '#app',
	router,
	store,
	template: `
		<div style="height:100%">
     		 <keep-alive>
    				<router-view v-if="!$route.meta.notKeepAlive"></router-view>
			</keep-alive>
				<router-view v-if="$route.meta.notKeepAlive"></router-view>
     		<navbar v-show="navbarshow"></navbar>
     		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
     	</div>
  `,
  	data(){
  		return{
  			msg: '',
  		}
  	},
	components: {navbar, tipsDialog},
	computed: {
		...mapState('forex',[
			'marketSocket',
			'tradeSocket'
		]),
		navbarshow() {
			return this.$store.state.isshow.navBarShow
		},
		islogin() {
			return this.$store.state.account.islogin
		},
		msgTips: function(){
			return this.msg;
		},
		errorMsg(){
			return this.$store.state.market.errorMsg;
		},
		guideshow(){
			return this.$store.state.isshow.guideshow;
		},
		PATH: function(){
			return this.$store.getters.PATH;
		},
		isConnectMarket:function(){
			return this.$store.state.forex.isConnectMarket;
		},
		isConnectTrade:function(){
			return this.$store.state.forex.isConnectTrade;
		},
		isTradeLogin:function(){
			return this.$store.state.forex.isTradeLogin;
		},
		tipsMessage:function(){
			return this.$store.state.forex.tipsMessage;
		},
	},
	watch: {
		isConnectMarket:function(){
			if(!this.isConnectMarket){
				this.initMarketWS();
			}
		},
		isConnectTrade:function(){
			if(!this.isConnectTrade&&this.isTradeLogin){
				this.initTradeWs();
			}
		},
		tipsMessage:function(){
			if(this.tipsMessage.type == 3&&this.$route.name != 'forex_sale'&&this.$route.name != 'forex_order'){
				var message = this.tipsMessage.message;
				var content = '';
				var direct = message.Direction == 0?'买入':'卖出';
				var name = message.CommodityNo;
				if(message.Status == 4&&message.PriceType == 0){
					//条件单开仓
					content = `开仓成功(条件单),${name} ${direct},开仓价${message.OpenPrice}`;
					this.$refs.dialog.isShow = false;
					this.msg = content;
					this.$refs.dialog.isShow = true;
					if(this.$route.name == 'forex_waitDetail'){
						setTimeout(function(){
							this.$router.go(-1);
						}.bind(this),1500);
					}
				}else if(message.Status == 8){
					//止损止盈单平仓
					var closeProfit = 0;
					for(var i=0;i<message.CloseParam.length;i++){
						closeProfit += message.CloseParam[i].CloseProfit;
					}
					content = `平仓成功(止损止盈单),${name} ${direct},平仓盈亏${closeProfit.toFixed(2)}$`;
					this.$refs.dialog.isShow = false;
					this.msg = content;
					this.$refs.dialog.isShow = true;
				}
			}else if(this.tipsMessage.type == 1){
				var message = this.tipsMessage.message;
                if(message == '登出成功'&&this.$route.name != 'forex_home'){
                    // this.$router.push({
                    //     path:'/forex_home'
                    // })
                }
				this.msg = message;
				this.$refs.dialog.isShow = true;
			}
		},
		errorMsg: function(n, o){
//			console.log(n);
			setTimeout(function(){
				this.$refs.dialog.isShow = true;
				this.msg = n.slice(0,-1);
			}.bind(this), 1000);
		},
		guideshow:function(n, o){
			if(n == false){
				this.$refs.dialog.isShow = true;
				this.msg = '行情服务器连接成功';
			}
		}
	},
	methods:{
		...mapActions([
			'initQuoteClient'
		]),
		...mapActions('forex',[
			'initMarketWS',
			'initTradeWs'
		]),
		//刷新保持交易登录
		reConnectTrade(){
			if(localStorage.getItem('forexTradeUser')){
				var tradeInfo = JSON.parse(localStorage.getItem('forexTradeUser'));
				this.$store.state.forex.tradeConfig.ClientNo = tradeInfo.tradeNumber;
				this.$store.state.forex.tradeConfig.PassWord = Base64.encode(tradeInfo.tradePassword);
				this.initTradeWs();
			}
		},
		//网络变化
		networkChange(){
			var _this = this;
			mui.plusReady(function(){
				var netType = plus.networkinfo.getCurrentType();
				switch(netType){
					case plus.networkinfo.CONNECTION_ETHERNET:
					case plus.networkinfo.CONNECTION_WIFI:
					_this.$store.state.networkStatus = true;
					break; 
					case plus.networkinfo.CONNECTION_CELL2G:
					case plus.networkinfo.CONNECTION_CELL3G:
					case plus.networkinfo.CONNECTION_CELL4G:
					_this.$store.state.networkStatus = true;
					break; 
					default:
					_this.$store.state.networkStatus = false;
					break;
				}
				document.addEventListener('netchange',function(){
					var nt = plus.networkinfo.getCurrentType();
					switch(nt){
						case plus.networkinfo.CONNECTION_ETHERNET:
						case plus.networkinfo.CONNECTION_WIFI:
						_this.$store.state.networkStatus = true;
						break; 
						case plus.networkinfo.CONNECTION_CELL2G:
						case plus.networkinfo.CONNECTION_CELL3G:
						case plus.networkinfo.CONNECTION_CELL4G:
						_this.$store.state.networkStatus = true;
						break; 
						default:
						_this.$store.state.networkStatus = false;
						break;
					}
				},false);
				console.log(_this.$store.state.networkStatus);
			})
		},
		//应用前台运行
		foreground(){
			var _this = this;
			mui.plusReady(function(){
				document.addEventListener('resume',function(){
					_this.initQuoteClient();
				},false);
			})
		},
		//应用后台运行
		background(){
			var _this = this;
			mui.plusReady(function(){
				document.addEventListener('pause',function(){
					mui.toast("应用切换后台运行");
				},false);
			})
		},
		//双击返回键后退出程序
		doubleBackToQuit(){
			var _this = this;
			mui.plusReady(function(){
				var first = null;
				mui.back = function(){
					//
					if(_this.$route.meta.layer == 1){
						if(!first){
							first = new Date().getTime();
							mui.toast('再按一次退出应用');
							setTimeout(function(){
								first = null;
							},2000)
						}else{
							if(new Date().getTime() - first < 2000){
								plus.runtime.quit();
								localStorage.removeItem('tradeUser');
							}
						}
					}
				}
			})
		},
		//获取交易地址
		getWSTradeAddress:function(){
			var line = '';
			var channel = this.$store.state.account.packChannel;
			if(channel){
				line = '_';	
			}
			var	params = this.$store.state.appVersion == 'v1'?'3.3'+line+channel:'6.1'+line+channel;
			this.$http.post(this.PATH + '/socket/config/getVersions',{emulateJSON: true},{
				params:{
					appVersions:params,
				}
			}).then(function(e){
				var data = e.body.data;
				if(data==null){
					this.$refs.dialog.isShow = true;
					this.msg = e.body.message;
					return;
				}
				this.$store.state.market.tradeConfig.url_real = data.socketModelUrl;
				var otherWS = JSON.parse(data.socketUrl);
				for(var i=0;i<otherWS.length;i++){
					if(otherWS[i].businessType == 100){
						//外汇交易地址
						this.$store.state.forex.tradeConfig.url_address = otherWS[i].url;
					}
				}
				//初始化行情
				this.initQuoteClient();
				// setTimeout(function(){
				// 	this.reConnectTrade();
				// }.bind(this),3000);
			}.bind(this),function(){
				this.$refs.dialog.isShow = true;
				this.msg = '网络不给力，请稍后再试！'
			})
		},
		getVersion: function(){
			this.$http.post(this.PATH + '/getVersion', {emulateJSON: true}, {
					params: {},
					timeout: 5000
			}).then(function(e) {
				var data = e.body;
				if(data.success == true){
					if(data.code == 1&&data.data.version){
						this.$store.state.version.ios = JSON.parse(data.data.version).iOS.version;
						this.$store.state.version.android = JSON.parse(data.data.version).Android.version;
						var version ={
							ios: JSON.parse(data.data.version).iOS.version,
							android: JSON.parse(data.data.version).Android.version
						}
						localStorage.version = JSON.stringify(version);
					}
				}
			}.bind(this), function() {
				this.$refs.dialog.isShow = true;
				this.msg = '网络不给力，请稍后再试！'
			});
		},
		getHotLine: function(){
			this.$http.post(this.PATH + '/hotline', {emulateJSON: true}, {
				params: {},
				timeout: 5000
			}).then(function(e) {
				var data = e.body;
				if(data.success == true && data.code == 1){
					this.$store.state.account.hotLine = data.data.hotline;
				}
			}.bind(this), function() {
				this.$refs.dialog.isShow = true;
				this.msg = '网络不给力，请稍后再试！'
			});
		},
		
	},
	mounted: function() {
		mui.init();
		if(localStorage.getItem('user')){
			var userInfo = JSON.parse(localStorage.getItem('user'));
			this.$store.state.forex.isAppLogin = true;
			this.$store.state.forex.userInfo.userNum = userInfo.username;
			this.$store.state.forex.userInfo.password = userInfo.password;
			this.$store.state.forex.userInfo.token = userInfo.token;
			this.$store.state.forex.userInfo.secret = userInfo.secret;
		}
		if(localStorage.getItem('colorStyle')){
			var colorStyle = localStorage.getItem('colorStyle');
			if(colorStyle == 1){
                this.$store.state.colorUp="#dd2d4a";
                this.$store.state.colorDown="#3dcc85";
			}else if(colorStyle == 2){
                this.$store.state.colorUp="#3dcc85";
                this.$store.state.colorDown="#dd2d4a";
			}
		}
		document.addEventListener('visibilitychange',function(){
			if(document.visibilityState == 'visible'){
				if((this.isTradeLogin&&!this.tradeSocket)||!this.marketSocket){
					window.location.reload();
				}
			}
		}.bind(this));
		this.initMarketWS();
		this.networkChange();
		//双击退出
		this.doubleBackToQuit();
		//判断前台运行
		this.foreground();
		//判断后台运行
		this.background();
		//取当前版本号
		this.getVersion();
		//获取客服热线
		this.getHotLine();
		//获取交易地址
		this.getWSTradeAddress();
		if(localStorage.helpshow == '关闭'){
			this.$store.state.isshow.helpshow = false;
		}
		if(this.$store.state.isshow.helpshow == true){
			localStorage.helpshow = '关闭';
		}
//		var lg = localStorage.guideshow;
//		if(lg == undefined) {
//			this.$store.state.isshow.guideshow = true;
//		} else {
//			this.$store.state.isshow.guideshow = false;
//		}

		//取URL地址
		var _url = window.location.href;
		var param = _url.split('?')[1];
		if(param != '' && param != undefined){
			param = param.split('=');
			if(param[0] == 'channel'){
				this.$store.state.account.packChannel = param[1].slice(0, -2);
			}
		}
	}
})
