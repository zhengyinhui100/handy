/**
 * 视图类
 * PS：注意，扩展视图类方法必须用本类的extend方法，扩展类的静态方法则可以使用$H.Object.extend方法，例如
 * var ExampleCmp=AbstractComponent.define('ExampleCmp');
 * ExampleCmp.extend({
 * 	   test:''
 * });
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-17
 */
//"handy.view.View"
$Define('V.View',
['V.ViewManager',
'V.ModelView',
'D.Model',
'B.Template'],
function(ViewManager,ModelView,Model,Template){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/(class=")/;
	
	//自定义事件
	var View=ModelView.derive({
		
		xtype               : 'View',            //类型
		
		//配置
//		cClass              : '',                //客户定义class，无特殊限制，方便查找，类似于css的class
//		renderTo            : null,              //渲染节点或选择器，可以是函数，调用上下文为本视图对象，如果选择器字符以">"开头，表示在父视图内查找节点
//		defItem             : null,              //默认子视图配置
//		hidden              : false,             //是否隐藏
//		delayShow           : false,             //是否延迟显示，主要用于弹出层
//		hideMode            : 'display',         //隐藏方式,'display'|'visibility'
//		disabled            : false,             //是否禁用
//		extCls              : '',                //附加class
//		wrapHtml            : ['<div>','</div>'],//外面包裹的html
//		notListen           : false,             //不自动初始化监听器
//		items               : [],                //子视图配置，初始参数可以是对象也可以是对象数组
////	lazy                : false,             //保留属性：懒加载，初始化时只设置占位标签，只在调用show方法时进行实际初始化
		xConfig             : {},                //视图模型xmodel的字段配置
		
//		width               : null,              //宽度(默认单位是px)
//		height              : null,              //高度(默认单位是px)
//		style               : {},                //其它样式，如:{top:10,left:10}
		
		//属性
//		configed            : false,             //是否已经调用了doConfig
//		startParseItems     : false,             //是否已开始初始化子视图
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
		tmpl                : '<div>{{placeItem}}</div>',    //模板，字符串或数组字符串，ps:模板容器节点上不能带有id属性
//      showed              : false,             //是否已显示
		bindRefType         : 'bindRef',         //绑定引用模型的方式：both(双向绑定)、bindRef{绑定引用模型}、bindXmodel(绑定xmodel)、null或空(不绑定)
//		refModelAttrs       : {},                //引用模型属性列表
//		children            : [],                //子视图列表
		fastUpdateMethod    : {                  //快捷更新接口
			renderTo        : function(value){
				this.getEl()[this.renderBy]($(value));
			},
			hidden          : function(value){
				value?this.hide():this.show();
			},
			disabled        : function(value){
				value?this.disable():this.enable();
			}
		},
		//TODO 首字母大写以便区分事件监听还是函数？
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','render','afterRender',
			'beforeShow','show','afterShow',
			'beforeHide','hide','afterHide',
			'beforeUpdate','update','afterUpdate',
			'beforeDestroy','destroy','afterDestroy',
			'add','remove',
			'Select','Unselect'
////		'layout'    //保留事件
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'mousedown','mouseup','mouseover','mousemove','mouseenter','mouseleave',
			'dragstart','drag','dragenter','dragleave','dragover','drop','dragend',
			'touchstart','touchmove','touchend','touchcancel',
			'keydown','keyup','keypress',
			'click','dblclick',
			'focus','focusin','focusout',
			'contextmenu','change','submit',
			'swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    		'doubleTap', 'tap', 'singleTap', 'longTap'
		],
		
		_applyArray         : _fApplyArray,      //在数组上依次执行方法
		
		//初始化相关
		initialize          : fInitialize,       //初始化
////	lazyInit            : fLazyInit,         //保留方法：懒加载，初始化时只设置占位标签，以后再进行真正的初始化
		doConfig            : fDoConfig,         //初始化配置
		getHtml             : fGetHtml,          //获取html
		findHtml            : fFindHtml,         //获取子视图html
		initStyle           : fInitStyle,        //初始化样式
//   	layout              : fLayout,           //布局
		
		beforeRender        : fBeforeRender,     //渲染前工作
		render              : fRender,           //渲染
		afterRender         : fAfterRender,      //渲染后续工作
		beforeShow          : fBeforeShow,       //显示前工作
		show                : fShow,             //显示
		afterShow           : fAfterShow,        //显示后工作
		beforeHide          : fBeforeHide,       //隐藏前工作
		hide                : fHide,             //隐藏
		afterHide           : fAfterHide,        //隐藏后工作
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		getContent          : fGetContent,       //获取内容
		setContent          : fSetContent,       //设置内容
		
		//事件相关
		suspend             : fSuspend,          //挂起事件
		resume              : fResume,           //恢复事件
		
		parentsEl           : fParentsEl,        //查找视图的祖先节点
		
		//视图管理相关
    	get                 : fGet,              //获取配置属性
    	set                 : fSet,              //设置配置属性
    	getRefModel         : fGetRefModel,      //获取引用模型
    	bindRefModel        : fBindRefModel,     //绑定引用模型
		each                : fEach,             //遍历子视图
		match               : fMatch,            //匹配选择器
		find                : fFind,             //查找视图
		parents             : fParents,          //查找祖先视图
		index               : fIndex,            //获取本身的索引，如果没有父视图则返回null
		callChild           : fCallChild,        //调用子视图方法
		add                 : fAdd,              //添加子视图
		remove              : fRemove,           //删除子视图
		parseItem           : $H.noop,           //分析子视图，由具体视图类实现
		parseItems          : fParseItems,       //分析子视图列表
		
		//更新、销毁
		beforeUpdate        : fBeforeUpdate,     //更新前工作
		fastUpdate          : fFastUpdate,       //快速更新
		update              : fUpdate,           //更新
		replace             : fReplace,          //替换视图
		afterUpdate         : fAfterUpdate,      //更新后工作
		beforeDestroy       : fBeforeDestroy,    //销毁前工作
		destroy             : fDestroy,          //销毁
		afterDestroy        : fAfterDestroy      //销毁后工作
	},{
		extend              : fExtend,           //扩展原型定义
		html                : fHtml              //静态初始化视图并生成html
	});
	
	//注册自定义辅助函数
	Template.registerHelper('ModelView',{
		placeItem : fPlaceItem
	});
	/**
	 * 输出子视图
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @param {object}oData 数据
	 * @return {string} 返回生成的html
	 */
	function fPlaceItem(sExp,oOptions){
		var me=oOptions.context,
		nNum=oOptions.num,
		sMetaId=me.getCid()+'-'+nNum;
		var sHtml=me.findHtml(sExp);
		if(me.ifBind(nNum)){
			me.on('add',function(sEvt,oItem,nIndex){
				if(oItem.match(sExp.replace(/^>\s?/,''))){
					if(nIndex!==undefined){
						var oEl=me.getMetaMorph(sMetaId);
						for(var i=0;i<nIndex;i++){
							oEl=oEl.next();
						}
						oEl.after(oItem.getHtml());
					}else{
						me.updateMetaMorph(sMetaId,oItem.getHtml(),'append');
					}
					oItem.afterRender();
				}
			});
		}
		return me.wrapMetaMorph(sMetaId,sHtml)
	}
	
	/**
	 * 扩展原型定义
	 * @method extend
	 * @param {Object}oExtend 扩展源
	 */
	function fExtend(oExtend){
		var oProt=this.prototype;
		$H.extend(oProt, oExtend,{notCover:function(p){
			//继承父类的事件
			if(p=='_customEvents'||p=='listeners'){
				//拼接数组
				oProt[p]=(oExtend[p]||[]).concat(oProt[p]||[]);
				return true;
			}else if(p=='xtype'||p=='constructor'){
				return true;
			}else if(p=='xConfig'||p=='fastUpdateMethod'){
				//继承父类配置
				oProt[p]=$H.extendIf(oExtend[p],oProt[p]);
				return true;
			}
		}});
	}
	/**
	 * 静态初始化视图并生成html
	 * @method html
	 * @param {object}oParams 初始化参数
	 */
	function fHtml(oParams){
		var oView=new this($H.extend({autoRender:false},oParams));
		return oView.getHtml();
	}
	/**
	 * 在数组上依次执行方法
	 * @method _applyArray([sMethod,aParams,param...]) 不传参数的话，默认是调用者的方法名和参数
	 * @param {string=}sMethod 执行的方法名
	 * @param {Array|*=}aParams 参数对象，如果是数组，则在其元素上分别执行执行方法，
	 * 							并返回true，如果不是数组，返回false
	 * @return {boolean} true表示已处理
	 */
	function _fApplyArray(sMethod,aParams){
		var me=this;
		var aArgs=arguments;
		var fCaller=aArgs.callee.caller;
		var oOwner=fCaller.$owner.prototype;
		if(aArgs.length==0){
			aArgs=fCaller.arguments;
			aArgs=$H.toArray(aArgs);
			sMethod=fCaller.$name;
			aParams=aArgs.shift();
		}else{
			aArgs=$H.toArray(aArgs,2);
		}
		if($H.isArr(aParams)){
			$H.each(aParams,function(i,oItem){
				oOwner[sMethod].apply(me,[oItem].concat(aArgs));
			});
			return true;
		}
		return false;
	}
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		me.items=[];
		me.children=[];
		me.callSuper();
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		//这里主要是避免双继承下的多次调用
		if(me.configed){
			return;
		}
		me.configed=true;
		//复制保存初始参数
		me.initParam=oSettings;
		if(typeof oSettings=='string'){
			oSettings={text:oSettings};
		}
		var oParams=oSettings||{};
		
		$H.extend(me,oParams,{notCover:function(p,val){
			//检测引用模型属性
			var refAttr;
			if(refAttr=/^{{(((?!}}).)+)}}$/.exec(val)){
				refAttr=refAttr[1];
				(me.refModelAttrs||(me.refModelAttrs={}))[p]=refAttr;
			}
			var value=me[p];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$H.contains(me._customEvents,p);
			var bIsDefEvt=$H.contains(me._defaultEvents,p);
			
			if(bIsDefEvt){
				me.listeners.push({
					name:p,
					handler:oParams[p]
				});
				return true;
			}else if(bIsCustEvt){
				me.on(p,oParams[p]);
				return true;
			}else if(p=='defItem'){
				me[p]=$H.extend(me[p],val);
				return true;
			}else if(p=='listener'){
				me.listeners=me.listeners.concat($H.isArr(val)?val:[val]);
				return true;
			}else if(p=='items'){
				me.add(val);
				return true;
			}else if(p=='extCls'&&me[p]){
				me[p]+=' '+val;
				return true;
			}else if(p=='xtype'){
				if(me[p]=='View'){
					me[p]=typeof val=='string'?val:val.$ns;
				}
				return true;
			}
		}});
		var renderTo;
		if(renderTo=oParams.renderTo){
			if($H.isFunc(renderTo)){
				renderTo=renderTo.call(me);
			}else if($H.isStr(renderTo)&&renderTo.indexOf('>')==0){
				var oParent=me.parent;
				renderTo=oParent.inited&&oParent.findEl(renderTo.substring(1));
			}else{
				renderTo=$(renderTo);
			}
			me.renderTo=renderTo;
		}else{
			me.renderTo=$(document.body);
		}
		
		//获取绑定属性
		var oRefModel=me.getRefModel();
		if(oRefModel){
			var aAttrs=me.refModelAttrs;
			for(var attr in aAttrs){
				var refAttr=aAttrs[attr],val;
				//嵌套属性
				if(refAttr.indexOf('.')>0){
					var attrs=refAttr.split('.');
					val=oRefModel.get(attrs[0]);
					val=val&&val.get(attrs[1]);
				}else{
					val=oRefModel.get(refAttr);
				}
				me[attr]=val;
			}
		}
		
		//生成modelclass
		var oFields=me.xConfig,cModel=me.modelClass;
		if(!cModel&&!(cModel=me.constructor.modelClass)){
			var clazz
			if(oFields){
				clazz=Model.derive({
					fields:oFields
				})
			}else{
				clazz=Model;
			}
			cModel=me.constructor.modelClass=clazz;
		}
		//初始化xmodel
		var oAttrs={};
		$H.each(oFields,function(k,v){
			var value=me[k];
			if(value!==undefined){
				oAttrs[k]=value;
			}
		});
		me.xmodel=new cModel(oAttrs);
		//绑定引用模型
		me.bindRefModel();
	}
	
	var _oTagReg=/[^<]*(<[a-zA-Z]+)/;
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		var me=this;
		var sId=me.getId();
		//添加隐藏style，调用show方法时才显示
		var sStyle,sCls=me.extCls||'';
 		if(me.displayMode=='visibility'){
			sStyle='visibility:hidden;';
 		}else{
			sCls+=' hui-hidden';
 		}
 		var sHtml=me.callSuper();
		//添加id和style
 		if(sStyle){
			sHtml=sHtml.replace(_oTagReg,'$1 style="'+sStyle+'"');
 		}
		if(sCls){
			sHtml=sHtml.replace(/(class=['"])/,'$1'+sCls+' ');
		}
		var aWrapHtml;
		if(aWrapHtml=me.wrapHtml){
			sHtml=aWrapHtml[0]+sHtml+aWrapHtml[1];
		}
		return me.html=sHtml;
	}
	/**
	 * 获取子视图html
	 * @method findHtml
	 * @param {string=}sSel 选择器，不传表示返回自身的html
	 * @return {string} 返回对应html
	 */
	function fFindHtml(sSel){
		var me=this;
		var aItems=me.find(sSel);
		var aHtml=[];
		for(var i=0;i<aItems.length;i++){
			aHtml.push(aItems[i].getHtml());
		}
		return aHtml.join('');
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
		if(me.width!==undefined){
			oStyle.width=me.width;
		}
		if(me.height!==undefined){
			oStyle.height=me.height;
		}
		oEl.css(oStyle);
	}
	/**
	 * 渲染前工作
	 * @method beforeRender
	 * @return {boolean=} 仅当返回false时阻止渲染
	 */
	function fBeforeRender(){
		return this.trigger('beforeRender');
	}
	/**
	 * 渲染
	 * @method render
	 * @return {boolean=} 仅当没有成功渲染时返回false
	 */
	function fRender(){
		var me=this;
		if(me.beforeRender()==false){
			return false;
		}
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
		me.afterRender();
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 * @param {boolean=}bParentCall 是否是来自callChild的调用
	 * @return {boolean=} 仅当已经完成过渲染时返回false
	 */
	function fAfterRender(bParentCall){
		var me=this;
		if(me.rendered){
			return false;
		}
		me.trigger('render');
		//缓存容器
		me._container=$("#"+me.getId());
		me.callChild([true]);
		me.rendered=true;
		//初始化样式
		me.initStyle();
		//初始化事件
		if(me.notListen!=true){
			me.initListeners();
		}
		if(me.disabled){
			me.disable();
		}
		me.trigger('afterRender');
		//显示
		if(!bParentCall&&!me.hidden){
			me.show();
		}
	}
	/**
	 * 显示前工作
	 * @return {boolean=} 仅当返回false时阻止显示
	 */
	function fBeforeShow(){
		return this.trigger('beforeShow');
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
		if(me.beforeShow()==false
			//已经显示，直接退回
			||me.showed
			//设置了hidden=true的组件不随父组件显示而显示
			||(bParentCall&&me.hidden)){
			return false;
		}
		
		if(!bNotDelay&&me.delayShow){
			setTimeout(function(){
				//这里必须指定基类的方法，不然会调用到组件自定义的show方法
				View.prototype.show.call(me,true);
			},0);
			return;
		}
		me.trigger('show');
		me.showed=true;
		me.hidden=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"visible"})
		}else{
			//测试组件数目：77，使用show和hide时，组件初始化时间是500ms左右，而使用添加\移除’hui-hidden’的方式时间是170ms左右
			oEl.removeClass('hui-hidden');
		}
		me.callChild([null,true]);
		me.afterShow();
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		var me=this;
		//等浏览器渲染后才触发事件
		setTimeout(function(){
			me.trigger('afterShow');
		},0);
	}
	/**
	 * 隐藏前工作
	 * @return {boolean} 仅当返回false时阻止隐藏
	 */
	function fBeforeHide(){
		return this.trigger('beforeHide');
	}
	/**
	 * 隐藏
	 * @method hide
	 * @param {boolean=}bNotSetHidden 仅当true时不设置hidden属性，设置hidden属性可以避免来自父视图的show调用导致显示，所以一般外部调用都默认设置
	 * @return {boolean=} 仅当没有成功隐藏时返回false
	 */
	function fHide(bNotSetHidden){
		var me=this;
		if(me.beforeHide()==false
			//已经隐藏，直接退回
			||!me.showed){
			return false;
		}
		me.showed=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"hidden"})
		}else{
			oEl.addClass('hui-hidden');;
		}
		if(bNotSetHidden!=true){
			me.hidden=true;
		}
		me.trigger('hide');
		me.callChild([true]);
		me.afterHide();
	}
	/**
	 * 隐藏后工作
	 */
	function fAfterHide(){
		this.trigger('afterHide');
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resume();
		me.getEl().removeClass("hui-disable").find('input,textarea,select').removeAttr('disabled');
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspend();
		me.getEl().addClass("hui-disable").find('input,textarea,select').attr('disabled','disabled');
	}
	/**
	 * 读取内容
	 * @param {boolean=}bHtml 仅当false表示获取子组件列表，其它表示获取html内容
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @return {string|Array.<Component>} 返回内容
	 */
	function fGetContent(bHtml,obj){
		var me=this;
		if(obj){
			if(!obj instanceof View){
				obj=me.find(obj)[0];
			}
		}else{
			obj=me;
		}
		if(bHtml==false){
			var aChildren=obj.children;
			return aChildren;
		}else{
			return obj.getEl().html();
		}
	}
	/**
	 * 设置内容
	 * @param {string|Component|Array.<Component>}content 内容，html字符串或组件或组件数组
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @retun {View} 如果只添加一个组件(或配置)，则返回该组件
	 */
	function fSetContent(content,obj){
		var me=this;
		if(obj){
			if(!obj instanceof View){
				obj=me.find(obj)[0];
			}
			return obj.setContent(content);
		}
		if(typeof content=='string'){
			me.set('content',content);
			//移除子组件
			me.remove();
		}else{
			//移除html内容
			me.set('content','');
			return me.add(content);
		}
	}
	/**
	 * 挂起事件
	 * @method suspend
	 */
	function fSuspend(){
		var me=this;
		//已经挂起，直接退回
		if(me.isSuspend){
			return false;
		}
		me.isSuspend=true;
		me.callChild();
	}
	/**
	 * 恢复事件
	 * @method resume
	 */
	function fResume(){
		var me=this;
		//已经恢复，直接退回
		if(!me.isSuspend){
			return false;
		}
		me.isSuspend=false;
		me.callChild();
	}
	/**
	 * 查找视图的祖先节点
	 * @param {string}sSel jQuery选择器
	 * @return {jQuery} 返回结果
	 */
	function fParentsEl(sSel){
		return this.getEl().parents(sSel);
	}
	/**
	 * 读取配置属性
	 * @param {string}sKey 属性名称
	 * @return {?} 返回属性值
	 */
	function fGet(sKey){
		var me=this;
		var oConfig=me.xConfig;
		var value;
		var oModel=me.xmodel;
		if(oModel&&oConfig[sKey]!==undefined){
			value=oModel.get(sKey);
		}else{
			value=me[sKey];
		}
		return value;
	}
	/**
	 * 设置配置属性
	 * @param {string}sKey 属性名称
	 * @param {*}value 属性值
	 */
	function fSet(sKey,value){
		var me=this;
		var o={};
		o[sKey]=value;
		//fastUpdate不成功则直接设置类属性
		if(!me.fastUpdate(o)){
			me[sKey]=value;
		}
	}
	/**
	 * 获取引用模型，优先获取当前视图的引用模型，如果当前视图的引用模型没有设置，
	 * 则寻找父视图的引用模型，直到找到最近的引用模型为止，返回找到的引用模型，
	 * 如果直到最顶级的视图都没有引用模型，则返回顶级视图的模型(.model)
	 * @return {Model} 返回引用模型
	 */
	function fGetRefModel(){
		var me=this,oModel;
		if(oModel=me.refModel||me.model){
			return oModel;
		}
		var oParent=me.parent;
		while(oParent){
			if(oModel=oParent.refModel||oParent.model){
				return me.refModel=oModel;
			}
			if(oParent.parent){
				oParent=oParent.parent;
			}else{
				return oParent.model;
			}
		}
	}
	/**
	 * 绑定引用模型
	 */
	function fBindRefModel(){
		var me=this;
		var sType=me.bindRefType;
		var oAttrs=me.refModelAttrs;
		if(!sType||!oAttrs){
			return;
		}
		var oRefModel=me.getRefModel();
		var oXmodel=me.xmodel;
		function _fBind(sAttr,sRefAttr){
			//嵌套属性
			var sNestedAttr;
			if(sRefAttr.indexOf('.')>0){
				var attrs=sRefAttr.split('.');
				sRefAttr=attrs[0];
				sNestedAttr=attrs[1];
			}
			//绑定引用模型
			if(sType=='both'||sType=='bindRef'){
				me.listenTo(oRefModel,'change:'+sRefAttr,function(sEvt,oModel,value){
					if(sNestedAttr){
						value=value&&value.get(sNestedAttr);
					}
					me.set(sAttr,value);
				});
			}
			//绑定xmodel
			if(sType=='both'||sType=='bindXmodel'){
				me.listenTo(oXmodel,'change:'+sAttr,function(sEvt,oModel,value){
					if(sNestedAttr){
						var m=oRefModel;
						m=m.get(sRefAttr);
						m&&m.set(sNestedAttr,value);
					}else{
						oRefModel.set(sRefAttr,value);
					}
				});
			}
		}
		for(var sAttr in oAttrs){
			_fBind(sAttr,oAttrs[sAttr]);
		}
	}
	/**
	 * 遍历子视图
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
	 * @param {Object=}oObj 被匹配的对象，默认为视图对象本身
	 * @return {boolean} 匹配则返回true
	 */
	function fMatch(sSel,oObj){
		if(sSel=="*"){
			return true;
		}
		oObj=oObj||this;
		var m,prop,op,value,viewVal;
		//#btn => [cid=tbn]
		sSel=sSel.replace(/^#([^\s,\[]+)/,'[cid=$1]');
		//.btn => [cClass=tbn]
		sSel=sSel.replace(/^\.([^\s,\[]+)/,'[cClass=$1]');
		//'Button[attr=value]'=>'[xtype=Button][attr=value]'
		sSel=sSel.replace(/^([^\[]+)/,'[xtype=$1]');
		//循环检查
		var r=/\[(\!?[^=|\!]+)(=|\!=)?([^=]*)?\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			viewVal=oObj.get?oObj.get(prop):oObj[prop];
			//操作符：=|!=
			op=m[2];
			//三目运算
			if(op){
				value=m[3];
				if(value==='false'){
					value=false;
				}else if(value==='true'){
					value=true;
				}else if(value==='null'){
					value=null;
				}else if(value==='undefined'){
					value=undefined;
				}
				if(op==="="?viewVal!=value:viewVal==value){
					return false;
				}
			}else{
				//简略表达式，如：!val、val
				if((prop.indexOf('!')==0&&viewVal)||(prop.indexOf('!')<0&&!viewVal)){
					return false;
				}
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子视图
	 * @method find
	 * @param {number|string=|Function(View)|Class}sel 不传表示获取子视图数组，数字表示子组件索引，
	 * 				如果是字符串：多个选择器间用","隔开('sel1,sel2,...')，语法类似jQuery，
	 * 				如：'xtype[attr=value]'、'ancestor descendant'、'parent > child'，
	 * 				'#'表示cid，如'#btn'，表示cid为btn的视图，
	 * 				'.'表示cClass，如'.btn'，表示cClass为btn的视图，
	 * 				'> Button'表示仅查找当前子节点中的按钮，'Button'表示查找所有后代节点中的按钮，
	 * 				如果是函数(参数是当前匹配的视图对象)，则将返回true的结果加入结果集，
	 * 				如果是类，查找该类的实例
	 * @param {Array=}aResult 用于存储结果集的数组
	 * @return {Array} 返回匹配的结果，如果没找到匹配的子视图则返回空数组，ps:只有一个结果也返回数组，便于统一接口
	 */
	function fFind(sel,aResult){
		var me=this,aResult=aResult||[];
		if(!sel){
			aResult=aResult.concat(me.children);
		}else if($H.isNum(sel)){
			var oItem=me.children[sel];
			aResult.push(oItem);
		}else if($H.isStr(sel)){
			//多个选择器
			if(sel.indexOf(",")>0){
				$H.each(sel.split(","),function(i,val){
					aResult=aResult.concat(me.find(val));
				})
				return aResult;
			}
			//查找视图
			var bOnlyChildren=sel.indexOf('>')==0;
			var sCurSel=sel.replace(/^>?\s?/,'');
			//分割当前选择器及后代选择器
			var nIndex=sCurSel.search(/\s/);
			var sCurSel,sExtSel;
			if(nIndex>0){
				sExtSel=sCurSel.substring(nIndex+1);
				sCurSel=sCurSel.substring(0,nIndex);
			}
			//匹配子视图
			me.each(function(i,oChild){
				var bMatch=oChild.match(sCurSel);
				if(bMatch){
					//已匹配所有表达式，加入结果集
					if(!sExtSel){
						aResult.push(oChild);
					}else{
						//还有未匹配的表达式，继续查找
						oChild.find(sExtSel,aResult);
					}
				}
				if(!bOnlyChildren){
					//如果不是仅限当前子节点，继续从后代开始查找
					oChild.find(sel,aResult);
				}
			});
		}else if($H.isFunc(sel)){
			var bIsClass=$H.isClass(sel);
			//匹配子视图
			me.each(function(i,oChild){
				if((bIsClass&&oChild instanceof sel)||(!bIsClass&&sel(oChild))){
					aResult.push(oChild);
				}
				oChild.find(sel,aResult);
			});
		}
		return aResult;
	}
	/**
	 * 查找祖先视图
	 * @method parents
	 * @param {string=}sSel 若此参数为空，直接返回最顶级祖先视图
	 * @return {jQuery|Component|null} 返回匹配的结果，如果没找到匹配的视图则返回null
	 */
	function fParents(sSel){
		var me=this;
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
	 * 获取本身的索引，如果没有父视图则返回null
	 * @method index
	 * @return {number} 返回对应的索引，如果没有父视图(也就没有索引)，返回null
	 */
	function fIndex(){
		var me=this;
		var oParent=me.parent;
		if(!oParent){
			return null;
		}else{
			var nIndex;
			oParent.each(function(i,oItem){
				if(oItem==me){
					nIndex=i;
					return false;
				}
			});
			return nIndex;
		}
	}
	/**
	 * 调用子视图方法
	 * @method callChild
	 * @param {string=}sMethod 方法名，不传则使用调用者同名函数
	 * @param {Array=}aArgs 参数数组
	 */
	function fCallChild(sMethod,aArgs){
		var me=this;
		if(me.children.length==0){
			return;
		}
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
	 * 添加子视图
	 * @method add
	 * @param {object|Array}item 视图对象或视图配置或数组，可以加上条件判断:item.condition(为假时忽略该配置项)
	 * @param {number=}nIndex 指定添加的索引，默认添加到最后
	 * @return {?Component} 添加的子视图只有一个时返回该视图对象，参数是数组时返回空
	 */
	function fAdd(item,nIndex){
		var me=this;
		if(me._applyArray()){
			return;
		}
		//条件为假，直接忽略
		if(item.hasOwnProperty('condition')&&!item.condition){
			return;
		}
		var bNoIndex=nIndex===undefined;
		//还没初始化子视图配置，直接添加到配置队列里
		if(!me.startParseItems){
			var aItems=me.items;
			if(bNoIndex){
				aItems.push(item);
			}else{
				aItems.splice(nIndex,0,item);
			}
			return;
		}
		//开始初始化后，如果是配置，先创建子视图
		if(!(item instanceof View)){
			//默认子视图配置
			if(me.defItem){
				$H.extend(item,me.defItem,{notCover:true});
			}
			//具体视图类处理
			me.parseItem(item);
			var Item=me.manager.getClass(item.xtype);
			if(Item){
				var renderTo=item.renderTo;
				//父组件未初始化，不能通过>选择器render
				if(!me.inited&&$H.isStr(renderTo)&&renderTo.indexOf('>')==0){
					renderTo=null;
				}
				if(!renderTo){
					//设置子组件不进行自动render，而是由placeItem辅助函数render或组件本身进行render
					item.autoRender=false;
				}
				item.parent=me;
				item=new Item(item);
			}else{
				$D.error("xtype:"+item.xtype+"未找到");
			}
		}else{
			item.parent=me;
		}
		var aChildren=me.children;
		if(bNoIndex){
			aChildren.push(item);
		}else{
			aChildren.splice(nIndex,0,item);
		}
		me.trigger('add',item,nIndex);
		return item;
	}
	/**
	 * 删除子视图
	 * @method remove
	 * @param {object|number|string}item 视图对象或视图索引或选择器
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(item){
		var me=this;
		if(me._applyArray()){
			return;
		}
		var aChildren=me.children;
		var bResult=false;
		var nIndex;
		if($H.isNum(item)){
			nIndex=item;
			item=aChildren[nIndex];
		}else if($H.isStr(item)||$H.isFunc(item)){
			item=me.find(item);
			for(var i=0,len=item.length;i<len;i++){
				if(me.remove(item[i])==false){
					return false;
				}
				bResult=true;
			}
		}else if(item instanceof View){
			if(item.parent==me){
				for(var i=0,len=aChildren.length;i<len;i++){
					if(aChildren[i]==item){
						nIndex=i;
						break;
					}
				}
			}else{
				return item.parent.remove(item);
			}
		}
		if(nIndex!==undefined&&item.destroy(true)!=false){
			aChildren.splice(nIndex,1);
			bResult=true;
		}
		me.trigger('remove',item);
		return bResult;
	}
	/**
	 * 分析子视图列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		me.startParseItems=true;
		var aItems=me.items;
		if(!aItems){
			return;
		}
		aItems=$H.isArr(aItems)?aItems:[aItems];
		//逐个初始化子视图
		for(var i=0,len=aItems.length;i<len;i++){
			me.add(aItems[i]);
		}
	}
	/**
	 * 更新前工作
	 * @return {boolean=} 仅当返回false时阻止更新
	 */
	function fBeforeUpdate(){
		return this.trigger('beforeUpdate');
	}
	/**
	 * 快速更新
	 * @param {Object}oOptions 配置
	 * @return {boolean} true表示快速更新成功
	 */
	function fFastUpdate(oOptions){
		var me=this;
		var oXmodel=me.xmodel;
		if(!oXmodel){
			return false;
		}
		var oConfigs=me.xConfig;
		var oFastUpdate=me.fastUpdateMethod;
		var bContain=true;
		var oXconf={},oFast={},oOther={};
		//检查选项是否都是xmodel或fastUpdateMethod的字段，如果是，则只需要更新xmodel或调用fastUpdateMethod方法即可，ui自动更新
		$H.each(oOptions,function(p,v){
			//xConfig里没有的配置
			if(oConfigs.hasOwnProperty(p)){
				oXconf[p]=v;
			}else if(oFastUpdate[p]){
				oFast[p]=v;
			}else{
				oOther[p]=v;
				bContain=false;
			}
		})
		if(bContain){
			oXmodel.set(oXconf);
			$H.each(oFast,function(k,v){
				oFastUpdate[k].call(me,v);
			})
			return true;
		}
		return false;
	}
	/**
	 * 更新
	 * @param {Object}oOptions 配置
	 * @param {boolean=}bNewConfig 仅当为true时，表示从初始化的参数的配置里继承，否则，从当前组件初始配置里扩展配置
	 * @return {boolean|Object} 更新失败返回false，成功则返回更新后的视图对象
	 */
	function fUpdate(oOptions,bNewConfig){
		var me=this;
		if(!oOptions||me.beforeUpdate()==false){
			return false;
		}
		var oNew;
		//先尝试快速更新
		if(me.fastUpdate(oOptions)===true){
			oNew=me;
		}else{
			//执行完全更新
			var oParent=me.parent;
			var oPlaceholder=$('<span></span>').insertBefore(me.getEl());
			
			if(!bNewConfig){
				//由于子组件的初始配置都是autoRender=false，这里需要特殊处理下
				if(oOptions.autoRender===undefined){
					oOptions.autoRender=true;
				}
				oOptions=$H.extend(oOptions,me.initParam,{notCover:true});
			}
			//cid不同
			oOptions=$H.extend(oOptions,{
				xtype:me.xtype,
				renderBy:'replaceWith',
				renderTo:oPlaceholder
			},{notCover:['xtype']});
			//不需要改变id/cid
			if(!oOptions.cid||oOptions.cid==me.cid){
				oOptions._id=me._id;
			}
			if(oParent){
				var nIndex=me.index();
				if(oParent.remove(me)==false){
					oPlaceholder.remove();
					return false;
				}
				oNew=oParent.add(oOptions,nIndex);
			}else{
				if(me.destroy()==false){
					oPlaceholder.remove();
					return false;
				}
				oNew=new me.constructor(oOptions);
			}
		}
		me.trigger('update',oNew);
		me.afterUpdate(oNew);
		return oNew;
	}
	/**
	 * 替换视图
	 * @param {Object}oConfig 配置项
	 * @return {boolean|Object} 更新失败返回false，成功则返回更新后的视图对象
	 */
	function fReplace(oConfig){
		return this.update(oConfig,true);
	}
	/**
	 * 更新后工作
	 * @param {Object} 更新后的视图对象
	 */
	function fAfterUpdate(oNew){
		this.trigger('afterUpdate',oNew);
	}
	/**
	 * 销毁前工作
	 * @return {boolean=} 仅当返回false时阻止销毁
	 */
	function fBeforeDestroy(){
		return this.trigger('beforeDestroy');
	}
	/**
	 * 销毁
	 * @method destroy
	 * @param {boolean=} 仅当true时表示从remove里的调用，不需要再这里调用parent.remove
	 * @return {boolean=} 成功返回true，失败返回false，如果之前已经销毁返回空
	 */
	function fDestroy(bFromRemove){
		var me=this;
		if(me.beforeDestroy()==false){
			return false;
		}
		if(me.destroyed){
			return;
		}
		me.callChild();
		
		me.trigger('destroy');
		me.clearListeners();
		me.getEl().remove();
		me.destroyed=true;
		
		if(!bFromRemove&&me.parent){
			me.parent.remove(me);
		}
		//注销组件
		me.manager.unregister(me);
		delete me.initParam;
		delete me._container;
		delete me.renderTo;
		delete me._listeners;
		delete me.html;
		delete me.xmodel;
		delete me.children;
		me.afterDestroy();
		return true;
	}
	/**
	 * 销毁后工作
	 */
	function fAfterDestroy(){
		this.trigger('afterDestroy');
	}
	
	return View;
	
});