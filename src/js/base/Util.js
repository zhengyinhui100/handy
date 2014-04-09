/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Util','B.Object',function(Object,$H){
	
	var Util={
		isWindow         : fIsWindow,  //检查是否是window对象
		getUuid          : fGetUuid,   //获取handy内部uuid
		getHash          : fGetHash,   //获取hash，不包括“？”开头的query部分
		setHash          : fSetHash,   //设置hash，不改变“？”开头的query部分
		distance         : fDistance,  //计算两点距离(单位为km，保留两位小数)
		result           : fResult     //如果对象中的指定属性是函数, 则调用它, 否则, 返回它
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
	/**
	 * 计算两点距离(单位为km，保留两位小数)
	 * @param {Object|Array|Model}oCoord1 参数坐标1
	 * 				Object类型{
	 * 					{number}latitude:纬度,
	 * 					{number}longitude:经度
	 * 				}
	 * 				Array类型[{number}latitude,{number}longitude]
	 * 				Model类型，包含latitude和longitude属性
	 * @param {Object|Array}oCoord2 参数坐标2
	 * @param {boolean=}bFormat 仅当true进行格式化：单位是km(取两位小数)，如：32120->3.21km
	 * @return {number} 返回两点间的距离
	 */
	function fDistance(oCoord1,oCoord2,bFormat){
		/** 
         * 求某个经纬度的值的角度值 
         * @param {Object} degree 
         */  
        function _fRad(nDegree){  
            return nDegree*Math.PI/180;  
        }
        /**
         * 格式化输入数据，返回数组形式
         */
        function _fFormatData(oCoord){
        	if(oCoord.get){
	        	oCoord=[oCoord.get("latitude"),oCoord.get("longitude")];
	        }else if($H.isObj(oCoord)){
	        	oCoord=[oCoord.latitude,oCoord.longitude];
	        }
	        return oCoord;
        }
        var EARTH_RADIUS = 6378.137,nLat1,nLng1,nLat2,nLng2;
        oCoord1=_fFormatData(oCoord1);
    	nLat1=oCoord1[0];
        nLng1=oCoord1[1];
        oCoord2=_fFormatData(oCoord2);
        nLat2=oCoord2[0];
        nLng2=oCoord2[1];
        var nRadLat1 = _fRad(nLat1);
	    var nRadLat2 = _fRad(nLat2);
	    var nRadLatDif = nRadLat1 - nRadLat2;
	    var nRadLngDif = _fRad(nLng1) - _fRad(nLng2);
	    var nDistance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(nRadLatDif/2),2) +
	     	Math.cos(nRadLat1)*Math.cos(nRadLat2)*Math.pow(Math.sin(nRadLngDif/2),2)));
	    nDistance = nDistance * EARTH_RADIUS;
	    nDistance = Math.round(nDistance * 10000);
	    nDistance=(nDistance/1000).toFixed(2);
	    if(bFormat){
	    	if(isNaN(nDistance)){
	    		return '未知';
	    	}
	    	nDistance+='km';
	    }
	    return nDistance;
	}
	/**
	 * 如果对象中的指定属性是函数, 则调用它, 否则, 返回它
	 * @method result
	 * @param {Object}oObj 参数对象
	 * @param {string}sProp
	 * @return {*} 如果指定属性值是函数, 则返回该函数执行结果, 否则, 返回该值
	 */
	function fResult(oObj,sProp){
		var value=oObj[sProp];
		if(Object.isFunc(value)){
			return value();
		}else{
			return value;
		}
	}
	
	return Util;
	
});