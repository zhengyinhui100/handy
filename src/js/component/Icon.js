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
			theme       : 'gray',             //颜色
			isAlt       : false,              //是否使用深色图标
			radius      : 'big',
			name        : '',                 //图标名称
			iconName    : {
				depends : ['name'],
				parse :function(){
					return 'hui-icon-'+this.get('name');
				}
			}
		},
		
		bgColor         : '',                 //指定具体的背景颜色值
		
		tmpl            : 
			'<span {{bindAttr class="isAlt?hui-alt-icon iconName"}}></span>',
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
		if(oSettings.bgColor){
			oSettings.style=$H.extend(oSettings.style,{backgroundColor:oSettings.bgColor})
		}
		me.callSuper([oSettings]);
	}
	
	return Icon;
	
});