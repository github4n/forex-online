<template>
    <div id="search">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
		<div id="header-box">
			<header-bar :showBack="true" :showMenu="false">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
			</header-bar>
		</div>
        <div class="search-box">
            <div class="search-content">
                <img src="../../assets/img/forex/search.png" />
                <input class="search-input" type="text" @input="searchChange" v-model="keyword" placeholder="请输入搜索内容"/>
            </div>
        </div>
        <div class="result-list">
            <div class="result-item" v-for="(item,index) in searchResult" :key="index" @tap="chooseResult(item)">
                <div class="item-name">{{item.commodityName}}</div>
                <div class="item-code">{{item.commodityNo}}</div>
            </div>
            <div class="no-result" v-show="keyword.trim()!=''&&searchResult.length==0">没有找到相关合约</div>
        </div>
        <div class="search-other" v-show="hotSearch.length>0&&searchResult.length==0">
            <div class="other-title">
                近期热门搜索
            </div>
            <div class="hot-list">
                <div class="hot-item" v-for="(item,index) in hotSearch" :key="index" @tap="chooseResult(item)">
                    {{item.commodityName}}
                </div>
            </div>
        </div>
        <div class="search-other" v-show="searchHistory.length>0&&keyword.trim()==''">
            <div class="other-title">
                历史搜索
            </div>
            <div class="history-list">
                <div class="history-item" v-for="(item,index) in searchHistory" :key="index" @tap="chooseResult(item)">
                    <span>{{item.commodityName}}</span>
                    <img src="../../assets/img/forex/close.png" @tap.stop="delHistory(item,index)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
