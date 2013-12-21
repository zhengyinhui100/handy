/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Util',function($){
	
	var Util={
		isWindow         : fIsWindow,  //检查是否是window对象
		getUuid          : fGetUuid,   //获取handy内部uuid
		getHash          : fGetHash,   //获取hash，不包括“？”开头的query部分
		setHash          : fSetHash    //设置hash，不改变“？”开头的query部分
	}
	
	var _nUuid=0;
	
	/**
	 * 检查是否是window对象
	 * @method  isWindow
	 * @param {*}obj 参数对象
	 * @return  {boolean}
	 */
	function fIsWindow( obj ) {
		return obj != null && obj == obj.window;
	}
	/**
	 * 获取handy内部uuid
	 * @method  getUuid
	 * @return  {number}  返回uuid
	 */
	function fGetUuid(){
		return _nUuid++;
	}
	/**
	 * 获取hash，不包括“？”开头的query部分
	 * @method getHash
	 * @return {?string} 返回hash
	 */
	function fGetHash(){
		var sHash=top.location.hash;
		return sHash.replace(/\?.*/,'');
	}
	/**
	 * 设置hash，不改变“？”开头的query部分
	 * @method setHash
	 * @param {string} sHash要设置的hash
	 */
	function fSetHash(sHash){
		var sOrgHash=top.location.hash;
		if(sOrgHash.indexOf("#")>=0){
			sHash=sOrgHash.replace(/#[^\?]*/,sHash);
		}
		top.location.hash=sHash;
	}
	
	return Util;
	
})