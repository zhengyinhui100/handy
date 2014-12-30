/**
 * 纵向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.Vcard',
[
'B.Object',
'C.AbstractComponent'
],
function(Obj,AC){
	
	var Vcard=AC.define('Vcard');
	
	Vcard.extend({
		//初始配置
		xConfig      : {
			cls          : 'vcard',
			hasImg       : false, //标题是否有图片
			title        : '',    //标题
			hasBorder    : false, //是否有边框
			extTitle     : ''       //标题右边文字
		},
		
//		action       : {}         //快捷指定按钮
		
		tmpl         : [
			'<div {{bindAttr class="hasBorder?hui-border"}}>',
				'<div {{bindAttr class="#hui-vcard-title hasImg?hui-title-hasimg #c-clear"}}>',
					'{{placeItem > [xrole=title]}}',
					'{{#if title}}',
						'<div class="hui-title-txt">{{title}}</div>',
					'{{/if}}',
					'{{#if extTitle}}',
						'<div class="hui-title-extra">{{extTitle}}</div>',
					'{{/if}}',
				'</div>',
				'{{placeItem > [xrole!=title][xrole!=action]}}',
				'<div class="hui-vcard-action">',
					'{{placeItem > [xrole=action]}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var oAction=oSettings.action;
		if(oAction){
			oAction=Obj.extend({
				xtype:'Button',
				radius:null,
				isInline:false,
				xrole:'action'
			},oAction);
			me.add(oAction);
		}
	}
	
	return Vcard;
	
});