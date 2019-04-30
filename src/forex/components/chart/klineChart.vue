<template>
    <div id="kline">
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
        this.setKlineLineOptions();
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
        // currentCommodityData:function(){
        //     if(this.currentCommodityData == ''){
        //         this.lineChart.clear();
        //     }
        // },
        lastData:function(n,o){
            if(this.currentCommodityData!=''&&this.lineData.length>0&&n[0]==o[0]&&(this.$route.name=='forex_home'||this.$route.name=='forex_position'||this.$route.name=='forex_detail')){
                if(this.currentCommodityData.commodity_no == this.lastData[0].split('_')[1]){
                    //如果最新数据为选择的数据
                    var prevTime = '';
                    prevTime = new Date(this.lastTime).getTime();
                    //最新时间
                    var _lastTime = this.lastData[1].split('.')[0].split(' ')[0] + ' ' + this.lastData[1].split('.')[0].split(' ')[1].split(':')[0] + ':' + this.lastData[1].split('.')[0].split(' ')[1].split(':')[1] + ':00';
                    _lastTime = _lastTime.replace(/-/g,'/');
                    var lastTime = new Date(_lastTime).getTime();
                    //k线图
                    var lastPrice = 0;
                    switch(this.buyOrSell){
                        case false:
                            lastPrice = this.lastData[11];
                        break;
                        case true:
                            lastPrice = this.lastData[13];
                        break;
                    }
                    var offsetTime = 0;
                    switch(this.chartInfo.chartType){
                        case 'KLINE_1MIN':offsetTime = 60000;break;
                        case 'KLINE_5MIN':offsetTime = 300000;break;
                        case 'KLINE_15MIN':offsetTime = 900000;break;
                        case 'KLINE_30MIN':offsetTime = 1800000;break;
                        case 'KLINE_1HR':offsetTime = 3600000;break;
                        case 'KLINE_2HR':offsetTime = 7200000;break;
                        case 'KLINE_4HR':offsetTime = 14400000;break;
                        case 'KLINE_12HR':offsetTime = 43200000;break;
                        case 'KLINE_1DAY':offsetTime = 96400000;break;
                    }
                    if(lastTime - prevTime >= offsetTime){
                        addNode(this);
                    }else{
                        changeLast(this);
                    }
                    function addNode(_this){
                        var obj = [];
                        obj.push(lastPrice);
                        obj.push(lastPrice);
                        obj.push(lastPrice);
                        obj.push(lastPrice);
                        _this.lineData.push(obj);
                        var a = _this.lastData[1].split('.')[0].split(' ');
                        var b = a[1].split(':')[0]+':'+a[1].split(':')[1]+':00';
                        var time = a[0] + ' ' + b;
                        time = time.replace(/-/g,'/');
                        _this.timeData.push(time);
                        _this.lastTime = time;
                        // _this.lastTime = _this.lastData[1];
                        //更新5分钟1小时范围价格
                        var upDatePrice = [];
                        upDatePrice.push(_this.lastData[1]);
                        upDatePrice.push(lastPrice);
                        _this.$store.state.forex.fiveMinPrice.push(upDatePrice);
                        _this.$store.state.forex.oneHourPrice.push(upDatePrice);
                        _this.$store.state.forex.allDayPrice.push(upDatePrice);
                    }
                    function changeLast(_this){
                        if(lastPrice<_this.lineData[_this.lineData.length - 1][2]){
                            _this.lineData[_this.lineData.length - 1][2] = lastPrice;
                        }
                        if(lastPrice>_this.lineData[_this.lineData.length - 1][3]){
                            _this.lineData[_this.lineData.length - 1][3] = lastPrice;
                        }
                        _this.lineData[_this.lineData.length - 1][1] = lastPrice;

                        _this.$store.state.forex.fiveMinPrice[_this.$store.state.forex.fiveMinPrice.length - 1][1]=_this.lastData[11];
                        _this.$store.state.forex.oneHourPrice[_this.$store.state.forex.oneHourPrice.length - 1][1]=_this.lastData[11];
                        _this.$store.state.forex.allDayPrice[_this.$store.state.forex.allDayPrice.length - 1][1]=_this.lastData[11];
                    }
                    this.drawChart3();
                }
            }
        },
        chartHistoryData:function(){
            this.lastTime = '';
            if(this.chartHistoryData){
                //历史数据
                // this.lineChart.clear();
                // this.lineData = [];
                // alert(1);
                var historyList = this.chartHistoryData;
                var historyLength = this.chartHistoryData.length;
                var listData = []; //暂存线性值
                var timeData = []; //暂存柱状值
                var barData = []; //暂存柱状数据
                if(this.chartInfo.type == 2){
                    //k线图
                    for(var i=0;i<historyLength;i++){
                        var obj=[];
                        var barObj = [];
                        var time = historyList[i][0].replace(/-/g,'/');
                        timeData.push(time);
                        obj.push(historyList[i][2]); //开
                        obj.push(historyList[i][1]); //收
                        obj.push(historyList[i][3]); //低
                        obj.push(historyList[i][4]); //高
                        listData.push(obj);
                        barObj.push(time);
                        barObj.push(historyList[i][5]);
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
                this.drawChart3();
            }
        }
    },
    methods:{
        drawChart(){
            this.lineChart.setOption(this.lineOption);
        },
        drawChart3(){
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
						data: calculateMA(5,this.lineData),
					},
					{
						data: calculateMA(10,this.lineData),
					},
					{
						data: calculateMA(20,this.lineData),
					},
					{
						data: calculateMA(30,this.lineData),
					},
                    {
                        data:this.barData,
                    }
                ]
            });
			function calculateMA(dayCount,data) {
				var result = [];
				for (var i = 0, len = data.length; i < len; i++) {
					if (i < dayCount) {
						result.push('-');
						continue;
					}
					var sum = 0;
					for (var j = 0; j < dayCount; j++) {
						sum += data[i - j][1];
					}
					result.push(+(sum / dayCount));
				}
				return result;
			};
        },
        //设置k线图配置
        setKlineLineOptions(){
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
                        top: '70%',
                        height: '10%'
                    }
                ],
                animation:false,
                xAxis:[
                    {
                        show:false,
                        type:'category',
                        show:false,
                        boundaryGap : false,
                        axisLine:{
                            lineStyle:{
                                color:'#7e829c',
                            }
                        },
                        data:this.timeData,
                    },
                    {
                        type:'category',
                        gridIndex: 1,
                        show:false,
                        boundaryGap : false,
                        axisLine:{
                            lineStyle:{
                                color:'#7e829c',
                            }
                        },
                        data:this.timeData,
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
                        scale:true,
                        type:'value',
                        axisLine:{
                            lineStyle:{
                                color:'#7e829c',
                            }
                        },
                        show:false,
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
                tooltip: {
                    trigger: 'axis',
                    triggerOn: 'click',
                    confine:true,
                    hideDelay:10,
                    axisPointer: {
                        type: 'cross'
                    },
                    textStyle:{
                        fontSize:12
                    },
					formatter: function(params) {
						var time = params[0].name;
						if(time == null || time == "") {
							return
                        }
						var kd = params[0].data;
						var ma5 = params[1].data;
						var ma10 = params[2].data;
						var ma20 = params[3].data;
						var ma30 = params[4].data;
                        if(params[1].data!='-'){
						    var ma5 = params[1].data.toFixed(5);
                        }
                        if(params[2].data!='-'){
						    var ma10 = params[2].data.toFixed(5);
                        }
                        if(params[3].data!='-'){
						    var ma20 = params[3].data.toFixed(5);
                        }
                        if(params[4].data!='-'){
						    var ma30 = params[4].data.toFixed(5);
                        }
						var rate = (kd[2] - kd[1]) / kd[1] * 100;
						rate = parseFloat(rate).toFixed(5);
						var res ='涨幅比: ' + rate+'%';
						res += '<br/>  开盘价 : ' + parseFloat(kd[1]).toFixed(5) + '最低价 : ' + parseFloat(kd[3]).toFixed(5);
						res += '<br/>  收盘价 : ' + parseFloat(kd[2]).toFixed(5) + '最高价 : ' + parseFloat(kd[4]).toFixed(5);
						res += '<br/> <span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#3689B3"></span> MA5 : ' + ma5 + '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#B236B3"></span> MA10 : ' + ma10;
						res += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#B37436"></span> MA20 : ' + ma20 + '      <span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#B2B336"></span> MA30 : ' + ma30;
						return res;
					},
                },
                dataZoom:[
                    {
                        type:'inside',
                        xAxisIndex:[0,1],
                        start:50,
                        end:100
                    },
                    {
                        type:'slider',
                        show:false,
                        xAxisIndex:[0,1],
                    }
                ],
                series:[
                    {
                        type:'candlestick',
                        name:this.currentCommodityData.commodity_name,
                        data:this.lineData,
						itemStyle: {
							normal: {
								color: this.colorUp,
								color0: this.colorDown,
								borderColor: this.colorUp,
								borderColor0: this.colorDown,
							}
						},
                    },
					{
						name: 'MA5',
						type: 'line',
						data: calculateMA(5,this.lineData),
						smooth: true,
						showSymbol: false,
						lineStyle: {
							normal: {
								color: '#3689B3',
								width: 1,
							}
						}
					},
					{
						name: 'MA10',
						type: 'line',
						showSymbol: false,
						data: calculateMA(10,this.lineData),
						smooth: true,
						lineStyle: {
							normal: {
								color: '#B236B3',
								width: 1,
							}
						}
					},
					{
						name: 'MA20',
						type: 'line',
						showSymbol: false,
						data: calculateMA(20,this.lineData),
						smooth: true,
						lineStyle: {
							normal: {
								color: '#B37436',
								width: 1,
							}
						}
					},
					{
						name: 'MA30',
						type: 'line',
						showSymbol: false,
						data: calculateMA(30,this.lineData),
						smooth: true,
						lineStyle: {
							normal: {
								color: '#B2B336',
								width: 1,
							}
						}
					},
                    {
                        show:false,
                        data:this.barData,
                        name: 'Volume',
                        type: 'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                    }
                ]
            };
			function calculateMA(dayCount,data) {
				var result = [];
				for (var i = 0, len = data.length; i < len; i++) {
					if (i < dayCount) {
						result.push('-');
						continue;
					}
					var sum = 0;
					for (var j = 0; j < dayCount; j++) {
						sum += data[i - j][1];
					}
					result.push(+(sum / dayCount));
				}
				return result;
			};
            this.lineOption = options;
        },
    }
}
</script>

<style lang="less" scoped>
@import url("../../../assets/css/main.less");
#kline{
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
