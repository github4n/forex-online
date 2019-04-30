<template>
    <div id="add-money">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <loading v-show="isLoad"></loading>
		<div id="header-box">
			<header-bar :showBack="true">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
				<span slot="otherIcon" @tap="customerOption">
					<img src="../../assets/img/forex/customer.png" />
				</span>
			</header-bar>
		</div>
        <div class="list-content">
            <div class="list-item">
                <span class="item-left">
                    <span class="item-title">账户余额</span>
                    <span class="item-value item-price">{{balanceList.balance}}元</span>
                </span>
                <span class="item-right" @tap="goToRecharge">
                    <span class="item-title">去充值</span>
                    <img src="../../assets/img/forex/arrow.png" />
                </span>
            </div>
            <div class="list-item border-bold">
                <span class="item-left item-input-box">
                    <span class="item-title">追加金额</span>
                    <span class="item-input">
                        <input class="price-input" type="text" v-model="addMoney"/>
                        <span class="price-unit">数量</span>
                    </span>
                </span>
            </div>
            <div class="list-item">
                <span class="item-left">
                    <span class="item-title">净值</span>
                    <span class="item-value">1233456</span>
                </span>
            </div>
            <div class="list-item">
                <span class="item-left">
                    <span class="item-title">亏损平仓线</span>
                    <span class="item-value">325</span>
                </span>
            </div>
            <div class="list-item">
                <span class="item-left">
                    <span class="item-title">换算汇率</span>
                    <span class="item-value">{{balanceList.rate}}人民币=1美元</span>
                </span>
            </div>
            <div class="list-item">
                <span class="item-left">
                    <span class="item-title">换算美元</span>
                    <span class="item-value">{{addMoney/balanceList.rate | getTwoNum(2)}}美元</span>
                </span>
            </div>
        </div>
        <div class="submit-btn-box">
            <div class="submit-btn" @tap="confirmAddMoney">
                立即追加
            </div>
        </div>
        <div class="tips">
            <ul>
                <li>温馨提示:</li>
                <li>1.最低追加保证金额为500元。</li>
                <li>2.系统将在下个交易日前为您的操盘账户追加保证金。</li>
                <li>3.追加成功后，系统将短信通知您。</li>
            </ul>
        </div>
        <div class="customer-box" v-show="isShowCustomer">
            <div class="hidden-bg" @tap.stop="customerOption"></div>
            <div class="customer-option">
                <customer></customer>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
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
            headerTitle:'追加保证金',
            isShowCustomer:false, //是否现在客服
            balanceList:[],//余额列表
            msgTips:'',//toast消息
            addMoney:'',//追加金额
            isLoad:false,
        }
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'userInfo',
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        this.addMoney = '';
        this.getBalance();
    },
    filters:{
        getTwoNum(value,num){
            return value.toFixed(num);
        }
    },
    methods:{
        customerOption(){
            this.isShowCustomer = !this.isShowCustomer;
        },
        //去充值
        goToRecharge(){
            this.$router.push({
                path:'/recharge'
            })
        },
        //获取余额
        getBalance(){
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
                    this.balanceList = data.data;
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = "连接服务器失败";
                this.$refs.dialog.isShow = true;
            });
        },
        //确认追加
        confirmAddMoney(){
            if(this.addMoney<500){
                this.addMoney = 500;
                this.msgTips = "最小追加保证金金额为500元";
                this.$refs.dialog.isShow = true;
                return;
            }
            if(parseFloat(this.addMoney) > parseFloat(this.balanceList.balance)){
                this.msgTips = "余额不足";
                this.$refs.dialog.isShow = true;
                return;
            }
            this.isLoad = true;
            this.$http.post(this.PATH + '/user/ftrade/addbond', {emulateJSON: true},{
                headers: {
                    'token':  this.userInfo.token,
                    'secret': this.userInfo.secret
                },
                params: {
                    id: this.$route.query.id,
                    addBond:this.addMoney
                },
                timeout: 5000
            }).then(function(e){
                this.isLoad = false;
                var data = e.body;
                if(data.success == true&&data.code == 1){
                    this.msgTips = "追加保证金成功";
                    this.$refs.dialog.isShow = true;
                    setTimeout(function(){
                        this.$router.go(-1);
                    }.bind(this),1000);
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = "连接服务器失败";
                this.$refs.dialog.isShow = true;
            });
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#add-money{
    font-size: 14px;
	padding-top: 50px;
	z-index: 1000;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .list-content{
        .list-item{
            padding: 5px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color:#fff;
            background: #20212a;
            height: 40px;
            border-bottom: solid 1px #17191e;
            .item-input-box{
                width: 100%;
                justify-content: space-between;
            }
            .item-left{
                display: flex;
                align-items: center;
                .item-title{
                    color:#7e829c;
                    width: 75px;
                }
                .item-value{
                    margin-left: 20px;
                    color: #fff;
                }
                .item-price{
                    color:#ffd400;
                }
                .item-input{
                    display: flex;
                    align-items: center;
                    background: #17191e;
                    border-radius: 5px;
                    height: 35px;    
                    flex-grow: 1;
                    margin-left: 20px;
                    padding: 0 10px;
                    .price-input{
                        padding: 0;
                        margin: 0;
                        background: none;
                        border: none;
                        height: 100%;
                        width: 90%;
                    }
                    .price-unit{
                        font-size: 12px;
                        color:#7e829c;
                    }
                }
            }
            .item-right{
                display: flex;
                align-items: center;
                .item-title{
                    color:#7e829c;
                    font-size: 12px;    
                    margin-right: 10px;
                }
                img{
                    width: 8px;
                }
            }
        }
        .border-bold{
            box-sizing: content-box;
            border-bottom: solid 9px #17191e;
        }
    }
    .submit-btn-box{
        padding: 30px 20px;
        .submit-btn{
            background: #ffd400;
            color:#17191e;
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 18px;
        }
    }
    .tips{
        padding: 0 20px;
        color:#525465;
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
}
/*ip5*/
@media(max-width:370px) {
    #add-money{
        font-size: 14px*@ip5;
        padding-top: 50px*@ip5;
        .list-content{
            .list-item{
                padding: 5px*@ip5 20px*@ip5;
                height: 40px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                .item-left{
                    .item-title{
                        width: 75px*@ip5;
                    }
                    .item-value{
                        margin-left: 20px*@ip5;
                    }
                    .item-input{
                        border-radius: 5px*@ip5;
                        height: 35px*@ip5;
                        margin-left: 20px*@ip5;
                        padding: 0 10px*@ip5;
                        .price-unit{
                            font-size: 12px*@ip5;
                        }
                    }
                }
                .item-right{
                    .item-title{
                        font-size: 12px*@ip5;    
                        margin-right: 10px*@ip5;
                    }
                    img{
                        width: 8px*@ip5;
                    }
                }
            }
            .border-bold{
                border-bottom: solid 9px*@ip5 #17191e;
            }
        }
        .submit-btn-box{
            padding: 30px*@ip5 20px*@ip5;
            .submit-btn{
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                font-size: 18px*@ip5;
            }
        }
        .tips{
            padding: 0 20px*@ip5;
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #add-money{
        font-size: 14px*@ip6;
        padding-top: 50px*@ip6;
        .list-content{
            .list-item{
                padding: 5px*@ip6 20px*@ip6;
                height: 40px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                .item-left{
                    .item-title{
                        width: 75px*@ip6;
                    }
                    .item-value{
                        margin-left: 20px*@ip6;
                    }
                    .item-input{
                        border-radius: 5px*@ip6;
                        height: 35px*@ip6;
                        margin-left: 20px*@ip6;
                        padding: 0 10px*@ip6;
                        .price-unit{
                            font-size: 12px*@ip6;
                        }
                    }
                }
                .item-right{
                    .item-title{
                        font-size: 12px*@ip6;    
                        margin-right: 10px*@ip6;
                    }
                    img{
                        width: 8px*@ip6;
                    }
                }
            }
            .border-bold{
                border-bottom: solid 9px*@ip6 #17191e;
            }
        }
        .submit-btn-box{
            padding: 30px*@ip6 20px*@ip6;
            .submit-btn{
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                font-size: 18px*@ip6;
            }
        }
        .tips{
            padding: 0 20px*@ip6;
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>

