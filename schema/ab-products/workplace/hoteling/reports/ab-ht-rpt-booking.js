var reviewARangeBookingController = View.createController('reviewARangeBookingController', {
searchBookingConsole_onSearch:function(){
	this.selectBookingGrid.refresh(this.getRestriction());
},
searchBookingConsole_onClear:function(){
	this.searchBookingConsole.clear();
	this.selectBookingGrid.show(false);
},
getRestriction: function(){
        var restriction = new Ab.view.Restriction();
		 var dateStart = this.searchBookingConsole.getFieldValue("rmpct.date_start");
        if (dateStart) {
            restriction.addClause('rmpct.date_end', dateStart, '&gt;=');
        }
        var dateEnd = this.searchBookingConsole.getFieldValue("rmpct.date_end");
        if (dateEnd) {
            restriction.addClause('rmpct.date_start', dateEnd, '&lt;=');
        }
        return restriction;
    }
})
