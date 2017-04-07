var htBookingController = View.createController('bookingController', {

    afterViewLoad: function(){
        YAHOO.widget.Chart.SWFURL = View.contextPath + "/schema/ab-products/workplace/hoteling/reports/yui28/charts.swf";
		var yearSelect = this.getSystemYear();
		this.setParametersByUser();
		this.setParametersByYear(yearSelect);
        this.abTestCrossTable.addEventListener('afterRefresh', this.abTestCrossTable_afterRefresh, this);
	},

	abTestCrossTable_afterRefresh:function(){
		this.abTestCrossTable.show(false);
		this.customChart_HotelUtilizationChart.show(false);
        this.customChartOnUpdate();
		this.customChart_HotelUtilizationChart.show(true);
	},

	setParametersByUser:function(){
		var dvId = View.user.employee.organization.divisionId;
		var dpId = View.user.employee.organization.departmentId;

		if(dvId){
			this.abTestCrossTable.addParameter('dvRes', "rmpct.dv_id='"+dvId+"'");
		}
		else{
			this.abTestCrossTable.addParameter('dvRes', "1=1");
		}

		if(dpId){
			this.abTestCrossTable.addParameter('dpRes', "rmpct.dp_id='"+dpId+"'");
		}
		else{
			this.abTestCrossTable.addParameter('dpRes', "1=1");
		}
		this.abTestCrossTable.refresh();
	},

	setParametersByYear:function(year){
		for (var i = 1; i <= 12; i++) {
			var daysOfMonth = (new Date(year, i, 0)).getDate();
			var startDayOfMonth = year+'-'+i+"-01";
			var endDayOfMonth = year+'-'+i+'-'+daysOfMonth;
			this.abTestCrossTable.addParameter('mon'+i+'FirstDate', startDayOfMonth);
			this.abTestCrossTable.addParameter('mon'+i+'LastDate', endDayOfMonth);
			this.abTestCrossTable.addParameter('mon'+i+'Days', daysOfMonth);
		}
		this.abTestCrossTable.refresh();
		this.abTestCrossTable.setTitle(getMessage("tableTitle")+ year);
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

	 /**
     * Update chart by calling a custom WFR to get 1D data set.
     */
	customChartOnUpdate: function() {
            var rowValue = this.abTestCrossTable.dataSet.rowValues[0];
            var record = this.abTestCrossTable.dataSet.records[0];

			var chartDataset = this.abTestCrossTable.dataSet;
			var records = chartDataset.records;

			var chartFieldNames=[ "bl_fl_rm", "month_1", "month_2", "month_3", "month_4", "month_5", "month_6", 
												"month_7", "month_8", "month_9", "month_10", "month_11", "month_12"];
			var chartFieldDisplayNames=[ "bl_fl_rm", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
												"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var chartData = [];
			for(var i=1; i<chartFieldNames.length;i++){
				var chartRecord = {};
				chartRecord['month'] = getMessage(chartFieldDisplayNames[i]);
				for (var r = 0; r < records.length; r++) {
					chartRecord['bl_fl_rm'+r] = records[r]['values']['rmpct.'+chartFieldNames[i]];
				}
				chartData.push(chartRecord);
			}

			 var myDataSource = new YAHOO.util.DataSource(chartData);
			 myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;

			 var chartFields = [];
			 chartFields.push('month');
			 for (var r = 0; r < records.length; r++) {
				 var fieldName = 'bl_fl_rm'+r;
				 chartFields.push(fieldName);
			 }
			 myDataSource.responseSchema = {
				 fields: chartFields
			 };
			
			var seriesDef = [];
			for (var r = 0; r < records.length; r++) {
				var series = {};
				series['displayName'] = records[r].getValue("rmpct.bl_fl_rm");
				series['yField'] = 'bl_fl_rm'+r;
				var d = Math.floor(Math.random()*Math.pow(2,24)).toString(16); 
				series['style'] = { size:8, color:d  };
				seriesDef.push(series);
			}
        	                                           
 		    var styleDef={ legend: {		display: "bottom"
				}
			};

           var chart = new YAHOO.widget.LineChart(
                'customChart_chart', 
                myDataSource, 
                {
                    xField: "month",
                    series: seriesDef,
					style:styleDef
                }); 
    }
});
