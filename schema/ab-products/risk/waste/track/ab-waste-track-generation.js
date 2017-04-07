/**
 * @author Guo Jiangtao
 */
var controller=View.createController('abWasteTrackGenController', {
	statusFlag:true,

	// ----------------------- event handlers -------------------------

	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
		// initialize the unit type and unit select option in the Edit Waste
		// form
		var recs = this.abWasteTrackGenUnitsTypeListDS.getRecords();
		var typeSelect = $('unitsType');
		this.typeSelect = typeSelect;
		this.populateTypeSelectLists(recs, typeSelect);
		// IOAN changes for eam - apply view restriction
		if(valueExists(this.view.restriction)){
			for(var i=0; i < this.view.restriction.clauses.length; i++){
				var clause = this.view.restriction.clauses[0];
				if(clause.name == 'waste_out.bl_id'){
					this.abWasteTrackGenConsole.setFieldValue('waste_out.bl_id', clause.value);
				} else if(clause.name == 'waste_out.pr_id'){
					this.abWasteTrackGenConsole.setFieldValue('waste_out.pr_id', clause.value);
				} else if (clause.name == 'waste_out.eq_id') {
					this.abWasteTrackGenConsole.setFieldValue('waste_out.eq_id', clause.value);
				}
			}
			
			var filterRestriction  = new Ab.view.Restriction(this.abWasteTrackGenConsole.getFieldValues());
			this.abWasteTrackGenWasteGrid.refresh(filterRestriction);
			
		}
	},
	/**
	 * This event handler is called by the Add New button in Generated Waste
	 * Details grid.
	 */
	abWasteTrackGenWasteGrid_onAddNew : function() {
		// refresh the Edit Waste form with new record
		// set the default unit in the form
		this.abWasteTrackGenWasteEdit.show(false);
		clearInvalidHtmlField('unitsType');
		var form = this.abWasteTrackGenWasteForm;
		form.actions.get('save').enable(true);
		form.refresh(null, true);
		form.setFieldValue('waste_out.status', '');
		$('abWasteTrackGenWasteForm_waste_out.quantity').value = '';
		// Load date for 'units type'
		fillList('abWasteTrackGenUnitsTypeListDS', 'unitsType', 'bill_type.bill_type_id', '');
		// Restriction units date list according to unitsType
		fillUnit();
		if (this.statusFlag) {
			this.resetStatusOption();
		}
	},

	/**
	 * This event handler is called by the Save buttons of the Edit Waste form
	 */
	abWasteTrackGenWasteForm_onSave : function() {
		// validate the input
		// if the inputs are valid, then call WFR saveWaste to save the record
		// else display the validation information and return the funtion

		var form = this.abWasteTrackGenWasteForm;
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		if(!checkAreaAndSite(form,this.abWasteTrackWasteAreaDS)){
			View.showMessage(getMessage('areaSite'));
			return;
		}
		
		var status = form.getFieldValue('waste_out.status');
		if (!status) {
			form.addInvalidField("waste_out.status", '');
			form.displayValidationResult();
	        return;
		}

		var unitType = $('unitsType').value;
		var unit = $('units').value;
		if(unitType==''){
			form.addInvalidField("unitsType", '');
			displayInvalidHtmlField('unitsType','',form);
			return;
		}
		if(unit==''){
			form.addInvalidField("units", '');
			displayInvalidHtmlField('units','',form);
			return;
		}
		var isValidate = validateFields(form, getMessage('validateMessage'));
		if (!isValidate) {
			return;
		}

		// validate if field value is minus
		var isMinusZero = minusCanNotSaved(form, ['waste_out.quantity', 'quantityMsg'], 'and', 'minusNotAllowed');
		if (isMinusZero) {
			return;
		}

		var typeSelect = $('unitsType');
		// Pass value to hidden field 'waste_out.units_type'
		form.setFieldValue("waste_out.units_type", typeSelect.value);
		var unitSelect = $('units');
		// Pass value to hidden field 'waste_out.units'
		form.setFieldValue("waste_out.units", unitSelect.value);
		if (form.canSave()) {
			var storageLocation = form.getFieldValue('waste_out.storage_location');
			if (status == 'A') {
				var restriciton = new Ab.view.Restriction();
				restriciton.addClause("waste_areas.storage_location", storageLocation, "=");
				restriciton.addClause("waste_areas.area_type", 'A', "=");
				var records = this.abWasteTrackWasteAreaDS.getRecords(restriciton);

				if (records.length == 0) {
					View.showMessage(getMessage('areaTypeA'));
					return;
				}
			}

			if (status == 'S') {
				var restriciton = new Ab.view.Restriction();
				restriciton.addClause("waste_areas.storage_location", storageLocation, "=");
				restriciton.addClause("waste_areas.area_type", ['S', 'T'], "IN");
				var records = this.abWasteTrackWasteAreaDS.getRecords(restriciton);

				if (records.length == 0) {
					View.showMessage(getMessage('areaTypeST'));
					return;
				}
			}

			if (status == 'D') {
				var wasteDisposition = form.getFieldValue('waste_out.waste_disposition');
				var restriciton = new Ab.view.Restriction();
				restriciton.addClause("waste_dispositions.waste_disposition", wasteDisposition, "=");
				var records = this.abWasteTrackGenWasteDispositionsDS.getRecords(restriciton);
				if (records.length > 0) {
					var dispostionType = records[0].getValue('waste_dispositions.disposition_type');
					if (dispostionType == 'S') {
						var dateShipped = form.getFieldValue('waste_out.date_shipped');
						if (!dateShipped) {
							form.addInvalidField("waste_out.date_shipped", getMessage("dateShippedNotNull"));
							form.displayValidationResult();
					        return;
						}
					}

					if (dispostionType == 'D') {
						var dateStart = form.getFieldValue('waste_out.date_start');
						var dateEnd = form.getFieldValue('waste_out.date_end');
						var flag=false;
						//requestPanel.clearValidationResult(); 
						if(!dateStart || !dateEnd){
						if (!dateStart) {
							form.addInvalidField("waste_out.date_start", getMessage("startDateNotNull"));
							flag=true;
						}
						if (!dateEnd) {
							form.addInvalidField("waste_out.date_end", getMessage("EndDateNotNull"));
							flag=true;
						}
						if(flag){ 
							form.displayValidationResult();
							return;
						}
						}
						
					}
				}
			}

			var jsonRecord = form.getFieldValues(true);
			try {
				var result = Workflow.callMethod('AbRiskWasteMgmt-WasteService-saveWaste', jsonRecord,true);
				View.panels.get('abWasteTrackGenWasteForm').show(false);
				var editForm=View.panels.get('abWasteTrackGenWasteEdit');
				var restriction = new Ab.view.Restriction();
				restriction.addClause('waste_out.waste_id', result.data.waste_id);
				editForm.refresh(restriction,false);
				editForm.show(true);
				 // show message as inline text, dismiss after 3 seconds
				editForm.displayTemporaryMessage(getMessage('saveSuccess'));
			} catch (e) {
				Workflow.handleError(e);
			}
			this.abWasteTrackGenWasteGrid.refresh();
		}
	},

	// ----------------------- helper methods -------------------------
	/**
	 * Populate units type SelectLists
	 * 
	 * @param recs
	 *            units type records
	 * @param typeSelect
	 *            dom element of units type option
	 */
	populateTypeSelectLists : function(recs, typeSelect) {
		typeSelect.innerHTML = '';
		var option1 = document.createElement('option');
		option1.value = '';
		option1.appendChild(document.createTextNode(''));
		typeSelect.appendChild(option1);
		for ( var i = 0; i < recs.length; i++) {
			var type = recs[i].values['bill_type.bill_type_id'];
			var option = document.createElement('option');
			option.value = type;
			option.appendChild(document.createTextNode(type));
			typeSelect.appendChild(option);
		}
	},

	/**
	 * reset status field select option in edit form
	 */
	resetStatusOption : function() {
		// get the select option dom element
		var filedEl = this.abWasteTrackGenWasteForm.getFieldElement('waste_out.status');
		// stored current options to varible tempOptions,and exclude 'Generated'
		var tempOptions = [];
		for ( var i = 0; i < filedEl.options.length; i++) {
			if (filedEl.options[i].value != 'G') {
				tempOptions.push(filedEl.options[i])
			}
		}

		// delete all current options
		while (filedEl.options.length != 0) {
			filedEl.remove(0);
		}

		// add blank option as the first option
		filedEl.options.add(new Option("", ""));

		// add other options
		for ( var i = 0; i < tempOptions.length; i++) {
			filedEl.options.add(tempOptions[i]);
		}
		filedEl.options[0].selected=true;
		// register the onchange event listener
		$('abWasteTrackGenWasteForm_waste_out.status').onchange = this.onChangeStatus;
		this.statusFlag=false;
	},

	/**
	 * onchange event handler for status field
	 */
	onChangeStatus : function() {
		var form = View.panels.get('abWasteTrackGenWasteForm');
		var status = form.getFieldValue('waste_out.status');
		form.fields.get('waste_out.date_start').fieldDef.required = false;
		form.fields.get('waste_out.storage_location').fieldDef.required = false;
		form.fields.get('waste_out.waste_disposition').fieldDef.required = false;
		if (status == 'A' || status == 'S') {
			form.fields.get('waste_out.date_start').fieldDef.required = true;
			form.fields.get('waste_out.storage_location').fieldDef.required = true;
		}

		if (status == 'D') {
			form.fields.get('waste_out.waste_disposition').fieldDef.required = true;
		}
	}

});

