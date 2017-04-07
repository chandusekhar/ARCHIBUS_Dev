/**

* @author xianchao

*/
var abWasteDefMainfestsController = View.createController('abWasteDefMainfestsController',
{
    num:'',
    generatorId:'',
    fieldArray:new Array(
			['waste_out.quantity','quantityMsg'],
			['waste_out.number_containers','numContainerMsg']
			),
	/**
	* This event handler is called by clear button in abWasteDefMainfestsConsole.
	*/
	abWasteDefMainfestsConsole_onClear : function() {
		this.abWasteDefMainfestsConsole.clear();
	},
	/**
	* This event handler is called by show button in abWasteDefMainfestsConsole.
	*/
	abWasteDefMainfestsConsole_onShow : function() {
		
		this.abWasteDefMainfestsGrid.addParameter('conRes', this.getRes());
		this.abWasteDefMainfestsGrid.refresh();
		
	},
	/**
	* This event handler is called by Add New button in abWasteDefMainfestsGrid.
	*/
	abWasteDefMainfestsGrid_onAddNew : function() {

		// create and show a new record in abWasteDefMainfestsForm
		var mainForm = this.abWasteDefMainfestsForm;
		mainForm.show(true);
		mainForm.newRecord = true;
		mainForm.refresh();
		this.generatorId='';
		this.num='';
		$('generator_id').disabled=false;

	},
	/**
	* This event handler is called by addNewWaste button in abWasteDefMainfestsForm.
	*/
	abWasteDefMainfestsForm_onAddNewWaste : function(){
		var outForm=this.abWasteDefMainfestsDialogNew;
		outForm.newRecord = true;
		outForm.refresh();
		var num=this.abWasteDefMainfestsForm.getFieldValue('waste_manifests.manifest_number');
		outForm.setFieldValue("waste_out.manifest_number", num);
		outForm.enableField('waste_out.manifest_number',false);
		this.generatorId = $('generator_id').value;
		if(this.generatorId!=''){
		//set generator id value 	
		outForm.setFieldValue("waste_out.generator_id", this.generatorId);
		outForm.enableField('waste_out.generator_id',false);
		}else{
			outForm.enableField('waste_out.generator_id',true);
		}
		//fill unitsType and units dropdown list
		fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id','');
		fillUnit();
		$('abWasteDefMainfestsDialogNew_waste_out.quantity').value = '';
		outForm.showInWindow({
	        width: 1000,
	        height: 800
	    });
		
	},
	/**
	* This event handler is called by addStoredWaste button in abWasteDefMainfestsForm.
	*/
	abWasteDefMainfestsForm_onAddStoredWaste : function(){
		var res=new Ab.view.Restriction();
		var grid=this.abWasteDefMainfestsDialogStored;
		this.generatorId=$('generator_id').value;
		//set restriction by generator id
		if(this.generatorId!=''){
			res.addClause('waste_out.generator_id', this.generatorId);
			res.addClause('waste_out.generator_id', '','=','OR');
		}
		grid.refresh(res);
		grid.showInWindow({
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
			this.abWasteDefMainfestsGrid.refresh();
		}
	},
	/**
	* Update or save waste out record
	*/
	abWasteDefMainfestsDialogNew_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType','units','fieldNoNull');
		if(isEmpty){
			return;
		}
		var form=this.abWasteDefMainfestsDialogNew;
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
		var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		
		//validate if field value is minus
		var isMinusZero=minusCanNotSaved(this.abWasteDefMainfestsDialogNew,this.fieldArray,'and','minusNotAllowed');
		if(isMinusZero){
			return;
		}
		
		var typeSelect = $('unitsType');
		this.abWasteDefMainfestsDialogNew.setFieldValue("waste_out.units_type", typeSelect.value);
		var unitSelect = $('units');
		this.abWasteDefMainfestsDialogNew.setFieldValue("waste_out.units", unitSelect.value);
		if (this.abWasteDefMainfestsDialogNew.canSave()) {
			this.generatorId = this.abWasteDefMainfestsDialogNew.getFieldValue("waste_out.generator_id");
			var jsonRecord=this.abWasteDefMainfestsDialogNew.getFieldValues(true);
			  try {
		            var result = Workflow.callMethod(
		                'AbRiskWasteMgmt-WasteService-saveWaste',jsonRecord,false);
		        } catch (e) {
		            Workflow.handleError(e);
		        }
			//this.abWasteDefMainfestsDialogNew.save();
			var generator = $('generator_id');
			generator.value=this.generatorId;
			this.abWasteDefMainfestsForm.enableField('generator_id',false);
			try {
		    	// call WFR
				var result = Workflow.callMethod("AbRiskWasteMgmt-WasteService-updateWasteout",this.num);
				this.abWasteDefMainfestsDialogNew.closeWindow();
			}catch(e){
				Workflow.handleError(e); 
			}
		}
	},
	/**
	* get restriction of abWasteDefMainfestsGrid
	*/
	getRes: function(){
		var res="1=1 ";
		var num=this.abWasteDefMainfestsConsole.getFieldValue('waste_manifests.manifest_number');
		var facName=this.abWasteDefMainfestsConsole.getFieldValue('waste_facilities.facility_name');
		var genId=this.abWasteDefMainfestsConsole.getFieldValue('waste_generators.generator_id');
		if(''!=num){
			res=res+" and waste_manifests.manifest_number like '%"+num+"%'";
		}
		if(''!=facName){
			res=res+ " and waste_facilities.facility_name='"+facName+"'";
		}
		if(''!=genId){
			
			res=res+" and  waste_manifests.manifest_number in( select distinct manifest_number from waste_out where waste_out.generator_id='"+genId+"')";
		}
		return res;
	},
	/**
	* after abWasteDefMainfestsForm refresh 
	*/
	abWasteDefMainfestsForm_afterRefresh: function(){
		//set these fields to disabled
		this.abWasteDefMainfestsForm.getFieldElement('waste_facilities.facility_name').disabled= true;
		this.abWasteDefMainfestsForm.getFieldElement('waste_facilities.vn_id').disabled= true;
	}
});
/**
* This event handler is called by Add Selected Waste(s) button in abWasteDefMainfestsDialogStored grid 
*/
function showSelectedRecords() {
	if(gCodeIsSame()){
	var num=abWasteDefMainfestsController.abWasteDefMainfestsForm.getFieldValue('waste_manifests.manifest_number');
    var grid = AFM.view.View.getControl('', 'abWasteDefMainfestsDialogStored');
	var rows = grid.getPrimaryKeysForSelectedRows();
    try {
    	// call WFR
		var result = Workflow.callMethod("AbRiskWasteMgmt-WasteService-updateWasteManifest",num,rows);
		if(result.data.checkGenId!="false"){	
		View.showMessage(getMessage("sucessAddWaste"));
		//refresh abWasteDefMainfestsDialogStored grid
			var res=new Ab.view.Restriction();
			if(abWasteDefMainfestsController.generatorId!=''){
				res.addClause('waste_out.generator_id', abWasteDefMainfestsController.generatorId);
				res.addClause('waste_out.generator_id', '','=','OR');
			}
			grid.refresh(res);
			var generator = $('generator_id');
			generator.value=abWasteDefMainfestsController.generatorId;
			if(generator.value!=''){
				abWasteDefMainfestsController.abWasteDefMainfestsForm.enableField('generator_id',false);
			}
			grid.closeWindow();
		}else{
			//show the error message
			View.showMessage(getMessage("checkGenId"));
		}
	}catch(e){
		View.showMessage(getMessage("errorAddWaste"));
		Workflow.handleError(e); 
	}
	}
}


