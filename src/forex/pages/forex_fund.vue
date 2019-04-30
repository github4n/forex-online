<template>
    <div id="fund">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
		<div id="header-box">
			<header-bar :showBack="true" :showMenu="false">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
			</header-bar>
		</div>
        <div class="fund-main" v-show="isTradeLogin&&fundData">
            <div class="fund-row fund-title">
                <ul>
                    <li class="fund-col">币种</li>
                    <li class="fund-col">今权益</li>
                    <li class="fund-col">今可用</li>
                    <li class="fund-col">保证金</li>
                    <li class="fund-col border-bold">冻结资金</li>
                    <li class="fund-col">逐笔浮盈</li>
                    <li class="fund-col border-bold">平仓盈亏</li>
                    <li class="fund-col">入金</li>
                    <li class="fund-col border-bold">出金</li>
                    <li class="fund-col">平仓线</li>
                    <!-- <li class="fund-col">风险度</li> -->
                </ul>
            </div>
            <div class="fund-content-box">
                <div class="fund-row fund-content-item" v-for="(item,index) in fundData" :key="index">
                    <div class="fund-value">
                        <span class="fund-col fund-value-item">{{item.CurrencyName}}</span>
                        <span class="fund-col fund-value-item">{{item.TodayBalance | getTwoNum}}</span>
                        <span class="fund-col fund-value-item">{{item.TodayCanUse | getTwoNum}}</span>
                        <span class="fund-col fund-value-item">{{item.Deposit}}</span>
                        <span class="fund-col fund-value-item border-bold">{{item.FrozenMoney}}</span>
                        <span class="fund-col fund-value-item" :style="{'color':item._floatProfit>=0?item._floatProfit==0?'#fff':colorUp:colorDown}">{{item._floatProfit | getTwoNum}}</span>
                        <span class="fund-col fund-value-item border-bold">{{(item.closeProfit).toFixed(2)}}</span>
                        <span class="fund-col fund-value-item">{{item.InMoney}}</span>
                        <span class="fund-col fund-value-item border-bold">{{item.OutMoney}}</span>
                        <span class="fund-col fund-value-item">{{item.lossLine}}</span>
                        <!-- <span class="fund-col fund-value-item">{{item.RiskRate | getTwoNum}}</span> -->
                    </div>
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
            headerTitle:'资金详情',
            fundData:[],
            msgTips:'',//toast消息
            closeProfit:0,//平仓盈亏
            RMBRate:7.1,//人民币汇率
        }
    },
    mounted(){
        if(!this.isTradeLogin){
            //交易登录
            this.msgTips = "请先登录交易账号";
            this.$refs.dialog.isShow = true;
        }
    },
    filters:{
        getTwoNum(value){
            return parseFloat(value).toFixed(2);
        }
    },
    activated(){
        if(!this.isTradeLogin){
            this.$router.replace({
                path:'/forex_home'
            })
        }else{
            this.initRate();
            this.getCloseProfit();
            this.changeData();
        }
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'forexFund',
            'totalProfit',
            'isTradeLogin',
            'tradeForceLine',
            'forexOrderList',
            'isAppLogin',
            'userInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    watch:{
        totalProfit:function(){
            if(this.$route.name == 'forex_fund'){
                this.changeData();
            }
        },
    },
    methods:{
        //计算平仓盈亏
        getCloseProfit(){
            var orderList = this.forexOrderList;
            var orderLength = this.forexOrderList.length;
            var closeProfit = 0;
            for(var i=0;i<orderLength;i++){
                if(orderList[i].Status == 8||orderList[i].Status == 7){
                    //已平仓
                    for(var j=0;j<orderList[i].CloseParam.length;j++){
                        closeProfit = parseFloat(closeProfit) +  parseFloat(orderList[i].CloseParam[j].CloseProfit);
                    }
                }
            }
            this.closeProfit = closeProfit;
        },
        changeData(){
            if(this.isTradeLogin){
                var forexFund = this.forexFund;
                var USDFund = [];
                for(var i=0;i<forexFund.length;i++){
                    if(forexFund[i].AccountNo == 'USD'){
                        forexFund[i]['TodayBalance'] = parseFloat(forexFund[i].TodayAmount)+parseFloat(this.totalProfit);
                        forexFund[i]['TodayCanUse'] = forexFund[i].TodayBalance - forexFund[i].FrozenMoney - forexFund[i].Deposit;
                        forexFund[i]['RiskRate'] = forexFund[i].Deposit/forexFund[i].TodayBalance;
                        forexFund[i]['_floatProfit'] = this.totalProfit;
                        forexFund[i]['lossLine'] = this.tradeForceLine;
                        forexFund[i]['closeProfit'] = this.closeProfit;
                        USDFund.push(forexFund[i]);
                    }else{
                        forexFund[i]['_floatProfit'] = 0;
                        forexFund[i]['TodayBalance'] = 0;
                        forexFund[i]['TodayCanUse'] = forexFund[i].TodayBalance - forexFund[i].FrozenMoney - forexFund[i].Deposit;
                        forexFund[i]['RiskRate'] = 0;
                        forexFund[i]['lossLine'] = 0;
                        forexFund[i]['closeProfit'] = 0;
                    }
                }
                this.fundData = USDFund;
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
#fund{
    font-size: 14px;
	padding-top: 51px;
	z-index: 1000;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .fund-main{
        display: flex;
        color:#7e829c;
        width: 100%;
        overflow: hidden;
        .fund-title{
            ul{
                margin: 0;
                padding: 0;
                li{
                    list-style: none;
                    background: #323442!important;
                    
                }
            }
        }
        .fund-row{
            .fund-col{
                width: 100px;
                height: 40px;
                border-bottom: solid 1px #17191e;
                border-right: solid 1px #17191e;
                background: #20212a;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
        .border-bold{
            border-bottom: solid 9px #17191e!important;
        }
        .fund-content-box{
            display: flex;
            overflow: auto;
            .fund-content-item{
                .fund-name{
                    display: flex;
                }
                .fund-value-item{
                    justify-content: flex-start;
                    padding-left: 10px;
                }
                .fund-value{
                    .fund-value-item{
                        color:#fff;
                    }
                    .fund-value-item:first-child{
                        color:#7e829c;
                    }
                }
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #fund{
        font-size: 14px*@ip5;
        padding-top: 51px*@ip5;
        .fund-main{
            .fund-row{
                .fund-col{
                    width: 100px*@ip5;
                    height: 40px*@ip5;
                    border-bottom: solid 1px*@ip5 #17191e;
                    border-right: solid 1px*@ip5 #17191e;
                }
            }
            .border-bold{
                border-bottom: solid 9px*@ip5 #17191e!important;
            }
            .fund-content-box{
                .fund-content-item{
                    .fund-value-item{
                        padding-left: 10px*@ip5;
                    }
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #fund{
        font-size: 14px*@ip6;
        padding-top: 51px*@ip6;
        .fund-main{
            .fund-row{
                .fund-col{
                    width: 100px*@ip6;
                    height: 40px*@ip6;
                    border-bottom: solid 1px*@ip6 #17191e;
                    border-right: solid 1px*@ip6 #17191e;
                }
            }
            .border-bold{
                border-bottom: solid 9px*@ip6 #17191e!important;
            }
            .fund-content-box{
                .fund-content-item{
                    .fund-value-item{
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
