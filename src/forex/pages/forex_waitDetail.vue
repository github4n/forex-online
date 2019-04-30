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
                <span class="order-value" :style="(chooseDetailData.Direction==0?lastData[11]>chooseDetailData.LimitPrice:chooseDetailData.LimitPrice>lastData[13])?{'color':colorUp}:{'color':colorDown}">{{chooseDetailData.Direction==0?lastData[13]:lastData[11]}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">类型:</span>
                <span class="order-value" v-if="chooseDetailData.Direction == 0">买入</span>
                <span class="order-value" v-if="chooseDetailData.Direction == 1">卖出</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">状态:</span>
                <span class="order-value">待交易</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">订单价格:</span>
                <span class="order-value">{{chooseDetailData.LimitPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">当前价格:</span>
                <span class="order-value" :style="(chooseDetailData.Direction==0?lastData[11]>chooseDetailData.LimitPrice:chooseDetailData.LimitPrice>lastData[13])?{'color':colorUp}:{'color':colorDown}">{{chooseDetailData.Direction==0?lastData[13]:lastData[11]}}</span>
            </div>
            <div class="order-info-item" v-show="chooseDetailData.PriceType == 0">
                <span class="order-title">限价:</span>
                <span class="order-value">{{chooseDetailData.LimitPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">止盈:</span>
                <span class="order-value">{{chooseDetailData.StopprofitPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">止损:</span>
                <span class="order-value">{{chooseDetailData.StoplossPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">金额:</span>
                <span class="order-value">{{chooseDetailData.tradePrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">价值:</span>
                <span class="order-value">2738912美元</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">挂单时间:</span>
                <span class="order-value">{{chooseDetailData.InsertTime}}</span>
            </div>
            <div class="order-info-item" v-if="chooseDetailData.CloseParam">
                <span class="order-title">平仓</span>
            </div>
            <!-- <div class="order-info-list">
                <div class="order-info-item" v-if="chooseDetailData.CloseParam">
                    <span class="order-title">挂单时间:</span>
                    <span class="order-value">{{chooseDetailData.OpenDateTime}}</span>
                </div>
            </div> -->
            <!-- <div class="order-info-item">
                <span class="order-title">挂单最后存在时间:</span>
                <span class="order-value">2018-12-27 22:08:17</span>
            </div> -->
        </div>
        <div class="trade-btn-box">
            <span class="trade-btn" @tap="goToOrder(2)">取消</span>
            <span class="trade-btn trade-btn-type" @tap="goToOrder(1)">改单</span>
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
            headerTitle:'美元/日元',
            USDRate:1, //美元汇率
            RMBRate:7.1, //人民币汇率
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
            'tradeSocket',
            'isTradeLogin',
            'tipsMessage'
        ]),
        PATH:function(){
            return this.$store.getters.PATH;
        }
    },
    activated(){
        if(!this.isTradeLogin){
            this.$router.push({
                path:'/forex_home'
            })
        }else{
            this.initRate();
            this.headerTitle = this.chooseDetailData.commodityName;
        }
    },
    watch:{
        tipsMessage:function(){
            if(this.$route.name=='forex_waitDetail'){
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
        }
    },
    methods:{
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
                this.USDRate = this.chooseDetailData.Direction==0?1/this.lastData[11]:1/this.lastData[13];
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
        goToOrder(index){
            if(index == 1){
                this.$store.state.forex.saleCommodityObj = this.chooseDetailData;
                //index: 1为卖出 2为买入
                this.$router.push({
                    path:'/forex_order',
                    query:{
                        type:3,
                        name:this.chooseDetailData.commodityName
                    }
                })
            }else if(index == 2){
                //撤单
                var cancelParams = {
                    Method:'CancelLiteOrder',
                    Parameters:{
                        LiteOrderID:this.chooseDetailData.LiteOrderID
                    }
                }
                this.tradeSocket.send(JSON.stringify(cancelParams));
            }
        }

    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#position-detail{
    font-size: 14px;
    margin-bottom: 50px;
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
            background: #323442;
            width: 48%;
            color:#fff;
            font-size: 16px;
            font-weight: bold;
            height: 40px;
        }
        .trade-btn-type{
            background: #4588e6;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #position-detail{
        font-size: 14px*@ip5;
        margin-bottom: 50px*@ip5;
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
        margin-bottom: 50px*@ip6;
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
            }
        }
        .trade-btn-box{
            padding: 10px*@ip6 20px*@ip6;
            .trade-btn{
                height: 40px*@ip6;
                font-size: 16px*@ip5;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
