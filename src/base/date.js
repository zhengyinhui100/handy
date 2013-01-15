/**
 * 日期扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Date',function(){
	
	var WDate=window.Date;
	
	var Date={
		getWeek              : fGetWeek,             //返回周几
		isWeeken             : fIsWeeken,            //是否周末
		getDaysInMonth       : fGetDaysInMonth,      //返回该月总共有几天
		getDaysInYear        : fGetDaysInYear,       //返回该年总共有几天
		getDayIndexOfYear    : fGetDayIndexOfYear,   //计算该天是该年的第几天
		format               : fFormat,              //返回指定格式的日期字符串
		parse                : fParse                //将日期字符串转换为Date对象
	}
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
	 * @method formate(oDate[,sFormator])
	 * @param  {Date} oDate 需要格式化的日期对象
	 * @param  {String}sFormator(可选)  格式化因子,如：'yyyy年 第q季 M月d日 星期w H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {string} 返回字符串日期
	 */
	function fFormat(oDate, sFormator) {
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var oDate=oDate||new WDate();

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
	 * @method parse(sDateStr[,sFormator])
	 * @param  {string} sDateStr 需要分析的日期字符串，除了日期数据外不能有数字出现，如：("2012年 12/13","yyyy年 MM/dd")是正确的，("2012年 11 12/13","yyyy年 11 MM/dd")是错误的
	 * @param  {String}sFormator(可选)  格式化因子,除了formator元素外，不能出现字母(与第一个参数类似)，如：'yyyy年 M月d日 H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {object} 返回Date对象
	 */
	function fParse(sDateStr, sFormator) {
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var aFormatorMatches=sFormator.match(/[a-zA-Z]+/g);
		var aNumMatches=sDateStr.match(/\d+/g);
		var oDate=new WDate();
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
	
	return Date;
})