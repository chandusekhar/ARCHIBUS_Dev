package com.archibus.eventhandler.invoice;

import java.util.*;

import com.archibus.app.common.finance.dao.datasource.ActualCostDataSource;
import com.archibus.app.common.finance.domain.ActualCost;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.StringUtil;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * Provide methods to manage invoices.
 * <p>
 * <li/><b>assignCosts</b> - Assign costs to new or existing invoice.
 * <li/><b>issueInvoices</b> - Issue invoices.
 * <li/><b>applyPayment</b> - Apply payment (prepayment) to invoice.
 * <li/><b>applyPaymentFromPrepayment</b> - Apply payment to invoice from prepayment.
 * </p>
 * <br/>
 * 
 * @author Ioan Draghici
 * 
 */
public class InvoiceService extends EventHandlerBase {
    
    /**
     * Invoice description.
     */
    // @translatable
    public static final String INVOICE_DESCRIPTION = "Monthly Rent Payment from ";
    
    /**
     * Multi-Currency and Vat activity parameter enabled or disabled (true or false).
     */
    private boolean isVatAndMcEnabled;
    
    /**
     * Invoice data source.
     */
    private DataSource dataSourceInvoice;
    
    /**
     * Assign costs to new or existing invoice.
     * <ul>
     * <li/>create/update invoice record
     * <li/>assign selected costs to invoice
     * <li/>update invoice amounts.
     * </ul>
     * 
     * @param costIds list of cost id's
     * @param ownerType owner type ("account", "building", "property" or "lease")
     * @param ownerId owner code
     * @param isIssued if new invoice is issued or not
     * @param newValues data record with invoice field values.
     * @return record with primary key value
     */
    public DataRecord assignCosts(final List<Integer> costIds, final String ownerType,
            final String ownerId, final boolean isIssued, final DataRecord newValues) {
        // initialize global variables
        initRequestState();
        
        // update invoice new values
        final DataRecord recInvoice = updateInvoice(ownerType, ownerId, isIssued, newValues);
        final int invoiceId = recInvoice.getInt(Constants.INVOICE_ID_FULL_NAME);
        // assign costs to invoice
        final PaymentHandler paymentHandler =
                new PaymentHandler(this.isVatAndMcEnabled, this.dataSourceInvoice, invoiceId);
        paymentHandler.assignCostsToInvoice(costIds);
        // update invoice amounts
        paymentHandler.updateInvoiceAmounts();
        
        return recInvoice;
    }
    
    /**
     * Issue invoices. Set status 'ISSUED' for selected invoices.
     * 
     * @SupressWarnings "PMD.AvoidUsingSql": Case 2.2 Bulk update UPDATE .. WHERE ..
     * @param invoices invoice id's list
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void issueInvoices(final List<Integer> invoices) {
        final String sqlUpdate =
                "UPDATE " + Constants.INVOICE_TABLE + " SET " + Constants.STATUS
                        + " = 'ISSUED' WHERE " + Constants.INVOICE_ID + " IN ("
                        + PaymentHandler.listToSqlString(invoices) + ")";
        SqlUtils.executeUpdate(Constants.INVOICE_TABLE, sqlUpdate);
    }
    
    /**
     * Apply payment to invoice.
     * 
     * @param invoiceId invoice code
     * @param contactId contact code
     * @param payment payment record
     * @return prepayment record if exist or null
     */
    public DataRecord applyPayment(final int invoiceId, final String contactId,
            final DataRecord payment) {
        initRequestState();
        // apply payment to invoice
        final PaymentHandler paymentHandler =
                new PaymentHandler(this.isVatAndMcEnabled, this.dataSourceInvoice, invoiceId);
        final DataRecord prepayment = paymentHandler.applyPayment(contactId, payment);
        return prepayment;
    }
    
