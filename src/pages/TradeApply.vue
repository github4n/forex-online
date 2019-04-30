<template>
  <div id="applydetail">
    <tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
    <!-- <topbar title='开户'></topbar>
        <kf title="操盘细则" type="1" status="1" @tap.native="toTradersRules"></kf>
        <kf title="客服"></kf> -->
    <div id="header-box">
      <header-bar :showBack="false" :showMenu="false">
                <span slot="title" class="header-title">
                    开户
                </span>
        <span slot="otherIcon" @tap="customerOption">
					<img src="../assets/img/forex/customer.png"/>
				</span>
      </header-bar>
    </div>
    <div class="customer-box" v-show="isShowCustomer">
      <div class="hidden-bg" @tap.stop="customerOption"></div>
      <div class="customer-option">
        <customer></customer>
      </div>
    </div>
    <div class="main">
      <!--tab s-->
      <div class="title">
        <ul>
          <template v-for="(k, index) in tabList">
            <li :class="{current: openPage == index}" @tap="tabEvent(index)">
              <span>{{k.title}}</span>
            </li>
          </template>
        </ul>
      </div>
      <!--tab e-->

      <div class="cont" v-show="openPage == 0">
        <!--轮播 s-->
        <div id="slider" class="mui-slider">
          <div class="mui-slider-group">
            <!--<div class="mui-slider-item mui-slider-item-duplicate">
                            <a href="#"><img :src="bannerList[bannerList.length - 1].imgPath"></a>
                        </div>-->
            <template v-for="k in bannerList">
              <div class="mui-slider-item">
                <a href="#"><img :src="k.imgPath"/></a>
              </div>
            </template>
            <!--<div class="mui-slider-item mui-slider-item-duplicate">
                            <a href="#"><img :src="bannerList[0].imgPath"></a>
                        </div>-->
          </div>
        </div>
        <!--轮播 e-->

        <!--选择操盘保证金-->
        <div class="margin_trade" id="margin_trade_static">
          <p class="fontwhite">选择操盘保证金（金额越多，可持仓手数越多）</p>
          <!--<ul>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='3000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='6000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='10000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='12000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='15000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='50000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='100000'></mr>-->
          <!--</li>-->
          <!--<li class="fl" @tap='choose'>-->
          <!--<mr num='200000'></mr>-->
          <!--</li>-->
          <!--</ul>-->
          <ul>
            <li v-for="(item,index) in temp.paramList" :key="index" class="fl" @tap="choose">
              <mr :num="item.traderBond" :isSelected="index == 0"></mr>
            </li>
          </ul>
        </div>
        <!--选择操盘保证金-->
        <div class="margin_trade margin_trade_fixed" v-show="bondShow">
          <p class="fontwhite">选择操盘保证金（金额越多，可持仓手数越多）</p>
          <ul>
            <li v-for="(item,index) in temp.paramList" :key="index" class="fl" @tap="choose">
              <mr :num="item.traderBond" :isSelected="index == 0"></mr>
            </li>
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='3000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='6000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='10000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='12000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='15000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='50000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='100000'></mr>-->
            <!--</li>-->
            <!--<li class="fl" @tap='choose'>-->
            <!--<mr num='200000'></mr>-->
            <!--</li>-->
          </ul>
        </div>
        <!--操盘保证金及资金显示-->
        <div class="margin_trade_show">
          <ul>
            <li class="fontgray">操盘保证金：<span class="fontwhite">{{chooseType | moneytype(chooseType)}}元</span></li>
            <li class="fontgray">总操盘资金：<span class="fontwhite">{{traderTotal | moneytype(chooseType)}}美元</span></li>
            <li class="fontgray">亏损平仓线：<span class="fontwhite">{{lineLoss | moneytype(chooseType)}}美元</span></li>
          </ul>
        </div>
        <!--按钮-->
        <ul class="bottom">
          <li class="fontyellow">
            总计：<span><span class="fontyellow">{{chooseType | moneytype(chooseType)}}元</span></span>
          </li>
          <li>
            <bbtn name='马上开户' @tap.native='toConfirm'></bbtn>
            <div class="haveAccount">
              已有账户?
              <span @click="tologin">直接登录</span>
            </div>
          </li>
        </ul>
        <!--可交易品种-->
        <div class="notice">
          <p class="fontwhite">可交易品种（一个账号可同时交易17种期货产品）</p>
          <p class="fontgray">
            <span class="fontyellow">注意：</span>请不要在交易时间外持单，以免被系统强制平仓
          </p>
        </div>
        <!--列表-->
        <div class="datalist">
          <ul class="list_head">
            <li class="odd">
              <span>期货产品</span>
            </li>
            <li class="even">
              <span>交易手续费</span>
              <span>单边</span>
            </li>
            <li class="even">
              <span>初始持仓手数</span>
              <span>只交易该品种时，最大持仓</span>
            </li>
            <li class="odd">
              <span>交易时间</span>
            </li>
            <li class="odd">
              <span>简介</span>
            </li>
          </ul>
          <template v-for="k in temp.contractList">
            <ul class="list_cont">
              <li class="even">
                <!-- V1版本 -->
                <!--<span v-if="$store.state.appVersion =='v1'">{{k.tradeType | cnname}}</span>-->
                <span v-if="$store.state.appVersion =='v1'">{{k.tradeName}}</span>
                <!-- V2版本 -->
                <span v-if="$store.state.appVersion =='v2'">{{k.tradeName}}</span>

                <span>{{k.mainContract}}</span>
              </li>
              <li class="odd">
                <span>{{k.price}}元/手</span>
              </li>

              <!-- V1版本 -->
              <li class="odd" v-if="$store.state.appVersion =='v1'">
                <!--<span>{{k.shoushu | filtershoushu(chooseType)}}</span>-->
                <span v-for="(item,i) in k.shoushu">
                  <span v-if="item.traderBond === chooseType">{{item.shoushu}}</span>
                </span>
              </li>

              <!-- V2版本 -->
              <li class="odd" v-if="$store.state.appVersion =='v2'">
                <span>{{k.shoushu | filtershoushu2(chooseType)}}</span>
              </li>

              <li :class="{odd: k.tradTime.length < 25, even: k.tradTime.length >= 25}">
                <span>{{k.tradTime}}</span>
              </li>
              <li class="even">
                <span>{{k.dosize}}</span>
              </li>
            </ul>
          </template>
        </div>
        <!--提交申请-->
        <ul class="info">
          <li class="fontgray">提交申请表示阅读并同意
            <span class="fontwhite" v-if="$store.state.appVersion == 'v1'" @tap="toAgreement"> 《国际期货操盘合作协议》 </span>
            <span class="fontwhite" v-if="$store.state.appVersion == 'v2'" @tap="toAgreement"> 《期货操盘协议》 </span>
          </li>
          <li class="fontgray">
            客服咨询： <span class="fontwhite">{{hotLine}}</span>
          </li>
        </ul>
      </div>
      <div v-if="openPage == 1">
        <forex-open></forex-open>
      </div>
    </div>
    <div class="shadow" v-show="isShowAccount" @tap="cancelAccount"></div>
    <div class="haveAccountList" v-show="isShowAccount">
      <div class="have-account-title">
        已有账号,可直接登录
      </div>
      <div class="have-account-content">
        <ul>
          <li class="account-item" @tap="jumpToLogin(item)" v-for="(item,index) in tradeListUserful" :key="index">
            <div class="trade-account">
              交易账号:{{item.tranAccount}}
            </div>
            <div class="trade-bound">
              ￥{{item.traderBond}}
            </div>
          </li>
        </ul>
      </div>
      <div class="have-account-btn">
        <div @tap="otherChoose(1)">
          取消
        </div>
        <div @tap="otherChoose(2)">
          新开户>>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import topbar from '../components/Topbar.vue'
  import bbtn from '../components/bigBtn.vue'
  import back from '../components/back.vue'
  import kf from '../components/customerService.vue'
  import mr from '../components/moneyradio.vue'
  import tipsDialog from '../components/tipsDialog.vue'
  import forexOpen from '../forex/components/forex_open'
  import headerBar from '../forex/components/header';
  import customer from '../forex/components/customer';

  export default {
    name: 'applydetail',
    components: {topbar, bbtn, back, kf, mr, tipsDialog, forexOpen, headerBar, customer},
    data() {
      return {
        tabList: [
          {
            title: '国际期货'
          },
          //2019-2-18李鑫注释
          // {
          // 	title: '外汇'
          // }
        ],
        bannerList: [],
        temp: {
          contractList: [],
          paramList: []
        },
        show: 0,
        chooseType: 3000,
        emptyShow: false,
        tradeListUserful: [],
        tradeList: '',
        userInfo: '',
        msg: '',
        bondShow: false,
        scroH: '',
        h: '',
        isShowAccount: false,
        username: '',//选择的账号
        pwd: '',//选择的账号
        isShowCustomer: false, //是否显示客服
      }
    },
    created: function () {
    },
    filters: {
      filtershoushu2: function (arr, chooseType) {
        for (var i = 0, k = arr.length; i < k; i++) {
          if (chooseType == arr[i].traderBond) {
            if (arr[i].shoushu != '') {
              return arr[i].shoushu;
            } else {
              return "—";
            }
          }
        }
        return '<空>';
      },
      filtershoushu: function (arr, chooseType) {
        switch (chooseType) {
          case 3000:
            return arr[0];
            break;
          case 6000:
            return arr[1];
            break;
          case 10000:
            return arr[2];
            break;
          case 12000:
            return arr[3];
            break;
          case 15000:
            return arr[4];
            break;
          case 50000:
            return arr[5];
            break;
          case 100000:
            return arr[6];
            break;
          case 200000:
            return arr[7];
            break;
        }
      },
      moneytype: function (num) {
        if (num) return num.toLocaleString();
      },
      cnname: function (a) {
        switch (a) {
          case 0:
            return '富时A50'
            break;
          case 6:
            return '国际原油'
            break;
          case 7:
            return '恒指期货'
            break;
          case 9:
            return '迷你道指'
            break;
          case 10:
            return '迷你纳指'
            break;
          case 11:
            return '迷你标普'
            break;
          case 12:
            return '德国DAX'
            break;
          case 13:
            return '日经225'
            break;
          case 14:
            return '小恒指'
            break;
          case 15:
            return '美黄金'
            break;
          case 16:
            return 'H股指数'
            break;
          case 17:
            return '小H股指数'
            break;
          case 18:
            return '美铜'
            break;
          case 19:
            return '美白银'
            break;
          case 20:
            return '小原油'
            break;
          case 21:
            return '迷你德国DAX指数'  //迷你德国DAX指数
            break;
          case 22:
            return '天然气'
            break;
        }
      },
      varieties: function (e) {    //交易品种
        switch (e) {
          case 8:
            return "国际综合";
            break;
          case 7:
            return "恒指期货";
            break;
          case 6:
            return "国际原油";
            break;
          case 0:
            return "富时A50";
            break;
        }
      },
      operateState: function (e) {     //状态
        switch (e) {
          case 1:
            return "开户中";
            break;
          case 2:
            return "结算中";
            break;
          case 3:
            return "待结算";
          case 4:
            return "操盘中";
            break;
          case 5:
            return "开户失败";
            break;
          case 6:
            return "已结算";
            break;
        }
      },
      operateNumber: function (e) {
        if (!e) {
          return "初始可持仓手数";
        } else {
          return e + "手";
        }
      },
      getTime: function (e, format) {
        var t = new Date(e * 1000);
        var tf = function (i) {
          return (i < 10 ? '0' : '') + i
        };
        return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
          switch (a) {
            case 'yyyy':
              return tf(t.getFullYear());
              break;
            case 'MM':
              return tf(t.getMonth() + 1);
              break;
            case 'mm':
              return tf(t.getMinutes());
              break;
            case 'dd':
              return tf(t.getDate());
              break;
            case 'HH':
              return tf(t.getHours());
              break;
            case 'ss':
              return tf(t.getSeconds());
              break;
          }
          ;
        });
      }
    },
    computed: {
      PATH() {
        return this.$store.getters.PATH;
      },
      environment() {
        return this.$store.state.environment;
      },
      hotLine: function () {
        return this.$store.state.account.hotLine;
      },
      msgTips: function () {
        return this.msg;
      },
      traderTotal: function () {
        if (this.temp.paramList.length > 0) {
          var traderTotal = 0;
          this.temp.paramList.forEach((e) => {
            if (e.traderBond === this.chooseType) {
              traderTotal = e.traderTotal;
            }
          });
          return traderTotal;
        }
      },
      lineLoss: function () {
        if (this.temp.paramList.length > 0) {
          var lineLoss = 0;
          this.temp.paramList.forEach((e) => {
            if (e.traderBond === this.chooseType) {
              lineLoss = e.lineLoss;
            }
          });
          return lineLoss;
        }
      },
      loginStatus() {
        return this.$store.state.loginStatus;
      },
      tradeConfig() {
        return this.$store.state.market.tradeConfig;
      },
      Parameters() {
        return this.$store.state.market.Parameters;
      },
      openPage() {
        return this.$store.state.openPage;
      }
    },
    watch: {
      loginStatus: function () {
        if (this.$route.name == 'tradeapply') {
          if (this.loginStatus == 1) {
            this.$children[0].isShow = true;
            this.msg = '登录成功';
            this.$store.state.market.tradeConfig.username = this.username;
            this.$store.state.market.tradeConfig.password = Base64.encode(this.pwd);
            var userData = {'username': this.username, 'password': Base64.encode(this.pwd)};
            localStorage.setItem("tradeUser", JSON.stringify(userData));
            this.$store.dispatch('qryHisTrade');
            // this.$store.state.market.positionListCont = [];
            // this.$store.state.market.OnRspQryTradeDealListCont = [];
            // this.$store.state.market.orderListCont = [];
            // this.$store.state.marketOnRspOrderInsertEntrustCont = [];
            // this.$store.state.markethasNostopLossList = [];
            // this.$store.state.hasYesstopLossList = [];
            // this.$store.state.market.conditionList = [];
            // this.$store.state.market.triggerConditionList = [];
            setTimeout(function () {
              // this.$router.push({path: '/index', query: {isBack: 1}});
              this.Parameters.forEach(function (e) {
                if (e.CommodityName == '国际原油') {
                  this.$store.state.market.currentdetail = e;
                }
              }.bind(this));
              // this.$store.state.loginStatus = 0;
              this.$store.state.menuType = 5;
              this.$router.replace({path: '/orderdetail'});
            }.bind(this), 100);
          } else if (this.loginStatus == 2) {
            this.$children[0].isShow = true;
            this.msg = this.$store.state.market.tradeLoginSuccessMsg;
            // this.$store.state.loginStatus = 0;
          }
        }
      }
    },
    methods: {
      //计算手数
      getHandNum(temp) {
        var contractList = temp.contractList;
        var paramList = temp.paramList;
        contractList.forEach(function (o, i) {
          o.shoushu = [];
          paramList.forEach(function (a) {
            var _paramList = JSON.parse(a.inMultiple);
            var obj = {};
            obj.traderBond = a.traderBond;
            for (var j = 0; j < _paramList.length; j++) {
              if (_paramList[j].mainContract == o.mainContract) {
                obj.shoushu = _paramList[j].initialAmount;
                o.name = _paramList[j].commodityName;
                break;
              }
              // if(_paramList[j].commodityNo == o.mainContract){
              //   obj.shoushu = _paramList[j].initialAmount;
              //   o.name = _paramList[j].commodityName;
              //   break;
              // }
            }
            o.shoushu.push(obj);
          }.bind(this));
        }.bind(this));
        this.temp.contractList = contractList;
        this.$store.state.tempTradeapply = this.temp;
      },
      //获取国际期货数据
      getFuturesData() {
        //初始化各种合约数据
        var num = this.$store.state.appVersion == 'v1' ? 8 : 99;
        this.$http.post(this.PATH + '/ftrade/params', {emulateJSON: true}, {
          params: {
            "businessType": num
          },
          timeout: 5000
        }).then(function (e) {
          this.temp = e.body.data;
          this.$store.state.tempTradeapply = this.temp;
          if (this.$store.state.appVersion == 'v2') {
            this.temp.contractList.forEach(function (o, i) {
              o.shoushu = [];
              this.temp.paramList.forEach(function (a) {
                var paramList = JSON.parse(a.inMultiple);
                var obj = {};
                obj.traderBond = a.traderBond;
                for (var j = 0; j < paramList.length; j++) {
                  if (paramList[j].commodityNo == o.mainContract) {
                    obj.shoushu = paramList[j].initialAmount;
                    o.name = paramList[j].commodityName;
                    break;
                  }
                }
                o.shoushu.push(obj);
              }.bind(this));
            }.bind(this));
          } else if (this.$store.state.appVersion == 'v1') {
            this.chooseType = this.temp.paramList[0].traderBond;
            // this.temp.contractList.forEach(function(o, i) {
            // 	switch(o.tradeType) {
            // 		case 0:   //return '富时A50'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.tranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 6:   //return '国际原油'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.crudeTranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 7:   //return '恒指期货'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.hsiTranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 9:   //return '迷你道指'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.mdtranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 10:   //return '迷你纳指'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.mntranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 11:   //return '迷你标普'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.mbtranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 12:   //return '德国DAX'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.daxtranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 13:   //return '日经225'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.nikkeiTranLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 14:   //return '小恒指'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.lhsiTranActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 15:   //return '美黄金'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.agTranActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 16:   //return 'H股指数'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.hIndexActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 17:   //return '小H股指数'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.xhIndexActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 18:   //return '美铜'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.aCopperActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 19:   //return '美白银'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.aSilverActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 20:   //return '小原油'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.smaActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 21:   //迷你德国DAX指数
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				arr.push(a.daxtranMinActualLever);
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 		case 22:   //return '天然气'
            // 			var arr = [];
            // 			this.temp.paramList.forEach(function(a) {
            // 				if(a.naturalGasActualLever==null){
            // 					arr.push(0);
            // 				}else{
            // 					arr.push(a.naturalGasActualLever);
            // 				}
            // 				o.shoushu = arr;
            // 			}.bind(this));
            // 			break;
            // 	}
            // }.bind(this));
            this.getHandNum(this.temp);
          }
        }.bind(this), function (e) {
        });
      },
      //其他选择
      otherChoose(index) {
        if (index == 1) {
          this.isShowAccount = false;
        } else if (index == 2) {
          this.toConfirm();
        }
        this.isShowAccount = false;
      },
      //获取账号
      jumpToLogin(item) {
        this.username = item.tranAccount;
        this.pwd = item.tranPassword;
        var param = '{"Method":"Login","Parameters":{"ClientNo":"' + item.tranAccount + '","PassWord":"' + Base64.encode(item.tranPassword) + '","IsMock":' + this.tradeConfig.model + ',"Version":"' + this.tradeConfig.version + '","Source":"' + this.tradeConfig.client_source + '"}}';
        this.$store.dispatch('initTrade', param);
        // this.$router.push({path: '/tradeLogin', query: {user: item.tranAccount, pwd: item.tranPassword}});

        this.isShowAccount = false;
      },
      //取消选择账号
      cancelAccount: function () {
        this.isShowAccount = false;
      },
      //直接登录
      tologin: function () {
        if (localStorage.user && this.tradeListUserful.length > 0) {
          this.isShowAccount = true;
        } else if (localStorage.user && this.tradeListUserful.length == 0) {
          this.$refs.dialog.isShow = true;
          this.msg = '暂无账户';
        } else {
          this.$router.push({path: '/login'});
        }
      },
      toTradersRules: function () {
        this.$router.push({path: '/tradersRules'});
      },
      toAgreement: function () {
        this.$router.push({path: '/agreement'});
      },
      tabEvent: function (i) {
        if (i == 0) {
          // this.getFuturesData();
        }
        ;
        this.$store.state.openPage = i;
      },
      getBanner: function () {
        this.$http.post(this.PATH + '/banner/list', {emulateJSON: true}, {
          params: {
            type: 9
          },
          timeout: 5000
        }).then(function (e) {
          var data = e.body;
          if (data.success == true) {
            if (data.code == 1) {
              if (data.data.bannerList == null || data.data.bannerList.length <= 0) {
                return;
              }
              this.bannerList = data.data.bannerList;
              this.bannerList.forEach(function (o, i) {
                if (this.environment == 'test') {
                  o.imgPath = "http://manage.duokongtai.cn/" + o.imgPath;
                } else {
                  o.imgPath = "https://manage.duokongtai.cn/" + o.imgPath;
                }
              }.bind(this));
            }
          } else {
            switch (data.code) {
              case '2':
                this.$refs.dialog.isShow = true;
                this.msg = '处理失败';
                break;
              default:
                break;
            }
          }
        }.bind(this), function () {
          this.$refs.dialog.isShow = true;
          this.msg = '网络不给力，请稍后再试！';
        });
      },
      choose: function (e) {
        if ($(e.target).get(0).tagName == 'DIV') {
          $(e.target).addClass('current');
          $(e.target).parents('li').siblings('li').children().children('div').removeClass('current');
          this.chooseType = parseInt($(e.target).text());
        } else if ($(e.target).get(0).tagName == 'SPAN') {
          $(e.target).parent('div').addClass('current');
          $(e.target).parents('li').siblings('li').children().children('div').removeClass('current');
          this.chooseType = parseInt($(e.target).parent('div').text());
        }
      },
      //是否显示客服
      customerOption() {
        this.isShowCustomer = !this.isShowCustomer;
      },
      toConfirm: function () {
        if (!localStorage.user) {
          this.$router.replace({
            'path': '/login'
          });
          return;
        }
        this.$router.push({
          path: '/payconfirm',
          query: {
            'chooseType': this.chooseType,
            'traderTotal': this.traderTotal,
            'lineLoss': this.lineLoss
          }
        })
      },
      toDetails: function (e) {
        var type = $(e.currentTarget).attr("type");
        var id = $(e.currentTarget).attr("id");
        this.$router.push({path: '/tradeDetails', query: {type: type, id: id}});
      },
      getOperateDetails: function () {
        var num = this.$store.state.appVersion == 'v1' ? 8 : 99;
        this.tradeListUserful = [];
        this.$http.post(this.PATH + '/user/ftrade/list', {emulateJSON: true}, {
          headers: {
            'token': this.userInfo.token,
            'secret': this.userInfo.secret
          },
          params: {
            "businessType": num
          },
          timeout: 5000
        }).then(function (e) {
          var data = e.body;
          if (data.success == true) {
            if (data.code == 1) {
              this.tradeList = data.data.tradeList;
              if (this.tradeList == null) this.emptyShow = true;
              for (var i = 0; i < this.tradeList.length; i++) {
                if (this.tradeList[i].stateType == 4) {
                  this.tradeListUserful.push(this.tradeList[i]);
                }
              }
            }
          } else {
            switch (data.code) {
              case '-1':
                this.$refs.dialog.isShow = true;
                this.msg = '账号已变更，请重新重新登录';
                break;
              default:
                break;
            }
          }
        }.bind(this), function () {
          this.$refs.dialog.isShow = true;
          this.msg = '网络不给力，请稍后再试！'
        });
      },
      scrollEvent: function () {
        if (this.show == 0) {
          if (document.getElementById('margin_trade_static') != null) {
            var h = document.getElementById('margin_trade_static').scrollTop - document.body.scrollTop + $('#margin_trade_static').height() + 30;
            if (h < 0) {
              this.bondShow = true;
            } else {
              this.bondShow = false;
            }
          }
        }
      }
    },
    mounted: function () {
      //初始化页面高度
      var h = window.screen.height - $("#topbar").height() - $("#navbar").height() - 20;
//			$(".main").height(h);
      $('.margin_trade>ul>li:first-child>div>div').addClass('current');
      //初始化banner
      this.getBanner();
      var gallery = mui('.mui-slider');
      gallery.slider({
        interval: 0 //自动轮播周期，若为0则不自动播放，默认为0;
      });
      //保证金置顶
      window.addEventListener('scroll', this.scrollEvent)
//			var obj = document.getElementById('applydetail');
//			obj.addEventListener("touchmove",function(e){
//				e.preventDefault();
//				this.scrollEvent();
//			}.bind(this), false);
    },
    activated: function () {
      if (this.$route.query.type == 0 || this.$route.query.type == 1) {
        this.$store.state.openPage = this.$route.query.type;
      }
      // if(this.openPage == 0){
      // 	this.getFuturesData();
      // }
      this.getFuturesData();
      this.bondShow = false;
      //初始化页面显示申请开户
      //判断是否显示开户记录
      // if(this.$route.query.type == '1'){
      // 	this.isselected = 1;
      // 	this.show = false;
      // }
      //获取本地用户信息
      if (localStorage.user) {
        this.userInfo = localStorage.user ? JSON.parse(localStorage.user) : '';
        //获取操盘记录列表
        this.getOperateDetails();
      }
      //判断是否登录
    },
    beforeDestroy: function () {
    }
  }
