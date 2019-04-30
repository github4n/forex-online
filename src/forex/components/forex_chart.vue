<template>
    <div id="chart-box">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div class="chart-option">
            <!-- <div class="chart-option-item chart-option-btn">
                <span @tap="chooseFloat(3)">
                    指标
                    <span class="triangle"></span>
                </span>
                <div class="float-box" v-show="selectIndex == 3">
                    <div class="float-box-item">指标</div>
                    <div class="float-box-item">移动均线</div>
                    <div class="float-box-item">线性回归</div>
                </div>
            </div> -->
            <div class="chart-option-item chart-option-right">
                <div class="chart-option-btn">
                    <span class="btn-box" @tap.stop="chooseFloat(1)">
                        {{currentChartType.name}}
                        <span class="triangle"></span>
                    </span>
                    <!-- <div class="scroll-box"> -->
                        <div class="mui-scroll-wrapper" v-show="selectIndex == 1">
                            <div class="mui-scroll">
                                <div class="float-box-item" @tap="chooseOption(1,item)" v-for="(item,index) in chartTypeList" :key="index">{{item.name}}</div>
                            </div>
                        </div>
                    <!-- </div> -->
                </div>
                <div class="chart-option-btn">
                    <span class="btn-box" @tap.stop="chooseFloat(2)">
                        {{currentChartValue.name}}
                        <span class="triangle"></span>
                    </span>
                    <div class="float-box" v-show="selectIndex == 2">
                        <div class="float-box-item" @tap="chooseOption(2,item)" v-for="(item,index) in chartValueList" :key="index">{{item.name}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="chart-main">
            <!-- <fens-chart
                :chartHistoryData="chartHistoryData" 
                :lastData="lastData" 
                :currentCommodityData="currentChartData" 
                :chartInfo="chartInfo"
                :buyOrSell="chartInfo.isSellChart"
            ></fens-chart> -->
            <component :is="chartInfo.type == 1?'fensChart':'klineChart'"
                :chartHistoryData="chartHistoryData" 
                :lastData="lastData" 
                :currentCommodityData="currentChartData" 
                :chartInfo="chartInfo"
                :buyOrSell="chartInfo.isSellChart"
            ></component>
            <div class="no-choose" v-show="!currentChartData">
                请选择一项行情查看图表
            </div>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex';
import fensChart from './chart/fensChart';
import klineChart from './chart/klineChart';
export default {
    components:{
        fensChart,
        klineChart
    },
    data(){
        return{
            selectIndex:0,//0:都不选 1:分时图,2:买卖图 3.指标
            chartTypeList:[
                {
                    name:'分时图', //中文名称
                    type:1, //类型 1:分时 2.k线
                    period:'KLINE_UNKNOWN',
                },
                {
                    name:'日K',
                    type:2,
                    period:'KLINE_1DAY',
                },
                {
                    name:'1分k',
                    type:2,
                    period:'KLINE_1MIN',
                },
                {
                    name:'5分k',
                    type:2,
                    period:'KLINE_5MIN',
                },
                {
                    name:'15分k',
                    type:2,
                    period:'KLINE_15MIN',
                },
                {
                    name:'30分k',
                    type:2,
                    period:'KLINE_30MIN',
                },
                {
                    name:'12时k',
                    type:2,
                    period:'KLINE_12HR',
                },
            ],
            chartValueList:[
                {
                    name:'卖价图',
                    value:false,
                },
                {
                    name:'买价图',
                    value:true,
                },
            ],
            chartType:'fensChart', 
            // currentChartType:{
            //     name:'分时图',
            //     type:1,
            //     period:'KLINE_UNKNOWN',
            // },//当前选择的图表类型
            // currentChartValue:{
            //     name:'卖价图',
            //     value:false,
            // },//当前买价或卖价
            msgTips:'',//toast消息
        }
    },
    computed:{
        ...mapState('forex',[
            'currentChartData',
            'marketSocket',
            'chartInfo',
            'chartHistoryData',
            'lastData',
            'currentChartType',
            'currentChartValue',
        ])  
    },
    mounted(){
        mui.init();
		mui('.mui-scroll-wrapper').scroll();
        var _this = this;
        // window.addEventListener('click',function(e){
        //     _this.selectIndex = 0;
        // })
    },
    methods:{
        chooseFloat(index){
            if(this.selectIndex == index){
                this.selectIndex = 0;
            }else{
                this.selectIndex = index;
            }
        },
        //选择功能
        chooseOption(index,item){
            if(!this.currentChartData){
				this.msgTips = "请先选择行情";
                this.$refs.dialog.isShow = true;
                this.selectIndex = 0;
                return;
            }
            this.selectIndex = 0;
            if(index == 1){
                //图表类型
                // switch(item.type){
                //     case 1:
                //     this.chartType="fensChart";
                //     ;break;
                //     case 2:
                //     this.chartType="kLineChart";
                //     ;break;
                // }
                this.$store.state.forex.currentChartType = item;
                this.$store.state.forex.chartInfo.chartType = this.currentChartType.period;
                this.$store.state.forex.chartInfo.type = item.type;
            }else if(index == 2){
                //买卖价
                this.$store.state.forex.currentChartValue = item;
                this.$store.state.forex.chartInfo.isSellChart = this.currentChartValue.value;
            }else if(index == 3){
                //指标
            }
            var historyParams = {
                method:'req_history_data',
                req_id:'',
                data:{
                    contract_code:this.currentChartData.security_type + '_' + this.currentChartData.commodity_no,
                    period:this.chartInfo.chartType,
					count:100,
                    ask_or_bid:this.chartInfo.isSellChart
                }
            }
            this.marketSocket.send(JSON.stringify(historyParams));
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#chart-box{
    width: 100%;
    height: 100%;
    font-size: 14px;
    .chart-option{
        display: flex;
        align-items: center;
        border-top: solid 1px #17191e;
        border-bottom: solid 1px #17191e;
        justify-content: flex-end;
        padding: 10px 20px;
        font-size: 16px;
        height: 40px;
        .chart-option-item{
            .mui-scroll-wrapper{
                left: 50%;
                transform: translateX(-50%);
                top: 20px;
                overflow: hidden;
                height: 140px;
                background: #323442;
                color: #fff;
                border-radius: 5px;
                max-height: 140px;
                width: 100px;
                text-align: center;
                font-size: 14px;
            }
        }
        .chart-option-right{
            display: flex;
        }
        .chart-option-btn{
            color:#7e829c;
            position: relative;
            margin-right: 10px;
            .btn-box{
                position: relative;
                display: block;
                width: 65px;
                .triangle{
                    position: absolute;
                    border: solid 5px rgba(0,0,0,0);
                    border-top-color: #7e829c;
                    transform: rotate(-45deg);
                    bottom: 0px;
                    right: 0px;
                }
                .triangle-active{
                    border-top-color: #ffd400;
                }
            }
            .float-box{
                position: absolute;
                background: #323442;
                color: #fff;
                border-radius: 5px;
                overflow: auto;
                max-height: 140px;
                width: 100px;
                text-align: center; 
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                z-index: 999;
            }
            .float-box-item{
                border-bottom: solid 1px #17191e;    
                height: 35px;
                line-height: 35px;
            }
            .float-box-item:last-child{
                border: none;
            }
            .scroll-box{
                max-height: 140px;
                background: #323442;
                color: #fff;
                border-radius: 5px;
                width: 100px;
                text-align: center; 
                font-size: 14px;
            }
        }
    }
    .chart-main{
        height: calc(~"100% - 40px");
        position: relative;
        .chart-component{
            width: 100%;
            height: 100%;
        }
        .no-choose{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            color:#7e829c;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #chart-box{
        font-size: 14px*@ip5;
        .chart-option{
            border-top: solid 1px*@ip5 #17191e;
            border-bottom: solid 1px*@ip5 #17191e;
            padding: 10px*@ip5 20px*@ip5;
            font-size: 16px*@ip5;
            height: 40px*@ip5;
            .chart-option-item{
                .mui-scroll-wrapper{
                    top: 20px*@ip5;
                    height: 140px*@ip5;
                    border-radius: 5px*@ip5;
                    max-height: 140px*@ip5;
                    width: 100px*@ip5;
                    font-size: 14px*@ip5;
                }
            }
            .chart-option-btn{
                margin-right: 10px*@ip5;
                .btn-box{
                    width: 65px*@ip5;
                    .triangle{
                        border-width: 5px*@ip5;
                    }
                }
                .float-box{
                    border-radius: 5px*@ip5;
                    max-height: 140px*@ip5;
                    width: 100px*@ip5;
                    font-size: 14px*@ip5;
                }
                .float-box-item{
                    border-bottom-width: 1px*@ip5;
                    height: 35px*@ip5;
                    line-height: 35px*@ip5;
                }
                .scroll-box{
                    max-height: 140px*@ip5;
                    border-radius: 5px*@ip5;
                    width: 100px*@ip5;
                    font-size: 14px*@ip5;
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #chart-box{
        font-size: 14px*@ip6;
        .chart-option{
            border-top: solid 1px*@ip6 #17191e;
            border-bottom: solid 1px*@ip6 #17191e;
            padding: 10px*@ip6 20px*@ip6;
            font-size: 16px*@ip6;
            height: 40px*@ip6;
            .chart-option-item{
                .mui-scroll-wrapper{
                    top: 20px*@ip6;
                    height: 140px*@ip6;
                    border-radius: 5px*@ip6;
                    max-height: 140px*@ip6;
                    width: 100px*@ip6;
                    font-size: 14px*@ip6;
                }
            }
            .chart-option-btn{
                margin-right: 10px*@ip6;
                .btn-box{
                    width: 65px*@ip6;
                    .triangle{
                        border-width: 5px*@ip6;
                    }
                }
                .float-box{
                    border-radius: 5px*@ip6;
                    max-height: 140px*@ip6;
                    width: 100px*@ip6;
                    font-size: 14px*@ip6;
                }
                .float-box-item{
                    border-bottom-width: 1px*@ip6;
                    height: 35px*@ip6;
                    line-height: 35px*@ip6;
                }
                .scroll-box{
                    max-height: 140px*@ip6;
                    border-radius: 5px*@ip6;
                    width: 100px*@ip6;
                    font-size: 14px*@ip6;
                }
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
