/**
 * Controller implementation.
 */
var abRepmLsadminCommLogCtrl = View.createController('abRepmLsadminCommLogCtrl', {
	filterRestriction: null, 
	
	afterInitialDataFetch: function(){
		if(View.taskInfo.processId == "Reports"){
			this.view.setTitle(getMessage("viewTitleReport"));
		}
	},
	
	abRepmLsadminCommLogConsole_filter_onShow: function(){
		this.filterRestriction = abRepmLsadminCommLogConsoleCtrl.getFilterRestriction();
		this.abRepmLsadminCommLogGrid.refresh(this.filterRestriction);
	},
	
	abRepmLsadminCommLogGrid_onDelete: function(row){
        var dataSource = this.abRepmLsadminCommLogDs;
        var record = new Ab.data.Record({
     	   'ls_comm.auto_number': row.getFieldValue('ls_comm.auto_number')
     	});
        var reportPanel = this.abRepmLsadminCommLogGrid;
        var confirmMessage = getMessage('message_confirmdelete').replace("{0}",row.getFieldValue('ls_comm.comm_id'));
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
    }
});