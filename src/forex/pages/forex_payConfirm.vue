<template>
    <div id="pay_confirm">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <loading v-show="isLoad"></loading>
        <div id="header-box">
            <header-bar :showBack="true" :showMenu="false">
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
				<span slot="otherIcon" @tap="customerOption">
					<img src="../../assets/img/forex/customer.png" />
				</span>
            </header-bar>
        </div>
        <div class="customer-box" v-show="isShowCustomer">
            <div class="hidden-bg" @tap.stop="customerOption"></div>
            <div class="customer-option">
                <customer></customer>
            </div>
        </div>
        <div class="open-title">
            - 可交易品种 -
            <span class="cube-btn" @tap="showType">
                <img :class="isShowTradeType?'':'close-img'" src="../../assets/img/forex/dark_arrow.png" />
            </span>
        </div>
        <div class="trade-type" v-show="isShowTradeType">
            <div :class="['trade-type-item',item.sign?'trade-item-black':'trade-item-white']" v-for="(item,index) in contractList" :key="index">
                <span class="type-item-title">{{item.name}}{{item.mainContract.replace('.','')}}</span>
                <span class="type-item-num" v-show="item2.traderBond == tradeBone" v-for="(item2,i) in item.shoushu" :key="i">{{item2.shoushu}}手</span>
            </div>
        </div>
        <div class="trade-time">
            <span>交易时间:09：00-23：55，不同期货不同交易时间段</span>
        </div>
        <div class="trade-info">
            <div class="trade-info-item">
                <span class="trade-info-title">账户管理费</span>
                <span class="trade-info-value">免费</span>
            </div>
            <div class="trade-info-item">
                <span class="trade-info-title">操盘保证金</span>
                <span class="trade-info-value">{{tradeBone}}元</span>
            </div>
            <div class="trade-info-item">
                <span class="trade-info-title">操盘总资金</span>
                <span class="trade-info-value">{{tradeTotal}}美元</span>
            </div>
            <div class="trade-info-item border-bold">
                <span class="trade-info-title">亏损平仓线</span>
                <span class="trade-info-value">{{lineLoss}}</span>
            </div>
        </div>
        <div class="account-price">
            <div class="account-price-item">
                <span class="left-title">账户余额</span>
                <span class="left-value" v-show="isAppLogin">{{balance}}</span>
                <span class="left-value" v-show="!isAppLogin">暂未登录平台账号</span>
            </div>
            <div class="account-price-item" @tap="goToRecharge">
                <span class="right-title">去充值</span>
                <img src="../../assets/img/forex/arrow.png" />
            </div>
        </div>
        <div class="submit-btn-box">
            <div class="submit-btn" @tap="goToOpenSuccess">
                确认支付(￥{{tradeBone}})
            </div>
        </div>
        <div class="submit-argee">
            <div class="submit-argee-item">
                提交申请表示阅读并同意<span @tap="goToAgree">《外汇交易合作协议》</span>
            </div>
            <div class="submit-argee-item">
                客服热线：400-852-8008
            </div>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
