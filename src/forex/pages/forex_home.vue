<template>
	<div id="forex-home" class="mui-off-canvas-wrap mui-draggable">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
		<aside class="mui-off-canvas-right">
			<div class="mui-scroll-wrapper">
				<div class="mui-scroll">
					<hidden-menu></hidden-menu>
				</div>
			</div>
		</aside>
		<div class="mui-inner-wrap">
			<div id="header-box">
				<header-bar :showBack="false" :showMenu="true">
					<span slot="title" class="header-title title-left">
						{{headerTitle}}
					</span>
				</header-bar>
			</div>
			<div class="connect-tip" v-show="netChange">
				<div class="connect-box offline" v-show="!networkStatus||isShowNoConnect">
					<img src="../../assets/img/forex/notice1.png"/>
					<span>
						行情连接断开，请检查网络
					</span>
				</div>
				<div class="connect-box online" v-show="networkStatus&&isShowNetTip">
					<span>
						<img src="../../assets/img/forex/notice2.png"/>
					</span>
					<span>
					网络连接成功
					</span>
				</div>
			</div>
			<div class="mui-scroll-wrapper market-scroll-wrapper">
				<div class="mui-scroll market-scroll">
					<div class="market">
						<ul>
							<li class="market-item" v-for="(item,index) in forexCommodity" :key="index">
								<div :class="['market-quota',selectIndex == index?'market-quota-active':'']" @tap.stop="chooseMarket(index,item)">
									<div class="forex-up">
										<div class="forex-up-left">
											<span class="forex-up-left-1">{{item.commodity_name}}</span>
											<span class="forex-up-left-2">{{item.commodity_no.split('.')[0]+item.commodity_no.split('.')[1]}}</span>
											<span class="forex-up-left-3" v-if="item.positionList&&item.positionList.length>0">{{item.positionList?item.positionList.length:0}}</span>
										</div>
										<div class="forex-up-right" v-if="item.quotaData">
											<span>点差</span>{{Math.abs(item.quotaData[11]-item.quotaData[13])/item.mini_ticker_size | getTwoNum}}
										</div>
									</div>
									<div class="forex-down">
										<div class="forex-down-left">
											<span class="forex-down-title" @tap.stop="goToOrder(1,item)">卖出</span><span class="forex-down-value" :style="item.quotaData&&item.quotaData[11]-item.quotaData[10]>0?{'color':colorUp}:{'color':colorDown}">{{item.quotaData?(item.quotaData[13]).toFixed(item.dot_size):'获取中'}}</span>
										</div>
										<div class="forex-down-right">
											<span class="forex-down-value" :style="item.quotaData&&item.quotaData[13]-item.quotaData[10]>0?{'color':colorUp}:{'color':colorDown}">{{item.quotaData?(item.quotaData[11]).toFixed(item.dot_size):'获取中'}}</span><span class="forex-down-title" @tap.stop="goToOrder(2,item)">买入</span>
										</div>
									</div>
									<span class="arrow-icon arrow-span" @tap.stop="toDetail(index,item)"></span>
									<img class="arrow-icon" src="../../assets/img/forex/arrow.png"/>
								</div>
								<div class="market-position" v-if="item.positionList&&selectIndex == index">
									<ul>
										<li class="postion-item" v-for="(i,index2) in item.positionList" :key="index2">
											<div class="position-left">
												<span class="status" v-show="i.Status == 4||i.Status == 7" :style="(i.Direction==0?item.quotaData[11]>i.OpenPrice:item.quotaData[11]<i.OpenPrice)>0?{'border-bottom-color':colorUp}:{'border-bottom-color':colorDown,'transform':'rotate(180deg)'}"></span>
												<span class="img4" v-show="i.Status == 2">
													<img src="../../assets/img/forex/file.png" />
												</span>
												<span class="position-left-1">仓位</span>
												<span class="position-left-2">
													<span v-if="i.Direction == 0" >买入</span>
													<span v-if="i.Direction == 1">卖出</span>
												</span>
												<span class="position-left-3" v-if="i.Status == 4||i.Status == 7" :style="{'color':(i.Direction==0?item.quotaData[13]>i.OpenPrice:item.quotaData[11]<i.OpenPrice)?colorUp:colorDown}">${{(i.Direction==0?(item.quotaData[13]-i.OpenPrice)*i.CurrentNum*(item.contract_size/item.mini_ticker_size)*i.Unit:((i.OpenPrice-item.quotaData[11])*i.CurrentNum*(item.contract_size/item.mini_ticker_size)*i.Unit)).toFixed(2)}}</span>
												<span class="position-left-3" v-if="i.Status == 2" :style="{'color':'#fff'}">{{i.LimitPrice}}</span></div>
											<div class="position-right">
												<span class="position-right-1">
													<span v-if="i.Status == 4||i.Status == 7" @tap="salePosition(item,i)">平仓</span>
													<span v-if="i.Status == 2" @tap.stop="cancelOrder(item,i)">取消</span>
												</span>
												<img @tap.stop="changeOrder(item,i)" class="position-right-2" src="../../assets/img/forex/edit.png" />
											</div>
											<span class="arrow-icon arrow-span" @tap.stop="goToPositionDetail(item,i)"></span>
											<img class="arrow-icon" src="../../assets/img/forex/arrow.png" />
										</li>
									</ul>
								</div>
							</li>
						</ul>
						<div class="no-quota" v-show="forexCommodity.length == 0">
							暂无行情
						</div>
					</div>
				</div>
			</div>
			<div class="chart">
				<forex-chart></forex-chart>
			</div>
			<div class="mui-off-canvas-backdrop"></div>
		</div>
        <popBox :isShowPop="isShowInfoPop" :headText="infoPopHead" :isShowOpenBtn="false">
            <span slot="content">
                <p class="pop-text">{{popContent}}</p>
            </span>
        </popBox>
        <popBox :isShowPop="isShowPop" :isSelectQuick="isSelectQuick" :headText="popHead" :isShowOpenBtn="true">
            <span slot="content">
                <p class="pop-text">开启后下单操作将不进行确认提示，请谨慎选择，注意风险</p>
                <span class="pop-main-btn">
                    <span :class="['radio-box',isSelectQuick?'radio-box-active':'']" @tap="selectQuick">
                        <img v-show="isSelectQuick" src="../../assets/img/forex/gou.png" />
                    </span>
                    <span>同意</span>
                    <span class="pop-agree" @tap="goToDiscribe">《快捷交易协议》</span>
                </span>
            </span>
        </popBox>
		<popBox :isShowPop="isShowLoginPop" :headText="loginPopTitle" :isTradeLogin='isTradeLogin'>
			<span slot="content">
                <p class="pop-text">请先登录交易账号</p>
            </span>
		</popBox>
	</div>
