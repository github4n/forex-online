<template>
    <div id="position-detail">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div id="header-box">
            <header-bar :showBack="true" :showMenu="false">
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
            </header-bar>
        </div>
        <div class="order-info">
            <div class="order-info-item">
                <span class="order-code order-value">{{chooseDetailData.CommodityNo}}</span>
                <span class="order-value" :style="(chooseDetailData.Direction==0?lastData[11]:lastData[13])>lastData[10]?{'color':colorUp}:{'color':colorDown}">{{chooseDetailData.Direction==0?lastData[13]:lastData[11]}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">订单编号:</span>
                <span class="order-value">{{chooseDetailData.LiteOrderID}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">类型:</span>
                <span class="order-value" v-if="chooseDetailData.Direction == 0">买入</span>
                <span class="order-value" v-if="chooseDetailData.Direction == 1">卖出</span>
            </div>
            <div class="order-info-item" v-if="chooseDetailData.Status == 4||chooseDetailData.Status == 7">
                <span class="order-title">浮动盈亏:</span>
                <span class="order-value" v-if="chooseDetailData.Direction == 0" :style="chooseDetailData.OpenPrice<lastData[13]?{'color':colorUp}:{'color':colorDown}">${{((lastData[13]-chooseDetailData.OpenPrice)*chooseDetailData.tradePrice*USDRate).toFixed(2)}}</span>
                <span class="order-value" v-if="chooseDetailData.Direction == 1" :style="chooseDetailData.OpenPrice>lastData[11]?{'color':colorUp}:{'color':colorDown}">${{((chooseDetailData.OpenPrice-lastData[11])*chooseDetailData.tradePrice*USDRate).toFixed(2)}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">开盘价:</span>
                <span class="order-value" v-if="chooseDetailData.Status == 4||chooseDetailData.Status == 7">{{chooseDetailData.OpenPrice}}</span>
                <span class="order-value" v-if="chooseDetailData.Status == 2">{{chooseDetailData.StatusMsg}}</span>
            </div>
            <div class="order-info-item" v-show="chooseDetailData.PriceType == 0">
                <span class="order-title">限价:</span>
                <span class="order-value">{{chooseDetailData.LimitPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">止盈价格:</span>
                <span class="order-value">{{chooseDetailData.StopprofitPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">止损价格:</span>
                <span class="order-value">{{chooseDetailData.StoplossPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">点差止损:</span>
                <span class="order-value">{{chooseDetailData.StoplossDiff}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">金额:</span>
                <span class="order-value">{{chooseDetailData.tradePrice}}{{unit}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">开仓价值:</span>
                <span class="order-value">{{openPrice.toFixed(2)}}美元</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">当前价值:</span>
                <span class="order-value">{{currentPrice.toFixed(2)}}美元</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">初始保证金:</span>
                <span class="order-value">{{initBond.toFixed(2)}}美元</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">开仓时间:</span>
                <span class="order-value" v-if="chooseDetailData.Status == 4||chooseDetailData.Status == 7">{{chooseDetailData.OpenDateTime}}</span>
                <span class="order-value" v-if="chooseDetailData.Status == 2">{{chooseDetailData.StatusMsg}}</span>
            </div>
        </div>
        <div class="trade-btn-box">
            <span class="trade-btn" @tap="goToOther(1)">改单</span>
            <span class="trade-btn" v-if="chooseDetailData.Status == 4||chooseDetailData.Status == 7" @tap="goToOther(2)">平仓</span>
            <span class="trade-btn" v-if="chooseDetailData.Status == 2" @tap="goToOther(3)">撤单</span>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
export default {
    components:{
        headerBar,
    },
    data(){
        return{
            headerTitle:'美元/日元',
            USDRate:1, //美元汇率
            RMBRate:1, //人民币汇率
            unit:'',//单位
            openPrice:0,//开仓价值
            currentPrice:0,//当前价值
            initBond:0,//初始保证金
            level:0.05,//杠杆 计算保证金用的
            msgTips:'',//toast消息
        }
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'chooseDetailData',
            'lastData',
            'forexCommodity',
            'userInfo',
            'isAppLogin',
            'isTradeLogin',
            'tradeSocket',
            'tipsMessage'
        ]),
        PATH:function(){
            return this.$store.getters.PATH;
        }
    },
    watch:{
        lastData:function(){
            if(this.$route.name == 'forex_positionDetail'){
                var lastRate = this.chooseDetailData.Direction==0?this.lastData[13]:this.lastData[11];
                this.currentPrice = lastRate*this.chooseDetailData.tradePrice;
                this.initUnit();
            }
        },
        tipsMessage:function(){
            if(this.$route.name=='forex_positionDetail'){
                if(this.tipsMessage.type == 2){
                    var message = this.tipsMessage.message;
                    if(!message.Status){
                        if(message.Code == 0){
                            this.msgTips = '取消挂单成功';
                            this.$refs.dialog.isShow = true;
                            setTimeout(function(){
                                this.$router.go(-1);
                            }.bind(this),1500);
                        }else if(message.Code != 0){
                            this.msgTips = message.Message;
                            this.$refs.dialog.isShow = true;
                        }
                    }
                }
            }
        },
    },
    activated(){
        if(!this.isTradeLogin){
            this.$router.push({
                path:'/forex_home'
            })
        }else{
            this.initUnit();
            this.initRate();
            this.getTradeRuleData();
            this.headerTitle = this.chooseDetailData.commodityName;
        }
    },
    methods:{
        //计算开仓价值,当前价值,初始保证金,
        initData(){
            var lastRate = this.chooseDetailData.Direction==0?this.lastData[11]:this.lastData[13];
            this.openPrice = this.chooseDetailData.OpenPrice*this.chooseDetailData.tradePrice;
            this.currentPrice = lastRate*this.chooseDetailData.tradePrice;
            this.initBond = this.chooseDetailData.tradePrice*this.level*this.USDRate;
        },
        getTradeRuleData(){
            this.$http.post(this.PATH + '/commodity/tradeRules', {emulateJSON: true},{
                params: {
                    commodityCode: this.chooseDetailData.CommodityNo
                },
                timeout: 5000
            }).then(function(e){
                var data = e.body;
                if(data.success == true){
                    if(data.code == 1){
                        this.level = data.data.depositRatio;
                        this.initData();
                    }
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            });
        },
        //换算单位
        initUnit(){
            switch(this.chooseDetailData.CommodityNo.split('.')[0]){
                case 'AUD':this.unit="A$";break;
                case 'EUR':this.unit="€";break;
                case 'GBP':this.unit="￡";break;
                case 'USD':this.unit="$";break;
                case 'CNH':this.unit="￥";break;
                case 'HKD':this.unit="HK$";break;
                case 'JPY':this.unit="¥";break;
            }
        },
        //获取汇率
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
                                this.RMBRate = data.data.rate;
                                localStorage.setItem('forexRate',data.data.rate);
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
            var no = this.chooseDetailData.CommodityNo;
            var list = this.forexCommodity;
            var length = this.forexCommodity.length;
            if(no.split('.')[1]=='USD'){
                //右置美元
                this.USDRate = 1;
            }else if(no.split('.')[0]=='USD'){
                //左置美元
                this.USDRate = 1/this.chooseDetailData.Direction==0?this.lastData[11]:this.lastData[13];
            }else{
                //不存在美元
                for(var i=0;i<length;i++){
                    if(list[i].commodity_no.split('.')[1] == no.split('.')[1]&&list[i].commodity_no.split('.')[0]=='USD'){
                        switch(this.$route.query.type){
                            case 1:this.USDRate = 1/list[i].quotaData[13];break;
                            case 2:this.USDRate = 1/list[i].quotaData[11];break;
                        }
                    }
                }
            }
        },
        goToOther(index){
            if(index == 1){
                //改单
				this.$store.state.forex.saleCommodityObj = this.chooseDetailData;
				this.$router.push({
					path:'/forex_order',
					query:{
						type:3,
						name:this.chooseDetailData.commodityName
					}
				})
            }else if(index == 2){
                //平仓
				this.$store.state.forex.saleCommodityObj = this.chooseDetailData;
				this.$router.push({
					path:'/forex_sale',
					query:{
						name:this.chooseDetailData.commodityName
					}
				})
            }else if(index == 3){
                //撤单
				var orderParam = {
					Method:'CancelLiteOrder',
					Parameters:{
						LiteOrderID:this.chooseDetailData.LiteOrderID,
					},
				}
				this.tradeSocket.send(JSON.stringify(orderParam));
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#position-detail{
    font-size: 14px;
    padding-bottom: 60px;
    padding-top: 51px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .order-info{
        .order-info-item{
            padding: 10px 20px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: solid 1px #17191e;
            background: #20212a;
            .order-title{
                color:#7e829c;
            }
            .order-code{
                font-size: 16px;
            }
            .order-value{
                color:#fff;
                span{
                    margin-left: 5px;
                }
            }
        }
    }
    .trade-btn-box{
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;
        background: #20212a;
        position: fixed;
        bottom: 0;
        width: 100%;
        .trade-btn{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 48%;
            background: #4588e6;
            color:#fff;
            font-size: 16px;
            font-weight: bold;
            height: 40px;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #position-detail{
        font-size: 14px*@ip5;
        padding-bottom: 60px*@ip5;
        padding-top: 51px*@ip5;
        .order-info{
            .order-info-item{
                padding: 10px*@ip5 20px*@ip5;
                height: 40px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                .order-code{
                    font-size: 16px*@ip5;
                }
                .order-value{
                    span{
                        margin-left: 5px*@ip5;
                    }
                }
            }
        }
        .trade-btn-box{
            padding: 10px*@ip5 20px*@ip5;
            .trade-btn{
                height: 40px*@ip5;
                font-size: 16px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #position-detail{
        font-size: 14px*@ip6;
        padding-bottom: 60px*@ip6;
        padding-top: 51px*@ip6;
        .order-info{
            .order-info-item{
                padding: 10px*@ip6 20px*@ip6;
                height: 40px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                .order-code{
                    font-size: 16px*@ip6;
                }
                .order-value{
                    span{
                        margin-left: 5px*@ip6;
                    }
                }
            }
        }
        .trade-btn-box{
            padding: 10px*@ip6 20px*@ip6;
            .trade-btn{
                height: 40px*@ip6;
                font-size: 16px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
