//树形菜单


(function(){
	
	var TreeMenu=$HO.createClass("hui.component.TreeMenu");;
	
	
	$HO.inherit(TreeMenu,$HO.namespace("hui.component.Component"),{
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			TreeMenu.superClass.initialize.call(that,settings);
		},
		
		initHtml:function(settings){
			var that=this;
			that.chtml=that.createMenu(settings.data).join('');
		},
		
		createMenu:function(menus,html,marginLeft){
			var that=this;
			//是否是第一级菜单
			var isFirst=!!!html;
			var html=html||[];
			var marginLeft=marginLeft||0;
			//除第一级菜单外，其他默认隐藏
			html.push('<ul class="menu-tree"',isFirst?'':' style="display:none"','>');
			for(var i=0,len=menus.length;i<len;i++){
				var menu=menus[i];
				var hasChildren=!!menu.childMenus;
				html.push(
					'<li><a class="menu-tree-item">',
							//每级缩进
							'<span class="gi ',hasChildren?'gi-plus':'gi-minus','"',marginLeft?'style="margin-left:'+marginLeft+'px"':'','></span>',
							menu.menuName,
						'</a>'
				);
				if(hasChildren){
					that.createMenu(menu.childMenus,html,marginLeft+20);
				}
				html.push('</li>');
			}
			html.push('</ul>');
			return html;
		},
		
		initListener:function(){
			var that=this;
			TreeMenu.superClass.initListener.call(that);
			var container=that.container;
			//展开/收起子菜单事件
			container.delegate('.gi','click',function(event){
				var icon=$(this);
				var childMenu=icon.parent().next('ul');
				if(childMenu.length==0){
					return;
				}
				if(icon.attr("class").indexOf('gi-plus')>-1){
					icon.attr("class","gi gi-minus");
					childMenu.show();
				}else{
					icon.attr("class","gi gi-plus");
					childMenu.hide();
				}
			});
		}
	});
	
	$HO.extend(TreeMenu,{
		ctype:'treemenu'
	});
	
	
})();