<template>
    <div id="success">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
		<div id="header-box">
			<header-bar :showBack="true" :showMenu="false">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
			</header-bar>
		</div>
        <div class="auto-success" v-show="isAutoSuccess">
            <div class="auto-icon">
                <img src="../../assets/img/forex/success.png"/>
                <span>开户申请成功</span>
            </div>
            <div class="auto-detail">
                <span @tap="goToDetail">查看方案详情>></span>
            </div>
            <div class="login-box">
                <div class="login-item">
                    <span class="login-title">交易账号</span>
                    <input class="login-input" type="text" v-model="tradeNum"/>
                    <img src="../../assets/img/forex/white_arrow.png"/>
                </div>
                <div class="login-item">
                    <span class="login-title">交易密码</span>
                    <input class="login-input" :type="isShowPassword?'text':'password'"  v-model="tradePassword"/>
                    <img v-show="isShowPassword" @tap="changePassword" src="../../assets/img/forex/eye_open.png"/>
                    <img v-show="!isShowPassword" @tap="changePassword" src="../../assets/img/forex/eye_close.png"/>
                </div>
                <div class="trade-login" @tap="loginTrade">
                    交易登录
                </div>
                <div class="trade-argee">
                    点击登录表示同意<span @tap="goToAgree">《外汇交易合作协议》</span>
                </div>
            </div>
        </div>
        <div class="hand-success" v-show="!isAutoSuccess">
            <div class="auto-icon">
                <img src="../../assets/img/forex/wait.png"/>
                <span>已提交开户申请</span>
            </div>
            <div class="hand-tip">
                开户申请成功后，系统将自动发送短信通知
            </div>
            <div class="auto-detail">
                <span @tap="goToDetail">查看方案详情>></span>
            </div>
        </div>
    </div>    
</template>

