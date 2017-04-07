var condAssessByProjectController = View.createController('CAByPrjCtrl',{
	restriction: null,
	drillDownContext: null,
	resultsAssociatedWith:null,
	/**
	 * Set the radiobuttons labels and clear the console
	 */
	afterViewLoad:function(){
		var managerProcess = [{activityId : 'AbCapitalPlanningCA', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];

		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));
		
		this.setLabels();
		this.consoleCondAssessFilter_onClear();
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.panelCaByPrjDetails);

		this.panelCaByPrjDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsCaByPrj.enableTab('tabDetails', false);
	},
	
	/**
	 * Open the Project Details popup
	 */
	projectsPanel_onShowProjects:function(){
		showProjectDetails(this.projectsPanel, 'project.project_id');
	},	
	
	/**
	 * Shows the report grid according to the user restrictions
	 */
	consoleCondAssessFilter_onFilter:function(){
		this.restriction = null;
		
		this.setRestriction();

		if(this.restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}
		
		this.hideReportPanels();
		var groupByValue = this.getGroupByValue();
		if(groupByValue == 'project_id') {
			this.panelCondAssessSumPrj.refresh(this.restriction);
		}
		else if(groupByValue == 'csi_id') {
			this.panelCondAssessSumClassif.refresh(this.restriction);
		}
		else if(groupByValue == 'ca_quarter') {
			this.panelCondAssessSumQuart.refresh(this.restriction);
		}
		else if(groupByValue == 'rec_action') {
			this.panelCondAssessSumRecAction.refresh(this.restriction);
		}
		else if(groupByValue == 'cond_rating') {
			this.panelCondAssessSumCondRating.refresh(this.restriction);
		}
	},
	panelCondAssessSumPrj_afterRefresh: function(){
		this.tabsCaByPrj.selectTab('tabReport');
		this.tabsCaByPrj.enableTab('tabDetails', false);
	},
	panelCondAssessSumClassif_afterRefresh: function(){
		this.tabsCaByPrj.selectTab('tabReport');
		this.tabsCaByPrj.enableTab('tabDetails', false);
	},
	panelCondAssessSumQuart_afterRefresh: function(){
		this.tabsCaByPrj.selectTab('tabReport');
		this.tabsCaByPrj.enableTab('tabDetails', false);
	},
	panelCondAssessSumRecAction_afterRefresh: function(){
		this.tabsCaByPrj.selectTab('tabReport');
		this.tabsCaByPrj.enableTab('tabDetails', false);
	},
	panelCondAssessSumCondRating_afterRefresh: function(){
		this.tabsCaByPrj.selectTab('tabReport');
		this.tabsCaByPrj.enableTab('tabDetails', false);
	},

	/**
	 * show paginated report
	 */
	consoleCondAssessFilter_onPaginatedReport: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.projectsPanel, 'project.project_id');
		if(selectedProjectIds.length == 0){
			View.showMessage(getMessage('err_no_project'));
		}else{
			this.setRestriction();
			var projRest = new Ab.view.Restriction();
			projRest.addClause('activity_log.project_id', selectedProjectIds, 'IN');
			
			//prepare a custom printable restrictions - paired title and value (localized)
			var printableRestrictions = [];
			
			printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': selectedProjectIds.join()});
			if (this.resultsAssociatedWith) {
				printableRestrictions.push({'title': getMessage('results_associated_with'),'value': this.resultsAssociatedWith});
				
			}
			var site_id = this.consoleCondAssessFilter.getFieldValue('activity_log.site_id');
			if(	site_id){
				printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
			}
			var bl_id = this.consoleCondAssessFilter.getFieldValue('activity_log.bl_id');
			if(bl_id){
				printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
			}
			var fl_id = this.consoleCondAssessFilter.getFieldValue('activity_log.fl_id');
			if(fl_id){
				printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
			}
			var csi_id = this.consoleCondAssessFilter.getFieldValue('csi.csi_id');
			if(csi_id){
				printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
			}
			var date_from = this.consoleCondAssessFilter.getFieldValue('activity_log.date_assessed');
        	if(date_from){
				printableRestrictions.push({'title': getMessage('dateFrom'), 'value': date_from});
			}
			var date_to = this.consoleCondAssessFilter.getFieldValue('activity_log.date_required');
			if(date_to){
				printableRestrictions.push({'title': getMessage('dateTo'), 'value': date_to});
			}			

			// apply printable restrictions  to the report
	    	var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
			
			View.openPaginatedReportDialog('ab-ca-by-prj-prnt.axvw', {'ds_CaByPrj_owner':projRest,'ds_CaByPrj_data':this.restriction},parameters);
		}		

	},
	
	/**
	 * Clears the filter console
	 */
	consoleCondAssessFilter_onClear:function(){
		this.consoleCondAssessFilter.clear();
		document.getElementById('show_all').checked = true;
		document.getElementById('groupBy_project_id').checked = true;
	},
	
	/**
	 * Sets the radio buttons labels
	 */
	setLabels: function(){
		$('groupBy_project_id_Span').innerHTML = getMessage('groupBy_project_id_Label');
		$('groupBy_csi_id_Span').innerHTML = getMessage('groupBy_csi_id_Label');
		$('groupBy_ca_quarter_Span').innerHTML = getMessage('groupBy_ca_quarter_Label');
		$('groupBy_rec_action_Span').innerHTML = getMessage('groupBy_rec_action_Label');
		$('groupBy_cond_rating_Span').innerHTML = getMessage('groupBy_cond_rating_Label');
		
		$('show_results_associated_with_Span').innerHTML = '&#160;'+getMessage('show_results_associated_with_Label_0')+'<br/>'+getMessage('show_results_associated_with_Label_1');
		$('show_all_Span').innerHTML = getMessage('show_all_Label');
		$('show_site_id_Span').innerHTML = getMessage('show_site_id_Label');
		$('show_bl_id_Span').innerHTML = getMessage('show_bl_id_Label');
		$('show_fl_id_Span').innerHTML = getMessage('show_fl_id_Label');
		$('show_rm_id_Span').innerHTML = getMessage('show_rm_id_Label');
		$('show_eq_id_Span').innerHTML = getMessage('show_eq_id_Label');
	},
	
	/**
	 * Sets the controller's attribute 'restriction'
	 * according to the selected projects and the filter console selections
	 */
	setRestriction: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.projectsPanel, 'project.project_id');
		if(selectedProjectIds.length == 0)
       		return false;

		this.restriction = this.getConsoleRestriction();
		this.restriction.addClause('activity_log.project_id', selectedProjectIds, 'IN');
	},
	
	/**
	 * Returns a Restriction object according to the filter console selections
	 */
	getConsoleRestriction: function() {
		var restriction = this.getRadioShowRestriction();
        var record = this.consoleCondAssessFilter.getRecord();
        var site_id = record.getValue('activity_log.site_id');
        var bl_id = record.getValue('activity_log.bl_id');
        var fl_id = record.getValue('activity_log.fl_id');
        var csi_id = record.getValue('csi.csi_id');
        var date_from = this.consoleCondAssessFilter.getFieldValue('activity_log.date_assessed');
        var date_to = this.consoleCondAssessFilter.getFieldValue('activity_log.date_required');

		if (valueExistsNotEmpty(site_id)) {
			restriction.addClause("activity_log.site_id", site_id, '=');
		}
		
		if (valueExistsNotEmpty(bl_id)) {
			restriction.addClause("activity_log.bl_id", bl_id, '=');
		}
		
		if (valueExistsNotEmpty(fl_id)) {
			restriction.addClause("activity_log.fl_id", fl_id, '=');
		}
		
		if (valueExistsNotEmpty(csi_id)) {
			restriction.addClause("activity_log.csi_id", csi_id, '=');
		}
		
		if (valueExistsNotEmpty(date_from)) {
			restriction.addClause("activity_log.date_assessed", date_from, '>=');
		}
		
		if (valueExistsNotEmpty(date_to)) {
			restriction.addClause("activity_log.date_assessed", date_to, '<=');
		}

		return restriction;
	},
	
	/**
	 * returns a Restriction object according to the radio button
	 * 'Show Results Associated With' selection
	 */
	getRadioShowRestriction: function() {
		var restriction = new Ab.view.Restriction();
        var radioShow = document.getElementsByName("radioShow");
		var showValue = "";
		
        for(var i=0;i<radioShow.length;i++) {                
	        if(radioShow[i].checked) { 
				showValue = radioShow[i].value;
       		}
		}
		if(!valueExistsNotEmpty(showValue) || showValue == 'all')
			return restriction;
			
		if(showValue == 'site_id') {
			restriction.addClause('activity_log.site_id', '', 'IS NOT NULL', 'AND', false);
			restriction.addClause('activity_log.bl_id', '', 'IS NULL', 'AND', false);
			restriction.addClause('activity_log.fl_id', '', 'IS NULL', 'AND', false);
			restriction.addClause('activity_log.rm_id', '', 'IS NULL', 'AND', false);
			restriction.addClause('activity_log.eq_id', '', 'IS NULL', 'AND', false);
		}
		else if(showValue == 'bl_id') {
			restriction.addClause('activity_log.bl_id', '', 'IS NOT NULL', 'AND', false);
			restriction.addClause('activity_log.fl_id', '', 'IS NULL', 'AND', false);
			restriction.addClause('activity_log.rm_id', '', 'IS NULL', 'AND', false);
			restriction.addClause('activity_log.eq_id', '', 'IS NULL', 'AND', false);
		}
		else if(showValue == 'fl_id') {
			restriction.addClause('activity_log.fl_id', '', 'IS NOT NULL', 'AND', false);
			restriction.addClause('activity_log.rm_id', '', 'IS NULL', 'AND', false);
			restriction.addClause('activity_log.eq_id', '', 'IS NULL', 'AND', false);
		}
		else if(showValue == 'rm_id') {
			restriction.addClause('activity_log.rm_id', '', 'IS NOT NULL', 'AND', false);
			restriction.addClause('activity_log.eq_id', '', 'IS NULL', 'AND', false);
		}
		else if(showValue == 'eq_id') {
			restriction.addClause('activity_log.eq_id', '', 'IS NOT NULL', 'AND', false);
		}
		
		return restriction;
	},
	
	/**
	 * returns selected value for the 'Group by' radio button
	 */
	getGroupByValue: function() {
        var radioGroupBy = document.getElementsByName("radioGroupBy");
		var groupByValue = "";
		
        for(var i=0;i<radioGroupBy.length;i++) {                
	        if(radioGroupBy[i].checked) { 
				groupByValue = radioGroupBy[i].value;
				break;
        	}
		}
		
		return groupByValue;
	},
	
	/**
	 * Hides the report panels
	 */
	hideReportPanels: function() {
		this.panelCondAssessSumPrj.show(false);
		this.panelCondAssessSumClassif.show(false);
		this.panelCondAssessSumRecAction.show(false);
		this.panelCondAssessSumQuart.show(false);
		this.panelCondAssessSumCondRating.show(false);
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	panelCaByPrjDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.consoleCondAssessFilter_onFilter();
			refreshPanelCondAssessPopup(controller.drillDownContext);
		});
	},
	panelCaByPrjDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.consoleCondAssessFilter_onFilter();
				refreshPanelCondAssessPopup(controller.drillDownContext);
			})){
			return;
		}
	}
});

