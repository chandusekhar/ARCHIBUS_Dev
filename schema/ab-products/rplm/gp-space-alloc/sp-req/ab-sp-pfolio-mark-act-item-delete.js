var svgDwgMarkupDeleteController = View.createController('svgDwgMarkupDeleteController', {	

	markUpDelete_onDelete:function(){
		var activityLogId = this.markUpDelete.getFieldValue("activity_log.activity_log_id");
		if (activityLogId) {
			//firstly delete mark-up
			var restriction = new Ab.view.Restriction();
			restriction.addClause("afm_redlines.activity_log_id", activityLogId);
			var markUpRecords  = this.abSpPfolioActionRedlineDS.getRecords(restriction);
			if ( markUpRecords && markUpRecords.length>0 ) {
				this.abSpPfolioActionRedlineDS.deleteRecord(markUpRecords[0]);
			}

			//secondly determine if need to delete action item
			var option = this.markUpDelete.getFieldValue("deleteOption");
			if ( 'both' === option ) {
				restriction = new Ab.view.Restriction();
				restriction.addClause("activity_log.activity_log_id", activityLogId);
				var acLogRecords  = this.markUpDeleteDS.getRecords(restriction);
				if ( acLogRecords && acLogRecords.length>0 ) {
					this.markUpDeleteDS.deleteRecord(acLogRecords[0]);
				}
			}

			// finally refresh parent view's grid
			View.getOpenerView().panels.get('abSpPfolioMarkItemGrid').refresh();
			View.getOpenerView().closeDialog();
		}
	}
});



