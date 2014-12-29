/**
 * 数据仓库类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.data.DataStore"
define('D.DataStore',
'B.Class',
function(){
	var DataStore=$H.createClass();
	
	$H.extend(DataStore.prototype,{
		get            : fGet,       //获取数据
		find           : fFind,
		push           : fPush       //放入仓库
	});
	//缓存池
	var _cache={
//		name : []
	};
	
	//全局快捷别名
	$S=$H.getSingleton(DataStore);
	
	/**
	 * 获取数据
	 * @param {string}sName 模型名称或者cid
	 * @param {Object=}oOptions 用于匹配的键值对
	 * @return {Model|Array} 如果通过cid或id获取，返回模型对象，否则返回匹配的模型数组
	 */
	function fGet(sName,oOptions){
		var oCache;
		if($H.isClass(sName)){
			sName=sName.$ns;
		}else if($H.isInstance(sName)){
			sName=sName.constructor.$ns;
		}else{
			sName=$H.alias(sName);
		}
		if(oCache=_cache[sName]){
			if(oOptions===undefined){
				return oCache;
			}
			if(!$H.isObj(oOptions)){
				//根据id查找
				oOptions={id:oOptions};
			}
			var aResult=[];
			$H.each(oCache,function(k,obj){
				if($H.largeThan(obj,oOptions)){
					aResult.push(obj);
				}
			});
			return aResult.length>0?aResult[0]:null;
		}
	}
	/**
	 * 
	 */
	function fFind(){
		
	}
	/**
	 * 放入仓库
	 * @param {string=}sCid 客户id
	 * @param {*}data 数据
	 */
	function fPush(sCid,data){
		if(typeof sCid!='string'){
			data=sCid;
			sCid=null;
		}
		var sName=data.constructor.$ns;
		var aCache=_cache[sName]||(_cache[sName]={});
		aCache[data.uuid]=data;
		//快捷访问别名(客户id)
		if(sCid){
			if(!_cache[sCid]){
				_cache[sCid]=data;
			}
		}
	}
	
	return DataStore;
	
});