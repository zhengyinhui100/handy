/**
 * 组件基类，所有组件必须继承自此类或此类的子类，定义组件必须用AbstractComponent.define方法
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
$Define('C.AbstractComponent',["CM.ViewManager",'CM.View'],function(ViewManager,View){
	
	//访问component包内容的快捷别名
	$C=$H.ns('C',{});
	
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
//		xrole               : '',                //保留属性，用于模板中筛选组件的选择器，如this.findHtml(">[xrole='content']")
		
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
		if($H.isArr(params)){
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
		me.callSuper();
		
		//样式名
		if(!me.cls){
			me.cls=me.xtype.toLowerCase();
		}
		me.extCls=me.getExtCls();
		//图标视图快捷添加
		if(me.icon){
			me.add({
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
		var aCls=['js-component','hui-'+me.cls];
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
		var oTxtEl=me.findEl('.js-'+me.cls+'-txt');
		//如果找不到，再通过css的class查找
		if(oTxtEl.length==0){
			oTxtEl=me.findEl('.hui-'+me.cls+'-txt')
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
	
});