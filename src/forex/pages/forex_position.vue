<template>
    <div id="position" class="mui-off-canvas-wrap mui-draggable">
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
                <header-bar :showBack="true" :showMenu="true">
                    <span slot="title" class="header-title">
                        {{headerTitle}}
                    </span>
                </header-bar>
            </div>
            <div class="position-totle" v-show="positionList.length > 0">
                <span class="totle-title">合计盈亏:</span>
                <span class="totle-value" :style="totalProfit>0?{'color':colorUp}:{'color':colorDown}">${{totalProfit.toFixed(2)}}</span>
            </div>
            <div class="mui-scroll-wrapper position-scroll-wrapper">
                <div class="mui-scroll">
                    <div class="position-list">
                        <div class="position-item" v-for="(item,index) in positionList" :key="index">
                            <div class="position-item-top">
                                <div class="position-left">
                                    <span class="status" :style="(item.Direction == 0?item.OpenPrice<item.lastRate:item.OpenPrice>item.lastRate)?{'border-bottom-color':colorUp}:{'border-bottom-color':colorDown,'transform':'rotate(180deg)'}"></span>
                                    <span class="position-left-1">{{item.commodityName}}</span>
                                </div>
                                <div class="position-right">
                                    <span class="position-right-1" @tap.stop="goToChange(1,item)">改单</span>
                                    <span class="position-right-1" @tap.stop="goToChange(2,item)">平仓</span>
                                </div>
                            </div>
                            <div :class="['position-item-bottom',selectIndex==index?'position-item-bottom-active':'']" @tap="choosePosition(item,index)">
                                <span class="position-value" >
                                    <span class="position-value-1">{{item.Direction == 0?'买入':'卖出'}}</span>
                                    <span class="position-value-2">{{item.tradePrice}}</span>
                                    <span class="position-value-2">{{item.lastRate}}</span>
                                    <span class="position-value-1" :style="(item.Direction == 0?item.OpenPrice<item.lastRate:item.OpenPrice>item.lastRate)?{'color':colorUp}:{'color':colorDown}">${{(item.profit).toFixed(2)}}</span>
                                </span>
                                <span class="arrow-icon arrow-span" @tap.stop="goToDetail(item)"></span>
                                <img class="" src="../../assets/img/forex/arrow.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fixed-box">
                <div class="info-box" v-show="positionList.length > 0">
                    <span class="info-title">净值:<span :style="{'color':bottomInfo.totalBalance-bottomInfo.balance>0?colorUp:colorDown}">{{bottomInfo.totalBalance.toFixed(2)}}</span></span>
                    <span class="info-title">平仓线:<span>{{tradeForceLine}}</span></span>
                    <span class="info-title">风险度:<span :style="{'color':riskRate<20?'#ddd':20<=riskRate&&riskRate<40?'#f7de21':'#da3907'}">{{riskRate}}%</span></span>
                </div>
                <div class="chart" v-if="positionList.length > 0">
                    <forex-chart></forex-chart>
                </div>
            </div>
            <div class="no-order-data" v-show="positionList.length == 0">
                <div class="text-tip">您当前无任何持仓</div>
                <div class="order-btn" @click="goToTrade">立即交易</div>
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
    </div>
</template>

