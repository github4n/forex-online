<template>
    <div id="fens">
        <loading v-show="isLoad"></loading>
        <div id="line-chart"></div>
        <div class="no-data" v-show="!chartHistoryData">
            该行情暂无历史数据
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
export default {
    props:{
        //历史数据
        chartHistoryData:{
            default:[],            
        },
        //最新行情
        lastData:{
            default:function(){
                return []
            },
        },
        //当前选择的行情
        currentCommodityData:{
            default:{},
        },
        //图表配置参数 1.分时图 2.k线图
        chartInfo:{
            default:{},
        },
        //买卖价
        buyOrSell:{
            default:false,
        },
    },
    data(){
        return{
            lineChart:null, //线性实例
            lineData:[], //线数据
            barData:[], //柱状数据
            timeData:[],//时间数据
            lineOption:{},//线配置
            barOption:{},//柱状配置
            lastTime:'',//最新时间
            isLoad:false,
        }
    },
    mounted(){
        this.lineChart = this.$echarts.init(document.getElementById('line-chart'));
        this.setLineOptions();
        this.drawChart();
        window.addEventListener('resize',function(e){
            this.lineChart.resize();
        }.bind(this))
    },
    computed:{
        ...mapState([
            'colorUp',
            'colorDown',
        ]),
    },
    watch:{
        currentCommodityData:function(){
            if(this.currentCommodityData == ''){
                console.log(1);
            }
        },
        lastData:function(n,o){
            if(this.currentCommodityData != ''&&this.lineData.length>0&&n[0]==o[0]&&(this.$route.name=='forex_home'||this.$route.name=='forex_position'||this.$route.name=='forex_detail')){
                if(this.currentCommodityData.commodity_no == this.lastData[0].split('_')[1]){
                    //如果最新数据为选择的数据
                    var prevTime = '';
                    prevTime = new Date(this.lastTime).getTime();
                    //最新时间
                    var _lastTime = this.lastData[1].split('.')[0].split(' ')[0] + ' ' + this.lastData[1].split('.')[0].split(' ')[1].split(':')[0] + ':' + this.lastData[1].split('.')[0].split(' ')[1].split(':')[1] + ':00';
                    _lastTime = _lastTime.replace(/-/g,'/');
                    var lastTime = new Date(_lastTime).getTime();
                    if(this.chartInfo.type == 1){
                        //分时图
                        if(lastTime - prevTime >= 60000){
                            //重新画点
                            var obj = [];
                            var barObj = [];
                            var a = this.lastData[1].split('.')[0].split(' ');
                            var b = a[1].split(':')[0]+':'+a[1].split(':')[1]+':00';
                            var time = a[0] + ' ' + b;
                            time = time.replace(/-/g,'/');
                            this.lastTime = time;
                            this.timeData.push(time);
                            switch(this.buyOrSell){
                                case false:
                                obj.push(time);
                                obj.push(this.lastData[11]);
                                break;
                                case true:
                                obj.push(time);
                                obj.push(this.lastData[13]);
                                break;
                            }
                            barObj.push(time);
                            barObj.push(0);
                            this.lineData.push(obj);
                            this.barData.push(barObj);
                            // this.lastTime = this.lastData[1];
                            //更新5分钟1小时范围价格
                            var obj2 = [];
                            obj2.push(time);
                            obj2.push(this.lastData[11]);
                            this.$store.state.forex.allDayPrice.push(obj2);
                            this.$store.state.forex.fiveMinPrice.push(obj2);
                            this.$store.state.forex.oneHourPrice.push(obj2);
                        }else{
                            //直接修改
                            var lastPrice = 0;
                            switch(this.buyOrSell){
                                case false:
                                lastPrice = this.lastData[11];
                                break;
                                case true:
                                lastPrice = this.lastData[13];
                                break;
                            }
                            this.lineData[this.lineData.length - 1][1] = lastPrice;
                            this.barData[this.barData.length - 1][1] = 0;
                            this.$store.state.forex.fiveMinPrice[this.$store.state.forex.fiveMinPrice.length - 1][1]=this.lastData[11];
                            this.$store.state.forex.oneHourPrice[this.$store.state.forex.oneHourPrice.length - 1][1]=this.lastData[11];
                            this.$store.state.forex.allDayPrice[this.$store.state.forex.allDayPrice.length - 1][1]=this.lastData[11];
                        }
                        this.drawChart2();
                    }
                }
            }
        },
        chartHistoryData:function(){
            this.lastTime = '';
            if(this.chartHistoryData&&this.lineChart){
                //历史数据
                var historyList = this.chartHistoryData;
                var historyLength = this.chartHistoryData.length;
                var listData = []; //暂存线性值
                var timeData = []; //暂存柱状值
                var barData = []; //暂存柱状数据
                if(this.chartInfo.type == 1){
                    //分时图
                    for(var i=0;i<historyLength;i++){
                        var obj = [];
                        var barObj = [];
                        var time = historyList[i][0].replace(/-/g,'/');
                        timeData.push(time);
                        obj.push(time);
                        obj.push(historyList[i][3]);
                        listData.push(obj);
                        barObj.push(time);
                        barObj.push(historyList[i][5])
                        barData.push(barObj);
                    }
                }
                this.timeData = timeData; //时间数据
                this.lastTime = this.timeData[this.timeData.length - 1];
                this.lineData = listData; //线数据
                if(this.chartInfo.chartType == 'KLINE_UNKNOWN'&&!this.chartInfo.isSellChart){
                    this.$store.state.forex.fiveMinPrice = this.lineData.slice(-5);
                    this.$store.state.forex.oneHourPrice = this.lineData.slice(-60);
                    this.$store.state.forex.allDayPrice = this.lineData.slice(0);
                }
                this.barData = barData;//柱状数据
                if(this.chartInfo.type == 1){
                    this.drawChart2();
                }
            }
        }
    },
    methods:{
        drawChart(){
            this.lineChart.setOption(this.lineOption);
        },
        drawChart2(){
            this.lineChart.setOption({
                xAxis:[
                    {
                        data:this.timeData,
                    },
                    {
                        data:this.timeData,
                    },
                ],
                series:[
                    {
                        name:this.currentCommodityData.commodity_name,
                        data:this.lineData,
                    },
                    {
                        name:this.currentCommodityData.commodity_name,
                        data:this.barData,
                    }
                ]
            });
        },
        //设置分时图配置
        setLineOptions(){
            var options = {
                grid:[
                    {
                        left: '5%',
                        right: '5%',
                        height: '90%',
                        top: '5%',
                    },
                    {
                        left: '12%',
                        right: '5%',
                        top: '80%',
                        height: '10%'
                    }
                ],
                animation:false,
                xAxis:[
                    {
                        type:'category',
                        data:this.timeData,
                        show:false,
                    },
                    {
                        type:'category',
                        gridIndex: 1,
                        axisLine:{
                            show:true,
                            lineStyle:{
                                color:'#7e829c',
                            }
                        },
                        data:this.timeData,
                        show:false,
                        axisLabel:{
                            formatter:function(value,index){
                                var time = value.split(' ')[1].split(':');
                                var content = time[0] + ':' + time[1];
                                return content;
                            }
                        }
                    },
                ],
                yAxis:[
                    {   
                        show:false,
                        type: 'value',
                        axisLine:{
                            show:true,
                            lineStyle:{
                                color:'#7e829c',
                            }
                        },
                        scale: true,
                        splitNumber:0,
                        splitLine:{
                            show:false,
                        }
                    },
                    {
                        show:false,
                        scale: true,
                        gridIndex: 1,
                        splitLine: {show: false},
                        max:0.5,
                        min:0,
                        interval:0.5,
                        axisLine:{
                            show:true,
                            lineStyle:{
                                color:'#7e829c',
                            }
                        },
                    }
                ],
                axisPointer:{
                    show:true,
                    label:{
                        backgroundColor:'#323232b3',
                        shadowBlur:0,
                    }
                },
                tooltip:{
                    trigger:'axis',
                    confine:true,
                    triggerOn:'click',
                    formatter:function(params){
                        var param = params[0];
                        var html = `${param.seriesName}:${param.data[1]}`;
                        return html;
                    },
                    axisPointer: {
                        type: 'cross'
                    }
                },
                series:[
                    {
                        name:this.currentCommodityData.commodity_name,
                        type:'line',
                        data:this.lineData,
                        lineStyle:{
                            normal:{
                                color:"#fff",
                                width:2,
                            }
                        },
                        itemStyle:{
                            normal:{
                                opacity:0
                            }
                        }
                    },
                    {
                        show:false,
                        name:this.currentCommodityData.commodity_name,
                        type:'bar',
                        data:this.barData,
                        lineStyle:{
                            normal:{
                                color:"#fff",
                                width:2,
                            }
                        },
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                    }
                ]
            }
            this.lineOption = options;
        },
    }
}
</script>

<style lang="less" scoped>
@import url("../../../assets/css/main.less");
#fens{
    width: 100%;
    height: 100%;
    position: relative;
    #line-chart{
        height: 100%;
    }
    .no-data{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        color:#7e829c;
    }
}
/*ip5*/
@media(max-width:370px) {
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
}
/*ip6p及以上*/
@media (min-width:411px) {
}
</style>