<script>
import {mapState,mapActions} from 'vuex';
import headerBar from '../components/header';
import { setTimeout } from 'timers';
export default {
    components:{
        headerBar,
    },
    data(){
        return{
            headerTitle: '开户成功',
            isAutoSuccess:false,//自动开户还是手动开户
            isShowPassword:false, //是否显示密码
            tradeNum:'', //交易账号
            tradePassword:'', //交易密码
            msgTips:'',//toast消息
        }
    },
    computed:{
        ...mapState('forex',[
            'openSuccessObj',
            'tradeConfig',
            'isTradeLogin',
            'tradeSocket'
        ])
    },
    activated(){
        this.isAutoSuccess = JSON.parse(this.$route.query.isAutoSuccess);
        if(this.isAutoSuccess){
            this.getAccountInfo();
        }
        this.headerTitle = this.isAutoSuccess?'开户成功':'提交成功';
    },
    watch:{
        isTradeLogin:function(){
            if(this.isTradeLogin){
                var obj = {
                    tradeNumber:this.tradeNum,
                    tradePassword:this.tradePassword,
                }
                localStorage.setItem('forexTradeUser',JSON.stringify(obj));
                this.msgTips = '登录成功';
                this.$refs.dialog.isShow = true;
                setTimeout(function(){
                    this.$router.push({
                        path:'/forex_home',
                    })
                }.bind(this),1000);
            }
        }
    },
    methods:{
        ...mapActions('forex',[
            'initTradeWs',
        ]),
        changePassword(){
            this.isShowPassword = !this.isShowPassword;
        },
        goToAgree(){
            this.$router.push({
                path:'/agreement'
            })
        },
        //获取账号密码
        getAccountInfo(){
            this.tradeNum = this.openSuccessObj.username;
            this.tradePassword = this.openSuccessObj.password;
        },
        //查看方案详情
        goToDetail(){
            this.$router.push({
                path: '/forex_tradeDetail',
                query: {
                    id: this.openSuccessObj.vid,
                    type: this.openSuccessObj.isPay, 
                    businessType:100
                }
            });
        },
        //登录交易
        loginTrade(){
            if(this.tradeConfig.url_address){
                if(!this.tradeNum){
                    this.msgTips = '请输入交易账号';
                    this.$refs.dialog.isShow = true;
                    return;
                }else if(!this.tradePassword){
                    this.msgTips = '请输入交易密码';
                    this.$refs.dialog.isShow = true;
                    return;
                }
                if(this.tradeSocket){
                    //存在连接
                    if(this.isTradeLogin){
                        //已有账号登录
                        var loginOutParam = {
                            Method:'Logout',
                            Parameters:{
                                ClientNo: this.tradeConfig.ClientNo
                            }
                        };
                        this.tradeSocket.send(JSON.stringify(loginOutParam));
                        this.$store.state.forex.tradeConfig.ClientNo = this.tradeNum;
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
                    }else{
                        //未有账号登录
                        this.$store.state.forex.tradeConfig.ClientNo = this.tradeNum;
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
                    //不存在
                    this.$store.state.forex.tradeConfig.ClientNo = this.tradeNum;
                    this.$store.state.forex.tradeConfig.PassWord = Base64.encode(this.tradePassword);
                    this.initTradeWs();
                }
            }else{
                this.msgTips = '未获取到交易地址,请联系定国';
                this.$refs.dialog.isShow = true;
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#success{
	padding-top: 51px;
    z-index: 1000;
    font-size: 14px;
    height: 100%;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .auto-success{
        background: #20212a;
        height: 100%;
        .auto-icon{
            padding: 20px 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: solid 1px #17191e;
            color: #fff;
            img{
                width: 50px;
                margin-bottom: 10px;
            }
        }
        .auto-detail{
            padding: 10px 20px;
            border-bottom: solid 10px #17191e;
            text-align: right;
            color:#7e829c;
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
                margin-top: 10px;
            }
            .trade-argee{
                text-align: center;
                color:#555769;
                margin-top: 20px;
                span{
                    color:#ffd400;
                }
            }
        }
    }
    .hand-success{
        .auto-icon{
            background: #20212a;
            padding: 20px 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: solid 1px #17191e;
            color: #fff;
            img{
                width: 50px;
                margin-bottom: 10px;
            }
        }
        .hand-tip{
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color:#7e829c;
        }
        .auto-detail{
            background: #20212a;
            padding: 10px 20px;
            text-align: right;
            color:#7e829c;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #success{
        padding-top: 51px*@ip5;
        font-size: 14px*@ip5;
        .auto-success{
            .auto-icon{
                padding: 20px*@ip5 0px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                img{
                    width: 50px*@ip5;
                    margin-bottom: 10px*@ip5;
                }
            }
            .auto-detail{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 10px*@ip5 #17191e;
            }
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
                    margin-top: 10px*@ip5;
                }
                .trade-argee{
                    margin-top: 20px*@ip5;
                }
            }
        }
        .hand-success{
            .auto-icon{
                padding: 20px*@ip5 0px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                img{
                    width: 50px*@ip5;
                    margin-bottom: 10px*@ip5;
                }
            }
            .hand-tip{
                padding: 10px*@ip5 20px*@ip5;
            }
            .auto-detail{
                padding: 10px*@ip5 20px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #success{
        padding-top: 51px*@ip6;
        font-size: 14px*@ip6;
        .auto-success{
            .auto-icon{
                padding: 20px*@ip6 0px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                img{
                    width: 50px*@ip6;
                    margin-bottom: 10px*@ip6;
                }
            }
            .auto-detail{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 10px*@ip6 #17191e;
            }
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
                    margin-top: 10px*@ip6;
                }
                .trade-argee{
                    margin-top: 20px*@ip6;
                }
            }
        }
        .hand-success{
            .auto-icon{
                padding: 20px*@ip6 0px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                img{
                    width: 50px*@ip6;
                    margin-bottom: 10px*@ip6;
                }
            }
            .hand-tip{
                padding: 10px*@ip6 20px*@ip6;
            }
            .auto-detail{
                padding: 10px*@ip6 20px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
