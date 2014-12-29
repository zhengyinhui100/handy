/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-17
 */
//"handy.view.ViewManager"
define("V.ViewManager", ['V.AbstractManager','B.Events'],function(AbstractManager) {

	var ViewManager = AbstractManager.derive({
		type          : 'view',           //管理类型
		initialize    : fInitialize,      //初始化
		afterRender   : fAfterRender,     //调用指定dom节点包含的视图的afterRender方法
		destroy       : fDestroy          //销毁视图，主要用于删除元素时调用
	});
	
	//全局快捷别名
	$V=$H.getSingleton(ViewManager);
	
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		var me=this;
		me.callSuper();
		//监听afterRender自定义事件，调用相关视图的afterRender方法
		$H.on("afterRender",function(sEvt,oEl){
			//调用包含的视图的afterRender方法
			me.afterRender(oEl);
		})
		//监听removeEl自定义事件，jQuery的remove方法被拦截(base/adapt.js)，执行时先触发此事件
		$H.on('removeEl',function(sEvt,oEl){
			//销毁包含的视图
			me.destroy(oEl);
		})
	}
	/**
	 * 调用指定dom节点包含的视图的afterRender方法
	 * @method afterRender
	 * @param {jQuery}oEl 指定的节点
	 */
	function fAfterRender(oEl){
		this.eachInEl(oEl,function(oView){
			oView.afterRender();
		});
	}
	/**
	 * 销毁视图，主要用于删除元素时调用
	 * @method destroy
	 * @param {jQuery}oRemoveEl 需要移除视图的节点
	 */
	function fDestroy(oRemoveEl){
		this.eachInEl(oRemoveEl,function(oView){
			oView.destroy(true);
		});
	}

	return ViewManager;
	
});