<template>
    <div id="forex_open">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div class="open-title">
            - 选择保证金 -
        </div>
        <div class="open-price">
            <div :class="['price-item',selectPrice==index?'price-item-active':'']" @tap="choosePrice(index)" v-for="(item,index) in priceList" :key="index">
                <span class="price-value">￥{{item}}</span>
                <span class="price-item-icon">
                    <img src="../../assets/img/forex/gou-black.png"/>
                </span>
            </div>
        </div>
        <div class="open-title">
            - 操盘资金 -
        </div>
        <div class="capital">
            <div class="capital-item">
                <span class="capita-item-title">操盘保证金</span>
                <span class="capita-item-value">{{traderBond}}元</span>
                <img @tap.stop="popInfo(1)" src="../../assets/img/forex/menu/menu_14.png"/>
            </div>
            <div class="capital-item">
                <span class="capita-item-title">操盘总资金</span>
                <span class="capita-item-value">{{traderTotal}}美元</span>
                <img @tap.stop="popInfo(2)" src="../../assets/img/forex/menu/menu_14.png"/>
            </div>
            <div class="capital-item">
                <span class="capita-item-title">亏损平仓线</span>
                <span class="capita-item-value">{{lineLoss}}美元</span>
                <img @tap.stop="popInfo(3)" src="../../assets/img/forex/menu/menu_14.png"/>
            </div>
        </div>
        <div class="open-title">
            - 可交易品种 -
            <span class="cube-btn" @tap="showType">
                <img :class="isShowTradeType?'':'close-img'" src="../../assets/img/forex/dark_arrow.png" />
            </span>
        </div>
        <div class="trade-list" v-show="isShowTradeType">
            <div class="trade-list-box">
                <div class="trade-item trade-title trade-row">
                    <span class="trade-col trade-col-1">外汇产品</span>
                    <span class="trade-col trade-col-1">交易手续费</span>
                    <span class="trade-col trade-col-1-5">初始可持仓手数</span>
                    <span class="trade-col trade-col-2">交易时间段</span>
                    <span class="trade-col trade-col-2">简介</span>
                </div>
                <div class="trade-item trade-row" v-for="(item,index) in contractList" :key="index">
                    <span class="trade-col trade-col-1">
                        <span class="trade-name">{{item.name}}</span>
                        <span class="trade-code">{{item.mainContract.replace('.','')}}</span>
                    </span>
                    <span class="trade-col trade-col-1">{{item.price==0?'免费':`${item.price}元/手`}}</span>
                    <span class="trade-col trade-col-1-5">
                        <span v-show="traderBond == item2.traderBond" v-for="(item2,i) in item.shoushu" :key="i">{{item2.shoushu}}手</span>
                    </span>
                    <span class="trade-col trade-col-2">{{item.tradTime}}</span>
                    <span class="trade-col trade-col-2">{{item.dosize}}</span>
                </div>
            </div>
        </div>
        <div class="open-btn">
            <div class="btn-item" @tap="goToConfirm()">
                马上开户(￥{{traderBond}})
            </div>
            <div class="btn-item" @tap="chooseAccountOption(1)">
                已经开户,直接登录
            </div>
        </div>
        <div class="open-tip">
            <span @tap="checkAllRecord">查看全部开户记录>></span>
        </div>
        
        <div class="account-box" v-show="isShowAccount">
            <div class="hidden-bg" @tap.stop="showAccountList"></div>
            <div class="account-option">
                <choose-account :accountOption="showAccountList" :accountList="accountList"></choose-account>
            </div>
        </div>
        <popBox :isShowPop="isShowPop" :headText="popHead" :isShowOpenBtn="false">
            <span slot="content">
                <p class="pop-text pop-info-left">{{popContent}}</p>
            </span>
        </popBox>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import chooseAccount from './chooseAccount'
