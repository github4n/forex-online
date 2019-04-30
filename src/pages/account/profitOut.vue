<template>
    <div id="profit-out">
		<tipsDialog :msg="msgTips"></tipsDialog>
		<topbar title="盈利提取"></topbar>
		<back></back>
		<cs title="客服"></cs>
        <div class="profit-content">
            <div class="profit-title">
                可提取盈利:<span :class="useful>=0?useful==0?'':'value_up':'value_down'">{{useful}} 元</span>
            </div>
            <div class="profit-input">
                <span class="profit-input-title">提取盈利</span>
                <input v-bind:disabled="useful<=0?true:false" type="number" v-bind:placeholder="useful<=0?'当前无盈利':'请输入金额'" v-model="profitValue"/>
                <span class="profit-input-unit">元</span>
            </div>
            <div class="all-out">
                <span @click="chooseAll">全部提取</span>
            </div>
            <div class="confirm-btn" @click="confirmBtn">
                确认提取
            </div>
            <div class="line"></div>
            <div class="tips">
                <ul>
                    <li class="tips-title">温馨提示:</li>
                    <li>1.盈利提取的条件需同时满足:无持仓和已盈利。</li>
                    <li>2.确认提取盈利后，系统将自动清除您所有的挂单、条件单和止盈止损设置。</li>
                    <li>3.盈利提取时的汇率标准请咨询客服。</li>
                </ul>
            </div>
        </div>

        <!-- <div class="tips-box" v-show="sysTips">
            <div class="tips-title">
                系统提示
                <img @click="tipsFun(1)" src="../../assets/img/x.png" />
            </div>
            <div class="tips-content">
                系统将自动清除您所有的挂单、条件单和止盈止损设置，是否继续
            </div>
            <div class="tips-btn">
                <span @click="tipsFun(1)">取消</span>
                <span @click="tipsFun(2)">继续</span>
            </div>
        </div>
        <div class="shadow" @click="tipsFun(1)" v-show="sysTips"></div> -->
    </div>
</template>

