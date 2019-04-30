<template>
    <div id="trade_detail">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <loading v-show="isLoad"></loading>
		<div id="header-box">
			<header-bar :showBack="true" :showMenu="false">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
				<span slot="otherIcon" @tap="goToAgreement">
					<img src="../../assets/img/forex/suspect.png" />
				</span>
			</header-bar>
		</div>
        <div class="detail-tabs">
            <div :class="['tab-item',isSwitchTab?'tab-item-active':'']" @tap="switchTab(true)">
                方案明细
            </div>
            <div :class="['tab-item',isSwitchTab?'':'tab-item-active']" @tap="switchTab(false)">
                历史成交记录
            </div>
        </div>
        <div class="tab-one" v-show="isSwitchTab">
            <div class="trade-title">
                投资标的
            </div>
            <div class="trade-type">
                <div :class="['trade-type-item',item.sign?'trade-type-black':'trade-type-white']" v-for="(item,index) in tradeLever" :key="index">
                    <span class="type-item-title">{{item.tradeName}}</span>
                    <span class="type-item-num">{{item.mainContract.replace('.','')}}</span>
                </div>
            </div>
            <div class="trade-time">
                <span>交易时间:09：00-23：55，不同期货不同交易时间段</span>
            </div>
            <div class="info-list">
                <div class="info-item" v-if="isEnd != 1">
                    <span class="item-title">操盘账户</span>
                    <span class="item-value">{{tradeDetails.tranAccount}}</span>
                    <span class="item-right" v-if="isEnd == 4" @tap="goToTradeLogin">立即操盘</span>
                </div>
                <div class="info-item border-bold" v-if="isEnd != 1">
                    <span class="item-title">操盘密码</span>
                    <span class="item-value">{{tradeDetails.tranPassword}}</span>
                </div>
                <div class="info-item">
                    <span class="item-title">方案申请时间</span>
                    <span class="item-value">{{tradeDetails.appTime}}</span>
                </div>
                <div class="info-item">
                    <span class="item-title">最大持仓手数</span>
                    <span class="item-value">参考初级可持仓手数</span>
                </div>
                <div class="info-item">
                    <span class="item-title">操盘保证金</span>
                    <span class="item-value">{{tradeDetails.traderBond>0?tradeDetails.traderBond:0}}元</span>
                </div>
                <div class="info-item">
                    <span class="item-title">追加保证金</span>
                    <span class="item-value">{{tradeDetails.appendTraderBond>0?tradeDetails.appendTraderBond:0}}元</span>
                    <span class="item-right" v-if="isEnd == 4" @tap="appendBond">追加资金</span>
                </div>
                <div class="info-item">
                    <span class="item-title">操盘总资金</span>
                    <span class="item-value">{{tradeDetails.traderTotal}}美元</span>
                </div>
                <div class="info-item">
                    <span class="item-title">亏损平仓线</span>
                    <span class="item-value">{{tradeDetails.lineLoss}}美元</span>
                </div>
                <div class="info-item border-bold">
                    <span class="item-title">账户管理费</span>
                    <span class="item-value">{{tradeDetails.feeManage == 0?'免费':tradeDetails.feeManage+'元'}}</span>
                </div>
                <div class="info-item" v-if="isEnd == 6">
                    <span class="item-title">方案结算时间</span>
                    <span class="item-value">{{tradeDetails.endtime | transTime}}</span>
                </div>
                <div class="info-item" v-if="isEnd == 6">
                    <span class="item-title">交易盈亏</span>
                    <span class="item-value">{{tradeDetails.tranProfitLoss | getTwoNumber}}美元({{tradeDetails.tranProfitLoss*tradeRate | getTwoNumber}}人民币)</span>
                </div>
                <div class="info-item border-bold" v-if="isEnd == 6">
                    <span class="item-title">美元结算汇率</span>
                    <span class="item-value">1美元={{tradeRate}}人民币</span>
                </div>
            </div>
            <div class="option-btn" v-if="isEnd == 4">
                <div :class="['option-btn-item',isHaveProfit==1?'':'no-profit-btn']">
                    <span v-show="isHaveProfit==1" @tap="goToProfit">可提取盈利(￥{{profit}})</span>
                    <span v-show="isHaveProfit!=1" @tap="clickProfit">暂未盈利</span>
                </div>
                <div class="option-btn-item profit-btn" @tap="applyStopOrder">{{tradeDetails.feeManage == 0?'免费':tradeDetails.feeManage+'元'}}终结方案</div>
            </div>
            <div class="level-box" v-if="isEnd == 6">
                <div class="level-list" v-if="levelList.length>0">
                    <div class="level-list-item" v-for="(item,index) in levelList" :key="index">
                        <span class="level-item-title">
                            {{item.name}}
                        </span>
                        <span class="level-item-value">
                            {{item.ActualLever}}
                        </span>
                    </div>
                </div>
            </div>
            <div class="info-list" v-if="isEnd == 6">
                <div class="info-item">
                    <span class="item-title">结算金额</span>
                    <span class="item-value">{{tradeDetails.endAmount}}</span>
                </div>
                <div class="info-item">
                    <span class="item-title">交易手续费</span>
                    <span class="item-value">{{tradeDetails.tranFeesTotal==0?'免费':tradeDetails.tranFeesTotal}}</span>
                </div>
            </div>
            <div class="tips" v-if="isEnd == 6">
                <div>提示:</div>
				<div>结算金额（{{tradeDetails.endAmount | getTwoNumber}}）=操盘保证金（{{tradeDetails.traderBond | getTwoNumber}}）+追加保证金（{{tradeDetails.appendTraderBond | getTwoNumber}}）+ 结算盈亏（<span v-if="$store.state.appVersion == 'v1'">{{tradeDetails.tranProfitLoss*tradeRate | getTwoNumber}}</span><span v-if="$store.state.appVersion == 'v2'">{{tradeDetails.tranProfitLoss*tradeRate | getTwoNumber}}</span>）-交易手续费（{{tradeDetails.tranFeesTotal | getTwoNumber}}）-提取总利润
