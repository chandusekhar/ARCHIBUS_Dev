
var abCompRptConsoleController = View.createController('abCompRptConsoleController', {
	/**
	 * common method, get console restriction.
	 */
	getConsoleRestriction: function(){
        var inputRestriction = this.abCompSelectRegulationConsole.getFieldRestriction();
		var restPart = "";
		
		//for Citation fields, use a LIKE %field value% restriction.
		var citationClause = "";
		var citation = "";
		var compLevel = "";
		var vnId = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			if (clause.value==''||clause.value==0) {
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.name=="regulation.citation"){
					citation = clause.value;
					continue;
				}
				if(clause.name=="regulation.regulation"){
					continue;
				}
				if(clause.name=="regprogram.comp_level"){
					compLevel = clause.value;
					continue;
				}
				if(clause.name=="regprogram.vn_id"){
					vnId = clause.value;
					continue;
				}
				if(clause.op == "IN"){
					if(clause.name=="regulation.citation"){
						citationArray = clause.value;
						continue;
					}else{
						restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
					}
				}else{
					if(clause.name=="regulation.legal_refs"){
						clause.value = "%"+clause.value+"%";
						clause.op="LIKE";
					}
					restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
				}
			}
		}
		
//		Rank is a virtual field, a drop-down list with the selections: High, Medium, Low.  
		var obj = {"0":"1,2,3","1":"4,5,6","2":"7,8,9"};
		var reg_rank_val = $('virtual_reg_rank').value;
		if(valueExistsNotEmpty(reg_rank_val)){
			restPart = restPart + " AND regulation.reg_rank in (" + obj[reg_rank_val] + ")";
		}
		
		var restriction ="1=1";
		
		var fieldRegulation = this.abCompSelectRegulationConsole.getFieldValue("regulation.regulation");
		if(fieldRegulation){
			if($("childId").checked){
				var string = "%"+fieldRegulation+"|%";
				restPart = restPart + " AND hierarchy_ids like '"+string+"'";
			}else{
				restPart = restPart + " AND regulation.regulation like '"+fieldRegulation+"'";
			}
		}
		if(restPart.indexOf('regrequirement')!=-1){
			restPart = " and exists (select 1 from regprogram,regrequirement " +
			"where regprogram.regulation = regulation.regulation and regrequirement.reg_program = regprogram.reg_program "+ restPart+")";
		}else if(restPart.indexOf('regprogram')!=-1){
			restPart = " and exists (select 1 from regprogram " +
			"where regprogram.regulation = regulation.regulation "+ restPart+")";
		}
		//Regulatory Citation: WHERE regulation.citation LIKE '%value%' OR EXISTS 
		//(SELECT regulation FROM regrequirement WHERE regrequirement.regulation=regulation.regulation 
		//AND regrequirement.citation LIKE '%value%').
		if(citation!=""){
			
			if(typeof(citation)=="object"){
				for(var i=0;i<citation.length;i++){
					var requirementCitation = " OR EXISTS (SELECT 1 FROM regrequirement " +
							"WHERE regrequirement.regulation=regulation.regulation " +
							"AND regrequirement.citation LIKE '%" + citation[i] + "%' )"
					citationClause = citationClause + "(regulation.citation LIKE " + "'%" + citation[i] + "%'"+requirementCitation+ ") or ";
		   		}
		   		//remove last 'or' string and add this clause to restriction.
		   		restPart = restPart + " AND ( "+ citationClause.substring(0,citationClause.length-4)+ " )";
		   	}else{
		   		var requirementCitation = " OR EXISTS (SELECT 1 FROM regrequirement " +
				"WHERE regrequirement.regulation=regulation.regulation " +
				"AND regrequirement.citation LIKE '%" + citation + "%' )"
				citationClause = citationClause + "(regulation.citation LIKE " + "'%" + citation + "%'"+requirementCitation+ ")";
	
		   		//remove last 'or' string and add this clause to restriction.
		   		restPart = restPart + " AND ( "+ citationClause + " )";
		   	}
		}
		restriction += restPart;
		
		/*
		 * Compliance Level:
		 *  WHERE EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation AND regprogram.comp_level IN (list))
		 *   OR EXISTS (SELECT regulation FROM regrequirement WHERE regrequirement.regulation=regulation.regulation 
		 *   AND regrequirement.comp_level IN (list)).
		 *   Same approach as above for Vendor Code.
		 */
		if(compLevel!=""){
			if(typeof(compLevel)=="object"){
				var listCompLevel = this.changeFormatForSqlIn(compLevel);
				restriction = restriction + " AND (EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation " +
				"AND regprogram.comp_level IN (" + listCompLevel + ")) OR EXISTS (SELECT regulation FROM regrequirement " +
				"WHERE regrequirement.regulation=regulation.regulation AND regrequirement.comp_level IN (" + listCompLevel + ")))";
			}else{
				restriction = restriction + " AND (EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation " +
				"AND regprogram.comp_level = '" + compLevel + "') OR EXISTS (SELECT regulation FROM regrequirement " +
				"WHERE regrequirement.regulation=regulation.regulation AND regrequirement.comp_level = '" + compLevel + "'))";
			}
		}
		if(vnId!=""){
			if(typeof(vnId)=="object"){
				var listVnId = this.changeFormatForSqlIn(vnId);
				restriction = restriction + " AND (EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation " +
				"AND regprogram.vn_id IN (" + listVnId + ")) OR EXISTS (SELECT regulation FROM regrequirement " +
				"WHERE regrequirement.regulation=regulation.regulation AND regrequirement.vn_id IN (" + listVnId + ")))";
			}else{
				restriction = restriction + " AND (EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation " +
				"AND regprogram.vn_id = '" + vnId + "') OR EXISTS (SELECT regulation FROM regrequirement " +
				"WHERE regrequirement.regulation=regulation.regulation AND regrequirement.vn_id = '" + vnId + "'))";
			}
		}
		
		//location restriction.
		if(View.locationRestriction){
			restriction += " and exists (select 1 from regloc,compliance_locations " +
			"where regulation.regulation = regloc.regulation and regloc.location_id = compliance_locations.location_id"+ View.locationRestriction+")";
		}
		return restriction;
    },
	
	 /**
     * filter console show button click.
     */
    abCompSelectRegulationConsole_onShow: function(){
    	var restriction = this.getConsoleRestriction();
		this.abCompSelectRegulation.refresh(restriction);
    },

	/*
	* EventHandler for action "Clear": clear console,  set custom dropdown list to select none 
	*/
    abCompSelectRegulationConsole_onClear: function(){
    	
		this.abCompSelectRegulationConsole.clear();
		setOptionValue("virtual_reg_rank",-1);
		
		//clear virtual location field value and View.locationRestriction, this method is defined in ab-comp-locations-console.js
		clearConsoleFields();
		
		//empty custom fields.
		$('childId').checked = false;
    },

    /**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+array[i]+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    }
});