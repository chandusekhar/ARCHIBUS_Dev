/**
 * Controller.
 */
var helpdeskManagerController = View.createController('helpDeskManager', {
    
    /**
     * True if auto-refresh is on.
     */
    autoRefreshEnabled: false,
    
    /**
     * Auto-refresh interval in seconds.
     */
    autoRefreshInterval: 60,
    
    /**
     * Record being viewed. Can also be approved or rejected.
     */
    selectedRecord: null,

    afterInitialDataFetch: function() {
        this.inherit();
        this.refreshView();
        
        this.requestReport.showHeader(false);
        
        Ext.get('autoRefresh').dom.nextSibling.innerHTML = ' ' + getMessage('autoRefreshMessage');
        Ext.get('autoRefresh').addListener('click', this.refreshPanel_onAutoRefresh, this);
        
        // start auto-refresh background task using Ext.util.TaskRunner
        var controller = this;
        var task = {
            run: function () {
                if (controller.autoRefreshEnabled) {
                    // refresh the UI
                    controller.refreshView();
                }
            },
            interval: 1000 * controller.autoRefreshInterval
        }
        var runner = new Ext.util.TaskRunner();
        runner.start(task);
    },
    
    // ----------------------- UI update methods --------------------------------------------------
    
    /**
     * Refreshes action items lists in all tabs.
     */
    refreshView: function() {
        this.newRequestsGrid.refresh(new Ab.view.Restriction({'activity_log.status': 'REQUESTED'}));
        this.approvedRequestsGrid.refresh(new Ab.view.Restriction({'activity_log.status': 'APPROVED'}));
        this.completedRequestsGrid.refresh(new Ab.view.Restriction({'activity_log.status': 'COMPLETED'}));
        this.rejectedRequestsGrid.refresh(new Ab.view.Restriction({'activity_log.status': 'REJECTED'}));

        var lastRefreshed = new Date().format('g:i:s A');
        Ext.get('lastRefresh').dom.innerHTML = getMessage('lastRefreshMessage') + ': ' + lastRefreshed;
    },
    
    /**
     * Called after the selected record has changed, either because the user selected another record
     * or because the record content has been changed. 
     */
    onModelChange: function() {
        this.requestReport.setRecord(this.selectedRecord);
        this.refreshView();
    },
    
    // ----------------------- event listeners ----------------------------------------------------

    /**
     * User has changed the Auto Refresh checkbox value.
     * @param {Object} e
     * @param {Object} checkbox
     */
    refreshPanel_onAutoRefresh: function(e, checkbox) {
        this.autoRefreshEnabled = checkbox.checked;
    },
    
    /**
     * User has clicked on the Refresh button.
     */
    refreshPanel_onRefresh: function() {
        this.refreshView();
    },
    
    /**
     * User has clicked on the Approve button.
     */
    requestReport_onApprove: function() {
        // get the updated record from the form
        this.selectedRecord = this.requestReport.getRecord();

        // use try/catch to handle possible database or network errors
        try {
            // approve action item
            this.approve();
            
            // if success, update the UI
            this.onModelChange();
        } catch (e) {
            // log and display the error message
            var actionId = this.selectedRecord.getValue('activity_log.activity_log_id');
            var errorMessage = String.format(getMessage('errorApprove'), actionId);
            View.log(errorMessage, 'error');
            View.showMessage('error', errorMessage, e.message, e.data);
        }
    },
    
    /**
     * User has clicked on the Reject button.
     */
    requestReport_onReject: function() {
        this.selectedRecord = this.requestReport.getRecord();
        
        try {
            // reject action item
            this.reject();
            
            // no exception == successful rejection
            this.onModelChange();
            
        } catch (e) {
            var actionId = this.selectedRecord.getValue('activity_log.activity_log_id');
            var message = String.format(getMessage('errorReject'), actionId);
            View.log(message, 'error');
            View.showMessage('error', message, e.message, e.data);
        }
    },
    
    // ----------------------- business logic methods ---------------------------------------------
   
    approve: function() {
        this.selectedRecord.setValue('activity_log.status', 'APPROVED');
        this.requestDataSource.saveRecord(this.selectedRecord);
    },
    
    reject: function() {
        this.selectedRecord.setValue('activity_log.status', 'REJECTED');
        this.requestDataSource.saveRecord(this.selectedRecord);
    }
});
