package com.archibus.eventhandler.invoice;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * Methods to calculate and update invoice costs.
 * 
 * @author Ioan Draghici
 * 
 */
public class PaymentHandler {
    /**
     * Multi-Currency and Vat activity parameter enabled or disabled (true or false).
     */
    private final boolean isVatAndMcEnabled;
    
    /**
     * Invoice id.
     */
    private final int invoiceId;
    
    /**
     * Invoice data source object.
     */
    private final DataSource dataSourceInvoice;
    
    /**
     * Invoice record object.
     */
    private final DataRecord recordInvoice;
    
    /**
     * Constructor.
     * 
     * @param isVatAndMcEnabled boolean
     * @param dataSource data source object
     * @param invoiceId invoice id
     */
    PaymentHandler(final boolean isVatAndMcEnabled, final DataSource dataSource, final int invoiceId) {
        this.isVatAndMcEnabled = isVatAndMcEnabled;
        this.invoiceId = invoiceId;
        this.dataSourceInvoice = dataSource;
        // get invoice record
        this.dataSourceInvoice.addRestriction(Restrictions.eq(Constants.INVOICE_TABLE,
            Constants.INVOICE_ID, this.invoiceId));
        this.recordInvoice = this.dataSourceInvoice.getRecord();
    }
    
    /**
     * Assign selected costs to invoice.
     * 
     * @SupressWarnings "PMD.AvoidUsingSql": Case 2.2 Bulk update UPDATE .. WHERE
     * @param costIds list of cost id's
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    protected void assignCostsToInvoice(final List<Integer> costIds) {
        final String updateQuery =
                "UPDATE cost_tran SET invoice_id = " + this.invoiceId
                        + " WHERE cost_tran.cost_tran_id IN (" + listToSqlString(costIds)
                        + ") AND cost_tran.invoice_id IS NULL";
        SqlUtils.executeUpdate("cost_tran", updateQuery);
    }
    
    /**
     * Calculate and update invoice amounts.
     * 
     */
    protected void updateInvoiceAmounts() {
        // summarize invoice costs
        final DataRecord recCostSum = summarizeCosts();
        double fieldValue;
        if (this.isVatAndMcEnabled) {
            fieldValue = recCostSum.getDouble("cost_tran.amount_base");
            this.recordInvoice.setValue(Constants.AMOUNT_BASE_INVOICE_FULL_NAME, fieldValue);
            
            fieldValue = recCostSum.getDouble("cost_tran.amount_vat");
            this.recordInvoice.setValue(Constants.AMOUNT_VAT_INVOICE_FULL_NAME, fieldValue);
            
            fieldValue = recCostSum.getDouble("cost_tran.amount_total");
            this.recordInvoice.setValue(Constants.AMOUNT_TOT_INVOICE_FULL_NAME, fieldValue);
            
            final String currency = recCostSum.getString("cost_tran.currency_payment");
            this.recordInvoice.setValue(Constants.CURRENCY_INVOICE_FULL_NAME, currency);
            
        } else {
            fieldValue = recCostSum.getDouble("cost_tran.amount");
            this.recordInvoice.setValue(Constants.AMOUNT_TOT_INVOICE_FULL_NAME, fieldValue);
        }
        
        this.dataSourceInvoice.saveRecord(this.recordInvoice);
    }
    
    /**
     * Apply payment to invoice from contact.
     * 
     * @param contactId contact code
     * @param payment payment data record
     * @return prepayment record if exist or null
     */
    protected DataRecord applyPayment(final String contactId, final DataRecord payment) {
        // calculate prepayment if exists
        final double paymentAmount = payment.getDouble(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME);
        // calculate prepayment amount
        final double balance =
                this.recordInvoice.getDouble(Constants.AMOUNT_TOT_INVOICE_FULL_NAME)
                        - this.recordInvoice.getDouble(Constants.AMOUNT_CLOSED_FULL_NAME);
        double prepaymentAmount = paymentAmount - balance;
        if (balance < 0) {
            prepaymentAmount = paymentAmount;
        }
        if (prepaymentAmount < 0.0) {
            prepaymentAmount = 0.0;
        }
        
        payment.setValue(Constants.PAYMENT_TABLE + Constants.DOT + Constants.CONTACT_ID, contactId);
        if (this.isVatAndMcEnabled) {
            payment.setValue(Constants.PAYMENT_TABLE + Constants.DOT + Constants.CURRENCY_INVOICE,
                this.recordInvoice.getValue(Constants.CURRENCY_INVOICE_FULL_NAME));
        }
        // save payment record
        addPayment(payment, paymentAmount - prepaymentAmount, 0);
        
        // get prepayment record
        final DataRecord prepayment = addPayment(payment, 0, prepaymentAmount);
        
        // update invoice closed amount
        updateClosedAmount();
        
        // update status
        final Date datePaid = payment.getDate(Constants.PAYMENT_DATE_PAID_FULL_NAME);
        updateStatus(datePaid);
        
        return prepayment;
    }
    
