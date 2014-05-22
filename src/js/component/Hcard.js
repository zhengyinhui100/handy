/**
 * 横向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Hcard',
['C.AbstractComponent',
'CM.Model',
'CM.Collection'],
function(AC,Model,Collection){
	
	var Hcard=AC.define('Hcard');
	
	Hcard.extend({
		//初始配置
		xConfig  : {
			cls      : 'hcard',
			image    : '',    //图片
			title    : '',    //标题
			hasArrow : false, //是否有右边箭头，有点击函数时默认有右箭头
			desc     : null,    //描述，可以是单个配置也可以是配置数组{icon:图标,text:文字}
			descs    : {
				depends:['desc'],
				type : Collection.derive({
					model : Model.derive({
						fields:{
							iconCls : {
								depends:['icon'],
								parse:function(){
									var sIcon=this.get('icon');
									return sIcon?'hui-icon-'+sIcon:'';
								}
							}
						}
					})
				}),
				parse  : function(){
					var desc=this.get('desc');
					return desc?$H.isArr(desc)?desc:[desc]:desc;
				}
			}
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
					'{{#each descs}}',
						'<div class="hui-content-desc">',
							'{{#if icon}}',
								'<span {{bindAttr class="#hui-icon #hui-mini #hui-alt-icon iconCls #hui-light"}}></span>',
							'{{/if}}',
							'{{text}}',
						'</div>',
					'{{/each}}',
				'</div>',
				'{{placeItem}}',
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
			me.hasArrow=true;
		}
	}
		
	return Hcard;
	
});