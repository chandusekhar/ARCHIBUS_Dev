var LsSuByBldgController = View.createController('LsSuByBldgController',{
	
	afterViewLoad: function(){
		var displayUnit = "";
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			displayUnit =  " " + View.user.areaUnits.title;
		}
		var columns = this.grid_LsSuByBldg_areaUsed.columns;
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
		var columns = this.grid_LsSuByBldg_areaUsedOth.columns;
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
	},
	
	form_LsSuByBldg_bldg_afterRefresh: function(){
		var displayUnit = "";
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			displayUnit =  " " + View.user.areaUnits.title;
		}
		this.form_LsSuByBldg_bldg.setFieldLabel("bl.total_suite_manual_area",getMessage("total_suite_manual_area_title")+displayUnit);
		this.form_LsSuByBldg_bldg.setFieldLabel("bl.total_suite_usable_area",getMessage("total_suite_usable_area_title")+displayUnit);
		
		formatCurrency(this.form_LsSuByBldg_bldg);
	}

});