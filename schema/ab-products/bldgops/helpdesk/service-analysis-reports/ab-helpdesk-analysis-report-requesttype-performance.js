/**
* ab-helpdesk-analysis-report-requesttype-performances.js
*/
var ahdarrtpController = View.createController("ahdarrtpController",{
	
	afterInitialDataFetch: function(){
		//show the analysis panel
		
		ABHDC_populateSelectList("site","site_id","name","site.site_id","EXISTS (SELECT 1 FROM hactivity_log WHERE site.site_id = hactivity_log.site_id)");
		ABHDC_populateYearConsole("hactivity_log","date_requested","selectYear");
		ABHDC_populateSelectList("hactivity_logmonth","service_provider","service_provider","hactivity_logmonth.service_provider","0=0");
		ABHDC_populateSelectList("activitytype","activity_type","activity_type","hactivity_logmonth.activity_type","EXISTS (SELECT 1 FROM hactivity_log WHERE activitytype.activity_type = hactivity_log.activity_type)");
	},
	
	consolePanel_afterRefresh: function(){}
});



function setRestriction(fileName){
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
	var service_provider = document.getElementById("hactivity_logmonth.service_provider").value;
	if(service_provider != ''){
		if (service_provider == 'N/A'){
			restriction += " AND hactivity_logmonth.service_provider IS NULL";
		} else {
			restriction += " AND hactivity_logmonth.service_provider LIKE \'%" + service_provider + "%\'";
		}
	}
	
	var requesttype = document.getElementById("hactivity_logmonth.activity_type").value;
	if(requesttype != ''){
		restriction +=  " AND hactivity_logmonth.activity_type LIKE \'%" + requesttype + "%\'";
	}
	
	ahdarrtpController.reportPanel.refresh(restriction);
}

function clearConsole(){
	
	document.getElementById("hactivity_logmonth.activity_type").value = '';
	document.getElementById("selectYear").value = '';
	document.getElementById("hactivity_logmonth.service_provider").value = '';
	document.getElementById("site.site_id").value = '';
	
	ahdarrtpController.reportPanel.refresh("0=0");	
}