    /**
     * Apply payment to invoice from prepayment.
     * 
     * @param prepaymentId prepayment code
     * @param amount amount to be applied
     */
    protected void applyPrepayment(final int prepaymentId, final double amount) {
        final DataSource dataSourcePayment =
                DataSourceFactory.createDataSourceForFields(Constants.PAYMENT_TABLE,
                    Constants.PAYMENT_FIELDS);
        // get payment record
        dataSourcePayment.addRestriction(Restrictions.eq(Constants.PAYMENT_TABLE,
            Constants.PAYMENT_ID, prepaymentId));
        final DataRecord recordPrepayment = dataSourcePayment.getRecord();
        // get new payment record
        dataSourcePayment.clearRestrictions();
        final DataRecord recordPayment = dataSourcePayment.createNewRecord();
        copyRecordValues(recordPrepayment, recordPayment);
        // set invoice and amount
        recordPayment.setValue(Constants.PAYMENT_TABLE + Constants.DOT + Constants.INVOICE_ID,
            this.invoiceId);
        recordPayment.setValue(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME, amount);
        
        // update prepayment amount
        final double prepaymentAmount =
                recordPrepayment.getDouble(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME);
        recordPrepayment.setValue(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME, prepaymentAmount
                - amount);
        
        // save records
        dataSourcePayment.saveRecord(recordPayment);
        dataSourcePayment.saveRecord(recordPrepayment);
        
        // update invoice closed amount
        updateClosedAmount();
        
        // update status
        final Date datePaid = recordPrepayment.getDate(Constants.PAYMENT_DATE_PAID_FULL_NAME);
        updateStatus(datePaid);
    }
    
    /**
     * Create SQL string from given list.
     * 
     * @param values list with selected fields values
     * @return selected values formatted as sql string.
     */
    static String listToSqlString(final List<?> values) {
        String result = "";
        for (int index = 0; index < values.size(); index++) {
            final String separator = index == 0 ? "" : ",";
            result += separator + SqlUtils.formatValueForSql(values.get(index));
        }
        return result;
    }
    
    /**
     * Summarize selected costs and return data record.
     * 
     * @return data record
     */
    private DataRecord summarizeCosts() {
        // define grouping data source
        final DataSourceGroupingImpl dsCostSumm = new DataSourceGroupingImpl();
        dsCostSumm.addTable(Constants.ACTUAL_COST_TABLE);
        dsCostSumm.addGroupByField(Constants.ACTUAL_COST_TABLE, Constants.INVOICE_ID,
            DataSource.DATA_TYPE_INTEGER);
        // add cost fields
        String fieldSqlFormula;
        Map<String, String> sqlExpressions = null;
        VirtualFieldDef fieldDef = null;
        if (this.isVatAndMcEnabled) {
            // amount total
            fieldSqlFormula =
                    "SUM(cost_tran.amount_income_total_payment - cost_tran.amount_expense_total_payment)";
            sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, fieldSqlFormula);
            fieldDef =
                    new VirtualFieldDef(Constants.ACTUAL_COST_TABLE, "amount_total",
                        DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
            dsCostSumm.addCalculatedField(fieldDef);
            
            // amount vat
            fieldSqlFormula =
                    "SUM(cost_tran.amount_income_vat_payment - cost_tran.amount_expense_vat_payment)";
            sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, fieldSqlFormula);
            fieldDef =
                    new VirtualFieldDef(Constants.ACTUAL_COST_TABLE, "amount_vat",
                        DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
            dsCostSumm.addCalculatedField(fieldDef);
            
            // amount base
            fieldSqlFormula =
                    "SUM(cost_tran.amount_income_base_payment - cost_tran.amount_expense_base_payment)";
            sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, fieldSqlFormula);
            fieldDef =
                    new VirtualFieldDef(Constants.ACTUAL_COST_TABLE, "amount_base",
                        DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
            dsCostSumm.addCalculatedField(fieldDef);
            
            // currency payment
            fieldSqlFormula = "MAX(cost_tran.currency_payment)";
            sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, fieldSqlFormula);
            fieldDef =
                    new VirtualFieldDef(Constants.ACTUAL_COST_TABLE, "currency_payment",
                        DataSource.DATA_TYPE_TEXT);
            fieldDef.addSqlExpressions(sqlExpressions);
            dsCostSumm.addCalculatedField(fieldDef);
            
        } else {
            fieldSqlFormula = "SUM(cost_tran.amount_income - cost_tran.amount_expense)";
            sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, fieldSqlFormula);
            fieldDef =
                    new VirtualFieldDef(Constants.ACTUAL_COST_TABLE, "amount",
                        DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
            dsCostSumm.addCalculatedField(fieldDef);
        }
        
