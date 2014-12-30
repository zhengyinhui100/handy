/**
 * 抽象数据类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.data.AbstractData"
define('D.AbstractData',
[
'B.Util',
'B.Date',
'B.Class',
'D.AbstractDao',
'CM.AbstractEvents',
'D.DataStore'],
function(Util,Date,Class,AbstractDao,AbstractEvents){
	
	var AbstractData=AbstractEvents.derive({
		_isDirty        : true,
		dirtyTime       : 30*60*1000,     //数据失效时间，超出则标记为脏数据
//		lastSyncTime    : null,           //上次同步时间
//		dao             : null,           //数据访问对象，默认为common.AbstractDao
		initialize      : fInitialize,    //初始化
		isDirty         : fIsDirty,       //返回是否是脏数据
		setDirty        : fSetDirty,      //设置脏数据
		sync            : fSync,          //同步数据，可以通过重写进行自定义
		fetch           : $H.noop,        //抓取数据
		fetchIf         : fFetchIf        //仅在脏数据时抓取数据
	});
	
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me.callSuper();
		me.uuid=Util.uuid();
		//配置dao对象
		me.dao=me.dao||Class.getSingleton(AbstractDao);
	}
	/**
	 * 返回是否是脏数据
	 * @return {boolean} true表示是脏数据
	 */
	function fIsDirty(){
		var me=this;
		var bDirty=me._isDirty;
		if(!bDirty){
			if(me.lastSyncTime){
				var now=Date.now();
				bDirty=now.getTime()-me.lastSyncTime.getTime()>=me.dirtyTime;
			}
		}
		return bDirty;
	}
	/**
	 * 设置为脏数据
	 */
	function fSetDirty(){
		this._isDirty=true;
	}
	/**
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {D.AbstractData}oData 数据对象
	 * @param {Object}oOptions 设置
	 * @return {*} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
	 */
    function fSync(sMethod,oData,oOptions) {
    	var me=this;
    	me.lastSyncTime=Date.now();
    	this._isDirty=false;
        return me.dao.sync(sMethod,oData,oOptions);
    }
    /**
     * 仅在脏数据时抓取数据
     * @param {object=}oOptions 选项
     * @return {*=} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
     */
    function fFetchIf(oOptions){
    	var me=this;
    	//非脏数据不进行抓取
        if(me.isDirty()){
        	return me.fetch(oOptions);
        }
    }
	
	return AbstractData;
	
});