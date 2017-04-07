var bookingServiceDetailsController = View.createController('bookingServiceController', {

    afterInitialDataFetch: function(){
        //judge if user belong to 'Hoteling Administration'group
        var pctId = View.getOpenerView().PctId;
        var consoleRestriction = View.getOpenerView().consoleRestriction;
        consoleRestriction.addClause('rmpct.pct_id', pctId, '=');
        this.bookingDetailReport.refresh(consoleRestriction);
		this.jackDetailsReport.refresh(View.getOpenerView().resShort);	
    }
})