/**
 * auto add related fields associated to the selected Profile field
 * 
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectProfile(fieldName, selectedValue, previousValue) {
	var controller = View.controllers.get('abWasteTrackGenController');
	var unitsType = $('unitsType').value;
	if (unitsType != '') {
		return;
	}
	if (fieldName == "waste_out.waste_profile") {
		var restriction = new Ab.view.Restriction();
		var dataSource = View.dataSources.get('abWasteTrackGenWasteProfilesDS');
		restriction.addClause("waste_profiles.waste_profile", selectedValue, "=", true);
		var recordProfiles = dataSource.getRecord(restriction);
		fillList('abWasteTrackGenUnitsTypeListDS', 'unitsType', 'bill_type.bill_type_id', recordProfiles.getValue('waste_profiles.units_type'));

		var typeId = recordProfiles.getValue('waste_profiles.units_type')
		var res = "bill_unit.bill_type_id='" + typeId + "' and bill_unit.is_dflt='1'";
		var dataRes = "bill_unit.bill_type_id='" + typeId + "'";
		var recordBillUnits = controller.abWasteTrackGenBillUnitsDS.getRecord(res);
		var unit = recordBillUnits.getValue('bill_unit.bill_unit_id');
		if (recordBillUnits == '') {
			fillList('abWasteTrackGenBillUnitsDS', 'units', 'bill_unit.bill_unit_id', '', dataRes);
		} else {
			fillList('abWasteTrackGenBillUnitsDS', 'units', 'bill_unit.bill_unit_id', unit, dataRes);
		}
	}
}
/**
 * Set value to units after selected units type
 * 
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function fillUnit() {
	var controller = View.controllers.get('abWasteTrackGenController');
	var typeSelect = $('unitsType');
	var type = typeSelect.value;
	var res = "bill_unit.bill_type_id='" + type + "' and bill_unit.is_dflt='1'";
	var record = controller.abWasteTrackGenBillUnitsDS.getRecord(res);
	var unit = record.getValue('bill_unit.bill_unit_id');
	var dataRes = "bill_unit.bill_type_id='" + type + "'";
	if (record == '') {
		fillList('abWasteTrackGenBillUnitsDS', 'units', 'bill_unit.bill_unit_id', '', dataRes);
	} else {
		fillList('abWasteTrackGenBillUnitsDS', 'units', 'bill_unit.bill_unit_id', unit, dataRes);
	}
}
/**
 * Configure the selectValue dialog in JavaScript
 */
