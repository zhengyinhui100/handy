/* Handy v1.0.0-dev | 2014-03-21 | zhengyinhui100@gmail.com */
/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("C.ComponentManager", 
['CM.AbstractManager',
'CM.ViewManager'],
function(AbstractManager,ViewManager) {

	var ComponentManager = AbstractManager.extend({
		type          : 'component',      //管理类型
		initialize    : fInitialize       //初始化
	});
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		var me=this;
		var oVm=$H.getSingleton(ViewManager);
		me._types=oVm._types;
		me._all=oVm._all;
	}
	
	//全局快捷别名
	$CM=new ComponentManager();
	
	return ComponentManager;
});/**
 * 组件基类，所有组件必须继承自此类或此类的子类，定义组件必须用AbstractComponent.define方法
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
$Define('C.AbstractComponent',["CM.ViewManager",'CM.View'],function(ViewManager,View){
	
	//访问component包内容的快捷别名
	$C=$H.namespace('C',{});
	
	var AC=$H.createClass();
	
	$H.inherit(AC,View,{
		//实例属性、方法
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
		activeCls           : 'hui-active',      //激活样式
//		icon                : null,              //图标
		
		////通用样式
//		width               : null,              //宽度(默认单位是px)
//		height              : null,              //高度(默认单位是px)
//		theme               : null,              //组件主题
//		radius              : null,         	 //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
//		shadow              : false,        	 //外阴影
//		shadowInset         : false,        	 //内阴影
//		shadowSurround      : false,             //外围亮阴影，主要用于黑色工具栏内的按钮
//		shadowOverlay       : false,             //遮罩层里组件的阴影效果，主要用于弹出层
//		isMini              : false,       	     //小号
//		isActive            : false,             //是否激活
//		isFocus             : false,        	 //聚焦
//		isInline            : false,             //是否内联(宽度自适应)
//		style               : {},                //其它样式，如:{top:10,left:10}
		
		//属性
//		cls                 : '',                //组件样式名，空则使用xtype的小写，如Dialog，cls为"dialog"，因此样式前缀是“hui-dialog-”
//		xrole               : '',                //保留属性，用于模板中筛选组件的选择器，如this.findHtml("$>[xrole='content']")
		
		//组件初始化相关
		hasConfig           : fHasConfig,        //检查是否已存在指定配置
		doConfig            : fDoConfig,         //初始化配置
		getExtCls           : fGetExtCls,        //生成通用样式
		//组件公用功能
		active              : fActive,           //激活
		unactive            : fUnactive,         //不激活
		txt                 : fTxt,              //设置/读取文字
		valid               : fValid             //校验数据
	},{
		//静态方法
		define              : fDefine            //定义组件
	});
	
	/**
	 * 定义组件
	 * @method define
	 * @param {string}sXtype 组件类型
	 * @param {Component=}oSuperCls 父类，默认是AbstractComponent
	 * @return {class}组件类对象
	 */
	function fDefine(sXtype,oSuperCls){
		var Component=$H.createClass();
		var oSuper=oSuperCls||AC;
		$H.inherit(Component,oSuper,null,null,{notCover:function(p){
			return p == 'define';
		}});
		$H.getSingleton(ViewManager).registerType(sXtype,Component);
		//快捷别名
		$C[sXtype]=Component;
		return Component;
	}
	/**
	 * 检查是否已存在指定配置
	 * @method hasConfig
	 * @param {string}sSel 指定的配置
	 * @param {Object|Array}params 配置对象
	 * @return {boolean} true表示已存在配置
	 */
	function fHasConfig(sSel,params){
		var me=this;
		if(!params){
			return false;
		}
		if($H.isArray(params)){
			for(var i=0,len=params.length;i<len;i++){
				if(me.match(sSel,params[i])){
					return true;
				}
			}
		}else{
			if(me.match(sSel,params)){
				return true;
			}
		}
		return false;
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		me.callSuper([oParams]);
		
		//样式名
		if(!me.cls){
			me.cls=me.xtype.toLowerCase();
		}
		me.extCls=me.getExtCls();
		//图标视图快捷添加
		if(me.icon){
			me.addItem({
				xtype:'Icon',
				name:me.icon
			})
		}
		//父组件是迷你的，子组件默认也是迷你的
		if(me.isMini){
			me.defItem=$H.extend({isMini:true},me.defItem);
		}
	}
	/**
	 * 生成通用样式
	 * @method getExtCls
	 * @return {string} 返回通用样式
	 */
	function fGetExtCls(){
		var me=this;
		//组件标志class
		var aCls=['js-component'];
		if(me.extCls){
			aCls.push(me.extCls);
		}
		if(me.theme){
			aCls.push('hui-'+me.cls+'-'+me.theme);
		}
		if(me.radius){
			aCls.push('hui-radius-'+me.radius);
		}
		if(me.isMini){
			aCls.push('hui-mini');
		}
		if(me.shadow){
			aCls.push('hui-shadow');
		}
		if(me.shadowSurround){
			aCls.push('hui-shadow-surround');
		}
		if(me.shadowOverlay){
			aCls.push('hui-shadow-overlay');
		}
		if(me.shadowInset){
			aCls.push('hui-shadow-inset');
		}
		if(me.isActive){
			aCls.push(me.activeCls);
		}
		if(me.isFocus){
			aCls.push('hui-focus');
		}
		if(me.isInline){
			aCls.push('hui-inline');
		}
		return aCls.length>0?aCls.join(' '):'';
	}
	/**
	 * 激活
	 * @method active
	 */
	function fActive(){
		var me=this;
		me.getEl().addClass(me.activeCls);
	}
	/**
	 * 不激活
	 * @method unactive
	 */
	function fUnactive(){
		var me=this;
		me.getEl().removeClass(me.activeCls);
	}
	/**
	 * 设置/读取文字
	 * @method txt
	 * @param {string=}sTxt
	 * @return {string} 
	 */
	function fTxt(sTxt){
		var me=this;
		//先寻找js私有的class
		var oTxtEl=me.find('.js-'+me.cls+'-txt');
		//如果找不到，再通过css的class查找
		if(oTxtEl.length==0){
			oTxtEl=me.find('.hui-'+me.cls+'-txt')
		}
		if(sTxt!=undefined){
			oTxtEl.text(sTxt);
		}else{
			return oTxtEl.text();
		}
	}
	/**
	 * 校验数据
	 * @method valid
	 * @return 符合校验规则返回true，否则返回false
	 */
	function fValid(){
		var me=this;
		var oValidator=me.settings.validator;
		if(oValidator){
			var sValue=me.val();
			if(!oValidator.error){
				//默认提示方法
				oValidator.error=function(sMsg){
					new $C.Tips({
						text:sMsg,
						theme:'error'
					});
				}
			}
			var result=$H.Validator.valid(sValue,oValidator);
			return result;
		}else{
			var aChildren=me.children;
			for(var i=0,nLen=aChildren.length;i<nLen;i++){
				var result=aChildren[i].valid();
				if(!result){
					return result;
				}
			}
			return true;
		}
	}
		
	return AC;
	
});/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('C.Popup',
'C.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup'),
	_popupNum=0,
	_mask;
	
	Popup.extend({
		//初始配置
		delayShow       : true,            //延迟显示
		clickHide       : true,            //是否点击就隐藏
//		timeout         : null,            //自动隐藏的时间(毫秒)，不指定此值则不自动隐藏
		showPos         : 'center',        //定位方法名，或者传入自定义定位函数
//		notDestroy      : false,           //隐藏时保留对象，不自动销毁，默认弹出层会自动销毁
//		noMask          : false,           //仅当true时没有遮罩层
		
		//组件共有配置
		shadowOverlay   : true,
		
		tmpl            : [
			'<div class="hui-popup"><%=this.findHtml("$>*")%></div>'
		],
		
		doConfig         : fDoConfig,        //初始化配置
		afterShow        : fAfterShow,       //显示
		hide             : fHide,            //隐藏
		center           : fCenter,          //居中显示
		followEl         : fFollowEl,        //根据指定节点显示
		mask             : fMask,            //显示遮罩层
		unmask           : fUnmask           //隐藏遮罩层
	});
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oParam){
		var me=this;
		me.callSuper([oParam]);
		//添加点击即隐藏事件
		if(me.clickHide){
			me._listeners.push({
				name:'click',
				el: $(document),
				handler:function(){
					this.hide();
				}
			});
		}
		//Android下弹出遮罩层时，点击仍能聚焦到到输入框，暂时只能在弹出时disable掉，虽然能避免聚焦及弹出输入法，
		//不过，仍旧会有光标竖线停留在点击的输入框里，要把延迟加到几秒之后才能避免，但又会影响使用
		if($H.android()){
			me._listeners.push({
				name:'show',
				custom:true,
				handler:function(){
					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
					var bHasDone=$H.Events.trigger("component.popup.show");
					if(bHasDone!=true){
						$("input,textarea,select").attr("disabled","disabled");
					}
				}
			});
			me._listeners.push({
				name:'hide',
				custom:true,
				handler:function(){
					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
					var bHasDone=$H.Events.trigger("component.popup.hide");
					if(bHasDone!=true){
						//ps:这里延迟300ms执行还是有可能会有聚焦效果，所以设个保险的500ms
						setTimeout(function(){
							$("input,textarea,select").removeAttr("disabled");
						},500);
					}
				}
			});
		}
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		oEl.css('z-index',_popupNum*1000+1000);
		//如果未设置宽度，默认和父组件宽度一样
		if(!me.width&&me.parent){
			var width=me.width=me.parent.getEl().outerWidth();
			oEl.css('width',width);
		}
		//默认居中显示
		var showPos=me.showPos;
		if(typeof showPos=="string"){
			me[showPos]();
		}else if(typeof showPos=="function"){
			showPos.call(me);
		}
		if(!me.noMask){
			me.mask();
		}
		//定时隐藏
		if(me.timeout){
			setTimeout(function(){
				if(!me.destroyed){
					me.hide();
				}
			},me.timeout);
		}
	}
	/**
	 * 隐藏
	 * @method hide
	 */
	function fHide(){
		var me=this;
		var bIsHide=me.callSuper();
		if(bIsHide!=false){
			if(!me.noMask){
				me.unmask();
			}
			if(!me.notDestroy){
				me.destroy();
			}
		}
	}
	/**
	 * 居中显示
	 * @method center
	 */
	function fCenter(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var width=me.width||oEl.width();
		var height=me.height||oEl.height();
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - width)/2;
		var y = ((oDoc.documentElement.clientHeight || oDoc.body.clientHeight) - height)/2 + (oDoc.documentElement.scrollTop||oDoc.body.scrollTop);
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
	}
	/**
	 * 显示在指定元素显示
	 * @method followEl
	 * @param {jQuery}oEl 定位标准元素
	 */
	function fFollowEl(oEl){
		var me=this;
		var el=oEl||me.parent.getEl();
		var oPos=el.position();
		me.getEl().css(oPos);
	}
	/**
	 * 显示遮罩层
	 * @method mask
	 */
	function fMask(){
		var me=this;
		if(!_mask){
			_mask=$('<div class="hui-mask" style="display:none;"></div>').appendTo(document.body);
		}
		_mask.css('z-index',_popupNum*1000+998);
		if(_popupNum==0){
			_mask.show();
		}
		_popupNum++;
	}
	/**
	 * 隐藏遮罩层
	 * @method unmask
	 */
	function fUnmask(){
		var me=this;
		_popupNum--;
		if(_popupNum==0){
			_mask.hide();
		}else{
			_mask.css('z-index',(_popupNum-1)*1000+998);
		}
	}
	
	return Popup;
	
});/**
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
//		direction            : 'v',                  //排列方向，'v'表示垂直方向，'h'表示水平方向
		multi                : false,                //是否多选
//		notSelect            : false,                //点击不需要选中
//		itemClick            : function(oCmp,nIndex){},         //子项点击事件函数，函数参数为子组件对象及索引
		
		//默认子组件配置
		defItem              : {
			xtype            : 'Button',
			extCls           : 'js-item',
			radius           : null,
			shadow           : false,
//			isSelected       : false,             //是否选中
			isInline         : false
		},
		
		tmpl                 : [
			'<div class="hui-ctrlgp<%if(this.direction=="h"){%> hui-ctrlgp-h<%}else{%> hui-ctrlgp-v<%}%>">',
			'<%=this.findHtml("$>*")%>',
			'</div>'
		],
		
		listeners       : [
			{
				name :'click',
				selector : '.js-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					var oCurrentEl=$(oEvt.currentTarget);
					var nIndex=$V.get(oCurrentEl.attr("id")).index();
					me.onItemClick(oEvt,nIndex);
				}
			}
		],
		
		select               : fSelect,              //选中指定项
		getSelected          : fGetSelected,         //获取选中项/索引
		selectItem           : fSelectItem,          //选中/取消选中
		val                  : fVal,                 //获取/设置值
		onItemClick          : fOnItemClick          //子项点击事件处理
	});
	
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
				me.selectItem(oItem,!oItem.selected);
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
			if(item.selected){
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
			oItem.selected=bSelect;
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select();
			}else{
				oItem.active();
			}
		}else{
			oItem.selected=bSelect;
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select(bSelect);
			}else{
				oItem.unactive();
			}
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
		if(sValue){
			var aValues=sValue.split(','),aSel=[];
			me.each(function(i,oCmp){
				oCmp.select($H.contains(aValues,oCmp.value));
			});
		}else{
			var aCmp=me.find('$>[selected=true]');
			var aValues=[];
			$H.each(aCmp,function(i,oCmp){
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
		me.select(nIndex);
		if(me.itemClick){
			var oCmp=me.children[nIndex];
			me.itemClick(oCmp,nIndex);
		}
	}
	
	
	return ControlGroup;
	
});/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('C.Icon',
'C.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	
	Icon.extend({
		//初始配置
//		noBg            : false,              //是否取消背景
//		isAlt           : false,              //是否使用深色图标
//		name            : '',                 //图标名称
		
		tmpl            : [
			'<span class="hui-icon',
			'<%if(this.isAlt){%>',
				' hui-alt-icon',
			'<%}%>',
			' hui-icon-<%=this.name%>',
			'<%if(!this.noBg){%>',
			' hui-icon-bg',
			'<%}%>"></span>']
		
	});
	
	return Icon;
	
});/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('C.Button',
'C.AbstractComponent',
function(AC){
	
	var Button=AC.define('Button');
	
	Button.extend({
		//初始配置
//		text            : '',                  //按钮文字
//		isActive        : false,               //是否是激活状态
//		icon            : null,                //图标名称
		iconPos         : 'left',              //图标位置，"left"|"top"
		theme           : 'gray',
		activeCls       : 'hui-btn-blue',      //激活样式
		cls             : 'btn',               //组件样式名
//		isBack          : false,               //是否是后退按钮
		
		defItem         : {
			xtype       : 'Icon'
		},
		
		////通用效果
		radius          : 'normal',               //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow          : true,        	       //外阴影
		isInline        : true,                //宽度自适应
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" class="hui-btn',
							'<%if(!this.text){%> hui-btn-icon-notxt<%}',
							'if(this.isBack){%> hui-btn-back<%}',
							'if(this.hasIcon&&this.text){%> hui-btn-icon-<%=this.iconPos%><%}%>">',
							'<span class="hui-btn-txt"><%=this.text%></span>',
							'<%=this.findHtml("$>*")%>',
							'</a>'],
							
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
	
	return Button;
	
});/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-29
 */

