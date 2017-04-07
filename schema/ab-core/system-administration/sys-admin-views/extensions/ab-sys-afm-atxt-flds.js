/*
 * controller definition  
 */
var abSysAfmAtxtFldsController = View.createController('abSysAfmAtxtFlds', {
	
	addFieldRestriction: null,
	
	unsavedFields: [],
	
	abSysAfmAtxtFlds_detailsIsAtxt_afterRefresh:function(){
		this.abSysAfmAtxtFlds_detailsIsAtxt.removeSorting();
	},
	
	//remove selected items
	abSysAfmAtxtFlds_detailsIsAtxt_onRemoveSelected:function(){
		var rows = this.abSysAfmAtxtFlds_detailsIsAtxt.getSelectedRows();
		for(var i = 0; i<rows.length; i++){
			remove(rows[i]);
		}
	},
	
	// save list action
	abSysAfmAtxtFlds_detailsIsAtxt_onSaveList:function(){
		this.saveRecords(this.abSysAfmAtxtFlds_detailsIsAtxt);
		this.saveRecords(this.abSysAfmAtxtFlds_detailsIsNotAtxt);
		try {
			Workflow.callMethod('AbSystemAdministration-refreshDataDictionary');
			this.unsavedFields = [];
			this.abSysAfmAtxtFlds_detailsIsNotAtxt.refresh(this.addFieldRestriction);
		}catch(e){
			Workflow.handleError(e);
		}		
	},
	
	// addSelected action
	abSysAfmAtxtFlds_detailsIsNotAtxt_onAddSelected: function(){
		//get selected rows
		var rows = this.abSysAfmAtxtFlds_detailsIsNotAtxt.getSelectedRows();
		if (rows.length > 0) {
			var index = this.abSysAfmAtxtFlds_detailsIsAtxt.gridRows.length - 1;
			
			var lastItem = this.abSysAfmAtxtFlds_detailsIsAtxt.gridRows.items[index];
			var isAtxt = 0;
			if(lastItem){
				isAtxt = lastItem.record["afm_flds.is_atxt"];
			}
			
			// adds selected rows to abSysAfmAtxtFlds_detailsIsAtxt panel and remove from abSysAfmAtxtFlds_detailsIsNotAtxt
			// also modify the is_atxt from 0 to latest_value ++
			for(var i=0; i<rows.length;i++){
				var row = rows[i];
				isAtxt++;
				index++;
				row.row.record["afm_flds.is_atxt"] = isAtxt+"";
				this.abSysAfmAtxtFlds_detailsIsAtxt.addRow(row.row.record, index);
				this.abSysAfmAtxtFlds_detailsIsNotAtxt.removeRow(row.index);
				
				this.abSysAfmAtxtFlds_detailsIsAtxt.update();
				this.abSysAfmAtxtFlds_detailsIsNotAtxt.update();
				this.addFieldToUnsavedArray(row.row.record["afm_flds.field_name"]);
			}
			// kb 3050976  clear miniconsole restriction when grid has no rows
			if (this.abSysAfmAtxtFlds_detailsIsNotAtxt.rows.length == 0) {
				this.abSysAfmAtxtFlds_detailsIsNotAtxt.clearAllFilterValues();
				var restriction = this.addFieldRestriction;
				if(this.unsavedFields.length > 0 ){
					restriction += " AND afm_flds.field_name NOT IN ('" + this.unsavedFields.join("', '") + "')";
				}
				this.abSysAfmAtxtFlds_detailsIsNotAtxt.refresh(restriction);
			}
		}
	},
	
	//update database with all records from a grid panel
	
	saveRecords: function(gridPanel){
		
		for(var i = 0; i<gridPanel.gridRows.items.length; i++){
			
			var record = gridPanel.gridRows.items[i].getRecord().values;
			
			var parameters = {
                tableName: "afm_flds",
                fields: toJSON(record)
            };
            Workflow.call('AbCommonResources-saveRecord', parameters);
		}
		
	},
	
	removeFieldFromUnsavedArray: function(fieldName){
		for(var i=0; i< this.unsavedFields ; i++){
			if(this.unsavedFields[i] == fieldName){
				this.unsavedFields.splice(i, 1);
				break;
			}
		}
	},
	
	addFieldToUnsavedArray: function(fieldName){
		var indexOfField = -1;
		for(var i=0; i< this.unsavedFields ; i++){
			if(this.unsavedFields[i] == fieldName){
				indexOfField = i;
				break;
			}
		}
		if(indexOfField == -1){
			this.unsavedFields.push(fieldName);
		}
	}
});

/*
 * refresh details panels
 */
function refreshPanels(row){
	var controller = abSysAfmAtxtFldsController;
	var selectedTable = row.restriction['afm_atyp.table_name'];
	var assetTextRest = "afm_flds.table_name = '"+selectedTable+"' and afm_flds.is_atxt>0";
	var addFldsRest = "afm_flds.table_name = '"+selectedTable+"' and afm_flds.is_atxt=0";
	controller.abSysAfmAtxtFlds_detailsIsAtxt.refresh(assetTextRest);
	controller.abSysAfmAtxtFlds_detailsIsNotAtxt.refresh(addFldsRest);
	controller.addFieldRestriction = addFldsRest; 
	controller.unsavedFields = [];
}


//moveUp button functionality
// @row - selected row
function moveUp(row){
	
	var index = row.index;
	if (index > 0) {
		var controller = abSysAfmAtxtFldsController;
		var is_atxt = parseInt (row['afm_flds.is_atxt']);
		var gridPanel = controller.abSysAfmAtxtFlds_detailsIsAtxt;
		gridPanel.gridRows.items[index].record["afm_flds.is_atxt"] = is_atxt - 1 + "";
		gridPanel.gridRows.items[index - 1].record["afm_flds.is_atxt"] = is_atxt + "";
		gridPanel.moveGridRow(index, index - 1);
		gridPanel.update();
	}
}

//moveDown button functionality
// @row - selected row
function moveDown(row){
	var controller = abSysAfmAtxtFldsController;
	var gridPanel = controller.abSysAfmAtxtFlds_detailsIsAtxt;	
	var index = row.index;
	if (index < gridPanel.gridRows.length-1) {
		var is_atxt = parseInt (row['afm_flds.is_atxt']);
		gridPanel.gridRows.items[index].record["afm_flds.is_atxt"] = is_atxt + 1 + "";
		gridPanel.gridRows.items[index + 1].record["afm_flds.is_atxt"] = is_atxt + "";
		gridPanel.moveGridRow(index, index + 1);
		gridPanel.update();
	}
}

//remove button functionality
// @row - selected row
function remove(row){
	var index = row.index;
	var controller = abSysAfmAtxtFldsController;
	var gridPanelIsAtxt = controller.abSysAfmAtxtFlds_detailsIsAtxt;
	var gridPanelIsNotAtxt = controller.abSysAfmAtxtFlds_detailsIsNotAtxt;
	gridPanelIsAtxt.gridRows.items[index].record["afm_flds.is_atxt"] = 0+"";
	gridPanelIsNotAtxt.addGridRow(row.row.record, 0);
	gridPanelIsAtxt.removeRow(index);
	gridPanelIsAtxt.update();
	gridPanelIsNotAtxt.update();
	controller.removeFieldFromUnsavedArray(row.row.record["afm_flds.field_name"]);
}
