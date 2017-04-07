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

	afterInitialDataFetch: function(){
		this.abWasteDefMainfestsGrid.show(false);
		////  manully set the export command show='false' to avoid the hidden export panel be showed after exporting, it is required, so do not delete below code
		this.abWasteDefMainfestsGrid.actions.get('exportPDF').command.commands[1].show = false;
	},
	
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
	* Update or save Mainfests record
	*/
	abWasteDefMainfestsForm_onSave: function(){
		if (this.abWasteDefMainfestsForm.canSave()) {
			this.abWasteDefMainfestsForm.save();
			this.abWasteDefMainfestsGrid.refresh();
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
	},

	/**
	 * Set Instruction text and highlight rows after grid refresh.
	 */
	abWasteDefMainfestsGrid_afterRefresh:function(){
		refreshRecordBg(this.abWasteDefMainfestsGrid);
	},
	/**
	* This event handler is called by Generate Selected Manifest(s) button in abWasteRptMainfestsGrid.
	*/
	abWasteDefMainfestsGrid_onGenerateManifestsPdf: function(){
		var  manifestNumbers = this.abWasteDefMainfestsGrid.getPrimaryKeysForSelectedRows();
		if(manifestNumbers.length==0){
			View.showMessage(getMessage("printPdf"));
			return;
		}
		callWfr(manifestNumbers);
	}

});

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
 * Refresh record row background
 * @param gridObj
 * @param activityParamDsObj
 */
function refreshRecordBg(gridObj){
	var callLarge=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_days_call_large_gen']) ;
	var callSmall=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_days_call_small_gen']) ;
	var callNa=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_days_call_na_gen']) ;
	var excLarge=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_days_exc_large_gen']);
	var excSmall=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_days_exc_small_gen']);
	var excNa=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_days_exc_na_gen']);
	var deadLinePct=parseInt(View.activityParameters['AbRiskWasteMgmt-manifest_deadline_warning_pct']);

	//Set instruction for grid
	var instructions = "<span style='font-weight:bold'>"+getMessage("instructionMess1")+"</span>";
	instructions +="<br /><span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("instructionRed1")+"</span>";
	instructions +="<br /><span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("instructionRed2").replace('{0}', callLarge).replace('{1}', callSmall).replace('{2}', callNa)+"</span>";
	instructions +="<br /><span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("instructionRed3").replace('{3}', excLarge).replace('{4}', excSmall).replace('{5}', excNa)+"</span>";
	instructions +="<br /><span style='background-color:#FF9900'>"+getMessage("instructionOrange1")+"</span>";
	instructions +="<br /><span style='background-color:#FF9900'>"+getMessage("instructionOrange2").replace('{0}', callLarge).replace('{1}', callSmall).replace('{2}', callNa)+"</span>";
	instructions +="<br /><span style='background-color:#FFFF00'>"+getMessage("instructionYellow1")+"</span>";
	instructions +="<br /><span style='background-color:#FFFF00'>"+getMessage("instructionYellow2").replace('{6}', deadLinePct)+"</span>";
	instructions +="<br />"+getMessage("instructionMess4");
	gridObj.setInstructions(instructions);  

	var currdate = new Date();
	var rows = gridObj.rows;
	for (var i = 0; i < rows.length; i++) {
		var row=rows[i];
		var dateShipped=row['waste_manifests.date_shipped'];
		var dateFacContact=row['waste_manifests.date_facility_contact'];
		
		var dateShipOffset = -100;
		if(valueExistsNotEmpty(dateShipped)){
			if(row['waste_manifests.date_ship_offset']!=undefined){
				dateShipOffset=parseInt(row['waste_manifests.date_ship_offset']);
				var wasteGeneratorType=row['waste_manifests.waste_generator_type'];
				var cells = row.row.cells;
				if ( ( wasteGeneratorType=='L' && ( (dateShipOffset>=callLarge)&&!dateFacContact||(dateShipOffset>=excLarge)  )  )
					|| ( wasteGeneratorType=='S' && ( (dateShipOffset>=callSmall)&&!dateFacContact||(dateShipOffset>=excSmall)  )  )
					|| ( wasteGeneratorType=='N' && ( (dateShipOffset>=callNa)&&!dateFacContact||(dateShipOffset>=excNa)  )  )
					){
					for(var j=0; j<cells.length; j++) {						
						row.row.dom.childNodes[j].childNodes[0].style.color='#FFFFFF';
						cells.get(j).dom.style.background='#993333';
						cells.get(j).dom.style.fontWeight='bold';
					}
				}
				else if ( ( wasteGeneratorType=='L' && (dateShipOffset>=callLarge)&&dateFacContact )
					|| ( wasteGeneratorType=='S' && ( dateShipOffset>=callSmall)&&dateFacContact )
					|| ( wasteGeneratorType=='N' && ( dateShipOffset>=callNa)&&dateFacContact )
					){
					for(var j=0; j<cells.length; j++) {		
						cells.get(j).dom.style.background='#FF9900';
					}
				}
				else if ( ( wasteGeneratorType=='L' && ( dateShipOffset>=callLarge*deadLinePct/100)&&!dateFacContact  )
					|| ( wasteGeneratorType=='S' && (dateShipOffset>=callSmall*deadLinePct/100)&&!dateFacContact )
					|| ( wasteGeneratorType=='N' && (dateShipOffset>=callNa*deadLinePct/100)&&!dateFacContact )
					){
					for(var j=0; j<cells.length; j++) {		
						cells.get(j).dom.style.background='#FFFF00';
					}
				}
			}
		}		
}
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

/**
 * Add restriction for exported of pdf panel
 * @param panel1 first ,with multipleSelectionEnabled panel name
 * @param panel2 ,export panel name
 * @param messageName ,alert message when no records are selected before print
 * @returns {Boolean}
 */
function setManifestExportRestriction(){
	var gridForm=View.panels.get("abWasteDefMainfestsGrid");
	var command = gridForm.actions.get("exportPDF").command.commands[0];
	var reportForm=View.panels.get("abWasteDefMainfestsExportGrid");
	var records = gridForm.getPrimaryKeysForSelectedRows();
	if(records.length<1){
		//set return value for command chain,
		command.result = false;
		View.alert(getMessage("printPdf"));
		return;
	}
	var restriction = new Ab.view.Restriction();
	var manifestNums=[];
	
	for(i=0;i<records.length;i++){
		manifestNums[i]=records[i]['waste_manifests.manifest_number'];
	}
	restriction.addClause('waste_manifests.manifest_number',manifestNums,'IN');
	reportForm.restriction = restriction;
	command.result = true;
}
//call generator pdf WFR
function callWfr(manifests){
	try {
		var jobId = Workflow.startJob('AbRiskWasteMgmt-WasteService-generateManifestPdf', manifests);
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	    var result=Workflow.getJobStatus(jobId);
	    while (result.jobFinished != true && result.jobStatusCode != 8 ) {
	    	result=Workflow.getJobStatus(jobId);
	    var message=result.jobMessage;
	   if(message.indexOf(".")!=-1){
		   var blank=message.split(".")[1];
		   if(blank!=""){
			   View.showMessage(getMessage("blankWarning").replace('{0}',blank));
		   }
	   }
	    }
	    var genPdf=result.jobMessage;
	    if(genPdf.substring(0,1)=="("){
	    	View.showMessage(getMessage("checkGenId"));
	    }
	} catch (e) {
		Workflow.handleError(e);
	}
}
