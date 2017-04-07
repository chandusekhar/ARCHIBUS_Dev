/**
 * Controller JavaScript class.
 */
var helpdeskController = View.createController('helpdeskController', {
    
    /**
     * Called after the view is loaded, but before initial data fetch.
     */
    afterViewLoad: function() {
        // display only first 10 records in the grid
        this.mainPanel.recordLimit = 10;
    },
    
    // ----------------------- event handlers -----------------------------------------------------
    
    mainPanel_afterRefresh: function() {
        
        // enable the Check Problem Status button if not all records can be displayed
        var hasMoreRecords = this.mainPanel.hasMoreRecords;
        this.mainPanel.actions.get('checkProblemStatus').enable(hasMoreRecords);
    }
});
