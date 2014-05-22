/**
 * 下拉选择框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('C.Select',
'C.AbstractComponent',
function(AC){
	
	var Select=AC.define('Select');
	
	Select.extend({
		//初始配置
		xConfig         : {
			cls             : 'select',
			name            : '',                  //选项名
			text            : '请选择...',          //为选择时的文字
			value           : '',                  //默认值
			radius          : 'little'
		},
//		options         : [{text:"文字",value:"值"}],    //选项
		optionClick     : function(){},
		defItem         : {
			xtype       : 'Menu',
			hidden      : true,
			markType    : 'hook',
			showPos     : 'followEl',
			renderTo    : "body"              //子组件须设置renderTo才会自动render
		},
		
		_customEvents   : ['change'],
		tmpl            : [
			'<div class="hui-btn hui-btn-gray hui-btn-icon-right">',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input {{bindAttr value="value" name="name"}}/>',
				'<span class="hui-btn-txt js-select-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		listeners       : [
			{
				name:'click',
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
		me.callSuper();
		//options配置成菜单
		var oOptions=oParams.options;
		//根据默认值设置默认文字
		var bHasVal=false;
		for(var i=0,len=oOptions.length;i<len;i++){
			var oOption=oOptions[i];
			if(oOption.value==oParams.value){
				me.set('text',oOption.text);
				oOption.selected=true;
				bHasVal=true;
				break;
			}
		}
		if(!bHasVal){
			delete me.value;
		}
		me.add({
			itemClick:function(oButton,nIndex){
				var sValue=oButton.get('value');
				me.val(sValue);
			},
			width:me.width,
			items:oOptions
		})
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
		if(sValue){
			if(me.get('value')!=sValue){
				var oMenu=me.children[0];
				var oItem=oMenu.find('>[value='+sValue+']');
				if(oItem.length>0){
					me.trigger("change");
					oItem=oItem[0];
					me.set('value',sValue);
					me.txt(oItem.get('text'));
					//更新菜单选中状态
					oMenu.select(oItem);
				}
			}
		}else{
			return me.get('value');
		}
	}
	
	return Select;
	
});