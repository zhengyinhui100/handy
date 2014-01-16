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
		defItem         : {                    //默认子组件是Button
			xtype:'Button',
			radius:null,
			isInline:false,
			iconPos:'top',
			shadow:false
		},
		
		tmpl            : [
			'<div class="w-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<li class="js-tab-item w-tab-item" style="width:<%=100/len%>%">',
					'<%=this.children[i].getHtml()%>',
					'</li>',
					'<%}%>',
				'</ul>',
				'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<div class="js-tab-content"<%if(!this.children[i].active){%> style="display:none"<%}%>>',
					'<%=this.children[i].content%>',
					'</div>',
				'<%}%>',
			'</div>'
		],
		listeners       : [
			{
				type :'click',
				selector : '.js-tab-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					//点击tab按钮显示对应的content
					var oCurrent=$(oEvt.currentTarget);
					me.callChild('unactive');
					var nIndex=oCurrent.index();
					me.children[nIndex].active();
					me.find('.js-tab-content').hide().eq(nIndex).show();
				}
			}
		]
	});
	
	return Tab;
	
});