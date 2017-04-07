
var partInventoryDiffCtrl = View.createController('partInventoryDiffCtrl', {
	 partId:null,
	 partLocId:null,
	 oldAvailQty:0,
	 currentAvailQty:0,
	 currentReserveQty:0,
	 partEstimations:null,
	  
	/**
	 * Record before Edit.
	 */
	recordBeforeEdit : null,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click input[type=checkbox]': function() {
            this.filter_onShowSelectedStatus();
        }
    },
    
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		var emWorkflowSubstitutes = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message;
		this.partGrid.addParameter('emWorkflowSubstitutes', emWorkflowSubstitutes);
		this.estimatedPartGrid.addParameter('emWorkflowSubstitutes', emWorkflowSubstitutes);
	},

    /**
     * Disable the Save action until the user loads a record into the form.
     */
    afterInitialDataFetch: function() {
		if ( !this.detectSchemaChange() )	{
			View.alert( getMessage("noSchemaChange") );
			this.filter.show(false);
			return;
		}

		var statusSelection = document.getElementsByName("filter_statusCheckbox");
		statusSelection[0].checked = true;
		statusSelection[1].checked = true;
		this.filter_onShowSelectedStatus();

		this.estimatedPartGrid.show(false);
    },

    /**
     * Detect if necessary schema changes existed for current view.
     */
    detectSchemaChange: function() {
		var schemaChange = true;
		//detect if wrpt.status contains enum option value 'NR'. 
		var wrptStatusEnumList = this.schemaFieldDS.getRecord("table_name='wrpt' and field_name='status'").getValue("afm_flds.enum_list");
		var valueArray = wrptStatusEnumList.split(";");
		if ( valueArray.length!=10 || "NR"!=valueArray[4] ) {
			schemaChange = false;
		}

		//detect if workflow rule 'BldgopsPartInventoryService' exists.
		var workflowRule = this.workflowRuleDS.getRecord("activity_id='AbBldgOpsBackgroundData' and rule_id='BldgopsPartInventoryService'");
		var valueArray = wrptStatusEnumList.split(";");
		if ( !workflowRule || parseInt(workflowRule.getValue("afm_wf_rules.is_active"))!=1  ) {
			schemaChange = false;
		}
		
		return   schemaChange;
    },
	
	/**
     * Shows how to get values of selected checkboxes.
     */
    filter_onShowSelectedStatus: function() {
		var statusRestriction=" 1=0 ";
        var values = this.filter.getCheckboxValues('statusCheckbox');
		if ( values!=null && values.length>0 )	{
			for ( var i=0; i< values.length;  i++)	{
				statusRestriction += " or wrpt.status='"+	 values[i] +"'" ;
			}
		}
	   statusRestriction=  "( "+statusRestriction +") ";

		this.partGrid.show(true);
		this.partGrid.addParameter('statusRestriction', statusRestriction );
		this.partGrid.refresh();

		this.estimatedPartGrid.show(false);
    },

    /**
     * Shows how to get values of selected checkboxes.
     */
    onSelectPartRow: function() {
		var partRow = this.partGrid.rows[this.partGrid.selectedRowIndex];
		this.initialPartInfo(partRow['pt.part_id'],  partRow['pt_store_loc_pt.pt_store_loc_id'], partRow['pt_store_loc_pt.qty_on_hand'], partRow['pt_store_loc_pt.qty_on_reserve']);
		this.showInstructionsOfPartQuantity();
		this.estimatedPartGrid.actions.get(0).show(false);
		this.estimatedPartGrid.actions.get(1).show(false);
		this.estimatedPartGrid.refresh("wrpt.pt_store_loc_id='"+partRow['pt_store_loc_pt.pt_store_loc_id']+"' and wrpt.part_id='"+partRow['pt.part_id']+"'");
	},

    /**
     * Shows how to get values of selected checkboxes.
     */
    initialPartInfo: function( partId, partLocId, availQty, resQty ) {
		this.partId  =  partId;
		this.partLocId = partLocId;
		this.oldAvailQty =  availQty;
		this.currentAvailQty = availQty;
		this.reserveQty = resQty;
	},

	estimatedPartGrid_afterRefresh: function(){
		//firstly reset array of reserve signs of part estimation grid 
		this.partEstimations = new Array();
		var partEstimations = this.partEstimations;
		var i=0;

		//then format date-time column
		this.estimatedPartGrid.gridRows.each(function(row) {
			partEstimations[i++] = false;

			var date= row.record['wrpt.date_assigned'];
			var time= row.record['wrpt.time_assigned'];
			var dateTime =   date+', '+time;
			row.setFieldValue("wrpt.date_time",dateTime );
		});

		this.estimatedPartGrid.setTitle( this.estimatedPartGrid.title+" "+this.partId );

		//kb#3044118: must re-set the status of action 'Reserve' after the part estimations grid is refreshed
		this.disableReserveActions();

	  //kb#3044749: hide the sort arrow and disable click event of custom field column 'date_time'.
		document.getElementById("sortLink_13").style.display = 'none';
		var headerCell =  document.getElementById("sortHeader_13");
		Ext.fly(headerCell).removeAllListeners();
	},

	showInstructionsOfPartQuantity: function(){
		var instructions ="<span>"+getMessage("pendQty")+": "+"</span>";
		instructions +="<span style='background-color:#66FF00'>"+getMessage("availQty")+": "+this.currentAvailQty+"</span>";
		instructions +="<span>"+"		"+"</span>";
		instructions +="<span style='background-color:#FC6'>"+getMessage("reserveQty")+": "+this.reserveQty+"</span>";
		this.estimatedPartGrid.setInstructions(instructions);
	} ,

	estimatedPartGrid_reserve_onClick: function(row){
		//re-calculate the available quantity and reserved quantity and show them
		this.calculateQuantities(row);
		this.showInstructionsOfPartQuantity();

		//enable or disable the 'Reserve' buttons 
		this.disableReserveActions();

		//check if show 'Commit' and 'Cancel' button
		this.checkActionsVisibility();
	},

	checkActionsVisibility: function(){
		if ( this.hasPendingReservation() ) {
			this.estimatedPartGrid.actions.get(0).show(true);
			this.estimatedPartGrid.actions.get(1).show(true);
		} else {
			this.estimatedPartGrid.actions.get(0).show(false);
			this.estimatedPartGrid.actions.get(1).show(false);
		}
	},

	calculateQuantities: function(row){
		var index = row.record.index;
		var reserveAction =  row.actions.get(0);		
		var isReserved = this.partEstimations[index];
		var estimateQty = row.record['wrpt.qty_estimated'];

		if ( isReserved ){
			 estimateQty = -estimateQty;
			this.partEstimations[index] = false;
			reserveAction.setTitle( getMessage("reserve") ); 
		}  else {
			this.partEstimations[index] = true;
			reserveAction.setTitle( getMessage("reserve") + '√'); 
		}

		this.currentAvailQty -= estimateQty;
		this.reserveQty = parseFloat(this.reserveQty) + parseFloat(estimateQty);
	},

	disableReserveActions: function(){
		var avail = this.currentAvailQty;
		var isPartsReserved = this.partEstimations;
		this.estimatedPartGrid.gridRows.each(function(row) {
			//kb#3044118: convert the string to actual float value for following comparision
			var estimate= parseFloat(row.record['wrpt.qty_estimated']);
			if ( 'NR'!=row.record['wrpt.status.raw'] ) {
				row.actions.get(0).enable(false);
			}
			else if ( (avail<estimate) && !isPartsReserved[row.record.index] ) {
				row.actions.get(0).enable(false);
			}  else {
				row.actions.get(0).enable(true);
			}
		});
	},

	hasPendingReservation: function(){
		var hasPending = false;
		for ( var i=0; i<this.partEstimations.length ; i++)	{
			if ( this.partEstimations[i] ) {
				hasPending = true;
				break;	
			}
		}
		return  hasPending;
	},

	estimatedPartGrid_edit_onClick: function(row){
		if(!this.checkEditEstAndSchedAfterStepComplete(row.getFieldValue('wrpt.wr_id'))){
			return;
		}
		var ctrl = this; 
		if ( this.hasPendingReservation() ) {
			View.confirm(getMessage('editWithPending'), function(button) {
			    if (button == 'yes') {
					// remove all pending reservations
					ctrl.estimatedPartGrid_onCancel();

					ctrl.showEstimatedPartForm( row );
				} 
				else 
					return false;
			});
		}  
		else {
		   this.showEstimatedPartForm( row );
		}
	},

	showEstimatedPartForm: function(row){
		var clickRestriction = this.getRestrictionFromRow(row); 
		this.estimatedPartForm.refresh(clickRestriction);
		this.estimatedPartForm.showInWindow( {x:500, y:300, width: 500, height: 270, title: getMessage("editEstimation")} );
		return true;
	},
	
	/**
	 * Store record before edit
	 */
	estimatedPartForm_afterRefresh : function() {
		if (!this.estimatedPartForm.newRecord) {
			this.recordBeforeEdit = View.panels.get('estimatedPartForm').getFieldValues(true);
		}
	},

	estimatedPartGrid_delete_onClick: function(row){
		if(!this.checkEditEstAndSchedAfterStepComplete(row.getFieldValue('wrpt.wr_id'))){
			return;
		}
		var ctrl = this; 
		if ( this.hasPendingReservation() ) {
			View.confirm(getMessage('deleteWithPending'), function(button) {
			    if (button == 'yes') {
			    	ctrl.estimatedPartGrid_onCancel();
					ctrl.deletePartEstimation( row );
				} 
				else 
					return false;
			});
		}  
		else {
		   this.deletePartEstimation( row );
		}
	},

	/**
	 * check edit estimate and schedule after step complete
	 */
	checkEditEstAndSchedAfterStepComplete : function(wrId) {
		var canEdit = true;
		//get application parameter, if = 0, then make the resource panels read-only if estimate step is completed.
		var EditEstimationAndScheduling = View.activityParameters['AbBldgOpsOnDemandWork-EditEstAndSchedAfterStepComplete'];
		if(EditEstimationAndScheduling == '0' && Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isEstimateOrSchedulingCompleted',wrId,'estimation').value){
			canEdit = false;
		}
		
		return canEdit;
	},

	deletePartEstimation: function(row){
		var clickRestriction = this.getRestrictionFromRow(row); 
		this.wrptDeleteDS.deleteRecord( this.wrptDeleteDS.getRecord(clickRestriction) );
		 
		 //kb#3044002: update  coresponding  part and its part estimations when deleting reserved part estimation
		 var status = row.record['wrpt.status.raw'];
		 var estimateQty = 	row.record['wrpt.qty_estimated'];
		 if ( 'R'==status && estimateQty>0 ) {
			//firstly update part's reserved quantity
			var partRecord = this.updatePartDS.getRecord("pt.part_id=${sql.literal('"+this.partId+"')}");
			if(partRecord){
				var reservedQty = partRecord.getValue('pt.qty_on_reserve');
				partRecord.setValue('pt.qty_on_reserve', reservedQty - estimateQty);
				this.updatePartDS.saveRecord(partRecord);
			}
			
			var partLocRecord = this.updatePartLocDS.getRecord("pt_store_loc_pt.part_id=${sql.literal('"+this.partId+"')} and pt_store_loc_pt.pt_store_loc_id = '"+this.partLocId+"'");
			if(partLocRecord){
				var reservedQty = partLocRecord.getValue('pt_store_loc_pt.qty_on_reserve');
				partLocRecord.setValue('pt_store_loc_pt.qty_on_reserve', reservedQty - estimateQty);
				this.updatePartLocDS.saveRecord(partLocRecord);
			}

			//secondly call WFR to update status of related  part estimations
			try {
				var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-updateWrptStatusForMpsl", this.partId, this.partLocId , parseFloat(estimateQty) );
			 } catch (e) {
				 Workflow.handleError(e); 
			 }
			this.partGrid.refresh();

			//thirdly update part's available quantity and reserved quantity	which are required for  the instruction text of  Part Estimation	grid	.
			 this.currentAvailQty = parseFloat(estimateQty) + parseFloat(this.currentAvailQty);
			 this.reserveQty = parseFloat(this.reserveQty) - parseFloat(estimateQty);
		 }

		this.estimatedPartGrid.refresh();
		this.showInstructionsOfPartQuantity();
	},

	getReservedEstimations: function(){
		var reservedPartEstimations = new Array();
		for ( var i=0; i<this.partEstimations.length ; i++)	{
			if ( this.partEstimations[i] )	{
				var restriction = this.getRestrictionFromRow( this.estimatedPartGrid.rows[i].row ); 
				var record = this.wrptDS.getRecord(restriction);
				reservedPartEstimations.push( record );
			}
		}
		return reservedPartEstimations;
	},

	getNotReservedEstimations: function(){
		var notReservedEstimations = new Array();
		for ( var i=0; i<this.partEstimations.length ; i++)	{
			if ( !this.partEstimations[i] )	{
				var restriction = this.getRestrictionFromRow( this.estimatedPartGrid.rows[i].row ); 
				var record = this.wrptDS.getRecord(restriction);
				notReservedEstimations.push( record );
			}
		}
		return notReservedEstimations;
	},

	getRestrictionFromRow: function( row){
		var restriction = new Ab.view.Restriction(); 
		restriction.addClause("wrpt.wr_id", row.record['wrpt.wr_id']);
		restriction.addClause("wrpt.part_id", row.record['wrpt.part_id']);
		restriction.addClause("wrpt.date_assigned", row.record['wrpt.date_assigned.raw']);
		restriction.addClause("wrpt.time_assigned", row.record['wrpt.time_assigned.key']);
		return   restriction;
	},

	estimatedPartGrid_onCommit: function() {
		//firstly update all reserver part estimations
		var reservedPartEstimations = this.getReservedEstimations();
		for ( var i=0; i<reservedPartEstimations.length ; i++)	{
			reservedPartEstimations[i].setValue("wrpt.status", 'R');
			this.wrptDS.saveRecord(reservedPartEstimations[i]);
		}
		//kb#3044118: also update status for not reserved part estimations
		var notReservedPartEstimations = this.getNotReservedEstimations();
		for ( var i=0; i<notReservedPartEstimations.length ; i++)	{
			var status = notReservedPartEstimations[i].getValue("wrpt.status");
			var estimated = notReservedPartEstimations[i].getValue("wrpt.qty_estimated");
			if ( 'NR'==status && parseFloat(estimated)>this.currentAvailQty) {
				notReservedPartEstimations[i].setValue("wrpt.status", 'NI');
				this.wrptDS.saveRecord(notReservedPartEstimations[i]);
			}
		}

	   //secondly  update part's quantity 
		var partLocRecord = this.updatePartLocDS.getRecord("pt_store_loc_pt.part_id=${sql.literal('"+this.partId+"')} and pt_store_loc_pt.pt_store_loc_id = '"+ this.partLocId+"'");
		if(partLocRecord){
			var reservedQty = partLocRecord.getValue('pt_store_loc_pt.qty_on_reserve');
			var availableQty = partLocRecord.getValue('pt_store_loc_pt.qty_on_hand');
			
			partLocRecord.setValue('pt_store_loc_pt.qty_on_reserve', this.reserveQty);
			partLocRecord.setValue('pt_store_loc_pt.qty_on_hand', this.currentAvailQty);
			this.updatePartLocDS.saveRecord(partLocRecord);
			
			var partRecord = this.updatePartDS.getRecord("pt.part_id=${sql.literal('"+this.partId+"')}");
			if ( partRecord ) {
				partRecord.setValue('pt.qty_on_reserve', parseFloat(partRecord.getValue('pt.qty_on_reserve')) + parseFloat(this.reserveQty)-parseFloat(reservedQty));
				partRecord.setValue('pt.qty_on_hand',  parseFloat(partRecord.getValue('pt.qty_on_hand')) +  parseFloat(this.currentAvailQty) -  parseFloat(availableQty));
				this.updatePartDS.saveRecord(partRecord);
			}
		}
		
		//thirdly refresh the part grid and the part estimations grid
		this.partGrid.refresh();
		this.estimatedPartGrid.refresh();

		//	finally re-set the visibility of 'Commit' button
		this.initialPartInfo(  this.partId,  this.partLocId, this.currentAvailQty , this.reserveQty );
		this.checkActionsVisibility();
	},

	estimatedPartGrid_onCancel: function() {
		for ( var i=0; i<this.partEstimations.length ; i++)	{
			if ( this.partEstimations[i] )	{
				this.estimatedPartGrid_reserve_onClick( this.estimatedPartGrid.rows[i].row );
			}
		}
	},

	estimatedPartForm_onSave: function(){
		if ( this.estimatedPartForm.canSave() )	{
			
			if(this.checkPrimaryKeyChange()){
				return;
			}

			var oldValues = this.estimatedPartForm.getOldFieldValues(); 
			var oldEstimateQty= oldValues["wrpt.qty_estimated"];
			var newEstimateQty = this.estimatedPartForm.getFieldValue("wrpt.qty_estimated");
			var quantityDiff =  newEstimateQty - 	oldEstimateQty; 
			//if no estimated quantity change then return
			if ( quantityDiff==0 )
				return;
			var quantity=0;
			if ( 'R' == this.estimatedPartForm.getFieldValue("wrpt.status") ) {
				if ( quantityDiff > this.currentAvailQty ) {
					//firstly save the wrpt record with changed estimation and status
					this.estimatedPartForm.setFieldValue("wrpt.status", "NI");
				   //secondly call WFR to update part's quantity and status of its associated wrpts 
					quantity = oldEstimateQty;
				} 
				else if ( quantityDiff <= this.currentAvailQty ) {
					quantity = -quantityDiff;
				}
			}
			else if ( 'NI'==this.estimatedPartForm.getFieldValue("wrpt.status") ) {
				if ( quantityDiff<0 &&  newEstimateQty<=this.currentAvailQty ) {
					this.estimatedPartForm.setFieldValue("wrpt.status", "NR");
				}	
			}
			else if ( 'NR'==this.estimatedPartForm.getFieldValue("wrpt.status") ) {
				if ( quantityDiff >0 &&  newEstimateQty>this.currentAvailQty ) {
					this.estimatedPartForm.setFieldValue("wrpt.status", "NI");
				}	
			}

			var partAvgCost = this.estimatedPartForm.getFieldValue("pt_store_loc_pt.cost_unit_avg");
			this.estimatedPartForm.setFieldValue("wrpt.cost_estimated", parseFloat(newEstimateQty*partAvgCost).toFixed(2));
			this.estimatedPartForm.save();
			
			if ( quantity!=0 ) {
				try {
					var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-updateWrptStatusForMpsl", this.partId, this.partLocId, parseFloat(quantity));
				 } catch (e) {
					 Workflow.handleError(e); 
				 }
				this.partGrid.refresh();
			}

			this.estimatedPartGrid.refresh();

			//kb#3044010: update the instruction text of  Part Estimation	grid since the part's quantity is updated	.
			var partLocRecord = this.updatePartLocDS.getRecord("pt_store_loc_pt.part_id=${sql.literal('"+this.partId+"')} and pt_store_loc_pt.pt_store_loc_id = '" + this.partLocId + "'");
			if ( partLocRecord ) {
				var reservedQty = partLocRecord.getValue('pt_store_loc_pt.qty_on_reserve');
				var availableQty = partLocRecord.getValue('pt_store_loc_pt.qty_on_hand');
			}
			this.currentAvailQty = parseFloat(availableQty) ;
			this.reserveQty =  parseFloat(reservedQty);
			this.showInstructionsOfPartQuantity();

			//kb#3044013: enable or disable the 'Reserve' buttons after editing part estimation
			this.disableReserveActions();
		}
	},
	
	/**
	 * Check Primary key change before edit,  if primary key change, delete the old record and insert the new record.
	 */
	checkPrimaryKeyChange : function() {
		var form = View.panels.get('estimatedPartForm');
		if (!form.newRecord) {
			var newValues = form.getFieldValues(true);
			if(newValues['wrpt.part_id']!=this.recordBeforeEdit['wrpt.part_id']
			||newValues['wrpt.pt_store_loc_id']!=this.recordBeforeEdit['wrpt.pt_store_loc_id']
			   ||newValues['wrpt.date_assigned']!=this.recordBeforeEdit['wrpt.date_assigned']
			     ||newValues['wrpt.time_assigned']!=this.recordBeforeEdit['wrpt.time_assigned']){
				
				var records = [ this.recordBeforeEdit];
				try {
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-deleteItems', "wrpt", records);
					
					var wrptRecord = {};
					wrptRecord['wrpt.wr_id'] = newValues['wrpt.wr_id'];
					wrptRecord['wrpt.part_id'] = newValues['wrpt.part_id'];
					wrptRecord['wrpt.pt_store_loc_id'] = newValues['wrpt.pt_store_loc_id'];
					wrptRecord['wrpt.date_assigned'] = newValues['wrpt.date_assigned'];
					wrptRecord['wrpt.time_assigned'] = newValues['wrpt.time_assigned'];
					wrptRecord['wrpt.qty_estimated'] = newValues['wrpt.qty_estimated'];
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestPartForMPSL', wrptRecord);
					this.filter_onShowSelectedStatus();
					form.closeWindow();
				} catch (e) {
					form.validationResult.valid = false;
					form.displayValidationResult(e);
				}
				
				return true;
			}
		}
		
		return false;
	}
});