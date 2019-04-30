<template>
    <div id="position-detail">
        <div id="header-box">
            <header-bar :showBack="true" :showMenu="false">
                <span slot="title" class="header-title">
                    {{chooseDetailData.name}}
                </span>
            </header-bar>
        </div>
        <div class="title-info">
            <div class="title-item">
                <span class="title-name">编号:</span>
                <span class="title-value">{{chooseDetailData.LiteOrderID}}</span>
            </div>
            <div class="title-item-a">
                <span class="title-info-left">
                    <span class="title-name">开仓价:</span>
                    <span class="title-value">{{chooseDetailData.OpenPrice}}</span>
                </span>
                <span class="title-info-right">
                    <span class="title-name">盈亏:</span>
                    <span class="title-value" :style="{'color':chooseDetailData.Direction==0?(lastData[13]>chooseDetailData.OpenPrice?colorUp:colorDown):(lastData[11]<chooseDetailData.OpenPrice?colorUp:colorDown)}" v-if="chooseDetailData.Status==4||chooseDetailData.Status==7">${{chooseDetailData.Direction==0?((lastData[13]-chooseDetailData.OpenPrice)*chooseDetailData.totalPrice*USDRate).toFixed(2):((chooseDetailData.OpenPrice-lastData[11])*chooseDetailData.totalPrice*USDRate).toFixed(2)}}</span>
                    <span class="title-value" v-if="chooseDetailData.Status==8">${{chooseDetailData.closeProfit}}</span>
                </span>
            </div>
        </div>
        <div class="order-info">
            <div class="order-info-item">
                <div class="order-top">
                    <span class="order-time">{{chooseDetailData.OpenDateTime}}</span>
                    <span class="order-msg">{{chooseDetailData.OpenRemark}}</span>
                </div>
                <div class="order-bottom">
                    <span class="order-info">
                        开仓 {{chooseDetailData.Direction==0?'买入':'卖出'}} {{unit}}{{(chooseDetailData.totalPrice).toFixed(0)}}
                    </span>
                    <!-- <span class="order-reason">
                        {{chooseDetailData.PriceType==1?'市价':'限价'}}开仓
                    </span> -->
                </div>
            </div>
            <div class="order-info-item" v-if="chooseDetailData.CloseParam&&chooseDetailData.CloseParam.length>0" v-for="(item,index) in chooseDetailData.CloseParam" :key="index">
                <div class="order-top">
                    <span class="order-time">{{item.CloseDateTime}}</span>
                    <span class="order-msg">{{item.CloseRemark}}</span>
                </div>
                <div class="order-bottom">
                    <span class="order-info">
                        平仓 {{item.ClosePrice}} {{unit}}{{(item.CloseNum*chooseDetailData.contractNo).toFixed(0)}}
                    </span>
                    <span class="order-reason">
                        平仓盈亏:<span :style="{'color':item.CloseProfit>0?colorUp:colorDown}">${{(item.CloseProfit).toFixed(2)}}</span>
                    </span>
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
        headerBar,
    },
    data(){
        return{
            headerTitle:'美元/日元',
            unit:'',
            USDRate:1,//美元汇率
            RMBRate:7.1,//人民币汇率
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
            'isTradeLogin',
            'forexCommodity',
            'isAppLogin',
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
            this.initRate();
            this.initUnit();
            this.getBaseInfo();
        }
    },
    methods:{
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
        getBaseInfo(){
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
#position-detail{
    font-size: 14px;
    margin-bottom: 50px;
    padding-top: 51px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .title-info{
        background: #20212a;
        .title-item{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
        }
        .title-item-a{
            padding: 10px 20px;
            border-bottom: solid 10px #17191e;
            box-sizing: content-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .title-name{
            color:#7e829c;
        }
        .title-value{
            color:#fff;
        }
    }
    .order-info{
        background: #20212a;
        .order-info-item{
            padding: 10px 20px;
            color:#fff;
            border-bottom: solid 1px #17191e;
            .order-top{
                display: flex;
                justify-content: space-between;
                .order-time{
                    font-size: 13px;
                    color:#7e829c;
                }
                .order-msg{

                }
            }
            .order-bottom{
                display: flex;
                justify-content: space-between;
                .order-info{

                }
                .order-reason{

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
            height: 30px;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #position-detail{
        font-size: 14px*@ip5;
        margin-bottom: 50px*@ip5;
        padding-top: 51px*@ip5;
        .title-info{
            .title-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom-width: 1px*@ip5;
            }
            .title-item-a{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom-width: 10px*@ip5;
            }
        }
        .order-info{
            .order-info-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom-width: 1px*@ip5;
                .order-top{
                    .order-time{
                        font-size: 13px*@ip5;
                    }
                }
            }
        }
        .trade-btn-box{
            padding: 10px*@ip5 20px*@ip5;
            .trade-btn{
                height: 30px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #position-detail{
        font-size: 14px*@ip6;
        margin-bottom: 50px*@ip6;
        padding-top: 51px*@ip6;
        .title-info{
            .title-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom-width: 1px*@ip6;
            }
            .title-item-a{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom-width: 10px*@ip6;
            }
        }
        .order-info{
            .order-info-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom-width: 1px*@ip6;
                .order-top{
                    .order-time{
                        font-size: 13px*@ip6;
                    }
                }
            }
        }
        .trade-btn-box{
            padding: 10px*@ip6 20px*@ip6;
            .trade-btn{
                height: 30px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
