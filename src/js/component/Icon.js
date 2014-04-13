/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('C.Icon',
'C.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	
	Icon.extend({
		//初始配置
//		noBg            : false,              //是否取消背景
//		isAlt           : false,              //是否使用深色图标
//		name            : '',                 //图标名称
		
		tmpl            : [
			'<span class="',
			'<%if(this.isAlt){%>',
				' hui-alt-icon',
			'<%}%>',
			' hui-icon-<%=this.name%>',
			'<%if(!this.noBg){%>',
			' hui-icon-bg',
			'<%}%>"></span>'],
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		if($H.isStr(oSettings)){
			oSettings={name:oSettings};
		}
		me.callSuper([oSettings]);
	}
	
	return Icon;
	
});