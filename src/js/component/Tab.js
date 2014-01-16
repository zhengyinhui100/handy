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
		defItem         : {                    //默认子组件是Button
			xtype:'Button',
			radius:null,
			isInline:false,
			shadow:false
		},
		
		tmpl            : [
			'<div class="w-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<li class="w-tab-item" style="width:<%=100/len%>%">',
					'<%=this.children[i].getHtml()%>',
					'</li>',
					'<%}%>',
				'</ul>',
				'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<div class="js-tab-content">',
					'<%=this.children[i].content%>',
					'</div>',
				'<%}%>',
			'</div>'
		],
		listeners       : [
			{
				type :'click',
				handler : function(){
					
				}
			}
		],
		
		parseItem       : fParseItem           //分析处理子组件
	});
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
	}
	
	
	return Tab;
	
});