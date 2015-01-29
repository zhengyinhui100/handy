/**
 * 组件基类，所有组件必须继承自此类或此类的子类，定义组件必须用AbstractComponent.define方法
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
define('C.AbstractComponent',
[
'B.Class',
'B.Object',
'B.Validator',
"V.ViewManager",
'V.View',
'C.ComponentManager'
],function(Class,Obj,Validator,ViewManager,View,ComponentManager){
	
	//访问component包内容的快捷别名
	$C=$H.ns('C');
	
	var AC=View.derive({
		//实例属性、方法
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
//		icon                : null,              //图标
		
		////通用样式
		xConfig             : {
			extCls          : '',                //附加样式名
			tType           : '',                //主题类型
			theme           : '',                //主题
			cls             : '',                //组件css命名前缀
			radius          : null,         	 //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
			shadow          : false,        	 //外阴影
			shadowInset     : false,        	 //内阴影
			gradient        : false,             //渐变
			shadowSurround  : false,             //外围亮阴影，主要用于黑色工具栏内的按钮
			shadowOverlay   : false,             //遮罩层里组件的阴影效果，主要用于弹出层
			size            : '',       	     //尺寸，normal:正常，mini:小号
			isActive        : false,             //是否激活
			isFocus         : false,        	 //聚焦
			isInline        : false,             //是否内联(宽度自适应)
			activeCls       : 'hui-active',      //激活样式
			cmpCls          : {
				deps : ['cls'],
				parseDeps :function(cls){
					return 'hui-'+cls;
				}
			},
			sizeCls          : {
				deps : ['size'],
				parseDeps :function(size){
					return size&&'hui-size-'+size;
				}
			},
			tTypeCls        : {
				deps : ['tType'],
				parseDeps :function(tType){
					return tType?'hui-'+this.get("cls")+'-'+tType:'';
				}
			},
			themeCls        : {
				deps : ['theme'],
				parseDeps :function(theme){
					return theme?'hui-'+this.get("cls")+'-'+theme:'';
				}
			},
			activeClass     : {
				deps : ['isActive','activeCls'],
				parseDeps :function(isActive,activeCls){
					return isActive?activeCls:'';
				}
			},
			radiusCls       : {
				deps : ['radius'],
				parseDeps :function(sRadius){
					return sRadius?'hui-radius-'+sRadius:'';
				}
			}
		},
		
		//属性
//		cls                 : '',                //组件样式名，空则使用xtype的小写，如Dialog，cls为"dialog"，因此样式前缀是“hui-dialog-”
//		xrole               : '',                //保留属性，用于模板中筛选组件的选择器，如this.findHtml(">[xrole='content']")
		
		//组件初始化相关
		hasConfig           : fHasConfig,        //检查是否已存在指定配置
		doConfig            : fDoConfig,         //初始化配置
		preTmpl             : fPreTmpl,          //预处理模板
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
	 * @param {string}sXtype 组件类型
	 * @param {Component=}oSuperCls 父类，默认是AbstractComponent
	 * @return {class}组件类对象
	 */
	function fDefine(sXtype,oSuperCls){
		var Component=Class.createClass();
		var oSuper=oSuperCls||AC;
		Class.inherit(Component,oSuper,null,null,{notCover:function(p){
			return p == 'define';
		}});
		Class.getSingleton(ViewManager).registerType(sXtype,Component);
		//快捷别名
		$C[sXtype]=Component;
		return Component;
	}
	/**
	 * 检查是否已存在指定配置
	 * @param {string}sSel 指定的配置
	 * @param {Object|Array}params 配置对象
	 * @return {boolean} true表示已存在配置
	 */
	function fHasConfig(sSel,params){
		var me=this;
		if(!params){
			return false;
		}
		if(Obj.isArr(params)){
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
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		me.callSuper();
		
		//图标组件快捷添加
		var icon;
		if(icon=me.icon){
			if(typeof icon==='string'){
				me.add({
					xtype:'Icon',
					name:icon
				})
			}else{
				icon.xtype='Icon';
				me.add(icon);
			}
		}
	}
	/**
	 * 预处理模板，添加组件样式
	 */
	function fPreTmpl(){
		var me=this;
		me.callSuper();
		me.tmpl=me.tmpl.replace(/(class=['"])/,'$1#js-component cmpCls tTypeCls themeCls radiusCls sizeCls shadow?hui-shadow gradient?hui-gradient shadowSurround?hui-shadow-surround '+
		'shadowOverlay?hui-shadow-overlay shadowInset?hui-shadow-inset activeClass isFocus?hui-focus isInline?hui-inline ');
	}
	/**
	 * 激活
	 */
	function fActive(){
		this.update({isActive:true});
	}
	/**
	 * 不激活
	 */
	function fUnactive(){
		this.update({isActive:false});
	}
	/**
	 * 设置/读取文字
	 * @param {string=}sTxt
	 * @return {string} 
	 */
	function fTxt(sTxt){
		var me=this;
		if(sTxt!==undefined){
			return me.set('text',sTxt);
		}else{
			return me.get('text');
		}
	}
	/**
	 * 校验数据
	 * @return 符合校验规则返回true，否则返回false
	 */
	function fValid(){
		var me=this;
		var oValidator=me.validator;
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
			var result=Validator.valid(sValue,oValidator);
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
	
});