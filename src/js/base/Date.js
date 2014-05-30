/**
 * 日期扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Date',function(){
	
	var WDate=window.Date;
	
	var Date={
		getWeek              : fGetWeek,             //返回周几
		isWeeken             : fIsWeeken,            //是否周末
		getDaysInMonth       : fGetDaysInMonth,      //返回该月总共有几天
		getDaysInYear        : fGetDaysInYear,       //返回该年总共有几天
		getDayIndexOfYear    : fGetDayIndexOfYear,   //计算该天是该年的第几天
		formatDate           : fFormatDate,          //返回指定格式的日期字符串
		parseDate            : fParseDate,           //将日期字符串转换为Date对象
		now                  : fNow,                 //设置/读取服务器时间
		howLong              : fHowLong              //计算距离现在多久了
	}
	
	//客户端和服务器端时间差
	var _timeDif=0;
	
	/**
	 * 返回周几
	 * @method getWeek
	 * @param  {Date} oDate 需要增减的日期对象
	 * @param {number}nDiff	天偏移量-7~7
	 * @return {string} 返回周几的中文
	 */
	function fGetWeek(oDate, nDiff){
		var aWeek = [ "日","一","二","三","四","五","六" ];
		var nDay = oDate.getDay();
		if(nDiff){
			nDay += nDiff%7+7;
			nDay %= 7;
		}
		return aWeek[nDay];
	}
	/**
	 * 是否周末
	 * @method isWeeken
	 * @param  {Date} oDate 参数日期对象
	 * @return {boolean} 返回true表示是周末
	 */
	function fIsWeeken(oDate){
		return oDate.getDay()==0 || oDate.getDay()==6;
	}
	/**
	 * 返回该月总共有几天
	 * @method getDaysInMonth
	 * @param  {Date} oDate 参数日期对象
	 * @return {number} 返回当该月的天数
	 */
	function fGetDaysInMonth(oDate){
		oDate=new WDate(oDate.getFullYear(),oDate.getMonth()+1,0);
		return oDate.getDate();
	}
	/**
	 * 返回该年总共有几天
	 * @method getDaysInYear
	 * @param  {Date} oDate 参数日期对象
	 * @return {number} 返回当该年的天数
	 */
	function fGetDaysInYear(oDate){
		var oStart = new WDate(oDate.getFullYear(),0,0);
		var oEnd=new WDate(oDate.getFullYear()+1,0,0);
		return Math.floor((oEnd.getTime() - oStart.getTime()) / 86400000);
	}
	/**
	 * 计算该天是该年的第几天
	 * @method getDayIndexOfYear
	 * @param  {Date} oDate 参数日期对象
	 * @return {number} 返回该天是该年的第几天
	 */
	function fGetDayIndexOfYear(oDate){
		var oTmp = new WDate("1/1/" + oDate.getFullYear());
		return Math.ceil((oDate.getTime() - oTmp.getTime()) / 86400000);
	}
	/**
	 * 返回指定格式的日期字符串
	 * @method formatDate(oDate[,sFormator])
	 * @param  {Date} oDate 需要格式化的日期对象
	 * @param  {string}sFormator(可选)  格式化因子,如：'yyyy年 第q季 M月d日 星期w H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {string} 返回字符串日期
	 */
	function fFormatDate(oDate, sFormator) {
		if(typeof oDate!='object'){
			return oDate;
		}
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var nHours=oDate.getHours();
		var nQuarter=Math.floor((oDate.getMonth() + 3) / 3)
		var oData = {
			"y+" : oDate.getFullYear(),
			"M+" : oDate.getMonth() + 1,
			"d+" : oDate.getDate(),
			"h+" : nHours % 12 == 0 ? 12 : nHours % 12, //12小时制 
            "H+" : nHours, //24小时制
			"m+" : oDate.getMinutes(),
			"s+" : oDate.getSeconds(),
			"w+" : Date.getWeek(oDate),
			"q+" : nQuarter,//季度(阿拉伯数字)
			"Q+" : ["一","二","三","四"][nQuarter-1],//季度(中文数字)
			"S+" : oDate.getMilliseconds()
		}

		for (var k in oData) {
			if (new RegExp("(" + k + ")").test(sFormator)) {
				var nLen=RegExp.$1.length;
				sFormator = sFormator.replace(RegExp.$1, nLen== 1 ? oData[k] : ("00" + oData[k]).slice(-nLen));
			}
		}
 		return sFormator;
	}
	/**
	 * 将日期字符串转换为Date对象
	 * @method parseDate(date[,sFormator])
	 * @param  {number|string} date 需要分析的日期字符串或者getTime方法返回的数字，其它类型的参数直接返回参数本身，除了日期数据外不能有数字出现，如：参数("2012年 12/13","yyyy年 MM/dd")是正确的，而参数("2012年 11 12/13","yyyy年 11 MM/dd")的11是错误的
	 * @param  {string}sFormator(可选)  格式化因子,除了formator元素外，不能出现字母(与第一个参数类似)，如：'yyyy年 M月d日 H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {Object} 返回Date对象
	 */
	function fParseDate(date, sFormator) {
		var sType=typeof date;
		var oDate=new WDate();
		if(sType=='number'){
			oDate.setTime(date);
			return oDate;
		}
		if(sType!='string'){
			return date;
		}
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var aFormatorMatches=sFormator.match(/[a-zA-Z]+/g);
		var aNumMatches=date.match(/\d+/g);
		//格式错误，返回空值
		if(!aNumMatches){
			return;
		}
		//如果设置月份时，日期大于要设置的月份的最大天数，会使月份数增加一月，所以这里先设置为1
		oDate.setDate(1);
		for(var i=0;i<aNumMatches.length;i++){
			var sFormatorMatch=aFormatorMatches[i];
			var nNum=parseInt(aNumMatches[i]);
			switch (sFormatorMatch){
				case 'yyyy':
					oDate.setFullYear(nNum);
					break;
				case 'MM':
					oDate.setMonth(nNum-1);
					break;
				case 'dd':
					//如果要设置的日期数大于该月最大天数，设置为该月最后一天
					var nDay=Date.getDaysInMonth(oDate);
					if(nNum>nDay){
						nNum=nDay;
					}
					oDate.setDate(nNum);
					break;
				case 'HH':
					oDate.setHours(nNum);
					break;
				case 'mm':
					oDate.setMinutes(nNum);
					break;
				case 'ss':
					oDate.setSeconds(nNum);
					break;
				case 'SS':
					oDate.setMilliseconds(nNum);
					break;
			}
		}
		return oDate;
	}
	/**
	 * 设置/读取服务器时间
	 * @param {number|string|Date=}time 不传表示读取
	 * @param {Date} 返回当前服务器时间
	 */
	function fNow(time){
		var oNow = new WDate();
		if(time){
			if(typeof time!='number'){
				time=Date.parseDate(time).getTime();
			}
			_timeDif=time-oNow.getTime();
		}else{
			oNow.setTime(oNow.getTime()+_timeDif);
			return oNow;
		}
	}
	/**
	 * 计算距离现在多久了
	 * @param {Date}oTime 参数时间
	 * @param {boolean=}bFormat 仅当false时不进行格式化：小于60分钟的单位是分钟，
	 * 					小于一天的单位是小时，小于30天的单位是天，大于30天返回"30天前"
	 */
	function fHowLong(oTime,bFormat){
		if(!oTime){
			return;
		}
		var oNow=Date.now();
		var time=oNow.getTime()-oTime.getTime();
		if(bFormat!=false){
			var sUnit;
			if((time=time/(1000*60))<60){
				sUnit='分钟'; 
				time=time||1;
			}else if((time=time/60)<24){
				sUnit='小时'; 
			}else if((time=time/24)<30){
				sUnit='天'; 
			}else{
				return '30天前'; 
			}
			//最少显示一分钟前
			time=(Math.floor(time)||1)+sUnit+'前';
		}
		return time;
	}
	
	return Date;
});