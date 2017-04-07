function afterSelectMsds(commandContext){
	var chemicalId = commandContext.restriction["msds_chemical.chemical_id"];
	var ds = View.dataSources.get("abCbDefSampComp_msdsLookupDs");
	var record = ds.getRecord(commandContext.restriction);
	
	if(View.parameters.callback){
		View.parameters.callback(chemicalId, record.getValue("msds_chemical.cas_number"));
	}
	
}