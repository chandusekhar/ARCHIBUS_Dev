/**
 * @author Lei
 */

var abWasteTrackShipmentsController = View.createController('abWasteTrackShipmentsController', {
	quantity:0,
	oldStatus:'',
	fieldArray:new Array(
			['waste_out.quantity','quantityMsg'],
			['waste_out.number_containers','numContainerMsg']
			),
	
	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
			},			
	/**
	 * Excute after form refresh,call the unit and unit type list
	 */
	abWasteTrackShipmentsForm_afterRefresh: function(){
		var units_type=this.abWasteTrackShipmentsForm.getFieldValue("waste_out.units_type");
		//Exclude execute when we click add new.
		loadUnitAndUnitType("waste_out.units_type", units_type, '')
	},
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(
			['waste_out.status',,'waste_out.status'], 
			['waste_out.pr_id',,'waste_out.pr_id'], 
			['waste_out.shipment_id',,'waste_out.shipment_id'], 
			['waste_out.bl_id',,'waste_out.bl_id'], 
			['waste_out.manifest_number',,'waste_out.manifest_number'], 
			['waste_out.fl_id',,'waste_out.fl_id'], 
			['waste_profiles.waste_type',,'waste_profiles.waste_type'], 
			['waste_out.waste_disposition',,'waste_out.waste_disposition'], 
			['waste_out.storage_location',,'waste_out.storage_location'], 
			['waste_out.dv_id',,'waste_out.dv_id'], 

			['waste_out.waste_profile',,'waste_out.waste_profile'], 
			['waste_out.facility_id',,'waste_out.facility_id'], 
			['waste_out.site_id',,'waste_out.site_id'], 
			['waste_out.dp_id',,'waste_out.dp_id'], 
			['waste_profiles.waste_category',,'waste_profiles.waste_category'], 
			['waste_out.transporter_id',,'waste_out.transporter_id'], 
			['waste_out.em_id',,'waste_out.em_id'], 
			['waste_out.contact_id',,'waste_out.contact_id']
	),
	
	/**
	 * Save ship waste that waste_dispositions.disposition_type='S'
	 */
	abWasteTrackShipmentsForm_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType','units','fieldNoNull');
		if(isEmpty){
			return;
		}
		var form=this.abWasteTrackShipmentsForm;
		form.setFieldValue("waste_out.status", 'D');
		var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		//validate if field value is minus
		var isMinusZero=minusCanNotSaved(this.abWasteTrackShipmentsForm,this.fieldArray,'and','minusNotAllowed');
		if(isMinusZero){
			return;
		}
		var flag=true;
		if(this.oldStatus==form.getFieldValue("waste_out.status")){
			flag=false;
		}
		var quantity=parseFloat(form.getFieldValue("waste_out.quantity"));
		if(quantity>this.quantity && form.newRecord==false && flag){
			View.showMessage(getMessage("quantityError"));
			return;
		}
		//KB:3031537
		// Check if the record has same generator code in other wastes with the same  Manifest number.
		var manifest_number=form.getFieldValue('waste_out.manifest_number');
		var generator_id=form.getFieldValue('waste_out.generator_id');
		var ds =this.abWasteTrackWasteDS;
		var manifestLaglity=this.checkIfManifestLagality(form,manifest_number,generator_id,ds);
		if(!manifestLaglity){
				return;
			}
		
		
		var typeSelect = $('unitsType');
		form.setFieldValue("waste_out.units_type", typeSelect.value);
		var unitSelect = $('units');
		form.setFieldValue("waste_out.units", unitSelect.value);
		if (form.canSave()) {
			var waste_profile=form.getFieldValue('waste_out.waste_profile');
			var restriction = new Ab.view.Restriction();
	        restriction.addClause('waste_profiles.waste_profile', waste_profile);
	        var profileRecord=this.wasteProfileDS.getRecord(restriction);
	        var isHaz=profileRecord.getValue('waste_profiles.transp_hazardous');
	        if(1==isHaz&&""==manifest_number){
	        	View.confirm(getMessage("isHaz"), function(button) {
	                if (button == 'yes') {
	                	if(!checkDisposition(form,abWasteTrackShipmentsController.wasteDispositionDS)){
	        				View.showMessage(getMessage("disError"));
	        				return;
	        			}
	        			if(quantity!=abWasteTrackShipmentsController.quantity && form.newRecord==false&&!flag){
	        				View.confirm(getMessage("quantityEquals"), function(button){
	        		            if (button == 'yes') {
	        		            	abWasteTrackShipmentsController.saveRecord(form);
	        		            }else{
	        		            	return;
	        		            }
	        		        })
	        			}else{
	        				abWasteTrackShipmentsController.saveRecord(form);
	        			}
	                }else{
	                	return;
	                }
	              })
	        	}else{
	        		if(!checkDisposition(form,abWasteTrackShipmentsController.wasteDispositionDS)){
        				View.showMessage(getMessage("disError"));
        				return;
        			}
        			if(quantity!=abWasteTrackShipmentsController.quantity && form.newRecord==false&&!flag){
        				View.confirm(getMessage("quantityEquals"), function(button){
        		            if (button == 'yes') {
        		            	abWasteTrackShipmentsController.saveRecord(form);
        		            }else{
        		            	return;
        		            }
        		        })
        			}else{
        				abWasteTrackShipmentsController.saveRecord(form);
        			}
	        	}
			
		}
	},
	saveRecord: function(form){
		
		var jsonRecord=form.getFieldValues(true);
		  try {
	            var result = Workflow.callMethod(
	                'AbRiskWasteMgmt-WasteService-saveWaste',jsonRecord,false);
	            var restriction = new Ab.view.Restriction();
	        	restriction.addClause('waste_out.waste_id', result.data.waste_id);
	        	form.refresh(restriction,false);
				 // show message as inline text, dismiss after 3 seconds
	        	form.displayTemporaryMessage(getMessage('saveSuccess'));
	        } catch (e) {
	            Workflow.handleError(e);
	        }
	
	this.quantity=parseFloat(form.getFieldValue("waste_out.quantity"));
	this.abWasteTrackShipmentsGrid.doRefresh(null,false,null);
	},
	
	checkIfManifestLagality:function(form,manifest_number,generator_id,dsObj){
		if (!valueExistsNotEmpty(manifest_number)) {
			return true;
		}
		
		var restriction = new Ab.view.Restriction();
			restriction.addClause('waste_out.manifest_number', manifest_number, '=');
			restriction.addClause('waste_out.generator_id', '', 'IS NOT NULL');
			if(!form.newRecord){
				var waste_id=form.getFieldValue("waste_out.waste_id");
				restriction.addClause('waste_out.waste_id', waste_id, '!=');
			}
			
		var records=dsObj.getRecords(restriction);
		if(records.length==0){
			if (!valueExistsNotEmpty(generator_id)) {
				return true;
			}
			/**
			 * If no Generator Code existed for other waste records with this Manifest number, but the user entered one for the new shipment will call a WFR called updateGeneratorCode which searchs for existing Shipments (status being 'D' Disposed) for the same manifest number and with null Generator Code, and will update all of them with the selected Generator Code.
			 */
			var result='';
			try{  
				Workflow.callMethod("AbRiskWasteMgmt-WasteService-updateGeneratorCode", manifest_number,generator_id);
			}catch(e){
				Workflow.handleError(e);
			}  
			return true;
		}
		if(records.length>0){
			var generatorId=records[0].values['waste_out.generator_id'];
			
			if(generatorId!=generator_id&&valueExistsNotEmpty(generator_id)){
				View.alert(getMessage('checkMenifestMessage'));
				return false;
			}
			if(generatorId!=generator_id&&!valueExistsNotEmpty(generator_id)){
				form.setFieldValue('waste_out.generator_id',generatorId);
				return true;
			}
			
		}
		return true;
	},
	/**
	* This event handler is called by addNewWaste button in abWasteDefMainfestsForm.
	*/
	abWasteTrackShipmentsForm_onAddNewManifest : function(){
		var outForm=this.abWasteDefMainfestsForm;
		outForm.newRecord = true;
		outForm.refresh();
		outForm.showInWindow({
	        width: 1000,
	        height: 800
	    });
		
	},
	/**
	* Update or save Mainfests record
	*/
	abWasteDefMainfestsForm_onSave: function(){
		if (this.abWasteDefMainfestsForm.canSave()) {
			this.abWasteDefMainfestsForm.save();
			this.abWasteDefMainfestsForm.closeWindow();
		}
	},
	/**
	 * Show manifest details when we click manifest details button on abWasteTrackShipmentsGrid grid row
	 */
	abWasteTrackShipmentsGrid_manifestDetail_onClick: function(row){

		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var manifest_number = record.getValue("waste_out.manifest_number");
		var wasteId = record.getValue("waste_out.waste_id");
		if (valueExistsNotEmpty(manifest_number)) {
			restriction.addClause('waste_manifests.manifest_number', manifest_number, '=');
		}
		var panel=this.abWasteTrackShipmentsViewManifestForm;
		panel.addParameter('wasteId', wasteId);
		panel.refresh(restriction);
		panel.show(true);
		panel.showInWindow({
			width: 1300,
			height: 700,
			closeButton: false
		});
	},
	
	/**
	 * Show waste out details when we click waste details button on abWasteTrackShipmentsGrid grid row
	 */
	abWasteTrackShipmentsGrid_wasteDetail_onClick: function(row){
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var waste_id = record.getValue("waste_out.waste_id");

		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}
		var panel=this.abWasteTrackShipmentsViewWasteShipmentForm;
		panel.refresh(restriction);
		panel.show(true);
		panel.showInWindow({
			width: 1300,
			height: 700,
			closeButton: false
		});
	},
	abWasteTrackShipmentsGrid_onAddNew: function(){
		$('units').disabled=false;
		$('unitsType').disabled=false;
		var form=this.abWasteTrackShipmentsForm;
		form.newRecord=true;
		this.quantity=0;
		form.clear();
		form.show(true);
		//Load date for 'units type'
		fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id','');
		//Restriction units date list according to unitsType
		fillUnit();
		$('abWasteTrackShipmentsForm_waste_out.quantity').value = '';
		
	},
	/**
	* after abWasteDefMainfestsForm refresh 
	*/
	abWasteDefMainfestsForm_afterRefresh: function(){
		//set these fields to disabled
		this.abWasteDefMainfestsForm.getFieldElement('waste_facilities.facility_name').disabled= true;
		this.abWasteDefMainfestsForm.getFieldElement('waste_facilities.vn_id').disabled= true;
	}
})

