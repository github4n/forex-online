<template>
  <div id="tradeDetails">
    <tipsDialog :msg="msgTips"></tipsDialog>
    <topbar title="国际综合"></topbar>
    <back></back>
    <cs title="操盘细则" type="1" @tap.native="toTradersRules"></cs>
    <div class="page_cont">
      <div class="tab_box" id="tab_box">
        <ul>
          <li @tap="showCont"><span :class="{'current':isShow}">方案明细</span></li>
          <li @tap="showCont"><span :class="{'current':!isShow}">历史成交记录</span></li>
        </ul>
      </div>
      <!--方案明细-->
      <div class="plan_details" v-if="isShow&&!optionError">
        <p class="plan_status opening" v-show="openShow">开户中</p>
        <p class="plan_status settlement" v-show="settlementShow">已结算</p>
        <p class="plan_status settlement" v-show="finishingShow">结算中</p>
        <p class="plan_status settlement" v-show="errorShow">开户失败</p>
        <div class="d">
          <ul class="dul">
            <li class="fl">
              <template v-for="(v,k) in tradeDetails.outDiskVoList">
                <div v-if="k%2 == 0">投资标的：</div>
              </template>
            </li>
            <li class="fl">
              <template v-for="(v,k) in tradeDetails.outDiskVoList">
                <!-- V1 -->
                <!--<div v-if="k%2 == 0&&$store.state.appVersion=='v1'" class="fontwhite" >{{v.tradeType | varieties}}<span class="fontgray">{{v.mainContract}}</span></div>-->
                <div v-if="k%2 == 0&&$store.state.appVersion=='v1'" class="fontwhite" style="white-space: nowrap">
                  {{v.tradeName}}<span class="fontgray">{{v.mainContract}}</span></div>
                <!-- V2 -->
                <!--<div v-if="k%2 == 0&&$store.state.appVersion=='v2'" class="fontwhite">{{v.mainContract | varieties2}}<span class="fontgray">{{v.mainContract}}</span></div>-->
                <div v-if="k%2 == 0&&$store.state.appVersion=='v2'" class="fontwhite" style="white-space: nowrap">
                  {{v.tradeName}}<span class="fontgray">{{v.mainContract}}</span></div>
              </template>
            </li>
            <li class="fl">
              <template v-for="(v,k) in tradeDetails.outDiskVoList">
                <!-- V1 -->
                <!--<div v-if="k%2 == 1&&$store.state.appVersion=='v1'" class="fontwhite" >{{v.tradeType | varieties}}<span class="fontgray">{{v.mainContract}}</span></div>-->
                <div v-if="k%2 == 1&&$store.state.appVersion=='v1'" class="fontwhite" style="white-space: nowrap">
                  {{v.tradeName}}<span class="fontgray">{{v.mainContract}}</span></div>
                <!-- V2 -->
                <!--<div v-if="k%2 == 1&&$store.state.appVersion=='v2'" class="fontwhite" >{{v.mainContract | varieties2}}<span class="fontgray">{{v.mainContract}}</span></div>-->
                <div v-if="k%2 == 1&&$store.state.appVersion=='v2'" class="fontwhite" style="white-space: nowrap">
                  {{v.tradeName}}<span class="fontgray">{{v.mainContract}}</span></div>

              </template>
            </li>
          </ul>
          <p class="tradetime">
            <span class="fontgray">交易时间：</span>
            <span class="fontwhite">9:05-23:55，不同期货不同交易时间段</span>
            <span class="fontwhite" v-show="openShow | settlementShow"></span>
          </p>
        </div>
        <div class="plan_details_row" v-show="operateShow">
          <ul>
            <li>
              <span class="title">持仓隔夜:</span>
              <span>不支持</span>
            </li>
            <li>
              <span class="title">操盘账户：</span>
              <span>{{tradeDetails.tranAccount}}</span>
              <cbtn v-if="$route.query.type == 4" name="立即操盘" @tap.native="toTradeLogin"></cbtn>
            </li>
            <li>
              <span class="title">操盘密码：</span>
              <span>{{tradeDetails.tranPassword}}</span>
            </li>
          </ul>
        </div>
        <div class="plan_details_row">
          <ul>
            <li v-if="$route.query.type == 4||$route.query.type == 2">
              <span class="title">累计提取盈利：</span>
              <span class="white">{{tradeDetails.totalWithdrawal * rateProfit | getTwoNumber(2)}}元</span>
            </li>
            <li>
              <span class="title">方案申请时间：</span>
              <span class="white">{{tradeDetails.appTime | getTime('yyyy-MM-dd HH:mm')}}</span>
            </li>
            <li>
              <span class="title">最大持仓手数：</span>
              <span class="white">参考初级可持仓手数</span>
            </li>
            <li>
              <span class="title">操盘保证金：</span>
              <span class="white">{{tradeDetails.traderBond | getTwoNumber}}元</span>
            </li>
            <li>
              <span class="title">追加保证金：</span>
              <span class="white">{{tradeDetails.appendTraderBond | getTwoNumber}}元</span>
              <cbtn v-if="$route.query.type == 4" name="追加资金" v-show="operateShow" @tap.native="toAddMoney"></cbtn>
            </li>
            <li>
              <span class="title">总操盘资金：</span>
              <span class="white">{{tradeDetails.traderTotal | getTwoNumber}}美元</span>
            </li>
            <li>
              <span class="title">亏损平仓线：</span>
              <span class="white">{{tradeDetails.lineLoss | getTwoNumber}}美元</span>
            </li>
            <li>
              <span class="title">账户管理费：</span>
              <span class="white">免费</span>
            </li>
          </ul>
          <div v-if="$route.query.type == 4" class="profit-out" v-show="operateShow" @click.stop="profitOut">
            盈利提取
          </div>
          <btn name="免费申请终结方案" v-if="$route.query.type == 4" v-show="operateShow" @tap.native="applyStopOrder"></btn>
        </div>
        <div class="plan_details_row" v-show="settlementShow">
          <ul id="ddd">
            <li>
              <span class="title">方案结算时间：</span>
              <span class="white">{{tradeDetails.endtime | getTime('yyyy-MM-dd HH:mm')}}</span>
            </li>
            <li>
              <span class="title">结算盈亏：</span>
              <span v-if="$store.state.appVersion == 'v1'" :class="[{'fontred':isred},{'fontgreen':!isred}]">{{tradeDetails.tranProfitLoss}}美元（{{(tradeDetails.tranProfitLoss*tradeDetails.endParities).toFixed(2)}}人民币）</span>
              <span v-if="$store.state.appVersion == 'v2'" :class="[{'fontred':isred},{'fontgreen':!isred}]">{{tradeDetails.tranProfitLoss}}美元（{{(tradeDetails.tranProfitLoss*rateTrade).toFixed(2)}}人民币）</span>
            </li>
            <li>
              <span class="title">美元结算汇率：</span>
              <span v-if="$store.state.appVersion == 'v1'" class="white">1美元={{tradeDetails.endParities}}元</span>
              <span v-if="$store.state.appVersion == 'v2'" class="white">1美元={{rateTrade}}元</span>
            </li>
          </ul>
          <div class="num_total">
            <template v-if="$store.state.appVersion == 'v1'" v-for="key in tradeDetails.outDiskVoList">
              <!--<template v-for="k in JSON.parse(tradeDetails.domesticActualLever)">-->
              <!--<div v-if="key.mainContract === k.commodityNo" class="num_total_col">-->
              <!--<span >{{key.tradeName}}</span>-->
              <!--&lt;!&ndash;<span>{{key.tradeType | varieties}}</span>&ndash;&gt;-->
              <!--<span v-if="key.mainContract === k.commodityNo">{{k.ActualLever}}手</span>-->
              <!--</div>-->
              <!--</template>-->

              <div class="num_total_col">
                <span>{{key.tradeName}}</span>
                <span>{{filterContract(key.mainContract)}}手</span>
                <!--<template v-if="tradeDetails.domesticActualLever !== null"-->
                          <!--v-for="k in JSON.parse(tradeDetails.domesticActualLever)">-->
                  <!--<span v-if="key.mainContract === k.commodityNo">{{k.ActualLever}}手</span>-->
                  <!--<span v-else>{{k.ActualLever}}0手</span>-->
                <!--</template>-->
                <!--<span v-if="tradeDetails.domesticActualLever === null">0手</span>-->
              </div>


            </template>
            <template v-if="$store.state.appVersion == 'v2'" v-for="key in tradeLever">
              <div class="num_total_col">
                <!--<span>{{key.name}}</span>-->
                <!--<span>{{key.ActualLever}}手</span>-->
                <span>{{key.tradeName}}</span>
                <span>{{key.tranLever}}手</span>
              </div>
            </template>
          </div>
          <ul>
            <li>
              <span class="title">结算金额：</span>
              <span class="white">{{tradeDetails.endAmount | loss}}元</span>
            </li>
            <li>
              <span class="title">交易手续费：</span>
              <span class="white">{{tradeDetails.tranFeesTotal}}元</span>
            </li>
          </ul>
          <h2>提示：</h2>
          <p class="tips">结算金额（{{tradeDetails.endAmount | getTwoNumber}}）=操盘保证金（{{tradeDetails.traderBond |
            getTwoNumber}}）+追加保证金（{{tradeDetails.appendTraderBond | getTwoNumber}}）+ 结算盈亏（<span
              v-if="$store.state.appVersion == 'v1'">{{tradeDetails.tranProfitLoss*tradeDetails.endParities | getTwoNumber}}</span><span
              v-if="$store.state.appVersion == 'v2'">{{tradeDetails.tranProfitLoss*rateTrade | getTwoNumber}}</span>）-交易手续费（{{tradeDetails.tranFeesTotal
            | getTwoNumber}}）-提取总利润
            ({{tradeDetails.totalWithdrawal | getTwoNumber}})。</p>
        </div>
      </div>
      <!--历史成交记录-->
      <div class="list_cont" v-else>
        <ul>
          <li>
            <span>序号</span>
            <span>成交日期</span>
            <span>客户号</span>
            <span>币种</span>
            <span>交易所</span>
            <span>品种</span>
            <span>买</span>
            <span>卖</span>
            <span>成交价</span>
            <span>平仓盈亏</span>
            <span>交易手续费</span>
          </li>
          <template v-for="(key,index) in getFstTradeDetail">
            <li>
              <span>{{index + 1}}</span>
              <span>{{key.tradeDate}}</span>
              <span>{{key.userNo}}</span>
              <span>{{key.currencyNo}}</span>
              <span>{{key.exchangeNo}}</span>
              <span>{{key.commodityNo}}</span>
              <span>{{key.buyNum}}</span>
              <span>{{key.sellNum}}</span>
              <span>{{key.tradePrice | fixNum2(orderTemplist[key.commodityNo.slice(0, -4)].DotSize)}}</span>
              <span>{{key.hedgeProfit}}</span>
              <span>{{key.free | getTwoNumber}}</span>
              <!--<span :class="{red: key.type_color == 'red', green: key.type_color == 'green'}">{{key.type}}</span>-->
              <!--<span :class="{red: key.type_color == 'red', green: key.type_color == 'green'}">{{key.money}}</span>-->
            </li>
          </template>
          <li class="no-history" v-show="getFstTradeDetail.length == 0">
            无历史成交记录
          </li>
        </ul>
      </div>
    </div>

    <!-- <div class="tips-box" v-show="sysTips">
            <div class="tips-title">
                系统提示
                <img @click="tipsFun(1)" src="../../assets/img/x.png" />
            </div>
            <div class="tips-content" v-show="tips1">
                当前账号有持仓，无法进行提取盈利
            </div>
            <div class="tips-content" v-show="tips2">
                登录账号才能提取盈利
            </div>
            <div class="tips-btn">
                <span @click="tipsFun(1)">取消</span>
                <span @click="tipsFun(2)" v-show="tips1">交易中心>></span>
                <span @click="tipsFun(3)" v-show="tips2">登录>></span>
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
  import btn from '../../components/bigBtn.vue'
  import cbtn from '../../components/conditionBtn.vue'
  import {setTimeout} from 'timers';

  export default {
    name: 'tradeDetails',
    components: {topbar, back, cs, btn, cbtn, tipsDialog},
    data() {
      return {
        msg: '',
        status: '',
        isShow: true,
        errorShow: false,
        openShow: false,
        operateShow: false,
        settlementShow: false,
        type: '',
        tradeDetails: '',
        getFstTradeDetail: '',
        tradeDetailsId: '',
        userInfo: '',
//				endParitie: '',
        optionError: false,
        sysTips: false, //系统提示框
        tips1: false,//持仓提示
        tips2: false,//登录提示
        tradeLever: [],//
        finishingShow: false,
        rateProfit: 1,//盈利提取汇率
        rateTrade: 1 //交易汇率
      }
    },
    filters: {
      fixNum2: function (num, dotsize) {
        return parseFloat(num).toFixed(dotsize);
      },
      varieties2: function (e) {
        switch (e) {
          case 'au':
            return '沪金';
          case 'i':
            return '铁矿石';
          case 'IC':
            return '中证500指数';
          case 'j':
            return '冶金焦炭';
          case 'jm':
            return '焦煤';
          case 'ni':
            return '沪镍';
          case 'rb':
            return '螺纹钢';
          case 'ru':
            return '天然橡胶';
          case 'sc':
            return '中质含硫原油';
          case 'ag':
            return '银';
          case 'bu':
            return '石油沥青';
          case 'cu':
            return '沪铜';
          case 'hc':
            return '热轧卷板';
          case 'IF':
            return '沪深300指数';
          case 'IH':
            return '上证50指数';
        }
        return e;
      },
      varieties: function (e) {
        switch (e) {
          case 0:
            return "富时A50";
            break;
          case 6:
            return "国际原油";
            break;
          case 7:
            return "恒指期货";
            break;
          case 9:
            return "迷你道指";
            break;
          case 10:
            return "迷你纳指";
            break;
          case 11:
            return "迷你标普";
            break;
          case 12:
            return "德国DAX";
            break;
          case 13:
            return "日经225";
            break;
          case 14:
            return "小恒指";
            break;
          case 15:
            return "美黄金";
            break;
          case 16:
            return "H股指数";
            break;
          case 17:
            return "小H股指数";
            break;
          case 18:
            return "美铜  ";
            break;
          case 19:
            return "美白银";
            break;
          case 20:
            return "小原油";
            break;
          case 21:
            return "迷你DAX指";
            break;
          case 22:
            return "天然气";
            break;
        }
      },
      hand: function (e) {
        switch (e) {
          case 0:
            return "富时A50";
            break;
          case 6:
            return "国际原油";
            break;
          case 7:
            return "恒指期货";
            break;
          case 9:
            return "迷你道指";
            break;
          case 10:
            return "迷你纳指";
            break;
          case 11:
            return "迷你标普";
            break;
          case 12:
            return "德国DAX";
            break;
          case 13:
            return "日经225";
            break;
          case 14:
            return "小恒指";
            break;
          case 15:
            return "美黄金";
            break;
          case 16:
            return "H股指数";
            break;
          case 17:
            return "小H股指数";
            break;
          case 18:
            return "美铜  ";
            break;
          case 19:
            return "美白银";
            break;
          case 20:
            return "小原油";
            break;
          case 21:
            return "迷你德国DAX指数";
            break;
          case 22:
            return "天然气";
            break;
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
      },
      getTwoNumber: function (value) {
        if (value) {
          return parseFloat(value).toFixed(2);
        } else {
          return "0.00";
        }
      },
      getexchangeRmb: function (e, a) {
        return parseFloat(e * a).toFixed(2);
      },
      getexchangeUsd: function (e, a) {
        return parseFloat(e / a).toFixed(2);
      },
      loss: function (e) {
        if (e > 0) {
          return "+" + e;
        } else {
          return e;
        }
      }
    },
    computed: {
      msgTips: function () {
        return this.msg;
      },
      isred: function () {
        if (this.tradeDetails.tranProfitLoss >= 0) {
          return true
        } else {
          return false
        }
      },
      toDetailsID() {
        return this.$route.query.id;
      },
      PATH: function () {
        return this.$store.getters.PATH;
      },
      endParities() {
        return this.tradeDetails.endParities
      },
      allowedhistory: function () {
        if (this.tradeDetails.stateType == 6) {
          return true
        } else {
          return false
        }
      },
      orderTemplist() {
        return this.$store.state.market.orderTemplist;
      },
      //持仓
      positionListCont() {
        return this.$store.state.market.positionListCont;
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
    },
    methods: {
      filterContract(mainContract) {
        let data = this.tradeDetails.domesticActualLever;
        let res = 0;
        if (data !== null) {
          data = JSON.parse(data);
          data.forEach(e => {
            if (e.commodityNo === mainContract)
              res = e.ActualLever;
          });
        }
        return res;
      },
      //获取盈利提取的汇率
      getProfitRate() {
        this.$http.post(this.PATH + '/user/getbalancerate', {emulateJSON: true}, {
          headers: {
            'token': this.userInfo.token,
            'secret': this.userInfo.secret
          },
          params: {
            businessType: 1
          },
          timeout: 5000
        }).then(function (e) {
          var data = e.body;
          if (data.success == true) {
            if (data.code == 1) {
              this.rateProfit = data.data.profitRate;
              this.rateTrade = data.data.tradeRate;
              this.getTradeDetails();
            }
          } else {
            switch (data.code) {
              case '3':
                this.$children[0].isShow = true;
                this.msg = '用户信息不存在';
                break;
              default:
                break;
            }
          }
        }.bind(this), function () {
          this.$children[0].isShow = true;
          this.msg = '网络不给力，请稍后再试！';
        });
      },
      //提示框功能
      tipsFun(index) {
        if (index == 1) {
          this.sysTips = false;
        } else if (index == 2) {
          //交易中心
          this.sysTips = false;
          var param = '{"Method":"Login","Parameters":{"ClientNo":"' + this.tradeDetails.tranAccount + '","PassWord":"' + Base64.encode(this.tradeDetails.tranPassword) + '","IsMock":' + this.tradeConfig.model + ',"Version":"' + this.tradeConfig.version + '","Source":"' + this.tradeConfig.client_source + '"}}';
          this.$store.dispatch('initTrade', param);
        } else if (index == 3) {
          this.sysTips = false;
          this.$router.push({
            path: '/tradeLogin',
            query: {user: this.tradeDetails.tranAccount, pwd: this.tradeDetails.tranPassword, from: 'profit'}
          });
        }
      },
      //盈利提取
      profitOut() {
        //判断是否登录
        // if(localStorage.tradeUser&&localStorage.tradeUser!='null'){
        // 	if(this.tradeDetails.tranAccount == JSON.parse(localStorage.tradeUser).username){
        // 		//已登录
        // 		if(this.positionListCont.length>0){
        // 			this.sysTips = true;
        // 			this.tips1 = true;
        // 			this.tips2 = false;
        // 		}else{
        // 			this.sysTips = false;
        // 			this.$router.push({path:'profitOut',query:{username:this.tradeDetails.tranAccount,password:this.tradeDetails.tranPassword,total:this.tradeDetails.traderTotal,append:this.tradeDetails.appendTraderBond,id:this.$route.query.id}});
        // 		}
        // 	}else{
        // 		this.sysTips = true;
        // 		this.tips1 = false;
        // 		this.tips2 = true;
        // 		//未登录
        // 	}
        // }else{
        // 	this.sysTips = true;
        // 	this.tips1 = false;
        // 	this.tips2 = true;
        // 	//未登录
        // }
        //判断是否可以提取盈利
        this.$http.post(this.PATH + '/user/ftrade/qryProfit', {emulateJSON: true}, {
          headers: {
            'token': this.userInfo.token,
            'secret': this.userInfo.secret
          },
          params: {
            id: this.tradeDetailsId
          },
          timeout: 5000
        }).then(function (res) {
          if (res.body.code == 1 && res.body.success) {
            this.$router.push({path: 'profitOut', query: {profit: res.body.data, id: this.tradeDetailsId}});
          } else {
            this.$children[0].isShow = true;
            this.msg = res.body.message;
          }
        }.bind(this), function () {
          this.$children[0].isShow = true;
          this.msg = '网络不给力，请稍后再试！';
        })
      },
      toTradeLogin: function () {
        //交易暂不上
//				this.$children[0].isShow = true;
//				this.msg = '该功能正在开发中，您可登录www.dktai.cn进行交易或等待新功能上线！';
        this.$router.push({
          path: '/tradeLogin',
          query: {user: this.tradeDetails.tranAccount, pwd: this.tradeDetails.tranPassword}
        });

      },
      toTradersRules: function () {
        this.$router.push({path: '/tradersRules'});
      },
      toAddMoney: function () {
        this.$router.push({
          path: '/addMoney',
          query: {id: this.tradeDetails.id, total: this.tradeDetails.traderTotal, loss: this.tradeDetails.lineLoss}
        });
      },
      showCont: function (e) {
        if ($(e.target).hasClass("current")) {
          return false;
        }
        if (this.type == 6) {
          ($(e.target).text() == '方案明细') ? this.isShow = true : this.isShow = false;
          this.$http.post(this.PATH + '/user/ftrade/getFstTradeDetail', {emulateJSON: true}, {
            headers: {
              'token': this.userInfo.token,
              'secret': this.userInfo.secret
            },
            params: {
              id: this.tradeDetailsId
            },
            timeout: 5000
          }).then(function (e) {
            var data = e.body;
            if (data.success == true) {
              this.getFstTradeDetail = data.data;
            } else {
              switch (data.code) {
                case '-1':
                  this.$children[0].isShow = true;
                  this.msg = '账号已变更，请重新重新登录';
                  break;
                default:
                  break;
              }
            }
          }.bind(this), function () {
            this.$children[0].isShow = true;
            this.msg = '网络不给力，请稍后再试！'
          });
        } else if (this.type == 1) {
          this.$children[0].isShow = true;
          this.msg = '开户中，暂无数据显示';
        } else if (this.type == 4) {
          this.$children[0].isShow = true;
          this.msg = '方案未结算，暂无数据显示';
        } else if (this.type == 2) {
          this.$children[0].isShow = true;
          this.msg = '方案结算中，暂无数据显示';
        } else if (this.type == 5) {
          this.$children[0].isShow = true;
          this.msg = '开户失败，暂无数据显示';
        }
      },
      getTradeDetails: function () {
        this.$http.post(this.PATH + '/user/ftrade/details', {emulateJSON: true}, {
          headers: {
            'token': this.userInfo.token,
            'secret': this.userInfo.secret
          },
          params: {
            id: this.toDetailsID
          },
          timeout: 5000
        }).then(function (e) {
          var data = e.body;
          if (data.success == true) {
            this.optionError = false;
            if (data.code == 1) {
              this.tradeDetails = data.data.details
              console.log(this.tradeDetails)
              this.tradeDetailsId = this.tradeDetails.id;
              //v1版本
              if (this.$store.state.appVersion == 'v1') {
                this.tradeDetails.outDiskVoList.forEach(function (x, i) {
                  switch (x.tradeType) {
                    case 0:
                      x.tranLever = this.tradeDetails.tranActualLever;
                      break;
                    case 6:
                      x.tranLever = this.tradeDetails.crudeTranActualLever;
                      break;
                    case 7:
                      x.tranLever = this.tradeDetails.hsiTranActualLever;
                      break;
                    case 9:
                      x.tranLever = this.tradeDetails.mdtranActualLever;
                      break;
                    case 10:
                      x.tranLever = this.tradeDetails.mntranActualLever;
                      break;
                    case 11:
                      x.tranLever = this.tradeDetails.mbtranActualLever;
                      break;
                    case 12:
                      x.tranLever = this.tradeDetails.daxtranActualLever;
                      break;
                    case 13:
                      x.tranLever = this.tradeDetails.nikkeiTranActualLever;
                      break;
                    case 14:
                      x.tranLever = this.tradeDetails.lhsiTranActualLever;
                      break;
                    case 15:
                      x.tranLever = this.tradeDetails.agTranActualLever;
                      break;
                    case 16:
                      x.tranLever = this.tradeDetails.hIndexActualLever;
                      break;
                    case 17:
                      x.tranLever = this.tradeDetails.xHStockMarketLever;
                      break;
                    case 18:
                      x.tranLever = this.tradeDetails.ameCopperMarketLever;
                      break;
                    case 19:
                      x.tranLever = this.tradeDetails.aSilverActualLever;
                      break;
                    case 20:
                      x.tranLever = this.tradeDetails.smallCrudeOilMarketLever;
                      break;
                    case 21:
                      x.tranLever = this.tradeDetails.daxtranMinActualLever;
                      break;
                    case 22:
                      x.tranLever = this.tradeDetails.naturalGasActualLever;
                      break;
                  }
                }.bind(this));
              } else if (this.$store.state.appVersion == 'v2') {
                //v2版本
                this.tradeLever = JSON.parse(data.data.details.domesticActualLever);
              }
            }
          } else {
            switch (data.code) {
              case '-1':
                this.$children[0].isShow = true;
                this.msg = '账号已变更，请重新重新登录';
                break;
              case '-3':
                this.$children[0].isShow = true;
                this.msg = '操作频繁,请稍后再操作';
                this.optionError = true;
                var _this = this;
                setTimeout(function () {
                  _this.$router.go(-1);
                }, 1000);
                break;
              default:
                break;
            }
          }
        }.bind(this), function () {
          this.$children[0].isShow = true;
          this.msg = '网络不给力，请稍后再试！';
        });
      },
      applyStopOrder: function () {
        var num = this.$store.state.appVersion == 'v1' ? 8 : 99;
        this.$http.post(this.PATH + '/user/ftrade/endtrade', {emulateJSON: true}, {
          headers: {
            'token': this.userInfo.token,
            'secret': this.userInfo.secret
          },
          params: {
            "id": this.toDetailsID,
//							"cId": "",
            "businessType": num
          },
          timeout: 5000
        }).then(function (e) {
          var data = e.body;
          if (data.success == true) {
            if (data.code == 1) {
              if (data.data == 6) {
                this.$children[0].isShow = true;
                this.msg = '结算成功';
                localStorage.removeItem("tradeUser");
                setTimeout(function () {
                  this.$router.replace({path: '/tradeDetails', query: {type: 6, id: this.tradeDetails.id, end: 1}});
                }.bind(this), 1000);
              } else {
                this.$children[0].isShow = true;
                this.msg = '申请成功';
                setTimeout(function () {
                  this.$router.replace({path: '/historyTradeApply', query: {type: 1}});
                }.bind(this), 1000);
              }
            }
          } else {
            switch (data.code) {
              case '-1':
                this.$children[0].isShow = true;
                this.msg = '账号已变更，请重新重新登录';
                break;
              case '2':
                this.$children[0].isShow = true;
                this.msg = '系统异常，结算失败';
                break;
              case '3':
                this.$children[0].isShow = true;
                this.msg = '已申请终结';
                break;
              case '4':
                this.$children[0].isShow = true;
                this.msg = '非操盘中';
                break;
              case '5':
                this.$children[0].isShow = true;
                this.msg = '未找到该优惠劵';
                break;
              case '6':
                this.$children[0].isShow = true;
                this.msg = '折扣劵无法使用';
                break;
              case '7':
                this.$children[0].isShow = true;
                this.msg = '方案编号不能为空';
                break;
              case '8':
                this.$children[0].isShow = true;
                this.msg = '参数错误';
                break;
              case '9':
                this.$children[0].isShow = true;
                this.msg = '参数错误';
                break;
              case '10':
                this.$children[0].isShow = true;
                this.msg = '有持仓，不能结算';
                break;
              case '11':
                this.$children[0].isShow = true;
                this.msg = data.message;
                break;
              case '20':
                this.$children[0].isShow = true;
                this.msg = '连接服务不成功';
                break;
              case '22':
                this.$children[0].isShow = true;
                this.msg = '交易账户不存在';
                break;
              default:
                break;
            }
          }
        }.bind(this), function () {
          this.$children[0].isShow = true;
          this.msg = '网络不给力，请稍后再试！'
        });
      }
    },
    activated: function () {
      this.userInfo = JSON.parse(localStorage.user);
      this.isShow = true;
      //获取操盘明细
      this.getProfitRate();
      this.type = Number(this.$route.query.type);
      switch (this.type) {
        case 1:
          this.openShow = true;
          this.operateShow = false;
          this.settlementShow = false;
          this.errorShow = false;
          this.finishingShow = false;
          break;
        case 2:
          this.openShow = false;
          this.operateShow = true;
          this.settlementShow = false;
          this.errorShow = false;
          this.finishingShow = true;
          break;
        case 4:
          this.openShow = false;
          this.operateShow = true;
          this.settlementShow = false;
          this.errorShow = false;
          this.finishingShow = false;
          break;
        case 5:
          this.errorShow = true;
          this.openShow = false;
          this.operateShow = false;
          this.settlementShow = false;
          this.finishingShow = false;
          break;
        case 6:
          this.openShow = false;
          this.operateShow = false;
          this.settlementShow = true;
          this.errorShow = false;
          this.finishingShow = false;
          break;
        default:
          break;
      }
    },
    watch: {
      // loginStatus:function(){
      // 	if(this.$route.name == 'tradeDetails'){
      // 		if(this.loginStatus == 1){
      // 			console.log(this.tradeDetails);
      // 			this.$children[0].isShow = true;
      // 			this.msg = '登录成功';
      // 			this.$store.state.market.tradeConfig.username = this.tradeDetails.tranAccount;
      // 			this.$store.state.market.tradeConfig.password = Base64.encode(this.tradeDetails.tranPassword);
      // 			var userData = {'username': this.tradeDetails.tranAccount, 'password': Base64.encode(this.tradeDetails.tranPassword)};
      // 			localStorage.setItem("tradeUser", JSON.stringify(userData));
      // 			this.$store.dispatch('qryHisTrade');
      // 			setTimeout(function(){
      // 				// this.$router.push({path: '/index', query: {isBack: 1}});
      // 				this.Parameters.forEach(function(e){
      // 					if(e.CommodityName == '国际原油'){
      // 						this.$store.state.market.currentdetail = e;
      // 					}
      // 				}.bind(this));
      // 				this.$router.replace({path: '/orderdetail',query:{type:1}});
      // 				this.shadeShow = false;
      // 			}.bind(this),100);
      // 		}else if(this.loginStatus == 2){
      // 			this.$children[0].isShow = true;
      // 			this.msg = this.$store.state.market.tradeLoginSuccessMsg;
      // 			this.$store.state.loginStatus = 0;
      // 		}
      // 	}
      // },
      $route: function () {
        if (this.$route.name == 'tradeDetails' && this.$route.query.end == 1) {
          this.userInfo = JSON.parse(localStorage.user);
          this.isShow = true;
          //获取操盘明细
          this.getProfitRate();
          this.type = Number(this.$route.query.type);
          switch (this.type) {
            case 1:
              this.openShow = true;
              this.operateShow = false;
              this.settlementShow = false;
              this.errorShow = false;
              this.finishingShow = false;
              break;
            case 2:
              this.openShow = false;
              this.operateShow = true;
              this.settlementShow = false;
              this.errorShow = false;
              this.finishingShow = true;
              break;
            case 4:
              this.openShow = false;
              this.operateShow = true;
              this.settlementShow = false;
              this.errorShow = false;
              this.finishingShow = false;
              break;
            case 5:
              this.errorShow = true;
              this.openShow = false;
              this.operateShow = false;
              this.settlementShow = false;
              this.finishingShow = false;
              break;
            case 6:
              this.openShow = false;
              this.operateShow = false;
              this.settlementShow = true;
              this.errorShow = false;
              this.finishingShow = false;
              break;
            default:
              break;
          }
        }
      }
    },
    mounted: function () {

    },
    beforeRouteEnter(to, from, next) {
      if ((from.path == '/') && to.path == '/tradeDetails') {
        next({path: '/home'})
      } else {
        next();
      }
    }
  }
</script>

<style scoped lang="less">
  @import url("../../assets/css/main.less");
  @import url("../../assets/css/base.less");
  /*ip6p及以上*/
  #tradeDetails .page_cont .plan_details .plan_details_row li span.fontred {
    color: #ff4c4c;;
  }

  #tradeDetails .page_cont .plan_details .plan_details_row li span.fontgreen {
    color: #3dcc85;
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

  @media (min-width: 411px) {
    #tradeDetails {
      width: 100%;
      overflow: hidden;
      padding-top: 50px;
      height: 100%;

      .tips-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        width: 80%;
        border-radius: 10px;
        background: #242633;
        color: #ccd5ff;

        .tips-title {
          text-align: center;
          height: 50px;
          line-height: 50px;
          border-bottom: solid 1px #1b1b26;

          img {
            position: absolute;
            right: 0;
            width: 35px;
          }
        }

        .tips-content {
          color: #fff;
          height: 80px;
          line-height: 80px;
          text-align: center;
        }

        .tips-btn {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 50px;
          border-top: solid 5px #1b1b26;

          span {
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      .page_cont {
        overflow: auto;
        height: 100%;
        overflow-x: hidden;

        .tab_box {
          height: 44px;
          background: @deepblue;
          border-bottom: 1px solid @black;

          li {
            float: left;
            width: 50%;
            text-align: center;

            span {
              display: inline-block;
              height: 44px;
              line-height: 44px;
              color: @lightblue;
              font-size: @fs14;

              &.current {
                color: @yellow;
                border-bottom: 4px solid @yellow;
              }
            }
          }
        }

        .plan_details {
          .plan_status {
            width: 100%;
            height: 44px;
            line-height: 44px;
            text-align: center;
            font-size: @fs16;
            background: #36394d;

            &.opening {
              color: @yellow;
            }

            &.settlement {
              color: @white;
            }
          }

          .plan_details_row {
            background: @deepblue;
            margin-bottom: 10px;

            .profit-out {
              margin: 0 auto;
              width: 92.75%;
              height: 54px;
              line-height: 52px;
              background: #a3aacc;
              color: #1b1b26;
              border-radius: 27px;
              font-size: 18px;
              text-align: center;
              margin-top: 20px;
              margin-bottom: 5px;
            }

            &:last-child {
              margin: 0;
            }

            /*&first-child {
                            span {
                                opacity: 1
                            }
                        }*/

            li {
              height: 44px;
              overflow: hidden;
              padding: 0 15px;
              border-bottom: 1px solid @black;

              &:first-child {
                span {
                  &.hide {
                    opacity: 1;
                  }
                }
              }

              span {
                display: inline-block;
                float: left;
                line-height: 44px;
                color: @blue;
                font-size: @fs16;

                &.title {
                  margin-right: 5px;
                }

                &.hide {
                  opacity: 0;
                }

                &.white {
                  color: @white;
                }
              }

              p {
                float: left;
                display: inline-block;

                &:last-child {
                  float: right;
                }

                em {
                  line-height: 46px;
                  font-size: @fs12;
                }
              }

              #conditionBtn {
                float: right;
                margin-top: 6px;
              }
            }

            #bigBtn {
              margin: 5px 15px;
            }

            .num_total {
              width: 100%;
              overflow: hidden;

              .num_total_col {
                float: left;
                width: 25%;
                height: 88px;
                overflow: hidden;
                text-align: center;
                border-right: 1px solid @black;

                span {
                  display: block;
                  height: 44px;
                  line-height: 44px;
                  border-bottom: 1px solid @black;
                  font-size: @fs16;

                  &:first-child {
                    background: #36394d;
                    color: @blue;
                    overflow: hidden;
                  }

                  &:last-child {
                    color: @white;
                  }
                }
              }
            }

            h2,
            .tips {
              padding: 0 15px;
              font-size: @fs16;
            }

            h2 {
              color: @yellow;
              margin: 15px 0 10px 0;
            }

            .tips {
              color: #7a7f99;
              line-height: 28px;
              padding-bottom: 10px;
            }
          }
        }

        .list_cont {
          width: 100%;
          background: @deepblue;
          overflow-x: scroll;

          ul {
            width: 995px*@ip6p;
            box-sizing: content-box;

            .no-history {
              color: #afafaf;
              font-size: 14px;
            }

            li {
              height: 44px;
              line-height: 44px;
              border-top: 1px solid @black;
              padding-left: 15px*@ip6p;

              &:nth-child(1) {
                background: #36394d;
              }

              span {
                display: inline-block;
                float: left;
                width: 10%;
                font-size: @fs14;
                color: @blue;
                overflow: hidden;

                &:nth-child(1) {
                  width: 40px*@ip6p;
                }

                &:nth-child(2) {
                  width: 160px*@ip6p;
                }

                &:nth-child(3) {
                  width: 100px*@ip6p;
                }

                &:nth-child(4) {
                  width: 100px*@ip6p;
                }

                &:nth-child(5) {
                  width: 100px*@ip6p;
                }

                &:nth-child(6) {
                  width: 100px*@ip6p;
                }

                &:nth-child(7) {
                  width: 50px*@ip6p;
                }

                &:nth-child(8) {
                  width: 50px*@ip6p;
                }

                &:nth-child(9) {
                  width: 100px*@ip6p;
                }

                &:nth-child(10) {
                  width: 80px*@ip6p;
                }

                &:nth-child(11) {
                  width: 100px*@ip6p;
                }

                &.red {
                  color: @red;
                }

                &.green {
                  color: @green;
                }
              }
            }
          }
        }
      }
    }

    .d {
      width: 100%;
      background-color: #242633;

      .dul {
        border-bottom: 1px solid #1b1b26;
        width: 100%;

        &:after {
          content: '';
          display: block;
          clear: both;
        }

        li:first-child {
          padding-left: 15px*@ip6p;
          font-size: 16px*@ip6p;
          width: 24%;

          > div {
            color: transparent;
            height: 40px*@ip6p;
            line-height: 40px*@ip6p;
            border-bottom: 1px solid #1b1b26;
          }

          > div:first-child {
            color: #a3aacc;
          }
        }

        li:nth-child(2) {
          font-size: 16px*@ip6p;
          width: 300px/2*@ip6p;

          > div {
            height: 40px*@ip6p;
            line-height: 40px*@ip6p;
            border-bottom: 1px solid #1b1b26;

            > span {
              font-size: 12px;
            }
          }

          > div:last-child {
            border-bottom: none;
          }
        }

        li:nth-child(3) {
          font-size: 16px*@ip6p;
          width: 300px/2*@ip6p;

          > div {
            text-align: right;
            height: 40px*@ip6p;
            line-height: 40px*@ip6p;
            border-bottom: 1px solid #1b1b26;

            > span {
              font-size: 12px;
            }
          }
        }
      }
    }

    .tradetime {
      width: 100%;
      height: 40px*@ip6p;
      line-height: 40px*@ip6p;
      padding-left: 15px*@ip6p;
      font-size: 16px*@ip6p;
      border-bottom: 5px solid #1b1b26;
      box-sizing: content-box;
    }
  }

  /*ip6*/
  @media (min-width: 371px) and (max-width: 410px) {
    #tradeDetails {
      width: 100%;
      overflow: hidden;
      padding-top: 50px*@ip6;
      height: 100%;

      .tips-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        width: 80%;
        border-radius: 10px*@ip6;
        background: #242633;
        color: #ccd5ff;

        .tips-title {
          text-align: center;
          height: 50px*@ip6;
          line-height: 50px*@ip6;
          border-bottom: solid 1px*@ip6 #1b1b26;

          img {
            position: absolute;
            right: 0;
            width: 35px*@ip6;
          }
        }

        .tips-content {
          color: #fff;
          height: 80px*@ip6;
          line-height: 80px*@ip6;
          text-align: center;
        }

        .tips-btn {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 50px*@ip6;
          border-top: solid 5px*@ip6 #1b1b26;

          span {
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      .page_cont {
        overflow: auto;
        height: 100%;
        overflow-x: hidden;

        .tab_box {
          height: 44px*@ip6;
          background: @deepblue;
          border-bottom: 1px solid @black;

          li {
            float: left;
            width: 50%;
            text-align: center;

            span {
              display: inline-block;
              height: 44px*@ip6;
              line-height: 44px*@ip6;
              color: @lightblue;
              font-size: @fs14*@ip6;

              &.current {
                color: @yellow;
                border-bottom: 4px*@ip6 solid @yellow;
              }
            }
          }
        }

        .plan_details {
          .plan_status {
            width: 100%;
            height: 44px*@ip6;
            line-height: 44px*@ip6;
            text-align: center;
            font-size: @fs16*@ip6;
            background: #36394d;

            &.opening {
              color: @yellow;
            }

            &.settlement {
              color: @white;
            }
          }

          .plan_details_row {
            background: @deepblue;
            margin-bottom: 10px*@ip6;

            .profit-out {
              margin: 0 auto;
              width: 92.75%;
              height: 54px*@ip6;
              line-height: 52px*@ip6;
              background: #a3aacc;
              color: #1b1b26;
              border-radius: 27px*@ip6;
              font-size: 18px*@ip6;
              text-align: center;
              margin-top: 20px*@ip6;
              margin-bottom: 5px*@ip6;
            }

            &:last-child {
              margin: 0;
            }

            li {
              height: 44px*@ip6;
              overflow: hidden;
              padding: 0 15px*@ip6;
              border-bottom: 1px solid @black;

              &:first-child {
                span {
                  &.hide {
                    opacity: 1;
                  }
                }
              }

              span {
                display: inline-block;
                float: left;
                line-height: 44px*@ip6;
                color: @blue;
                font-size: @fs16*@ip6;

                &.title {
                  margin-right: 5px*@ip6;
                }

                &.hide {
                  opacity: 0;
                }

                &.white {
                  color: @white;
                }
              }

              p {
                float: left;
                display: inline-block;

                &:last-child {
                  float: right;
                }

                em {
                  line-height: 46px*@ip6;
                  font-size: @fs12;
                }
              }

              #conditionBtn {
                float: right;
                margin-top: 6px*@ip6;
              }
            }

            #bigBtn {
              margin: 5px*@ip6 15px*@ip6;
            }

            .num_total {
              width: 100%;
              overflow: hidden;

              .num_total_col {
                float: left;
                width: 25%;
                height: 88px*@ip6;
                overflow: hidden;
                text-align: center;
                border-right: 1px solid @black;

                span {
                  display: block;
                  height: 44px*@ip6;
                  line-height: 44px*@ip6;
                  border-bottom: 1px solid @black;
                  font-size: @fs16*@ip6;

                  &:first-child {
                    background: #36394d;
                    color: @blue;
                    overflow: hidden;
                  }

                  &:last-child {
                    color: @white;
                  }
                }
              }
            }

            h2,
            .tips {
              padding: 0 15px*@ip6;
              font-size: @fs16*@ip6;
            }

            h2 {
              color: @yellow;
              margin: 15px*@ip6 0 10px*@ip6 0;
            }

            .tips {
              color: #7a7f99;
              line-height: 28px*@ip6;
              padding-bottom: 10px*@ip6;
            }
          }
        }

        .list_cont {
          width: 100%;
          background: @deepblue;
          overflow-x: scroll;

          ul {
            width: 995px*@ip6;
            box-sizing: content-box;

            .no-history {
              color: #afafaf;
              font-size: 14px*@ip6;
            }

            li {
              height: 44px;
              line-height: 44px;
              border-top: 1px solid @black;
              padding-left: 15px*@ip6;

              &:nth-child(1) {
                background: #36394d;
              }

              span {
                display: inline-block;
                float: left;
                width: 10%;
                font-size: @fs14;
                color: @blue;
                overflow: hidden;

                &:nth-child(1) {
                  width: 40px*@ip6;
                }

                &:nth-child(2) {
                  width: 160px*@ip6;
                }

                &:nth-child(3) {
                  width: 100px*@ip6;
                }

                &:nth-child(4) {
                  width: 100px*@ip6;
                }

                &:nth-child(5) {
                  width: 100px*@ip6;
                }

                &:nth-child(6) {
                  width: 100px*@ip6;
                }

                &:nth-child(7) {
                  width: 50px*@ip6;
                }

                &:nth-child(8) {
                  width: 50px*@ip6;
                }

                &:nth-child(9) {
                  width: 100px*@ip6;
                }

                &:nth-child(10) {
                  width: 80px*@ip6;
                }

                &:nth-child(11) {
                  width: 100px*@ip6;
                }

                &.red {
                  color: @red;
                }

                &.green {
                  color: @green;
                }
              }
            }
          }
        }
      }
    }

    .d {
      width: 100%;
      background-color: #242633;

      .dul {
        border-bottom: 1px solid #1b1b26;
        width: 100%;

        &:after {
          content: '';
          display: block;
          clear: both;
        }

        li:first-child {
          padding-left: 15px*@ip6;
          font-size: 16px*@ip6;
          width: 24%;

          > div {
            color: transparent;
            height: 40px*@ip6;
            line-height: 40px*@ip6;
            border-bottom: 1px solid #1b1b26;
          }

          > div:first-child {
            color: #a3aacc;
          }
        }

        li:nth-child(2) {
          font-size: 16px*@ip6;
          width: 300px/2*@ip6;

          > div {
            height: 40px*@ip6;
            line-height: 40px*@ip6;
            border-bottom: 1px solid #1b1b26;

            > span {
              font-size: 12px;
            }
          }

          > div:last-child {
            border-bottom: none;
          }
        }

        li:nth-child(3) {
          font-size: 16px*@ip6;
          width: 300px/2*@ip6;

          > div {
            text-align: right;
            height: 40px*@ip6;
            line-height: 40px*@ip6;
            border-bottom: 1px solid #1b1b26;

            > span {
              display: inline-block;
              font-size: 12px;
              transform: scale(0.9);
            }
          }
        }
      }
    }

    .tradetime {
      width: 100%;
      height: 40px*@ip6;
      line-height: 40px*@ip6;
      padding-left: 15px*@ip6;
      font-size: 16px*@ip6;
      border-bottom: 5px solid #1b1b26;
      box-sizing: content-box;
    }
  }

  /*ip5*/

  @media (max-width: 370px) {
    #tradeDetails {
      width: 100%;
      overflow: hidden;
      padding-top: 50px*@ip5;
      height: 100%;

      .tips-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        width: 80%;
        border-radius: 10px*@ip5;
        background: #242633;
        color: #ccd5ff;

        .tips-title {
          text-align: center;
          height: 50px*@ip5;
          line-height: 50px*@ip5;
          border-bottom: solid 1px*@ip5 #1b1b26;

          img {
            position: absolute;
            right: 0;
            width: 35px*@ip5;
          }
        }

        .tips-content {
          color: #fff;
          height: 80px*@ip5;
          line-height: 80px*@ip5;
          text-align: center;
        }

        .tips-btn {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 50px*@ip5;
          border-top: solid 5px*@ip5 #1b1b26;

          span {
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      .page_cont {
        overflow: auto;
        height: 100%;
        overflow-x: hidden;

        .tab_box {
          height: 44px*@ip5;
          background: @deepblue;
          border-bottom: 1px solid @black;

          li {
            float: left;
            width: 50%;
            text-align: center;

            span {
              display: inline-block;
              height: 44px*@ip5;
              line-height: 44px*@ip5;
              color: @lightblue;
              font-size: @fs14*@ip5;

              &.current {
                color: @yellow;
                border-bottom: 4px*@ip5 solid @yellow;
              }
            }
          }
        }

        .plan_details {
          .plan_status {
            width: 100%;
            height: 44px*@ip5;
            line-height: 44px*@ip5;
            text-align: center;
            font-size: @fs16*@ip5;
            background: #36394d;

            &.opening {
              color: @yellow;
            }

            &.settlement {
              color: @white;
            }
          }

          .plan_details_row {
            background: @deepblue;
            margin-bottom: 10px*@ip5;

            .profit-out {
              margin: 0 auto;
              width: 92.75%;
              height: 54px*@ip5;
              line-height: 52px*@ip5;
              background: #a3aacc;
              color: #1b1b26;
              border-radius: 27px*@ip5;
              font-size: 18px*@ip5;
              text-align: center;
              margin-top: 20px*@ip5;
              margin-bottom: 5px*@ip5;
            }

            &:last-child {
              margin: 0;
            }

            li {
              &:first-child {
                span {
                  &.hide {
                    opacity: 1;
                  }
                }
              }

              height: 44px*@ip5;
              overflow: hidden;
              padding: 0 15px*@ip5;
              border-bottom: 1px solid @black;

              span {
                display: inline-block;
                float: left;
                line-height: 44px*@ip5;
                color: @blue;
                font-size: @fs16*@ip5;

                &.title {
                  margin-right: 5px*@ip5;
                }

                &.hide {
                  opacity: 0;
                }

                &.white {
                  color: @white;
                }
              }

              p {
                float: left;
                display: inline-block;

                &:last-child {
                  float: right;
                }

                em {
                  line-height: 46px*@ip5;
                  font-size: @fs12;
                }
              }

              #conditionBtn {
                float: right;
                margin-top: 6px*@ip5;
              }
            }

            #bigBtn {
              margin: 5px*@ip5 15px*@ip5;
            }

            .num_total {
              width: 100%;
              overflow: hidden;

              .num_total_col {
                float: left;
                width: 25%;
                height: 88px*@ip5;
                overflow: hidden;
                text-align: center;
                border-right: 1px solid @black;

                span {
                  display: block;
                  height: 44px*@ip5;
                  line-height: 44px*@ip5;
                  border-bottom: 1px solid @black;
                  font-size: @fs16*@ip5;

                  &:first-child {
                    background: #36394d;
                    color: @blue;
                    overflow: hidden;
                  }

                  &:last-child {
                    color: @white;
                  }
                }
              }
            }

            h2,
            .tips {
              padding: 0 15px*@ip5;
              font-size: @fs16*@ip5;
            }

            h2 {
              color: @yellow;
              margin: 15px*@ip5 0 10px*@ip5 0;
            }

            .tips {
              color: #7a7f99;
              line-height: 28px*@ip5;
              padding-bottom: 10px*@ip5;
            }
          }
        }

        .list_cont {
          width: 100%;
          background: @deepblue;
          overflow-x: scroll;

          ul {
            width: 1050px*@ip5;
            box-sizing: content-box;

            .no-history {
              color: #afafaf;
              font-size: 14px*@ip5;
            }

            li {
              height: 44px;
              line-height: 44px;
              border-top: 1px solid @black;
              padding-left: 15px*@ip5;

              &:nth-child(1) {
                background: #36394d;
              }

              span {
                display: inline-block;
                float: left;
                width: 10%;
                font-size: @fs14;
                color: @blue;
                overflow: hidden;

                &:nth-child(1) {
                  width: 40px*@ip5;
                }

                &:nth-child(2) {
                  width: 200px*@ip5;
                }

                &:nth-child(3) {
                  width: 100px*@ip5;
                }

                &:nth-child(4) {
                  width: 100px*@ip5;
                }

                &:nth-child(5) {
                  width: 100px*@ip5;
                }

                &:nth-child(6) {
                  width: 100px*@ip5;
                }

                &:nth-child(7) {
                  width: 50px*@ip5;
                }

                &:nth-child(8) {
                  width: 50px*@ip5;
                }

                &:nth-child(9) {
                  width: 100px*@ip5;
                }

                &:nth-child(10) {
                  width: 80px*@ip5;
                }

                &:nth-child(11) {
                  width: 100px*@ip5;
                }

                &.red {
                  color: @red;
                }

                &.green {
                  color: @green;
                }
              }
            }
          }
        }
      }
    }

    .d {
      width: 100%;
      background-color: #242633;

      .dul {
        border-bottom: 1px solid #1b1b26;
        width: 100%;

        &:after {
          content: '';
          display: block;
          clear: both;
        }

        li:first-child {
          padding-left: 15px*@ip5;
          font-size: 16px*@ip5;
          width: 24%;

          > div {
            color: transparent;
            height: 40px*@ip5;
            line-height: 40px*@ip5;
            border-bottom: 1px solid #1b1b26;
          }

          > div:first-child {
            color: #a3aacc;
          }
        }

        li:nth-child(2) {
          font-size: 16px*@ip5;
          width: 300px/2*@ip5;

          > div {
            height: 40px*@ip5;
            line-height: 40px*@ip5;
            border-bottom: 1px solid #1b1b26;

            > span {
              font-size: 12px;
            }
          }

          > div:last-child {
            border-bottom: none;
          }
        }

        li:nth-child(3) {
          font-size: 16px*@ip5;
          width: 315px/2*@ip5;
          text-align: right;

          > div {
            height: 40px*@ip5;
            line-height: 40px*@ip5;
            border-bottom: 1px solid #1b1b26;

            > span {
              display: inline-block;
              font-size: 12px;
              transform: scale(0.8);
            }
          }
        }
      }
    }

    .tradetime {
      width: 100%;
      height: 40px*@ip5;
      line-height: 40px*@ip5;
      padding-left: 15px*@ip5;
      font-size: 16px*@ip5;
      border-bottom: 5px solid #1b1b26;
      box-sizing: content-box;
    }
  }
</style>
