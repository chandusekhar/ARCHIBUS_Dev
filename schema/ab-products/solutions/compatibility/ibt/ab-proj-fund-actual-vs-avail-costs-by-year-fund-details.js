var abProjFundActualVsAvailCostsByYearFundDetailsCtr = View.createController('abProjFundActualVsAvailCostsByYearFundDetails', {
    afterInitialDataFetch: function(){
        var original_title = View.title;
        var fund_id = View.restriction.clauses[0].value;
        View.setTitle(original_title + ' ' + fund_id);
    }
})



function onClickEventLoadPopupDetails(obj){
    var fund_id = View.restriction.clauses[0].value;
    var restriction = obj.restriction;
    restriction.addClause('funding.fund_id', fund_id);
    
    View.openDialog('ab-proj-fund-actual-vs-avail-costs-by-year-fund-popup.axvw', restriction, false);
}
