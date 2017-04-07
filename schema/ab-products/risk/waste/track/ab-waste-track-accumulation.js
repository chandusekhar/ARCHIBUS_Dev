/**
 * @author Lei
 */
var abWasteTrackAccumController = View.createController('abWasteTrackAccumController', {
	
	quantity:0,
	siteId:'',
	areaType:'',
	storageLocation:'',
	fieldArray:new Array(
			['waste_out.quantity','quantityMsg'],
			['waste_out.number_containers','numContainerMsg']
			),
	/**
	 * Fill unit type and unit list after form refreshed
	 */
	abWasteTrackAccumWasteAccumForm_afterRefresh:function(){
		if(this.abWasteTrackAccumWasteAccumForm.newRecord == true){
			this.abWasteTrackAccumWasteAccumForm.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		
		var units_type=this.abWasteTrackAccumWasteAccumForm.getFieldValue("waste_out.units_type");
		loadUnitAndUnitType("waste_out.units_type", units_type, '');
	},
	
	
	/**
	 * Add new waste that waste_out.container_type='S'
	 */
	abWasteTrackAccum_WasteAccumGrid_onAddNew:function(){

		//Set default site_id and storage location  when we click add new button
		var form = this.abWasteTrackAccumWasteAccumForm;
		form.newRecord = true;
		form.show(true);
		form.refresh();
		form.clear();
		form.setFieldValue('waste_out.date_start', getCurrentDate());
		this.quantity=0;
		if(valueExistsNotEmpty(this.siteId)){
			form.setFieldValue("waste_out.site_id",this.siteId);
		}
		if(valueExistsNotEmpty(this.storageLocation)){
			form.setFieldValue("waste_out.storage_location",this.storageLocation);
		}
		$('abWasteTrackAccumWasteAccumForm_waste_out.quantity').value = '';
		$('unitsType').disabled=false;
		$('units').disabled=false;
		//KB#3032128: set location values from Storage's Location
		this.setValueFromAccumLocation(form);
	},

	/**
	 * Retrieve waste area record and set location values to form
	 */
	setValueFromAccumLocation:function(form){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("waste_areas.storage_location", this.storageLocation, "=", true);
		var areaRec = this.abWasteTrackAccumAreaDS.getRecord(restriction);
		form.setFieldValue('waste_out.date_start', getCurrentDate());
		form.setFieldValue('waste_out.bl_id',areaRec.getValue('waste_areas.bl_id'));
		form.setFieldValue('waste_out.fl_id',areaRec.getValue('waste_areas.fl_id'));
		form.setFieldValue('waste_out.rm_id',areaRec.getValue('waste_areas.rm_id'));
	},
	


	/**
	 * Update or save Tank category record
	 */
	abWasteTrackAccumWasteAccumForm_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType','units','fieldNoNull');
		if(isEmpty){
			return;
		}
		var form=this.abWasteTrackAccumWasteAccumForm;
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		//validate if field value is minus
		var isMinusZero=minusCanNotSaved(this.abWasteTrackAccumWasteAccumForm,this.fieldArray,'and','minusNotAllowed');
		if(isMinusZero){
			return;
		}
		
		form.setFieldValue('waste_out.units_type',$('unitsType').value);
		form.setFieldValue('waste_out.units',$('units').value);
		if (form.canSave()){
			if(!checkAreaAndSite(form,this.abWasteTrackWasteAreaDS)){
				View.showMessage(getMessage('areaSite'));
				return;
			}
			var quantity=parseFloat(form.getFieldValue("waste_out.quantity"));
			if(quantity!=this.quantity && form.newRecord==false){
				View.confirm(getMessage("quantityEquals"), function(button){
		            if (button == 'yes') {
		            	abWasteTrackAccumController.saveRecord(form);
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
		onLocationClick();
		this.quantity=parseFloat(form.getFieldValue("waste_out.quantity"));
		form.newRecord=false;
	}

})
/**
 * Excute when we click  the third level tree
 */
function onLocationClick(){
	
	var c=abWasteTrackAccumController;
	var currentNode = View.panels.get('abWasteTrackAccum_Tree').lastNodeClicked;
	c.siteId = currentNode.parent.parent.data['site.site_id'];
	c.areaType = currentNode.parent.data['waste_areas.area_type.raw'];
	c.storageLocation = currentNode.data['waste_areas.storage_location'];

	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.storage_location', c.storageLocation);
	View.panels.get('abWasteTrackAccum_WasteAccumGrid').refresh(restriction);
}
/**
 * Execute when we click waste link on grid abWasteTrackAccum_WasteAccumGrid
 */
function editAccum(){
	var grid = View.panels.get('abWasteTrackAccum_WasteAccumGrid');
	var index = grid.selectedRowIndex;
	var row = grid.rows[grid.selectedRowIndex];
	var wasteId = row['waste_out.waste_id'];
	var quanity=row['waste_out.quantity.raw'];
	if(quanity==null){
		quanity=row['waste_out.quantity'];
	}
	abWasteTrackAccumController.quantity=parseFloat(quanity);
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_out.waste_id', wasteId);
	View.panels.get('abWasteTrackAccumWasteAccumForm').refresh(restriction,false);
	View.panels.get('abWasteTrackAccumWasteAccumForm').show(true);
	$('unitsType').disabled=true;
	$('units').disabled=true;
}

//after form refresh load unit type and unit
function loadUnitAndUnitType(fieldName, selectedValue, previousValue){
	
	var c=abWasteTrackAccumController;
	if(fieldName=="waste_out.units_type"){
		var form=c.abWasteTrackAccumWasteAccumForm;
			setUnitAndUnitype(form,'unitsType',selectedValue,'units',previousValue);
	}
}

//after select waste profile set value to unit type and unit
function afterSelectProfile(fieldName, selectedValue, previousValue){
	var c=abWasteTrackAccumController;
	if(fieldName=="waste_out.units_type"){
		var form=c.abWasteTrackAccumWasteAccumForm;
			var unitsType=$('unitsType').value;
			if(unitsType!=''){
				return;
			}
			setUnitAndUnitype(form,'unitsType',selectedValue,'units',previousValue);
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
	var c=abWasteTrackAccumController;
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
	var c=abWasteTrackAccumController;
	var type=$('unitsType').value;
	var res="bill_unit.bill_type_id='"+type+"'  ";
	var records=c.abWasteDefMainfestsUnit.getRecords(res);
	var record='';
	var unit='';
	if(records!=''){
		record =records[0];
		unit=record.getValue('bill_unit.bill_unit_id');
	}
	
	var dataRes="bill_unit.bill_type_id='"+type+"'";
	var form=c.abWasteTrackAccumWasteAccumForm;
	if(record==''){
			fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
	}else{
			fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
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
function getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
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
		formId: 'abWasteTrackAccumWasteAccumForm',
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
		                restriction: "waste_areas.area_type='A'",
		                sortValues: toJSON(sortValues)
	});
}
function checkQuanity(form){
	var quanity=form.getFieldValue('waste_out.quantity');
	return 0.00<quanity;
}