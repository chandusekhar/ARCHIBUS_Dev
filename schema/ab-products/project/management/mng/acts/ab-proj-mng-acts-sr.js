var projMngActsSrController = View.createController('projMngActsSr', {

	projMngActsSr_afterRefresh: function() {
		var activity_log_id = this.projMngActsSr.restriction.findClause('activity_log.copied_from').value;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', activity_log_id);
		var record = this.projMngActsSrDs1.getRecord(restriction);
		var action_title = record.getValue('activity_log.action_title');
		
		this.projMngActsSr.appendTitle(activity_log_id + " " + action_title);
	}
});





