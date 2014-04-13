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
//		image        : '',    //图片
//		title        : '',    //标题
//		extraTitle   : '',    //标题右边文字
		
		tmpl         : [
			'<div class="hui-vcard">',
				'<div class="hui-vcard-title hui-title-hasimg c-clear">',
					'<div class="hui-title-img">',
						'<img alt="" src="<%=this.image%>">',
					'</div>',
					'<div class="hui-title-txt"><%=this.title%></div>',
					'<div class="hui-title-extra"><%=this.extraTitle%></div>',
				'</div>',
				'<%=this.findHtml(">[xrole!=action]")%>',
				'<div class="hui-vcard-action">',
					'<%=this.findHtml(">[xrole=action]")%>',
				'</div>',
			'</div>'
		],
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