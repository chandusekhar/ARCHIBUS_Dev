var abCoursesByEm = View.createController('abCoursesByEm',{
     treePanelHistory_onViewDoc: function(row){
			row = row.record;
			var keys = { 'course_id':  row['UC_certifications.course_id'], 'em_id':  row['UC_certifications.em_id'], 'start_date':  row['UC_certifications.start_date.raw'] }; 
			var doc = row['UC_certifications.doc']
			View.showDocument(keys, 'uc_certifications', 'doc',doc ); 
     }
	 
	 
});
 