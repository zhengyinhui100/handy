/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('handy.component.Input',
'handy.component.AbstractComponent',
function(AC){
	
	var Input=AC.define('Input');
	
	$HO.extend(Input.prototype,{
		//初始配置
		type            : '',                  //图标名称
//		placeholder     : '',                  //placeholder
		radius          : 'normal',            //普通圆角
		iconPos         : 'left',              //图标位置
		btnPos          : 'right',             //按钮位置
		
		tmpl            : [
		'<div class="w-input<%if(this.hasIcon){%> w-input-icon-<%=this.iconPos%><%}%>',
		'<%if(this.hasBtn){%> w-input-btn-<%=this.btnPos%><%}%>">',
			'<%=this.getChildrenHtml()%>',
			'<input type="text" class="js-input w-input-txt"<%if(this.placeholder){%> placeholder="<%=this.placeholder%><%}%>"/>',
		'</div>'],
		listeners       : [
			{
				type : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('w-focus');
				}
			},
			{
				type : 'blur',
				el : '.js-input',
				handler : function(){
					this.getEl().removeClass('w-focus');
				}
			}
		],
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem         //分析处理子组件
		
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.constructor.superProt.doConfig.call(me,oSettings);
		//搜索框快捷配置方式
		if(me.type=='search'){
			if(!me.params.items){
				me.params.items=[];
			}
			me.params.items.push({
				xtype:'Icon',
				name:'search',
				hasBg:true
			})
		}
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		if(oItem.xtype=="Icon"){
			me.hasIcon=true;
		}else if(oItem.xtype=="Button"){
			me.hasBtn=true;
		}
	}
	
	return Input;
	
});