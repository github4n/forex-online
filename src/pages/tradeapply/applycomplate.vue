<template>
	<div id="applycomplate">
		<tipsDialog :msg="msgTips"></tipsDialog>
		<tp v-show="accountType==1" title="申请成功"></tp>
		<tp v-show="accountType==2" title="开户成功"></tp>
		<back></back>
		<kf title="客服"></kf>
		<div v-show="accountType==1">
			<ul>
				<li><img src="../../assets/img/complate2.png" /></li>
				<li class="fontyellow">已提交开户申请</li>
				<li class="fontgray">开户申请成功后，系统将自动发送短信通知</li>
				<li class="fontgray">
					<span @tap='toList'>查看方案详情>></span>
				</li>
			</ul>
			<!-- <bbtn name="进入方案详情" @tap='toList'></bbtn> -->
			<!-- <p class="fontgray">
				交易时间： 系统将在30分钟内处理 <br /> 非交易时间： 系统将在下个交易日开盘前处理 <br /> 开户成功系统将短信通知你
			</p> -->
		</div>
		<div class="paySuccess" v-show="accountType==2">
			<div class="pay-img">
				<img src="../../assets/img/complate3.png" />
			</div>
			<div class="pay-title">
				开户申请成功
			</div>
			<div class="check-detail">
				<span @tap='toList'>查看方案详情>></span>
			</div>
			<div class="line"></div>
			<div class="input-content">
				<div class="input-one">
					<span class="input-title">交易账号</span>
					<input type="text" v-model="username"/>
					<div class="eyeicon"></div>
				</div>
				<div class="input-one">
					<span class="input-title">交易密码</span>
					<input type="password" id="inputPassword" v-model="password"/>
					<img v-show="eyeOpen" @tap="eyeEvent" class="eyeicon" src="../../assets/img/eye.png"></img>
					<img v-show="!eyeOpen" @tap="eyeEvent" class="eyeicon" src="../../assets/img/eye_open.png"></img>
				</div>
			</div>
			<div class="login-btn" @click="tradeLogin">
				交易登录
			</div>
		</div>
	</div>
</template>

<script>
	import tp from '../../components/Topbar.vue'
	import bbtn from '../../components/bigBtn.vue'
	import back from '../../components/back.vue'
	import kf from '../../components/customerService.vue'
	import tipsDialog from '../../components/tipsDialog.vue'
	export default {
		name: 'applycomplate',
		components: {
			tp,
			bbtn,
			back,
			kf,
			tipsDialog
		},
		data(){
			return {
				accountType:2, //开户状态 1：开户中 2：开户成功
				username:'',
				password:'',
				eyeOpen:false,
				msg:'',
			}
		},
		computed:{
			msgTips: function(){
				return this.msg;
			},
			loginStatus(){
				return this.$store.state.loginStatus;
			},
			tradeConfig(){
				return this.$store.state.market.tradeConfig;
			},
			Parameters(){
				return this.$store.state.market.Parameters;
			},
		},
		watch:{
			loginStatus:function(){				
				if(this.$route.name == "applycomplate"){
					if(this.loginStatus == 1){
						this.$children[0].isShow = true;
						this.msg = '登录成功';
						this.$store.state.market.tradeConfig.username = this.username;
						this.$store.state.market.tradeConfig.password = Base64.encode(this.pwd);
						var userData = {'username': this.username, 'password': Base64.encode(this.pwd)};  
						localStorage.setItem("tradeUser", JSON.stringify(userData));
						this.$store.dispatch('qryHisTrade');
						setTimeout(function(){
							// this.$router.push({path: '/index', query: {isBack: 1}});
							this.Parameters.forEach(function(e){
								if(e.CommodityName == '国际原油'){
									this.$store.state.market.currentdetail = e;
								}
							}.bind(this));
							this.$router.replace({path: '/orderdetail',query:{type:1}});
							this.shadeShow = false;
						}.bind(this),100);
					}else if(this.loginStatus == 2){	
						this.$children[0].isShow = true;
						this.msg = this.$store.state.market.tradeLoginSuccessMsg;
						this.$store.state.loginStatus = 0;
					}
				}
			},
			$route:function(){
				if(this.$route.name == "applycomplate"){
					if(this.$route.query.isPay == 1){
						this.accountType = 1;
					}else if(this.$route.query.isPay == 4){
						this.accountType = 2;
						this.username = this.$route.query.username;
						this.password = this.$route.query.password;
					}
				}
			}
		},
		methods: {
			//交易登录
			tradeLogin(){
				if(this.username == ''||this.username == undefined||this.username == null){
					this.$children[0].isShow = true;
					this.msg = '请输入您的交易账号';
					return;
				}else if(this.password == ''||this.password == undefined||this.password == null){
					this.$children[0].isShow = true;
					this.msg = '请输入您的交易密码';
					return;
				}
				var param = '{"Method":"Login","Parameters":{"ClientNo":"'+ this.username +'","PassWord":"'+ Base64.encode(this.password) +'","IsMock":'+this.tradeConfig.model+',"Version":"'+this.tradeConfig.version+'","Source":"'+this.tradeConfig.client_source+'"}}';
				this.$store.dispatch('initTrade',param);
			},
			//密码显示或隐藏
			eyeEvent: function(e){
				if(this.eyeOpen == false){
					this.eyeOpen = true;
					document.getElementById('inputPassword').setAttribute('type','text');
				}else{
					this.eyeOpen = false;
					document.getElementById('inputPassword').setAttribute('type','password');
				}
			},
			//查看详情
			toList: function() {
				console.log(1);
				this.$router.push({
					path: '/tradeDetails',
					query: {
						id: this.$route.query.vid,
						type: this.$route.query.isPay, 
					}
				});
			}
		},
		mounted(){
			if(this.$route.query.isPay == 1){
				this.accountType = 1;
			}else if(this.$route.query.isPay == 4){
				this.accountType = 2;
				this.username = this.$route.query.username;
				this.password = this.$route.query.password;
			}
		}
	}
