<template>
    <div id="forex_log">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
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
        <div class="login-box">
            <div class="login-item">
                <span class="login-title">交易账号</span>
                <input class="login-input" type="text" v-model="tradeNumber"/>
                <img src="../../assets/img/forex/white_arrow.png" @tap="showAccount"/>
            </div>
            <div class="login-item">
                <span class="login-title">交易密码</span>
                <input class="login-input" :type="isShowPassword?'text':'password'"  v-model="tradePassword"/>
                <img v-show="isShowPassword" @tap="changePassword" src="../../assets/img/forex/eye_open.png"/>
                <img v-show="!isShowPassword" @tap="changePassword" src="../../assets/img/forex/eye_close.png"/>
            </div>
            <div class="trade-login" style="margin-top:30px" @tap="loginTrade">
                交易登录
            </div>
            <div class="trade-login" @tap="goToOpen">
                开户申请
            </div>
            <div class="trade-argee">
                点击登录表示同意<span @tap="goToAgree">《外汇交易合作协议》</span>
            </div>
        </div>
        <div class="border-bold"></div>
        <div class="login-tips">
            <div class="tips-content">
                操盘交易账号不等于注册登录账号
            </div>
            <div class="tips-content">
                交易账号:申请方案后系统自动发放，用于实盘交易的账号。可查询交易明细，结算后将会更换。
            </div>
            <div class="tips-content">
                登录账号:使用手机注册后的平台账号，用于登录APP和网站，进行充值、提现、查看资金明细等。
            </div>
        </div>
        <div class="switch-box" v-show="isShowAccount">
            <div class="hidden-bg" @tap="maskClick"></div>
            <div class="account-list">
                <div class="account-item" v-for="(item,index) in accountList" :key="index" @tap="chooseNum(item)">
                    <span class="item-num">ID{{item.tranAccount}}</span>
                    <span class="item-price">￥{{item.traderBond}}</span>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import {mapState,mapActions} from 'vuex';
