
View.createController('createSchedCosts', {
    
    costGrid_onCalculate: function() {
        View.openProgressBar(getMessage('calculateMessage'));
        try {
            var restriction = '(cost_tran.bl_id = \'HQ\')';
            Workflow.callMethod('AbCommonResources-CostService-calculateChargebackCosts', restriction, true, true);
            
            this.costGrid.refresh();
            this.costReport.show(false);
            View.closeProgressBar();
        } catch (e) {
            View.closeProgressBar();
            Workflow.handleError(e);
        }
    },
    
    costGrid_onApproveAllChargebackCosts: function() {
        View.openProgressBar(getMessage('approveMessage'));
        try {
            var restriction = '(cost_tran_sched.bl_id = \'HQ\')';
            Workflow.callMethod('AbCommonResources-CostService-approveAllChargebackCosts', restriction);
            
            this.costGrid.refresh();
            this.costReport.show(false);
            View.closeProgressBar();
        } catch (e) {
            View.closeProgressBar();
            Workflow.handleError(e);
        }
    }
});