
/**
 * Example controller class.
 * Shows how to:
 * - load records from the DataSource (database);
 * - modify record values programmatically;
 * - display original and updated values using standard columnReport panel;
 * - save updated record to the DataSource (database);  
 */
var dataController = View.createController('data', {
    
    /**
     * Data record that we will programmatically load, modify, and save.
     */
    record: null,

    /**
     * This function is called after the initial data fetch is complete for all panels.
     */
    afterInitialDataFetch: function() {
        this.onModelUpdate();
    },
    
    /**
     * Loads the record from the DataSource.
     */
    prgData_requestReport_onLoad: function() {
        this.record = this.prgData_requestDataSource.getRecord();
        this.onModelUpdate();
    },

    /**
     * Adds one day to the date_requested record value.
     * Updates the displayed value.
     */    
    prgData_requestReport_onAddOneDay: function() {
        // get record value as a Date object 
        var dateRequested = this.record.getValue('wr.date_requested');
        
        // add one day
        dateRequested = dateRequested.add(Date.DAY, 1);
        
        // set record value as a Date object
        this.record.setValue('wr.date_requested', dateRequested);
        
        // update displayed values from the record
        this.onModelUpdate();
    },

    /**
     * Adds one hour to the time_requested record value.
     * Updates the displayed value.
     */    
    prgData_requestReport_onAddOneHour: function() {
        // get record value as a Date object 
        var timeRequested = this.record.getValue('wr.time_requested');
        
        // add one hour
        timeRequested = timeRequested.add(Date.HOUR, 1);
        
        // set record value as a Date object
        this.record.setValue('wr.time_requested', timeRequested);
        
        // update displayed values from the record
        this.onModelUpdate();
    },
    
    /**
     * Displays object and localized date and time values.
     */
    prgData_requestReport_onShow: function() {
        var dateRequested = this.record.getValue('wr.date_requested');
        var dateRequestedLocalized = this.prgData_requestDataSource.formatValue('wr.date_requested', dateRequested, true);
        
        var timeRequested = this.record.getValue('wr.time_requested');
        var timeRequestedLocalized = this.prgData_requestDataSource.formatValue('wr.time_requested', timeRequested, true);
        
        var message = String.format(
            'Date requested object value (Date): {0}<br/>' +
            'Date requested localized value: {1}<br/>' +
            'Time requested object value (Date): {2}<br/>' +
            'Time requested localized value: {3}', 
            dateRequested, dateRequestedLocalized, timeRequested, timeRequestedLocalized);
        View.showMessage(message);
    },

    /**
     * Saves the record to the DataSource.
     */
    prgData_requestReport_onSave: function() {
        this.prgData_requestDataSource.saveRecord(this.record);
    },
    
    /**
     * Displays the current Model state in the View:
     * - displays the updated record in the report panel;
     * - displays the updated instruction text;
     */
    onModelUpdate: function() {
        var instructionText = '';
        
        if (this.record) {
            this.prgData_requestReport.setRecord(this.record);
            
            instructionText = getMessage('instructionTitle') 
                            + getMessage('instructionStep2') 
                            + getMessage('instructionStep3') 
                            + getMessage('instructionStep4') 
                            + getMessage('instructionStep5');    
        } else {
            this.prgData_requestReport.clear();
            
            instructionText = getMessage('instructionTitle') 
                            + getMessage('instructionStep1');    
        }
        
        $('prgData_instructions').innerHTML = instructionText;
    },

    /**
     * Loads a data source from a file, and uses it to query records.
     */
    prgData_html_onLoadDataSource: function() {
        var dataSource = Ab.data.loadDataSourceFromFile('ab-datasource-highlights.axvw', 'highlightDepartmentsDs');
        if (dataSource) {
            var records = dataSource.getRecords();
            View.alert(records.length);
        }
    }
});