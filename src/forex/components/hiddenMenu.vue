<template>
    <div id="menu-hidden">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <loading v-show="isLoad"></loading>
        <div class="menu-title" v-if="isTradeLogin">交易账号:{{tradeConfig.ClientNo}}</div>
        <div class="menu-title" v-if="!isTradeLogin">交易账号未登录</div>
        <div class="menu-list">
            <ul>
                <li class="menu-item" v-show="isTradeLogin?!item.isHiddenAfterLogin:!item.needLogin" @tap.stop="chooseMenu(item)" v-for="(item,index) in menuList" :key="index">
                    <img class="item-icon" :src="item.img" />
                    <span class="item-title">{{item.title}}</span>
                    <span v-if="item.number!=-1">(
                        <span v-show="item.title=='持仓'">{{positionNum}}</span>
                        <span v-show="item.title=='挂单'">{{waitNum}}</span>
                    )</span>
                    <span class="item-btn" v-if="item.btn">
                        <div id="mySwitch" :class="isQuickTrade==0?'mui-active':''" class="mui-switch mui-switch-mini" @tap="switchBtn">
                            <div class="mui-switch-handle"></div>
                        </div>
                    </span>
                </li>
            </ul>
        </div>
        <div class="menu-info" v-show="isTradeLogin">
            <ul>
                <li class="menu-info-item" v-show="isAppLogin">
                    <img src="../../assets/img/forex/menu/menu_14.png" @tap="popInfo(0)"/>
                    <span class="info-title">净值</span>
                    <span class="info-value" :style="{'color':totalBalance-(bottomInfo.initBond)>=0?totalBalance-bottomInfo.initBond==0?'#fff':colorUp:colorDown}">{{bottomInfo.totalBalance.toFixed(2)}}</span>
                </li>
                <li class="menu-info-item">
                    <img src="../../assets/img/forex/menu/menu_14.png" @tap="popInfo(1)"/>
                    <span class="info-title">持仓盈亏</span>
                    <span class="info-value" :style="{'color':totalProfit>=0?totalProfit==0?'#fff':colorUp:colorDown}">{{totalProfit.toFixed(2)}}</span>
                </li>
                <li class="menu-info-item" v-show="isAppLogin">
                    <img src="../../assets/img/forex/menu/menu_14.png" @tap="popInfo(2)"/>
                    <span class="info-title">余额</span>
                    <span class="info-value">{{(bottomInfo.balance-bottomInfo.positionPrice).toFixed(2)}}</span>
                </li>
                <li class="menu-info-item">
                    <img src="../../assets/img/forex/menu/menu_14.png" @tap="popInfo(3)"/>
                    <span class="info-title">亏损平仓线</span>
                    <span class="info-value">{{tradeForceLine}}</span>
                </li>
            </ul>
        </div>
        <!-- <popBox :isShowPop="isShowInfoPop" :headText="infoPopHead" :isShowOpenBtn="false">
            <span slot="content">
                <p class="pop-text">{{popContent}}</p>
            </span>
        </popBox>
        <popBox :isShowPop="isShowPop" :isSelectQuick="isSelectQuick" :headText="popHead" :isShowOpenBtn="true">
            <span slot="content">
                <p class="pop-text">开启后下单操作将不进行确认提示，请谨慎选择，注意风险</p>
                <span class="pop-main-btn">
                    <span :class="['radio-box',isSelectQuick?'radio-box-active':'']" @tap="selectQuick">
                        <img v-show="isSelectQuick" src="../../assets/img/forex/gou.png" />
                    </span>
                    <span>同意</span>
                    <span class="pop-agree" @tap="goToDiscribe">《快捷交易协议》</span>
                </span>
            </span>
        </popBox> -->
    </div>
</template>