/**
 * Edit Waste Shipment Details when we click second panel control link
 */
function editWasteShipment(){
	var grid = View.panels.get('abWasteTrackShipmentsGrid');
	var index = grid.selectedRowIndex;
	var row = grid.rows[grid.selectedRowIndex];
	var wasteId = row['waste_out.waste_id'];
	var quanity=row['waste_out.quantity.raw'];
	if(quanity==null){
		quanity=row['waste_out.quantity'];
	}
	abWasteTrackShipmentsController.quantity=parseFloat(quanity);
	abWasteTrackShipmentsController.oldStatus=row['waste_out.status.raw'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.waste_id', wasteId);
	View.panels.get('abWasteTrackShipmentsForm').refresh(restriction,false);
	$('units').disabled=true;
	$('unitsType').disabled=true;
	
	
}

////after form refresh load unit type and unit
function loadUnitAndUnitType(fieldName, selectedValue, previousValue){
	var unitsType=$('unitsType').value;
	
	if(fieldName=="waste_out.units_type"){
		
		var res="bill_unit.bill_type_id='"+selectedValue+"' ";
		fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id',selectedValue);
		var records=abWasteTrackShipmentsController.abWasteDefMainfestsUnit.getRecords(res);
		
		var dataRes="bill_unit.bill_type_id='"+selectedValue+"'";
		var record='';
		var unit='';
		if(records!=''){
			record =records[0];
			unit=record.getValue('bill_unit.bill_unit_id');
		}
		var form=abWasteTrackShipmentsController.abWasteTrackShipmentsForm;
		//Execute when record is new and the profile selected ==the profile old select in the process we edit record.
		if(form.newRecord||(selectedValue!=previousValue&&previousValue!='')){
			if(record==''){
				//execute when we add new record and have no units in unit type 
				fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
			}else{
				//execute when we add new record and have units in unit type || we we click set unit and unit type by selecting profile and profile =old profile.
				fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
			}
		}else{
			//execute when we edit record and profile and profile !=old profile.
			fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',form.getFieldValue('waste_out.units'),dataRes);
		}
	}
}

//after select waste profile set value to unit type and unit
function afterSelectProfile(fieldName, selectedValue, previousValue){
	var unitsType=$('unitsType').value;
		if(unitsType!=''){
			return;
		}
	if(fieldName=="waste_out.units_type"){
		
		var res="bill_unit.bill_type_id='"+selectedValue+"' ";
		fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id',selectedValue);
		var records=abWasteTrackShipmentsController.abWasteDefMainfestsUnit.getRecords(res);
		
		var dataRes="bill_unit.bill_type_id='"+selectedValue+"'";
		var record='';
		var unit='';
		if(records!=''){
			record =records[0];
			unit=record.getValue('bill_unit.bill_unit_id');
		}
		var form=abWasteTrackShipmentsController.abWasteTrackShipmentsForm;
		//Execute when record is new and the profile selected ==the profile old select in the process we edit record.
		if(form.newRecord||(selectedValue!=previousValue&&previousValue!='')){
			if(record==''){
				//execute when we add new record and have no units in unit type 
				fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
			}else{
				//execute when we add new record and have units in unit type || we we click set unit and unit type by selecting profile and profile =old profile.
				fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
			}
		}else{
			//execute when we edit record and profile and profile !=old profile.
			fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',form.getFieldValue('waste_out.units'),dataRes);
		}
	}
}
//after select unit type set value to  unit 
function fillUnit(){ 
	var typeSelect = $('unitsType');
	var type=typeSelect.value;
	var res="bill_unit.bill_type_id='"+type+"' ";
	var records=abWasteTrackShipmentsController.abWasteDefMainfestsUnit.getRecords(res);
	var record='';
	var unit='';
	if(records!=''){
		record =records[0];
		unit=record.getValue('bill_unit.bill_unit_id');
	}
	var dataRes="bill_unit.bill_type_id='"+type+"'";
	if(record==''){
		fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
	}else{
		fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
	}
}
/**
 * Configure the selectValue dialog in JavaScript
 */
function selectValueTransporter(panelId) {
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
    	restriction: "vn.vendor_type = 'WstTr'",
    	showIndex: false,
    	selectValueType: 'grid'
	});
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
function checkDisposition(form,disDs){
  	var disposition=form.getFieldValue("waste_out.waste_disposition");
  	var restriction = new Ab.view.Restriction();
		restriction.addClause('waste_dispositions.disposition_type', 'S');
		restriction.addClause('waste_dispositions.waste_disposition', disposition);
		var records=disDs.getRecords(restriction);
		return records.length>0;
}
function checkQuanity(form){
	var quanity=form.getFieldValue('waste_out.quantity');
	return 0.00<quanity;
}