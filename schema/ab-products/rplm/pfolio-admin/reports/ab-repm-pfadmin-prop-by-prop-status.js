var abRepmPfadminPropByPropStatusController = View.createController('abRepmPfadminPropByPropStatusCtrl',{
	afterInitialDataFetch: function(){
		this.abRepmPfadminPropByPropStatus_console_onShow();
	},
	
	abRepmPfadminPropByPropStatus_console_onShow: function(){
		var restriction = this.getSqlRestriction();
		
		
		this.abRepmPfadminPropByPropStatus_panel_owned.addParameter('pr_status', 'owned');
		this.abRepmPfadminPropByPropStatus_panel_owned.refresh(restriction);
		this.abRepmPfadminPropByPropStatus_panel_leased.addParameter('pr_status', 'leased');
		this.abRepmPfadminPropByPropStatus_panel_leased.refresh(restriction);
		this.abRepmPfadminPropByPropStatus_panel_sold.addParameter('pr_status', 'sold');
		this.abRepmPfadminPropByPropStatus_panel_sold.refresh(restriction);
		this.abRepmPfadminPropByPropStatus_panel_neither.addParameter('pr_status', 'neither');
		this.abRepmPfadminPropByPropStatus_panel_neither.refresh(restriction);
	},
	
	abRepmPfadminPropByPropStatus_console_onPaginatedReport: function(){
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
		
		View.openPaginatedReportDialog('ab-repm-pfadmin-prop-by-prop-status-pgrp.axvw',
				{'abRepmPfadminPropByPropStatusPgrp_ds_data': restriction},
				parameters);
	},
	
	getSqlRestriction: function(){
		var restriction = "1=1";
		var panel = this.abRepmPfadminPropByPropStatus_console;
		
		restriction += this.getSqlFieldRestriction("property.ctry_id", panel, "property.ctry_id");
		restriction += this.getSqlFieldRestriction("property.regn_id", panel, "property.regn_id");
		restriction += this.getSqlFieldRestriction("property.state_id", panel, "property.state_id");
		restriction += this.getSqlFieldRestriction("property.city_id", panel, "property.city_id");
			
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
		
		this.abRepmPfadminPropByPropStatus_console.fields.each(function(field){
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

