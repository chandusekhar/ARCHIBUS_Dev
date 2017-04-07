//Cross-table example with custom SQL query and drill-down action
var exCrosstableSql = View.createController('exCrosstableSql', {
	
    showDetails: function(context) {
        // the function is called from the view command; the command has the current cell restriction
        var restriction = context.command.restriction;
		 
        //****
        // Demo code (not required for this view to function): 
        // parse restriction to get clicked row record, then parse the record to get all values.
        //****
        var clause = restriction.findClause("gp.bu_dv_dp");
        if (clause != null){
            var pkValue = clause.value;
            var record = this.getClickedRecord(this.abSpVwDpByBl_dpCrossTable.dataSet.records, pkValue);
            if (record != null) {
                //XXX: localized values
                // alert(record.localizedValues);
                //XXX: database value 
                // alert(record.values);
            }
        }
		 
        //****
        // You can add extra restriction values here.
        //****
        // restriction.addClause('gp.bl_id', 'HQ');
		 
        View.openDialog('ab-ex-crosstable-sql-drilldown-details.axvw', restriction, false, {width:600, height:400});
    },
	  
    /**
     * Helper method: finds a record in the array that matches specified PK value.
     */
    getClickedRecord: function(records, pkValue) {
    	var clickedRecord = null;
        
    	for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var values = record.values;
            for (name in values) {
            	// TODO: it will be more reliable to also verify the PK field name
                if (values[name] === pkValue){
                    clickedRecord = record;
                }
            }
        }
        
        return clickedRecord;
    }
});