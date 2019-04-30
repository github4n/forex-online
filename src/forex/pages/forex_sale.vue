<template>
    <div id="sale">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div id="header-box">
            <header-bar :showBack="true">
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
            </header-bar>
        </div>
        <div class="order-info order-info-first">
            <div class="order-info-item">
                <span class="order-title">产品:</span>
                <span class="order-value">{{orderName}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title" v-if="saleCommodityObj.Direction==0">卖价汇率:</span>
                <span class="order-title" v-if="saleCommodityObj.Direction==1">买价汇率:</span>
                <span class="order-value" :style="(saleCommodityObj.Direction==0?lastData[11]-saleCommodityObj.OpenPrice:saleCommodityObj.OpenPrice-lastData[13])>0?{'color':colorUp}:{'color':colorDown}">{{saleCommodityObj.Direction==0?lastData[11]:lastData[13]}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">浮动盈亏:</span>
                <span class="order-value" :style="{'color':lastData[11]-saleCommodityObj.OpenPrice>0?colorUp:colorDown}" v-if="saleCommodityObj.Direction==0">${{((lastData[13]-saleCommodityObj.OpenPrice)*orderAmount*USDRate).toFixed(2)}}</span>
                <span class="order-value" :style="{'color':saleCommodityObj.OpenPrice-lastData[13]>0?colorUp:colorDown}" v-if="saleCommodityObj.Direction==1">${{((saleCommodityObj.OpenPrice-lastData[11])*orderAmount*USDRate).toFixed(2)}}</span>
            </div>
            <div class="order-info-item order-info-input">
                <span class="order-title">金额:</span>
                <span class="price-box">
                    <input class="price-input" type="number" v-model="closePrice" @input="priceTimelyChange" @blur="priceChange"/>
                    <span class="price-btn" @tap="minus">-</span>
                    <span class="price-btn" @tap="add">+</span>
                </span>
            </div>
        </div>
        <div class="trade-btn-box">
            <span class="trade-btn" @tap="goToBack">取消</span>
            <span class="trade-btn trade-btn-type" @tap="sendClose">平仓</span>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
import { setTimeout } from 'timers';
export default {
    components:{
        headerBar,
    },
    data(){
        return{
            headerTitle:'平仓', //头部文字
            orderName:'欧元/美元', //订单名称
            contractNum:'',//合约乘数
            orderAmount:0, //开仓价格
            minHand:0.05, //最小手数
            closePrice:0,//平仓金额
            msgTips:'',//toast消息
            unit:'',
            RMBRate:7.1,//人民币汇率
            USDRate:1,//美元汇率
            isSubmit:false,//是否提交数据中
        }
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'saleCommodityObj',
            'lastData',
            'currentCommodityData',
            'tradeSocket',
            'tipsMessage',
            'isTradeLogin',
            'forexCommodity',
            'userInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        if(!this.isTradeLogin){
            this.$router.push({
                path:'/forex_home'
            })
        }else{
            this.getTradeRuleData();
            this.getUSDRate();
            this.initRMBRate();
            this.getUnit();
            this.orderName = this.$route.query.name;
        }
    },
    watch:{
        tipsMessage:function(){
            if(this.$route.name == 'forex_sale'){
                if(this.tipsMessage.type == 3){
                    var message = this.tipsMessage.message;
                    if(message.Status == 8||message.Status == 7){
                        //平仓成功
                        var a = this.saleCommodityObj.PriceType==0?'限价':'市价';
                        var content =`平仓成功(${this.orderName},${a},卖出${this.closePrice}${this.unit})`
                        this.msgTips = content;
                        this.$refs.dialog.isShow = true;
                        setTimeout(function(){
                            this.isSubmit = false;
                            this.$router.replace({
                                path:'/forex_home'
                            });
                        }.bind(this),1000);
                    }else if(message.Status == 5){
                        //平仓中
                        this.isSubmit = false;
                        this.msgTips = '平仓中';
                        this.$refs.dialog.isShow = true;
                    }
                }else if(this.tipsMessage.type == 2){
                    this.isSubmit = false;
                    var message = this.tipsMessage.message;
                    this.msgTips = `${message.Message}`;
                    this.$refs.dialog.isShow = true;
                }
            }
        },
        forexCommodity:function(){
            if(this.$route.name == 'forex_sale'){
                this.getUSDRate();
            }
        }
    },
    methods:{
        priceTimelyChange(){
            if(this.closePrice == ''){
                this.closePrice = 0;
            }
        },
        //换算单位
        getUnit(){
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
        initData(){
            //合约乘数
            this.contractNum = (this.currentCommodityData.contract_size/this.currentCommodityData.mini_ticker_size).toFixed(2);
            //开仓金额
            var closeNum = 0; //已平仓手数
            if(this.saleCommodityObj.CloseParam&&this.saleCommodityObj.CloseParam.length>0){
                var length = this.saleCommodityObj.CloseParam.length;
                var closeParam = this.saleCommodityObj.CloseParam;
                for(var i=0;i<length;i++){
                    closeNum += closeParam[i].CloseNum;
                }
            }
            this.orderAmount = (this.saleCommodityObj.Num-closeNum)*this.contractNum;
            //默认平仓金额
            this.closePrice = this.orderAmount.toFixed(0);
            //最小变动价
            this.minPrice = (this.minHand/this.currentCommodityData.mini_ticker_size).toFixed(0);
        },
        //减
        minus(){
            if(this.closePrice-this.minPrice<this.minPrice){
                this.msgTips = '已达到最小值';
                this.$refs.dialog.isShow = true;
                this.closePrice = this.minPrice;
            }else{
                this.closePrice -= this.minPrice;
            }
        },
        //加
        add(){
            if(parseFloat(this.closePrice)+parseFloat(this.minPrice)>parseFloat(this.orderAmount)){
                this.msgTips = '已达到最大值';
                this.$refs.dialog.isShow = true;
                return;
            }
            this.closePrice = parseFloat(this.closePrice) + parseFloat(this.minPrice);
        },
        //金额变化
        priceChange(){
            if(this.closePrice<this.minPrice){
                this.closePrice = this.minPrice;
            }
            this.closePrice = this.closePrice - this.closePrice%this.minPrice;
        },
        //发送平仓
        sendClose(){
            if(this.isSubmit){
                return;
            }
            this.isSubmit = true;
            var orderParams = {
                LiteOrderID:this.saleCommodityObj.LiteOrderID,
                CloseNum:this.closePrice/this.contractNum,
            };
            if(this.closePrice==this.orderAmount){
                orderParams.Remark = '完全平仓';
            }else{
                orderParams.Remark = '部分平仓';
            }
            var orderParam = {
                Method:'CloseLiteOrder',
                Parameters:orderParams
            }
            this.tradeSocket.send(JSON.stringify(orderParam));
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
                        this.minHand = data.data.miniTradableSize;
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
        getUSDRate(){
            var no = this.currentCommodityData.commodity_no;
            var list = this.forexCommodity;
            var length = this.forexCommodity.length;
            var lastPrice = this.saleCommodityObj.Direction==0?this.lastData[11]:this.lastData[13];
            if(no.split('.')[1]=='USD'){
                //右置美元
                this.USDRate = 1;
            }else if(no.split('.')[0]=='USD'){
                //左置美元
                this.USDRate = 1/lastPrice;
            }else{
                //不存在美元
                for(var i=0;i<length;i++){
                    if(list[i].commodity_no.split('.')[0] == no.split('.')[0]&&list[i].commodity_no.split('.')[1]=='USD'){
                        switch(this.$route.query.type){
                            case 1:this.USDRate = 1/list[i].quotaData[13];break;
                            case 2:this.USDRate = 1/list[i].quotaData[11];break;
                        }
                    }
                }
            }
        },
        //获取汇率
        initRMBRate(){
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
        goToBack(){
            this.$router.go(-1);
        }
    }

    
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#sale{
    font-size: 14px;
    padding-top: 50px;
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
            .price-box{
                display: flex;
                align-items: center;
                .price-unit{
                    color:#7e829c;
                    margin-right: 5px;
                }
                .price-input{
                    background: #17191e;
                    color: #fff;
                    margin: 0;
                    padding: 0;
                    border: 0;
                    height: 30px;
                    width: 120px;
                    border: none;
                    padding-left: 5px; 
                    font-size: 14px;
                }
                .price-btn{
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    color:#7e829c;
                    background: #323442;
                    margin-left: 10px;
                    font-size: 24px;
                }
            }
        }
        .order-info-input{
            height: 50px;
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
            background: #323442;
            color:#7a7f99;
            height: 40px;
        }
        .trade-btn-type{
            color:#fff;
            background: #4588e6;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #sale{
        font-size: 14px*@ip5;
        padding-top: 50px*@ip5;
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
                .price-box{
                    .price-unit{
                        margin-right: 5px*@ip5;
                    }
                    .price-input{
                        height: 30px*@ip5;
                        width: 120px*@ip5;
                        padding-left: 5px*@ip5; 
                        font-size: 14px*@ip5;
                    }
                    .price-btn{
                        width: 30px*@ip5;
                        height: 30px*@ip5;
                        line-height: 30px*@ip5;
                        margin-left: 10px*@ip5;
                        font-size: 24px*@ip5;
                    }
                }
            }
            .order-info-input{
                height: 50px*@ip5;
            }
        }
        .trade-btn-box{
            padding: 10px*@ip5 20px*@ip5;
            .trade-btn{
                height: 40px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #sale{
        font-size: 14px*@ip6;
        padding-top: 50px*@ip6;
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
                .price-box{
                    .price-unit{
                        margin-right: 5px*@ip6;
                    }
                    .price-input{
                        height: 30px*@ip6;
                        width: 120px*@ip6;
                        padding-left: 5px*@ip6; 
                        font-size: 14px*@ip6;
                    }
                    .price-btn{
                        width: 30px*@ip6;
                        height: 30px*@ip6;
                        line-height: 30px*@ip6;
                        margin-left: 10px*@ip6;
                        font-size: 24px*@ip6;
                    }
                }
            }
            .order-info-input{
                height: 50px*@ip6;
            }
        }
        .trade-btn-box{
            padding: 10px*@ip6 20px*@ip6;
            .trade-btn{
                height: 40px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
