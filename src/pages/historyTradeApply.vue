<template>
	<div id="applydetail">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
		<back></back>
		<topbar title='开户记录'></topbar>
		<!-- <kf title="操盘细则" type="1" status="1" @tap.native="toTradersRules"></kf> -->
		<!-- <kf title="客服"></kf> -->
		<div class="main">
			<div class="type_tab">
				<ul>
					<template v-for="(k, index) in typeList">
						<li :class="{current: typeSelect == index}" @tap="changeType(index,k)">
							<span>{{k.title}}</span>
						</li>
					</template>
				</ul>
			</div>
			<!--tab s-->
			<div class="title">
				<ul>
					<template v-for="(k, index) in tabList">
						<li :class="{current: isselected == index}" @tap="tabEvent(index)">
							<span>{{k.title}}</span>
						</li>
					</template>
				</ul>
			</div>
			<!--tab e-->
			<div class="page_cont" v-if="show">
				<div class="count-box">
					<div class="count-item">
						<div class="count-item-title">投入保证金</div>
						<div class="count-item-value">￥{{onTrade.bond}}</div>
					</div>
					<div class="count-item">
						<div class="count-item-title">方案数</div>
						<div class="count-item-value">{{onTrade.num}}</div>
					</div>
					<div class="count-item">
						<div class="count-item-title">合计提取总额</div>
						<div :class="['count-item-value',onTrade.profit>=0?onTrade.profit==0?'':'value_up':'value_down']"><span v-show="onTrade.profit>0">+</span>￥{{(onTrade.profit).toFixed(2)}}</div>
					</div>
				</div>
				<ul>
					<template v-for="key in tradeList">
						<li @tap="toDetails(key)" :type="key.stateType" :id="key.id" v-show="key.stateType == 4||key.stateType == 2">
							<div class="record_title">
								<span :class="{yellow: key.stateType == 1, red: key.stateType == 2, blue: key.stateType == 4, grey: key.stateType == 5, deepblue: key.stateType == 6}">{{key.stateType | operateState}}</span>
								<i class="icon_arrow fr"></i>
								<span class="fr">{{key.appTime | getTime('yyyy-MM-dd HH:mm')}}</span>
							</div>
							<div class="record_cont">
								<p>交易品种：<span>{{key.businessType | varieties}}</span></p>
								<p>总操盘资金：<span>{{key.traderTotal}}美元</span></p>
								<!-- <p>开仓手数：<span class="spe">{{key.tranLever | operateNumber}}</span></p> -->
								<p>提取总额：<span class="spe">{{key.totalWithdrawal | getNumberTwo}}元</span></p>
								<p>亏损平仓线：<span>{{key.lineLoss}}美元</span></p>
							</div>
						</li>
					</template>
				</ul>
				<!--无操盘记录-->
				<div class="empty" id="empty" v-show="emptyShow1">
					<!-- <i class="icon_none"></i>
					<p>您还没有操盘记录</p> -->
					<p>暂无开户记录，先去开户吧</p>
					<div class="open-btn" @tap="goToOpen">
						立即开户
					</div>
				</div>
			</div>
			<div class="page_cont" v-if="!show">
				<div class="count-box">
					<div class="count-item">
						<div class="count-item-title">投入保证金</div>
						<div class="count-item-value">￥{{offTrade.bond}}</div>
					</div>
					<div class="count-item">
						<div class="count-item-title">方案数</div>
						<div class="count-item-value">{{offTrade.num}}</div>
					</div>
					<div class="count-item">
						<div class="count-item-title">合计盈亏</div>
						<div :class="['count-item-value',offTrade.profit>=0?offTrade.profit==0?'':'value_up':'value_down']"><span v-show="offTrade.profit>0">+</span>$<span>{{(offTrade.profit).toFixed(2)}}</span></div>
					</div>
				</div>
				<ul>
					<template v-for="key in tradeList">
						<li @tap="toDetails(key)" :type="key.stateType" :id="key.id" v-show="key.stateType == 6">
							<div class="record_title">
								<span :class="{yellow: key.stateType == 1, red: key.stateType == 2, blue: key.stateType == 4, grey: key.stateType == 5, deepblue: key.stateType == 6}">{{key.stateType | operateState}}</span>
								<i class="icon_arrow fr"></i>
								<span class="fr">{{key.appTime | getTime('yyyy-MM-dd HH:mm')}}</span>
							</div>
							<div class="record_cont">
								<p>交易品种：<span>{{key.businessType | varieties}}</span></p>
								<p>总操盘资金：<span>{{key.traderTotal}}美元</span></p>
								<!-- <p>开仓手数：<span class="spe">{{key.tranLever | operateNumber}}</span></p> -->
								<p>交易盈亏：<span class="spe">{{key.tranProfitLoss | getNumberTwo}}美元</span></p>
								<p>亏损平仓线：<span>{{key.lineLoss}}美元</span></p>
							</div>
						</li>
					</template>
				</ul>
				<!--无操盘记录-->
				<div class="empty" id="empty" v-show="emptyShow2">
					<i class="icon_none"></i>
					<p>您还没有结算记录</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import topbar from '../components/Topbar.vue'
	import bbtn from '../components/bigBtn.vue'
	import back from '../components/back.vue'
	import kf from '../components/customerService.vue'
	import mr from '../components/moneyradio.vue'
	import tipsDialog from '../components/tipsDialog.vue'
	export default {
		name: 'applydetail',
		components: {topbar, bbtn, back, kf, mr, tipsDialog},
		data() {
			return {
				isselected: 0,
				tabList: [
					{
						title: '交易中'
					},
					{
						title: '已结算'
					}
				],
				typeSelect:0,
				typeList:[
					{
						title:'国际期货',
						code:1,
					},
          //2019-2-18李鑫注释
					// {
					// 	title:'外汇',
					// 	code:2,
					// },
				],
				currentType:1,
				bannerList: [],
				temp: {},
				show: true,
				chooseType: 3000,
				emptyShow1: false,
				emptyShow2:false,
				tradeList: '',
				userInfo: '',
				msg: '',
				bondShow: false,
				scroH: '',
				h: '',
				onTrade:{
					bond:0,
					num:0,
					profit:0,
				},
				offTrade:{
					bond:0,
					num:0,
					profit:0,
				},
				rate:1,
				rateProfit:1,
			}
		},
		created: function(){
			//初始化各种合约数据
			var num =  this.$store.state.appVersion =='v1'?8:99;
			this.$http.post(this.PATH + '/ftrade/params', {emulateJSON: true}, {
				params: {
					"businessType": num
				},
				timeout: 5000
			}).then(function(e) {
				this.temp = e.body.data;
				this.$store.state.tempTradeapply = this.temp;
				
				if(this.$store.state.appVersion == 'v2'){
					this.temp.contractList.forEach(function(o,i){
						o.shoushu = [];
						this.temp.paramList.forEach(function(a){
							var paramList = JSON.parse(a.inMultiple);
							var obj = {};
							obj.traderBond = a.traderBond;
							for(var j =0;j<paramList.length;j++){
								if(paramList[j].commodityNo == o.mainContract){
									obj.shoushu = paramList[j].initialAmount;
									o.name = paramList[j].commodityName;
									break;
								}
							}
							o.shoushu.push(obj);
						}.bind(this));
					}.bind(this));
				}else if(this.$store.state.appVersion == 'v1'){
					this.temp.contractList.forEach(function(o, i) {
						switch(o.tradeType) {
							case 0:   //return '富时A50'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.tranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 6:   //return '国际原油'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.crudeTranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 7:   //return '恒指期货'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.hsiTranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 9:   //return '迷你道指'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.mdtranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 10:   //return '迷你纳指'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.mntranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 11:   //return '迷你标普'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.mbtranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 12:   //return '德国DAX'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.daxtranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 13:   //return '日经225'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.nikkeiTranLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 14:   //return '小恒指'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.lhsiTranActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 15:   //return '美黄金'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.agTranActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 16:   //return 'H股指数'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.hIndexActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 17:   //return '小H股指数'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.xhIndexActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 18:   //return '美铜'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.aCopperActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 19:   //return '美白银'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.aSilverActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 20:   //return '小原油'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.smaActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 21:   //迷你德国DAX指数
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									arr.push(a.daxtranMinActualLever);
									o.shoushu = arr;
								}.bind(this));
								break;
							case 22:   //return '天然气'
								var arr = [];
								this.temp.paramList.forEach(function(a) {
									if(a.naturalGasActualLever==null){
										arr.push(0);
									}else{
										arr.push(a.naturalGasActualLever);
									}
									o.shoushu = arr;
								}.bind(this));
								break;
						}
					}.bind(this));
				}

			}.bind(this), function(e) {});
		},
		filters: {
			filtershoushu2:function(arr,chooseType){
				for(var i=0,k=arr.length;i<k;i++){
					if(chooseType == arr[i].traderBond){
						return arr[i].shoushu;
					}
				}
				return '<空>';
			},
			filtershoushu: function(arr,chooseType){
				switch(chooseType){
					case 3000:
						return arr[0];
						break;
					case 6000:
						return arr[1];
						break;
					case 10000:
						return arr[2];
						break;
					case 12000:
						return arr[3];
						break;
					case 15000:
						return arr[4];
						break;
					case 50000:
						return arr[5];
						break;
					case 100000:
						return arr[6];
						break;
					case 200000:
						return arr[7];
						break;
				}
			},
			moneytype: function(num) {
				if(num) return num.toLocaleString();
			},
			getNumberTwo:function(num){
				return num.toFixed(2);
			},
			cnname: function(a) {
				switch(a) {
					case 0:
						return '富时A50'
						break;
					case 6:
						return '国际原油'
						break;
					case 7:
						return '恒指期货'
						break;
					case 9:
						return '迷你道指'
						break;
					case 10:
						return '迷你纳指'
						break;
					case 11:
						return '迷你标普'
						break;
					case 12:
						return '德国DAX'
						break;
					case 13:
						return '日经225'
						break;
					case 14:
						return '小恒指'
						break;
					case 15:
						return '美黄金'
						break;
					case 16:
						return 'H股指数'
						break;
					case 17:
						return '小H股指数'
						break;
					case 18:
						return '美铜'
						break;
					case 19:
						return '美白银'
						break;
					case 20:
						return '小原油'
						break;
					case 21:
						return '迷你德国DAX指数'  //迷你德国DAX指数
						break;
					case 22:
						return '天然气'
						break;
				}
			},
			varieties: function(e){    //交易品种
				switch(e) {
					case 8:
						return "国际综合";
						break;
					case 7:
						return "恒指期货";
						break;
					case 6:
						return "国际原油";
						break;
					case 0:
						return "富时A50";
						break;
					case 99:
						return "全球期货";
						break;
					case 100:
						return "外汇";
						break;
				}
			},
			operateState: function(e){     //状态
				switch(e) {
					case 1:
						return "开户中";
						break;
					case 2:
						return "结算中";
						break;
					case 3:
						return "待结算";
					case 4:
						return "操盘中";
						break;
					case 5:
						return "开户失败";
						break;
					case 6:
						return "已结算";
						break;
				}
			},
			operateNumber: function(e){
				if(!e){
					return "初始可持仓手数";	
				}else {
					return e +"手";	
				}
			},
			getTime: function(e, format) {
				var t = new Date(e * 1000);
				var tf = function(i) {
					return(i < 10 ? '0' : '') + i
				};
				return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a) {
					switch(a) {
						case 'yyyy':
							return tf(t.getFullYear());
							break;
						case 'MM':
							return tf(t.getMonth() + 1);
							break;
						case 'mm':
							return tf(t.getMinutes());
							break;
						case 'dd':
							return tf(t.getDate());
							break;
						case 'HH':
							return tf(t.getHours());
							break;
						case 'ss':
							return tf(t.getSeconds());
							break;
					};
				});
			}
		},
		computed: {
			PATH() {
				return this.$store.getters.PATH;
			},
			environment(){
				return this.$store.state.environment;
			},
			hotLine: function(){
				return this.$store.state.account.hotLine;
			},
			msgTips: function(){
				return this.msg;
			},
			traderTotal: function() {
				if(this.temp.paramList){
					switch(this.chooseType) {
						case 3000:
							return this.temp.paramList[0].traderTotal;
							break;
						case 6000:
							return this.temp.paramList[1].traderTotal;
							break;
						case 10000:
							return this.temp.paramList[2].traderTotal;
							break;
						case 12000: 
							return this.temp.paramList[3].traderTotal;
							break;
						case 15000:
							return this.temp.paramList[4].traderTotal;
							break;
						case 50000:
							return this.temp.paramList[5].traderTotal;
							break;
						case 100000:
							return this.temp.paramList[6].traderTotal;
							break;
						case 200000:
							return this.temp.paramList[7].traderTotal;
							break;
					}
				}
			},
			lineLoss: function() {
				if(this.temp.paramList){
					switch(this.chooseType) {
						case 3000:
							return this.temp.paramList[0].lineLoss;
							break;
						case 6000:
							return this.temp.paramList[1].lineLoss;
							break;
						case 10000:
							return this.temp.paramList[2].lineLoss;
							break;
						case 12000:
							return this.temp.paramList[3].lineLoss;
							break;
						case 15000:
							return this.temp.paramList[4].lineLoss;
							break;
						case 50000:
							return this.temp.paramList[5].lineLoss;
							break;
						case 100000:
							return this.temp.paramList[6].lineLoss;
							break;
						case 200000:
							return this.temp.paramList[7].lineLoss;
							break;
					}
				}
			}
		},
		methods: {
			toTradersRules: function(){
				this.$router.push({path: '/tradersRules'});
			},
			toAgreement: function(){
				this.$router.push({path: '/agreement'});
			},
			goToOpen(){
				this.$router.push({
					path:'/tradeapply',
					query:{
						type: this.typeSelect
					}
				})
			},
			//选择品种
			changeType(index,item){
				if(this.typeSelect != index){
					this.typeSelect = index;
					this.currentType = item.code;
					this.getOperateDetails();
				}
			},
			tabEvent: function(i){
				this.isselected = i;
				if(i == 1){
					this.show = false;
				}else{
					this.show = true;
				}
			},
			getBanner: function(){
				this.$http.post(this.PATH + '/banner/list', {emulateJSON: true},{
					params: {
						type: 9
					},
					timeout: 5000
				}).then(function(e){
					var data = e.body;
					if(data.success == true){
						if(data.code == 1){
							if(data.data.bannerList == null || data.data.bannerList.length <= 0){
								return;
							}
							this.bannerList = data.data.bannerList;
							this.bannerList.forEach(function(o, i){
								if(this.environment == 'test'){
									o.imgPath = "http://manage.duokongtai.cn/" + o.imgPath;
								}else{
									o.imgPath = "http://manage.duokongtai.cn/" + o.imgPath;
								}
							}.bind(this));
						}
					}else{
						switch (data.code){
							case '2':
								this.$refs.dialog.isShow = true;
								this.msg = '处理失败';
								break;
							default:
								break;
						}
					}
				}.bind(this), function(){
					this.$refs.dialog.isShow = true;
					this.msg = '网络不给力，请稍后再试！';
				});
			},
			choose: function(e) {
				if($(e.target).get(0).tagName == 'DIV') {
					$(e.target).addClass('current');
					$(e.target).parents('li').siblings('li').children().children('div').removeClass('current');
					this.chooseType = parseInt($(e.target).text());
				} else if($(e.target).get(0).tagName == 'SPAN') {
					$(e.target).parent('div').addClass('current');
					$(e.target).parents('li').siblings('li').children().children('div').removeClass('current');
					this.chooseType = parseInt($(e.target).parent('div').text());
				}
			},
			toConfirm: function() {
				this.$router.push({
					path: '/payconfirm',
					query:{
						'chooseType':this.chooseType,
						'traderTotal':this.traderTotal,
						'lineLoss':this.lineLoss
					}
				})
			},
			toDetails: function(key){
				var type = key.stateType;
				var id = key.id;
				if(key.businessType == 8||key.businessType == 99){
					this.$router.push({path: '/tradeDetails', query: {type: type, id: id}});
				}else{
					this.$router.push({path: '/forex_tradeDetail', query: {type: type, id: id, businessType:key.businessType}});
				}
			},
			//获取汇率
			getRate(){
				this.$http.post(this.PATH + '/user/getbalancerate', {emulateJSON: true},{
					headers: {
						'token':  this.userInfo.token,
						'secret': this.userInfo.secret
					},
					params: {
						businessType: 1
					},
					timeout: 5000
				}).then(function(e){
					var data = e.body;
					if(data.success == true){
						if(data.code == 1){
							this.rate = data.data.tradeRate;
							this.rateProfit = data.data.profitRate;
							localStorage.setItem('forexRate',data.data.rate);
						}
					}else{
						switch (data.code){
							case '3':
								this.$refs.dialog.isShow = true;
								this.msg = '用户信息不存在';
								break;
							default:
								break;
						}
					}
				}.bind(this), function(){
					this.$refs.dialog.isShow = true;
					this.msg = '网络不给力，请稍后再试！';
				});
			},
			getOperateDetails: function(){	
				var num = '';
				switch(this.typeSelect){
					case 0:num = this.$store.state.appVersion =='v1'?8:99;break; //国际/全球
					case 1:num = 100;break; //外汇
				}
				this.emptyShow1 = false;
				this.emptyShow2 = false;
				this.$http.post(this.PATH + '/user/ftrade/list', {emulateJSON: true}, {
					headers: {
						'token':  this.userInfo.token,
						'secret': this.userInfo.secret
					},
					params: {
						"businessType":num
					},
					timeout: 5000
				}).then(function(e) {
					var data = e.body;
					if(data.success == true ){
						if(data.code == 1){
							this.tradeList = data.data.tradeList;
							var m = 0;
							var n = 0;
							var obj1 = {
								bond:0,
								num:0,
								profit:0,
							};
							var obj2 = {
								bond:0,
								num:0,
								profit:0,
							}
							for(var i = 0;i<this.tradeList.length;i++){
								if(this.tradeList[i].stateType == 4){
									m = 1;
									obj1.bond += this.tradeList[i].traderBond;
									obj1.num += 1;
									obj1.profit += this.tradeList[i].totalWithdrawal;
								}
								if(this.tradeList[i].stateType == 2){
									m = 1;
									obj1.bond += this.tradeList[i].traderBond;
									obj1.num += 1;
									obj1.profit += this.tradeList[i].totalWithdrawal;
								}
								if(this.tradeList[i].stateType == 6){
									n = 1;
									obj2.bond += this.tradeList[i].traderBond;
									obj2.num += 1;
									obj2.profit += this.tradeList[i].tranProfitLoss;
								}
							}
							this.onTrade = obj1;
							this.offTrade = obj2;
							if(m == 0){
								this.emptyShow1 = true;
							}
							if(n == 0){
								this.emptyShow2 = true;
							}
						}
					}else{
						this.tradeList = [];
						switch (data.code){
							case '-1':
								this.$refs.dialog.isShow = true;
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
			scrollEvent: function(){
				if(this.show == true){
					if(document.getElementById('margin_trade_static') != null){
						var h = document.getElementById('margin_trade_static').scrollTop - document.body.scrollTop + $('#margin_trade_static').height() + 30;
						if(h < 0){
							this.bondShow = true;
						}else{
							this.bondShow = false;
						}
					}
				}
			}
		},
		mounted: function() {
			switch(this.$route.query.recordType){
				case 2:this.currentType = 2;this.typeSelect = 1;break;
			}
			//初始化页面高度
			var h = window.screen.height - $("#topbar").height() - $("#navbar").height() - 20;
//			$(".main").height(h);
			$('.margin_trade>ul>li:first-child>div>div').addClass('current');
			//初始化banner
			this.getBanner();
			var gallery = mui('.mui-slider');
			gallery.slider({
			    interval: 0 //自动轮播周期，若为0则不自动播放，默认为0;
			});
			//保证金置顶
			window.addEventListener('scroll', this.scrollEvent)
//			var obj = document.getElementById('applydetail');
//			obj.addEventListener("touchmove",function(e){
//				e.preventDefault();
//				this.scrollEvent();
//			}.bind(this), false);
		},
		activated: function() {
			switch(this.$route.query.recordType){
				case 2:this.currentType = 2;this.typeSelect = 1;break;
			}
			this.bondShow = false;
			//初始化页面显示申请开户
			this.isselected = 0;
			this.tabEvent(this.isselected);
			// this.show = true;
			//判断是否显示开户记录
			// if(this.$route.query.type == '1'){
			// 	this.isselected = 1;
			// 	this.show = false;
			// }
			//获取本地用户信息
			this.userInfo = localStorage.user ? JSON.parse(localStorage.user) : '';
			//获取操盘记录列表
			this.getOperateDetails();
			this.getRate();
			//判断是否登录
			if(!localStorage.user) {
				this.$router.replace({
					'path': '/login'
				});
			}
		}
	}
</script>

<style scoped lang="less">
@import url("../assets/css/base.less");
@import url("../assets/css/main.less");
.value_up{
	color:#df4547;
}
.value_down{
	color:#27b486;
}
/*ip6p及以上*/
@media (min-width:411px) {
	#applydetail {
		padding: 50px 0;
		overflow-x: hidden;
	}
	.main{
		width: 100%;
	}
	.margin_trade {
		height: 158px;
		overflow: hidden;
		background: #242633;
		padding: 0 15px;
		border-bottom: 5px solid #1b1b26;
		p {
			margin-top: 15px;
		}
		ul{
			li{
				width: 25%;
				margin-top: 13px;
				div{
					margin: 0 auto;
				}
			}
		}
		&.margin_trade_fixed{
			position: fixed;
			top: 50px;
			z-index: 1111;
		}
	}
	.margin_trade_show {
		overflow: hidden;
		background: #242633;
		border-bottom: 5px solid #1b1b26;
		li {
			height: 40px;
			line-height: 40px;
			font-size: 14px;
			padding-left: 15px;
			border-top: 1px solid #1b1b26;
			&:first-child{
				border-top: none;
			}
		}
	}
	.notice {
		height: 70px;
		background: #242633;
		padding-left: 15px;
		font-size: 14px;
		border-top: 5px solid @black;
		p:nth-child(1) {
			margin-top: 15px;
		}
	}
	.datalist {
		width: 100%;
		overflow: hidden;
		background: @deepblue;
		overflow-x: scroll;
		ul{
			width: 950px;
			&.list_head{
				overflow: hidden;
				background: #36394d;
				li span{
					&:first-child{
						color: @blue;
					}
				}
			}
			&.list_cont li span{
				&:nth-child(2){
					color: @blue;
				}
			}
			li{
				float: left;
				height: 54px;
				text-align: center;
				border-top: 1px solid @black;
				border-left: 1px solid @black;
				padding: 0 15px;
				&.odd{
					line-height: 54px;
				}
				&.even{
					padding-top: 7px;
				}
				&:first-child{
					width: 150px;
				}
				&:nth-child(2){
					width: 110px;
				}
				&:nth-child(3){
					width: 220px;
				}
				&:nth-child(4){
					width: 220px;
				}
				&:nth-child(5){
					width: 250px;
				}
				span{
					display: block;
					color: @white;
					font-size: @fs14;
				}
			}
		}
	}
	.info {
		height: 90px;
		border-bottom: 10px solid #1b1b26;
		border-top: 5px solid #1b1b26;
		background: #242633;
		li{
			height: 40px;
			padding-left: 15px;
			line-height: 40px;
			font-size: 14px;
			&:first-child {
				border-bottom: 1px solid #1b1b26;
			}
		}
	}
	.bottom {
		// height: 105px;
		background: #242633;
		li {
			// height: 40px;
			line-height: 40px;
			text-align: center;
			.haveAccount{
				margin-top: 10px;
				color:#fff;
				font-size: 13px;
				span{
					margin-left: 5px;
					color:#ffd400;
				}
			}
			&:first-child {
				border-bottom: 1px solid #1b1b26;
				font-size: 16px * @ip6p;
			}
			&:last-child {
				padding-top: 5px;
			}
		}
	}
	.type_tab{
		width: 100%;
		height: 44px;
		overflow: hidden;
		border-bottom: 10px solid @black;
		background: @deepblue;
		padding: 0px 20px;
		box-sizing: content-box;
		ul{
			display: flex;
		}
		li{
			float: left;
			height: 40px;
			text-align: center;   
			padding: 0 10px;
			span{
				display: inline-block;
				height: 40px;
				line-height: 40px;
				border-bottom: 4px solid @deepblue;
				color: @white;
				font-size: @fs16;
			}
			&.current{
				span{
					border-color: @yellow;	
					color: @yellow;
				}
			}
		}
	}
	.title{
		width: 100%;
		height: 44px;
		overflow: hidden;
		border-bottom: 1px solid @black;
		background: @deepblue;
		li{
			float: left;
			width: 50%;
			height: 40px;
			text-align: center;
			span{
				display: inline-block;
				height: 40px;
				line-height: 40px;
				border-bottom: 4px solid @deepblue;
				color: @white;
				font-size: @fs16;
				color:#7e829c;
			}
			&.current{
				span{
					color: @yellow;
				}
			}
		}
	}
	.mui-slider {
		width: 100%;
		height: 150px;
		background-color: #242633;
		.mui-slider-group {
			height: 150px;
			.mui-slider-item{
				width: 100%;
				height: 150px;
				overflow: hidden;
				padding: 15px;
				img {
					width: 100%;
					height: 120px;
					vertical-align: bottom;
				}
			}
		}
	}
	.page_cont{
		width: 100%;
		overflow-y: scroll;
		.count-box{
			color:#fff;
			display: flex;
			justify-content: space-between;
			padding: 10px 20px;
			background: #242633;
			border-bottom: solid 10px #1b1b26;
			.count-item{
				.count-item-title{
					color:#a3aacc;
					font-size: 14px;
				}
				.count-item-value{
					font-size: 17px;
				}
			}
			.count-item:first-child{
				text-align: left;
			}
			.count-item:nth-child(2){
				text-align: center;
			}
			.count-item:nth-child(3){
				text-align: right;
			}
		}
		li{
			overflow: hidden;
			background: @deepblue;
			margin-bottom: 10px;
			&.settlement{
				background: #2d3040;
			}
			&:last-child{
				margin: 0;
			}
			.record_title{
				height: 44px;
				padding: 0 15px;
				border-bottom: 1px solid @black;
				span{
					line-height: 44px;
					color: #7a7f99;
					font-size: @fs14;
					&:first-child{
						display: inline-block;
						height: 22px;
						line-height: 22px;
						padding: 0 15px;
						overflow: hidden;
						font-size: @fs14;
						color: @black;
						border-radius: 4px;
						margin: 11px;
					}
					&.yellow{
						background: @yellow;
					}
					&.blue{
						background: @blue;
					}
					&.deepblue{
						color: @blue;
						background: @deepblueshallow;
					}
					&.grey{
						background: #ddd;
					}
					&.red{
						color: @white;
						background: #ff5533;
					}
				}
				.icon_arrow{
					width: 24px;
					height: 44px;
					background: url(../assets/img/arrow.png) no-repeat right 15px;
					background-size: 8px 14px;
				}
			}
			.record_cont{
				height: 88px;
				padding: 18px 15px 12px 15px;
				p{
					float: left;
					width: 50%;
					line-height: 28px;
					font-size: @fs16;
					color: @blue;
					&:nth-child(2), &:nth-child(4){
						text-align: right;
					}
					span{
						color: @white;
						&.spe{
							font-size: @fs14;
							color: #7a7f99;
						}
					}
				}
			}
		}
	}
	.empty {
		position: absolute;
		top: 50%;
		left: 50%;
 		margin: -46px 0 0 -207px;
		width: 414px;
		height: 92px;
		overflow: hidden;
		text-align: center;
		.icon_none {
			display: inline-block;
			width: 84px;
			height: 56px;
			overflow: hidden;
			background: url(../assets/img/none.png) no-repeat center center;
			background-size: 100% 100%;
		}
		p {
			text-align: center;
			margin-top: 10px;
		}
		.open-btn{
			margin: 10px auto;
			width: 80%;
			height: 50px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 18px;
			color:#17191e;
			background: #ffd400;
		}
	}
}

/*ip6*/
@media (min-width:371px) and (max-width:410px) {
	#applydetail {
		padding: 50px*@ip6 0;
		overflow-x: hidden;
	}
	.main{
		width: 100%;
	}
	.margin_trade {
		height: 158px*@ip6;
		overflow: hidden;
		background: #242633;
		padding: 0 15px*@ip6;
		border-bottom: 5px*@ip6 solid #1b1b26;
		p {
			margin-top: 15px*@ip6;
		}
		ul{
			li{
				width: 25%;
				margin-top: 13px*@ip6;
				div{
					margin: 0 auto;
				}
			}
		}
		&.margin_trade_fixed{
			position: fixed;
			top: 50px*@ip6;
			z-index: 1111;
		}
	}
	.margin_trade_show {
		overflow: hidden;
		background: #242633;
		border-bottom: 5px*@ip6 solid #1b1b26;
		li {
			height: 40px*@ip6;
			line-height: 40px*@ip6;
			font-size: 14px*@ip6;
			padding-left: 15px*@ip6;
			border-top: 1px solid #1b1b26;
			&:first-child{
				border-top: none;
			}
		}
	}
	.notice {
		height: 70px*@ip6;
		background: #242633;
		padding-left: 15px*@ip6;
		font-size: 14px*@ip6;
		border-top: 5px*@ip6 solid @black;
		p:nth-child(1) {
			margin-top: 15px*@ip6;
		}
	}
	.datalist {
		width: 100%;
		overflow: hidden;
		background: @deepblue;
		overflow-x: scroll;
		ul{
			width: 950px*@ip6;
			&.list_head li span{
				&:first-child{
					color: @blue;
				}
			}
			&.list_cont li span{
				&:nth-child(2){
					color: @blue;
				}
			}
			li{
				float: left;
				height: 54px*@ip6;
				text-align: center;
				border-top: 1px solid @black;
				border-left: 1px solid @black;
				padding: 0 15px*@ip6;
				&.odd{
					line-height: 54px*@ip6;
				}
				&.even{
					padding-top: 7px*@ip6;
				}
				&:first-child{
					width: 150px*@ip6;
				}
				&:nth-child(2){
					width: 110px*@ip6;
				}
				&:nth-child(3){
					width: 220px*@ip6;
				}
				&:nth-child(4){
					width: 220px*@ip6;
					line-height: 13px;
				}
				&:nth-child(5){
					width: 250px*@ip6;
				}
				span{
					display: block;
					color: @white;
					font-size: @fs14*@ip6;
				}
			}
		}
	}
	.info {
		height: 90px*@ip6;
		border-bottom: 10px solid #1b1b26;
		border-top: 5px solid #1b1b26;
		background: #242633;
		li{
			height: 40px*@ip6;
			padding-left: 15px*@ip6;
			line-height: 40px*@ip6;
			font-size: 14px*@ip6;
			&:first-child {
				border-bottom: 1px solid #1b1b26;
			}
		}
	}
	.bottom {
		// height: 105px*@ip6;
		background: #242633;
		li {
			// height: 40px*@ip6;
			line-height: 40px*@ip6;
			text-align: center;
			.haveAccount{
				margin-top: 10px*@ip6;
				color:#fff;
				font-size: 13px*@ip6;
				span{
					margin-left: 5px*@ip6;
					color:#ffd400;
				}
			}
			&:first-child {
				border-bottom: 1px solid #1b1b26;
				font-size: 16px*@ip6p;
			}
			&:last-child {
				padding-top: 5px*@ip6;
			}
		}
	}
	.type_tab{
		width: 100%;
		height: 44px*@ip6;
		overflow: hidden;
		border-bottom: 10px*@ip6 solid @black;
		background: @deepblue;
		padding: 0px*@ip6 20px*@ip6;
		box-sizing: content-box;
		ul{
			display: flex;
		}
		li{
			float: left;
			height: 40px*@ip6;
			text-align: center;   
			padding: 0 10px*@ip6;
			span{
				display: inline-block;
				height: 40px*@ip6;
				line-height: 40px*@ip6;
				border-bottom: 4px*@ip6 solid @deepblue;
				color: @white;
				font-size: @fs16;
			}
			&.current{
				span{
					border-color: @yellow;	
					color: @yellow;
				}
			}
		}
	}
	.title{
		width: 100%;
		height: 44px*@ip6;
		overflow: hidden;
		border-bottom: 1px solid @black;
		background: @deepblue;
		li{
			float: left;
			width: 50%;
			height: 40px*@ip6;
			text-align: center;
			span{
				display: inline-block;
				height: 40px*@ip6;
				line-height: 40px*@ip6;
				border-bottom: 4px*@ip6 solid @deepblue;
				color: @white;
				font-size: @fs16*@ip6;
			}
			&.current{
				span{
					border-color: @yellow;	
					color: @yellow;
				}
			}
		}
	}
	.mui-slider {
		width: 100%;
		height: 150px*@ip6;
		background-color: #242633;
		.mui-slider-group {
			height: 150px*@ip6;
			.mui-slider-item{
				width: 100%;
				height: 150px*@ip6;
				overflow: hidden;
				padding: 15px*@ip6;
				img {
					width: 100%;
					height: 120px*@ip6;
					vertical-align: bottom;
				}
			}
		}
	}
	.page_cont{
		width: 100%;
		overflow-y: scroll;
		.count-box{
			color:#fff;
			display: flex;
			justify-content: space-between;
			padding: 10px*@ip6 20px*@ip6;
			background: #242633;
			border-bottom: solid 10px*@ip6 #1b1b26;
			.count-item{
				.count-item-title{
					color:#a3aacc;
					font-size: 14px*@ip6;
				}
				.count-item-value{
					font-size: 17px*@ip6;
				}
			}
			.count-item:first-child{
				text-align: left;
			}
			.count-item:nth-child(2){
				text-align: center;
			}
			.count-item:nth-child(3){
				text-align: right;
			}
		}
		li{
			overflow: hidden;
			background: @deepblue;
			margin-bottom: 10px*@ip6;
			&.settlement{
				background: #2d3040;
			}
			&:last-child{
				margin: 0;
			}
			.record_title{
				height: 44px*@ip6;
				padding: 0 15px*@ip6;
				border-bottom: 1px solid @black;
				span{
					line-height: 44px*@ip6;
					color: #7a7f99;
					font-size: @fs14*@ip6;
					&:first-child{
						display: inline-block;
						height: 22px*@ip6;
						line-height: 22px;
						padding: 0 15px*@ip6;
						overflow: hidden;
						font-size: @fs14*@ip6;
						color: @black;
						border-radius: 4px*@ip6;
						margin: 11px;
					}
					&.yellow{
						background: @yellow;
					}
					&.blue{
						background: @blue;
					}
					&.deepblue{
						color: @blue;
						background: @deepblueshallow;
					}
					&.grey{
						background: #ddd;
					}
					&.red{
						color: @white;
						background: #ff5533;
					}
				}
				.icon_arrow{
					width: 24px*@ip6;
					height: 44px*@ip6;
					background: url(../assets/img/arrow.png) no-repeat right 15px*@ip6;
					background-size: 8px*@ip6 14px*@ip6;
				}
			}
			.record_cont{
				height: 88px*@ip6;
				padding: 18px*@ip6 15px*@ip6 12px*@ip6 15px*@ip6;
				p{
					float: left;
					width: 50%;
					line-height: 28px*@ip6;
					font-size: @fs16*@ip6;
					color: @blue;
					&:nth-child(2), &:nth-child(4){
						text-align: right;
					}
					span{
						color: @white;
						&.spe{
							font-size: @fs14;
							color: #7a7f99;
						}
					}
				}
			}
		}
	}
	.empty {
		position: absolute;
		top: 50%;
		left: 50%;
 		margin: -46px*@ip6 0 0 -207px*@ip6;
		width: 414px*@ip6;
		height: 92px*@ip6;
		overflow: hidden;
		text-align: center;
		.icon_none {
			display: inline-block;
			width: 84px*@ip6;
			height: 56px*@ip6;
			overflow: hidden;
			background: url(../assets/img/none.png) no-repeat center center;
			background-size: 100% 100%;
		}
		p {
			text-align: center;
			margin-top: 10px*@ip6;
		}
		.open-btn{
			margin: 10px auto;
			width: 80%;
			height: 50px*@ip6;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 18px*@ip6;
			color:#17191e;
			background: #ffd400;
		}
	}
}

/*ip5*/
@media(max-width:370px) {
	#applydetail {
		padding: 50px*@ip5 0;
		overflow-x: hidden;
	}
	.main{
		width: 100%;
	}
	.margin_trade {
		height: 158px*@ip5;
		overflow: hidden;
		background: #242633;
		padding: 0 15px*@ip5;
		border-bottom: 5px*@ip5 solid #1b1b26;
		p {
			margin-top: 15px*@ip5;
		}
		ul{
			li{
				width: 25%;
				margin-top: 13px*@ip5;
				div{
					margin: 0 auto;
				}
			}
		}
		&.margin_trade_fixed{
			position: fixed;
			top: 50px*@ip5;
			z-index: 1111;
		}
	}
	.margin_trade_show {
		overflow: hidden;
		background: #242633;
		border-bottom: 5px*@ip5 solid #1b1b26;
		li {
			height: 40px*@ip5;
			line-height: 40px*@ip5;
			font-size: 14px*@ip5;
			padding-left: 15px*@ip5;
			border-top: 1px solid #1b1b26;
			&:first-child{
				border-top: none;
			}
		}
	}
	.notice {
		background: #242633;
		padding: 15px*@ip5;
		font-size: 14px*@ip5;
		border-top: 5px*@ip5 solid @black;
		p:nth-child(1) {
			margin-top: 15px*@ip5;
		}
	}
	.datalist {
		width: 100%;
		overflow: hidden;
		background: @deepblue;
		overflow-x: scroll;
		ul{
			width: 950px*@ip5;
			&.list_head li span{
				&:first-child{
					color: @blue;
				}
			}
			&.list_cont li span{
				&:nth-child(2){
					color: @blue;
				}
			}
			li{
				float: left;
				height: 54px*@ip5;
				text-align: center;
				border-top: 1px solid @black;
				border-left: 1px solid @black;
				padding: 0 5px*@ip5;
				&.odd{
					line-height: 54px*@ip5;
				}
				&.even{
					padding-top: 7px*@ip5;
					line-height: 16px;
				}
				&:first-child{
					width: 150px*@ip5;
				}
				&:nth-child(2){
					width: 110px*@ip5;
				}
				&:nth-child(3){
					width: 220px*@ip5;
				}
				&:nth-child(4){
					width: 220px*@ip5;
					line-height: 12px;
				}
				&:nth-child(5){
					width: 250px*@ip5;
				}
				span{
					display: block;
					color: @white;
					font-size: @fs14*@ip5;
				}
			}
		}
	}
	.info {
		height: 90px*@ip5;
		border-bottom: 10px solid #1b1b26;
		border-top: 5px solid #1b1b26;
		background: #242633;
		li{
			height: 40px*@ip5;
			padding-left: 15px*@ip5;
			line-height: 40px*@ip5;
			font-size: 14px*@ip5;
			&:first-child {
				border-bottom: 1px solid #1b1b26;
			}
		}
	}
	.bottom {
		// height: 105px*@ip5;
		background: #242633;
		li {
			// height: 40px*@ip5;
			line-height: 40px*@ip5;
			text-align: center;
			.haveAccount{
				margin-top: 10px*@ip5;
				color:#fff;
				font-size: 13px*@ip5;
				span{
					margin-left: 5px*@ip5;
					color:#ffd400;
				}
			}
			&:first-child {
				border-bottom: 1px solid #1b1b26;
				font-size: 16px*@ip5;
			}
			&:last-child {
				padding-top: 5px*@ip5;
			}
		}
	}
	.type_tab{
		width: 100%;
		height: 44px*@ip5;
		overflow: hidden;
		border-bottom: 10px*@ip5 solid @black;
		background: @deepblue;
		padding: 0px*@ip5 20px*@ip5;
		box-sizing: content-box;
		ul{
			display: flex;
		}
		li{
			float: left;
			height: 40px*@ip5;
			text-align: center;   
			padding: 0 10px*@ip5;
			span{
				display: inline-block;
				height: 40px*@ip5;
				line-height: 40px*@ip5;
				border-bottom: 4px*@ip5 solid @deepblue;
				color: @white;
				font-size: @fs16;
			}
			&.current{
				span{
					border-color: @yellow;	
					color: @yellow;
				}
			}
		}
	}
	.title{
		width: 100%;
		height: 44px*@ip5;
		overflow: hidden;
		border-bottom: 1px solid @black;
		background: @deepblue;
		li{
			float: left;
			width: 50%;
			height: 40px*@ip5;
			text-align: center;
			span{
				display: inline-block;
				height: 40px*@ip5;
				line-height: 40px*@ip5;
				border-bottom: 4px*@ip5 solid @deepblue;
				color: @white;
				font-size: @fs16*@ip5;
			}
			&.current{
				span{
					border-color: @yellow;	
					color: @yellow;
				}
			}
		}
	}
	.mui-slider {
		width: 100%;
		height: 150px*@ip5;
		background-color: #242633;
		.mui-slider-group {
			height: 150px*@ip5;
			.mui-slider-item{
				width: 100%;
				height: 150px*@ip5;
				overflow: hidden;
				padding: 15px*@ip5;
				img {
					width: 100%;
					height: 120px*@ip5;
					vertical-align: bottom;
				}
			}
		}
	}
	.page_cont{
		width: 100%;
		overflow-y: scroll;
		.count-box{
			color:#fff;
			display: flex;
			justify-content: space-between;
			padding: 10px*@ip5 20px*@ip5;
			background: #242633;
			border-bottom: solid 10px*@ip5 #1b1b26;
			.count-item{
				.count-item-title{
					color:#a3aacc;
					font-size: 14px*@ip5;
				}
				.count-item-value{
					font-size: 17px*@ip5;
				}
			}
			.count-item:first-child{
				text-align: left;
			}
			.count-item:nth-child(2){
				text-align: center;
			}
			.count-item:nth-child(3){
				text-align: right;
			}
		}
		li{
			overflow: hidden;
			background: @deepblue;
			margin-bottom: 10px*@ip5;
			&.settlement{
				background: #2d3040;
			}
			&:last-child{
				margin: 0;
			}
			.record_title{
				height: 44px*@ip5;
				padding: 0 15px*@ip5;
				border-bottom: 1px solid @black;
				span{
					line-height: 44px*@ip5;
					color: #7a7f99;
					font-size: @fs14*@ip5;
					&:first-child{
						display: inline-block;
						height: 22px*@ip5;
						line-height: 18px;
						padding: 0 15px*@ip5;
						overflow: hidden;
						font-size: @fs14*@ip5;
						color: @black;
						border-radius: 4px*@ip5;
						margin: 11px;
					}
					&.yellow{
						background: @yellow;
					}
					&.blue{
						background: @blue;
					}
					&.deepblue{
						color: @blue;
						background: @deepblueshallow;
					}
					&.grey{
						background: #ddd;
					}
					&.red{
						color: @white;
						background: #ff5533;
					}
				}
				.icon_arrow{
					width: 24px*@ip5;
					height: 44px*@ip5;
					background: url(../assets/img/arrow.png) no-repeat right 15px*@ip5;
					background-size: 8px*@ip5 14px*@ip5;
				}
			}
			.record_cont{
				height: 88px*@ip5;
				padding: 18px*@ip5 15px*@ip5 12px*@ip5 15px*@ip5;
				p{
					float: left;
					width: 50%;
					line-height: 28px*@ip5;
					font-size: @fs16*@ip5;
					color: @blue;
					&:nth-child(2), &:nth-child(4){
						text-align: right;
					}
					span{
						color: @white;
						&.spe{
							font-size: @fs12;
							color: #7a7f99;
						}
					}
				}
			}
		}
	}
	.empty {
		position: absolute;
		top: 50%;
		left: 50%;
 		margin: -46px*@ip5 0 0 -207px*@ip5;
		width: 414px*@ip5;
		height: 92px*@ip5;
		overflow: hidden;
		text-align: center;
		.icon_none {
			display: inline-block;
			width: 84px*@ip5;
			height: 56px*@ip5;
			overflow: hidden;
			background: url(../assets/img/none.png) no-repeat center center;
			background-size: 100% 100%;
		}
		p {
			text-align: center;
			margin-top: 10px*@ip5;
		}
		.open-btn{
			margin: 10px auto;
			width: 80%;
			height: 50px*@ip5;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 18px*@ip5;
			color:#17191e;
			background: #ffd400;
		}
	}
}
</style>
