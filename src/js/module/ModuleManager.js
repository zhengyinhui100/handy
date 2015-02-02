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
define("M.ModuleManager",
[
'L.Browser',
'B.Event',
'B.Object',
'B.Function',
"M.History",
"V.AbstractManager"
],
function(Browser,Evt,Obj,Func,History,AbstractManager){
	
	//TODO 使用AbstractManager的方法
	var ModuleManager=AbstractManager.derive({
		
		type               : 'module',
		
//		history            : null,   //历史记录
//		conf               : null,   //配置参数
//		container          : null,   //默认模块容器
//		navigator          : null,   //定制模块导航类
//		defEntry           : null,   //默认模块，当调用back方法而之前又没有历史模块时，进入该模块
//		defModPackage      : "com.xxx.module",  //默认模块所在包名
		maxCacheNum        : Browser.mobile()?(Browser.android()>=4||Browser.ios()>=7)?15:6:30,     //最大缓存模块数
		
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
		setModId           : fSetModId,        //设置模块modId，新建成功后才有modelId的情形，需要调用这个方法刷新modId
		destroy            : fDestroy,         //销毁模块
		removeState        : fRemoveState,     //删除历史记录
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
	 * @param {object}oParams 选项
	 * @return {Module}返回新创建的模块
	 */
	function _fCreateMod(oParams){
		var me=this;
		var sModName=oParams.modName;
		var sModId=oParams.modId;
		var Module=require(sModName);
		var oOptions={
			renderTo:me.container,
			modName:sModName,
			modId:sModId,
			name:sModName,
			xtype:sModName,
			cid:sModId.replace(/\./g,'-'),
			extCls:'js-module m-module',
			hidden:true
		};
		Obj.extend(oOptions,oParams);
		var oMod=new Module(oOptions);
		
		//异步模块在此标记referer
		var oWaitting=me._modules[sModId];
		oWaitting&&(oMod.referer=oWaitting.referer);
		
		me._modules[sModId]=oMod;
		Evt.trigger('afterRender',oMod.getEl());
		oMod.entry(oParams);
		//只有当前请求的模块恰好是本模块时才显示（可能加载完时，已切换到其它模块了）
		if(me.requestMod==sModId){
			me._showMod(oMod);
		}
		//TODO:如果是新建的模型，需要在提交保存后自动更新模块id，暂时不处理，涉及到要更新视图cid，以后考虑history中hash与modelId解耦
		if(0&&sModName==sModId){
			var oModel=oMod.model;
			if(oModel&&oModel.isNew()){
				var sIdAttr=oModel.idAttribute;
				oMod.listen({
					target:oModel,
					name:'change:'+sIdAttr,
					times:1,
					handler:function(){
						var modelId=oModel.get(sIdAttr);
						me.setModId(oMod,modelId);
					}
				});
			}
		}
		return oMod;
	}
	/**
	 * 显示模块
	 * @param {Module}oMod 要显示的模块
	 */
	function _fShowMod(oMod){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		//如果导航类方法返回false，则不使用模块管理类的导航
		var r=me.navigator&&me.navigator.navigate(oMod,oCurMod,me,oCurMod&&oCurMod.referer===oMod);
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
			Obj.extend(me,oConf);
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
		if(!Obj.isEmpty(oUrlParam)){
			var fChk=oConf.chkEntry;
			var bResult=fChk&&fChk(oUrlParam);
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
		//模块缓存算法
		var nStackLen=aStack.length;
		var nModTypeNum=Obj.count(oNum);
		var nAverage=me.maxCacheNum/nModTypeNum;
		nAverage=nAverage<1?1:nAverage;
		//标记是否删除
		var bDelete;
		//当前最小的缓存优先级
		var nMinLevel=-1;
		for(var i=0,len=aStack.length;i<len;i++){
			var oItem=aStack[i];
			//大于模块最大缓存数，删除最久的模块
			if(oModule.cacheNum&&sModName===oItem.modName&&oNum[sModName]>oModule.cacheNum){
				bDelete=true;
			}else if(nStackLen>me.maxCacheNum){
				//大于最大缓存数，删掉一个模块
				var nLevel=oMods[oItem.modId].cacheLevel;
				//未定义缓存优先级，如果超过平均缓存数就删除
				if(!nLevel){
					if(oNum[oItem.modName]>nAverage){
						bDelete=true;
					}
				}else{
					//找出最低优先级，只需查找一次
					if(nMinLevel===-1){
						for(var mod in oNum){
							var cModule=$H.ns(mod);
							var nLev=cModule&&cModule.prototype.cacheLevel;
							if(nMinLevel<0||nLev<nMinLevel){
								nMinLevel=nLev;
							}
						}
					}
					if(nLevel<=nMinLevel){
						bDelete=true;
					}
				}
			}
			if(bDelete){
				//当前模块及其父模块不能删除，直接跳过
				if(oItem.modId!=oModule.modId&&oItem.modId!=(oModule.referer&&oModule.referer.modId)){
					me.destroy(oMods[oItem.modId]);
//					$D.info('destroy:'+oItem.modId);
				}
				break;
			}
		}
	}
	/**
	 * 获取缓存的模块
	 * @param {string=}sModName 模块名，不传表示获取当前模块
	 * @param {string|number=}modelId 模型/集合id
	 * @return {?new:M.AbstractModule}返回对应的模块
	 */
	function fGetModule(sModName,modelId){
		var me=this;
		var sModId=sModName?me._getModId(sModName,modelId):me.currentMod;
		return me._modules[sModId];
	}
	/**
	 * 进入模块
	 * @param {Object|string}param  直接模块名字符串或者{  //传入参数
	 * 		{string}modName:模块名称,
	 * 		{object=}model:模型,
	 * 		{Module}referer:父模块，有时候会手动删除一些历史记录，会重新传入referer
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
		var oReferer;
		if(param.referer){
			oReferer=param.referer;
			delete param.referer;
		}else{
			oReferer=oCurrentMod;
		}
		//如果要进入的正好是当前显示模块，调用模块reset方法
		if(sCurrentMod==sModId){
			if(oCurrentMod&&!oCurrentMod.waiting){
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
					oMod.referer=oReferer;
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
					oMod.referer=oReferer;
				}
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			//先标记为正在准备中，新建成功后赋值为模块对象
			me.setModule({waiting:true,referer:oReferer},sModName,sModelId);
			require(sModName,function(Module){
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
				onStateChange:Func.bind(me.go,me),
				param:o
			});
		}
		return true;
	}
	/**
	 * 设置模块modId，新建成功后才有modelId的情形，需要调用这个方法刷新modId
	 * @param {object}oModule 参数模块对象
	 * @param {string|number}modelId 模型id
	 */
	function fSetModId(oModule,modelId){
		var me=this;
		var oMods=me._modules;
		var aStack=me._modStack;
		var sModName=oModule.modName;
		var sNewModId=me._getModId(sModName,modelId);
		for(var sModId in oMods){
			var oMod=oMods[sModId];
			if(oModule==oMod){
				delete oMods[sModId];
				oMods[sNewModId]=oModule;
				oModule.modId=sNewModId;
				if(me.currentMod===sModId){
					me.currentMod=sNewModId;
				}
			}
		}
		for(var i=0,len=aStack;i<len;i++){
			var oItem=aStack[i];
			if(oItem.modName===sModName&&oItem.modId===undefined){
				oItem.modId=sNewModId;
			}
		}
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
			me.back();
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
	 * 删除历史记录
	 * @param {string=} sHkey hkey的值，默认是当前记录
	 */
	function fRemoveState(sHkey){
		this.history.removeState(sHkey);
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
			Evt.trigger('afterRender',oNew.getEl());
		}
		return oNew;
	}
	/**
	 * 清除缓存模块
	 * @param {Module|string}module 参数模块或模块名
	 * @param {number=|string=}modelId 模型id
	 */
	function fClearCache(module,modelId){
		if(Obj.isStr(module)){
			module=this.getModule(module,modelId);
		}
		if(module){
			module.notCache=true;
		}
	}
	/**
	 * 后退一步
	 * @param {boolean=} 当传入true时，强制退出当前模块，即不调用模块的exit而直接退出
	 */
	function fBack(bForceExit){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		if(bForceExit){
			oCurMod._forceExit=true;
		}
		if(me.history.getPreState()){
			//这里要注意，组件可能会监听hisoryChange事件，阻止这里的后退，所以这里先通知history不要触发hisoryChange事件
			me.history._byManager=true;
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