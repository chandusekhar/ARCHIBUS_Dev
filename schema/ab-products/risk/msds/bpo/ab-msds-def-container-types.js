/**
 * @author LEI
 */
var msdsDefContainTypeController = View.createController('msdsDefContainTypeController', {
   
	msdsWasteContainerTypeForm_beforeSave: function(){
		//units and type should be required only if the user enters a value for container size
		var containerSize = this.msdsWasteContainerTypeForm.getFieldValue('hazard_container_type.container_size');
		if(containerSize && containerSize > 0){
			var selectUnitsType = $('unitsType');
			var unitsType=selectUnitsType.value;
			if(!unitsType){
				View.showMessage(getMessage("fillUnitType"));
                return false;
			}
		}
		return true;
	},
	
	saveForm:function(){
		var selectUnitsType = $('unitsType');
		var unitsType=selectUnitsType.value;
		
		if(unitsType){
			this.msdsWasteContainerTypeForm.setFieldValue('hazard_container_type.units_type', unitsType);
		}
		
		var selectUnits = $('units');
		var units=selectUnits.value;
		if(units){
			this.msdsWasteContainerTypeForm.setFieldValue('hazard_container_type.units', units);
		}
		
		this.msdsWasteContainerTypeForm.save();
	},
	/**
	 * Fill unit type and unit list after form refreshed
	 */
	msdsWasteContainerTypeForm_afterRefresh:function(){
		
		if(this.msdsWasteContainerTypeForm.newRecord == true){
			fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id','','1=1');
			fillUnit();			
		}else{
			fillList('abWasteDefMainfestsType','unitsType','bill_type.bill_type_id',this.msdsWasteContainerTypeForm.getFieldValue('hazard_container_type.units_type'),'1=1');
			fillUnit(this.msdsWasteContainerTypeForm.getFieldValue('hazard_container_type.units'));
			
		}
		
	}
   
})
//after select unit type set value to unit 
function fillUnit(defaultValue){
	var typeSelect = $('unitsType');
	var type=typeSelect.value;
	var res="bill_unit.bill_type_id='"+type+"' and bill_unit.is_dflt='1'";
	var record=msdsDefContainTypeController.abWasteDefMainfestsUnit.getRecord(res);
	var unit = (defaultValue == '') ? record.getValue('bill_unit.bill_unit_id') : defaultValue;
	var dataRes="bill_unit.bill_type_id='"+type+"'";
	if(unit==''){
		fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id','',dataRes);
		}else{
		fillList('abWasteDefMainfestsUnit','units','bill_unit.bill_unit_id',unit,dataRes);
		}
	msdsDefContainTypeController.msdsWasteContainerTypeForm.setFieldValue('hazard_container_type.units_type',$('unitsType').value);
	msdsDefContainTypeController.msdsWasteContainerTypeForm.setFieldValue('hazard_container_type.units',$('units').value);
}