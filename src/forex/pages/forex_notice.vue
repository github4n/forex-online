<template>
    <div id="notice">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div id="header-box">
            <header-bar :showBack="true">
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
            </header-bar>
        </div>
        <div class="notice-list">
            <div class="notice-item" @tap="goToDetail(item)" v-for="(item,index) in noticeList" :key="index">
                <div class="notice-item-info">
                    <div class="notice-item-time">{{item.issueDate}}</div>
                    <div class="notice-item-title">{{item.title}}</div>
                </div>
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
            headerTitle:'系统公告',
            //公告列表
            noticeList:[],
            msgTips:'',//toast消息
        }
    },
    computed:{
        PATH() {
            return this.$store.getters.PATH;
        },
    },
    activated(){
        this.getNoticeData();
    },
    methods:{
        goToDetail(item){
            this.$router.push({
                path:'/forex_noticeDetail',
                query:{
                    id:item.nid,
                }
            })
        },
        //获得公告数据
        getNoticeData(){
            this.$http.post(this.PATH + '/announcements/list', {emulateJSON: true}, {
                timeout: 5000
            }).then(function(res) {
                var data = res.body;
                if(data.code == 1){
                    if(data.data.length>0){
                        this.noticeList = data.data;
                    }
                }else{
                    this.msgTips = data.message;
                    this.$refs.dialog.isShow = true;
                }
            }.bind(this), function(e) {
                this.msgTips = '连接服务器失败';
                this.$refs.dialog.isShow = true;
            }.bind(this));
        }
    }
}
</script>

<style lang="less" scoped>
@import url("../../assets/css/main.less");
#notice{
    font-size: 14px;
    padding-top: 50px;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .notice-list{
        .notice-item{
            padding: 10px 20px;
            border-bottom: solid 1px #17191e;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #20212a;
            .notice-item-info{
                .notice-item-time{
                    color:#7e829c;
                    font-size: 13px;
                }
                .notice-item-title{
                    color: #fff;
                }
            }
            img{
                width: 10px;
            }
        }
    }
}
</style>
