var reviewBookingByEmController = View.createController('reviewBookingByEmController', {
    dateStart: '1900-12-15',
    dateEnd: '2200-12-15',
	/**
	 * Search booking by console date
	 */
    searchBookingConsole_onSearch: function(){
        this.setRestrictionParameter();
        this.departmentsGrid.addParameter('dateStart', this.dateStart);
        this.departmentsGrid.addParameter('dateEnd', this.dateEnd);
        this.departmentsGrid.refresh();
        this.bookingsGrid.show(false);
        
    },
	/**
	 * Clear restriction of console
	 */
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
		this.dateStart='1900-12-15';
		this.dateEnd='2200-12-15';
        this.departmentsGrid.show(false);
        this.bookingsGrid.show(false);
        
    },
	/**
	 * Set restriction parameter for console
	 */
    setRestrictionParameter: function(){
        var dateStart = this.searchBookingConsole.getFieldValue("rmpct.date_start");
        var dateEnd = this.searchBookingConsole.getFieldValue("rmpct.date_end");
        if (dateStart && dateEnd  && dateStart <= dateEnd) {
            this.dateStart = dateStart;
            this.dateEnd = dateEnd;
        }
        else 
            if (!dateStart && !dateEnd ) {
                this.dateStart = '1900-12-15';
                this.dateEnd = '2200-12-15';
                
            }
            else 
                if (!dateStart && dateEnd ) {
                    this.dateStart = '1900-12-15';
                    this.dateEnd = dateEnd;
                    
                }
                else 
                    if (dateStart && !dateEnd) {
                        this.dateStart = dateStart;
                        this.dateEnd = '2200-12-15';
                    }
    }
})
/**
 * Refresh booking grid when you click grid row
 */
function departmentReportOnClick(){
    var grid = View.panels.get('departmentsGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var bookingsGrid = View.panels.get('bookingsGrid');
    var dvId = selectedRow["dp.dv_id"];
    var dpId = selectedRow["dp.dp_id"];
    bookingsGrid.addParameter('dvId', "='" + dvId + "'");
    bookingsGrid.addParameter('dpId', "='" + dpId + "'");
    bookingsGrid.addParameter('dateStart', View.controllers.get('reviewBookingByEmController')['dateStart']);
    bookingsGrid.addParameter('dateEnd', View.controllers.get('reviewBookingByEmController')['dateEnd']);
    bookingsGrid.refresh();
}
