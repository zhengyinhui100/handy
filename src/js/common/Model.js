/**
 * 模型类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Model"
$Define('CM.Model',
['CM.AbstractDao',
'CM.AbstractEvents'],
function(AbstractDao,AbstractEvents){
	
	var Model=AbstractEvents.derive({
//		_changing             : false,               //是否正在改变
		_pending              : false,               //
//		_previousAttributes   : {},                  //较早的值
//		cid                   : 0,                   //客户id
//		attributes            : {},                  //属性对象
//    	changed               : {},                  //改变了的值
//	    validationError       : {},                  //校验错误的值
        idAttribute           : 'id',                //id默认属性名
//		dao                   : null,                //数据访问对象，默认为common.AbstractDao
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
		
		initialize            : fInitialize,         //初始化
		toJSON                : fToJSON,             //返回对象数据副本
		sync                  : fSync,               //同步数据，可以通过重写进行自定义
   		get                   : fGet,                //获取指定属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
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
	});
	
	var wrapError;
	
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
        oAttrs = $H.extend({}, me.attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, $H.extend(oOptions, {validationError: error}));
        return false;
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
		me.dao=me.dao||$H.getSingleton(AbstractDao);
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = $H.Util.getUuid();
		me.attributes = {};
		if (oOptions.collection){
			me.collection = oOptions.collection;
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		oAttrs = $H.extend(oAttrs, $H.Util.result(me, 'defaults'),{notCover:true});
		me.set(oAttrs, oOptions);
		me.changed = {};
	}
	/**
	 * 返回对象数据副本
	 * @method toJSON
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return $H.clone(this.attributes);
    }
	/**
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {CM.Model}oModel 模型对象
	 * @param {Object}oOptions 设置
	 * @return {*} 根据同步方法的结果
	 */
    function fSync(sMethod,oModel,oOptions) {
        return this.dao.sync(sMethod,oModel,oOptions);
    }
    /**
     * 获取指定属性值
     * @method get
     * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性
     */
    function fGet(sAttr) {
        return this.attributes[sAttr];
    }
	/**
	 * 获取html编码过的属性值
	 * @method escape
	 * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性编码后的值
	 */
    function fEscape(sAttr) {
        return $H.String.escapeHTML(this.get(sAttr));
    }
	/**
	 * 判断是否含有参数属性
	 * @method has
	 * @param {string}sAttr 参数属性
	 * @return {boolean} 指定属性不为空则返回true
	 */
    function fHas(sAttr) {
    	var value=this.get(sAttr);
    	return  value!= null&&value!=undefined;
    }
	/**
	 * 设置值，并触发change事件(如果发生了变化)
	 * @method set
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 */
    function fSet(sKey, val, oOptions) {
    	var me=this;
    	var oAttrs;
	    if (typeof sKey === 'object') {
	    	oAttrs = sKey;
	    	oOptions = val;
	    } else {
	    	(oAttrs = {})[sKey] = val;
	    }
	    oOptions || (oOptions = {});
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	return false;
	    }
	
	    var bUnset= oOptions.unset;
	    var bSilent= oOptions.silent;
	    var aChanges= [];
	    var bChanging= me._changing;
	    me._changing  = true;
	
	    //开始改变前，先存储初始值
	    if (!bChanging) {
	        me._previousAttributes = $H.Object.clone(me.attributes);
	    	me.changed = {};
	    }
	    var oCurrent = me.attributes, 
	    	oPrev = me._previousAttributes;
	
	    //TODO Check for aChanges of `id`.
	    if (me.idAttribute in oAttrs){
	  	    me.id = oAttrs[me.idAttribute];
	    }
	
	    //循环进行设置、更新、删除
	    for (var sAttr in oAttrs) {
	   	    val = oAttrs[sAttr];
	   	    //与当前值不相等，放入改变列表中
	    	if (!$H.equals(oCurrent[sAttr], val)){
	    		aChanges.push(sAttr);
	    	}
	    	//与初始值不相等，放入已经改变的hash对象中
	    	if (!$H.equals(oPrev[sAttr], val)) {
	            me.changed[sAttr] = val;
	    	} else {
	    		//跟初始值相等，即没有变化
	        	delete me.changed[sAttr];
	    	}
	    	//如果取消设置，删除对应属性
	    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    }
	
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (aChanges.length){
	        	me._pending = oOptions;
	        }
	        for (var i = 0, l = aChanges.length; i < l; i++) {
	      	    me.trigger('change:' + aChanges[i], me, oCurrent[aChanges[i]], oOptions);
	        }
	    }
	
	  // You might be wondering why there's a `while` loop here. Changes can
	  // be recursively nested within `"change"` events.
	    if (bChanging){
	    	return me;
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
	    return me;
    }
    /**
     * 移除指定属性
     * @method unset
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
     * @method clear
     * @param {Object=}oOptions 
     */
    function fClear(oOptions) {
    	var me=this;
        var oAttrs = {};
        for (var sKey in me.attributes) {
            oAttrs[sKey] = void 0;
        }
        oOptions=oOptions||{};
    	oOptions.unset=true;
        return me.set(oAttrs,oOptions);
    }
	/**
	 * 判断自上次change事件后有没有修改，可以指定属性
	 * @method hasChanged
	 * @param {string=}sAttr 参数属性，为空表示判断对象有没有修改
	 * @retur {boolean} true表示有修改
	 */
    function fHasChanged(sAttr) {
    	var oChange=this.changed;
        if (sAttr == null){
        	return !$H.isEmpty(oChange);
        }
        return $H.contains(oChange, sAttr);
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @method hasChanged
	 * @param {Object=}oDiff 参数属性，表示只判断传入的属性
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttributes(oDiff) {
    	var me=this;
        if (!oDiff){
            return me.hasChanged() ? $H.clone(me.changed) : false;
        }
        var val, changed = false;
        var oOld = me._changing ? me._previousAttributes : me.attributes;
        for (var sAttr in oDiff) {
            if (!$H.equals(oOld[sAttr], (val = oDiff[sAttr]))){
	            (changed || (changed = {}))[sAttr] = val;
            }
        }
        return changed;
    }
	/**
	 * 返回修改前的值，如果没有修改过，则返回null
	 * @method previous
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
	 * @method previousAttributes
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
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (oOptions.parse === void 0) {
        	oOptions.parse = true;
        }
        var success = oOptions.success;
        oOptions.success = function(resp) {
        	if (!me.set(me.parse(resp, oOptions), oOptions)){
        		return false;
        	}
        	if (success){
        		success(me, resp, oOptions);
        	}
        	me.trigger('sync', me, resp, oOptions);
        };
        wrapError(me, oOptions);
        return me.sync('read', me, oOptions);
    }
	/**
	 * 保存模型
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * 		{boolean=}patch true时只更新改变的值
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * }
	 */
    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, sMethod, oXhr, oAttributes = me.attributes;
        //sKey, value 或者 {sKey: value}
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else {
        	(oAttrs = {})[sKey] = val;
        }

        oOptions = $H.extend({validate: true}, oOptions);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
        //now==true，立刻设置数据
        if (oAttrs && oOptions.now) {
       	    if (!me.set(oAttrs, oOptions)){
       	    	return false;
       	    }
        } else {
        	if (!me._validate(oAttrs, oOptions)){
		        return false;
		    }
        }

        //now!=true,先临时设置数据
        if (oAttrs && !oOptions.now) {
        	var tmp=$H.extend({}, oAttributes)
            me.attributes = $H.extend(tmp, oAttrs);
        }

        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var fSuccess = oOptions.success;
        oOptions.success = function(resp) {
	        // Ensure attributes are restored during synchronous saves.
	        me.attributes = oAttributes;
	        var oServerAttrs = me.parse(resp, oOptions);
	        //now!=true，确保更新相应数据(可能没有返回相应数据)
	        if (!oOptions.now){
	        	oServerAttrs = $H.extend(oAttrs || {}, oServerAttrs);
	        }
	        if ($H.isObject(oServerAttrs) && !me.set(oServerAttrs, oOptions)) {
	            return false;
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        me.trigger('sync', me, resp, oOptions);
	    };

	    sMethod = me.isNew() ? 'create' : (oOptions.patch ? 'patch' : 'update');
	    if (sMethod === 'patch'){
	    	oOptions.attrs = oAttrs;
	    }
	    me.sync(sMethod, me, oOptions);
	
	    //now!=true，恢复数据
	    if (oAttrs && !oOptions.now){
	    	me.attributes = oAttributes;
	    }
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

        var oXhr = me.sync('delete', me, oOptions);
        if (oOptions.now){
        	destroy();
        }
        return oXhr;
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
    	if(resp.code&&resp.data){
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
        return new me.constructor(me.attributes);
    }
	/**
	 * 判断是否是新模型(没有提交保存，并且缺少id属性)
	 * @return {boolean} true表示是新模型
	 */
    function fIsNew() {
    	var me=this;
        return !me.has(me.idAttribute);
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