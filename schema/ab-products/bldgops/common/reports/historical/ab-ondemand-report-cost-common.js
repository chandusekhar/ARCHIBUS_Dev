function generateCostRes(controller) {
        controller.yearValue = document.getElementById("selectYear").value;
		var calYear = document.getElementsByName("cal_year");
		if(calYear[1].checked){
			controller.isCalYear = false;
		}
		else{
			controller.isCalYear = true;			
		}

		var restriction = "";
		if(controller.isCalYear){
           restriction += " AND ${sql.yearMonthOf('wrhwr.date_completed')}  &gt;='" + controller.yearValue + "-01'";
           restriction += " AND ${sql.yearMonthOf('wrhwr.date_completed')}  &lt;='" + controller.yearValue + "-12'";
        }
		else{
			var scmprefRec = controller.afmScmprefDS.getRecord();
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
				var monthStart = (controller.yearValue-1)+"-"+startMonth;
				var monthEnd = controller.yearValue+"-"+endMonth;
			}
			else{
				var monthStart = controller.yearValue+"-01";
				var monthEnd = controller.yearValue+"-12";
			}
			restriction += " AND ${sql.yearMonthOf('wrhwr.date_completed')}  &gt;='" + monthStart + "'";
			restriction += " AND ${sql.yearMonthOf('wrhwr.date_completed')}  &lt;='" + monthEnd + "'";
		}
		return restriction;
}
