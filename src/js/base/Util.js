/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define('B.Util','B.Object',function(Obj){
	
	var Util={
		isWindow         : fIsWindow,          //检查是否是window对象
		uuid             : fUuid,              //获取handy内部uuid
		getDefFontSize   : fGetDefFontSize,    //获取默认字体大小
		setDefFontSize   : fSetDefFontSize,    //设置默认字体大小
		em2px            : fEm2px,             //em转化为px
		px2em            : fPx2em,             //px转化为em
		position         : fPosition,          //获取节点位置
		result           : fResult             //如果对象中的指定属性是函数, 则调用它, 否则, 返回它
	}
	
	var _nUuid=0;
	var _defFontSize;
	
	/**
	 * 检查是否是window对象
	 * @param {*}obj 参数对象
	 * @return  {boolean}
	 */
	function fIsWindow( obj ) {
		return obj != null && obj == obj.window;
	}
	/**
	 * 获取handy内部uuid
	 * @return  {number}  返回uuid
	 */
	function fUuid(){
		return ++_nUuid;
	}
	/**
	 * 获取默认字体大小
	 * @param {element=}oParent 需要检测的父元素，默认是body
	 * @return {number} 返回默认字体大小(px单位)
	 */
	function fGetDefFontSize(oParent) {
		var bGlobal=!oParent;
		if(bGlobal&&_defFontSize){
			return _defFontSize;
		}
		oParent = oParent || document.body;
		var oDiv = document.createElement('div');
		oDiv.style.cssText = 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';
		oDiv.appendChild(document.createTextNode('M'));
		oParent.appendChild(oDiv);
		var nSize = oDiv.offsetHeight;
		if(bGlobal){
			_defFontSize=nSize;
		}
		oParent.removeChild(oDiv);
		return nSize;
	}
	/**
	 * 设置默认字体大小
	 * @param {number|string}size 需要设置的字体大小
	 * @param {element=}oParent 需要检测的父元素，默认是body
	 */
	function fSetDefFontSize(size,oParent){
		oParent = oParent || document.body;
		if(typeof size=='number'){
			size+='px';
		}
		oParent.style.fontSize=size;
	}
	/**
	 * em转化为px
	 * @param {number}nEm 参数em值
	 * @return {number} 返回相应px值
	 */
	function fEm2px(nEm){
		if(typeof nEm==='string'){
			nEm=parseFloat(nEm.replace('em',''));
		}
		var nDef=Util.getDefFontSize();
		return Math.floor(nEm*nDef);
	}
	/**
	 * px转化为em
	 * @param {number}nPx 参数px值
	 * @return {number} 返回相应em值
	 */
	function fPx2em(nPx){
		var nDef=Util.getDefFontSize();
		var nEm=1/nDef*nPx;
  		nEm=Math.ceil(nEm*1000)/1000;
  		return nEm;
	}
	/**
	 * 获取节点位置
	 * @param {element}el
	 * @return {object} {
	 * 		{number}left:左边偏移量,
	 * 		{number}top:顶部偏移量
	 * }
	 */
	function fPosition(el){
		var nLeft=0;
		var nTop=0;
　　　　 while(el){
			nLeft += el.offsetLeft;
			nTop+=el.offsetTop;
			el = el.offsetParent;
　　　　 }
　　　　 return {top:nTop,left:nLeft};
	}
	/**
	 * 如果对象中的指定属性是函数, 则调用它, 否则, 返回它
	 * @param {Object}oObj 参数对象
	 * @param {string}sProp
	 * @return {*} 如果指定属性值是函数, 则返回该函数执行结果, 否则, 返回该值
	 */
	function fResult(oObj,sProp){
		var value=oObj[sProp];
		if(Obj.isFunc(value)){
			return value();
		}else{
			return value;
		}
	}
	
	return Util;
	
});