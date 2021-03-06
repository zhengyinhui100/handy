/**
 * 日期选择框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.DateSelect',
[
'B.Object',
'B.Date',
'C.AbstractComponent',
'C.DatePicker'
],
function(Obj,Date,AC,DatePicker){
	
	var DateSelect=AC.define('DateSelect');
	
	DateSelect.extend({
		//初始配置
		xConfig         : {
			cls             : 'dsel',
			name            : '',                  //选项名
			value           : '',             //默认值
			text            : {                    //选择框的文字
				deps   : ['value'],
				parseDeps     : function(sTxt){
					if(sTxt){
						return sTxt+' 星期'+Date.getWeek(Date.parseDate(sTxt));
					}else{
						return '请选择...';
					}
				}
			},         
			radius          : 'little',
			gradient        : true,
			iconPos         : 'right',             //图标位置，"left"|"right"|"top"|"bottom"
			iconPosCls      : {
				deps : ['iconPos'],
				parseDeps :function(sPos){
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			}
		},
//		date            : null,               //初始时间，Date对象，默认是当前(Date.now()，默认分钟数清零)
//		formator        : 'yyyy-MM-dd HH:mm', //格式因子
		_customEvents   : {change:1,confirm:1},
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray iconPosCls"}}>',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'{{input type="#text" name="name" value="value"}}',
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
	 * @param {Object}oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		var oTime=oParams.date;
		if(!oTime){
			oTime=Date.now();
			//不传时间默认分钟数清零
			oTime.setMinutes(0);
		}
		me.date=oTime;
		var sTime=Date.formatDate(oTime,oParams.formator||(oParams.formator='yyyy-MM-dd HH:mm'));
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
	 * @param {string=|Date=|boolean}value 字符串或者日期值，表示设置操作，如果为空则表示读取操作，true表示读取Date类型时间
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(value){
		var me=this;
		if(!value||Obj.isBool(value)){
			var sTime=me.get('value');
			return value?Date.parseDate(sTime):sTime;
		}else{
			value=Date.formatDate(value,me.formator);
			if(me.get('value')!=value){
				me.set('value',value);
				me.trigger("change");
			}
		}
	}
	
	return DateSelect;
	
});