/**
 * 时间选择器类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.DatePicker',
['C.AbstractComponent',
'C.Dialog'],
function(AC,Dialog){
	
	var DatePicker=AC.define('DatePicker',Dialog);
	
	DatePicker.extend({
		//初始配置
		xConfig         : {
			cls         : 'dp'
		},
//		date            : null,               //初始时间，Date对象，默认是当前($H.now())
//		formator        : 'yyyy-MM-dd HH:mm', //格式因子
		extCls          : 'hui-dialog',
		_customEvents   : ['change'],
		doConfig        : fDoConfig,          //初始化配置
		val             : fVal                //设置/读取值
	});
	
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
			width:50,
			cClass:sName,
			optionWidth:100,
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
					var nDay=$H.getDaysInMonth(oTime);
					var oDateMenu=oDp.find('.date > Menu')[0];
					var aMenuItems= oDateMenu.find();
					if(oDateMenu.val()>nDay){
						oDateMenu.val(nDay);
					}
					for(var i=28;i<31;i++){
						var oItem=aMenuItems[i];
						if(i<nDay){
							oItem.show();
						}else{
							oItem.hide(true);
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
				text:i,
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
		var oDate=oSettings.date||$H.now();
		var sFormator=oSettings.formator||(oSettings.formator='yyyy-MM-dd HH:mm');
		var sTime=$H.formatDate(oDate,sFormator);
		var aItems=[];
		var nMaxDay=$H.getDaysInMonth(oDate);
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
					aItems.push(_fGetSelect(nNum,0,24,'hour'));
					break;
				case 'mm':
					aItems.push(_fGetSelect(nNum,0,60,'minute'));
					break;
			}
		}
		$H.extend(oSettings,{
			contentTitle:sTime+' 星期'+$H.getWeek(oDate),
			items:aItems
		});
		me.callSuper([oSettings]);
	}
	/**
	 * 获取/设置值
	 * @param {string=|Date=|boolean} 字符串或者日期值，表示设置操作，如果为空则表示读取操作，true表示读取Date类型时间
	 * @return {string=} 读取操作时返回当前时间
	 */
	function fVal(value){
		var me=this;
		var aSel=me.find('Select');
		var sFormator=me.formator;
		//读取
		if(!value||$H.isBool(value)){
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
			var oDate=$H.parseDate(sTime);
			return value?oDate:$H.formatDate(oDate,sFormator);
		}else{
			//设置
			var sTime=value,oTime=value;
			if($H.isStr(value)){
				oTime=$H.parseDate(value,sFormator);
			}else{
				sTime=$H.formatDate(value,sFormator);
			}
			var aValues=sTime.match(/\d+/g);
			for(var i=0;i<aSel.length;i++){
				aSel[i].val(aValues[i]);
			}
			me.set('contentTitle',sTime+' 星期'+$H.getWeek(oTime));
		}
	}
	
	return DatePicker;
	
});