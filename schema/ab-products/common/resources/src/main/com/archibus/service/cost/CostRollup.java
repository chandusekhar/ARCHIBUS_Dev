package com.archibus.service.cost;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Calculates roll up costs to cost_tran_sched from cost_tran:
 * <li>All cost_tran records with a chrgbck_status - 'N' are examined
 * <li>Sum by the Roll-up table Id; only fill in that Id in cost_tran_sched
 * <li>Group by cost_cat_id and the roll-up table id
 * <li>cost_tran_sched memo value set to:
 * <li>'Rolled up total from {table} of {cost_cat_id} From: {from date} To: {to date}'
 * <li>{table} = Lease - or Building - or Property
 * <li>{from date} is the earliest date for all the grouped costs
 * <li>{to date} is the latest date for all the grouped costs
 * <li>Records get created in cost_tran_sched with a status of 'AUTO-ROLLUP'
 * <li>When a cost_tran record has been RolledUp or ChargedBack, it's status is set to CS
 * (Charge-back Scheduled)
 */
public class CostRollup {
    
    // ----------------------- constants ---------------------------------------
    
    public static final String ROLLUP_BUILDING_PROPERTY = "BLDG-PROP";
    
    public static final String ROLLUP_LEASE_BUILDING = "LEASE-BLDG";
    
    public static final String ROLLUP_LEASE_PROPERTY = "LEASE-PROP";
    
    // ----------------------- data members ------------------------------------
    
    final private String fromId;
    
    final private String fromRestriction;
    
    final private String fromTables;
    
    final private String fromTableTitle;
    
    final private String groupById;
    
    final private String groupByTable;
    
    final private boolean isMcAndVatEnabled;
    
    final private String rollupType;
    
    // ----------------------- public methods ----------------------------------
    
    /**
     * Constructor.
     * 
     * @param type Roll-up type, one of the ROLLUP_XXX constant values.
     */
    public CostRollup(final String type) {
        this.rollupType = type;
        this.isMcAndVatEnabled = ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        
        if (type.equalsIgnoreCase(ROLLUP_BUILDING_PROPERTY)) {
            this.fromTables = "bl";
            this.fromRestriction = "cost_tran.bl_id = bl.bl_id";
            this.fromTableTitle = CostMessages.MESSAGE_BUILDINGS;
            this.fromId = "bl_id";
            this.groupByTable = "bl";
            this.groupById = "pr_id";
            
        } else if (type.equalsIgnoreCase(ROLLUP_LEASE_BUILDING)) {
            this.fromTables = "ls";
            this.fromRestriction = "cost_tran.ls_id = ls.ls_id";
            this.fromTableTitle = CostMessages.MESSAGE_LEASES;
            this.fromId = "ls_id";
            this.groupByTable = "ls";
            this.groupById = "bl_id";
            
        } else { // ROLLUP_LEASE_PROPERTY
            this.fromTables = "ls, bl";
            this.fromRestriction =
                    "cost_tran.ls_id = ls.ls_id AND ls.bl_id = bl.bl_id AND ls.pr_id IS NULL";
            this.fromTableTitle = CostMessages.MESSAGE_LEASES;
            this.fromId = "ls_id";
            this.groupByTable = "bl";
            this.groupById = "pr_id";
        }
    }
    
    /**
     * Calculates roll-up costs.
     */
    public void calculate(final String costTranRestriction) {
        final String description = getRollupDescription();
        
        String restriction = "chrgbck_status = 'N' AND cost_tran." + this.fromId + " IS NOT NULL";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            restriction = restriction + " AND " + costTranRestriction;
        }
        
        String insertFields = "amount_expense, amount_income,";
        String insertValues = "SUM(cost_tran.amount_expense), SUM(cost_tran.amount_income),";
        String groupBy = "cost_tran.cost_cat_id, " + this.groupByTable + "." + this.groupById;
        if (this.isMcAndVatEnabled) {
            final String budgetCurrency =
                    ContextStore.get().getProject().getBudgetCurrency().getCode();
            insertFields =
                    "amount_expense_base_payment, amount_income_base_payment, ctry_id, currency_payment, currency_budget,";
            insertValues =
                    "SUM(cost_tran.amount_expense_base_payment), SUM(cost_tran.amount_income_base_payment), MAX(cost_tran.ctry_id), cost_tran.currency_payment, "
                            + SqlUtils.formatValueForSql(budgetCurrency) + ",";
            groupBy =
                    "cost_tran.ctry_id, cost_tran.cost_cat_id, cost_tran.currency_payment, "
                            + this.groupByTable + "." + this.groupById;
        }
        
