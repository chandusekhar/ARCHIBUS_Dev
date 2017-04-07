
var abondemandrptctController = View.createController("abondemandrptctController", {
    //parentType:'ac','bl','dvdp','eqstd','proptype','tr','repair_type','causetype'
    parentType: 'causetype',
    restriction: '',
    isCalYear: true,
    yearValue: '',
    afterInitialDataFetch: function(){
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
    },
    
    requestConsole_onFilter: function(){
        this.restriction = '1=1';
        var yearSelect = $('selectYear');
        if (yearSelect != "") {
            this.restriction +=   generateCostRes(this).replace(/wrhwr.date_completed/g, "hwr.date_completed");
        }
        this.reportPanel.refresh(this.restriction);
    },
    
    consolePanel_afterRefresh: function(){
    },
    requestConsole_onClear: function(){
        this.requestConsole.clear();
        var curYear = new Date().getFullYear();
        setDefaultValueForHtmlField(['selectYear'], [curYear]);
    }
});

function onClickItem(obj){
	onArchievedWrCrossTableClick(obj,View.controllers.get("abondemandrptctController").restriction);
}


