/**
 * 纵向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Vcard',
'C.AbstractComponent',
function(AC){
	
	var Vcard=AC.define('Vcard');
	
	Vcard.extend({
		//初始配置
		xConfig      : {
			cls          : 'vcard',
			image        : '',    //图片
			title        : '',    //标题
			extraTitle   : ''     //标题右边文字
		},
		
		tmpl         : [
			'<div>',
				'<div class="hui-vcard-title hui-title-hasimg c-clear">',
					'<div class="hui-title-img">',
						'<img {{bindAttr src="image"}}>',
					'</div>',
					'<div class="hui-title-txt">{{title}}</div>',
					'<div class="hui-title-extra">{{extraTitle}}</div>',
				'</div>',
				'{{placeItem >[xrole!=action]}}',
				'<div class="hui-vcard-action">',
					'{{placeItem >[xrole=action]}}',
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
			oAction=$H.extend({
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