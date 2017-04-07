
View.createController('test', {
	
	wrConsole_onDisplay: function() {
		var record = this.wrConsole.getRecord();
		record.setValue('wr.date_requested', new Date());
		this.wrConsole.setRecord(record);
	},
    
    wrForm_onDisplay: function() {
        // get value set in AXVW using ${sql.currentDate}
        var currentDate = this.wrForm.fields.get('wr.date_requested').fieldDef.value;
        
        // copy it to the form field (the form will format it)
        this.wrForm.setFieldValue('wr.date_requested', currentDate);
        
        // programmatically parse and format the value using DataSource API and display the result
        var parsedDate = this.dataSource.parseValue('wr.date_requested', currentDate, false);
        var formattedDate = this.dataSource.formatValue('wr.date_requested', parsedDate, true);
        this.wrForm.setFieldValue('wr.description', 'The value of the wr.date_requested field set in AXVW = [' + currentDate + '], formatted value = [' + formattedDate + ']');
    }
});
