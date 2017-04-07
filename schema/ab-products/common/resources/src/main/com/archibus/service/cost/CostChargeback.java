package com.archibus.service.cost;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.space.*;
import com.archibus.utility.*;

/**
 * ECLIPSE USERS: This class contains SQL statements formatted for ease of maintenance - do not
 * re-format them. In Eclipse, set the Preferences --> Java --> Editor --> Save Actions to
 * <p>
 * Format Source Code : Format Edited Lines.
 * 
 * <p>
 * Performs roll-up and chargeback (proration) of Costs recorded in the cost_tran table according to
 * the Roll-Up and Proration settings in cost_cat (Cost Categories) table. Each Cost record has a
 * Cost Category foreign-key value - this value determines how that cost will be rolled-up and/or
 * charged back.
 * 
 * <p>
 * Rolling up a building cost to properties and then charging it back to Leases: It would appear
 * that each original cost is now accounted for 3 times - for the building, for the property, and
 * then for the Leases. This is true. Each entity (bldg, property, lease) can be considered as one
 * account. Costs are assigned at most once per account. Also the only costs which are paid are
 * those which are invoiced. Typically the costs will only be invoiced at one level - typically
 * leases.
 * 
 * <p>
 * Prorating property or building costs to leases: the Negotiated Area of the lease is always used
 * as the basis for proration.
 * 
 * <p>
 * Rolled Up costs and Chargeback costs are stored in the cost_tran_sched table with a status of
 * 'AUTO-ROLLUP' or 'AUTO-CHARGEBACK' until the Approve Chargeback Costs action has been run. Then
 * they move to the cost_tran table and get a chrgbck_status of Rolled up ('RU') or Prorated ('PR')
 * 
 * <p>
 * Rolled Up costs are summed and grouped according cost category and the roll-up entity id (either
 * a Property Id or Building Id). Because a number of costs are grouped together the roll up cost
 * does not exactly represent a cost for a particular date. The date_due assigned to the roll-up
 * cost is the last date from the costs which have been grouped. To insure that the roll up costs
 * most accurately represent the costs for a time period it is useful to fun the Cost Chargeback
 * action on a regular basis such as monthly.
 * 
 * <p>
 * For lease chargeback the rules in the Lease Chargeback Agreements table are also used to
 * determine the pro-rated value for particular Leases. Note: Direct bill costs are not subject to
 * the Lease Chargeback because they are costs which have already been directly applied to the
 * lease. At the time a user applies those costs they should consider and check the lease chargeback
 * agreement to determine the actual cost to assign to the lease.
 * 
 * <pre>
 * Notes on the chargeback calculations:
 * 
 * CHARGEBACK cases are:
 * Direct Bill
 * Properties to Leases
 * Buildings to Leases
 * Leases to Departments
 * Properties to Buildings
 * Properties to Leases
 * 
 * ALL-NONE-DIRECT --- just set chrgbck_status to 'CS'
 * 
 * '---- Rollup then chargeback - recs all from cost_tran_sched with status of 'AUTO-ROLLUP'
 * BLDG-PROP-NONE
 * BLDG-PROP-LEASE
 * LEASE-BLDG-NONE
 * LEASE-PROP-NONE
 * 
 * '---- Just chargeback - recs all from cost_tran
 * PROP-NONE-BLDG
 * PROP-NONE-LEASE
 * BLDG-NONE-LEASE
 * LEASE-NONE-DEPT
 * 
 * Notes:
 * - cost_tran.chrgbck_status: N,CS,CA,RU,PR
 * 
 *   CHARGE-BACK cost_tran COSTS:
 *      o All cost_tran records with a chrgbck_status - 'N' are examined
 *      o All cost_tran_sched records with a status - 'AUTO-ROLLUP' are examined
 *      o cost_tran_sched memo value set to:
 *           'Prorated portion from {tablename-id_value} of {source cost memo}
 *                {tablename-id_value} = Lease - or Bldg - or Prop -
 *      o When a cost_tran record has been RolledUp or ChargedBack it's
 *           status is set to CS
 *      o Records get created in cost_tran_sched with status of 'AUTO-CHARGEBACK'
 * 
 *      Proration rules:
 * 
 *           From Properties to Leases: Prorated Cost for each Lease =
 *                Cost for Property as a Whole * Negotiated Area of Lease
 *                     / Total Negotiated Area of all Leases on the Property
 * 
 *           From Buildings to Leases: Prorated Cost for each Lease =
 *                Cost for Building as a Whole * Negotiated Rent. Area of Lease
 *                     / Total Negotiated Rentable Area of all Leases in the Bldg
 * 
 *           From Properties to Buildings: Prorated Cost for each Building =
 *                Cost Assigned to Property as a Whole * Building Rentable Area
 *                     / Total Building Rentable Area of all Bldgs in the Property
 * 
 *           Prorating Lease Costs to Departments:
 *                Based on the measured rentable for suites, groups, or rooms
 *                based on your chosen Lease Area method.
 *             The chargeable areas for Suites, Groups, or Rooms
 *             Get Recalced In Recalc Section based on Lease Area Method
 * </pre>
 * 
 * <p>
 * History:
 * <li>Web Central 17.3: Ported from costchgb.abs.
 * 
 * @author Sergey Kuramshin
 */
public class CostChargeback {
    
    // ----------------------- constants ---------------------------------------
    
    public static final String PRORATE_ALL_NONE_DIRECT = "ALL-NONE-DIRECT";
    
    public static final String PRORATE_BUILDING_NONE_LEASE = "BLDG-NONE-LEASE";
    
    public static final String PRORATE_BUILDING_PROPERTY_LEASE = "BLDG-PROP-LEASE";
    
    // the following values must match the STORED enumeration values for cost_cat.rollup_prorate
    
    public static final String PRORATE_BUILDING_PROPERTY_NONE = "BLDG-PROP-NONE";
    
    public static final String PRORATE_LEASE_BUILDING_NONE = "LEASE-BLDG-NONE";
    
    public static final String PRORATE_LEASE_NONE_BUILDING = "PROP-NONE-BLDG";
    
    public static final String PRORATE_LEASE_NONE_DEPARTMENT = "LEASE-NONE-DEPT";
    
    public static final String PRORATE_LEASE_PROPERTY_NONE = "LEASE-PROP-NONE";
    
    public static final String PRORATE_PROPERTY_NONE_BUILDING = "PROP-NONE-BLDG";
    
    public static final String PRORATE_PROPERTY_NONE_LEASE = "PROP-NONE-LEASE";
    
    public static final String ROLLUP_BUILDING_PROPERTY = "BLDG-PROP";
    
    public static final String ROLLUP_LEASE_BUILDING = "LEASE-BLDG";
    
    public static final String ROLLUP_LEASE_PROPERTY = "LEASE-PROP";
    
    // ----------------------- business methods --------------------------------
    
