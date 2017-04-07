
var abondemandWorkTeamRptController =  View.createController("abondemandWorkTeamRptController",{
	
	afterInitialDataFetch: function(){
		ABODC_populateYearConsole("hwr","date_requested","selectYear");
		ABODC_populateSelectList("site","site_id","name","site.site_id","EXISTS (SELECT 1 FROM hwr_month WHERE site.site_id = hwr_month.site_id)");
	},
	
	consolePanel_afterRefresh: function(){},
	
	requestConsole_onFilter: function(){
		var restriction = "0=0";
		var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = hwr_month.site_id AND ";
		var siteId = trim($('site.site_id').value); 
		if(siteId != ''){
			restriction +=  " AND " + siteString + "site.site_id LIKE \'%" + siteId + "%\')";
		}
		var year = document.getElementById("selectYear").value;
		if(year != ""){
			restriction +=  " AND hwr_month.month LIKE \'" + year + "%\'";
		}
		this.reportPanel.refresh(restriction);
	},
	
	requestConsole_onClear: function(){
		document.getElementById("selectYear").value = '';
		document.getElementById("site.site_id").value = '';
		this.reportPanel.refresh("0=0");
	}
	
});