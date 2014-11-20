/**
 * 控制组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('C.ControlGroup',
'C.AbstractComponent',
function(AC){
	
	var ControlGroup=AC.define('ControlGroup');
	
	ControlGroup.extend({
		//初始配置
		xConfig:{
			cls              : 'ctrlgp',
			direction        : 'v',                  //排列方向，'v'表示垂直方向，'h'表示水平方向
			directionCls     : {
				depends:['direction'],
				parse:function(){
					return 'hui-ctrlgp-'+this.get('direction');
				}
			}
		},
		multi                : false,                //是否多选
//		notSelect            : false,                //点击不需要选中
//		itemClick            : function(oCmp,nIndex){},         //子项点击事件函数，函数参数为子组件对象及索引
		
		//默认子组件配置
		defItem              : {
			xtype            : 'Button',
			radius           : null,
			shadow           : false,
//			selected         : false,             //是否选中
			isInline         : false
		},
		
		_customEvents        : ['Select','Unselect'],
		
		tmpl                 : '<div {{bindAttr class="directionCls"}}>{{placeItem}}</div>',
		
		listeners       : [
			{
				name :'click',
				selector : '.js-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					var oCurrentEl=$(oEvt.currentTarget);
					//可能后后代组件有'.js-item'，因此这里只寻找子组件
					var oCurCmp=me.find('> [_id='+oCurrentEl.attr("id")+']');
					if(oCurCmp.length>0){
						var nIndex=oCurCmp[0].index();
						me.onItemSelect(nIndex);
					}
				}
			}
		],
		
		doConfig             : fDoConfig,            //初始化配置
		parseItem            : fParseItem,           //分析子组件配置
		layout               : fLayout,              //布局
		select               : fSelect,              //选中指定项
		getSelected          : fGetSelected,         //获取选中项/索引
		selectItem           : fSelectItem,          //选中/取消选中
		val                  : fVal,                 //获取/设置值
		onItemSelect         : fOnItemSelect         //子项点击事件处理
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置对象
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		//水平布局需要js计算
		if(me.get('direction')=='h'){
			me.listen({
				name        : 'afterRender add remove',
				custom      : true,
				handler     : function(){
					me.layout();
				}
				
			});
		}
	}
	/**
	 * 分析子组件配置
	 * @param {object}oItem 子组件配置项
	 */
	function fParseItem(oItem){
		oItem.extCls=(oItem.extCls||"")+' js-item';
	}
	/**
	 * 布局
	 */
	function fLayout(){
		var me=this;
		if(me.rendered){
			var nLen=me.children.length;
			var width=Math.floor(100/nLen);
			var oItems=me.getEl().children('.js-item');
			var sFirstCls='hui-item-first';
			var sLastCls='hui-item-last';
			oItems.each(function(i,el){
				var jEl=$(el);
				if(i==0){
					jEl.removeClass(sLastCls);
					jEl.addClass(sFirstCls);
				}else if(i==nLen-1){
					jEl.removeClass(sFirstCls);
					jEl.addClass(sLastCls);
				}else{
					jEl.removeClass(sFirstCls);
					jEl.removeClass(sLastCls);
				}
				if(i<nLen-1){
					el.style.width=width+'%';
				}else{
					el.style.width=(100-width*(nLen-1))+'%';
				}
			});
		}
	}
	/**
	 * 选中指定项
	 * @method select
	 * @param {number|string|Component}item number表示索引，string表示选择器，也可以传入组件对象
	 */
	function fSelect(item){
		var me=this,oItem;
		if(me.notSelect){
			return;
		}
		if(typeof item=='number'){
			oItem=me.children[item];
		}else if(typeof item=="string"){
			oItem=me.find(item)[0];
		}else{
			oItem=item;
		}
		if(oItem){
			if(!me.multi&&!oItem.multi){
				//单选操作要先取消别的选中
				var oSelected=me.getSelected();
				if(oSelected){
					me.selectItem(oSelected,false);
				}
				me.selectItem(oItem);
			}else{
				me.selectItem(oItem,!oItem.get('selected'));
			}
		}
	}
	/**
	 * 获取选中项/索引
	 * @method getSelected
	 * @param {boolean=}bIsIndex 仅当true时返回索引
	 * @return {Component|number|Array} 返回当前选中的组件或索引，单选返回单个对象，复选返回数组(不管实际选中几个),
	 * 									无选中则返回null
	 */
	function fGetSelected(bIsIndex){
		var me=this,aItem=[];
		me.each(function(i,item){
			if(item.get(item.select?'selected':'isActive')){
				aItem.push(bIsIndex?i:item);
			}
		});
		return aItem.length>0?me.multi?aItem:aItem[0]:null;
	}
	/**
	 * 选中/取消选中
	 * @method selectItem
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		bSelect=bSelect!=false;
		if(bSelect){
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select();
			}else{
				oItem.active();
			}
			oItem.trigger('Select');
		}else{
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select(bSelect);
			}else{
				oItem.unactive();
			}
			oItem.trigger('Unselect');
		}
	}
	/**
	 * 获取/设置值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值，如果是多个值，用","隔开
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue!==undefined){
			var aValues=(''+sValue).split(',');
			me.each(function(i,oCmp){
				if($H.contains(aValues,oCmp.get('value'))){
					me.selectItem(oCmp,true);
				}else{
					me.selectItem(oCmp,false);
				}
			});
		}else{
			var aValues=[];
			me.each(function(i,oCmp){
				if(oCmp.get('selected')){
					aValues.push(oCmp.value);
				}
			})
			return aValues.join(',');
		}
	}
	/**
	 * 子项点击事件处理
	 * @param {number}nIndex 子项目索引
	 */
	function fOnItemSelect(nIndex){
		var me=this,bResult;
		if(me.itemClick){
			var oCmp=me.children[nIndex];
			bResult=me.itemClick(oCmp,nIndex);
		}
		if(bResult!==false){
			me.select(nIndex);
		}
	}
	
	
	return ControlGroup;
	
});