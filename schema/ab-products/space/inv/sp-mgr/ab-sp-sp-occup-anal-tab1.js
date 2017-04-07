var abSpOccupAnalTab1Controller = abSpOccupAnalCommonController.extend({

	customOccupancyFillColors: ['0x808080','0x008000', '0x0000FF','0xFFFF00','0xFF0000'],

	id: "abSpOccupAnalTab1Controller",

	secondGroupByValueArray: new Array(
			"dp", "dplus", "dv", "rmcat", "srmcat", "op", "orate" 
	),
	secondGroupByTextArray: new Array(
	),

	groupByValueArray: new Array(
			"fl", "bl", "site", "rmcat" 
	),
	groupByTextArray: new Array(
	),
	
	dataAxixOptionValue: new Array(
			"area", "pct", "count" 
	),
	dataAxixOptionText: new Array(
	),
	
	localizeText: function(){
		this.secondGroupByTextArray.push(getMessage("dp"));
		this.secondGroupByTextArray.push(getMessage("all"));
		this.secondGroupByTextArray.push(getMessage("dv"));
		this.secondGroupByTextArray.push(getMessage("rmcat"));
		this.secondGroupByTextArray.push(getMessage("srmcat"));
		this.secondGroupByTextArray.push(getMessage("op"));
		this.secondGroupByTextArray.push(getMessage("orate"));

		this.groupByTextArray.push(getMessage("fl"));
		this.groupByTextArray.push(getMessage("bl"));
		this.groupByTextArray.push(getMessage("site"));
		this.groupByTextArray.push(getMessage("rmcat"));

		this.dataAxixOptionText.push(getMessage("area"));
		this.dataAxixOptionText.push(getMessage("pct"));
		this.dataAxixOptionText.push(getMessage("rcount"));
	},

	afterInitialDataFetch: function(){
		this.localizeText();
		this.initialView(this.abSpOccupAnalTab1Console);
		setTimeTitle(this.abSpOccupAnalTab1Console);
		this.initialDateRangeTitle();
	},

	showOccupancyRateChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctDepartmentPlusAreaChart.show(false);
		this.abRmpctHrmpctDepartmentPlusCountChart.show(false);
		this.showOccupancyRateChartCommon();
		this.abRmpctHrmpctOccupancyRateChart.setTitle(this.getTitleText());
	},

	showNormalStackPlanChart: function(){
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctDepartmentPlusAreaChart.show(false);
		this.abRmpctHrmpctDepartmentPlusCountChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.showNormalStackPlanChartCommon();
		this.abRmpctHrmpctCalculationStackPlanChart.setTitle(this.getTitleText());
	},

	showNormalStackPlanAreaChart: function(){
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctDepartmentPlusAreaChart.show(false);
		this.abRmpctHrmpctDepartmentPlusCountChart.show(false);
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.showNormalStackPlanAreaChartCommon();
		this.abRmpctHrmpctAreaCalculationStackPlanChart.setTitle(this.getTitleText());
	},

	showDepartmentPlusCountChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctDepartmentPlusAreaChart.show(false);
		this.showDepartmentPlusCountChartCommon();
		this.abRmpctHrmpctDepartmentPlusCountChart.setTitle(this.getTitleText());
	},

	showDepartmentPlusAreaChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctDepartmentPlusCountChart.show(false);
		this.showDepartmentPlusAreaChartCommon();
		this.abRmpctHrmpctDepartmentPlusAreaChart.setTitle(this.getTitleText());
	}
})

function onPlanChartClick(obj){
	var controller = abSpOccupAnalTab1Controller;
	var res = "";

	if(obj.selectedChartData['rmpct.groupValue']){
		 res = res + controller.groupOption+ "='"+ obj.selectedChartData['rmpct.groupValue']+"' ";
	}

	if(obj.selectedChartData['rmpct.secondGroupValue'] && res ){
		if(controller.secondGroupOption=="occup" || controller.secondGroupOption=="dplus"){
			res =  res + " AND " +  getSecondGroupRestriction(controller, controller.secondGroupOption, obj.selectedChartData['rmpct.secondGroupValue']);
		}
		else{
			res = res + " AND " + controller.secondGroupOption+ "='"+ obj.selectedChartData['rmpct.secondGroupValue']+"' ";
		}
	}
	
	if(controller.secondGroupOption=="orate"){
		if (obj.selectedChartData['rm.rateType'].indexOf("Occupancy Rate")==0) {
			res =  res + " and rmpct.em_id is not null ";
		}
		else{
			res =  res + " and rmpct.em_id is null ";
		}
	}

	controller.detailsRes = controller.consoleRes + " AND "+ res;
	View.openDialog('ab-sp-sp-occup-anal-pop-up-details.axvw');
}


