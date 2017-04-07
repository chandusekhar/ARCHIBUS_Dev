var bldgopsExpressSearchFormController = View.createController('bldgopsExpressSearchFormController', {

	normalFilterFields: ["wr_id", "wo_id","requestor", "status", "prob_type", 
							"site_id", "bl_id", "fl_id", "rm_id", "vn_id", 
							"supervisor", "work_team_id", "eq_id", "manager"],

   	dateFilterFields: ["date_requested", "date_escalation_response","date_escalation_completion"], 
	
	subSqlFilterFields: ["tr_id", "cf_id","eq_std"], 

	searchConsolePanel_onSearch: function() {
		var console = this.searchConsolePanel;
		var sqlRestriction = " 1=1 ";

		sqlRestriction += this.getCheckBoxFieldRestriction();    	    	 

		sqlRestriction += this.getDateIntervalRestriction();    	    	 

		sqlRestriction += this.getNormalFieldsRestriction();    	    	 

		sqlRestriction += this.getSubSqlRestriction();    	    	 

		// apply restriction to the tabbed view and select the second page
		var tabPanel = View.getView('parent').panels.get('tabs');
		var resultsTab =  tabPanel.findTab('results'); 
		// force reload the tab
		resultsTab.refresh(sqlRestriction); 
		resultsTab.loadView();
		
		tabPanel.selectTab('results',sqlRestriction);     
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
			restriction += " AND wrhwr.status!='CLOSED' ";
		}
		if(document.getElementById('open_steps').checked){
			restriction += " AND wrhwr.wr_id IN (SELECT wr_id FROM wr_step_waiting) ";
		}
		return restriction;
	},

	getDateIntervalRestriction: function() {    	    	 
		var dateRes = "";
        for (var i=0; i<this.dateFilterFields.length; i++) {
			var dateField = this.dateFilterFields[i];
			
			var fromValue = this.searchConsolePanel.getFieldValue(dateField+".from");
			if (fromValue) {
				dateRes = dateRes + " AND wrhwr." + dateField+" is not null and ${sql.yearMonthDayOf('wrhwr." + dateField+"')} >='"+ fromValue+"' ";
			}

			var toValue = this.searchConsolePanel.getFieldValue(dateField+".to");
			if (toValue) {
				dateRes = dateRes + " AND wrhwr." + dateField+" is not null and ${sql.yearMonthDayOf('wrhwr." + dateField+"')} <='"+ toValue+"' ";
			}
		}
		return   dateRes;
	},

	getNormalFieldsRestriction: function() {
		var restriction = "";
		for (var i=0; i<this.normalFilterFields.length; i++) {
			var value = this.searchConsolePanel.getFieldValue( "wr."+this.normalFilterFields[i] );
			if (value)
				restriction += (" AND wrhwr." + this.normalFilterFields[i] + "=${sql.literal('" + value+"')} ");    	    	 
		}
		return restriction;
	},

	getSubSqlRestriction: function() {
		var restriction = "";
		var cfId =   this.searchConsolePanel.getFieldValue("wrcf.cf_id"); 
		if ( cfId )
			restriction += ( " AND (EXISTS (SELECT cf_id FROM wrcf WHERE wrhwr.wr_id = wrcf.wr_id AND wrcf.cf_id =${sql.literal('" + cfId+"')} ) " +
					"OR (EXISTS (SELECT cf_id FROM hwrcf WHERE wrhwr.wr_id = hwrcf.wr_id AND hwrcf.cf_id =${sql.literal('"+ cfId + "')})))" );
		
		var trId =   this.searchConsolePanel.getFieldValue("wr.tr_id"); 
		if ( trId )
			restriction += ( " AND (wrhwr.tr_id =${sql.literal('" +trId	 +"')}" 
                    + " OR EXISTS (SELECT tr_id FROM wrtr WHERE wrhwr.wr_id = wrtr.wr_id "
                    + " AND wrtr.tr_id =${sql.literal('" +trId	 +"')} ) "
                    + " OR EXISTS (SELECT tr_id FROM hwrtr WHERE wrhwr.wr_id = hwrtr.wr_id "
                    + " AND hwrtr.tr_id =${sql.literal('" +trId	 +"')} ) "
                    + " OR EXISTS (SELECT cf_id FROM wrcf WHERE wrhwr.wr_id = wrcf.wr_id "
                    + " AND ( wrcf.scheduled_from_tr_id =${sql.literal('" +trId	 +"')} "
                    + " OR wrcf.cf_id IN (SELECT cf_id FROM cf WHERE cf.tr_id =${sql.literal('" +trId	 +"')} ) ) )" 
                    + " OR EXISTS (SELECT cf_id FROM hwrcf WHERE wrhwr.wr_id = hwrcf.wr_id "
                    + " AND ( hwrcf.scheduled_from_tr_id =${sql.literal('" +trId	 +"')} "
                    + " OR hwrcf.cf_id IN (SELECT cf_id FROM cf WHERE cf.tr_id =${sql.literal('" +trId	 +"')} )  )" 
                    + " )  )" );
					
		var eqStd =   this.searchConsolePanel.getFieldValue("eq.eq_std"); 
		if ( eqStd )
			restriction += ( " AND EXISTS (SELECT eq_id FROM eq WHERE wrhwr.eq_id = eq.eq_id AND eq_std =${sql.literal('" +eqStd +"')} ) "); 
		return restriction;
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
