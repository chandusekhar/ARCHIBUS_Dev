var repLeaseSuitesByBldgBaseController = View.createController('repLeaseSuitesByBldgBase',{
	bl_id:null,
	// if UOM is enabled
	isUOMEnabled: false,
	initializeView:function(){
		this.reportLeasesAndSuiteByBldgGeneralInfo.refresh({'bl.bl_id':this.bl_id}, false);
		if(valueExistsNotEmpty(this.reportLeasesAndSuiteByBldgGeneralInfo.getFieldValue('bl.bldg_photo'))){
			this.reportLeasesAndSuiteByBldgGeneralInfo.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.reportLeasesAndSuiteByBldgGeneralInfo.fields.get(this.reportLeasesAndSuiteByBldgGeneralInfo.fields.indexOfKey('image_field')).dom.src = null;
			this.reportLeasesAndSuiteByBldgGeneralInfo.fields.get(this.reportLeasesAndSuiteByBldgGeneralInfo.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
		this.reportLeasesAndSuiteByBldgLeases.refresh({'ls.bl_id':this.bl_id}, false);
		this.reportLeasesAndSuiteByBldgLeases.removeSorting();
		translateFieldValue(this.reportLeasesAndSuiteByBldgLeases, 'ls.status', 'status', true, true);
		this.reportLeasesAndSuiteByBldgAreasUsedByUsSummary.addParameter('bl_id', this.bl_id);
		
		var displayUnit = "";
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			displayUnit =  " " + View.user.areaUnits.title;
		}
		var columns = this.reportLeasesAndSuiteByBldgAreasUsedByUsSummary.columns;
		for(var index in columns){
			if(columns[index].id=="su.area_total"){
				columns[index].name = getMessage("area_total_title") + displayUnit;
			}
			if(columns[index].id=="su.area_average"){
				columns[index].name = getMessage("area_average_title") + displayUnit;
			}
			if(columns[index].id=="su.area_min"){
				columns[index].name = getMessage("area_min_title") + displayUnit;
			}
			if(columns[index].id=="su.area_max"){
				columns[index].name = getMessage("area_max_title") + displayUnit;
			}
		}
		var columns = this.reportLeasesAndSuiteByBldgAreasUsedByOthersSummary.columns;
		for(var index in columns){
			if(columns[index].id=="su.area_total"){
				columns[index].name = getMessage("area_total_title") + displayUnit;
			}
			if(columns[index].id=="su.area_average"){
				columns[index].name = getMessage("area_average_title") + displayUnit;
			}
			if(columns[index].id=="su.area_min"){
				columns[index].name = getMessage("area_min_title") + displayUnit;
			}
			if(columns[index].id=="su.area_max"){
				columns[index].name = getMessage("area_max_title") + displayUnit;
			}
		}
		
		this.reportLeasesAndSuiteByBldgAreasUsedByUsSummary.refresh();
		this.reportLeasesAndSuiteByBldgAreasUsedByUsSummary.removeSorting();
		translateFieldValue(this.reportLeasesAndSuiteByBldgAreasUsedByUsSummary, 'su.area_type', 'area_type', true, false);
		this.reportLeasesAndSuiteByBldgAreasUsedByUs.refresh({'su.bl_id':this.bl_id}, false);
		this.reportLeasesAndSuiteByBldgAreasUsedByUs.removeSorting();
		this.reportLeasesAndSuiteByBldgAreasUsedByOthersSummary.addParameter('bl_id', this.bl_id);
		this.reportLeasesAndSuiteByBldgAreasUsedByOthersSummary.refresh();
		this.reportLeasesAndSuiteByBldgAreasUsedByOthersSummary.removeSorting();
		translateFieldValue(this.reportLeasesAndSuiteByBldgAreasUsedByOthersSummary, 'su.area_type', 'area_type', true, false);
		this.reportLeasesAndSuiteByBldgAreasUsedByOthers.refresh({'su.bl_id':this.bl_id}, false);
		this.reportLeasesAndSuiteByBldgAreasUsedByOthers.removeSorting();
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			this.isUOMEnabled = true;
		}
		// UOM Changes
		var areaUnitsConversionFactor = 1.0;
		if(this.isUOMEnabled){
			// UOM Changes
			if(View.user.displayUnits != View.project.units){
				areaUnitsConversionFactor = 1 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
		this.reportLeasesAndSuiteByBldgGeneralInfo.addParameter("areaUnitsConversionFactor", areaUnitsConversionFactor);
		this.reportLeasesAndSuiteByBldgAreasUsedByUsSummary.addParameter("areaUnitsConversionFactor", areaUnitsConversionFactor);
		this.reportLeasesAndSuiteByBldgAreasUsedByOthersSummary.addParameter("areaUnitsConversionFactor", areaUnitsConversionFactor);
	},
	reportLeasesAndSuiteByBldgGeneralInfo_afterRefresh:function(){
		var displayUnit = "";
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			displayUnit =  " " + View.user.areaUnits.title;
		}
		
		this.reportLeasesAndSuiteByBldgGeneralInfo.setFieldLabel("bl.total_suite_manual_area", getMessage("total_suite_manual_area_title") + displayUnit);
		this.reportLeasesAndSuiteByBldgGeneralInfo.setFieldLabel("bl.total_suite_usable_area", getMessage("total_suite_usable_area_title") + displayUnit);
		formatCurrency(this.reportLeasesAndSuiteByBldgGeneralInfo);
	}
})

function translateFieldValue(panel, field, message, onRows, withStyle){
	if(!onRows){
		panel.setFieldValue(field, getMessage(message+'_'+panel.getFieldValue(field)));
	}else if(onRows){
		for(var i=0;i< panel.gridRows.length;i++){
			var row = panel.gridRows.get(i);
			if(withStyle){
				setStyle(row.cells.items[row.cells.indexOfKey(field)], row.getFieldValue(field));
			}
			row.setFieldValue(field, getMessage(message+'_'+row.getFieldValue(field)));
		}
	}
}

function setStyle(cell, value){
	switch(value){
		case 'pipeline_landlord':{
			cell.dom.style.backgroundColor = '#FFFF00';
			break;
		}
		case 'pipeline_tenant':{
			cell.dom.style.backgroundColor = '#FF0000';
			break;
		}
		case 'landlord':{
			cell.dom.style.backgroundColor = '#00FF7F';
			break;
		}
		case 'tenant':{
			cell.dom.style.backgroundColor = '#ADD8E6';
			break;
		}
	}
}