function selectValueTransporterIsActive(panelId) {
	View.selectValue({
		formId: panelId,
		title: 'Select Transporter',
		fieldNames: ['waste_out.transporter_id','vn.company'],
		selectTableName: 'vn',
		selectFieldNames: ['vn.vn_id','vn.company'],
		visibleFields: [
		                {fieldName: 'vn.vn_id', title: getMessage('transporterCode')},
		                {fieldName: 'vn.phone', title: getMessage('phoneNumber')},
		                {fieldName: 'vn.company', title: getMessage('companyName') }
		                ],
		                restriction: "vn.vendor_type='WstTr' and vn.is_active=1",
		                showIndex: false,
		                selectValueType: 'grid'
	});
}
/**
 * This event handler is called by onclick selectValue of area.
 */
function selectArea() {

	// ordered by min_score ascending
	var sortValues = [];
	sortValues.push( {
		fieldName : 'waste_areas.site_id',
		sortOrder : 1
	});
	sortValues.push( {
		fieldName : 'waste_areas.area_type',
		sortOrder : 2
	});
	sortValues.push( {
		fieldName : 'waste_areas.storage_location',
		sortOrder : 3
	});
	View.selectValue({
		formId: 'abWasteTrackGenWasteForm',
		title: getMessage("areaTitle"),
		fieldNames: [ 'waste_out.storage_location','waste_out.site_id' ],
		selectTableName: 'waste_areas',
		selectFieldNames: ['waste_areas.storage_location', 'waste_areas.site_id' ],
		visibleFields: [
		                {fieldName: 'waste_areas.storage_location', title: getMessage('areaTitle')},
		                {fieldName: 'waste_areas.area_type'},
		                {fieldName: 'waste_areas.site_id' }
		                ],
		                showIndex: false,
		                selectValueType: 'grid',
		                sortValues: toJSON(sortValues)
	});
}
/**
 * Execute when we click waste link on grid abWasteTrackAccum_WasteAccumGrid
 */
