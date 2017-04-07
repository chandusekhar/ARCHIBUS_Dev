Ab.namespace('operation.express.sla');

/**
 * Service Level Agreements.
 */
Ab.operation.express.sla.ServiceLevelAgreementGrouping = Base.extend({
	/**
	 * Request parameters.
	 */
	requestParameters : null,

	/**
	 * Response parameters.
	 */
	responseParameters : null,

	/**
	 * Constructor.
	 */
	constructor : function() {
		this.requestParameters = new Ab.operation.express.sla.RequestParameters();
		this.responseParameters = [];
	},

	/**
	 * Load Service Level Agreements from ordering seqs.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	loadByOrderingSeqs : function(orderingSeqs,mainOrderingSeq) {
		// set request parameters
		this.setRequestParametersByOrderingSeqs(orderingSeqs);
		// set response parameters
		this.setResponseParametersByOrderingSeq(mainOrderingSeq);
		// set workflow steps
		this.setWorkflowStepsByOrderingSeq(mainOrderingSeq);
	},

	/**
	 * Set request parameters from grouping code.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	setRequestParametersByOrderingSeqs : function(OrderingSeqs) {
		// create Request parameter object
		this.requestParameters = new Ab.operation.express.sla.RequestParameters();

		// call WFR AbBldgOpsHelpDesk-SLAService-getRequestParametersByGrouping
		// to get request parameters
		try {
			var ruleName = 'AbBldgOpsHelpDesk-SLAService-getRequestParametersByOrderingSeqs';
			var record = Workflow.callMethod(ruleName, OrderingSeqs).dataSet;
			this.requestParameters.setValuesFromRecord(record);
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	/**
	 * Set response parameters from OrderingSeq.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	setResponseParametersByOrderingSeq : function(OrderingSeq) {
		this.responseParameters = [];

		// call WFR AbBldgOpsHelpDesk-SLAService-getResponseParametersByGrouping
		// to get response parameters
		try {
			var ruleName = 'AbBldgOpsHelpDesk-SLAService-getResponseParametersByOrderingSeq';
			var records = Workflow.callMethod(ruleName, parseInt(OrderingSeq)).dataSet.records;
			for ( var i = 0; i < records.length; i++) {
				var responseParameter = new Ab.operation.express.sla.ResponseParameters();
				responseParameter.setValuesFromRecord(records[i]);
				this.responseParameters.push(responseParameter);
			}

		} catch (e) {
			Workflow.handleError(e);
		}
	},

	/**
	 * Set workflow steps from grouping code.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	setWorkflowStepsByOrderingSeq : function(OrderingSeq) {
		if (this.responseParameters.length > 0) {

			// call WFR AbBldgOpsHelpDesk-SLAService-getWorkflowStepsByGrouping
			// to get workflow steps
			try {
				var ruleName = 'AbBldgOpsHelpDesk-SLAService-getWorkflowStepsByOrderingSeq';
				var records = Workflow.callMethod(ruleName, parseInt(OrderingSeq)).dataSet.records;
				for ( var i = 0; i < this.responseParameters.length; i++) {
					this.responseParameters[i].setWorkflowStepsFromRecords(records);
				}

			} catch (e) {
				Workflow.handleError(e);
			}
		}
	}

});
