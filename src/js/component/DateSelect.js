/**
 * 日期选择框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.DateSelect',
[
'C.AbstractComponent',
'C.DatePicker'
],
function(AC,DatePicker){
	
	var DateSelect=AC.define('DateSelect');
	
	DateSelect.extend({
		//初始配置
		xConfig         : {
			cls             : 'dsel',
			name            : '',                  //选项名
			value           : '',             //默认值
			text            : {                    //选择框的文字
				depends   : ['value'],
				parse     : function(){
					var sTxt=this.get('value');
					if(sTxt){
						return sTxt+' 星期'+$H.getWeek($H.parseDate(sTxt));
					}else{
						return '请选择...';
					}
				}
			},         
			radius          : 'little',
			iconPos         : 'right',             //图标位置，"left"|"right"|"top"|"bottom"
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			}
		},
//		date            : null,               //初始时间，Date对象，默认是当前($H.now()，默认分钟数清零)
//		formator        : 'yyyy-MM-dd HH:mm', //格式因子
		_customEvents   : ['change','confirm'],
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray iconPosCls"}}>',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input {{bindAttr value="value" name="name"}}/>',
				'<span class="hui-btn-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		listeners       : [
			{
				name:'click',
				handler:function(){
					this.showDialog();
				}
			}
		],
		
		doConfig         : fDoConfig,             //初始化配置
		showDialog       : fShowDialog,           //显示日期选择弹窗
		val              : fVal                   //获取/设置值
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		var oTime=oParams.date;
		if(!oTime){
			oTime=$H.now();
			//不传时间默认分钟数清零
			oTime.setMinutes(0);
		}
		me.date=oTime;
		var sTime=$H.formatDate(oTime,oParams.formator||(oParams.formator='yyyy-MM-dd HH:mm'));
		me.set('value',sTime);
		me.callSuper();
	}
	/**
	 * 显示日期选择弹窗
	 */
	function fShowDialog(){
		var me=this;
		DatePicker.getInstance({
			date:me.get('value'),
			formator:me.formator,
			host:me,
			confirm:function(){
				me.set('value',this.val());
				me.trigger('change');
				return me.trigger('confirm');
			}
		});
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=|Date=|boolean}value 字符串或者日期值，表示设置操作，如果为空则表示读取操作，true表示读取Date类型时间
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(value){
		var me=this;
		if(!value||$H.isBool(value)){
			var sTime=me.get('value');
			return value?$H.parseDate(sTime):sTime;
		}else{
			value=$H.formatDate(value,me.formator);
			if(me.get('value')!=value){
				me.set('value',value);
				me.trigger("change");
			}
		}
	}
	
	return DateSelect;
	
});