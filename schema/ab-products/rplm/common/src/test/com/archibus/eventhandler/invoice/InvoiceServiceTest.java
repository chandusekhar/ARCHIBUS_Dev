package com.archibus.eventhandler.invoice;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * JUnit test class for InvoiceService.
 * 
 * @author Ioan Draghici
 * 
 */
public class InvoiceServiceTest extends DataSourceTestBase {
    
    /**
     * Invoice handler.
     */
    private final InvoiceService invoiceHandler = new InvoiceService();
    
    /**
     * Test issue invoices.
     */
    public void testIssueInvoices() {
        final List<Integer> invoices = new ArrayList<Integer>();
        Integer startId = Integer.valueOf("2005000001");
        invoices.add(startId);
        invoices.add(++startId);
        invoices.add(++startId);
        invoices.add(++startId);
        invoices.add(++startId);
        invoices.add(++startId);
        try {
            this.invoiceHandler.issueInvoices(invoices);
        } catch (ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Assign costs to invoice.
     */
    public void testAssignCosts() {
        final List<Integer> costsIds = new ArrayList<Integer>();
        costsIds.add(4536);
        costsIds.add(4537);
        costsIds.add(4538);
        costsIds.add(4539);
        costsIds.add(4540);
        final String ownerType = "lease";
        final String ownerId = "L-XC-06.2004";
        final boolean isIssued = true;
        final DataRecord newValues = getInvoice(2005000023);
        // get test record for new or existing invoice
        
        try {
            this.invoiceHandler.assignCosts(costsIds, ownerType, ownerId, isIssued, newValues);
        } catch (ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Apply payment from prepayment.
     */
    public void testApplyPaymentFromPrepayment() {
        final int invoiceId = 2005000023;
        final int paymentId = 37;
        final String amount = "500.0";
        try {
            this.invoiceHandler.applyPaymentFromPrepayment(invoiceId, paymentId, amount);
        } catch (ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Get invoice record.
     * 
     * @param invoiceId invoice id
     * @return record object
     */
    private DataRecord getInvoice(final int invoiceId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(Constants.INVOICE_TABLE,
                    Constants.INVOICE_FIELDS);
        DataRecord record = dataSource.createNewRecord();
        if (invoiceId > 0) {
            dataSource.addRestriction(Restrictions.eq(Constants.INVOICE_TABLE,
                Constants.INVOICE_ID, invoiceId));
            record = dataSource.getRecord();
        } else {
            record.setValue("invoice.description", "test invoice");
            record.setValue("invoice.contact_id_send_to", "A-DRAKE");
            record.setValue("invoice.terms", "30 DAYS");
        }
        return record;
    }
}
