/**
 * 幻灯片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-21
 */

$Define('C.Slide',
'C.AbstractComponent',
function(AC){
	
	var Slide=AC.define('Slide');
	
	Slide.extend({
		//初始配置
		xConfig         : {
			cls         : 'icon'
		},
		
		tmpl            : 
			'',
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper([oSettings]);
	}
	
	return Slide;
	
});