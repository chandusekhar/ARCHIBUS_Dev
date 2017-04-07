/**
 * @song
 */
var abRiskMsdsInventoryController = View.createController('abRiskMsdsInventoryController', {
	/**
	 * all the view dataSource parameters for paginated report use.
	 */
	locationRes: '1=1',
	
	classificationRes: '1=1',
	
	ntier2Res: ' 1=1 ',
	
	dateStart: '1900-01-01',
	
	dateEnd: '2200-01-01',
	
	afterViewLoad : function() {
		// set the all tree level as multi-selected
		this.abRiskMsdsClassificationsTree.setMultipleSelectionEnabled(0);
		this.abRiskMsdsClassificationsTree.setMultipleSelectionEnabled(1);
		this.abRiskMsdsClassificationsTree.setMultipleSelectionEnabled(2);
		
		//override '-9999999' entries for days on site with "Unknown" message
		var unknownString = getMessage('unknownString');
		this.abRiskMsdsSummaryReport.afterCreateCellContent = function(row, column, cellElement) {
	        var onSiteDays = (row['msds_chemical.onSiteDays.raw'] != undefined) ? row['msds_chemical.onSiteDays.raw'] : row['msds_chemical.onSiteDays'];
				if (column.id == 'msds_chemical.onSiteDays')	{
					if (onSiteDays == '-9999999')	{
						cellElement.children[0].firstChild.data = unknownString;
					}
	    	}
		}
		//set filter date_end to today's date by default
		var today = new Date();
		this.abRiskMsdsFilterPanel.setFieldValue('msds_h_location.date_end', today);
	},

	/**
	 * hand when click unselect button.
	 */
	abRiskMsdsClassificationsTree_onUnselectAll : function() {
		this.abRiskMsdsClassificationsTree.unselectAll();
	},
		
	/**
	 * click tree node.
	 */
	onClickCtryNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var ctry_id = node.data['ctry.ctry_id'];
		var restriction = " exists (select 1 from site where site.site_id=msds_h_location.site_id and site.ctry_id = '"+ctry_id+"')";
		this.onLocationChange(restriction);
	},
	/**
	 * click tree node.
	 */
	onClickStateNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var state_id = node.data['state.state_id'];
		var restriction = " exists (select 1 from site where site.site_id=msds_h_location.site_id and site.state_id = '"+state_id+"')";
		this.onLocationChange(restriction);
	},
	/**
	 * click tree node.
	 */
	onClickCityNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var city_id = node.data['city.city_id'];
		var restriction = "  exists (select 1 from site where site.site_id=msds_h_location.site_id and site.city_id = '"+city_id+"')";
		this.onLocationChange(restriction);
	},
	/**
	 * click tree node.
	 */
	onClickSiteNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var site_id = node.data['site.site_id'];
		var restriction = " msds_h_location.site_id = '"+site_id+"'";
		this.onLocationChange(restriction);
	},
	/**
	 * click tree node.
	 */
	onClickBlNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var bl_id = node.data['bl.bl_id'];
		var restriction = " msds_h_location.bl_id = '"+bl_id+"'";
		this.onLocationChange(restriction);
	}, 
	/**
	 * click tree node.
	 */
	onClickFlNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var fl_id = node.data['fl.fl_id'];
		var bl_id = node.data['fl.bl_id'];
		var restriction = " msds_h_location.fl_id = '"+fl_id+"' and msds_h_location.bl_id = '"+bl_id+"'";
		this.onLocationChange(restriction);
	},
	/**
	 * click tree node.
	 */
	onClickRmNode: function(){
		var objTree = this.abRiskMsdsDefMsdsCtryTree;
		var node = objTree.lastNodeClicked;
		var bl_id = node.data['rm.bl_id'];
		var fl_id = node.data['rm.fl_id'];
		var rm_id = node.data['rm.rm_id'];
		var restriction = " msds_h_location.bl_id = '"+bl_id+"' and msds_h_location.fl_id = '"+fl_id+"' and msds_h_location.rm_id = '"+rm_id+"'";
		this.onLocationChange(restriction);
	},
	/**
	 * a common method filter by location.
	 * restriction like [and site.ctry_id = '"+state_id+"']
	 */
	onLocationChange: function(restriction){
		this.locationRes= restriction;
		this.abRiskMsdsSummaryReport.addParameter('locationRes', restriction);
		this.abRiskMsdsSummaryReportPopUpPanel.addParameter('locationRes', restriction);
		this.abRiskMsdsSummaryReport.refresh();
	
	},

	/**
	 * handle when click tree button after you select 'Classifications' tree node.
	 */
	abRiskMsdsClassificationsTree_onShowSelected: function(){

		var hazardSystemNode = this.abRiskMsdsClassificationsTree.getSelectedNodes(0);
		var classNodes = this.abRiskMsdsClassificationsTree.getSelectedNodes(1);
		var categoryNodes = this.abRiskMsdsClassificationsTree.getSelectedNodes(2);
		
		var restriction = " 1=1 AND EXISTS (SELECT 1 FROM msds_haz_classification WHERE msds_haz_classification.msds_id=msds_h_location.msds_id ";
		
		if(hazardSystemNode!=null&&hazardSystemNode.length>0){
			var systemIds = this.getMultipleInSqlFromTreeNodes("msds_hazard_system.hazard_system_id",hazardSystemNode);
			restriction+="and msds_haz_classification.hazard_system_id in ("+systemIds+")";
		}
		if(classNodes!=null&&classNodes.length>0){
			var classIds = this.getMultipleInSqlFromTreeNodes("msds_hazard_class.hazard_class_id",classNodes);
			restriction+="and msds_haz_classification.hazard_class_id in ("+classIds+")";
		}
		if(categoryNodes!=null&&categoryNodes.length>0){
			var categoryIds = this.getMultipleInSqlFromTreeNodes("msds_hazard_category.hazard_category_id",categoryNodes);;
			restriction+="and msds_haz_classification.hazard_category_id in ("+categoryIds+")";
		}
		
		restriction += ")";

		this.classificationRes= restriction;
		this.abRiskMsdsSummaryReport.addParameter('classificationRes', restriction);
		this.abRiskMsdsSummaryReportPopUpPanel.addParameter('classificationRes', restriction);
		this.abRiskMsdsSummaryReport.refresh();
	},

	/**
	 * show button click filter the report[panel4].
	 */
	abRiskMsdsFilterPanel_onFilter: function(){

		var tier2Ids = this.abRiskMsdsFilterPanel.getFieldMultipleValues('msds_chemical.tier2');		
		if(tier2Ids.length>0 && tier2Ids[0] != undefined && tier2Ids[0] != ""){
			var ids = "";
			for ( var i=0; i<tier2Ids.length; i++) {
				if(i>0){
					ids+=",";
				}
				ids+="'"+convert2SafeSqlString(tier2Ids[i])+"'";				
			}			
			this.ntier2Res=" msds_chemical.tier2 IN (" + ids + ") ";
		} else{
			this.ntier2Res= "  1=1 ";
		}

		var date_start = this.abRiskMsdsFilterPanel.getFieldValue('msds_h_location.date_start');
		var date_end = this.abRiskMsdsFilterPanel.getFieldValue('msds_h_location.date_end');
		if(!checkDate(date_start,date_end)){
			View.showMessage(getMessage("wrongDate"));
			return;
		}
		if(valueExistsNotEmpty(date_start)){
			this.dateStart=date_start;
			this.abRiskMsdsSummaryReport.addParameter('dateStart', date_start);
			this.abRiskMsdsSummaryReportPopUpPanel.addParameter('dateStart', date_start);
		}
		if(valueExistsNotEmpty(date_end)){
			this.dateEnd=date_end;
			this.abRiskMsdsSummaryReport.addParameter('dateEnd', date_end);
			this.abRiskMsdsSummaryReportPopUpPanel.addParameter('dateEnd', date_end);
		}
		this.abRiskMsdsSummaryReport.addParameter('ntier2Res', this.ntier2Res);
		this.abRiskMsdsSummaryReportPopUpPanel.addParameter('ntier2Res', this.ntier2Res);
		this.abRiskMsdsSummaryReport.refresh();
	},
	
	/**
	 * Display custom titles for Approximate Total Mass, Approximate Total Volume and Approximate Total Container Volume columns
	 */
	abRiskMsdsSummaryReport_afterRefresh: function(){
		var massUnit = "";
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill_unit.bill_type_id', 'MSDS - MASS', '=');
		var unitRecord = this.abRiskMsdsSummaryReportBillUnit.getRecord(restriction);
		if(unitRecord){
			massUnit = " (" + unitRecord.getValue("bill_unit.bill_unit_id") + ")";
		}

		//for XLS export
		this.abRiskMsdsSummaryReport.getFieldDef("msds_chemical.sumQuantityMass").title = getMessage("totalProductMass") + massUnit;
		//for grid display
		this.abRiskMsdsSummaryReport.setFieldLabel('msds_chemical.sumQuantityMass', getMessage("totalProductMass") + massUnit);
		
		var volumeUnit = "";
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill_unit.bill_type_id', 'MSDS - VOLUME', '=');
		var unitRecord = this.abRiskMsdsSummaryReportBillUnit.getRecord(restriction);
		if(unitRecord){
			volumeUnit = " (" + unitRecord.getValue("bill_unit.bill_unit_id") + ")";
		}
		
		//for XLS export
		this.abRiskMsdsSummaryReport.getFieldDef("msds_chemical.sumQuantityVolume").title = getMessage("totalProductVolume") + volumeUnit;
		//for grid display
		this.abRiskMsdsSummaryReport.setFieldLabel('msds_chemical.sumQuantityVolume', getMessage("totalProductVolume") + volumeUnit);
		
		//for XLS export
		this.abRiskMsdsSummaryReport.getFieldDef("msds_chemical.sumContainerSize").title = getMessage("totalContainerVolume") + volumeUnit;
		//for grid display
		this.abRiskMsdsSummaryReport.setFieldLabel('msds_chemical.sumContainerSize', getMessage("totalContainerVolume") + volumeUnit);
	},
	
	/**
	 * when click one report link, show pop-up details panel.
	 */
	showPopUpPanel: function(){
	    var grid = this.abRiskMsdsSummaryReport;
	    var rowIndex = grid.rows[grid.selectedRowIndex];
	    var chemical_id = rowIndex["msds_chemical.chemical_id"];
		var restriction = "exists (select 1 from msds_constituent, msds_chemical " +
				"where msds_h_location.msds_id = msds_constituent.msds_id " +
				"and msds_constituent.chemical_id = msds_chemical.chemical_id " +
				"and msds_chemical.chemical_id ='"+chemical_id+"' and ${parameters['ntier2Res']})";

		this.abRiskMsdsSummaryReportPopUpPanel.addEventListener('afterRefresh', hideScroll, this);
		this.abRiskMsdsSummaryReportPopUpPanel.refresh(restriction);
		this.abRiskMsdsSummaryReportPopUpPanel.showInWindow({
			width: 800,
			height: 500
		});
	},
	/**
	 * Export current data to paginate report 
	 */
	abRiskMsdsSummaryReport_onExportPaginate: function(){
		var restriction = new Ab.view.Restriction();

		var parameters = {
				 'locationRes':this.locationRes, 
				 'classificationRes':this.classificationRes,
				 'ntier2Res':this.ntier2Res,
				 'dateStart':this.dateStart,
				 'dateEnd':this.dateEnd, 

				 'printRestriction':true, 
				 'printableRestriction':[]
		};
		
		//generate paginated report,like 'ab-viewdef-paginated-parent-child.axvw'
		View.openPaginatedReportDialog('ab-msds-rpt-inventory-paginated.axvw',null, parameters);
	},

	getMultipleInSqlFromTreeNodes: function(key, nodes){
		var ids = "";
		for ( var i = 0; i < nodes.length; i++) {
			var id = nodes[i].data[key];
			ids+="'"+id+"'"+",";
		}
		return ids.substring(0,ids.length-1);
	}
});
/**
 * custom code remove scrollbar when pop-up details panel.
 */
function hideScroll(){
	document.getElementById("abRiskMsdsSummaryReportPopUpPanel").style.overflow=''; 
}


function setTheRawValue(fieldName, selectedValue, previousValue, selectedValueRaw) {
	var form = abRiskMsdsInventoryController.abRiskMsdsFilterPanel;
	form.setFieldValue(fieldName,selectedValue);
	return false;
}

function checkDate(dateStart, dateEnd) {
	if(dateStart && dateEnd && dateStart>dateEnd){
		return false;
	}
	return true;
}