({{tradeDetails.totalWithdrawal*profitRate | getTwoNumber}})。</div>
            </div>
        </div>
        <div class="tab-two" v-show="!isSwitchTab">
            <div class="no-history" v-show="historyList.length==0">
                该方案未进行过交易
            </div>
            <div class="history-list" v-show="historyList.length>0">
                <div class="list-row history-list-title">
                    <span class="list-col">序号</span>
                    <span class="list-col list-col-time">成交日期</span>
                    <span class="list-col">客户号</span>
                    <span class="list-col">币种</span>
                    <span class="list-col">交易所</span>
                    <span class="list-col">品种</span>
                    <span class="list-col">买</span>
                    <span class="list-col">卖</span>
                    <span class="list-col">成交价</span>
                    <span class="list-col">平仓盈亏</span>
                    <span class="list-col">交易手续费</span>
                </div>
                <div class="list-row history-list-item" v-for="(item,index) in historyList" :key="index">
                    <span class="list-col">{{index + 1}}</span>
                    <span class="list-col list-col-time">{{item.tradeDate}}</span>
                    <span class="list-col">{{item.userNo}}</span>
                    <span class="list-col">{{item.currencyNo}}</span>
                    <span class="list-col">{{item.exchangeNo}}</span>
                    <span class="list-col">{{item.commodityNo}}</span>
                    <span class="list-col">{{item.buyNum}}</span>
                    <span class="list-col">{{item.sellNum}}</span>
                    <span class="list-col">{{item.tradePrice}}</span>
                    <span class="list-col">{{item.hedgeProfit}}</span>
                    <span class="list-col">{{item.free}}</span>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