        // Create the roll-up cost records
        String sql =
                "INSERT INTO cost_tran_sched (" + insertFields
                        + " cost_cat_id, date_due, description, status, " + this.groupById + ")"
                        + " SELECT " + insertValues + " cost_tran.cost_cat_id, MAX(date_due), "
                        + description + ", 'AUTO-ROLLUP', " + this.groupByTable + "."
                        + this.groupById + " FROM cost_tran, cost_cat, " + this.fromTables
                        + " WHERE " + restriction + " AND " + this.fromRestriction
                        + " AND cost_cat.cost_cat_id = cost_tran.cost_cat_id "
                        + " AND cost_cat.rollup_prorate LIKE '" + this.rollupType + "%'"
                        + " GROUP BY " + groupBy;
        
        SqlUtils.executeUpdate("cost_tran_sched", sql);
        
        // We need to handle cases for ROLLUP_LEASE_PROPERTY where lease costs are rolled up
        // directly to properties OR first rolled up to a building and then to the property that
        // that building belongs to. We assume that rolling up to properties takes precedence; that
        // is if the ls.pr_id IS NOT NULL then the cost rolls up directly to the property.
        // Since the calculate() method also UPDATEs cost_tran to SET chrgbck_status, we need to
        // execute BOTH sets of calculations within one run of calculate() to insure that all of the
        // costs get rolled up properly before their status is changed.
        if (this.rollupType.equalsIgnoreCase(ROLLUP_LEASE_PROPERTY)) {
            groupBy = "cost_tran.cost_cat_id, ls.pr_id";
            if (this.isMcAndVatEnabled) {
                groupBy =
                        "cost_tran.ctry_id, cost_tran.cost_cat_id, cost_tran.currency_payment, ls.pr_id";
            }
            
            sql =
                    "INSERT INTO cost_tran_sched ("
                            + insertFields
                            + " cost_cat_id, date_due, description, status, pr_id)"
                            + " SELECT "
                            + insertValues
                            + " cost_tran.cost_cat_id, MAX(date_due), "
                            + description
                            + ", 'AUTO-ROLLUP', "
                            + "ls.pr_id"
                            + " FROM cost_tran, cost_cat, ls"
                            + " WHERE "
                            + restriction
                            + " AND cost_tran.ls_id = ls.ls_id AND ls.bl_id IS NULL AND ls.pr_id IS NOT NULL"
                            + " AND cost_cat.cost_cat_id = cost_tran.cost_cat_id "
                            + " AND cost_cat.rollup_prorate LIKE '" + this.rollupType + "%'"
                            + " GROUP BY " + groupBy;
            
            SqlUtils.executeUpdate("cost_tran_sched", sql);
        }
        
        sql =
                "UPDATE cost_tran SET chrgbck_status = 'CS' WHERE "
                        + restriction
                        + " AND EXISTS (SELECT 1 FROM cost_cat WHERE cost_cat.cost_cat_id = cost_tran.cost_cat_id"
                        + " AND cost_cat.rollup_prorate LIKE '" + this.rollupType + "%')";
        
        SqlUtils.executeUpdate("cost_tran", sql);
        
    }
    
    /**
     * Formats the value for the cost_tran_sched.description field.
     * 
     * @return
     */
    private String getRollupDescription() {
        String description =
                "'" + CostMessages.MESSAGE_ROLLUP_TOTAL_FROM + " " + this.fromTableTitle + " "
                        + CostMessages.MESSAGE_OF + " ' ${sql.concat} " + " cost_tran.cost_cat_id "
                        + " ${sql.concat} ' " + CostMessages.MESSAGE_FROM_DATE_DUE
                        + " ' ${sql.concat} ";
        
        if (SqlUtils.isSqlServer()) {
            description = description + " CONVERT(VARCHAR, MIN(date_due)) ";
        } else {
            description = description + " MIN(date_due) ";
        }
        
        description =
                description + " ${sql.concat} ' " + CostMessages.MESSAGE_TO_DATE_DUE
                        + " ' ${sql.concat} ";
        
        if (SqlUtils.isSqlServer()) {
            description = description + " CONVERT(VARCHAR, MAX(date_due)) ";
        } else {
            description = description + " MAX(date_due) ";
        }
        
        return description;
    }
    
}
