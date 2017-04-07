

/**
* ab-helpdesk-analysis-report-requesttype.js
*/
var ahdarrtController = View.createController("ahdarrtController",{
	
	afterInitialDataFetch: function(){
		//show the analysis panel
		
		ABHDC_populateSelectList("site","site_id","name","site.site_id","EXISTS (SELECT 1 FROM hactivity_log WHERE site.site_id = hactivity_log.site_id)");
		ABHDC_populateSelectList("activitytype","activity_type","activity_type","hactivity_log.activity_type","EXISTS (SELECT 1 FROM hactivity_log WHERE activitytype.activity_type = hactivity_log.activity_type)");
		ABHDC_populateYearConsole("hactivity_log","date_requested","selectYear");
	},
	
	consolePanel_afterRefresh: function(){}
});


function setRestriction(){
	var restriction = "0=0";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = hactivity_logmonth.site_id AND ";
	var siteValue = trim(document.getElementById("site.site_id").value);
	
	if(siteValue != '' && siteValue != getMessage('selectTitle')){
		restriction +=  " AND " + siteString + "site.site_id LIKE \'%" + siteValue + "%\')";
	}
	var year = document.getElementById("selectYear").value;
	if(year != ''){
		restriction +=  " AND hactivity_logmonth.month LIKE \'" + year + "%\'";
	}
	var requesttype = document.getElementById("hactivity_log.activity_type").value;
	if(requesttype != ''){
		restriction +=  " AND hactivity_logmonth.activity_type LIKE \'%" + requesttype + "%\'";
	}
	ahdarrtController.reportPanel.refresh(restriction);
}

function clearConsole(){
	document.getElementById("site.site_id").value = '';
	document.getElementById("hactivity_log.activity_type").value = '';
	document.getElementById("selectYear").value = '';
		
	ahdarrtController.reportPanel.refresh("0=0");
}
