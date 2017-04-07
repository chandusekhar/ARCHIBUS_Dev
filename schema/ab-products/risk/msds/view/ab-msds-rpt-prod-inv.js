/**
 * @song
 */
var abRiskMsdsInventoryController = View.createController('abRiskMsdsInventoryController', {
	/**
	 * all the view dataSource parameters for paginated report use.
	 */
	locationRes: '1=1',
	
	classificationRes: '1=1',
		
	dateStart: '',
	
	dateEnd: '',
	
	afterViewLoad : function() {
		// set the all tree level as multi-selected
		this.abRiskMsdsClassificationsTree.setMultipleSelectionEnabled(0);
		this.abRiskMsdsClassificationsTree.setMultipleSelectionEnabled(1);
		this.abRiskMsdsClassificationsTree.setMultipleSelectionEnabled(2);		

	
		//override '-9999999' entries for days on site with "Unknown" message
		var unknownString = getMessage('unknownString');
		this.abRiskMsdsSummaryReport.afterCreateCellContent = function(row, column, cellElement) {
	        var onSiteDays = (row['msds_data.onSiteDays.raw'] != undefined) ? row['msds_data.onSiteDays.raw'] : row['msds_data.onSiteDays'];
				if (column.id == 'msds_data.onSiteDays')	{
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
		var restriction = " exists (select 1 from site where site.site_id=msds_h_location.site_id and site.ctry_id = '"+ctry_id+"')"
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
		this.abRiskMsdsFilterPanel_onFilter();	
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
		this.abRiskMsdsSummaryReport.refresh();
	},

	/**
	 * show button click filter the report[panel4].
	 */
	abRiskMsdsFilterPanel_onFilter: function(){

		var date_start = this.abRiskMsdsFilterPanel.getFieldValue('msds_h_location.date_start');
		var date_end = this.abRiskMsdsFilterPanel.getFieldValue('msds_h_location.date_end');
		if(!checkDate(date_start,date_end)){
			View.showMessage(getMessage("wrongDate"));
			return;
		}
		if(valueExistsNotEmpty(date_start)){
			this.dateStart=date_start;
			
		}else{
			this.dateStart="1900-01-01";
		}
		this.abRiskMsdsSummaryReport.addParameter('dateStart', this.dateStart);
		if(valueExistsNotEmpty(date_end)){
			this.dateEnd=date_end;
			
		}else{
			this.dateEnd="2200-01-01";
		}		
		this.abRiskMsdsSummaryReport.addParameter('dateEnd', this.dateEnd);
		this.abRiskMsdsSummaryReport.refresh();
		
	},
	/**
	 * when click one report link, show pop-up details panel.
	 */
	showPopUpPanel: function(){
	    var grid = this.abRiskMsdsSummaryReport;
	    var rowIndex = grid.rows[grid.selectedRowIndex];
	    var msds_id = rowIndex["msds_data.msds_id"];
		var restriction = this.locationRes;
		if(restriction){
			restriction += " AND";
		}
		restriction += " exists (select 1 from msds_h_data, msds_h_location " +
				"where  msds_h_location.msds_id = msds_h_data.msds_id " +				
				" and msds_h_location.msds_id ='"+msds_id+"')" +
				" and (msds_h_location.msds_id ='"+msds_id+"')";
		this.abRiskMsdsSummaryReportPopUpPanel.addParameter('dateStart', this.dateStart);
		this.abRiskMsdsSummaryReportPopUpPanel.addParameter('dateEnd', this.dateEnd);
		this.abRiskMsdsSummaryReportPopUpPanel.refresh(restriction);

		//this.abRiskMsdsSummaryReportPopUpPanel.addEventListener('afterRefresh', hideScroll, this);

		this.abRiskMsdsSummaryReportPopUpPanel.show();
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
		this.abRiskMsdsSummaryReport.getFieldDef("msds_data.sumQuantityMass").title = getMessage("totalProductMass") + massUnit;
		//for grid display
		this.abRiskMsdsSummaryReport.setFieldLabel('msds_data.sumQuantityMass', getMessage("totalProductMass") + massUnit);
		
		var volumeUnit = "";
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill_unit.bill_type_id', 'MSDS - VOLUME', '=');
		var unitRecord = this.abRiskMsdsSummaryReportBillUnit.getRecord(restriction);
		if(unitRecord){
			volumeUnit = " (" + unitRecord.getValue("bill_unit.bill_unit_id") + ")";
		}
		
		//for XLS export
		this.abRiskMsdsSummaryReport.getFieldDef("msds_data.sumQuantityVolume").title = getMessage("totalProductVolume") + volumeUnit;
		//for grid display
		this.abRiskMsdsSummaryReport.setFieldLabel('msds_data.sumQuantityVolume', getMessage("totalProductVolume") + volumeUnit);
		
		//for XLS export
		this.abRiskMsdsSummaryReport.getFieldDef("msds_data.sumContainerSize").title = getMessage("totalContainerVolume") + volumeUnit;
		//for grid display
		this.abRiskMsdsSummaryReport.setFieldLabel('msds_data.sumContainerSize', getMessage("totalContainerVolume") + volumeUnit);
	},
	
	/**
	 * Export current data to paginate report 
	 */
	abRiskMsdsSummaryReport_onExportPaginate: function(){
		var restriction = new Ab.view.Restriction();

		var parameters = {
				 'locationRes':this.locationRes, 
				 'classificationRes':this.classificationRes,				 
				 'dateStart':this.dateStart,
				 'dateEnd':this.dateEnd, 

				 'printRestriction':true, 
				 'printableRestriction':[]
		};
		
		//generate paginated report,like 'ab-viewdef-paginated-parent-child.axvw'
		View.openPaginatedReportDialog('ab-msds-rpt-prod-inv-paginated.axvw',null, parameters);
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
