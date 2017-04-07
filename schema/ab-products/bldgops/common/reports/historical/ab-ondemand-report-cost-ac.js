
var abOnDemandRptCostAcController = View.createController("abOnDemandRptCostAcController", {
    isCalYear: true,
    yearValue: '',
    //parentType:'ac','bl','dvdp','eqstd','proptype'
    groupType: 'ac',
	
	//Restriction string constructed from console, not only used for crosstable, but also used for pop-up details dialog
	otherRes:' 1=1 ',

    afterInitialDataFetch: function() {
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
    },
    
    requestConsole_onFilter: function() {
        var console = this.requestConsole;
		
        this.otherRes = " 0=0 " + generateCostRes(this).replace(/wrhwr.date_completed/g, "wr.date_completed");
        this.reportPanel.refresh(this.otherRes);
    },
    
    requestConsole_onClear: function() {
		this.requestConsole.clear();
		var curYear	= new Date().getFullYear();
		setDefaultValueForHtmlField(['selectYear'],[curYear]);
    }
});

function showLineChart() {
	View.controllers.get('abOnDemandRptCostAcController').otherRes = 
		View.controllers.get('abOnDemandRptCostAcController').otherRes.replace(/wr./g, "wrhwr.");
    View.openDialog('ab-bldgops-report-cost-line-chart-month.axvw');
}

function onAcCostCrossTableClick(obj) {
	changeWrToWrhwrInClickObject(obj);
	onCostCrossTableClick(obj, View.controllers.get('abOnDemandRptCostAcController').otherRes.replace(/wr./g, "wrhwr."));
}
