var reviewBookingByEmController = View.createController('reviewBookingByEmController', {
    emId: '',
    
    searchBookingConsole_onSearch: function(){
        this.setRestrictionParameter();
        if (this.emId) {
            this.employeesGrid.addParameter('emId', " = '" + this.emId + " '");
        }
        else {
            this.employeesGrid.addParameter('emId', 'IS NOT NULL');
        }
        this.employeesGrid.refresh();
        this.bookingsGrid.show(false);
        
    },
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        this.emId = '';
        this.employeesGrid.show(false);
        this.bookingsGrid.show(false);
        
    },
	
	//Set panel title
	bookingsGrid_afterRefresh: function(){
		this.bookingsGrid.setTitle(getMessage('title_summary')+" "+ this.emId);
	},

    setRestrictionParameter: function(){
        var emId = this.searchBookingConsole.getFieldValue("rmpct.em_id");
            this.emId = emId;
    }
})

function employeeReportOnClick(){
    var grid = View.panels.get('employeesGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    
    var emId = selectedRow["em.em_id"];
	reviewBookingByEmController.emId=emId;
    var restriction = new Ab.view.Restriction();
    restriction.addClause('rmpct.em_id', emId, '=');
    var bookingsGrid = View.panels.get('bookingsGrid');
    bookingsGrid.refresh(restriction);
}
