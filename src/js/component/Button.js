/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('C.Button',
'C.AbstractComponent',
function(AC){
	
	var Button=AC.define('Button');
	
	Button.extend({
		//初始配置
		xConfig             : {
			cls             : 'btn',
			text            : '',                  //按钮文字
			theme           : 'gray',
			markType        : '',                  //标记类型，默认无标记，'black'黑色圆点标记，'red'红色圆点标记
			iconPos         : '',                  //图标位置，"left"|"right"|"top"|"bottom"，空字符表示无图标
			activeCls       : 'hui-btn-active',    //激活样式
			isBack          : false,               //是否是后退按钮
			radius          : 'little',            //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
			shadow          : true,        	       //外阴影
			isInline        : true,                //宽度自适应
			hasText         : {
				depends : ['text'],
				parse : function(){
					var sTxt=this.get('text');
					return sTxt||sTxt===0;
				}
			},
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			},
			markCls      : {
				depends : ['markType'],
				parse :function(){
					var markType=this.get('markType');
					return markType?'hui-btn-mark-'+markType:'';
				}
			}
		},
//		icon            : null,                //图标名称
		
		defItem         : {
			xtype       : 'Icon'
		},
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" {{bindAttr class="hasText:hui-btn-icon-notxt isBack?hui-btn-back markCls iconPosCls"}}>',
								'<span class="hui-btn-txt">{{text}}</span>',
								'{{placeItem}}',
								'<span class="hui-btn-mark"></span>',
							'</a>'].join('')
	});
	
	return Button;
	
});