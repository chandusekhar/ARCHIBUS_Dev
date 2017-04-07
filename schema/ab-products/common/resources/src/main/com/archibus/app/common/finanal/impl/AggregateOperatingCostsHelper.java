package com.archibus.app.common.finanal.impl;

import java.util.*;

import com.archibus.datasource.SqlUtils;

/**
 * Helper class for aggregate operating costs.
 *
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this class.
 * <p>
 * Justification: Case #2: Statement with INSERT ... SELECT pattern.
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class AggregateOperatingCostsHelper {

    /**
     * Aggregate work request costs between start date and end date.
     *
     * @param variables map with query variables
     */
    public void aggregateWorkRequestCosts(final Map<String, Object> variables) {
        final String insertStatement = getSqlForWorkRequestCosts(variables);
        SqlUtils.executeUpdate(Constants.COST_TRAN_SCHED, insertStatement);
        SqlUtils.commit();
    }

    /**
     * Aggregate service request costs between start date and end date.
     *
     * @param variables map with query variables
     */
    public void aggregateActualServiceRequestCosts(final Map<String, Object> variables) {
        final String insertStatement = getSqlForActualServiceRequestCosts(variables);
        SqlUtils.executeUpdate(Constants.COST_TRAN_SCHED, insertStatement);
        SqlUtils.commit();
    }

    /**
     * Aggregate service request costs between start date and end date.
     *
     * @param variables map with query variables
     */
    public void aggregateEstimatedServiceRequestCosts(final Map<String, Object> variables) {
        final String insertStatement = getSqlForEstimatedServiceRequestCosts(variables);
        SqlUtils.executeUpdate(Constants.COST_TRAN_SCHED, insertStatement);
        SqlUtils.commit();
    }

    /**
     * Delete aggregated costs.
     *
     * @param variables map with query variables
     */
    public void deleteAggregatedCosts(final Map<String, Object> variables) {
        final String deleteStatement =
                bindVariables(getDeleteStatementForAutoSummaryCosts(), variables);
        SqlUtils.executeUpdate(Constants.COST_TRAN_SCHED, deleteStatement);
        SqlUtils.commit();
    }

    /**
     * Returns query variables object.
     *
     * @return Map<String, Object>
     */
    public Map<String, Object> getQueryVariables() {
        final Map<String, Object> variables = new HashMap<String, Object>();
        final String localizedDescription =
                Messages.getLocalizedMessage(Messages.AGGREGATE_OPERATING_COSTS_DESCRIPTION);
        variables.put(Constants.VARIABLE_KEY_DESCRIPTION, localizedDescription);
        variables.put(Constants.VARIABLE_KEY_STATUS, Constants.STATUS_AUTO_SUMMARY);
        variables.put(Constants.VARIABLE_KEY_DATE_START, new Date());
        variables.put(Constants.VARIABLE_KEY_DATE_END, new Date());
        return variables;
    }

    /**
     * Create and returns sql statement to aggregate work request costs.
     *
     * @param variables bind variables
     * @return String
     */
    private String getSqlForWorkRequestCosts(final Map<String, Object> variables) {
        final String insertStatement = getInsertStatementForWorkRequestCosts();
        return bindVariables(insertStatement, variables);
    }

    /**
     * Create and returns sql statement to aggregate service request costs.
     *
     * @param variables bind variables
     * @return String
     */
    private String getSqlForActualServiceRequestCosts(final Map<String, Object> variables) {
        final String insertStatement = getInsertStatementForActualServiceRequestCosts();
        return bindVariables(insertStatement, variables);
    }

    /**
     * Create and returns sql statement to aggregate service request costs.
     *
     * @param variables bind variables
     * @return String
     */
    private String getSqlForEstimatedServiceRequestCosts(final Map<String, Object> variables) {
        final String insertStatement = getInsertStatementForEstimatedServiceRequestCosts();
        return bindVariables(insertStatement, variables);
    }

    /**
     * Bind variables into sql statment.
     *
     * @param sqlStatement sql statement string
     * @param variables map with sql variables <key, value>
     * @return string
     */
    private String bindVariables(final String sqlStatement, final Map<String, Object> variables) {
        String result = sqlStatement;
        final Iterator<String> itKeys = variables.keySet().iterator();
        while (itKeys.hasNext()) {
            final String key = itKeys.next();
            final Object value = variables.get(key);
            final String sqlkey = "\\{" + key + "\\}";
            final String sqlValue = SqlUtils.formatValueForSql(value);
            result = result.replaceAll(sqlkey, sqlValue);
        }
        return result;
    }

    /**
     * Get SELECT statement for Work request costs.
     *
     * @return String
     */
    private String getInsertStatementForWorkRequestCosts() {
        final String sqlStatement =
                "INSERT INTO cost_tran_sched ( bl_id, cost_cat_id, amount_expense, date_due, status, description, ac_id ) "
                        + " SELECT wrhwr.bl_id, probtype.cost_cat_id,"
                        + "   SUM( wrhwr.cost_total ), {date_start}, {status}, {description}, cost_cat.ac_id  "
                        + "FROM wrhwr, probtype, cost_cat WHERE probtype.prob_type = wrhwr.prob_type"
                        + "  AND cost_cat.cost_cat_id = probtype.cost_cat_id  AND wrhwr.status IN ( 'Com', 'Clo' )"
                        + "  AND wrhwr.cost_total <> 0 "
                        + "  AND wrhwr.date_completed >= {date_start} AND  wrhwr.date_completed < {date_end}"
                        + "  AND NOT EXISTS(SELECT 1 FROM cost_tran_sched ${sql.as} cts_inner  WHERE cts_inner.bl_id = wrhwr.bl_id"
                        + "                      AND cts_inner.cost_cat_id  = probtype.cost_cat_id"
                        + "                      AND cts_inner.date_due >= {date_start} AND cts_inner.date_due < {date_end}"
                        + "                      AND cts_inner.status <> {status})"
                        + " GROUP BY wrhwr.bl_id, probtype.cost_cat_id, cost_cat.ac_id";
        return sqlStatement;
    }

    /**
     * Get SELECT statement for Service request costs.
     *
     * @return String
     */
    private String getInsertStatementForActualServiceRequestCosts() {
        final String sqlStatement =
                "INSERT INTO cost_tran_sched ( bl_id,  pr_id, cost_cat_id, amount_expense, date_due, status, description, ac_id ) "
                        + " SELECT activity_log_hactivity_log.bl_id,  activity_log_hactivity_log.pr_id, activitytype.cost_cat_id, "
                        + " SUM( activity_log_hactivity_log.cost_actual + activity_log_hactivity_log.cost_act_cap ), "
                        + " {date_start}, {status}, {description},  cost_cat.ac_id "
                        + " FROM  activity_log_hactivity_log,  activitytype, cost_cat"
                        + " WHERE activitytype.activity_type = activity_log_hactivity_log.activity_type"
                        + "  AND  cost_cat.cost_cat_id  = activitytype.cost_cat_id"
                        + "  AND  activity_log_hactivity_log.status IN ( 'STOPPED', 'COMPLETED', 'COMPLETED-V', 'CLOSED' )"
                        + "  AND (activity_log_hactivity_log.cost_actual <> 0 OR activity_log_hactivity_log.cost_act_cap <> 0)"
                        + "  AND  activity_log_hactivity_log.date_completed >= {date_start} "
                        + "  AND  activity_log_hactivity_log.date_completed < {date_end} "
                        + "  AND (activity_log_hactivity_log.bl_id IS NOT NULL OR activity_log_hactivity_log.pr_id IS NOT NULL)"
                        + "  AND NOT EXISTS(SELECT 1  FROM cost_tran_sched cts_inner  WHERE cts_inner.bl_id = activity_log_hactivity_log.bl_id "
                        + "                                  AND cts_inner.cost_cat_id  = activitytype.cost_cat_id"
                        + "                                  AND cts_inner.date_due >= {date_start} AND cts_inner.date_due < {date_end}"
                        + "                                  AND cts_inner.status <> {status})"
                        + " GROUP BY activity_log_hactivity_log.bl_id, activity_log_hactivity_log.pr_id, activitytype.cost_cat_id, cost_cat.ac_id";
        return sqlStatement;
    }

    /**
     * Get SELECT statement for Service request costs.
     *
     * @return String
     */
    private String getInsertStatementForEstimatedServiceRequestCosts() {
        final String sqlStatement =
                "INSERT INTO cost_tran_sched ( bl_id, pr_id, cost_cat_id, amount_expense, date_due, status, description, ac_id ) "
                        + " SELECT activity_log_hactivity_log.bl_id, activity_log_hactivity_log.pr_id, activitytype.cost_cat_id, "
                        + " SUM( activity_log_hactivity_log.cost_estimated + activity_log_hactivity_log.cost_est_cap ), "
                        + " {date_start}, {status}, {description}, cost_cat.ac_id "
                        + " FROM  activity_log_hactivity_log, activitytype, cost_cat"
                        + " WHERE  activitytype.activity_type = activity_log_hactivity_log.activity_type"
                        + "  AND  cost_cat.cost_cat_id = activitytype.cost_cat_id"
                        + "  AND  activity_log_hactivity_log.status IN ('BUDGETED', 'PLANNED', 'SCHEDULED', 'IN PROGRESS', 'IN PROCESS-H' )"
                        + "  AND (activity_log_hactivity_log.cost_estimated <> 0 OR activity_log_hactivity_log.cost_est_cap <> 0)"
                        + "  AND  activity_log_hactivity_log.date_completed >= {date_start}"
                        + "  AND  activity_log_hactivity_log.date_completed < {date_end}"
                        + "  AND (activity_log_hactivity_log.pr_id IS NOT NULL OR activity_log_hactivity_log.bl_id IS NOT NULL)"
                        + "  AND NOT EXISTS(SELECT 1  FROM cost_tran_sched cts_inner WHERE cts_inner.bl_id = activity_log_hactivity_log.bl_id "
                        + "                                    AND cts_inner.cost_cat_id  = activitytype.cost_cat_id"
                        + "                                    AND cts_inner.date_due >= {date_start} AND cts_inner.date_due < {date_end}"
                        + "                                    AND cts_inner.status <> {status})"
                        + " GROUP BY activity_log_hactivity_log.bl_id,activity_log_hactivity_log.pr_id, activitytype.cost_cat_id, cost_cat.ac_id";
        return sqlStatement;
    }

    /**
     * Returns delete statement for Auto-summary costs from cost tran sched.
     *
     * @return String
     */
    private String getDeleteStatementForAutoSummaryCosts() {
        final String sqlStatement =
                " DELETE FROM cost_tran_sched WHERE  cost_tran_sched.date_due >= {date_start} AND cost_tran_sched.date_due < {date_end} AND cost_tran_sched.status = {status}";
        return sqlStatement;
    }
}