    /**
     * APPROVE ALL CHARGEBACK COSTS:
     * <ul>
     * <li>When a cost_tran_sched AUTO-ROLLUP record is approved:
     * <li>- a cost_tran record is created with a chrgbck_status of RU
     * <li>When a cost_tran_sched AUTO-CHARGEBACK record is approved:
     * <li>- a cost_tran record is created with a chrgbck_status of PR
     * <li>All cost_tran_sched 'AUTO-ROLLUP' and 'AUTO-CHARGEBACK' records are deleted
     * <li>All cost_tran records with chrgbck_status = CS get set to CA
     * 
     * @param restriction on the cost_tran_recur records.
     */
    public static void approveAllChargebackCosts(final String restriction,
            final boolean isMcAndVatEnabled) {
        String costFields =
                "pr_id, bl_id, ls_id, dv_id, dp_id, amount_expense, amount_income, "
                        + "cost_cat_id, date_due, date_paid, description";
        if (isMcAndVatEnabled) {
            costFields =
                    "pr_id, bl_id, ls_id, dv_id, dp_id, cost_cat_id, date_due, date_paid, description,"
                            + "amount_income, amount_income_vat_budget, amount_income_base_budget,"
                            + "amount_expense, amount_expense_vat_budget, amount_expense_base_budget, "
                            + "amount_income_total_payment, amount_income_vat_payment, amount_income_base_payment, "
                            + "amount_expense_total_payment, amount_expense_vat_payment, amount_expense_base_payment,"
                            + "currency_budget, currency_payment, date_used_for_mc_budget, date_used_for_mc_payment,"
                            + "exchange_rate_budget, exchange_rate_payment, exchange_rate_override, "
                            + "ctry_id, vat_percent_value, vat_percent_override, vat_amount_override";
        }
        
        String sql =
                "INSERT INTO cost_tran (" + costFields + ", chrgbck_status, status)" + " SELECT "
                        + costFields + " , 'RU', 'PAYABLE'"
                        + " FROM cost_tran_sched WHERE status = 'AUTO-ROLLUP'";
        if (StringUtil.notNullOrEmpty(restriction)) {
            sql = sql + " AND " + restriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
        
        sql =
                "INSERT INTO cost_tran (" + costFields + ", chrgbck_status, status)" + " SELECT "
                        + costFields + " , 'PR', 'PAYABLE'"
                        + " FROM cost_tran_sched WHERE status = 'AUTO-CHARGEBACK'";
        if (StringUtil.notNullOrEmpty(restriction)) {
            sql = sql + " AND " + restriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
        
        sql =
                "UPDATE cost_tran SET status = 'RECEIVABLE'"
                        + " WHERE amount_income > amount_expense AND status = 'PAYABLE'";
        SqlUtils.executeUpdate("cost_tran", sql);
        
        sql = "DELETE FROM cost_tran_sched WHERE status IN ( 'AUTO-ROLLUP', 'AUTO-CHARGEBACK' )";
        if (StringUtil.notNullOrEmpty(restriction)) {
            sql = sql + " AND " + restriction;
        }
        SqlUtils.executeUpdate("cost_tran_sched", sql);
        
        sql = "UPDATE cost_tran SET chrgbck_status = 'CA' WHERE chrgbck_status = 'CS'";
        SqlUtils.executeUpdate("cost_tran", sql);
        
    }
    
    /**
     * Performs roll-up and chargeback (proration) of Costs recorded in the cost_tran table
     * according to the Roll-Up and Proration settings in cost_cat (Cost Categories) table.
     * 
     * @param costTranRestriction on cost_tran records.
     * @param isDeleteExistingChargeback
     * @param isRecalculatePropertyAndLeaseAreas
     */
    public static void calculateChargebackCosts(final String costTranRestriction,
            final boolean isDeleteExistingChargeback,
            final boolean isRecalculatePropertyAndLeaseAreas, final boolean isMcAndVatEnabled,
            final JobStatus status) {
        final long totalNo = 100;
        status.setTotalNumber(totalNo);
        status.setCurrentNumber(0);
        
        if (scheduledChargebackCostsExist()) {
            if (isDeleteExistingChargeback) {
                deleteExistingChargebackCosts(costTranRestriction);
                status.setCurrentNumber(totalNo * 10 / 100);
            } else {
                // @non-translatable
                final String message =
                        "Can not create new chargeback costs unless all existing chargeback costs are either approved or deleted.";
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_COMPLETE);
                throw new ExceptionBase(message);
            }
        }
        
        if (isRecalculatePropertyAndLeaseAreas) {
            LeaseAreaUpdate.updateLeaseAreas();
            status.setCurrentNumber(totalNo * 20 / 100);
            PropertyAreaUpdate.updateBuildingAndPropertyAreas();
            status.setCurrentNumber(totalNo * 30 / 100);
        }
        
        setStatusOfCostsWithBadOwners(costTranRestriction);
        status.setCurrentNumber(totalNo * 40 / 100);
        
        calculateCostsRollUps(costTranRestriction, isMcAndVatEnabled, status);
        status.setCurrentNumber(totalNo * 70 / 100);
        
        calculateCostsProrations(costTranRestriction, isMcAndVatEnabled, status);
        status.setCurrentNumber(totalNo * 90 / 100);
        
        checkChargebackCostsAgainstLeaseChargeBackAgreements(isMcAndVatEnabled);
        
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    // ----------------------- implementation methods ---------------------------------------------
    
    /**
     * The following rollup_prorate values for for cost categories are just used for chargeback. All
     * costs with these rollup_prorate values will come only from the cost_tran table.
     * PROP-NONE-BLDG, PROP-NONE-LEASE, BLDG-NONE-LEASE, LEASE-NONE-DEPT
     */
    private static void calculateCostProrationsForCostTranRecords(final String costTranRestriction,
            final boolean isMcAndVatEnabled) {
        final String leaseAreaTable = LeaseAreaUpdate.getLeaseAreaTable();
        
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("cost_tran", DataSource.ROLE_MAIN);
        ds.addTable("cost_cat", DataSource.ROLE_STANDARD);
        if (isMcAndVatEnabled) {
            ds.addField("cost_tran", new String[] { "cost_tran_id", "pr_id", "bl_id", "ls_id",
                    "amount_expense_base_payment", "amount_income_base_payment", "cost_cat_id",
                    "date_due", "description", "chrgbck_status", "currency_budget",
                    "currency_payment", "ctry_id", "exchange_rate_override", "vat_amount_override",
                    "vat_percent_override" });
        } else {
            ds.addField("cost_tran", new String[] { "cost_tran_id", "pr_id", "bl_id", "ls_id",
                    "amount_expense", "amount_income", "cost_cat_id", "date_due", "description",
                    "chrgbck_status" });
        }
        ds.addField("cost_cat", "rollup_prorate");
        ds.addRestriction(Restrictions.eq("cost_tran", "chrgbck_status", "N"));
        ds.addRestriction(Restrictions
            .sql("rollup_prorate IN ('PROP-NONE-BLDG', 'PROP-NONE-LEASE', 'BLDG-NONE-LEASE', 'LEASE-NONE-DEPT')"));
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            ds.addRestriction(Restrictions.sql(costTranRestriction));
        }
        
        final List<DataRecord> records = ds.getAllRecords();
        for (final DataRecord record : records) {
            final String prorateType = record.getString("cost_cat.rollup_prorate");
            
            if (prorateType.equalsIgnoreCase(PRORATE_PROPERTY_NONE_BUILDING)) {
                proratePropertyCostToBuildings(record, isMcAndVatEnabled);
                
            } else if (prorateType.equalsIgnoreCase(PRORATE_PROPERTY_NONE_LEASE)) {
                proratePropertyCostToLeases(record, isMcAndVatEnabled, false);
                
            } else if (prorateType.equalsIgnoreCase(PRORATE_BUILDING_NONE_LEASE)) {
                prorateBuildingCostToLeases(record, isMcAndVatEnabled);
                
            } else if (prorateType.equalsIgnoreCase(PRORATE_LEASE_NONE_DEPARTMENT)) {
                prorateLeaseCostToDepartments(record, leaseAreaTable, isMcAndVatEnabled);
            }
            
        }
        
        String sql =
                "UPDATE cost_tran SET chrgbck_status = 'CS'"
                        + " WHERE chrgbck_status = 'N'"
                        + " AND EXISTS (SELECT 1 FROM cost_cat"
                        + " WHERE cost_cat.cost_cat_id = cost_tran.cost_cat_id"
                        + " AND cost_cat.rollup_prorate IN ( 'PROP-NONE-BLDG', 'PROP-NONE-LEASE','BLDG-NONE-LEASE','LEASE-NONE-DEPT'))";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            sql = sql + " AND " + costTranRestriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
    }
    
    /**
     * The following rollup_prorate values for cost categories are just used for rollup -
     * chargebacks. All costs with these rollup_prorate values have already been rollup to the
     * cost_tran_sched table: BLDG-PROP-NONE, BLDG-PROP-LEASE, LEASE-BLDG-NONE, LEASE-PROP-NONE. The
     * only rollup_prorate type which gets prorated back down after being rolled up is:
     * BLDG-PROP-LEASE
     */
    private static void calculateCostProrationsForScheduledCosts(final boolean isMcAndVatEnabled) {
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("cost_tran_sched", DataSource.ROLE_MAIN);
        ds.addTable("cost_cat", DataSource.ROLE_STANDARD);
        if (isMcAndVatEnabled) {
            ds.addField("cost_tran_sched", new String[] { "cost_tran_sched_id", "pr_id",
                    "amount_expense_base_payment", "amount_income_base_payment", "cost_cat_id",
                    "date_due", "description", "currency_budget", "currency_payment", "ctry_id",
                    "exchange_rate_override", "vat_amount_override", "vat_percent_override" });
        } else {
            ds.addField("cost_tran_sched", new String[] { "cost_tran_sched_id", "pr_id",
                    "amount_expense", "amount_income", "cost_cat_id", "date_due", "description" });
        }
        
        ds.addField("cost_cat", "rollup_prorate");
        ds.addRestriction(Restrictions.eq("cost_tran_sched", "status", "AUTO-ROLLUP"));
        ds.addRestriction(Restrictions.eq("cost_cat", "rollup_prorate", "BLDG-PROP-LEASE"));
        
        final List<DataRecord> records = ds.getAllRecords();
        for (final DataRecord record : records) {
            
            proratePropertyCostToLeases(record, isMcAndVatEnabled, true);
        }
    }
    
    private static void calculateCostsProrations(final String costTranRestriction,
            final boolean isMcAndVatEnabled, final JobStatus status) {
        setChargebackStatusOfDirectBillCosts(costTranRestriction);
        final String leaseAreaMethod = LeaseAreaUpdate.getLeaseAreaMethod();
        if (leaseAreaMethod.equalsIgnoreCase(LeaseAreaUpdate.LEASE_AREA_METHOD_ROOM_SUITE)) {
            setChargebackStatusOfLeaseDeptProrateCostsToSU(costTranRestriction);
        }
        status.setCurrentNumber(status.getTotalNumber() * 75 / 100);
        
        calculateCostProrationsForCostTranRecords(costTranRestriction, isMcAndVatEnabled);
        status.setCurrentNumber(status.getTotalNumber() * 80 / 100);
        
        calculateCostProrationsForScheduledCosts(isMcAndVatEnabled);
        
        if (isMcAndVatEnabled) {
            // we must update costs
            updateCostForMcAndVat("AUTO-CHARGEBACK");
        }
        status.setCurrentNumber(status.getTotalNumber() * 85 / 100);
    }
    
    private static void calculateCostsRollUps(final String costTranRestriction,
            final boolean isMcAndVatEnabled, final JobStatus status) {
        new CostRollup(ROLLUP_BUILDING_PROPERTY).calculate(costTranRestriction);
        status.setCurrentNumber(status.getTotalNumber() * 50 / 100);
        new CostRollup(ROLLUP_LEASE_BUILDING).calculate(costTranRestriction);
        status.setCurrentNumber(status.getTotalNumber() * 60 / 100);
        new CostRollup(ROLLUP_LEASE_PROPERTY).calculate(costTranRestriction);
        if (isMcAndVatEnabled) {
            // we must update costs
            updateCostForMcAndVat("AUTO-ROLLUP");
        }
    }
    
    /**
     * Update the cost_tran_sched chargeback costs according to the rules set in the Lease
     * chargeback agreements table. The Lease Chargeback agreements are NOT considered for Direct
     * Bill Costs. This is because the Direct Bill Costs are entered directly into the cost_tran
     * table and never get rolled-up or chargedback.
     */
    private static void checkChargebackCostsAgainstLeaseChargeBackAgreements(
            final boolean isMcAndVatEnabled) {
        final String whereLsCBAgree =
                " WHERE ls_chrgbck_agree.ls_id = cost_tran_sched.ls_id AND "
                        + "ls_chrgbck_agree.cost_cat_id = cost_tran_sched.cost_cat_id";
        
        // No Charge and/or Lower Cap
        String sql =
                "DELETE FROM cost_tran_sched" + " WHERE status = 'AUTO-CHARGEBACK'"
                        + " AND ls_id IS NOT NULL"
                        + " AND (( 'NO CHARGE' = ( SELECT charge_type FROM ls_chrgbck_agree"
                        + whereLsCBAgree + "))"
                        + " OR (( amount_expense < ( SELECT amount_cap_lower FROM ls_chrgbck_agree"
                        + whereLsCBAgree + "))"
                        + " AND ( amount_income < (SELECT amount_cap_lower FROM ls_chrgbck_agree"
                        + whereLsCBAgree + "))))";
        SqlUtils.executeUpdate("cost_tran_sched", sql);
        
        // Percentage
        if (isMcAndVatEnabled) {
            sql =
                    "UPDATE cost_tran_sched"
                            + " SET amount_expense = (SELECT pct_factor * amount_expense FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + "),"
                            
                            + " amount_expense_vat_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_expense) * (vat_percent_override /(vat_percent_override + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT (pct_factor * amount_expense) * (vat_percent_value /(vat_percent_value + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_expense_base_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT (pct_factor * amount_expense) - (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_expense) * 100 / (vat_percent_override + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT (pct_factor * amount_expense) * 100 / (vat_percent_value + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " amount_income = ( SELECT pct_factor * amount_income FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + "), "
                            
                            + " amount_income_vat_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_income) * (vat_percent_override /(vat_percent_override + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT (pct_factor * amount_income) * (vat_percent_value /(vat_percent_value + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_income_base_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT (pct_factor * amount_income) - (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_income) * 100 / (vat_percent_override + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT (pct_factor * amount_income) * 100 / (vat_percent_value + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " amount_expense_total_payment = (SELECT (pct_factor * amount_expense) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + "),"
                            
                            + " amount_expense_vat_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN vat_amount_override "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_expense) * (vat_percent_override /(vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT (pct_factor * amount_expense) * (vat_percent_value /(vat_percent_value + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_expense_base_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT (pct_factor * amount_expense) /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) - vat_amount_override  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_expense) * (100 / (vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT (pct_factor * amount_expense) * (100 / (vat_percent_value + 100)) /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " amount_income_total_payment = (SELECT (pct_factor * amount_income) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + "),"
                            
                            + " amount_income_vat_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN vat_amount_override "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_income) * (vat_percent_override /(vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT (pct_factor * amount_income) * (vat_percent_value /(vat_percent_value + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_income_base_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT (pct_factor * amount_income) /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) - vat_amount_override  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT (pct_factor * amount_income) * (100 / (vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT (pct_factor * amount_income) * (100 / (vat_percent_value + 100)) /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + "description = REPLACE( description, "
                            + SqlUtils.formatValueForSql(CostMessages.MESSAGE_PRORATE_PORTION_FROM)
                            + ", "
                            + SqlUtils
                                .formatValueForSql(CostMessages.MESSAGE_PERCENT_PRORATE_PORTION_FROM)
                            + ") "
                            
                            + " WHERE status = 'AUTO-CHARGEBACK'"
                            + " AND ls_id IS NOT NULL"
                            + " AND EXISTS ( SELECT 1 FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + " AND charge_type = 'PERCENTAGE'" + ")";
        } else {
            sql =
                    "UPDATE cost_tran_sched"
                            + " SET amount_expense = (SELECT pct_factor * amount_expense FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + ")"
                            + ", amount_income = ( SELECT pct_factor * amount_income FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + "),"
                            
                            + "description = REPLACE( description, "
                            + SqlUtils.formatValueForSql(CostMessages.MESSAGE_PRORATE_PORTION_FROM)
                            + ", "
                            + SqlUtils
                                .formatValueForSql(CostMessages.MESSAGE_PERCENT_PRORATE_PORTION_FROM)
                            + ") "
                            
                            + " WHERE status = 'AUTO-CHARGEBACK'" + " AND ls_id IS NOT NULL"
                            + " AND EXISTS ( SELECT 1 FROM ls_chrgbck_agree" + whereLsCBAgree
                            + " AND charge_type = 'PERCENTAGE'" + ")";
        }
        SqlUtils.executeUpdate("cost_tran_sched", sql);
        
        // Fixed Amount - Expense
        if (isMcAndVatEnabled) {
            sql =
                    "UPDATE cost_tran_sched"
                            + " SET amount_expense = ( SELECT amount_fixed FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + " ),"
                            
                            + " amount_expense_vat_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * (vat_percent_override /(vat_percent_override + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT amount_fixed * (vat_percent_value /(vat_percent_value + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_expense_base_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT amount_fixed - (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * 100 / (vat_percent_override + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT amount_fixed * 100 / (vat_percent_value + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " amount_expense_total_payment = (SELECT amount_fixed / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + "),"
                            
                            + " amount_expense_vat_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN vat_amount_override "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * (vat_percent_override /(vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT amount_fixed * (vat_percent_value /(vat_percent_value + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_expense_base_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT amount_fixed /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) - vat_amount_override  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * (100 / (vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT amount_fixed * (100 / (vat_percent_value + 100)) /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " description = (CASE WHEN EXISTS(SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " AND comments IS NOT NULL) THEN (SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") ELSE "
                            + SqlUtils.formatValueForSql(CostMessages.MESSAGE_FIXED_CHARGEBACK)
                            + " ${sql.concat}' '${sql.concat}(SELECT ls_id FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END)"
                            
                            + " WHERE status = 'AUTO-CHARGEBACK'"
                            + " AND ls_id IS NOT NULL"
                            + " AND amount_expense <> 0"
                            + " AND EXISTS ( SELECT 1 FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + " AND charge_type = 'FIXED')";
        } else {
            sql =
                    "UPDATE cost_tran_sched"
                            + " SET amount_expense = ( SELECT amount_fixed FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + "),"
                            
                            + " description = (CASE WHEN EXISTS(SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " AND comments IS NOT NULL) THEN (SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree + ") ELSE "
                            + SqlUtils.formatValueForSql(CostMessages.MESSAGE_FIXED_CHARGEBACK)
                            + " ${sql.concat}' '${sql.concat}(SELECT ls_id FROM ls_chrgbck_agree "
                            + whereLsCBAgree + " ) END)"
                            
                            + " WHERE status = 'AUTO-CHARGEBACK'" + " AND ls_id IS NOT NULL"
                            + " AND amount_expense <> 0"
                            + " AND EXISTS ( SELECT 1 FROM ls_chrgbck_agree" + whereLsCBAgree
                            + " AND charge_type = 'FIXED')";
        }
        SqlUtils.executeUpdate("cost_tran_sched", sql);
        
        // Fixed Amount - Income
        if (isMcAndVatEnabled) {
            sql =
                    "UPDATE cost_tran_sched"
                            + " SET amount_income = ( SELECT amount_fixed FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + " ),"
                            
                            + " amount_income_vat_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * (vat_percent_override /(vat_percent_override + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT amount_fixed * (vat_percent_value /(vat_percent_value + 100))  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_income_base_budget = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT amount_fixed - (vat_amount_override * (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * 100 / (vat_percent_override + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT amount_fixed * 100 / (vat_percent_value + 100) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " amount_income_total_payment = (SELECT amount_fixed / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + "),"
                            
                            + " amount_income_vat_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN vat_amount_override "
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * (vat_percent_override /(vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + "ELSE (SELECT amount_fixed * (vat_percent_value /(vat_percent_value + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END)  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END), "
                            
                            + " amount_income_base_payment = "
                            + " (CASE WHEN vat_amount_override <> -1 "
                            + " THEN (SELECT amount_fixed /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) - vat_amount_override  FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ")"
                            + " WHEN vat_percent_override <> 0 THEN (SELECT amount_fixed * (100 / (vat_percent_override + 100)) / (CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") "
                            + " ELSE (SELECT amount_fixed * (100 / (vat_percent_value + 100)) /(CASE WHEN exchange_rate_override <> 1 THEN exchange_rate_override ELSE exchange_rate_budget END) FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") END), "
                            
                            + " description = (CASE WHEN EXISTS(SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " AND comments IS NOT NULL) THEN (SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + ") ELSE "
                            + SqlUtils.formatValueForSql(CostMessages.MESSAGE_FIXED_CHARGEBACK)
                            + " ${sql.concat}' '${sql.concat}(SELECT ls_id FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " ) END)"
                            
                            + " WHERE status = 'AUTO-CHARGEBACK'"
                            + " AND ls_id IS NOT NULL"
                            + " AND amount_income <> 0"
                            + " AND EXISTS ( SELECT 1 FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + " AND charge_type = 'FIXED')";
        } else {
            sql =
                    "UPDATE cost_tran_sched"
                            + " SET amount_income = ( SELECT amount_fixed FROM ls_chrgbck_agree"
                            + whereLsCBAgree
                            + "),"
                            
                            + " description = (CASE WHEN EXISTS(SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree
                            + " AND comments IS NOT NULL) THEN (SELECT comments FROM ls_chrgbck_agree "
                            + whereLsCBAgree + ") ELSE "
                            + SqlUtils.formatValueForSql(CostMessages.MESSAGE_FIXED_CHARGEBACK)
                            + " ${sql.concat}' '${sql.concat}(SELECT ls_id FROM ls_chrgbck_agree "
                            + whereLsCBAgree + " ) END)"
                            
                            + " WHERE status = 'AUTO-CHARGEBACK'" + " AND ls_id IS NOT NULL"
                            + " AND amount_income <> 0"
                            + " AND EXISTS ( SELECT 1 FROM ls_chrgbck_agree" + whereLsCBAgree
                            + " AND charge_type = 'FIXED')";
        }
        SqlUtils.executeUpdate("cost_tran_sched", sql);
    }
    
    /**
     * Deletes all scheduled chargeback costs.
     * 
     * @param costTranRestriction on cost_tran records.
     */
    private static void deleteExistingChargebackCosts(final String costTranRestriction) {
        String sql =
                "DELETE FROM cost_tran_sched WHERE status IN ('AUTO-ROLLUP', 'AUTO-CHARGEBACK')";
        SqlUtils.executeUpdate("cost_tran_sched", sql);
        
        sql = "UPDATE cost_tran SET chrgbck_status = 'N' WHERE chrgbck_status IN ('CS', 'SU')";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            sql = sql + " AND " + costTranRestriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
    }
    
    /**
     * Creates records in cost_tran_sched for prorated costs from a cost_tran record which is
     * reported to a building but is prorated to Leases. This routine will create a cost_tran_sched
     * record w/the prorated cost for EACH and every Lease assigned to the Building on the original
     * cost passed.
     * 
     * @param record
     * @param isMcAndVatEnabled
     */
    private static void prorateBuildingCostToLeases(final DataRecord record,
            final boolean isMcAndVatEnabled) {
        
        final String buildingId = record.getString("cost_tran.bl_id");
        final String costCategory = record.getString("cost_tran.cost_cat_id");
        final String description = record.getString("cost_tran.description");
        final Date dateDue = record.getDate("cost_tran.date_due");
        final String areaSql = SqlUtils.formatSqlReplace0WithHuge("bl.area_ls_negotiated");
        
        final String descriptionSql =
                "'" + CostMessages.MESSAGE_PRORATE_PORTION_FROM + " "
                        + CostMessages.MESSAGE_BUILDING + ": " + buildingId + " "
                        + CostMessages.MESSAGE_OF + " " + costCategory + " - "
                        + SqlUtils.makeLiteralOrBlank(description) + "'";
        
        String insertFields = "";
        String insertValues = "";
        double amountExpense = 0.0;
        double amountIncome = 0.0;
        String amountExpenseSql = "";
        String amountIncomeSql = "";
        
        if (isMcAndVatEnabled) {
            amountExpense = record.getDouble("cost_tran.amount_expense_base_payment");
            amountIncome = record.getDouble("cost_tran.amount_income_base_payment");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            
            final String currencyBudget = record.getString("cost_tran.currency_budget");
            final String currencyPayment = record.getString("cost_tran.currency_payment");
            final String ctry_id = record.getString("cost_tran.ctry_id");
            final double exchangeRateOverride =
                    record.getDouble("cost_tran.exchange_rate_override");
            final double vatAmountOverride = record.getDouble("cost_tran.vat_amount_override");
            final double vatPercentOverride = record.getDouble("cost_tran.vat_percent_override");
            
            insertFields =
                    "amount_expense_base_payment, amount_income_base_payment, currency_budget, currency_payment, ctry_id, exchange_rate_override, vat_amount_override, vat_percent_override, ";
            insertValues =
                    amountExpenseSql + " * ls.area_negotiated / " + areaSql + ", "
                            + amountIncomeSql + " * ls.area_negotiated / " + areaSql + ", "
                            + SqlUtils.formatValueForSql(currencyBudget) + ", "
                            + SqlUtils.formatValueForSql(currencyPayment) + ", "
                            + SqlUtils.formatValueForSql(ctry_id) + ", "
                            + SqlUtils.formatValueForSql(new Double(exchangeRateOverride)) + ", "
                            + SqlUtils.formatValueForSql(new Double(vatAmountOverride))
                            + " * ls.area_negotiated / " + areaSql + " , "
                            + SqlUtils.formatValueForSql(new Double(vatPercentOverride)) + ", ";
        } else {
            amountExpense = record.getDouble("cost_tran.amount_expense");
            amountIncome = record.getDouble("cost_tran.amount_income");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            insertFields = "amount_expense, amount_income, ";
            insertValues =
                    amountExpenseSql + " * ls.area_negotiated / " + areaSql + ", "
                            + amountIncomeSql + " * ls.area_negotiated / " + areaSql + ", ";
        }
        
        final String sql =
                "INSERT INTO cost_tran_sched (ls_id, " + insertFields
                        + " cost_cat_id, date_due, status, description)" + " SELECT ls_id, "
                        + insertValues + "'" + costCategory + "', " + "${sql.date('" + dateDue
                        + "')}, " + "'AUTO-CHARGEBACK', " + descriptionSql + " FROM ls, bl"
                        + " WHERE ls.bl_id = '" + buildingId + "'" + " AND bl.bl_id = '"
                        + buildingId + "'" + " AND ls.lease_sublease <> 'SUBLEASE'";
        
        SqlUtils.executeUpdate("cost_tran_sched", sql);
    }
    
    /**
     * Creates records in cost_tran_sched for prorated costs from a cost_tran record which is
     * reported to a Lease but is prorated to Deptartments. If using a Suite Area Method then this
     * sub-routine will never be called because we have already marked the cost_tran records as 'SU'
     * not 'N'. This routine will create a cost_tran_sched record w/the prorated cost for EACH and
     * every Department assigned to the Lease on the original cost passed. Department area is
     * determined from all Groups or Rooms assigned to the Lease. Groups or Rooms are used based on
     * the Lease Area Type being used.
     * 
     * @param record
     * @param leaseAreaTable
     * @param isMcAndVatEnabled
     */
    private static void prorateLeaseCostToDepartments(final DataRecord record,
            final String leaseAreaTable, final boolean isMcAndVatEnabled) {
        
        final String leaseId = record.getString("cost_tran.ls_id");
        final String costCategory = record.getString("cost_tran.cost_cat_id");
        final String description = record.getString("cost_tran.description");
        final Date dateDue = record.getDate("cost_tran.date_due");
        final String areaSql = SqlUtils.formatSqlReplace0WithHuge("ls.area_rentable");
        
        final String descriptionSql =
                "'" + CostMessages.MESSAGE_PRORATE_PORTION_FROM + " " + CostMessages.MESSAGE_LEASE
                        + ": " + leaseId + " " + CostMessages.MESSAGE_OF + " " + costCategory
                        + " - " + SqlUtils.makeLiteralOrBlank(description) + "'";
        
        String insertFields = "";
        String insertValues = "";
        double amountExpense = 0.0;
        double amountIncome = 0.0;
        String amountExpenseSql = "";
        String amountIncomeSql = "";
        
        if (isMcAndVatEnabled) {
            amountExpense = record.getDouble("cost_tran.amount_expense_base_payment");
            amountIncome = record.getDouble("cost_tran.amount_income_base_payment");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            
            final String currencyBudget = record.getString("cost_tran.currency_budget");
            final String currencyPayment = record.getString("cost_tran.currency_payment");
            final String ctry_id = record.getString("cost_tran.ctry_id");
            final double exchangeRateOverride =
                    record.getDouble("cost_tran.exchange_rate_override");
            final double vatAmountOverride = record.getDouble("cost_tran.vat_amount_override");
            final double vatPercentOverride = record.getDouble("cost_tran.vat_percent_override");
            
            insertFields =
                    "amount_expense_base_payment, amount_income_base_payment, currency_budget, currency_payment, ctry_id, exchange_rate_override, vat_amount_override, vat_percent_override, ";
            insertValues =
                    amountExpenseSql + " * SUM(" + leaseAreaTable + ".area_chargable) / " + areaSql
                            + ", " + amountIncomeSql + " * SUM(" + leaseAreaTable
                            + ".area_chargable) / " + areaSql + ", "
                            + SqlUtils.formatValueForSql(currencyBudget) + ", "
                            + SqlUtils.formatValueForSql(currencyPayment) + ", "
                            + SqlUtils.formatValueForSql(ctry_id) + ", "
                            + SqlUtils.formatValueForSql(new Double(exchangeRateOverride)) + ", "
                            + SqlUtils.formatValueForSql(new Double(vatAmountOverride)) + " * SUM("
                            + leaseAreaTable + ".area_chargable) / " + areaSql + ", "
                            + SqlUtils.formatValueForSql(new Double(vatPercentOverride)) + ", ";
        } else {
            amountExpense = record.getDouble("cost_tran.amount_expense");
            amountIncome = record.getDouble("cost_tran.amount_income");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            insertFields = "amount_expense, amount_income, ";
            insertValues =
                    amountExpenseSql + " * SUM(" + leaseAreaTable + ".area_chargable) / " + areaSql
                            + ", " + amountIncomeSql + " * SUM(" + leaseAreaTable
                            + ".area_chargable) / " + areaSql + ", ";
        }
        
        final String sql =
                "INSERT INTO cost_tran_sched (dv_id, dp_id, " + insertFields
                        + " cost_cat_id, date_due, status, description)" + " SELECT dv_id, dp_id, "
                        + insertValues + "'" + costCategory + "', " + "${sql.date('" + dateDue
                        + "')}, " + "'AUTO-CHARGEBACK', " + descriptionSql + " FROM ls, "
                        + leaseAreaTable + " WHERE ls.ls_id = '" + leaseId + "'" + " AND "
                        + leaseAreaTable + ".ls_id = '" + leaseId + "'" + " GROUP BY "
                        + leaseAreaTable + ".dv_id, " + leaseAreaTable + ".dp_id, ls.area_rentable";
        
        SqlUtils.executeUpdate("cost_tran_sched", sql);
    }
    
    /**
     * Creates records in cost_tran_sched for prorated costs from a cost_tran record which is
     * reported to a property but is prorated to buildings. This routine will create a
     * cost_tran_sched record w/the prorated cost for EACH and every building assigned to the
     * Property on the original cost passed.
     * 
     * @param record
     * @param isMcAndVatEnabled
     */
    private static void proratePropertyCostToBuildings(final DataRecord record,
            final boolean isMcAndVatEnabled) {
        
        final String propertyId = record.getString("cost_tran.pr_id");
        final String costCategory = record.getString("cost_tran.cost_cat_id");
        final String description = record.getString("cost_tran.description");
        final Date dateDue = record.getDate("cost_tran.date_due");
        final String areaSql = SqlUtils.formatSqlReplace0WithHuge("property.area_bl_rentable");
        
        final String descriptionSql =
                "'" + CostMessages.MESSAGE_PRORATE_PORTION_FROM + " "
                        + CostMessages.MESSAGE_PROPERTY + ": " + propertyId + " "
                        + CostMessages.MESSAGE_OF + " " + costCategory + " - "
                        + SqlUtils.makeLiteralOrBlank(description) + "'";
        
        String insertFields = "";
        String insertValues = "";
        double amountExpense = 0.0;
        double amountIncome = 0.0;
        String amountExpenseSql = "";
        String amountIncomeSql = "";
        
        if (isMcAndVatEnabled) {
            amountExpense = record.getDouble("cost_tran.amount_expense_base_payment");
            amountIncome = record.getDouble("cost_tran.amount_income_base_payment");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            
            final String currencyBudget = record.getString("cost_tran.currency_budget");
            final String currencyPayment = record.getString("cost_tran.currency_payment");
            final String ctry_id = record.getString("cost_tran.ctry_id");
            final double exchangeRateOverride =
                    record.getDouble("cost_tran.exchange_rate_override");
            final double vatAmountOverride = record.getDouble("cost_tran.vat_amount_override");
            final double vatPercentOverride = record.getDouble("cost_tran.vat_percent_override");
            
            insertFields =
                    "amount_expense_base_payment, amount_income_base_payment, currency_budget, currency_payment, ctry_id, exchange_rate_override, vat_amount_override, vat_percent_override, ";
            insertValues =
                    amountExpenseSql + " * bl.area_rentable / " + areaSql + ", " + amountIncomeSql
                            + " * bl.area_rentable / " + areaSql + ", "
                            + SqlUtils.formatValueForSql(currencyBudget) + ", "
                            + SqlUtils.formatValueForSql(currencyPayment) + ", "
                            + SqlUtils.formatValueForSql(ctry_id) + ", "
                            + SqlUtils.formatValueForSql(new Double(exchangeRateOverride)) + ", "
                            + SqlUtils.formatValueForSql(new Double(vatAmountOverride))
                            + " * bl.area_rentable /" + areaSql + " , "
                            + SqlUtils.formatValueForSql(new Double(vatPercentOverride)) + ", ";
        } else {
            amountExpense = record.getDouble("cost_tran.amount_expense");
            amountIncome = record.getDouble("cost_tran.amount_income");
            
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            
            insertFields = "amount_expense, amount_income, ";
            insertValues =
                    amountExpenseSql + " * bl.area_rentable / " + areaSql + ", " + amountIncomeSql
                            + " * bl.area_rentable / " + areaSql + ", ";
        }
        
        final String sql =
                "INSERT INTO cost_tran_sched (bl_id, " + insertFields
                        + " cost_cat_id, date_due, status, description)" + " SELECT bl_id, "
                        + insertValues + "'" + costCategory + "', " + "${sql.date('" + dateDue
                        + "')}, " + "'AUTO-CHARGEBACK', " + descriptionSql + " FROM bl, property"
                        + " WHERE bl.pr_id = '" + propertyId + "'" + " AND property.pr_id = '"
                        + propertyId + "'";
        
        SqlUtils.executeUpdate("cost_tran_sched", sql);
    }
    
    /**
     * Creates records in cost_tran_sched for prorated costs from a cost_tran record which is
     * reported to a property but is prorated to Leases. This routine will create a cost_tran_sched
     * record w/the prorated cost for EACH and every Lease assigned to the Property on the original
     * cost passed.
     * 
     * @param record
     * @param isMcAndVatEnabled
     * @param isFromScheduledCosts
     */
    private static void proratePropertyCostToLeases(final DataRecord record,
            final boolean isMcAndVatEnabled, final boolean isFromScheduledCosts) {
        
        String tableName = "cost_tran";
        if (isFromScheduledCosts) {
            tableName = "cost_tran_sched";
        }
        
        final String propertyId = record.getString(tableName + ".pr_id");
        final String costCategory = record.getString(tableName + ".cost_cat_id");
        final String description = record.getString(tableName + ".description");
        final Date dateDue = record.getDate(tableName + ".date_due");
        final String areaSql = SqlUtils.formatSqlReplace0WithHuge("property.area_lease_neg");
        
        final String descriptionSql =
                "'" + CostMessages.MESSAGE_PRORATE_PORTION_FROM + " "
                        + CostMessages.MESSAGE_PROPERTY + ": " + propertyId + " "
                        + CostMessages.MESSAGE_OF + " " + costCategory + " - "
                        + SqlUtils.makeLiteralOrBlank(description) + "'";
        
        String insertFields = "";
        String insertValues = "";
        double amountExpense = 0.0;
        double amountIncome = 0.0;
        String amountExpenseSql = "";
        String amountIncomeSql = "";
        
        if (isMcAndVatEnabled) {
            amountExpense = record.getDouble(tableName + ".amount_expense_base_payment");
            amountIncome = record.getDouble(tableName + ".amount_income_base_payment");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            
            final String currencyBudget = record.getString(tableName + ".currency_budget");
            final String currencyPayment = record.getString(tableName + ".currency_payment");
            final String ctry_id = record.getString(tableName + ".ctry_id");
            final double exchangeRateOverride =
                    record.getDouble(tableName + ".exchange_rate_override");
            final double vatAmountOverride = record.getDouble(tableName + ".vat_amount_override");
            final double vatPercentOverride = record.getDouble(tableName + ".vat_percent_override");
            
            insertFields =
                    "amount_expense_base_payment, amount_income_base_payment, currency_budget, currency_payment, ctry_id, exchange_rate_override, vat_amount_override, vat_percent_override, ";
            insertValues =
                    amountExpenseSql + " * ls.area_negotiated / " + areaSql + ", "
                            + amountIncomeSql + " * ls.area_negotiated / " + areaSql + ", "
                            + SqlUtils.formatValueForSql(currencyBudget) + ", "
                            + SqlUtils.formatValueForSql(currencyPayment) + ", "
                            + SqlUtils.formatValueForSql(ctry_id) + ", "
                            + SqlUtils.formatValueForSql(new Double(exchangeRateOverride)) + ", "
                            + SqlUtils.formatValueForSql(new Double(vatAmountOverride))
                            + " * ls.area_negotiated / " + areaSql + " , "
                            + SqlUtils.formatValueForSql(new Double(vatPercentOverride)) + ", ";
        } else {
            amountExpense = record.getDouble(tableName + ".amount_expense");
            amountIncome = record.getDouble(tableName + ".amount_income");
            amountExpenseSql = SqlUtils.formatValueForSql(new Double(amountExpense));
            amountIncomeSql = SqlUtils.formatValueForSql(new Double(amountIncome));
            insertFields = "amount_expense, amount_income, ";
            insertValues =
                    amountExpenseSql + " * ls.area_negotiated / " + areaSql + ", "
                            + amountIncomeSql + " * ls.area_negotiated / " + areaSql + ", ";
        }
        
        final String sql =
                "INSERT INTO cost_tran_sched (ls_id, " + insertFields
                        + " cost_cat_id, date_due, status, description)" + " SELECT ls_id, "
                        + insertValues + "'" + costCategory + "', " + "${sql.date('" + dateDue
                        + "')}, " + "'AUTO-CHARGEBACK', " + descriptionSql
                        + " FROM bl, ls, property" + " WHERE bl.pr_id = '" + propertyId + "'"
                        + " AND ls.bl_id = bl.bl_id" + " AND property.pr_id = '" + propertyId + "'"
                        + " AND ls.lease_sublease <> 'SUBLEASE'";
        
        SqlUtils.executeUpdate("cost_tran_sched", sql);
    }
    
    /**
     * Returns true if any scheduled chargeback costs exist.
     */
    private static boolean scheduledChargebackCostsExist() {
        final String tableName = "cost_tran_sched";
        final String[] fieldNames = { "status" };
        final String restriction = "status IN ('AUTO-ROLLUP', 'AUTO-CHARGEBACK')";
        final DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        final List<DataRecord> records = ds.getRecords(restriction);
        return !records.isEmpty();
    }
    
    /**
     * When a cost_tran record has been RolledUp or ChargedBack it's status is set to CS. Direct
     * Bill costs do not rollup or prorate.
     */
    private static void setChargebackStatusOfDirectBillCosts(final String costTranRestriction) {
        String sql =
                "UPDATE cost_tran SET chrgbck_status = 'CS'"
                        + " WHERE chrgbck_status = 'N'"
                        + " AND '"
                        + PRORATE_ALL_NONE_DIRECT
                        + "' ="
                        + "(SELECT rollup_prorate FROM cost_cat WHERE cost_cat.cost_cat_id = cost_tran.cost_cat_id)";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            sql = sql + " AND " + costTranRestriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
    }
    
    /**
     * Can not Prorate Lease Costs to Departments when using Lease Area Method of Suites - so mark
     * these records.
     */
    private static void setChargebackStatusOfLeaseDeptProrateCostsToSU(
            final String costTranRestriction) {
        String sql =
                "UPDATE cost_tran SET chrgbck_status = 'SU'"
                        + " WHERE chrgbck_status = 'N'"
                        + " AND '"
                        + PRORATE_LEASE_NONE_DEPARTMENT
                        + "' ="
                        + "(SELECT rollup_prorate FROM cost_cat WHERE cost_cat.cost_cat_id = cost_tran.cost_cat_id)";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            sql = sql + " AND " + costTranRestriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
    }
    
    private static void setStatusOfCostsWithBadOwners(final String costTranRestriction) {
        String sql = "UPDATE cost_tran set chrgbck_status = 'N' WHERE chrgbck_status = 'BO'";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            sql = sql + " AND " + costTranRestriction;
        }
        SqlUtils.executeUpdate("cost_tran", sql);
        
        final String sqlProrate =
                "(SELECT cost_cat.rollup_prorate FROM cost_cat WHERE cost_cat.cost_cat_id = cost_tran.cost_cat_id)";
        
        String sqlUpdate =
                "UPDATE cost_tran SET chrgbck_status = 'BO'" + " WHERE ((( 'BLDG-PROP-NONE' = "
                        + sqlProrate + " )" + " AND (( cost_tran.bl_id IS NULL )"
                        + " OR ( EXISTS ( SELECT bl.pr_id FROM bl"
                        + " WHERE bl.bl_id = cost_tran.bl_id" + " AND bl.pr_id IS NULL )) )"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'BLDG-PROP-LEASE' = "
                        + sqlProrate + " )" + " AND (( cost_tran.bl_id IS NULL )"
                        + " OR ( EXISTS ( SELECT bl.pr_id FROM bl"
                        + " WHERE bl.bl_id = cost_tran.bl_id" + " AND bl.pr_id IS NULL )) )"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'LEASE-BLDG-NONE' = "
                        + sqlProrate + " )" + " AND (( cost_tran.ls_id IS NULL )"
                        + " OR ( EXISTS ( SELECT ls.bl_id FROM ls"
                        + " WHERE ls.ls_id = cost_tran.ls_id" + " AND ls.bl_id IS NULL )) )"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'LEASE-PROP-NONE' = "
                        + sqlProrate + " )" + " AND (( cost_tran.ls_id IS NULL )"
                        + " OR ( EXISTS ( SELECT ls.bl_id FROM ls"
                        + " WHERE ls.ls_id = cost_tran.ls_id"
                        + " AND ls.bl_id IS NULL AND ls.pr_id IS NULL ))"
                        + " OR ( EXISTS ( SELECT bl.pr_id FROM ls, bl"
                        + " WHERE ls.ls_id = cost_tran.ls_id" + " AND bl.bl_id = ls.bl_id"
                        + " AND bl.pr_id IS NULL AND ls.pr_id IS NULL )) "
                        + " OR ( EXISTS ( SELECT 1 FROM ls" + " WHERE ls.ls_id = cost_tran.ls_id"
                        + " AND ls.bl_id IS NOT NULL AND ls.pr_id IS NOT NULL ))" + ")"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'PROP-NONE-BLDG' = "
                        + sqlProrate + " )" + " AND ( cost_tran.pr_id IS NULL )"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'PROP-NONE-LEASE' = "
                        + sqlProrate + " )" + " AND ( cost_tran.pr_id IS NULL )"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'BLDG-NONE-LEASE' = "
                        + sqlProrate + " )" + " AND ( cost_tran.bl_id IS NULL )"
                        + " AND chrgbck_status = 'N'   )" + " OR (( 'LEASE-NONE-DEPT' = "
                        + sqlProrate + " )" + " AND ( cost_tran.ls_id IS NULL )"
                        + " AND chrgbck_status = 'N'   ))";
        if (StringUtil.notNullOrEmpty(costTranRestriction)) {
            sqlUpdate = sqlUpdate + " AND " + costTranRestriction;
        }
        
        SqlUtils.executeUpdate("cost_tran", sqlUpdate);
    }
    
    /**
     * Convert cost for MC and VAT.
     */
    private static void updateCostForMcAndVat(final String status) {
        final DataSource dsCost =
                DataSourceFactory.createDataSourceForFields("cost_tran_sched", new String[] {
                        "cost_tran_sched_id", "status", "date_trans_created" });
        
        final String currentDate = "'" + Utility.currentDate() + "'";
        String restriction = "cost_tran_sched.status = '" + status + "'";
        if (SqlUtils.isOracle()) {
            restriction +=
                    " AND TO_CHAR(cost_tran_sched.date_trans_created,'YYYY-MM-DD') = "
                            + currentDate;
        } else {
            restriction +=
                    " AND LTRIM(RTRIM(STR(DATEPART(year, cost_tran_sched.date_trans_created)))) + '-' + "
                            + "(CASE WHEN DATEPART(month, cost_tran_sched.date_trans_created)/10 < 1 THEN '0' ELSE '' END) + "
                            + "LTRIM(RTRIM(STR(DATEPART(month, cost_tran_sched.date_trans_created))))+ '-' + "
                            + "(CASE WHEN DATEPART(day, cost_tran_sched.date_trans_created)/10 < 1 THEN '0' ELSE '' END) + "
                            + "LTRIM(RTRIM(STR(DATEPART(day, cost_tran_sched.date_trans_created)))) = "
                            + currentDate;
        }
        dsCost.addRestriction(Restrictions.sql(restriction));
        
        final List<DataRecord> records = dsCost.getRecords();
        final List<Integer> costIds = new ArrayList<Integer>();
        final List<String> costTypes = new ArrayList<String>();
        for (final DataRecord record : records) {
            costIds.add(record.getInt("cost_tran_sched.cost_tran_sched_id"));
            costTypes.add("cost_tran_sched");
        }
        
        // final CurrencyAndVat currencyAndVat = new CurrencyAndVat();
        // currencyAndVat.updateCostRecords(costIds, costTypes, new JobStatus());
    }
}
