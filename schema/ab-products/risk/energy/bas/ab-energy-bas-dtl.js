var energyBasDtlController = View.createController('energyBasDtl', {
	
	afterInitialDataFetch: function() { 
		var interval = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.sampling_interval');
		setSamplingIntervalOption(interval);
		
		var metersInclude = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.meters_to_include');
		if (metersInclude != "") this.energyBasEdit_dataPointForm.setInstructions(getMessage('virtualMeter'));
		else this.energyBasEdit_dataPointForm.setInstructions("");
	}
});

function setSamplingIntervalOption(samplingIntervalValue){
	var form = View.panels.get('energyBasEdit_dataPointForm');
	var selectedOption = 'other';
	if(parseInt(samplingIntervalValue) == 900){
		selectedOption = 'minute';
	}else if(parseInt(samplingIntervalValue) == 3600){
		selectedOption = 'hourly';	
	}else if(parseInt(samplingIntervalValue) == 86400){
		selectedOption = 'daily';	
	}else if(parseInt(samplingIntervalValue) == 604800){
		selectedOption = 'weekly';	
	}else if(parseInt(samplingIntervalValue) == 2592000){
		selectedOption = 'monthly';	
	}else if(parseInt(samplingIntervalValue) == 7776000){
		selectedOption = 'quarterly';	
	}else if(parseInt(samplingIntervalValue) == 31536000){
		selectedOption = 'yearly';
	}
	
	form.setFieldValue('interval', selectedOption);
	form.enableField('bas_data_point.sampling_interval', selectedOption == 'other');
}