</template>

<script>
import forexChart from '../components/forex_chart';
import {mapState,mapActions} from 'vuex';
import headerBar from '../components/header';
import hiddenMenu from '../components/hiddenMenu';
// import { setTimeout } from 'timers';
	export default {
		components:{
			headerBar,
			forexChart,
			hiddenMenu
		},
		data() {
			return {
				headerTitle:'账号:123456',
				isConnect:false,//网络连接状态
				netChange:false, //网络连接状态变化
				selectIndex:-1,//选择的行情索引
				msgTips:'',//toast文字
				isShowNetTip:false,
				isShowNoConnect:false,//是否显示未连接提示
				RMBRate:7.1,//人民币汇率
				
				isShowInfoPop:false, //是否显示消息弹窗
				infoPopHead:'', //消息弹窗头部
				isShowPop:false, //是否快速交易显示弹窗
				popHead:'', //快速交易弹窗头部
				popContent:'', //文字说明内容
				isSelectQuick:false, //是否选择协议
				isShowLoginPop:false,//是否显示登录提醒
				loginPopTitle:'系统提示'
				
			};
		},
		filters:{
			getTwoNum:function(value){
				return value.toFixed(2);
			}
		},
		computed:{
			...mapState([
				'colorUp',
				'colorDown',
				'networkStatus'
			]),
			...mapState('forex',[
				'lastData',
				'isShowForexPage',
				'tipsMessage',
				'isTradeLogin',
				'isAppLogin',
				'tradeConfig',
				'marketSocket',
				'chartInfo',
				'isConnectTrade',
				'tradeSocket',
				'currentChartData',
				'isSubscribeSuccess'
			]),
			forexCommodity:function(){
				return this.$store.state.forex.forexCommodity;
			},
		},
		watch:{
			networkStatus:function(){
				var _this = this;
				this.netChange = true;
				if(this.networkStatus){
					//联网
					this.isShowNetTip = true;
					if(this.marketSocket == null){
						this.initMarketWS();
					}
					setTimeout(function(){
						_this.isShowNetTip = false;
						_this.netChange = false;
					},1500);
				}else{
					//未联网
					this.isShowNoConnect = true;
				}
			},
			marketSocket:function(){
				if(this.marketSocket == null){
					this.isShowNoConnect = true;
				}else{
					this.isShowNoConnect = false;
				}
			},
			tipsMessage:function(){
				if(this.$route.name=='forex_home'){
					if(this.tipsMessage.type == 2){
						var message = this.tipsMessage.message;
						if(!message.Status){
							if(message.Code == 0){
								this.msgTips = '取消挂单成功';
								this.$refs.dialog.isShow = true;
							}else if(message.Code != 0){
								this.msgTips = message.Message;
								this.$refs.dialog.isShow = true;
							}
						}
					}
				}
			},
			isTradeLogin:function(){
				if(this.isTradeLogin){
					this.headerTitle = "账号:"+this.tradeConfig.ClientNo;
				}else{
					this.headerTitle = "交易账号未登录";
				}
			},
			isConnectTrade:function(){
				if(!this.isConnectTrade&&this.isTradeLogin){
					//行情断开
					this.initTradeWs();
				}
			},
			currentChartData:function(){
				if(this.currentChartData!=''){
					var list = this.forexCommodity;
					for(var i=0,length=list.length;i<length;i++){
						if(list[i].commodity_no == this.currentChartData.commodity_no){
							this.selectIndex = i;
						}
					}
				}else{
					this.selectIndex = -1;
				}
			},
			isSubscribeSuccess:function(){
				if(this.isSubscribeSuccess){
					this.chooseMarket(0,this.forexCommodity[0]);
				}
			},
		},
		mounted(){
			mui.init();
			mui('#forex-home')[0].classList.add('mui-slide-in');
			mui('.mui-scroll-wrapper').scroll();
			if(this.isTradeLogin){
				this.headerTitle = "账号:"+this.tradeConfig.ClientNo;
			}else{
				this.headerTitle = "交易账号未登录";
			} 
			document.getElementById('forex-home').addEventListener('touchstart',function(e){
				e.preventDefault();  //阻止浏览器默认事件
			});
			if(this.forexCommodity.length>0&&this.currentChartData==''){
				this.chooseMarket(0,this.forexCommodity[0]);
			}else if(this.forexCommodity.length>0&&this.currentChartData!=''){
				var list = this.forexCommodity;
				for(var i=0,length=list.length;i<length;i++){
					if(list[i].commodity_no == this.currentChartData.commodity_no){
						this.chooseMarket(i,this.currentChartData);
						break;
					}
				}
			}
		},
		activated(){
			if(this.marketSocket==null){
				this.initMarketWS();
			}
			mui.plusReady(function(){
				if(!this.networkStatus){
					this.netChange = true;
				}
			}.bind(this));
		},
		methods:{
			...mapActions('forex',[
				'initTradeWs',
				'initMarketWS'
			]),
			//默认选择第一条
			defaultFirstOne(){
				if(this.forexCommodity.length>0&&this.currentChartData == ''){
					// if(this.chartInfo.type == 1){
					// 	this.$store.state.forex.chartInfo.type = 2;
					// 	this.$store.state.forex.chartInfo.chartType = 'KLINE_1DAY';
					// }else{
					// 	this.$store.state.forex.chartInfo.type = 1;
					// 	this.$store.state.forex.chartInfo.chartType = 'KLINE_UNKNOWN';
					// }
					this.selectIndex = 0;
					this.$store.state.forex.lastData = this.forexCommodity[0].quotaData;
					this.$store.state.forex.currentCommodityData = this.forexCommodity[0];
					this.$store.state.forex.currentChartData = this.forexCommodity[0];
					var historyParams = {
						method:'req_history_data',
						req_id:'',
						data:{
							contract_code:this.forexCommodity[0].security_type + '_' + this.forexCommodity[0].commodity_no,
							period:this.chartInfo.chartType,
							count:100,
							ask_or_bid:this.chartInfo.isSellChart
						}
					}
					this.marketSocket.send(JSON.stringify(historyParams));
				}
			},
			//勾选协议
			selectQuick(){
				if(this.isTradeLogin&&this.isAppLogin){
					this.isSelectQuick = !this.isSelectQuick;
				}else{
					this.msgTips = '请先登录平台账号';
					this.$refs.dialog.isShow = true;
				}
			},
			//跳转到协议
			goToDiscribe(){
				this.$router.push({
					path:'/forex_discribe',
				})
			},
			//选择行情
			chooseMarket(index,item){
				if(this.selectIndex == index){
					return;
				}
				this.selectIndex = index;
				this.$store.state.forex.lastData = item.quotaData;
				this.$store.state.forex.currentCommodityData = item;
				this.$store.state.forex.currentChartData = item;
				var historyParams = {
					method:'req_history_data',
					req_id:'',
					data:{
						contract_code:item.security_type + '_' + item.commodity_no,
						period:this.chartInfo.chartType,
						count:100,
						ask_or_bid:this.chartInfo.isSellChart,
					}
				}
				this.marketSocket.send(JSON.stringify(historyParams));
			},
			//查看行情详情页
			toDetail(index,item){
				console.log(1);
				this.selectIndex = index;
				this.$store.state.forex.lastData = item.quotaData;
				this.$store.state.forex.currentCommodityData = item;
				this.$store.state.forex.currentChartData = item;
				this.$router.push({
					path:'/forex_detail',
					query:{
						name:item.commodity_name,
					}
				})
			},
			//下单页面
			goToOrder(index,item){
				if(!this.isTradeLogin){
					this.isShowLoginPop = true;
					return;
				}
				this.$store.state.forex.lastData = item.quotaData;
				this.$store.state.forex.currentCommodityData = item;
				//index: 1为卖出 2为买入
				this.$router.push({
					path:'/forex_order',
					query:{
						type:index,
						name:item.commodity_name
					}
				})
			},
			//平仓
			salePosition(item,i){
				this.$store.state.forex.saleCommodityObj = i;
				this.$store.state.forex.lastData = item.quotaData;
				this.$store.state.forex.currentCommodityData = item;
				this.$router.push({
					path:'/forex_sale',
					query:{
						name:item.commodity_name
					}
				})
			},
			cancelOrder(item,i){
				var orderParam = {
					Method:'CancelLiteOrder',
					Parameters:{
						LiteOrderID:i.LiteOrderID,
					},
				}
				this.tradeSocket.send(JSON.stringify(orderParam));
			},
			//查看持仓/挂单详情
			goToPositionDetail(item,i){
				//判断是否是跳持仓详情还是挂单详情
				i['commodityName'] = item.commodity_name;
				i['tradePrice'] = (i.Num * item.contract_size/item.mini_ticker_size).toFixed(2)
				this.$store.state.forex.chooseDetailData = i;
				this.$store.state.forex.lastData = item.quotaData;
				this.$store.state.forex.currentCommodityData = item;
				this.$router.push({
					path:'/forex_positionDetail'
				})
			},
			//改单
			changeOrder(item,i){
				this.$store.state.forex.saleCommodityObj = i;
				this.$store.state.forex.lastData = item.quotaData;
				this.$store.state.forex.currentCommodityData = item;
				this.$router.push({
					path:'/forex_order',
					query:{
						type:3,
						name:item.commodity_name
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
@import url("../../assets/css/main.less");
@bar5:50px * @ip5;
@bar6:50px * @ip6;
@tip5:30px * @ip5;
@tip6:30px * @ip6;
@chart5:200px * @ip5;
@chart6:200px * @ip6;
#forex-home{
	position: relative;
	padding-top: 50px;
	z-index: 9;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 11;
    }
	.connect-tip{
		color:#fff;
		background: #20212a;
		height: 30px;    
		position: absolute;
		z-index: 9;
		width: 100%;
		.online{
			background: #4588e6;
		}
		.offline{
			background: #ff8c19;
		}
	}
	.market-scroll-wrapper{
		height: calc(~"100% - 200px");
	}
	.market-scroll{
		touch-action: none;
	}
	.market{
		// height: calc(~"100% - 300px");
		height: 100%;
		overflow: auto;
		ul{
			.market-item{
				.market-quota{
					position: relative;
					color: #fff;
					padding: 10px 20px;
					padding-right: 60px;
					border-bottom: solid 1px #17191e;
					background: #20212a;
					.forex-up{
						display: flex;
						justify-content: space-between;
						align-items: center;
						.forex-up-left{
							.forex-up-left-1{
								font-size: 16px;
							}
							.forex-up-left-2{
								font-size: 16px;
								color:#66697f;
							}
							.forex-up-left-3{
								display: inline-block;
								width: 15px;
								height: 15px;
								line-height: 15px;
								text-align: center;
								border-radius: 2px;
								background: #ffd400;
								color: #17191e;
								font-size: 12px;
								vertical-align: text-top;
							}
						}
						.forex-up-right{
								font-size: 14px;
								width: 42.5%;
								text-align: center;
							span{
								color:#66697f;
								margin-right: 5px;
							}
						}
					}
					.forex-down{
						margin-top: 10px;
						display: flex;
						justify-content: space-between;
						font-size: 15px;
						height: 30px;
						line-height: 30px;
						.forex-down-left{
							display: flex;
							width: 50%;
							height: 100%;
							.forex-down-value{
								text-align: right;
								padding-right: 5px;
							}
						}
						.forex-down-right{
							display: flex;
							width: 50%;    
							height: 100%;
							justify-content: flex-end;
							.forex-down-value{
								text-align: left;
								padding-left: 5px;
							}
						}
						.forex-down-title{
							display: inline-block;
							width: 30%;
							text-align: center;
							background: #7a7f99;
							color:#17191e;
							height: 100%;
						}
						.forex-down-value{
							display: inline-block;
							width: 55%;
							border: solid 1px #7a7f99;
							height: 100%;
						}
					}
				}
				.market-quota-active{
					background: #292a36;
				}
				.market-position{
					color: #fff;
					font-size: 14px;
            		background: #20212a;
					.postion-item{
						position: relative;
						display: flex;
						justify-content: space-between;
						border-bottom: solid 1px #17191e;
						padding: 10px 20px;
						padding-right: 60px;
						.position-left{
							.status{
								border: solid 5px rgba(0,0,0,0);
								display: inline-block;
								border-bottom-width: 8px;
								transform-origin: 50% 75%;
							}
							.img4{
								img{
									vertical-align: middle;
								}
							}
							.position-left-1{
								color:#70738b;
							}
							.position-left-2{
							}
							.position-left-3{
	
							}
						}
						.position-right{
							display: flex;
							align-items: center;
							.position-right-1{
								text-align: center;
								color: #7e829c;
								margin-right: 20px;
								span{
									display: inline-block;
									width: 50px;
									background: #323442;
								}
							}
							.position-right-2{
								width: 20px;
							}
						}
					}
				}
				.arrow-icon{
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					right: 3%;
					width: 10px;
					z-index: 9;
				}
				.arrow-span{    
					height: 100%;
					width: 40px;
					right: 0;
					z-index: 10;
				}
			}
		}
		.no-quota{
			text-align: center;
			color: #7e829c;
			font-size: 14px;
		}
	}
	.chart{
		height: 200px;
		width: 100%;
		background: #20212a;    
		position: absolute;
		bottom: 0;
		z-index: 10;
	}
}
/*ip5*/
@media(max-width:370px) {
	#forex-home{
		height: calc(~"100% - @{bar5}");
		padding-top: 50px*@ip5;
		.connect-tip{
			height: 30px*@ip5;
			line-height: 30px*@ip5;
			font-size: 14px*@ip5;
			.connect-box{
				padding-left: 15px*@ip5;
				box-sizing: border-box; 
				height: 100%;
				span{
					vertical-align: middle;
				}
				img{
					width: 15px*@ip5;
					vertical-align: middle;
				}
			}
		}
		.market-scroll-wrapper{
			height: calc(~"100% - @{chart5}");
		}
		.market-scroll{
			touch-action: none;
		}
		.market{
			height: 100%;
			ul{
				.market-item{
					.market-quota{
						padding: 10px*@ip5 20px*@ip5;
						padding-right: 60px*@ip5;
						.forex-up{
							.forex-up-left{
								.forex-up-left-1{
									font-size: 16px*@ip5;
								}
								.forex-up-left-2{
									font-size: 16px*@ip5;
								}
								.forex-up-left-3{
									width: 15px*@ip5;
									height: 15px*@ip5;
									line-height: 15px*@ip5;
									border-radius: 2px*@ip5;
									font-size: 12px*@ip5;
								}
							}
							.forex-up-right{
									font-size: 14px*@ip5;
								span{
									margin-right: 5px*@ip5;
								}
							}
						}
						.forex-down{
							margin-top: 10px*@ip5;
							font-size: 15px*@ip5;
							height: 30px*@ip5;
							line-height: 30px*@ip5;
							.forex-down-left{
								.forex-down-value{
									padding-right: 5px*@ip5;
								}
							}
							.forex-down-right{
								.forex-down-value{
									padding-left: 5px*@ip5;
								}
							}
							.forex-down-value{
								border: solid 1px*@ip5 #7a7f99;
							}
						}
					}
					.market-position{
						font-size: 14px*@ip5;
						.postion-item{
							border-bottom: solid 1px*@ip5 #17191e;
							padding: 10px*@ip5 20px*@ip5;
							padding-right: 60px*@ip5;
							.position-left{
								.status{
									border-width: 5px*@ip5;
									border-bottom-width: 8px*@ip5;
								}
							}
							.position-right{
								.position-right-1{
									margin-right: 20px*@ip5;
									span{
										width: 50px*@ip5;
									}
								}
								.position-right-2{
									width: 20px*@ip5;
								}
							}
						}
					}
					.arrow-icon{
						width: 10px*@ip5;
					}
					.arrow-span{    
						width: 40px*@ip5;
					}
				}
			}
		}
		.chart{
			height: 200px*@ip5;
		}
	}
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
	#forex-home{
		height: calc(~"100% - @{bar6}");
		padding-top: 50px*@ip6;
		.connect-tip{
			height: 30px*@ip6;
			line-height: 30px*@ip6;
			font-size: 14px*@ip6;
			.connect-box{
				padding-left: 15px*@ip6;
				box-sizing: border-box; 
				height: 100%;
				span{
					vertical-align: middle;
				}
				img{
					width: 15px*@ip6;
					vertical-align: middle;
				}
			}
		}
		.market-scroll-wrapper{
			height: calc(~"100% - @{chart6}");
		}
		.market-scroll{
			touch-action: none;
		}
		.market{
			height: 100%;
			ul{
				.market-item{
					.market-quota{
						padding: 10px*@ip6 20px*@ip6;
						padding-right: 60px*@ip6;
						.forex-up{
							.forex-up-left{
								.forex-up-left-1{
									font-size: 16px*@ip6;
								}
								.forex-up-left-2{
									font-size: 16px*@ip6;
								}
								.forex-up-left-3{
									width: 15px*@ip6;
									height: 15px*@ip6;
									line-height: 15px*@ip6;
									border-radius: 2px*@ip6;
									font-size: 12px*@ip6;
								}
							}
							.forex-up-right{
									font-size: 14px*@ip6;
								span{
									margin-right: 5px*@ip6;
								}
							}
						}
						.forex-down{
							margin-top: 10px*@ip6;
							font-size: 15px*@ip6;
							height: 30px*@ip6;
							line-height: 30px*@ip6;
							.forex-down-left{
								.forex-down-value{
									padding-right: 5px*@ip6;
								}
							}
							.forex-down-right{
								.forex-down-value{
									padding-left: 5px*@ip6;
								}
							}
							.forex-down-value{
								border: solid 1px*@ip6 #7a7f99;
							}
						}
					}
					.market-position{
						font-size: 14px*@ip6;
						.postion-item{
							border-bottom: solid 1px*@ip6 #17191e;
							padding: 10px*@ip6 20px*@ip6;
							padding-right: 60px*@ip6;
							.position-left{
								.status{
									border-width: 5px*@ip6;
									border-bottom-width: 8px*@ip6;
								}
							}
							.position-right{
								.position-right-1{
									margin-right: 20px*@ip6;
									span{
										width: 50px*@ip6;
									}
								}
								.position-right-2{
									width: 20px*@ip6;
								}
							}
						}
					}
					.arrow-icon{
						width: 10px*@ip6;
					}
					.arrow-span{    
						width: 40px*@ip6;
					}
				}
			}
		}
		.chart{
			height: 200px*@ip6;
		}
	}
}
/*ip6p及以上*/
@media (min-width:411px) {
	#forex-home{
		height: calc(~"100% - 47px");
		.connect-tip{
			height: 30px;
			line-height: 30px;
			font-size: 14px;
			.connect-box{
				padding-left: 15px;
				box-sizing: border-box; 
				height: 100%;
				span{
					vertical-align: middle;
				}
				img{
					width: 15px;
					vertical-align: middle;
				}
			}
		}
	}
}
</style>
