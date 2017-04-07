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
    },
    
    /**
     * Event handler for the View Details link.
     * Opens work request read-only report in a dialog window.
     */
    mainPanel_onView: function(row, action) {
        var record = row.getRecord();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', record.getValue('activity_log.activity_log_id'));
        View.openDialog('ab-ex-helpdesk-view.axvw', restriction, false, {width:600, height:400});
    },
    
    /**
     * Event handler for the Edit Details link.
     * Opens work request edit form in a dialog window.
     */
    mainPanel_onEdit: function(row, action) {
        var record = row.getRecord();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', record.getValue('activity_log.activity_log_id'));
        View.openDialog('ab-ex-helpdesk-edit.axvw', restriction, false, {width:600, height:400, closeButton:false});
    },
    
    /**
     * Event handler for the Withdraw link.
     */
    mainPanel_onWithdraw: function(row, action) {
        var record = row.getRecord();
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmWithdraw'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    record.isNew = false;
                    record.setValue('activity_log.status', 'CANCELLED');
                    controller.mainDataSource.saveRecord(record);  
                    if (controller.mainPanel) {
                        controller.mainPanel.refresh();
                    }
                } catch (e) {
                    var message = String.format(getMessage('errorWithdraw'), actionId);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    }
});
