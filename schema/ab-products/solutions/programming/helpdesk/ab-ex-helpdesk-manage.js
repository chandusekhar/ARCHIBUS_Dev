/**
 * Controller.
 */
var helpdeskManageController = View.createController('helpdeskManageController', {
    
    
    afterViewLoad: function() {

    },
    
    afterInitialDataFetch: function() {
        var mainPanel = View.getOpenerView().panels.get('mainPanel');
        if (mainPanel) {
            var currentStatus = mainPanel.rows[mainPanel.selectedRowIndex]['activity_log.status'];
            var action_id = mainPanel.rows[mainPanel.selectedRowIndex]['activity_log.activity_log_id'];
            var restriction = new Ab.view.Restriction();
            restriction.addClause('activity_log.activity_log_id', action_id);
            
            if (currentStatus == 'REQUESTED') 
            {
            	this.requestFormReview.show(true);
            }
            else if (currentStatus == 'IN PROGRESS') 
            {
    	        this.requestFormClose.refresh(restriction);
    	        this.requestFormClose.show(true);            	
    	        this.requestTabs.selectTab('close');
            }
            else if (currentStatus == 'COMPLETED' || currentStatus == 'COMPLETED-V' || currentStatus == 'CLOSED' || currentStatus == 'CANCELLED' || currentStatus == 'REJECTED') 
            {
    	        this.requestFormFinalReview.refresh(restriction);
    	        this.requestFormFinalReview.show(true);            	
    	        this.requestTabs.selectTab('finalReview');
            }
            else 
            {
    	        this.requestFormIssue.refresh(restriction);
    	        this.requestFormIssue.show(true);            	
    	        this.requestTabs.selectTab('issue');
            }
        }
        else 
        {
        	this.requestFormFinalReview.refresh(restriction);
	        this.requestFormFinalReview.show(true);            	
	        this.requestTabs.selectTab('finalReview');
        }	
    },
	
    // ----------------------- event handlers -----------------------------------------------------
    
    /**
     * Event handler for the Withdraw button.
     */
    requestFormReview_onWithdrawItem: function() {
        var record = this.requestFormReview.getOutboundRecord();
        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmWithdraw'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'CANCELLED');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    
                    if (View.parentTab) {
                        View.parentTab.parentPanel.selectTab('mainTab');
                        View.parentTab.parentPanel.closeTab(View.parentTab.name);
                    }
            } 
        });
    },
    
    /**
     * Event handler for the Approve and Close button.
     */
    requestFormApprove_onApproveItemAndClose: function() {
        var record = this.requestFormApprove.getOutboundRecord();
        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmApprove'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'APPROVED');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    
                    if (View.parentTab) {
                        View.parentTab.parentPanel.selectTab('mainTab');
                        View.parentTab.parentPanel.closeTab(View.parentTab.name);
                    }
            } 
        });
    },
    
    /**
     * Event handler for the Approve and Next button.
     */
    requestFormApprove_onApproveItemAndNext: function() {
        var record = this.requestFormApprove.getOutboundRecord();
        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmApprove'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'APPROVED');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    controller.requestFormIssue.refresh(controller.requestFormApprove.restriction);
                    controller.requestFormIssue.show(true);
                    controller.requestTabs.selectTab('issue');
            } 
        });
    },
    
    /**
     * Event handler for the Reject and Close button.
     */
    requestFormApprove_onRejectItemAndClose: function() {
        var record = this.requestFormApprove.getOutboundRecord();
        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmReject'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'REJECTED');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    
                    if (View.parentTab) {
                        View.parentTab.parentPanel.selectTab('mainTab');
                        View.parentTab.parentPanel.closeTab(View.parentTab.name);
                    }
            } 
        });
    },
    
    /**
     * Event handler for the Issue and Close button.
     */
    requestFormIssue_onIssueItemAndClose: function() {
        var record = this.requestFormIssue.getOutboundRecord();
        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmIssue'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'IN PROGRESS');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    
                    if (View.parentTab) {
                        View.parentTab.parentPanel.selectTab('mainTab');
                        View.parentTab.parentPanel.closeTab(View.parentTab.name);
                    }
            } 
        });
    },
    
    /**
     * Event handler for the Issue and Next button.
     */
    requestFormIssue_onIssueItemAndNext: function() {
        var record = this.requestFormIssue.getOutboundRecord();
      
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmIssue'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'IN PROGRESS');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    
                    controller.requestFormClose.refresh(controller.requestFormIssue.restriction);
                    controller.requestFormClose.show(true);
                    controller.requestTabs.selectTab('close');
            } 
        });
    },
    
    /**
     * Event handler for the Close button.
     */
    requestFormClose_onCloseItem: function() {
        var record = this.requestFormClose.getOutboundRecord();        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmClose'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
            	   record.setValue('activity_log.status', 'COMPLETED');
                   controller.requestDataSource.saveRecord(record);  
                    
                    var mainPanel = View.getOpenerView().panels.get('mainPanel');
                    if (mainPanel) {
                        mainPanel.refresh();
                    }
                    
                    if (View.parentTab) {
                        View.parentTab.parentPanel.selectTab('mainTab');
                        View.parentTab.parentPanel.closeTab(View.parentTab.name);
                    }
            } 
        });
    }
});
