View.createController("manageNotificationsController", {

    consolePanel_onShow: function(){
        var restriction = new Ab.view.Restriction();
        var console = this.consolePanel;
        
        
        var activity_id = console.getFieldValue('messages.activity_id');
        if (activity_id != '') {
            restriction.addClause('messages.activity_id', activity_id + '%', 'LIKE');
        }
        
        var referenced_by = console.getFieldValue('messages.referenced_by');
        if (referenced_by != '') {
            restriction.addClause('messages.referenced_by', referenced_by + '%', 'LIKE');
        }
        
        var message_id = console.getFieldValue('messages.message_id');
        if (message_id != '') {
            restriction.addClause('messages.message_id', message_id + '%', 'LIKE');
        }
        
        
        
        // apply restriction to the report
        this.manageNotifications_treePanel.refresh(restriction);
        
        // show the report
        this.manageNotifications_treePanel.show(true);
		this.manageNotifications_detailsPanel.show(false);
    }
    
    
});

