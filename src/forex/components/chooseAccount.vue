<template>
    <div id="choose_account">
        <div class="account-header">
            已有账号,可直接登录
        </div>
        <div class="account-list">
            <div class="account-list-item" v-for="(item,index) in accountList" :key="index" @tap="goToLogin(item)">
                <span class="account-num">交易账户:{{item.tranAccount}}<span class="tip-text" v-show="isTradeLogin&&tradeConfig.ClientNo == item.tranAccount">（已登录）</span></span>
                <span class="account-value">￥{{item.traderBond}}</span>
                <img src="../../assets/img/forex/arrow.png"/>
            </div>
        </div>
        <div class="account-btn">
            <span @tap="accountOption">新开户>></span>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex';
export default {
    props:['accountOption','accountList'],
    data(){
        return{

        }
    },
    computed:{
        ...mapState('forex',[
            'isTradeLogin',
            'tradeConfig'
        ])
    },
    methods:{
        goToLogin(item){
            this.$store.state.forex.tradeLoginObj = {
                number:item.tranAccount,
                password:item.tranPassword
            }
            this.$router.push({
                path:'/forex_login',
            });
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#choose_account{
    width: 100%;
    background: #20212a;
    font-size: 14px;
    color: #fff;
    border-radius: 10px;
    .account-header{
        height: 40px;
        line-height: 40px;
        text-align: center;
        position: relative;
        color:#7e829c;
    }
    .account-list{
        background: #2e334d;
        max-height: 190px;
        overflow: auto;
        .account-list-item{
            display: flex;
            flex-direction: column;
            padding: 10px;
            border-bottom: solid 1px #17191e;
            position: relative;
            .account-num{
                .tip-text{
                    color:#ffd400;
                }
            }
            .account-value{
                color:#ffd400;
                font-size: 18px;
            }
            img{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 20px;
                width: 10px;
            }
        }
    }
    .account-btn{
        height: 50px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color:#fff;
        span{
            margin-right: 20px;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #choose_account{
        font-size: 14px*@ip5;
        border-radius: 10px*@ip5;
        .account-header{
            height: 40px*@ip5;
            line-height: 40px*@ip5;
        }
        .account-list{
            max-height: 190px*@ip5;
            .account-list-item{
                padding: 10px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                .account-value{
                    font-size: 18px*@ip5;
                }
                img{
                    right: 20px*@ip5;
                    width: 10px*@ip5;
                }
            }
        }
        .account-btn{
            height: 50px*@ip5;
            span{
                margin-right: 20px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #choose_account{
        font-size: 14px*@ip6;
        border-radius: 10px*@ip6;
        .account-header{
            height: 40px*@ip6;
            line-height: 40px*@ip6;
        }
        .account-list{
            max-height: 190px*@ip5;
            .account-list-item{
                padding: 10px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                .account-value{
                    font-size: 18px*@ip6;
                }
                img{
                    right: 20px*@ip6;
                    width: 10px*@ip6;
                }
            }
        }
        .account-btn{
            height: 50px*@ip6;
            span{
                margin-right: 20px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