<script>
import forexChart from '../components/forex_chart';
import {mapState} from 'vuex';
import headerBar from '../components/header';
import hiddenMenu from '../components/hiddenMenu';
export default {
    components:{
        headerBar,
        forexChart,
        hiddenMenu
    },
    data(){
        return{
            headerTitle:'持仓',
            positionList:[],
            totalProfit:0,//总盈利
            RMBRate:1,//人民币汇率
            msgTips:'',//toast消息
            riskRate:0, //风险率
            selectIndex:-1, //选择的行情图表

            isShowInfoPop:false, //是否显示消息弹窗
            infoPopHead:'', //消息弹窗头部
            isShowPop:false, //是否快速交易显示弹窗
            popHead:'', //快速交易弹窗头部
            popContent:'', //文字说明内容
            isSelectQuick:false, //是否选择协议
        }
    },
    mounted(){ 
        if(!this.isTradeLogin){
            this.$router.push({
                path:'forex_home'
            })
        }else{
            mui.init();
            mui('#position')[0].classList.add('mui-slide-in');
            mui('.mui-scroll-wrapper').scroll();
			document.getElementById('position').addEventListener('touchstart',function(e){
				e.preventDefault();  //阻止浏览器默认事件
			});
            this.initData(1);
        }
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'forexCommodity',
            'isTradeLogin',
            'userInfo',
            'isAppLogin',
            'bottomInfo',
            'tradeForceLine',
            'chartInfo',
            'marketSocket',
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    watch:{
        forexCommodity:function(){
            if(this.$route.name=="forex_position"){
                this.initData();
            }
        },
    },
    activated(){
    },
    methods:{
        //默认选择第一条
        defaultFirstOne(){
            this.selectIndex = 0;
            this.$store.state.forex.lastData = this.positionList[0].commodityList.quotaData;
            this.$store.state.forex.currentCommodityData = this.positionList[0].commodityList;
            this.$store.state.forex.currentChartData = this.positionList[0].commodityList;
            var historyParams = {
                method:'req_history_data',
                req_id:'',
                data:{
                    contract_code:this.positionList[0].commodityList.security_type + '_' + this.positionList[0].commodityList.commodity_no,
                    period:this.chartInfo.chartType,
                    count:100,
                    ask_or_bid:this.chartInfo.isSellChart
                }
            }
            this.marketSocket.send(JSON.stringify(historyParams));
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
        //获取持仓数据
        initData(index){
            var commodityList = this.forexCommodity;
            var commodityLength = this.forexCommodity.length;
            var positionList = [];
            var totalProfit = 0;
            for(var i=0;i<commodityLength;i++){
                if(commodityList[i].positionList.length > 0){
                    var positionLength = commodityList[i].positionList.length;
                    for(var j=0;j<positionLength;j++){
                        if(commodityList[i].positionList[j].Status == 4||commodityList[i].positionList[j].Status == 7){
                            //部分平仓和已开仓
                            commodityList[i].positionList[j]['commodityList'] = commodityList[i];
                            commodityList[i].positionList[j]['commodityName'] = commodityList[i].commodity_name;
                            commodityList[i].positionList[j]['tradePrice'] = (commodityList[i].positionList[j].CurrentNum * commodityList[i].contract_size/commodityList[i].mini_ticker_size).toFixed(2);
                            commodityList[i].positionList[j]['contractNum'] = (commodityList[i].contract_size/commodityList[i].mini_ticker_size).toFixed(2);
                            switch(commodityList[i].positionList[j].Direction){
                                case 0:commodityList[i].positionList[j]['lastRate'] = commodityList[i].quotaData[13];break; //买
                                case 1:commodityList[i].positionList[j]['lastRate'] = commodityList[i].quotaData[11];break; //卖
                            }
                            if(commodityList[i].commodity_no.split('.')[1]=='USD'){
                                //右置美元
                                commodityList[i].positionList[j]['USDRate'] = 1;
                            }else if(commodityList[i].commodity_no.split('.')[0]=='USD'){
                                //左置美元
                                commodityList[i].positionList[j]['USDRate'] = 1/commodityList[i].positionList[j].lastRate;
                            }else{
                                //不存在美元
                                for(var z=0;z<this.forexCommodity.length;z++){
                                    if(this.forexCommodity[z].commodity_no.split('.')[1] == commodityList[i].commodity_no.split('.')[1]&&this.forexCommodity[z].commodity_no.split('.')[0]=='USD'){
                                        switch(commodityList[z].positionList[j].Direction){
                                            case 0:commodityList[i].positionList[j]['USDRate'] = 1/this.forexCommodity[z].quotaData[13];break;
                                            case 1:commodityList[i].positionList[j]['USDRate'] = 1/this.forexCommodity[z].quotaData[11];break;
                                        }
                                    }
                                }
                            }
                            switch(commodityList[i].positionList[j].Direction){
                                case 0:commodityList[i].positionList[j]['profit'] = (commodityList[i].positionList[j].lastRate-commodityList[i].positionList[j].OpenPrice)*commodityList[i].positionList[j].tradePrice*commodityList[i].positionList[j].USDRate;break; //买
                                case 1:commodityList[i].positionList[j]['profit'] = (commodityList[i].positionList[j].OpenPrice-commodityList[i].positionList[j].lastRate)*commodityList[i].positionList[j].tradePrice*commodityList[i].positionList[j].USDRate;break; //卖
                            }
                            totalProfit += commodityList[i].positionList[j].profit;
                            positionList.push(commodityList[i].positionList[j]);
                        }
                    }
                }
            };
            this.totalProfit = totalProfit;
            this.riskRate = (this.tradeForceLine/(parseFloat(this.bottomInfo.todayAmount) + parseFloat(this.totalProfit) + parseFloat(this.bottomInfo.appendBond))*100).toFixed(2);
            this.positionList = positionList;
            if(this.positionList.length>0&&index == 1){
                this.defaultFirstOne();
            }
        },
        getRMBRateData(){
            if(this.isTradeLogin&&this.isAppLogin){
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
                    if(data.success == true&&data.code == 1){
                        this.RMBRate = data.data.rate;
                        this.initData();
                        if(this.positionList.length>0){
                            this.defaultFirstOne();
                        }
                    }else{
                        this.msgTips = data.message;
                        this.$refs.dialog.isShow = true;
                    }
                }.bind(this), function(){
                    this.msgTips = "连接服务器失败";
                    this.$refs.dialog.isShow = true;
                });
            }
        },
        goToDetail(item){
            this.$store.state.forex.chooseDetailData = item;
			this.$store.state.forex.lastData = item.commodityList.quotaData;
            this.$store.state.forex.currentCommodityData = item.commodityList;
            this.$router.push({
                path:'/forex_positionDetail'
            })
        },
        //跳转交易
        goToTrade(){
            this.$router.replace({
                path:'/forex_home'
            })
        },
        //跳转改单或者平仓
        goToChange(index,item){
            if(index == 1){
                //改单
				this.$store.state.forex.saleCommodityObj = item;
				this.$store.state.forex.lastData = item.commodityList.quotaData;
				this.$store.state.forex.currentCommodityData = item.commodityList;
				//index: 1为卖出 2为买入
				this.$router.push({
					path:'/forex_order',
					query:{
						type:3,
						name:item.commodityName
					}
				})

            }else if(index ==2){
                //平仓
				this.$store.state.forex.saleCommodityObj = item;
				this.$store.state.forex.lastData = item.commodityList.quotaData;
				this.$store.state.forex.currentCommodityData = item.commodityList;
				this.$router.push({
					path:'/forex_sale',
					query:{
						name:item.commodityName
					}
				})
            }
        },
        choosePosition(item,index){
            if(this.selectIndex == index){
                return;
            }
            this.selectIndex = index;
            this.$store.state.forex.lastData = item.commodityList.quotaData;
            this.$store.state.forex.currentCommodityData = item.commodityList;
            this.$store.state.forex.currentChartData = item.commodityList;
            var historyParams = {
                method:'req_history_data',
                req_id:'',
                data:{
                    contract_code:item.commodityList.security_type + '_' + item.commodityList.commodity_no,
                    period:this.chartInfo.chartType,
                    count:100,
                    ask_or_bid:this.chartInfo.isSellChart
                }
            }
            this.marketSocket.send(JSON.stringify(historyParams));
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
@30to5:30px * @ip5;
@30to6:30px * @ip6;
@200to5:200px * @ip5;
@200to6:200px * @ip6;
#position{
    padding-top: 50px;
    height: 100%;
    overflow: hidden;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .position-totle{
        padding: 5px 20px;
        border-bottom: solid 1px #17191e;
        font-size: 14px;
        background: #2e334d;
        height: 30px;
        .totle-title{
            color:#767b95;
        }
        .totle-value{
            color:#fff;
        }
    }
    .position-scroll-wrapper{
        height: calc(~'100% - 30px - 30px - 200px');
        top: 30px;
    }
    .position-list{
        font-size: 14px;
        overflow: auto;
        .position-item{
            border-bottom: solid 9px #17191e;
            .position-item-top{
                position: relative;
                display: flex;
                justify-content: space-between;
                border-bottom: solid 1px #17191e;
                padding: 10px 20px;
                background: #20212a;
                .position-left{
                    .status{
                        border: solid 5px rgba(0,0,0,0);
                        display: inline-block;
                        border-bottom-width: 8px;
                        transform-origin: 50% 75%;
                    }
                    .position-left-1{
                        color:#70738b;
                    }
                }
                .position-right{
                    display: flex;
                    align-items: center;
                    .position-right-1{
                        text-align: center;
                        color: #7e829c;
                        margin-left: 20px;
                        display: inline-block;
                        width: 50px;
                        background: #323442;
                    }
                    .position-right-2{
                        width: 20px;
                    }
                }
            }
            .position-item-bottom{
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: solid 1px #17191e;
                padding: 10px 20px;
                background: #20212a;
                position: relative;
                .position-value{
                    .position-value-1{
                        color:#7e829c;
                    }
                    .position-value-2{
                        color:#fff;
                    }
                }
                img{
                    width: 10px;
                }
				.arrow-icon{
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					right: 3%;
					width: 10px;
				}
				.arrow-span{    
					height: 100%;
					width: 40px;
					right: 0;
				}
            }
            .position-item-bottom-active{
                background: #292a36;
            }
        }
    }
    .fixed-box{
        position: absolute;
        bottom: 0;
        width: 100%;
    }
    .info-box{
        font-size: 14px;
        height: 30px;
        padding-left: 20px;
        display: flex;
        align-items: center;
        background: #20212a;
        border-top: solid 1px #17191e;
        border-bottom: solid 1px #17191e;
        .info-title{
            color:#7a7f99;
            margin-right: 10px;
            span{
                color:#fff;
            }
        }
    }
	.chart{
		height: 200px;
        background: #20212a;
    }
    .no-order-data{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 80%;
        .text-tip{
            color:#555769;
            text-align: center;
            margin-bottom: 30px;
        }
        .order-btn{
            width: 100%;
            height: 50px;
            line-height: 50px;
            text-align: center;
            background: #ffd400;
            color:#17191e;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #position{
        padding-top: 50px*@ip5;
        .position-totle{
            padding: 5px*@ip5 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            font-size: 14px*@ip5;
            height: 30px*@ip5;
        }
        .position-scroll-wrapper{
            height: calc(~'100% - @{30to5} - @{30to5} - @{200to5}');
            top: 30px*@ip5;
        }
        .position-list{
            font-size: 14px*@ip5;
            .position-item{
                border-bottom: solid 9px*@ip5 #17191e;
                .position-item-top{
                    border-bottom: solid 1px*@ip5 #17191e;
                    padding: 10px*@ip5 20px*@ip5;
                    .position-left{
                        .status{
                            border-width:5px*@ip5;
                            border-bottom-width: 8px*@ip5;
                            transform-origin: 50% 75%;
                        }
                    }
                    .position-right{
                        .position-right-1{
                            margin-left: 20px*@ip5;
                            width: 50px*@ip5;
                        }
                        .position-right-2{
                            width: 20px*@ip5;
                        }
                    }
                }
                .position-item-bottom{
                    border-bottom: solid 1px*@ip5 #17191e;
                    padding: 10px*@ip5 20px*@ip5;
                    img{
                        width: 10px*@ip5;
                    }
                }
            }
        }
        .info-box{
            font-size: 14px*@ip5;
            height: 30px*@ip5;
            padding-left: 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            border-top: solid 1px*@ip5 #17191e;
            .info-title{
                margin-right: 10px*@ip5;
            }
        }
        .chart{
            height: 200px*@ip5;
        }
        .no-order-data{
            .text-tip{
                margin-bottom: 30px*@ip5;
            }
            .order-btn{
                height: 50px*@ip5;
                line-height: 50px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #position{
        padding-top: 50px*@ip6;
        .position-totle{
            padding: 5px*@ip6 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            font-size: 14px*@ip6;
            height: 30px*@ip6;
        }
        .position-scroll-wrapper{
            height: calc(~'100% - @{30to6} - @{30to6} - @{200to6}');
            top: 30px*@ip6;
        }
        .position-list{
            font-size: 14px*@ip6;
            .position-item{
                border-bottom: solid 9px*@ip6 #17191e;
                .position-item-top{
                    border-bottom: solid 1px*@ip6 #17191e;
                    padding: 10px*@ip6 20px*@ip6;
                    .position-left{
                        .status{
                            border-width: 5px*@ip6;
                            border-bottom-width: 8px*@ip6;
                            transform-origin: 50% 75%;
                        }
                    }
                    .position-right{
                        .position-right-1{
                            margin-left: 20px*@ip6;
                            width: 50px*@ip6;
                        }
                        .position-right-2{
                            width: 20px*@ip6;
                        }
                    }
                }
                .position-item-bottom{
                    border-bottom: solid 1px*@ip6 #17191e;
                    padding: 10px*@ip6 20px*@ip6;
                    img{
                        width: 10px*@ip6;
                    }
                }
            }
        }
        .info-box{
            font-size: 14px*@ip6;
            height: 30px*@ip6;
            padding-left: 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            border-top: solid 1px*@ip6 #17191e;
            .info-title{
                margin-right: 10px*@ip6;
            }
        }
        .chart{
            height: 200px*@ip6;
        }
        .no-order-data{
            .text-tip{
                margin-bottom: 30px*@ip6;
            }
            .order-btn{
                height: 50px*@ip6;
                line-height: 50px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