export default {
    components:{
        chooseAccount
    },
    data(){
        return{
            priceList:[3000,6000,10000,12000,15000,20000,50000,100000],
            selectPrice:-1, //选择的保证金
            isShowTradeType:false, //是否展开可交易品种
            isShowAccount:false, //是否显示快速登录
            isShowPop:false,//是否显示弹窗
            popHead:'',//弹窗头部
            popContent:'',//弹窗内容
            paramList:[],
            contractList:[],
            traderBond:0, //操盘保证金
            traderTotal:0, //总操盘资金
            lineLoss:0, //亏损平仓线
            msgTips:'',//toast信息
            accountList:[],//账户列表
        }
    },
    computed:{
        ...mapState('forex',[
            'isAppLogin',
            'userInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    mounted(){
        this.getForexInfo();
    },
    activated(){
        this.chooseAccountOption();
    },
    methods:{
        getForexInfo(){
			this.$http.post(this.PATH + '/ftrade/params', {emulateJSON: true}, {
				params: {
					"businessType": 100
				},
				timeout: 5000
			}).then(function(res) {
                if(res.body.code == 1){
                    var temp = res.body.data;
                    this.paramList = temp.paramList;
                    this.choosePrice(0);
                    this.getPromise(temp.paramList);
                    this.getHandNum(temp);
                }else{
                    this.msgTips = res.body.message;
                    this.$refs.dialog.isShow = true;
                }
			}.bind(this), function(e) {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //计算手数
        getHandNum(temp){
            var contractList = temp.contractList;
            var paramList = temp.paramList;
            contractList.forEach(function(o,i){
                o.shoushu = [];
                paramList.forEach(function(a){
                    var _paramList = JSON.parse(a.inMultiple);
                    var obj = {};
                    obj.traderBond = a.traderBond;
                    for(var j =0;j<_paramList.length;j++){
                        if(_paramList[j].commodityNo == o.mainContract){
                            obj.shoushu = _paramList[j].initialAmount;
                            o.name = _paramList[j].commodityName;
                            break;
                        }
                    }
                    o.shoushu.push(obj);
                }.bind(this));
            }.bind(this));
            this.contractList = contractList;
        },
        //获取保证金
        getPromise(list){
            this.priceList = [];
            var length = list.length;
            var price = [];
            for(var i = 0;i<length;i++){
                price.push(list[i].traderBond);
            };
            this.priceList = price;
        },
        //选择保证金
        choosePrice(index){
            if(this.selectPrice == index){
                this.selectPrice = -1;
            }else{
                this.selectPrice = index;
                this.traderBond = this.paramList[index].traderBond;
                this.traderTotal = this.paramList[index].traderTotal;
                this.lineLoss = this.paramList[index].lineLoss;
            }
        },
        showType(){
            this.isShowTradeType = !this.isShowTradeType;
        },
        //查看全部开户记录
        checkAllRecord(){
            this.$router.push({
                path:'historyTradeApply',
                query:{
                    recordType:2,
                }
            })
        },
        //去开户确认页面
        goToConfirm(){
            if(!this.isAppLogin){
                this.$router.push({
                    path:'/login'
                })
                return;
            }
            this.$store.state.forex.openTradeObj = this.contractList;
            this.$router.push({
                path:'/forex_payConfirm',
                query:{
                    tradeBond:this.traderBond,
                    tradeTotal:this.traderTotal,
                    lineLoss:this.lineLoss,
                }
            })
        },
        showAccountList(){
            this.isShowAccount = !this.isShowAccount;
        },
        //直接登录
        chooseAccountOption(index){
            if(this.isAppLogin){
                this.$http.post(this.PATH + '/user/ftrade/list', {emulateJSON: true}, {
                    headers: {
                        'token':  this.userInfo.token,
                        'secret': this.userInfo.secret
                    },
                    params:{
                        "businessType":100
                    },
                    timeout: 5000
                }).then(function(res) {
                    var data = res.body;
                    if(data.code == 1){
                        var tradeList = data.data.tradeList;
                        var length = tradeList.length;
                        var list = [];
                        for(var i = 0;i<length;i++){
                            if(tradeList[i].stateType == 4){
                                list.push(tradeList[i]);
                            }
                        }
                        if(list.length == 0){
                            if(index == 1){
                                this.msgTips = '暂未查询到已有交易账号';
                                this.$refs.dialog.isShow = true;
                            }
                        }else{
                            this.isShowAccount = !this.isShowAccount;
                            this.accountList = list;
                        }
                    }
                }.bind(this), function(e) {
                    this.msgTips = '连接服务器失败';
                    this.$refs.dialog.isShow = true;
                }.bind(this));
            }else{
                if(index == 1){
                    this.$router.push({
                        path:'/login'
                    })
                }
            }
        },
        //弹窗
        popInfo(index){
            switch(index){
                case 1: this.popHead = '操盘保证金';this.popContent='操盘保证金：由您选择并实际支付的人民币金额；操盘保证金在您实际用于交易的资金中，属于您自己的自有资金。';break;
                case 2: this.popHead = '操盘总资金';this.popContent='操盘总资金：=操盘保证金+我们平台配资的金额；即，您实际可用于操盘交易的总金额。';break;
                case 3: this.popHead = '亏损平仓线';this.popContent='亏损平仓线：当您的总资产（即净值）低于该平仓线值时，系统将会对您的持仓进行强制平仓。（请对账户风险度保持关注）';break;
            }
            this.isShowPop = true;
        }
    },
    
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#forex_open{
    font-size: 14px;
    width: 100%;
    overflow: hidden;
    .open-title{
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #7e829c;
        font-size: 14px;
        position: relative;
        .cube-btn{
            position: absolute;
            height: 30px;
            width: 30px;
            background: #ffd400;
            top: 0;
            right: 0;
            img{
                width: 15px;
            }
            .close-img{
                transform: rotate(180deg);
            }
        }
    }
    .open-price{
        padding: 10px 20px;
        padding-bottom: 0; 
        color: #7e829c;
        background: #20212a;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        .price-item{
            width: 22%;
            height: 40px;
            line-height: 40px;
            text-align: center;
            position: relative;
            background-color: #17191e;
            margin-bottom: 10px;
            .price-value{
                font-size: 16px;
            }
            .price-item-icon{    
                position: absolute;
                bottom: -10px;
                right: -10px;
                display: inline-block;
                border: solid 10px rgba(0, 0, 0, 0);
                border-top-color: #7e829c;
                transform: rotate(-45deg);
                width: 0;
                height: 0;
                img{
                    width: 15px;
                    position: absolute;
                    bottom: -1px;
                    right: -7px;
                    transform: rotate(45deg);
                }
            }
        }
        .price-item-active{
            color:#ffd400;
            .price-item-icon{
                border-top-color: #ffd400;
            }
        }
    }
    .capital{
        .capital-item{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            display: flex;
            align-items: center;
            background: #20212a;
            span{
                margin-right: 10px;
            }
            .capita-item-title{
                color:#7e829c;
            }
            .capita-item-value{
                color:#fff;
            }
            img{
                width: 15px;
            }
        }
    }
    .trade-list{
        color:#fff;
        width: 100%;
        overflow: auto;
        border-bottom: solid 1px #17191e;
        .trade-list-box{
            width: 700px;
            .trade-row{
                display: flex;
                min-height: 50px;
                .trade-col{
                    width: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    span{
                        text-align: center;
                    }
                    .trade-code{
                        color:#7e829c;
                    }
                }
                .trade-col-1{
                    flex: 1;
                }
                .trade-col-1-5{
                    flex:1.5
                }
                .trade-col-2{
                    flex: 2;
                }
            }
            .trade-title{
                color:#7e829c!important;
                min-height: 40px;
            }
            .trade-row:nth-child(odd){
                background: #20212a;
            }
            .trade-row:nth-child(even){
                background: #323442;
            }
        }
    }
    .open-btn{
        padding: 20px;
        background: #20212a;
        border-bottom: solid 1px #17191e;
        .btn-item{
            width: 100%;
            height: 50px;
            line-height: 50px;
            background: #ffd400;
            color:#17191e;
            font-size: 18px;
            text-align: center;
        }
        .btn-item:first-child{
            margin-bottom: 10px;
        }
    }
    .open-tip{
        background: #20212a;
        text-align: right;
        padding: 15px 20px;
        color:#7e829c;
    }
    .account-box{
        .hidden-bg{
            position: fixed;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,.8);
            top: 0;
            left: 0;
            z-index: 10;
        }
        .account-option{
            position: fixed;
            width: 80%;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 11;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #forex_open{
        font-size: 14px*@ip5;
        .open-title{
            height: 30px*@ip5;
            line-height: 30px*@ip5;
            font-size: 14px*@ip5;
            .cube-btn{
                height: 30px*@ip5;
                width: 30px*@ip5;
                img{
                    width: 15px*@ip5;
                }
            }
        }
        .open-price{
            padding: 10px*@ip5 20px*@ip5;
            .price-item{
                height: 40px*@ip5;
                line-height: 40px*@ip5;
                margin-bottom: 10px*@ip5;
                .price-value{
                    font-size: 16px*@ip5;
                }
                .price-item-icon{
                    bottom: -10px*@ip5;
                    right: -10px*@ip5;
                    border-width: 10px*@ip5;
                    img{
                        width: 15px*@ip5;
                        bottom: -1px*@ip5;
                        right: -7px*@ip5;
                    }
                }
            }
        }
        .capital{
            .capital-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                span{
                    margin-right: 10px*@ip5;
                }
                img{
                    width: 15px*@ip5;
                }
            }
        }
        .trade-list{
            border-bottom: solid 1px*@ip5 #17191e;
            .trade-list-box{
                width: 700px*@ip5;
                .trade-row{
                    min-height: 50px*@ip5;
                    .trade-col{
                        width: 100px*@ip5;
                    }
                }
                .trade-title{
                    min-height: 40px*@ip5;
                }
            }
        }
        .open-btn{
            padding: 20px*@ip5;
            .btn-item{
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                font-size: 18px*@ip5;
            }
            .btn-item:first-child{
                margin-bottom: 10px*@ip5;
            }
        }
        .open-tip{
            padding: 15px*@ip5 20px*@ip5;
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #forex_open{
        font-size: 14px*@ip6;
        .open-title{
            height: 30px*@ip6;
            line-height: 30px*@ip6;
            font-size: 14px*@ip6;
            .cube-btn{
                height: 30px*@ip6;
                width: 30px*@ip6;
                img{
                    width: 15px*@ip6;
                }
            }
        }
        .open-price{
            padding: 10px*@ip6 20px*@ip6;
            .price-item{
                height: 40px*@ip6;
                line-height: 40px*@ip6;
                margin-bottom: 10px*@ip6;
                .price-value{
                    font-size: 16px*@ip6;
                }
                .price-item-icon{
                    bottom: -10px*@ip6;
                    right: -10px*@ip6;
                    border-width: 10px*@ip6;
                    img{
                        width: 15px*@ip6;
                        bottom: -1px*@ip6;
                        right: -7px*@ip6;
                    }
                }
            }
        }
        .capital{
            .capital-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                span{
                    margin-right: 10px*@ip6;
                }
                img{
                    width: 15px*@ip6;
                }
            }
        }
        .trade-list{
            border-bottom: solid 1px*@ip6 #17191e;
            .trade-list-box{
                width: 700px*@ip6;
                .trade-row{
                    min-height: 50px*@ip6;
                    .trade-col{
                        width: 100px*@ip6;
                    }
                }
                .trade-title{
                    min-height: 40px*@ip6;
                }
            }
        }
        .open-btn{
            padding: 20px*@ip6;
            .btn-item{
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                font-size: 18px*@ip6;
            }
            .btn-item:first-child{
                margin-bottom: 10px*@ip6;
            }
        }
        .open-tip{
            padding: 15px*@ip6 20px*@ip6;
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
