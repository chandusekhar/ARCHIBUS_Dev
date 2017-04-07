/**
 * @author Lei
 */

var abWasteRptHazStorageController = View.createController('abWasteRptHazStorageController', {
	
	afterInitialDataFetch: function(){
		this.resetStatusOption();
		this.abWasteRptHazStorageWasteDetailGridExport.show(false);
		////  manully set the export command show='false' to avoid the hidden export panel be showed after exporting, it is required, so do not delete below code
		this.abWasteRptHazStorageWasteDetailGrid.actions.get('exportPDF').command.commands[1].show = false;
	},
	/**
	 * reset status field select option in console
	 */
	resetStatusOption : function() {
		// get the select option dom element
		var filedEl = this.abWasteRptHazStorageWasteAreaConsole.getFieldElement('waste_areas.area_type');
		// stored current options to varible tempOptions,and exclude 'Generated'
		var tempOptions = [];
		for ( var i = 0; i < filedEl.options.length; i++) {
			if (filedEl.options[i].value != 'A') {
				tempOptions.push(filedEl.options[i])
			}
		}

		// delete all current options
		while (filedEl.options.length != 0) {
			filedEl.remove(0);
		}
		// add other options
		for ( var i = 0; i < tempOptions.length; i++) {
			filedEl.options.add(tempOptions[i]);
		}
		filedEl.options.selectedIndex=0;
	},
	/**
	 * Show waste out details when we click waste details button on abWasteRptHazStorageWasteDetailGrid grid row
	 */
	abWasteRptHazStorageWasteDetailGrid_wasteDetail_onClick: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var waste_id = record.getValue("waste_out.waste_id");

		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}
		var panel=this.abWasteShipmentForm;
		panel.refresh(restriction);
		panel.show(true);
		panel.showInWindow({
			width: 1100,
			height: 500,
			closeButton: false
		});
	},
	
	/**
	 * Set Instruction after grid refresh.
	 */
	abWasteRptHazStorageWasteDetailGrid_afterRefresh:function(){
		//Set instruction for grid
		setInstruction(this.abWasteRptHazStorageWasteDetailGrid);
		refreshRecordBg(this.abWasteRptHazStorageWasteDetailGrid);
	},
	
	/**
	 * Export current waste detail to paginate report 
	 */
	abWasteShipmentForm_onExportPaginate: function(){
		var restriction = new Ab.view.Restriction();
		var waste_id = this.abWasteShipmentForm.getFieldValue("waste_out.waste_id");
		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}

		var parameters = {
				 'printRestriction':false, 
				 'printableRestriction':[]
		};
		
		//generate paginated report
		View.openPaginatedReportDialog('ab-waste-rpt-haz-storage-paginate.axvw',{
			'abWasteStorageFormDS': restriction 
		}, parameters);
	}
})

/**
 * Set Instruction for grid
 * @param grid,grid object
 */
function setInstruction(grid){
	 var instructions = "<span style='font-weight:bold'>"+getMessage("instructionMess1")+"</span>";
//	    instructions +="<br /><span style='background-color:#F04000'>"+getMessage("instructionMess2")+" "+View.activityParameters['AbRiskWasteMgmt-haz_days_large_gen']+" "+"</span>";
//	    instructions +="<span style='background-color:#F04000'>"+getMessage("instructionMess3")+" "+View.activityParameters['AbRiskWasteMgmt-haz_days_small_gen']+" "+getMessage('instructionMess4')+"</span>";
//	    instructions +="<span style='background-color:#F04000'>"+getMessage("instructionMess5")+"</span>";
//	    instructions +="<br /><span style='background-color:#FC6'>"+getMessage("instructionMess6")+"</span>";
//	    instructions +="<span style='background-color:#FC6'>"+" "+View.activityParameters['AbRiskWasteMgmt-haz_days_deadline']+" "+getMessage("instructionMess7")+"</span>";
	    instructions +="<br /><span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("instructionMessage1")+"</span>";
	    instructions +="<br /><span style='background-color:#FFCC66'>"+getMessage("instructionMessage2")+"</span>";
	    grid.setInstructions(instructions);  
}
/**
 * Refresh record row background
 * @param gridObj
 * @param activityParamDsObj
 */
function refreshRecordBg(gridObj){
	var paramValueLarge=parseInt(View.activityParameters['AbRiskWasteMgmt-haz_days_large_gen']) ;
	var paramValueSmall=parseInt(View.activityParameters['AbRiskWasteMgmt-haz_days_small_gen']) ;
	var paramValueNa=parseInt(View.activityParameters['AbRiskWasteMgmt-haz_days_na_gen']);
	var paramValueDeadLine=parseInt(View.activityParameters['AbRiskWasteMgmt-haz_days_deadline']);
	
	
	var currdate = new Date();
	var rows = gridObj.rows;
	for (var i = 0; i < rows.length; i++) {
		var row=rows[i];
		var date_end=row['waste_out.date_end'];
		var date_start=row['waste_out.date_start'];
		var dateEndDiff='-100000';
		if(valueExistsNotEmpty(date_end)){
			if(row['waste_out.generationdatedayoffset.raw']!=undefined){
				dateEndDiff=parseInt(row['waste_out.generationdatedayoffset.raw']);
			}else{
				dateEndDiff=parseInt(row['waste_out.generationdatedayoffset']);
			}
		}
		var dateStartDiff='-100000';
		if(valueExistsNotEmpty(date_start)){
			if(row['waste_out.startdatedayoffset.raw']!=undefined){
				dateStartDiff=parseInt(row['waste_out.startdatedayoffset.raw']);
			}else{
				dateStartDiff=parseInt(row['waste_out.startdatedayoffset']);
			}
			
		}
		
		var generatorType=row['waste_generators.type.raw'];
		if(generatorType==undefined||generatorType=='N'){
			generatorType='N/A';
		}
		if(row['waste_areas.area_type.raw']=='S'){
			addColorLegend(rows[i],dateStartDiff,paramValueLarge,paramValueSmall,paramValueNa,paramValueDeadLine,generatorType);
		}else if(row['waste_areas.area_type.raw']=='T'){
			addColorLegend(rows[i],dateStartDiff,paramValueLarge,paramValueSmall,paramValueNa,paramValueDeadLine,generatorType);
		}else if(row['waste_areas.area_type.raw']==undefined){
			Ext.get(rows[i].row.dom).setStyle('background-color', '#993333');
			Ext.get(rows[i].row.dom).setStyle('color', '#FFFFFF');
			Ext.get(rows[i].row.dom).setStyle('fontWeight', 'bold');
			addColorLegendToCells(rows[i], '#993333', '#FFFFFF', 'bold');
		}
	}
}