<script>
import {mapState} from 'vuex';
export default {
    data(){
        return{
            menuList:[
                {
                    img:require('../../assets/img/forex/menu/menu_01.png'), //图标
                    title:'搜索', //文字
                    number:-1, //是否有数字显示
                    btn:false, //是否有按钮
                    path:'/forex_search', //是否跳转页面
                    needLogin:false, //是否需要登录交易
                },
                {
                    img:require('../../assets/img/forex/menu/menu_02.png'),
                    title:'持仓',
                    number:0,
                    btn:false,
                    path:'/forex_position',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_03.png'),
                    title:'挂单',
                    number:0,
                    btn:false,
                    path:'/forex_wait',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_04.png'),
                    title:'快速交易',
                    number:-1,
                    btn:true,
                    path:'',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_05.png'),
                    title:'资金详情',
                    number:-1,
                    btn:false,
                    path:'/forex_fund',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_06.png'),
                    title:'成交记录',
                    number:-1,
                    btn:false,
                    path:'/forex_history',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_07.png'),
                    title:'开户详情',
                    number:-1,
                    btn:false,
                    path:false,
                    method:'goToTradeDetail',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_08.png'),
                    title:'追加保证金',
                    number:-1,
                    btn:false,
                    path:false,
                    method:'goToAddMoney',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_09.png'),
                    title:'提取盈利',
                    number:-1,
                    btn:false,
                    path:false,
                    method:'goToProfit',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_10.png'),
                    title:'快速结算',
                    number:-1,
                    btn:false,
                    path:false,
                    method:'quickEnd',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_11.png'),
                    title:'新开户申请',
                    number:-1,
                    btn:false,
                    path:'/tradeapply',
                    query:{
                        type:1
                    },
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_12.png'),
                    title:'切换账号',
                    number:-1,
                    btn:false,
                    path:'/forex_login',
                    needLogin:true,
                },
                {
                    img:require('../../assets/img/forex/menu/menu_13.png'),
                    title:'退出登录',
                    number:-1,
                    btn:false,
                    path:false,
                    method:'loginOut',
                    needLogin:true,
                },
                // {
                //     img:require('../../assets/img/forex/menu/menu_13.png'),
                //     title:'立即登录',
                //     number:-1,
                //     btn:false,
                //     path:'/forex_login',
                //     needLogin:false,
                //     isHiddenAfterLogin:true,
                // },
                {
                    img:require('../../assets/img/forex/menu/exchange.png'),
                    title:'立即交易',
                    number:-1,
                    btn:false,
                    path:'/tradeapply',
                    query:{
                        type:1
                    },
                    needLogin:false,
                    isHiddenAfterLogin:true,
                },
            ],
            popHead:'是否开启快捷交易?',
            // isShowPop:false,
            // isSelectQuick:false, 
            msgTips:'',//toast消息
            positionNum:0, //持仓数量
            waitNum:0,//挂单数量
            currentAccount:{},//当前登录的方案信息
            // popContent:'',//说明框的内容
            // infoPopHead:'',//说明框头部
            // isShowInfoPop:'',//说明框是否显示
            RMBRate:7.1,//人民币汇率
            isLoad:false,//数据加载
            totalBalance:0,//净值
            totalProfit:0,//盈亏
        }
    },
    mounted(){
        mui.init();
		mui('.mui-scroll-wrapper').scroll();
        if(this.isAppLogin&&this.isTradeLogin){
            this.getAllList();
        }
        if(this.forexOrderList.length == 0){
            this.positionNum = 0;
            this.waitNum = 0;
        }else{
            if(this.isTradeLogin){
                this.initNum();
            }
        }
    },
    activated(){
        // this.getBalance();
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
        ...mapState('forex',[
            'isTradeLogin',
            'isQuickTrade',
            'forexOrderList',
            'tradeConfig',
            'tradeSocket',
            'forexCommodity',
            'userInfo',
            'isAppLogin',
            'tradeForceLine',
            'tipsMessage',
            'bottomInfo',
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    watch:{
        isTradeLogin:function(){
            if(this.isTradeLogin){
                this.getAllList();
            }
        },
        forexOrderList:function(){
            var list = this.forexOrderList;
            var length = this.forexOrderList.length;
            var positionNum = 0;
            var waitNum = 0;
            for(var i=0;i<length;i++){
                if(list[i].Status == 4||list[i].Status == 7){
                    //已开仓
                    positionNum++;
                }else if(list[i].Status == 2){
                    //挂单
                    waitNum++;
                }
            };
            this.positionNum = positionNum;
            this.waitNum = waitNum;
        },
        forexCommodity:function(){
            if(this.isTradeLogin&&(this.$route.name == 'forex_home'||this.$route.name == 'forex_position'||this.$route.name == 'forex_fund')){
                this.getTotalData();
            }
        },
    },
    methods:{
        switchBtn(){
            if(this.isTradeLogin&&this.isAppLogin){
                if(this.isQuickTrade == 0){
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
                            "onOff": 1
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
                        }
                    }.bind(this), function(e) {
                        this.$parent.msgTips = '连接服务器失败';
                        this.$parent.$refs.dialog.isShow = true;
                    }.bind(this));
                }else{
                    this.$parent.isShowPop = !this.$parent.isShowPop;
                }
            }else{
                this.$parent.msgTips = "请先登录平台账号";
                this.$parent.$refs.dialog.isShow = true;
            }
        },
        //统计持仓数和挂单数
        initNum(){
            var list = this.forexOrderList;
            var length = this.forexOrderList.length;
            var positionNum = 0;
            var waitNum = 0;
            for(var i=0;i<length;i++){
                if(list[i].Status == 4||list[i].Status == 7){
                    //已开仓
                    positionNum++;
                }else if(list[i].Status == 2){
                    //挂单
                    waitNum++;
                }
            };
            this.positionNum = positionNum;
            this.waitNum = waitNum;
        },
        //获取底部信息
        getTotalData(){
            if(this.isTradeLogin){
                var commodityList = this.forexCommodity;
                var length = this.forexCommodity.length;
                var totalProfit = 0;
                for(var i=0;i<length;i++){
                    if(commodityList[i].positionList&&commodityList[i].positionList.length>0){
                        //如果存在持仓的话
                        var positionLength = commodityList[i].positionList.length;
                        for(var j=0;j<positionLength;j++){
                            if(commodityList[i].positionList[j].Status == 4){
                                var contractNum = (commodityList[i].contract_size/commodityList[i].mini_ticker_size).toFixed(2);
                                var lastRate = 1;
                                switch(commodityList[i].positionList[j].Direction){
                                    case 0:
                                        var profit = (commodityList[i].quotaData[13]-commodityList[i].positionList[j].OpenPrice)*(commodityList[i].positionList[j].Num*contractNum);
                                        lastRate = commodityList[i].quotaData[13];
                                        break;
                                    case 1:
                                        var profit = (commodityList[i].positionList[j].OpenPrice-commodityList[i].quotaData[11])*(commodityList[i].positionList[j].Num*contractNum);
                                        lastRate = commodityList[i].quotaData[11];
                                        break;
                                }
                                var USDRate = 1;
                                if(commodityList[i].commodity_no.split('.')[1]=='USD'){
                                    //右置美元
                                    USDRate = 1;
                                }else if(commodityList[i].commodity_no.split('.')[0]=='USD'){
                                    //左置美元
                                    USDRate = 1/lastRate;
                                }else{
                                    //不存在美元
                                    for(var z=0;z<this.forexCommodity.length;z++){
                                        if(this.forexCommodity[z].commodity_no.split('.')[1] == commodityList[i].commodity_no.split('.')[1]&&commodityList[i].commodity_no.split('.')[0]=='USD'){
                                            switch(commodityList[z].positionList[j].Direction){
                                                case 0:USDRate = 1/this.forexCommodity[z].quotaData[13];break;
                                                case 1:USDRate = 1/this.forexCommodity[z].quotaData[11];break;
                                            }
                                        }
                                    }
                                }
                                var toRMB = profit*USDRate;
                                totalProfit = parseFloat(totalProfit) + parseFloat(toRMB); //计算总盈利
                            }
                        }
                    }else{
                    }
                    
                }
                this.totalProfit = totalProfit;
                this.$store.state.forex.bottomInfo.balance = parseFloat(this.bottomInfo.initBond) + parseFloat(this.bottomInfo.appendBond);
                this.totalBalance = this.bottomInfo.initBond + this.bottomInfo.appendBond + totalProfit;
                this.$store.state.forex.bottomInfo.totalBalance = this.totalBalance;
                this.$store.state.forex.totalProfit = this.totalProfit;
            }
        },
        //获取余额
        getBalance(){
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
                    if(data.success == true&&data.code == 1){
                        this.RMBRate = data.data.rate;
                    }else{
                        this.$parent.msgTips = data.message;
                        this.$parent.$refs.dialog.isShow = true;
                    }
                }.bind(this), function(){
                    this.$parent.msgTips = "连接服务器失败";
                    this.$parent.$refs.dialog.isShow = true;
                });
            }
        },
        //弹窗信息
        popInfo(index){
            switch(index){
                case 0: this.$parent.infoPopHead = '净值';this.$parent.popContent='余额+所有当前持仓的合计盈亏。';break;
                case 1: this.$parent.infoPopHead = '盈亏';this.$parent.popContent='盈利+损失+隔夜费*天数。';break;
                case 2: this.$parent.infoPopHead = '余额';this.$parent.popContent='可用于新开仓的资金';break;
                case 3: this.$parent.infoPopHead = '亏损平仓线';this.$parent.popContent='要持仓，可用的账户净值必须超过亏损平仓线的金额，如果该金额条件未被满足，仓位可能会被强行平仓。';break;
            }
            this.$parent.isShowInfoPop = true;
        },
        //选择菜单
        chooseMenu(item){
            if(item.path != false){
                if(item.path == 'tradeapply'){
                    this.$store.state.openPage = 1;
                }
                this.$router.push({
                    path:item.path,
                    query:item.query
                });
                mui('.mui-off-canvas-wrap').offCanvas().close();
            }else if(item.method != false&&item.method != undefined){
                this[item.method]();
            }
        },
        //跳去追加保证金页面
        goToAddMoney(){
            if(this.isTradeLogin&&this.isAppLogin){
                this.$router.push({
                    path:'/forex_addMoney',
                    query:{
                        id:this.currentAccount.id
                    }
                })
            }else{
                this.$parent.msgTips = "请先登录平台账号";
                this.$parent.$refs.dialog.isShow = true;
            }
        },
        //用于判断是否可进入盈利提取页面
        goToProfit(){
            if(this.isAppLogin){
                this.$http.post(this.PATH + '/user/ftrade/qryProfit', {emulateJSON: true}, {
                    headers: {
                        'token': this.userInfo.token,
                        'secret': this.userInfo.secret
                    },
                    params: {
                        id: this.currentAccount.id
                    },
                    timeout: 5000
                }).then(function(e) {
                    var data = e.body;
                    if(data.code == 1) {
                        this.$router.push({
                            path:'/profitOut',
                            query:{
                                profit:data.data,
                                id:this.currentAccount.id
                            }
                        });
                    } else {
                        this.$parent.msgTips = data.message;
                        this.$parent.$refs.dialog.isShow = true;
                    }
                }.bind(this), function() {
                    this.$parent.msgTips = '连接服务器失败';
                    this.$parent.$refs.dialog.isShow = true;
                }.bind(this));
            }else{
                this.$parent.msgTips = '请先登录平台账号';
                this.$parent.$refs.dialog.isShow = true;
            }
        },
        //获取所有的方案找出当前登录的方案
        getAllList(){
            if(this.isTradeLogin&&this.isAppLogin){
                this.$http.post(this.PATH + '/user/ftrade/list', {emulateJSON: true}, {
                    headers: {
                        'token': this.userInfo.token,
                        'secret': this.userInfo.secret
                    },
                    params:{
                        businessType:100,

                    },
                    timeout: 5000
                }).then(function(e) {
                    var data = e.body;
                    if(data.code == 1) {
                        var accountList = data.data.tradeList;
                        for(var i=0;i<accountList.length;i++){
                            if(accountList[i].tranAccount == this.tradeConfig.ClientNo){
                                this.currentAccount = accountList[i];
                                this.$store.state.forex.bottomInfo.initBond = accountList[i].traderTotal;
                                this.$store.state.forex.bottomInfo.appendBond = accountList[i].appendTraderBond;
                                break;
                            }
                        }
                        this.getTotalData();
                    } else {
                        this.$parent.msgTips = data.message;
                        this.$parent.$refs.dialog.isShow = true;
                    }
                }.bind(this), function() {
                    this.$parent.msgTips = '连接服务器失败';
                    this.$parent.$refs.dialog.isShow = true;
                }.bind(this));
            }
        },
        //快速结算
        quickEnd(){
            if(this.isTradeLogin&&this.isAppLogin){
                this.isLoad = true;
                this.$http.post(this.PATH + '/user/ftrade/endtrade', {emulateJSON: true}, {
                    headers: {
                        'token': this.userInfo.token,
                        'secret': this.userInfo.secret
                    },
                    params: {
                        "id": this.currentAccount.id,
                        "businessType": 100
                    },
                    timeout: 5000
                }).then(function(e) {
                    var data = e.body;
                    this.isLoad = false;
                    if(data.success == true) {
                        if(data.code == 1){
                            if(data.data == 6){
                                this.msgTips = '结算成功';
                                this.$refs.dialog.isShow = true;
                                if(this.currentAccount.tranAccount == this.tradeConfig.ClientNo){
                                    this.$store.state.forex.isTradeLogin = false;
                                    this.tradeSocket.close();
                                    this.$store.state.forex.tradeSocket = null;
                                    var list = this.forexCommodity;
                                    var length = this.forexCommodity.length;
                                    for(var i=0;i<length;i++){
                                        list[i].positionList = null;
                                    }
                                    this.$store.state.forex.forexCommodity = list.slice(0);
                                }
                                setTimeout(function(){
                                    this.$router.replace({
                                        path: '/forex_tradeDetail',
                                        query:{
                                            type:6,
                                            id:this.currentAccount.id,
                                            end:1
                                        }
                                    });
                                }.bind(this), 1000);
                            }else{
                                this.$parent.msgTips = '申请成功';
                                this.$parent.$refs.dialog.isShow = true;
                                setTimeout(function(){
                                    this.$router.replace({
                                        path: '/historyTradeApply',
                                        query:{
                                            type:1
                                        }
                                    });
                                }.bind(this), 1000);
                            }
                        }
                    }else{
                        this.$parent.msgTips = data.message;
                        this.$parent.$refs.dialog.isShow = true;
                    }
                }.bind(this), function() {
                    this.$parent.msgTips = '连接服务器失败';
                    this.$parent.$refs.dialog.isShow = true;
                }.bind(this));
            }else{
                this.$parent.msgTips = '请先登录平台账号';
                this.$parent.$refs.dialog.isShow = true;
            }
        },
        //快速交易
        selectQuick(){
            if(this.isTradeLogin&&this.isAppLogin){
                this.$parent.isSelectQuick = !this.$parent.isSelectQuick;
            }else{
                this.$parent.msgTips = '请先登录平台账号';
                this.$parent.$refs.dialog.isShow = true;
            }
        },
        //跳转到介绍页 
        goToDiscribe(){
            this.$router.push({
                path:'/forex_discribe',
            })
        },
        //跳转开户详情
        goToTradeDetail(){
            if(!this.isAppLogin){
                this.$parent.msgTips = '请先登录平台账号';
                this.$parent.$refs.dialog.isShow = true;
                return;
            }
            if(this.isTradeLogin&&this.isAppLogin){
                this.$router.push({
                    path:'/forex_tradeDetail',
                    query:{
                        type: 4,
                        id: this.currentAccount.id,
                        businessType:100
                    }
                })
            }
        },
        //退出登录
        loginOut(){
            var loginOutParam = {
                Method:'Logout',
                Parameters:{
                    ClientNo: this.tradeConfig.ClientNo
                }
            };
            this.tradeSocket.send(JSON.stringify(loginOutParam));
        }
    }
}
</script>