export default {
    components:{
        headerBar
    },
    data(){
        return{
            headerTitle:'外汇',
            isSwitchTab:true, //true为方案明细 false为历史成交记录
            isHaveProfit:-1, //是否有盈利
            msgTips:'',//toast信息
            tradeDetails:{
                tranAccount:'',
                tranPassword:'',
                appTime:'',
                traderBond:0,
                appendTraderBond:0,
                traderTotal:0,
                lineLoss:0,
                feeManage:0,
                endtime:'',
                tranProfitLoss:0,
                feeManage:0,
                endAmount:0,
                tranFeesTotal:0,
                endAmount:0,
                totalWithdrawal:0,
            },//交易信息
            tradeLever:[],//投资标的
            profit:0,//盈利
            profitRate:1, //盈利汇率
            historyList:[],//历史交易记录
            isEnd:0,//1.开户中 2.申请结算 3.待结算 4.操盘中 5.审核不通过 6.已结算
            levelList:[],//交易手数数据
            tradeRate:1, //结算汇率
            profitPrice:0,//盈利
            isLoad:false,//是否数据加载
        }
    },
    filters:{
        getTwoNumber: function(value) {
            if(value) {
                return parseFloat(value).toFixed(2);
            } else {
                return "0.00";
            }
        },
        transTime:function(value){
            var date = new Date(value*1000);
            var year = date.getFullYear();
            var mouth = date.getMonth() + 1;
            var day = date.getDate();
            return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        }
    },
    activated(){
        this.isSwitchTab = true;
        this.getUserInfo();
        this.getProfitData();
    },
    computed:{
        ...mapState('forex',[
            'tradeConfig',
            'isTradeLogin',
            'forexCommodity',
            'isAppLogin',
            'userInfo',
            'tradeSocket'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    methods:{
        switchTab(status){
            if(!status){
                //如果选择历史成交需要判断
                if(this.tradeDetails.stateType != 6){
                    this.msgTips = '暂未结算，无法查看历史成交记录';
                    this.$refs.dialog.isShow = true;
                    return;
                }
                this.getHistoryData();
            }
            this.isSwitchTab = status;
        },
        //查询交易历史记录
        getHistoryData(){
            this.$http.post(this.PATH + '/user/ftrade/getFstTradeDetail', {emulateJSON: true}, {
                headers: {
                    'token': this.userInfo.token,
                    'secret': this.userInfo.secret
                },
                params: {
                    id: this.$route.query.id
                },
                timeout: 5000
            }).then(function(e) {
                var data = e.body;
                if(data.success == true) {
                    this.historyList = data.data;
                } else {
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function() {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //获取账户信息
        getUserInfo(){
            if(this.isAppLogin){
                this.getDetailData();
                if(localStorage.getItem('tradeRate')&&localStorage.getItem('profitRate')){
                    this.tradeRate = JSON.parse(localStorage.getItem('tradeRate'));
                    this.profitRate = JSON.parse(localStorage.getItem('profitRate'));
                }else{
                    this.getRateData();
                }
            }else{
                this.msgTips = '请先登录平台账号';
                this.$refs.dialog.isShow = true;
            }
        },
        //获取汇率
        getRateData(){
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
                if(data.code == 1){
                    this.tradeRate = data.data.tradeRate;
                    this.profitRate = data.data.profitRate;
                    localStorage.setItem('profitRate',data.data.profitRate);
                    localStorage.setItem('tradeRate',data.data.tradeRate);
                    localStorage.setItem('rate',data.data.rate);
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        goToProfit(){
			this.$router.push({
                path:'/profitOut',
                query:{
                    profit:this.profitPrice,
                    id:this.tradeDetails.id
                }
            });	
        },
        //获取详情数据
        getDetailData(){
            this.$http.post(this.PATH + '/user/ftrade/details', {emulateJSON: true}, {
                headers: {
                    'token': this.userInfo.token,
                    'secret': this.userInfo.secret
                },
                params: {
                    id: this.$route.query.id
                },
                timeout: 5000
            }).then(function(e) {
                var data = e.body;
                if(data.code == 1) {
                    this.optionError = false;
                    if(data.code == 1) {
                        this.tradeDetails = data.data.details;
                        this.isEnd = data.data.details.stateType;
                        if(data.data.details.stateType == 6){
                            this.levelList = JSON.parse(data.data.details.domesticActualLever);
                        }
                        this.handleContractData(data.data.details.outDiskVoList);
                    }
                } else {
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function() {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //处理可交易品种数据
        handleContractData(tradeObj){
            var length = tradeObj.length;
            var contractList = tradeObj;
            var sign = false;
            var num = 0;
            for(var i = 0;i<length;i++){
                contractList[i].sign = sign;
                num++;
                if(num == 2){
                    sign = !sign;
                    num = 0;
                }
            }
            this.tradeLever = contractList;
        },
        //查看是否盈利
        getProfitData(){
            this.$http.post(this.PATH + '/user/ftrade/qryProfit', {emulateJSON: true}, {
                headers: {
                    'token': this.userInfo.token,
                    'secret': this.userInfo.secret
                },
                params: {
                    id: this.$route.query.id
                },
                timeout: 5000
            }).then(function(e) {
                var data = e.body;
                this.isHaveProfit = data.code;
                if(data.code == 1) {
                    this.profitPrice = data.data;
                    this.getRate(data.data);
                }
            }.bind(this), function() {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //获取汇率
        getRate(profit){
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
                        var rate = data.data.profitRate;
                        this.profit = (profit * (rate * 10000) / 10000).toFixed(2)
                    }
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //申请终结方案
        applyStopOrder: function(){
            this.isLoad=true;
            this.$http.post(this.PATH + '/user/ftrade/endtrade', {emulateJSON: true}, {
                headers: {
                    'token': this.userInfo.token,
                    'secret': this.userInfo.secret
                },
                params: {
                    "id": this.$route.query.id,
                    "businessType": this.$route.query.businessType
                },
                timeout: 5000
            }).then(function(e) {
                var data = e.body;
                this.isLoad=false;
                if(data.success == true) {
                    if(data.code == 1){
                        if(data.data == 6){
                            this.msgTips = '结算成功';
                            this.$refs.dialog.isShow = true;
                            if(this.tradeDetails.tranAccount == this.tradeConfig.ClientNo){
                                var loginOutParam = {
                                    Method:'Logout',
                                    Parameters:{
                                        ClientNo: this.tradeConfig.ClientNo
                                    }
                                };
                                this.tradeSocket.send(JSON.stringify(loginOutParam));
                                this.tradeSocket.close();
                            }
                            localStorage.removeItem("tradeUser");
                            setTimeout(function(){
                                this.$router.replace({
                                    path: '/forex_tradeDetail',
                                    query:{
                                        type:6,
                                        id:this.tradeDetails.id,
                                        end:1
                                    }
                                });
                                this.isSwitchTab = true;
                                this.getUserInfo();
                            }.bind(this), 500);
                        }else{
                            this.msgTips = '申请成功';
                            this.$refs.dialog.isShow = true;
                            setTimeout(function(){
                                this.$router.replace({
                                    path: '/historyTradeApply',
                                    query:{
                                        type:1
                                    }
                                });
                            }.bind(this), 1000);
                        }
                    }
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function() {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        // 立即操盘
        goToTradeLogin(){
            this.$router.push({
                path:'/forex_login',
            })
            this.$store.state.forex.tradeLoginObj = {
                number:this.tradeDetails.tranAccount,
                password:this.tradeDetails.tranPassword
            }
        },
        //追加保证金
        appendBond(){
            // this.$router.push({
            //     path:'/addMoney',
            //     query:{
            //         id:this.tradeDetails.id,
            //         total:this.tradeDetails.traderTotal,
            //         loss:this.tradeDetails.lineLoss,
            //         businessType:this.tradeDetails.businessType
            //     }
            // });
            this.$router.push({
                path:'/forex_addMoney',
                query:{
                    id:this.tradeDetails.id
                }
            })
        },
        //操盘合作协议
        goToAgreement(){
            this.$router.push({
                path:'/agreement',
                query:{
                    type:'外汇'
                }
            })
        },
        clickProfit(){
            console.log(this.isHaveProfit);
            if(this.isHaveProfit == 3){
                this.msgTips = '无可盈利可提取';
                this.$refs.dialog.isShow = true;
            }else if(this.isHaveProfit == 4){
                this.msgTips = '有持仓，无法提取';
                this.$refs.dialog.isShow = true;
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#trade_detail{
    font-size: 14px;
	padding-top: 51px;
    z-index: 1000;
    position: relative;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .detail-tabs{
        display: flex;
        height: 44px;
        align-items: center;
        color:#7e829c;
        background: #20212a;
        border-bottom: solid 1px #17191e;
        .tab-item{
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .tab-item-active{
            color:#ffd400;
            position: relative;
        }
        .tab-item-active::after{
            content: '';
            position: absolute;
            width: 20px;
            height: 3px;
            background: #ffd400;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 1px;
        }
    }
    .tab-one{
        .trade-title{
            background: #20212a;
            padding: 10px 20px;
            color: #797d96;
        }
        .trade-type{
            display: flex;
            flex-wrap: wrap;
            .trade-type-item{
                width: 50%;
                padding: 5px 20px;
                display: flex;
                .type-item-title{
                    color:#fff;
                }
                .type-item-num{
                    color:#7e829c;
                }
            }
            .trade-type-white{
                background: #323442;
            }
            .trade-type-black{
                background: #20212a;
            }
        }
        .trade-time{
            padding-left: 20px;
            height: 30px;
            line-height: 30px;
            color: #7e829c;
            font-size: 12px;
        }
        .info-list{
            background: #20212a;
            .info-item{
                padding: 0px 20px;
                border-bottom: solid 1px #17191e;
                height: 40px;
                position: relative;
                display: flex;
                align-items: center;
                .item-title{
                    width: 100px;
                    color: #7e829c;
                }
                .item-value{
                    color: #fff;
                }
                .item-right{
                    position: absolute;
                    top: 0;
                    right: 0;
                    height: 100%;
                    width: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #17191e;
                    background: #ffd400;
                    font-size: 15px;
                }
            }
            .border-bold{
                border-bottom-width: 10px;
            }
        }
        .option-btn{
            padding: 30px;
            .option-btn-item{
                width: 100%;
                height: 50px;
                line-height: 50px;
                text-align: center;
                background: #ffd400;
                font-size: 18px;
                color: #17191e;
                margin-bottom: 15px;
            }
            .no-profit-btn{
                background: #323442;
            }
        }
        .level-box{
            .level-list{
                display: flex;
                flex-wrap: wrap;
                border-bottom: solid 10px #17191e;
                .level-list-item{
                    width: 25%;
                    border-right: solid 1px #17191e;
                    border-bottom: solid 10px #17191e;
                    span{
                        display: block;
                        text-align: center;
                        height: 30px;
                        line-height: 30px;
                    }
                    .level-item-title{
                        background: #323442;
                        color:#7e829c;
                    }
                    .level-item-value{
                        background: #20212a;
                        color:#fff;
                    }
                }
            }
        }
        .tips{
            padding: 10px 20px;
            color: #525566;
        }
    }
    .tab-two{
        .no-history{
            color:#7e829c;
            text-align: center;
        }
        .history-list{
            background: #20212a;
            overflow: auto;
            .history-list-title{
                color: #7e829c;
                font-size: 13px;
                height: 30px;
                line-height: 30px;
            }
            .history-list-item{
                color: #fff;
                height: 40px;
                line-height: 40px;
            }
            .list-row{
                white-space: nowrap;
                border-bottom: solid 1px #17191e;
                .list-col{
                    display: inline-block;
                    vertical-align: middle;
                    width:70px;
                    text-align: center;
                    text-align: center;
                }
                .list-col-time{
                    width: 150px;
                }
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #trade_detail{
        font-size: 14px*@ip5;
        padding-top: 51px*@ip5;
        .detail-tabs{
            height: 44px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            .tab-item-active::after{
                width: 20px*@ip5;
                height: 3px*@ip5;
                bottom: 5px*@ip5;
                border-radius: 1px*@ip5;
            }
        }
        .tab-one{
            .trade-title{
                padding: 10px*@ip5 20px*@ip5;
            }
            .trade-type{
                .trade-type-item{
                    padding: 5px*@ip5 20px*@ip5;
                }
            }
            .trade-time{
                padding-left: 20px*@ip5;
                height: 30px*@ip5;
                line-height: 30px*@ip5;
                font-size: 12px*@ip5;
            }
            .info-list{
                .info-item{
                    padding: 0px*@ip5 20px*@ip5;
                    border-bottom: solid 1px*@ip5 #17191e;
                    height: 40px*@ip5;
                    .item-title{
                        width: 100px*@ip5;
                    }
                    .item-right{
                        width: 80px*@ip5;
                        font-size: 15px*@ip5;
                    }
                }
                .border-bold{
                    border-bottom-width: 10px*@ip5;
                }
            }
            .option-btn{
                padding: 30px*@ip5;
                .option-btn-item{
                    height: 50px*@ip5;
                    line-height: 50px*@ip5;
                    font-size: 18px*@ip5;
                    margin-bottom: 15px*@ip5;
                }
            }
            .level-box{
                .level-list{
                    border-bottom: solid 10px*@ip5 #17191e;
                    .level-list-item{
                        border-right: solid 1px*@ip5 #17191e;
                        border-bottom: solid 10px*@ip5 #17191e;
                        span{
                            height: 30px*@ip5;
                            line-height: 30px*@ip5;
                        }
                    }
                }
            }
            .tips{
                padding: 10px*@ip5 20px*@ip5;
            }
        }
        .tab-two{
            .history-list{
                .history-list-title{
                    font-size: 13px*@ip5;
                    height: 30px*@ip5;
                    line-height: 30px*@ip5;
                }
                .history-list-item{
                    height: 40px*@ip5;
                    line-height: 40px*@ip5;
                }
                .list-row{
                    border-bottom: solid 1px*@ip5 #17191e;
                    .list-col{
                        width:70px*@ip5;
                    }
                    .list-col-time{
                        width: 150px*@ip5;
                    }
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #trade_detail{
        font-size: 14px*@ip6;
        padding-top: 51px*@ip6;
        .detail-tabs{
            height: 44px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            .tab-item-active::after{
                width: 20px*@ip6;
                height: 3px*@ip6;
                bottom: 5px*@ip6;
                border-radius: 1px*@ip6;
            }
        }
        .tab-one{
            .trade-title{
                padding: 10px*@ip6 20px*@ip6;
            }
            .trade-type{
                .trade-type-item{
                    padding: 5px*@ip6 20px*@ip6;
                }
            }
            .trade-time{
                padding-left: 20px*@ip6;
                height: 30px*@ip6;
                line-height: 30px*@ip6;
                font-size: 12px*@ip6;
            }
            .info-list{
                .info-item{
                    padding: 0px*@ip6 20px*@ip6;
                    border-bottom: solid 1px*@ip6 #17191e;
                    height: 40px*@ip6;
                    .item-title{
                        width: 100px*@ip6;
                    }
                    .item-right{
                        width: 80px*@ip6;
                        font-size: 15px*@ip6;
                    }
                }
                .border-bold{
                    border-bottom-width: 10px*@ip6;
                }
            }
            .option-btn{
                padding: 30px*@ip6;
                .option-btn-item{
                    height: 50px*@ip6;
                    line-height: 50px*@ip6;
                    font-size: 18px*@ip6;
                    margin-bottom: 15px*@ip6;
                }
            }
            .level-box{
                .level-list{
                    border-bottom: solid 10px*@ip6 #17191e;
                    .level-list-item{
                        border-right: solid 1px*@ip6 #17191e;
                        border-bottom: solid 10px*@ip6 #17191e;
                        span{
                            height: 30px*@ip6;
                            line-height: 30px*@ip6;
                        }
                    }
                }
            }
            .tips{
                padding: 10px*@ip6 20px*@ip6;
            }
        }
        .tab-two{
            .history-list{
                .history-list-title{
                    font-size: 13px*@ip6;
                    height: 30px*@ip6;
                    line-height: 30px*@ip6;
                }
                .history-list-item{
                    height: 40px*@ip6;
                    line-height: 40px*@ip6;
                }
                .list-row{
                    border-bottom: solid 1px*@ip6 #17191e;
                    .list-col{
                        width:70px*@ip6;
                    }
                    .list-col-time{
                        width: 150px*@ip6;
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