</script>

<style scoped lang="less">
	@import url("../../assets/css/main.less");
	/*ip5*/
	
	@media(max-width:370px) {
		#applycomplate {
			background: #1b1b26;
			height: 736px*@ip5 - 20px;
			padding-top: 50px*@ip5;
		}
		img {
			width: 50px*@ip5;
			height: 50px*@ip5;
		}
		.paySuccess{
			background: #242633;
			height: 100%;
			.pay-img{
				text-align: center;
				background: #242633;
				padding-top: 30px*@ip5;
				padding-bottom: 10px*@ip5;
				img{
					width: 80px*@ip5;
					height: inherit;
				}
			}
			.pay-title{
				color: #fff;
				text-align: center;
				padding-bottom: 20px*@ip5;
			}
			.check-detail{
				height: 50px*@ip5;
				line-height: 50px*@ip5;
				text-align: right;
				color:#a3aacc;
				font-size: 14px*@ip5;
				border-top: solid 1px*@ip5 #1b1b26;
				padding-right: 10px*@ip5;
			}
			.line{
				background: #1b1b26;
				height: 15px*@ip5;
			}
			.input-content{
				padding-top: 20px*@ip5;
				.input-one{
					margin: 0 auto;
					width: 80%;
					display: flex;
					justify-content: left;
					align-items: center;
					background: #1b1b26;
					border: solid 1px*@ip5 #12121a;
					border-radius: 10px*@ip5;
					color:#fff;
					height: 50px*@ip5;
					padding: 0 10px*@ip5;
					margin-bottom: 10px*@ip5;
					.input-title{
						width: 100px*@ip5;
						font-size: 15px*@ip5;
						line-height: 50px*@ip5;
						text-align: center;
					}
					input{
						width: 80%;
						height: 100%;
						background: none;
						border: none;
						margin: 0px*@ip5;
					}
					.eyeicon{
						width: 30px*@ip5;
						height: 15px*@ip5;
					}
				}
			}
			.login-btn{
				background: #f0c700;
				width: 80%;
				margin: 0 auto;
				margin-top: 40px;
				text-align: center;
				height: 50px;
				line-height: 50px;
				border-radius: 100px;
			}
		}
		li {
			text-align: center;
		}
		p {
			text-align: center;
		}
		ul>li:first-child {
			padding-top: 65px*@ip5;
			background: #242633;
		}
		ul>li:nth-child(2) {
			font-size: 16px*@ip5;
			padding-top: 12px*@ip5;
			padding-bottom: 12px*@ip5;
			background: #242633;
		}
		ul>li:nth-child(3) {
			font-size: 14px*@ip5;
			background: #1b1b26;
			height: 30px*@ip5;
			line-height: 30px*@ip5;
			color:#7a7f99;
		}
		ul>li:nth-child(4) {
			font-size: 14px*@ip5;
			background: #242633;
			height: 50px*@ip5;
			line-height: 50px*@ip5;
			color:#7a7f99;
			text-align: right;
		}
		#bigBtn {
			margin-top: 63px*@ip5;
		}
		p {
			margin-top: 10px*@ip5;
			line-height: 25px*@ip5;
			font-size: 14px*@ip5;
		}
	}
	/*ip6*/
	
	@media (min-width:371px) and (max-width:410px) {
		#applycomplate {
			background: #1b1b26;
			height: 736px*@ip6 - 20px;
			padding-top: 50px*@ip6;
		}
		img {
			width: 50px*@ip6;
			height: 50px*@ip6;
		}
		.paySuccess{
			background: #242633;
			height: 100%;
			.pay-img{
				text-align: center;
				background: #242633;
				padding-top: 30px*@ip6;
				padding-bottom: 10px*@ip6;
				img{
					width: 80px*@ip6;
					height: inherit;
				}
			}
			.pay-title{
				color: #fff;
				text-align: center;
				padding-bottom: 20px*@ip6;
			}
			.check-detail{
				height: 50px*@ip6;
				line-height: 50px*@ip6;
				text-align: right;
				color:#a3aacc;
				font-size: 14px*@ip6;
				border-top: solid 1px*@ip6 #1b1b26;
				padding-right: 10px*@ip6;
			}
			.line{
				background: #1b1b26;
				height: 15px*@ip6;
			}
			.input-content{
				padding-top: 20px*@ip6;
				.input-one{
					margin: 0 auto;
					width: 80%;
					display: flex;
					justify-content: left;
					align-items: center;
					background: #1b1b26;
					border: solid 1px*@ip6 #12121a;
					border-radius: 10px*@ip6;
					color:#fff;
					height: 50px*@ip6;
					padding: 0 10px*@ip6;
					margin-bottom: 10px*@ip6;
					.input-title{
						width: 100px*@ip6;
						font-size: 15px*@ip6;
						line-height: 50px*@ip6;
						text-align: center;
					}
					input{
						width: 80%;
						height: 100%;
						background: none;
						border: none;
						margin: 0px*@ip6;
					}
					.eyeicon{
						width: 30px*@ip6;
						height: 15px*@ip6;
					}
				}
			}
			.login-btn{
				background: #f0c700;
				width: 80%;
				margin: 0 auto;
				margin-top: 40px;
				text-align: center;
				height: 50px;
				line-height: 50px;
				border-radius: 100px;
			}
		}
		li {
			text-align: center;
		}
		p {
			text-align: center;
		}
		ul>li:first-child {
			padding-top: 65px*@ip6;
			background: #242633;
		}
		ul>li:nth-child(2) {
			font-size: 16px*@ip6;
			padding-top: 12px*@ip6;
			padding-bottom: 12px*@ip6;
			background: #242633;
		}
		ul>li:nth-child(3) {
			font-size: 14px*@ip6;
			background: #1b1b26;
			height: 30px*@ip6;
			line-height: 30px*@ip6;
			color:#7a7f99;
		}
		ul>li:nth-child(4) {
			font-size: 14px*@ip6;
			background: #242633;
			height: 50px*@ip6;
			line-height: 50px*@ip6;
			color:#7a7f99;
			text-align: right;
		}
		#bigBtn {
			margin-top: 63px*@ip6;
		}
		p {
			margin-top: 10px*@ip6;
			line-height: 25px*@ip6;
			font-size: 14px*@ip6;
		}
	}
	/*ip6p及以上*/
	
	@media (min-width:411px) {
		#applycomplate {
			background: #1b1b26;
			height: 736px - 20px;
			padding-top: 50px;
			height: 100%;
		}
		img {
			width: 50px;
			height: 50px;
		}
		.paySuccess{
			background: #242633;
			height: 100%;
			.pay-img{
				text-align: center;
				background: #242633;
				padding-top: 30px;
				padding-bottom: 10px;
				img{
					width: 80px;
					height: inherit;
				}
			}
			.pay-title{
				color: #fff;
				text-align: center;
				padding-bottom: 20px;
			}
			.check-detail{
				height: 50px;
				line-height: 50px;
				text-align: right;
				color:#a3aacc;
				font-size: 14px;
				border-top: solid 1px #1b1b26;
				padding-right: 10px;
			}
			.line{
				background: #1b1b26;
				height: 15px;
			}
			.input-content{
				padding-top: 20px;
				.input-one{
					margin: 0 auto;
					width: 80%;
					display: flex;
					justify-content: left;
					align-items: center;
					background: #1b1b26;
					border: solid 1px #12121a;
					border-radius: 10px;
					color:#fff;
					height: 50px;
					padding: 0 10px;
					margin-bottom: 10px;
					.input-title{
						width: 100px;
						font-size: 15px;
						line-height: 50px;
						text-align: center;
					}
					input{
						width: 80%;
						height: 100%;
						background: none;
						border: none;
						margin: 0px;
					}
					.eyeicon{
						width: 30px;
						height: 15px;
					}
				}
			}
			.login-btn{
				background: #f0c700;
				width: 80%;
				margin: 0 auto;
				margin-top: 40px;
				text-align: center;
				height: 50px;
				line-height: 50px;
				border-radius: 100px;
			}
		}
		li {
			text-align: center;
		}
		p {
			text-align: center;
		}
		ul>li:first-child {
			padding-top: 65px;
			background: #242633;
		}
		ul>li:nth-child(2) {
			font-size: 16px;
			padding-top: 12px;
			padding-bottom: 12px;
			background: #242633;
		}
		ul>li:nth-child(3) {
			font-size: 14px;
			background: #1b1b26;
			height: 30px;
			line-height: 30px;
			color:#7a7f99;
		}
		ul>li:nth-child(4) {
			font-size: 14px;
			background: #242633;
			height: 50px;
			line-height: 50px;
			color:#7a7f99;
			text-align: right;
		}
		#bigBtn {
			margin-top: 63px;
		}
		p {
			margin-top: 10px;
			line-height: 25px;
			font-size: 14px;
		}
	}
</style>