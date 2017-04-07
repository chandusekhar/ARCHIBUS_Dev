var abRepmPfadminBlByBlStatusController = View.createController('abRepmPfadminBlByBlStatusCtrl',{
	afterInitialDataFetch: function(){
		this.abRepmPfadminBlByBlStatus_console_onShow();
	},
	
	abRepmPfadminBlByBlStatus_console_onShow: function(){
		var restriction = this.getSqlRestriction();
		
		this.abRepmPfadminBlByBlStatus_panel_owned.addParameter('bl_status', 'owned');
		this.abRepmPfadminBlByBlStatus_panel_owned.refresh(restriction);
		this.abRepmPfadminBlByBlStatus_panel_leased.addParameter('bl_status', 'leased');
		this.abRepmPfadminBlByBlStatus_panel_leased.refresh(restriction);
		this.abRepmPfadminBlByBlStatus_panel_sold.addParameter('bl_status', 'sold');
		this.abRepmPfadminBlByBlStatus_panel_sold.refresh(restriction);
		this.abRepmPfadminBlByBlStatus_panel_neither.addParameter('bl_status', 'neither');
		this.abRepmPfadminBlByBlStatus_panel_neither.refresh(restriction);
	},
	
	abRepmPfadminBlByBlStatus_console_onPaginatedReport: function(){
		var restriction = this.getSqlRestriction();
		var printableRestriction = this.getPrintableRestriction();
		
		var parameters = {
			"status_owned": getMessage("status_owned"),
			"status_leased": getMessage("status_leased"),
			"status_sold": getMessage("status_sold"),
			"status_neither": getMessage("status_neither"),
			"consoleRestriction": restriction,
			'printRestriction': true,
	        'printableRestriction': printableRestriction
		}
		
		View.openPaginatedReportDialog('ab-repm-pfadmin-bl-by-bl-status-pgrp.axvw',
				{'abRepmPfadminBlByBlStatusPgrp_ds_data': restriction},
				parameters);
	},
	
	getSqlRestriction: function(){
		var restriction = "1=1";
		var panel = this.abRepmPfadminBlByBlStatus_console;
		
		restriction += this.getSqlFieldRestriction("bl.ctry_id", panel, "bl.ctry_id");
		restriction += this.getSqlFieldRestriction("bl.regn_id", panel, "bl.regn_id");
		restriction += this.getSqlFieldRestriction("bl.state_id", panel, "bl.state_id");
		restriction += this.getSqlFieldRestriction("bl.city_id", panel, "bl.city_id");
			
		return restriction;
	},
	
	/**
	 * Returns the restriction for a field
	 * @param field Field name to put in the restriction
	 * @param panel Panel with field value
	 * @param panelFieldId Panel's field ID
	 * @returns {String} Restriction for the field; or empty string
	 */
	getSqlFieldRestriction: function(field, panel, panelFieldId){
		if(valueExistsNotEmpty(panel.getFieldValue(panelFieldId)))
			return " AND "
					+ field
					+ " IN ('"
					+ (panel.hasFieldMultipleValues(panelFieldId) ? panel.getFieldMultipleValues(panelFieldId).join("','") : panel.getFieldValue(panelFieldId))
					+ "') ";
		
		return "";
	},
	
	getPrintableRestriction: function(){
		var printableRestriction = [];
		
		this.abRepmPfadminBlByBlStatus_console.fields.each(function(field){
			var value = field.getUIValue();
			if(valueExistsNotEmpty(value)) {
				printableRestriction.push({
					'title': field.fieldDef.title,
					'value': value
				});
			}
		});
		
		return printableRestriction;
	}
})
