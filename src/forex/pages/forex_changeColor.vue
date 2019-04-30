<template>
    <div id="changeColor">
		<div id="header-box">
			<header-bar :showBack="true" :showMenu="false">
				<span slot="title" class="header-title">
					{{headerTitle}}
				</span>
			</header-bar>
		</div>
        <div class="title">
            行情涨跌颜色
        </div>
        <div class="option-item">
            <span :class="['radio-btn',selectIndex==1?'radio-btn-active':'']" @click="chooseOption(1)">
                <img v-show="selectIndex==1" src="../../assets/img/forex/gou_yellow.png"/>
            </span>
            <span class="item-title">红涨绿跌</span>
            <span class="item-info item-up">
                <span class="triangle"></span>
                <span>上涨</span>
            </span>
            <span class="item-info item-down">
                <span class="anti-triangle"></span>
                <span>下跌</span>
            </span>
        </div>
        <div class="option-item">
            <span :class="['radio-btn',selectIndex==2?'radio-btn-active':'']" @click="chooseOption(2)">
                <img v-show="selectIndex==2" src="../../assets/img/forex/gou_yellow.png"/>
            </span>
            <span class="item-title">绿涨红跌</span>
            <span class="item-info item-down-2">
                <span class="triangle"></span>
                <span>上涨</span>
            </span>
            <span class="item-info item-up-2">
                <span class="anti-triangle"></span>
                <span>下跌</span>
            </span>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import headerBar from '../components/header';
export default {
    components:{
        headerBar,
    },
    data(){
        return{
            headerTitle:'跌涨颜色',
            selectIndex:1,
        }
    },
    activated(){
        if(localStorage.getItem('colorStyle')){
            this.selectIndex = localStorage.getItem('colorStyle');
        }else{
            this.selectIndex = 1;
        }
    },
    methods:{
        chooseOption(index){
            this.selectIndex = index;
            if(index == 1){
                this.$store.state.colorUp="#dd2d4a";
                this.$store.state.colorDown="#3dcc85";
            }else if(index == 2){
                this.$store.state.colorUp="#3dcc85";
                this.$store.state.colorDown="#dd2d4a";
            }
            localStorage.setItem('colorStyle',index);
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#changeColor{
	padding-top: 50px;
    z-index: 1000;
    font-size: 14px;
    color: #fff;
    #header-box{
        position: fixed;
        top: 0;
		width: 100%;
		z-index: 10;
    }
    .title{
        padding: 10px 20px;
        border-bottom: solid 1px #17191e;
        background: #20212a;
        color:#7e829c;
    }
    .option-item{
        padding: 10px 20px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background: #20212a;
        .radio-btn{
            display: inline-block;
            width: 20px;
            height: 20px;
            border: solid 2px #7a7f99;
            border-radius: 100%;
            position: relative;
            margin-right: 10px;
            img{
                width: 12px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
            }
        }
        .radio-btn-active{
            border-color: #ffd400;
        }
        .item-title{
            margin-right: 10px;
        }
        .item-info{
            margin-right: 10px;
            .triangle{    
                border: solid 5px rgba(0, 0, 0, 0);
                display: inline-block;
                border-bottom-width: 10px;
            }
            .anti-triangle{
                border: solid 5px rgba(0, 0, 0, 0);
                display: inline-block;
                border-top-width: 10px;
                border-bottom-width: 0px;
            }
        }
        .item-up{
            .triangle{
                border-bottom-color: #ff3355;
            }
            color: #ff3355;
        }
        .item-down{
            .anti-triangle{
                border-top-color: #4cffa6;
            }
            color: #4cffa6;
        }
        .item-up-2{
            .anti-triangle{
                border-top-color: #ff3355;
            }
            color: #ff3355;
        }
        .item-down-2{
            .triangle{
                border-bottom-color: #4cffa6;
            }
            color: #4cffa6;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #changeColor{
        padding-top: 50px*@ip5;
        font-size: 14px*@ip5;
        .title{
            padding: 10px*@ip5 20px*@ip5;
            border-bottom: solid 1px*@ip5 #17191e;
        }
        .option-item{
            padding: 10px*@ip5 20px*@ip5;
            .radio-btn{
                width: 20px*@ip5;
                height: 20px*@ip5;
                border-width: 2px*@ip5;
                margin-right: 10px*@ip5;
                img{
                    width: 12px*@ip5;
                }
            }
            .item-title{
                margin-right: 10px*@ip5;
            }
            .item-info{
                margin-right: 10px*@ip5;
                .triangle{    
                    border-width: 5px*@ip5;
                    border-bottom-width: 10px*@ip5;
                }
                .anti-triangle{
                    border-width: 5px*@ip5;
                    border-top-width: 10px*@ip5;
                    border-bottom-width: 0px*@ip5;
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #changeColor{
        padding-top: 50px*@ip6;
        font-size: 14px*@ip6;
        .title{
            padding: 10px*@ip6 20px*@ip6;
            border-bottom: solid 1px*@ip6 #17191e;
        }
        .option-item{
            padding: 10px*@ip6 20px*@ip6;
            .radio-btn{
                width: 20px*@ip6;
                height: 20px*@ip6;
                border-width: 2px*@ip6;
                margin-right: 10px*@ip6;
                img{
                    width: 12px*@ip6;
                }
            }
            .item-title{
                margin-right: 10px*@ip6;
            }
            .item-info{
                margin-right: 10px*@ip6;
                .triangle{
                    border-width: 5px*@ip6;
                    border-bottom-width: 10px*@ip6;
                }
                .anti-triangle{
                    border-width: 5px*@ip6;
                    border-top-width: 10px*@ip6;
                    border-bottom-width: 0px*@ip6;
                }
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
