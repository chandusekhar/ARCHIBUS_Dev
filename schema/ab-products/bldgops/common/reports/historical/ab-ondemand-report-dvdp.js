var abondemandrptdvdpController = View.createController("abondemandrptdvdpController", {
    //parentType:'ac','bl','dvdp','eqstd','proptype'
    parentType: 'dvdp',
    restriction: '',
    fieldsArraysForRestriction: null,
    isCalYear: true,
    yearValue: '',

    afterInitialDataFetch: function(){
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
        this.fieldsArraysForRestriction = new Array(['hwr.dv_id'], ['hwr.dp_id']);
    },
    
    requestConsole_onFilter: function(){
        this.restriction = getRestrictionStrFromConsole(this.requestConsole, this.fieldsArraysForRestriction);
        this.yearValue = document.getElementById("selectYear").value;
        if (this.yearValue != "") {
            this.restriction +=   generateCostRes(this).replace(/wrhwr.date_completed/g, "hwr.date_completed");
        }
        this.reportPanel.refresh(this.restriction);
    },
    
    requestConsole_onClear: function(){
        this.requestConsole.clear();
        var curYear = new Date().getFullYear();
        setDefaultValueForHtmlField(['selectYear'], [curYear]);
    }
});

function onClickItem(obj){
	onArchievedWrCrossTableClick(obj,View.controllers.get("abondemandrptdvdpController").restriction);
}
