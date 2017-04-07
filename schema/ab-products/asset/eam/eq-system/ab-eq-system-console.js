var reservationTabsController = View.createController("reservationTabsController",{
	  afterInitialDataFetch: function() {
	    	for (var name in window.location.parameters) {
				if(name.indexOf('eq_id') >= 0){
					this.abEamEqSysConsoleTabs.eq_id = window.location.parameters[name];
					break;
				}
	    	}
	    }
});