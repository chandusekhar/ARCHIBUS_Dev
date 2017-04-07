    /**
     * @author  Huang MuLiang
	 */
var abWasteTrackDischargesController  = View.createController('abWasteTrackDischargesController',
  {
	oldStatus:'',
	quantity:0,
	fieldArray:new Array(['waste_out.quantity','quantityMsg']),	
	afterViewLoad: function(){
		var recs = View.dataSources.get("abWasteTrackDischargesUnitsTypeListDS").getRecords();
		var typeSelect = $('unitsType');
		this.typeSelect=typeSelect;
		this.populateTypeSelectLists(recs, typeSelect);
	},
	 /**
	 * Populate units type SelectLists 
	 * @param fieldName
	 * @param recs dataSource for units type
	 * @param typeSelect
	 */
	populateTypeSelectLists: function(recs, typeSelect) {
		typeSelect.innerHTML = '';
		var option1 = document.createElement('option');
        option1.value = '';
        option1.appendChild(document.createTextNode(''));
        typeSelect.appendChild(option1);
        for (var i = 0; i < recs.length; i++) {
            var type = recs[i].values['bill_type.bill_type_id'];
            var option = document.createElement('option');
            option.value = type;
            option.appendChild(document.createTextNode(type));
            typeSelect.appendChild(option);
        }
    },
    abWasteTrackDischargesSelectPanel_onAddNew: function(){
    	$('units').disabled=false;
    	$('unitsType').disabled=false;
    	this.quantity=0;
    	//Load date for 'units type'
		fillList('abWasteTrackDischargesUnitsTypeListDS','unitsType','bill_type.bill_type_id','');
		//Restriction units date list according to unitsType
		fillUnit();
		View.panels.get('abWasteTrackDischargesEditPanel').refresh('',true);
		$('abWasteTrackDischargesEditPanel_waste_out.quantity').value = '';
		
	},
    /**
	* Update or save waste out record
	*/
    abWasteTrackDischargesEditPanel_onSave: function(){
    	var form=this.abWasteTrackDischargesEditPanel;
    	form.setFieldValue("waste_out.status", 'D');
    	var isEmpty=validateUnitAndUnittype('unitsType','units','fieldNoNull');
		if(isEmpty){
			return;
		}
		if(!checkQuanity(form)){
			View.showMessage(getMessage('checkQuantity'));
			return;
		}
    	var isValidate=validateFields(form,getMessage('validateMessage'));
		if(!isValidate){
				return;
			}
		
		//validate if field value is minus
		var isMinusZero=minusCanNotSaved(this.abWasteTrackDischargesEditPanel,this.fieldArray,'and','minusNotAllowed');
		if(isMinusZero){
			return;
		}
		var flag=true;
		if(this.oldStatus==form.getFieldValue("waste_out.status")){
			flag=false;
		}
		var quantity=parseFloat(form.getFieldValue("waste_out.quantity"));
		if(quantity>this.quantity && form.newRecord==false&&flag){
			View.showMessage(getMessage("quantityError"));
			return;
		}
		
		var typeSelect = $('unitsType');
		//Pass value to hidden field 'waste_out.units_type'
		form.setFieldValue("waste_out.units_type", typeSelect.value);
		var unitSelect = $('units');
		//Pass value to hidden field 'waste_out.units'
		form.setFieldValue("waste_out.units", unitSelect.value);
		if (form.canSave()) {
			if(!checkDisposition(form,this.wasteDispositionDS)){
				View.showMessage(getMessage("disError"));
				return;
			}
			if(quantity!=this.quantity && form.newRecord==false&&!flag){
				View.confirm(getMessage("quantityEquals"), function(button){
		            if (button == 'yes') {
		            	abWasteTrackDischargesController.saveRecord(form);
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
	        	var recordWasteOut=this.abWasteTrackDischargesConsoleDS.getRecord(restriction);
	        	var unitsType=recordWasteOut.getValue('waste_out.units_type');
	        	var units=recordWasteOut.getValue('waste_out.units');
	        	var unitsTypeDropdown = $('unitsType');
	        	var unitsDropdown = $('units');
	        	    unitsTypeDropdown.value = unitsType;
	        	    unitsDropdown.value = units;
	        	    $('units').disabled=true;
	            	$('unitsType').disabled=true;
				 // show message as inline text, dismiss after 3 seconds
	            form.displayTemporaryMessage(getMessage('saveSuccess'));
	        } catch (e) {
	            Workflow.handleError(e);
	        }
			//form.save();
		this.quantity=parseFloat(form.getFieldValue("waste_out.quantity"));
		this.abWasteTrackDischargesSelectPanel.refresh();
	}
	
	});

/**
 * auto add related fields associated to the selected bl_id in the bl table
 * @param fieldName selected field
 * @param selectedValue
 * @param previousValue
 */
function onSelectProperty(fieldName,selectedValue,previousValue) {
	var editPanel =  View.panels.get("abWasteTrackDischargesEditPanel");
	if (selectedValue != previousValue&&valueExists(selectedValue)) {
		editPanel.setFieldValue(fieldName,selectedValue);
		var dataSource = View.dataSources.get('abWasteTrackDischargesPropertyDS');
		var restriction = new Ab.view.Restriction();
		restriction.addClause("property.pr_id", selectedValue, "=", true);
		var record = dataSource.getRecord(restriction);
		editPanel.setFieldValue('waste_out.site_id',record.getValue('property.site_id'));
	}
}
/**
 * auto add related fields associated to the selected pr_id in the property table
 * @param fieldName selected field
 * @param selectedValue
 * @param previousValue
 */
function onSelectBl(fieldName,selectedValue,previousValue) {
	var editPanel =  View.panels.get("abWasteTrackDischargesEditPanel");
	if (selectedValue != previousValue&&valueExists(selectedValue)) {
		editPanel.setFieldValue(fieldName,selectedValue);
		var dataSource = View.dataSources.get('abWasteTrackDischargesBlDS');
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id", selectedValue, "=", true);
		var record = dataSource.getRecord(restriction);
		editPanel.setFieldValue('waste_out.site_id',record.getValue('bl.site_id'));
	}
}
    /**
	 * auto add related fields associated to the selected Profile field
	 * @param fieldName
	 * @param selectedValue
	 * @param previousValue
	 */
  function onSelectProfile(fieldName, selectedValue, previousValue){
	  var unitsType=$('unitsType').value;
		if(unitsType!=''){
			return;
		}
	  if(fieldName=="waste_out.waste_profile"){
	  	var restriction = new Ab.view.Restriction();
	  	var dataSource = View.dataSources.get('abWasteTrackDischargesWasteProfilesDS');
		restriction.addClause("waste_profiles.waste_profile", selectedValue, "=", true);
		var recordProfiles = dataSource.getRecord(restriction);
	  	fillList('abWasteTrackDischargesUnitsTypeListDS','unitsType','bill_type.bill_type_id',recordProfiles.getValue('waste_profiles.units_type'));
		
	  	var typeId=recordProfiles.getValue('waste_profiles.units_type')
	  	var res="bill_unit.bill_type_id='"+typeId+"' and bill_unit.is_dflt='1'";
	  	var dataRes="bill_unit.bill_type_id='"+typeId+"'";
	  	var recordBillUnits=abWasteTrackDischargesController.abWasteTrackDischargesBillUnitsDS.getRecord(res);
	  	var unit=recordBillUnits.getValue('bill_unit.bill_unit_id');
	  	if(recordBillUnits==''){
  		    fillList('abWasteTrackDischargesBillUnitsDS','units','bill_unit.bill_unit_id','',dataRes);
  		}else{
  			fillList('abWasteTrackDischargesBillUnitsDS','units','bill_unit.bill_unit_id',unit,dataRes);
  		}
	  }
  }
    /**
	 * Set value to  units after selected units type
	 * @param fieldName
	 * @param selectedValue
	 * @param previousValue
	 */
  function fillUnit(){
  	var typeSelect = $('unitsType');
  	var type=typeSelect.value;
  	var res="bill_unit.bill_type_id='"+type+"' and bill_unit.is_dflt='1'";
  	var record=abWasteTrackDischargesController.abWasteTrackDischargesBillUnitsDS.getRecord(res);
  	var unit=record.getValue('bill_unit.bill_unit_id');
	var dataRes="bill_unit.bill_type_id='"+type+"'";
  	if(record==''){
  		fillList('abWasteTrackDischargesBillUnitsDS','units','bill_unit.bill_unit_id','',dataRes);
  		}else{
  		  	fillList('abWasteTrackDischargesBillUnitsDS','units','bill_unit.bill_unit_id',unit,dataRes);
  		}
  }

    /**
	 * Set 'units type'and 'units' value on 'Edit Waste Dischargeafter' panel after selected rocord from 'Waste Discharge Details' panel.
	 * @param fieldObj record that be selected.
	 */
    function setListValue(fieldObj){
    	var res=fieldObj.restriction;
    	var recordWasteOut=abWasteTrackDischargesController.abWasteTrackDischargesConsoleDS.getRecord(res);
    	var unitsType=recordWasteOut.getValue('waste_out.units_type');
    	var units=recordWasteOut.getValue('waste_out.units');
    	abWasteTrackDischargesController.quantity=parseFloat(recordWasteOut.getValue('waste_out.quantity'));
    	var detailFrom=abWasteTrackDischargesController.abWasteTrackDischargesEditPanel;
    	    detailFrom.refresh(res,false);
    	abWasteTrackDischargesController.oldStatus=recordWasteOut.getValue('waste_out.status');
    	var unitsTypeDropdown = $('unitsType');
    	var unitsDropdown = $('units');
    	    unitsTypeDropdown.value = unitsType;
    	var dataRes="bill_unit.bill_type_id='"+unitsType+"'";
    	    fillList('abWasteTrackDischargesBillUnitsDS','units','bill_unit.bill_unit_id',units,dataRes);
    	    $('units').disabled=true;
        	$('unitsType').disabled=true;
    }
  function checkDisposition(form,disDs){
	  	var disposition=form.getFieldValue("waste_out.waste_disposition");
	  	var restriction = new Ab.view.Restriction();
  		restriction.addClause('waste_dispositions.disposition_type', 'D');
  		restriction.addClause('waste_dispositions.waste_disposition', disposition);
  		var records=disDs.getRecords(restriction);
  		return records.length>0;
  }
  function checkQuanity(form){
		var quanity=form.getFieldValue('waste_out.quantity');
		return 0.00<quanity;
	}