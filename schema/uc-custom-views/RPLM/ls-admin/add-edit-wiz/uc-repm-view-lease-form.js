var ROCntrl = View.createController('roController', {
  // afterViewLoad: function(){
   afterInitialDataFetch: function(){
		//Used by screens JS when it programmatically changes the fields to editable
		viewOnly = true;
		for(var i=0,len=View.panels.length;i<len;i++){
			var pnl = View.panels.get(i)
			if (pnl.type == "form" && !pnl.isConsole) {
				setPanelFieldsReadOnly(pnl)
				
				manualHideButton($('abRepmAddEditLeaseInABuildingLeaseInfo_form_autoSelAcctBtn'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part1'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part2'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part3'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part4'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part5'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part6'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part7'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingLeaseInfo_form_ac_id_part8'));
				
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part1'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part2'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part3'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part4'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part5'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part6'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part7'));
				manualReadOnlyField($('abRepmAddEditLeaseInABuildingBaseRentsEdit_form_ac_id_part8'));					
				
				
				
				
				
				manualHideButton($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_autoSelAcctBtn'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part1'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part2'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part3'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part4'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part5'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part6'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part7'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyLeaseInfo_form_ac_id_part8'));			

				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part1'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part2'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part3'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part4'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part5'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part6'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part7'));
				manualReadOnlyField($('abRepmAddEditLeaseInAPropertyBaseRentsEdit_form_ac_id_part8'));		
				
			
			
			};
			setPanelSaveAddHidden(pnl);
			if (pnl.type == "grid") {setPanelEditandDelete(pnl)};

		}
	}
});

function manualHideButton(fldDom){
	if (fldDom) {fldDom.style.display="none";}
}

function manualReadOnlyField(fldDom){
	if (fldDom) {
		var act=fldDom.nextSibling;
		if(act){
			act.style.width='0px';
		}
		fldDom.style.border="0px";
		fldDom.style.backgroundColor="#FAFAFE";
		fldDom.readOnly=true;
		fldDom.disabled=true;
	}
}

function setPanelFieldsReadOnly(pnl){
	if(typeof pnl=='string'){pnl=View.panels.get(pnl);}
	for(var i=0,len=pnl.fields.getCount();i<len;i++){
		var fld=pnl.fields.get(i);
		if (fld.fieldDef.isEnum){
			fld.config.readOnly = true;
		}
		else if (fld.fieldDef.isDocument) {
			fld.config.readOnly = true;
		}
		else {
			var fldDom=pnl.getFieldElement(fld.getId());
			if((fldDom)&&(fldDom.tagName!="span")){
				manualReadOnlyField(fldDom);
			}
		}
	}
	
}


function setPanelSaveAddHidden(pnl){
	if(typeof pnl=='string'){pnl=View.panels.get(pnl);}
	for(var i=0,len=pnl.actions.length;i<len;i++){
		var btn=pnl.actions.get(i);
		var btnID = btn.id.toLowerCase();
		
		if (!(btnID.replace('save','') == btnID && btnID.replace('new','') == btnID && btnID.replace('delete','') == btnID && btnID.replace('add','') == btnID) || btnID == 'chrgagreements'){
			btn.button.hide();
		}
		
		
	}

}

function setPanelEditandDelete(pnl){
	if(typeof pnl=='string'){pnl=View.panels.get(pnl);}
	for(var i=0,len=pnl.columns.length;i<len;i++){
		if (pnl.columns[i].type=="button"){
			var pnlId = pnl.columns[i].id.toLowerCase();
			if (pnlId.replace("delete","") != pnlId){pnl.hideColumn(pnl.columns[i].id);}
			if (pnlId.replace("edit","") != pnlId){
				if (pnl.id == "scheduledCostGrid" || pnl.id == "recurringCostGrid") {
					pnl.columns[i].hidden=true;
				}
				else {
					pnl.columns[i].text = "View";
				}
			}
			
		}
		
		
	}

}
