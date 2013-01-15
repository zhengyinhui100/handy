/**
 * Element类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Element',function($){
	
	//用于检查是否是html字符串(是否包含html标签)
	var oQuickExpr = /^[^<]*(<(.|\s)+>)[^>]*$/;

	var Object=$.Object;
	var Element=Object.createClass();
	
	Object.extend(Element.prototype,{
		initialize          : fInitialize,   //类初始化
		length              : fLength,       //获取对象长度/节点数量
		each                : fEach,         //遍历对象
		get                 : fGet,          //获取节点
		find                : fFind          //查找子节点，注意:这里结果没有去重
	});
	/**
    * 创建并返回一个类
    * @method createClass
    * @param {void}
    * @return {funciton} 返回新创建的类
    */
	function fInitialize(selector,context){
		var that=this,
		selector = selector || document;
		that.doms=[];
		// $(DOMElement)
		if ( selector.nodeType ) {
			that.doms[0] = selector;
			that.context = selector;
			return that;
		}
		if ( typeof selector === "string" ) {
			//检查是否是HTML字符串
			if ( oQuickExpr.test(selector) ) {
				//$(html) -> $(array)
				selector = Element.clean( [ selector ], context );
			} else{
				//$(expr[, context]) -> $( context ).find( selector )
				return $( context ).find( selector );
			}

		}
		//节点数组或nodeList
		that.doms=($.Object.isArray( selector ) ?selector :$.Object.toArray(selector));
		return that;
	}
	/**
	 * 获取对象长度/节点数量
	 * @method length
	 * @param  {void}
	 * @return {number} 返回当前对象的长度
	 */
	function fLength(){
		return this.doms.length;
	}
	/**
	 * 遍历对象
	 * @method find
	 * @param  {function}fCallback(nIndex,eNode) 回调函数
	 * @return {object} 返回当前Element对象
	 */
	function fEach(fCallback){
		var that=this;
		$.Object.each(that.doms,fCallback);
		return that;
	}
	/**
	 * 获取节点
	 * @method get
	 * @param  {number}nIndex(可选) 节点索引
	 * @return {element||null} 返回对应节点，没有则返回null
	 */
	function fGet(nIndex){
		nIndex=nIndex||0;
		var that=this;
		if(nIndex<that.length()){
			return that.doms[nIndex];
		}
		return null;
	}
	/**
	 * 查找子节点，注意:这里结果没有去重
	 * @method find
	 * @param  {String}sSelector 选择器.classname 选择class名 #id 选择id,tagName选择TagName的对象
	 * @return {object} 返回Element的对象
	 */
	function fFind(sSelector) {
		var that=this;
		var Sizzle = window.Sizzle;
		var oElement, aMatches=[];
		if(that.length()==0){
			aMatches = Sizzle(sSelector);
		}else{
			this.each(function(i, oDom){
				aMatches = aMatches.concat(Sizzle(sSelector,oDom));
			});
		}
		oElement = new Element(aMatches);
		return oElement.length()>0 ? oElement : null;
	}
	
	return Element;
	
},['Object'])