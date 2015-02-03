/**
 * 集合类，封装模型集合，可监听事件：invalid、add、remove、sync、sort、sortItem、reset及模型的事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.data.Collection"
define('D.Collection',
[
'B.Object',
'B.Array',
'B.Function',
'D.AbstractData',
'D.Model',
'D.DataStore'
],
function(Obj,Arr,Function,AbstractData,Model){
	
	var Collection=AbstractData.derive({
		//可扩展属性
//		url                    : '',                  //集合url
		model                  : Model,               //子对象模型类
//		comparator             : '',                  //比较属性名或比较函数
//		desc                   : false,               //是否降序
		
//      fetching               : false,                //是否正在抓取数据，collection.fetching==true表示正在抓取
		//内部属性
//		_models                : [],                  //模型列表
//		_byId                  : {},                  //根据id和cid索引
//		length                 : 0,                   //集合长度
		$isCollection          : true,                //集合标记
		
		_getIterator           : _fGetIterator,       //获取迭代函数
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
		each                   : fEach,               //遍历集合
		eachDesc               : fEachDesc,           //降序遍历集合
		reset                  : fReset,              //重置模型，此方法不会触发add、remove等事件，只会触发reset事件
		push                   : fPush,               //添加到集合最后
		pop                    : fPop,                //取出集合最后一个模型
		unshift                : fUnshift,            //添加到集合最前面
		shift                  : fShift,              //取出集合第一个模型
		slice                  : fSlice,              //返回选定的元素的数组，同"Array.slice"
		get                    : fGet,                //通过id或cid获取模型
		size                   : fSize,               //获取集合元素个数
		at                     : fAt,                 //获取指定位置的模型
		where                  : fWhere,              //返回包含指定 key-value 组合的模型的数组
		findWhere              : fFindWhere,          //返回包含指定 key-value 组合的第一个模型
		sort                   : fSort,               //排序
		sortItem               : fSortItem,           //对指定模型进行排序
		pluck                  : fPluck,              //提取集合里指定的属性值
		getUrl                 : fGetUrl,             //获取集合url
		fetch                  : fFetch,              //请求数据
		create                 : fCreate,             //新建模型
		parse                  : fParse,              //分析处理回调数据，默认直接返回response
		clone                  : fClone               //克隆
		
	});
	
	//从base.Array生成方法
	Obj.each([
		'map','some','every','find','filter','invoke','indexOf'
	], function(i,sMethod) {
	    Collection.prototype[sMethod] = function() {
	      var aArgs = Array.prototype.slice.call(arguments);
	      aArgs.unshift(this._models);
	      return Arr[sMethod].apply(Arr, aArgs);
	    };
	});
	
    Collection.prototype['sortedIndex'] = function(value, context,bDesc) {
        var iterator = this._getIterator(this.comparator);
        bDesc=this.desc||bDesc;
        return Arr['sortedIndex'](this._models, value,iterator, context,bDesc);
    };
	
	Obj.each(['sortBy','groupBy','countBy'], function(i,sMethod) {
	    Collection.prototype[sMethod] = function(value, context,bDesc) {
	        var iterator = this._getIterator(value);
	        bDesc=this.desc||bDesc;
	        return Arr[sMethod](this._models, iterator, context,bDesc);
        };
    });
	
    /**
	 * 获取迭代函数
	 * @param {Function|string=}value 为字符串时返回获取该属性的迭代函数，如果是函数则返回自身
	 * @return {Function} 返回迭代函数
	 */
	function _fGetIterator(value) {
	    if (Obj.isFunc(value)){
	    	return value;
	    }
	    return function(oModel) {
		           return oModel.get(value);
		       };
	}
	/**
	 * 重置集合
	 */
    function _fReset() {
    	var me=this;
        me.length = 0;
        me._models = [];
        me._byId  = {};
    }

    /**
     * 初始化模型
     * @param {Object}oAttrs key-value组合
     * @param {Object}oOptions 选项，同Model初始化选项
     * @param {object=}oChange 如果传入object，返回时，oChange.changed表示此次操作改变了原模型的值或者新建了模型实例
     * @return {Model|boolean} 返回初始化的模型，如果初始化失败，则返回false
     */
    function _fPrepareModel(oAttrs, oOptions,oChange) {
    	var me=this;
        if (oAttrs instanceof Model){
        	return oAttrs;
        }
        oOptions = oOptions ? Obj.clone(oOptions) : {};
        var oModel = me.model.get(oAttrs, oOptions,oChange);
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
        me.listenTo(oModel,'all', me._onModelEvent, me);
    }
    /**
     * 移除模型和集合关联关系
     * @param {Model}oModel 模型对象
     */
    function _fRemoveReference(oModel) {
    	var me=this;
        me.unlistenTo(oModel,'all', me._onModelEvent);
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
    	//add和remove事件需要校验是不是为当前集合出发的，一个模型可能会被多个集合所有
        if ((sEvent === 'add' || sEvent === 'remove') && oCollection !== me){
        	return;
        }
        if (sEvent === 'destroy'){
        	me.remove(oModel, oOptions);
        }
        //id特殊处理
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
	 * 		{object=}custom 自定义配置
	 * }
	 */
	function fInitialize(aModels, oOptions) {
		var me=this;
		me.callSuper();
	    oOptions || (oOptions = {});
	    if (oOptions.model) {
	    	me.model = oOptions.model;
	    }
	    if(oOptions.custom){
			Obj.extend(me,oOptions.custom);
		}
	    me._reset();
	    if (aModels){
	    	me.reset(aModels, Obj.extend({silent: true}, oOptions));
	    }
	    //如果比较器是属性名，监听相应的事件进行必要的排序
	    var comparator=me.comparator;
	    if(Obj.isStr(comparator)){
    		me.on('change:'+comparator,function(sEvt,oModel,sTime){
    			me.sortItem(oModel);
    		});
	    }
	}
	/**
	 * 返回json格式数据(模型数据的数组)
	 * @param {Object=}oOptions 选项(同set方法)
	 * @return {Array} 模型数据数组
	 */
    function fToJSON(oOptions) {
    	var me=this;
        return Arr.map(me._models,function(oModel){
        	return oModel.toJSON(oOptions); 
        });
    }
	/**
	 * 添加模型
	 * @param 同"set"方法
	 * @return {Model}返回被添加的模型，如果是数组，返回第一个元素
	 */
    function fAdd(models, oOptions) {
    	oOptions=Obj.extend({
    		add:true,
    		remove:false,
    		merge:false
    	},oOptions);
        return this.set(models,oOptions).result;
    }
    /**
     * 移除模型
     * @param 同"set"方法
     * @return {Model}返回被移除的模型，如果是数组，返回第一个元素
     */
    function fRemove(models, oOptions) {
    	var me=this;
        var bSingular = !Obj.isArr(models);
        models = bSingular ? [models] : models;
        oOptions || (oOptions = {});
        var i, l, index, oModel;
        var aResult=[];
        for (i = 0, l = models.length; i < l; i++) {
        	oModel=models[i];
        	oModel = aResult[i] =Obj.isObj(oModel)&&!oModel.$isModel?me.findWhere(oModel): me.get(oModel);
        	if (!oModel){
        		continue;
        	}
        	delete me._byId[oModel.id];
        	delete me._byId[oModel.cid];
        	index = me.indexOf(oModel);
        	me._models.splice(index, 1);
        	me.length--;
        	if (!oOptions.silent) {
          		oOptions.index = index;
          		oModel.trigger('remove', oModel, me, oOptions);
        	}
        	me._removeReference(oModel, oOptions);
        }
        return bSingular ? aResult[0] : aResult;
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
	 * @return {object}{
	 * 		{boolean}changed : true表示此次设置改变了模型，false表示未改变
	 * 		{Collection}result: 集合自身
	 * }
	 */
    function fSet(models, oOptions) {
    	var me=this;
    	if(!models){
    		return {result:me};
    	}
    	oOptions = Obj.extend({
    		add: true,
    		remove: false,
    		merge: true
    	},oOptions);
    	if(models instanceof Collection){
    		models=models._models;
    	}
        if (oOptions.parse){
        	models = me.parse(models, oOptions);
        }
        var bSingular = !Obj.isArr(models);
        var aModels = bSingular ? (models ? [models] : []) : Obj.clone(models);
        var aCurModels=me._models;
        var i, l, id, oModel, oAttrs, oExisting;
        var at = oOptions.at;
        var cTargetModel = me.model;
        //是否可排序
        var bSortable = me.comparator && (at == null) && oOptions.sort !== false;
        //是否添加
        var bAdd = oOptions.add, 
        //是否合并
        bMerge = oOptions.merge,
        //是否移除
        bRemove = oOptions.remove,
        //记录是否发生了改变
        bHasChange=false;

        //循环设置模型
        for (i = 0, l = aModels.length; i < l; i++) {
        	oAttrs = aModels[i] || {};
        	if (oAttrs instanceof Model) {
          		id = oModel = oAttrs;
        	} else {
         		id = cTargetModel.getId(oAttrs);
        	}

        	//如果已经存在对应id的模型
        	if (oExisting = me.get(id)) {
        		//移除
            	if (bRemove){
            		me.remove(oExisting, oOptions);
            		bHasChange=true;
            	}
            	//合并
          		if (bMerge) {
           			oAttrs = oAttrs === oModel ? oModel.attributes : oAttrs;
                	if (oOptions.parse){
                		oAttrs = oExisting.parse(oAttrs, oOptions);
                	}
		        	var _changed=oExisting.set(oAttrs, oOptions).changed;
            		bHasChange=bHasChange||_changed;
          		}
         		aModels[i] = oExisting;

        	} else if (bAdd) {
        		oOptions.id=id;
         		//添加	
            	oModel = aModels[i] = me._prepareModel(oAttrs, oOptions);
            	if (!oModel){
            		continue;
            	}
            	me._addReference(oModel, oOptions);
            	if(bSortable){
	       			//获取排序位置
	       			at=me.sortedIndex(oModel);
	       		}
            	//指定位置上添加
	        	if (at != null) {
	            	aCurModels.splice(at, 0, oModel);
	       		}else{
	       			aCurModels.push(oModel);
	       		}
            	me.length +=1;
	       		//触发相应事件
       			if (!oOptions.silent) {
            		oModel.trigger('add', oModel, me, oOptions,at);
       			}
       			bHasChange=true;
        	}

        }

        return {
        	changed:bHasChange,
        	result:me
        };
    }
    /**
     * 遍历集合
     * @param {function}fCall(nIndex,oModel) 回调函数
     */
    function fEach(fCall){
    	Obj.each(this._models,fCall);
    }
    /**
     * 降序遍历集合
     * @param {function}fCall(nIndex,oModel) 回调函数
     */
    function fEachDesc(fCall){
    	var aModels=this._models;
    	for(var i=aModels.length-1;i>=0;i--){
    		fCall(i,aModels[i]);
    	}
    }
	/**
	 * 重置模型，此方法不会触发add、remove等事件，只会触发reset事件
	 * @param 同"set"方法
	 * @return {Model} 返回重置的模型
	 */
    function fReset(models, oOptions) {
    	var me=this;
        oOptions || (oOptions = {});
        for (var i = 0, l = me._models.length; i < l; i++) {
        	me._removeReference(me._models[i], oOptions);
        }
        oOptions.previousModels = me._models;
        me._reset();
        if(models){
	        models = me.add(models, Obj.extend({silent: true}, oOptions)).result;
        }
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
        return me.add(oModel, Obj.extend({at: me.length}, oOptions)).result;
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
        return this.add(oModel, Obj.extend({at: 0}, oOptions)).result;
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
      return Array.prototype.slice.apply(this._models, arguments);
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
     * 获取集合元素个数
     * @return {number} 返回元素个数
     */
    function fSize(){
    	return this.length;
    }
	/**
	 * 获取指定位置的模型
	 * @param {number}nIndex 参数索引
	 * @return {Model} 返回该模型
	 */
    function fAt(nIndex) {
        return this._models[nIndex];
    }
	/**
	 * 返回包含指定 key-value 组合的模型的数组
	 * @param {Object}oAttrs key-value 组合
	 * @param {boolean}bFirst 是否只返回第一个模型
	 * @return {Array|Model|undefined} 返回匹配对象的数组，如果没有，则返回空数组，如果bFirst==true，返回第一个匹配的模型
	 */
    function fWhere(oAttrs, bFirst) {
    	var me=this;
        if (Obj.isEmpty(oAttrs)){
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
        	$D.error(new Error('没有比较器'));
        }
        oOptions || (oOptions = {});

        if (typeof me.comparator=='string' || me.comparator.length === 1) {
        	me._models = me.sortBy(me.comparator, me,oOptions.desc);
        } else {
       		me._models.sort(Function.bind(me.comparator, me));
        }

        if (!oOptions.silent){
        	me.trigger('sort', me, oOptions);
        }
        return me;
    }
    /**
     * 对指定模型进行排序
     * @param {Model}oModel 参数模型
     * @param {number=}nIndex 要排到的索引，如不传，则自动根据sortedIndex方法进行计算
     */
    function fSortItem(oModel,nIndex){
    	var me=this;
    	if(nIndex===undefined){
    		nIndex=me.sortedIndex(oModel);
    	}
    	var nCurIndex=me.indexOf(oModel);
    	var aModels=me._models;
    	aModels.splice(nCurIndex,1);
    	aModels.splice(nIndex,0,oModel);
    	me.trigger('sortItem',oModel,nIndex,nCurIndex,me);
    }
    /**
     * 提取集合里指定的属性值
	 *  @param {string}sAttr 参数属性
	 *  @return {Array} 返回集合对应属性的数组
     */
    function fPluck(sAttr) {
      return Arr.invoke(this._models, 'get', sAttr);
    }
    /**
     * 获取url
     * @return {string}返回集合的url
     */
    function fGetUrl(){
    	return this.url;
    }
	/**
	 * 请求数据
	 * @param {Object=}oOptions{
	 * 		{function=}beforeSet 设置前操作，返回false则不进行后续设置
	 * 		{function=}success 设置成功回调
	 * 		{boolean=}reset true表示使用reset方法设置
	 * }
	 * @return {*} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? Obj.clone(oOptions) : {};
        var fSuccess = oOptions.success;
        var fBeforeSet = oOptions.beforeSet;
        oOptions.saved=true;
        oOptions.success = function(resp) {
        	me.fetching=false;
        	var oData=me.parse(resp, oOptions);
        	if (fBeforeSet){
        		if(fBeforeSet(me, oData, oOptions)==false){
        			return;
        		}
        	}
        	var method = oOptions.reset ? 'reset' : oOptions.add?'add':'set';
        	me[method](oData, oOptions);
        	if (fSuccess){
        		fSuccess(me, oData, oOptions);
        	}
        	me.trigger('sync', me, oData, oOptions);
        };
    	me.fetching=true;
        return me.sync('read', me, oOptions);
    }
	/**
	 * 新建模型
	 * @param {C.Model|Object}oModel 模型对象或者模型属性集
	 * @param {Object=}oOptions 选项
	 * @return {C.Model} 返回新建的模型
	 */
    // Create a new instance of a model in me collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    function fCreate(oModel, oOptions) {
    	var me=this;
        oOptions = oOptions ? Obj.clone(oOptions) : {};
        if (!(oModel = me._prepareModel(oModel, oOptions))){
        	return false;
        }
        if (oOptions.now){
        	me.add(oModel, oOptions);
        }
        var success = oOptions.success;
        oOptions.success = function(oModel, resp) {
        	if (!oOptions.now){
        		me.add(oModel, oOptions);
        	}
        	if (success){
        		success(oModel, resp, oOptions);
        	}
        };
        oModel.save(null, oOptions);
        return oModel;
    }
	/**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions){
        if(resp.code){
	        return resp.data;
    	}else{
    		return resp;
    	}
    }
	/**
	 * 克隆
	 * @return {Collection} 返回克隆的集合
	 */
    function fClone() {
    	var me=this;
        return new me.constructor(me._models);
    }
	
	return Collection;
	
});