var reviewBookingByEmController = View.createController('reviewBookingByEmController', {
    dvId: '',
    dpId: '',
    /**
     * Search booking by console restriction
     */
    searchBookingConsole_onSearch: function(){
        this.setRestrictionParameter();
        if (this.dvId) {
            this.departmentsGrid.addParameter('dvId', " = '" + this.dvId + "'");
            
        }
        else {
            this.departmentsGrid.addParameter('dvId', 'IS NOT NULL');
        }
        if (this.dpId) {
            this.departmentsGrid.addParameter('dpId', " = '" + this.dpId + "'");
            
        }
        else {
            this.departmentsGrid.addParameter('dpId', 'IS NOT NULL');
        }
        this.departmentsGrid.refresh();
        this.bookingsGrid.show(false);
        
    },
    /**
     * Clear restriction of console
     */
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        this.dvId = '';
        this.dpId = '';
        this.departmentsGrid.show(false);
        this.bookingsGrid.show(false);
        
    },
	/**
	 * Set default value for console before search action
	 */
    setRestrictionParameter: function(){
        var dvId = this.searchBookingConsole.getFieldValue("rmpct.dv_id");
        var dpId = this.searchBookingConsole.getFieldValue("rmpct.dp_id");
        if (dvId) {
            this.dvId = dvId;
        }
        if (dpId) {
            this.dpId = dpId;
        }
    }
})
/**
 * Refresh bookinggrid when you click row.
 */
function departmentReportOnClick(){
    var grid = View.panels.get('departmentsGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    
    var dvId = selectedRow["dp.dv_id"];
    var dpId = selectedRow["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('rmpct.dv_id', dvId, '=');
    restriction.addClause('rmpct.dp_id', dpId, '=');
    var bookingsGrid = View.panels.get('bookingsGrid');
    bookingsGrid.refresh(restriction);
}
