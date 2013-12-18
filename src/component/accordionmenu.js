//手风琴菜单


(function(){
	
	var AccordionMenu=$HO.createClass("handy.component.AccordionMenu");;
	
	$HO.inherit(AccordionMenu,$HO.namespace("handy.component.Component"),{
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			AccordionMenu.superClass.initialize.call(that,settings);
			that.setSize();
		},
		
		doConfig:function(settings){
			var that=this;
			AccordionMenu.superClass.doConfig.call(that,settings);
		},
		
		initHtml:function(settings){
			var that=this;
			var data=settings.data;
			var html=[
			    '<ul class="menu-accordion" style="height:',that.settings.height,'px">'
			];
			for(var i=0,len=data.length;i<len;i++){
				var menu=data[i];
				var childHtml=menu.childMenus.length>0?$H.TreeMenu.html({data:menu.childMenus}):'';
				html.push(
					'<li>',
						'<a href="javascript:;" data-url="',menu.menuUrl,'" class="menu-accordion-item"><span class="gi ',menu.icon||'gi-Operation-maintenance','"></span>',menu.menuName,'</a>',
						'<div class="js-content" style="display:none;','">',
						childHtml,
						'</div>',
					'</li>');
			}
			html.push('</ul>');
			that.chtml=html.join('');
		},
		
		setSize:function(height){
			var that=this;
			var settings=that.settings;
			var h=that.height=height||settings.height||that.renderTo.height();
			var contentHeight=h-settings.data.length*43;
			that.container.find('.js-content').height(contentHeight);
		},
		
		open:function(param){
			var that=this;
			that.container.find(".menu-accordion-item[data-url='"+param.menuUrl+"']").click();
		},
		
		initListener:function(){
			var that=this;
			AccordionMenu.superClass.initListener.call(that);
			var container=that.container;
			var settings=that.settings;
			//展开/收起子菜单事件
			container.delegate('.menu-accordion-item','click',function(event){
				var menuItem=$(this);
				var itemClick=settings.itemClick;
				if(itemClick){
					itemClick(menuItem);
				}
				var childMenu=menuItem.next('.js-content');
				if(menuItem.attr("class").indexOf('js-open')>-1){
					return;
				}
				container.find('.js-open').removeClass("js-open accordion-item-active").next('.js-content').hide();
				menuItem.addClass('js-open accordion-item-active');
				if(childMenu.children().length>0){
					childMenu.show();
				}
			});
		}
	});
	
	$HO.extend(AccordionMenu,{
		ctype:'accordionMenu'
	});
	
	
})();