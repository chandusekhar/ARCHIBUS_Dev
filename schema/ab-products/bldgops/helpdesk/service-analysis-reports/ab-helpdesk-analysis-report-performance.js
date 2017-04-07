
/**
* ab-helpdesk-analysis-report-performances.js
*/
var ahdarpController = View.createController("ahdarpController",{
	
	afterInitialDataFetch: function(){
		//show the analysis panel
		
		ABHDC_populateSelectList("site","site_id","name","site.site_id","EXISTS (SELECT 1 FROM hactivity_log WHERE site.site_id = hactivity_log.site_id)");
		ABHDC_populateYearConsole("hactivity_log","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
		ABHDC_populateSelectList("hactivity_logmonth","service_provider","service_provider","hactivity_logmonth.service_provider","0=0");
	},
	
	consolePanel_afterRefresh: function(){}
	
});


function setRestriction(){
	var restriction = "0=0";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = hactivity_logmonth.site_id AND ";
	
	var siteValue = document.getElementById("site.site_id").value;
	
	if(siteValue != '' && siteValue != getMessage('selectTitle')){
		restriction +=  " AND " + siteString + "site.site_id LIKE \'%" + siteValue + "%\')";
	}
	
	var service_provider = document.getElementById("hactivity_logmonth.service_provider").value;
	
	if(service_provider != '' && service_provider != getMessage('selectTitle')){
		if (service_provider == 'N/A'){
			restriction += " AND hactivity_logmonth.service_provider IS NULL";
		} else {
			restriction += " AND hactivity_logmonth.service_provider LIKE \'%" + service_provider + "%\'";
		}
	}

	var year = document.getElementById("selectYear").value;
	if(year != ""){
		restriction +=  " AND hactivity_logmonth.month LIKE \'" + year + "%\'";
	}
	
	ahdarpController.reportPanel.refresh(restriction);
}

function clearConsole(){
	document.getElementById("selectYear").value = '';
	document.getElementById("hactivity_logmonth.service_provider").value = '';
	document.getElementById("site.site_id").value = '';
	
	ahdarpController.reportPanel.refresh("0=0");
}
