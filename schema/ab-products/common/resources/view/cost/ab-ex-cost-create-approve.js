
View.createController('createSchedCosts', {
    
    recurCostGrid_onCreateSchedCosts: function() {
        
        var dateEnd = this.recurCostConsole.getRecord().getValue('cost_tran_recur.date_end');
        if (!valueExistsNotEmpty(dateEnd)) {
        	View.alert(getMessage('messageEndDate'));
        	return;
        }

        dateEnd = this.recurCostDS.formatValue('cost_tran_recur.date_end', dateEnd, false);
        
        var costIds = this.getCostIdsFromSelectedRows(this.recurCostGrid, 'cost_tran_recur.cost_tran_recur_id');
        if (costIds.length == 0) {
        	View.alert(getMessage('messageRecurringCosts'));
        	return;
        }
        
        try {
            Workflow.callMethod('AbCommonResources-CostService-createScheduledCosts', costIds, dateEnd);
            
            this.schedCostGrid.refresh();
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    schedCostGrid_onApproveSchedCosts: function() {
        var costIds = this.getCostIdsFromSelectedRows(this.schedCostGrid, 'cost_tran_sched.cost_tran_sched_id');

        try {
            Workflow.callMethod('AbCommonResources-CostService-approveScheduledCosts', costIds);
            
            this.schedCostGrid.refresh();
            this.actualCostGrid.refresh();
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    getCostIdsFromSelectedRows: function(grid, fieldName) {
        var selectedCosts = grid.getSelectedRecords();
        
        var costIds = [];
        for (var i = 0; i < selectedCosts.length; i++) {
            var costId = selectedCosts[i].getValue(fieldName);
            costIds.push(costId);
        }
        
        return costIds;
    }
});