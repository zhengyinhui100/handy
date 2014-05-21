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
		xConfig         : {
			cls         : 'icon',
			hasBg       : true,               //是否有背景
			isAlt       : false,              //是否使用深色图标
			name        : '',                 //图标名称
			iconName    : {
				depends : ['name'],
				parse :function(){
					return 'hui-icon-'+this.get('name');
				}
			}
		},
		
		tmpl            : 
			'<span {{bindAttr class="isAlt?hui-alt-icon iconName hasBg?hui-icon-bg"}}></span>',
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