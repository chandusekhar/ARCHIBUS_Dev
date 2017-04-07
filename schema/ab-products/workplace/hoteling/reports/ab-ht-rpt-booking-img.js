var reviewARangeBookingImgController = View.createController('reviewARangeBookingImgController', {
    dateStart: '1900-12-15',
    dateEnd: '2200-12-15',
	/**
	 * Search booking by console 
	 */
    searchBookingConsole_onSearch: function(){
        this.setRestrictionParameter();
        this.roomsGrid.addParameter('dateStart', this.dateStart);
        this.roomsGrid.addParameter('dateEnd', this.dateEnd);
        this.roomsGrid.refresh();
		 this.bookingsGrid.show(false);
        this.roomStdForm.show(false);
    },
	/**
	 * Clear console restriction 
	 */
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
		this.dateStart='1900-12-15';
		this.dateEnd='2200-12-15';
        this.roomsGrid.show(false);
        this.bookingsGrid.show(false);
        this.roomStdForm.show(false);
    },
	/**
	 * Set parameter for console
	 */
    setRestrictionParameter: function(){
        var dateStart = this.searchBookingConsole.getFieldValue("rmpct.date_start");
        var dateEnd = this.searchBookingConsole.getFieldValue("rmpct.date_end");
        if (dateStart && dateEnd && dateStart <= dateEnd) {
            this.dateStart = dateStart;
            this.dateEnd = dateEnd;
        }
        else 
            if (!dateStart && !dateEnd) {
                this.dateStart = '1900-12-15';
                this.dateEnd = '2200-12-15';
                
            }
            else 
                if (!dateStart && dateEnd) {
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
 * Refresh report when you click booking row
 */
function roomReportOnClick(){

    var grid = View.panels.get('roomsGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var blId = selectedRow["rm.bl_id"];
    var flId = selectedRow["rm.fl_id"];
    var rmId = selectedRow["rm.rm_id"];
    var bookingsGrid = View.panels.get('bookingsGrid');
    bookingsGrid.addParameter('dateStart', View.controllers.get('reviewARangeBookingImgController')['dateStart']);
	 bookingsGrid.addParameter('dateEnd', View.controllers.get('reviewARangeBookingImgController')['dateEnd']);
    bookingsGrid.addParameter('blId', "='" + blId + "'");
    bookingsGrid.addParameter('flId', "='" + flId + "'");
    bookingsGrid.addParameter('rmId', "='" + rmId + "'");
    bookingsGrid.refresh();
    var rmStd = selectedRow["rm.rm_std"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('rmstd.rm_std', rmStd, '=');
    var roomStdForm = View.panels.get('roomStdForm');
    roomStdForm.refresh(restriction);
}
