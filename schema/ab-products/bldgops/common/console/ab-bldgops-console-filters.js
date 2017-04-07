/**
 * Controller for the Operation Console filter
 */
var opsExpressConsoleFilter = View.createController('wrFilter', {
	/**
	 * Controller for the Main view
	 */
	mainController : null,

	/**
	 * 'More' action object
	 */
	moreAction : null,

	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		this.mainController = View.controllers.get('opsExpressConsoleCtrl');

		// default hide all option fields
		this.hideOptionFields();

		// show fields by role name
		this.showFieldsByRoleName(this.mainController.roleName);

		// register Enter key to filter action
		this.registerEnterKeyForFilterAction();

		// set field css
		this.setFilterFieldCSS();
		
	},

	/**
	 * set permanent Restriction By Role
	 */
	afterInitialDataFetch : function() {
		
		//set what to show field from side car (browser cache)
		var whatToShow = this.wrFilter.getSidecar().get('whatToShow');
		if(valueExists(whatToShow)){
			jQuery('select[id$=whatToShow]:visible').val(whatToShow);
		}
		
		if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','pt_store_loc', 'pt_store_loc_id').value){
			alert(getMessage('updateSchemaForMPSL'));
			jQuery('body').hide();
			return;
		}else{
			if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkPtAssociateLocation').value){
				alert(getMessage('ptAssociateLocation'));
				jQuery('body').hide();
				return;
			}
		}
		
		if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','cf_work_team', 'cf_id').value){
			alert(getMessage('updateSchemaForMultipleTeamOfCf'));
			jQuery('body').hide();
			return;
		}else{
			if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkCfAssociateTeams').value){
				alert(getMessage('cfAssociateTeams'));
				jQuery('body').hide();
				return;
			}
		}
		
		//check schema and set datasource restriction
		opsConsoleFilterRestrictionController.checkSchemaAndSetRestriction();
		
		var showDoubleLineForDescription = this.wrFilter.getSidecar().get('showDoubleLineForDescription');
		if(valueExists(showDoubleLineForDescription) && showDoubleLineForDescription){
			this.wrFilter.actions.get('toolsMenu').menu.items.get('selectDoubleLineDisplay').setChecked(true);
			var grid = this.wrList;
			var columnIndex = grid.findColumnIndex('wr.description');
			var column = grid.columns[columnIndex];
			column.width = '500';
		}
		
		var highlightEscalatedReqeusts = this.wrFilter.getSidecar().get('highlightEscalatedReqeusts');
		if(valueExists(highlightEscalatedReqeusts) && highlightEscalatedReqeusts){
			this.wrFilter.actions.get('toolsMenu').menu.items.get('higlightEscalatedRequests').setChecked(true);
			opsConsoleWrListController.highlightEscalatedReqeusts = true;
		}
		
		
		//KB3049025 - Impelement the ability go collapse category bands on open, and display maximum requests per band
		var BldgOpsConsoleExpandOnOpen = View.activityParameters['AbBldgOpsOnDemandWork-BldgOpsConsoleExpandOnOpen'];
		if(typeof BldgOpsConsoleExpandOnOpen == 'undefined' || (valueExists(BldgOpsConsoleExpandOnOpen) && BldgOpsConsoleExpandOnOpen == '1')){
			//expand the band if BldgOpsConsoleExpandOnOpen = 1
			this.wrList.categoryCollapsed = false;
		}
		var BldgOpsConsoleMaxRequestsPerBand = View.activityParameters['AbBldgOpsOnDemandWork-BldgOpsConsoleMaxRequestsPerBand'];
		if(valueExists(BldgOpsConsoleMaxRequestsPerBand) && parseInt(BldgOpsConsoleMaxRequestsPerBand) >0){
			//if BldgOpsConsoleMaxRequestsPerBand is a non-zero positive integer, use BldgOpsConsoleMaxRequestsPerBand as categoryDisplayedLimit
			this.wrList.categoryDisplayedLimit = parseInt(BldgOpsConsoleMaxRequestsPerBand);
		}else{
			//if BldgOpsConsoleMaxRequestsPerBand is not a non-zero positive integer, then set 'categoryDisplayedLimit' to 5000, indicating that there will be no paging
			this.wrList.categoryDisplayedLimit = 5000;
		}
		
		//KB3044089 - load on open based on application parameter
		var BldgOpsConsoleLoadOnOpen = View.activityParameters['AbBldgOpsOnDemandWork-BldgOpsConsoleLoadDataOnOpen'];
		if(typeof BldgOpsConsoleLoadOnOpen == 'undefined' || (valueExists(BldgOpsConsoleLoadOnOpen) && BldgOpsConsoleLoadOnOpen == '1')){
			// clear the filter and refresh the result grid
			this.wrFilter_onClear();
		}

		// show my approved request option if exists my approved request
		this.showMyApprovedOption();
		
		//show pending steps option
		this.showPendingStepsOption();

		// hide work order if WorkRequestOnly=1
		this.hideWorkOrderIfWorkRequestOnly();

	},
	

	/**
	 * Show pending steps option
	 */
	showPendingStepsOption : function() {
		var BldgOpsConsoleLoadPendingSteps = View.activityParameters['AbBldgOpsOnDemandWork-BldgOpsConsoleLoadPendingSteps'];
		if((valueExists(BldgOpsConsoleLoadPendingSteps) && BldgOpsConsoleLoadPendingSteps == '0')){
			jQuery("[value=pendingSteps]").show();
		}else{
			//hide select option not work IN IE, so remove the option
			jQuery("[value=pendingSteps]").remove();
		}

	},

	// ----------------------- Filter handlers ---------------------------
	/**
	 * When the 'Filter' button is clicked in the 'Easy Filter'
	 */
	wrFilter_onFilter : function() {
		//KB3047663 - Add Progessbar when filter work request
		View.openProgressBar();
		(function(){
			// set filter parameters
			opsConsoleFilterRestrictionController.setFilterRestriction();

			// set url restriction
			opsConsoleFilterRestrictionController.setUrlRestriction();

			// collapse the big filter
			if (!opsExpressConsoleFilter.bigBadFilter.collapsed) {
				opsExpressConsoleFilter.bigBadFilter.toggleCollapsed();
				opsExpressConsoleFilter.moreAction.setTitle(getMessage('filterMore'));
			}

			View.updateProgressBar(2/4);
			
			// refresh grid
			opsExpressConsoleFilter.wrList.refresh();
			
			View.updateProgressBar(3/4);

			// add and show recent search
			opsConsoleRecentSearchController.addRecentSearch();

			// Set print restriction
			opsConsolePrintActionController.setPrintRestriction();
			
			(function(){
				View.closeProgressBar();
			}).defer(10);
            
         }).defer(10);
	},
	
	/**
	 * When the 'Clear' button is pressed in the 'Easy Filter'
	 */
	wrFilter_onClear : function() {
		// clear filter values
		this.clearEasyFilterValue();

		// clear big filter values
		this.clearBigFilter();

		// refresh the result grid to the keep consistent with the filter
		this.wrFilter_onFilter();
	},

	/**
	 * When the 'More Options' button is pressed in the 'Easy Filter'
	 */
	wrFilter_onMoreOptions : function(panel, action) {
		this.bigBadFilter.toggleCollapsed();
		action.setTitle(this.bigBadFilter.collapsed ? getMessage('filterMore') : getMessage('filterLess'));
		this.moreAction = action;
	},

	/**
	 * Set css of the filter field
	 */
	setFilterFieldCSS : function() {
		var fields = [ 'wr.date_requested.from', 'wr.date_requested.to', 'wr.date_assigned.from', 'wr.date_assigned.to','wr.wr_id','wr.wo_id' ];
		for ( var i = 0; i < fields.length; i++) {
			var el = Ext.get('bigBadFilter_' + fields[i]);
			el.addClass('shortField');
			el.dom.placeholder = this.bigBadFilter.fields.get(fields[i]).fieldDef.title;
		}

		// set whatToshow fixed width to make sure the bigBadFilter field align good to easy filter
		var currentWhatToShowEl = jQuery('select[id$=whatToShow]:visible');
		currentWhatToShowEl.width(150);
		jQuery('#bigBadFilter').css('padding-left', (currentWhatToShowEl.position().left + currentWhatToShowEl.width()) + 'px');
		jQuery('.shortField').css('width', '170px');
		
		//KB3043583 - html select option cannot auto ajust with in IE8
		if(navigator.appVersion.toLowerCase().indexOf("msie 8") > -1){
			currentWhatToShowEl.css('width', 'auto');
		}
	},

	/**
	 * register enter key for easy filter action and big bad action
	 */
	registerEnterKeyForFilterAction : function() {
		new Ext.KeyMap(Ext.get('wrFilter'), {
			key : Ext.EventObject.ENTER,
			handler : this.wrFilter_onFilter,
			scope : this
		});
	},

	/**
	 * clear values in the 'Easy Filter'
	 */
	clearEasyFilterValue : function() {
		this.wrFilter.clear();
		Ext.get('wrFilter_activity_log_whatToGroup').dom.selectedIndex = 0;
		Ext.get('wrFilter_wr_whatToGroup').dom.selectedIndex = 0;
	},

	/**
	 * Clear all big filter values and set default values
	 */
	clearBigFilter : function() {
		this.bigBadFilter.clear();
		Ext.get('bigBadFilter_worktype').dom.selectedIndex = 0;
		Ext.get('bigBadFilter_wr.escalated').dom.checked = false;
		Ext.get('bigBadFilter_wr.returned').dom.checked = false;
		Ext.get('bigBadFilter_operator').dom.selectedIndex = 0;
		Ext.get('bigBadFilter_wr.cost_est_total').dom.value = '';
		var priorityOpts = document.getElementsByName('bigBadFilter_wr.priority');
		for ( var i = 0; i < priorityOpts.length; i++) {
			priorityOpts[i].checked = false;
		}
		var statusOpts = document.getElementsByName('bigBadFilter_wr.status');
		for ( var i = 0; i < statusOpts.length; i++) {
			statusOpts[i].checked = false;
		}
		
		var statusOpts = document.getElementsByName('bigBadFilter_wrpt.status');
		for ( var i = 0; i < statusOpts.length; i++) {
			statusOpts[i].checked = false;
		}

		showCostEst('');
	},

	/**
	 * show fields by role name
	 */
	showFieldsByRoleName : function(roleName) {

		if (roleName == 'client' || roleName == 'approver' || roleName == 'step completer') {
			// show 'what to show' field
			this.showField(this.wrFilter, 'wrFilter_activity_log_whatToShow', true);

			// show 'what to group' field
			this.showField(this.wrFilter, 'wrFilter_activity_log_whatToGroup', true);

		} else {
			// show 'what to show' field
			this.showField(this.wrFilter, 'wrFilter_wr_whatToShow', true);

			// show 'what to group' field
			this.showField(this.wrFilter, 'wrFilter_wr_whatToGroup', true);
		}
	},

	/**
	 * Hide work order if WorkRequestOnly=1
	 */
	hideWorkOrderIfWorkRequestOnly : function() {
		var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
		if (workRequestsOnly == '1') {
			//KB3044836 - comment out below code to support PM case
			// hide work order field in the filter console
			//jQuery('#bigBadFilter_wr\\.wo_id').hide();
			//jQuery('#bigBadFilter_wo_id_selectValue').hide();

			// hide work order group by option
			//jQuery('[value=woIdDS]').hide();

			// hide Assigned status in the more filter panel
			jQuery('[value=AA]').parent().hide();

			// change Approved status value to AA
			jQuery('[value=A]').attr("value", 'AA');

			// remove column work order in grid to make sure it cannot be select in the select fields pop up
			//for (i = 0; i < this.wrList.columns.length; i++) {
			//	if (this.wrList.columns[i].id == 'wr.wo_id') {
			//		this.wrList.removeColumn(i);
			//		break;
			//	}
			//}
		}
	},

	/**
	 * Show my approved options.
	 */
	showMyApprovedOption : function() {
		if (this.existsMyApprovedRequests()) {
			jQuery("[value=requiringMyApproval]").show();
			jQuery("[value=myApproved]").show();
		} else {
			//hide select option not work IN IE, so remove the option 
			jQuery("[value=requiringMyApproval]").remove();
			jQuery("[value=myApproved]").remove();
		}
	},

	/**
	 * Check if exists my approved requests.
	 */
	existsMyApprovedRequests : function() {
		var isExists = false;
		var result = {};
		try {
			isExists = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-existsApprovedRequests').value;
		} catch (e) {
			Workflow.handleError(e);
		}

		return isExists;
	},

	/**
	 * show given field
	 */
	showField : function(panel, fieldName, visible) {
		if ($(fieldName)) {
			// input element
			panel.showElement($(fieldName), visible);

			// label element
			if ($(fieldName).previousSibling && $(fieldName).previousSibling.previousSibling) {
				panel.showElement($(fieldName).previousSibling.previousSibling, visible)
			}
		}
	},

	/**
	 * hide all option fields
	 */
	hideOptionFields : function() {
		this.showField(this.wrFilter, 'wrFilter_activity_log_whatToShow', false);
		this.showField(this.wrFilter, 'wrFilter_activity_log_whatToGroup', false);

		this.showField(this.wrFilter, 'wrFilter_wr_whatToShow', false);
		this.showField(this.wrFilter, 'wrFilter_wr_whatToGroup', false);

		Ext.fly(Ext.query("*[value=myApproved]")[0]).setDisplayed(false);
		Ext.fly(Ext.query("*[value=myApproved]")[1]).setDisplayed(false);

	}
});

