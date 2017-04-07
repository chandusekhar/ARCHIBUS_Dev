var rplmAmendmentsController = View.createController('rplmAmendments',{
	
	gridLeaseAdminAmendments_onDocument: function(row){
		/*
		 * 03/31/2009 IOAN kb 3026733
		 */
		View.showDocument({'ls_amend_id':row.getFieldValue('ls_amendment.ls_amend_id')},'ls_amendment','doc',row.getFieldValue('ls_amendment.doc'));
	},
	gridLeaseAdminAmendments_onDelete: function(row){
		var dataSource = this.dsLeaseAdminAmendments;
		var record = row.getRecord();
		var reportPanel = this.gridLeaseAdminAmendments;
		View.confirm(getMessage('message_amendment_confirmdelete'), function(button){
			if(button == 'yes'){
                try {
					dataSource.deleteRecord(record);
					reportPanel.refresh(reportPanel.restriction);
                } catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
				
			}
		})
	},
	formAmendment_onSave:function(){
		var isNewRecord = this.formAmendment.newRecord;
		if(isNewRecord){
			this.formAmendment.setFieldValue('ls_amendment.ls_id' , View.controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl').ls_id);
		}
		this.formAmendment.save();
		this.gridLeaseAdminAmendments.refresh();
		if(!isNewRecord){
			this.formAmendment.closeWindow();
		}
	}
})