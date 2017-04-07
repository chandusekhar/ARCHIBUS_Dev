
var abOnDemandRptCostEqstdController = View.createController("abOnDemandRptCostEqstdController", {

    isCalYear: true,
	yearValue: '',
    
	//parentType:'ac','bl','dvdp','eqstd','proptype'
    groupType: 'eqstd',
	
	fieldsArraysForRestriction: null,
	
	//Restriction string constructed from console, not only used for crosstable, but also used for pop-up details dialog
	otherRes:' 1=1 ',
    
	afterInitialDataFetch: function() {
		var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
		this.fieldsArraysForRestriction = new Array(['wr.site_id'], ['wr.bl_id'],['wr.dv_id'],['wr.dp_id']);
    },
    
    requestConsole_onFilter: function() {
        var console = this.requestConsole;
		var restriction = 	getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);
        
        this.yearValue = document.getElementById("selectYear").value;
        if (this.yearValue != "") {
            restriction +=  generateCostRes(this).replace(/wrhwr.date_completed/g, "wr.date_completed");
        }
		this.otherRes = restriction;
        this.reportPanel.refresh(restriction);
    },
	
    requestConsole_onClear: function() {
		this.requestConsole.clear();
		var curYear	= new Date().getFullYear();
		setDefaultValueForHtmlField(['selectYear'],[curYear]);
    },
    
    consolePanel_afterRefresh: function() {
    }
});

function onEqstdCrossTableClick(obj){
	changeWrToWrhwrInClickObject(obj);
	onCostCrossTableClick( obj,View.controllers.get('abOnDemandRptCostEqstdController').otherRes.replace(/wr./g, "wrhwr."));
}

function showLine() {
	View.controllers.get('abOnDemandRptCostEqstdController').otherRes = 
		View.controllers.get('abOnDemandRptCostEqstdController').otherRes.replace(/wr./g, "wrhwr.");
    View.openDialog('ab-bldgops-report-cost-line-chart-month.axvw');
}
