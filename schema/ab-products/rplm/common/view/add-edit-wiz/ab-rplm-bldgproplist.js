var abRplmBldgPropListController = View.createController('abRplmBldgPropList',{
	openerController:null,
	selectedRow:null,
	selectedId:null,
	selectedType:null,
	gridBuildingList_afterRefresh: function(){
		this.gridBuildingList.enableSelectAll(false);
	},
	gridPropertyList_afterRefresh: function(){
		this.gridPropertyList.enableSelectAll(false);
	},
	gridBuildingList_onSave: function(){
		if(this.selectedRow == null){
			View.showMessage(getMessage('error_nobldgselected'));
			return;
		}
		this.openerController.itemId = this.selectedRow.getFieldValue('bl.bl_id');
		this.openerController.itemType = 'BUILDING';
		this.openerController.showSelection();
		View.closeThisDialog();
	},
	gridBuildingList_onCancel: function(){
		View.closeThisDialog();
	},
	gridPropertyList_onSave: function(){
		if(this.selectedRow == null){
			switch(this.selectedType){
				case 'LAND':{
					View.showMessage(getMessage('error_nolandselected'));
					break;
				}
				case 'STRUCTURE':{
					View.showMessage(getMessage('error_nostructureselected'));
					break;
				}
				case 'PROPERTY':{
					View.showMessage(getMessage('error_nopropertyselected'));
					break;
				}
			}
			return;
		}
		this.openerController.itemId = this.selectedRow.getFieldValue('property.pr_id');
		this.openerController.itemType = this.selectedRow.getFieldValue('property.property_type').toUpperCase();
		this.openerController.showSelection();
		View.closeThisDialog();
	},
	gridPropertyList_onCancel: function(){
		View.closeThisDialog();
	},
	restoreSelection:function(){
		if(this.selectedId != null && this.selectedType == 'BUILDING'){
			for(var i=0;i<this.gridBuildingList.gridRows.length;i++){
				if(this.gridBuildingList.gridRows.get(i).getFieldValue('bl.bl_id') == this.selectedId){
					this.selectedRow = this.gridBuildingList.gridRows.get(i);
					this.gridBuildingList.gridRows.get(i).select(true);
					break;
				}
			}
		}else if(this.selectedId != null && (this.selectedType == 'LAND' || this.selectedType == 'STRUCTURE' || this.selectedType =='PROPERTY')){
			for(var i=0;i<this.gridPropertyList.gridRows.length;i++){
				if(this.gridPropertyList.gridRows.get(i).getFieldValue('property.pr_id') == this.selectedId){
					this.selectedRow = this.gridPropertyList.gridRows.get(i); 
					this.gridPropertyList.gridRows.get(i).select(true);
					break;
				}
			}
		}
	},
	gridBuildingList_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	gridPropertyList_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	}
})
