/**
 * 下拉选择框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

define('C.Select',
[
'L.Browser',
'B.Object',
'C.AbstractComponent'
],
function(Browser,Obj,AC){
	
	var Select=AC.define('Select');
	
	Select.extend({
		//初始配置
		xConfig         : {
			cls             : 'select',
			name            : '',                  //选项名
			text            : '请选择...',          //为选择时的文字
			value           : '',                  //默认值
			radius          : 'little',
			gradient        : true,
			iconPos         : 'right',             //图标位置，"left"|"right"|"top"|"bottom"
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			}
		},
//		options         : [{text:"文字",value:"值"}],    //选项
//		optionWidth     : 0,                            //选项菜单宽度
		optionClick     : function(){},
		defItem         : {
			xtype       : 'Menu',
			hidden      : true,
			markType    : 'hook',
			showPos     : Browser.mobile()?'center':'followEl',
			renderTo    : "body"              //子组件须设置renderTo才会自动render
		},
		
		_customEvents   : {change:1},
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray iconPosCls"}}>',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input {{bindAttr value="value" name="name"}}/>',
				'<span class="hui-btn-txt">{{text}}</span>',
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
		val              : fVal,                  //获取/设置值
		clearValue       : fClearValue            //清除选中值
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
		var oOptions=Obj.clone(oParams.options);
		me.defTxt=me.get('text');
		var sValue=me.get('value');
		//根据默认值设置默认文字
		var bHasVal=false;
		for(var i=0,len=oOptions.length;i<len;i++){
			var oOption=oOptions[i];
			var val=oOption.value;
			if(val!==undefined&&val==sValue){
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
			width:me.optionWidth||me.width,
			items:oOptions
		})
	}
	/**
	 * 显示选项菜单
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
		if(sValue!==undefined){
			if(me.get('value')!=sValue){
				var oMenu=me.children[0];
				var oItem=oMenu.find('> [value='+sValue+']');
				if(oItem.length>0){
					oItem=oItem[0];
					me.set('value',sValue);
					me.txt(oItem.get('text'));
					//更新菜单选中状态
					oMenu.select(oItem);
					me.trigger("change",sValue,oItem);
				}
			}
		}else{
			return me.get('value');
		}
	}
	/**
	 * 清除选中值
	 */
	function fClearValue(){
		var me=this;
		var oMenu=me.children[0];
		oMenu.selectItem(oMenu.getSelected(),false);
		me.set('value','');
		me.set('text',me.defTxt);
	}
	
	return Select;
	
});