<template>
    <div id="noticeDetail">
		<tipsDialog :msg="msgTips" ref="dialog"></tipsDialog>
        <div id="header-box">
            <header-bar :showBack="true">
                <span slot="title" class="header-title">
                    {{headerTitle}}
                </span>
            </header-bar>
        </div>
        <div class="notice-main">
            <div class="notice-title">
                {{noticeData.title}}
            </div>
            <div class="notice-time">
                {{noticeData.issueDate}}
            </div>
            <div class="notice-content" v-html="noticeData.content">

            </div>
        </div>
    </div>
</template>

<script>
import headerBar from '../components/header';
export default {
    components:{
        headerBar,
    },
    data(){
        return{
            headerTitle:'系统公告详情',
            msgTips:'',//toast消息,
            noticeData:{},
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
        getNoticeData(){
            this.$http.post(this.PATH + '/announcements/detail', {emulateJSON: true}, {
                params:{
                    nid:this.$route.query.id
                },
                timeout: 5000
            }).then(function(res) {
                var data = res.body;
                if(data.code == 1){
                    this.noticeData = data.data;
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
#noticeDetail{
    font-size: 14px;
    padding-top: 50px;
    height: 100%;
    overflow: auto;
    background: #20212a;
    #header-box{
        position: fixed;
        top: 0;
        width: 100%;
		z-index: 10;
    }
    .notice-main{
        padding:0 20px;
        .notice-title{
            color:#7e829c;
            font-size: 16px;
            font-weight: bold;
            padding: 20px 0;
        }
        .notice-time{
            color:#7e829c;
            font-size: 13px;
            padding-bottom: 10px;
        }
        .notice-content{
            color:#fff;
            font-size: 14px;
        }
    }
}
</style>
