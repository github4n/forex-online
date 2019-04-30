<template>
    <div id="history" class="mui-off-canvas-wrap mui-draggable">
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
                    <span slot="otherIcon" @tap="chooseDate">
                        <img src="../../assets/img/forex/date.png" />
                    </span>
                </header-bar>
            </div>
            <div class="mui-scroll-wrapper">
                <div class="mui-scroll">
                    <div class="history-list">
                        <div v-show="chooseTime!=''&&historyList.length>0" class="choose-date">选择日期:{{chooseTime}}</div>
                        <div class="history-item" @tap="goToDetail(item)" v-for="(item,index) in historyList" :key="index">
                            <div class="history-item-top">
                                <span class="item-top-value">{{item.name}}</span>
                                <span class="item-top-value" v-if="item.Status!=8" :style="item.floatPrice>=0?(item.floatPrice==0?'':{'color':colorUp}):{'color':colorDown}">${{item.floatPrice | getTwoNum}}</span>
                                <span class="item-top-value" v-if="item.Status == 8" :style="item.closeProfit>=0?item.closeProfit==0?'':{'color':colorUp}:{'color':colorDown}">${{item.closeProfit | getTwoNum}}</span>
                            </div>
                            <div class="history-item-bottom">
                                <span class="item-bottom-value">{{item.openTime}}</span>
                                <span class="item-bottom-value">
                                    <span v-if="item.Direction==1">卖出</span>
                                    <span v-if="item.Direction==0">买入</span>
                                    <span>{{item.CommodityNo.split('.')[0]+item.CommodityNo.split('.')[1]}}</span>
                                    <span>{{(item.totalPrice).toFixed(0)}}</span>
                                </span>
                            </div>
                            <img class="arrow-icon" src="../../assets/img/forex/arrow.png" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="no-order-data" v-show="historyList.length == 0">
                <div class="text-tip">{{chooseTime}}无任何历史订单</div>
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
import {mapState} from 'vuex';
import headerBar from '../components/header';
import hiddenMenu from '../components/hiddenMenu';
export default {
    components:{
        headerBar,
        hiddenMenu
    },
    data(){
        return{
            headerTitle:'历史成交', 
            historyList:[], //历史订单
            RMBRate:7.1, //人民币汇率
            chooseTime:'', //选择的时间
            msgTips:'',//toast消息

            isShowInfoPop:false, //是否显示消息弹窗
            infoPopHead:'', //消息弹窗头部
            isShowPop:false, //是否快速交易显示弹窗
            popHead:'', //快速交易弹窗头部
            popContent:'', //文字说明内容
            isSelectQuick:false, //是否选择协议
        }
    },
    mounted(){
        mui.init();
        mui('#history')[0].classList.add('mui-slide-in');
		mui('.mui-scroll-wrapper').scroll()
    },
    activated(){
        if(!this.isTradeLogin){
            this.$router.push({
                path:'/forex_home'
            })
        }else{
            this.initRate();
            this.$store.state.forex.forexHistoryList = this.forexOrderList.slice(0);
            // this.handleData();
        }
    },
    filters:{
        getTwoNum(value){
            return parseFloat(value).toFixed(2);
        }
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'forexOrderList',
            'forexCommodity',
            'isTradeLogin',
            'isAppLogin',
            'forexHistoryList',
            'tradeSocket',
            'isAppLogin',
            'userInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    watch:{
        forexHistoryList:function(){
            if(this.$route.name=="forex_history"){
                this.handleData();
            }
        },
        forexCommodity:function(){
            if(this.$route.name=="forex_history"){
                this.handleData();
            }
        }
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
        handleData(){
            var orderList = this.forexHistoryList;
            var historyLength = this.forexHistoryList.length;
            for(var i=0;i<historyLength;i++){
                orderList[i]['openTime'] = orderList[i].OpenDateTime;
                //已开仓
                var quatoList = this.forexCommodity;
                var quatoLength = this.forexCommodity.length;
                for(var j=0;j<quatoLength;j++){
                    if(orderList[i].CommodityNo == quatoList[j].commodity_no){
                        orderList[i]['name'] = quatoList[j].commodity_name;
                        orderList[i]['commodityList'] = quatoList[j];
                        //合约乘数
                        if(quatoList[j].commodity_no.split('.')[1]=='USD'){
                            //右置美元
                            orderList[i]['USDRate'] = 1;
                        }else if(quatoList[j].commodity_no.split('.')[0]=='USD'){
                            //左置美元
                            switch(orderList[i].Direction){
                                case 0:
                                    orderList[i]['USDRate'] = 1/quatoList[j].quotaData[13];
                                    break;
                                case 1:
                                    orderList[i]['USDRate'] = 1/quatoList[j].quotaData[11];
                                    break;
                            };
                        }else{
                            //不存在美元
                            for(var z=0;z<this.forexCommodity.length;z++){
                                if(this.forexCommodity[z].commodity_no.split('.')[1] == orderList[i].CommodityNo.split('.')[1]&&orderList[i].CommodityNo.split('.')[0]=='USD'){
                                    switch(orderList[i].Direction){
                                        case 0:orderList[i]['USDRate'] = 1/this.forexCommodity[z].quotaData[13];break;
                                        case 1:orderList[i]['USDRate'] = 1/this.forexCommodity[z].quotaData[11];break;
                                    }
                                }
                            }
                        };
                        orderList[i]['contractNo'] = (quatoList[j].contract_size/quatoList[j].mini_ticker_size).toFixed(2);
                        var CloseParam = 0;
                        if(orderList.CloseParam){
                            for(var z=0;z<orderList[i].CloseParam.length;z++){
                                CloseParam += orderList[i].CloseParam[z].CloseNum;
                            }
                        }
                        orderList[i]['CurrentNum'] = orderList[i].Num - CloseParam;
                        orderList[i]['totalPrice'] = orderList[i].CurrentNum*orderList[i].contractNo;
                        if(orderList[i].Status == 1){
                            //提交失败
                        }else{
                            if(orderList[i].Status == 3){
                                //开仓失败
                            }else{
                                if(orderList[i].Status == 4||orderList[i].Status == 7){
                                    switch(orderList[i].Direction){
                                        case 0:
                                        orderList[i]['floatPrice'] = (quatoList[j].quotaData[13]-orderList[i].OpenPrice)*orderList[i].totalPrice*orderList[i].USDRate;
                                        break;
                                        case 1:
                                        orderList[i]['floatPrice'] = (orderList[i].OpenPrice-quatoList[j].quotaData[11])*orderList[i].totalPrice*orderList[i].USDRate;
                                        break;
                                    };
                                    break;
                                }else if(orderList[i].Status == 8){
                                    //已平仓
                                    orderList[i]['closeTime'] = orderList[i].CloseParam[orderList[i].CloseParam.length - 1].CloseDateTime;
                                    orderList[i]['closePrice'] = orderList[i].CloseParam[orderList[i].CloseParam.length - 1].ClosePrice;
                                    var closeList = orderList[i].CloseParam;
                                    var closeLength = orderList[i].CloseParam.length;
                                    var closeProfit = 0;
                                    for(var z=0;z<closeLength;z++){
                                        if(closeList[z]){
                                            closeProfit = parseFloat(closeProfit) + parseFloat(closeList[z].CloseProfit);
                                        }
                                    }
                                    orderList[i]['closeProfit'] = (closeProfit).toFixed(2);
                                }else if(orderList[i].Status == 9){
                                    //已撤销

                                }
                            }
                        }
                        break;
                    }
                }
            };
            var _orderList = [];
            for(var i=0;i<orderList.length;i++){
                if(orderList[i].Status!=1&&orderList[i].Status!=2&&orderList[i].Status!=3&&orderList[i].Status!=6&&orderList[i].Status!=9){
                    _orderList.push(orderList[i]);
                }
            }
            this.historyList = _orderList.slice(0);
        },
        goToDetail(item){
            this.$store.state.forex.chooseDetailData = item;
			this.$store.state.forex.lastData = item.commodityList.quotaData;
            this.$store.state.forex.currentCommodityData = item.commodityList;
            this.$router.push({
                path:'/forex_historyDetail'
            })
        },
        //选择时间
        chooseDate(){
            var options = {
                type: "date", //设置日历初始视图模式
            }
            var picker = new mui.DtPicker(options);
            picker.show(function(item){
                this.chooseTime = '';
                this.chooseTime = item.value;
                var qryParams = {
                    Method:'QryLiteOrder',
                    ReqID:'history',
                    Parameters:{
                        Type:2,
                        BeginTime:this.chooseTime + ' 00:00:00',
                        EndTime:this.chooseTime + ' 23:59:59'
                    }
                }
                this.tradeSocket.send(JSON.stringify(qryParams));
            }.bind(this));
        },
        //跳转交易
        goToTrade(){
            this.$router.replace({
                path:'/forex_home'
            })
        },
        //获取人民币汇率
        initRate(){
            if(!localStorage.getItem('forexRate')){
                if(this.isAppLogin){
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
                                if(data.data){
                                    this.RMBRate = data.data.rate;
                                    localStorage.setItem('forexRate',data.data.rate);
                                }
                            }
                        }else{
                            this.msgTips = data.message;
                            this.$refs.dialog.isShow = true;
                        }
                    }.bind(this), function(){
                        this.msgTips = '连接服务器失败';
                        this.$refs.dialog.isShow = true;
                    });
                }else{
                    this.msgTips = '请登录平台账号获取更加准确的数据';
                    this.$refs.dialog.isShow = true;
                }
            }else{
                this.RMBRate = localStorage.getItem('forexRate');
            }
        },
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#history{
    padding-top: 51px;
    height: 100%;
    z-index: 1000;
    position: relative;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .history-list{
        .choose-date{
            color: #fff;
            padding: 5px 20px;
            font-size: 14px;
        }
        .history-item{
            padding: 10px 20px;
            padding-right: 40px;
            border-bottom: solid 9px #17191e;
            background: #20212a;
            position: relative;
            .history-item-top{
                display: flex;
                justify-content: space-between;
                .item-top-value{
                    font-size: 14px;
                    color:#fff;
                }
            }
            .history-item-bottom{
                display: flex;
                justify-content: space-between;
                .item-bottom-value{
                    font-size: 12px;
                    color:#7a7f99;
                }
            }
            .arrow-icon{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 3%;
                width: 10px;
            }
        }
    }
    .no-order-data{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 80%;
        z-index: 10;
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
    #history{
        padding-top: 51px*@ip5;
        .history-list{
            .choose-date{
                padding: 5px*@ip5 20px*@ip5;
                font-size: 14px*@ip5;
            }
            .history-item{
                padding: 10px*@ip5 20px*@ip5;
                padding-right: 40px*@ip5;
                border-bottom: solid 9px*@ip5 #17191e;
                .history-item-top{
                    .item-top-value{
                        font-size: 14px*@ip5;
                    }
                }
                .history-item-bottom{
                    .item-bottom-value{
                        font-size: 12px*@ip5;
                    }
                }
                .arrow-icon{
                    width: 10px*@ip5;
                }
            }
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
    #history{
        padding-top: 51px*@ip6;
        .history-list{
            .choose-date{
                padding: 5px*@ip6 20px*@ip6;
                font-size: 14px*@ip6;
            }
            .history-item{
                padding: 10px*@ip6 20px*@ip6;
                padding-right: 40px*@ip6;
                border-bottom: solid 9px*@ip6 #17191e;
                .history-item-top{
                    .item-top-value{
                        font-size: 14px*@ip6;
                    }
                }
                .history-item-bottom{
                    .item-bottom-value{
                        font-size: 12px*@ip6;
                    }
                }
                .arrow-icon{
                    width: 10px*@ip6;
                }
            }
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
