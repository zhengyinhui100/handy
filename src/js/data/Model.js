/**
 * 模型类，负责数据封装，可监听事件：invalid、sync、destroy、change:attr、change
 * PS：
 * 1、为了保证模型的一致性，新建模型实例必须使用静态get方法，而不能用new方式，get方法会统一放进DateStore里处理；
 * 2、自定义属性默认不提交，需要提交需配置save:true
 * 3、嵌套属性（自定义属性中类型为模型或集合类型的属性）区别于普通属性，不可通过hasChanged、changedAttrs等方法获取改变，save时也不会提交
 *    只能通过相关委托事件(_onAttrEvent方法里)进行监测；
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.data.Model"
define('D.Model',
[
'B.Object',
'B.Date',
'B.String',
'B.Util',
'B.Function',
'D.AbstractData',
'D.DataStore'
],
function(Obj,Dat,Str,Util,Func,AbstractData,DataStore){
	
	var Model=AbstractData.derive({
		//可扩展属性
//      fields                : {},                  
		/**
		 * 属性声明列表，一般是需要额外处理的定制属性，基本类型的属性不需要在此声明，{
	     *	普通形式：
	     *	{string}name:{
		 *	    {string|Class=}type:类型，可以是字符串表示基本类型(string/number/Date/boolean),也可以是类Model/Collection,
		 *		{boolean=}unsave:是否不需要保存，嵌套属性都不提交，基本类型的自定义字段保存时默认提交，仅当声明为unsave:true时不提交
		 *		{object=}options:新建模型/集合实例时的选项,
		 *		{*=}def:默认值,
		 *   	{Function({*}val,{object}oAttrs)=}parseDeps:设置该属性时自定义解析操作,
		 *   	{Array=}deps:依赖的属性，计算属性需要此配置检查和计算
	     *	}
	     *	简便形式:
	     *	{name:default}
	     *}
	     */
////    belongsTo             : null,                //保留属性，描述一对一关系，
////    hasMany               : null,                //保留属性，描述一对多关系
//		cid                   : 0,                   //客户id
//		id                    : 0,                   //模型id
        idAttribute           : 'id',                //id默认属性名
//      uuid                  : 0,                   //uuid，初始化时系统分配，具有全局唯一性
        
        //系统属性
//      fetching              : false,               //是否正在抓取数据，model.get('fetching')==true表示正在抓取
//		saving                : false,               //正在保存
//		destroyed             : false,               //是否已销毁
		$isModel              : true,                //模型标记
		
        //内部属性
//		_changing             : false,               //是否正在改变，但未保存
		_pending              : false,               //
//		_savedAttrs           : {},                  //已保存的值
//		_preAttrs             : {},                  //较早的值
//		_attributes           : {},                  //属性对象
//    	_changed              : {},                  //改变了的值，只存放基本类型，类类型的不存放
//	    validationError       : {},                  //校验错误的值
        
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
   		_doDepends            : _fDoDepends,         //处理计算/依赖属性
   		_parseFields          : _fParseFields,       //属性预处理
   		_onAttrEvent          : _fOnAttrEvent,       //处理属性模型和集合事件
		
		initialize            : fInitialize,         //类初始化
