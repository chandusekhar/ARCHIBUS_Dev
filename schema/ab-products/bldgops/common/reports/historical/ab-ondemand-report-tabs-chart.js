var abOndemandReportTabsChartController = View.createController('abOndemandReportTabsChartController', {
    parentTypeTag: '',
    afterViewLoad: function() {
        var consoleRes = ' 1=1 ';
        var openerController = View.getOpenerView().controllers.get(0);
        var panel = this.abOndemandReportTabsChart;
        //parentType:'ac','bl','dvdp','eqstd','prob_type',for decide which page call current chart
        
        var parentType = openerController.parentType;
        this.parentTypeTag = parentType;
		 //parentType:'ac','bl','dvdp','eqstd','proptype','tr','repair_type','workteam','causetype'
        if (parentType) {
            if (parentType == 'bl') {
                panel.addParameter('groupOption', "RTRIM(hwr.site_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.bl_id)");
                
                panel.addParameter('groupByField', " hwr.site_id , hwr.bl_id ");
            }
            if (parentType == 'dvdp') {
                panel.addParameter('groupOption', "RTRIM(hwr.dv_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.dp_id)");
                
                panel.addParameter('groupByField', " hwr.dv_id , hwr.dp_id ");
                
            }
			if (parentType == 'ac') {
                panel.addParameter('groupOption', " hwr.ac_id");
                
                panel.addParameter('groupByField', " hwr.ac_id");
                
            }
			if (parentType == 'eqstd') { 
				panel.addParameter('groupOption', "eq.eq_std");
                
                panel.addParameter('groupByField', " eq.eq_std");
                
            }
			if (parentType == 'tr') {
                panel.addParameter('groupOption', "hwr.tr_id");
                
                panel.addParameter('groupByField', " hwr.tr_id");
                
            }
			if (parentType == 'repair_type') {
                panel.addParameter('groupOption', "hwr.repair_type");
                
                panel.addParameter('groupByField', " hwr.repair_type");
                
            }
			if (parentType == 'workteam') {
                panel.addParameter('groupOption', "hwr.work_team_id");
                
                panel.addParameter('groupByField', " hwr.work_team_id");
                
            }
			if (parentType == 'causetype') {
                panel.addParameter('groupOption', "hwr.cause_type");
                
                panel.addParameter('groupByField', " hwr.cause_type");
                
            }
			if (parentType == 'prob_type') {
                panel.addParameter('groupOption', "hwr.prob_type");
                
                panel.addParameter('groupByField', " hwr.prob_type");
                
            }
        }
       
        if (openerController) {
            panel.addParameter('consoleRes', openerController.restriction);
        }
        this.abOndemandReportTabsChart.refresh();
        
    }
})


/**
 * Call when we click the bar chart,the file is 'ab-ondemand-report-tabs-chart.axvw'
 * @param {Object} obj
 */
function onBarChartClick(obj){

    var groupOption = obj.selectedChartData['hwr.groupOption'];
    var nullValueTitle = obj.selectedChartData['nullValueTitle'];
    //Parent controller
    var openerController = View.getOpenerView().controllers.get(0);
    //Parent restriction of console
    var res = openerController.restriction;
    var currentController = abOndemandReportTabsChartController;
    var g1, g2;
    if (groupOption.lastIndexOf("no value") >= 0) {
        g1 = '';
    }    
	else if (currentController.parentTypeTag == 'bl' || currentController.parentTypeTag == 'dvdp') {
            g1 = groupOption.split("-")[0];
            g2 = groupOption.split("-")[1];
   }
   else {
            g1 = groupOption;
   }
    
    if (currentController.parentTypeTag == 'bl') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.site_id='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.site_id IS NULL";
		}
		if(g2 != nullValueTitle){
			res = res + " AND hwr.bl_id='" + g2 + "'";
		}
		else{
			res = res + " AND hwr.bl_id IS NULL";
		}
    }
	else if (currentController.parentTypeTag == 'dvdp') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.dv_id='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.dv_id IS NULL";
		}
		if(g2 != nullValueTitle){
			res = res + " AND hwr.dp_id='" + g2 + "'";
		}
		else{
			res = res + " AND hwr.dp_id IS NULL";
		}
    }
    else if (currentController.parentTypeTag == 'ac') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.ac_id='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.ac_id IS NULL";
		}
	}
    else if (currentController.parentTypeTag == 'eqstd') {
		if(g1 != nullValueTitle){
			res = res + " AND eq.eq_std='" + g1 + "'";
		}
		else{
			res = res + " AND eq.eq_std IS NULL";
		}
	}
	else if (currentController.parentTypeTag == 'tr') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.tr_id='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.tr_id IS NULL";
		}
	}
	else if (currentController.parentTypeTag == 'repair_type') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.repair_type='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.repair_type IS NULL";
		}
	}
	else if (currentController.parentTypeTag == 'workteam') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.work_team_id='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.work_team_id IS NULL";
		}
	}
	else if (currentController.parentTypeTag == 'causetype') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.cause_type='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.cause_type IS NULL";
		}
	}
	else if (currentController.parentTypeTag == 'prob_type') {
		if(g1 != nullValueTitle){
			res = res + " AND hwr.prob_type='" + g1 + "'";
		}
		else{
			res = res + " AND hwr.prob_type IS NULL";
		}
	}

    View.openDialog('ab-ondemand-report-tabs-chart-popup-chart.axvw', res, false, {
        width: 600,
        height: 400
    });
    
}
