/**
 * 项目导航类，负责模块导航效果
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-20
 */
 /**
  * 模块配置属性
  * hasFooter       : true,      //是否显示底部工具栏
  */
define('M.Navigator',
[
'L.Browser',
'B.Support',
'M.AbstractNavigator'
],
function(Browser,Support,AbstractNavigator){
	
	var Navigator=AbstractNavigator.derive({
		navigate    : fNavigate  //
	});
	/**
	 * 导航效果
	 * @method navigate
	 * @param {Object}oShowMod  当前要进入到模块
	 * @param {Object}oHideMod 要离开的模块
	 * @param {Object}oModManager 模块管理对象
	 */
	function fNavigate(oShowMod,oHideMod,oModManager){
		var sModName=oShowMod.modName;
		//控制底部工具栏
		var oFooterTb=$V.get('mainFooterTb');
		var bHasFooter=oShowMod.hasFooter;
		if(bHasFooter){
			oShowMod.getEl().addClass('has-footer');
			oFooterTb.show();
			oFooterTb.children[0].select('[dataMod='+sModName+']');
		}else{
			oFooterTb.hide();
		}
		//模块切换动画，只在高性能的环境中实现
		if((Support.perf()==='high'||!Browser.mobile()&&Modernizr.csstransforms3d)){
			//退出模块动画
			var oShowEl=oShowMod.getEl();
			var oHideEl=oHideMod&&oHideMod.getEl();
			var sIndependCls='hui-mod-independent';
			var sName='animationEnd';
			var sAniEvt=Support.normalizeEvent(sName);
			var oAniEl;
			if(oHideMod&&!oHideMod.hasFooter&&oHideMod.referer===oShowMod){
				if(oHideEl.length>0){
					oHideEl.addClass('hui-mod-zindex hui-scale-fadeout');
//					oShowEl.addClass(sIndependCls);
					oShowMod.show();
					//oHideEl.get(0).offsetWidth;
					oHideEl.data('hideMod',oHideMod);
				}
				oAniEl=oHideEl;
			}else if(!bHasFooter){
				//进入模块动画，顶级模块不加动画效果
				if(oShowEl.length>0){
					//oShowEl.removeClass('hui-slide-center').addClass('hui-goto-right hui-mod-zindex');
					oShowEl.addClass('hui-mod-zindex hui-scale-fadein');
					if(oHideMod){
//						oHideEl.addClass(sIndependCls);
					}
					oShowMod.show();
					//setTimeout(function(){
						//这里必须触发layout，否则第二次以后进入模块会没有动画效果
						//TODO 为何第一次时不触发layout也会有动画效果，而如果去掉setTimeout会都没有效果？
						//oShowEl.get(0).offsetWidth;
						//oShowEl.removeClass('hui-goto-right').addClass('hui-slide-center');
					//},0);
				}
				oAniEl=oShowEl;
			}
			if(oAniEl){
				if(oAniEl.length>0){
					oAniEl.one(sAniEvt,function(){
						if(oHideMod){
							oHideMod.hide();
//								oHideEl.removeClass(sIndependCls);
						}
						//oShowEl.removeClass('hui-mod-zindex');
						oAniEl.removeClass('hui-mod-zindex hui-scale-fadein hui-scale-fadeout');
					})
				}
				return false;
			}
		}
	}
	
	return Navigator;
	
});