<style scoped lang="less">
@import url("../../assets/css/main.less");
#menu-hidden{
    width: 100%;
    height: 100%;
    background: #20212a;
    color: #fff;
    font-size: 14px;
    overflow-x: hidden;
    overflow-y: auto;
    .menu-title{
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-bottom: solid 1px #17191e;
    }
    .menu-list{
        ul{
            margin: 0;
            padding: 0;
            .menu-item:first-child{
                border-bottom-width: 10px;
                box-sizing: content-box;
            }
            .menu-item:nth-child(10){
                border-bottom-width: 10px;
                box-sizing: content-box;
            }
            .menu-item{
                padding-left: 20px;
                list-style: none;
                border-bottom: solid 1px #17191e;
                height: 40px;
                line-height: 40px;
                position: relative;
                .item-icon{
                    width: 15px;
                    vertical-align: middle;
                    margin-right: 5px;
                }
                .item-title{
                    vertical-align: middle;
                }
                .item-btn{
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    right: 10%;
                    .mui-switch{
                        background: #17191e;
                        border-color: rgba(0,0,0,0);
                        .mui-switch-handle{
                            background: #525566;
                        }
                    }
                    .mui-active{
                        background: #323442;
                        .mui-switch-handle{
                            background: #ffd400;
                        }
                    }
                }
            }
        }
    }
    .menu-info{
        ul{
            margin: 0;
            padding: 0;
            .menu-info-item{
                position: relative;
                padding: 5px 20px;
                background: #2e334d;
                font-size: 13px;
                img{
                    width: 14px;
                    vertical-align: middle;
                    margin-right: 5px;
                }
                .info-title{
                    vertical-align: middle;
                    color: #7e829c;
                }
                .info-value{
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    right: 5%;
                }

            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #menu-hidden{
        font-size: 14px*@ip5;
        .menu-title{
            height: 40px*@ip5;
            line-height: 40px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
        }
        .menu-list{
            ul{
                .menu-item:first-child{
                    border-bottom-width: 10px*@ip5;
                }
                .menu-item:nth-child(10){
                    border-bottom-width: 10px*@ip5;
                }
                .menu-item{
                    padding-left: 20px*@ip5;
                    border-bottom: solid 1px*@ip5 #17191e;
                    height: 40px*@ip5;
                    line-height: 40px*@ip5;
                    .item-icon{
                        width: 15px*@ip5;
                        margin-right: 5px*@ip5;
                    }
                }
            }
        }
        .menu-info{
            ul{
                .menu-info-item{
                    padding: 5px*@ip5 20px*@ip5;
                    font-size: 13px*@ip5;
                    img{
                        width: 14px*@ip5;
                        margin-right: 5px*@ip5;
                    }
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #menu-hidden{
        font-size: 14px*@ip6;
        .menu-title{
            height: 40px*@ip6;
            line-height: 40px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
        }
        .menu-list{
            ul{
                .menu-item:first-child{
                    border-bottom-width: 10px*@ip6;
                }
                .menu-item:nth-child(10){
                    border-bottom-width: 10px*@ip6;
                }
                .menu-item{
                    padding-left: 20px*@ip6;
                    border-bottom: solid 1px*@ip6 #17191e;
                    height: 40px*@ip6;
                    line-height: 40px*@ip6;
                    .item-icon{
                        width: 15px*@ip6;
                        margin-right: 5px*@ip6;
                    }
                }
            }
        }
        .menu-info{
            ul{
                .menu-info-item{
                    padding: 5px*@ip6 20px*@ip6;
                    font-size: 13px*@ip6;
                    img{
                        width: 14px*@ip6;
                        margin-right: 5px*@ip6;
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