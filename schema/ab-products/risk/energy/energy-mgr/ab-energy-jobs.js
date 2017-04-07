var controller = View.createController('scenarioCtrl',{
	afterViewLoad:function(){
		//this.setLabel();
	},
	setLabel: function(){	
		var text = getMessage('text');
        	text = text.replace( /&lt;/g, '<' );
        	text = text.replace( /&gt;/g, '>' );
		
		$('text').innerHTML = text;
	}
});	

function getWeatherStationData(){
	View.openProgressBar(getMessage('msg_please_wait'));
	try{
		var result = Workflow.callMethod('AbRiskEnergyManagement-RetrieveWeatherStations-getWeatherStationData');
		if (result.code = "executed") {
			if (result.message.length == 0) {
				View.showMessage(getMessage('msg_job_exec'));
			}
			else {				
				View.showMessage(getMessage('msg_job_exec') + '<br/>' + getMessage('msg_missing_data_warning') + '<br/>' + getMessage('msg_warning_column_headers') + result.message);
			}
			View.closeProgressBar();
		}else{
			View.closeProgressBar();
			View.showMessage(getMessage('msg_job_failed'));
			return;
		}		
	} catch (e) {
		Workflow.handleError(e)
		View.closeProgressBar();
	}
}
function populateWeatherStationList(){
	View.openProgressBar(getMessage('msg_please_wait'));
	try{
		var result = Workflow.callMethod('AbRiskEnergyManagement-RetrieveWeatherStations-populateWeatherStationList')
		if (result.value) {
			View.showMessage(getMessage('msg_job_exec'));
			View.closeProgressBar();
		}else{
			View.closeProgressBar();
			View.showMessage(getMessage('msg_job_failed'));
			return;
		}		
	} catch (e) {
		Workflow.handleError(e)
		View.closeProgressBar();
	}	
}
function processRegressionModel(){
	View.openProgressBar(getMessage('msg_please_wait'));
	try{
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-processRegressionModel')
		if (result.value) {
			View.showMessage(getMessage('msg_job_exec'));
			View.closeProgressBar();
		}else{
			View.closeProgressBar();
			View.showMessage(getMessage('msg_job_failed'));
			return;
		}		
	} catch (e) {
		Workflow.handleError(e)
		View.closeProgressBar();
	}	
}


