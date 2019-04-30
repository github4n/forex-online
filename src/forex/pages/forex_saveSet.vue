<template>
    <div id="save-set">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div id="header-box">
            <header-bar :showBack="true">
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
            </header-bar>
        </div>
        <div class="option-list">
            <div class="option-item" @tap="optionBtn(1)">
                <span>
                    更换手机号
                </span>
                <img src="../../assets/img/forex/arrow.png"/>
            </div>
            <div class="option-item" @tap="optionBtn(2)">
                <span>
                    修改密码
                </span>
                <img src="../../assets/img/forex/arrow.png"/>
            </div>
            <div class="option-item" @tap="optionBtn(3)">
                <span>
                    修改提现密码
                </span>
                <img src="../../assets/img/forex/arrow.png"/>
            </div>
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
            headerTitle:'安全设置',
            msgTips:'',//toast消息
        }
    },
    methods:{
        optionBtn(index){
            switch(index){
                case 1:this.$router.push({path:'/editPhone'});;break;
                case 2:this.$router.push({path:'/editPwd'});;break;
                case 3:this.$router.push({path: '/moneyPwd'});;break;
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#save-set{
    font-size: 14px;
    padding-top: 50px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .option-list{
        .option-item{
            padding: 10px 20px;
            background: #20212a;
            border-bottom: solid 1px #17191e;
            display: flex;
            justify-content: space-between;
            align-items: center;
            span{
                color:#7e829c;
            }
            img{
                width: 10px;
            }
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #save-set{
        font-size: 14px*@ip5;
        padding-top: 50px*@ip5;
        .option-list{
            .option-item{
                padding: 10px*@ip5 20px*@ip5;
                border-bottom: solid 1px*@ip5 #17191e;
                img{
                    width: 10px*@ip5;
                }
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #save-set{
        font-size: 14px*@ip6;
        padding-top: 50px*@ip6;
        .option-list{
            .option-item{
                padding: 10px*@ip6 20px*@ip6;
                border-bottom: solid 1px*@ip6 #17191e;
                img{
                    width: 10px*@ip6;
                }
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