</script>

<style scoped lang="less">
  @import url("../assets/css/base.less");
  @import url("../assets/css/main.less");
  /*ip6p及以上*/
  @media (min-width: 411px) {
    #applydetail {
      padding: 50px 0;
      // height: 100%;
      overflow: hidden;

      #header-box {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 10;
      }

      .customer-box {
        .hidden-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, .8);
          top: 0;
          left: 0;
          z-index: 10;
          overflow: hidden;
        }

        .customer-option {
          position: absolute;
          width: 90%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 11;
        }
      }

      .shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .7);
        z-index: 1200;
      }

      .haveAccountList {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        background: #36394d;
        z-index: 1300;

        .have-account-title {
          text-align: center;
          background: #242633;
          height: 40px;
          line-height: 40px;
          color: #fff;
          font-size: 14px;
        }

        .have-account-content {
          background: #36394d;
          max-height: 180px;
          overflow: auto;

          .account-item {
            height: 60px;
            padding: 10px;
            border-bottom: solid 1px #1b1b26;

            .trade-account {
              text-align: left;
              color: #fff;
              font-size: 14px;
            }

            .trade-bound {
              text-align: left;
              color: #ffd400;
              font-size: 18px;
            }
          }
        }

        .have-account-btn {
          background: #242633;
          color: #fff;
          font-size: 14px;
          display: flex;

          div {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50px;
          }
        }
      }
    }

    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .margin_trade {
      /*height: 158px;*/
      overflow: hidden;
      background: #242633;
      padding: 10px 15px 0 15px;
      border-bottom: 5px solid #1b1b26;

      p {
        margin-top: 15px;
      }

      ul {
        li {
          width: 25%;
          margin-top: 13px;

          div {
            margin: 0 auto;
          }
        }
      }

      &.margin_trade_fixed {
        position: fixed;
        top: 50px;
        z-index: 1111;
      }
    }

    .margin_trade_show {
      overflow: hidden;
      background: #242633;
      border-bottom: 5px solid #1b1b26;

      li {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        padding-left: 15px;
        border-top: 1px solid #1b1b26;

        &:first-child {
          border-top: none;
        }
      }
    }

    .notice {
      height: 70px;
      background: #242633;
      padding-left: 15px;
      font-size: 14px;
      border-top: 5px solid @black;

      p:nth-child(1) {
        margin-top: 15px;
      }
    }

    .datalist {
      width: 100%;
      overflow: hidden;
      background: @deepblue;
      overflow-x: scroll;

      ul {
        width: 950px;

        &.list_head {
          overflow: hidden;
          background: #36394d;

          li span {
            &:first-child {
              color: @blue;
            }
          }
        }

        &.list_cont li span {
          &:nth-child(2) {
            color: @blue;
          }
        }

        li {
          float: left;
          height: 54px;
          text-align: center;
          border-top: 1px solid @black;
          border-left: 1px solid @black;
          padding: 0 15px;

          &.odd {
            line-height: 54px;
          }

          &.even {
            padding-top: 7px;
          }

          &:first-child {
            width: 150px;
          }

          &:nth-child(2) {
            width: 110px;
          }

          &:nth-child(3) {
            width: 220px;
          }

          &:nth-child(4) {
            width: 220px;
          }

          &:nth-child(5) {
            width: 250px;
          }

          span {
            display: block;
            color: @white;
            font-size: @fs14;
          }
        }
      }
    }

    .info {
      height: 90px;
      border-bottom: 10px solid #1b1b26;
      border-top: 5px solid #1b1b26;
      background: #242633;

      li {
        height: 40px;
        padding-left: 15px;
        line-height: 40px;
        font-size: 14px;

        &:first-child {
          border-bottom: 1px solid #1b1b26;
        }
      }
    }

    .bottom {
      // height: 105px;
      background: #242633;

      li {
        // height: 40px;
        line-height: 40px;
        text-align: center;

        .haveAccount {
          margin-top: 10px;
          color: #fff;
          font-size: 13px;

          span {
            margin-left: 5px;
            color: #ffd400;
          }
        }

        &:first-child {
          border-bottom: 1px solid #1b1b26;
          font-size: 16px * @ip6p;
        }

        &:last-child {
          padding-top: 5px;
        }
      }
    }

    .title {
      width: 100%;
      height: 44px;
      overflow: hidden;
      border-bottom: 1px solid @black;
      background: @deepblue;
      padding: 0px 20px;
      box-sizing: content-box;

      ul {
        display: flex;
      }

      li {
        float: left;
        height: 40px;
        text-align: center;
        padding: 0 10px;

        span {
          display: inline-block;
          height: 40px;
          line-height: 40px;
          border-bottom: 4px solid @deepblue;
          color: @white;
          font-size: @fs16;
        }

        &.current {
          span {
            border-color: @yellow;
            color: @yellow;
          }
        }
      }
    }

    .mui-slider {
      width: 100%;
      height: 150px;
      background-color: #242633;

      .mui-slider-group {
        height: 150px;

        .mui-slider-item {
          width: 100%;
          height: 150px;
          overflow: hidden;
          padding: 15px;

          img {
            width: 100%;
            height: 120px;
            vertical-align: bottom;
          }
        }
      }
    }

    .page_cont {
      width: 100%;
      overflow-y: scroll;

      li {
        overflow: hidden;
        background: @deepblue;
        margin-bottom: 10px;

        &.settlement {
          background: #2d3040;
        }

        &:last-child {
          margin: 0;
        }

        .record_title {
          height: 44px;
          padding: 0 15px;
          border-bottom: 1px solid @black;

          span {
            line-height: 44px;
            color: #7a7f99;
            font-size: @fs14;

            &:first-child {
              display: inline-block;
              height: 22px;
              line-height: 22px;
              padding: 0 15px;
              overflow: hidden;
              font-size: @fs14;
              color: @black;
              border-radius: 4px;
              margin: 11px;
            }

            &.yellow {
              background: @yellow;
            }

            &.blue {
              background: @blue;
            }

            &.deepblue {
              color: @blue;
              background: @deepblueshallow;
            }

            &.grey {
              background: #ddd;
            }

            &.red {
              color: @white;
              background: #ff5533;
            }
          }

          .icon_arrow {
            width: 24px;
            height: 44px;
            background: url(../assets/img/arrow.png) no-repeat right 15px;
            background-size: 8px 14px;
          }
        }

        .record_cont {
          height: 88px;
          padding: 18px 15px 12px 15px;

          p {
            float: left;
            width: 50%;
            line-height: 28px;
            font-size: @fs16;
            color: @blue;

            &:nth-child(2), &:nth-child(4) {
              text-align: right;
            }

            span {
              color: @white;

              &.spe {
                font-size: @fs14;
                color: #7a7f99;
              }
            }
          }
        }
      }
    }

    .empty {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -46px 0 0 -207px;
      width: 414px;
      height: 92px;
      overflow: hidden;
      text-align: center;

      .icon_none {
        display: inline-block;
        width: 84px;
        height: 56px;
        overflow: hidden;
        background: url(../assets/img/none.png) no-repeat center center;
        background-size: 100% 100%;
      }

      p {
        text-align: center;
        margin-top: 10px;
      }
    }
  }

  /*ip6*/
  @media (min-width: 371px) and (max-width: 410px) {
    #applydetail {
      padding: 50px*@ip6 0;

      #header-box {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 10;
      }

      .customer-box {
        .hidden-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, .8);
          top: 0;
          left: 0;
          z-index: 10;
        }

        .customer-option {
          position: absolute;
          width: 90%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 11;
        }
      }

      .shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .7);
        z-index: 1200;
      }

      .haveAccountList {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        background: #36394d;
        z-index: 1300;

        .have-account-title {
          text-align: center;
          background: #242633;
          height: 40px*@ip6;
          line-height: 40px*@ip6;
          color: #fff;
          font-size: 14px*@ip6;
        }

        .have-account-content {
          background: #36394d;
          max-height: 180px*@ip6;
          overflow: auto;

          .account-item {
            height: 60px*@ip6;
            padding: 10px*@ip6;
            border-bottom: solid 1px*@ip6 #1b1b26;

            .trade-account {
              text-align: left;
              color: #fff;
              font-size: 14px*@ip6;
            }

            .trade-bound {
              text-align: left;
              color: #ffd400;
              font-size: 18px*@ip6;
            }
          }
        }

        .have-account-btn {
          background: #242633;
          color: #fff;
          font-size: 14px*@ip6;
          display: flex;

          div {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50px*@ip6;
          }
        }
      }
    }

    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .margin_trade {
      //height: 158px*@ip6;
      overflow: hidden;
      background: #242633;
      padding: 0 15px*@ip6 10px @ip6 15px*@ip6;
      border-bottom: 5px*@ip6 solid #1b1b26;

      p {
        margin-top: 15px*@ip6;
      }

      ul {
        li {
          width: 25%;
          margin-top: 13px*@ip6;

          div {
            margin: 0 auto;
          }
        }
      }

      &.margin_trade_fixed {
        position: fixed;
        top: 50px*@ip6;
        z-index: 1111;
      }
    }

    .margin_trade_show {
      overflow: hidden;
      background: #242633;
      border-bottom: 5px*@ip6 solid #1b1b26;

      li {
        height: 40px*@ip6;
        line-height: 40px*@ip6;
        font-size: 14px*@ip6;
        padding-left: 15px*@ip6;
        border-top: 1px solid #1b1b26;

        &:first-child {
          border-top: none;
        }
      }
    }

    .notice {
      height: 70px*@ip6;
      background: #242633;
      padding-left: 15px*@ip6;
      font-size: 14px*@ip6;
      border-top: 5px*@ip6 solid @black;

      p:nth-child(1) {
        margin-top: 15px*@ip6;
      }
    }

    .datalist {
      width: 100%;
      overflow: hidden;
      background: @deepblue;
      overflow-x: scroll;

      ul {
        width: 950px*@ip6;

        &.list_head li span {
          &:first-child {
            color: @blue;
          }
        }

        &.list_cont li span {
          &:nth-child(2) {
            color: @blue;
          }
        }

        li {
          float: left;
          height: 54px*@ip6;
          text-align: center;
          border-top: 1px solid @black;
          border-left: 1px solid @black;
          padding: 0 15px*@ip6;

          &.odd {
            line-height: 54px*@ip6;
          }

          &.even {
            padding-top: 7px*@ip6;
          }

          &:first-child {
            width: 150px*@ip6;
          }

          &:nth-child(2) {
            width: 110px*@ip6;
          }

          &:nth-child(3) {
            width: 220px*@ip6;
          }

          &:nth-child(4) {
            width: 220px*@ip6;
            line-height: 13px;
          }

          &:nth-child(5) {
            width: 250px*@ip6;
          }

          span {
            display: block;
            color: @white;
            font-size: @fs14*@ip6;
          }
        }
      }
    }

    .info {
      height: 90px*@ip6;
      border-bottom: 10px solid #1b1b26;
      border-top: 5px solid #1b1b26;
      background: #242633;

      li {
        height: 40px*@ip6;
        padding-left: 15px*@ip6;
        line-height: 40px*@ip6;
        font-size: 14px*@ip6;

        &:first-child {
          border-bottom: 1px solid #1b1b26;
        }
      }
    }

    .bottom {
      // height: 105px*@ip6;
      background: #242633;

      li {
        // height: 40px*@ip6;
        line-height: 40px*@ip6;
        text-align: center;

        .haveAccount {
          margin-top: 10px*@ip6;
          color: #fff;
          font-size: 13px*@ip6;

          span {
            margin-left: 5px*@ip6;
            color: #ffd400;
          }
        }

        &:first-child {
          border-bottom: 1px solid #1b1b26;
          font-size: 16px*@ip6p;
        }

        &:last-child {
          padding-top: 5px*@ip6;
        }
      }
    }

    .title {
      width: 100%;
      height: 44px*@ip6;
      overflow: hidden;
      border-bottom: 1px*@ip6 solid @black;
      background: @deepblue;
      padding: 0px*@ip6 20px*@ip6;
      box-sizing: content-box;

      ul {
        display: flex;
      }

      li {
        float: left;
        height: 40px*@ip6;
        text-align: center;
        padding: 0 10px*@ip6;

        span {
          display: inline-block;
          height: 40px*@ip6;
          line-height: 40px*@ip6;
          border-bottom: 4px*@ip6 solid @deepblue;
          color: @white;
          font-size: @fs16;
        }

        &.current {
          span {
            border-color: @yellow;
            color: @yellow;
          }
        }
      }
    }

    .mui-slider {
      width: 100%;
      height: 150px*@ip6;
      background-color: #242633;

      .mui-slider-group {
        height: 150px*@ip6;

        .mui-slider-item {
          width: 100%;
          height: 150px*@ip6;
          overflow: hidden;
          padding: 15px*@ip6;

          img {
            width: 100%;
            height: 120px*@ip6;
            vertical-align: bottom;
          }
        }
      }
    }

    .page_cont {
      width: 100%;
      overflow-y: scroll;

      li {
        overflow: hidden;
        background: @deepblue;
        margin-bottom: 10px*@ip6;

        &.settlement {
          background: #2d3040;
        }

        &:last-child {
          margin: 0;
        }

        .record_title {
          height: 44px*@ip6;
          padding: 0 15px*@ip6;
          border-bottom: 1px solid @black;

          span {
            line-height: 44px*@ip6;
            color: #7a7f99;
            font-size: @fs14*@ip6;

            &:first-child {
              display: inline-block;
              height: 22px*@ip6;
              line-height: 22px;
              padding: 0 15px*@ip6;
              overflow: hidden;
              font-size: @fs14*@ip6;
              color: @black;
              border-radius: 4px*@ip6;
              margin: 11px;
            }

            &.yellow {
              background: @yellow;
            }

            &.blue {
              background: @blue;
            }

            &.deepblue {
              color: @blue;
              background: @deepblueshallow;
            }

            &.grey {
              background: #ddd;
            }

            &.red {
              color: @white;
              background: #ff5533;
            }
          }

          .icon_arrow {
            width: 24px*@ip6;
            height: 44px*@ip6;
            background: url(../assets/img/arrow.png) no-repeat right 15px*@ip6;
            background-size: 8px*@ip6 14px*@ip6;
          }
        }

        .record_cont {
          height: 88px*@ip6;
          padding: 18px*@ip6 15px*@ip6 12px*@ip6 15px*@ip6;

          p {
            float: left;
            width: 50%;
            line-height: 28px*@ip6;
            font-size: @fs16*@ip6;
            color: @blue;

            &:nth-child(2), &:nth-child(4) {
              text-align: right;
            }

            span {
              color: @white;

              &.spe {
                font-size: @fs14;
                color: #7a7f99;
              }
            }
          }
        }
      }
    }

    .empty {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -46px*@ip6 0 0 -207px*@ip6;
      width: 414px*@ip6;
      height: 92px*@ip6;
      overflow: hidden;
      text-align: center;

      .icon_none {
        display: inline-block;
        width: 84px*@ip6;
        height: 56px*@ip6;
        overflow: hidden;
        background: url(../assets/img/none.png) no-repeat center center;
        background-size: 100% 100%;
      }

      p {
        text-align: center;
        margin-top: 10px*@ip6;
      }
    }
  }

  /*ip5*/
  @media (max-width: 370px) {
    #applydetail {
      padding: 50px*@ip5 0;

      #header-box {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 10;
      }

      .customer-box {
        .hidden-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, .8);
          top: 0;
          left: 0;
          z-index: 10;
        }

        .customer-option {
          position: absolute;
          width: 90%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 11;
        }
      }

      .shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .7);
        z-index: 1200;
      }

      .haveAccountList {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        background: #36394d;
        z-index: 1300;

        .have-account-title {
          text-align: center;
          background: #242633;
          height: 40px*@ip5;
          line-height: 40px*@ip5;
          color: #fff;
          font-size: 14px*@ip5;
        }

        .have-account-content {
          background: #36394d;
          max-height: 180px*@ip5;
          overflow: auto;

          .account-item {
            height: 60px*@ip5;
            padding: 10px*@ip5;
            border-bottom: solid 1px*@ip5 #1b1b26;

            .trade-account {
              text-align: left;
              color: #fff;
              font-size: 14px*@ip5;
            }

            .trade-bound {
              text-align: left;
              color: #ffd400;
              font-size: 18px*@ip5;
            }
          }
        }

        .have-account-btn {
          background: #242633;
          color: #fff;
          font-size: 14px*@ip5;
          display: flex;

          div {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50px*@ip5;
          }
        }
      }
    }

    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .margin_trade {
      //height: 158px*@ip5;
      overflow: hidden;
      background: #242633;
      padding: 0 15px*@ip5 10px @ip5 15px*@ip5;
      border-bottom: 5px*@ip5 solid #1b1b26;

      p {
        margin-top: 15px*@ip5;
      }

      ul {
        li {
          width: 25%;
          margin-top: 13px*@ip5;

          div {
            margin: 0 auto;
          }
        }
      }

      &.margin_trade_fixed {
        position: fixed;
        top: 50px*@ip5;
        z-index: 1111;
      }
    }

    .margin_trade_show {
      overflow: hidden;
      background: #242633;
      border-bottom: 5px*@ip5 solid #1b1b26;

      li {
        height: 40px*@ip5;
        line-height: 40px*@ip5;
        font-size: 14px*@ip5;
        padding-left: 15px*@ip5;
        border-top: 1px solid #1b1b26;

        &:first-child {
          border-top: none;
        }
      }
    }

    .notice {
      background: #242633;
      padding: 15px*@ip5;
      font-size: 14px*@ip5;
      border-top: 5px*@ip5 solid @black;

      p:nth-child(1) {
        margin-top: 15px*@ip5;
      }
    }

    .datalist {
      width: 100%;
      overflow: hidden;
      background: @deepblue;
      overflow-x: scroll;

      ul {
        width: 950px*@ip5;

        &.list_head li span {
          &:first-child {
            color: @blue;
          }
        }

        &.list_cont li span {
          &:nth-child(2) {
            color: @blue;
          }
        }

        li {
          float: left;
          height: 54px*@ip5;
          text-align: center;
          border-top: 1px solid @black;
          border-left: 1px solid @black;
          padding: 0 5px*@ip5;

          &.odd {
            line-height: 54px*@ip5;
          }

          &.even {
            padding-top: 7px*@ip5;
            line-height: 16px;
          }

          &:first-child {
            width: 150px*@ip5;
          }

          &:nth-child(2) {
            width: 110px*@ip5;
          }

          &:nth-child(3) {
            width: 220px*@ip5;
          }

          &:nth-child(4) {
            width: 220px*@ip5;
            line-height: 12px;
          }

          &:nth-child(5) {
            width: 250px*@ip5;
          }

          span {
            display: block;
            color: @white;
            font-size: @fs14*@ip5;
          }
        }
      }
    }

    .info {
      height: 90px*@ip5;
      border-bottom: 10px solid #1b1b26;
      border-top: 5px solid #1b1b26;
      background: #242633;

      li {
        height: 40px*@ip5;
        padding-left: 15px*@ip5;
        line-height: 40px*@ip5;
        font-size: 14px*@ip5;

        &:first-child {
          border-bottom: 1px solid #1b1b26;
        }
      }
    }

    .bottom {
      // height: 105px*@ip5;
      background: #242633;

      li {
        // height: 40px*@ip5;
        line-height: 40px*@ip5;
        text-align: center;

        .haveAccount {
          margin-top: 10px*@ip5;
          color: #fff;
          font-size: 13px*@ip5;

          span {
            margin-left: 5px*@ip5;
            color: #ffd400;
          }
        }

        &:first-child {
          border-bottom: 1px solid #1b1b26;
          font-size: 16px*@ip5;
        }

        &:last-child {
          padding-top: 5px*@ip5;
        }
      }
    }

    .title {
      width: 100%;
      height: 44px*@ip5;
      overflow: hidden;
      border-bottom: 1px*@ip5 solid @black;
      background: @deepblue;
      padding: 0px*@ip5 20px*@ip5;
      box-sizing: content-box;

      ul {
        display: flex;
      }

      li {
        float: left;
        height: 40px*@ip5;
        text-align: center;
        padding: 0 10px*@ip5;

        span {
          display: inline-block;
          height: 40px*@ip5;
          line-height: 40px*@ip5;
          border-bottom: 4px*@ip5 solid @deepblue;
          color: @white;
          font-size: @fs16;
        }

        &.current {
          span {
            border-color: @yellow;
            color: @yellow;
          }
        }
      }
    }

    .mui-slider {
      width: 100%;
      height: 150px*@ip5;
      background-color: #242633;

      .mui-slider-group {
        height: 150px*@ip5;

        .mui-slider-item {
          width: 100%;
          height: 150px*@ip5;
          overflow: hidden;
          padding: 15px*@ip5;

          img {
            width: 100%;
            height: 120px*@ip5;
            vertical-align: bottom;
          }
        }
      }
    }

    .page_cont {
      width: 100%;
      overflow-y: scroll;

      li {
        overflow: hidden;
        background: @deepblue;
        margin-bottom: 10px*@ip5;

        &.settlement {
          background: #2d3040;
        }

        &:last-child {
          margin: 0;
        }

        .record_title {
          height: 44px*@ip5;
          padding: 0 15px*@ip5;
          border-bottom: 1px solid @black;

          span {
            line-height: 44px*@ip5;
            color: #7a7f99;
            font-size: @fs14*@ip5;

            &:first-child {
              display: inline-block;
              height: 22px*@ip5;
              line-height: 18px;
              padding: 0 15px*@ip5;
              overflow: hidden;
              font-size: @fs14*@ip5;
              color: @black;
              border-radius: 4px*@ip5;
              margin: 11px;
            }

            &.yellow {
              background: @yellow;
            }

            &.blue {
              background: @blue;
            }

            &.deepblue {
              color: @blue;
              background: @deepblueshallow;
            }

            &.grey {
              background: #ddd;
            }

            &.red {
              color: @white;
              background: #ff5533;
            }
          }

          .icon_arrow {
            width: 24px*@ip5;
            height: 44px*@ip5;
            background: url(../assets/img/arrow.png) no-repeat right 15px*@ip5;
            background-size: 8px*@ip5 14px*@ip5;
          }
        }

        .record_cont {
          height: 88px*@ip5;
          padding: 18px*@ip5 15px*@ip5 12px*@ip5 15px*@ip5;

          p {
            float: left;
            width: 50%;
            line-height: 28px*@ip5;
            font-size: @fs16*@ip5;
            color: @blue;

            &:nth-child(2), &:nth-child(4) {
              text-align: right;
            }

            span {
              color: @white;

              &.spe {
                font-size: @fs12;
                color: #7a7f99;
              }
            }
          }
        }
      }
    }

    .empty {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -46px*@ip5 0 0 -207px*@ip5;
      width: 414px*@ip5;
      height: 92px*@ip5;
      overflow: hidden;
      text-align: center;

      .icon_none {
        display: inline-block;
        width: 84px*@ip5;
        height: 56px*@ip5;
        overflow: hidden;
        background: url(../assets/img/none.png) no-repeat center center;
        background-size: 100% 100%;
      }

      p {
        text-align: center;
        margin-top: 10px*@ip5;
      }
    }
  }
</style>
