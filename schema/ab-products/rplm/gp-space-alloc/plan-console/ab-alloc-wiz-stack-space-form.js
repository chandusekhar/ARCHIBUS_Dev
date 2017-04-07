
/**
 * Controller for editing, allocating and splitting space.
 */
var abAllocWizStackSpaceFormController = View.createController('abAllocWizStackSpaceFormController', {
	/** The current asOfDate for displaying the stack chart.*/
	asOfDate: '2015-03-04',
	
	/** The Portfolio Scenario displayed.*/
	scn_id: "Test Heqiang",

	/** The Portfolio Scenario Level.*/
	scnLevel: "",
	
	/**The current operation. 'ALLOCATE' for allocating space, 'EDIT' for editting space and 'SPLIT' for splitting space. */
	type: 'EDIT',
	
	/** If the user edit an existing group, we refresh the panel with this group id.*/
	editGroupId: 2534,
	
	/** The callback when the user save or delete the record.*/
	callback: null,
	
	/** The event name stored last time.*/
	lastStoredEventNameForAllocating: '',
	
	/** The original area before split.*/
	originalSplitArea: 0,
	
	/** The edit sub type of edit or split group.*/
	subType: '',
	
	events: {
		"click #pctFloorAreaRadio": function() {
			jQuery("#pctFloor").removeAttr("disabled");
			jQuery("#countEm").attr("disabled","disabled");
			jQuery("#add_em_per_seat").attr("disabled","disabled");
		},
		
		"click #headCounterAreaRadio": function() {
			jQuery("#pctFloor").attr("disabled","disabled");
			jQuery("#countEm").removeAttr("disabled");
			jQuery("#add_em_per_seat").removeAttr("disabled");
		},
		
		"click #pctFloorUnavailAreaRadio": function() {
			jQuery("#unavailPctFloor").removeAttr("disabled");
			jQuery("#unavailableCountEm").attr("disabled","disabled");
			jQuery("#unavail_em_per_seat").attr("disabled","disabled");
		},
		
		"click #headCounterUnavailAreaRadio": function() {
			jQuery("#unavailPctFloor").attr("disabled","disabled");
			jQuery("#unavailableCountEm").removeAttr("disabled");
			jQuery("#unavail_em_per_seat").removeAttr("disabled");
		},
		
		"click #toggleSplitSpaceMoreOptionButton": function() {
			this.toggleSplitDetailsForm();
		},
		
		"click #calculateTwoGroupArea": function() {
			this.calculateTwoGroupArea();
		},
		
		"click #otherUnavailableAreaRadio": function() {
			this.setMarkFormGroupNameAndDesc('Other Unavailable Space');
			this.enableAreaCalculationOptions(true);
		},
		
		"click #serviceUnavailableAreaRadio": function() {
			this.setMarkFormGroupNameAndDesc('Unavailable Service Space');
			this.enableAreaCalculationOptions(false);
		},
		
		"click #vpUnavailableAreaRadio": function() {
			this.setMarkFormGroupNameAndDesc('Unavailable Vertical Penetration');
			this.enableAreaCalculationOptions(false);
		},
		
		"click #remainingUnavailableAreaRadio": function() {
			this.setMarkFormGroupNameAndDesc('Unavailable Remaining Space');
			this.enableAreaCalculationOptions(false);
		},

		"click #calculateGroupArea": function() {
			this.calculateGroupArea();
		},
			
		"click #calculateUnavailableGroupArea": function() {
			this.calculateUnavailableGroupArea();
		}																										  
	},
	
	
	/**
	 * Displaying the correct form according to the type.
	 */
	afterInitialDataFetch: function() {
		if (this.type == 'ALLOCATE') {
			this.setAllocateSpaceForm();
		} else if (this.type == 'EDIT') {
			this.setEditSpaceForm();
		} else if(this.type == 'SPLIT') {
			this.setSplitSpaceForm();
		} else if(this.type == 'UNAVAILABLE'){
			this.setMarkSpaceUnavailableForm();
		} else {
			alert("No such space operation type!");
		}

        $('id_set_color').value = getMessage('setColor');
	},
	
	/**
	 * 
	 */
	setMarkFormGroupNameAndDesc: function(value) {
		this.markSpaceAsUnavailableForm.setFieldValue('gp.name', value);
		this.markSpaceAsUnavailableForm.setFieldValue('gp.description', value);
	},
	
	/**
	 * Toggle the split form more option.
	 */
	toggleSplitDetailsForm: function() {
		this.splitSpaceMoreOptionForm.toggleCollapsed();
		jQuery('#toggleSplitSpaceMoreOptionButton').text(this.splitSpaceMoreOptionForm.collapsed ?
	            getMessage('moreText'):getMessage('lessText') );
	},
	
	selectBuildingCodeFromGp: function() {
		var controller = this;
		var selectBuildingActionListener =  function(fieldName, newValue, oldValue) {
            controller.allocateSpaceForm.setFieldValue('gp.bl_id', newValue);
            controller.allocateSpaceForm.setFieldValue('gp.fl_id', "");
            return false;
        };
        var restriction = " gp.portfolio_scenario_id ='" + this.scn_id + "'" ;
        
		View.selectValue({
			title: getMessage('selectBuilding'),
	    	fieldNames: ['gp.bl_id'],
	    	selectTableName: 'gp',
	    	selectFieldNames: ['gp.bl_id'],
	    	visibleFieldNames: ['gp.bl_id'],
	    	actionListener: selectBuildingActionListener,
	    	restriction: restriction,
	    	width: 500,
	    	height: 350
		});
	},
	
	selectBuildingAndFloorCodeFromGp: function() {
		var controller = this;
		var selectBuildingActionListener =  function(fieldName, newValue, oldValue) {
			if (fieldName=='gp.bl_id') {
				controller.allocateSpaceForm.setFieldValue('gp.bl_id', newValue);
			} else if(fieldName=='gp.fl_id') {
				controller.allocateSpaceForm.setFieldValue('gp.fl_id', newValue);
			}
            return false;
        };
        var restriction = " gp.portfolio_scenario_id ='" + this.scn_id + "'" ;
        if (this.allocateSpaceForm.getFieldValue('gp.bl_id')) {
        	restriction = restriction + " AND gp.bl_id='" + this.allocateSpaceForm.getFieldValue('gp.bl_id') + "'";
        }
        
		View.selectValue({
			title: getMessage('selectFloor'),
	    	fieldNames: ['gp.bl_id', 'gp.fl_id'],
	    	selectTableName: 'gp',
	    	selectFieldNames: ['gp.bl_id', 'gp.fl_id'],
	    	visibleFieldNames: ['gp.bl_id', 'gp.fl_id'],
	    	actionListener: selectBuildingActionListener,
	    	restriction: restriction,
	    	width: 500,
	    	height: 350
		});
	},
	
	/**
	 * Save split form.
	 */
	splitSpaceForm_onSaveSplitSpaceForm: function() {
		if(!this.splitSpaceMoreOptionForm.canSave()) {
			return;
		}
		
		var firstGroupArea = $('firstGroupAreaInput').rawValue;
		var secondGroupArea = $('secondGroupDirectAreaInput').rawValue;
		if (!firstGroupArea || !secondGroupArea) {
			View.alert(getMessage('fillTwoArea'));
			return;
		}
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', this.editGroupId, '=');
		var record = this.spaceOperationDataSource.getRecords(restriction)[0];
		
		//update the end date for the original group.
		var dateStart = this.splitSpaceMoreOptionForm.getFieldValue('gp.date_start');
		if (this.subType == 'SPLIT-GROUP-FROM-ASOFDATE') {
			var dateEnd = this.addDay(dateStart, -1);
			record.setValue('gp.date_end', dateEnd);
			record.isNew = false;
			this.spaceOperationDataSource.saveRecord(record);
		}
		
		//Update the first group and create the second group.
		if (this.subType == 'SPLIT-GROUP-FROM-STARTDATE'){
			var firstGroupName = this.splitSpaceMoreOptionForm.getFieldValue('gp.name');
			if(firstGroupName) {
				record.setValue('gp.name', firstGroupName);
			}
			var description = this.splitSpaceMoreOptionForm.getFieldValue('gp.description');
			if(description) {
				record.setValue('gp.description', description);
			}
			var eventName = this.splitSpaceForm.getFieldValue('gp.event_name');
			if(eventName) {
				record.setValue('gp.event_name', eventName);
			}
			
			record.setValue('gp.area_manual', Number(firstGroupArea));
			
			var totalCountEm = record.getValue('gp.count_em');
			var firstGroupCountEm = 	Math.round( Number(firstGroupArea)/(Number(firstGroupArea)+Number(secondGroupArea))*totalCountEm );
			record.setValue('gp.count_em', firstGroupCountEm);
			
			record.isNew = false;
			try{
				this.spaceOperationDataSource.saveRecord(record);
			}catch(e){
				Workflow.handleError(e);
				return;
			}
			
			//create the second group
			record.isNew = true;
			record.removeValue('gp.gp_id');
			record.removeValue('gp.date_end');
			var secondGroupName = this.splitSpaceMoreOptionForm.getFieldValue('second_name');
			if(secondGroupName) {
				record.setValue('gp.name', secondGroupName);
			}
			var secondDesc = this.splitSpaceMoreOptionForm.getFieldValue('second_description');
			if(secondDesc) {
				record.setValue('gp.description', secondDesc);
			}

			record.setValue('gp.area_manual', Number(secondGroupArea));
			record.setValue('gp.count_em', totalCountEm - firstGroupCountEm);

			var secondGroupDateEnd = this.splitSpaceMoreOptionForm.getFieldValue('gp.date_end');
			if(secondGroupDateEnd) {
				record.setValue('gp.date_end', secondGroupDateEnd);
			}
			
			record.setValue('gp.date_start', dateStart);
			
			try{
				this.spaceOperationDataSource.saveRecord(record);
			}catch(e){
				Workflow.handleError(e);
				return;
			}
		} 
		else if (this.subType == 'SPLIT-GROUP-FROM-ASOFDATE'){//Create the two new groups from the existing group.
			record.isNew = true;
			record.removeValue('gp.gp_id');
			record.setValue('gp.parent_group_id', this.editGroupId);
			record.removeValue('gp.date_end');
			var firstGroupName = this.splitSpaceMoreOptionForm.getFieldValue('gp.name');
			if(firstGroupName) {
				record.setValue('gp.name', firstGroupName);
			}
			var description = this.splitSpaceMoreOptionForm.getFieldValue('gp.description');
			if(description) {
				record.setValue('gp.description', description);
			}
			var eventName = this.splitSpaceForm.getFieldValue('gp.event_name');
			if(eventName) {
				record.setValue('gp.event_name', eventName);
			}
			if(dateStart) {
				record.setValue('gp.date_start', dateStart);
			}
			var dateEnd2 = this.splitSpaceMoreOptionForm.getFieldValue('gp.date_end');
			if(dateEnd2) {
				record.setValue('gp.date_end', dateEnd2);
			}

			if (firstGroupArea) {
				record.setValue('gp.area_manual', Number(firstGroupArea));
			}

 			var totalCountEm = record.getValue('gp.count_em');
			var firstGroupCountEm = 	Math.round( Number(firstGroupArea)/(Number(firstGroupArea)+Number(secondGroupArea))*totalCountEm );
			record.setValue('gp.count_em', firstGroupCountEm);

			try{
				this.spaceOperationDataSource.saveRecord(record);
			}catch(e){
				Workflow.handleError(e);
				return;
			}
			
			//create the second group
			record.isNew = true;
			record.removeValue('gp.gp_id');
			var secondGroupName = this.splitSpaceMoreOptionForm.getFieldValue('second_name');
			if(secondGroupName) {
				record.setValue('gp.name', secondGroupName);
			}
			var secondDesc = this.splitSpaceMoreOptionForm.getFieldValue('second_description');
			if(secondDesc) {
				record.setValue('gp.description', secondDesc);
			}
			
			if(secondGroupArea) {
				record.setValue('gp.area_manual', Number(secondGroupArea));
				record.setValue('gp.count_em', totalCountEm - firstGroupCountEm);
			}

			try{
				this.spaceOperationDataSource.saveRecord(record);
			}catch(e){
				Workflow.handleError(e);
				return;
			}
		}
		var dateStart = this.splitSpaceMoreOptionForm.getFieldValue('gp.date_start');
		if(dateStart && this.callback) {
			this.callback(dateStart, this.splitSpaceForm.getFieldValue('gp.event_name'));
		}
		View.closeThisDialog();
	},
	
	/**
	 * Mark the space as unavailable.
	 */
	markSpaceAsUnavailableForm_onSaveMarkedUnavailableSpace: function() {
		if(this.markSpaceAsUnavailableForm.canSave()) {
			var groupId = this.markSpaceAsUnavailableForm.getFieldValue('gp.gp_id');
			
			var record = null;
			//Edit a unavailable space.
			if (groupId != null && groupId != '') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('gp.gp_id', this.editGroupId, '=');
				var record = this.spaceOperationDataSource.getRecords(restriction)[0];
				this.setUnavailableRecordValue(record);
				record.isNew = false;
				if( this.subType == 'EDIT-GROUP-FROM-ASOFDATE' || this.subType == 'EDIT-GROUP-FROM-STARTDATE' ) {
					if ( !this.UpdateSelectedGroupRecord(record) ) {
						return;
					}
				}
			} else {//create a new unavailable space.
				var record = new Ab.data.Record();
				record.isNew = true;
				this.setUnavailableRecordValue(record);
			}
			if (record) {
				this.spaceOperationDataSource.saveRecord(record);
			}
			var dateStart = this.markSpaceAsUnavailableForm.getFieldValue('gp.date_start');
			var eventName = this.markSpaceAsUnavailableForm.getFieldValue('gp.event_name');
			if (this.callback) {
				this.callback(dateStart, eventName);
			}
			View.closeThisDialog();
		}
	},
					 
	/**
	 * Check whether need to apply end date to current selected unavailable group record and create a new one.
	 */
	UpdateSelectedGroupRecord: function(record) {
		var currentStartDate = record.getValue('gp.date_start');
		var isoCurrentStartDate = getIsoFormatDate(Date.parseDate(currentStartDate, 'Y-m-d'));

		var oldValues = this.markSpaceAsUnavailableForm.getOldFieldValues();
		var originalStartDate = oldValues['gp.date_start'];
		var isoOriginalStartDate = getIsoFormatDate(Date.parseDate(originalStartDate, 'Y-m-d'));

		if (isoCurrentStartDate > isoOriginalStartDate) {
			var newValues = record.values;
			record.isNew = false;
			record.values = oldValues;
			var endDate = this.addDay(this.markSpaceAsUnavailableForm.getFieldValue('gp.date_start'), -1);
			record.setValue('gp.date_end', endDate);
			this.spaceOperationDataSource.saveRecord(record);

			record.isNew = true;
			record.values = newValues;
			record.setValue('gp.parent_group_id', record.getValue('gp.gp_id'));
			record.removeValue('gp.gp_id');
			record.removeValue('gp.date_end');
			return true;
		} 
		else if(isoCurrentStartDate == isoOriginalStartDate){
			record.isNew = false;
			return true;
		}  
		else {
			View.alert(getMessage('lessStartDate'));
			return false;
		}
	},

	/**
	 * Set values for the unavailable group record.
	 */
	setUnavailableRecordValue: function(record) {
		var areaStandard = jQuery('input[name="typeOfSpace"]').filter(':checked').val();
		if (areaStandard == 'otherUnavailableAreaRadio') {
			record.setValue('gp.allocation_type', 'Unavailable Area');
			record.setValue('gp.sort_order', 0);
		} else if (areaStandard == 'serviceUnavailableAreaRadio') {
			record.setValue('gp.allocation_type', 'Unavailable - Service Area');
			record.setValue('gp.sort_order', -2)
		} else if (areaStandard == 'vpUnavailableAreaRadio') {
			record.setValue('gp.allocation_type', 'Unavailable - Vertical Penetration Area');
			record.setValue('gp.sort_order', -3)
		} else if (areaStandard == 'remainingUnavailableAreaRadio') {
			record.setValue('gp.allocation_type', 'Unavailable - Remaining Area');
			record.setValue('gp.sort_order', -1);
		}
		record.setValue('gp.name', this.markSpaceAsUnavailableForm.getFieldValue('gp.name'));
		record.setValue('gp.description', this.markSpaceAsUnavailableForm.getFieldValue('gp.description'));
		record.setValue('gp.event_name', this.markSpaceAsUnavailableForm.getFieldValue('gp.event_name'));
		record.setValue('gp.bl_id', this.markSpaceAsUnavailableForm.getFieldValue('gp.bl_id'));
		record.setValue('gp.fl_id', this.markSpaceAsUnavailableForm.getFieldValue('gp.fl_id'));
		record.setValue('gp.date_start', this.markSpaceAsUnavailableForm.getFieldValue('gp.date_start'));
		record.setValue('gp.date_end', this.markSpaceAsUnavailableForm.getFieldValue('gp.date_end'));
		record.setValue('gp.portfolio_scenario_id', this.scn_id);
		var calculationStand = jQuery('input[name="unavailAreaCalculationRadio"]').filter(':checked').val();
		if (calculationStand == 'pctFloorUnavailArea') {
			record.setValue('gp.pct_floor', Number($('unavailPctFloor').rawValue));
		} else if (calculationStand == 'headCounterUnavailArea') {
			record.setValue('gp.em_per_seat', Number($('unavail_em_per_seat').value));
			record.setValue('gp.count_em', Number(jQuery('#unavailableCountEm').val()));
		}
		record.setValue('gp.area_manual', Number($('gp_unavail_area_manual').rawValue));
	},
	
	/**
	 * Calculate the two groups area and set the value.
	 */
	calculateTwoGroupArea: function() {
		var areaStandard = jQuery('input[name="firstGroupAreaStandard"]').filter(':checked').val();
		if (areaStandard == 'firstGroupPctArea') {
			var percent = $('firstGroupPctAreaInput').rawValue;
			var firstGroupArea = percent * this.originalSplitArea/100;
			this.setFormattedValue($('secondGroupPctAreaInput'), 100-percent);
			this.setFormattedValue($('firstGroupAreaInput'), firstGroupArea.toFixed(2));
			this.setFormattedValue($('secondGroupDirectAreaInput'), (this.originalSplitArea - firstGroupArea).toFixed(2));

		} else if (areaStandard == 'firstGroupDirectArea') {
			var firstGroupArea = $('firstGroupAreaInput').rawValue;
			var firstPercent = (firstGroupArea/this.originalSplitArea * 100).toFixed(0);
			this.setFormattedValue($('firstGroupPctAreaInput'), firstPercent);

			var secondGroupArea = (this.originalSplitArea - firstGroupArea).toFixed(2);
			this.setFormattedValue($('secondGroupDirectAreaInput'), secondGroupArea);
			var secondPercent = (secondGroupArea/this.originalSplitArea * 100).toFixed(0);
			this.setFormattedValue($('secondGroupPctAreaInput'), secondPercent);
		}
	},
	
	/**
	 * Calculate unavailable group area.
	 */
	calculateUnavailableGroupArea: function() {
		var areaStandard = jQuery('input[name="typeOfSpace"]').filter(':checked').val();
		if (areaStandard == 'otherUnavailableAreaRadio') {
			var calculationStand = jQuery('input[name="unavailAreaCalculationRadio"]').filter(':checked').val();
			if(calculationStand == 'headCounterUnavailArea') {
				var flRecord = this.getFloorRecord();
				if (!flRecord){
					return;
				}
				var employHeadCount = Number(jQuery('#unavailableCountEm').val());
				var emPerSeat = Number($('unavail_em_per_seat').value);
				var flStdArea = Number(flRecord.getValue('fl.std_area_per_em'));
				if (emPerSeat != 0) {
					var sumArea = employHeadCount/emPerSeat * flStdArea;
					this.setFormattedValue($('gp_unavail_area_manual'), sumArea.toFixed(2));
				} else {
					View.alert(getMessage('zeroPerSeat'));
				}
			} else {
				//If the '% of Floor' radio button is selected, the Area = % of Floor multiplied by that floor¡¯s usable area (gp.area_manual where gp.allocation_type in (¡°Usable Area ¨C Owned¡±, ¡°Usable Area ¨C Leased¡±))
				var sumArea = this.getFloorUsableArea(this.markSpaceAsUnavailableForm);
				var pctFloor = $('unavailPctFloor').rawValue;
				this.setFormattedValue($('gp_unavail_area_manual'), (sumArea * Number(pctFloor)/100 ).toFixed(2));
			}
		} else {
			View.alert(getMessage('calAreaOnOtherUnavail'));
		}
	},

	/**
	 * get the floor record.
	 */
	getFloorRecord: function() {
		var blId = this.markSpaceAsUnavailableForm.getFieldValue('gp.bl_id');
		var flId = this.markSpaceAsUnavailableForm.getFieldValue('gp.fl_id');
		if(!blId || !flId) {
			View.alert(getMessage('locationCannotBeNULL'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', blId, '=');
		restriction.addClause('fl.fl_id', flId, '=');
		return this.floorAreaQueryDs.getRecords(restriction)[0];
	},

	/**
	 * Show the form for marking space as unavailable.
	 */
	setMarkSpaceUnavailableForm: function() {
		if (this.subType=='ADD-NEW') {
			this.markSpaceAsUnavailableForm.show(true);
			jQuery("#otherUnavailableAreaRadio").attr("checked","checked");
			this.setMarkFormGroupNameAndDesc('Other Unavailable Space');
			this.markSpaceAsUnavailableForm.setFieldValue('gp.date_start', this.asOfDate);

			//kb#3050750:  Copy the selected Building and Floor into the Add Unabailable Area form
			this.setBlAndFl(this.markSpaceAsUnavailableForm);

		} else if(this.subType == 'EDIT-EXISTING' || this.subType == 'EDIT-GROUP-FROM-STARTDATE'){
			this.fillInUnavailableFormWithOriginalData();
		} else if (this.subType == 'EDIT-GROUP-FROM-ASOFDATE') {
			this.fillInUnavailableFormWithOriginalData();
			this.markSpaceAsUnavailableForm.setFieldValue('gp.date_start', this.asOfDate);
		} 
	},
	
	fillInUnavailableFormWithOriginalData: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', this.editGroupId, '=');
		this.markSpaceAsUnavailableForm.refresh(restriction);
		var record = this.spaceOperationDataSource.getRecords(restriction)[0];
		var allocationType = record.getValue('gp.allocation_type');
		if(allocationType == 'Unavailable Area') {
			jQuery("#otherUnavailableAreaRadio").attr("checked","checked");
		} else if(allocationType == 'Unavailable - Service Area') {
			jQuery("#serviceUnavailableAreaRadio").attr("checked","checked");
		} else if(allocationType == 'Unavailable - Vertical Penetration Area') {
			jQuery("#vpUnavailableAreaRadio").attr("checked","checked");
		} else if (allocationType == 'Unavailable - Remaining Area') {
			jQuery("#remainingUnavailableAreaRadio").attr("checked","checked");
		}

		if(allocationType == 'Unavailable Area') {
			this.enableAreaCalculationOptions(true);
			var pctFloorValue = record.getValue('gp.pct_floor');
			this.setFormattedValue($('unavailPctFloor'), pctFloorValue);
			var countEmValue = record.getValue('gp.count_em');
			jQuery('#unavailableCountEm').val(countEmValue);
		} 
		else {
			this.enableAreaCalculationOptions(false);
		}
		this.setFormattedValue($('gp_unavail_area_manual'), Number(record.getValue("gp.area_manual")).toFixed(2));
	},
	
	/**
	 * The user allocates the space.
	 */
	setAllocateSpaceForm: function() {
		if (this.subType == 'ADD-NEW') {
			this.allocateSpaceForm.show(true);
			this.allocateSpaceForm.setFieldValue('gp.date_start', this.asOfDate);

			//kb#3050750:  Copy the selected Building and Floor into the Add Allocated Area form
			this.setBlAndFl(this.allocateSpaceForm);

			this.allocateSpaceForm.setFieldValue('gp.date_start', this.asOfDate);
		} else if(this.subType == 'EDIT-EXISTING') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.gp_id', this.editGroupId, '=');
			this.allocateSpaceForm.refresh(restriction);
			var record = this.spaceOperationDataSource.getRecords(restriction)[0];
			var pctFloor = record.getValue('gp.pct_floor');
			var headCounter = record.getValue('gp.count_em');
			this.setFormattedValue($('pctFloor'), pctFloor);
			jQuery('#pctFloor').removeAttr('disabled');
			jQuery('#countEm').val(headCounter);
			jQuery('#countEm').removeAttr('disabled');
		}
		this.rearrangeFieldsOnScenario();
	},
	
	/**
	 * Initialize the edit space form.
	 */
	setEditSpaceForm: function() {
		this.allocateSpaceForm.show(true);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', this.editGroupId, '=');
		var record = this.spaceOperationDataSource.getRecords(restriction)[0];
		this.allocateSpaceForm.refresh(restriction);
		if (this.subType == 'EDIT-GROUP-FROM-ASOFDATE') {
			this.allocateSpaceForm.setFieldValue('gp.date_start', this.asOfDate);
			this.allocateSpaceForm.setFieldValue('gp.gp_id', '');
		} else if(this.subType == 'EDIT-GROUP-FROM-STARTDATE'){
			this.setFormattedValue($('pctFloor'), record.getValue('gp.pct_floor'));			
			jQuery('#countEm').attr('value', record.getValue('gp.count_em'));
		}
		this.rearrangeFieldsOnScenario();
		if (record.getValue('gp.parent_group_id')) {
			this.allocateSpaceForm.enableField('gp.date_start', false);
		}

		this.setFormattedValue($('gp_area_manual'), Number(record.getValue("gp.area_manual")).toFixed(2));

		// kb#3050748: decode the gp.hpattern_acad value to reg color and show it.
		this.initialHpatternField(record);
	},

	/**
	 * Initialize the bl_id and fl_id to add new form.
	 */
	setBlAndFl: function(form) {
		//kb#3050750:  Copy the selected Building and Floor into the Add New form
		if (this.showBuildingId){
			form.setFieldValue('gp.bl_id', this.showBuildingId);
		}
		if (this.showFloorId){
			form.setFieldValue('gp.fl_id', this.showFloorId);
		}
	},
	
	/**
	 * Initialize the split form.
	 */
	setSplitSpaceForm: function() {
		this.splitSpaceForm.show(true);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', this.editGroupId, '=');
		var record = this.spaceOperationDataSource.getRecords(restriction)[0];
		var groupName = record.getValue('gp.name');
		if (groupName == null) {
			groupName = '';
		}
		var areaManual = record.getValue('gp.area_manual');
		this.originalSplitArea = areaManual;
		var description = record.getValue('gp.description');
		jQuery('#groupNameLabelDiv').html(groupName);
		jQuery('#areaBeforeSplitDiv').html(getMessage("areaBeforeSpllit")+' ' + areaManual);
		if (this.subType == 'SPLIT-GROUP-FROM-ASOFDATE') {
			this.splitSpaceMoreOptionForm.setFieldValue('gp.date_start', this.asOfDate);
		} else if(this.subType == 'SPLIT-GROUP-FROM-STARTDATE') {
			var startDate = getIsoFormatDate(record.getValue('gp.date_start'));
			this.splitSpaceMoreOptionForm.setFieldValue('gp.date_start', startDate);
		}
		
		this.splitSpaceMoreOptionForm.setFieldValue('gp.name', groupName);
		this.splitSpaceMoreOptionForm.setFieldValue('second_name', groupName);
		this.splitSpaceMoreOptionForm.setFieldValue('gp.description', description);
		this.splitSpaceMoreOptionForm.setFieldValue('second_description', description);
		this.splitSpaceMoreOptionForm.setFieldValue('gp.event_name', groupName + "-Split");
		
	   //3049446:The Event Name field will automatically populate as (Group Name) when Split if there is no recently chosen Event Name.
		if (this.lastStoredEventNameForAllocating){
			this.splitSpaceForm.setFieldValue('gp.event_name', this.lastStoredEventNameForAllocating);
		} else {
			this.splitSpaceForm.setFieldValue('gp.event_name', groupName + "-Split");
		}

		if (record.getValue('gp.parent_group_id')) {
			this.splitSpaceMoreOptionForm.enableField('gp.date_start', false);
		}
	},
	
	/**
	 * Save the group record of the form.
	 */
	saveAllocateSpaceForm: function() {
		if(this.allocateSpaceForm.canSave()) {
			var record = null;
			var originalStartDate = '';
			var needUpdateOriginalDateEnd = false;
			if (this.subType == 'ADD-NEW') {
				record = new Ab.data.Record();
			} else if( this.subType == 'EDIT-GROUP-FROM-ASOFDATE' || this.subType == 'EDIT-GROUP-FROM-STARTDATE' ) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('gp.gp_id', this.editGroupId, '=');
				record = this.spaceOperationDataSource.getRecords(restriction)[0];
				originalStartDate = record.getValue('gp.date_start');
			}

			record.setValue('gp.name', this.allocateSpaceForm.getFieldValue('gp.name'));
			record.setValue('gp.description', this.allocateSpaceForm.getFieldValue('gp.description'));
			record.setValue('gp.event_name', this.allocateSpaceForm.getFieldValue('gp.event_name'));
			record.setValue('gp.bl_id', this.allocateSpaceForm.getFieldValue('gp.bl_id'));
			record.setValue('gp.fl_id', this.allocateSpaceForm.getFieldValue('gp.fl_id'));
			var fields = ['gp.planning_bu_id', 'gp.dv_id', 'gp.dp_id', 'gp.gp_function'];
			for (var i = 0; i < fields.length; i++) {
				var value = this.allocateSpaceForm.getFieldValue(fields[i]);
				if(value) {
					record.setValue(fields[i], value);
				}
			}
			record.setValue('gp.date_start', this.allocateSpaceForm.getFieldValue('gp.date_start'));
			record.setValue('gp.date_end', this.allocateSpaceForm.getFieldValue('gp.date_end'));
			record.setValue('gp.portfolio_scenario_id',this.scn_id);
			var standard = jQuery('input[name="areaCalculationRadio"]').filter(':checked').val();
			if(standard == 'pctFloorArea') {
				record.setValue('gp.pct_floor', Number($('pctFloor').rawValue));
			} else if(standard == 'headCounterArea') {
				record.setValue('gp.count_em', Number(jQuery('#countEm').val()));
				record.setValue('gp.em_per_seat', Number($('add_em_per_seat').value));
				//record.setValue('gp.em_per_seat', this.allocateSpaceForm.getFieldValue('gp.em_per_seat'));
			}
			
			record.setValue('gp.area_manual', Number($('gp_area_manual').rawValue));
			//record.setValue('gp.area_manual', this.allocateSpaceForm.getFieldValue('gp.area_manual'));
			if (this.subType == 'ADD-NEW') {
				record.isNew = true;
				record.setValue('gp.allocation_type', 'Allocated Area');
				var blId = this.allocateSpaceForm.getFieldValue('gp.bl_id');
				var flId = this.allocateSpaceForm.getFieldValue('gp.fl_id');
				var newSortOrder = this.calculateNewSortOrderOfAllocatedArea(blId, flId);
				record.setValue('gp.sort_order', newSortOrder);
			} else if (this.subType == 'EDIT-GROUP-FROM-ASOFDATE' || this.subType == 'EDIT-GROUP-FROM-STARTDATE' ) {
				var currentStartDate = record.getValue('gp.date_start');
				var isoCurrentStartDate = getIsoFormatDate(Date.parseDate(currentStartDate, 'Y-m-d'));
				var isoOriginalStartDate = getIsoFormatDate(originalStartDate);
				if (isoCurrentStartDate > isoOriginalStartDate) {
					needUpdateOriginalDateEnd = true;
					record.removeValue('gp.gp_id');
					record.isNew = true;
					record.setValue('gp.parent_group_id', this.editGroupId);
				} else if(isoCurrentStartDate == isoOriginalStartDate){
					record.isNew = false;
				} else {
					View.alert(getMessage('lessStartDate'));
					return;
				}
			}

			try{
				//kb#3050748: process the hpattern_cad field
				var hpatternValue = this.saveHpatternField(record);

				//create the new allocation
				var newRecord = this.spaceOperationDataSource.saveRecord(record);
				//kb#3050748: process the hpattern_cad field of groups of same organiation
				this.updateHpatternFields(hpatternValue, record.getValue('gp.gp_id'));

				//update the end date of the original allocation if needs
				if (needUpdateOriginalDateEnd) {
					var oldAllocationRestriction = new Ab.view.Restriction();
					oldAllocationRestriction.addClause('gp.gp_id', this.editGroupId, '=');
					var oldAllocation = this.spaceOperationDataSource.getRecords(oldAllocationRestriction)[0];
					var newEndDate = this.addDay(this.allocateSpaceForm.getFieldValue('gp.date_start'), -1);
					oldAllocation.setValue('gp.date_end', newEndDate);
					oldAllocation.isNew = false;
					this.spaceOperationDataSource.saveRecord(oldAllocation);
				}
				if (this.callback) {
					this.callback(this.allocateSpaceForm.getFieldValue('gp.date_start'), this.allocateSpaceForm.getFieldValue('gp.event_name'));
				}
			}catch(e){
				Workflow.handleError(e);
				return;
			}
			View.closeThisDialog();
		} 
	},
	
	calculateNewSortOrderOfAllocatedArea: function(blId, flId) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.bl_id', blId,'=');
		restriction.addClause('gp.fl_id', flId,'=');
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id, '=');
		restriction.addClause('gp.allocation_type', 'Allocated Area', '=');
		
		var records = this.spaceOperationDataSource.getRecords(restriction);
		var newSortOrder = 1;
		if (records.length > 0) {
			for (var i = 0 ; i < records.length; i++) {
				var record = records[i];
				var sortOrder = Number(record.getValue('gp.sort_order'));
				if(sortOrder > newSortOrder) {
					newSortOrder = sortOrder;
				}
			}
			newSortOrder = newSortOrder + 1;
		}
		return newSortOrder;
	},
	
	/**
	 * Calculcate the group area according to the user choice.
	 */
	calculateGroupArea: function() {
		var standard = jQuery('input[name="areaCalculationRadio"]').filter(':checked').val();
		if(standard == 'pctFloorArea') {
			var sumArea = this.getFloorUsableArea(this.allocateSpaceForm);
			var pctFloor = $('pctFloor').rawValue;
			this.setFormattedValue($('gp_area_manual'), (sumArea * Number(pctFloor)/100 ).toFixed(2) );

		} else if (standard == 'headCounterArea') {
			var employeeHeadCount = Number(jQuery('#countEm').val());
			var employeePerSeat = Number($('add_em_per_seat').value);
			//var employeePerSeat = this.allocateSpaceForm.getFieldValue('gp.em_per_seat');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('fl.bl_id', this.allocateSpaceForm.getFieldValue('gp.bl_id'), '=');
			restriction.addClause('fl.fl_id', this.allocateSpaceForm.getFieldValue('gp.fl_id'), '=');
			var record = this.floorAreaQueryDs.getRecords(restriction)[0];
			var flStdArea = Number(record.getValue('fl.std_area_per_em'));
			// kb#3050452: alert message to user if fl.std_area_per_em is 0
			if (flStdArea<=0){
				View.alert(getMessage('zeroStdAreaPerEm'));
				return; 
			}
			if (employeePerSeat != 0) {
				var sumArea = employeeHeadCount/employeePerSeat * flStdArea;
				this.setFormattedValue($('gp_area_manual'), sumArea.toFixed(2) );
			} else {
				View.alert(getMessage('zeroPerSeat'));
			}
		}
	},

	/**
	 * Calculcate the group area according to the user choice.
	 */
	getFloorUsableArea: function(form) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id, '=');
		restriction.addClause('gp.bl_id', form.getFieldValue('gp.bl_id'), '=');
		restriction.addClause('gp.fl_id', form.getFieldValue('gp.fl_id'), '=');
		var usable = [];
		usable.push('Usable Area - Owned');
		usable.push('Usable Area - Leased');
		restriction.addClause('gp.allocation_type', usable, 'IN');
		var records = this.spaceOperationDataSource.getRecords(restriction);
		var sumArea = 0;
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			sumArea+=Number(record.getValue('gp.area_manual'));
		}
		return sumArea;
	},
	
	/**
	 * To show or hide some fields according to scenario scn_level
	 */
	rearrangeFieldsOnScenario: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('portfolio_scenario.portfolio_scenario_id', this.scn_id, '=');
		var record = this.scenarioQueryDs.getRecords(restriction)[0];
		var scnLevel = record.getValue('portfolio_scenario.scn_level');
		if (scnLevel == 'dv') {
			this.allocateSpaceForm.showField('gp.gp_function', false);
			this.allocateSpaceForm.showField('gp.dp_id', false);
			//kb#3050941: make field not required anymore.
			//this.allocateSpaceForm.fields.get('gp.dv_id').fieldDef.required = true;
			//jQuery('#allocateSpaceForm_gp\\.dv_id_labelCell').append('<span id="gp.dv_id.required_star" class="required" name="gp.dv_id.required_star">*</span>');
		} else if(scnLevel == 'dp' || scnLevel == 'fg') {
			if (scnLevel != 'fg'){
				this.allocateSpaceForm.showField('gp.gp_function', false);
			}
			if (!this.allocateSpaceForm.getFieldValue('gp.gp_function')){
				//this.allocateSpaceForm.fields.get('gp.dv_id').fieldDef.required = true;
				//jQuery('#allocateSpaceForm_gp\\.dv_id_labelCell').append('<span id="gp.dv_id.required_star" class="required" name="gp.dv_id.required_star">*</span>');
			}
		} else {
			//kb#3050941: make field not required anymore.
			//this.allocateSpaceForm.fields.get('gp.planning_bu_id').fieldDef.required = true;
			//jQuery('#allocateSpaceForm_gp\\.planning_bu_id_labelCell').append('<span id="gp.planning_bu_id.required_star" class="required" name="gp.planning_bu_id.required_star">*</span>');
			this.allocateSpaceForm.showField('gp.gp_function', false);
			this.allocateSpaceForm.showField('gp.dp_id', false);
			this.allocateSpaceForm.showField('gp.dv_id', false);
		}
	},
	
	afterDeleteAllocation: function() {
		if(this.callback) {
			this.callback();
		}
	},
	
	selectDepartment: function() {
		var controller = this;
		var selectDepartmentActionListener =  function(fieldName, newValue, oldValue) {
			controller.allocateSpaceForm.setFieldValue(fieldName, newValue);
			if(fieldName == 'gp.dv_id') {
				controller.fillPlanningBusinessCode(newValue);
			} 
            return false;
        };
        
        var dvId = this.allocateSpaceForm.getFieldValue('gp.dv_id');
        var restriction = new Ab.view.Restriction();
        if (dvId) {
        	restriction.addClause('dp.dv_id', dvId, '=');
        }
        
		View.selectValue({
			title: getMessage('selectDepartment'),
	    	fieldNames: ['gp.dv_id', 'gp.dp_id'],
	    	selectTableName: 'dp',
	    	selectFieldNames: ['dp.dv_id', 'dp.dp_id'],
	    	visibleFieldNames: ['dp.name', 'dp.dp_id', 'dp.dv_id'],
	    	actionListener: selectDepartmentActionListener,
	    	restriction: restriction,
	    	width: 500,
	    	height: 350
		});
	},
	
	fillPlanningBusinessCode: function(dvId) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('dv.dv_id', dvId, '=');
		var record = this.divisionDataSource.getRecords(restriction)[0];
		var buId = record.getValue('dv.bu_id');
		this.allocateSpaceForm.setFieldValue('gp.planning_bu_id', buId);
	},
	
	addDay: function(original, day) {
		var startDate = Date.parseDate(original, 'Y-m-d');
		var newDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
		var month = newDate.getMonth() + 1;
	    if (month < 10) 
	        month = "0" + month;
	    var day = newDate.getDate();
	    if (day < 10) 
	        day = "0" + day;
	    return newDate.getFullYear() + '-' + month + '-' + day;
	},

	selectGpBuilding: function(){
		var restriction = " exists ( select 1 from gp where gp.portfolio_scenario_id='"+ this. scn_id+"' and gp.bl_id=bl.bl_id) ";
		View.selectValue("markSpaceAsUnavailableForm",getMessage('selectBuilding'),["gp.bl_id"],"bl",["bl.bl_id"],["bl.site_id","bl.bl_id","bl.name"],restriction, "" , false , true ,null , 600, 400);
	},
	
	selectGpFloors: function(){
		var buildingId = this.markSpaceAsUnavailableForm.getFieldValue('gp.bl_id');
		var restriction = " exists ( select 1 from gp where gp.portfolio_scenario_id='"+ this. scn_id+"' and gp.bl_id=fl.bl_id and gp.fl_id=fl.fl_id) ";
		if (buildingId) {
			restriction += " and fl.bl_id='" + buildingId+ "'";
		}
		View.selectValue("markSpaceAsUnavailableForm",getMessage('selectFloor'),["gp.bl_id", "gp.fl_id"],"fl",["fl.bl_id", "fl.fl_id"],["fl.bl_id","fl.fl_id","fl.name"],restriction, "" , false , true ,null , 600, 400);
	},

	enableAreaCalculationOptions: function(enable){
		if (enable)	{
			jQuery("#pctFloorUnavailAreaRadio").removeAttr("disabled");
			jQuery("#headCounterUnavailAreaRadio").removeAttr("disabled");
			if ($('pctFloorUnavailAreaRadio').checked){
				jQuery("#unavailPctFloor").removeAttr("disabled");
			} 
			if ($('headCounterUnavailAreaRadio').checked){
				jQuery("#unavailableCountEm").removeAttr("disabled");
				jQuery("#unavail_em_per_seat").removeAttr("disabled");
			}
			jQuery("#calculateUnavailableGroupArea").removeClass("x-hide-display");
		} else {
			jQuery("#pctFloorUnavailAreaRadio").attr("disabled","disabled");
			jQuery("#headCounterUnavailAreaRadio").attr("disabled","disabled");
			jQuery("#unavailPctFloor").attr("disabled","disabled");
			jQuery("#unavailableCountEm").attr("disabled","disabled");
			jQuery("#unavail_em_per_seat").attr("disabled","disabled");
			jQuery("#calculateUnavailableGroupArea").addClass("x-hide-display");
		}
	},

	initialHpatternField: function(record){
		var hpatternValue = record.getValue('gp.hpattern_acad');
		if (hpatternValue) {
			var pattern = decodePattern(hpatternValue);
			$('legendShadingColor').value = pattern.rgbColor;
			$("colorDiv").style.backgroundColor = '#'+pattern.rgbColor;
		}		
	},

	saveHpatternField: function(record){
		var hpatternValue=null;
		var colorValue = $('legendShadingColor').value;
		if (colorValue ) {
			var hpatternValue = encodePattern(colorValue);
			record.setValue('gp.hpattern_acad', hpatternValue);
		}
		return hpatternValue;
	},

	updateHpatternFields: function(hpatternValue, groupId){
		var isApplyAll = $('applyAll').checked;
		if ( hpatternValue && isApplyAll && groupId) {
			Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-updateHpatternOfSameOrganization', hpatternValue, parseInt(groupId));
		}		
	},
		
	onChangeValue : function(fieldElement){
		fieldElement.rawValue = fieldElement.value;
		fieldElement.value = this.spaceOperationDataSource.formatValue('gp.area_manual', fieldElement.rawValue )  ;
	},

	setFormattedValue: function(fieldElement, value){
		fieldElement.rawValue = value; 
		fieldElement.value = this.spaceOperationDataSource.formatValue('gp.area_manual', value); 
	},

	allocateSpaceForm_afterRefresh:function(){
		this.allocateSpaceForm.enableField('gp.bl_id', false);
		this.allocateSpaceForm.enableFieldActions('gp.bl_id', true);		
		this.allocateSpaceForm.enableField('gp.fl_id', false);
		this.allocateSpaceForm.enableFieldActions('gp.fl_id', true);		
	}
});

