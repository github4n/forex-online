<template>
    <div id="order">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div id="header-box">
            <header-bar>
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
                <span slot="otherIcon" @tap="goToSearch">
                    <img src="../../assets/img/forex/menu/menu_01.png" />
                </span>
            </header-bar>
        </div>
        <div class="order-info order-info-first">
            <div class="order-info-item border-bold">
                <span class="order-code order-value">{{currentCommodityData.commodity_no.split('.')[0]+currentCommodityData.commodity_no.split('.')[1]}}</span>
                <span class="order-value" :style="lastPrice-lastData[10]>0?{'color':colorUp}:{'color':colorDown}">{{lastPrice}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title">类型:</span>
                <span class="order-value" v-show="orderType!='改单'&&orderType!='更新'">{{orderType}}</span>
                <span class="order-value" v-show="orderType=='改单'||orderType=='更新'">{{saleCommodityObj.Direction==0?'买入':'卖出'}}</span>
            </div>
            <div class="order-info-item">
                <span class="order-title"><span v-show="$route.query.type==2">卖价</span><span v-show="$route.query.type==1">买价</span>汇率:</span>
                <span class="order-value" :style="lastPrice-lastData[10]>0?{'color':colorUp}:{'color':colorDown}">{{lastPrice}}</span>
            </div>
            <div class="order-info-item order-info-input">
                <span class="order-title">金额:</span>
                <span class="price-box">
                    <span class="price-unit">{{unit}}</span>
                    <span class="price-order" v-show="isChangeOrder">{{tradePrice}}</span>
                    <input class="price-input" @blur="priceChage(1)" @input="priceTimelyChange(1)" v-show="!isChangeOrder" type="number" v-model="tradePrice"/>
                    <span class="price-btn" v-show="!isChangeOrder" @tap="minus(1)">-</span>
                    <span class="price-btn" v-show="!isChangeOrder" @tap="add(1)">+</span>
                </span>
            </div>
            <div class="order-info-item border-bold">
                <span class="order-title">所需保证金:</span>
                <span class="order-value">{{unit}}{{tradeBond.toFixed(2)}}=<span v-show="!isAppLogin">$</span><span v-show="isAppLogin">￥</span>{{(tradeBond*USDRate*RMBRate).toFixed(currentCommodityData.dot_size)}}</span>
            </div>
        </div>
        <div class="order-title-info">
            <span :class="['order-title-text',isShowAddition1?'order-title-text-active':'']">
                止盈平仓
                <img @tap.stop="popInfo(1)" src="../../assets/img/forex/menu/menu_14.png"/>
            </span>
            <span :class="['order-radio',isShowAddition1?'order-radio-active':'']" @tap="expentAddition(1)">
                <img v-show="isShowAddition1" src="../../assets/img/forex/gou.png"/>
            </span>
        </div>
        <div class="order-info" v-show="isShowAddition1">
            <div class="order-info-item order-info-input">
                <span class="order-title">当价格为:</span>
                <span class="price-box">
                    <span class="price-unit">{{unit}}</span>
                    <input class="price-input" type="number" @blur="priceChage(2)" @input="priceTimelyChange(2)" v-model="profitOut"/>
                    <span class="price-btn" @tap="minus(2)">-</span>
                    <span class="price-btn" @tap="add(2)">+</span>
                </span>
            </div>
            <div class="order-info-item">
                <span class="order-title">获利:</span>
                <span class="order-value">${{profitPrice*USDRate | getTwoNum(2)}}<span :style="isChangeOrder?direction==0?(profitOut-this.saleCommodityObj.OpenPrice>=0?{'color':colorUp}:{'color':colorDown}):(this.saleCommodityObj.OpenPrice-profitOut>=0?{'color':colorUp}:{'color':colorDown}) :direction==0?(profitOut-lastPrice>=0?{'color':colorUp}:{'color':colorDown}):(lastPrice-profitOut>=0?{'color':colorUp}:{'color':colorDown})">{{isChangeOrder?direction==0?(profitOut-this.saleCommodityObj.OpenPrice)/lastPrice*100:(this.saleCommodityObj.OpenPrice-profitOut)/lastPrice*100 :direction==0?(profitOut-lastPrice)/lastPrice*100:(lastPrice-profitOut)/lastPrice*100 | getTwoNum(5)}}%</span></span>
            </div>
        </div>
        <div class="order-title-info">
            <span :class="['order-title-text',isShowAddition2?'order-title-text-active':'']">
                止损平仓
                <img @tap.stop="popInfo(2)" src="../../assets/img/forex/menu/menu_14.png"/>
            </span>
            <span :class="['order-radio',isShowAddition2?'order-radio-active':'']" @tap="expentAddition(2)">
                <img v-show="isShowAddition2" src="../../assets/img/forex/gou.png"/>
            </span>
        </div>
        <div class="order-info" v-show="isShowAddition2">
            <div class="order-info-item order-info-input">
                <span class="order-title">当价格为:</span>
                <span class="price-box">
                    <span class="price-unit">{{unit}}</span>
                    <input class="price-input" type="number" @blur="priceChage(3)" @input="priceTimelyChange(3)" v-model="lossOut"/>
                    <span class="price-btn" @tap="minus(3)">-</span>
                    <span class="price-btn" @tap="add(3)">+</span>
                </span>
            </div>
            <div class="order-info-item">
                <span class="order-title">亏损:</span>
                <span class="order-value">${{lossPrice*USDRate | getTwoNum(2)}}<span :style="isChangeOrder?direction==0?(lossOut-this.saleCommodityObj.OpenPrice>0?{'color':colorUp}:{'color':colorDown}):(this.saleCommodityObj.OpenPrice-lossOut>0?{'color':colorUp}:{'color':colorDown}) :direction==0?(lossOut-lastPrice>0?{'color':colorUp}:{'color':colorDown}):(lastPrice-lossOut>0?{'color':colorUp}:{'color':colorDown})">{{isChangeOrder?direction==0?(lossOut-this.saleCommodityObj.OpenPrice):(this.saleCommodityObj.OpenPrice-lossOut)/this.saleCommodityObj.OpenPrice :direction==0?(lossOut-lastPrice):(lastPrice-lossOut)/lastPrice | getTwoNum(5)}}%</span></span>
            </div>
        </div>
        <div class="order-title-info">
            <span :class="['order-title-text',isShowAddition3?'order-title-text-active':'']">
                动态止损
                <img @tap.stop="popInfo(3)" src="../../assets/img/forex/menu/menu_14.png"/>
            </span>
            <span :class="['order-radio',isShowAddition3?'order-radio-active':'']" @tap="expentAddition(3)">
                <img v-show="isShowAddition3" src="../../assets/img/forex/gou.png"/>
            </span>
        </div>
        <div class="order-info" v-show="isShowAddition3">
            <div class="order-info-item order-info-input">
                <span class="order-title">止损点差:</span>
                <span class="price-box">
                    <input class="price-input" type="number" @blur="priceChage(4)" @input="priceTimelyChange(4)" v-model="floatOut"/>
                    <span class="price-btn" @tap="minus(4)">-</span>
                    <span class="price-btn" @tap="add(4)">+</span>
                </span>
            </div>
            <div class="order-info-item">
                <span class="order-title">亏损:</span>
                <span class="order-value">${{floatPrice*USDRate | getTwoNum(2)}}<span :style="isChangeOrder?direction==0?floatPointPrice>this.saleCommodityObj.OpenPrice?{'color':colorUp}:{'color':colorDown}:this.saleCommodityObj.OpenPrice>floatPointPrice?{'color':colorUp}:{'color':colorDown} :direction==0?floatPointPrice>lastPrice?{'color':colorUp}:{'color':colorDown}:lastPrice>floatPointPrice?{'color':colorUp}:{'color':colorDown}">{{isChangeOrder?direction==0?(floatPointPrice-this.saleCommodityObj.OpenPrice):(this.saleCommodityObj.OpenPrice-floatPointPrice)/this.saleCommodityObj.OpenPrice :direction==0?(floatPointPrice-lastPrice):(lastPrice-floatPointPrice)/lastPrice | getTwoNum(5)}}%</span></span>
            </div>
        </div>
        <div class="order-title-info">
            <span :class="['order-title-text',isShowAddition4?'order-title-text-active':'']">
                按条件买入
                <img @tap.stop="popInfo(4)" src="../../assets/img/forex/menu/menu_14.png"/>
            </span>
            <span :class="['order-radio',isShowAddition4?'order-radio-active':'']" @tap="expentAddition(4)">
                <img v-show="isShowAddition4" src="../../assets/img/forex/gou.png"/>
            </span>
        </div>
        <div class="order-info" v-show="isShowAddition4">
            <div class="order-info-item order-info-input">
                <span class="order-title">当价格为:</span>
                <span class="price-box">
                    <span class="price-unit">{{unit}}</span>
                    <input class="price-input" type="number" @blur="priceChage(5)" @input="priceTimelyChange(5)" v-model="conditionOut"/>
                    <span class="price-btn" @tap="minus(5)">-</span>
                    <span class="price-btn" @tap="add(5)">+</span>
                </span>
            </div>
            <div class="order-info-item">
                <span class="order-title">对比当前汇率:</span>
                <span class="order-value" :style="direction==0?lastPrice<conditionOut?{'color':colorUp}:{'color':colorDown}:conditionOut<lastPrice?{'color':colorUp}:{'color':colorDown}">{{direction==0?(conditionOut-lastPrice)/lastPrice:(lastPrice-conditionOut)/lastPrice | getTwoNum(5)}}%</span>
            </div>
        </div>
        <div class="trade-btn-box">
            <span class="trade-btn" @tap="backBtn">取消</span>
            <span class="trade-btn trade-btn-type" @tap="orderConfirm" :style="{'background':orderType == '改单'||orderType == '更新'?'#4588e6':orderType=='卖出'?colorDown:colorUp}">{{orderType}}</span>
        </div>
        <popBox :isShowPop="isShowPop" :headText="popHead" :isShowOpenBtn="false">
            <span slot="content">
                <p class="pop-text">{{popContent}}</p>
            </span>
        </popBox>
        <popBox :isShowPop="isShowOrderPop" :headText="popHead" :isShowOpenBtn="false" :isShowComfirmBtn="true" :sendMethod="sendOrder">
            <span slot="content">
                <p class="pop-text pop-text-left"><span class="pop-order-color">外汇:</span>{{currentCommodityData.commodity_name}}</p>
                <p class="pop-text pop-text-left"><span class="pop-order-color">代码:</span>{{currentCommodityData.commodity_no}}</p>
                <p class="pop-text pop-text-left"><span class="pop-order-color">方向:</span>{{orderType}}</p>
                <p class="pop-text pop-text-left"><span class="pop-order-color">类型:</span>{{isShowAddition4?'限价':'市价'}}</p>
                <p v-show="isShowAddition4" class="pop-text pop-text-left"><span class="pop-order-color">限价价格:</span>{{conditionOut}}</p>
                <p class="pop-text pop-text-left"><span class="pop-order-color">金额:</span>{{tradePrice}}</p>
                <p v-show="isShowAddition1" class="pop-text pop-text-left"><span class="pop-order-color">止盈价:</span>{{profitOut}}</p>
                <p v-show="isShowAddition2" class="pop-text pop-text-left"><span class="pop-order-color">止损价:</span>{{lossOut}}</p>
                <p v-show="isShowAddition3" class="pop-text pop-text-left"><span class="pop-order-color">止损点差:</span>{{floatOut}}</p>
                <span class="pop-main-btn">
                    <span :class="['radio-box',isNoTip?'radio-box-active':'']" @tap="selectTip">
                        <img v-show="isNoTip" src="../../assets/img/forex/gou.png" />
                    </span>
                    <span>以后不再提醒</span>
                </span>
            </span>
        </popBox>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
import { setTimeout } from 'timers';
export default {
		components:{
			headerBar,
        },
        data(){
            return{
                headerTitle:"", //头部标题
                orderType:'',//交易类型
                isChangeOrder:false,
                isShowAddition1:false,//是否止盈平仓
                isShowAddition2:false,//是否止损平仓
                isShowAddition3:false,//是否动态止损
                isShowAddition4:false,//是否按条件买入
                isShowPop:false,//是否显示弹窗
                isShowOrderPop:false, //是否显示下单提示弹窗
                isNoTip:false,//是否打开不再提醒
                popHead:'',//弹窗头部文字
                popContent:'',//弹窗文字
                lastPrice:0,//最新价
                tradePrice:0,//下单金额
                contractNum:0,//合约乘数
                tradeBond:0,//所需保证金
                minHand:0.05,//最小手数
                level:0.005,//杠杆
                unit:'',//单位符号
                profitOut:0,//止盈平仓
                profitPrice:0,//止盈获利
                lossOut:0,//止损平仓
                lossPrice:0,//止损获利
                floatOut:0,//动态止损
                floatPointPrice:0,//动态点差
                floatPrice:0,//动态获利
                conditionOut:0,//按条件买入
                conditionPrice:0,//按条件获利
                msgTips:'',//toast消息
                RMBRate:7.1,//换人民币汇率 平台获取
                USDRate:1,//换美元汇率 实时变化
                direction:0,//方向
                isConfigure:true,//是否配置
                isSumbit:false,
            }
        },
        mounted(){
        },
        activated(){
            if(!this.currentCommodityData){
                this.$router.push({
                    path:'/forex_home'
                })
            }else{
                this.isShowAddition1 = false;
                this.isShowAddition2 = false;
                this.isShowAddition3 = false;
                this.isShowAddition4 = false;
                this.initTitle();
                this.initUnit();
                this.getTradeRuleData();
                this.getDirection();
            }
        },
        filters:{
            getTwoNum(value,size){
                return parseFloat(value).toFixed(size);
            }
        },
		computed:{
			...mapState([
				'colorUp',
				'colorDown',
			]),
            ...mapState('forex',[
                'lastData',
                'currentCommodityData',
                'forexCommodity',
                'isTradeLogin',
                'tradeSocket',
                'tipsMessage',
                'saleCommodityObj',
                'isAppLogin',
                'userInfo'
            ]),
            PATH() {
                return this.$store.getters.PATH;
            },
		},
        watch:{
            tipsMessage:function(){
                if(this.$route.name == 'forex_order'){
                    if(this.tipsMessage.type == 3&&!this.isChangeOrder){
                        var message = this.tipsMessage.message;
                        if(message.Status == 4){
                            var a = message.Direction==0?'买入':'卖出';
                            var b = `开仓成功(${this.currentCommodityData.commodity_name},市价,${a}${this.tradePrice}${this.unit})`;                            
                            this.$refs.dialog.isShow = false;
                            this.msgTips = b;
                            this.$refs.dialog.isShow = true;
                            setTimeout(function(){
                                this.isSumbit = false;
                                this.$router.push({
                                    path:'/forex_home'
                                })
                            }.bind(this),1500);
                        }else if(message.Status == 1||message.Status == 3){
                            this.isSumbit = false;
                            this.$refs.dialog.isShow = false;
                            this.msgTips = message.StatusMsg;
                            this.$refs.dialog.isShow = true;
                        }else if(message.Status == 2){
                            var a = message.Direction==0?'买入':'卖出';
                            var b = `挂单成功(${this.currentCommodityData.commodity_name},限价,${a}${this.tradePrice}${this.unit})`;
                            this.$refs.dialog.isShow = false;
                            this.msgTips = b;
                            this.$refs.dialog.isShow = true;
                            setTimeout(function(){
                                this.isSumbit = false;
                                this.$router.push({
                                    path:'/forex_home'
                                })
                            }.bind(this),1500);
                        }
                    }else if(this.tipsMessage.type == 2&&this.isChangeOrder){
                        var message = this.tipsMessage.message;
                        if(message.Code == 0){
                            this.$refs.dialog.isShow = false;
                            this.msgTips = '改单成功';
                            this.$refs.dialog.isShow = true;
                            setTimeout(function(){
                                this.isSumbit = false;
                                this.$router.push({
                                    path:'/forex_home'
                                })
                            }.bind(this),1500);
                        }else if(message.Code != 0){
                            this.isSumbit = false;
                            this.$refs.dialog.isShow = false;
                            this.msgTips = message.Message;
                            this.$refs.dialog.isShow = true;
                        }
                    }
                }
            },
            lastData:function(){
                if(this.$route.name=="forex_order"){
                    switch(this.$route.query.type){
                        case 1:this.lastPrice = this.lastData[13];break;
                        case 2:this.lastPrice = this.lastData[11];break;
                        case 3:
                            switch(this.saleCommodityObj.Direction){
                                case 0:this.lastPrice = this.lastData[13];break;
                                case 1:this.lastPrice = this.lastData[11];break;
                            }
                        ;break;
                    }
                    if(this.$route.query.type!=3){

                    }
                    if(this.isShowAddition1&&!this.saleCommodityObj.StopprofitPrice){
                        if(this.isChangeOrder){
                            // if(this.direction==0&&this.profitOut<this.saleCommodityObj.OpenPrice){
                            //     this.profitOut = this.saleCommodityObj.OpenPrice;
                            // }
                            // if(this.direction==1&&this.profitOut>this.saleCommodityObj.OpenPrice){
                            //     this.profitOut = this.saleCommodityObj.OpenPrice;
                            // }
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.saleCommodityObj.OpenPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }else{
                            // if(this.direction==0&&this.profitOut<this.lastPrice){
                            //     this.profitOut = this.lastPrice;
                            // }
                            // if(this.direction==1&&this.profitOut>this.lastPrice){
                            //     this.profitOut = this.lastPrice;
                            // }
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }
                    }else if(this.isShowAddition2&&!this.saleCommodityObj.StoplossPrice){
                        if(this.isChangeOrder){
                            // if(this.direction==0&&this.lossOut>this.this.saleCommodityObj.OpenPrice){
                            //     this.lossOut = this.this.saleCommodityObj.OpenPrice;
                            // }
                            // if(this.direction==1&&this.lossOut<this.this.saleCommodityObj.OpenPrice){
                            //     this.lossOut = this.this.saleCommodityObj.OpenPrice;
                            // }
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.saleCommodityObj.OpenPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }else{
                            // if(this.direction==0&&this.lossOut>this.lastPrice){
                            //     this.lossOut = this.lastPrice;
                            // }
                            // if(this.direction==1&&this.lossOut<this.lastPrice){
                            //     this.lossOut = this.lastPrice;
                            // }
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }
                    }else if(this.isShowAddition3){
                        if(this.isChangeOrder){
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.saleCommodityObj.OpenPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.saleCommodityObj.OpenPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.saleCommodityObj.OpenPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }else{
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.lastPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.lastPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }
                    }
                    else if(this.isShowAddition4){
                        if(this.isChangeOrder){
                            switch(this.direction){
                                case 0:this.conditionPrice = (this.conditionOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.conditionPrice = (this.saleCommodityObj.OpenPrice-this.conditionOut)*this.tradePrice;break;
                            }
                        }else{
                            switch(this.direction){
                                case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                            }
                        }
                    }
                    this.tradeBond = this.tradePrice*this.level;
                    this.getUSDRate();
                }
            }
        },
        methods:{
            getDirection(){
                if(this.$route.query.type == 1){
                    //卖
                    this.direction = 1;
                }else if(this.$route.query.type == 2){
                    //买
                    this.direction = 0;
                }else if(this.$route.query.type == 3){
                    //改单
                    if(this.saleCommodityObj.PriceType == 0){
                        this.saleCommodityObj.OpenPrice = this.saleCommodityObj.LimitPrice;
                    }
                    this.direction = this.saleCommodityObj.Direction;
                }
            },
            getTradeRuleData(){
                this.$http.post(this.PATH + '/commodity/tradeRules', {emulateJSON: true},{
                    params: {
                        commodityCode: this.currentCommodityData.commodity_no
                    },
                    timeout: 5000
                }).then(function(e){
                    var data = e.body;
                    if(data.success == true){
                        if(data.code == 1){
                            this.isConfigure = true;
                            this.minHand = data.data.miniTradableSize;
                            this.level = data.data.depositRatio;
                            if(this.isChangeOrder){
                                //改单
                                this.initChangeOrderPrice();
                            }else{
                                //平仓或买卖
                                this.initPrice();
                            }
                        }
                    }else{
                        this.isConfigure = false;
                        this.msgTips = data.message;
                        this.$refs.dialog.isShow = true;
                    }
                }.bind(this), function(){
                    this.msgTips = '连接服务器失败';
                    this.$refs.dialog.isShow = true;
                });
            },
            //换算单位
            initUnit(){
                switch(this.currentCommodityData.commodity_no.split('.')[0]){
                    case 'AUD':this.unit="A$";break;
                    case 'EUR':this.unit="€";break;
                    case 'GBP':this.unit="￡";break;
                    case 'USD':this.unit="$";break;
                    case 'CNH':this.unit="￥";break;
                    case 'HKD':this.unit="HK$";break;
                    case 'JPY':this.unit="¥";break;
                }
            },
            getUSDRate(){
                var no = this.currentCommodityData.commodity_no;
                var list = this.forexCommodity;
                var length = this.forexCommodity.length;
                if(no.split('.')[1]=='USD'){
                    //右置美元
                    this.USDRate = this.lastPrice;
                }else if(no.split('.')[0]=='USD'){
                    //左置美元
                    this.USDRate = 1;
                }else{
                    //不存在美元
                    for(var i=0;i<length;i++){
                        if(list[i].commodity_no.split('.')[0] == no.split('.')[0]&&list[i].commodity_no.split('.')[1]=='USD'){
                            switch(this.$route.query.type){
                                case 1:this.USDRate = list[i].quotaData[13];break;
                                case 2:this.USDRate = list[i].quotaData[11];break;
                            }
                        }
                    }
                }
            },
            //获取汇率
            initRate(){
                if(!localStorage.getItem('forexRate')){
                    if(this.isAppLogin){
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
                                    if(data.data){
                                        this.RMBRate = data.data.rate;
                                        localStorage.setItem('forexRate',data.data.rate);
                                    }
                                }
                            }else{
                                this.msgTips = data.message;
                                this.$refs.dialog.isShow = true;
                            }
                        }.bind(this), function(){
                            this.msgTips = '连接服务器失败';
                            this.$refs.dialog.isShow = true;
                        });
                    }else{
                        this.msgTips = '请登录平台账号获取更加准确的数据';
                        this.$refs.dialog.isShow = true;
                    }
                }else{
                    this.RMBRate = localStorage.getItem('forexRate');
                }
            },
            //初始化价格
            initPrice(){
                switch(this.$route.query.type){
                    case 1:this.lastPrice = this.lastData[13];break;
                    case 2:this.lastPrice = this.lastData[11];break;
                    case 3:
                        this.lastPrice = this.saleCommodityObj.Direction==0?this.lastData[11]:this.lastData[13];
                    ;break;
                }
                this.initRate();
                //计算合约乘数
                this.contractNum = (this.currentCommodityData.contract_size/this.currentCommodityData.mini_ticker_size).toFixed(2);
                //默认交易金额:最小交易手数*合约乘数
                this.tradePrice = this.minHand*this.contractNum;
                //默认金额的所需保证金
                this.tradeBond = this.tradePrice*this.level;
                //最小变动价
                this.minPrice = this.minHand/this.currentCommodityData.mini_ticker_size;
            },
            //初始化改单价格
            initChangeOrderPrice(){
                switch(this.saleCommodityObj.Direction){
                    case 0:this.lastPrice = this.lastData[13];break;
                    case 1:this.lastPrice = this.lastData[11];break;
                }
                this.initRate();
                //计算合约乘数
                this.contractNum = (this.currentCommodityData.contract_size/this.currentCommodityData.mini_ticker_size).toFixed(2);
                //交易金额:(交易手数-已平仓手数)*合约乘数
                var closeNum = 0; //已平仓手数
                if(this.saleCommodityObj.CloseParam&&this.saleCommodityObj.CloseParam.length>0){
                    var length = this.saleCommodityObj.CloseParam.length;
                    var closeParam = this.saleCommodityObj.CloseParam;
                    for(var i=0;i<length;i++){
                        closeNum += closeParam[i].CloseNum;
                    }
                }
                this.tradePrice = ((this.saleCommodityObj.Num-closeNum)*this.contractNum).toFixed(0);
                //默认金额的所需保证金
                this.tradeBond = this.tradePrice*this.level;
                //最小变动价
                this.minPrice = this.minHand/this.currentCommodityData.mini_ticker_size;
                if(this.saleCommodityObj.PriceType == 0&&this.saleCommodityObj.Status == 2){
                    //条件单
                    this.isShowAddition4 = true;
                    this.conditionOut = this.saleCommodityObj.LimitPrice;
                }
                if(this.saleCommodityObj.StoplossPrice != 0){
                    //止损价
                    this.isShowAddition2 = true;
                    this.lossOut = this.saleCommodityObj.StoplossPrice;
                }
                if(this.saleCommodityObj.StoplossDiff != 0){
                    //止损点差
                    this.isShowAddition3 = true;
                    this.floatOut = this.saleCommodityObj.StoplossDiff;
                }
                if(this.saleCommodityObj.StopprofitPrice != 0){
                    //止盈
                    this.isShowAddition1 = true;
                    this.profitOut = this.saleCommodityObj.StopprofitPrice;
                }
            },
            initTitle(){
                switch(this.$route.query.type){
                    case 1:this.headerTitle = '卖出 '+ this.$route.query.name;this.orderType = '卖出';this.isChangeOrder = false;return;
                    case 2:this.headerTitle = '买入 '+ this.$route.query.name;this.orderType = '买入';this.isChangeOrder = false;return;
                    case 3:
                        this.headerTitle = '仓位 '+ this.$route.query.name;
                        if(this.saleCommodityObj.Status == 2){
                            this.orderType = '改单';
                        }else{
                            this.orderType = '更新';
                        }
                        this.isChangeOrder = true;
                    return;
                }
            },
            //加数字
            add(index){
                switch(index){
                    case 1:
                        if(this.tradePrice == ''){
                            this.tradePrice = this.minPrice;
                        }else{
                            this.tradePrice = parseFloat(this.tradePrice)+parseFloat(this.minPrice);
                        }
                        this.tradeBond = this.tradePrice*this.level;
                        if(this.isShowAddition1){
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }else if(this.isShowAddition2){
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }else if(this.isShowAddition3){
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }else if(this.isShowAddition4){
                            switch(this.direction){
                                case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 2:
                        if(this.isChangeOrder){
                            if(this.profitOut == ''){
                                this.profitOut = this.saleCommodityObj.OpenPrice;
                            }
                            if(this.direction==0&&(parseFloat(this.profitOut)+parseFloat(this.currentCommodityData.mini_ticker_size))<this.saleCommodityObj.OpenPrice){
                                this.profitOut = this.saleCommodityObj.OpenPrice;
                            }else if(this.direction==1&&(parseFloat(this.profitOut)+parseFloat(this.currentCommodityData.mini_ticker_size))>this.saleCommodityObj.OpenPrice){
                                this.profitOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于当前价';
                            }else{
                                this.profitOut = (parseFloat(this.profitOut)+parseFloat(this.currentCommodityData.mini_ticker_size)).toFixed(this.currentCommodityData.dot_size);
                            }
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.saleCommodityObj.OpenPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }else{
                            if(this.profitOut == ''){
                                this.profitOut = this.lastPrice;
                            }
                            if(this.direction==0&&(parseFloat(this.profitOut)+parseFloat(this.currentCommodityData.mini_ticker_size))<this.lastPrice){
                                this.profitOut = this.lastPrice;
                            }else if(this.direction==1&&(parseFloat(this.profitOut)+parseFloat(this.currentCommodityData.mini_ticker_size))>this.lastPrice){
                                this.profitOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于当前价';
                            }else{
                                this.profitOut = (parseFloat(this.profitOut)+parseFloat(this.currentCommodityData.mini_ticker_size)).toFixed(this.currentCommodityData.dot_size);
                            }
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 3:
                        if(this.isChangeOrder){
                            if(this.lossOut == ''){
                                this.lossOut = this.saleCommodityObj.OpenPrice;
                            }
                            if(this.direction==0&&(parseFloat(this.lossOut)+parseFloat(this.currentCommodityData.mini_ticker_size))>this.saleCommodityObj.OpenPrice){
                                this.lossOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于开仓价';
                            }else if(this.direction==1&&(parseFloat(this.lossOut)+parseFloat(this.currentCommodityData.mini_ticker_size))<this.saleCommodityObj.OpenPrice){
                                this.lossOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需大于开仓价';
                            }else{
                                this.lossOut = (parseFloat(this.lossOut)+parseFloat(this.currentCommodityData.mini_ticker_size)).toFixed(this.currentCommodityData.dot_size);
                            }
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.saleCommodityObj.OpenPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }else{
                            if(this.lossOut == ''){
                                this.lossOut = this.lastPrice;
                            }
                            if(this.direction==0&&(parseFloat(this.lossOut)+parseFloat(this.currentCommodityData.mini_ticker_size))>this.lastPrice){
                                this.lossOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于当前价';
                            }else if(this.direction==1&&(parseFloat(this.lossOut)+parseFloat(this.currentCommodityData.mini_ticker_size))<this.lastPrice){
                                this.lossOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需大于当前价';
                            }else{
                                this.lossOut = (parseFloat(this.lossOut)+parseFloat(this.currentCommodityData.mini_ticker_size)).toFixed(this.currentCommodityData.dot_size);
                            }
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 4:
                        if(this.floatOut == ''){
                            this.floatOut = 0;
                        }
                        this.floatOut = parseFloat(this.floatOut) + 10;
                        if(this.isChangeOrder){
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.saleCommodityObj.OpenPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.saleCommodityObj.OpenPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.saleCommodityObj.OpenPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }else{
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.lastPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.lastPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 5:
                        if(this.conditionOut == ''){
                            this.conditionOut = this.lastPrice;
                        }else{
                            this.conditionOut = (parseFloat(this.conditionOut)+parseFloat(this.currentCommodityData.mini_ticker_size)).toFixed(this.currentCommodityData.dot_size);
                        }
                        switch(this.direction){
                            case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                        }
                    ;break;
                }
            },
            //减数字
            minus(index){
                switch(index){
                    case 1:
                        if(this.tradePrice == ''){
                            this.tradePrice = this.minPrice;
                        }else{
                            if(this.tradePrice - this.minPrice<this.minPrice){
                                this.tradePrice = this.minPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '已达到最小交易单位';
                            }else{
                                this.tradePrice = this.tradePrice - this.minPrice;
                            }
                        }
                        this.tradePrice = this.tradePrice.toFixed(0);
                        this.tradeBond = this.tradePrice*this.level;
                        if(this.isShowAddition1){
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }else if(this.isShowAddition2){
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }else if(this.isShowAddition3){
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }else if(this.isShowAddition4){
                            switch(this.direction){
                                case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 2:
                        if(this.isChangeOrder){
                            if(this.profitOut == ''){
                                this.profitOut = this.saleCommodityObj.OpenPrice;
                            }
                            if(this.direction==0&&(this.profitOut - this.currentCommodityData.mini_ticker_size)<this.saleCommodityObj.OpenPrice){
                                this.profitOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需大于开仓价';
                            }else if(this.direction==1&&(this.profitOut - this.currentCommodityData.mini_ticker_size)>this.saleCommodityObj.OpenPrice){
                                this.profitOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于开仓价';
                            }else{
                                if(this.profitOut - this.currentCommodityData.mini_ticker_size <= 0){
                                    this.profitOut = 0;
                                }else{
                                    this.profitOut = (this.profitOut - this.currentCommodityData.mini_ticker_size).toFixed(this.currentCommodityData.dot_size);
                                }
                            }
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.saleCommodityObj.OpenPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }else{
                            if(this.profitOut == ''){
                                this.profitOut = this.lastPrice;
                            }
                            if(this.direction==0&&(this.profitOut - this.currentCommodityData.mini_ticker_size)<this.lastPrice){
                                this.profitOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需大于当前价';
                            }else if(this.direction==1&&(this.profitOut - this.currentCommodityData.mini_ticker_size)>this.lastPrice){
                                this.profitOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于当前价';
                            }else{
                                if(this.profitOut - this.currentCommodityData.mini_ticker_size <= 0){
                                    this.profitOut = 0;
                                }else{
                                    this.profitOut = (this.profitOut - this.currentCommodityData.mini_ticker_size).toFixed(this.currentCommodityData.dot_size);
                                }
                            }
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 3:
                        if(this.isChangeOrder){
                            if(this.lossOut == ''){
                                this.lossOut = this.saleCommodityObj.OpenPrice;
                            }
                            if(this.direction==0&&(this.lossOut - this.currentCommodityData.mini_ticker_size)>this.saleCommodityObj.OpenPrice){
                                this.lossOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于开仓价';
                            }else if(this.direction==1&&(this.lossOut - this.currentCommodityData.mini_ticker_size)<this.saleCommodityObj.OpenPrice){
                                this.lossOut = this.saleCommodityObj.OpenPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需大于开仓价';
                            }else{
                                if(this.lossOut - this.currentCommodityData.mini_ticker_size <= 0){
                                    this.lossOut = 0;
                                }else{
                                    this.lossOut = (this.lossOut - this.currentCommodityData.mini_ticker_size).toFixed(this.currentCommodityData.dot_size);
                                }
                            }
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.saleCommodityObj.OpenPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }else{
                            if(this.lossOut == ''){
                                this.lossOut = this.lastPrice;
                            }
                            if(this.direction==0&&(this.lossOut - this.currentCommodityData.mini_ticker_size)>this.lastPrice){
                                this.lossOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需小于当前价';
                            }else if(this.direction==1&&(this.lossOut - this.currentCommodityData.mini_ticker_size)<this.lastPrice){
                                this.lossOut = this.lastPrice;
                                this.$refs.dialog.isShow = true;
                                this.msgTips = '设置的价格需大于当前价';
                            }else{
                                if(this.lossOut - this.currentCommodityData.mini_ticker_size <= 0){
                                    this.lossOut = 0;
                                }else{
                                    this.lossOut = (this.lossOut - this.currentCommodityData.mini_ticker_size).toFixed(this.currentCommodityData.dot_size);
                                }
                            }
                            switch(this.direction){
                                case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 4:
                        if(this.floatOut == ''){
                            this.floatOut = 0;
                        }
                        if(this.floatOut-10 <= 0){
                            this.floatOut = 10;
                        }else{
                            this.floatOut = this.floatOut - 10;
                        }
                        if(this.isChangeOrder){
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.saleCommodityObj.OpenPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.saleCommodityObj.OpenPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.saleCommodityObj.OpenPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }else{
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.lastPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.lastPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }
                    ;break;
                    case 5:
                        if(this.conditionOut == ''){
                            this.conditionOut = this.lastPrice;
                        }
                        if(this.conditionOut - this.currentCommodityData.mini_ticker_size <= 0){
                            this.conditionOut = 0;
                        }else{
                            this.conditionOut = (this.conditionOut - this.currentCommodityData.mini_ticker_size).toFixed(this.currentCommodityData.dot_size);
                        }
                        switch(this.direction){
                            case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                        }
                    ;break;
                }
            },
            priceTimelyChange(index){
                if(index == 1){
                    if(this.tradePrice == ''){
                        // this.tradePrice = 0;
                    }
                }else if(index == 2){
                    if(this.profitOut == ''){
                        // this.profitOut = 0;
                    }
                }else if(index == 3){
                    if(this.lossOut == ''){
                        // this.lossOut = 0;
                    }
                }else if(index == 4){
                    if(this.floatOut == ''){
                        // this.floatOut = 0;
                    }
                }else if(index == 5){
                    if(this.conditionOut == ''){
                        // this.conditionOut = 0;
                    }
                }
            },
            //价格变化时候
            priceChage(index){
                if(index == 1){
                    //交易金额
                    this.tradePrice = this.tradePrice - this.tradePrice%this.minPrice;
                    if(this.tradePrice<this.minPrice){
                        this.tradePrice = this.minPrice;
                    }
                    this.tradePrice = this.tradePrice.toFixed(0);
                    this.tradeBond = this.tradePrice*this.level;
                    if(this.isShowAddition1){
                        switch(this.direction){
                            case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                        }
                    }else if(this.isShowAddition2){
                        switch(this.direction){
                            case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                        }
                    }else if(this.isShowAddition3){
                        switch(this.direction){
                            case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                            case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                        }
                    }else if(this.isShowAddition4){
                        switch(this.direction){
                            case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                        }
                    }
                }else if(index == 2){
                    //止盈平仓
                    if(this.isChangeOrder){
                        if(this.direction == 0&&this.profitOut<this.saleCommodityObj.OpenPrice){
                            this.profitOut = this.saleCommodityObj.OpenPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需大于开仓价';
                            return;
                        }
                        if(this.direction == 1&&this.profitOut>this.saleCommodityObj.OpenPrice){
                            this.profitOut = this.saleCommodityObj.OpenPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需小于开仓价';
                            return;
                        }
                        switch(this.direction){
                            case 0:this.profitPrice = (this.profitOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                            case 1:this.profitPrice = (this.saleCommodityObj.OpenPrice-this.profitOut)*this.tradePrice;break;
                        }
                    }else{
                        if(this.direction == 0&&this.profitOut<this.lastPrice){
                            this.profitOut = this.lastPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需大于当前价';
                            return;
                        }
                        if(this.direction == 1&&this.profitOut>this.lastPrice){
                            this.profitOut = this.lastPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需小于当前价';
                            return;
                        }
                        switch(this.direction){
                            case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                        }
                    }
                }else if(index == 3){
                    //止损平仓
                    if(this.isChangeOrder){
                        if(this.direction == 0&&this.lossOut>this.saleCommodityObj.OpenPrice){
                            this.lossOut = this.saleCommodityObj.OpenPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需小于开仓价';
                            return;
                        }
                        if(this.direction == 1&&this.lossOut<this.saleCommodityObj.OpenPrice){
                            this.lossOut = this.saleCommodityObj.OpenPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需大于开仓价';
                            return;
                        }
                        switch(this.direction){
                            case 0:this.lossPrice = (this.lossOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                            case 1:this.lossPrice = (this.saleCommodityObj.OpenPrice-this.lossOut)*this.tradePrice;break;
                        }
                    }else{
                        if(this.direction == 0&&this.lossOut>this.lastPrice){
                            this.lossOut = this.lastPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需小于当前价';
                            return;
                        }
                        if(this.direction == 1&&this.lossOut<this.lastPrice){
                            this.lossOut = this.lastPrice;
                            this.$refs.dialog.isShow = true;
                            this.msgTips = '设置的价格需大于当前价';
                            return;
                        }
                        switch(this.direction){
                            case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                        }
                    }
                }else if(index == 4){
                    //动态止损
                    if(this.isChangeOrder){
                        switch(this.direction){
                            case 0:this.floatPointPrice = this.saleCommodityObj.OpenPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            case 1:this.floatPointPrice = this.saleCommodityObj.OpenPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                        }
                        switch(this.direction){
                            case 0:this.floatPrice = (this.floatPointPrice-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                            case 1:this.floatPrice = (this.saleCommodityObj.OpenPrice-this.floatPointPrice)*this.tradePrice;break;
                        }
                    }else{
                        switch(this.direction){
                            case 0:this.floatPointPrice = this.lastPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            case 1:this.floatPointPrice = this.lastPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                        }
                        switch(this.direction){
                            case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                            case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                        }
                    }
                }else if(index == 5){
                    //按条件买入
                    switch(this.direction){
                        case 0:this.conditionPrice = (this.conditionOut-this.lastPrice)*this.tradePrice;break;
                        case 1:this.conditionPrice = (this.lastPrice-this.conditionOut)*this.tradePrice;break;
                    }
                }
            },
            //选择其他条件
            expentAddition(index){
                switch(index){
                    case 1:this.isShowAddition1 = !this.isShowAddition1;
                        if(this.isChangeOrder){
                            this.profitOut = this.saleCommodityObj.OpenPrice;
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.saleCommodityObj.OpenPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }else{
                            this.profitOut = this.lastPrice
                            switch(this.direction){
                                case 0:this.profitPrice = (this.profitOut-this.lastPrice)*this.tradePrice;break;
                                case 1:this.profitPrice = (this.lastPrice-this.profitOut)*this.tradePrice;break;
                            }
                        }
                    ;return;
                    case 2:this.isShowAddition2 = !this.isShowAddition2;
                    if(this.isChangeOrder){
                        this.lossOut = this.saleCommodityObj.OpenPrice;
                        switch(this.direction){
                            case 0:this.lossPrice = (this.lossOut-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                            case 1:this.lossPrice = (this.saleCommodityObj.OpenPrice-this.lossOut)*this.tradePrice;break;
                        }
                    }else{
                        this.lossOut = this.lastPrice;
                        switch(this.direction){
                            case 0:this.lossPrice = (this.lossOut-this.lastPrice)*this.tradePrice;break;
                            case 1:this.lossPrice = (this.lastPrice-this.lossOut)*this.tradePrice;break;
                        }
                    }
                    ;return;
                    case 3:
                        this.isShowAddition3 = !this.isShowAddition3;
                        this.floatOut = this.currentCommodityData.contract_size*10;
                        if(this.isChangeOrder){
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.saleCommodityObj.OpenPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.saleCommodityObj.OpenPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.saleCommodityObj.OpenPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.saleCommodityObj.OpenPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }else{
                            switch(this.direction){
                                case 0:this.floatPointPrice = this.lastPrice-this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                                case 1:this.floatPointPrice = this.lastPrice+this.floatOut*this.currentCommodityData.mini_ticker_size;break;
                            }
                            switch(this.direction){
                                case 0:this.floatPrice = (this.floatPointPrice-this.lastPrice)*this.tradePrice;break;
                                case 1:this.floatPrice = (this.lastPrice-this.floatPointPrice)*this.tradePrice;break;
                            }
                        }
                    return;
                    case 4:
                        if(this.$route.query.type == 1||this.$route.query.type == 2){
                            this.isShowAddition4 = !this.isShowAddition4;
                            this.conditionOut = this.lastPrice;
                        }else if(this.$route.query.type == 3){
                            //改仓
                            this.msgTips = '无法修改此仓位的条件单';
                            this.$refs.dialog.isShow = true;
                        }
                    return;
                }
            },
            //弹窗信息
            popInfo(index){
                switch(index){
                    case 1: this.popHead = '止盈平仓';this.popContent='勾选后将开启止盈平仓，当您的仓位盈利达到您设定的价格时则进行自动平仓。';break;
                    case 2: this.popHead = '止损平仓';this.popContent='勾选后将开启止损平仓，当您的仓位亏损达到您设定的价格时则进行自动平仓。';break;
                    case 3: this.popHead = '动态止损';this.popContent='勾选后将开启动态止损平仓，当您的仓位亏损达到您设定的止损点差时则进行自动平仓。止损点差算法为卖价-买价*合约乘数*10，一般为10~100，即0.00010~0.00100；';break;
                    case 4: this.popHead = '按条件买入';this.popContent='勾选后将开启条件下单，当该货币对的买入/卖出价达到您设定的数值时，将会自动进行下单。';break;
                }
                this.isShowPop = true;
            },
            //是否不再提醒
            selectTip(){
                this.isNoTip = !this.isNoTip;
            },
            //确认下单
            orderConfirm(){
                if(this.isSumbit){
                    return;
                }
                if(!this.isTradeLogin){
                    this.$refs.dialog.isShow = true;
                    this.msgTips = '请先登录交易账号';
                    return;
                }
                if(!this.isConfigure){
                    this.msgTips = '请先配置此外汇';
                    this.$refs.dialog.isShow = true;
                    return;
                }
                if(!this.isChangeOrder){
                    //开仓
                    if(this.isShowAddition1){
                        //止盈
                        if(this.direction == 0){
                            //买入
                            if(this.profitOut<this.lastPrice){
                                this.msgTips = '止盈价不能低于最新价';
                                this.$refs.dialog.isShow = true;
                                console.log(1);
                                return;
                            }
                        }else if(this.direction == 1){
                            //卖出
                            if(this.profitOut>this.lastPrice){
                                this.msgTips = '止盈价不能高于最新价';
                                this.$refs.dialog.isShow = true;
                                return;
                            }
                        }
                    }
                }
                if((this.isAppLogin&&localStorage.getItem('isNoTip'))||this.isChangeOrder){
                    this.sendOrder();
                }else{
                    this.popHead = '确定进行交易下单？';
                    this.isShowOrderPop = true;
                }
            },
            //发送订单
            sendOrder(){
                if(!localStorage.getItem('isNoTip')){
                    if(this.isNoTip){
                        localStorage.setItem('isNoTip',true);
                    }
                };
                this.isSumbit = true;
                if(this.$route.query.type == 1||this.$route.query.type == 2){
                    var direction = '';
                    switch(this.$route.query.type){
                        case 1:direction=1;break;
                        case 2:direction=0;break;
                    };
                    var orderParams = {
                        LiteOrderRef:'',
                        CommodityType:3,
                        CommodityNo:this.currentCommodityData.commodity_no,
                        Direction:direction,
                        Num:this.tradePrice/this.contractNum,
                        PriceType:1,
                        LimitPrice:0,
                        Remark:'市价开仓',
                        StopprofitPrice:0,
                        StoplossPrice:0,
                        StoplossDiff:0,
                    }
                    if(this.isShowAddition1){
                        //止盈
                        orderParams.StopprofitPrice = parseFloat(this.profitOut);
                    }
                    if(this.isShowAddition2){
                        //止损
                        orderParams.StoplossPrice = parseFloat(this.lossOut);
                    }
                    if(this.isShowAddition3){
                        //点差止损
                        orderParams.StoplossDiff = parseFloat(this.floatOut);
                    }
                    if(this.isShowAddition4){
                        //条件单
                        orderParams.Remark = '限价开仓';
                        orderParams.PriceType = 0;
                        orderParams.LimitPrice = parseFloat(this.conditionOut);
                    }
                    var orderParam = {
                        Method:'OpenLiteOrder',
                        Parameters:orderParams
                    }
                    this.tradeSocket.send(JSON.stringify(orderParam));
                }else if(this.$route.query.type == 3){
                    var orderParams = {
                        LiteOrderID:this.saleCommodityObj.LiteOrderID,
                        StopprofitPrice:0,
                        StoplossPrice:0,
                        StoplossDiff:0,
                    }
                    if(this.isShowAddition1){
                        //止盈
                        orderParams.StopprofitPrice = parseFloat(this.profitOut);
                    }
                    if(this.isShowAddition2){
                        //止损
                        orderParams.StoplossPrice = parseFloat(this.lossOut);
                    }
                    if(this.isShowAddition3){
                        //点差止损
                        orderParams.StoplossDiff = parseFloat(this.floatOut);
                    }
                    if(this.saleCommodityObj.PriceType==0&&this.isShowAddition4){
                        //条件单
                        orderParams.LimitPrice = parseFloat(this.conditionOut);
                    }
                    var orderParam = {
                        Method:'ModifyLiteOrder',
                        Parameters:orderParams,
                    }
                    this.tradeSocket.send(JSON.stringify(orderParam));
                }
            },
            //返回按钮
            backBtn(){
                this.$router.go(-1);
            },
            //跳转搜索页
            goToSearch(){
                this.$router.push({
                    path:'/forex_search'
                })
            }
        },
        beforeRouteLeave(to,from,next){
            if(to.name == 'forex_home'){
                this.isShowAddition1 = false;
                this.isShowAddition2 = false;
                this.isShowAddition3 = false;
                this.isShowAddition4 = false;
            }
            next();
        }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#order{
    font-size: 14px;
    padding-bottom: 60px;
    padding-top: 51px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .order-info{
        .order-info-item{
            padding: 10px 20px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: solid 1px #17191e;
            background: #20212a;
            .order-title{
                color:#7e829c;
            }
            .order-code{
                font-size: 16px;
            }
            .order-value{
                color:#fff;
                span{
                    margin-left: 5px;
                }
            }
            .price-box{
                display: flex;
                align-items: center;
                .price-unit{
                    color:#7e829c;
                    margin-right: 5px;
                }
                .price-order{
                    color:#fff;
                }
                .price-input{
                    background: #17191e;
                    color: #fff;
                    margin: 0;
                    padding: 0;
                    border: 0;
                    height: 30px;
                    width: 120px;
                    border: none;
                    padding-left: 5px; 
                    font-size: 14px;
                }
                .cancelStyle{
                    background: inherit;
                }
                .price-btn{
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    color:#7e829c;
                    background: #323442;
                    margin-left: 10px;
                    font-size: 24px;
                }
            }
        }
        .border-bold{
            border-bottom: solid 15px #17191e;
            box-sizing: content-box;
        }
        .order-info-input{
            height: 50px;
        }
    }
    .order-title-info{
        border-bottom: solid 1px #17191e;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #20212a;
        .order-title-text{
            color:#757a93;
            img{
                width: 15px;
                margin-left: 10px;
            }
        }
        .order-title-text-active{
            color:#fff;
        }
        .order-radio{
            width: 20px;
            height: 20px;
            border: solid 1px #7e829c;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            img{
                width: 90%;
            }
        }
        .order-radio-active{
            border-color: #ffd400;
        }
    }
    .trade-btn-box{
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;
        background: #20212a;
        position: fixed;
        bottom: 0;
        width: 100%;
        .trade-btn{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 48%;
            background: #323442;
            color:#7a7f99;
            font-weight: bold;
            font-size: 16px;
            height: 40px;
        }
        .trade-btn-type{
            color:#fff;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #order{
        font-size: 14px*@ip5;
        padding-bottom: 60px*@ip5;
        padding-top: 51px*@ip5;
        .order-info{
            .order-info-item{
                padding: 10px*@ip5 20px*@ip5;
                height: 40px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                .order-code{
                    font-size: 16px*@ip5;
                }
                .order-value{
                    span{
                        margin-left: 5px*@ip5;
                    }
                }
                .price-box{
                    .price-unit{
                        margin-right: 5px*@ip5;
                    }
                    .price-input{
                        height: 30px*@ip5;
                        width: 120px*@ip5;
                        padding-left: 5px*@ip5; 
                        font-size: 14px*@ip5;
                    }
                    .price-btn{
                        width: 30px*@ip5;
                        height: 30px*@ip5;
                        line-height: 30px*@ip5;
                        margin-left: 10px*@ip5;
                        font-size: 24px*@ip5;
                    }
                }
            }
            .border-bold{
                border-bottom: solid 15px*@ip5 #17191e;
            }
            .order-info-input{
                height: 50px*@ip5;
            }
        }
        .order-title-info{
            border-bottom: solid 1px*@ip5 #17191e;
            padding: 10px*@ip5 20px*@ip5;
            .order-title-text{
                img{
                    width: 15px*@ip5;
                    margin-left: 10px*@ip5;
                }
            }
            .order-radio{
                width: 20px*@ip5;
                height: 20px*@ip5;
                border-radius: 5px*@ip5;
            }
        }
        .trade-btn-box{
            padding: 10px*@ip5 20px*@ip5;
            .trade-btn{
                height: 40px*@ip5;
                font-size: 16px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #order{
        font-size: 14px*@ip6;
        padding-bottom: 60px*@ip6;
        padding-top: 51px*@ip6;
        .order-info-first{
            border-bottom: solid 9px*@ip6 #17191e;
        }
        .order-info{
            .order-info-item{
                padding: 10px*@ip6 20px*@ip6;
                height: 40px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                .order-code{
                    font-size: 16px*@ip6;
                }
                .order-value{
                    span{
                        margin-left: 5px*@ip6;
                    }
                }
                .price-box{
                    .price-unit{
                        margin-right: 5px*@ip6;
                    }
                    .price-input{
                        height: 30px*@ip6;
                        width: 120px*@ip6;
                        padding-left: 5px*@ip6; 
                        font-size: 14px*@ip6;
                    }
                    .price-btn{
                        width: 30px*@ip6;
                        height: 30px*@ip6;
                        line-height: 30px*@ip6;
                        margin-left: 10px*@ip6;
                        font-size: 24px*@ip6;
                    }
                }
            }
            .border-bold{
                border-bottom: solid 15px*@ip6 #17191e;
            }
            .order-info-input{
                height: 50px*@ip6;
            }
        }
        .order-title-info{
            border-bottom: solid 1px*@ip6 #17191e;
            padding: 10px*@ip6 20px*@ip6;
            .order-title-text{
                img{
                    width: 15px*@ip6;
                    margin-left: 10px*@ip6;
                }
            }
            .order-radio{
                width: 20px*@ip6;
                height: 20px*@ip6;
                border-radius: 5px*@ip6;
            }
        }
        .trade-btn-box{
            padding: 10px*@ip6 20px*@ip6;
            .trade-btn{
                height: 40px*@ip6;
                font-size: 16px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
