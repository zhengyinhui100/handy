//弹窗


(function(){
	
	var Dialog=$HO.createClass("handy.component.Dialog");;
	
	
	$HO.inherit(Dialog,$HO.namespace("handy.component.Component"),{
		
		/**
		 * 弹窗初始化
		 * @method initialize
		 * @param {object}settings 初始化参数 {
		 * 		{string}title     对话框标题
		 * 		{string}extClass  对话框自定义class
		 * 		{string}titleIcon 标题前的icon的class
		 * 		{string}content   body里的html内容
		 * 		{number}width     对话框的宽度
		 * 		{boolean}noAction 仅当为true时，不添加底部按钮
		 * 		{boolean}noOkBtn  仅当为true时，不添加确定按钮
		 * 		{boolean}noCancelBtn 仅当为true时，不添加取消按钮
		 * 		{string}okTxt     确定按钮文本
		 * 		{string}cancelTxt 取消按钮文本
		 * 		{function}okCall  点击确定按钮时的回调函数，返回false时阻止弹窗关闭
		 * 		{funciton}cancel  点击取消按钮时的回调函数
		 * }
		 * @return {void}
		 */
		initialize:function(settings){
			var that=this;
			if(Dialog.current){
				Dialog.current.destroy();
			}
			Dialog.current=that;
			Dialog.superClass.initialize.call(that,settings);
			that.show();
		},
		
		doConfig:function(settings){
			var that=this;
			Dialog.superClass.doConfig.call(that,settings);
		},
		
		initHtml:function(){
			var that=this;
			var settings=that.settings;
			var width=settings.width;
			var titleIcon=settings.titleIcon;
			var html=[
			    '<div id="<%=this.id%>" class="c-dialog ',settings.extClass||'','" style="',width?'width:'+width+'px':'','">',
					'<div class="c-dialog-title g-clear">',
						'<label class="g-left">',titleIcon?'<span class="gi '+titleIcon+'"></span>':'',settings.title||'友情提示','</label>',
						'<span class="g-right gi gi-close js-close"></span>',
					'</div>',
					'<div class="c-dialog-body">',
						settings.content,
					'</div>',
					'<div class="c-dialog-foot">'
			];
			if(!settings.noAction){
				html.push(
					'<div class="action">');
				if(!settings.noOkBtn){
					html.push('<a class="hui-button hui-button-blue to-right js-ok">',settings.okTxt||'确定','</a>');
				}
				if(!settings.noCancelBtn){
					html.push('<a class="hui-button hui-button-gray js-cancel">',settings.cancelTxt||'取消','</a>');
				}
				html.push(
					'</div>');
			}
			html.push(
					'</div>',
					'</div>',
				'<div id="dialogMask" class="c-mask"></div>');
			that.chtml=html.join('');
		},
		
		show:function(){
			// 设置定位坐标
			var that=this;
			var dialog=that.container;
			var doc=document;
			var x = ((doc.documentElement.offsetWidth || doc.body.offsetWidth) - dialog.width())/2;
			var y = ((doc.documentElement.clientHeight || doc.body.clientHeight) - dialog.height())/2 + document.body.scrollTop;
			y = y < 10 ? window.screen.height/2-200 : y;
			dialog.css({
				left:x + "px",
				top:y-(that.settings.offsetTop||0) + "px"
			});
			that.mask=$("#dialogMask").height($(doc.body).height());
		},
		
		initListener:function(){
			var that=this;
			Dialog.superClass.initListener.call(that);
			var container=that.container;
			var settings=that.settings;
			container.delegate('.js-close','click',function(event){
				that.destroy();
			});
			if(!settings.noAction){
				if(!settings.noOkBtn){
					container.delegate('.js-ok','click',function(event){
						var okCall=settings.okCall;
						if((okCall&&okCall())!==false){
							that.destroy();
						}
					});
				}
				if(!settings.noCancelBtn){
					container.delegate('.js-cancel','click',function(event){
						var cancelCall=settings.cancelCall;
						if((cancelCall&&cancelCall())!==false){
							that.destroy();
						}
					});
				}
			}
		},
		
		hide:function(){
			var that=this;
			Dialog.superClass.hide.call(that);
			that.mask.hide();
		},
		
		destroy:function(){
			var that=this;
			Dialog.superClass.destroy.call(that);
			that.mask.remove();
		}
		
	});
	
	$HO.extend(Dialog,{
		ctype:'Dialog',
		
		tips:function(settings){
			settings.noAction=true;
			return new Dialog(settings);
		},
		
		alert:function(settings){
			var content;
			if(typeof settings=='string'){
				content=settings;
				settings={};
			}else{
				content=settings.content;
			}
			settings.content='<div class="text-content">'+content+"</div>";
			settings.noCancelBtn=true;
			return new Dialog(settings);
		},
		
		confirm:function(settings){
			return new Dialog(settings);
		},
		
		prompt:function(settings){
			settings.noAction=true;
			return new Dialog(settings);
		}
	});
	
	
})();