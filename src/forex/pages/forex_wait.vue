<template>
    <div id="waitOrder" class="mui-off-canvas-wrap mui-draggable">
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
                    <div class="waitOrder-list">
                        <div class="waitOrder-item" @tap="goToDetail(item)" v-for="(item,index) in waitOrderList" :key="index">
                            <div class="waitOrder-item-top">
                                <div class="waitOrder-left">
                                    <span class="waitOrder-left-1">{{item.commodityName}}</span>
                                </div>
                                <div class="waitOrder-right">
                                    <span class="waitOrder-right-1" @tap.stop="goToChange(1,item)">改单</span>
                                    <span class="waitOrder-right-1" @tap.stop="goToChange(2,item)">取消</span>
                                </div>
                            </div>
                            <div class="waitOrder-item-bottom">
                                <span class="waitOrder-value">
                                    <span class="waitOrder-value-1">{{item.Direction == 0?'买入':'卖出'}}</span>
                                    <span class="waitOrder-value-2">{{item.tradePrice}}</span>
                                    <span class="waitOrder-value-2">{{item.LimitPrice}}</span>
                                    <!-- <span class="position-value-1" :style="(item.Direction == 0?item.OpenPrice<item.lastRate:item.OpenPrice>item.lastRate)?{'color':colorUp}:{'color':colorDown}"><span v-show="!isAppLogin">$</span><span v-show="isAppLogin">￥</span>{{(item.profit).toFixed(2)}}</span> -->
                                </span>
                                <img class="" src="../../assets/img/forex/arrow.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="no-order-data" v-show="waitOrderList.length == 0">
                <div class="text-tip">您当前无任何挂单</div>
                <div class="order-btn" @tap="goToTrade">立即交易</div>
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
            headerTitle:'挂单',
            waitOrderList:[],
            msgTips:'',//toast消息
            RMBRate:1,//人民币汇率
				
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
        mui('#waitOrder')[0].classList.add('mui-slide-in');
		mui('.mui-scroll-wrapper').scroll();
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
            'tradeSocket',
            'tipsMessage'

        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    watch:{
        forexCommodity:function(){
            if(this.$route.name=="forex_wait"&&this.isTradeLogin){
                this.initData();
            }
        },
        tipsMessage:function(){
            if(this.$route.name=='forex_wait'){
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
    },
    activated(){
        if(this.isTradeLogin&&this.isAppLogin){
            this.getRMBRateData();
        }else if(this.isTradeLogin&&!this.isAppLogin){
            this.initData();
            this.msgTips = "请登录平台查看美元兑人民币汇率";
            this.$refs.dialog.isShow = true;
        }else if(!this.isTradeLogin){
            this.$router.replace({
                path:'/forex_home'
            })
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
        //获取持仓数据
        initData(){
            var commodityList = this.forexCommodity;
            var commodityLength = this.forexCommodity.length;
            var positionList = [];
            for(var i=0;i<commodityLength;i++){
                if(commodityList[i].positionList.length > 0){
                    var positionLength = commodityList[i].positionList.length;
                    for(var j=0;j<positionLength;j++){
                        if(commodityList[i].positionList[j].Status == 2){
                            //部分平仓和已开仓
                            commodityList[i].positionList[j]['commodityList'] = commodityList[i];
                            commodityList[i].positionList[j]['commodityName'] = commodityList[i].commodity_name;
                            commodityList[i].positionList[j]['tradePrice'] = parseFloat(commodityList[i].positionList[j].Num * commodityList[i].contract_size/commodityList[i].mini_ticker_size).toFixed(2);
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
                                commodityList[i].positionList[j]['USDRate'] = 1/commodityList[i].positionList[j]['lastRate'];
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
                                case 0:commodityList[i].positionList[j]['profit'] = (commodityList[i].positionList[j].lastRate-commodityList[i].positionList[j].OpenPrice)*commodityList[i].positionList[j].tradePrice*commodityList[i].positionList[j].USDRate*this.RMBRate;break; //买
                                case 1:commodityList[i].positionList[j]['profit'] = (commodityList[i].positionList[j].OpenPrice-commodityList[i].positionList[j].lastRate)*commodityList[i].positionList[j].tradePrice*commodityList[i].positionList[j].USDRate*this.RMBRate;break; //卖
                            }
                            positionList.push(commodityList[i].positionList[j]);
                        }
                    }
                }
            };
            this.waitOrderList = positionList;
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
                path:'/forex_waitDetail'
            })
        },
        //跳转交易
        goToTrade(){
            this.$router.replace({
                path:'/forex_home'
            })
        },
        //跳转改单或者取消
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
                //取消
                var cancelParams = {
                    Method:'CancelLiteOrder',
                    Parameters:{
                        LiteOrderID:item.LiteOrderID
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
#waitOrder{
    padding-top: 51px;
    height: 100%;
    overflow: hidden;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .waitOrder-totle{
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
    .waitOrder-list{
        font-size: 14px;
        overflow: auto;
        .waitOrder-item{
            border-bottom: solid 9px #17191e;
            .waitOrder-item-top{
                position: relative;
                display: flex;
                justify-content: space-between;
                border-bottom: solid 1px #17191e;
                padding: 10px 20px;
                background: #20212a;
                .waitOrder-left{
                    .status{
                        border: solid 5px rgba(0,0,0,0);
                        display: inline-block;
                        border-bottom-width: 8px;
                        transform-origin: 50% 75%;
                    }
                    .waitOrder-left-1{
                        color:#70738b;
                    }
                }
                .waitOrder-right{
                    display: flex;
                    align-items: center;
                    .waitOrder-right-1{
                        text-align: center;
                        color: #7e829c;
                        margin-left: 20px;
                        display: inline-block;
                        width: 50px;
                        background: #323442;
                    }
                    .waitOrder-right-2{
                        width: 20px;
                    }
                }
            }
            .waitOrder-item-bottom{
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: solid 1px #17191e;
                padding: 10px 20px;
                background: #20212a;
                .waitOrder-value{
                    .waitOrder-value-1{
                        color:#7e829c;
                    }
                    .waitOrder-value-2{
                        color:#fff;
                    }
                }
                img{
                    width: 10px;
                }
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
    #waitOrder{
        padding-top: 51px*@ip5;
        .waitOrder-totle{
            padding: 5px*@ip5 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
            font-size: 14px*@ip5;
            height: 30px*@ip5;
        }
        .waitOrder-list{
            font-size: 14px*@ip5;
            .waitOrder-item{
                border-bottom: solid 9px*@ip5 #17191e;
                .waitOrder-item-top{
                    border-bottom: solid 1px*@ip5 #17191e;
                    padding: 10px*@ip5 20px*@ip5;
                    .waitOrder-left{
                        .status{
                            border: solid 5px*@ip5 rgba(0,0,0,0);
                            border-bottom-width: 8px*@ip5;
                        }
                    }
                    .waitOrder-right{
                        .waitOrder-right-1{
                            margin-left: 20px*@ip5;
                            width: 50px*@ip5;
                        }
                        .waitOrder-right-2{
                            width: 20px*@ip5;
                        }
                    }
                }
                .waitOrder-item-bottom{
                    border-bottom: solid 1px*@ip5 #17191e;
                    padding: 10px*@ip5 20px*@ip5;
                    img{
                        width: 10px*@ip5;
                    }
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
    #waitOrder{
        padding-top: 51px*@ip6;
        .waitOrder-totle{
            padding: 5px*@ip6 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
            font-size: 14px*@ip6;
            height: 30px*@ip6;
        }
        .waitOrder-list{
            font-size: 14px*@ip6;
            .waitOrder-item{
                border-bottom: solid 9px*@ip6 #17191e;
                .waitOrder-item-top{
                    border-bottom: solid 1px*@ip6 #17191e;
                    padding: 10px*@ip6 20px*@ip6;
                    .waitOrder-left{
                        .status{
                            border: solid 5px*@ip6 rgba(0,0,0,0);
                            border-bottom-width: 8px*@ip6;
                        }
                    }
                    .waitOrder-right{
                        .waitOrder-right-1{
                            margin-left: 20px*@ip6;
                            width: 50px*@ip6;
                        }
                        .waitOrder-right-2{
                            width: 20px*@ip6;
                        }
                    }
                }
                .waitOrder-item-bottom{
                    border-bottom: solid 1px*@ip6 #17191e;
                    padding: 10px*@ip6 20px*@ip6;
                    img{
                        width: 10px*@ip6;
                    }
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
