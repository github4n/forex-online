import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import guide from '../pages/Guide.vue'
// import home from '../pages/Home.vue'
const home = ()=> import('../pages/Home.vue')
// import tradeapply from '../pages/TradeApply.vue'
const tradeapply = ()=> import('../pages/tradeapply.vue')
// import historyTradeApply from '../pages/historyTradeApply.vue'
const historyTradeApply = ()=> import('../pages/historyTradeApply.vue')
// import information from '../pages/Information.vue'
const information = ()=> import('../pages/information.vue')
// import test from '../pages/test.vue'
const test = ()=> import('../pages/test.vue')
// import account from '../pages/Account.vue'
const account = ()=> import('../pages/account.vue')
// import conditions from '../pages/market/conditions.vue'
const conditions = ()=> import('../pages/market/conditions.vue')
// import historyTrade from '../pages/market/historyTrade.vue'
const historyTrade = ()=> import('../pages/market/historyTrade.vue')
// import moneyDetails from '../pages/market/moneyDetails.vue'
const moneyDetails = ()=> import('../pages/market/moneyDetails.vue')
// import stopMoney from '../pages/market/stopMoney.vue'
const stopMoney = ()=> import('../pages/market/stopMoney.vue')
// import orderdetail from '../pages/market/orderdetail.vue'
const orderdetail = ()=> import('../pages/market/orderdetail.vue')
// import space from '../pages/space.vue'
const space = ()=> import('../pages/space.vue')
// import findPwd from '../pages/account/findPwd.vue'
const findPwd = ()=> import('../pages/account/findPwd.vue')
// import login from '../pages/account/login.vue'
const login = ()=> import('../pages/account/login.vue')
// import register from '../pages/account/register.vue'
const register = ()=> import('../pages/account/register.vue')
// import ac from '../pages/tradeapply/applycomplate.vue'
const ac = ()=> import('../pages/tradeapply/applycomplate.vue')

// import ad from '../pages/tradeapply/applydetail.vue'

// import pc from '../pages/tradeapply/payConfirm.vue'
const pc = ()=> import('../pages/tradeapply/payConfirm.vue')
// import agreement from '../pages/tradeapply/agreement.vue'
const agreement = ()=> import('../pages/tradeapply/agreement.vue')
// import tradersRules from '../pages/tradeapply/tradersRules.vue'
const tradersRules = ()=> import('../pages/tradeapply/tradersRules.vue')
// import sevensearch from '../pages/information/sevensearch.vue'
const sevensearch = ()=> import('../pages/information/sevensearch.vue')
// import moneyLog from '../pages/account/moneyLog.vue'
const moneyLog = ()=> import('../pages/account/moneyLog.vue')
// import nameCertification from '../pages/account/nameCertification.vue'
const nameCertification = ()=> import('../pages/account/nameCertification.vue')
// import editPhone from '../pages/account/editPhone.vue'
const editPhone = ()=> import('../pages/account/editPhone.vue')
// import editPwd from '../pages/account/editPwd.vue'
const editPwd = ()=> import('../pages/account/editPwd.vue')
// import recharge from '../pages/account/recharge.vue'
const recharge = ()=> import('../pages/account/recharge.vue')
// import withdrawal from '../pages/account/withdrawal.vue'
const withdrawal = ()=> import('../pages/account/withdrawal.vue')
// import tradeDetails from '../pages/account/tradeDetails.vue'
const tradeDetails = ()=> import('../pages/account/tradeDetails.vue')
// import bindBankCard from '../pages/account/bindBankCard.vue'
const bindBankCard = ()=> import('../pages/account/bindBankCard.vue')
// import payWays from '../pages/account/payWays.vue'
const payWays = ()=> import('../pages/account/payWays.vue')
// import moneyPwd from '../pages/account/moneyPwd.vue'
const moneyPwd = ()=> import('../pages/account/moneyPwd.vue')
// import addMoney from '../pages/account/addMoney.vue'
const addMoney = ()=> import('../pages/account/addMoney.vue')
// import profitOut from '../pages/account/profitOut.vue'
const profitOut = ()=> import('../pages/account/profitOut.vue')
// import service from '../pages/service.vue'
const service = ()=> import('../pages/service.vue')
// import tradeLogin from '../pages/market/tradeLogin.vue'
const tradeLogin = ()=> import('../pages/market/tradeLogin.vue')
// import help from '../pages/help.vue'
const help = ()=> import('../pages/help.vue')
//各种合约交易规则
// import cl from '../pages/role/cl.vue'
const cl = ()=> import('../pages/role/cl.vue')
// import cn from '../pages/role/cn.vue'
const cn = ()=> import('../pages/role/cn.vue')
// import es from '../pages/role/es.vue'
const es = ()=> import('../pages/role/es.vue')
// import fdax from '../pages/role/fdax.vue'
const fdax = ()=> import('../pages/role/fdax.vue')
// import fdxm from '../pages/role/fdxm.vue'
const fdxm = ()=> import('../pages/role/fdxm.vue')
// import gc from '../pages/role/gc.vue'
const gc = ()=> import('../pages/role/gc.vue')
// import hg from '../pages/role/hg.vue'
const hg = ()=> import('../pages/role/hg.vue')
// import hhi from '../pages/role/hhi.vue'
const hhi = ()=> import('../pages/role/hhi.vue')
// import hsi from '../pages/role/hsi.vue'
const hsi = ()=> import('../pages/role/hsi.vue')
// import mch from '../pages/role/mch.vue'
const mch = ()=> import('../pages/role/mch.vue')
// import mhi from '../pages/role/mhi.vue'
const mhi = ()=> import('../pages/role/mhi.vue')
// import ng from '../pages/role/ng.vue'
const ng = ()=> import('../pages/role/ng.vue')
// import nk from '../pages/role/nk.vue'
const nk = ()=> import('../pages/role/nk.vue')
// import nq from '../pages/role/nq.vue'
const nq = ()=> import('../pages/role/nq.vue')
// import qm from '../pages/role/qm.vue'
const qm = ()=> import('../pages/role/qm.vue')
// import si from '../pages/role/si.vue'
const si = ()=> import('../pages/role/si.vue')
// import ym from '../pages/role/ym.vue'
const ym = ()=> import('../pages/role/ym.vue')

