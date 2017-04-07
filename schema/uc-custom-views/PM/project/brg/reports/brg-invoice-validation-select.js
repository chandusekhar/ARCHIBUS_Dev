var brgInvoiceValidationSelect = View.createController('brgInvoiceValidationSelect', {

	afterViewLoad: function() {
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

	},

	openEditDialog: function(row) {

		var parameters = {
			invoice_id : row['invoice.invoice_id'],
			callback: function(re) {
				// do Nothing
			}
		};

		View.openDialog('brg-invoice-validation-edit.axvw', null, false, parameters);

	},

    invoiceList_onAssignWorkPackage: function() {
        if (this.invoiceList.gridRows.getCount() > 0) {
            var project_id = this.invoiceList.gridRows.get(0).getRecord().getValue('invoice.project_id');
            View.selectValue(
            'invoiceEdit',
            'Select Work Package to assign to...',
            ['invoice.work_pkg_id'],
            'work_pkgs',
            ['work_pkgs.work_pkg_id'],
            ['work_pkgs.work_pkg_id', 'work_pkgs.po', 'work_pkgs.status','work_pkgs.description'],
            "work_pkgs.project_id = '"+project_id.replace(/'/g,"''")+"'",
            'afterWorkPkgSelect',
            false,
            false,
            '');
        }
        else {
            return;
        }
    }
});

function openEditDialog(row) {
	brgInvoiceValidationSelect.openEditDialog(row);
}

function restrictInvoiceList(row) {
    View.panels.get("invoiceList").refresh("invoice.project_id='"+row['project.project_id'].replace(/'/g,"''")+"'");
}

function afterWorkPkgSelect(previousValue, selectedValue) {
    // get selected invoice records and update its work package id
    var invoiceListPanel = View.panels.get("invoiceList");
    var selectedRecords = invoiceListPanel.getSelectedRecords();
    var dataSource = View.dataSources.get("ds_invoice_noproj");
    for (i = 0; i < selectedRecords.length; i++) {
        var invoice_id = selectedRecords[i].getValue("invoice.invoice_id");
        var project_id = selectedRecords[i].getValue("invoice.project_id");
        var newRecord = new Ab.data.Record();
        newRecord.isNew = false;
        newRecord.setValue('invoice.invoice_id', invoice_id);
        newRecord.setValue('invoice.project_id', project_id);
        newRecord.setValue('invoice.work_pkg_id', selectedValue);

        newRecord.oldValues = new Object();
        newRecord.oldValues['invoice.invoice_id'] = invoice_id;

        dataSource.saveRecord(newRecord);
    }

    invoiceListPanel.refresh();
    return false;
}