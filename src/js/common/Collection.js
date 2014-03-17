/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Collection"
$Define('C.Collection',
'C.Model',
function(Model){
	
	var Collection=$HO.createClass();
	
	$HO.extend(Collection.prototype,$H.Events);
	
	$HO.extend(Collection.prototype,{
		
//		model                  : Model,               //子对象模型类
//		models                 : [],                  //模型列表
//		_byId                  : {},                  //根据id和cid索引
//		length                 : 0,                   //模型集合长度
		
		_reset                 : _fReset,             //重置集合
		_prepareModel          : _fPrepareModel,      //初始化模型
		_addReference          : _fAddReference,      //关联模型和集合
		_removeReference       : _fRemoveReference,   //移除模型和集合关联关系
		_onModelEvent          : _fOnModelEvent,      //模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
		
		initialize             : fInitialize,         //初始化
		toJSON                 : fToJSON,             //返回json格式数据(模型数据的数组)
		add                    : fAdd,                //添加模型
		remove                 : fRemove,             //移除模型
		set                    : fSet,                //设置模型
		reset                  : fReset,              //重置模型，此方法不会触发add、remove等事件，只会触发reset事件
		push                   : fPush,               //添加到集合最后
		pop                    : fPop,                //取出集合最后一个模型
		unshift                : fUnshift,            //添加到集合最前面
		shift                  : fShift,              //取出集合第一个模型
		slice                  : fSlice,              //返回选定的元素的数组，同"Array.slice"
		get                    : fGet,                //通过id或cid获取模型
		at                     : fAt,                 //获取指定位置的模型
		where                  : fWhere,              //返回包含指定 key-value 组合的模型的数组
		findWhere              : fFindWhere,          //返回包含指定 key-value 组合的第一个模型
		sort                   : fSort,               //排序
		pluck                  : fPluck,              //提取集合里指定的属性值
		parse                  : fParse,              //分析处理回调数据，默认直接返回response
		clone                  : fClone               //克隆
		
	});
	
	var wrapError;
	
	//从base.Collection生成方法
	$HO.each([
		'some','every','find','filter','invoke'
	], function(sMethod) {
	    Collection.prototype[sMethod] = function() {
	      var aArgs = Array.prototype.slice.call(arguments);
	      var HC=$H.Collection;
	      aArgs.unshift(this.models);
	      return HC[sMethod].apply(HC, aArgs);
	    };
	});
	
	/**
	 * 重置集合
	 */
    function _fReset() {
    	var me=this;
        me.length = 0;
        me.models = [];
        me._byId  = {};
    }

    /**
     * 初始化模型
     * @param {Object}oAttrs key-value组合
     * @param {Object}oOptions 选项，同Model初始化选项
     * @return {Model|boolean} 返回初始化的模型，如果初始化失败，则返回false
     */
    function _fPrepareModel(oAttrs, oOptions) {
    	var me=this;
        if (oAttrs instanceof Model){
        	return oAttrs;
        }
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        oOptions.collection = me;
        var oModel = new me.model(oAttrs, oOptions);
        if (!oModel.validationError){
        	return oModel;
        }
        me.trigger('invalid', me, oModel.validationError, oOptions);
        return false;
    }
	/**
	 * 关联模型和集合
	 * @param {Model}oModel 模型对象
	 */
    function _fAddReference(oModel) {
    	var me=this;
        me._byId[oModel.cid] = oModel;
        if (oModel.id != null){
        	me._byId[oModel.id] = oModel;
        }
        if (!oModel.collection){
        	oModel.collection = me;
        }
        oModel.on('all', me._onModelEvent, me);
    }
    /**
     * 移除模型和集合关联关系
     * @param {Model}oModel 模型对象
     */
    function _fRemoveReference(oModel) {
    	var me=this;
        if (me === oModel.collection){
        	delete oModel.collection;
        }
        oModel.off('all', me._onModelEvent, me);
    }
	/**
	 * 模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
	 * @param {string}sEvent 事件名称
	 * @param {Model}oModel 模型对象
	 * @param {Collection}oCollection
	 * @param {Object}oOptions 同remove方法的选项
	 */
    function _fOnModelEvent(sEvent, oModel, oCollection, oOptions) {
    	var me=this;
        if ((sEvent === 'add' || sEvent === 'remove') && oCollection !== me){
        	return;
        }
        if (sEvent === 'destroy'){
        	me.remove(oModel, oOptions);
        }
        if (oModel && sEvent === 'change:' + oModel.idAttribute) {
            delete me._byId[oModel.previous(oModel.idAttribute)];
            if (oModel.id != null){
            	me._byId[oModel.id] = oModel;
            }
        }
        me.trigger.apply(me, arguments);
    }
	/**
	 * 初始化
	 * @param {Array=}aModels 模型数组
	 * @param {Object=}oOptions 选项{
	 * 		{Model=}model 模型类
	 * 		{function=}comparator 比较函数
	 * }
	 */
	function fInitialize(aModels, oOptions) {
		var me=this;
	    oOptions || (oOptions = {});
	    if (oOptions.model) {
	    	me.model = oOptions.model;
	    }
	    if (oOptions.comparator !== void 0) {
	    	me.comparator = oOptions.comparator;
	    }
	    me._reset();
	    me.initialize.apply(me, arguments);
	    if (aModels){
	    	me.reset(aModels, $HO.extend({silent: true}, oOptions));
	    }
	}
	/**
	 * 返回json格式数据(模型数据的数组)
	 * @param {Object=}oOptions 选项(同set方法)
	 * @return {Array} 模型数据数组
	 */
    function fToJSON(oOptions) {
        return $H.Collection.map(this,function(oModel){
        	return oModel.toJSON(oOptions); 
        });
    }

//    // Proxy `Backbone.sync` by default.
//    sync: function() {
//      return Backbone.sync.apply(me, arguments);
//    },
	/**
	 * 添加模型
	 * @param 同"set"方法
	 * @return {Model}返回被添加的模型，如果是数组，返回第一个元素
	 */
    function fAdd(models, oOptions) {
    	$HO.extend(oOptions,{
    		add:true,
    		remove:false,
    		merge:false
    	});
        return this.set(models,oOptions);
    }
    /**
     * 移除模型
     * @param 同"set"方法
     * @return {Model}返回被移除的模型，如果是数组，返回第一个元素
     */
    function fRemove(models, oOptions) {
    	var me=this;
        var bSingular = !$HO.isArray(models);
        models = bSingular ? [models] : $HO.clone(models);
        oOptions || (oOptions = {});
        var i, l, index, oModel;
        for (i = 0, l = models.length; i < l; i++) {
        	oModel = models[i] = me.get(models[i]);
        	if (!oModel){
        		continue;
        	}
        	delete me._byId[oModel.id];
        	delete me._byId[oModel.cid];
        	index = me.indexOf(oModel);
        	me.models.splice(index, 1);
        	me.length--;
        	if (!oOptions.silent) {
          		oOptions.index = index;
          		oModel.trigger('remove', oModel, me, oOptions);
        	}
        	me._removeReference(oModel, oOptions);
        }
        return bSingular ? models[0] : models;
    }
	/**
	 * 设置模型
	 * @param {Object|Model|Array}models 模型属性对象或模型对象或数组
	 * @param {Object}oOptions 选型{
	 * 		{boolean=}add : 是否是添加
	 * 		{boolean=}merge : 是否是合并
	 * 		{boolean=}remove : 是否删除
	 * 		{boolean=}sort : 是否排序
	 * 		{number=}at : 指定添加位置
	 * 		{boolean=}parse : 是否分析处理数据
	 * }
	 * @return {Model}返回被设置的模型，如果是数组，返回第一个元素
	 */
    function fSet(models, oOptions) {
    	var me=this;
    	oOptions = $H.Util.extend(oOptions, {
    		add: true,
    		remove: true,
    		merge: true
    	});
        if (oOptions.parse){
        	models = me.parse(models, oOptions);
        }
        var bSingular = !$HO.isArray(models);
        var aModels = bSingular ? (models ? [models] : []) : $HO.clone(models);
        var i, l, id, oModel, oAttrs, oExisting, sort;
        var at = oOptions.at;
        var cTargetModel = me.model;
        //是否可排序
        var bSortable = me.comparator && (at == null) && oOptions.sort !== false;
        var sortAttr = typeof me.comparator=="string" ? me.comparator : null;
        var aToAdd = [], aToRemove = [], oModelMap = {};
        //是否添加
        var bAdd = oOptions.add, 
        //是否合并
        bMerge = oOptions.merge,
        //是否移除
        bRemove = oOptions.remove;
        var order = !bSortable && bAdd && bRemove ? [] : false;

        //循环设置模型
        for (i = 0, l = aModels.length; i < l; i++) {
        	oAttrs = aModels[i] || {};
        	if (oAttrs instanceof Model) {
          		id = oModel = oAttrs;
        	} else {
         		id = oAttrs[cTargetModel.prototype.idAttribute || 'id'];
        	}

        	//如果已经存在对应id的模型
        	if (oExisting = me.get(id)) {
        		//移除
            	if (bRemove){
            		oModelMap[oExisting.cid] = true;
            	}
            	//合并
          		if (bMerge) {
           			oAttrs = oAttrs === oModel ? oModel.attributes : oAttrs;
                	if (oOptions.parse){
                		oAttrs = oExisting.parse(oAttrs, oOptions);
                	}
            		oExisting.set(oAttrs, oOptions);
            		//
            		if (bSortable && !sort && oExisting.hasChanged(sortAttr)){
            			sort = true;
            		}
          		}
         		aModels[i] = oExisting;

        	} else if (bAdd) {
         		//添加	
            	oModel = aModels[i] = me._prepareModel(oAttrs, oOptions);
            	if (!oModel){
            		continue;
            	}
            	aToAdd.push(oModel);
            	me._addReference(oModel, oOptions);
        	}

        	oModel = oExisting || oModel;
        	if (order && (oModel.isNew() || !oModelMap[oModel.id])){
        		order.push(oModel);
        	}
        	oModelMap[oModel.id] = true;
        }

        //如果有需要的话，移除相应模型
        if (bRemove) {
        	for (i = 0, l = me.length; i < l; ++i) {
           		if (!oModelMap[(oModel = me.models[i]).cid]){
           			aToRemove.push(oModel);
           		}
        	}
        	if (aToRemove.length){
        		me.remove(aToRemove, oOptions);
        	}
        }

        if (aToAdd.length || (order && order.length)) {
        	if (bSortable){
        		sort = true;
        	}
        	//更新长度
            me.length += aToAdd.length;
            //指定位置上添加
        	if (at != null) {
            	for (i = 0, l = aToAdd.length; i < l; i++) {
            		me.models.splice(at + i, 0, aToAdd[i]);
          		}
       		} else {
          		if (order){
          			me.models.length = 0;
          		}
          		var orderedModels = order || aToAdd;
          		for (i = 0, l = orderedModels.length; i < l; i++) {
            		me.models.push(orderedModels[i]);
          		}
        	}
        }

        //排序
        if (sort){
        	me.sort({silent: true});
        }

        //触发相应事件
        if (!oOptions.silent) {
        	for (i = 0, l = aToAdd.length; i < l; i++) {
            	(oModel = aToAdd[i]).trigger('add', oModel, me, oOptions);
        	}
        	if (sort || (order && order.length)){
        		me.trigger('sort', me, oOptions);
        	}
        }

        //返回被设置的模型，如果是数组，返回第一个元素
        return bSingular ? aModels[0] : aModels;
    }
	/**
	 * 重置模型，此方法不会触发add、remove等事件，只会触发reset事件
	 * @param 同"set"方法
	 * @return {Model} 返回重置的模型
	 */
    function fReset(models, oOptions) {
    	var me=this;
        oOptions || (oOptions = {});
        for (var i = 0, l = me.models.length; i < l; i++) {
        	me._removeReference(me.models[i], oOptions);
        }
        oOptions.previousModels = me.models;
        me._reset();
        models = me.add(models, $HO.extend({silent: true}, oOptions));
        if (!oOptions.silent){
        	me.trigger('reset', me, oOptions);
        }
        return models;
    }
	/**
	 * 添加到集合最后
	 * @param 同"set"方法
	 * @return 返回添加的模型
	 */
    function fPush(oModel, oOptions) {
    	var me=this;
        return me.add(oModel, $HO.extend({at: me.length}, oOptions));
    }
	/**
	 * 取出集合最后一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回取出的模型
	 */
    function fPop(oOptions) {
    	var me=this;
        var oModel = me.at(me.length - 1);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 添加到集合最前面
	 * @param 同"set"方法
	 * @return {Model} 返回添加的模型
	 */
    function fUnshift(oModel, oOptions) {
        return this.add(oModel, $HO.extend({at: 0}, oOptions));
    }
	/**
	 * 取出集合第一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回第一个模型
	 */
    function fShift(oOptions) {
    	var me=this;
        var oModel = me.at(0);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 返回选定的元素的数组，同"Array.slice"
	 * @param {number}nStart 规定从何处开始选取。如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，
	 * 						 -1 指最后一个元素，-2 指倒数第二个元素，以此类推。
	 * @param {number=}nEnd 规定从何处结束选取。该参数是数组片断结束处的数组下标。如果没有指定该参数，
	 * 						那么切分的数组包含从 start 到数组结束的所有元素。如果这个参数是负数，
	 * 						那么它规定的是从数组尾部开始算起的元素。
	 * @return {Array} 选定的元素的数组
	 */
    function fSlice() {
      return Array.prototype.slice.apply(this.models, arguments);
    }
	/**
	 * 通过id或cid获取模型
	 * @param {Object|number|string}obj 可以直接是id或cid，也可以是包含id或cid属性的对象
	 * @return {Model} 返回对应模型
	 */
    function fGet(obj) {
    	var me=this;
        if (obj == null){
      		return void 0;
        }
        return me._byId[obj] || me._byId[obj.id] || me._byId[obj.cid];
    }
	/**
	 * 获取指定位置的模型
	 * @param {number}nIndex 参数索引
	 * @return {Model} 返回该模型
	 */
    function fAt(nIndex) {
        return this.models[nIndex];
    }
	/**
	 * 返回包含指定 key-value 组合的模型的数组
	 * @param {Object}oAttrs key-value 组合
	 * @param {boolean}bFirst 是否只返回第一个模型
	 * @return {Array|Model|undefined} 返回匹配对象的数组，如果没有，则返回空数组，如果bFirst==true，返回第一个匹配的模型
	 */
    function fWhere(oAttrs, bFirst) {
    	var me=this;
        if ($HO.isEmpty(oAttrs)){
        	return bFirst ? void 0 : [];
        }
        return me[bFirst ? 'find' : 'filter'](function(oModel) {
        	for (var key in oAttrs) {
            	if (oAttrs[key] !== oModel.get(key)){
            		return false;
            	}
        	}
        	return true;
        });
    }
	/**
	 * 返回包含指定 key-value 组合的第一个模型
	 * @param {Object}oAttrs key-value 组合
	 * @return {Model|undefined} 返回第一个匹配的模型，没有匹配的模型则返回undefined
	 */
    function fFindWhere(oAttrs) {
        return this.where(oAttrs, true);
    }
	/**
	 * 排序
	 * @param {Object=}oOptions 选项{
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 * @return {Collection} 返回排序后的集合
	 */
    function fSort(oOptions) {
    	var me=this;
        if (!me.comparator){
        	var sMsg='没有比较器';
        	$D.error(sMsg,new Error(sMsg));
        }
        oOptions || (oOptions = {});

        if (typeof me.comparator=='string' || me.comparator.length === 1) {
        	me.models = me.sortBy(me.comparator, me);
        } else {
       		me.models.sort($H.Function.bind(me.comparator, me));
        }

        if (!oOptions.silent){
        	me.trigger('sort', me, oOptions);
        }
        return me;
    }
    /**
     * 提取集合里指定的属性值
	 *  @param {string}sAttr 参数属性
	 *  @return {Array} 返回集合对应属性的数组
     */
    function fPluck(sAttr) {
      return $H.Collection.invoke(this.models, 'get', sAttr);
    }

    // Fetch the default set of models for me collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var success = oOptions.success;
        var collection = me;
        oOptions.success = function(resp) {
        	var method = oOptions.reset ? 'reset' : 'set';
        	collection[method](resp, oOptions);
        	if (success){
        		success(collection, resp, oOptions);
        	}
        	collection.trigger('sync', collection, resp, oOptions);
        };
        wrapError(me, oOptions);
        return me.sync('read', me, oOptions);
    }

    // Create a new instance of a model in me collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    function fCreate(oModel, oOptions) {
    	var me=this;
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        if (!(oModel = me._prepareModel(oModel, oOptions))) return false;
        if (!oOptions.wait) me.add(oModel, oOptions);
        var collection = me;
        var success = oOptions.success;
        oOptions.success = function(oModel, resp) {
        	if (oOptions.wait) collection.add(oModel, oOptions);
        	if (success) success(oModel, resp, oOptions);
        };
        oModel.save(null, oOptions);
        return oModel;
    }
	/**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
        return resp;
    }
	/**
	 * 克隆
	 * @return {Collection} 返回克隆的集合
	 */
    function fClone() {
    	var me=this;
        return new me.constructor(me.models);
    }
	
	return Collection;
	
});