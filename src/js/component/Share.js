/**
 * 社会化分享类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.Share',
[
'B.Object',
'C.AbstractComponent'
],
function(Obj,AC){
	
	var Share=AC.define('Share');
	
	Share.extend({
		//初始配置
		xConfig         : {
			cls         : 'share'
//			title       : '',           //分析标题
//			summary     : '',           //分享内容摘要
		},
		
//		url             : '',           //分享
		
		listeners       : [{
			name:'afterRender',
			custom:true,
			handler:function(){
				var me=this;
				require('http://static.bshare.cn/b/buttonLite.js#style=-1&uuid=f19aa603-e8fa-437c-8069-f5a12dff7e4e',
				function(){
					bShare.init();
					me.listen({
						name:'click',
						selector:'a',
						method:'delegate',
						handler:function(oEvt){
							var oEntry={
						        title:me.get('title')||document.title, // 获取文章标题
						        url:me.url||location.href,	// 获取文章链接
						        summary:me.get('summary')||''	// 从postBody中获取文章摘要
						    };
							if(me.getEntry){
								var oEnt=me.getEntry();
								Obj.extend(oEntry,oEnt);
							}
							bShare.entries=[];
							//oEntry.url=encodeURIComponent(oEntry.url);
							bShare.addEntry(oEntry);
						    var sName=oEvt.currentTarget.className;
						    if(sName==='more'){
						    	bShare.more();
						    }else{
							    bShare.share(oEvt.originalEvent,sName);
						    }
						}
					})
				});
			}
		}],
		
		tmpl            : [
			'<div>',
				'<ul class="bshare c-clear">',
					'<li>分享到:</li>',
					'<li><a title="分享到微信" class="weixin" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/weixin.gif "/></a></li>',
					'<li><a title="分享到新浪微博" class="sinaminiblog" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/sinaminiblog.gif "/></a></li>',
					'<li><a title="分享到QQ空间" class="qzone" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/qzone.gif "/></a></li>',
					'<li><a title="分享到人人网" class="renren" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/renren.gif "/></a></li>',
					'<li><a title="分享到豆瓣"  class="douban" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/douban.gif "/></a></li>',
					'<li><a title="更多" class="more" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/more-style-addthis.png"/></a></li>',
					'<li><a class="bshareDiv" href="http://www.bshare.cn/share"></a></li>',
				'</ul>',
			'</div>'
		].join('')
		
	});
	
	return Share;
	
});