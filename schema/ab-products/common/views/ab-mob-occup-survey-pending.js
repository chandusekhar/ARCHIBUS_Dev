var surveyPendingController = View.createController('surveyPendingController',{
	
	survey_id: null,
	
	afterInitialDataFetch: function(){
    	this.tabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
    	
    	// initialize console date fields
    	var date = new Date();
		var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
		var lastYearDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear() - 1, 'YYYY-MM-DD');
		this.consoleSurveyPending.setFieldValue('fromDate',  lastYearDate);
    	this.consoleSurveyPending.setFieldValue('toDate', currentDate);
    },	
    
	consoleSurveyPending_onClear:function() {
		this.gridSurveyPending.show(false);
	},
	
	consoleSurveyPending_onShow:function(){
		var grid = View.panels.get('gridSurveyPending');
		grid.clear();

		var console = View.panels.get('consoleSurveyPending');
		var sqlFilter = "1 = 1";
		var em_id = console.getFieldValue('surveymob_sync.em_id');
		if(em_id){
			sqlFilter += " AND surveymob_sync.em_id = '" + em_id + "'";
		}
		var survey_type = console.getFieldValue('surveymob_sync.survey_type');
		if(survey_type){
			sqlFilter += " AND surveymob_sync.survey_type = '" + survey_type + "'";
		}
		var from_date = console.getFieldValue('fromDate');
		if(valueExistsNotEmpty(from_date)){
			sqlFilter += " AND surveymob_sync.survey_date >= ${sql.date('" + from_date + "')}";
		}
			
		var to_date = console.getFieldValue('toDate');
		if(valueExistsNotEmpty(to_date)){
			sqlFilter += " AND surveymob_sync.survey_date  <= ${sql.date('" + to_date + "')}";
		}
			
		if(valueExistsNotEmpty(from_date) && valueExistsNotEmpty(to_date) && from_date > to_date){
			View.showMessage(getMessage('consoleMobileLogPanel_from_bigger_to'));
		}
		
		grid.refresh(sqlFilter);
		this.tabs.show(false);
	},
    
	gridSurveyPending_onDelete: function(row){
        var dataSource = this.dsSurveyPendingGrid;
        var record = row.getRecord();
        var reportPanel = this.gridSurveyPending;
        View.confirm(getMessage('message_document_confirmdelete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
    },
    
    onClick: function(call) {
    	var grid = View.panels.get('gridSurveyPending');
    	var auto_number = call.restriction["surveymob_sync.auto_number"];

    	var rowCount = grid.gridRows.getCount();
    	for (var i = 0; i < rowCount; i++) {
    	   var row = grid.gridRows.get(i);
    	   if(row.getRecord().getValue('surveymob_sync.auto_number') == auto_number){
    		   survey_id = row.getRecord().getValue('surveymob_sync.survey_id');
    		   this.gridWorkplacePanel.refresh("1 = 1 AND rmpctmob_sync.survey_id = '" + survey_id + "'");
    		   this.gridEmpPanel.refresh("1 = 1 AND em_sync.survey_id = '" + survey_id + "'");
    		   this.gridRoomPanel.refresh("1 = 1 AND surveyrm_sync.survey_id = '" + survey_id + "'");
    		   break;
    	   }
    	}
    },
    
    afterTabChange: function(tabPanel,selectedTabName){
    	
    	if(selectedTabName=='workplaceTrans_tab'){
    		this.gridWorkplacePanel.refresh("1 = 1 AND rmpctmob_sync.survey_id = '" + survey_id + "'");
    	}else if(selectedTabName=='employeesSync_tab'){
    		this.gridEmpPanel.refresh("1 = 1 AND em_sync.survey_id = '" + survey_id + "'");
 		}else if(selectedTabName=='roomSurvey_tab'){
 			this.gridRoomPanel.refresh("1 = 1 AND surveyrm_sync.survey_id = '" + survey_id + "'");
 		}
    }
});