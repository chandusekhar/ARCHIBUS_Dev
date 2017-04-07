var abEnergyDefineProratiomGroupController = View.createController('abEnergyDefineProratiomGroupController', {
	
	vendorAccount_form_afterRefresh: function(){
		var submeters = this.vendorAccount_form.getFieldElement("vn_ac.proration_action");
		if(submeters[2].value == 'SUBMETERS'){
			submeters.remove(2);
		}
	},
	
	showBuildings: function(){
		var prorationAction = this.vendorAccount_form.getFieldValue("vn_ac.proration_action");
		if(prorationAction == 'NONE'){
			this.selectedBuildings_grid.show(false);
			this.availableBuildings_grid.show(false);
			return;
		}else{
			this.selectedBuildings_grid.show(true);
			this.availableBuildings_grid.show(true);
			var vnId = this.vendorAccount_form.getFieldValue("vn_ac.vn_id");
			var vnAcId = this.vendorAccount_form.getFieldValue("vn_ac.vn_ac_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause('bill_proration_group.vn_id', vnId, '=');
			restriction.addClause('bill_proration_group.vn_ac_id', vnAcId, '=');
			var bldsRecords = this.bill_proration_group_ds.getRecords(restriction);
			var blds = new Array();
			var res = new Ab.view.Restriction();
			for (var i = 0; i < bldsRecords.length; i++){
				var value = bldsRecords[i].getValue('bill_proration_group.bl_id');
				blds.push(value);
				res.addClause('bl.bl_id',value,'<>');
			} 
			restriction = new Ab.view.Restriction();
			if(blds.length >0){
				restriction.addClause('bl.bl_id', blds, 'IN');
			}else{
				restriction.addClause('bl.bl_id','','IS NULL');
			}
			this.selectedBuildings_grid.refresh(restriction);
			var siteId = this.vendorAccount_form.getFieldValue("vn_ac.site_id");
			if(valueExistsNotEmpty(siteId)){
				res.addClause('bl.site_id', siteId, '=');
			}
			this.availableBuildings_grid.refresh(res);
		}
	},
	
	selectedBuildings_grid_onUnassign: function(){
		var objGrid = this.selectedBuildings_grid;
    	var gridRows =  objGrid.getSelectedGridRows();
    	var vnId = this.vendorAccount_form.getFieldValue("vn_ac.vn_id");
		var vnAcId = this.vendorAccount_form.getFieldValue("vn_ac.vn_ac_id");
    	if (gridRows.length == 0) {
    		View.showMessage(getMessage("ErrorNoBuildingSelected"));
    		return false;
    	}else{
    		var objDataSource = View.dataSources.get("bill_proration_group_ds");
        	for (var i = 0; i < gridRows.length; i++) {
        		var row = gridRows[i];
        		var bl_id = row.getFieldValue("bl.bl_id");
        		
        		var record = new Ab.data.Record({
                    'bill_proration_group.vn_id': vnId,
                    'bill_proration_group.vn_ac_id': vnAcId,
                    'bill_proration_group.bl_id': bl_id
        		}, false);
        		objDataSource.deleteRecord(record);
        	}
        	this.showBuildings();      	
    	} 
    },
    
    availableBuildings_grid_onAssign: function(){
    	var objGrid = this.availableBuildings_grid;
    	var gridRows =  objGrid.getSelectedGridRows();
    	var vnId = this.vendorAccount_form.getFieldValue("vn_ac.vn_id");
		var vnAcId = this.vendorAccount_form.getFieldValue("vn_ac.vn_ac_id");
    	if (gridRows.length == 0) {
    		View.showMessage(getMessage("ErrorNoBuildingSelected"));
    		return false;
    	}else{
    		var site_id = gridRows[0].getFieldValue("bl.site_id");
    		for (var i = 1; i < gridRows.length; i++) {
    			var row = gridRows[i];
    			if(row.getFieldValue('bl.site_id') != site_id){		
    				View.showMessage(getMessage("ErrorDifferentSite"));
    				return false;
    			}
    			
    		}
    		var objDataSource = View.dataSources.get("bill_proration_group_ds");
        	for (var i = 0; i < gridRows.length; i++) {
        		var row = gridRows[i];
        		var bl_id = row.getFieldValue("bl.bl_id");
        		
        		var record = new Ab.data.Record({
                    'bill_proration_group.vn_id': vnId,
                    'bill_proration_group.vn_ac_id': vnAcId,
                    'bill_proration_group.bl_id': bl_id
        		}, true);
        		objDataSource.saveRecord(record);
        	}
        	this.showBuildings();      	
    	} 
    },
    
    vendorAccount_form_onSave : function(){
    	var form = this.vendorAccount_form;
    	var grid = this.vendorAccount_grid;
    	if(form.getFieldValue('vn_ac.proration_action')=='NONE'){
    		var objDataSource = View.dataSources.get("bill_proration_group_ds");
    		var restriction = new Ab.view.Restriction();
    		var vnId = form.getFieldValue("vn_ac.vn_id");
    		var vnAcId = form.getFieldValue("vn_ac.vn_ac_id");
    		var blId = form.getFieldValue("vn_ac.bl_id");
    		restriction.addClause('bill_proration_group.vn_id', vnId, '=');
    		restriction.addClause('bill_proration_group.vn_ac_id', vnAcId, '=');
    		var records = objDataSource.getRecords(restriction);
    		if(records.length>0){
    			View.confirm(getMessage("removeBuildings"), function(button) {
    			    if (button == 'yes') {
    			    	for(var i=0; i<records.length; i++){
    			    		objDataSource.deleteRecord(records[i]);
    			    	}
    			    	form.save();
    			    	grid.refresh();
                    }else{
                    	form.refresh();
                    }
    			});
    		}else{
    			form.save();
    			this.vendorAccount_grid.refresh();
    		}
    	}else{
    		var name = form.getFieldValue("vn_ac.proration_group_name");
    		if(valueExistsNotEmpty(name)){
    			var ds = View.dataSources.get("vendor_account_ds");
    			var res = new Ab.view.Restriction();
    			res.addClause('vn_ac.proration_group_name', name, '=');
    			res.addClause('vn_ac.vn_ac_id', form.getFieldValue('vn_ac.vn_ac_id'), '<>');
    			var rec = ds.getRecords(res);
    			if(rec.length>0){
    				View.showMessage(getMessage('duplicateName'));
    				form.refresh();
    			}else{
    				form.save();    
    				this.vendorAccount_grid.refresh();
    			}
    		}else{
    			View.showMessage(getMessage('noName'));
    		}
    	}
    }
	
});

function showBuildingList(){
	var controller = View.controllers.get('abEnergyDefineProratiomGroupController');
	controller.showBuildings();
}