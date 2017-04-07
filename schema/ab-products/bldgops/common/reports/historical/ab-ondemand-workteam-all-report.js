
var abondemandWorkTeamRptController =  View.createController("abondemandWorkTeamRptController",{
	
	otherRes:" 1=1 ", 
	surveyRes:" 1=1 ", 
	fieldsArraysForRestriction:null, 

	afterInitialDataFetch: function(){
		this.fieldsArraysForRestriction =  new Array(['site.site_id', ,'hwr_month.site_id'], ['hwr.prob_type', 'like', 'hwr_month.prob_type']);
		var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
	},
	
	requestConsole_onFilter: function(){
		this.otherRes = getRestrictionStrFromConsole(this.requestConsole, new Array(['site.site_id', ,'hwr_month.site_id']));
		var probType = this.requestConsole.getFieldValue("wr.prob_type");
		if(probType){
			this.otherRes = this.otherRes + " AND hwr_month.prob_type like '%"+probType+"%'";
		}
		
		var year = document.getElementById("selectYear").value;
		var calYear = document.getElementsByName("cal_year");
		var isCalYear = calYear[0].checked;

		if(isCalYear){
			this. otherRes  +=  " AND ${sql.yearMonthOf('hwr_month.date_completed')} LIKE \'" + year + "%\'";
        }
		else{
			var scmprefRec = this.afmScmprefDS.getRecord();
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
				var monthStart = (year-1)+"-"+startMonth;
				var monthEnd = year+"-"+endMonth;
			}
			else{
				var monthStart = year+"-01";
				var monthEnd = year+"-12";
			}
			this. otherRes += " AND ${sql.yearMonthOf('hwr_month.date_completed')}  &gt;='" + monthStart + "'";
			this. otherRes += " AND ${sql.yearMonthOf('hwr_month.date_completed')}  &lt;='" + monthEnd + "'";
		}
		this.surveyRes = this.otherRes.replace(/hwr_month/g, "a"); 
		this.reportPanel.addParameter("otherRes", this.otherRes);
		this.reportPanel.addParameter("surveyRes", this.surveyRes);
		this.reportPanel.refresh();
	},
	
	reportPanel_onShowChart: function(){
        View.openDialog('ab-ondemand-workteam-all-report-chart.axvw', null, false, {width:800, height:800});
	},

	requestConsole_onClear: function(){
		var curYear	= new Date().getFullYear();
		setDefaultValueForHtmlField(['selectYear'],[curYear]);
		this.requestConsole.clear();
		this.reportPanel.show(false);
	}
	
});

function onClickItem(obj) {
	View.panels.get("hwrGridPanel").addParameter("otherRes", View.controllers.get('abondemandWorkTeamRptController').otherRes);
	if (obj.restriction.clauses.length == 0) {
		View.panels.get("hwrGridPanel").refresh(" 0=0 ");
	}
	else{
		View.panels.get("hwrGridPanel").refresh(obj.restriction);
	}
	View.panels.get("hwrGridPanel").showInWindow({
        width: 1000,
        height: 380,
        closeButton: false
    });
}
