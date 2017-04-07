var rplmClausesController = View.createController('rplmClauses',{
	
	gridLeaseAdminClauses_onDocument: function(row){
		/*
		 * 03/30/2009 IOAN kb 3026733
		 */
		View.showDocument({'ls_id':row.getFieldValue('ls_resp.ls_id'), 'resp_id':row.getFieldValue('ls_resp.resp_id')},'ls_resp','doc',row.getFieldValue('ls_resp.doc'));
	},
	gridLeaseAdminClauses_onDelete: function(row){
		var dataSource = this.dsLeaseAdminClauses;
		var record = row.getRecord();
		var reportPanel = this.gridLeaseAdminClauses;
		View.confirm(getMessage('message_clause_confirmdelete'), function(button){
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
	
	formClause_onSave:function(){
		var isNewRecord = this.formClause.newRecord;
		if(isNewRecord){
			this.formClause.setFieldValue('ls_resp.ls_id' , View.controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl').ls_id);
		}
		this.formClause.save();
		this.gridLeaseAdminClauses.refresh();
		if(!isNewRecord){
			this.formClause.closeWindow();
		}
	}
})

function checkClauseFields(){
	var controller = rplmClausesController;
	if(controller.formClause.getFieldValue('ls_resp.dates_match_lease') == 1){
		controller.formClause.enableField('ls_resp.date_start', false);
		controller.formClause.enableField('ls_resp.date_end', false);
	}else if(controller.formClause.getFieldValue('ls_resp.dates_match_lease')==0){
		controller.formClause.enableField('ls_resp.date_start', true);
		controller.formClause.enableField('ls_resp.date_end', true);
	}
}
