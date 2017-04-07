// JavaScript code for ab-ex-form-panel-doc-fields-3-ways.axvw

var testController = View.createController('testController', {

	/**
	 * Set the report cell content to be rewritten after being filled
	 * Add an afterrefresh listener on the form
	 */
    afterViewLoad: function(){
	    this.leaseReport.afterCreateCellContent = function(row, column, cellElement) {
			var value = row[column.id];
			// set cell style depending on cell value
			if (column.id == 'ls.doc' && value != '')	{
				var contentElement = cellElement.childNodes[0];
				contentElement.nodeValue = 'X';
				cellElement.style.fontWeight = 'bold';
			}
		}
		// force the lease report to refresh after the form refreshes due to doc field change
        this.leaseFormStandard.addEventListener('afterRefresh', this.refreshReport);
        this.leaseFormDirect.addEventListener('afterRefresh', this.refreshReport);
        this.leaseFormListened.addEventListener('afterRefresh', this.refreshReport);

		// KB 3024857 Add support for event listeners to document fields
		// Relevant document field events are specified by the constants:
		// [Ab.form.Form.DOC_EVENT_CHECKIN, Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION,
		//  Ab.form.Form.DOC_EVENT_CHECKOUT, Ab.form.Form.DOC_EVENT_DELETE, Ab.form.Form.DOC_EVENT_CHANGE_LOCK_STATUS]
		this.leaseFormListened.addFieldEventListener('ls.doc', Ab.form.Form.DOC_EVENT_CHECKIN, this.myCheckinHandler, this);
		this.leaseFormListened.addFieldEventListener('ls.doc', Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION, this.myCheckInVersionHandler, this);
		this.leaseFormListened.addFieldEventListener('ls.doc', Ab.form.Form.DOC_EVENT_DELETE, this.myDocDeleteHandler, this);
		this.leaseFormListened.addFieldEventListener('ls.doc', Ab.form.Form.DOC_EVENT_CHANGE_LOCK_STATUS, this.myChangeLockHandler, this);

		// alert('A controller script is about to intentionally load a document field listener that does not exist in order to demonstrate a warning that would be fixed during development.');
		// this.leaseFormListened.addFieldEventListener('ls.doc', Ab.form.Form.DOC_EVENT_CHECKOUT, this.myBadCheckOutHandler, this);
		this.leaseFormListened.addFieldEventListener('ls.doc', Ab.form.Form.DOC_EVENT_CHECKOUT, this.myCheckOutHandler, this);
	},

	// After the document is checked in, this function will be called to refresh the other panels
	myCheckinHandler: function (panel, fieldName, parameters) {
        this.leaseFormStandard.refresh();
        this.leaseFormDirect.refresh();
	},

	// After the document is checked out, this function will be called to notify you.
	// Not called in this example because the add call uses the wrong name
	myCheckOutHandler: function (panel, fieldName, parameters) {
		alert('Entered checkout handler for ' + fieldName + ' set to ' + parameters.fileName);		
	},

	// After a new version of the document is checked in, this function will be called to refresh the other panels
	myCheckInVersionHandler: function (panel, fieldName, parameters) {
        this.leaseFormStandard.refresh();
		this.leaseFormDirect.refresh();
	},

	// After the document is marked for deletion, this function will be called to refresh the other panels
	myDocDeleteHandler: function (panel, fieldName, parameters) {
        this.leaseFormStandard.refresh();
        this.leaseFormDirect.refresh();
	},

	// After a new version of the document is checked in, this function will be called to refresh the other panels
	myChangeLockHandler: function (panel, fieldName, parameters) {
		alert('Document for field: ' + fieldName + ' is set to locked = ' + parameters.locked);		
	},


	/**
	 * Use this form of getting the panel for refresh due to early call
	 */
	refreshReport: function() {
        var leaseReport = this.Ab.view.View.panels.get('leaseReport');
        leaseReport.refresh();
	}
});