import customer from '../components/customer';
export default {
    components:{
        headerBar,
        customer,
    },
    data(){
        return{
            headerTitle:'确认开户',
            isShowCustomer:false, //是否显示客服
            isShowTradeType: false, //是否展开交易类型
            tradeBone:0,
            tradeTotal:0,
            lineLoss:0,
            balance:0,
            msgTips:'',//toast信息
            contractList:[],//可交易品种
            isLoad:false,//数据加载
        }
    },
    computed:{
        ...mapState('forex',[
            'openTradeObj',
            'isAppLogin',
            'userInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        this.tradeBone = this.$route.query.tradeBond;
        this.tradeTotal = this.$route.query.tradeTotal;
        this.lineLoss = this.$route.query.lineLoss;
        this.handleContractData();
        this.getBalance();
    },
    methods:{
        //处理可交易品种数据
        handleContractData(){
            var length = this.openTradeObj.length;
            var contractList = this.openTradeObj;
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
            this.contractList = contractList;
        },
        //是否显示客服
        customerOption(){
            this.isShowCustomer = !this.isShowCustomer;
        },
        //是否展示可交易品种
        showType(){
            this.isShowTradeType = !this.isShowTradeType;
        },
        //查看协议
        goToAgree(){
            this.$router.push({
                path:'/agreement',
                query:{
                    type:'外汇'
                }
            })
        },
        //去充值
        goToRecharge(){
            this.$router.push({
                path:'/recharge'
            })
        },
        //获取余额
        getBalance(){
			this.$http.post(this.PATH + '/user/getbalancerate', {emulateJSON: true}, {
                headers: {
                    'token':  this.userInfo.token,
                    'secret': this.userInfo.secret
                },
				params: {
					"businessType": 4
				},
				timeout: 5000
			}).then(function(res) {
                if(res.body.code == 1){
                    this.balance = res.body.data.balance;
                }else{
                    this.msgTips = res.body.message;
                    this.$refs.dialog.isShow = true;
                }
			}.bind(this), function(e) {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //提交开户申请
        goToOpenSuccess(){
            if(!this.isAppLogin){
                this.msgTips = '暂未登录平台账号，无法开户';
                this.$refs.dialog.isShow = true;
                return;
            }
            if(parseFloat(this.tradeBone)>parseFloat(this.balance)){
                this.msgTips = '余额不足，请先充值';
                this.$refs.dialog.isShow = true;
                return;
            }
            this.isLoad = true;
			this.$http.post(this.PATH + '/user/ftrade/handle', {emulateJSON: true}, {
                headers: {
                    'token':  this.userInfo.token,
                    'secret': this.userInfo.secret
                },
				params: {
                    "vid":'',
                    "traderBond":this.tradeBone,
                    'tranLever':0,
                    "businessType": 100,
				},
				timeout: 5000
			}).then(function(res) {
				var data = res.body;
                this.isLoad = false;
                if(data.code == 1){
                    this.$store.state.forex.openSuccessObj = {
                        'vid': data.data.id,
                        'businessType': data.data.businessType,
                        'isPay': data.data.stateType,
                        'username': data.data.tranAccount,
                        'password': data.data.tranPassword,
                    }
                    var isAutoSuccess = false;
                    if(data.data.stateType == 4){
                        isAutoSuccess = true;
                    }
                    this.$router.replace({
                        path: '/forex_openSuccess',
                        query:{
                            isAutoSuccess:isAutoSuccess
                        }
                    });
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
			}.bind(this), function(e) {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#pay_confirm{
    font-size: 14px;
    padding-top: 51px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .customer-box{
        .hidden-bg{
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,.8);
            top: 0;
            left: 0;
            z-index: 10;
        }
        .customer-option{
            position: absolute;
            width: 90%;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 11;
        }
    }
    .open-title{
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #7e829c;
        font-size: 12px;
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
    .trade-type{
        display: flex;
        flex-wrap:wrap;
        .trade-type-item{
            width: 50%;
            padding: 5px 20px;
            display: flex;
            justify-content: space-between;
            border-bottom: solid 1px #17191e;
            .type-item-title{
                color:#7e829c;
            }
            .type-item-num{
                color:#fff;
            }
        }
        .trade-type-item:nth-child(odd){
            border-right: solid 1px #17191e;
        }
        .trade-item-white{
            background: #323442;
        }
        .trade-item-black{
            background: #20212a;
        }
    }
    .trade-time{
        padding-left: 20px;
        height: 30px;
        line-height: 30px;
        color: #555769;
        font-size: 12px;
    }
    .trade-info{
        background: #20212a;
        .trade-info-item{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            .trade-info-title{
                color:#7e829c;
                width: 90px;
                display: inline-block;
            }
            .trade-info-value{
                color:#fff;
            }
        }
        .border-bold{
            box-sizing: content-box;
            border-bottom-width: 10px;
        }
    }
    .account-price{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background: #20212a;
        .account-price-item{
            display: flex;
            align-items: center;
            .left-title{
                color:#7e829c;
                width: 90px;
                display: inline-block;
            }
            .left-value{
                color:#ffd400;
                font-size: 16px;
            }
            .right-title{
                color: #fff;
                font-size: 13px;
                margin-right: 10px;
            }
            img{
                width: 10px;
            }
        }
    }
    .submit-btn-box{
        padding: 30px 20px;
        padding-bottom: 15px;
        .submit-btn{
            background: #ffd400;
            color:#17191e;
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 18px;
        }
    }
    .submit-argee{
        text-align: center;
        color:#555769;
        .submit-argee-item{
            span{
                color:#ffd400;
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #pay_confirm{
        font-size: 14px*@ip5;
        padding-top: 51px*@ip5;
        .open-title{
            height: 30px*@ip5;
            line-height: 30px*@ip5;
            font-size: 12px*@ip5;
            .cube-btn{
                height: 30px*@ip5;
                width: 30px*@ip5;
                img{
                    width: 15px*@ip5;
                }
            }
        }
        .trade-type{
            .trade-type-item{
                padding: 5px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .trade-type-item:nth-child(odd){
                border-right: solid 1px*@ip5 #17191e;
            }
        }
        .trade-time{
            padding-left: 20px*@ip5;
            height: 30px*@ip5;
            line-height: 30px*@ip5;
            font-size: 12px*@ip5;
        }
        .trade-info{
            .trade-info-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                .trade-info-title{
                    width: 90px*@ip5;
                }
            }
            .border-bold{
                border-bottom-width: 10px*@ip5;
            }
        }
        .account-price{
            padding: 10px*@ip5 20px*@ip5;
            .account-price-item{
                .left-title{
                    width: 90px*@ip5;
                }
                .left-value{
                    font-size: 16px*@ip5;
                }
                .right-title{
                    font-size: 13px*@ip5;
                    margin-right: 10px*@ip5;
                }
                img{
                    width: 10px*@ip5;
                }
            }
        }
        .submit-btn-box{
            padding: 30px*@ip5 20px*@ip5;
            padding-bottom: 15px*@ip5;
            .submit-btn{
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                font-size: 18px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #pay_confirm{
        font-size: 14px*@ip6;
        padding-top: 51px*@ip6;
        .open-title{
            height: 30px*@ip6;
            line-height: 30px*@ip6;
            font-size: 12px*@ip6;
            .cube-btn{
                height: 30px*@ip6;
                width: 30px*@ip6;
                img{
                    width: 15px*@ip6;
                }
            }
        }
        .trade-type{
            .trade-type-item{
                padding: 5px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .trade-type-item:nth-child(odd){
                border-right: solid 1px*@ip6 #17191e;
            }
        }
        .trade-time{
            padding-left: 20px*@ip6;
            height: 30px*@ip6;
            line-height: 30px*@ip6;
            font-size: 12px*@ip6;
        }
        .trade-info{
            .trade-info-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                .trade-info-title{
                    width: 90px*@ip6;
                }
            }
            .border-bold{
                border-bottom-width: 10px*@ip6;
            }
        }
        .account-price{
            padding: 10px*@ip6 20px*@ip6;
            .account-price-item{
                .left-title{
                    width: 90px*@ip6;
                }
                .left-value{
                    font-size: 16px*@ip6;
                }
                .right-title{
                    font-size: 13px*@ip6;
                    margin-right: 10px*@ip6;
                }
                img{
                    width: 10px*@ip6;
                }
            }
        }
        .submit-btn-box{
            padding: 30px*@ip6 20px*@ip6;
            padding-bottom: 15px*@ip6;
            .submit-btn{
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                font-size: 18px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
