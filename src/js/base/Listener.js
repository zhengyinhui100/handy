/**
 * 自定义事件/通知器类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Listener',function($H){
	
	var _cache={};             //缓存
		
	var Listener={
		add            : fAdd,            //添加事件
		remove         : fRemove         //移除事件
	};
	
	/**
	 * 添加事件
	 * @method add
	 * @param
	 */
	function fAdd(){
	}
	/**
	 * 移除事件
	 * @method remove
	 * @param
	 */
	function fRemove(){
	}
	
	return Listener;
	
});