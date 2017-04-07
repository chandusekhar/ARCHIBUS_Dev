var abBldgopsReportArchivedWrCostByMonthController = View.createController('abBldgopsReportArchivedWrCostByMonthController', {
	  afterViewLoad: function() {
		 var openerController = View.getOpenerView().controllers.get(0);
		 var panel=this.abBldgopsReportArchivedWrCostByMonthChart;

		  //groupType:'ac','bl','dvdp','eqstd','proptype',for determining which sub tab calls current chart view
		  var groupType=openerController.groupType;
		 
		  if(groupType){
		  	if(groupType=='ac'){
				panel.addParameter('groupTypeParam',"wrhwr.ac_id");
			}
		  	else if(groupType=='bl'){
				panel.addParameter('groupTypeParam',"RTRIM(wrhwr.site_id)${sql.concat}'-'${sql.concat}RTRIM(wrhwr.bl_id)");
			}
			else if(groupType=='dvdp'){
				panel.addParameter('groupTypeParam',"RTRIM(wrhwr.dv_id)${sql.concat}'-'${sql.concat}RTRIM(wrhwr.dp_id)");
			}
			else if(groupType=='eqstd'){
				panel.addParameter('groupTypeParam',"eq.eq_std");
			}
			else if(groupType=='proptype'){
				panel.addParameter('groupTypeParam',"wrhwr.prob_type");
			}
		  }
	
		 if(openerController){
		 	if (openerController.yearValue && openerController.isCalYear ) {
					panel.addParameter('monthStart', openerController.yearValue + '-01');
					panel.addParameter('monthEnd', openerController.yearValue + '-12');
			}
			else if( openerController.yearValue ){
				var scmprefRec = openerController.afmScmprefDS.getRecord();
				var startMonth =scmprefRec.getValue("afm_scmpref.fiscalyear_startmonth");
				var startDay =scmprefRec.getValue("afm_scmpref.fiscalyear_startday");
				if(startMonth!=1 || startDay!=1 ){
					var endMonth = startMonth-1;
					if(startMonth<10){
						startMonth="0"+startMonth;
					}
					if(endMonth<10){
						endMonth="0"+endMonth;
					}
					panel.addParameter('monthStart', (openerController.yearValue-1)+"-"+startMonth);
					panel.addParameter('monthEnd', openerController.yearValue+"-"+endMonth);
				}
				else{
					panel.addParameter('monthStart', openerController.yearValue+"-01");
					panel.addParameter('monthEnd', openerController.yearValue+"-12");
				}
			}
			else{
				panel.addParameter('monthStart',  '1900-01');
				panel.addParameter('monthEnd',  '2200-12');
			}

			if(openerController.otherRes){
				panel.addParameter('otherRes', openerController.otherRes);
			}
			else{
				panel.addParameter('otherRes', ' 1=1 ');			
			}
		 }

		  this.abBldgopsReportArchivedWrCostByMonthChart.refresh();
    }
})