        dsCostSumm.addRestriction(Restrictions.eq(Constants.ACTUAL_COST_TABLE,
            Constants.INVOICE_ID, this.invoiceId));
        return dsCostSumm.getRecord();
    }
    
    /**
     * Add new payment record.
     * 
     * @param payment values data record
     * @param paymentAmount payment amount
     * @param prepaymentAmount prepayment amount
     * @return new record pk and amount
     */
    private DataRecord addPayment(final DataRecord payment, final double paymentAmount,
            final double prepaymentAmount) {
        final DataSource dataSourcePayment =
                DataSourceFactory.createDataSourceForFields(Constants.PAYMENT_TABLE,
                    Constants.PAYMENT_FIELDS);
        final DataRecord record = dataSourcePayment.createNewRecord();
        // copy payment values
        copyRecordValues(payment, record);
        
        // save payment record
        DataRecord pkRecord = null;
        if (paymentAmount > 0.0) {
            // if is payment set invoice id and save
            record.setValue(Constants.PAYMENT_TABLE + Constants.DOT + Constants.INVOICE_ID,
                this.invoiceId);
            record.setValue(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME, paymentAmount);
            pkRecord = dataSourcePayment.saveRecord(record);
        } else if (prepaymentAmount > 0.0) {
            // if is prepayment save record and add prepayment amount
            record.setValue(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME, prepaymentAmount);
            pkRecord = dataSourcePayment.saveRecord(record);
            // add amount income field for prepayment value
            pkRecord.addField(record.findField(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME)
                .getFieldDef());
            pkRecord.setValue(Constants.PAYMENT_AMOUNT_INCOME_FULL_NAME, prepaymentAmount);
        }
        return pkRecord;
    }
    
    /**
     * Update invoice closed amount.
     * 
     * @SupressWarnings "PMD.AvoidUsingSql": Case 2.2 Bulk update UPDATE .. WHERE
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void updateClosedAmount() {
        String isNull = "ISNULL(";
        if (SqlUtils.isOracle()) {
            isNull = "NVL(";
        }
        final String updateQuery =
                "UPDATE invoice SET amount_closed = (SELECT "
                        + isNull
                        + "SUM(amount_income), 0) FROM invoice_payment WHERE invoice_payment.invoice_id = "
                        + SqlUtils.formatValueForSql(this.invoiceId)
                        + ") WHERE invoice.invoice_id = "
                        + SqlUtils.formatValueForSql(this.invoiceId);
        SqlUtils.executeUpdate(Constants.INVOICE_TABLE, updateQuery);
        
    }
    
    /**
     * Update invoice status.
     * 
     * @SupressWarnings "PMD.AvoidUsingSql": Case 2.2 Bulk update UPDATE .. WHERE
     * 
     * @param datePaid payment date
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void updateStatus(final Date datePaid) {
        // IOAN sybase 10 bug ?! assertion failed
        final String sqlInvoiceUpdate =
                "UPDATE invoice SET status = (CASE WHEN amount_tot_invoice = amount_closed THEN 'CLOSED' ELSE status END) WHERE invoice_id = "
                        + SqlUtils.formatValueForSql(this.invoiceId);
        final String sqlCostUpdate =
                "UPDATE cost_tran SET status = 'RECEIVED', date_paid = "
                        + SqlUtils.formatValueForSql(datePaid) + " WHERE invoice_id = "
                        + SqlUtils.formatValueForSql(this.invoiceId);
        SqlUtils.executeUpdate(Constants.INVOICE_TABLE, sqlInvoiceUpdate);
        SqlUtils.executeUpdate(Constants.ACTUAL_COST_TABLE, sqlCostUpdate);
    }
    
    /**
     * Copy record values from source to target.
     * 
     * @param source source data record
     * @param target target data record
     */
    private void copyRecordValues(final DataRecord source, final DataRecord target) {
        for (final DataValue field : target.getFields()) {
            final String fieldName = field.getName();
            // do not copy auto number values
            if (!field.getFieldDef().isAutoNumber() && source.valueExists(fieldName)) {
                target.setValue(fieldName, source.getValue(fieldName));
            }
        }
    }
}
