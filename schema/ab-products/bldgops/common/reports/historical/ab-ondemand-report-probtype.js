var abondemandrptprobtypeController = View.createController("abondemandrptprobtypeController", {
    //parentType:'ac','bl','dvdp','eqstd','proptype','tr','repair_type'
    parentType: 'prob_type',
    restriction: '',
    fieldsArraysForRestriction: null,
    isCalYear: true,
    yearValue: '',
    afterInitialDataFetch: function(){
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
        this.fieldsArraysForRestriction = new Array(['hwr.site_id'], ['hwr.bl_id']);
    },
    
    /**
     * Add filter button function
     */
    requestConsole_onFilter: function(){
        this.restriction = getRestrictionStrFromConsole(this.requestConsole, this.fieldsArraysForRestriction);
        var yearSelect = $('selectYear');
        if (yearSelect != "") {
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
	onArchievedWrCrossTableClick(obj,View.controllers.get("abondemandrptprobtypeController").restriction);
}