import headerBar from '../components/header';
import customer from '../components/customer';
import { setTimeout } from 'timers';
export default {
    components:{
        headerBar,
        customer,
    },
    data(){
        return{
            headerTitle:'交易登录',
            isShowCustomer:false,
            isShowPassword:false,
            isShowAccount:false, //是否显示切换账号
            tradeNumber:'',
            tradePassword:'',
            accountList:[],//账号数据
            msgTips:'',//toast内容
        }
    },
    computed:{
        ...mapState('forex',[
            'tradeLoginObj',
            'isTradeLogin',
            'tradeConfig',
            'tradeSocket',
            'userInfo',
            'isAppLogin',
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        if(this.tradeLoginObj.number){
            this.tradeNumber = this.tradeLoginObj.number;
            this.tradePassword = this.tradeLoginObj.password;
            this.$store.state.forex.tradeLoginObj = null;
        }else{
            this.switchAccount();
        }
    },
    watch:{
        isTradeLogin:function(){
            if(this.isTradeLogin){
                this.msgTips = '登录成功';
                this.$refs.dialog.isShow = true;
                var obj = {
                    tradeNumber:this.tradeNumber,
                    tradePassword:this.tradePassword,
                }
                localStorage.setItem('forexTradeUser',JSON.stringify(obj));
                var _this = this;
                setTimeout(function(){
                    _this.$router.replace({
                        path:'/forex_home',
                    });
                },1000);
            }
        }
    },
    methods:{
        ...mapActions('forex',[
            'initTradeWs',
        ]),
        maskClick(){
            this.isShowAccount = false;
        },
        showAccount(){
            if(this.accountList.length == 0){
                this.msgTips = '暂无可操盘外汇交易账号';
                this.$refs.dialog.isShow = true;
            }else{
                this.isShowAccount = true;
            }
        },
        //显示隐藏客服选项 
        customerOption(){
            this.isShowCustomer = !this.isShowCustomer;
        },
        //显示隐藏密码
        changePassword(){
            this.isShowPassword = !this.isShowPassword;
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
        //选择账号
        chooseNum(item){
            this.tradeNumber = item.tranAccount;
            this.tradePassword = item.tranPassword;
            this.isShowAccount = !this.isShowAccount;
        },
        //切换账号
        switchAccount(){
            if(this.isAppLogin){
                this.$http.post(this.PATH + '/user/ftrade/list', {emulateJSON: true}, {
                    headers: {
                        'token':  this.userInfo.token,
                        'secret': this.userInfo.secret
                    },
                    params:{
                        "businessType":100
                    },
                    timeout: 5000,
                }).then(function(res){
                    var data = res.body;
                    if(data.code == 1){
                        var tradeList = data.data.tradeList;
                        var length = tradeList.length;
                        var list = [];
                        if(length>0){
                            for(var i = 0;i<length;i++){
                                if(tradeList[i].stateType == 4){
                                    list.push(tradeList[i]);
                                }
                            }
                            if(list.length>0){
                                this.accountList = list;
                                this.tradeNumber = this.accountList[0].tranAccount;
                                this.tradePassword = this.accountList[0].tranPassword;
                            }else{
                                this.msgTips = '暂无可操盘外汇交易账号';
                                this.$refs.dialog.isShow = true;
                                this.tradeNumber = '';
                                this.tradePassword = '';
                            }
                        }
                    }
                }.bind(this), function(e) {
                    this.msgTips = '连接服务器失败';
                    this.$refs.dialog.isShow = true;
                }.bind(this));
            }else{
                this.msgTips = '未登录平台账号,无法获取其他交易账号';
                this.$refs.dialog.isShow = true;
            }
        },
        //跳转开户页面
        goToOpen(){
            this.$router.push({
                path:'/tradeapply',
                query:{
                    type:1
                }
            })
        },
        loginTrade(){
            if(this.tradeConfig.url_address){
                if(!this.tradeNumber){
                    this.msgTips = '请输入交易账号';
                    this.$refs.dialog.isShow = true;
                    return;
                }else if(!this.tradePassword){
                    this.msgTips = '请输入交易密码';
                    this.$refs.dialog.isShow = true;
                    return;
                }
                if(this.tradeSocket){
                    if(this.tradeNumber == this.tradeConfig.ClientNo&&this.isTradeLogin){
                        this.$router.replace('/forex_home');
                    }else if(this.tradeNumber != this.tradeConfig.ClientNo&&!this.isTradeLogin){
                        this.$store.state.forex.tradeConfig.ClientNo = this.tradeNumber;
                        this.$store.state.forex.tradeConfig.PassWord = Base64.encode(this.tradePassword);
                        this.$store.state.forex.forexFund = [];
                        this.$store.state.forex.forexOrderList = [];
                        var loginParam = {
                            Method:'Login',
                            Parameters:{
                                ClientNo:this.tradeConfig.ClientNo,
                                PassWord:this.tradeConfig.PassWord,
                                IsMock:this.tradeConfig.IsMock,
                                Version:this.tradeConfig.Version,
                                Source:this.tradeConfig.Source
                            }
                        }
                        this.tradeSocket.send(JSON.stringify(loginParam));
                    }else if(this.tradeNumber != this.tradeConfig.ClientNo&&this.isTradeLogin){
                        var loginOutParam = {
                            Method:'Logout',
                            Parameters:{
                                ClientNo: this.tradeConfig.ClientNo
                            }
                        };
                        this.tradeSocket.send(JSON.stringify(loginOutParam));
                        this.$store.state.forex.tradeConfig.ClientNo = this.tradeNumber;
                        this.$store.state.forex.tradeConfig.PassWord = Base64.encode(this.tradePassword);
                        this.$store.state.forex.forexFund = [];
                        this.$store.state.forex.forexOrderList = [];
                        var loginParam = {
                            Method:'Login',
                            Parameters:{
                                ClientNo:this.tradeConfig.ClientNo,
                                PassWord:this.tradeConfig.PassWord,
                                IsMock:this.tradeConfig.IsMock,
                                Version:this.tradeConfig.Version,
                                Source:this.tradeConfig.Source
                            }
                        }
                        this.tradeSocket.send(JSON.stringify(loginParam));
                    }
                }else{
                    this.$store.state.forex.isTradeLogin = false;
                    this.$store.state.forex.tradeConfig.ClientNo = this.tradeNumber;
                    this.$store.state.forex.tradeConfig.PassWord = Base64.encode(this.tradePassword);
                    this.initTradeWs();
                }
            }else{
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#forex_log{
	padding-top: 51px;
    z-index: 1000;
    height: 100%;
    background: #20212a;
    font-size: 14px;
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
    .login-box{
        padding: 25px 30px;
        .login-item{
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 50px;
            padding: 0 10px;
            color:#fff;
            margin-bottom: 15px;
            background: #323442;
            border-radius: 5px;
            .login-title{

            }
            .login-input{
                margin: 0;
                padding: 0;
                height: 100%;
                width: 70%;
                background: none;
                border: none;
                color: #fff;
                padding-left: 10px;
            }
            img{
                width: 20px;
            }
        }
        .trade-login{
            background: #ffd400;
            color:#17191e;
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 18px;
            margin-top: 15px;
        }
        .trade-argee{
            text-align: center;
            color:#555769;
            margin-top: 10px;
            span{
                color:#ffd400;
            }
        }
    }
    .border-bold{
        background: #17191e;
        height: 10px;
    }
    .login-tips{
        padding: 30px;
        color:#7e829c;
        .tips-content{
            margin-bottom: 10px;
        }
    }
    .switch-box{
        .hidden-bg{
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,.8);
            top: 0;
            left: 0;
            z-index: 10;
        }
        .account-list{
            position: absolute;
            width: 100%;
            background: #20212a;
            bottom: 0;
            left: 0;
            z-index: 11;
            .account-item{
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .item-num{
                    color: #fff;
                    font-size: 16px;
                }
                .item-price{
                    color: #7e829c;
                    font-size: 13px;
                }
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #forex_log{
        padding-top: 51px*@ip5;
        font-size: 14px*@ip5;
        .login-box{
            padding: 25px*@ip5 30px*@ip5;
            .login-item{
                height: 50px*@ip5;
                padding: 0 10px*@ip5;
                margin-bottom: 15px*@ip5;
                border-radius: 5px*@ip5;
                .login-input{
                    padding-left: 10px*@ip5;
                }
                img{
                    width: 20px*@ip5;
                }
            }
            .trade-login{
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                font-size: 18px*@ip5;
                margin-top: 15px*@ip5;
            }
            .trade-argee{
                margin-top: 10px*@ip5;
            }
        }
        .border-bold{
            height: 10px*@ip5;
        }
        .login-tips{
            padding: 30px*@ip5;
            .tips-content{
                margin-bottom: 10px*@ip5;
            }
        }
        .switch-box{
            .account-list{
                .account-item{
                    padding: 15px*@ip5 20px*@ip5;
                    .item-num{
                        font-size: 16px*@ip5;
                    }
                    .item-price{
                        font-size: 13px*@ip5;
                    }
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #forex_log{
        padding-top: 51px*@ip6;
        font-size: 14px*@ip6;
        .login-box{
            padding: 25px*@ip6 30px*@ip6;
            .login-item{
                height: 50px*@ip6;
                padding: 0 10px*@ip6;
                margin-bottom: 15px*@ip6;
                border-radius: 5px*@ip6;
                .login-input{
                    padding-left: 10px*@ip6;
                }
                img{
                    width: 20px*@ip6;
                }
            }
            .trade-login{
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                font-size: 18px*@ip6;
                margin-top: 15px*@ip6;
            }
            .trade-argee{
                margin-top: 10px*@ip6;
            }
        }
        .border-bold{
            height: 10px*@ip6;
        }
        .login-tips{
            padding: 30px*@ip6;
            .tips-content{
                margin-bottom: 10px*@ip6;
            }
        }
        .switch-box{
            .account-list{
                .account-item{
                    padding: 15px*@ip6 20px*@ip6;
                    .item-num{
                        font-size: 16px*@ip6;
                    }
                    .item-price{
                        font-size: 13px*@ip6;
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
