/**
 * Controller for Space Report Filter.
 */
View.createController('spaceReportFilter', {


	/**
	 * scenarios restriction.
	 */
	scenariosRes : '1=1',

	/**
	 * comparison type.
	 */	
	comparisonType: 'gap',
	
	/**
	 * Maps DOM events to event listeners.
	 */
	events : {
		/**
		 * Event handler for click priority tab.
		 * 
		 * @param event
		 */
		'change #comparison_type' : function(event) {
        	var scenarioRows = this.scenarioGrid.getSelectedGridRows();
            if (scenarioRows.length>2) {
            	View.showMessage(getMessage('onlySelectTwo'));
            }else{
            	var comparisonType = this.getComparisonType();
            	this.trigger('app:space:portfolio:report:showComparionResult', scenarioRows, comparisonType);
            }
		},
	
	},
	
	afterCreate : function() {
		jQuery('#printPPT').hide();
	},
	
	// ----------------------- Action event handler--------------------

	/**
	 * Invoke filter event.
	 */
	spRptFilter_onFilter : function() {

		// get console filter restriction
		this.getFilterRestriction();

		// trigger filter event
		this.trigger('app:space:portfolio:report:filter');
	},

	/**
	 * Clear filter
	 */
	spRptFilter_onClear : function(panel, action) {

		// clear input values in filter
		this.clearFilterValues();

		// Apply the filter based on the new values in the filter
		this.spRptFilter_onFilter();

	},

	// ----------------------- Logic method ----------------------------------

	/**
	 * Clear input values in the filter and set default values
	 */
	clearFilterValues : function() {
		this.spRptFilter.clear();
		Ext.get('comparison_type').dom.selectedIndex = 0;
	},

	/**
	 * Get filter restriction
	 */
	getFilterRestriction : function() {
		// get scenarios restriction
		this.scenariosRes = this.getScenariosRes();

		// get comparison type
		this.comparisonType = this.getComparisonType();
		
	},

	/**
	 * Get scenarios restriction
	 */
	getScenariosRes : function() {
		var filterPanel = this.spRptFilter;
		var siteValues = filterPanel.getFieldQueryParameter('bl.site_id');
		var blValues = filterPanel.getFieldQueryParameter('bl.bl_id');
		
		var gpRes = '1=1';
		if(siteValues != " IS NOT NULL" || blValues != " IS NOT NULL"){
			if(siteValues != " IS NOT NULL"){
				gpRes += ' and gp.bl_id IN (select bl.bl_id from bl where bl.site_id' + siteValues + ')'
			}
			if(blValues != " IS NOT NULL"){
				gpRes += ' and gp.bl_id' + blValues;
			}
		}
		
		var scenariosRes= this.getDateRes('portfolio_scenario.date_start');
		if(gpRes != '1=1'){
			scenariosRes += ' AND exists(select 1 from gp where gp.portfolio_scenario_id = portfolio_scenario.portfolio_scenario_id and ' + gpRes + ')';
		}
		
		return scenariosRes;
		
	},
	
	/**
	 * Get Comparison Type
	 */
	getComparisonType : function() {
		var el = Ext.get('comparison_type').dom;
		return el.options[el.selectedIndex].value;
	},
	
	/**
	 * get date field restriction in big filter
	 */
	getDateRes : function(dateFieldName) {
		var dateRes = '1=1';
		var dateFrom = this.spRptFilter.getFieldValue(dateFieldName + ".from");
		var dateTo = this.spRptFilter.getFieldValue(dateFieldName + ".to");

		// add the date comparison clauses
		if (valueExistsNotEmpty(dateFrom)) {
			dateRes += " AND " + dateFieldName + ">=${sql.date('" + dateFrom + "')}";
		}
		if (valueExistsNotEmpty(dateTo)) {
			dateRes += " AND " + dateFieldName + "<=${sql.date('" + dateTo + "')}";
		}

		return dateRes;
	},
	
	/**
	 * Hide comparison type
	 */
	hideComparisonTypeElement : function() {
		jQuery('#comparison_type').hide().prev().hide();
	}

});
