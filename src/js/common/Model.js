/**
 * 模型类，负责数据封装，可监听事件：invalid、sync、destroy、change:attr、change
 * PS：
 * 1、为了保证模型的一致性，新建模型实例必须使用静态get方法，而不能用new方式；
 * 2、嵌套属性区别于普通属性，不可通过hasChanged、changedAttrbutes等方法获取改变，
 *    只能通过相关委托事件(_onAttrEvent方法里)进行监测
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Model"
$Define('CM.Model',
['CM.AbstractDao',
'CM.AbstractEvents',
'CM.DataStore'],
function(AbstractDao,AbstractEvents){
	
	var Model=AbstractEvents.derive({
		//可扩展属性
//      fields                : {},                  
		/**
		 * 属性声明列表，一般是需要额外处理的定制属性，基本类型的属性不需要在此声明，{
	     *	普通形式：
	     *	{string}name:{
		 *	    {string|Class=}type:类型，可以是字符串(string/number/Date/Model/Collection),也可以是类,
		 *		{object=}options:新建模型/集合实例时的选项,
		 *		{*=}def:默认值,
		 *   	{Function=}parse:设置该属性时自定义解析操作,
		 *   	{Array=}depends:依赖的属性，计算属性需要此配置检查和计算
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
//		dao                   : null,                //数据访问对象，默认为common.AbstractDao
        
        //系统属性
//      fetching              : false,               //是否正在抓取数据，model.get('fetching')==true表示正在抓取
		$isModel              : true,                //模型标记
		
        //内部属性
//      lastSyncTime          : null,                //上次同步时间
//		_changing             : false,               //是否正在改变，但未保存
		_pending              : false,               //
//		_previousAttributes   : {},                  //较早的值
//		_attributes           : {},                  //属性对象
//    	_changed              : {},                  //改变了的值
//	    validationError       : {},                  //校验错误的值
        
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
   		_doDepends            : _fDoDepends,         //处理计算/依赖属性
   		_parseFields          : _fParseFields,       //属性预处理
   		_onAttrEvent          : _fOnAttrEvent,       //处理属性模型和集合事件
		
		initialize            : fInitialize,         //类初始化
//		init                  : $H.noop,             //自定义初始工作
		getDefaults           : fGetDefaults,        //获取默认值
		toJSON                : fToJSON,             //返回对象数据副本
		sync                  : fSync,               //同步数据，可以通过重写进行自定义
   		get                   : fGet,                //获取指定属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
   		each                  : fEach,               //遍历字段
   		hasChanged            : fHasChanged,         //判断自上次change事件后有没有修改，可以指定属性
   		changedAttrbutes      : fChangedAttributes,  //返回改变过的属性，可以指定需要判断的属性
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
		get                   : fStaticGet           //静态get方法，为了保证模型的一致性，新建模型实例必须使用此方法，而不能用new方式
	});
	
	/**
	 * 静态get方法，为了保证模型的一致性，新建模型实例必须使用此方法，而不能用new方式
	 * @method get
	 * @param {object}oVal
	 * @param {object=}oOptions new模型实例时的选项
	 * @param {object=}oChange 如果传入object，返回时，oChange.changed表示此次操作改变了原模型的值或者新建了模型实例
	 * @return {Model} 返回模型实例
	 */
	function fStaticGet(oVal,oOptions,oChange){
		if(!oVal){
			return;
		}
		var _Class=this;
		var oModel;
		var sIdName=_Class.prototype['idAttribute'];
		var id;
		//是否改变了原有模型，new操作也表示改变了
		var bHasChange=false;
		//如果有id，需要先查找是否有存在的模型，查询直接id效率高，所以先进行查询，查询不到id才通过new后，查询联合id
		if(id=oVal[sIdName]){
	        oModel=$S.get(_Class,id);
        }
        if(!oModel){
	        //因为可能存在自定义联合主键，所以这里没有现存的模型而新建一个实例时，要把val传入，以便获取正确的主键
	        var oModel=new _Class(oVal,oOptions),tmp;
	        //放入数据仓库
			if(!(tmp=$S.get(oModel,oModel.id))){
				bHasChange=true;
				$S.push(oModel);
			}else{
				//已存在的对应的模型，设置新值
				bHasChange=tmp.set(oVal).changed;
				oModel=tmp;
			}
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
        oAttrs = $H.extend({}, me._attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, $H.extend(oOptions, {validationError: error}));
        return false;
    }
    /**
     * 处理计算/依赖属性
     * @param {object}oChanges 当前操作改变的属性
     * @param {boolean}bSilent 是否不触发事件
     */
    function _fDoDepends(oChanges,bSilent){
    	var me=this;
    	//处理计算属性
	    var oFields=me.fields,oField,aDeps,oSets={},bNeed;
	    for(var key in oFields){
	    	var oField=oFields[key];
			if(oField&&(aDeps=oField.depends)){
				for(var i=0;i<aDeps.length;i++){
			    	//当依赖属性变化时，设置计算属性
					if(oChanges.hasOwnProperty(aDeps[i])){
						oSets[key]=undefined;
						bNeed=true;
						break;
					}
				}
			}
	    }
	    bNeed&&me.set(oSets,null,{silent:bSilent});
    }
    /**
     * 属性预处理
     * @param {Object}oAttrs 属性表
     * @return {Object} 返回处理好的属性表
     */
    function _fParseFields(oAttrs){
    	var me=this;
    	var oFields;
    	if(!(oFields=me.fields)){
    		return oAttrs;
    	}
    	var oField,fParse,val,aDeps,type,oOptions;
    	var oResult={};
		for(var key in oAttrs){
			val=oAttrs[key];
			if(oField=oFields[key]){
				type=oField.type;
				oOptions=oField.options;
				//自定义解析
				if(fParse=oField.parse){
					val=fParse.apply(me,[val,oAttrs]);
				}
				//自定义类型，包括Model和Collection
				if($H.isStr(type)){
					if(type=='Date'){
						val=$H.parseDate(val);
					}else if(type.indexOf('.')>0){
						type=$H.ns(type);
					}
				}
				if($H.isClass(type)&&!(val instanceof type)){
					//模型
					if(type.get){
						var oChange={};
				        val=type.get(val,oOptions,oChange);
				        val&&(val._changedTmp=oChange.changed);
					}else{
						//集合
						var oCurrent=me.get(key);
						if(oCurrent){
							var tmp=oCurrent.set(val);
							val=oCurrent;
							val._changedTmp=tmp.changed;
							
						}else{
							val=new type(val,oOptions);
							val._changedTmp=true;
						}
					}
				}
			}
			oResult[key]=val;
		}
		return oResult;
    }
    /**
	 * 处理属性模型和集合事件
	 * @param {string}sAttr 属性名
	 * @param {string}sEvent 事件名称
	 * @param {Model|Collection}obj 对象
	 */
    function _fOnAttrEvent(sAttr,sEvent, oModel,oCollection) {
    	if(sEvent=='invalid'||sEvent=='sync'||sEvent=='request'||sEvent.indexOf('change:')==0){
    		return;
    	}
    	//模型被添加事件无需处理，如果是集合add事件，oCollection是集合对象
    	if(sEvent=='add'&&!$H.isInstance(oCollection)){
    		return;
    	}
    	var me=this;
    	var oVal=me.get(sAttr);
    	var args=$H.toArray(arguments,1);
    	me.trigger.apply(me,['change:'+sAttr,me,oVal].concat(args));
    	me.trigger.apply(me,['change',me].concat(args));
    	//me.trigger.apply(me, arguments);
    	//标记已触发对应属性change事件，通知set方法不必再触发
    	me._attrEvts[sAttr]=1;
    	var oChange={};
    	oChange[sAttr]=oVal;
    	me._doDepends(oChange);
    }
	/**
	 * 初始化
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
		me.callSuper();
		me.uuid=$H.uuid();
		//配置dao对象
		me.dao=me.dao||$H.getSingleton(AbstractDao);
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = $H.Util.uuid();
		me._attributes = {};
		me._attrEvts={};
		if (oOptions.collection){
			me.collection = oOptions.collection;
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		oAttrs = $H.extendIf(oAttrs, me.getDefaults());
		if(me.init){
			me.init();
		}
		me.set(oAttrs, oOptions);
		me._changed = {};
	}
	/**
	 * 获取默认值
	 * @return 返回默认值
	 */
	function fGetDefaults(){
		var me=this;
		var oDefaults={},oFields;
		if(oFields=me.fields){
			for(var k in oFields){
				var field=oFields[k];
				oDefaults[k]=(field&&$H.isObj(field))?field.def:field;
			}
		}
		return oDefaults;
	}
	/**
	 * 返回对象数据副本
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return $H.clone(this._attributes);
    }
	/**
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {CM.Model}oModel 模型对象
	 * @param {Object}oOptions 设置
	 * @return {*} 根据同步方法的结果
	 */
    function fSync(sMethod,oModel,oOptions) {
    	var me=this;
    	me.lastSyncTime=$H.now();
        return me.dao.sync(sMethod,oModel,oOptions);
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
	 * 获取html编码过的属性值
	 * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性编码后的值
	 */
    function fEscape(sAttr) {
        return $H.String.escapeHTML(this.get(sAttr));
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
	 * 		{boolean=}unset 是否清除设置
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 * @return {object}{
	 * 		{boolean}changed : true表示此次设置改变了模型，false表示未改变
	 * 		{boolean=}invalid : 仅当true时表示未通过校验
	 * 		{Model}result:模型对象自身
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
	    //属性预处理
	    oAttrs= me._parseFields(oAttrs);
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	oResult.invalid=true;
	    	return oResult;
	    }
	
	    var bUnset= oOptions.unset;
	    var bSilent= oOptions.silent;
	    var oChanges={};
	    var bChanging= me._changing;
	    me._changing  = true;
	
	    //开始改变前，先存储初始值
	    if (!bChanging) {
	        me._previousAttributes = $H.Object.clone(me._attributes);
	    	me._changed = {};
	    }
	    var oCurrent = me._attributes, 
	    	oPrev = me._previousAttributes;
	
	    //id特殊处理
	    if (me.idAttribute in oAttrs){
	  	    me.id = oAttrs[me.idAttribute];
	    }
	    
	    //循环进行设置、更新、删除
	    for (var sAttr in oAttrs) {
	   	    val = oAttrs[sAttr];
	    	var curVal=oCurrent[sAttr];
	    	//当前属性是否是嵌套属性
	   	    var bCurNested=curVal&&$H.isInstance(curVal);
	   	    //新值是否是嵌套属性
	   	    var bNewNested=val&&$H.isInstance(val);
	    	//嵌套属性设置，不需要在此触发相关事件，而是通过监听该属性上的事件触发事件，计算属性也是通过事件触发计算
	    	if(bCurNested||bNewNested){
	    		//删除旧值或更换嵌套属性，须移除原来在该属性上的事件
	    		if(bUnset){
	    			delete oCurrent[sAttr];
	    			//如果有旧值，需要清除相关事件
	    			curVal&&me.unlistenTo(curVal,'all');
	    		}else{
					oCurrent[sAttr] = val;
					if(!curVal||curVal.id!=val.id){
						//这里如果传入就是模型，_parseFields方法不进行处理，因此这里标记为已改变
						val._changedTmp=true;
						//如果有旧值，需要清除相关事件
	    				curVal&&me.unlistenTo(curVal,'all');
						//新模型需要监听事件
	    				me.listenTo(val,'all',$H.bind(me._onAttrEvent,me,sAttr));
					}
	    		}
	    		////与当前值不相等，放入本次改变列表中
    			if(bUnset||val._changedTmp){
    				oChanges[sAttr]=val;
    			}
				delete val._changedTmp;
	    	}else{
		   	    //与当前值不相等，放入本次改变列表中
		    	if (!$H.equals(oCurrent[sAttr], val)){
		    		oChanges[sAttr]=val;
		    	}
		    	//与初始值不相等，放入已经改变的hash对象中
		    	if (!$H.equals(oPrev[sAttr], val)) {
		            me._changed[sAttr] = val;
		    	} else {
		    		//跟初始值相等，即没有变化
		        	delete me._changed[sAttr];
		    	}
		    	
		    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    	}
	    }
	    
		var bHasChange=!$H.isEmpty(oChanges);
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (bHasChange){
	        	me._pending = oOptions;
	        }
	        for (var k in oChanges) {
	        	//_onAttrEvent里触发过了的属性事件，这里不需要再触发
	        	if(!me._attrEvts[k]){
		      	    me.trigger('change:' + k, me, oCurrent[k], oOptions);
	        	}
	        }
	    }
	
	    if (bChanging){
	    	//return me;
	    }
	    //触发模型对象change事件
	    if (!bSilent) {
	        while (me._pending) {
	       		oOptions = me._pending;
	            me._pending = false;
	            me.trigger('change', me, oOptions);
	        }
	    }
	    me._pending = false;
	    me._changing = false;
	    //处理依赖属性
	    if(bHasChange){
		    me._doDepends(oChanges,bSilent);
	    }
	    oResult.changed=bHasChange;
	    //重新清空属性事件标记
	    me._attrEvts={};
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
    	$H.each(oAttrs,fCall);
    }
	/**
	 * 判断自上次change事件后有没有修改，可以指定属性
	 * @param {string=}sAttr 参数属性，为空表示判断对象有没有修改
	 * @retur {boolean} true表示有修改
	 */
    function fHasChanged(sAttr) {
    	var oChange=this._changed;
        if (sAttr == null){
        	return !$H.isEmpty(oChange);
        }
        return $H.contains(oChange, sAttr);
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @param {Object=}oDiff 参数属性，表示只判断传入的属性
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttributes(oDiff) {
    	var me=this;
        if (!oDiff){
            return me.hasChanged() ? $H.clone(me._changed) : false;
        }
        var val, changed = false;
        var oOld = me._changing ? me._previousAttributes : me._attributes;
        for (var sAttr in oDiff) {
            if (!$H.equals(oOld[sAttr], (val = oDiff[sAttr]))){
	            (changed || (changed = {}))[sAttr] = val;
            }
        }
        return changed;
    }
	/**
	 * 返回修改前的值，如果没有修改过，则返回null
	 * @param {string}sAttr 指定属性
	 * @return {*} 返回修改前的值，如果没有修改过，则返回null
	 */
    function fPrevious(sAttr) {
    	var me=this;
        if (sAttr == null || !me._previousAttributes){
        	return null;
        }
        return me._previousAttributes[sAttr];
    }
	/**
	 * 返回所有修改前的值
	 * @return {Object} 返回所有修改前的值
	 */
    function fPreviousAttributes() {
        return $H.clone(this._previousAttributes);
    }
	/**
	 * 获取模型数据
	 * @param {Object=}oOptions 备选参数
	 */
    function fFetch(oOptions) {
    	var me=this;
    	me.set('fetching',true);
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (oOptions.parse === void 0) {
        	oOptions.parse = true;
        }
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
        me.sync('read', me, oOptions);
    }
	/**
	 * 保存模型
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object|Function=}oOptions 选项，如果传入的是函数，表示成功回调函数{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * 		{function=}success 成功回调函数
	 * 		{boolean=}update true时执行update操作
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * }
	 */
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, sMethod, oXhr;
        //sKey, value 或者 {sKey: value}
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else {
        	(oAttrs = {})[sKey] = val;
        }

        if($H.isFunc(oOptions)){
        	oOptions={success:oOptions};
        }
        oOptions = $H.extend({validate: true}, oOptions);

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
        var fSuccess = oOptions.success;
        oOptions.success = function(resp) {
	        var oServerAttrs = me.parse(resp, oOptions);
	        //now!=true，确保更新相应数据(可能没有返回相应数据)
	        if (!oOptions.now){
	        	oServerAttrs = $H.extend(oAttrs || {}, oServerAttrs);
	        }
	        //服务器返回的值可能跟现在不一样，还要根据返回值修改
	        if ($H.isObj(oServerAttrs) && me.set(oServerAttrs, oOptions).invalid) {
	            return false;
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        me.trigger('sync', me, resp, oOptions);
	    };

	    sMethod = me.isNew() ? 'create' : (oOptions.update ? 'update':'patch' );
    	//patch只提交所有改变的值
	    var oSaveAttrs;
	    if (sMethod === 'patch'){
	    	var oChanged=me.changedAttrbutes(oAttrs);
	    	//没有改变的属性，直接执行回调函数
	    	if(!oChanged){
	    		if (fSuccess){
		        	fSuccess(me, oOptions);
		        }
		        return;
	    	}
	    	oSaveAttrs = oChanged;
	    }else{
	    	//提交所有属性值
	    	var oCurrent=$H.extend({},me._attributes);
	    	oSaveAttrs = $H.extend(oCurrent,oAttrs);
	    }
	    //过滤掉嵌套集合和模型
	    for(var key in oSaveAttrs){
	    	if($H.isInstance(oSaveAttrs[key])){
	    		delete oSaveAttrs[key];
	    	}
	    }
	    oOptions.attrs=oSaveAttrs;
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
        oOptions = oOptions ? $H.clone(oOptions) : {};
        var fSuccess = oOptions.success;

        var destroy = function() {
            me.trigger('destroy', me, me.collection, oOptions);
            me.off('all');
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
        var sUrl =$H.result(me, 'url') ||$H.result(me.collection, 'url');
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
        return this._validate({}, $H.extend(oOptions || {}, { validate: true }));
    }
	
	return Model;
	
});