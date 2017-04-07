
/**
 * Get the restriction field from the top frame and apply it as a filter value.
 * The restriction field does not have to be a PK or FK, but cannot be a date or a time field.
 */
var abRVDetailsGridController = View.createController("abRVDetailsGridController",{
	

	afterInitialDataFetch: function() {
		var name = window.location.parameters["fieldName"];
		var value = window.location.parameters["fieldValue"];
		
		name = window.top.fieldName;
		value = window.top.fieldValue;
		
		if (valueExists(name) && valueExists(value)) {
	        
			var restriction = new Ab.view.Restriction();
			restriction.addClause(name, value); 
		
			var grid = View.panels.get('reserve_rm_grid');
	        grid.refresh(restriction);
			
	        var grid2 = View.panels.get('reserve_rs_grid');
	        grid2.refresh(restriction);
	    }
	}
});