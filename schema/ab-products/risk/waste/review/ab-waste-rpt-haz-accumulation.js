/**
 * @author chao
 */

var abWasteRptHazAccumController = View.createController('abWasteRptHazAccumController', {
	
	afterInitialDataFetch: function(){
		this.abWasteRptHazAccumWasteDetailGridExport.show(false);
		////  manully set the export command show='false' to avoid the hidden export panel be showed after exporting, it is required, so do not delete below code
		this.abWasteRptHazAccumWasteDetailGrid.actions.get('exportPDF').command.commands[1].show = false;
	},
	/**
	 * Show waste out details when we click waste details button on abWasteRptHazAccumWasteDetailGrid grid row
	 */
	abWasteRptHazAccumWasteDetailGrid_wasteDetail_onClick: function(row){
		
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
			width: 1300,
			height: 700,
			closeButton: false
		});
	},
	
	/**
	 * Set Instruction after grid refresh.
	 */
	abWasteRptHazAccumWasteDetailGrid_afterRefresh:function(){
		//Set instruction for grid
		setInstruction(this.abWasteRptHazAccumWasteDetailGrid);
		refreshRecordBg(this.abWasteRptHazAccumWasteDetailGrid);
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
		View.openPaginatedReportDialog('ab-waste-rpt-haz-accumulation-paginate.axvw',{
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
	    instructions +="<br /><span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("instructionMess2")+" "+View.activityParameters['AbRiskWasteMgmt-satellite_days_accum_limit']+" "+getMessage('instructionMess3')+" "+"</span>";
	    instructions +="<span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+View.activityParameters['AbRiskWasteMgmt-satellite_volume_limit']+" "+getMessage("instructionMess5")+" "+View.activityParameters['AbRiskWasteMgmt-satellite_days_full_limit']+" "+getMessage('instructionMess4')+"</span>";
	    instructions +="<br /><span style='background-color:#FFCC66'>"+getMessage("instructionMess6")+"</span>";
	    instructions +="<span style='background-color:#FFCC66'>"+" "+View.activityParameters['AbRiskWasteMgmt-satellite_days_deadline']+" "+getMessage("instructionMess7")+"</span>";
	    grid.setInstructions(instructions);  
}
/**
 * Refresh record row background
 * @param gridObj
 * @param activityParamDsObj
 */
function refreshRecordBg(gridObj){
	var accumDays=parseInt(View.activityParameters['AbRiskWasteMgmt-satellite_days_accum_limit']) ;
	var volume=parseInt(View.activityParameters['AbRiskWasteMgmt-satellite_volume_limit']) ;
	var fullDays=parseInt(View.activityParameters['AbRiskWasteMgmt-satellite_days_full_limit']);
	var deadlineDays=parseInt(View.activityParameters['AbRiskWasteMgmt-satellite_days_deadline']);
	
	var currdate = new Date();
	var rows = gridObj.rows;
	for (var i = 0; i < rows.length; i++) {
		var row=rows[i];
		var date_end=row['waste_out.date_end'];
		var date_start=row['waste_out.date_start'];
		var unitsType=row['waste_out.units_type'];
		var units=row['waste_out.units'];
		var quantity=0;
		if(row['waste_out.quantity.raw']!=undefined){
			quantity=row['waste_out.quantity.raw'];
		}else{
			quantity=row['waste_out.quantity'];
		}
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
		var gallonsQuantity=getGallonQuantity(unitsType,units,quantity);
		if(dateStartDiff>=(accumDays-deadlineDays)){
			Ext.get(rows[i].row.dom).setStyle('background-color', '#FFCC66');
			addColorLegendToCells(rows[i], '#FFCC66', null, null);
		}
		if(dateStartDiff>=accumDays || (unitsType=='VOLUME-LIQUID'&& gallonsQuantity>=volume) || (dateEndDiff>=fullDays && gallonsQuantity>=volume)){
			Ext.get(rows[i].row.dom).setStyle('background-color', '#993333');
			Ext.get(rows[i].row.dom).setStyle('color', '#FFFFFF');
			Ext.get(rows[i].row.dom).setStyle('fontWeight', 'bold');
			addColorLegendToCells(rows[i], '#993333', '#FFFFFF', 'bold');
		}
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


function getGallonQuantity(unitsType,units,quantity ){
	var unitDs=abWasteRptHazAccumController.abWasteRptHazAccumUnitsDS;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bill_unit.bill_type_id','VOLUME-LIQUID', '=');
	restriction.addClause('bill_unit.bill_unit_id','gallon', '=');
	var gallonsRecord=unitDs.getRecord(restriction);
	var gallonsFactor=gallonsRecord.getValue('bill_unit.conversion_factor');
	restriction.addClause('bill_unit.bill_type_id',unitsType, '=');
	restriction.addClause('bill_unit.bill_unit_id',units, '=');
	var unitsRecord=unitDs.getRecord(restriction);
	var unitsFactor=unitsRecord.getValue('bill_unit.conversion_factor');
	var gallonsQuantity=quantity*gallonsFactor/unitsFactor;
	return gallonsQuantity;
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
		formId: 'abWasteRptHazAccumWasteAreaConsole',
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
		                showIndex: false,
		                selectValueType: 'grid',
		                restriction: "waste_areas.area_type='A'",
		                sortValues: toJSON(sortValues)
	});
}