$Define('C.Radio',
'C.AbstractComponent',
function(AC){
	
	var Radio=AC.define('Radio');
	
	Radio.extend({
		//初始配置
//		name            : '',                  //选项名
//		text            : '',                  //文字
//		value           : '',                  //选项值
//		selected        : false,               //是否选中
		
		tmpl            : [
			'<div class="hui-radio hui-btn hui-btn-gray<%if(this.selected){%> hui-radio-on<%}%>">',
				'<span class="hui-icon hui-icon-radio"></span>',
				'<input type="radio"<%if(this.selected){%> checked=true<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-radio-txt"><%=this.text%></span>',
			'</div>'
		],
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		bSelect=!(bSelect==false);
		me.selected=bSelect;
		var oInput=me.find('input');
		var oEl=me.getEl();
		if(bSelect){
			oInput.attr("checked",true);
			oEl.addClass('hui-radio-on');
		}else{
			oInput.removeAttr("checked");
			oEl.removeClass('hui-radio-on');
		}
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
			me.value=sValue;
			me.find('input').val(sValue);
		}else{
			return me.value;
		}
	}
	
	return Radio;
	
});/**
 * 多选框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('C.Checkbox',
'C.AbstractComponent',
function(AC){
	
	var Checkbox=AC.define('Checkbox');
	
	Checkbox.extend({
		//初始配置
//		name            : '',                  //选项名
		text            : '',                  //文字
		value           : '',                  //选项值
		selected        : false,               //是否选中
		multi           : true,                //多选
		
		cls             : 'chkbox',            //组件样式名
		tmpl            : [
			'<div class="hui-chkbox hui-btn hui-btn-gray<%if(this.selected){%> hui-chkbox-on<%}%>">',
				'<span class="hui-icon hui-icon-chkbox"></span>',
				'<input type="checkbox"<%if(this.selected){%> checked=true<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-chkbox-txt"><%=this.text%></span>',
			'</div>'
		],
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelected 仅当为false时取消选中
	 */
	function fSelect(bSelected){
		var me=this;
		bSelected=!(bSelected==false);
		me.selected=bSelected;
		var oInput=me.find('input');
		var oEl=me.getEl();
		if(bSelected){
			oInput.attr("checked",true);
			oEl.addClass('hui-chkbox-on');
		}else{
			oInput.removeAttr("checked");
			oEl.removeClass('hui-chkbox-on');
		}
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
			me.value=sValue;
			me.find('input').val(sValue);
		}else{
			return me.value;
		}
	}
	
	return Checkbox;
	
});/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('C.Select',
'C.AbstractComponent',
function(AC){
	
	var Select=AC.define('Select');
	
	Select.extend({
		//初始配置
//		name            : '',                  //选项名
		text            : '请选择...',          //为选择时的文字
		value           : '',                  //默认值
		radius          : 'little',
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
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input value="<%=this.value%>" name="<%=this.name%>"/>',
				'<span class="hui-btn-txt js-select-txt"><%=this.text%></span>',
			'</div>'
		],
		
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
		me.callSuper([oParams]);
		//options配置成菜单
		var oOptions=oParams.options;
		//根据默认值设置默认文字
		for(var i=0,len=oOptions.length;i<len;i++){
			var oOption=oOptions[i];
			if(oOption.value==oParams.value){
				me.text=oOption.text;
				oOption.selected=true;
				break;
			}
		}
		me.addItem({
			itemClick:function(oButton,nIndex){
				var sValue=oButton.value;
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
			if(me.value!=sValue){
				var oMenu=me.children[0];
				var oItem=oMenu.find('$>[value="'+sValue+'"]');
				if(oItem.length>0){
					me.trigger("change");
					oItem=oItem[0];
					me.value=sValue;
					var oSel=me.find('input');
					oSel.attr('value',sValue);
					me.txt(oItem.text);
					//更新菜单选中状态
					oMenu.select(oItem);
				}
			}
		}else{
			return me.value;
		}
	}
	
	return Select;
	
});/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('C.Input',
'C.AbstractComponent',
function(AC){
	
	var Input=AC.define('Input');
	
	Input.extend({
		//初始配置
//		type            : '',                  //输入框类型，默认为普通输入框，'search':搜索框，'textarea':textarea输入框
//		value           : '',                  //默认值
//		placeholder     : '',                  //placeholder
//		withClear       : false,               //带有清除按钮
		radius          : 'little',            //普通圆角
		iconPos         : 'left',              //图标位置
		btnPos          : 'right',             //按钮位置
		
		tmpl            : [
		'<div class="hui-input',
			'<%if(this.hasIcon){%>',
				' hui-input-icon-<%=this.iconPos%>',
			'<%}%>',
			'<%if(this.hasBtn){%>',
				' hui-input-btn-<%=this.btnPos%>',
			'<%}%>">',
			'<%=this.findHtml("$>*")%>',
			'<%if(this.type=="textarea"){%>',
				'<textarea class="js-input"',
			'<%}else{%>',
				'<input type="text" class="js-input hui-input-txt"',
			'<%}%> ',
			' name="<%=this.name%>"',
			'<%if(this.placeholder){%>',
				' placeholder="<%=this.placeholder%>"',
			'<%}%>',
			'<%if(this.type=="textarea"){%>',
				'><%=this.value%></textarea>',
			'<%}else{%>',
				' value="<%=this.value%>"/>',
			'<%}%> ',
		'</div>'],
		listeners       : [
			{
				name : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('hui-focus');
				}
			},
			{
				name : 'blur',
				el : '.js-input',
				handler : function(){
					this.getEl().removeClass('hui-focus');
				}
			}
		],
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem,        //分析处理子组件
		val             : fVal,              //获取/设置输入框的值
		focus           : fFocus             //聚焦
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper([oSettings]);
		//搜索框快捷配置方式
		if(me.type=='search'){
			me.icon='search';
		}else if(me.type=="textarea"){
			//textarea高度自适应，IE6、7、8支持propertychange事件，input被其他浏览器所支持
			me._listeners.push({
				name:'input propertychange',
				el:'.js-input',
				handler:function(){
					var oTextarea=me.find(".js-input");
					oTextarea.css("height",oTextarea[0].scrollHeight);
				}
			});
		}
		//清除按钮快捷配置方式
		if(me.withClear){
			me.addItem({
				xtype:'Button',
				radius:'big',
				icon:'delete',
				click:function(){
					this.parent.find('input').val('').focus();
				}
			});
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
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var oInput=this.find('input,textarea');
		if(sValue){
			oInput.val(sValue);
		}else{
			return oInput.val();
		}
	}
	/**
	 * 聚焦
	 * @method focus
	 */
	function fFocus(){
		this.find('input').focus();
	}
	
	return Input;
	
});/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Set',
'C.AbstractComponent',
function(AC){
	
	var Set=AC.define('Set');
	
	Set.extend({
		
//		title           : '',      //标题
		
		tmpl            : [
			'<div class="hui-set">',
				'<h1 class="hui-set-title"><%=this.title%></h1>',
				'<div class="hui-set-content">',
					'<%=this.findHtml("$>*")%>',
				'</div>',
			'</div>'
		]
		
	});
	
	return Set;
	
});/**
 * 表单域类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Field',
'C.AbstractComponent',
function(AC){
	
	var Field=AC.define('Field');
	
	Field.extend({
		//初始配置
//		forName         : '',      //label标签for名字
//		label           : '',      //label文字
//		text            : '',      //右边文字
		
		tmpl            : [
			'<div class="hui-form-field">',
				'<label class="hui-form-left" for="<%=this.forName%>"><%=this.label%></label>',
				'<div class="hui-form-right">',
					'<%=this.text%>',
					'<%=this.findHtml("$>*")%>',
				'</div>',
			'</div>'
		]
		
	});
	
	return Field;
	
});/**
 * 表单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Form',
'C.AbstractComponent',
function(AC){
	
	var Form=AC.define('Form');
	
	Form.extend({
		//初始配置
		
		tmpl            : [
			'<div class="hui-form">',
				'<form action="">',
				'<div class="hui-form-tips c-error"></div>',
					'<%=this.findHtml("$>*")%>',
				'</form>',
			'</div>'
		]
		
	});
	
	return Form;
	
});/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('C.Tab',
['C.AbstractComponent',
'C.ControlGroup'],
function(AC,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	Tab.extend({
		//初始配置
//		hasContent      : false,        //是否有内容框
//		activeType      : '',           //激活样式类型，
//		theme           : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
		defItem         : {             //默认子组件是Button
//			content     : '',           //tab内容
			xtype       : 'Button',
			radius      : null,
			isInline    : false,
			extCls      : 'js-item',
			iconPos     : 'top',
			shadow      : false
		},
		
		tmpl            : [
			'<div class="hui-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){',
					//IE7下width有小数点时会有偏差(width:500px,len=3,结果会多一像素导致换行)，所以这里统一都没有小数点
					'var width=Math.floor(100/len);%>',
					'<li class="hui-tab-item" style="width:<%=(i==len-1)?(100-width*(len-1)):width%>%">',
					'<%=this.children[i].getHtml()%>',
					'</li>',
					'<%}%>',
				'</ul>',
				'<%if(this.hasContent){%>',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
						'<div class="js-tab-content"<%if(!this.children[i].selected){%> style="display:none"<%}%>>',
						'<%=this.children[i].content%>',
						'</div>',
					'<%}%>',
				'<%}%>',
			'</div>'
		],
		
		doConfig        : fDoConfig,           //初始化配置
		parseItem       : fParseItem,          //处理子组件配置
		onItemClick     : fOnItemClick,        //子项点击事件处理
		setContent      : fSetContent          //设置内容
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper([oSettings]);
		if(me.activeType){
			me.defItem.activeCls='hui-btn-active-'+me.activeType;
		}
	}
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.selected){
			oItem.isActive=true;
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
		//点击tab按钮显示对应的content
		if(me.hasContent){
			me.find('.js-tab-content').hide().eq(nIndex).show();
		}
		me.callSuper([oEvt,nIndex]);
	}
	/**
	 * 设置标签页内容
	 * @method setContent
	 * @param {number=}nIndex 索引，默认是当前选中的那个
	 * @param {String}sContent 内容
	 */
	function fSetContent(nIndex,sContent){
		var me=this;
		nIndex=nIndex||me.getSelected(true);
		me.find('js-tab-content').index(nIndex).html(sContent);
	}
	
	return Tab;
	
});/**
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
//		title            : '',                  //标题
		cls              : 'tbar',
//		type             : null,                //null|'header'|'footer'
		defItem          : {
			xtype        : 'Button',
			theme        : 'black',
			pos          : 'right',
			isMini       : true
		},
		
		tmpl             : [
			'<div class="hui-tbar<%if(this.type=="header"){%> hui-header<%}else if(this.type=="footer"){%> hui-footer<%}%>">',
				'<%=this.findHtml(">*")%>',
				'<%if(this.title){%><h1 class="hui-tbar-title js-tbar-txt"><%=this.title%></h1><%}%>',
			'</div>'
		],
		
		parseItem        : fParseItem           //处理子组件配置
		
	});
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.xtype=='Button'){
			oItem.shadowSurround=true;
			if(oItem.pos=='left'){
				oItem.extCls=(oItem.extCls||"")+' hui-tbar-btn-left';
			}else if(oItem.pos=="right"){
				oItem.extCls=(oItem.extCls||"")+' hui-tbar-btn-right';
			}
		}
	}
	
	return Toolbar;
	
});/**
 * 提示类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-15
 */

