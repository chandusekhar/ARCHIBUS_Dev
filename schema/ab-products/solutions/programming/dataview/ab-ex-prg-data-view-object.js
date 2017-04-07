
/**
 * Example controller class.
 */
var dataViewController = View.createController('dataView', {
    
    /**
     * Array of Ab.data.Record object loaded from the DataSource.
     */
    records: null,
    
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        // create data view
        var dataSource = this.prgDataViewObject_myRequestsDataSource;
        this.myRequestsList = new Ab.view.DataView('prgDataViewObject_dataPanel', {
            
            // HTML template text
            bodyTemplate: 'bodyTemplate',
            
            // function returns JS object to be evaluated by the DataView control for each record
            getData: function(record) {
                var id = record.getValue('wr.wr_id');
                var summary = record.getValue('wr.description');
                var dateRequested = record.getValue('wr.date_requested');
                dateRequested = dataSource.formatValue('wr.date_requested', dateRequested, true);
                return {
                    id: id,
                    summary: summary,
                    dateRequested: dateRequested,
                    idTitle: getMessage('idTitle'),
                    summaryTitle: getMessage('summaryTitle'),
                    dateRequestedTitle: getMessage('dateRequestedTitle'),
                    viewDetailsTitle: getMessage('viewDetailsTitle')
                };
            }
        });
    },
    
    afterInitialDataFetch: function() {
        // load and display initial records
        this.prgDataViewObject_myRequestsConsole_onFilter();
    },
    
    /**
     * Loads and displays records based on the selected console values.
     */
    prgDataViewObject_myRequestsConsole_onFilter: function() {
        // load records
        var restriction = this.prgDataViewObject_myRequestsConsole.getFieldRestriction();
        this.records = this.prgDataViewObject_myRequestsDataSource.getRecords(restriction);
        
        // let DataView control display records
        this.myRequestsList.setRecords(this.records);

        // add event listeners to all View Details links
        var controller = this;
        var links = Ext.get('prgDataViewObject_dataPanel').select('a.viewDetails');
        links.each(function (link, scope, index) {
            var listener = controller.onViewDetails.createDelegate(controller, [index]);
            link.addListener('click', listener);
        });
    },
    
    /**
     * Event handler for the View Details link.
     * Opens work request read-only report in a dialog window.
     */
    onViewDetails: function(index) {
        var record = this.records[index];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wr.wr_id', record.getValue('wr.wr_id'));
		
		this.prgDataViewObject_wrReport.refresh(restriction);
        this.prgDataViewObject_wrReport.showInWindow({
            width: 500, 
            height: 300
        });
    },

	/**
	 * Open the DataView content table in Excel:
	 * - send the DataView HTML table to a standard WFR; 
	 * - WFR saves HTML to a temp file using the given extension and returns the file URL;
	 * - open the URL in a new window.
	 */
    prgDataViewObject_myRequestsConsole_onExport: function() {
		var exportXLSParams = {
			html: "<HTML><BODY>" + this.myRequestsList.buffer + "</BODY></HTML>",
			fileExtension: 'xls'
		};
		try	{
			var result = Workflow.call('AbCommonResources-writeHTMLtoFile', exportXLSParams);
			var excelWindow = window.open(result.data.exportFileName, 'exportWindow');			
		}
		catch (e) {
            Workflow.handleError(e);
		}
	}
});