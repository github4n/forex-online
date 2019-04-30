<template>
    <div id="discribe">
		<div id="header-box">
			<header-bar :showBack="true" :showMenu="false">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
			</header-bar>
		</div>
        <div class="text-title">
            免责声明
        </div>
        <div class="text-content">
            <p>您将要激活快速交易模式. 通过勾选弹窗中的"知悉功能特性", 您会承认您已经阅读并理解以下合同条款, 您同意特此遵守. 您当前的程序端版本使您在下面的订单提交模式间选择. 您同意遵守本规定的条款和条件, 有关这样的模式</p>
            <p>1. 订单提交的默认模式为两步处理法: 首先您打开一个新订单窗口, 然后您选择一种适当的订单类型, 其参数并根据您选定的特殊订单类型和您的交易意愿点击买入, 卖出, 下单, 更改或关闭按键来确认提交您的订单. 您必须完成上述的两种操作步骤才可提交订单</p>
            <p>2. 用于提交订单的快速交易模式是一个一步处理法. 当您在行情内页选择卖价(卖出)或买价(买入)按键时，将直接会进行成交，成交的各项参数为默认，包括：-不设置止盈止损-默认金额（取决于不同的品种）</p>
        </div>
    </div>    
</template>

<script>
import headerBar from '../components/header';
export default {
    components:{headerBar},
    data(){
        return{
            headerTitle:'快速交易协议',
        }
    },
    methods:{

    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#discribe{
    font-size: 14px;
	padding-top: 50px;
    z-index: 1000;    
    height: 100%;
    background: #20212a;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .text-title{
        padding-top: 10px;
        color:#7e829c;
        font-size: 16px;
        text-align: center;
    }
    .text-content{
        padding: 10px 20px;
        p{
            color: #fff;
            text-indent: 2em;    
            line-height: 25px;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #discribe{
        font-size: 14px*@ip5;
        padding-top: 50px*@ip5;
        .text-title{
            padding-top: 10px*@ip5;
            font-size: 16px*@ip5;
        }
        .text-content{
            padding: 10px*@ip5 20px*@ip5;
            p{
                text-indent: 2em*@ip5;    
                line-height: 25px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #discribe{
        font-size: 14px*@ip6;
        padding-top: 50px*@ip6;
        .text-title{
            padding-top: 10px*@ip6;
            font-size: 16px*@ip6;
        }
        .text-content{
            padding: 10px*@ip6 20px*@ip6;
            p{
                text-indent: 2em*@ip6;    
                line-height: 25px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
