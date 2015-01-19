/**
 * String工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define("B.String",function(){
	
	var String={
		getBase64Bit    : fGetBase64Bit,    //读取base64编码的字符串的指定位
		setBase64Bit    : fSetBase64Bit     //设置base64编码的字符串的指定位
	}
	
	var _base64Str='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	
	/**
	 * 通过传入的位，获得十进制数对应的二进制对应位的值
	 * 对应二进制从右到左，从0开始；例如，传入1对应十进制13->二进制1101中的0
	 * @param {number}nNum 十进制数
	 * @param {number}nPos 参数位置
	 * @return {number} 返回是否为0
	 */
	function _fGetBit(nNum,nPos){
		var nCompare = Math.pow(2,nPos);
		if((nNum & nCompare) > 0){
			return 1;
		}else{
			return 0;
		}
	}

	/**
	 * 通过传入的位和值，设置十进制数对应的二进制对应位的值
	 * 对应二进制从右到左，从0开始；例如，传入1对应二进制1101中的0
	 * @param {number}nNum 十进制数
	 * @param {number} nPos
	 * @param {number} nValue
	 * @return {number} 返回十进制
	 */
	function _fSetBit(nNum,nPos,nValue){
		if(_fGetBit(nNum,nPos)!=nValue){
			var nCompare = Math.pow(2,nPos);
			if(nValue == 0){
				return nNum ^ nCompare;
			}else{
				return nNum | nCompare;
			}
		}
		return nNum;
	}
	/**
	 * 读取base64编码的字符串的指定位
	 * @param {string}sStr base64编码的字符串
	 * @param {number}nIndex 字符串索引位置
	 * @param {number}nPos 指定位数(0~5)
	 * @return {number}nValue 要设置的参数值(0或1)
	 */
	function fGetBase64Bit(sStr,nIndex,nPos){
		var sChar=sStr.charAt(nIndex);
		var nNum=_base64Str.indexOf(sChar);
		nNum=_fGetBit(nNum,nPos);
		return nNum;
	}
	/**
	 * 设置base64编码的字符串的指定位
	 * @param {string}sStr base64编码的字符串
	 * @param {number}nIndex 字符串索引位置
	 * @param {number}nPos 指定位数(0~5)
	 * @param {number}nValue 要设置的参数值(0或1)
	 * @return {string}返回设置好的字符串
	 */
	function fSetBase64Bit(sStr,nIndex,nPos,nValue){
		var sChar=sStr.charAt(nIndex);
		var nNum=_base64Str.indexOf(sChar);
		nNum=_fSetBit(nNum,nPos,nValue);
		console.log(_base64Str.indexOf(nNum))
		sStr=sStr.substring(0,nIndex)+_base64Str.charAt(nNum)+sStr.substring(nIndex+1);
		return sStr;
	}
	
	return String;
});