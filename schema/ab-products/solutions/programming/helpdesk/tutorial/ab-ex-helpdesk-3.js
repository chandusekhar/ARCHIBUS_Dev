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
        
        // highlight status colors for all grid rows
        this.mainPanel.gridRows.each(function(row) {
            // get status code from the row record
            var status = row.getRecord().getValue('activity_log.status');
            
            // map status code to a color
            var color = '#707070';
            switch (status) {
                case 'APPROVED': color = '#32cd32'; break;  
                case 'COMPLETED': color = '#4040f0'; break;  
                case 'REJECTED': color = '#f04040'; break;  
            };
            
            // get <td> element that displays the status in this row, and set its CSS properties
            var cell = row.cells.get('activity_log.status');
            Ext.get(cell.dom).setStyle('color', color);
            Ext.get(cell.dom).setStyle('font-weight', 'bold');
        });
    }
});
