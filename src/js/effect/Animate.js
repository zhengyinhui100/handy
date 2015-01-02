/**
 * 动画类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.effect.Animate"
define('E.Animate',
[
'L.Browser',
'B.Support',
'B.Object'
],
function(Browser,Support,Obj){
	
	var Animate={
		support3d        : fSupport3d,        //是否支持硬件加速
		slide            : fSlide             //滑动
	};
	
	var _bSopport3d;
	var _sTransition;
	var _sTransform;
	var _sTrans3dPre='translate3d(';
	var _sTrans3dSuf='px,0px,0px)';
	
	/**
	 * 返回位置字符串
	 * @param {number|string}pos 参数位置
	 * @return {string} 返回带单位的标准位置
	 */
	function _fGetPos(pos){
		if(typeof pos==='number'){
			pos+='px';
		}
		var sPos=pos===undefined?'0px':pos;
		return sPos; 
	}
	/**
	 * 是否支持硬件加速
	 * @return {boolean} true表示支持硬件加速
	 */
	function fSupport3d(){
		if(_bSopport3d===undefined){
			_sTransform=Support.ifSupportStyle('transform',_sTrans3dPre+0+_sTrans3dSuf);
			_bSopport3d=!!_sTransform;
		}
		return _bSopport3d;
	}
	/**
	 * 滑动
	 * @param {element}oEl 参数节点
	 * @param {object=}oPos 参数位置{
	 * 		{string|number}x:x轴位置，默认为0px,
	 * 		{string|number}y:y轴位置，默认为0px,
	 * 		{string|number}z:z轴位置，默认为0px
	 * }
	 * @param {string=}speed 滑动速度
	 */
	function fSlide(oEl,oPos,speed){
		if(Animate.support3d()){
			if(speed){
				_sTransition=_sTransition||Support.ifSupportStyle('transition');
				oEl.style[_sTransition]='all 0.15s linear';
			}
			oEl.style[_sTransform]=_sTrans3dPre+_fGetPos(oPos&&oPos.x)+','+_fGetPos(oPos&&oPos.y)+','+_fGetPos(oPos&&oPos.z)+')';
		}
	}
	
	return Animate;
	
});