//外汇行情交易模块
const forex_home = ()=> import('../forex/pages/forex_home.vue')
const forex_detail = ()=> import('../forex/pages/forex_detail.vue')
const forex_order = ()=> import('../forex/pages/forex_order.vue')
const forex_sale = ()=> import('../forex/pages/forex_sale.vue')
const forex_position = ()=> import('../forex/pages/forex_position.vue')
const forex_positionDetail = ()=> import('../forex/pages/forex_positionDetail.vue')
const forex_wait = ()=> import('../forex/pages/forex_wait.vue')
const forex_waitDetail = ()=> import('../forex/pages/forex_waitDetail.vue')
const forex_fund = ()=> import('../forex/pages/forex_fund.vue')
const forex_history = ()=> import('../forex/pages/forex_history.vue')
const forex_historyDetail = ()=> import('../forex/pages/forex_historyDetail.vue')
const forex_search = ()=> import('../forex/pages/forex_search.vue')
const forex_addMoney = ()=> import('../forex/pages/forex_addMoney.vue')
const forex_payConfirm = ()=> import('../forex/pages/forex_payConfirm.vue')
const forex_openSuccess = ()=> import('../forex/pages/forex_openSuccess.vue')
const forex_login = ()=> import('../forex/pages/forex_login.vue')
const forex_profit = ()=> import('../forex/pages/forex_profit.vue')
const forex_tradeDetail = ()=> import('../forex/pages/forex_tradeDetail.vue')
const forex_discribe = ()=> import('../forex/pages/forex_discribe.vue')
const forex_changeColor = ()=> import('../forex/pages/forex_changeColor.vue')
const forex_saveSet = ()=> import('../forex/pages/forex_saveSet.vue')
const forex_notice = ()=> import('../forex/pages/forex_notice.vue')
const forex_noticeDetail = ()=> import('../forex/pages/forex_noticeDetail.vue')
Vue.use(Router)

