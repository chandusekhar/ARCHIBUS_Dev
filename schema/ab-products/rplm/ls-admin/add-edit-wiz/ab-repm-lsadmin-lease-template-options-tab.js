var rplmOptionsController = View.createController('rplmOptions', {
    gridLeaseAdminOptions_onDocument: function(row){
		/*
		 * 03/31/2009 IOAN kb 3026733
		 */
		View.showDocument({'op_id':row.getFieldValue('op.op_id'), 'ls_id':row.getFieldValue('op.ls_id')},'op','doc',row.getFieldValue('op.doc'));
    },
    gridLeaseAdminOptions_onDelete: function(row){
        var dataSource = this.dsLeaseAdminOptions;
        var record = row.getRecord();
        var reportPanel = this.gridLeaseAdminOptions;
        View.confirm(getMessage('message_option_confirmdelete'), function(button){
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
        })
    },
	
	formOption_onSave:function(){
		var isNewRecord = this.formOption.newRecord;
		if(isNewRecord){
			this.formOption.setFieldValue('ls_resp.ls_id' , View.controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl').ls_id);
		}
		this.formOption.save();
		this.gridLeaseAdminOptions.refresh();
		if(!isNewRecord){
			this.formOption.closeWindow();
		}
	}
});