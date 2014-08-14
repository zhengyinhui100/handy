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
"CM.AbstractManager"],
function(History,AbstractManager){
	
	//TODO 使用AbstractManager的方法
	var ModuleManager=AbstractManager.derive({
		
		type               : 'module',
		
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		maxModNum          : 100,     //最大缓存模块数
		
//		requestMod         : '',     //正在请求的模块名
//		currentMod         : '',     //当前模块名
//		_modules           : {},     //模块缓存
//		_modStack          : [],     //模块调度记录
//		_modNum            : {},     //模块名数量统计
		
		_getModId          : _fGetModId,        //获取modId
		_createMod         : _fCreateMod,       //新建模块
		_showMod           : _fShowMod,         //显示模块
		_destroy           : _fDestroy,         //销毁模块
		
		initialize         : fInitialize,      //初始化模块管理
		setModule          : fSetModule,       //设置/缓存模块
		getModule          : fGetModule,       //获取缓存的模块
		go                 : fGo,              //进入模块
		update             : fUpdate,          //更新模块
		clearCache         : fClearCache,      //清除缓存模块
		back               : fBack             //后退一步
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
	 * @param 
	 */
	function _fCreateMod(oParams){
		var me=this;
		var sModName=oParams.modName;
		var sModId=oParams.modId;
		//先标记为正在准备中，新建成功后赋值为模块对象
		me.setModule({waiting:true},sModName,oParams.modelId);
		//请求模块
		$Require(sModName,function(Module){
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
			me._modules[sModId]=oMod;
			$H.trigger('afterRender',oMod.getEl());
			oMod.entry(oParams);
			//可能加载完时，已切换到其它模块了
			if(me.requestMod==sModId){
				me._showMod(oMod);
			}
		});
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param
	 */
	function _fShowMod(oMod){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(!(me.navigator&&me.navigator.navigate(oMod,oCurMod,me))){
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
	 * 销毁模块
	 * @method _destroy
	 * @param {Module}oMod 待销毁的模块
	 */
	function _fDestroy(oMod){
		var me=this;
		var aStack=me._modStack;
		var sModId=oMod.modId;
		for(var i=0,len=aStack.length;i<len;i++){
			if(aStack[i].modId===sModId){
				aStack.splice(i,1);
				me._modNum[oMod.modName]--;
				break;
			}
		}
		oMod.destroy();
		$D.info('destroy:'+sModId);
		delete me._modules[sModId];
	}
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage  : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator   : 定制导航类
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
		if(aStack.length>me.maxModNum){
			var nModTypeNum=$H.count(oNum);
			var nAverage=me.maxModNum/nModTypeNum;
			for(var i=0,len=aStack.length;i<len;i++){
				var oItem=aStack[i];
				if(oNum[oItem.modName]>nAverage){
					me._destroy(oMods[oItem.modId]);
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
		var me=this;
		if(typeof param=="string"){
			param={modName:param};
		}
		var sModName=param.modName;
		//刷新浏览器时，hash参数里没有modName
		if(!sModName){
			var sModId=param.modId;
			//只有没有modId的模块可以进入
			if($H.isStr(sModId)&&sModId.indexOf('-')<0){
				sModName=param.modName=sModId;
			}else{
				return;
			}
		}
		//模块id
		var sModId=sModName;
		if(param.model){
			var sModelId=param.modelId=param.model.id;
			sModId=me._getModId(sModName,sModelId);
			
		}
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
			}else if(oCurrentMod.exit()==false){
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
			if(oMod.waiting){
				return;
			}
			//标记使用缓存，要调用cache方法
			if(oMod.notCache!=true&&oMod.clearCache!=true&&oMod.useCache(param)!=false){
				//恢复设置
				oMod.clearCache==false;
				me._showMod(oMod);
				oMod.cache(param);
				oMod.entry(param);
			}else if(!oMod.waiting){
				//标记不使用缓存，销毁模块
				me._destroy(oMod);
				//重新标记当前模块
//				me.currentMod=sModName;
				//重新创建模块
				me._createMod(param);
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			me._createMod(param);
		}
		//主要是处理前进和后退hash变化引起的调用，不需要再保存历史记录
		if(bNotSaveHistory!=true){
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:param
			});
		}
		return true;
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
		if(bForceExit){
			me._modules[me.currentMod]._forceExit=true;
		}
		history.back();
	}
	
	return ModuleManager;
	
});