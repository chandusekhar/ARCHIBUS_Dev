var brgInvoiceValidationEdit = View.createController('brgInvoiceValidationEdit', {

    afterViewLoad: function() {
        //turn off print icon and mail icon.
        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);

    },

    afterInitialDataFetch: function() {
        var rest = "invoice_id = "+View.parameters.invoice_id;

        this.invoiceEdit.refresh(rest);
        this.paymentList.refresh(rest);
    },

    paymentList_onCreatenNewInvoice: function() {
        this.newInvoice.refresh({},true);
        // copy over some values
        this.newInvoice.setFieldValue("invoice.project_id", this.invoiceEdit.getFieldValue("invoice.project_id"));
        this.newInvoice.setFieldValue("invoice.work_pkg_id", this.invoiceEdit.getFieldValue("invoice.work_pkg_id"));
        this.newInvoice.setFieldValue("invoice.int_num", this.invoiceEdit.getFieldValue("invoice.int_num"));

        this.newInvoice.showInWindow({
            newRecord: true,
            closeButton: true
        });
    },

    paymentList_onReassignSelectedPayments: function() {
        var project_id = this.invoiceEdit.getFieldValue('invoice.project_id');
        View.selectValue(
        'invoiceEdit',
        'Select Invoice to reassign to...',
        ['invoice.invoice_id'],
        'invoice',
        ['invoice.invoice_id'],
        ['invoice.invoice_id', 'invoice.vn_invoicenum','invoice.project_id', 'invoice.work_pkg_id'],
        "invoice.project_id = '"+project_id.replace(/'/g,"''")+"'",
        'afterInvoiceSelect',
        false,
        false,
        '');
    }

});

function afterInvoiceSelect(previousValue, selectedValue) {
    var oldInvoiceId = View.panels.get("invoiceEdit").getFieldValue("invoice.invoice_id");

    // get selected payment records and update its invoice number
    var paymentListPanel = View.panels.get("paymentList");
    var selectedRecords = paymentListPanel.getSelectedRecords();
    var dataSource = View.dataSources.get("ds_invoice_payment");
    for (i = 0; i < selectedRecords.length; i++) {
        var payment_id = selectedRecords[i].getValue("invoice_payment.payment_id");
        var newRecord = new Ab.data.Record();

        newRecord.isNew = false;
        newRecord.setValue('invoice_payment.payment_id', payment_id);
        newRecord.setValue('invoice_payment.invoice_id', selectedValue);

        newRecord.oldValues = new Object();
        newRecord.oldValues['invoice_payment.payment_id'] = payment_id;

        dataSource.saveRecord(newRecord);
    }


    var parameters = {"invoice.invoice_id":selectedValue};
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-applyPaymentToVendorInvoice', parameters);

    var parameters = {"invoice.invoice_id":oldInvoiceId};
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-applyPaymentToVendorInvoice', parameters);

    View.panels.get("invoiceEdit").refresh();
    paymentListPanel.refresh();
    return false;
}