/**
 * Refresh the panel PanelCondAssessPopup with the controller's restriction
 * @param {Object} obj
 */

// open details view
function refreshPanelCondAssessPopup(context){

	var controller = View.controllers.get("CAByPrjCtrl");
	controller.drillDownContext = context;
	var contextRest = context.restriction;
	var tableRest = '1=1';
	
	/*
	 * 05/12/2010 search for drill down restriction
	 */
	if(contextRest.clauses.length > 0){
		for(var i=0;i<contextRest.clauses.length; i++){
			var clause = contextRest.clauses[i];
			tableRest += " AND ";
			if(clause.name == "activity_log.cond_rating"){
				tableRest += "(activity_log.cond_value * activity_log.cond_priority)";
			}else if(clause.name == "activity_log.ca_quarter"){
				tableRest += "${sql.yearQuarterOf('date_assessed')}";
			}else{
				tableRest += clause.name;
			}
			if(clause.op == "IN"){
				tableRest += " " + clause.op + "('" + clause.value.join("','") + "')";
			}else if(clause.op == "IS NULL" || clause.op == "IS NOT NULL"){
				tableRest += " " + clause.op
			}else if(clause.name == "activity_log.date_assessed"){
				tableRest += " " + clause.op + "${sql.date('" + clause.value + "')}";
			}else{
				tableRest += " " + clause.op + "'" + clause.value + "'";
			}
		}
	}
	
	var detailsPanel = View.panels.get('panelCaByPrjDetails');
	detailsPanel.addParameter('tableRest', tableRest); 
	detailsPanel.refresh();

	var objTabs = View.panels.get('tabsCaByPrj');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
	
}

