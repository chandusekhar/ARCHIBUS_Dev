var abondemandrpttrController = View.createController("abondemandrpttrController", {
    //parentType:'ac','bl','dvdp','eqstd','proptype','tr'
    parentType: 'tr',
    restriction: '',
    isCalYear: true,
    yearValue: '',
    afterInitialDataFetch: function(){
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
    },
    
    /**
     * Add filter button function
     */
    requestConsole_onFilter: function(){
		this.restriction = '1=1'
		var yearSelect = $('selectYear');
        if (yearSelect != "") {
            this.reportPanel.addParameter('year' , yearSelect.value);
            this.restriction +=   generateCostRes(this).replace(/wrhwr.date_completed/g, "hwr.date_completed");
			yearValue = yearSelect.value;
        }
        this.reportPanel.refresh();
    },
    
    requestConsole_onClear: function(){
        this.requestConsole.clear();
        var curYear = new Date().getFullYear();
        setDefaultValueForHtmlField(['selectYear'], [curYear]);
    },

    reportPanel_onShowBarChart: function(){
		View.openDialog('ab-ondemand-report-tr-chart.axvw');
    }
});

function onClickItem(obj){
	onArchievedWrCrossTableClick(obj,View.controllers.get("abondemandrpttrController").restriction);
}