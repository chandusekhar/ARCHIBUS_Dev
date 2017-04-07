/**
 * Controller implementation.
 */
var abRepmLsadminCommLogConsoleCtrl = View.createController('abRepmLsadminCommLogConsoleCtrl', {
	restriction: null,
	
	/**
	 * Returns the filter restriction object.
	 */
	getFilterRestriction: function(){
		this.restriction = new Ab.view.Restriction();
		
		this.restriction = this.abRepmLsadminCommLogConsole_filter.getRecord().toRestriction();
		
		// remove the date clauses
		if(this.restriction.findClauseIndex("date_of_comm_from") >= 0){
			this.restriction.removeClause("date_of_comm_from");
		}
		if(this.restriction.findClauseIndex("date_of_comm_to") >= 0){
			this.restriction.removeClause("date_of_comm_to");
		}

		// add the date comparison clauses  
		var dateFrom = this.abRepmLsadminCommLogConsole_filter.getFieldValue("date_of_comm_from");
		if (valueExistsNotEmpty(dateFrom)) {
			this.restriction.addClause("ls_comm.date_of_comm", dateFrom, ">=");
		}
		
		var dateTo = this.abRepmLsadminCommLogConsole_filter.getFieldValue("date_of_comm_to");
		if (valueExistsNotEmpty(dateTo)) {
			this.restriction.addClause("ls_comm.date_of_comm", dateTo, "<=");
		}
		
		return this.restriction;
	},

	/**
	 * Returns the sql filter restriction like
	 * EXISTS(SELECT 1 from ls_comm WHERE @param[parentClause] AND ...filterClauses)
	 */
	getSqlFilterRestriction: function(parentClause){
		var sqlRestriction = '1=1';
		
		this.restriction = this.getFilterRestriction();
		
		var clauses = this.restriction.clauses;
		if(clauses.length > 0){
			sqlRestriction = 'EXISTS(SELECT 1 from ls_comm WHERE ls_comm.ls_id is not null';
			for(var i=0; i<clauses.length; i++){
				if(clauses[i].name == 'ls_comm.date_of_comm'){
					sqlRestriction += ' AND ' + clauses[i].name + clauses[i].op + "${sql.date('" + clauses[i].value + "')}";
				}else{
					sqlRestriction += ' AND ' + clauses[i].name + clauses[i].op + "'" + clauses[i].value + "'";
				}
			}
			sqlRestriction += ' AND ' + parentClause + ')';
		}
				
		return sqlRestriction;
	}
});

/**
 * Select value for Project for console panel.
 */
function selectProjectConsole(){
	selectProjectId(abRepmLsadminCommLogConsoleCtrl.abRepmLsadminCommLogConsole_filter.id);
}