/**
 * kb#3049485: if the scenario level is Functional Group, and the user enters a value into the Group Function field of the Add/Edit Allocated Space form, then the Division Code field should not be required.
 */
function changeGpFunction(element){
	var form = View.panels.get("allocateSpaceForm"); 
	if (element.value){
		form.fields.get('gp.dv_id').fieldDef.required = false;
		if ($("gp.dv_id.required_star")){
			$("gp.dv_id.required_star").remove();
		}
	} 
	else {
		//form.fields.get('gp.dv_id').fieldDef.required = true;
		//jQuery('#allocateSpaceForm_gp\\.dv_id_labelCell').append('<span id="gp.dv_id.required_star" class="required" name="gp.dv_id.required_star">*</span>');
	}
}

/**
 * set true color.
 */
var intervalId;
function setTrueColor(){
    oColorPicker = $("colorDiv");
	intervalId = window.setInterval("checkColorChange()", 100);
    showColorPicker();
}

/**
 * set true color.
 */
function checkColorChange(){
    if ( oColorPicker.colorValue && oColorPicker.colorValue!=$("legendShadingColor").value)  {
		if ( oColorPicker.colorValue.substring(0, 1) === '#' ){
			$("legendShadingColor").value=oColorPicker.colorValue.substring(1,oColorPicker.colorValue.length);
		} 
		else {
			$("legendShadingColor").value=oColorPicker.colorValue;
		}
		window.clearInterval(intervalId);
    }
}