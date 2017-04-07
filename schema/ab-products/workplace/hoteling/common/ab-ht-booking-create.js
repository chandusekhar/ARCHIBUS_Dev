/**
 * @author Jiangtao Guo
 */
View.createController('abHtBookingCreateController', {

    /**
     * Select and Enable the first tab and disable other tabs
     */
    afterInitialDataFetch: function() {
        var tabs = View.panels.get("tabsFrame");
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('selectBooking');
        tabs.disableTab('confirmBooking');
        this.popupWarningForNonEmployee();
    },
    
    /**
     * Give a warn message that it can't create booking for itself if the user is not an employee.
     */
    popupWarningForNonEmployee: function() {
    	var userId = View.user.employee.id;
    	if(!userId) {
    		View.alert(getMessage('unauthorizedBookingCreator'));
    	}
    },
    
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.panels.get("tabsFrame");
        tabs.disableTab('searchBooking');
        tabs.disableTab('selectBooking');
        tabs.disableTab('confirmBooking');
        if (newTabName == 'confirmBooking') {
            tabs.enableTab('searchBooking');
        }
        tabs.enableTab(newTabName);
    }
});
