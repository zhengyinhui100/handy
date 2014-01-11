/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('handy.component.Icon','handy.component.AbstractComponent',function(AbstractComponent){
	
	
	var Obj=$H.Object;
	var Icon=Obj.createClass();
	
	Obj.inherit(Icon,AbstractComponent);
	
	Obj.extend(Icon,{
	});
	
	Obj.extend(Icon.prototype,{
		ctype           : 'Icon',
		
		//初始配置
		hasBg           : false,               //是否有背景
		name            : '',                  //图标名称
		
		initHtml        : fInitHtml            //初始化html
	});
	/**
	 * 初始化html
	 * @method initHtml
	 */
	function fInitHtml(){
		var that=this;
		return '<span id="<%=this.id%>" class="w-icon w-icon-location"></span>';
	}
	
	return Icon;
	
});