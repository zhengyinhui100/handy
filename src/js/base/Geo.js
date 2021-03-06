/**
 * 地理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define('B.Geo','B.Object',function(Obj){
	
	var Geo={
		distance         : fDistance          //计算两点距离(单位为km，保留两位小数)
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
	 * @param {boolean=}bFormat 仅当false时不进行格式化：单位是km(取两位小数)，如：32120->3.21km
	 * @return {number} 返回两点间的距离
	 */
	function fDistance(oCoord1,oCoord2,bFormat){
		if(!oCoord1||!oCoord2){
			return;
		}
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
	        }else if(Obj.isObj(oCoord)){
	        	oCoord=[oCoord.latitude,oCoord.longitude];
	        }
	        return oCoord;
        }
        var EARTH_RADIUS = 6371,nLat1,nLng1,nLat2,nLng2;
        oCoord1=_fFormatData(oCoord1);
    	nLat1=oCoord1[0];
        nLng1=oCoord1[1];
        oCoord2=_fFormatData(oCoord2);
        nLat2=oCoord2[0];
        nLng2=oCoord2[1];
        var nRadLat1 = _fRad(nLat1);
	    var nRadLat2 = _fRad(nLat2);
	    var nDistance = EARTH_RADIUS
						* Math.acos(Math.cos(nRadLat2) * Math.cos(nRadLat1)
						* Math.cos(_fRad(nLng1) - _fRad(nLng2))
						+ Math.sin(nRadLat2)
						* Math.sin(nRadLat1));
	    nDistance=nDistance.toFixed(2);
	    if(bFormat!=false){
	    	if(isNaN(nDistance)){
			    //TODO 可能是计算精度的原因，相同坐标计算结果是NaN
	    		if(nLat1==nLat2&&nLng1==nLng2&&Obj.isNum(nLat1)&&Obj.isNum(nLng1)){
	    			nDistance=0;
	    		}else{
		    		return '未知';
	    		}
	    	}
	    	nDistance+='km';
	    }
	    return nDistance;
	}
	
	return Geo;
	
});