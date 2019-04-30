<template>
    <div id="profit">
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
        <div class="profit-info">
            <div class="profit-info-item">
                <span class="profit-title">可提取盈利</span>
                <span class="profit-value">{{profit}}美元</span>
                <span class="profit-title">({{profit/profitRate}}人民币)</span>
            </div>
            <div class="profit-info-item">
                <span class="profit-title">可提取盈利</span>
                <div class="profit-input">
                    <input type="number" v-model="profitPrice"/>
                    <span>美元</span>
                </div>
            </div>
            <div class="profit-info-item info-item-last">
                <span class="profit-rmb">({{profitPrice*profitRate}}人民币)</span>
                <span class="profit-btn" @tap="getAll">
                    全部提取
                    <img src="../../assets/img/forex/arrow.png"/>
                </span>
            </div>
        </div>
        <div class="submit-btn-box">
            <div class="submit-btn" @tap="confirmProfit">
                确认提现
            </div>
        </div>
        <div class="notice">
            <p>注意</p>
            <p>1.盈利提取的条件需同时满足:无持仓和已盈利;</p>
            <p>2.确认提取盈利后，系统将自动清除您所有的挂单、条件单和止盈止损设置;</p>
            <p>3.结算汇率:1美元=6.91人民币;</p>
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
            headerTitle:'盈利提取',
            isShowCustomer:false,
            profitPrice:'',//提取盈利金额
            profit:'',//可提取盈利
            profitRate:'',//人民币汇率
            id:'',//方案id
            msgTips:'',//toast消息
            isLoad:false,//数据加载
        }
    },
    computed:{
        ...mapState('forex',[
            'userInfo',
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        this.profit = this.$route.query.profit;
        this.id = this.$route.query.id;
        this.getRate();
    },
    methods:{
        customerOption(){
            this.isShowCustomer = !this.isShowCustomer;
        },
        getRate(){
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
                        this.profitRate = data.data.profitRate;
                        // this.RMBProfit = (this.profit * (rate * 10000) / 10000).toFixed(2);
                    }
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //全部提取
        getAll(){
            this.profitPrice = this.profit/this.profitRate;
        },
        //确认提现
        confirmProfit(){
            this.isLoad = true;
            this.$http.post(this.PATH + '/user/profitExtraction', {emulateJSON: true},{
                headers: {
                    'token':  this.userInfo.token,
                    'secret': this.userInfo.secret
                },
                params: {
                    id: this.id,
                    amount: this.profitPrice*this.profitRate,
                },
                timeout: 5000
            }).then(function(e){
                var data = e.body;
                this.isLoad = false;
                if(data.success == true){
                    if(data.code == 1){
                        this.msgTips = '盈利提取成功';
                        this.$refs.dialog.isShow = true;
                        setTimeout(function(){
                            this.$router.go(-1);
                        }.bind(this),1000);
                    }else{
                        this.msgTips = data.message;
                        this.$refs.dialog.isShow = true;
                    }
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(){
                this.isLoad = false;
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#profit{
    font-size: 14px;
	padding-top: 51px;
	z-index: 1000;
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
    .profit-info{
        .profit-info-item{
            display: flex;
            align-items: center;
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            height: 50px;
            background: #20212a;
            .profit-title{
                color:#7e829c;
                margin-right: 10px;
            }
            .profit-value{
                color:#ffd400;
                margin-right: 10px;
            }
            .profit-input{
                display: flex;
                align-items: center;
                background:#17191e;
                border-radius: 5px;
                height: 40px;
                flex: 2;
                color: #fff;
                input{
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    background: none;
                    border: none;
                    flex: 6;
                    padding-left: 10px;
                }
                span{
                    color:#525465;
                    flex: 1;
                }
            }
        }
        .info-item-last{
            justify-content: space-between;
            align-items: center;
            .profit-rmb{
                color: #fff;
            }
            .profit-btn{
                color:#7e829c;
                display: flex;
                align-items: center;
                img{
                    width: 10px;
                    margin-left: 10px;
                }
            }
        }
    }
    .submit-btn-box{
        padding: 30px;
        .submit-btn{
            background: #ffd400;
            color:#17191e;
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 18px;
        }
    }
    .notice{
        padding: 0 30px;
        p{
            color:#7e829c;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #profit{
        font-size: 14px*@ip5;
        padding-top: 51px*@ip5;
        .profit-info{
            .profit-info-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                height: 50px*@ip5;
                .profit-title{
                    margin-right: 10px*@ip5;
                }
                .profit-value{
                    margin-right: 10px*@ip5;
                }
                .profit-input{
                    border-radius: 5px*@ip5;
                    height: 40px*@ip5;
                    input{
                        padding-left: 10px*@ip5;
                    }
                }
            }
            .info-item-last{
                .profit-btn{
                    img{
                        width: 10px*@ip5;
                        margin-left: 10px*@ip5;
                    }
                }
            }
        }
        .submit-btn-box{
            padding: 30px*@ip5;
            .submit-btn{
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                font-size: 18px*@ip5;
            }
        }
        .notice{
            padding: 0 30px*@ip5;
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #profit{
        font-size: 14px*@ip6;
        padding-top: 51px*@ip6;
        .profit-info{
            .profit-info-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                height: 50px*@ip6;
                .profit-title{
                    margin-right: 10px*@ip6;
                }
                .profit-value{
                    margin-right: 10px*@ip6;
                }
                .profit-input{
                    border-radius: 5px*@ip6;
                    height: 40px*@ip6;
                    input{
                        padding-left: 10px*@ip6;
                    }
                }
            }
            .info-item-last{
                .profit-btn{
                    img{
                        width: 10px*@ip6;
                        margin-left: 10px*@ip6;
                    }
                }
            }
        }
        .submit-btn-box{
            padding: 30px*@ip6;
            .submit-btn{
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                font-size: 18px*@ip6;
            }
        }
        .notice{
            padding: 0 30px*@ip6;
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
