
//loads the ArcWeb Explorer SWF map
function get_key()
{
	//read the ArcWebServices key from database
	var param_id = 'ESRIArcWebServicesKey';
	var parameters ={	tableName: 'afm_activity_params',
						fieldNames: toJSON(['afm_activity_params.param_value']),
						restriction: toJSON({'afm_activity_params.param_id':param_id})
					};     

	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

	if (result.code == 'executed') 
	{
    	var record = result.data.records[0];
      	var key_value = record['afm_activity_params.param_value'];
      	return key_value;
   	}
	else 
	{
  		Ab.workflow.Workflow.handleError(result);
   	}   	
}

