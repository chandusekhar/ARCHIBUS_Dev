/**
* ab-helpdesk-analysis-report-requesttype.js
*/
var ahdsraController = View.createController("ahdsraController",{
	
	afterInitialDataFetch: function(){
		//show the analysis panel
		ABHDC_populateSelectList("site","site_id","name","site.site_id","EXISTS (SELECT 1 FROM hactivity_log WHERE site.site_id = hactivity_log.site_id)");
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
	
	ahdsraController.reportPanel.refresh(restriction);
	//ahdsraController.reportPanel2.refresh(restriction);
}


function clearConsole(){
	document.getElementById("selectYear").value = '';
	document.getElementById("site.site_id").value = ''; 
	
	ahdsraController.reportPanel.refresh("0=0");
	//ahdsraController.reportPanel2.refresh("0=0");
}