<script>
import topbar from '../../components/Topbar.vue'
import back from '../../components/back.vue'
import tipsDialog from '../../components/tipsDialog.vue'
import cs from '../../components/customerService.vue'
import { setTimeout } from 'timers';
export default {
    components:{topbar,back,tipsDialog,cs},
    data(){
        return{
            msg:'', //提示信息
            sysTips:false, //系统提示
            profitValue:'', //提取盈利金额
            useful:0, //可提取盈利
            rate:1,//提取盈利汇率
        }
    },
    computed:{
        msgTips:function(){
            return this.msg;
        },
        loginStatus(){
            return this.$store.state.loginStatus;
        },
        tradeConfig(){
            return this.$store.state.market.tradeConfig;
        },
        Parameters(){
            return this.$store.state.market.Parameters;
        },
        //平仓后的总资产
        jCacheTotalAccount(){
            return this.$store.state.market.CacheAccount.jCacheTotalAccount;
        },
        //条件单
        conditionList(){
            return this.$store.state.market.conditionList;
        },
        //未触发的止损单
        hasNostopLossList(){
            return this.$store.state.market.hasNostopLossList;
        },
        PATH: function(){
            return this.$store.getters.PATH;
        },
        tradeSocket:function(){
			return this.$store.state.tradeSocket;
        },
        orderTemplist(){
            return	this.$store.state.market.orderTemplist;
        },
        templateList(){
            return this.$store.state.market.templateList;
        },
    },
    watch:{
        loginStatus:function(){
            if(this.loginStatus == 1){
                this.$children[0].isShow = true;
                this.msg = '登录成功';
                this.$store.state.market.tradeConfig.username = this.$route.query.username;
                this.$store.state.market.tradeConfig.password = Base64.encode(this.$route.query.password);
                var userData = {'username': this.$route.query.username, 'password': Base64.encode(this.$route.query.password)};  
                localStorage.setItem("tradeUser", JSON.stringify(userData));
                this.$store.dispatch('qryHisTrade');
                setTimeout(function(){
                    // this.$router.push({path: '/index', query: {isBack: 1}});
                    this.Parameters.forEach(function(e){
                        if(e.CommodityName == '国际原油'){
                            this.$store.state.market.currentdetail = e;
                        }
                    }.bind(this));
                    // this.$store.state.loginStatus = 0;
                    this.$router.replace({path: '/orderdetail',query:{type:1}});
                }.bind(this),100);
            }else if(this.loginStatus == 2){	
                this.$children[0].isShow = true;
                this.msg = this.$store.state.market.tradeLoginSuccessMsg;
                // this.$store.state.loginStatus = 0;
            }
        }
    },
    methods:{
        //计算可提取盈利
        userfulProfit(){
            this.useful = (this.$route.query.profit).toFixed(2);
        },
        //获取汇率
        getRate(){
            var userInfo = JSON.parse(localStorage.user);
            this.$http.post(this.PATH + '/user/getbalancerate', {emulateJSON: true},{
                headers: {
                    'token':  userInfo.token,
                    'secret': userInfo.secret
                },
                params: {
                    businessType: 1
                },
                timeout: 5000
            }).then(function(e){
                var data = e.body;
                if(data.success == true){
                    if(data.code == 1){
                        this.rate = data.data.profitRate;
                        this.userfulProfit();
                    }
                }else{
                    switch (data.code){
                        case '3':
                            this.$children[0].isShow = true;
                            this.msg = '用户信息不存在';
                            break;
                        default:
                            break;
                    }
                }
            }.bind(this), function(){
                this.$children[0].isShow = true;
                this.msg = '网络不给力，请稍后再试！';
            });
        },
        //提示框功能
        profitOut(){
            var userInfo = JSON.parse(localStorage.user);
            this.$http.post(this.PATH + '/user/ftrade/profitExtraction', {emulateJSON: true},{
                headers: {
                    'token':  userInfo.token,
                    'secret': userInfo.secret
                },
                params: {
                    amount: this.profitValue,
                    id:this.$route.query.id,
                },
                timeout: 5000
            }).then(function(e){
                var data = e.body;
                if(data.success == true){
                    if(data.code == 1){
                        this.$children[0].isShow = true;
                        this.msg = '提现成功，预计1天内到账';
                        this.profitValue = '';
                        this.sysTips = false;
                        setTimeout(function(){
                            this.$router.go(-1);
                        }.bind(this),1500);
                    }
                }else{
                    this.$children[0].isShow = true;
                    this.msg = data.message;
                }
            }.bind(this), function(){
                this.$children[0].isShow = true;
                this.msg = '网络不给力，请稍后再试！';
            });
        },
        //确认提取
        confirmBtn(){
            if(this.useful<=0){
                this.$children[0].isShow = true;
                this.msg = '当前无盈利';
            }else if(this.profitValue == ''||this.profitValue == 0){
                this.$children[0].isShow = true;
                this.msg = '请输入提取的盈利数';
            }else if(parseFloat(this.profitValue)>parseFloat(this.useful)){
                this.$children[0].isShow = true;
                this.msg = '没有足够的盈利';
            }else if(isNaN(this.profitValue) == true){
                this.$children[0].isShow = true;
                this.msg = '请输入数字';
            }else if(this.profitValue<10){
                this.$children[0].isShow = true;
                this.msg = '最小提取盈利金额为10元';
            }else{
                this.profitOut();
            }
        },
        //全部提取
        chooseAll(){
            if(this.useful<0){
                this.$children[0].isShow = true;
                this.msg = '当前无盈利';
            }else{
                this.profitValue = this.useful;
            }
        }
    },
    mounted(){
        this.getRate();
    },
    watch:{
        $route:function(){
            if(this.$route.name == 'profitOut'){
                this.getRate();
            }
        }
    },
    beforeRouteEnter(to,from,next){
        console.log(to);
        if((from.path == '/')&&to.path == '/profitOut'){
            next({path:'/home'})
        }else{
            next();
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#profit-out{
    overflow: hidden;
    .profit-content{    
        margin-top: 50px;
        .value_down{
            color:#27b486!important;
        }
        .value_up{
            color:#df4547!important;
        }
    }
    .shadow{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.7);
        z-index: 1200;
    }
}
@media (min-width:411px) {
    #profit-out{
        height: 100%;
        background: #242633;
        .profit-content{    
            margin-top: 50px;
            .profit-title{
                color:#a3abcc;
                font-size: 14px; 
                height: 50px;
                line-height: 50px;
                border-bottom: solid 1px #12121a;
                padding-left: 20px;
                span{
                    color:#ffd400;
                }
            }
            .profit-input{
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #1b1b26;
                border: solid 1px #12121a;
                width: 90%;
                margin: 0 auto;
                font-size: 14px;
                margin-top:10px;
                margin-bottom:10px;
                height: 50px;
                border-radius: 5px;
                .profit-input-title{
                   width: 100px;
                   color:#a3aacc;
                   text-align: center;
                }
                .profit-input-unit{
                    width: 30px;
                    color:#fff;
                }
                input{
                    height: 100%;
                   color:#a3aacc;
                    background: none;
                    border: none;
                    margin: 0px;
                }
                input::-webkit-input-placeholder{
                    font-size: 14px;
                }
                
            }
            .all-out{
                text-align: right;
                color:#7a7f99;
                font-size: 14px;
                border-bottom: solid 1px #12121a;
                padding: 10px 0;
                padding-right: 20px;
            }
            .confirm-btn{
                width: 90%;
                margin: 0 auto;
                background: #ffd400;
                height: 50px;
                line-height: 50px;
                border-radius: 100px;
                text-align: center;
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .line{
                background: #1b1b26;
                height: 10px;
            }
            .tips{
                padding: 10px 20px;
                font-size: 14px;
                ul{
                    padding: 0px;
                    .tips-title{
                        color: #ffd400;
                    }
                    li{
                        color: #7a7f99;
                        list-style: none;
                        line-height: 25px;
                    }
                }
            }
        }
        .tips-box{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 9999;
            width: 80%;
            border-radius: 10px;
            background: #242633;
            color:#ccd5ff;
            .tips-title{
                text-align: center;
                height: 50px;
                line-height: 50px;
                border-bottom: solid 1px #1b1b26;
                img{
                    position: absolute;
                    right: 0;
                    width: 35px;
                }
            }
            .tips-content{
                color:#fff;
                height: 80px;
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 14px;
                text-align: center;
            }
            .tips-btn{
                display: flex;
                justify-content: space-around;
                align-items: center;
                height: 50px;
                border-top: solid 5px #1b1b26;
                span{
                    width: 50%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #profit-out{
        height: 100%;
        background: #242633;
        .profit-content{    
            margin-top: 50px*@ip6;
            .profit-title{
                color:#a3abcc;
                font-size: 14px*@ip6; 
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                border-bottom: solid 1px*@ip6 #12121a;
                padding-left: 20px*@ip6;
                span{
                    color:#ffd400;
                }
            }
            .profit-input{
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #1b1b26;
                border: solid 1px*@ip6 #12121a;
                width: 90%;
                margin: 0 auto;
                font-size: 14px*@ip6;
                margin-top:10px*@ip6;
                margin-bottom:10px*@ip6;
                height: 50px*@ip6;
                border-radius: 5px*@ip6;
                .profit-input-title{
                   width: 100px*@ip6;
                   color:#a3aacc;
                   text-align: center;
                }
                .profit-input-unit{
                    width: 30px*@ip6;
                    color:#fff;
                }
                input{
                    height: 100%;
                   color:#a3aacc;
                    background: none;
                    border: none;
                    margin: 0px*@ip6;
                }
                input::-webkit-input-placeholder{
                    font-size: 14px*@ip6;
                }
                
            }
            .all-out{
                text-align: right;
                color:#7a7f99;
                font-size: 14px*@ip6;
                border-bottom: solid 1px*@ip6 #12121a;
                padding: 10px*@ip6 0;
                padding-right: 20px*@ip6;
            }
            .confirm-btn{
                width: 90%;
                margin: 0 auto;
                background: #ffd400;
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                border-radius: 100px*@ip6;
                text-align: center;
                margin-top: 20px*@ip6;
                margin-bottom: 20px*@ip6;
            }
            .line{
                background: #1b1b26;
                height: 10px*@ip6;
            }
            .tips{
                padding: 10px*@ip6 20px*@ip6;
                font-size: 14px*@ip6;
                ul{
                    padding: 0px*@ip6;
                    .tips-title{
                        color: #ffd400;
                    }
                    li{
                        color: #7a7f99;
                        list-style: none;
                        line-height: 25px*@ip6;
                    }
                }
            }
        }
        .tips-box{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 9999;
            width: 80%;
            border-radius: 10px*@ip6;
            background: #242633;
            color:#ccd5ff;
            .tips-title{
                text-align: center;
                height: 50px*@ip6;
                line-height: 50px*@ip6;
                border-bottom: solid 1px*@ip6 #1b1b26;
                img{
                    position: absolute;
                    right: 0;
                    width: 35px*@ip6;
                }
            }
            .tips-content{
                color:#fff;
                height: 80px*@ip6;
                justify-content: center;
                align-items: center;
                font-size: 14px*@ip6;
                text-align: center;
            }
            .tips-btn{
                display: flex;
                justify-content: space-around;
                align-items: center;
                height: 50px*@ip6;
                border-top: solid 5px*@ip6 #1b1b26;
                span{
                    width: 50%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #profit-out{
        height: 100%;
        background: #242633;
        .profit-content{    
            margin-top: 50px*@ip5;
            .profit-title{
                color:#a3abcc;
                font-size: 14px*@ip5; 
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                border-bottom: solid 1px*@ip5 #12121a;
                padding-left: 20px*@ip5;
                span{
                    color:#ffd400;
                }
            }
            .profit-input{
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #1b1b26;
                border: solid 1px*@ip5 #12121a;
                width: 90%;
                margin: 0 auto;
                font-size: 14px*@ip5;
                margin-top:10px*@ip5;
                margin-bottom:10px*@ip5;
                height: 50px*@ip5;
                border-radius: 5px*@ip5;
                .profit-input-title{
                   width: 100px*@ip5;
                   color:#a3aacc;
                   text-align: center;
                }
                .profit-input-unit{
                    width: 30px*@ip5;
                    color:#fff;
                }
                input{
                    height: 100%;
                   color:#a3aacc;
                    background: none;
                    border: none;
                    margin: 0px*@ip5;
                }
                input::-webkit-input-placeholder{
                    font-size: 14px*@ip5;
                }
                
            }
            .all-out{
                text-align: right;
                color:#7a7f99;
                font-size: 14px*@ip5;
                border-bottom: solid 1px*@ip5 #12121a;
                padding: 10px*@ip5 0;
                padding-right: 20px*@ip5;
            }
            .confirm-btn{
                width: 90%;
                margin: 0 auto;
                background: #ffd400;
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                border-radius: 100px*@ip5;
                text-align: center;
                margin-top: 20px*@ip5;
                margin-bottom: 20px*@ip5;
            }
            .line{
                background: #1b1b26;
                height: 10px*@ip5;
            }
            .tips{
                padding: 10px*@ip5 20px*@ip5;
                font-size: 14px*@ip5;
                ul{
                    padding: 0px*@ip5;
                    .tips-title{
                        color: #ffd400;
                    }
                    li{
                        color: #7a7f99;
                        list-style: none;
                        line-height: 25px*@ip5;
                    }
                }
            }
        }
        .tips-box{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 9999;
            width: 80%;
            border-radius: 10px*@ip5;
            background: #242633;
            color:#ccd5ff;
            .tips-title{
                text-align: center;
                height: 50px*@ip5;
                line-height: 50px*@ip5;
                border-bottom: solid 1px*@ip5 #1b1b26;
                img{
                    position: absolute;
                    right: 0;
                    width: 35px*@ip5;
                }
            }
            .tips-content{
                color:#fff;
                height: 80px*@ip5;
                justify-content: center;
                align-items: center;
                font-size: 14px*@ip5;
                text-align: center;
            }
            .tips-btn{
                display: flex;
                justify-content: space-around;
                align-items: center;
                height: 50px*@ip5;
                border-top: solid 5px*@ip5 #1b1b26;
                span{
                    width: 50%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }

}
</style>