function editWaste(){
	View.panels.get('abWasteTrackGenWasteForm').show(false);
	var form=View.panels.get('abWasteTrackGenWasteEdit');
	var filedEl = form.getFieldElement('waste_out.status');
	filedEl.options.add(new Option("Generated", "G"));
	var grid = View.panels.get('abWasteTrackGenWasteGrid');
	var index = grid.selectedRowIndex;
	var row = grid.rows[grid.selectedRowIndex];
	var wasteId = row['waste_out.waste_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.waste_id', wasteId);
	form.refresh(restriction,false);
	form.show(true);
}
//after form refresh load unit type and unit
function loadUnitAndUnitType(fieldName, selectedValue, previousValue){
	
	var c=controller;
	if(fieldName=="waste_out.units_type"){
		var form=c.abWasteTrackGenWasteForm;
			setUnitAndUnitype(form,'unitsType1',selectedValue,'units1',previousValue);
	}
}
/**
 * SetUnit and unit type after form refresh
 * @param form,object
 * @param unitsType1,string
 * @param selectedValue,unit type value
 * @param units1, visual field 
 */
function setUnitAndUnitype(form,unitsType1,selectedValue,units1,previousValue){
	var c=controller;
	var res="bill_unit.bill_type_id='"+selectedValue+"' ";
	var records=c.abWasteDefMainfestsUnit.getRecords(res);
	var dataRes="bill_unit.bill_type_id='"+selectedValue+"'";
	var record='';
	var unit='';
	if(records!=''){
		record =records[0];
		unit=record.getValue('bill_unit.bill_unit_id');
	}
	fillList('abWasteDefMainfestsType',unitsType1,'bill_type.bill_type_id',selectedValue);
	if(form.newRecord||(selectedValue!=previousValue&&previousValue!='')){
		if(record==''){
			fillList('abWasteDefMainfestsUnit',units1,'bill_unit.bill_unit_id','',dataRes);
		}else{
			fillList('abWasteDefMainfestsUnit',units1,'bill_unit.bill_unit_id',unit,dataRes);
		}
	}else{
		fillList('abWasteDefMainfestsUnit',units1,'bill_unit.bill_unit_id',form.getFieldValue('waste_out.units'),dataRes);
	}
}
function displayInvalidHtmlField(id, errorMessage, form){
    var fieldInputTd = $(id).parentNode;
    Ext.fly(fieldInputTd).addClass('formErrorInput');
    var errorBreakElement = document.createElement('br');
    errorBreakElement.className = 'formErrorText';
    fieldInputTd.appendChild(errorBreakElement);
    var errorTextElement = document.createElement('span');
    errorTextElement.className = 'formErrorText';
    errorTextElement.appendChild(document.createTextNode(errorMessage));
    fieldInputTd.appendChild(errorTextElement);
    View.showMessage('error', form.validationResult.message);
}
function clearInvalidHtmlField(id){
    var fieldInputTd = $(id).parentNode;
    Ext.fly(fieldInputTd).removeClass('formErrorInput');
    // remove per-field error messages
    var errorTextElements = Ext.query('.formErrorText', fieldInputTd);
    for (var e = 0; e < errorTextElements.length; e++) {
        fieldInputTd.removeChild(errorTextElements[e]);
    }
}
function checkQuanity(form){
	var quanity=form.getFieldValue('waste_out.quantity');
	return 0.00<quanity;
}
