/**
 * 横向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Hcard',
'C.AbstractComponent',
function(AC){
	
	var Hcard=AC.define('Hcard');
	
	Hcard.extend({
		//初始配置
		xConfig  : {
			cls      : 'hcard',
			image    : '',    //图片
			title    : '',    //标题
			hasArrow : false  //是否有右边箭头，有点击函数时默认有右箭头
		},
		defItem  : {
			xtype : 'Desc',
			xrole : 'desc'
		},
		
		tmpl     : [
			'<div {{bindAttr class="image?hui-hcard-hasimg"}}>',
				'{{#if image}}',
					'<div class="hui-hcard-img">',
						'<img {{bindAttr src="image"}}>',
					'</div>',
				'{{/if}}',
				'<div class="hui-hcard-content">',
					'<div class="hui-content-title">{{title}}</div>',
					'{{placeItem > [xrole=desc]}}',
				'</div>',
				'{{placeItem > [xrole!=desc]}}',
				'{{#if hasArrow}}',
					'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情">',
						'<span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span>',
					'</a>',
				'{{/if}}',
			'</div>'
		].join(''),
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		//有点击函数时默认有右箭头
		if(oSettings.click&&me.hasArrow===undefined){
			me.set('hasArrow',true);
		}
		//描述类
		var aDesc=me.desc;
		if(aDesc){
			me.add(aDesc);
		}
	}
		
	return Hcard;
	
});