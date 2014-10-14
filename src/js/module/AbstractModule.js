/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("M.AbstractModule","V.View",function (View) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = View.derive({
		
		xtype          : 'Module',
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		
		//模块管理相关属性
//		_forceExit     : false,          //true表示下一次退出操作不调用exit方法，直接退出
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		notCache       : false,          //{boolean}是否不使用cache，默认使用,仅当配置成true时不使用
//      clearCache     : false,          //仅清除一次当前的缓存，下次进入模块时执行清除并恢复原先缓存设置
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
//		referer        : null,           //记录从哪个模块进入
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		useCache       : $H.noop,        //判断是否使用模块缓存
		cache          : $H.noop,        //显示模块缓存时调用
		init           : $H.noop,        //初始化函数, 在模块创建后调用（在所有模块动作之前）
		entry          : $H.noop,        //进入模块，new和cache后都会调用此方法
		reset          : $H.noop,        //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},  //离开该模块前调用, 返回true允许离开, 否则不允许离开
		initialize     : fInitialize,    //初始化
		cleanCache     : fCleanCache     //清除模块缓存
	});
	/**
	 * 初始化
	 * @param{object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		//初始化模型
		if(!oParams.model&&me.modCls){
			me.model=new me.modCls();
			me.model.id=oParams.modelId;
		}
		me.callSuper();
	}
	/**
	 * 清除模块缓存
	 */
	function fCleanCache(){
		this.clearCache=true;
	}
	
	return AbstractModule;
});