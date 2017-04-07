/**
 * @author Lei
 */
var abWasteTrackStorageController = View.createController('abWasteTrackStorageController', {
	
	quantity:0,
	siteId:'',
	areaType:'',
	storageLocation:'',
	oldStatus:'',
	fieldArray:new Array(
			['waste_out.quantity','quantityMsg'],
			['waste_out.number_containers','numContainerMsg']
			),
	/**
	 * Fill unit type and unit list after form refreshed
	 */
	abWasteTrackStorageWasteStorageForm_afterRefresh:function(){
		if(this.abWasteTrackStorageWasteStorageForm.newRecord == true){
			this.abWasteTrackStorageWasteStorageForm.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		
		var units_type=this.abWasteTrackStorageWasteStorageForm.getFieldValue("waste_out.units_type");
		loadUnitAndUnitType("waste_out.units_type", units_type, '');
	},
	
	/**
	 * Fill unit type and unit list after form refreshed
	 */
	abWasteTrackStorageWasteTankForm_afterRefresh:function(){
		if(this.abWasteTrackStorageWasteTankForm.newRecord == true){
			this.abWasteTrackStorageWasteTankForm.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		var units_type=this.abWasteTrackStorageWasteTankForm.getFieldValue("waste_out.units_type");
		loadUnitAndUnitType("waste_out.units_type", units_type, '');
	},
	/**
	 * Fill unit type and unit list after form refreshed
	 */
	abWasteTrackStorageWasteAccumForm_afterRefresh:function(){
		if(this.abWasteTrackStorageWasteAccumForm.newRecord == true){
			this.abWasteTrackStorageWasteAccumForm.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		var units_type=this.abWasteTrackStorageWasteAccumForm.getFieldValue("waste_out.units_type");
		loadUnitAndUnitType("waste_out.units_type", units_type, '');
	},
	
	/**
	 * Add new waste that waste_out.container_type='S'
	 */
	abWasteTrackStorage_WasteStorageGrid_onAddNew:function(){
		this.abWasteTrackStorageWasteTankForm.show(false);
		this.abWasteTrackStorageWasteAccumForm.show(false);
		//Set default site_id and storage location  when we click add new button
		var form = this.abWasteTrackStorageWasteStorageForm;
		form.newRecord = true;
		this.quantity=0;
		form.show(true);
		form.refresh();
		form.clear();
		$('abWasteTrackStorageWasteStorageForm_waste_out.quantity').value = '';
		if(valueExistsNotEmpty(this.siteId)){
			form.setFieldValue("waste_out.site_id",this.siteId);
		}
		if(valueExistsNotEmpty(this.storageLocation)){
			form.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		//KB#3032128: set location values from Storage's Location
		this.setValueFromStorageLocation(form);
	},

	/**
	 * Retrieve waste area record and set location values to form
	 */
	setValueFromStorageLocation:function(form){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("waste_areas.storage_location", this.storageLocation, "=", true);
		var areaRec = this.abWasteTrackStorageAreaDS.getRecord(restriction);
		form.setFieldValue('waste_out.bl_id',areaRec.getValue('waste_areas.bl_id'));
		form.setFieldValue('waste_out.fl_id',areaRec.getValue('waste_areas.fl_id'));
		form.setFieldValue('waste_out.rm_id',areaRec.getValue('waste_areas.rm_id'));
	},
	
	/**
	 * Add new waste that waste_out.container_type='T'
	 */
	abWasteTrackStorage_WasteTankGrid_onAddNew:function(){
		this.abWasteTrackStorageWasteStorageForm.show(false);
		this.abWasteTrackStorageWasteAccumForm.show(false);
		var form = this.abWasteTrackStorageWasteTankForm;
		form.newRecord = true;
		this.quantity=0;
		form.show(true);
		form.refresh();
		form.clear();
		//Set credit_type field ='C'
		$('abWasteTrackStorageWasteTankForm_waste_out.quantity').value = '';
		if(valueExistsNotEmpty(this.siteId)){
			form.setFieldValue("waste_out.site_id",this.siteId);
		}
		if(valueExistsNotEmpty(this.storageLocation)){
			form.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		//KB#3032128: set location values from Tank's Location
		this.setValueFromStorageLocation(form);
	},
	/**
	 * Add new waste that waste_out.container_type='T'
	 */
	abWasteTrackStorage_WasteAccumGrid_onAddNew:function(){
		this.abWasteTrackStorageWasteStorageForm.show(false);
		this.abWasteTrackStorageWasteTankForm.show(false);
		var form = this.abWasteTrackStorageWasteAccumForm;
		form.newRecord = true;
		this.quantity=0;
		form.show(true);
		form.refresh();
		form.clear();
		//Set credit_type field ='C'
		$('abWasteTrackStorageWasteAccumForm_waste_out.quantity').value = '';
		if(valueExistsNotEmpty(this.siteId)){
			form.setFieldValue("waste_out.site_id",this.siteId);
		}
		if(valueExistsNotEmpty(this.storageLocation)){
			form.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		$('unitsType2').disabled=false;
		$('units2').disabled=false;
		//KB#3032128: set location values from Tank's Location
		this.setValueFromStorageLocation(form);
	},
	/**
	 * Update or save Storage record
	 */
	abWasteTrackStorageWasteTankForm_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType','units','fieldNoNull');
		if(isEmpty){
			return;
		}
		var form=this.abWasteTrackStorageWasteTankForm;
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		
		//validate if field value is minus
		
		var isMinusZero=minusCanNotSaved(this.abWasteTrackStorageWasteTankForm,this.fieldArray,'and','minusNotAllowed');
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
		
		form.setFieldValue('waste_out.units_type',$('unitsType').value);
		form.setFieldValue('waste_out.units',$('units').value);
		if (form.canSave()){
			if(quantity!=this.quantity && form.newRecord==false&&!flag){
				View.confirm(getMessage("quantityEquals"), function(button){
		            if (button == 'yes') {
		            	abWasteTrackStorageController.saveRecord(form);
		            }else{
		            	return;
		            }
		        })
			}else{
				this.saveRecord(form);
			}
			}
	},
	saveRecord: function(form){
		if(!checkAreaAndSite(form,this.abWasteTrackWasteAreaDS)){
			View.showMessage(getMessage('areaSite'));
			return;
		}
		var storageLocation = form.getFieldValue('waste_out.storage_location');
		var status = form.getFieldValue('waste_out.status');
		if (status == 'S') {
			var restriciton = new Ab.view.Restriction();
			restriciton.addClause("waste_areas.storage_location", storageLocation, "=");
			restriciton.addClause("waste_areas.area_type", 'A', "=");
			var records = this.abWasteTrackGenWasteAreaDS.getRecords(restriciton);

			if (records.length != 0) {
				View.showMessage(getMessage('areaTypeST'));
				return;
			}
		}
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
		onStoragelocationClick();
	},
	/**
	 * Update or save Storage record
	 */
	abWasteTrackStorageWasteAccumForm_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType2','units2','fieldNoNull');
		if(isEmpty){
			return;
		}
		var form=this.abWasteTrackStorageWasteAccumForm;
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		form.setFieldValue('waste_out.status','S');
		var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		
		//validate if field value is minus
		
		var isMinusZero=minusCanNotSaved(this.abWasteTrackStorageWasteAccumForm,this.fieldArray,'and','minusNotAllowed');
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
		form.setFieldValue('waste_out.units_type',$('unitsType2').value);
		form.setFieldValue('waste_out.units',$('units2').value);
		
		if (form.canSave()){
			if(quantity!=this.quantity && form.newRecord==false && !flag){
				View.confirm(getMessage("quantityEquals"), function(button){
		            if (button == 'yes') {
		            	abWasteTrackStorageController.saveRecord(form);
		            }else{
		            	return;
		            }
		        })
			}else{
				this.saveRecord(form);
			}
		}
	},
	/**
	 * Update or save Tank category record
	 */
	abWasteTrackStorageWasteStorageForm_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType1','units1','fieldNoNull');
		if(isEmpty){
			return;
		}
		var form=this.abWasteTrackStorageWasteStorageForm;
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		//validate if field value is minus
		var isMinusZero=minusCanNotSaved(this.abWasteTrackStorageWasteStorageForm,this.fieldArray,'and','minusNotAllowed');
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
		form.setFieldValue('waste_out.units_type',$('unitsType1').value);
		form.setFieldValue('waste_out.units',$('units1').value);
		if (form.canSave()){
			if(quantity!=this.quantity && form.newRecord==false && !flag){
				View.confirm(getMessage("quantityEquals"), function(button){
		            if (button == 'yes') {
		            	abWasteTrackStorageController.saveRecord(form);
		            }else{
		            	return;
		            }
		        })
			}else{
				this.saveRecord(form);
			}
		}
	}

})
/**
 * Excute when we click  the third level tree
 */
function onStoragelocationClick(fromTree){
	if(fromTree){
		View.panels.get('abWasteTrackStorageWasteStorageForm').show(false);
		View.panels.get('abWasteTrackStorageWasteTankForm').show(false);
		View.panels.get('abWasteTrackStorageWasteAccumForm').show(false);
	}
	var c=abWasteTrackStorageController;
	var currentNode = View.panels.get('abWasteTrackStorage_Tree').lastNodeClicked;
	c.siteId = currentNode.parent.parent.data['site.site_id'];
	c.areaType = currentNode.parent.data['waste_areas.area_type.raw'];
	c.storageLocation = currentNode.data['waste_areas.storage_location'];

	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.storage_location', c.storageLocation);
	if(c.areaType=='S'){
		View.panels.get('abWasteTrackStorage_WasteTankGrid').show(false);
		View.panels.get('abWasteTrackStorage_WasteAccumGrid').show(false);
		View.panels.get('abWasteTrackStorage_WasteStorageGrid').refresh(restriction);

	}else if(c.areaType=='T'){
		View.panels.get('abWasteTrackStorage_WasteStorageGrid').show(false);
		View.panels.get('abWasteTrackStorage_WasteAccumGrid').show(false);
		View.panels.get('abWasteTrackStorage_WasteTankGrid').refresh(restriction);

	}else{
		View.panels.get('abWasteTrackStorage_WasteStorageGrid').show(false);
		View.panels.get('abWasteTrackStorage_WasteTankGrid').show(false);
		View.panels.get('abWasteTrackStorage_WasteAccumGrid').refresh(restriction);
	}
}
/**
 * Execute when we click waste link on grid abWasteTrackStorage_WasteStorageGrid
 */
function editStorage(){
	var grid = View.panels.get('abWasteTrackStorage_WasteStorageGrid');
	var index = grid.selectedRowIndex;
	var row = grid.rows[grid.selectedRowIndex];
	var wasteId = row['waste_out.waste_id'];
	var quanity=row['waste_out.quantity.raw'];
	if(quanity==null){
		quanity=row['waste_out.quantity'];
	}
	abWasteTrackStorageController.quantity=parseFloat(quanity);
	abWasteTrackStorageController.oldStatus=row['waste_out.status.raw'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.waste_id', wasteId);
	View.panels.get('abWasteTrackStorageWasteStorageForm').refresh(restriction,false);
	View.panels.get('abWasteTrackStorageWasteTankForm').show(false);
	View.panels.get('abWasteTrackStorageWasteAccumForm').show(false);
	View.panels.get('abWasteTrackStorageWasteStorageForm').show(true);
}

/**
 * Execute when we click waste link on grid abWasteTrackStorage_WasteTankGrid
 */
function editTank(){
	var grid = View.panels.get('abWasteTrackStorage_WasteTankGrid');
	var index = grid.selectedRowIndex;
	var row = grid.rows[grid.selectedRowIndex];
	var wasteId = row['waste_out.waste_id'];
	var quanity=row['waste_out.quantity.raw'];
	if(quanity==null){
		quanity=row['waste_out.quantity'];
	}
	abWasteTrackStorageController.quantity=parseFloat(quanity);
	abWasteTrackStorageController.oldStatus=row['waste_out.status.raw'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.waste_id', wasteId);
	View.panels.get('abWasteTrackStorageWasteTankForm').refresh(restriction,false);
	View.panels.get('abWasteTrackStorageWasteStorageForm').show(false);
	View.panels.get('abWasteTrackStorageWasteAccumForm').show(false);
	View.panels.get('abWasteTrackStorageWasteTankForm').show(true);
}
/**
 * Execute when we click waste link on grid abWasteTrackStorage_WasteTankGrid
 */
function editAccum(){
	var grid = View.panels.get('abWasteTrackStorage_WasteAccumGrid');
	var index = grid.selectedRowIndex;
	var row = grid.rows[grid.selectedRowIndex];
	var wasteId = row['waste_out.waste_id'];
	var quanity=row['waste_out.quantity.raw'];
	if(quanity==null){
		quanity=row['waste_out.quantity'];
	}
	abWasteTrackStorageController.quantity=parseFloat(quanity);
	abWasteTrackStorageController.oldStatus=row['waste_out.status.raw'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.waste_id', wasteId);
	View.panels.get('abWasteTrackStorageWasteAccumForm').refresh(restriction,false);
	View.panels.get('abWasteTrackStorageWasteStorageForm').show(false);
	View.panels.get('abWasteTrackStorageWasteTankForm').show(false);
	View.panels.get('abWasteTrackStorageWasteAccumForm').show(true);
	$('unitsType2').disabled=true;
	$('units2').disabled=true;
}

//after form refresh load unit type and unit
function loadUnitAndUnitType(fieldName, selectedValue, previousValue){
	
	var c=abWasteTrackStorageController;
	if(fieldName=="waste_out.units_type"){
		var form=c.abWasteTrackStorageWasteStorageForm;
		var form1=c.abWasteTrackStorageWasteTankForm;
		var form2=c.abWasteTrackStorageWasteAccumForm;
		if(form.visible){
			setUnitAndUnitype(form,'unitsType1',selectedValue,'units1',previousValue);
		}else if(form1.visible){
			setUnitAndUnitype(form1,'unitsType',selectedValue,'units',previousValue);
		}else{
			setUnitAndUnitype(form2,'unitsType2',selectedValue,'units2',previousValue);
		}
	}
}

//after select waste profile set value to unit type and unit
function afterSelectProfile(fieldName, selectedValue, previousValue){
	
	var c=abWasteTrackStorageController;
	if(fieldName=="waste_out.units_type"){
		var form=c.abWasteTrackStorageWasteStorageForm;
		var form1=c.abWasteTrackStorageWasteTankForm;
		var form2=c.abWasteTrackStorageWasteAccumForm;
		if(form.visible){
			var unitsType1=$('unitsType1').value;
			if(unitsType1!=''){
				return;
			}
			setUnitAndUnitype(form,'unitsType1',selectedValue,'units1',previousValue);
		}else if(form1.visible){
			var unitsType=$('unitsType').value;
			if(unitsType!=''){
				return;
			}
			setUnitAndUnitype(form1,'unitsType',selectedValue,'units',previousValue);
		}else{
			var unitsType=$('unitsType').value;
			if(unitsType!=''){
				return;
			}
			setUnitAndUnitype(form2,'unitsType2',selectedValue,'units2',previousValue);
		}
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
	var c=abWasteTrackStorageController;
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
//after select unit type set value to  unit 
function fillUnit(){
	var c=abWasteTrackStorageController;
	var form=c.abWasteTrackStorageWasteStorageForm;
	var form1=c.abWasteTrackStorageWasteTankForm;
	var form2=c.abWasteTrackStorageWasteAccumForm;
	var typeSelect = '';
	if(form.visible){
		typeSelect=$('unitsType1')
	}else if(form1.visible){
		typeSelect=$('unitsType')
	}else{
		typeSelect=$('unitsType2')
	}
	var type=typeSelect.value;
	var res="bill_unit.bill_type_id='"+type+"'  ";
	var records=c.abWasteDefMainfestsUnit.getRecords(res);
	var record='';
	var unit='';
	if(records!=''){
		record =records[0];
		unit=record.getValue('bill_unit.bill_unit_id');
	}
	
	var dataRes="bill_unit.bill_type_id='"+type+"'";
	var form=c.abWasteTrackStorageWasteStorageForm;
	
	if(form.visible){
		if(record==''){
			fillList('abWasteDefMainfestsUnit','units1','bill_unit.bill_unit_id','',dataRes);
		}else{
			fillList('abWasteDefMainfestsUnit','units1','bill_unit.bill_unit_id',unit,dataRes);
		}
	}else if(form1.visible){
		if(record==''){
			fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
		}else{
			fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
		}
	}else{
		if(record==''){
			fillList('abWasteDefMainfestsUnit','units2','bill_unit.bill_unit_id','',dataRes);
		}else{
			fillList('abWasteDefMainfestsUnit','units2','bill_unit.bill_unit_id',unit,dataRes);
		}
	}
}
//Set restriction for level 2 by level 1, execute after tree node generate,tree level 0,1,2
function afterGeneratingTreeNode(treeNode){
	 var restriction = new Ab.view.Restriction();
	if ( treeNode.level.levelIndex == '1') {
	        var siteCode = treeNode.data['waste_areas.site_id'];
	        var areaType = treeNode.data['waste_areas.area_type.raw'];
		    	restriction.addClause('waste_areas.site_id', siteCode);
		    	restriction.addClause('waste_areas.area_type', areaType);
		    	//Set restriction for level==2
		    	treeNode.restriction=restriction;
    }
	
}
function checkQuanity(form){
	var quanity=form.getFieldValue('waste_out.quantity');
	return 0.00<quanity;
}
