<template>
    <div id="load">
        <div class="hidden"></div>
        <span class="circle">
            <img src="../../assets/img/forex/loading.gif" />
        </span>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#load{
    .hidden{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        background: rgba(0,0,0,.2);
    }
    .circle{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        z-index: 1000000;
        img{
            width: 25px;
        }
        // display: block;
        // width: 20px;
        // height: 20px;
        // border-radius: 100%;
        // border: solid 2px #7e829c;
    }
}
/*ip5*/
@media(max-width:370px) {
    #load{
        .circle{
            img{
                width: 25px*@ip5;
            }
            // width: 20px*@ip5;
            // height: 20px*@ip5;
            // border: solid 2px*@ip5 #7e829c;
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #load{
        .circle{
            img{
                width: 25px*@ip6;
            }
            // width: 20px*@ip6;
            // height: 20px*@ip6;
            // border: solid 2px*@ip6 #7e829c;
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
