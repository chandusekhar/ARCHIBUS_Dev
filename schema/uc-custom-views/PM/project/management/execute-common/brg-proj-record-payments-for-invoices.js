var projRecordPaymentsForInvoicesController = View.createController('projRecordPaymentsForInvoices', {
    projRecordPaymentsForInvoicesForm_onSave : function() {
        this.projRecordPaymentsForInvoicesForm.save();
        this.applyPaymentToVendorInvoice();
    },

    projRecordPaymentsForInvoicesForm_onDelete : function() {
        var controller = this;
        View.confirm(getMessage('confirmDelete'), function(button) {
            if (button == 'yes') {
                controller.projRecordPaymentsForInvoicesForm.deleteRecord();
                controller.applyPaymentToVendorInvoice();
            }
        });
    },

    applyPaymentToVendorInvoice : function() {
        var invoice_id = this.projRecordPaymentsForInvoicesForm.getFieldValue('invoice_payment.invoice_id');
        var parameters = {'invoice.invoice_id':invoice_id};
        var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-applyPaymentToVendorInvoice', parameters);
        if (result.code == 'executed') {
            this.projRecordPaymentsForInvoicesGridPayments.refresh();
            this.projRecordPaymentsForInvoicesGridInvoices.refresh();
            this.projRecordPaymentsForInvoicesColumnReportInvoice.refresh();
            opener.View.closeDialog();
        }
        else
        {
            View.showMessage(result.code + " :: " + result.message);
        }
    },

    projRecordPaymentsForInvoicesForm_beforeSave : function() {
        var contSave = true;

        var reviewed = this.projRecordPaymentsForInvoicesForm.getFieldValue("invoice_payment.reviewed");
        if (reviewed == '1')
        {
            // Ensure that activity_log_id is filled before setting the "reviewed" flag.
            var activity_log_id = this.projRecordPaymentsForInvoicesForm.getFieldValue("invoice_payment.activity_log_id");
            if (activity_log_id == "" || activity_log_id == "0") {
                contSave = false;
                View.showMessage("The Action Item ID must be non-zero before the payment can be considered Reviewed.");
                this.projRecordPaymentsForInvoicesForm.setFieldValue("invoice_payment.reviewed", '0');
            }
        }

        return contSave;
    }
});

function actLogSelvalWithRestriction()
{
    var form = View.panels.get('projRecordPaymentsForInvoicesForm');
    var invoice_id = form.getFieldValue('invoice_payment.invoice_id');
    var restriction = "activity_log.project_id = (SELECT project_id FROM invoice WHERE invoice.invoice_id = "+invoice_id+")";
    View.selectValue('projRecordPaymentsForInvoicesForm','Action Item ID',['invoice_payment.activity_log_id'],'activity_log',['activity_log.activity_log_id'],['activity_log.activity_log_id','activity_log.work_pkg_id','activity_log.action_title','activity_log.description','activity_log.activity_type'],restriction,null,false);
}