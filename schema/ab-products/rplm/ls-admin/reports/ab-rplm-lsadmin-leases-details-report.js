var repLeaseDetailsMainController = View.createController('repLeaseDetailsMain', {
	restriction:'',
	searchPattern:'',
	crit1Selected:'all',
	crit2Selected:'both',
	crit3Selected:'all',
	
	afterViewLoad: function(){
		this.treeCtry.addParameter('param_building', getMessage('param_building'));
		this.treeCtry.addParameter('param_structure', getMessage('param_structure'));
		this.treeCtry.addParameter('param_land', getMessage('param_land'));
		this.treeCtry.addParameter('param_landlord', getMessage('param_landlord'));
		this.treeCtry.addParameter('param_tenant', getMessage('param_tenant'));
		
	},
	
	
	treeCtry_onSearch: function(){
		this.formFilter.setFieldValue('ls.ls_id', this.searchPattern);
		this.formFilter.setFieldValue('criteria_1', this.crit1Selected);
		this.formFilter.setFieldValue('criteria_2', this.crit2Selected);
		this.formFilter.setFieldValue('criteria_3', this.crit3Selected);
		var button = valueExists(arguments)&& valueExists(arguments[0].el)? arguments[0].el: null;
		this.formFilter.showInWindow({
            anchor: button,
            width: 500,
            height: 400,
		});
		
	},
	
	treeCtry_onShow_all:function(){
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery_int', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.refresh();
	},
	
	formFilter_onApply: function(){
		this.crit1Selected = this.formFilter.getFieldValue('criteria_1');
		this.crit2Selected = this.formFilter.getFieldValue('criteria_2');
		this.crit3Selected = this.formFilter.getFieldValue('criteria_3');
		this.searchPattern = this.formFilter.getFieldValue('ls.ls_id');
		this.applyFilter();
		this.formFilter.closeWindow();
	},

	formFilter_onClear: function(){
		this.searchPattern = '';
		this.crit1Selected = 'all';
		this.crit2Selected = 'both';
		this.crit3Selected = 'all';
		this.applyFilter();
		this.formFilter.closeWindow();
	},

	applyFilter: function(){
		var queryParameter = ''; //'AND ls.ls_id like \'%'+this.searchPattern+'%\'';
		var queryParameterInt = ''; //'AND x.ls_id like \'%'+this.searchPattern+'%\'';
		
		switch(this.crit1Selected){
			case 'all':{
				break;
			}
			case 'building':{
				queryParameter += 'AND ls.bl_id IS NOT NULL ';
				queryParameterInt += 'AND x.bl_id IS NOT NULL ';
				break;
			}
			case 'structure':{
				queryParameter += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = ls.pr_id AND property.property_type = \'Structure\') ';
				queryParameterInt += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = x.pr_id AND property.property_type = \'Structure\') ';
				break;
			}
			case 'land':{
				queryParameter += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = ls.pr_id AND property.property_type = \'Land\') ';
				queryParameterInt += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = x.pr_id AND property.property_type = \'Land\') ';
				break;
			}
		}
		switch(this.crit2Selected){
			case 'both':{
				break;
			}
			case 'active':{
				queryParameter += ' AND ls.signed = 1 AND (ls.date_end &gt; ${sql.currentDate} OR ls.date_end IS NULL) AND ls.date_start &lt; ${sql.currentDate} ';
				queryParameterInt += ' AND x.signed = 1 AND (x.date_end &gt; ${sql.currentDate} OR x.date_end IS NULL) AND x.date_start &lt; ${sql.currentDate} ';
				break;
			}
			case 'nonactive':{
				queryParameter += ' AND ( ls.signed = 0 OR ls.date_end &lt; ${sql.currentDate} OR ls.date_start &gt; ${sql.currentDate} )';
				queryParameterInt += ' AND ( x.signed = 0 OR x.date_end &lt; ${sql.currentDate} OR x.date_start &gt; ${sql.currentDate} ) ';
				break;
			}
		}
		switch(this.crit3Selected){
			case 'all':{
				break;
			}
			case 'landlord':{
				queryParameter += ' AND ls.landlord_tenant = \'LANDLORD\'';
				queryParameterInt += ' AND x.landlord_tenant = \'LANDLORD\'';
				break;
			}
			case 'tenant':{
				queryParameter += ' AND ls.landlord_tenant = \'TENANT\'';
				queryParameterInt += ' AND x.landlord_tenant = \'TENANT\'';
				break;
			}
		}
		if (valueExistsNotEmpty(this.searchPattern)){
			queryParameter += 'AND ls.ls_id like \'%'+this.searchPattern+'%\'';
			queryParameterInt += 'AND x.ls_id like \'%'+this.searchPattern+'%\'';
		}
		
		
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery_int', queryParameterInt);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.refresh();
	}
})


function afterGeneratingTreeNode(treeNode){
	var geocoded = true;
	var labelText = treeNode.label;
	var crtArray = new Array();
	if(treeNode.level.levelIndex == 2){
		var itemType = treeNode.data['bl.type'];
		var itemId = treeNode.data['bl.bl_id'];
		var parameters = null;
		if(itemType == 'BUILDING'){
			parameters = {
				tableName:'bl',
				fieldNames: toJSON(['bl.bl_id', 'bl.lat', 'bl.lon', 'bl.address1', 'bl.address2', 'bl.city_id', 'bl.state_id']),
				restriction: toJSON({'bl.bl_id':itemId})
			};
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == 'executed'){
				geocoded = ( result.data.records[0]['bl.lat']!='' && result.data.records[0]['bl.lon']!='' );
			}else{
				Workflow.handleError(result);
			}
		}else{
			parameters = {
				tableName:'property',
				fieldNames: toJSON(['property.pr_id', 'property.lat', 'property.lon', 'property.address1', 'property.address2', 'property.city_id', 'property.state_id']),
				restriction: toJSON({'property.pr_id':itemId})
			};
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == 'executed'){
				geocoded = ( result.data.records[0]['property.lat']!='' && result.data.records[0]['property.lon']!='' );
			}else{
				Workflow.handleError(result);
			}
		}
		if(!geocoded){
			labelText = labelText + "<img alt='"+getMessage('not_geocoded')+"' border='0' src='/archibus/schema/ab-system/graphics/no_geocode.png'/>";
		}
	}
	treeNode.setUpLabel(labelText);
//	return labelText;
}


function showDetails(event){
	var nodeId = null;
	var bl_id = '';
	var pr_id = '';
	if(event.restriction.findClause('ls.ls_id')!= null){
		nodeId = event.restriction.findClause('ls.ls_id').value;
	}else if(event.restriction.findClause('su.su_id')!= null){
		nodeId = event.restriction.findClause('su.su_id').value;
	}
	var parameters = {
		tableName: 'ls',
		fieldNames:toJSON(['ls.ls_id', 'ls.bl_id', 'ls.pr_id']),
		restriction: toJSON({'ls.ls_id':nodeId})
	}
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if (result.code == 'executed') {
		bl_id = result.data.records[0]['ls.bl_id'];
		pr_id = result.data.records[0]['ls.pr_id'];
	}else{
		Workflow.handleError(result);
	}
	var targetCrtl = repLeaseDetailsMainController.reportPanel.contentView.controllers.get('repLeaseDetails');
	targetCrtl.ls_id = nodeId;
	targetCrtl.bl_id = bl_id;
	targetCrtl.pr_id = pr_id;
	targetCrtl.initializeView();
}
