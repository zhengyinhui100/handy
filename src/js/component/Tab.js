/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('handy.component.Tab',
'handy.component.AbstractComponent',
function(AC){
	
	var Tab=AC.define('Tab');
	
	$HO.extend(Tab.prototype,{
		//初始配置
//		hasBg           : false,               //是否有背景
//		name            : '',                  //图标名称
		
		tmpl            : [
			'<div class="w-tab">',
				'<ul class="c-clear">',
					'<li class="w-tab-item" style="width:33.3%">',
					'</li>',
				'</ul>',
			'</div>'
		],
		
		parseItem       : fParseItem           //分析处理子组件
	});
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		if(oItem.xtype=="Icon"){
			me.hasIcon=true;
		}
	}
	
	
	return Tab;
	
});