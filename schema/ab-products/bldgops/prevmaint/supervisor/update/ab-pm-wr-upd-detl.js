
var lastStepLogId;

/**
 * Called when form is loading<br />
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Take tabs restriction and reload form</li>
 * 		<li><a href='#createStatusSelectList'>Create selection list for the status</a> according to the current status</li>
 *	</ol>
 */
var wrDetailUpdateController = View.createController('wrDetailUpdateController', {
    options: [],
    wo_upd_wr_form_afterRefresh: function(){
        var record = this.wo_upd_wr_form.getRecord();
        createStatusSelectList(this.wo_upd_wr_form);
        
        this.wo_upd_cf_form.setRecord(record);
        this.wo_upd_cost_form.setRecord(record);
        
        this.wo_upd_cf_form.show();
        this.wo_upd_cost_form.show();
        
        var wrId = this.wo_upd_wr_form.getFieldValue('wr.wr_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wr.wr_id', wrId, '=');
        this.wo_upd_cf_form.restriction = restriction;
        
        showVerificationAction(this.wo_upd_wr_form);
        var tabs = View.parentTab.parentPanel;
        if (tabs && tabs.isCfUpdate) {
            this.wo_upd_wr_form.enableField('wr.ac_id', false)
            this.wo_upd_wr_form.enableField('wr.dv_id', false)
            this.wo_upd_wr_form.enableField('wr.dp_id', false)
            this.wo_upd_wr_form.enableField('wr.description', false)
        }
    },
    
    wo_upd_cf_form_afterRefresh: function(){
        showVerificationAction(this.wo_upd_wr_form);
    }
});

