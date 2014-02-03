/**
 * 控制组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('c.ControlGroup',
['c.ComponentManager',
'c.AbstractComponent'],
function(CM,AC){
	
	var ControlGroup=AC.define('ControlGroup');
	
	$HO.extend(ControlGroup.prototype,{
		//初始配置
//		direction            : 'v',                  //排列方向，'v'表示垂直方向，'h'表示水平方向
		radius               : 'little',             //圆角
//		itemClick            : function(oCmp,nIndex){},         //子项点击事件函数，函数参数为子组件对象及索引
		
		//默认子组件配置
		defItem              : {
			xtype            : 'Button',
			extCls           : 'js-item',
			radius           : null,
			shadow           : false,
			isInline         : false
		},
		
		tmpl                 : [
			'<div class="hui-ctrlgp<%if(this.direction=="h"){%> hui-ctrlgp-h<%}else{%> hui-ctrlgp-v<%}%>">',
			'<%=this.getHtml("$>*")%>',
			'</div>'
		],
		
		listeners       : [
			{
				type :'click',
				selector : '.js-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					var oCurrentEl=$(oEvt.currentTarget);
					var nIndex=CM.get(oCurrentEl.attr("id")).index();
					me.onItemClick(oEvt,nIndex);
				}
			}
		],
		
		setActiveItem        : fSetActiveItem,       //激活指定标签项
		getActiveItem        : fGetActiveItem,       //获取激活的标签项
		val                  : fVal,                 //获取/设置值
		onItemClick          : fOnItemClick          //子项点击事件处理
	});
	
	/**
	 * 激活指定标签项
	 * @method setActiveItem
	 * @param {number|string}item number表示索引，string表示选择器
	 */
	function fSetActiveItem(item){
		var me=this,oActive;
		me.callChild('unactive');
		if(typeof item=='number'){
			oActive=me.children[item];
		}else{
			oActive=me.find(item)[0];
		}
		oActive.active();
	}
	/**
	 * 获取激活的标签项
	 * @method getActiveItem
	 * @param {boolean=}bIsIndex 仅当true时返回索引
	 * @return {Component} 返回当前激活的组件
	 */
	function fGetActiveItem(bIsIndex){
		var me=this,nIndex,oItem;
		me.each(function(i,item){
			if(item.isActive){
				oItem=item;
				nIndex=i;
				return false;
			}
		});
		return bIsIndex?nIndex:oItem;
	}
	/**
	 * 获取/设置值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值，如果是多个值，用","隔开
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue){
			var aValues=sValue.split(','),aSel=[];
			me.each(function(i,oCmp){
				oCmp.setChecked($HO.contains(aValues,oCmp.value));
			});
		}else{
			var aCmp=me.find('$>[checked=true]');
			var aValues=[];
			$HO.each(aCmp,function(i,oCmp){
				aValues.push(oCmp.value);
			})
			return aValues.join(',');
		}
	}
	/**
	 * 子项点击事件处理
	 * @method onItemClick
	 * @param {jQ:Event}oEvt jQ事件对象
	 * @param {number}nIndex 子项目索引
	 */
	function fOnItemClick(oEvt,nIndex){
		var me=this;
		if(me.itemClick){
			var oCmp=me.children[nIndex];
			me.itemClick(oCmp,nIndex);
		}
	}
	
	
	return ControlGroup;
	
});