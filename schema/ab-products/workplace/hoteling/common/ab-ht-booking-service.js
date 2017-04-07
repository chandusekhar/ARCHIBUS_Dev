

var bookingServiceController = View.createController('bookingServiceController', {
    consoleRestriction: new Object(),
    resShort: new Object(),
	/**
	 * Search booking by console'restriction
	 */
    searchBookingConsole_onSearch: function(){
        this.consoleRestriction = this.getRestriction();
        this.selectBookingGrid.refresh(this.consoleRestriction);
    },
	/**
	 * Clear console's restriction
	 */
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        var selectElement = document.getElementById("defineDate");
        selectElement.selectedIndex=0;
		$('searchBookingConsole_rmpct.date_start').disabled = false;
		$('searchBookingConsole_rmpct.date_end').disabled = false;
    },
	/**
	 * Set default value after console refresh
	 */
    searchBookingConsole_afterRefresh: function(){
        var selectElement = document.getElementById("defineDate");
        selectElement.value = '';
    },
    /**
     * Open view 'ab-ht-booking-hl-fl-plan.axvw' in dialog
     * @param {Object} row
     */
    selectBookingGrid_locateImage_onClick: function(row){		
        View.locRecord = row.getRecord();
        View.openDialog("ab-ht-booking-hl-fl-plan.axvw");
    },
    /**
     * Open view 'ab-ht-booking-service-details.axvw' when you click details button
     * @param {Object} row
     */
    selectBookingGrid_details_onClick: function(row){
        var record = row.getRecord();
        var pct_id = record.getValue("rmpct.pct_id");
		//for refresh the detialdialog' second grid
        this.resShort = new Ab.view.Restriction();
        this.resShort.addClause('rmpct.bl_id', record.getValue("rmpct.bl_id"), '=');
        this.resShort.addClause('rmpct.fl_id', record.getValue("rmpct.fl_id"), '=');
        this.resShort.addClause('rmpct.rm_id', record.getValue("rmpct.rm_id"), '=');
        View.resShort = this.resShort;
        View.PctId = pct_id;
        View.consoleRestriction = this.getRestriction();
        View.openDialog("ab-ht-booking-service-details.axvw");
    },
    getRestriction: function(){
        var restriction = new Ab.view.Restriction();
        
        var pct_id = this.searchBookingConsole.getFieldValue("rmpct.pct_id");
        if (pct_id != '') {
            restriction.addClause('rmpct.pct_id', pct_id, '=');
        }
        var date_start = this.searchBookingConsole.getFieldValue("rmpct.date_start");
        if (date_start != '') {
            restriction.addClause('rmpct.date_end', date_start, '&gt;=');
        }
        var date_end = this.searchBookingConsole.getFieldValue("rmpct.date_end");
        if (date_end != '') {
            restriction.addClause('rmpct.date_start', date_end, '&lt;=');
        }
        var bl_id = this.searchBookingConsole.getFieldValue("rmpct.bl_id");
        if (bl_id != '') {
        
        
            restriction.addClause('rmpct.bl_id', bl_id, '=');
        }
        var fl_id = this.searchBookingConsole.getFieldValue("rmpct.fl_id");
        
        if (fl_id != '') {
        
            restriction.addClause('rmpct.fl_id', fl_id, '=');
        }
        var rm_id = this.searchBookingConsole.getFieldValue("rmpct.rm_id");
        if (rm_id != '') {
        
            restriction.addClause('rmpct.rm_id', rm_id, '=');
        }
        var em_id = this.searchBookingConsole.getFieldValue("rmpct.em_id");
        if (em_id != '') {
        
            restriction.addClause('rmpct.em_id', em_id, '=');
        }
        var dv_id = this.searchBookingConsole.getFieldValue("rmpct.dv_id");
        if (dv_id != '') {
        
            restriction.addClause('rmpct.dv_id', dv_id, '=');
        }
        var dp_id = this.searchBookingConsole.getFieldValue("rmpct.dp_id");
        if (dp_id != '') {
        
            restriction.addClause('rmpct.dp_id', dp_id, '=');
        }
        var resources = this.searchBookingConsole.getFieldValue("rmpct.resources");
        if (resources != '') {
        
            restriction.addClause('rmpct.resources', resources, '=');
        }
        var status = this.searchBookingConsole.getFieldValue("rmpct.status");
        if (status ) {
            restriction.addClause('rmpct.status', status, '=');
        }
        return restriction;
        
    }
})

function onPeriodChangeHandler(gridId){
    var selectedEL = document.getElementById("defineDate");
    var priorityValue = selectedEL.options[selectedEL.selectedIndex].value
    var currdate = new Date();
    var date_start = '';
    var date_end = '';
	$('searchBookingConsole_rmpct.date_start').disabled = false;
	$('searchBookingConsole_rmpct.date_end').disabled = false;
    if (priorityValue == 'no') {
        date_start = '';
        date_end = ''
		View.panels.get(gridId)
        View.panels.get(gridId).setFieldValue("rmpct.date_start", date_start);
        View.panels.get(gridId).setFieldValue("rmpct.date_end", date_end);
		return;
    }
    if (priorityValue == 'today') {
        date_start = getIsoFormatDate(currdate);
        date_end = getIsoFormatDate(currdate);
    }
    if (priorityValue == 'tomorrow') {
        date_start = getIsoFormatDate(DateMath.add(currdate, DateMath.DAY, 1));
        date_end = getIsoFormatDate(DateMath.add(currdate, DateMath.DAY, 1));
		
    }
    if (priorityValue == 'nextw') {
		var currdate=getFirstDateOfWeek(currdate);
        date_start = getIsoFormatDate(DateMath.add(currdate, DateMath.DAY, 7));
        date_end = getIsoFormatDate(DateMath.add(DateMath.add(currdate, DateMath.DAY, 7), DateMath.DAY, 6));
		
    }
    View.panels.get(gridId)
    View.panels.get(gridId).setFieldValue("rmpct.date_start", date_start);
    View.panels.get(gridId).setFieldValue("rmpct.date_end", date_end);
	$('searchBookingConsole_rmpct.date_start').disabled = true;
	$('searchBookingConsole_rmpct.date_end').disabled = true;
}
/**
 * Get First Date of Week
 * @param {Object} theDate
 */
function getFirstDateOfWeek(theDate){
var firstDateOfWeek;
theDate.setDate(theDate.getDate() - theDate.getDay()); // 
firstDateOfWeek = theDate;
return firstDateOfWeek; 
}
