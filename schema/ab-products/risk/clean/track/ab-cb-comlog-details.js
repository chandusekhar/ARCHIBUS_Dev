var abCbComlogDetailsCtrl = View.createController('abCbComlogDetailsCtrl', {
	projCommlogsDetailsColumnReport_afterRefresh: function(){
		if(this.projCommlogsDetailsColumnReport.getFieldValue("activity_log.activity_type") == "ASSESSMENT - HAZMAT"){
			// hazard assessment category
			this.projCommlogsDetailsColumnReport.setFieldLabel("activity_log.activity_log_id", getMessage("title_assessment_item"));
		}
	}
});