const router = new Router({
//	mode: 'history',
	routes: [
		// {
		// 	path: '/',
		// 	redirect: 'forex_home'
		// },
    {
      path: '/',
      redirect: 'home'
    },
		{
			path: '/cl',
			component: cl
		},
		{
			path: '/cn',
			component: cn
		},
		{
			path: '/es',
			component: es
		},
		{
			path: '/fdax',
			component: fdax
		},
		{
			path: '/fdxm',
			component: fdxm
		},
		{
			path: '/gc',
			component: gc
		},
		{
			path: '/hg',
			component: hg
		},
		{
			path: '/hhi',
			component: hhi
		},
		{
			path: '/hsi',
			component: hsi
		},
		{
			path: '/mch',
			component: mch
		},
		{
			path: '/mhi',
			component: mhi
		},
		{
			path: '/ng',
			component: ng
		},
		{
			path: '/nk',
			component: nk
		},
		{
			path: '/nq',
			component: nq
		},
		{
			path: '/qm',
			component: qm
		},
		{
			path: '/si',
			component: si
		},
		{
			path: '/ym',
			component: ym
		},
		{
			path: '/help',
			component: help
		},
		{
			path: '/tradeLogin',
			name:'tradeLogin',
			component: tradeLogin
		},
		{
			path: '/tradersRules',
			component: tradersRules
		},
		{
			path: '/addMoney',
			component: addMoney
		},
		{
			path: '/profitOut',
			name:'profitOut',
			component: profitOut
		},
		{
			path: '/agreement',
			component: agreement
		},
		{
			path: '/moneyPwd',
			component: moneyPwd
		},
		{
			path: '/payWays',
			component: payWays
		},
		{
			path: '/bindBankCard',
			component: bindBankCard
		},
		{
			path: '/tradeDetails',
			name:'tradeDetails',
			component: tradeDetails
		},
		{
			path: '/withdrawal',
			name:'withdrawal',
			component: withdrawal
		},
		{
			path: '/recharge',
			component: recharge
		},
		{
			path: '/index',
			name:'home',
			component: home
		},
		{
			path: '/findPwd',
			component: findPwd
		},
		{
			path: '/register',
			component: register
		},
		{
			path: '/tradeapply',
			name:'tradeapply',
			component: tradeapply
		},
		{
			path: '/historyTradeApply',
			component: historyTradeApply
		},
		{
			path: '/information',
			component: information,
			meta: { keepAlive: true }
		},
		{
			path: '/account',
			component: account,
//			beforeEnter: (to, from, next) => {
//				if(!store.state.account.islogin) {
//					next({
//						path: '/login'
//					});
//				} else {
//					next();
//				}
//			}
		},
		{
			path: '/test',
			component: test
		},
		{
			path: '/conditions',
			name:'conditions',
			component: conditions
		},
		{
			path: '/historytrade',
			component: historyTrade
		},
		{
			path: '/moneydetails',
			component: moneyDetails
		},
		{
			path: '/stopmoney',
			name:'stopMoney',
			component: stopMoney
		},
		{
			path: '/orderdetail',
			name:'orderdetail',
			component: orderdetail
		},
		{
			path: '/space',
			component: space
		},
		{
			path: '/login',
			component: login
		},
		{
			path: '/applycomplate',
			name:'applycomplate',
			component: ac
		},
//		{
//			path: '/applydetail',
//			component: ad
//		},
		{
			path: '/payconfirm',
			component: pc
		},
		{
			path:'/sevensearch',
			component:sevensearch
		},
		{
			path:'/moneyLog',
			component:moneyLog
		},
		{
			path:'/nameCertification',
			component:nameCertification
		},
		{
			path:'/editPhone',
			component:editPhone
		},
		{
			path:'/editPwd',
			component:editPwd
		},
		{
			path:'/service',
			component:service
		},
		{
			path: '*',
			name:'home',
			component: home
		},
		{
			path:'/forex_home',
			name:'forex_home',
			component:forex_home,
			meta:{
				notKeepAlive:true
			}
		},
		{
			path:'/forex_detail',
			name:'forex_detail',
			component:forex_detail,
			meta:{
				notKeepAlive:true
			}
		},
		{
			path:'/forex_order',
			name:'forex_order',
			component:forex_order
		},
		{
			path:'/forex_sale',
			name:'forex_sale',
			component:forex_sale
		},
		{
			path:'/forex_position',
			name:'forex_position',
			component:forex_position,
			meta:{
				notKeepAlive:true
			}
		},
		{
			path:'/forex_positionDetail',
			name:'forex_positionDetail',
			component:forex_positionDetail
		},
		{
			path:'/forex_wait',
			name:'forex_wait',
			component:forex_wait
		},
		{
			path:'/forex_waitDetail',
			name:'forex_waitDetail',
			component:forex_waitDetail
		},
		{
			path:'/forex_fund',
			name:'forex_fund',
			component:forex_fund
		},
		{
			path:'/forex_history',
			name:'forex_history',
			component:forex_history
		},
		{
			path:'/forex_historyDetail',
			name:'forex_historyDetail',
			component:forex_historyDetail
		},
		{
			path:'/forex_search',
			name:'forex_search',
			component:forex_search
		},
		{
			path:'/forex_addMoney',
			name:'forex_addMoney',
			component:forex_addMoney
		},
		{
			path:'/forex_payConfirm',
			name:'forex_payConfirm',
			component:forex_payConfirm
		},
		{
			path:'/forex_openSuccess',
			name:'forex_openSuccess',
			component:forex_openSuccess
		},
		{
			path:'/forex_login',
			name:'forex_login',
			component:forex_login
		},
		{
			path:'/forex_profit',
			name:'forex_profit',
			component:forex_profit
		},
		{
			path:'/forex_tradeDetail',
			name:'forex_tradeDetail',
			component:forex_tradeDetail
		},
		{
			path:'/forex_discribe',
			name:'forex_discribe',
			component:forex_discribe
		},
		{
			path:'/forex_changeColor',
			name:'forex_changeColor',
			component:forex_changeColor
		},
		{
			path:'/forex_saveSet',
			name:'forex_saveSet',
			component:forex_saveSet
		},
		{
			path:'/forex_notice',
			name:'forex_notice',
			component:forex_notice
		},
		{
			path:'/forex_noticeDetail',
			name:'forex_noticeDetail',
			component:forex_noticeDetail
		}
	]
})
router.afterEach(route => {
	var txt = route.path.slice(-5);
	if(!(txt == ".html" || route.path == '/home' || route.path == '/' ||route.path == '/index' || route.path == '/tradeapply' || route.path == '/information' || route.path == '/account'||route.path == '/forex_home')) {
		store.state.isshow.navBarShow = false;
	} else {
		store.state.isshow.navBarShow = true;
	}
})

export default router