$Define('C.Tips',
['C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Tips=AC.define('Tips',Popup);
	
	Tips.extend({
		//初始配置
//		text            : '',
		theme           : 'black',
		timeout         : 2000,
		radius          : 'normal',
		
		tmpl            : [
			'<div class="hui-tips<%if(!this.text){%> hui-tips-notxt<%}%>">',
				'<%=this.findHtml("$>*")%>',
				'<%if(this.text){%><span class="hui-tips-txt"><%=this.text%></span><%}%>',
			'</div>'
		]
		
	});
	
	return Tips;
	
});/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('C.Dialog',
['C.AbstractComponent',
'C.Popup'],
function(AC,Popup){
	
	var Dialog=AC.define('Dialog',Popup);
	
	//快捷静态方法
	$H.extend(Dialog,{
		alert           : fAlert,    //弹出警告框
		confirm         : fConfirm,  //弹出确认框
		prompt          : fPrompt    //弹出输入框
	});
	
	Dialog.extend({
		
		//对话框初始配置
//		title           : '',             //标题
//		noClose         : false,          //true时没有close图标
//		content         : '',             //html内容，传入此值时将忽略contentTitle和contentMsg
//		contentTitle    : '',             //内容框的标题
//		contentMsg      : '',             //内容框的描述
//		noAction        : false,          //true时没有底部按钮
//		noOk            : false,          //true时没有确定按钮
//		noCancel        : false,          //true时没有取消按钮
		okTxt           : '确定',          //确定按钮文字
		cancelTxt       : '取消',          //取消按钮文字
//		activeBtn       : null,           //为按钮添加激活样式，1表示左边，2表示右边
//		okCall          : function(){},   //确定按钮事件函数
//		cancelCall      : function(){},   //取消按钮事件函数
		
		clickHide       : false,          //点击不隐藏
		
		//组件共有配置
		radius          : 'little',
		
		tmpl            : [
			'<div class="hui-dialog">',
				'<%=this.findHtml("$>[xrole=\'dialog-header\']")%>',
				'<div class="hui-dialog-body">',
					'<%if(this.content){%><%=this.content%><%}else{%>',
						'<div class="hui-body-content">',
							'<h1 class="hui-content-title"><%=this.contentTitle%></h1>',
							'<div class="hui-content-msg"><%=this.contentMsg%></div>',
							'<%=this.findHtml("$>[xrole=\'dialog-content\']")%>',
						'</div>',
					'<%}%>',
					'<%if(!this.noAction){%>',
						'<div class="hui-body-action">',
						'<%=this.findHtml("$>[xrole=\'dialog-action\']")%>',
						'</div>',
					'<%}%>',
				'</div>',
			'</div>'
		],
		doConfig         : fDoConfig        //处理配置
	});
	
	/**
	 * 弹出警告框
	 * @method alert
	 * @param {string}sMsg 提示信息
	 */
	function fAlert(sMsg){
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			noCancel:true
		});
	}
	/**
	 * 弹出确认框
	 * @method confirm
	 * @param {string}sMsg 提示信息
	 * @param {function(boolean)}fCall 回调函数，参数为true表示点击的是"确定"按钮，false则为"取消"按钮
	 */
	function fConfirm(sMsg,fCall){
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			okCall:function(){
				return fCall&&fCall(true);
			},
			cancelCall:function(){
				return fCall&&fCall(false);
			}
		});
	}
	/**
	 * 弹出输入框
	 * @method prompt
	 * @param {string}sMsg 提示信息
	 * @param {string=}sDefault 输入框默认值
	 * @param {function(string)}fCall 回调函数，参数为输入框的值
	 */
	function fPrompt(sMsg,sDefault,fCall){
		if(!fCall){
			fCall=sDefault;
			sDefault='';
		}
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			items:{
				xtype:'Input',
				xrole:'dialog-content',
				value:sDefault
			},
			okCall:function(){
				var value=this.find('$Input')[0].val();
				return fCall&&fCall(value);
			}
		});
	}
	/**
	 * 处理配置
	 * @method doConfig
	 * @param {object}oSettings 设置参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper([oSettings]);
		var aItems=oSettings.items;
		if(me.title&&!me.hasConfig('[xrole="dialog-header"]',aItems)){
			//顶部标题栏
			me.addItem({
				xtype:'Toolbar',
				title:me.title,
				theme:'gray',
				xrole:'dialog-header',
				extCls:'hui-dialog-header',
				items:!me.noClose&&{
					xtype:'Button',
					radius:'big',
					icon:'delete',
					isMini:false,
					theme:'gray',
					pos:'left',
					click:function(){
						me.hide();
					}
				}
			})
		}
		if(!me.noAction&&!me.hasConfig('[xrole="dialog-action"]',aItems)){
			var aActions=[];
			if(!me.noCancel){
				//取消按钮
				aActions.push({
					xtype:'Button',
					radius:null,
					isActive:me.activeBtn==1,
					text:me.cancelTxt,
					click:function(){
						if((me.cancelCall&&me.cancelCall())!=false){
							me.hide();
						}
					}
				});
			}
			if(!me.noOk){
				//确定按钮
				aActions.push({
					xtype:'Button',
					text:me.okTxt,
					isActive:me.activeBtn==2,
					radius:null,
					click:function(){
						if((me.okCall&&me.okCall())!=false){
							me.hide();
						}
					}
				});
			}
			me.addItem({
				xtype:'Tab',
				xrole:'dialog-action',
				theme:'border-top',
				notSelect:true,
				items:aActions
			});
		}
	}
	
	return Dialog;
	
});/**
 * 菜单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-02
 */

