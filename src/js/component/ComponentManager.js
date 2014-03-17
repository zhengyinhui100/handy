/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("C.ComponentManager", 'CM.AbstractManager',function(AbstractManager) {

	var CM = $HO.createClass();

	// 静态方法
	$HO.inherit(CM,AbstractManager,{
		type          : 'component',      //管理类型
		initialize    : fInitialize,      //初始化
		afterRender   : fAfterRender,     //调用指定dom节点包含的组件的afterRender方法
		destroy       : fDestroy          //销毁组件，主要用于删除元素时调用
	});
	
	//全局快捷别名
	$C=new CM();
	
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		var me=this;
		//监听afterRender自定义事件，调用相关组件的afterRender方法
		$H.on("afterRender",function(oEl){
			//调用包含的组件的afterRender方法
			me.afterRender(oEl);
		})
		//监听removeEl自定义事件，jQuery的remove方法被拦截(base/adapt.js)，执行时先触发此事件
		$H.on('removeEl',function(oEl){
			//销毁包含的组件
			me.destroy(oEl);
		})
	}
	/**
	 * 调用指定dom节点包含的组件的afterRender方法
	 * @method afterRender
	 * @param {jQuery}oEl 指定的节点
	 */
	function fAfterRender(oEl){
		this.eachInEl(oEl,function(oCmp){
			oCmp.afterRender();
		});
	}
	/**
	 * 销毁组件，主要用于删除元素时调用
	 * @method destroy
	 * @param {jQuery}oRemoveEl 需要移除组件的节点
	 */
	function fDestroy(oRemoveEl){
		this.eachInEl(oRemoveEl,function(oCmp){
			oCmp.destroy(true);
		});
	}

	return $C;
	
});