/**
 * Add legend for grid by waste_areas.area_type
 * @param rowsI,rows[i] is a row object
 * @param datediff, when ['waste_areas.area_type.raw']=='S'|,datediff=dateEndDiff|datediff=dateStartDiff|
 * @param paramValueLarge,activity parameter
 * @param paramValueSmall,activity parameter
 * @param paramValueDeadLine,activity parameter
 * @param generatorType
 */
function addColorLegend(rowsI,datediff,paramValueLarge,paramValueSmall,paramValueNa,paramValueDeadLine,generatorType){
	//1

	if((datediff>paramValueLarge&&generatorType=='L')||(datediff=='-100000'&&generatorType=='L')||(paramValueLarge==0&&generatorType=='L')){
		Ext.get(rowsI.row.dom).setStyle('background-color', '#993333');
		Ext.get(rowsI.row.dom).setStyle('color', '#FFFFFF');
		Ext.get(rowsI.row.dom).setStyle('fontWeight', 'bold');
		addColorLegendToCells(rowsI, '#993333', '#FFFFFF', 'bold');
	}
	if(datediff>paramValueLarge-paramValueDeadLine&&datediff<=paramValueLarge&&generatorType=='L'){
		Ext.get(rowsI.row.dom).setStyle('background-color', '#FFCC66');
		addColorLegendToCells(rowsI, '#FFCC66', null, null);
	}

	//2
	if((datediff>paramValueSmall&&generatorType=='S')||(generatorType=='S'&&datediff=='-100000')||(paramValueSmall==0&&generatorType=='S')){
		Ext.get(rowsI.row.dom).setStyle('background-color', '#993333');
		Ext.get(rowsI.row.dom).setStyle('color', '#FFFFFF');
		Ext.get(rowsI.row.dom).setStyle('fontWeight', 'bold');
		addColorLegendToCells(rowsI, '#993333', '#FFFFFF', 'bold');
	}
	
	if(datediff>paramValueSmall-paramValueDeadLine&&datediff<=paramValueSmall&&generatorType=='S'){
		Ext.get(rowsI.row.dom).setStyle('background-color', '#FFCC66');
		addColorLegendToCells(rowsI, '#FFCC66', null, null);
	}
	
	//3
	if((datediff>paramValueNa&&generatorType=='N/A')||(generatorType=='N/A'&&datediff=='-100000')||(paramValueNa==0&&generatorType=='N/A')){
		Ext.get(rowsI.row.dom).setStyle('background-color', '#993333');
		Ext.get(rowsI.row.dom).setStyle('color', '#FFFFFF');
		Ext.get(rowsI.row.dom).setStyle('fontWeight', 'bold');
		addColorLegendToCells(rowsI, '#993333', '#FFFFFF', 'bold');
	}
	
	if(datediff>paramValueNa-paramValueDeadLine&&datediff<=paramValueNa&&(generatorType=='N/A')){
		Ext.get(rowsI.row.dom).setStyle('background-color', '#FFCC66');
		addColorLegendToCells(rowsI, '#FFCC66', null, null);
	}
	
}
/**
 * Add style to cells also.
 * @param row
 * @param bgColor
 * @param color
 * @param fontWeight
 */
function addColorLegendToCells(row, bgColor, color, fontWeight){
	row.row.cells.each(function(cell){
		if (valueExistsNotEmpty(bgColor)) {
			Ext.get(cell.dom).setStyle('background-color', bgColor);
		}
		if (valueExistsNotEmpty(color)) {
			Ext.get(cell.dom).setStyle('color', color);
		}
		if (valueExistsNotEmpty(fontWeight)) {
			Ext.get(cell.dom).setStyle('fontWeight', fontWeight);
		}
	});
}
/**
 * This event handler is called by onclick selectValue of storage_location.
 */
function selectArea() {
	var res="waste_areas.area_type!='A'"
	var areaType=abWasteRptHazStorageController.abWasteRptHazStorageWasteAreaConsole.getFieldValue("waste_areas.area_type");
	if(areaType!=""){
		res=res+" and waste_areas.area_type='"+areaType+"'"
	}
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
		formId: 'abWasteRptHazStorageWasteAreaConsole',
		title: getMessage("areaTitle"),
		fieldNames: [ 'waste_out.storage_location','waste_out.site_id' ],
		selectTableName: 'waste_areas',
		selectFieldNames: ['waste_areas.storage_location', 'waste_areas.site_id' ],
		visibleFields: [
		                {fieldName: 'waste_areas.storage_location', title: getMessage('areaTitle')},
		                {fieldName: 'waste_areas.area_type'},
		                {fieldName: 'waste_areas.site_id' }
		                ],
		                applyFilter: true,
		                restriction: res,
		                showIndex: false,
		                selectValueType: 'grid',
		                sortValues: toJSON(sortValues)
	});
}

