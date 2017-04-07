var abSpSpaceBookPlanTypesOrderCtrl = View.createController('abSpSpaceBookPlanTypesOrderController', {
	abSpSpaceBookPlanTypesOrder_treePanel_afterRefresh: function(){
		var restriction = this.abSpSpaceBookPlanTypesOrder_list.restriction;
		this.abSpSpaceBookPlanTypesOrder_list.refresh(restriction);
	},

	abSpSpaceBookPlanTypesOrder_list_up_onClick: function(row){
		var rows = this.abSpSpaceBookPlanTypesOrder_list.gridRows;
		var restriction = this.abSpSpaceBookPlanTypesOrder_list.restriction;
		if(getIndexOf(rows, row) == 0){
			View.showMessage(getMessage('error_up_first'));
			return;
		}
		var rowOrder = row.getRecord().getValue('plantype_groups.display_order');
		var prevOrder = rows.get(getIndexOf(rows, row)-1).getRecord().getValue('plantype_groups.display_order');
		var rowRecord = row.getRecord();
		var prevRecord = rows.get(getIndexOf(rows, row)-1).getRecord();
		
		var rowRestriction = new Ab.view.Restriction({'plantype_groups.plan_type': rowRecord.getValue('active_plantypes.plan_type')});
		rowRestriction.addClause('plantype_groups.plantype_group', rowRecord.getValue('plantype_groups.plantype_group'));
		var rowDsRecord = this.abSpSpaceBookPlanTypesOrder_ds_2.getRecord(rowRestriction);
		var prevRestriction = new Ab.view.Restriction({'plantype_groups.plan_type': prevRecord.getValue('active_plantypes.plan_type')});
		prevRestriction.addClause('plantype_groups.plantype_group', prevRecord.getValue('plantype_groups.plantype_group'));
		var prevDsRecord = this.abSpSpaceBookPlanTypesOrder_ds_2.getRecord(prevRestriction);
		
		rowDsRecord.setValue('plantype_groups.display_order',prevOrder);
		prevDsRecord.setValue('plantype_groups.display_order',rowOrder);
		try{
			this.abSpSpaceBookPlanTypesOrder_ds_2.saveRecord(rowDsRecord);
			this.abSpSpaceBookPlanTypesOrder_ds_2.saveRecord(prevDsRecord);
		}
		catch(e){
	        View.showMessage('error', getMessage('error_update'), e.message, e.data);
		}
		this.abSpSpaceBookPlanTypesOrder_list.refresh(restriction);
	},
	
	abSpSpaceBookPlanTypesOrder_list_down_onClick: function(row){
		var rows = this.abSpSpaceBookPlanTypesOrder_list.gridRows;
		var restriction = this.abSpSpaceBookPlanTypesOrder_list.restriction;
		if(getIndexOf(rows, row) == rows.getCount()-1){
			View.showMessage(getMessage('error_down_last'));
			return;
		}
		var rowOrder = row.getRecord().getValue('plantype_groups.display_order');
		var nextOrder = rows.get(getIndexOf(rows, row)+1).getRecord().getValue('plantype_groups.display_order');
		var rowRecord = row.getRecord();
		var nextRecord = rows.get(getIndexOf(rows, row)+1).getRecord();
		
		var rowRestriction = new Ab.view.Restriction({'plantype_groups.plan_type': rowRecord.getValue('active_plantypes.plan_type')});
		rowRestriction.addClause('plantype_groups.plantype_group', rowRecord.getValue('plantype_groups.plantype_group'));
		var rowDsRecord = this.abSpSpaceBookPlanTypesOrder_ds_2.getRecord(rowRestriction);
		var nextRestriction = new Ab.view.Restriction({'plantype_groups.plan_type': nextRecord.getValue('active_plantypes.plan_type')});
		nextRestriction.addClause('plantype_groups.plantype_group', nextRecord.getValue('plantype_groups.plantype_group'));
		var nextDsRecord = this.abSpSpaceBookPlanTypesOrder_ds_2.getRecord(nextRestriction);
		
		rowDsRecord.setValue('plantype_groups.display_order',nextOrder);
		nextDsRecord.setValue('plantype_groups.display_order',rowOrder);
		try{
			this.abSpSpaceBookPlanTypesOrder_ds_2.saveRecord(rowDsRecord);
			this.abSpSpaceBookPlanTypesOrder_ds_2.saveRecord(nextDsRecord);
		}
		catch(e){
	        View.showMessage('error', getMessage('error_update'), e.message, e.data);
		}
		this.abSpSpaceBookPlanTypesOrder_list.refresh(restriction);
	}
});

function getIndexOf(collection, object){
	var result = -1;
	for(var i=0;i<collection.getCount();i++)
		if(collection.get(i) == object)
			result = i;
	return (result);
}