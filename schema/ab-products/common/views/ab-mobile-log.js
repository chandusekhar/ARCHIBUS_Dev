var mobileLogController = View.createController('mobileLogCtrl',{
	
	afterInitialDataFetch: function() {
		var currentdate = new Date(); 
		var time =  currentdate.getHours() + ":"  
		                + checkTime(currentdate.getMinutes()) + ":" 
		                + checkTime(currentdate.getSeconds());
		View.panels.get('consoleMobileLogPanel').setFieldValue("fromTime", time);
		View.panels.get('consoleMobileLogPanel').setFieldValue("toTime", time);	
		
	},
	
	consoleMobileLogPanel_onClear:function() {
		this.consoleMobileLogPanel.clear();
		this.gridMobileLogPanel.show(false);
		this.formMobileLogPanel.show(false);
		var currentdate = new Date(); 
		var time =  currentdate.getHours() + ":"  
        			+ checkTime(currentdate.getMinutes()) + ":" 
        			+ checkTime(currentdate.getSeconds());
		View.panels.get('consoleMobileLogPanel').setFieldValue("fromTime", time);
		View.panels.get('consoleMobileLogPanel').setFieldValue("toTime", time);	
	},
	
	consoleMobileLogPanel_onShow:function(){
		var grid = View.panels.get('gridMobileLogPanel');
		grid.clear();
		
		//sqlFilter username and app
		var console = View.panels.get('consoleMobileLogPanel');
		var sqlFilter = "1 = 1";
		var user_name = console.getFieldValue('mobile_log.user_name');
		if(user_name){
			sqlFilter += " AND mobile_log.user_name = '" + user_name + "'";
		}
		var application = console.getFieldValue('mobile_log.application');
		if(application){
			sqlFilter += " AND mobile_log.application = '" + application + "'";
		}
		
		//sqlFilter date and time
		var fromDate = View.panels.get('consoleMobileLogPanel').getFieldValue("fromDate");
		var fromTime = View.panels.get('consoleMobileLogPanel').getFieldValue("fromTime");
		var toDate = View.panels.get('consoleMobileLogPanel').getFieldValue("toDate");
		var toTime = View.panels.get('consoleMobileLogPanel').getFieldValue("toTime");
		
		if(fromDate > toDate && toDate!='')
			View.showMessage(getMessage('consoleMobileLogPanel_from_bigger_to'));
		
		var fromtime = fromTime.split(":");
		var totime = toTime.split(":"); 
		if(fromtime[0] > 24 || totime[0] > 24 ||
				fromtime[1] > 60 || totime[1] > 60 ||
				fromtime[2] > 60 || totime[2] > 60)
			View.showMessage(getMessage('consoleMobileLogPanel_h_m_s'));
		
		
		if(fromDate!='')	
			sqlFilter += " AND mobile_log.message_date + cast(mobile_log.message_time as datetime) >= '" 
				+ fromDate + " " + fromTime + "'";
		if(toDate!='')
			sqlFilter += " AND mobile_log.message_date + cast(mobile_log.message_time as datetime) <= '"
				+ toDate + " " + toTime + "'";
		
		grid.refresh(sqlFilter);
		this.formMobileLogPanel.show(false);
	}
	
});

function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}