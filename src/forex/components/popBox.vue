<template>
    <div id="pop-box" v-show="isShowPop">
        <div class="pop-bg" @tap="hiddenPop"></div>
        <div class="pop-content">
            <div class="pop-header">
                {{headText}}
            </div>
            <div class="pop-main">
                <slot name="content"></slot>
            </div>
            <div class="pop-btn">
                <span @tap="hiddenPop">取消</span>
                <span v-show="isShowOpenBtn" @tap="openQuick">
                    <span v-show="isQuickTrade==1">开启</span>
                    <span v-show="isQuickTrade==0">关闭</span>
                </span>
                <span v-show="isShowComfirmBtn" @tap="sendOrder">
                    确认
                </span>
                <span v-show="!isTradeLogin" @tap="goToLogin">
                    去登录>>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
export default {
    props:{
        headText:{
            default:''
        },
        isShowPop:{
            default:false,
        },
        isSelectQuick:{
            default:false,
        },
        isShowOpenBtn:{
            default:false
        },
        isShowComfirmBtn:{
            default:false,
        },
        sendMethod:{

        },
        isTradeLogin:{
            default:true,
        }
    },
    data(){
        return{
        }
    },
    computed:{
        ...mapState('forex',[
            'isQuickTrade',
            'isAppLogin',
            'userInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
    },
    methods:{
        hiddenPop(){
            this.$parent.isShowPop = false;
            this.$parent.isShowOrderPop = false;
            this.$parent.isShowInfoPop = false;
            this.$parent.isShowLoginPop = false;
        },
        openQuick(){
            if(!this.isSelectQuick){
                this.$parent.msgTips = '请先同意《快捷交易协议》';
                this.$parent.$refs.dialog.isShow = true;
            }else{
                if(!this.isAppLogin){
                    this.$parent.msgTips = '请先登录平台账号';
                    this.$parent.$refs.dialog.isShow = true;
                    return;
                }
                this.$http.post(this.PATH + '/user/ftrade/fastTrade', {emulateJSON: true}, {
                    headers: {
                        'token':  this.userInfo.token,
                        'secret': this.userInfo.secret
                    },
                    params: {
                        "onOff": this.isQuickTrade==0?1:0
                    },
                    timeout: 5000
                }).then(function(res) {
                    if(res.body.code == 1){
                        switch(res.body.data){
                            case 0:
                                this.$parent.msgTips = '已开启快速交易';
                                this.$parent.$refs.dialog.isShow = true;
                            ;break;
                            case 1:
                                this.$parent.msgTips = '已关闭快速交易';
                                this.$parent.$refs.dialog.isShow = true;
                            ;break;
                        }
                        this.$store.state.forex.isQuickTrade = res.body.data;
                        this.$parent.isShowPop = false;
                        this.$parent.isSelectQuick = false;
                    }
                }.bind(this), function(e) {
                    this.$parent.msgTips = '连接服务器失败';
                    this.$parent.$refs.dialog.isShow = true;
                }.bind(this));
            }
        },
        sendOrder(){
            this.sendMethod();
            this.$parent.isShowOrderPop = false;
        },
        goToLogin(){
            this.$parent.isShowLoginPop = false;
            if(!this.isAppLogin){
                this.$router.push({
                    path:'/login'
                })
            }else{
                this.$router.push({
                    path:'/forex_login'
                })
            }
        }
    }
}
</script>

<style lang="less">
@import url("../../assets/css/main.less");
#pop-box{
    .pop-bg{
        position: fixed;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.8);
        top: 0;
        left: 0;
        z-index: 10000;
    }
    .pop-content{
        position: fixed;
        width: 80%;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        z-index: 10001;
        background: #20212a;
        font-size: 14px;
        color: #fff;
        border-radius: 10px;
        .pop-header{
            height: 40px;
            line-height: 40px;
            text-align: center;
            position: relative;
            color:#7e829c;
            border-bottom: solid 1px #17191e;
        }
        .pop-main{
            padding: 20px 10px;
            .pop-text{
                color:#fff;
                text-align: center;
                font-size: 14px;
            }
            .pop-text-left{
                text-align: left;
                width: 140px;
                margin: 0 auto;
                .pop-order-color{
                    color:#7e829c;
                }
            }
            .pop-info-left{
                text-align: left;
            }
            .pop-main-btn{
                display: flex;
                justify-content: center;
                align-items: center;
                .radio-box{
                    width: 20px;
                    height: 20px;
                    border: solid 1px #7e829c;
                    border-radius: 5px;
                    text-align: center;
                    img{
                        width: 15px;
                    }
                }
                .radio-box-active{
                    border-color: #ffd400;
                }
                .pop-agree{
                    color:#ffd400;
                }
                span{
                    margin: 0 5px;
                }
            }
        }
        .pop-btn{
            height: 60px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            color:#fff;
            border-top: solid 1px #17191e;
            span{
                padding: 0 30px;
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #pop-box{
        .pop-content{
            font-size: 14px*@ip5;
            border-radius: 10px*@ip5;
            .pop-header{
                height: 40px*@ip5;
                line-height: 40px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .pop-main{
                padding: 20px*@ip5 10px*@ip5;
                .pop-main-btn{
                    .radio-box{
                        width: 20px*@ip5;
                        height: 20px*@ip5;
                        border-radius: 5px*@ip5;
                        img{
                            width: 15px*@ip5;
                        }
                    }
                    span{
                        margin: 0 5px*@ip5;
                    }
                }
                .pop-text{
                    font-size: 14px*@ip5;
                }
                .pop-text-left{
                    text-align: left;
                    width: 140px*@ip5;
                    margin: 0 auto;
                }
            }
            .pop-btn{
                height: 60px*@ip5;
                border-top: solid 1px*@ip5 #17191e;
                span{
                    padding: 0 30px*@ip5;
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #pop-box{
        .pop-content{
            font-size: 14px*@ip6;
            border-radius: 10px*@ip6;
            .pop-header{
                height: 40px*@ip6;
                line-height: 40px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .pop-main{
                padding: 20px*@ip6 10px*@ip6;
                .pop-main-btn{
                    .radio-box{
                        width: 20px*@ip6;
                        height: 20px*@ip6;
                        border-radius: 5px*@ip6;
                        img{
                            width: 15px*@ip6;
                        }
                    }
                    span{
                        margin: 0 5px*@ip6;
                    }
                }
                .pop-text{
                    font-size: 14px*@ip6;
                }
                .pop-text-left{
                    text-align: left;
                    width: 140px*@ip6;
                    margin: 0 auto;
                }
            }
            .pop-btn{
                height: 60px*@ip6;
                border-top: solid 1px*@ip6 #17191e;
                span{
                    padding: 0 30px*@ip6;
                }
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
