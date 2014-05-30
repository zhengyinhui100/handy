/**
 * 校验类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Validator',['B.String','B.Object'],function(String,Object,$H){
	
	var Validator={
		messages: {
			required     : "{name}不能为空",
			email        : "请输入正确的邮件地址",
			url          : "请输入正确的链接地址",
			date         : "请输入正确的日期",
			dateISO      : "请输入正确格式的日期",
			number       : "{name}须是数字",
			digits       : "{name}须是整数",
			creditcard   : "请输入正确的信用卡号码",
			equalTo      : "请输入相同的{name}",
			min          : "{name}不能小于{0}",
			max          : "{name}不能大于{0}",
			range        : "{name}要在{0}到{1}之间",
			maxlength    : "{name}长度不能超过{0}",
			minlength    : "{name}长度不能少于{0}",
			rangelength  : "{name}长度要在{0}到{1}之间"
		},
		valid            : fValid,          //校验
		required         : fRequired,       //不为空
		email            : fEmail,          //是否是邮箱地址
		url              : fUrl,            //是否是url
		date             : fDate,           //是否是日期
		dateISO          : fDateISO,        //是否是正确格式的日期(ISO)，例如：2009-06-23，1998/01/22 只验证格式，不验证有效性
		number           : fNumber,         //是否是合法的数字(负数，小数)
		digits           : fDigits,         //是否是整数
		creditcard       : fCreditcard,     //是否是合法的信用卡号
		min              : fMin,            //是否符合最小值
		max              : fMax,            //是否符合最大值
		range            : fRange,          //数值是否在指定区间内
		minlength        : fMinlength,      //是否符合最小长度
		maxlength        : fMaxlength,      //是否符合最大长度
		rangelength      : fRangelength,    //长度是否在指定区间内
		equalTo          : fEqualTo         //是否跟指定值相等(包括数据类型相等)
	}
	/**
	 * 校验
	 * @param {?}value 需要校验的值
	 * @param {Object}oValidator{
	 * 		{Object}rules : 校验规则，可以有多条，可以是此Validator类里的规则，也可以传入自定义的校验函数
	 * 		{
	 * 			{string}name:{*}valid 如果传入的是函数，表示自定义验证规则(valid(value)返回false则为校验不通过)，
	 * 				如果要使用本类中的校验方法，则传入相应规则要求的参数，如：{required:true,maxlength:50}
	 * 		}
	 * 		{object=}messages : 自定义提示文字，这里定义优先级高于默认的提示
	 * 		{
	 * 			{string}name:msg name对应的时校验规则名，msg则是相应的提示文字
	 * 		}
	 * 		{Function}error : 自定义提示方法
	 * }
	 * @return {boolean} true表示验证成功，false表示失败
	 */
	function fValid(value,oValidator){
		var oRules=oValidator.rules;
		for(var rule in oRules){
			var param=oRules[rule];
			var fValid=typeof param=='function'?param:Validator[rule];
			var bResult=fValid(value,param);
			if(!bResult){
				var fError=oValidator.error||Validator.error;
				var sMessage=oValidator.messages&&oValidator.messages[rule]||Validator.messages[rule];
				//替换{}中的内容，优先匹配param中的，比如{0}、{1}，再匹配oRule中的属性，如：{name}，如果没有匹配则替换为空字符串
				sMessage=sMessage.replace(/\{([^\}]+)\}/g,function(m,$1){
					return param[$1]||($1==0&&param)||oValidator[$1]||param||'';
				})
				fError&&fError(sMessage);
				return bResult;
			}
		}
		return true;
	}
	/**
	 * 不为空
	 * @method required
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fRequired(sValue) {
		return String.trim(''+sValue).length > 0;
	}
	/**
	 * 是否是邮箱地址
	 * @method email
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fEmail( sValue ) {
		return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(sValue);
	}
	/**
	 * 是否是url
	 * @method url
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fUrl( sValue ) {
		return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(sValue);
	}
	/**
	 * 是否是日期
	 * @method date
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fDate( sValue ) {
		return !/Invalid|NaN/.test(new Date(sValue).toString());
	}
	/**
	 * 是否是正确格式的日期(ISO)，例如：2009-06-23，1998/01/22 只验证格式，不验证有效性
	 * @method dateISO
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fDateISO( sValue ) {
		return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(sValue);
	}
	/**
	 * 是否是合法的数字(负数，小数)
	 * @method number
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fNumber( sValue ) {
		return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(sValue);
	}
	/**
	 * 是否是整数
	 * @method digits
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fDigits( sValue ) {
		return /^\d+$/.test(sValue);
	}
	/**
	 * 是否是合法的信用卡号
	 * @method creditcard
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fCreditcard( sValue ) {
		//只能包含数字、空格、横杠
		if ( /[^0-9 \-]+/.test(sValue) ) {
			return false;
		}
		var nCheck = 0,
			nDigit = 0,
			bEven = false;

		sValue = sValue.replace(/\D/g, "");

		for (var n = sValue.length - 1; n >= 0; n--) {
			var cDigit = sValue.charAt(n);
			nDigit = parseInt(cDigit, 10);
			if ( bEven ) {
				if ( (nDigit *= 2) > 9 ) {
					nDigit -= 9;
				}
			}
			nCheck += nDigit;
			bEven = !bEven;
		}

		return (nCheck % 10) === 0;
	}
	/**
	 * 是否符合最小值
	 * @method min
	 * @param {String}sValue 待校验值
	 * @param {number}nNum 指定的最小数值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMin( sValue,nNum ) {
		return sValue >= nNum;
	}
	/**
	 * 是否符合最大值
	 * @method max
	 * @param {String}sValue 待校验值
	 * @param {number}nNum 指定的最大数值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMax( sValue,nNum ) {
		return sValue <= nNum;
	}
	/**
	 * 数值是否在指定区间内
	 * @method range
	 * @param {String}sValue 待校验值
	 * @param {Array}aRange 区间数组
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fRange( sValue,aRange ) {
		return ( sValue >= aRange[0] && sValue <= aRange[1] );
	}
	/**
	 * 是否符合最小长度
	 * @method minlength
	 * @param {String|Array}value 待校验值
	 * @param {number}nLen 长度
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMinlength( value ,nLen) {
		var length = Object.isArr( value ) ? value.length : String.trim(''+value).length;
		return length >= nLen;
	}
	/**
	 * 是否符合最大长度
	 * @method maxlength
	 * @param {String}value 待校验值
	 * @param {number}nLen 长度
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMaxlength( value,nLen ) {
		var length = Object.isArr( value ) ? value.length : String.trim(''+value).length;
		return length <= nLen;
	}
	/**
	 * 长度是否在指定区间内
	 * @method rangelength
	 * @param {String}value 待校验值
	 * @param {Array}aRange 长度区间，如[2,10]
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fRangelength( value,aRange ) {
		var length = Object.isArr( value ) ? value.length : String.trim(''+value).length;
		return ( length >= aRange[0] && length <= aRange[1] );
	}
	/**
	 * 是否跟指定值相等(包括数据类型相等)
	 * @method equalTo
	 * @param {String}sValue 待校验值
	 * @param {*}val 指定值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fEqualTo( sValue,val ) {
		return sValue === val;
	}
	
	return Validator;
	
});