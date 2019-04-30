var pro = {};
/**
 * @describer 公共JS
 * @author WXF
 * @time 
 */
/***************************************************************/
/**
 * 保留两位小数点
 * @param {number} num
 * 
 */
pro.parseTwoFloat = function(num) {
	var arr = num.toString().split('.')[1];
	if(arr == undefined) {
		return num + '.00';
	} else {
		if(arr.length == 1) {
			return num + '0';
		} else if(arr.length == 2) {
			return num;
		} else {
			return num.toFixed(2);
		}
	}
};

/**
 * 调用原生js拨打电话
 * @param {} 
 * 
 */
pro.callService = function(num){
	mui.plusReady(function(){
		plus.nativeUI.confirm("账户余额不足，请拨打"+ num +"索要模拟金。",function(e){
			if(e.index==1){
				plus.device.dial("4008528008",false);
			}
		},
		num,["取消","呼叫"]);
	});
};

/**
 * 判断网络是否已连接
 * @param {} 
 * 
 */
var network = true;
pro.netIsconnected = function(fail, success){
	mui.plusReady(function() {
		document.addEventListener("netchange",function(){
			if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
//				mui.toast("网络异常，请检查网络设置！");
				network = false;
				if(fail) fail();
			}else{
				network = true;
				if(success) success();
			}
		},false);
	});
	return network;
}


pro.getDate = function (time,d) {
	var date=new Date(time);
	var year=date.getYear()+1900;
	var month=date.getMonth()+1;
	var day=date.getDate();
	var hour=date.getHours();
	var minu=date.getMinutes();
	var sec=date.getSeconds();
	if(day < 10){
		day = "0" + day;
	}
	if(month < 10){
		month = "0" + month;
	}
	if(hour < 10){
		hour = "0" + hour;
	}
	if(minu < 10){
		minu = "0" + minu;
	}
	if(sec < 10){ 
		sec = "0" + sec;
	}
	var d1 = year + "-"+ month + "-" + day + " " + hour + ":" + minu + ":" + sec;
	var d2 = year + "-"+ month + "-" + day;
	var d3 = hour+":"+minu+":"+sec;
	var d4 = hour+":"+minu;
	var d5 = year+"年"+month+"月"+day+"日";
	var d6 = day
	var d7 = year + "-"+ month + "-" + day +" "+"00:00:00";
	var d8 = year + "-"+ month + "-" + day + " " + hour + ":" + minu ;
	switch (d) {
		case 'y-m-d':
			return d2;
			break;
		case 'y-m-d h:i:s':
			return d1;
			break;	
		case 'h:i:s':
			return d3;
			break;
		case 'h:m':
			return d4;
			break;	
		case 'yy-mm-dd':
			return d5;
			break;
		case 'd':
			return d6;
			break;
		case 'y-m-d-0':
			return d7;
			break;	
		case 'y-m-d h:i':
			return d8;
			break;	
		case 'y/m/d h:i':
			return d8.replace(/\-/g,'/');
			break;				
		default:
			break;
	}
}

export default pro