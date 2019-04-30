<template>
    <div id="forex-header">
        <!-- <div class="mui-inner-wrap"> -->
            <span class="back-icon" v-if="showBack" @tap="goback">
                <img src="../../assets/img/forex/back.png" />
            </span>
            <slot name="title"></slot>
            <div class="right-icon-box">
                <slot name="otherIcon"></slot>
                <span class="right_icon" v-if="showMenu" @tap="hideMenuBtn">
                    <img src="../../assets/img/forex/menu.png" />
                </span>
            </div>
			<!-- <div class="mui-off-canvas-backdrop"></div> -->
        <!-- </div> -->
		<!-- <div id="hideMenu"> -->
            <!-- <aside class="mui-off-canvas-right">
                <div class="mui-scroll-wrapper">
                    <div class="mui-scroll">
			            <hidden-menu></hidden-menu>
                    </div>
                </div>
            </aside> -->
            <!-- <div class="menu-bg" v-show="isShowMenu" @tap.stop="hideMenu"></div>
            <div :class="['menu-main',isShowMenu?'menu-show':'']">
			    <hidden-menu></hidden-menu>
            </div> -->
		<!-- </div> -->
    </div>
</template>

<script>
import {mapState} from 'vuex';
import hiddenMenu from '../components/hiddenMenu';
export default {
    components:{
		hiddenMenu
    },
    props:{
        showBack:{
            type:Boolean,
            default:true
        },
        showMenu:{
            type:Boolean,
            default:false,
        },
    },
    data(){
        return{
        }
    },
    mounted(){
        mui.init();
    },
    methods:{
        hideMenuBtn(){
			mui('.mui-off-canvas-wrap').offCanvas().refresh();
            mui('.mui-off-canvas-wrap').offCanvas('show');
        },
        goback(){
            this.$router.go(-1);
        },
    }
}
</script>

<style scoped lang="less">
@import url("../../assets/css/main.less");
#forex-header{
    position: relative;
    background: #20212a;
    border-bottom: solid 1px #17191e;
    #hideMenu{
        .menu-bg{
            position: fixed;
            height: 100%;
            width: 100%;
            z-index: 1000;
            background: rgba(0,0,0,.4);
        }
        .menu-main{
            width: 250px;
            height: 100%;
            overflow: auto;
            position: fixed;
            top: 0;
            right: -250px;
            transition: all .3s;
            z-index: 1001;
        }
        .menu-show{
            right: 0px;
        }
    }
}
.right-icon-box{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);    
    display: flex;
    align-items: center;
    height: 100%;
    right:0px;
    span{
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.header-title{
    color:#fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.title-left{
    left: 5%;
    transform: translateX(0%);
    transform: translateY(-50%);
}
.back-icon{
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 40px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
/*ip5*/
@media(max-width:370px) {
    #forex-header {
        height: 50px*@ip5;
        #hideMenu{
            .menu-main{
                width: 250px*@ip5;
                right: -250px*@ip5;
            }
            .menu-show{
                right: 0px*@ip5;
            }
        }
    }
    img {
        width: 20px*@ip5;
        height: 20px*@ip5;
    }
    .right-icon-box{
        span{
            width: 40px*@ip5;
        }
    }
    .header-title{
		font-size: 17px*@ip5;
    }
    .back-icon{
        width: 40px*@ip5;
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #forex-header {
        height: 50px*@ip6;
        #hideMenu{
            .menu-main{
                width: 250px*@ip6;
                right: -250px*@ip6;
            }
            .menu-show{
                right: 0px*@ip6;
            }
        }
    }
    img {
        width: 20px*@ip6;
        height: 20px*@ip6;
    }
    .right-icon-box{
        span{
            width: 40px*@ip6;
        }
    }
    .header-title{
		font-size: 17px*@ip6;
    }
    .back-icon{
        width: 40px*@ip5;
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    #forex-header {
        height: 50px;
        padding-bottom: 3px;
        box-sizing: border-box;
    }
    img {
        width: 20px;
    }
    .right-icon-box{
        right:0px;
        span{   
            width: 40px;
        }
    }
    .header-title{
		font-size: 17px;
    }
}
</style>