    /**
     * Apply payment to invoice from existing prepayment.
     * 
     * @param invoiceId invoice code
     * @param prepaymentId prepayment code
     * @param paymentAmount payment amount to be applied (neutral string)
     */
    public void applyPaymentFromPrepayment(final int invoiceId, final int prepaymentId,
            final String paymentAmount) {
        initRequestState();
        final double amount = Double.valueOf(paymentAmount);
        final PaymentHandler paymentHandler =
                new PaymentHandler(this.isVatAndMcEnabled, this.dataSourceInvoice, invoiceId);
        paymentHandler.applyPrepayment(prepaymentId, amount);
        
    }
    
    public void onAutoAssing(final List<Integer> costIds) {
        // initialize global variables
        initRequestState();
        
        final ActualCostDataSource actualCostDataSource = new ActualCostDataSource();
        final List<ActualCost> costs = actualCostDataSource.findByCostIds(costIds);
        for (final ActualCost cost : costs) {
            createInvoiceForCost(cost);
        }
    }
    
    /**
     * Initialize global variables. Activity parameter for Multi Currency and VAT, data source
     * object.
     * 
     */
    private void initRequestState() {
        this.isVatAndMcEnabled = ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        if (this.dataSourceInvoice == null) {
            this.dataSourceInvoice =
                    DataSourceFactory.createDataSourceForFields(Constants.INVOICE_TABLE,
                        Constants.INVOICE_FIELDS);
            this.dataSourceInvoice.setApplyVpaRestrictions(false);
        }
    }
    
    /**
     * Read current values from database if is an existing invoice or new record if is new invoice.
     * 
     * @param newValues new invoice values
     * @return current record
     */
    private DataRecord getInvoice(final DataRecord newValues) {
        DataRecord tmpRecord = null;
        if (newValues.isNew()) {
            // create new record and save it into database
            tmpRecord = this.dataSourceInvoice.createNewRecord();
        } else {
            final int invoiceId = newValues.getInt(Constants.INVOICE_ID_FULL_NAME);
            // add restriction to data source and get current record
            this.dataSourceInvoice.addRestriction(Restrictions.eq(Constants.INVOICE_TABLE,
                Constants.INVOICE_ID, invoiceId));
            tmpRecord = this.dataSourceInvoice.getRecord();
            // clear data source restriction
            this.dataSourceInvoice.clearRestrictions();
        }
        return tmpRecord;
    }
    
    /**
     * Create/ update invoice record with new values and save it into database.
     * 
     * @param ownerType owner type
     * @param ownerId owner code
     * @param isIssued if invoice is issued
     * @param newValues new invoice values
     * @return updated record
     */
    private DataRecord updateInvoice(final String ownerType, final String ownerId,
            final boolean isIssued, final DataRecord newValues) {
        final DataRecord tmpRecord = getInvoice(newValues);
        // set owner field
        final String ownerField = getOwnerField(ownerType, true);
        tmpRecord.setValue(ownerField, ownerId);
        
        // update status
        if (isIssued) {
            tmpRecord.setValue(Constants.STATUS_FULL_NAME, Constants.STATUS_VALUE_ISSUED);
        } else {
            tmpRecord.setValue(Constants.STATUS_FULL_NAME, Constants.STATUS_VALUE_NA);
        }
        
        // update other fields
        updateFieldValue(Constants.INVOICE_TABLE.concat(".contact_id_send_to"), tmpRecord,
            newValues);
        updateFieldValue(Constants.INVOICE_TABLE.concat(".contact_id_remit_to"), tmpRecord,
            newValues);
        updateFieldValue(Constants.INVOICE_TABLE.concat(".date_sent"), tmpRecord, newValues);
        updateFieldValue(Constants.INVOICE_TABLE.concat(".date_expected_rec"), tmpRecord, newValues);
        updateFieldValue(Constants.INVOICE_TABLE.concat(".terms"), tmpRecord, newValues);
        updateFieldValue(Constants.INVOICE_TABLE.concat(".description"), tmpRecord, newValues);
        
        DataRecord recUpdated = this.dataSourceInvoice.saveRecord(tmpRecord);
        if (recUpdated == null) {
            // if is existing record result is null
            recUpdated = new DataRecord();
            recUpdated.addField(this.dataSourceInvoice.findField(Constants.INVOICE_ID_FULL_NAME));
            updateFieldValue(Constants.INVOICE_ID_FULL_NAME, recUpdated, tmpRecord);
        }
        return recUpdated;
    }
    
