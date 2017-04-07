/**
 * Controller for SLA Filter.
 */
var slaFilterController = View.createController('slaFilter', {

	/**
	 * filter restriction
	 */
	filterRes : '1=1',

	/**
	 * 'More' action object
	 */
	moreAction : null,

	// ----------------------- Action event handler--------------------
	
	/**
	 * Initialize the filter console.
	 */
	afterInitialDataFetch : function() {
		//KB3043334 - increace the field width to avoid string truancated
		jQuery('.shortField').css('width', '180px');
		
		//add wrap <div> to avoid issue: switch radio and craftsperson and service desk manager fields became disable. 
		jQuery('*[id^=bigBadFilter_helpdesk_sla_response\\.supervisor]').wrapAll("<div id='helpdesk_sla_response.supervisor_div' />");
		jQuery('*[id^=bigBadFilter_helpdesk_sla_response\\.work_team_id]').wrapAll("<div id='helpdesk_sla_response.work_team_id_div' />");
		jQuery('*[id^=bigBadFilter_helpdesk_sla_response\\.dispatcher]').wrapAll( "<div id='helpdesk_sla_response.dispatcher_div' />");
		
		//KB3043636 - change the text not capitalized, direct using field title defined in axvw.
		jQuery('input[id^=slaFilter_]').css('text-transform', 'none');
		
		this.onChangeCheckBox();
	},
	
	/**
	 * Create all groupings when click the CreateAllGroupings action.
	 */
	slaFilter_onCreateAllGroupings : function() {
		var controller = this;
		View.openProgressBar(getMessage('createAllGrouping'));
		View.updateProgressBar(1/3);
		View.confirm(getMessage('confirmCreateAllGroupings'), function(button) {
			if (button == 'yes') {
				Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-createAllGroupings');
				View.updateProgressBar(2/3);
				controller.slaFilter_onFilterSLA();
			}
			
			View.closeProgressBar();
		});
		
	},

	
	/**
	 * Refresh SLA grid list when click the GetGroupingList action.
	 */
	slaFilter_onGetGroupingList : function() {
		this.slaFilter_onFilterSLA();
	},
	
	/**
	 * Refresh SLA grid list when click the filter action.
	 */
	slaFilter_onFilterSLA : function() {
		// collapse the big filter
		this.collapseBigFilter();

		// get console filter restriction
		this.getFilterRestriction();

		// trigger refresh event
		this.trigger('app:operation:express:sla:refreshSLA');
	},

	/**
	 * Show or hide big bad filter
	 */
	slaFilter_onMoreOptions : function(panel, action) {
		this.bigBadFilter.toggleCollapsed();
		action.setTitle(this.bigBadFilter.collapsed ? getMessage('filterMore') : getMessage('filterLess'));
		this.moreAction = action;
	},

	/**
	 * Clear filter
	 */
	slaFilter_onClearFilter : function(panel, action) {

		// clear input values in filter
		this.clearFilterValues();

		// refresh the sla list
		this.slaFilter_onFilterSLA();

	},

	// ----------------------- Logic method ----------------------------------

	/**
	 * collapse the big filter
	 */
	collapseBigFilter : function() {
		if (!this.bigBadFilter.collapsed) {
			this.bigBadFilter.toggleCollapsed();
			this.moreAction.setTitle(getMessage('filterMore'));
		}
	},

	/**
	 * Clear input values in the filter
	 */
	clearFilterValues : function() {
		this.slaFilter.clear();
		this.bigBadFilter.clear();
		$('bigBadFilter_approvalRequired').checked = false;
		$('bigBadFilter_helpdesk_sla_response.autoissue').checked = false;
		$('bigBadFilter_dispatch_work_team').checked = false;
		$('bigBadFilter_dispatch_supervisor').checked = false;
		$('bigBadFilter_dispatch_dispatcher').checked = false;
		this.onChangeCheckBox();
	},

	/**
	 * Get filter restriction
	 */
	getFilterRestriction : function() {
		// get request parameter filter restriction
		this.filterRes = this.getRequestFilterRes() + ' AND ' +this.getResponseFilterRes()+ ' AND '+ this.getWorkflowStepsFilterRes();
	},

	/**
	 * Get request filter restriction
	 */
	getRequestFilterRes : function() {
		// request parameter filed array
		var requestFilterFields = ['helpdesk_sla_request.site_id', 'helpdesk_sla_request.bl_id' ];
		var moreRequestFilterFields = ['helpdesk_sla_request.fl_id', 'helpdesk_sla_request.rm_id', 'helpdesk_sla_request.requestor', 'helpdesk_sla_request.em_std'
		                           , 'helpdesk_sla_request.dv_id', 'helpdesk_sla_request.dp_id', 'helpdesk_sla_request.eq_id', 'helpdesk_sla_request.eq_std'
		                           , 'helpdesk_sla_request.pmp_id'];

		return this.getRestrictionFromFieldArray('slaFilter', requestFilterFields) + ' AND ' + this.getRestrictionFromFieldArray('bigBadFilter', moreRequestFilterFields) + this.getProbTypeRes();

	},
	
	 /**
	 * get problem type restriction in easy filter
	 */
    getProbTypeRes: function(){
		var probTypeRes = '';
		// work type
		var probTypes = this.slaFilter.getFieldMultipleValues('helpdesk_sla_request.prob_type');
		for ( var i = 0; i < probTypes.length; i++) {
			var probType = probTypes[i];
			if (probType != '') {
				probTypeRes += " OR helpdesk_sla_request.prob_type like '" + probType + "%'";
			}
		}

		if (probTypeRes) {
			
			probTypeRes = ' AND (' + probTypeRes.substring(3) + ')';
			
		}
		
		return probTypeRes;
    },

	/**
	 * Get response filter restriction
	 */
	getResponseFilterRes : function() {
		// response parameter filed array
		var responseFilterFields = [ 'helpdesk_sla_response.work_team_id', 'helpdesk_sla_response.supervisor',
				'helpdesk_sla_response.cf_id', 'helpdesk_sla_response.manager', 'helpdesk_sla_response.servcont_id',
				'helpdesk_sla_response.workflow_name', 'helpdesk_sla_response.service_name' ];

		var autoIssueRes = '1=1';
		if ($('bigBadFilter_helpdesk_sla_response.autoissue').checked) {
			autoIssueRes = 'helpdesk_sla_response.autoissue =1';
		}
		
		var dispatchRes = ''
		if(Ext.get('bigBadFilter_dispatch_work_team').dom.checked){
			dispatchRes = 'helpdesk_sla_response.work_team_id IS NOT NULL';
		}
		
		if(Ext.get('bigBadFilter_dispatch_supervisor').dom.checked){
			dispatchRes = 'helpdesk_sla_response.supervisor IS NOT NULL';
		}
		
		var responseFilterRes = this.getRestrictionFromFieldArray('bigBadFilter', responseFilterFields) + ' AND '
				+ autoIssueRes;
		
		if(dispatchRes){
			responseFilterRes +=' AND ' + dispatchRes;
		}
		
		if (responseFilterRes != '1=1 AND 1=1') {
			responseFilterRes = "EXISTS(SELECT 1 FROM helpdesk_sla_response WHERE "
					+ "helpdesk_sla_response.activity_type ='SERVICE DESK - MAINTENANCE'"
					+ " AND helpdesk_sla_response.ordering_seq=helpdesk_sla_request.ordering_seq AND "
					+ responseFilterRes + ")"
		}
		
		return responseFilterRes;
	},

	/**
	 * Get workflow steps filter restriction
	 */
	getWorkflowStepsFilterRes : function() {
		var workflowStepsFilterRes = '1=1';
		if ($('bigBadFilter_approvalRequired').checked) {
			// response parameter filed array
			var stepsFilterFields = [ 'helpdesk_sla_steps.em_id' ];

			var approverRes = this.getRestrictionFromFieldArray('bigBadFilter', stepsFilterFields);

				workflowStepsFilterRes = "EXISTS(SELECT 1 FROM helpdesk_sla_steps WHERE "
						+ "helpdesk_sla_steps.activity_type ='SERVICE DESK - MAINTENANCE'"
						+ " AND helpdesk_sla_steps.step_type IN('approval','review')"
						+ " AND helpdesk_sla_steps.ordering_seq=helpdesk_sla_request.ordering_seq AND "
						+ approverRes + ")";
		}
		
		if(Ext.get('bigBadFilter_dispatch_dispatcher').dom.checked){
			var dispatcher = View.panels.get('bigBadFilter').getFieldQueryParameter('helpdesk_sla_response.dispatcher');
			workflowStepsFilterRes += " AND EXISTS(SELECT 1 FROM helpdesk_sla_steps WHERE "
				+ "helpdesk_sla_steps.activity_type ='SERVICE DESK - MAINTENANCE'"
				+ " AND helpdesk_sla_steps.step_type ='dispatch'"
				+ " AND helpdesk_sla_steps.ordering_seq=helpdesk_sla_request.ordering_seq AND "
				+ " (helpdesk_sla_steps.em_id " + dispatcher + " OR " + "helpdesk_sla_steps.role_name" + dispatcher + " OR " + "helpdesk_sla_steps.role " + dispatcher
				+  "))";
		}

		return workflowStepsFilterRes;
	},

	/**
	 * Get restriction from field array
	 */
	getRestrictionFromFieldArray : function(panelId, fieldArray) {
		var restriction = '1=1';
		for ( var i = 0; i < fieldArray.length; i++) {
			var fieldName = fieldArray[i];
			var queryParameter = View.panels.get(panelId).getFieldQueryParameter(fieldName);

			if (queryParameter != " IS NOT NULL") {
				restriction += " AND ";
				restriction += fieldName + queryParameter;
			}
		}

		return restriction;
	},
	
	/**
	 * Make sure field is disable when checkbox is unchecked
	 */
	onChangeCheckBox : function() {
		if(Ext.get('bigBadFilter_approvalRequired').dom.checked){
			this.bigBadFilter.enableField('helpdesk_sla_steps.em_id',true);
		}else{
			this.bigBadFilter.setFieldValue('helpdesk_sla_steps.em_id','');
			this.bigBadFilter.enableField('helpdesk_sla_steps.em_id',false);
		}
		
		if(Ext.get('bigBadFilter_dispatch_work_team').dom.checked){
			this.bigBadFilter.enableField('helpdesk_sla_response.work_team_id',true);
		}else{
			this.bigBadFilter.setFieldValue('helpdesk_sla_response.work_team_id','');
			this.bigBadFilter.enableField('helpdesk_sla_response.work_team_id',false);
		}
		
		if(Ext.get('bigBadFilter_dispatch_supervisor').dom.checked){
			this.bigBadFilter.enableField('helpdesk_sla_response.supervisor',true);
		}else{
			this.bigBadFilter.setFieldValue('helpdesk_sla_response.supervisor','');
			this.bigBadFilter.enableField('helpdesk_sla_response.supervisor',false);
		}
		
		if(Ext.get('bigBadFilter_dispatch_dispatcher').dom.checked){
			this.bigBadFilter.enableField('helpdesk_sla_response.dispatcher',true);
		}else{
			this.bigBadFilter.setFieldValue('helpdesk_sla_response.dispatcher','');
			this.bigBadFilter.enableField('helpdesk_sla_response.dispatcher',false);
		}
	}

});



function afterSelectRmId(fieldName, selectedValue, previousValue){
	if(fieldName == 'helpdesk_sla_request.bl_id'){
		View.panels.get('slaFilter').setFieldValue('helpdesk_sla_request.bl_id', selectedValue);
	}
}

function afterSelectFlId(fieldName, selectedValue, previousValue){
	if(fieldName == 'helpdesk_sla_request.bl_id'){
		View.panels.get('slaFilter').setFieldValue('helpdesk_sla_request.bl_id', selectedValue);
	}
}