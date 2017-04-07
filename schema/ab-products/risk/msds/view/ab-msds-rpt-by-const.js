/**

* @author xianchao
* updated for 22.1 with expanded hierarchy and conditional column display by eric_maxfield@archibus.com

*/
var abRiskMsdsRptByConController = View.createController('abRiskMsdsRptByConController',
{
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(['msds_chemical.chemical_id'], ['msds_chemical.alias','like']
	, ['msds_chemical.tier2'], ['msds_chemical.cas_number']
	, ['msds_chemical.un_number'], ['msds_chemical.ec_number']
	, ['msds_chemical.icsc_number'], ['msds_chemical.rtecs_number']
	, ['msds_data.ghs_id'], ['msds_data.product_name']
	, ['msds_data.chemical_name'], ['msds_data.manufacturer_id']),
	/**
	 * Show grid by console restriction
	 */
	abRiskMsdsRptByConConsole_onShow: function(){
		var res = getRestrictionStrFromConsole(this.abRiskMsdsRptByConConsole, this.fieldsArraysForRestriction);
		var proId=this.abRiskMsdsRptByConConsole.getFieldValue('provider_id');
		if(proId){
			proId = convert2SafeSqlString(proId);
			res=res+" and (msds_data.distributor_id='"+proId+"' or  msds_data.manufacturer_id='"+proId+"' or  msds_data.preparer_id='"+proId+"')";
		}
		this.abRiskMsdsRptByConGrid.refresh(res);
		this.abRiskMsdsRptByConGridLoc.show(false);
	}	
});


//after click con 
function clickCon(){
	var grid = abRiskMsdsRptByConController.abRiskMsdsRptByConGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var res = '1=1';
	var msdsId = rows[num]['msds_constituent.msds_id'];
	var chemicalId=rows[num]['msds_constituent.chemical_id'];
	var res=new Ab.view.Restriction();
	//res.addClause('msds_location.msds_id', msdsId);
	res.addClause('msds_constituent.chemical_id', chemicalId);
		
	/**
	 * Only show columns if they contain content for any cell in the column.
	 */	
	var originalAfterRefresh = abRiskMsdsRptByConController.abRiskMsdsRptByConGridLoc.afterRefresh; 
	abRiskMsdsRptByConController.abRiskMsdsRptByConGridLoc.afterRefresh = function(){
		var gridPanel=abRiskMsdsRptByConController.abRiskMsdsRptByConGridLoc;
		var columns = gridPanel.getColumns();
		//hide all columns initially
		for(var i=0; i<columns.length; i++){
			var columnId = columns[i].id;
			gridPanel.hideColumn(columnId);
		}
		for(var i=0; i<columns.length; i++){
			var columnId = columns[i].id;
			gridPanel.gridRows.each(function(row) {
				var rowRecord = row.getRecord();								
				// Show columns if they have useful content to display.  Only show units columns if their companion quantity field shows.
				if(valueExistsNotEmpty(rowRecord.values[columnId]) && columnId != 'msds_location.temperature_units'
						&& columnId != 'msds_location.quantity_units'){						
					if(columnId=='msds_location.temperature'){
						gridPanel.showColumn('msds_location.temperature_units');
					}
					else if(columnId=='msds_location.quantity'){
							if(rowRecord.values[columnId] > 0){
								gridPanel.showColumn('msds_location.quantity_units');
								gridPanel.showColumn(columnId);
							}
					}
					else if(columnId=='msds_location.num_containers'){
							if(rowRecord.values[columnId] > 1){
								gridPanel.showColumn(columnId);
							}
					}
					else{
						gridPanel.showColumn(columnId);
					}
				}
			});
		};	
		//hide the autonumber id and units type columns because they do not provide much value to the user
		gridPanel.hideColumn('msds_location.auto_number');
		gridPanel.hideColumn('msds_location.quantity_units_type');
		
		abRiskMsdsRptByConController.abRiskMsdsRptByConGridLoc.afterRefresh=originalAfterRefresh;
		gridPanel.update();		
	}
	abRiskMsdsRptByConController.abRiskMsdsRptByConGridLoc.refresh(res)	
}