// after select waste profile set value to unit type and unit
function afterSelectProfile(fieldName, selectedValue, previousValue){
	var unitsType=$('unitsType').value;
	if(unitsType!=''){
		return;
	}
if(fieldName=="waste_out.units_type"){
	var res="bill_unit.bill_type_id='"+selectedValue+"' and bill_unit.is_dflt='1'";
	fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id',selectedValue);
	var record=abWasteDefMainfestsController.abWasteDefMainfestsUnit.getRecord(res);
	var dataRes="bill_unit.bill_type_id='"+selectedValue+"'";
	var unit=record.getValue('bill_unit.bill_unit_id');
	if(record==''){
	fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
	}else{
	fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
	}
	
  }
}
//after select unit type set value to  unit 
function fillUnit(){
	var typeSelect = $('unitsType');
	var type=typeSelect.value;
	var res="bill_unit.bill_type_id='"+type+"' and bill_unit.is_dflt='1'";
	var record=abWasteDefMainfestsController.abWasteDefMainfestsUnit.getRecord(res);
	var unit=record.getValue('bill_unit.bill_unit_id');
	var dataRes="bill_unit.bill_type_id='"+type+"'";
	if(record==''){
		fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
		}else{
		fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
		}
}
//after click manifest 
function clickManifest(){
	var grid = abWasteDefMainfestsController.abWasteDefMainfestsGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var res = '1=1';
	var menNum = rows[num]['waste_manifests.manifest_number'];
	abWasteDefMainfestsController.num=menNum;
	var res=new Ab.view.Restriction();
	res.addClause('waste_manifests.manifest_number', menNum);
	abWasteDefMainfestsController.abWasteDefMainfestsForm.clear();
	abWasteDefMainfestsController.abWasteDefMainfestsForm.newRecord = false;
	abWasteDefMainfestsController.abWasteDefMainfestsForm.refresh(res);
	var res=new Ab.view.Restriction();
	res.addClause('waste_out.manifest_number', menNum);
	res.addClause('waste_out.generator_id', '','IS NOT NULL');
	var rec=abWasteDefMainfestsController.abWasteDefMainfestsWasteOut.getRecord(res);
	abWasteDefMainfestsController.generatorId='';
	var generatorId=rec.getValue("waste_out.generator_id");
	var generator = $('generator_id');
	generator.disabled=false;
	if(generatorId!=''&&generatorId!=null){
		abWasteDefMainfestsController.generatorId=generatorId;
		generator.value=generatorId;
		generator.disabled= true;
		abWasteDefMainfestsController.abWasteDefMainfestsForm.enableField('generator_id',false);
	}else{
		abWasteDefMainfestsController.abWasteDefMainfestsForm.enableField('generator_id',true);
	}
}
//check generator_id values of selected rows  are same or not.
function gCodeIsSame(){
	var rows=abWasteDefMainfestsController.abWasteDefMainfestsDialogStored.getSelectedRows();
	if(rows.length==0){
		View.showMessage(getMessage("checkRecord"));
		return false;
	}
	var gId='';
	var num=0;
	 for (var i = 0; i < rows.length; i++) {
		 var generatorId = rows[i]['waste_out.generator_id']; 
		 if(generatorId!=''&&generatorId!=null){
			 gId=generatorId;
			 num=i;
			 break;
		 }
	 }
	 for (var i = num; i < rows.length; i++) {
		 var generatorId = rows[i]['waste_out.generator_id']; 
		 if(generatorId!=gId&&generatorId!=''){
			 View.showMessage(getMessage("errorAddWaste"));
			 return false;
		 }
	 }
	 if(gId!=''){
		 abWasteDefMainfestsController.generatorId=gId;
		 }
	return true;
}
/**
 * Configure the selectValue dialog in JavaScript
 */
function selectValueTransporterIsActive(panelId,fieldName) {
	View.selectValue({
		formId: panelId,
		title: 'Select Transporter',
		fieldNames: [fieldName,'vn.company'],
//		fieldNames: ['waste_manifests.transporter_id','vn.company'],
		selectTableName: 'vn',
		selectFieldNames: ['vn.vn_id','vn.phone', 'vn.company'],
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
function checkQuanity(form){
	var quanity=form.getFieldValue('waste_out.quantity');
	return 0.00<quanity;
}
