/**
 * 模型类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Model"
$Define('c.Model',
function(){
	
	var Model=$HO.createClass();
	
	$HO.extend(Model.prototype,$H.Events);
	
	$HO.extend(Model.prototype,{
//		_changing             : false,               //是否正在改变
		_pending              : false,               //
//		_previousAttributes   : {},                  //较早的值
//		cid                   : 0,                   //客户id
//		attributes            : {},                  //属性对象
//    	changed               : {},                  //改变了的值
//	    validationError       : {},                  //校验错误的值
        idAttribute           : 'id',                //id默认属性名
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
		
		initialize            : fInitialize,         //初始化
		toJson                : fToJSON,             //返回对象数据副本
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
   		url                   : fUrl,                //获取模型url
   		parse                 : fParse,              //分析处理回调数据，默认直接返回response
   		clone                 : fClone,              //克隆模型
   		isNew                 : fIsNew,              //判断是否是新模型(没有提交保存，并且缺少id属性)
   		isValid               : fIsValid            //校验当前是否是合法的状态
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
        oAttrs = $HO.extend({}, me.attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, $HO.extend(oOptions, {validationError: error}));
        return false;
    }
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
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
		oAttrs = $HO.extend(oAttrs, $H.Util.result(me, 'defaults'),{notCover:true});
		me.set(oAttrs, oOptions);
		me.changed = {};
	}
	/**
	 * 返回对象数据副本
	 * @method toJSON
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return $HO.clone(this.attributes);
    }
	/**
	 * 
	 */
    // Proxy `Backbone.sync` by default -- but override me if you need
    // custom syncing semantics for *me* particular model.
//    sync: function() {
//        return Backbone.sync.apply(me, arguments);
//    },
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
	    	if (!$HO.equals(oCurrent[sAttr], val)){
	    		aChanges.push(sAttr);
	    	}
	    	//与初始值不相等，放入已经改变的hash对象中
	    	if (!$HO.equals(oPrev[sAttr], val)) {
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
        	return !$HO.isEmpty(oChange);
        }
        return $HO.contains(oChange, sAttr);
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
            return me.hasChanged() ? $HO.clone(me.changed) : false;
        }
        var val, changed = false;
        var oOld = me._changing ? me._previousAttributes : me.attributes;
        for (var sAttr in oDiff) {
            if (!$HO.equals(oOld[sAttr], (val = oDiff[sAttr]))){
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
        return $HO.clone(this._previousAttributes);
    }
	/**
	 * 获取模型数据
	 * @param {Object=}oOptions 备选参数
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $HO.clone(oOptions) : {};
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
	 * }
	 */
    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, method, xhr, attributes = me.attributes;
      // Handle both `"sKey", value` and `{sKey: value}` -style arguments.
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else {
        	(oAttrs = {})[sKey] = val;
        }

        oOptions = $HO.extend({validate: true}, oOptions);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
        if (oAttrs && !oOptions.wait) {
       	    if (!me.set(oAttrs, oOptions)) return false;
        } else {
        	if (!me._validate(oAttrs, oOptions)) return false;
        }

      // Set temporary attributes if `{wait: true}`.
        if (oAttrs && oOptions.wait) {
            me.attributes = $HO.extend({}, attributes, oAttrs);
        }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
        if (oOptions.parse === void 0) oOptions.parse = true;
        var model = me;
        var success = oOptions.success;
        oOptions.success = function(resp) {
	        // Ensure attributes are restored during synchronous saves.
	        model.attributes = attributes;
	        var serverAttrs = model.parse(resp, oOptions);
	        if (oOptions.wait) serverAttrs = $HO.extend(oAttrs || {}, serverAttrs);
	        if ($HO.isObject(serverAttrs) && !model.set(serverAttrs, oOptions)) {
	          return false;
	        }
	        if (success) success(model, resp, oOptions);
	        model.trigger('sync', model, resp, oOptions);
	      };
      	wrapError(me, oOptions);

	    method = me.isNew() ? 'create' : (oOptions.patch ? 'patch' : 'update');
	    if (method === 'patch') oOptions.oAttrs = oAttrs;
	    xhr = me.sync(method, me, oOptions);
	
	      // Restore attributes.
	    if (oAttrs && oOptions.wait){
	    	me.attributes = attributes;
	    }
	    return xhr;
    }
	/**
	 * 销毁/删除模型
	 * @param {Object=}oOptions 备选参数{
	 * 		{boolean=}wait: true表示等提交成功后才修改属性
	 * }
	 */
    function fDestroy(oOptions) {
    	var me=this;
      oOptions = oOptions ? $HO.clone(oOptions) : {};
      var model = me;
      var success = oOptions.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, oOptions);
      };

      oOptions.success = function(resp) {
        if (oOptions.wait || model.isNew()) destroy();
        if (success) success(model, resp, oOptions);
        if (!model.isNew()) model.trigger('sync', model, resp, oOptions);
      };

      if (me.isNew()) {
        oOptions.success();
        return false;
      }
      wrapError(me, oOptions);

      var xhr = me.sync('delete', me, oOptions);
      if (!oOptions.wait) destroy();
      return xhr;
    }
	/**
	 * 获取模型url
	 * @return {string} 返回模型url
	 */
    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override me to change the endpoint
    // that will be called.
    function fUrl() {
    	var me=this;
        var sUrl =
        $H.Util.result(me, 'urlRoot') ||
        $H.Util.result(me.collection, 'url');
        if(!sUrl){
        	var sMsg='必须设置一个url属性或者函数';
        	$D.error(sMsg,new Error(sMsg));
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
        return resp;
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
        return this._validate({}, $HO.extend(oOptions || {}, { validate: true }));
    }
	
	return Model;
	
});