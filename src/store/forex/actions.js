var actions = {
    initMarketWS:function(context){
        if(context.state.marketSocket){
            context.state.marketSocket.close();
            context.state.marketSocket = null;
            context.state.isConnectMarket = false;
        }
        context.state.marketSocket = new WebSocket(context.state.marketConfig.url_address);
        context.state.marketSocket.onopen = function(){
            //行情连接成功
            context.state.isConnectMarket = true;
            var loginParam = {
                method:'req_login',
                req_id:'',
                data:{
                    user_name:context.state.marketConfig.userName,
                    password:context.state.marketConfig.password,
                    protoc_version:context.state.marketConfig.version
                }
            }
            console.log(context.state.marketSocket);
            context.state.marketSocket.send(JSON.stringify(loginParam));
        };
        context.state.marketSocket.onclose = function(){
            //关闭行情ws
            context.state.isConnectMarket = false;
            context.state.marketSocket = null;
        };
        context.state.marketSocket.onerror = function(){
            //关闭行情ws
            context.state.isConnectMarket = false;
            context.state.marketSocket = null;
        };
        context.state.marketSocket.onmessage = function(message){
            //数据
            context.dispatch('marketMessage',message.data);
        };
    },
    marketMessage:function(context,message){
        message = JSON.parse(message);
        if(message.method == 'on_rsp_login'&&message.error_code == 0){
            console.log('连接行情服务器成功');
            var commodityParam = {
                method:'req_commodity_list',
                req_id:'',
                data:{}
            }
            context.state.marketSocket.send(JSON.stringify(commodityParam));
        }else if(message.method == 'on_rsp_commodity_list'&&message.error_code == 0){
            var commodityList = message.data.commodity_list
            var length = commodityList.length;
            var _subscribeList = [];
            for(var i = 0;i<length;i++){
                if(context.state.marketConfig.subscribeType.indexOf(commodityList[i].security_type) != -1){
                    //获取需要订阅的期货和外汇等等
                    _subscribeList.push(commodityList[i]);
                }
            }
            //存入订阅的行情
            context.state.subsCommodity = _subscribeList;
            //循环去订阅
            var subsLength = _subscribeList.length;
            var contractList = [];//订阅传的参数
            for(var i = 0;i<subsLength;i++){
                var obj = _subscribeList[i].security_type + '_' + _subscribeList[i].commodity_no;
                contractList.push(obj);
            }
            var subscribeParam={
                method:'req_subscribe',
                req_id:'',
                data:{
                    contract_list:contractList,
                    mode:'MODE_SNAP'
                }
            };
            context.state.marketSocket.send(JSON.stringify(subscribeParam));
            var _list = _subscribeList;
            var forexList = [];
            for(var i=0;i<_list.length;i++){
                if(_list[i].security_type == 'C'){
                    forexList.push(_list[i]);
                }
            }
            context.state.forexCommodity = forexList;
        }else if(message.method == 'on_rsp_subscribe'&&message.error_code == 0){
            //订阅成功的合约
            var succList = message.data.succ_list;
            var length = succList.length;
            var _list = context.state.subsCommodity;
            if(message.data.fail_list == null||message.data.fail_list.length == 0){
                console.log('全部订阅成功');
            }else{
                for(var j = 0;j<_list.length;j++){
                    for(var i = 0;i<length;i++){
                        if(_list[j].commodity_no == succList[i].split('_')[1]){
                            break;
                        }
                        if(j==_list.length-1){
                            //循环到最后还是没有
                            _list.splice(j,1);
                            j--;
                        }
                    }
                }
            }
            context.state.subsCommodity = _list;
            //取得外汇数据
            var forexList = [];
            for(var i=0;i<_list.length;i++){
                if(_list[i].security_type == 'C'){
                    forexList.push(_list[i]);
                }
            }
            context.state.forexCommodity = forexList;
			if(localStorage.getItem('forexTradeUser')){
				var tradeInfo = JSON.parse(localStorage.getItem('forexTradeUser'));
				context.state.tradeConfig.ClientNo = tradeInfo.tradeNumber;
				context.state.tradeConfig.PassWord = Base64.encode(tradeInfo.tradePassword);
                context.dispatch('initTradeWs');
			}
            context.state.isSubscribeSuccess = true;
        }else if(message.method == 'on_rtn_quote'){
            //外汇行情
            var forexList = context.state.forexCommodity;
            var lastData = message.data;//最新行情
            for(var i=0;i<forexList.length;i++){
                if(lastData[0].split('_')[1] == forexList[i].commodity_no){
                    forexList[i].quotaData = lastData;
                    break;
                }
            }
            context.state.forexCommodity = forexList.slice(0);

            if(context.state.currentCommodityData.commodity_no == message.data[0].split("_")[1]){
                context.state.lastData = message.data.slice(0);
            }
            //更新单位
            if(context.state.isTradeLogin){
                context.dispatch('upDateUnit',lastData);
            }
        }else if(message.method == 'on_rsp_history_data'){
            if(message.error_code == 0){
                //获取历史成功
                if(message.data.Lines){
                    context.state.chartHistoryData = message.data.Lines.slice(0);
                }else{
                    context.state.chartHistoryData = message.data.Lines.slice(0);
                }
            }
        }
    },
    initTradeWs:function(context){
        if(context.state.tradeConfig.url_address){
            if(context.state.tradeSocket){
                context.state.tradeSocket.close();
                context.state.tradeSocket = null;
                context.dispatch('initData');
            }
            context.state.tradeSocket = new WebSocket(context.state.tradeConfig.url_address);
            context.state.tradeSocket.onopen = function(){
                context.state.isConnectTrade = true;
                var loginParam = {
                    Method:'Login',
                    req_id:'',
                    Parameters:{
                        ClientNo:context.state.tradeConfig.ClientNo,
                        PassWord:context.state.tradeConfig.PassWord,
                        IsMock:context.state.tradeConfig.IsMock,
                        Version:context.state.tradeConfig.Version,
                        Source:context.state.tradeConfig.Source
                    }
                }
                context.state.tradeSocket.send(JSON.stringify(loginParam));
            };
            context.state.tradeSocket.onclose = function(){
                context.state.isConnectTrade = false;
                context.state.tradeSocket = null;
                context.state.isTradeLogin = false;
                var list = context.state.forexCommodity;
                var length = context.state.forexCommodity.length;
                for(var i=0;i<length;i++){
                    list[i].positionList = null;
                }
                context.state.forexCommodity = list.slice(0);
                localStorage.removeItem('forexTradeUser');
            }
            context.state.tradeSocket.onmessage = function(message){
                context.dispatch('tradeMessage',message.data);
            };
            context.state.tradeSocket.onerror = function(){
                context.state.tradeSocket.close();
            }
        }
    },
    tradeMessage:function(context,message){
        message = JSON.parse(message);
        if(message.Method == 'OnRspLogin'){
            if(message.Parameters.Code == 0){
                context.state.tradeConfig.ClientNo = message.Parameters.ClientNo;
                context.state.tradeForceLine = message.Parameters.ForceLine;
                context.state.isTradeLogin = true;
                var accountParam = {
                    Method:'QryAccount',
                    req_id:'',
                    Parameters:{
                        ClientNo:context.state.tradeConfig.ClientNo,
                    }
                }
                context.state.tradeSocket.send(JSON.stringify(accountParam));
                var orderParam = {
                    Method:'QryLiteOrder',
                    req_id:'',
                    Parameters:{
                        Type:2,
                        Status:[],
                    }
                }
                context.state.tipsMessage = {
                    type:1,
                    message:'登录成功',
                };
                context.state.tradeSocket.send(JSON.stringify(orderParam));
            }else{
                context.state.tipsMessage = {
                    type:1,
                    message:message.Parameters.Message,
                };
            }
        }else if(message.Method == 'OnRspLogout'){
            //登出
            if(message.Parameters.Code == 0){
                //成功
                context.state.isTradeLogin = false;
                var list = context.state.forexCommodity;
                var length = context.state.forexCommodity.length;
                for(var i=0;i<length;i++){
                    list[i].positionList = null;
                }
                context.state.forexCommodity = list.slice(0);
                context.state.forexFund = [];
                context.state.forexOrderList = [];
                context.state.currentCommodityData = '';
                context.state.currentChartData = '';
                context.state.tradeConfig.ClientNo = '';
                context.state.tradeConfig.PassWord = '';
                localStorage.removeItem('forexTradeUser');
                context.state.tipsMessage = {
                    type:1,
                    message:'登出成功',
                };
            }else if(message.Parameters.Code < 0){
                //失败
                context.state.tipsMessage = {
                    type:1,
                    message:message.Parameters.Message,
                };
            }
        }else if(message.Method == 'OnRspQryAccount'){
            //查询资金信息
            if(message.Parameters){
                var list = context.state.forexFund;
                if(list.length > 0){
                    for(var i=0;i<list.length;i++){
                        if(message.Parameters.CurrencyNo == list[i].CurrencyNo){
                            list.splice(i,1,message.Parameters.CurrencyNo);
                            break;
                        }
                    }
                }
                if(message.Parameters.AccountNo == 'USD'){
                    context.state.bottomInfo.todayAmount = message.Parameters.TodayAmount;
                }
                var positionPrice = 0;
                positionPrice = parseFloat(positionPrice) + parseFloat(message.Parameters.Deposit);
                context.state.bottomInfo.positionPrice = positionPrice;
                context.state.forexFund.unshift(message.Parameters);
            }
        }else if(message.Method == 'OnRspQryLiteOrder'){
            //查询所有订单信息
            if(message.ReqID == 'history'){
                //查询历史
                if(message.Parameters.TotalCount == 0){
                    context.state.forexHistoryList = [];
                }else{
                    context.state.forexHistoryList = message.Parameters.LiterOrderList.slice(0);
                }
            }else{
                if(message.Parameters.Code == 0){
                    if(message.Parameters.TotalCount == 0){
                        context.state.forexOrderList = [];
                    }else{
                        context.state.forexOrderList = message.Parameters.LiterOrderList.slice(0);
                    }
                    context.dispatch('combineHomeData');
                }
            }
        }else if(message.Method == 'OnRspOpenLiteOrder'){
            //开仓后的回调
            if(message.Parameters.Status == 1||message.Parameters.Status == 3||message.Parameters.Status == 6){
                //提交失败和开仓失败和平仓失败
                context.state.tipsMessage = {
                    type:3,
                    message:message.Parameters
                };
                context.state.forexOrderList.unshift(message.Parameters);
            }else{
                context.state.tipsMessage = {
                    type:3,
                    message:message.Parameters
                };
                context.state.forexOrderList.unshift(message.Parameters);
            }
            context.dispatch('combineHomeData');
        }else if(message.Method == 'OnRspCloseLiteOrder'){
            //平仓后的回调
            if(message.Parameters.Code!=0){
                //平仓失败
                context.state.tipsMessage = {
                    type:2,
                    message:message.Parameters
                };
            }else{
                //部分平仓
                // context.state.forexOrderList.unshift(message.Parameters);
            }
        }else if(message.Method == 'OnRspCancelLiteOrder'){
            if(message.Parameters.Code!=0){
                //撤单失败
                context.state.tipsMessage = {
                    type:2,
                    message:message.Parameters
                };
            }else{
                //撤单成功
                // context.state.forexOrderList.unshift(message.Parameters);
                context.state.tipsMessage = {
                    type:2,
                    message:message.Parameters
                };
            }
        }else if(message.Method == 'OnRspModifyLiteOrder'){
            if(message.Parameters.Code!=0){
                //改单失败
                context.state.tipsMessage = {
                    type:2,
                    message:message.Parameters
                };
            }else{
                //改单成功
                // context.state.forexOrderList.unshift(message.Parameters);
                context.state.tipsMessage = {
                    type:2,
                    message:message.Parameters
                };
            }
        }else if(message.Method == 'RtnLiteOrder'){
            //委托状态更变
            var orderLength = context.state.forexOrderList.length;//订单数据长度
            if(message.Parameters.Status == 1){
                //提交失败
            }else if(message.Parameters.Status == 2||message.Parameters.Status == 4||message.Parameters.Status == 7){
                //开仓中和已开仓和部分平仓
                for(var i=0;i<orderLength;i++){
                    if(context.state.forexOrderList[i].LiteOrderID == message.Parameters.LiteOrderID){
                        context.state.forexOrderList.splice(i,1,message.Parameters);
                        break;
                    }
                }
            }else if(message.Parameters.Status == 8){
                //已平仓
                for(var i=0;i<orderLength;i++){
                    if(context.state.forexOrderList[i].LiteOrderID == message.Parameters.LiteOrderID){
                        context.state.forexOrderList.splice(i,1,message.Parameters);
                        break;
                    }
                }
            }else if(message.Parameters.Status == 9){
                //已撤单
                for(var i=0;i<orderLength;i++){
                    if(context.state.forexOrderList[i].LiteOrderID == message.Parameters.LiteOrderID){
                        context.state.forexOrderList.splice(i,1,message.Parameters);
                        break;
                    }
                }
            }else{
                return;
            }
            context.state.tipsMessage = {
                type:3,
                message:message.Parameters
            }
            context.dispatch('combineHomeData');
        }else if(message.Method == 'OnRtnMoney'){
            //资金变化通知
            if(message.Parameters){
                var list = context.state.forexFund;
                for(var i=0,length=list.length;i<length;i++){
                    if(list[i].CurrencyNo == message.Parameters.CurrencyNo){
                        list.splice(i,1,message.Parameters);
                    }
                };
                var positionPrice = 0;
                for(var i=0;i<list.length;i++){
                    positionPrice = parseFloat(positionPrice) + parseFloat(list[i].Deposit);
                }
                context.state.bottomInfo.positionPrice = positionPrice;
                context.state.forexFund = list.slice(0);
            }
            // context.state.tipsMessage = message.Parameters;
        }else if(message.Method == 'OnRtnHeartBeat'){
            // if(context.state.heartBeat!=null){
            //     clearTimeout(context.state.heartBeat);
            //     context.state.heartBeat = null;
            // }
            // context.state.heartBeat = setTimeout(function(){
            //     //重连交易
            //     context.dispatch('initTradeWs');
            // },5000);
        }
    },
    //初始化数据
    initData(context){
        context.state.forexFund = []; 
    },
    //组合外汇首页数据
    combineHomeData(context){
        var quotaList = context.state.forexCommodity; //行情数据
        var quotaLength = context.state.forexCommodity.length; //行情数据长度
        var orderList = context.state.forexOrderList; //订单数据
        var orderLength = context.state.forexOrderList.length;//订单数据长度
        for(var i=0;i<quotaLength;i++){
            quotaList[i].positionList = [];
            for(var j=0;j<orderLength;j++){
                if(quotaList[i].commodity_no == orderList[j].CommodityNo&&(orderList[j].Status==4||orderList[j].Status==2||orderList[j].Status==7)){
                    //持仓和部分平仓和挂单
                    var lastPrice = 0;
                    switch(orderList[j].Direction){
                        case 0:lastPrice = quotaList[i].quotaData[11];break;
                        case 1:lastPrice = quotaList[i].quotaData[13];break;
                    }
                    //初始化单位
                    var USDRate = '';
                    if(orderList[j].CommodityNo.split('.')[1]=='USD'){
                        //右置美元
                        USDRate = 1;
                    }else if(orderList[j].CommodityNo.split('.')[0]=='USD'){
                        //左置美元
                        USDRate = 1/lastPrice;
                    }else{
                        //不存在美元
                        for(var z=0;z<quotaLength;z++){
                            if(quotaList[z].commodity_no.split('.')[1] == orderList[j].CommodityNo.split('.')[1]&&quotaList[z].commodity_no.split('.')[0] == 'USD'){
                                switch(orderList[j].Direction){
                                    case 0:USDRate = 1/quotaList[z].quotaData[11];break;
                                    case 1:USDRate = 1/quotaList[z].quotaData[13];break;
                                }
                            }
                        }
                    }
                    orderList[j]['Unit'] = USDRate;
                    //计算平仓后的手数
                    var closeProfit = 0;
                    if(orderList[j].CloseParam&&orderList[j].CloseParam.length>0){
                        //如果有平仓
                        for(var z=0;z<orderList[j].CloseParam.length;z++){
                            closeProfit += orderList[j].CloseParam[z].CloseNum;
                        }
                    }
                    orderList[j]['CurrentNum'] = orderList[j].Num - closeProfit;
                    quotaList[i].positionList.push(orderList[j]);
                }
            }
        }
        context.state.forexCommodity = quotaList.slice(0);
    },
    //更新单位
    upDateUnit(context,lastData){
        var quotaList = context.state.forexCommodity; //行情数据
        var quotaLength = context.state.forexCommodity.length; //行情数据长度
        for(var i=0,length=quotaList.length;i<length;i++){
            if(quotaList[i].positionList&&quotaList[i].positionList.length>0){
                for(var j=0,length2=quotaList[i].positionList.length;j<length2;j++){
                    if(quotaList[i].positionList[j].CommodityNo == lastData[0].split('_')[1]){
                        var USDRate = '';
                        var lastPrice = 0;
                        switch(quotaList[i].positionList[j].Direction){
                            case 0:lastPrice = lastData[11];break;
                            case 1:lastPrice = lastData[13];break;
                        }
                        if(quotaList[i].positionList[j].CommodityNo.split('.')[1]=='USD'){
                            //右置美元
                            USDRate = 1;
                        }else if(quotaList[i].positionList[j].CommodityNo.split('.')[0]=='USD'){
                            //左置美元
                            USDRate = 1/lastPrice;
                        }else{
                            //不存在美元
                            for(var z=0;z<quotaLength;z++){
                                if(quotaList[z].commodity_no.split('.')[1] == quotaList[i].positionList[j].CommodityNo.split('.')[1]&&quotaList[z].commodity_no.split('.')[0] == 'USD'){
                                    switch(quotaList[i].positionList[j].Direction){
                                        case 0:USDRate = 1/lastData[11];break;
                                        case 1:USDRate = 1/lastData[13];break;
                                    }
                                }
                            }
                        }
                        quotaList[i].positionList[j].Unit = USDRate;
                        break;
                    }
                };
                break;
            }
        }
    }
}

export default actions;