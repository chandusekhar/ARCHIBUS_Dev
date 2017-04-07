/**
 * Controller for SLA console events and handler.
 * 
 * Events: 
 * app:operation:express:sla:addNewSLA app:operation:express:sla:quickEditSLA 
 * app:operation:express:sla:copySLA 
 * app:operation:express:sla:editDetailsSLA 
 * app:operation:express:sla:refreshSLA
 */
View.createController('slaConsoleEvents', {

	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:showSLASummaryPopUp', this.showSLASummaryPopUp);
		this.on('app:operation:express:sla:refreshSLA', this.refreshSLA);
		this.on('app:operation:express:sla:createGroupings', this.createGroupings);
	},

	// ----------------------- Event handlers ----------------------------------

	/**
	 * Show SLA summary.
	 * 
	 * @param row
	 *            selected row
	 */
	showSLASummaryPopUp : function(row) {
		var selectedSLA = this.createSlaModelFromRow(row);
		this.trigger('app:operation:express:sla:showSlaSummary', selectedSLA);
		this.summaryForm.showInWindow({
			x : 10,
			y : 100,
			modal : true,
			height : 1200,
			width : 1200
		});
		this.summaryForm.parentSlaRow = row;
		this.summaryForm.actions.get('closeWindnow').show(true);
		this.summaryForm.actions.get('createGrouping').show(true);

	},

	/**
	 * Refresh SLA grid list.
	 */
	refreshSLA : function() {
		View.openProgressBar(getMessage('getGrouping'));
		View.updateProgressBar(1/3);
		// filter controller
		var filterContrller = View.controllers.get('slaFilter');
		
		//set default page index before refresh the sla grid
		this.slaList.addParameter('targetPage',1);

		// set grid datasource parameters from filter controller
		if(filterContrller.filterRes == '1=1 AND 1=1 AND 1=1 AND 1=1 AND 1=1'){
			this.slaList.addParameter('filterRes', '');
		}else{
			this.slaList.addParameter('filterRes', filterContrller.filterRes);
		}
		
		// refresh grid
		this.slaList.refresh();
		View.closeProgressBar();
	},
	
	/**
	 * Create groupings.
	 */
	createGroupings : function(rows) {
		var groupings = this.getGroupingsFromSelectedRows(rows);
		Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-createGroupings', groupings);

		// refresh grid
		this.slaList.refresh();
	},
	
	// ----------------------- Helper methods ----------------------------------

	/**
	 * Create sla model from selected row.
	 * 
	 * @param row
	 *            selected row
	 */
	createSlaModelFromRow : function(row) {
		var sla = new Ab.operation.express.sla.ServiceLevelAgreementGrouping();
		var orderingSeqs = row.getRecord().getValue('bl.address1');
		var mainOrderingSeq = row.getRecord().getValue('helpdesk_sla_request.grouping');
		sla.loadByOrderingSeqs(orderingSeqs,mainOrderingSeq);
		return sla;
	},
	
	/**
	 * Get grouping from selected rows.
	 * 
	 * @param row
	 *            selected row
	 */
	getGroupingsFromSelectedRows : function(rows) {
		// get grouping array from the selected rows or record
		var groupings = [];
		if (rows instanceof Array) {
			for ( var i = 0; i < rows.length; i++) {
				var row = rows[i];
				groupings.push(row['bl.address1']);//bl.address1 is virtual field which store values of ordering sequences of the grouping
			}
		} else {
			groupings.push(rows.record['bl.address1']);
		}

		return groupings;
	}
	
});
