
/**
 * @author Song
 * For all of these views, check value of activity parameter
 * "ResyncWorkspaceTransactionsTable" If it is set to "Yes", then warn the user that
 * he or she should first run Reconcile Workspace Transactions before continuing:
 * "The workspace transaction records may be out-of-synch with their associated room
 * records. Please run the action "Reconcile Workspace Transactions" before
 * continuing."
 */
var controller = View.createController('controller', {
	/**
	 * check if param 'ResyncWorkspaceTransactionsTable' is 'Yes'
	 */
	afterInitialDataFetch: function(){
        var abSyncRoomSharedDS = View.dataSources.get("abSyncRoomSharedDS");
   	    var restriction = " param_id = 'ResyncWorkspaceTransactionsTable'";
        var recs = abSyncRoomSharedDS.getRecords(restriction);
        if (recs != null&&recs.length>0){
        	var param_value = recs[0].getValue('afm_activity_params.param_value');
        	if(param_value=='1'){
        		View.showMessage(getMessage('isOutOfSynch'));
        	}
        } 
	}
});
