/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Select',
'c.AbstractComponent',
function(AC){
	
	var Select=AC.define('Select');
	
	Select.extend({
		//初始配置
//		name            : '',                  //选项名
		text            : '请选择...',          //为选择时的文字
		value           : '',                  //默认值
//		options         : [{text:"文字",value:"值"}],    //选项
		optionClick     : function(){},
		defItem         : {
			xtype       : 'Menu',
			hidden      : true,
			markType    : 'dot',
			renderTo    : "body"              //子组件须设置renderTo才会自动render
		},
		
		_customEvents   : ['change'],
		tmpl            : [
			'<div class="hui-select hui-btn hui-btn-gray hui-btn-icon-right">',
				'<span class="hui-icon hui-icon-carat-d hui-icon-bg"></span>',
				'<select value="<%=this.value%>" name="<%=this.name%>"></select>',
				'<span class="hui-btn-txt js-select-txt"><%=this.text%></span>',
			'</div>'
		],
		
		listeners       : [
			{
				type:'click',
				handler:function(){
					this.showOptions();
				}
			}
		],
		
		doConfig         : fDoConfig,             //初始化配置
		showOptions      : fShowOptions,          //显示选项菜单
		val              : fVal                   //获取/设置值
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		me.callSuper([oParams]);
		//options配置成菜单
		var oOptions=oParams.options;
		if(oOptions){
			me.addItem({
				itemClick:function(oButton,nIndex){
					var sValue=oButton.value;
					me.val(sValue);
				},
				items:oOptions
			})
		}
	}
	/**
	 * 显示选项菜单
	 * @method setChecked
	 * @param {boolean}bChecked 仅当为false时取消选中
	 */
	function fShowOptions(){
		var me=this;
		me.children[0].show();
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		var oSel=me.find('select');
		if(sValue){
			if(me.value!=sValue){
				me.fire("selectedchange");
				me.value=sValue;
				oSel.val(sValue);
				//更新菜单选中状态
				me.children[0].select('$>[value="'+sValue+'"]');
			}
		}else{
			return oSel.val();
		}
	}
	
	return Select;
	
});