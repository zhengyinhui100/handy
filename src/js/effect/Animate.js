/**
 * 动画类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.effect.Animate"
define('E.Animate',
[
'L.Browser',
'B.Class',
'B.Object'
],
function(Browser,Class,Obj){
	
	var Animate=Class.createClass();
	
	var _events=Browser.hasTouch()?['touchstart','touchmove','touchend']:['mousedown','mousemove','mouseup'];
	
	Obj.extend(Animate.prototype,{
	});
	
	return Animate;
	
});