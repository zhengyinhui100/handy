/**
 * 时间选择弹窗类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.DatePicker',
[
'B.Object',
'B.Util',
'B.Date',
'C.AbstractComponent',
'C.Dialog'],
function(Obj,Util,Date,AC,Dialog){
	
	var DatePicker=AC.define('DatePicker',Dialog);
	
	DatePicker.getInstance=fGetInstance;      //静态获取实例方法，此方法会获取缓存中的实例对象(如果有的话)，避免多次创建同样的实例，提升性能
	
	DatePicker.extend({
		//初始配置
		xConfig         : {
			cls         : 'dp'
		},
//		date            : null,               //初始时间，Date对象或日期字符串，默认是当前(Date.now())
//		formator        : 'yyyy-MM-dd HH:mm', //格式因子
		extCls          : 'hui-dialog',
		_customEvents   : {
			change:1,                         //用户操作导致值改变时触发
			confirm:1                         //用户点击确认时触发
		},
		doConfig        : fDoConfig,          //初始化配置
		val             : fVal                //设置/读取值
	});
	
	/**
	 * 静态获取实例方法，此方法会获取缓存中的实例对象(如果有的话)，避免多次创建同样的实例，提升性能
	 * @param {object}oParams 初始化配置，同initialize方法
	 * @return {DatePicker} 返回日期选择弹窗实例
	 */
	function fGetInstance(oParams){
		var oPicker;
		var sFormator=oParams.formator||'default';
		var oInstance=DatePicker.instance||(DatePicker.instance={});
		if(oPicker=oInstance[sFormator]){
			//宿主对象不同，需重新绑定事件
			if(oPicker.host!=oParams.host){
				oPicker.host=oParams.host
				oPicker.off('change confirm');
				oParams.change&&oPicker.on('change',oParams.change);
				oParams.confirm&&oPicker.on('confirm',oParams.confirm);
				if(oParams.date){
					oPicker.val(oParams.date);
				}
			}
			oPicker.show();
		}else{
			oPicker=oInstance[sFormator]=new DatePicker(Obj.extend(oParams,{destroyWhenHide:false}));
		}
		return oPicker;
		
	}
	/**
	 * 获取选择框配置对象
	 * @param {string}sValue 选中值
	 * @param {number}nMin 最小值
	 * @param {number}nMax 最大值
	 * @param {string}sName 选择框名称
	 * @param {number=}nMaxDay 当前月份最大天数
	 * @return {object} 返回选择框配置
	 */
	function _fGetSelect(sValue,nMin,nMax,sName,nMaxDay){
		var oItem={
			xtype:'Select',
			xrole:'dialog-content',
			name:'dialogSelect',
			value:sValue,
			width:Util.em2px(3.125),
			cClass:sName,
			optionWidth:Util.em2px(6.25),
			iconPos:'bottom',
			extCls:'hui-dp-'+sName,
			options:[],
			defItem:{
				showPos:'center'
			},
			change:function(){
				var me=this;
				var oDp=me.parent;
				var oTime=oDp.val(true);
				//月份发生变化，要更新当月份的天数
				if(me.cClass=='month'){
					var nDay=Date.getDaysInMonth(oTime);
					var oDateMenu=oDp.find('.date > Menu')[0];
					var aMenuItems= oDateMenu.find();
					if(oDateMenu.val()>nDay){
						oDateMenu.val(nDay);
					}
					for(var i=28;i<31;i++){
						var oItem=aMenuItems[i];
						if(i<nDay){
							oItem.hidden=false;
						}else{
							oItem.hidden=true;
						}
					}
				}
				var sTime=oDp.val();
				oDp.val(sTime);
				oDp.trigger('change');
			}
		};
		for(var i=nMin;i<=nMax;i++){
			oItem.options.push({
				//分钟数补零
				text:sName=='minute'&&i<10?'0'+i:i,
				value:i,
				hidden:nMaxDay&&i>nMaxDay
			});
		}
		return oItem;
	}
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		oSettings=oSettings||{};
		var oDate=oSettings.date;
		if(Obj.isStr(oDate)){
			oDate=Date.parseDate(oDate);
		}
		var oDate=oDate||Date.now();
		var sFormator=oSettings.formator||(oSettings.formator='yyyy-MM-dd HH:mm');
		var sTime=Date.formatDate(oDate,sFormator);
		var aItems=[];
		var nMaxDay=Date.getDaysInMonth(oDate);
		var aFormatorMatches=sFormator.match(/[a-zA-Z]+/g);
		var aNumMatches=sTime.match(/\d+/g);
		for(var i=0;i<aFormatorMatches.length;i++){
			var sFormatorMatch=aFormatorMatches[i];
			var nNum=parseInt(aNumMatches[i]);
			switch (sFormatorMatch){
				case 'yyyy':
					aItems.push(_fGetSelect(nNum,nNum,nNum+10,'year'));
					break;
				case 'MM':
					aItems.push(_fGetSelect(nNum,1,12,'month'));
					break;
				case 'dd':
					aItems.push(_fGetSelect(nNum,1,31,'date',nMaxDay));
					break;
				case 'HH':
					aItems.push(_fGetSelect(nNum,0,23,'hour'));
					break;
				case 'mm':
					aItems.push(_fGetSelect(nNum,0,59,'minute'));
					break;
			}
		}
		Obj.extend(oSettings,{
			contentTitle:sTime+' 星期'+Date.getWeek(oDate),
			items:aItems,
			okCall:function(){
				return me.trigger('confirm');
			}
		});
		me.callSuper([oSettings]);
	}
	/**
	 * 获取/设置值
	 * @param {string=|Date=|boolean}value 字符串或者日期值，表示设置操作，如果为空则表示读取操作，true表示读取Date类型时间
	 * @return {string=} 读取操作时返回当前时间
	 */
	function fVal(value){
		var me=this;
		var aSel=me.find('Select');
		var sFormator=me.formator;
		//读取
		if(!value||Obj.isBool(value)){
			var sTime='';
			for(var i=0;i<aSel.length;i++){
				if(i==1||i==2){
					sTime+='-';
				}else if(i==3){
					sTime+=' ';
				}else if(i==4){
					sTime+=':';
				}
				sTime+=aSel[i].val();
			}
			var oDate=Date.parseDate(sTime);
			return value?oDate:Date.formatDate(oDate,sFormator);
		}else{
			//设置
			var sTime=value,oTime=value;
			if(Obj.isStr(value)){
				oTime=Date.parseDate(value,sFormator);
			}else{
				sTime=Date.formatDate(value,sFormator);
			}
			var aValues=sTime.match(/\d+/g);
			for(var i=0;i<aSel.length;i++){
				aSel[i].val(aValues[i]);
			}
			me.set('contentTitle',sTime+' 星期'+Date.getWeek(oTime));
		}
	}
	
	return DatePicker;
	
});