View.createController('virtualFieldId', {
	
	reportGridSql_grid_onRm_bl_id: function(row, action) {
	    this.showDetails(row);
    },
    
	reportGridSql_grid_onRm_fl_id: function(row, action) {
	    this.showDetails(row);
    },
    
	reportGridSql_grid_onRm_rooms: function(row, action) {
	    this.showDetails(row);
    },
    
	reportGridSql_grid_onRm_total_area: function(row, action) {
	    this.showDetails(row);
    },
    
    showDetails: function(row) {
        var message = ('Selected record: ' + row.getRecord().toString());
	    View.alert(message);
    }
});