/**
 * Sets the controller's restriction to the panel PanelCondAssessExportXLS
 * @param {Object} initialConfig
 */
function setRestrictionToPanelCAExportXLS(initialConfig){
	var controller = View.controllers.get('CAByPrjCtrl');
	controller.setRestriction();
	
	if(controller.restriction == null) {
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	
	var restriction = new Ab.view.Restriction();
	addClausesToRestriction(restriction, controller.restriction);
	
	controller.panelCondAssessExportXLS.restriction = restriction;
}

/**
 * Events Handler for clicking on radio buttons from 'radioShow' group
 * @param {Object} selectedBtn - name of clicked radio button
 */

function  onClickRadioShow(selectedBtn){
	var controller = condAssessByProjectController;
	var filterPanel = controller.consoleCondAssessFilter;
	
	if(selectedBtn == 'all'){
		controller.resultsAssociatedWith = null;
		filterPanel.enableField('activity_log.site_id', true);
		filterPanel.enableField('activity_log.bl_id', true);
		filterPanel.enableField('activity_log.fl_id', true);
	}else if(selectedBtn == 'site_id'){
		controller.resultsAssociatedWith = getMessage('show_'+selectedBtn+'_Label');
		filterPanel.enableField('activity_log.site_id', true);
		filterPanel.enableField('activity_log.bl_id', false);
		filterPanel.setFieldValue('activity_log.bl_id', '');
		filterPanel.enableField('activity_log.fl_id', false);
		filterPanel.setFieldValue('activity_log.fl_id', '');
	}else if(selectedBtn == 'bl_id'){
		controller.resultsAssociatedWith = getMessage('show_'+selectedBtn+'_Label');
		filterPanel.enableField('activity_log.site_id', false);
		filterPanel.setFieldValue('activity_log.site_id', '');
		filterPanel.enableField('activity_log.bl_id', true);
		filterPanel.enableField('activity_log.fl_id', false);
		filterPanel.setFieldValue('activity_log.fl_id', '');
	}else if(selectedBtn == 'fl_id'){
		controller.resultsAssociatedWith = getMessage('show_'+selectedBtn+'_Label');
		filterPanel.enableField('activity_log.site_id', false);
		filterPanel.setFieldValue('activity_log.site_id', '');
		filterPanel.enableField('activity_log.bl_id', false);
		filterPanel.setFieldValue('activity_log.bl_id', '');
		filterPanel.enableField('activity_log.fl_id', true);
	}else{
		controller.resultsAssociatedWith = getMessage('show_'+selectedBtn+'_Label');
		filterPanel.enableField('activity_log.site_id', false);
		filterPanel.setFieldValue('activity_log.site_id', '');
		filterPanel.enableField('activity_log.bl_id', false);
		filterPanel.setFieldValue('activity_log.bl_id', '');
		filterPanel.enableField('activity_log.fl_id', false);
		filterPanel.setFieldValue('activity_log.fl_id', '');		
	}
	
}