//		init                  : $H.noop,             //自定义初始工作
		getDefaults           : fGetDefaults,        //获取默认值
		toJSON                : fToJSON,             //返回对象数据副本
   		get                   : fGet,                //获取指定属性值
   		getSaved              : fGetSaved,           //获取指定的已保存的属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
   		each                  : fEach,               //遍历字段
   		hasChanged            : fHasChanged,         //判断自上次change事件后有没有修改，可以指定属性
   		changedAttrs          : fChangedAttrs,       //返回改变过的属性，可以指定需要判断的属性
   		filterUnsave          : fFilterUnsave,       //过滤掉不需要保存的属性
   		previous              : fPrevious,           //返回修改前的值，如果没有修改过，则返回null
   		fetch                 : fFetch,              //获取模型数据
   		save                  : fSave,               //保存模型
   		destroy               : fDestroy,            //销毁/删除模型
   		getUrl                : fGetUrl,             //获取模型url
   		parse                 : fParse,              //分析处理回调数据，默认直接返回response
   		clone                 : fClone,              //克隆模型
   		isNew                 : fIsNew,              //判断是否是新模型(没有提交保存，并且缺少id属性)
   		isValid               : fIsValid             //校验当前是否是合法的状态
	},{
	    getId                 : fStaticGetId,        //传入属性表获取id
		get                   : fStaticGet           //静态get方法，为了保证模型的一致性，新建模型实例必须使用此方法，而不能用new方式
	});
	
	/**
	 * 传入属性表获取id
	 * @param {object} oAttrs 参数属性表
	 * @return {number|string} 返回模型id
	 */
	function fStaticGetId(oAttrs){
		var _Class=this,id,
		sIdName=_Class.prototype['idAttribute'];
		//如果有id，需要先查找是否有存在的模型，查询直接id效率高，所以先进行查询，查询不到id才通过new后，查询联合id
		if(id=oAttrs[sIdName]){
	        return id;
        }
        var oFields=_Class.prototype.fields;
        if(oFields){
        	var oIdFiled=oFields[sIdName];
        	if(oIdFiled){
	        	var aDeps=oIdFiled.deps;
	        	var oVal={};
	        	Obj.each(aDeps,function(i,k){
	        		oVal[k]=oAttrs[k]
	        	});
		        //因为可能存在自定义联合主键，所以这里没有现存的模型而新建一个实例时，要把oVal传入，以便获取正确的主键
		        var oModel=new _Class(oVal);
		        return oModel.id;
        	}
        }
	}
	/**
	 * 静态get方法，为了保证模型的一致性，新建模型实例必须使用此方法，而不能用new方式
	 * @param {object=}oVal 不传是直接new，传了值会先在DataStore里查找
	 * @param {object=}oOptions new模型实例时的选项
	 * @param {object=}oChange 如果传入object，返回时，oChange.changed表示此次操作改变了原模型的值或者新建了模型实例
	 * @return {Model} 返回模型实例
	 */
	function fStaticGet(oVal,oOptions,oChange){
		var _Class=this;
		var oModel;
		//是否改变了原有模型，new操作也表示改变了
		var bHasChange=false;
		if(oVal){
			var id=_Class.getId(oVal);
			//如果有id，需要先查找是否有存在的模型，查询直接id效率高，所以先进行查询，查询不到id才通过new后，查询联合id
			if(id){
		        oModel=$S.get(_Class,{id:id});
	        }
		}
        if(!oModel){
	        var oModel=new _Class(oVal,oOptions);
	        //放入数据仓库
			bHasChange=true;
			$S.push(oModel);
        }else{
        	//已存在的对应的模型，设置新值
        	bHasChange=oModel.set(oVal).changed;
        }
        oChange&&(oChange.changed=bHasChange);
        return oModel;
	}
	/**
	 * 执行校验，如果通过校验返回true，否则，触发"invalid"事件
	 * @param {Object=}oAttrs 参数属性，传入表示只校验参数属性
	 * @param {Object=}oOptions 选项
	 * @return {boolean} true表示通过校验
	 */
    function _fValidate(oAttrs, oOptions) {
    	var me=this;
        if (!oOptions.validate || !me.validate){
        	return true;
        }
        oAttrs = Obj.extend({}, me._attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, Obj.extend(oOptions, {validationError: error}));
        return false;
    }
    /**
     * 处理计算/依赖属性
     * @param {object}oChanges 当前操作改变的属性
     * @param {object=}oOptions 选项{
     * 		{boolean=}silent 是否不触发事件
     * 		{object=}stack 调用堆栈，避免循环调用
     * }
     * @return {object=}如果需要改变，返回改变的属性列表，否则返回undefined
     */
    function _fDoDepends(oChanges,oOptions){
    	var me=this;
    	oOptions=oOptions||{};
    	//处理计算属性
	    var oFields=me.fields,oField,aDeps,oSets={},bNeed,fParseDeps;
	    for(var key in oFields){
	    	var oField=oFields[key];
			if(oField&&(aDeps=oField.deps)){
				for(var i=0;i<aDeps.length;i++){
			    	//当依赖属性变化时，设置计算属性
					if(oChanges.hasOwnProperty(aDeps[i])){
						var val;
						//自定义解析
						if(fParseDeps=oField.parseDeps){
							var aParams=[];
							for(var j=0;j<aDeps.length;j++){
								aParams.push(me.get(aDeps[j]));
							}
							val=fParseDeps.apply(me,aParams);
						}
						oSets[key]=val;
						bNeed=true;
						break;
					}
				}
			}
	    }
	    if(bNeed){
		    return me.set(oSets,oOptions).changed;
	    }
    }
    /**
     * 属性预处理
     * @param {string}sAttr 属性名
     * @param {*}val 属性值
     * @param {object=}oOptions 选项
     * @return {*} 返回处理好的属性值
     */
    function _fParseFields(sAttr,val,oOptions){
    	var me=this;
    	var oFields;
    	if(!(oFields=me.fields)){
    		return val;
    	}
    	var oField,aDeps,type,oOpts;
		if(oField=oFields[sAttr]){
			type=oField.type;
			oOpts=oField.options||{};
			oOpts.saved=oOptions&&oOptions.saved;
			//自定义类型，包括Model和Collection
			if(Obj.isStr(type)){
				if(type=='Date'){
					val=Dat.parseDate(val);
				}else if(type=='string'||type=='str'){
					val=val?''+val:'';
				}else if(type=='number'||type=='num'){
					val=val?parseFloat(val):0;
				}else if(type=='boolean'||type=='bool'){
					val=val&&val!=='false';
				}else if(type.indexOf('.')>0){
					type=require(type);
				}
			}
			if(Obj.isClass(type)&&!(val instanceof type)){
				//模型
				if(type.get){
					var oChange={};
			        val=type.get(val,oOpts,oChange);
			        val&&(val._changedTmp=oChange.changed);
				}else{
					//集合
					var oCurrent=me.get(sAttr);
					if(oCurrent){
						var tmp=oCurrent.set(val,oOpts);
						val=oCurrent;
						val._changedTmp=tmp.changed;
						
					}else{
						val=new type(val,oOpts);
						val._changedTmp=true;
					}
				}
			}
		}
		return val;
    }
    /**
	 * 处理属性模型和集合事件
	 * @param {string}sAttr 属性名
	 * @param {string}sEvent 事件名称
	 * @param {Model|Collection}obj 对象
	 */
    function _fOnAttrEvent(sAttr,sEvent, oModel,oCollection) {
    	//||sEvent.indexOf('change:')==0，子事件冒泡暂不屏蔽
    	if(sEvent=='invalid'||sEvent=='sync'||sEvent=='request'){
    		return;
    	}
    	//模型被添加事件无需处理，如果是集合add事件，oCollection是集合对象
    	if(sEvent=='add'&&!Obj.isInstance(oCollection)){
    		return;
    	}
    	var me=this;
    	var oVal=me.get(sAttr);
    	var oStack=arguments[arguments.length-1];
    	var bNew;
    	if(!oStack||!oStack.$isStack){
    		oStack={
    			uuid:','+oModel.uuid+',',
    			$isStack:true
    		}
    		bNew=true;
    	}
    	var sUuid=oStack.uuid;
    	var sCurUuid=','+me.uuid+',';
    	//不是循环事件才触发
    	if(sUuid.indexOf(sCurUuid)<0){
    		//将当前uuid加上，到外层事件时检查是否是循环事件
    		oStack.uuid+=sCurUuid;
    		var aArgs=Obj.toArray(arguments,1);
    		bNew&&aArgs.push(oStack);
	    	me.trigger.apply(me,['change:'+sAttr,me,oVal].concat(aArgs));
	    	me.trigger.apply(me,['change',me,oStack].concat(aArgs));
	    	//me.trigger.apply(me, arguments);
	    	//标记已触发对应属性change事件，通知set方法不必再触发
	    	me._attrEvts[sAttr]=1;
    	}
    	var sCurDepsUuid=sAttr+sCurUuid;
    	if(sUuid.indexOf(sCurDepsUuid)<0){
    		oStack.uuid+=sCurDepsUuid;
	    	var oChange={};
	    	oChange[sAttr]=oVal;
	    	me._doDepends(oChange,{stack:oStack});
    	}
    }
	/**
	 * 初始化
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * 		{object=}custom 自定义配置
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
		me.callSuper();
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = 'md_'+Util.uuid();
		me._attributes = {};
		me._attrEvts={};
		if(oOptions.custom){
			Obj.extend(me,oOptions.custom);
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		//默认值不触发事件，init前设置默认值方便监听嵌套类型事件
		me.set(me.getDefaults(), {silent:true});
		if(me.init){
			me.init(oAttrs, oOptions);
		}
		me._savedAttrs={};
		me.set(oAttrs, oOptions);
		me._changed = {};
	}
	/**
	 * 获取默认值，只需要分析一次
	 * @return 返回默认值
	 */
	function fGetDefaults(){
		var me=this,
		cClass=me.constructor,
		oProto=cClass.prototype,
		oDefaults=oProto._defaults;
		//这里需要检查是否是继承自父类原型链的
		if(!oDefaults||oDefaults===cClass.superProto._defaults){
			var oFields,
			oNestedFileds={};
			oDefaults={};
			if(oFields=me.fields){
				for(var k in oFields){
					var field=oFields[k];
					//自定义字段
					if(field&&Obj.isObj(field)){
						if(field.hasOwnProperty('def')){
							oDefaults[k]=field.def;
						}else{
							var type=field.type;
							if(type){
								//命名空间
								if(typeof type=='string'&&type.indexOf('.')>0){
									type=field.type=require(type);
								}
								//TODO:对于嵌套类型，只有Collection默认会初始化，方便使用，
								//模型由于可能自引用造成死循环，这里暂不自动初始化，还是自定义不初始化？
								if(type.prototype){
									//标记嵌套属性
									oNestedFileds[k]=1;
									if(type.prototype.$isCollection){
										oDefaults[k]=[];
									}
								}
							}
						}
						continue;
					}
					oDefaults[k]=field;
				}
			}
			//每个类只分析一次
			oProto._defaults=oDefaults;
			oProto._nestedFields=oNestedFileds;
		}
		return oDefaults;
	}
	/**
	 * 返回对象数据副本
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return Obj.clone(this._attributes);
    }
    /**
     * 获取指定属性值
     * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性
     */
    function fGet(sAttr) {
        return this._attributes[sAttr];
    }
    /**
     * 获取指定已保存的属性值
     * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性
     */
    function fGetSaved(sAttr) {
        return this._savedAttrs[sAttr];
    }
	/**
	 * 获取html编码过的属性值
	 * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性编码后的值
	 */
    function fEscape(sAttr) {
        return Str.escape(this.get(sAttr));
    }
	/**
	 * 判断是否含有参数属性
	 * @param {string}sAttr 参数属性
	 * @return {boolean} 指定属性不为空则返回true
	 */
    function fHas(sAttr) {
    	var value=this.get(sAttr);
    	return  value!== null&&value!==undefined;
    }
	/**
	 * 设置值，并触发change事件(如果发生了变化)
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset: 是否清除设置
	 * 		{boolean=}saved:是否是已保存的值
	 * 		{boolean=}silent: 是否不触发事件
	 * 		{object=}stack 调用堆栈，避免循环调用
	 * }
	 * @return {object}{
	 * 		{boolean}changed : 此次设置改变了的属性列表，false表示未改变
	 * 		{boolean=}invalid : 仅当true时表示未通过校验
	 * 		{Model}result:模型对象自身,
	 * 		{boolean=}silent:true时不触发事件
	 * } 
	 */
    function fSet(sKey, val, oOptions) {
    	var me=this;
    	var oAttrs;
    	var oResult={result:me};
	    if (typeof sKey === 'object') {
	    	oAttrs = sKey;
	    	oOptions = val;
	    } else {
	    	(oAttrs = {})[sKey] = val;
	    }
	    oOptions || (oOptions = {});
	    if(oAttrs instanceof Model){
	    	oAttrs=oAttrs._attributes;
	    }
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	oResult.invalid=true;
	    	return oResult;
	    }
	
	    var bUnset= oOptions.unset;
	    var bSilent= oOptions.silent;
	    var oStack=oOptions.stack;
	    //所以本次设置所改变的属性
	    var oChanges={};
	
	    //开始改变前，先存储初始值
	    if (!me._pending) {
	        me._preAttrs = Obj.clone(me._attributes);
	    	me._changed = {};
	    }
	    var oCurrent = me._attributes, 
	    	oPrev = me._preAttrs;
	
	    //id特殊处理
	    if (me.idAttribute in oAttrs){
	  	    me.id = oAttrs[me.idAttribute];
	    }
	    
	    //TODO:循环进行设置、更新、删除，这里必须先设置基础类型属性，因为嵌套属性会触发复杂事件，情况比较难控制，
	    //可能会在嵌套事件中又对当前模型进行设置，暂时解决方案是在监听函数里自行setTimeout处理，
	    //以后考虑Model、Collection对嵌套事件延时触发？
	    var aAttrs=[],oNestedFields=me._nestedFields,oField,type;
	    for (var sAttr in oAttrs) {
	    	if(oNestedFields[sAttr]){
	    		aAttrs.push(sAttr);
	    	}else{
	    		aAttrs.unshift(sAttr);
	    	}
	    }
	    for (var i=0,len=aAttrs.length;i<len;i++) {
	    	var sAttr=aAttrs[i];
	    	//属性预处理
	    	val= me._parseFields(sAttr,oAttrs[sAttr],oOptions);
	    	var curVal=oCurrent[sAttr];
	    	//当前属性是否是嵌套属性
	   	    var bCurNested=curVal&&Obj.isInstance(curVal);
	   	    //新值是否是嵌套属性
	   	    var bNewNested=val&&Obj.isInstance(val);
	    	//嵌套属性设置，不需要在此触发相关事件，而是通过监听该属性上的事件触发事件，计算属性也是通过事件触发计算
	    	if(bCurNested||bNewNested){
	    		//删除旧值或更换嵌套属性，须移除原来在该属性上的事件
	    		if(bUnset){
	    			delete oCurrent[sAttr];
	    			//如果有旧值，需要清除相关事件
	    			curVal&&me.unlistenTo(curVal);
	    		}else{
	    			//
					oCurrent[sAttr] = val;
					if(!curVal||!val||curVal.id!=val.id){
						//如果有旧值，需要清除相关事件
	    				curVal&&me.unlistenTo(curVal);
	    				if(val){
							//这里如果传入就是模型，_parseFields方法不进行处理，因此这里标记为已改变
							val._changedTmp=true;
							//新模型需要监听事件
		    				me.listenTo(val,'all',Func.bind(me._onAttrEvent,me,sAttr));
	    				}
					}
	    		}
	    		////与当前值不相等，放入本次改变列表中
    			if(bUnset||!val||val._changedTmp){
    				oChanges[sAttr]=val;
    			}
				val&&delete val._changedTmp;
	    	}else{
		   	    //与当前值不相等，放入本次改变列表中
		    	if (!Obj.equals(oCurrent[sAttr], val)){
		    		oChanges[sAttr]=val;
		    	}
		    	//与初始值不相等，放入已经改变的hash对象中
		    	if (!Obj.equals(oPrev[sAttr], val)) {
		            me._changed[sAttr] = val;
		    	} else {
		    		//跟初始值相等，即没有变化
		        	delete me._changed[sAttr];
		    	}
		    	
		    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    	}
	    }
	    
		var bHasChange=!Obj.isEmpty(oChanges);
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (bHasChange){
	        	me._pending = oOptions;
	        }
	        for (var k in oChanges) {
	        	//_onAttrEvent里触发过了的属性事件，这里不需要再触发
	        	if(!me._attrEvts[k]){
		      	    me.trigger('change:' + k, me, oCurrent[k], oOptions,oStack);
	        	}
	        }
	    }
	
	    //触发模型对象change事件
	    if (bHasChange&&!bSilent) {
	        if(me._pending) {
	       		oOptions = me._pending;
//	            me._pending = false;
	            me.trigger('change', me, oOptions,oStack);
	        }
	    }
	    //处理依赖属性
	    if(bHasChange){
		    var oDepsResult=me._doDepends(oChanges,bSilent);
		    oDepsResult&&Obj.extend(oChanges,oDepsResult);
	    }
	    me._pending = false;
	    oResult.changed=bHasChange?oChanges:null;
	    //重新清空属性事件标记
	    me._attrEvts={};
	    if(oOptions.saved){
	    	bHasChange&&Obj.extend(me._savedAttrs,oChanges);
	    }
	    return oResult;
    }
    /**
     * 移除指定属性
     * @param {string}sAttr 参数属性
     * @param {Object=}oOptions 备选参数
     * @return {Model}返回模型对象本身
     */
    function fUnset(sAttr, oOptions) {
    	oOptions=oOptions||{};
    	oOptions.unset=true;
        return this.set(sAttr, void 0, oOptions);
    }
    /**
     * 清除所有属性
     * @param {Object=}oOptions 
     */
    function fClear(oOptions) {
    	var me=this;
        var oAttrs = {};
        for (var sKey in me._attributes) {
            oAttrs[sKey] = void 0;
        }
        oOptions=oOptions||{};
    	oOptions.unset=true;
        return me.set(oAttrs,oOptions);
    }
    /**
     * 遍历字段
     * @param {function}fCall({string}attr,{*}value) 回调函数
     */
    function fEach(fCall){
    	var oAttrs=this._attributes;
    	Obj.each(oAttrs,fCall);
    }
	/**
	 * 判断自上次change事件后有没有修改，可以指定属性
	 * @param {string=}sAttr 参数属性，为空表示判断对象有没有修改
	 * @param {boolean=}bAll 仅当为true时检测所有的属性，否则只检测需要提交的属性
	 * @return {boolean} true表示有修改
	 */
    function fHasChanged(sAttr,bAll) {
    	if(Obj.isBool(sAttr)){
    		bAll=sAttr;
    		sAttr=undefined;
    	}
    	if(bAll){
	    	var oChanged=this._changed;
	        if (sAttr == null){
	        	return !Obj.isEmpty(oChanged);
	        }
	        return Obj.contains(oChanged, sAttr);
    	}else{
    		var oChanged=this.changedAttrs();
    		if(sAttr == null){
    			return !!oChanged;
    		}
	    	return oChanged&&Obj.contains(oChanged, sAttr);
    	}
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @param {object=}oParams{
	 * 		@param {Object=}diff 参数属性，表示只判断传入的属性列表，返回跟参数属性不同的属性表，不传表示检查全部属性
	 * 		@param {boolean=}includeUnsave 仅当为true时检测所有的属性，否则只检测需要提交的属性
	 * 		@param {boolean=}strictDiff 仅当为true时进行严格比对，默认是“==”进行比较
	 * 		@param {boolean=}diffSaved 比较已保存的属性列表，不传表示比较上次set后改变的值
	 * }
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttrs(oParams) {
    	var me=this;
    	oParams=oParams||{};
    	var oDiff=oParams.diff;
    	if(!oDiff&&oParams.diffSaved){
	    	oDiff=me._attributes;
    	}
    	var bStrict=oParams.strictDiff;
    	var bAll=oParams.includeUnsave;
        var val, changed = false;
        var oFields=me.fields;
        var oOld = oParams.diffSaved?me._savedAttrs:me._changing ? me._preAttrs : me._attributes;
        var _fGet=function(oAttrs){
	        for (var sAttr in oAttrs) {
	        	var bNeed=true;
            	val = oAttrs[sAttr];
	        	//bAll不为true时只检测需要保存的属性
	        	if(!bAll){
	        		var bHas=oFields.hasOwnProperty(sAttr);
	        		bNeed=!bHas||(bHas&&(Obj.isSimple(val)&&!oFields[sAttr].unsave));
	        	}
	            if (bNeed){
	            	var old=oOld[sAttr];
	            	//默认非严格模式，用于一般场景，如填写表单时校验用户是否有修改，一般情况下表单里的""是可以不用提交的（跟model里的undefined是相等的）
	            	if(!oDiff||(oDiff&&!(bStrict?(Obj.equals(old, val)):(old==val||(old===undefined&&val==''))))){
			            (changed || (changed = {}))[sAttr] = val;
	            	}
	            }
	        }
        }
        if(oDiff){
        	_fGet(oDiff);
        }else{
        	_fGet(me._changed);
        }
        return changed;
    }
    /**
     * 过滤掉不需要保存的属性
     * @param {object=}oAttrs 要处理的属性表，默认是模型属性表
     * @return {object} 返回需要提交保存的属性表
     */
    function fFilterUnsave(oAttrs){
    	var me=this;
    	var oFields=me.fields;
    	oAttrs=oAttrs||me._attributes;
    	var oResult={};
    	Obj.each(oAttrs,function(k,val){
	    	var bHas=oFields.hasOwnProperty(k);
		    var bNeed=!bHas||(bHas&&Obj.isSimple(val)&&!oFields[k].unsave);
		    if(bNeed){
		    	oResult[k]=val;
		    }
    	})
    	return oResult;
    }
	/**
	 * 返回修改前的值，如果没有修改过，则返回null
	 * @param {string}sAttr 指定属性
	 * @return {*} 返回修改前的值，如果没有修改过，则返回null
	 */
    function fPrevious(sAttr) {
    	var me=this;
        if (sAttr == null || !me._preAttrs){
        	return null;
        }
        return me._preAttrs[sAttr];
    }
	/**
	 * 返回所有修改前的值
	 * @return {Object} 返回所有修改前的值
	 */
    function fPreviousAttributes() {
        return Obj.clone(this._preAttrs);
    }
	/**
	 * 获取模型数据
	 * @param {Object=}oOptions 备选参数{
	 * 		{function=}beforeSet 设置前操作，返回false则不进行后续设置
	 * 		{function=}success 设置成功回调
	 * 		{function|boolean=}parse boolean表示是否要使用parse函数处理回调数据，function表示使用该函数处理回调数据
	 * }
	 * @return {*} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? Obj.clone(oOptions) : {};
        if (oOptions.parse === void 0) {
        	oOptions.parse = true;
        }
        oOptions.saved=true;
        var fSuccess = oOptions.success;
        var fBeforeSet = oOptions.beforeSet;
        oOptions.success = function(resp) {
        	me.set('fetching',false);
        	var oData=me.parse(resp, oOptions);
        	if (fBeforeSet){
        		if(fBeforeSet(me, oData, oOptions)==false){
        			return;
        		}
        	}
        	var r=me.set(oData, oOptions);
        	if (r.invalid){
        		return false;
        	}
        	if (fSuccess){
        		fSuccess(me, oData, oOptions);
        	}
        	me.trigger('sync', me, oData, oOptions);
        };
    	me.set('fetching',true);
        return me.sync('read', me, oOptions);
    }
	/**
	 * 保存模型
	 * @param {String}sKey 属性
	 * @param {*=}val 值，不传默认是当前key对应的值
	 * @param {Object|Function=}oOptions 选项，如果传入的是函数，表示成功回调函数{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * 		{function=}success 成功回调函数
	 * 		{boolean=}update true时执行update操作
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * 		{function=}noChanged 没有需要提交的属性时，调用的函数
	 * 		{object=}extAttrs 额外提交的属性，只在原有属性有改变需要提交时才提交，noChanged时忽略此属性
	 * }
	 */
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, sMethod, oXhr;
        //sKey, value 或者 {sKey: value}
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else if(typeof sKey==='string'){
        	if(arguments.length===1){
        		val=me.get(sKey);
        	}
        	(oAttrs = {})[sKey] = val;
        }

        if(Obj.isFunc(oOptions)){
        	oOptions={success:oOptions};
        }
        oOptions = Obj.extend({validate: true}, oOptions);

        //now==true，立刻设置数据
        if (oAttrs && oOptions.now) {
       	    if (me.set(oAttrs, oOptions).invalid){
       	    	return false;
       	    }
        } else {
        	//验证数据
        	if (!me._validate(oAttrs, oOptions)){
		        return false;
		    }
        }

        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        oOptions.saved=true;
        var fSuccess = oOptions.success;
        oOptions.success = function(resp) {
        	me.saving=false;
	        var oServerAttrs = me.parse(resp, oOptions)||{};
	        //now!=true，确保更新相应数据(可能没有返回相应数据)
	        if (!oOptions.now){
	        	oServerAttrs = Obj.extend(oAttrs || {}, oServerAttrs);
	        }
	        //服务器返回的值可能跟现在不一样，还要根据返回值修改
	        if (me.set(oServerAttrs, oOptions).invalid) {
	            return false;
	        }
	        if (fSuccess){
	        	//TODO 这里要不要统一先parse？像fetch一样添加beforeSet?
	        	fSuccess(me, resp, oOptions);
	        }
	        me.trigger('sync', me, resp, oOptions);
	    };
		var fError = oOptions.error;
		oOptions.error=function(){
			me.saving=false;
			if(fError){
				fError.apply(me,arguments);
			}
		}
	    sMethod = me.isNew() ? 'create' : (oOptions.update ? 'update':'patch' );
    	//patch只提交所有改变的值
	    var oSaveAttrs;
	    if (sMethod === 'patch'){
	    	//设置不需要保存的属性可能导致需要保存的依赖属性变化，所以这里不能只检查当前设置的属性
	    	var oChanged=me.changedAttrs({diff:oAttrs,diffSaved:true});
	    	//没有改变的属性，直接执行回调函数
	    	if(!oChanged){
	    		var fNoChange = oOptions.noChange;
	    		if (fNoChange){
		        	fNoChange(me, oOptions);
		        }
		        return;
	    	}
	    	oSaveAttrs = oChanged;
	    }else{
	    	//提交所有属性值
	    	var oCurrent=Obj.extend({},me._attributes);
	    	oSaveAttrs = Obj.extend(oCurrent,oAttrs);
	    }
	    oSaveAttrs=me.filterUnsave(oSaveAttrs);
	    //额外属性
	    if(oOptions.extAttrs){
	    	Obj.extend(oSaveAttrs,oOptions.extAttrs);
	    }
	    oOptions.attrs=oSaveAttrs;
	    me.saving=true;
	    me.sync(sMethod, me, oOptions);
    }
	/**
	 * 销毁/删除模型
	 * @param {Object=}oOptions 备选参数{
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * }
	 */
    function fDestroy(oOptions) {
    	var me=this;
        oOptions = oOptions ? Obj.clone(oOptions) : {};
        var fSuccess = oOptions.success;

        var destroy = function() {
            me.trigger('destroy', me, oOptions);
            me.off();
            me.destroyed=true;
        };

        oOptions.success = function(resp) {
	        if (!oOptions.now || me.isNew()){
	        	destroy();
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        if (!me.isNew()){
	        	me.trigger('sync', me, resp, oOptions);
	        }
	    };

        if (me.isNew()) {
       	    oOptions.success();
            return false;
        }

        me.sync('delete', me, oOptions);
        if (oOptions.now){
        	destroy();
        }
    }
	/**
	 * 获取模型url
	 * @return {string} 返回模型url
	 */
    function fGetUrl() {
    	var me=this;
        var sUrl =Util.result(me, 'url');
        if(!sUrl){
        	$D.error(new Error('必须设置一个url属性或者函数'));
        }
        if (me.isNew()){
        	return sUrl;
        }
        return sUrl.replace(/([^\/])$/, '$1/') + encodeURIComponent(me.id);
    }
    /**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
    	if(resp.code){
	        return resp.data;
    	}else{
    		return resp;
    	}
    }
    /**
     * 克隆模型
     * @return {Model} 返回克隆副本
     */
    function fClone() {
    	var me=this;
        return new me.constructor(me._attributes);
    }
	/**
	 * 判断是否是新模型(没有提交保存，并且缺少id属性)
	 * @return {boolean} true表示是新模型
	 */
    function fIsNew() {
    	var me=this;
        return me.id===undefined;
    }
	/**
	 * 校验当前是否是合法的状态
	 * @return {boolean} true表示合法
	 */
    function fIsValid(oOptions) {
        return this._validate({}, Obj.extend(oOptions || {}, { validate: true }));
    }
	
	return Model;
	
});