/**
 * Switch group by option
 */
function switchGroupBy() {
	View.controllers.get('wrFilter').wrFilter_onFilter();
}

/**
 * Set focus to field
 * 
 * @param panelId
 *            id of the panel
 * @param id
 *            id of the field to show
 */
function setFocusOnField(panelId, id) {
	var controller = View.controllers.get('wrFilter');
	var el = controller[panelId].getFieldElement(id);
	if (el) {
		el.focus();
	}
}

/**
 * Depending upon operator, show and set the focus to the cost_est_total field
 * 
 * @param operator
 *            operator ie ("IS NULL", ">", "<", etc.)
 */
function showCostEst(operator) {
	if (operator == '' || operator == 'IS NULL' || operator == 'IS NOT NULL') {
		Ext.get('bigBadFilter_wr.cost_est_total').dom.disabled = true;
	} else {
		Ext.get('bigBadFilter_wr.cost_est_total').dom.disabled = false;
		setFocusOnField('bigBadFilter', 'wr.cost_est_total');
	}
}

function afterSelectRmId(fieldName, selectedValue, previousValue){
	if(fieldName == 'wr.bl_id'){
		View.panels.get('wrFilter').setFieldValue('wr.bl_id', selectedValue);
	}
	if(fieldName == 'wr.fl_id'){
		View.panels.get('wrFilter').setFieldValue('wr.fl_id', selectedValue);
	}
}