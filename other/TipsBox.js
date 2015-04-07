//浮层提示框


(function(){
	
	var TipsBox=$H.createClass("handy.component.TipsBox");;
	
	
	$H.inherit(TipsBox,$HO.namespace("handy.component.Component"),{
		
		delayInitListener:true,
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			//下次调用时需要关闭之前的实例
			if(TipsBox.current){
				TipsBox.current.destroy();
			}
			TipsBox.current=that;
			TipsBox.superClass.initialize.call(that,settings);
			that.show();
		},
		
		doConfig:function(settings){
			var that=this;
			TipsBox.superClass.doConfig.call(that,settings);
		},
		
		initHtml:function(settings){
			var that=this;
			var html=[
			    '<div id="<%=this.id%>" class="c-tipsbox ',settings.extClass||'','" style="',settings.width?'width:'+settings.width+'px':'','">',
					'<div class="hui-triangle-top">',
						'<div class="hui-triangle-top hui-triangle-inner"></div>',
					'</div>'];
			if(!settings.noTitle){
				html.push(
						'<div class="c-tipsbox-header">',
						settings.title,
						'</div>'
				);
			}
			html.push(
					'<div class="c-tipsbox-content">',
					settings.content,
					'</div>',
					'<div class="hui-triangle-bottom" style="display:none">',
						'<div class="hui-triangle-bottom hui-triangle-inner"></div>',
					'</div>',
					'</div>'
			);
			that.chtml=html.join('');
		},
		
		show:function(){
			// 设置定位坐标
			var that=this;
			var trigger=that.settings.trigger;
			var triggerPos=trigger.position();
			var tipsbox=that.container;
			var doc=document;
			
			var width=tipsbox.width();
			var height=tipsbox.height();
			var bodyWidth=doc.documentElement.offsetWidth || doc.body.offsetWidth;
			var bodyHeight=doc.documentElement.clientHeight || doc.body.clientHeight+ document.body.scrollTop;
			var triggerWidth=trigger.width();
			var triggerHeight=trigger.height();
			
			/*console.log(triggerPos)
			console.log(triggerWidth)
			console.log(triggerHeight)
			console.log(bodyHeight)
			console.log(bodyWidth)
			console.log(width)
			console.log(height)*/
			
			var x = triggerPos.left+ triggerWidth/2;
			var y = triggerPos.top;
			
			//默认右下角显示
			var passivePos="rightBottom";
			var passiveTop=y+triggerHeight+height>bodyHeight;
			if(x+width>bodyWidth){
				if(passiveTop){
					passivePos="leftTop";
				}else{
					passivePos="leftBottom";
				}
			}else if(passiveTop){
				passivePos="rightTop";
			}
			
			var posType=that.settings.position||passivePos;
			if(posType=="leftBottom"){
				//10是三角形尖到提示框上边界的距离
				y=y+triggerHeight+10;
				x=x-width;
				tipsbox.find('.hui-triangle-top').css({
					right:'10px'
				});
			}else if(posType=="rightBottom"){
				y=y+triggerHeight+10;
				//20是三角形尖到提示框左边界的距离
				x-=20;
			}else if(posType=="leftTop"){
				y=y-height;
				x=x-width;
				tipsbox.find('.hui-triangle-top').hide();
				tipsbox.find('.hui-triangle-bottom').css({
					right:'10px'
				}).show();
			}else if(posType=="rightTop"){
				//12是三角形的高度
				y=y-height-12;
				//20是三角形尖到提示框左边界的距离
				x-=20;
				tipsbox.find('.hui-triangle-top').hide();
				tipsbox.find('.hui-triangle-bottom').show();
			}
			
			tipsbox.css({
				left:x + "px",
				top:y-(that.settings.offsetTop||0) + "px"
			});
		},
		
		position:function(){
			
		},
		
		hide:function(){
			var that=this;
			that.container.hide();
		},
		
		initListener:function(){
			var that=this;
			TipsBox.superClass.initListener.call(that);
			var notClose=false;
			that.container.click(function(event){
				notClose=true;
			});
			$(document).click(function(event){
				if(!notClose){
					that.hide();
				}
				notClose=false;
			});
		}
	});
	
	$HO.extend(TipsBox,{
		ctype:'TipsBox'
	});
	
	
})();