function getSecondGroupRestriction(controller, option, value){
	var res = "";
	var resForOccup = controller.occupRes;

	if(option=='dplus'){
			if( value=="3 "+getMessage("prorate") ){
				res = " rmpct.dv_id is not null and rmpct.dp_id is not null  and rmcat.supercat='USBL' ";
			}else if( value=="2 "+getMessage("serv") ){
				res = "  rmcat.supercat='SERV'   ";
			}else if( value=="1 "+getMessage("vert") ){
				res = " rmcat.supercat='VERT'  ";
			}else if( value=="4 "+getMessage("other") ){
				res = " rmcat.supercat='OTHR' ";
			}
			else if( value!="(no value)"){
				res=" RTRIM(rmpct.dv_id)${sql.concat}'-'${sql.concat}RTRIM(rmpct.dp_id)='"+value+"' ";
			}
			else{
				res=" rmpct.dv_id IS NULL AND rmpct.dp_id IS NULL "
			}
	}	
	else if (option=='occup'){

		if(value=="1 "+getMessage("nonOccup") ){
			res = " rmcat.occupiable=0 ";
		} ;
			
		if(controller.dateType =='s'){
			var selectStr =  "(  (select count(1) from rmpct  ${sql.as} rp1 left outer join rm  ${sql.as} rm1 on rm1.bl_id=rp1.bl_id and rm1.fl_id=rp1.fl_id and rm1.rm_id=rp1.rm_id 	left outer join bl ${sql.as}  bl1 on bl1.bl_id=rp1.bl_id left outer join rmcat  ${sql.as}  rc1 on rc1.rm_cat=rp1.rm_cat where rp1.bl_id=rmpct.bl_id and rp1.fl_id=rmpct.fl_id and rp1.rm_id=rmpct.rm_id  and rp1.em_id is not null and rp1.status = 1 and rp1.day_part = 0 and "+resForOccup +" ) " +" + 0.5* (select count(1) from rmpct  ${sql.as} rp1 left outer join rm  ${sql.as} rm1 on rm1.bl_id=rp1.bl_id and rm1.fl_id=rp1.fl_id and rm1.rm_id=rp1.rm_id 	left outer join bl ${sql.as}  bl1 on bl1.bl_id=rp1.bl_id left outer join rmcat  ${sql.as}  rc1 on rc1.rm_cat=rp1.rm_cat where rp1.bl_id=rmpct.bl_id and rp1.fl_id=rmpct.fl_id and rp1.rm_id=rmpct.rm_id  and rp1.em_id is not null and rp1.status = 1 and rp1.day_part != 0 and "+resForOccup +" )  )"  ;
			if( value=="2 "+getMessage("vacant") ){
				res = selectStr + "=0  and rmpct.em_id is null and rmcat.occupiable=1  ";
			}else if( value=="3 "+getMessage("avail") ){
				res = selectStr + " &lt; rm.cap_em and "+ selectStr+" &gt;0 and rmpct.em_id is not null  and rmcat.occupiable=1  ";
			}else if( value=="4 "+getMessage("atCap") ){
				res = selectStr + "=rm.cap_em  and rmpct.em_id is not null  and rmcat.occupiable=1  ";
			}else if( value=="5 "+getMessage("excCap") ){
				res = selectStr + " &gt; rm.cap_em  and rmpct.em_id is not null  and rmcat.occupiable=1  ";
			}
		} else if( controller.dateType =='r' ){

			if( value=="2 "+getMessage("vacant") ){
				res = " rmcat.occupiable=1 and rm.count_em=0  ";
			}else if( value=="3 "+getMessage("avail") ){
				res = "  rmcat.occupiable=1 and rm.count_em&gt;0 AND rm.count_em &lt; rm.cap_em  and rmpct.em_id is not null ";
			}else if( value=="4 "+getMessage("atCap") ){
				res = "  rmcat.occupiable=1 and rm.count_em=rm.cap_em and rmpct.em_id is not null ";
			}else if( value=="5 "+getMessage("excCap") ){
				res = "  rmcat.occupiable=1 and rm.count_em &gt; rm.cap_em and rmpct.em_id is not null ";
			}
		}
	}	

	return res;
}

