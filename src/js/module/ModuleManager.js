/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

/**
 * 模块管理类
 * @class ModuleManager
 */
//handy.module.ModuleManager
$Define("M.ModuleManager",
["M.History",
"V.AbstractManager"],
function(History,AbstractManager){
	
	//TODO 使用AbstractManager的方法
	var ModuleManager=AbstractManager.derive({
		
		type               : 'module',
		
//		history            : null,   //历史记录
//		conf               : null,   //配置参数
//		container          : null,   //默认模块容器
//		navigator          : null,   //定制模块导航类
//		defEntry           : null,   //默认模块，当调用back方法而之前又没有历史模块时，进入该模块
//		defModPackage      : "com.xxx.module",  //默认模块所在包名
		maxCacheNum        : $H.mobile()?($H.android()>=4||$H.ios()>=7)?15:5:30,     //最大缓存模块数
		
//		requestMod         : '',     //正在请求的模块名
//		currentMod         : '',     //当前模块名
//		_modules           : {},     //模块缓存
//		_modStack          : [],     //模块调度记录
//		_modNum            : {},     //模块名数量统计
		
		_getModId          : _fGetModId,       //获取modId
		_createMod         : _fCreateMod,      //新建模块
		_showMod           : _fShowMod,        //显示模块
		
		initialize         : fInitialize,      //初始化模块管理
		setModule          : fSetModule,       //设置/缓存模块
		getModule          : fGetModule,       //获取缓存的模块
		go                 : fGo,              //进入模块
		destroy            : fDestroy,         //销毁模块
		update             : fUpdate,          //更新模块
		clearCache         : fClearCache,      //清除缓存模块
		back               : fBack,            //后退一步
		getSafeUrl         : fGetSafeUrl       //获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	});
	
	/**
	 * 获取modId
	 * @param {string}sModName 模块名
	 * @param {string|number=}sModelId 模型/集合id
	 * @return {string} 返回模块id
	 */
	function _fGetModId(sModName,sModelId){
		return sModName+(sModelId?'-'+sModelId:'');
	}
	/**
	 * 新建模块
	 * @method _createMod
	 * @param {object}oParams 选项
	 * @return {Module}返回新创建的模块
	 */
	function _fCreateMod(oParams){
		var me=this;
		var sModName=oParams.modName;
		var sModId=oParams.modId;
		var Module=$Require(sModName);
		var oOptions={
			renderTo:me.container,
			modName:sModName,
			modId:sModId,
			name:sModName,
			xtype:sModName,
			cid:sModId.replace(/\./g,'-'),
			extCls:'js-module m-module '+sModName.replace(/\./g,'-'),
			hidden:true
		};
		$H.extend(oOptions,oParams);
		var oMod=new Module(oOptions);
		
		//异步模块在此标记referer
		var oWaitting=me._modules[sModId];
		oMod.referer=oWaitting.referer;
		
		me._modules[sModId]=oMod;
		$H.trigger('afterRender',oMod.getEl());
		oMod.entry(oParams);
		//只有当前请求的模块恰好是本模块时才显示（可能加载完时，已切换到其它模块了）
		if(me.requestMod==sModId){
			me._showMod(oMod);
		}
		return oMod;
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param {Module}oMod 要显示的模块
	 */
	function _fShowMod(oMod){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		//如果导航类方法返回false，则不使用模块管理类的导航
		var r=me.navigator&&me.navigator.navigate(oMod,oCurMod,me);
		//TODO:写成这样在iPad mini ios7下无效:if((me.navigator&&me.navigator.navigate(oMod,oCurMod,me))!==false){
		if(r!==false){
			if(oCurMod){
				oCurMod.hide();
			}
			oMod.show();
		}
		if(oCurMod){
			oCurMod.isActive=false;
		}
		oMod.isActive=true;
		me.currentMod=oMod.modId;
	}
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage   : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator    : 定制导航类
	 * 			{string|object}entry    : 初始模块
	 * 			{string|object}defEntry : 默认入口，没有初始入口参数时进入该模块，或者后退但没有上一个模块时进入该模块
	 * }
	 */
	function fInitialize(oConf){
		var me=this;
		me.callSuper();
		if(oConf){
			me.conf=oConf;
			$H.extend(me,oConf);
			me.container=oConf.container?$(oConf.container):$(document.body);
		}
		me.history=new History(function(sCode,oParam){
			me.go(oParam.param);
		});
		me._modules={};
		me._modStack=[];
		me._modNum={};
		
		//解析url参数
		var oUrlParam=me.history.getCurrentState();
		//有返回页
		if(!$H.isEmpty(oUrlParam)){
			var fChk=oConf.chkEntry;
			var bResult=fChk&&fChk(oUrlParam);
			//开发模式下可以进入所有子模块，线上环境只允许进入指定模块
			if(bResult!==false){
				me.go(oUrlParam);
				return;
			}
		}
		var oDefEntry=oConf.entry||oConf.defEntry;
		me.go(oDefEntry);
	}
	/**
	 * 设置/缓存模块，当缓存的模块数量超过限制时，删除历史最久的超过模块各类型平均限制数的模块
	 * @param {new:M.AbstractModule}oModule 模块对象
	 * @param {string}sModName 模块名
	 * @param {string|number=}modelId 模型/集合id
	 */
	function fSetModule(oModule,sModName,modelId){
		var me=this;
		var oMods=me._modules;
		var aStack=me._modStack;
		var oNum=me._modNum;
		var sModId=me._getModId(sModName,modelId);
		oMods[sModId]=oModule;
		aStack.push({
			modId:sModId,
			modName:sModName
		});
		if(!oNum[sModName]){
			oNum[sModName]=1;
		}else{
			oNum[sModName]++;
		}
		//模块调度算法
		if(aStack.length>me.maxCacheNum){
			var nModTypeNum=$H.count(oNum);
			var nAverage=me.maxCacheNum/nModTypeNum;
			for(var i=0,len=aStack.length;i<len;i++){
				var oItem=aStack[i];
				if(oNum[oItem.modName]>nAverage){
					me.destroy(oMods[oItem.modId]);
					break;
				}
			}
		}
	}
	/**
	 * 获取缓存的模块
	 * @param {string}sModName 模块名
	 * @param {string|number=}modelId 模型/集合id
	 * @return {?new:M.AbstractModule}返回对应的模块
	 */
	function fGetModule(sModName,modelId){
		var me=this;
		var sModId=me._getModId(sModName,modelId);
		return me._modules[sModId];
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param {Object|string}param  直接模块名字符串或者{  //传入参数
	 * 		modName:模块名称
	 * 		...
	 * }
	 * @param {boolean=}bNotSaveHistory仅当为true时，不保存历史记录
	 * @return {boolean} true表示成功，false表示失败
	 */
	function fGo(param,bNotSaveHistory){
		if(!param){
			return;
		}
		var me=this;
		if(typeof param=="string"){
			param={modName:param};
		}
		var sModName=param.modName;
		//模块模型id
		var sModelId=param.modelId;
		if(param.model){
			sModelId=param.modelId=param.model.id;
		}
		var sModId=me._getModId(sModName,sModelId);
		param.modId=sModId;
		//当前显示的模块名
		var sCurrentMod=me.currentMod;
		var oMods=me._modules;
		var oCurrentMod=oMods[sCurrentMod];
		//如果要进入的正好是当前显示模块，调用模块reset方法
		if(sCurrentMod==sModId){
			if(!oCurrentMod.waiting){
				oCurrentMod.reset();
			}
			return;
		}
		
		//当前显示模块不允许退出，直接返回
		if(oCurrentMod&&!oCurrentMod.waiting){
			if(oCurrentMod._forceExit){
				//标记为强制退出的模块不调用exit方法，直接退出，并将_forceExit重置为false
				oCurrentMod._forceExit=false;
			}else if(oCurrentMod.exit()===false){
				//模块返回false，不允许退出
				return false;
			}
		}
		//标记当前请求模块，主要用于异步请求模块回调时判断是否已经进了其它模块
		me.requestMod=sModId;
		
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModId];
		//如果模块有缓存
		if(oMod){
			//还在请求资源，直接返回
			if(oMod.waiting){
				return;
			}
			//这里oCurrentMod可能被用户调用了destroy而销毁
			if(oCurrentMod){
				var bIsBack=oCurrentMod.referer===oMod;
				//回退时不能改变父模块的referer
				if(!bIsBack){
					oMod.referer=oCurrentMod;
				}
			}
			//标记使用缓存，要调用cache方法
			if(oMod.notCache!=true&&oMod.clearCache!=true&&oMod.useCache(param)!=false){
				//恢复设置
				oMod.clearCache==false;
				me._showMod(oMod);
				oMod.cache(param);
				oMod.entry(param);
			}else{
				//标记不使用缓存，销毁模块
				me.destroy(oMod);
				//重新标记当前模块
//				me.currentMod=sModName;
				//重新创建模块
				oMod=me._createMod(param);
				if(!bIsBack){
					oMod.referer=oCurrentMod;
				}
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			//先标记为正在准备中，新建成功后赋值为模块对象
			me.setModule({waiting:true,referer:oCurrentMod},sModName,sModelId);
			$Require(sModName,function(Module){
				var oNewMod=me._createMod(param);
			});
		}
		
		
		//主要是处理前进和后退hash变化引起的调用，不需要再保存历史记录
		if(bNotSaveHistory!=true){
			var o={
				modName:param.modName
			};
			if(sModelId){
				o.modelId=sModelId;
			}
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:o
			});
		}
		return true;
	}
	/**
	 * 销毁模块
	 * @param {Module}oMod 待销毁的模块
	 */
	function fDestroy(oMod){
		var me=this;
		var aStack=me._modStack;
		var sModId=oMod.modId;
		if(me.currentMod===sModId){
			$M.back();
		}
		for(var i=0,len=aStack.length;i<len;i++){
			if(aStack[i].modId===sModId){
				aStack.splice(i,1);
				me._modNum[oMod.modName]--;
				break;
			}
		}
		oMod.destroy();
		delete me._modules[sModId];
	}
	/**
	 * 更新模块
	 * @param {Module}oModule 模块对象
	 * @param {Object}oParams 参数
	 * @return {Module}oNew 返回新的模块对象
	 */
	function fUpdate(oModule,oParams){
		var oNew=oModule.update(oParams);
		if(oNew){
			this._modules[oModule.modId]=oNew;
			$H.trigger('afterRender',oNew.getEl());
		}
		return oNew;
	}
	/**
	 * 清除缓存模块
	 * @param {Module|string}module 参数模块或模块名
	 * @param {number=|string=}modelId 模型id
	 */
	function fClearCache(module,modelId){
		if($H.isStr(module)){
			module=this.getModule(module,modelId);
		}
		if(module){
			module.notCache=true;
		}
	}
	/**
	 * 后退一步
	 * @method back
	 * @param {boolean=} 当传入true时，强制退出当前模块，即不调用模块的exit而直接退出
	 */
	function fBack(bForceExit){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		if(bForceExit){
			oCurMod._forceExit=true;
		}
		if(me.history.getPreState()){
			history.back();
		}else{
			me.go(me.defEntry);
		}
	}
	/**
	 * 获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	 * @return {string} 返回安全的url
	 */
	function fGetSafeUrl(){
		return this.history.getSafeUrl();
	}
	
	return ModuleManager;
	
});