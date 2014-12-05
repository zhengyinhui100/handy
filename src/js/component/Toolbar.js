/**
 * 工具栏类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('C.Toolbar',
'C.AbstractComponent',
function(AC){
	
	var Toolbar=AC.define('Toolbar');
	
	Toolbar.extend({
		//初始配置
		xConfig          : {
			cls              : 'tbar',
			title            : '',                  //标题
			isHeader         : false,
			isFooter         : false           
		},
		
//		scrollHide       : false,                  //是否在页面滚动时自动收起
		defItem          : {
			xtype        : 'Button',
			theme        : 'black',
			xrole        : 'content'
		},
		
		tmpl             : [
			'<div {{bindAttr class="isHeader?hui-header isFooter?hui-footer"}}>',
				'<div class="hui-tbar-left">',
					'{{placeItem > [xrole=left]}}',
				'</div>',
				'{{placeItem > [xrole=content]}}',
				'{{#if title}}<div class="hui-tbar-title js-tbar-txt">{{title}}</div>{{/if}}',
				'<div class="hui-tbar-right">',
					'{{placeItem > [xrole=right]}}',
				'</div>',
			'</div>'
		].join(''),
		
		doConfig         : fDoConfig,           //初始化配置
		parseItem        : fParseItem           //处理子组件配置
		
	});
	/**
	 * 初始化配置
	 */
	function fDoConfig(){
		var me=this;
		me.callSuper();
		if(me.scrollHide){
			me.listen({
				name:'scroll',
				el:$(window),
				handler:function(){
					var nScrollY=window.scrollY;
					if(me.isHeader){
						if(nScrollY-me.lastScroll>0){
							me.hide();
						}else{
							me.show();
						}
					}else if(nScrollY-me.lastScroll<0){
						me.hide();
					}else{
						me.show();
					}
					me.lastScroll=nScrollY;
				}
			})
		}
	}
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.xtype==='Button'&&oItem.shadowSurround===undefined){
			oItem.shadowSurround=true;
		}
	}
	
	return Toolbar;
	
});