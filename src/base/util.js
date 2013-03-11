/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Util',function($){
	
	var Util={
		isWindow         : fIsWindow, //检查是否是window对象
		getUuid          : fGetUuid   //获取HANDY内部uuid
	}
	
	var _nUuid=0;
	
	/**
	 * 获取HANDY内部uuid
	 * @method  getUuid
	 * @return  {number}  返回uuid
	 */
	function fGetUuid(){
		return _nUuid++;
	}
	/**
	 * 检查是否是window对象
	 * @method  isWindow
	 * @param {*}obj 参数对象
	 * @return  {boolean}
	 */
	function fIsWindow( obj ) {
		return obj != null && obj == obj.window;
	}
	
	return Util;
	
});
