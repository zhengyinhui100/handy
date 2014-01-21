/**
 * 自定义事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Listener',function($H){
	
	var _cache={};             //自定义事件池
		
	var Listener={
		add            : fAdd,            //添加事件
		remove         : fRemove,         //移除事件
		fire           : fFire            //触发事件
	};
	
	/**
	 * 添加事件
	 * @method add
	 * @param {string}sName 事件名
	 * @param {function}fHandler 事件函数
	 */
	function fAdd(sName,fHandler){
		var aCache=_cache[sName];
		if(!aCache){
			aCache=_cache[sName]=[]
		}
		aCache.push(fHandler);
		
	}
	/**
	 * 移除事件
	 * @method remove
	 * @param {string}sName 事件名
	 * @param {function=}fHandler 事件函数，如果此参数为空，表示删除指定事件名下的所有函数
	 * @param {boolean} true表示删除成功，false表示失败
	 */
	function fRemove(sName,fHandler){
		var aCache=_cache[sName];
		if(!aCache){
			return false;
		}
		if(!fHandler){
			delete _cache[sName];
		}else{
			for(var i=0,len=aCache.length;i<len;i++){
				if(aCache[i]==fHandler){
					aCache.splice(i,1);
					return true;
				}
			}
		}
		return false;
	}
	/**
	 * 触发事件
	 * @method fire(sName[,data,..])
	 * @param {string}sName 事件名
	 * @param {*}data 传递参数
	 * @return {*}只是返回最后一个函数的结果
	 */
	function fFire(sName,data){
		var aCache=_cache[sName];
		if(!aCache){
			return false;
		}
		var aArgs=Array.prototype.slice.call(arguments,1);
		for(var i=0,len=aCache.length;i<len;i++){
			//只是返回最后一个函数的结果
			if(i==len-1){
				return aCache[i].apply(null,aArgs);
			}else{
				aCache[i].apply(null,aArgs);
			}
		}
	}
	
	return Listener;
	
});