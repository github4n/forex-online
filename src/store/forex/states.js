var state = {
  marketConfig: {
    version: '2.0', //版本
    // url_address:'ws://192.168.0.232:9102', //测试服务地址
    url_address: 'ws://quote.vs.com:8888', //生产服务地址
    userName: 'chenlin',
    password: '888888',
    subscribeType: ['C'],
  },
  currentCommodityData: '',//当前选择的行情数据
  currentChartData: '',//当前选择的图表行情数据
  lastData: [],//选择的行情的最新数据
  subsCommodity: [],//订阅的数据
  forexCommodity: [], //订阅的外汇数据
  marketSocket: null, //行情实例
  isConnectMarket: false,//是否连接行情

  openTradeObj: {}, //开户页面存储的数据
  openSuccessObj: {}, //开户成功存储的数据
  tradeLoginObj: {},//立即操盘存储的数据
  isQuickTrade: 1,//是否开启快速交易 0:开启 1:关闭
  tradeConfig: {
    Version: '2.0.0',
    url_address: '',
    ClientNo: '',
    PassWord: '',
    IsMock: true,
    Source: 'app',
  },
  tradeForceLine: 0,//交易亏损平仓线
  tradeSocket: false,//交易实例
  isConnectTrade: false,//是否连接交易
  isTradeLogin: false,//是否登录交易
  isSubscribeSuccess: false,//是否订阅成功
  forexFund: [], //资金信息
  forexOrderList: [],//外汇订单数据
  forexHistoryList: [],//外汇历史订单数据
  tipsMessage: {},//错误信息 1:纯文本 2:撤单，改单，平仓失败 3：委托状态改变
  saleCommodityObj: {},//选择的平仓数据
  chooseDetailData: {},//选择查看详情的
  //用户信息
  userInfo: {
    userNum: '',
    password: '',
    token: '',
    secret: '',
  },
  isAppLogin: false,//是否登录平台账号
  bottomInfo: {
    totalBalance: 0,//净值
    balance: 0,//余额
    initBond: 0,//初始保证金
    appendBond: 0,//追加保证金
    todayAmount: 0,//
    positionPrice: 0,
  },
  totalProfit: 0,//浮动盈亏
  chartInfo: {
    chartType: 'KLINE_UNKNOWN', //图表类型
    isSellChart: false,//是否为买价图 false:卖价 true:买价
    type: 1, //1:分时 2：K线
  },
  /* chart部分*/
  chartHistoryData: [], //历史数据

  fiveMinPrice: [],//5分钟内最高价和最低价
  oneHourPrice: [],//60分钟内最高价和最低价
  allDayPrice: [],//全天内最高价和最低价

  currentChartType: {
    name: '分时图',
    type: 1,
    period: 'KLINE_UNKNOWN',
  },//当前选择的图表类型
  currentChartValue: {
    name: '卖价图',
    value: false,
  },//当前选择的图表买价或卖价
  heartBeat: null,//交易心跳

};

export default state;
