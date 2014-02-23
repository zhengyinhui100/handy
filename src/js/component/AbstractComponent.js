/**
 * 组件基类，所有组件必须继承自此类或此类的子类，定义组件必须用AbstractComponent.define方法，
 * 扩展组件类方法必须用本类的extend方法，扩展类的静态方法则可以使用$H.Object.extend方法，例如
 * var ExampleCmp=AbstractComponent.define('ExampleCmp');
 * ExampleCmp.extend({
 * 	   test:''
 * });
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
$Define('c.AbstractComponent',["c.ComponentManager",'cm.AbstractView'],function(CM,AbstractView){
	
	var AC=$HO.createClass(),
	_oTagReg=/^(<[a-zA-Z]+)/,
	_oClsReg=/(class=")/;
	
	//快捷别名
	$C.AbstractComponent=AC;
	
	$HO.inherit(AC,AbstractView,{
		//静态方法
		define              : fDefine,           //定义组件
		extend              : fExtend,           //扩展组件原型对象
		html                : fHtml              //静态生成组件html
	},{
		//实例方法
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
//		renderTo            : null,              //渲染节点
//		hidden              : false,             //是否隐藏
//		hideMode            : 'display',         //隐藏方式,'display'|'visibility'
//		disabled            : false,             //是否禁用
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
//		notListen           : false,             //不自动初始化监听器
//		delayShow           : false,             //是否延迟显示，主要用于弹出层
//		extCls              : '',                //组件附加class
		activeCls           : 'hui-active',      //激活样式
//		defItem             : null,              //默认子组件配置
//		icon                : null,              //图标
		
		////通用样式
//		width               : null,              //宽度(默认单位是px)
//		height              : null,              //高度(默认单位是px)
//		theme               : null,              //组件颜色
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
//		xrole                : '',                //保留属性，用于模板中筛选组件的选择器，如this.getHtml("$>[xrole='content']")
//		params              : null,              //初始化时传入的参数
//		_id                 : null,              //组件id
//		tmpl                : [],                //组件模板，首次初始化前为数组，初始化后为字符串，ps:组件模板容器节点上不能带有id属性
//		html                : null,              //组件html
//		rendered            : false,             //是否已渲染
//      showed              : false,             //是否已显示
//		children            : [],                //子组件
//      listeners           : [],                //类事件配置
//		_listeners          : {},                //实例事件池  
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','afterRender','beforeShow','afterShow','hide','destroy'
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'click','mouseover','focus'
		],
		//组件初始化相关
		initialize          : fInitialize,       //初始化
		hasConfig           : fHasConfig,        //检查是否已存在指定配置
		doConfig            : fDoConfig,         //初始化配置
		initHtml            : fInitHtml,         //初始化html
		initStyle           : fInitStyle,        //初始化样式
		getId               : fGetId,            //获取组件id
		getHtml             : fGetHtml,          //获取组件或子组件html
		getExtCls           : fGetExtCls,        //生成通用样式
		//组件公用功能
		render              : fRender,           //渲染
		afterRender         : fAfterRender,      //渲染后续工作
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		active              : fActive,           //激活
		unactive            : fUnactive,         //不激活
		txt                 : fTxt,              //设置/读取文字
		
		//事件相关
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		
		//组件管理相关
//		update
		each                : fEach,             //遍历子组件
		match               : fMatch,            //匹配选择器
		find                : fFind,             //查找子元素或子组件
		parents             : fParents,          //查找祖先元素或祖先组件
		index               : fIndex,            //获取本身的索引，如果没有父组件则返回null
		callChild           : fCallChild,        //调用子组件方法
		add                 : fAdd,              //添加子组件
		remove              : fRemove,           //删除子组件
		addItem             : fAddItem,          //添加子组件配置
		parseItem           : function(){},      //分析子组件，由具体组件类实现
		parseItems          : fParseItems,       //分析子组件列表
		destroy             : fDestroy           //销毁
	});
	
	/**
	 * 定义组件
	 * @method define
	 * @param {string}sXtype 组件类型
	 * @param {Component=}oSuperCls 父类，默认是AbstractComponent
	 * @return {class}组件类对象
	 */
	function fDefine(sXtype,oSuperCls){
		var Component=$HO.createClass();
		var oSuper=oSuperCls||AC;
		$HO.inherit(Component,oSuper,null,null,{notCover:function(p){
			return p == 'define';
		}});
		CM.registerType(sXtype,Component);
		return Component;
	}
	/**
	 * 扩展组件原型对象
	 * @method extend
	 * @param {Object}oExtend 扩展源
	 */
	function fExtend(oExtend){
		var oProt=this.prototype;
		$HO.extend(oProt, oExtend,{notCover:function(p){
			//继承父类的事件
			if(p=='_customEvents'||p=='listeners'){
				oProt[p]=(oExtend[p]||[]).concat(oProt[p]||[]);
				return true;
			}else if(p=='xtype'||p=='constructor'){
				return true;
			}
		}});
	}
	/**
	 * 静态生成组件html
	 * @method html
	 * @param {object}oSettings 初始化参数
	 */
	function fHtml(oSettings){
		oSettings.autoRender=false;
		var component=new this(oSettings);
		return component.getHtml();
	}
		
	/**
	 * 初始化
	 * @method initialize
	 * @param {object}oSettings 初始化参数
	 */
	function fInitialize(oSettings){
		var me=this;
		//初始化配置
		me.doConfig(oSettings);
		//分析处理子组件
		me.parseItems();
		me.initHtml();
		me.fire('beforeRender');
		if(me.autoRender!=false){
			me.render();
			//渲染后续工作
			me.afterRender();
		}
		//注册组件
		CM.register(me);
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
		if($HO.isArray(params)){
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
		//保存参数
		me.params=oParams;
		//复制参数
		me.settings=$HO.clone(oParams);
		
		//事件列表对象特殊处理，不影响类定义
		var aListeners=me.listeners?me.listeners.concat():[];
		//添加参数中的事件
		if(oParams.listeners){
			aListeners=aListeners.concat(oParams.listeners);
		}
		me._listeners=aListeners;
		
		//只覆盖基本类型的属性
		$HO.extend(me,oParams,{notCover:function(sProp){
			var value=me[sProp];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$HO.contains(me._customEvents,sProp);
			var bIsDefEvt=$HO.contains(me._defaultEvents,sProp);
			if(bIsCustEvt||bIsDefEvt){
				me._listeners.push({
					type:sProp,
					notEl:bIsCustEvt,
					handler:oParams[sProp]
				});
			}
			if((value!=null&&typeof value=='object')||$HO.isFunction(value)){
				return true;
			}
		}});
		
		//样式名
		if(!me.cls){
			me.cls=me.xtype.toLowerCase();
		}
		//覆盖子组件配置
		if(oParams.defItem){
			//只覆盖实例属性，不影响类属性
			me.defItem=$HO.extend($HO.clone(me.defItem),oParams.defItem);
		}
		if(oParams.renderTo){
			me.renderTo=$(oParams.renderTo);
		}else{
			me.renderTo=$(document.body);
		}
		me.children=[];
	}
	/**
	 * 初始化html
	 * @method initHtml
	 */
	function fInitHtml(){
		var me=this;
		//将组件数组方式的模板转为字符串
		if(typeof me.tmpl!='string'){
			me.tmpl=me.constructor.prototype.tmpl=me.tmpl.join('');
		}
		//由模板生成组件html
		var sHtml=$H.Template.tmpl({id:me.xtype,tmpl:me.tmpl},me);
		var sId=me.getId();
		//添加隐藏style，调用show方法时才显示
		var sStyle;
 		if(me.displayMode=='visibility'){
			sStyle='visibility:hidden;';
 		}else{
			sStyle='display:none;';
 		}
		//添加id和style
		sHtml=sHtml.replace(_oTagReg,'$1 id="'+sId+'" style="'+sStyle+'"');
		//添加附加class
		sHtml=sHtml.replace(_oClsReg,'$1'+me.getExtCls());
		me.html=sHtml;
	}
	/**
	 * 初始化样式
	 * @method initStyle
	 */
	function fInitStyle(){
		var me=this;
		var oEl=this.getEl();
		//添加style
		var oStyle=me.style||{};
		if(me.width!=undefined){
			oStyle.width=me.width;
		}
		if(me.height!=undefined){
			oStyle.height=me.height;
		}
		oEl.css(oStyle);
	}
	/**
	 * 获取组件id
	 * @method getId
	 * @return {string}返回组件id
	 */
	function fGetId(){
		var me=this;
		return me._id||(me._id=CM.generateId(me.cid));
	}
	/**
	 * 获取组件或子组件html
	 * @method getHtml
	 * @param {string=}sSel 选择器，不传表示返回自身的html
	 * @return {string} 返回对应html
	 */
	function fGetHtml(sSel){
		var me=this;
		if(!sSel){
			return me.html;
		}
		var aChildren=sSel==">*"?me.children:me.find(sSel);
		var aHtml=[];
		for(var i=0;i<aChildren.length;i++){
			aHtml.push(aChildren[i].getHtml());
		}
		return aHtml.join('');
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
		if(me.disabled){
			aCls.push('hui-disable');
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
		return aCls.length>0?aCls.join(' ')+' ':'';
	}
	/**
	 * 渲染
	 * @method render
	 */
	function fRender(){
		var me=this;
		me.fire('beforeRender');
		me.renderTo[me.renderBy](me.getHtml());
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 * @return {boolean=} 仅当已经完成过渲染时返回false
	 */
	function fAfterRender(){
		var me=this;
		if(me.rendered){
			return false;
		}
		me.callChild();
		//缓存容器
		me._container=$("#"+me.getId());
		me.rendered=true;
		//初始化样式
		me.initStyle();
		//初始化事件
		if(me.notListen!=true){
			me.initListeners();
		}
		if(me.disabled){
			me.suspendListeners();
		}
		me.fire('afterRender');
		//显示
		if(!me.hidden){
			me.show();
		}
		delete me.html;
	}
	/**
	 * 隐藏
	 * @method hide
	 * @return {boolean=} 仅当已经隐藏时返回false
	 */
	function fHide(){
		var me=this;
		//已经隐藏，直接退回
		if(!me.showed){
			return false;
		}
		me.showed=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"hidden"})
		}else{
			oEl.hide();
		}
		me.fire('hide');
	}
	/**
	 * 显示
	 * @method show
	 * @param {boolean=}bNotDelay 仅当为true时强制不延迟显示
	 * @param {boolean=}bParentCall true表示是父组件通过callChild调用
	 * @return {boolean=} 仅当不是正常成功显示时返回false
	 */
	function fShow(bNotDelay,bParentCall){
		var me=this;
		//已经显示，直接退回
		if(me.showed){
			return false;
		}
		if(bParentCall&&me.hidden){
			//设置了hidden=true的组件不随父组件显示而显示
			return false;
		}
		if(!bNotDelay&&me.delayShow){
			setTimeout(function(){
				//这里必须指定基类的方法，不然会调用到组件自定义的show方法
				AC.prototype.show.call(me,true);
			},0);
			return;
		}
		me.showed=true;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"visible"})
		}else{
			oEl.show();
		}
		me.fire('show');
		me.callChild([null,true]);
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resumeListeners();
		me.getEl().removeClass("hui-disable");
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspendListeners();
		me.getEl().addClass("hui-disable");
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
	//ps:以下四个方法虽然一模一样，但callSuper需要使用元数据$name，所以要分开定义;另一方面，压缩后代码也不多
	/**
	 * 初始化所有事件
	 * @method initListeners
	 */
	function fInitListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 清除所有事件
	 * @method clearListeners
	 */
	function fClearListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 挂起事件
	 * @method suspendListeners
	 */
	function fSuspendListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 恢复事件
	 * @method resumeListeners
	 */
	function fResumeListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 遍历子组件
	 * @method each
     * @param {function}fCallback 回调函数:fCallback(i,oChild)|fCallback(args)this=oChild,返回false时退出遍历
     * @param {Array=}aArgs  回调函数的参数
	 */
	function fEach(fCallback, aArgs){
		var me=this;
		var aChildren=this.children;
		var nLen=aChildren.length;
		var bResult;
		for(var i=0;i<nLen;){
			var oChild=aChildren[i];
			if(aArgs){
				bResult=fCallback.apply(oChild,aArgs);
			}else{
				bResult=fCallback(i,oChild);
			}
			if(bResult===false){
				break;
			}
			//这里注意aChildren可能由于调用destroy而减少
			if(nLen==aChildren.length){
				i++;
			}else{
				nLen=aChildren.length;
			}
		}
	}
	/**
	 * 匹配选择器
	 * @method match
	 * @param {string}sSel 选择器，只支持一级选择器 xtype[attr=value]
	 * @param {Object=}oObj 被匹配的对象，默认为组件对象本身
	 * @return {boolean} 匹配则返回true
	 */
	function fMatch(sSel,oObj){
		if(sSel=="*"){
			return true;
		}
		var o=oObj||this,m,prop,op,value;
		//'Button[attr=value]'=>'[xtype=Button][attr=value]'
		sSel=sSel.replace(/^([^\[]+)/,'[xtype="$1"]');
		//循环检查
		var r=/\[([^=|\!]+)(=|\!=)([^=]+)\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			//操作符：=|!=
			op=m[2];
			value=eval(m[3]);
			if(op==="="?o[prop]!=value:o[prop]==value){
				return false;
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子组件
	 * @method find
	 * @param {string}sSel '$'开头表示查找组件，多个选择器间用","隔开('$sel1,$sel2,...')，语法类似jQuery，如：'$xtype[attr=value]'、'$ancestor descendant'、'$parent>child'，
	 * 				'$>Button'表示仅查找当前子节点中的按钮，'$Button'表示查找所有后代节点中的按钮，
	 * @param {Array=}aResult 用于存储结果集的数组
	 * @return {jQuery|Array} 返回匹配的结果，如果没找到匹配的子组件则返回空数组
	 */
	function fFind(sSel,aResult){
		var me=this;
		//查找元素
		if(sSel.indexOf('$')!=0){
			return me.getEl().find(sSel);
		}
		var aResult=aResult||[];
		//多个选择器
		if(sSel.indexOf(",")>0){
			$HO.each(sSel.split(","),function(i,val){
				aResult=aResult.concat(me.find(val));
			})
			return aResult;
		}
		//查找组件
		var bOnlyChildren=sSel.indexOf('>')==1;
		var sCurSel=sSel.replace(/^\$>?\s?/,'');
		//分割当前选择器及后代选择器
		var nIndex=sCurSel.search(/\s|>/);
		var sCurSel,sExtSel;
		if(nIndex>0){
			sExtSel=sCurSel.substring(nIndex);
			sCurSel=sCurSel.substring(0,nIndex);
		}
		//匹配子组件
		me.each(function(i,oChild){
			var bMatch=oChild.match(sCurSel);
			if(bMatch){
				//已匹配所有表达式，加入结果集
				if(!sExtSel){
					aResult.push(oChild);
				}else{
					//还有未匹配的表达式，继续查找
					oChild.find('$'+sExtSel,aResult);
				}
			}
			if(!bOnlyChildren){
				//如果不是仅限当前子节点，继续从后代开始查找
				oChild.find(sSel,aResult);
			}
		});
		return aResult;
	}
	/**
	 * 查找祖先元素或祖先组件
	 * @method parents
	 * @param {string=}sSel 若此参数为空，直接返回最顶级祖先组件，'$'开头表示查找组件，如：'$xtype[attr=value]'
	 * @return {jQuery|Component|null} 返回匹配的结果，如果没找到匹配的组件则返回null
	 */
	function fParents(sSel){
		var me=this;
		//查找元素
		if(sSel&&sSel.indexOf('$')!=0){
			return me.getEl().parents(sSel);
		}
		var oCurrent=me;
		while(oCurrent.parent){
			oCurrent=oCurrent.parent;
			if(sSel&&me.match(sSel,oCurrent)){
				return oCurrent;
			}
		}
		return sSel||oCurrent===me?null:oCurrent;
	}
	/**
	 * 获取本身的索引，如果没有父组件则返回null
	 * @method index
	 * @return {number} 返回对应的索引
	 */
	function fIndex(){
		var me=this;
		var oParent=me.parent;
		if(!oParent){
			return null;
		}else{
			var nIndex;
			oParent.each(function(i,oCmp){
				if(oCmp==me){
					nIndex=i;
					return false;
				}
			});
			return nIndex;
		}
	}
	/**
	 * 调用子组件方法
	 * @method callChild
	 * @param {string=}sMethod 方法名，不传则使用调用者同名函数
	 * @param {Array=}aArgs 参数数组
	 */
	function fCallChild(sMethod,aArgs){
		var me=this;
		//没传方法名
		if(sMethod&&typeof sMethod!='string'){
			aArgs=sMethod;
			sMethod=null;
		}
		sMethod=sMethod||arguments.callee.caller.$name;
		me.each(function(i,oChild){
			if(aArgs){
				oChild[sMethod].apply(oChild,aArgs);
			}else{
				oChild[sMethod].call(oChild);
			}
		});
	}
	/**
	 * 添加子组件
	 * @method add
	 * @param {object}oCmp 组件对象
	 */
	function fAdd(oCmp){
		var me=this;
		me.children.push(oCmp);
		oCmp.parent=me;
	}
	/**
	 * 删除子组件
	 * @method remove
	 * @param {object}oCmp 组件对象
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(oCmp){
		var me=this;
		var aChildren=me.children;
		var bResult=false;
		for(var i=0,len=aChildren.length;i<len;i++){
			if(aChildren[i]==oCmp){
				aChildren.splice(i,1);
				oCmp.destroy();
				bResult=true;
			}
		}
		return bResult;
	}
	/**
	 * 添加子组件配置
	 * @method addItem
	 * @param {object}oItem 子组件配置
	 */
	function fAddItem(oItem){
		var me=this;
		var oSettings=me.settings;
		var items=oSettings.items;
		if(!items){
			oSettings.items=[];
		}else if(!$HO.isArray(items)){
			oSettings.items=[items];
		}
		oSettings.items.push(oItem);
	}
	/**
	 * 分析子组件列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		//图标组件快捷添加
		if(me.icon){
			me.addItem({
				xtype:'Icon',
				name:me.icon
			})
		}
		var aItems=me.settings.items;
		if(!aItems){
			return;
		}
		aItems=aItems.length?aItems:[aItems];
		//逐个初始化子组件
		for(var i=0,len=aItems.length;i<len;i++){
			var oItem=aItems[i];
			//默认子组件配置
			if(me.defItem){
				$HO.extend(oItem,me.defItem,{notCover:true});
			}
			if(me.isMini){
				oItem.isMini=true;
			}
			//具体组件类处理
			me.parseItem(oItem);
			var Component=CM.getClass(oItem.xtype);
			if(Component){
				if(!oItem.renderTo){
					oItem.autoRender=false;
				}
				var oCmp=new Component(oItem);
				me.add(oCmp);
			}else{
				$D.error("xtype:"+oItem.xtype+"未找到");
			}
		}
	}
	/**
	 * 销毁组件
	 * @method destroy
	 * @return {boolean=}如果已经销毁了，则直接返回false
	 */
	function fDestroy(){
		var me=this;
		if(me.destroyed){
			return false;
		}
		me.callChild();
		me.callSuper();
		if(me.parent){
			me.parent.remove(me);
		}
		//注销组件
		CM.unregister(me);
		delete me.params;
		delete me.settings;
		delete me._container;
		delete me.renderTo;
		delete me._listeners;
		delete me.children;
	}
		
	return AC;
	
});