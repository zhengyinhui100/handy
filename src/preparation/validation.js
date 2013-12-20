/**
 * 验证类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * created: 2013-12-16
 */
handy.add('Validation',function($){
	
	var Validation={
		isEmail          : fIsEmail,     //检查是否是正确的邮件地址
		isMobile         : fIsMobile,    //检查是否是正确的手机号码
		isTelephone      : fIsTelephone  //检查是否是正确的固定电话号码
		
	}
	
	/**
	 * 检查是否是正确的邮件地址
	 * @method  isEmail
	 * @param {string}sValue 参数字符串
	 * @return  {boolean} 返回true表示正确
	 */
	function fIsEmail( sValue ) {
		return /[A-Za-z0-9_-]+[@](\S*)(net|com|cn|org|cc|tv|[0-9]{1,3})(\S*)/g.test(sValue);
	}
	/**
	 * 检查是否是正确的手机号码
	 * @method  isMobile
	 * @param {string}sValue 参数字符串
	 * @return  {boolean} 返回true表示正确
	 */
	function fIsMobile( sValue ) {
		return /^(?:13\d|15[89])-?\d{5}(\d{3}|\*{3})$/.test(sValue);
	}
	/**
	 * 检查是否是正确的固定电话号码
	 * @method  isTelephone
	 * @param {string}sValue 参数字符串
	 * @return  {boolean} 返回true表示正确
	 */
	function fIsTelephone( sValue ) {
		return /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(sValue);
	}
	
	return Validation;
	
})