    /**
     * Update specified field value if value exists.
     * 
     * @param fieldName field name
     * @param record current record
     * @param values new values
     */
    private void updateFieldValue(final String fieldName, final DataRecord record,
            final DataRecord values) {
        if (values.valueExists(fieldName)) {
            record.setValue(fieldName, values.getValue(fieldName));
        }
    }
    
    /**
     * Get owner field name.
     * 
     * @param type owner type
     * @param isFullName if full name should be returned [table_name.field_name]
     * @return field name
     */
    private String getOwnerField(final String type, final boolean isFullName) {
        String field = "";
        if (isFullName) {
            field = Constants.INVOICE_TABLE.concat(Constants.DOT);
        }
        if (Constants.OWNER_TYPE_LEASE.equals(type)) {
            field += Constants.LEASE_ID;
        } else if (Constants.OWNER_TYPE_BUILDING.equals(type)) {
            field += Constants.BUILDING_ID;
        } else if (Constants.OWNER_TYPE_PROPERTY.equals(type)) {
            field += Constants.PROPERTY_ID;
        } else if (Constants.OWNER_TYPE_ACCOUNT.equals(type)) {
            field += Constants.ACCOUNT_ID;
        }
        return field;
    }
    
    /**
     * Create invoice for specified actual cost
     * 
     * @param cost actual cost object
     */
    private void createInvoiceForCost(final ActualCost cost) {
        final DataSource invoiceDataSource =
                DataSourceFactory.createDataSourceForFields(Constants.INVOICE_TABLE,
                    Constants.INVOICE_FIELDS);
        final DataRecord invoiceRecord = invoiceDataSource.createNewRecord();
        final DataRecord leaseRecord = getLease(cost.getLeaseId());
        
        final String description =
                INVOICE_DESCRIPTION
                        + (StringUtil.notNullOrEmpty(leaseRecord.getString("ls.tn_name")) ? leaseRecord
                            .getString("ls.tn_name") : "");
        
        // update field values
        invoiceRecord.setValue("invoice.description", description);
        invoiceRecord.setValue("invoice.ls_id", cost.getLeaseId());
        invoiceRecord
            .setValue("invoice.contact_id_send_to", leaseRecord.getString("ls.tn_contact"));
        invoiceRecord.setValue("invoice.contact_id_remit_to",
            leaseRecord.getString("ls.ld_contact"));
        
        final Date costDateDue = cost.getDateDue();
        invoiceRecord.setValue("invoice.date_sent", costDateDue);
        final Calendar cal = Calendar.getInstance();
        cal.setTime(costDateDue);
        cal.add(Calendar.MONTH, 1);
        invoiceRecord.setValue("invoice.date_expected_rec", cal.getTime());
        invoiceRecord.setValue(Constants.STATUS_FULL_NAME, Constants.STATUS_VALUE_NA);
        final DataRecord invoiceRec = invoiceDataSource.saveRecord(invoiceRecord);
        
        final int invoiceId = invoiceRec.getInt(Constants.INVOICE_ID_FULL_NAME);
        this.dataSourceInvoice.clearRestrictions();
        // assign costs to invoice
        final PaymentHandler paymentHandler =
                new PaymentHandler(this.isVatAndMcEnabled, this.dataSourceInvoice, invoiceId);
        final List<Integer> costs = new ArrayList<Integer>();
        costs.add(cost.getId());
        paymentHandler.assignCostsToInvoice(costs);
        // update invoice amounts
        paymentHandler.updateInvoiceAmounts();
    }
    
    /**
     * Get lease record.
     * 
     * @param leaseCode lease code
     * @return data record
     */
    private DataRecord getLease(final String leaseCode) {
        final DataSource leaseDataSource =
                DataSourceFactory.createDataSourceForFields("ls", new String[] { "ls_id",
                        "tn_name", "ld_name", "ld_contact", "tn_contact" });
        leaseDataSource.addRestriction(Restrictions.eq("ls", "ls_id", leaseCode));
        return leaseDataSource.getRecord();
    }
    
}
