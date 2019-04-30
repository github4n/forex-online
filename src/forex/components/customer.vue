<template>
    <div id="customer">
        <div class="list-item" @tap="option(1)">
            <img src="../../assets/img/forex/message.png" />
            <span>在线客服</span>
        </div>
        <div class="list-item" @tap="option(2)">
            <img src="../../assets/img/forex/phone.png" />
            <span>400-852-8008</span>
        </div>
    </div>    
</template>

<script>
export default {
    methods:{
        option(index){
            switch(index){
                case 1:
                    this.$router.push({path: '/service'});
                    break;
                case 2:window.location.href = 'tel://' + 4008528008;break;
            };
            this.$parent.isShowCustomer = false;
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#customer{
    width: 100%;
    border-radius: 10px;
    font-size: 14px;
    background: #20212a;
    .list-item{
        border-bottom: solid 1px #17191e;
        display: flex;
        align-items: center;
        padding: 15px 20px;
        color: #fff;
        img{
            width: 20px;
            margin-right: 10px;
        }
    }
}
/*ip5*/
@media(max-width:370px) {
    #customer{
        border-radius: 10px*@ip5;
        font-size: 14px*@ip5;
        .list-item{
            border-bottom: solid 1px*@ip5 #17191e;
            padding: 15px*@ip5 20px*@ip5;
            img{
                width: 20px*@ip5;
                margin-right: 10px*@ip5;
            }
        }
    }
}
/*ip6*/
@media (min-width:371px) and (max-width:410px) {
    #customer{
        border-radius: 10px*@ip6;
        font-size: 14px*@ip6;
        .list-item{
            border-bottom: solid 1px*@ip6 #17191e;
            padding: 15px*@ip6 20px*@ip6;
            img{
                width: 20px*@ip6;
                margin-right: 10px*@ip6;
            }
        }
    }
}
/*ip6p及以上*/
@media (min-width:411px) {
    
}
</style>
