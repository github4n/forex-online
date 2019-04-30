<template>
    <div id="forex_detail" class="mui-off-canvas-wrap mui-draggable">
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
            <div class="mui-scroll-wrapper">
                <div class="mui-scroll">
                    <div class="forex-detail-content">
                        <div class="trade-btn-box">
                            <div class="trade-btn" @tap="goToOrder(1)" :style="{'background-color':colorDown}">
                                <div>卖出</div>
                                <div>{{lastData[13]}}</div>
                            </div>
                            <div class="trade-btn" @tap="goToOrder(2)" :style="{'background-color':colorUp}">
                                <div>买入</div>
                                <div>{{lastData[11]}}</div>
                            </div>
                        </div>
                        <div class="quota-info">
                            <span>{{currentCommodityData.commodity_no.split('.')[0]+currentCommodityData.commodity_no.split('.')[1]}}</span>
                            <span :style="upDownRate>0?{'color':colorUp}:{'color':colorDown}">{{upDownRate}}%</span>
                        </div>
                        <div class="chart">
                            <forex-chart></forex-chart>
                        </div>
                        <div class="info-title" @tap="openDetail(1)">
                            <span>
                                用户持仓比
                                <img @tap.stop="popInfo(1)" src="../../assets/img/forex/menu/menu_14.png"/>
                            </span>
                            <span>
                                <img :class="['arrow',isShowPosition?'arrow-open':'']" src="../../assets/img/forex/arrow.png"/>
                            </span>
                        </div>
                        <div class="position-rate" v-show="isShowPosition">
                            <div class="position-rate-title">
                                <span :style="{'color':colorDown}">{{sellRate}}%卖家</span>
                                <span :style="{'color':colorUp}">{{buyRate}}%买家</span>
                            </div>
                            <div class="position-rate-value">
                                <span class="position-rate-bar" :style="{'width':sellRate+'%','background':colorDown}">
                                    <span class="position-value">{{sellRate}}%</span>    
                                </span><span class="position-rate-bar" :style="{'width':buyRate+'%','background':colorUp}">
                                    <span class="position-value">{{buyRate}}%</span>
                                </span>
                            </div>
                        </div>
                        <div class="info-title" @tap="openDetail(2)">
                            <span>
                                实时数据
                                <img @tap.stop="popInfo(2)" src="../../assets/img/forex/menu/menu_14.png"/>
                            </span>
                            <span>
                                <img :class="['arrow',isShowData?'arrow-open':'']" src="../../assets/img/forex/arrow.png"/>
                            </span>
                        </div>
                        <div class="timely-data" v-show="isShowData">
                            <div class="data-title">
                                变化
                            </div>
                            <div class="change-data">
                                <div class="change-data-div">
                                    <span class="change-data-span">5分钟</span>
                                    <span class="change-data-span">60分钟</span>
                                    <span class="change-data-span">一天</span>
                                </div>
                                <div class="change-data-div">
                                    <span class="change-data-span" :style="fiveUpDownRate=='-'?{'color':'#fff'}:fiveUpDownRate>=0?(fiveUpDownRate==0?{'color':'#fff'}:{'color':colorUp}):{'color':colorDown}">{{fiveUpDownRate}}%</span>
                                    <span class="change-data-span" :style="hourUpDownRate=='-'?{'color':'#fff'}:hourUpDownRate>=0?(hourUpDownRate==0?{'color':'#fff'}:{'color':colorUp}):{'color':colorDown}">{{hourUpDownRate}}%</span>
                                    <span class="change-data-span" :style="allUpDownRate>0?{'color':colorUp}:{'color':colorDown}">{{allUpDownRate}}%</span>
                                </div>
                            </div>
                            <div class="data-rate">
                                <span>最高价/最低价</span>
                                <span>
                                    <span>卖价汇率:</span>
                                    <span class="rate-value" :style="lastData[11]>lastData[10]?{'color':colorDown}:{'color':colorUp}">{{lastData[11]}}</span>
                                </span>
                            </div>
                            <div class="data-price-detail">
                                <div class="price-time">
                                    <div class="price-time-title">
                                        <span>最低价</span>
                                        <span>最高价</span>
                                    </div>
                                    <div class="price-time-line">
                                        <span v-if="fiveMinPrice.length>=5" class="triangle" :style="{'left':lastData[11]/(parseFloat(fivePrice[0])+parseFloat(fivePrice[1]))*100 + '%'}"></span>
                                        <div class="line-box"></div>
                                    </div>
                                    <div class="price-time-value">
                                        <span>{{fivePrice[0]}}</span>
                                        <span>5分钟</span>
                                        <span>{{fivePrice[1]}}</span>
                                    </div>
                                </div>
                                <div class="price-time">
                                    <div class="price-time-title">
                                        <span>最低价</span>
                                        <span>最高价</span>
                                    </div>
                                    <div class="price-time-line">
                                        <span v-if="oneHourPrice.length>=60" class="triangle" :style="{'left':lastData[11]/(parseFloat(hourPrice[0])+parseFloat(hourPrice[1]))*100 + '%'}"></span>
                                        <div class="line-box"></div>
                                    </div>
                                    <div class="price-time-value">
                                        <span>{{hourPrice[0]}}</span>
                                        <span>60分钟</span>
                                        <span>{{hourPrice[1]}}</span>
                                    </div>
                                </div>
                                <div class="price-time">
                                    <div class="price-time-title">
                                        <span>最低价</span>
                                        <span>最高价</span>
                                    </div>
                                    <div class="price-time-line">
                                        <span class="triangle" :style="{'left':lastData[11]/(parseFloat(allDay[0])+parseFloat(allDay[1]))*100 + '%'}"></span>
                                        <div class="line-box"></div>
                                    </div>
                                    <div class="price-time-value">
                                        <span>{{allDay[0]}}</span>
                                        <span>今天</span>
                                        <span>{{allDay[1]}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="info-title" @tap="openDetail(3)">
                            <span>
                                产品规则
                                <!-- <img @tap.stop="popInfo(3)" src="../../assets/img/forex/menu/menu_14.png"/> -->
                            </span>
                            <span>
                                <img :class="['arrow',isShowRule?'arrow-open':'']" src="../../assets/img/forex/arrow.png"/>
                            </span>
                        </div>
                        <div class="trade-rule" v-show="isShowRule">
                            <ul>
                                <li>
                                    <span class="rule-title">点差</span>
                                    <span class="rule-value">{{pointNum}}</span>
                                </li>
                                <li>
                                    <span class="rule-title">合约乘数</span>
                                    <span class="rule-value"><span>{{unit}}</span>{{contractNum}}</span>
                                </li>
                                <li>
                                    <span class="rule-title">杠杆</span>
                                    <span class="rule-value">1:{{1/level}}</span>
                                </li>
                                <li>
                                    <span class="rule-title">交易保证金</span>
                                    <span class="rule-value">{{tradeBond}}</span>
                                </li>
                                <li>
                                    <span class="rule-title">最小单价</span>
                                    <span class="rule-value">{{minHand*contractNum}}</span>
                                </li>
                                <!-- <li>
                                    <span class="rule-title">当前交易时间</span>
                                    <span class="rule-value">周一</span>
                                </li> -->
                            </ul>
                        </div>
                    </div>
                </div>
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
import {mapState} from 'vuex';
import forexChart from '../components/forex_chart';
import headerBar from '../components/header';
import hiddenMenu from '../components/hiddenMenu';
import { setTimeout } from 'timers';
export default {
    components:{
        headerBar,
        forexChart,
        hiddenMenu
    },
    data(){
        return{
            headerTitle:'美元/日元',
            isShowPosition:true,//是否展示开用户持仓比
            isShowData:true,//是否展示开实时数据
            isShowRule:true,//是否展示开产品规则
            sellRate:50, //用户持仓比卖家
            buyRate:50, //用户持仓比买家
            upDownRate:1,//一天涨幅比
            unit:'',//单位
            pointNum:0,//点差
            contractNum:100000,//合约乘数
            minPirce:0,//最小单价
            tradeBond:0,//交易保证金
            minHand:0.05,//最小手数
            level:0.005,//杠杆
            msgTips:'',//toast消息
            fivePrice:[], //5分钟价格
            fiveUpDownRate:0,//5分钟涨幅比
            hourPrice:[], //1小时价格
            hourUpDownRate:0,//1小时涨幅比
            allDay:[],
            allUpDownRate:0,//全天涨幅比
            isConfigure:true,
            
            isShowInfoPop:false, //是否显示消息弹窗
            infoPopHead:'', //消息弹窗头部
            isShowPop:false, //是否快速交易显示弹窗
            popHead:'', //快速交易弹窗头部
            popContent:'', //文字说明内容
            isSelectQuick:false, //是否选择协议
            isShowLoginPop:false,//是否显示登录提醒
            loginPopTitle:'系统提示',
            isSubmit:false,//是否提交数据中

        }
    },
    mounted(){
        if(!this.currentCommodityData){
            this.$router.push('/forex_home');
        }			
        mui.init();
        mui('#forex_detail')[0].classList.add('mui-slide-in');
        mui('.mui-scroll-wrapper').scroll();
        var historyParams = {
            method:'req_history_data',
            req_id:'',
            data:{
                contract_code:this.currentCommodityData.security_type + '_' + this.currentCommodityData.commodity_no,
                period:this.chartInfo.chartType,
                count:100,
                ask_or_bid:this.chartInfo.isSellChart
            }
        }
        this.marketSocket.send(JSON.stringify(historyParams));
        this.headerTitle = this.$route.query.name;
        this.switchUnit();
        this.getTradeRuleData();
        this.getLastData();
        document.getElementById('forex_detail').addEventListener('touchstart',function(e){
            e.preventDefault();  //阻止浏览器默认事件
        });
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'lastData',
            'currentCommodityData',
            'isQuickTrade',
            'tradeSocket',
            'isTradeLogin',
            'isAppLogin',
            'fiveMinPrice',
            'oneHourPrice',
            'allDayPrice',
            'chartInfo',
            'tipsMessage',
            'marketSocket'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    watch:{
        lastData:function(){
            this.pointNum = (Math.abs(this.lastData[11]-this.lastData[13])/this.currentCommodityData.mini_ticker_size).toFixed(2);
            // this.tradeBond = (this.lastData[11]+this.lastData[13])/2*this.minHand*this.contractNum;
            if(this.$route.name == 'forex_detail'){
                this.getLastData();
            }
        },
        fiveMinPrice:function(){
            var lowPrice = this.fiveMinPrice[0][1];
            var highPrice = this.fiveMinPrice[0][1];
            var priceList = this.fiveMinPrice;
            if(priceList.length<5){
                lowPrice = '-';
                highPrice = '-';
                this.fiveUpDownRate = '-';
            }else{
                for(var i=0,length=priceList.length;i<length;i++){
                    if(priceList[i][1]<lowPrice){
                        lowPrice = priceList[i][1];
                    }
                    if(priceList[i][1]>highPrice){
                        highPrice = priceList[i][1];
                    }
                }
                this.fiveUpDownRate = ((this.lastData[11]-this.fiveMinPrice[0][1])/this.fiveMinPrice[0][1]*100).toFixed(this.currentCommodityData.dot_size);
            }
            this.fivePrice.push(lowPrice);
            this.fivePrice.push(highPrice);
        },
        oneHourPrice:function(){
            var lowPrice = this.oneHourPrice[0][1];
            var highPrice = this.oneHourPrice[0][1];
            var priceList = this.oneHourPrice;
            if(priceList.length<60){
                lowPrice = '-';
                highPrice = '-';
                this.hourUpDownRate = '-';
            }else{
                for(var i=0,length=priceList.length;i<length;i++){
                    if(priceList[i][1]<lowPrice){
                        lowPrice = priceList[i][1];
                    }
                    if(priceList[i][1]>highPrice){
                        highPrice = priceList[i][1];
                    }
                }
                this.hourUpDownRate = ((this.lastData[11]-this.oneHourPrice[0][1])/this.oneHourPrice[0][1]*100).toFixed(this.currentCommodityData.dot_size);
            }
            this.hourPrice.push(lowPrice);
            this.hourPrice.push(highPrice);
        },
        allDayPrice:function(){
            var lowPrice = this.allDayPrice[0][1];
            var highPrice = this.allDayPrice[0][1];
            var priceList = this.allDayPrice;
            for(var i=0,length=priceList.length;i<length;i++){
                if(priceList[i][1]<lowPrice){
                    lowPrice = priceList[i][1];
                }
                if(priceList[i][1]>highPrice){
                    highPrice = priceList[i][1];
                }
            }
            this.allUpDownRate = ((this.lastData[11]-this.allDayPrice[0][1])/this.allDayPrice[0][1]*100).toFixed(this.currentCommodityData.dot_size);
            this.allDay.push(lowPrice);
            this.allDay.push(highPrice);
        },
        tipsMessage:function(){
            if(this.$route.name=='forex_detail'){
                if(this.tipsMessage.type == 3){
                    var message = this.tipsMessage.message;
                    if(message.Status == 4){
                        var a = message.Direction==0?'买':'卖';
                        var b = `开仓成功(${this.currentCommodityData.commodity_name},市价,${a}${this.minHand*this.contractNum}${this.unit})`;
                        this.msgTips = b;
                        this.$refs.dialog.isShow = true;
                        setTimeout(function(){
                            this.isSubmit = false;
                            this.$router.replace({
                                path:'/forex_home'
                            })
                        }.bind(this),1500);
                    }else if(message.Status == 1||message.Status == 3){
                        this.isSubmit = false;
                        this.msgTips = message.StatusMsg;
                        this.$refs.dialog.isShow = true;
                    }
                }
            }
        }
    },
    activated(){
    },
    methods:{
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
        //获取产品规则
        getRule(){
            //点差
            this.pointNum = (Math.abs(this.lastData[11]-this.lastData[13])/this.currentCommodityData.mini_ticker_size).toFixed(2);
            //合约乘数
            this.contractNum = (this.currentCommodityData.contract_size/this.currentCommodityData.mini_ticker_size).toFixed(2);
            //最小单价
            this.minPirce = this.currentCommodityData.mini_ticker_size;
            //交易保证金
            this.tradeBond = this.minHand*this.contractNum/this.level;
        },
        //获取手数杠杆数据
        getTradeRuleData(){
            this.$http.post(this.PATH + '/commodity/tradeRules', {emulateJSON: true},{
                params: {
                    commodityCode: this.currentCommodityData.commodity_no
                },
                timeout: 5000
            }).then(function(e){
                var data = e.body;
                if(data.success == true){
                    if(data.code == 1){
                        this.isConfigure = true;
                        this.minHand = data.data.miniTradableSize;
                        this.level = data.data.depositRatio;
                        this.getRule();
                    }
                }else{
                    this.isConfigure = false;
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            });
        },
        //换算单位
        switchUnit(){
            if(this.currentCommodityData){
                switch(this.currentCommodityData.commodity_no.split('.')[0]){
                    case 'AUD':this.unit="A$";break;
                    case 'EUR':this.unit="€";break;
                    case 'GBP':this.unit="￡";break;
                    case 'USD':this.unit="$";break;
                    case 'CNH':this.unit="￥";break;
                    case 'HKD':this.unit="HK$";break;
                    case 'JPY':this.unit="¥";break;
                }
            }
        },
        //展开数据
        openDetail(index){
            switch(index){
                case 1:this.isShowPosition = !this.isShowPosition;return;
                case 2:this.isShowData = !this.isShowData;return;
                case 3:this.isShowRule = !this.isShowRule;return;
            }
        },
        //计算各种需要的数据
        getLastData(){
            var total = parseFloat(this.lastData[12])+parseFloat(this.lastData[14]);
            this.sellRate = (this.lastData[12]/total*100).toFixed(2);
            this.buyRate = (this.lastData[14]/total*100).toFixed(2);
            var averagePrice = (parseFloat(this.lastData[11])+parseFloat(this.lastData[13]))/2;
            this.upDownRate = ((parseFloat(averagePrice)-parseFloat(this.lastData[10]))/this.lastData[10]*100).toFixed(2);
        },
        //下单
        goToOrder(index){
            if(!this.isTradeLogin){
				this.isShowLoginPop = true;
                return;
            }
            if(!this.isConfigure){
                this.msgTips = '请先配置此外汇';
                this.$refs.dialog.isShow = true;
                return;
            }
            //index: 1为卖出 2为买入
            if(this.isQuickTrade == 0){
                if(this.isSubmit){
                    return;
                }
                this.isSubmit = true;
                var orderParams = {
                    LiteOrderRef:'',
                    CommodityType:3,
                    CommodityNo:this.currentCommodityData.commodity_no,
                    Num:parseFloat(this.minHand),
                    PriceType:1,
                    Remark:'',
                }
                if(index == 1){
                    //卖出
                    orderParams.Direction = 1;
                }else if(index == 2){
                    //买入
                    orderParams.Direction = 0;
                }
                var orderParam = {
                    Method:'OpenLiteOrder',
                    Parameters:orderParams,
                }
                this.tradeSocket.send(JSON.stringify(orderParam));
            }else if(this.isQuickTrade == 1){
                this.$router.push({
                    path:'/forex_order',
                    query:{
                        type:index,
                        name:this.headerTitle
                    }
                })
            }
        },
        //弹窗
        popInfo(index){
            switch(index){
                case 1: this.infoPopHead = '用户持仓比';this.popContent='我们平台上买方持仓和卖方持仓占所有用户的百分比。';break;
                case 2: this.infoPopHead = '实时数据';this.popContent='不同时间范围的直观价格对比。可了解5分钟、60分钟以及当天的涨跌情况。';break;
                case 3: this.infoPopHead = '产品规则';this.popContent='我们平台上买方持仓和卖方持仓占所有用户的百分比。';break;
            }
            this.isShowInfoPop = true;
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#forex_detail{
    font-size: 14px;
    padding-top: 50px;
    overflow: hidden;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .forex-detail-content{
        height: 100%;
        width: 100%;
        overflow-x: hidden;
        overflow-y: auto;

    }
    .trade-btn-box{
        display: flex;
        justify-content: space-between;
        padding: 20px;
        border-bottom: solid 1px #17191e;
        background: #20212a;
        .trade-btn{
            width: 45%;
            height: 50px;
            color:#fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
    .quota-info{
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        color:#fff;
        border-bottom: solid 10px #17191e;
        box-sizing: content-box;
        background: #20212a;
    }
    .chart{
        height: 300px;
        border-bottom: solid 10px #17191e;
        box-sizing: content-box;
        background: #20212a;
    }
    .info-title{
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        border-bottom: solid 1px #17191e;
        font-size: 16px;
        background: #20212a;
        span{
            color:#7e829c;
            img{
                width: 15px;
                vertical-align: text-top;
                margin-left: 10px;

            }
            .arrow{
                width: 10px;
                transform: rotate(90deg);
            }
            .arrow-open{
                transform: rotate(-90deg);
            }
        }
    }
    .position-rate{
        padding: 10px 20px;
        border-bottom: solid 1px #17191e;
        background: #20212a;
        .position-rate-title{
            display: flex;
            justify-content: space-between;
        }
        .position-rate-value{
            color:#fff;
            font-size: 12px;
            .position-rate-bar{
                display: inline-block;
                vertical-align: middle;
                min-width: 30px;
                position: relative;
                height: 20px;;
                .position-value{
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
            }
            .position-rate-bar:first-child{
                .position-value{
                    left: 5px;
                }
            }
            .position-rate-bar:last-child{
                .position-value{
                    right: 5px;
                }
            }
        }
    }
    .timely-data{
        background: #20212a;
        .data-title{
            font-size: 15px;
            padding: 10px 20px;
            color:#7e829c;
            border-bottom: solid 1px #17191e;
        }
        .change-data{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            color: #fff;
            .change-data-div{
                display: flex;
                justify-content: space-around;
                .change-data-span{

                }
            }
        }
        .data-rate{
            font-size: 15px;
            padding: 10px 20px;
            color:#7e829c;
            border-bottom: solid 1px #17191e;
            display: flex;
            justify-content: space-between;
            .rate-value{
                color:#fff;
            }
        }
        .data-price-detail{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            .price-time{
                margin:5px 0px;
                .price-time-title{
                    display: flex;
                    justify-content: space-between;
                    color: #7e829c;
                }
                .price-time-line{
                    position: relative;
                    margin-top: 10px;
                    margin-bottom: 5px;
                    .triangle{    
                        display: inline-block;
                        border: solid 8px rgba(0, 0, 0, 0);
                        border-top-color: #ffd400;
                        position: absolute;
                        top: -8px;
                    }
                    .line-box{
                        height: 8px;
                        background: #323442;
                    }
                }
                .price-time-value{
                    display: flex;
                    justify-content: space-between;
                    color: #fff;
                }
            }
        }
    }
    .trade-rule{
        background: #20212a;
        ul{
            padding: 0;
            margin: 0;
            li{
                display: flex;
                border-bottom: solid 1px #17191e;
                min-height: 30px;
                align-items: stretch;
                .rule-title{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex:1;
                    color:#7e829c;
                    border-right: solid 1px #17191e;
                    text-align: center;
                }
                .rule-value{
                    display: flex;
                    padding-left: 10px;
                    align-items: center;
                    flex:3;
                    color:#fff;
                }
            }
            li:nth-child(odd){
                background: #323442;
            }
            li:nth-child(even){
                background: #20212a;
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #forex_detail{
        font-size: 14px*@ip5;
        padding-top: 50px*@ip5;
        .trade-btn-box{
            padding: 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            .trade-btn{
                height: 50px*@ip5;
            }
        }
        .quota-info{
            padding: 10px*@ip5 20px*@ip5;
            border-bottom: solid 10px*@ip5 #17191e;
        }
        .chart{
            height: 300px*@ip5;
            border-bottom: solid 10px*@ip5 #17191e;
        }
        .info-title{
            padding: 10px*@ip5 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            font-size: 16px*@ip5;
            span{
                img{
                    width: 15px*@ip5;
                    margin-left: 10px*@ip5;

                }
                .arrow{
                    width: 10px*@ip5;
                }
            }
        }
        .position-rate{
            padding: 10px*@ip5 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            .position-rate-value{
                font-size: 12px*@ip5;
                .position-rate-bar{
                    min-width: 30px*@ip5;
                    height: 20px*@ip5;
                }
                .position-rate-bar:first-child{
                    .position-value{
                        left: 5px*@ip5;
                    }
                }
                .position-rate-bar:last-child{
                    .position-value{
                        right: 5px*@ip5;
                    }
                }
            }
        }
        .timely-data{
            .data-title{
                font-size: 15px*@ip5;
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .change-data{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .data-rate{
                font-size: 15px*@ip5;
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .data-price-detail{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                .price-time{
                    margin:5px*@ip5 0px*@ip5;
                    .price-time-line{
                        margin-top: 10px*@ip5;
                        margin-bottom: 5px*@ip5;
                        .triangle{    
                            border-width: 8px*@ip5;
                            top: -8px*@ip5;
                        }
                        .line-box{
                            height: 8px*@ip5;
                        }
                    }
                }
            }
        }
        .trade-rule{
            ul{
                li{
                    border-bottom: solid 1px*@ip5 #17191e;
                    min-height: 30px*@ip5;
                    .rule-title{
                        border-right: solid 1px*@ip5 #17191e;
                    }
                    .rule-value{
                        padding-left: 10px*@ip5;
                    }
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #forex_detail{
        font-size: 14px*@ip6;
        padding-top: 50px*@ip6;
        .trade-btn-box{
            padding: 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            .trade-btn{
                height: 50px*@ip6;
            }
        }
        .quota-info{
            padding: 10px*@ip6 20px*@ip6;
            border-bottom: solid 10px*@ip6 #17191e;
        }
        .chart{
            height: 300px*@ip6;
            border-bottom: solid 10px*@ip6 #17191e;
        }
        .info-title{
            padding: 10px*@ip6 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            font-size: 16px*@ip6;
            span{
                img{
                    width: 15px*@ip6;
                    margin-left: 10px*@ip6;

                }
                .arrow{
                    width: 10px*@ip6;
                }
            }
        }
        .position-rate{
            padding: 10px*@ip6 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            .position-rate-value{
                font-size: 12px*@ip6;
                .position-rate-bar{
                    min-width: 30px*@ip6;
                    height: 20px*@ip6;
                }
                .position-rate-bar:first-child{
                    .position-value{
                        left: 5px*@ip6;
                    }
                }
                .position-rate-bar:last-child{
                    .position-value{
                        right: 5px*@ip6;
                    }
                }
            }
        }
        .timely-data{
            .data-title{
                font-size: 15px*@ip6;
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .change-data{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .data-rate{
                font-size: 15px*@ip6;
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .data-price-detail{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                .price-time{
                    margin:5px*@ip6 0px*@ip6;
                    .price-time-line{
                        margin-top: 10px*@ip6;
                        margin-bottom: 5px*@ip6;
                        .triangle{    
                            border-width: 8px*@ip6;
                            top: -8px*@ip6;
                        }
                        .line-box{
                            height: 8px*@ip6;
                        }
                    }
                }
            }
        }
        .trade-rule{
            ul{
                li{
                    border-bottom: solid 1px*@ip6 #17191e;
                    min-height: 30px*@ip6;
                    .rule-title{
                        border-right: solid 1px*@ip6 #17191e;
                    }
                    .rule-value{
                        padding-left: 10px*@ip6;
                    }
                }
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