$Define('C.Menu',
['C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Menu=AC.define('Menu',Popup);
	
	//扩展取得ControlGroup的属性及方法
	Menu.extend(ControlGroup.prototype);
	
	Menu.extend({
		//初始配置
//		markType        : null,         //选中的标记类型，默认不带选中效果，'active'是组件active效果，'dot'是点选效果
		notDestroy      : true,
		
		tmpl            : [
			'<div class="hui-menu<%if(this.markType=="dot"){%> hui-menu-mark<%}%>">',
				'<ul>',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
						'<li class="hui-menu-item<%if(this.children[i].selected){%> hui-item-mark<%}%>">',
							'<%=this.children[i].getHtml()%>',
							'<%if(this.markType=="dot"){%><span class="hui-icon-mark"></span><%}%>',
						'</li>',
					'<%}%>',
				'</ul>',
			'</div>'
		],
		
		selectItem      : fSelectItem         //选中/取消选中
	});
	
	/**
	 * 选中/取消选中
	 * @method selectItem
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		var me=this;
		bSelect=bSelect!=false;
		//优先使用配置的效果
		if(me.markType=="dot"){
			oItem.selected=bSelect;
			var oLi=oItem.getEl().parent();
			oLi[bSelect==false?"removeClass":"addClass"]('hui-item-mark');
		}else if(me.markType=='active'){
			ControlGroup.prototype.selectItem.call(me,oItem,bSelect);
		}else{
			//无选中效果
			oItem.selected=bSelect;
		}
	}
	
	return Menu;
	
});/**
 * 列表类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-06
 */

$Define('C.List',
['C.AbstractComponent',
'C.ControlGroup'],
function(AC,ControlGroup){
	
	var List=AC.define('List',ControlGroup);
	
	List.extend({
		tmpl              : [
			'<div class="hui-list">',
				'<div class="hui-list-item c-clear">',
				'</div>',
			'</div>'
		]
	});
	
	return List;
});