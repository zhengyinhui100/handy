/**
 * 数据类，设置、读取、移除dom节点的数据
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Data',["Util","Object"],function($){
	
	var Data={
		acceptData     : fAcceptData,     //判断元素是否支持expando属性(是否可以保存数据)
		data           : fData,           //设置/读取数据,如果还没绑定数据，返回{}
		remove         : fRemove          //移除数据
	}
	
	//数据池
	var _cache={},
	//自定义属性名称
	_sExpando =("handy_data_" +  Math.random() ).replace(".", "" ),
	//不支持expando属性的元素
	_oNoData={
		"embed": true,
		//除了falsh外，其余object禁止expando属性
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	};
	/**
	 * 判断元素是否支持expando属性(是否可以保存数据)
	 * @method acceptData
	 * @param{element} oElement 需要检查的元素
	 * @return{boolean} 是否可以保存数据
	 */
	function fAcceptData( oElement ) {
		if ( oElement.nodeName ) {
			var match = _oNoData[ oElement.nodeName.toLowerCase() ];
			if ( match ) {
				return !(match === true || oElement.getAttribute("classid") !== match);
			}
		}
		return true;
	}
	/**
	 * 设置/读取数据,如果还没绑定数据，返回{}
	 * @method data(oEl[,sKey,value])
	 * @param {element} oEl 需要设置/读取数据的节点
	 * @param {string} sKey 数据名称
	 * @param {*} value(可选) 需要设置的数据，如果未传表示是读取数据
	 * @return{?*} 返回数据(如果是读取的话)
	 */
	function fData(oEl,sKey,value){
		if(!Data.acceptData()){
			return;
		}
		var sDataId=oEl[_sExpando];
		if(!sDataId){
			sDataId=oEl[_sExpando]="handy_"+$.Util.getUuid();
			_cache[sDataId]={};
		}
		//设置数据
		if(arguments.length==3){
			_cache[sDataId][sKey]=value;
		}else{
			if(typeof sKey=='string'){
				return _cache[sDataId][sKey];
			}else{
				return _cache[sDataId];
			}
		}
	}
	/**
	 * 移除数据
	 * @method remove
	 * @param {element} oEl 要操作的节点
	 * @param {string} sKey(可选) 需要移除的数据名称
	 */
	function fRemove(oEl,sKey){
		var sDataId=oEl[_sExpando];
		//还没有数据，直接返回
		if(!sDataId){
			return;
		}
		//sKey为空，移除该节点所有数据
		if(arguments.length==1){
			delete _cache[sDataId];
			try{
				delete oEl[ _sExpando ];
			}catch(e){
				if ( oEl.removeAttribute ) {
					oEl.removeAttribute( _sExpando );
				} else {
					oEl[ _sExpando ] = null;
				}
			} 
		}else if(typeof sKey=='string'){
			if(_cache[sDataId]){
				delete _cache[sDataId][sKey];
				if($.Object.isEmpty(_cache[sDataId])){
					Data.remove(oEl);
				}
			}
		}
	}
	
	return Data;
	
})