import { setTimeout, clearTimeout } from 'timers';
export default {
    components:{
        headerBar
    },
    data(){
        return{
            headerTitle:'搜索',
            //热门搜索
            hotSearch:[
                {
                    name:'加元日元',
                },
                {
                    name:'加元日元',
                },
                {
                    name:'加元日元',
                },
            ],
            keyword:'', //搜素关键字
            //搜索结果
            searchResult:[],
             //搜素历史 
            searchHistory:[],
            msgTips:'',//toast消息
            allCommodityList:[],//所有合约列表
            timeIntTime:null,
        }
    },
    computed:{
        ...mapState('forex',[
            'forexCommodity',
            'marketSocket',
            'chartInfo'
        ]),
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        this.getAllForexData();
        this.getHotSearch();
        if(localStorage.getItem('forexHistoryList')){
            this.searchHistory = JSON.parse(localStorage.getItem('forexHistoryList'));
        }else{
            this.searchHistory = [];
        }
    },
    methods:{
        //获取所有外汇数据
        getAllForexData(){
            var quatoList = this.forexCommodity;
            var quatoLength = this.forexCommodity.length;
            var allList = [];
            for(var i=0;i<quatoLength;i++){
                var obj={};
                obj.commodityName = quatoList[i].commodity_name;
                obj.commodityCode = quatoList[i].commodity_no;
                allList.push(obj);
            }
            this.allCommodityList = allList;
        },
        //获取热门搜索
        getHotSearch(){
			this.$http.post(this.PATH + '/commodity/hotSearch', {emulateJSON: true}, {
                params:{
                    businessType:100
                },
				timeout: 5000
			}).then(function(res) {
                var data = res.body;
                if(data.code == 1){
                    this.hotSearch = data.data.slice(0,6);
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
			}.bind(this), function(e) {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //搜索查询
        searchChange(){
            var _this = this;
            var list = this.allCommodityList;
            var length = this.allCommodityList.length;
            clearTimeout(this.timeIntTime);
            if(_this.keyword.trim() != ''){
                this.timeIntTime = setTimeout(function(){
                    _this.searchResult = [];
                    for(var i=0;i<length;i++){
                        if(list[i].commodityName.indexOf(_this.keyword) != -1||list[i].commodityCode.indexOf(_this.keyword.toUpperCase()) != -1){
                            _this.searchResult.push(list[i]);
                        }
                    }
                },200);
            }else{
                _this.searchResult = [];
            }
        },
        //选择结果合约
        chooseResult(item){
            var length = this.forexCommodity.length;
            if(length==0){
                this.msgTips = '暂无行情,无法选择进行查看';
                this.$refs.dialog.isShow = true;
                return;
            }
            this.saveSearch(item);
            var list = this.forexCommodity; //所有外汇行情数据
            for(var i=0;i<length;i++){
                if(list[i].commodity_no == item.commodityCode){
                    this.$store.state.forex.lastData = list[i].quotaData;
                    this.$store.state.forex.currentCommodityData = list[i];
                    this.$store.state.forex.currentChartData = list[i];
                    var historyParams = {
                        method:'req_history_data',
                        req_id:'',
                        data:{
                            contract_code:list[i].security_type + '_' + list[i].commodity_no,
                            period:this.chartInfo.chartType,
                            count:100,
                            ask_or_bid:this.chartInfo.isSellChart
                        }
                    }
                    this.marketSocket.send(JSON.stringify(historyParams));
                    break;
                }
            }
            if(localStorage.getItem('forexHistoryList')){
                var historyList = JSON.parse(localStorage.getItem('forexHistoryList'));
            }else{
                var historyList = [];
            }
            if(historyList.length > 0){
                var length = historyList.length;
                for(var i=0;i<length;i++){
                    if(historyList[i].commodityCode == item.commodityCode){
                        historyList.splice(i,1);
                        break;
                    }
                }
            }
            historyList.unshift(item);
            if(historyList.length > 8){
                historyList = historyList.slice(0,8);
            }
            localStorage.setItem('forexHistoryList',JSON.stringify(historyList));
            this.$router.push({
                path:'/forex_detail',
                query:{
                    name:item.commodityName,
                }
            })
        },
        //调用接口保存搜索
        saveSearch(item){
			this.$http.post(this.PATH + '/commodity/addSearch', {emulateJSON: true}, {
                params:{
                    commodityName:item.commodityName,
                    commodityCode:item.commodityCode,
                    exchangeCode:'',
                    securityType:'C',
                    businessType:100
                },
				timeout: 5000
			}).then(function(res) {
                var data = res.body;
                if(data.code == 1){

                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
			}.bind(this), function(e) {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        },
        //删除历史
        delHistory(item,index){
            this.searchHistory.splice(index,1);
            localStorage.setItem('forexHistoryList',JSON.stringify(this.searchHistory));
        }
    },
    beforeRouteLeave(to, from,next){
        this.keyword = '';
        this.searchResult = [];
        this.searchHistory = [];
        next();

    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#search{
    font-size: 14px;
    padding-top: 50px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .search-box{
        padding: 10px 20px;
        background: #20212a;
        width: 100%;
        border-bottom: solid 10px #17191e;
        .search-content{
            display: flex;
            align-items: center;
            background: #17191e;
            height: 40px;
            padding: 0 10px;
            border-radius: 5px;
            img{
                width: 20px;
            }
            .search-input{
                background: none;
                border: none;
                height: 100%;
                margin: 0;
                padding-left: 10px;
                color: #fff;
                font-size: 14px;
                width: 100;
            }
        }
    }
    .result-list{
        .result-item{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            background: #20212a;
            .item-name{
                color:#fff;
            }
            .item-code{
                color:#7a7f99;
            }
        }
        .no-result{
            text-align: center;
            color: #7e829c;
            padding: 40px 0;
        }
    }
    .search-other{
        background: #20212a;
        border-bottom: solid 10px #17191e;
        .other-title{
            padding: 10px 20px;
            color:#7a7f99;
            border-bottom: solid 1px #17191e;
        }
        .history-list{
            .history-item{
                padding: 10px 20px;
                color:#fff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: solid 1px #17191e;
                img{
                    width: 10px;
                }
            }
        }
        .hot-list{
            display: flex;
            flex-wrap: wrap;
            .hot-item{
                padding: 10px 0px;
                text-align: center;
                color:#fff;
                width: 33%;
                border-right: solid 1px #17191e;
                border-bottom: solid 1px #17191e;
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #search{
        font-size: 14px*@ip5;
        padding-top: 50px*@ip5;
        .search-box{
            padding: 10px*@ip5 20px*@ip5;
            border-bottom: solid 10px*@ip5 #17191e;
            .search-content{
                height: 40px*@ip5;
                padding: 0 10px*@ip5;
                border-radius: 5px*@ip5;
                .search-input{
                    padding-left: 10px*@ip5;
                    font-size: 14px*@ip5;
                }
            }
        }
        .result-list{
            .result-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .no-result{
                padding: 40px*@ip5 0;
            }
        }
        .search-other{
            border-bottom: solid 10px*@ip5 #17191e;
            .other-title{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
            }
            .history-list{
                .history-item{
                    padding: 10px*@ip5 20px*@ip5;
                    border-bottom: solid 1px*@ip5 #17191e;
                    img{
                        width: 10px*@ip5;
                    }
                }
            }
            .hot-list{
                .hot-item{
                    padding: 10px*@ip5 0px*@ip5;
                    width: 33%;
                    border-right: solid 1px*@ip5 #17191e;
                    border-bottom: solid 1px*@ip5 #17191e;
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #search{
        font-size: 14px*@ip6;
        padding-top: 50px*@ip6;
        .search-box{
            padding: 10px*@ip6 20px*@ip6;
            border-bottom: solid 10px*@ip6 #17191e;
            .search-content{
                height: 40px*@ip6;
                padding: 0 10px*@ip6;
                border-radius: 5px*@ip6;
                .search-input{
                    padding-left: 10px*@ip6;
                    font-size: 14px*@ip6;
                }
            }
        }
        .result-list{
            .result-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .no-result{
                padding: 40px*@ip6 0;
            }
        }
        .search-other{
            border-bottom: solid 10px*@ip6 #17191e;
            .other-title{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
            }
            .history-list{
                .history-item{
                    padding: 10px*@ip6 20px*@ip6;
                    border-bottom: solid 1px*@ip6 #17191e;
                    img{
                        width: 10px*@ip6;
                    }
                }
            }
            .hot-list{
                .hot-item{
                    padding: 10px*@ip6 0px*@ip6;
                    width: 33%;
                    border-right: solid 1px*@ip6 #17191e;
                    border-bottom: solid 1px*@ip6 #17191e;
                }
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
