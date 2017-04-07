var bldgopsMangeSearchCtrl = View.createController('bldgopsMangeSearchCtrl', {

	normalFilterFields: [ ["wr.activity_log_id", "activity_log_hactivity_log.activity_log_id"], 
										["wr.wr_id", "wrhwr.wr_id"], ["wr.wo_id", "wrhwr.wo_id"],
										["wr.activity_type", "activity_log_hactivity_log.activity_type"], ["wr.prob_type", "activity_log_hactivity_log.prob_type"], 
										["wr.site_id", "activity_log_hactivity_log.site_id"], ["wr.bl_id", "activity_log_hactivity_log.bl_id"], 
										["wr.fl_id", "activity_log_hactivity_log.fl_id"], ["wr.rm_id", "activity_log_hactivity_log.rm_id"], 
										["activity_log.assigned_to", "activity_log_hactivity_log.assigned_to"], ["wr.requestor", "activity_log_hactivity_log.requestor"],
										["wr.vn_id", "activity_log_hactivity_log.vn_id"], ["wr.eq_id", "activity_log_hactivity_log.eq_id"], 
										["wr.supervisor","wrhwr.supervisor"], ["wr.work_team_id","wrhwr.work_team_id"] ],

   	dateFilterFields: ["activity_log_hactivity_log.date_requested", "activity_log_hactivity_log.date_escalation_response","activity_log_hactivity_log.date_escalation_completion"], 
	
	subSqlFilterFields: ["tr_id", "cf_id","eq_std"], 

	searchConsolePanel_onSearch: function() {
		var console = this.searchConsolePanel;
		var sqlRestriction = " 1=1 ";

		sqlRestriction += this.getCheckBoxFieldRestriction();    	    	 

		sqlRestriction += this.getDateIntervalRestriction();    	    	 

		sqlRestriction += this.getNormalFieldsRestriction();    	    	 

		sqlRestriction += this.getSubSqlRestriction();    	    	 
		sqlRestriction += this.getStatusRestriction();    	    	 
		// apply restriction to the tabbed view and select the second page
		var tabPanel = View.getView('parent').panels.get('tabs');
		tabPanel.searchRstriction = sqlRestriction;  
		var tab =  tabPanel.findTab('results'); 
		tab.loadView();
		tabPanel.selectTab('results',null, false, false, true);
	},
		
	getCheckBoxFieldRestriction: function() {
		var restriction = "";
		if(document.getElementById("escalated_response").checked){
			restriction += " AND activity_log_hactivity_log.escalated_response=1 ";
		}
		if(document.getElementById('escalated_completion').checked){
			restriction += " AND activity_log_hactivity_log.escalated_completion=1 ";
		}
		if(document.getElementById('not_closed').checked){
			restriction += " AND activity_log_hactivity_log.status!='CLOSED' ";
		}
		if(document.getElementById('open_steps').checked){
			restriction += ( " AND ( exists (SELECT 1 FROM wr_step_waiting where wrhwr.wr_id=wr_step_waiting.wr_id) " 
										+ "			OR exists( select 1 from activity_log_step_waiting where activity_log_hactivity_log.activity_log_id= activity_log_step_waiting.activity_log_id)   " 
										+")"  ) ;
		}
		return restriction;
	},

	getDateIntervalRestriction: function() {    	    	 
		var dateRes = "";
        for (var i=0; i<this.dateFilterFields.length; i++) {
			var dateField = this.dateFilterFields[i];
			
			var fromValue = this.searchConsolePanel.getFieldValue(dateField+".from");
			if (fromValue) {
				dateRes = dateRes + " AND " + dateField+" is not null and ${sql.yearMonthDayOf('" + dateField+"')} >='"+ fromValue+"' ";
			}

			var toValue = this.searchConsolePanel.getFieldValue(dateField+".to");
			if (toValue) {
				dateRes = dateRes + " AND " + dateField+" is not null and ${sql.yearMonthDayOf('" + dateField+"')} <='"+ toValue+"' ";
			}
		}
		return   dateRes;
	},

	getNormalFieldsRestriction: function() {
		var restriction = "";
		for (var i=0; i<this.normalFilterFields.length; i++) {
			var srcField =  this.normalFilterFields[i][0];
			var destField =  this.normalFilterFields[i][1] ?  this.normalFilterFields[i][1] : srcField  ; 
			var value = this.searchConsolePanel.getFieldValue( srcField );
			if (value)
				restriction += (" AND " + destField + "=${sql.literal('" + value+"')} ");    	    	 
		}
		return restriction;
	},

	getSubSqlRestriction: function() {
		var restriction = "";
		var cfId =   this.searchConsolePanel.getFieldValue("wrcf.cf_id"); 
		if ( cfId )
			restriction += ( " AND EXISTS (SELECT 1 FROM wrcf WHERE wrhwr.wr_id = wrcf.wr_id AND wrcf.cf_id =${sql.literal('" + cfId+"')} )" );
		
		var trId =   this.searchConsolePanel.getFieldValue("wr.tr_id"); 
		if ( trId )
			restriction += ( " AND (wrhwr.tr_id =${sql.literal('" +trId	 +"')}" 
                    + " OR EXISTS (SELECT 1 FROM wrtr WHERE wrhwr.wr_id = wrtr.wr_id "
                    + " AND wrtr.tr_id =${sql.literal('" +trId	 +"')} ) "
                    + " OR EXISTS (SELECT 1 FROM wrcf WHERE wrhwr.wr_id = wrcf.wr_id "
                    + " AND ( wrcf.scheduled_from_tr_id =${sql.literal('" +trId	 +"')} "
                    + " OR wrcf.cf_id IN (SELECT cf.cf_id FROM cf WHERE cf.tr_id =${sql.literal('" +trId	 +"')} )  )" 
                    + " )  )" );
					
		var eqStd =   this.searchConsolePanel.getFieldValue("eq.eq_std"); 
		if ( eqStd )
			restriction += ( " AND EXISTS (SELECT 1 FROM eq WHERE activity_log_hactivity_log.eq_id = eq.eq_id AND eq.eq_std =${sql.literal('" +eqStd +"')} ) "); 
		return restriction;
	},

    getStatusRestriction:function (status) {
		var restriction = "";
		var status =   this.searchConsolePanel.getFieldValue("wr.status");
		if (status){
			var srStatus = this.getConvertedStatus(status);
			if ( srStatus && 'N/A'!=status ) {
				restriction += ( "  AND (activity_log_hactivity_log.status =  '"+srStatus+"' OR " + " wrhwr.status='"+status+"')  " ) ; 
			} else {
				restriction += ( "  AND  wrhwr.status='"+status+"'  " ) ; 
			}
		}
        return restriction;
    }, 
    
    getConvertedStatus:function (status) {
		var srStatus=""; 
		if ('C'==status ) {
			srStatus = 	  'CREATED';
		}	else  if ('R'==status ) {
			srStatus = 	  'REQUESTED';
		}	else  if ('A'==status ) {
			srStatus = 	  'APPROVED';
		}	else  if ('Rej'==status ) {
			srStatus = 	  'REJECTED';
		}	else  if ('I'==status ) {
			srStatus = 	  'IN PROGRESS';
		}	else  if ('S'==status ) {
			srStatus = 	  'STOPPED';
		}	else  if ('Can'==status ) {
			srStatus = 	  'CANCELLED';
		}	else  if ('Com'==status ) {
			srStatus = 	  'COMPLETED';
		}	else  if ('Clo'==status ) {
			srStatus = 	  'CLOSED';
		}	else  if ( 'Rev'==status  ||  'AA'==status    ||   'HP'==status   ||  'HA'==status   ||  'HL'==status) {
			srStatus =  null ;
		}	

		return srStatus;
	},

	searchConsolePanel_onClear:function() {
		var console = this.searchConsolePanel;
		console.clear(); //clear 'normal' fields

		//clear checkboxes
		document.getElementById("escalated_response").checked = 0;
		document.getElementById('escalated_completion').checked = 0;
		document.getElementById("open_steps").checked = 0;
		document.getElementById("not_closed").checked = 0;
	}
});