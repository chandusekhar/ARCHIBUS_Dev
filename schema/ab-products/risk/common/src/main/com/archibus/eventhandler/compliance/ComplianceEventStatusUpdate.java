package com.archibus.eventhandler.compliance;

import com.archibus.datasource.SqlUtils;

/**
 * The Class contains all actual methods to run the SQL for Compliance Event Status Update.
 *
 * Added for 22.1 Compliance Bldgops Integration.
 *
 * @author ASC-BJ:Zhang Yi
 *
 *         Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class ComplianceEventStatusUpdate {

    /**
     * Constant: event status 'IN PROGRESS'.
     */
    public static final String STATUS_IN_PROGRESS = "IN PROGRESS";
    
    /**
     * Constant: event status 'COMPLETED'.
     */
    public static final String STATUS_COMPLETED = "COMPLETED";
    
    /**
     * Constant: event status 'CANCELLED'.
     */
    public static final String STATUS_CANCELLED = "CANCELLED";
    
    /**
     * Constant: event status 'STOPPED'.
     */
    public static final String STATUS_STOPPED = "STOPPED";
    
    /**
     * Constant: event status 'IN PROCESS-H'.
     */
    public static final String STATUS_IN_PROCESS_H = "IN PROCESS-H";

    /**
     * Constant: event status 'SCHEDULED'.
     */
    public static final String STATUS_SCHEDULED = "SCHEDULED";

    /**
     * /** Constructor.
     *
     */
    private ComplianceEventStatusUpdate() {
    }
    
    /**
     * Update event's status.
     */
    public static void update() {
        
        updateStatusToInProgress();

        updateStatusCommon(STATUS_COMPLETED);
        
        updateStatusCommon(STATUS_CANCELLED);
        
        updateStatusCommon(STATUS_STOPPED);
        
        updateStatusFromSvcReqAll();
        updateStatusFromSvcReqCompleted();
        updateStatusFromSvcReqSingle();

    }

    /**
     * Change status from scheduled to started, IF we are on or past the event scheduled start date
     * AND the event’s scheduled PM work has started.
     *
     * Justification: Case #2.1 : Statement with Update ... pattern.
     */
    public static void updateStatusToInProgress() {

        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE activity_log SET status = 'IN PROGRESS'");
        sql.append(" WHERE activity_log_id IN ( ");
        sql.append("    SELECT DISTINCT act.activity_log_id ");
        sql.append("    FROM regreq_pmp rp ");
        
        appendSubSqlOfJoinActivityLogByStatus(sql, STATUS_IN_PROGRESS);
        
        appendCommonJoinSubSql(sql);
        sql.append("    JOIN wr ON wr.pms_id = pms.pms_id");

        appendCommonWhereSubSql(sql);
        appendDateFieldCompareClauses(sql, STATUS_IN_PROGRESS);
        
        sql.append("    AND wr.status NOT IN ('S','Can','Com','Clo')");
        sql.append("  )");

        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sql.toString());
    }

    /**
     * Change status to cancelled, IF we are on or past the event scheduled start date AND the
     * event’s scheduled PM work has been cancelled.
     *
     * @param status String 'CANCELLED' or 'STOPPED'
     *
     *            Justification: Case #2.1 : Statement with Update ... pattern.
     */
    public static void updateStatusCommon(final String status) {

        final StringBuilder sql = new StringBuilder();
        
        appendStartUpdateSqlClausesByStatus(sql, status);
        
        appendSelectCountSubSqlByStatus(sql, status);

        appendSubSqlOfJoinActivityLogByStatus(sql, status);
        
        appendCommonJoinSubSql(sql);
        appendCommonWhereSubSql(sql);

        appendFinalAliasAndWhereClausesByStatus(sql, status);
        
        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sql.toString());
    }
    
    /**
     * Change Event status to match status of its Service Requests, only if ALL its Requests have
     * same status
     *
     * Justification: Case #2.1 : Statement with Update ... pattern.
     */
    public static void updateStatusFromSvcReqAll() {

        final StringBuilder sql = new StringBuilder();
        
        final String commonSetClause = " SET activity_log.status=tbl2.all_status ";
        
        if (SqlUtils.isOracle()) {
            sql.append(" MERGE INTO activity_log ");
            sql.append(" USING ");
        } else {
            sql.append(" UPDATE activity_log ");
            sql.append(commonSetClause);
            sql.append(" FROM activity_log, ");
        }
        sql.append(" ( ");
        sql.append("  SELECT tbl1.activity_log_id, MIN(tbl1.status) AS all_status ");
        sql.append("  FROM ( ");
        sql.append("    SELECT event.activity_log_id, svcreq.status, COUNT(svcreq.status) AS statcnt ");
        sql.append("    FROM activity_log event, activity_log_hactivity_log svcreq ");
        sql.append("    WHERE svcreq.assessment_id = event.activity_log_id ");
        sql.append("    AND event.activity_type = 'COMPLIANCE - EVENT' ");
        sql.append("    AND svcreq.activity_type LIKE 'SERVICE DESK%' ");
        sql.append("    AND event.status NOT IN ('COMPLETED-V','CLOSED','CANCELLED') ");
        sql.append("    GROUP BY event.activity_log_id, svcreq.status ");
        sql.append("  ) tbl1 ");
        sql.append("  GROUP BY activity_log_id ");
        sql.append("  HAVING COUNT(tbl1.status)=1 ");
        sql.append(" ) tbl2 ");
        
        final String commonStatusFilter =
                " AND tbl2.all_status IN ('SCHEDULED','CANCELLED','IN PROGRESS','IN PROCESS-H','STOPPED','COMPLETED','COMPLETED-V','CLOSED') ";

        if (SqlUtils.isOracle()) {
            sql.append(" ON (tbl2.activity_log_id=activity_log.activity_log_id ");
            sql.append(commonStatusFilter);
            sql.append(" )");
            sql.append(" WHEN MATCHED THEN UPDATE ");
            sql.append(commonSetClause);
        } else {
            sql.append(" WHERE tbl2.activity_log_id = activity_log.activity_log_id ");
            sql.append(commonStatusFilter);
        }
        
        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sql.toString());
    }
    
    /**
     * Change Event status to Completed if ALL its service requests are completed, verified, OR
     * closed This is necessary because updateStatusFromSvcReqAll method will update to Completed
     * only if all SR are Completed, but if there is a mix of completed, verified, and/or closed, it
     * will not update the event status.
     *
     * Justification: Case #2.1 : Statement with Update ... pattern.
     */
    public static void updateStatusFromSvcReqCompleted() {

        final StringBuilder sql = new StringBuilder();
        
        sql.append(" UPDATE activity_log SET status='COMPLETED' ");
        sql.append(" WHERE activity_log.activity_type = 'COMPLIANCE - EVENT' ");
        sql.append(" AND activity_log.status NOT IN ('COMPLETED','COMPLETED-V','CLOSED','CANCELLED') ");
        sql.append(" AND EXISTS (SELECT 1 ");
        sql.append("             FROM activity_log svcreq ");
        sql.append("             WHERE svcreq.assessment_id = activity_log.activity_log_id ");
        sql.append("             AND svcreq.activity_type LIKE 'SERVICE DESK%') ");
        sql.append(" AND NOT EXISTS (SELECT 1 ");
        sql.append("                 FROM activity_log svcreq ");
        sql.append("                 WHERE svcreq.assessment_id = activity_log.activity_log_id ");
        sql.append("                 AND svcreq.activity_type LIKE 'SERVICE DESK%' ");
        sql.append("                 AND svcreq.status NOT IN ('COMPLETED','COMPLETED-V','CLOSED')) ");
        
        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sql.toString());
    }
    
    /**
     * Change Event status to STOPPED, IN PROGRESS, IN PROCESS-H, or SCHEDULED if any SINGLE service
     * request has that status. Justification: Case #2.1 : Statement with Update ... pattern.
     */
    public static void updateStatusFromSvcReqSingle() {

        final StringBuilder sql = new StringBuilder();
        
        final String commonSetClause = " SET activity_log.status=tbl2.single_status ";
        
        if (SqlUtils.isOracle()) {
            sql.append(" MERGE INTO activity_log ");
            sql.append(" USING ");
        } else {
            sql.append(" UPDATE activity_log ");
            sql.append(commonSetClause);
            sql.append(" FROM activity_log JOIN ");
        }
        sql.append(" ( ");
        sql.append("  SELECT event.activity_log_id, ");
        sql.append("  (CASE ");

        appendCaseWhenSqlClauseByStatus(sql, STATUS_STOPPED);
        appendCaseWhenSqlClauseByStatus(sql, STATUS_IN_PROCESS_H);
        appendCaseWhenSqlClauseByStatus(sql, STATUS_IN_PROGRESS);
        appendCaseWhenSqlClauseByStatus(sql, STATUS_SCHEDULED);

        sql.append("  ELSE NULL END ");
        sql.append("  ) single_status ");
        sql.append("  FROM  activity_log event ");
        sql.append(" WHERE event.activity_type = 'COMPLIANCE - EVENT' ");
        sql.append(" AND event.status NOT IN ('COMPLETED-V','CLOSED','CANCELLED') ");
                
        sql.append(" ) tbl2 ON (activity_log.activity_log_id = tbl2.activity_log_id ");

        if (SqlUtils.isOracle()) {
            sql.append(") WHEN MATCHED THEN UPDATE ");
            sql.append(commonSetClause);
        }
        else {
            sql.append(" AND tbl2.single_status IS NOT NULL) ");
        }
        
        
        sql.append(" WHERE activity_log.status<>tbl2.single_status ");
        
        if (SqlUtils.isOracle()) {
            sql.append(" AND tbl2.single_status IS NOT NULL ");
        }

        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sql.toString());
    }
    
    /**
     * Add the CASE WHEN sql clause for updateStatusFromSvcReqSingle method.
     *
     * @param sql StringBuilder update sql
     * @param status String 'IN PROGRESS', 'IN PROCESS-H', 'SCHEDULED' or 'STOPPED'
     */
    private static void appendCaseWhenSqlClauseByStatus(final StringBuilder sql, final String status) {

        sql.append(" WHEN (EXISTS (SELECT 1 ");
        sql.append("               FROM activity_log svcreq ");
        sql.append("               WHERE svcreq.assessment_id = event.activity_log_id ");
        sql.append("               AND svcreq.activity_type LIKE 'SERVICE DESK%' ");
        sql.append("               AND svcreq.status='").append(status).append("'");
        sql.append("               ))");
        sql.append(" THEN '").append(status).append("'");
    }

    /**
     * Add the sql clauses of alias and where condition as the final of whole sql sentence by given
     * status.
     *
     * @param sql StringBuilder update sql
     * @param status String 'IN PROGRESS', 'COMPLETED', 'CANCELLED' or 'STOPPED'
     */
    private static void appendStartUpdateSqlClausesByStatus(final StringBuilder sql,
            final String status) {

        sql.append(" UPDATE activity_log SET status = '").append(status).append("'");
        
        if (SqlUtils.isOracle()) {
            sql.append(" WHERE activity_log_id IN (  ");
            sql.append("    SELECT activity_log_id FROM (  ");

        } else {
            sql.append(" FROM afm.activity_log JOIN ( ");
        }
        
    }
    
    /**
     * Add the sub sql of joining activity log to update sql by given status.
     *
     * @param sql StringBuilder update sql
     * @param status String 'IN PROGRESS', 'COMPLETED', 'CANCELLED' or 'STOPPED'
     *
     *            Justification: Case #2.1 : Statement with Update ... pattern.
     */
    private static void appendSubSqlOfJoinActivityLogByStatus(final StringBuilder sql,
            final String status) {

        sql.append("           JOIN (");
        sql.append("                SELECT al1.activity_log_id, al1.regulation, al1.reg_program, al1.reg_requirement, al1.location_id, ");
        
        sql.append("                       (SELECT MAX(al2.date_required) FROM activity_log al2");
        sql.append("                        WHERE al2.date_required < al1.date_required ");
        sql.append("                        AND al2.reg_requirement=al1.reg_requirement AND al2.reg_program=al1.reg_program  ");
        sql.append("                        AND al2.regulation=al1.regulation ");
        sql.append("                       ) date_required_prev,");
        
        sql.append("                       (SELECT MIN(al2.date_scheduled) FROM activity_log al2");
        sql.append("                        WHERE al2.date_scheduled > al1.date_required");
        sql.append("                        AND al2.reg_requirement=al1.reg_requirement AND al2.reg_program=al1.reg_program ");
        sql.append("                        AND al2.regulation=al1.regulation");
        sql.append("                       ) date_start_next");
        
        sql.append("                FROM activity_log al1 ");
        
        sql.append("                JOIN regreq_pmp rpm ON rpm.reg_requirement=al1.reg_requirement AND");
        sql.append("                    rpm.reg_program=al1.reg_program AND rpm.regulation=al1.regulation");
        
        sql.append("                WHERE activity_type='COMPLIANCE - EVENT' ");

        if (STATUS_IN_PROGRESS.equalsIgnoreCase(status)) {
            sql.append("                  AND status NOT IN ('IN PROGRESS','COMPLETED-V','CLOSED','CANCELLED') ");

        } else if (STATUS_COMPLETED.equalsIgnoreCase(status)) {
            sql.append("                  AND status NOT IN ('COMPLETED','COMPLETED-V','CLOSED','CANCELLED') ");
            
        } else if (STATUS_CANCELLED.equalsIgnoreCase(status)) {
            sql.append("                  AND status NOT IN ('COMPLETED-V','CLOSED','CANCELLED') ");
            
        } else {
            sql.append("                  AND status NOT IN ('STOPPED','COMPLETED-V','CLOSED','CANCELLED') ");
        }
        
        if (SqlUtils.isOracle()) {
            sql.append("                  AND (TRUNC(SYSDATE)-al1.date_scheduled) >= 0 ");
        } else {
            sql.append("                  AND DATEDIFF(dd, al1.date_scheduled, GETDATE()) >= 0 ");
        }
        
        sql.append("            ) act ON rp.regulation=act.regulation AND rp.reg_program=act.reg_program AND rp.reg_requirement=act.reg_requirement ");
    }
    
    /**
     * Add the sub sql of joining eq, compliance_locations,etc.
     *
     * @param sql StringBuilder update sql
     */
    private static void appendCommonJoinSubSql(final StringBuilder sql) {

        sql.append("    JOIN pms ON pms.pmp_id = rp.pmp_id ");
        sql.append("    LEFT JOIN regloc rl ON rp.regulation=rl.regulation AND rp.reg_program=rl.reg_program AND rp.reg_requirement=rl.reg_requirement ");
        
        sql.append("    LEFT JOIN eq ON pms.eq_id = eq.eq_id");

        sql.append("    LEFT JOIN compliance_locations cl ON");
        sql.append("    (act.location_id IS NOT NULL AND act.location_id = cl.location_id)");
        sql.append("    OR (act.location_id IS NULL AND rl.location_id = cl.location_id)");
    }

    /**
     * Add the where clauses for conditions of location, equipment, etc.
     *
     * @param sql StringBuilder update sql
     */
    private static void appendCommonWhereSubSql(final StringBuilder sql) {

        sql.append("    WHERE (pms.site_id=cl.site_id OR cl.site_id IS NULL)");
        sql.append("    AND (pms.bl_id=cl.bl_id OR cl.bl_id IS NULL) ");
        sql.append("    AND (pms.fl_id=cl.fl_id OR cl.fl_id IS NULL)");
        sql.append("    AND (pms.rm_id=cl.rm_id OR cl.rm_id IS NULL)");
        sql.append("    AND (pms.eq_id=cl.eq_id OR cl.eq_id IS NULL)");
        sql.append("    AND (eq.eq_std=cl.eq_std OR cl.eq_std IS NULL)");
    }
    
    /**
     * Add the sub sqls for selecting count calculations according to status.
     *
     * @param sql StringBuilder update sql
     * @param status String 'IN PROGRESS', 'COMPLETED', 'CANCELLED' or 'STOPPED'
     */
    private static void appendSelectCountSubSqlByStatus(final StringBuilder sql, final String status) {
        
        sql.append("        SELECT ");
        sql.append("           activity_log_id, COUNT(activity_log_id) pms_count,");
        sql.append("           SUM(CASE WHEN wr_total=0 THEN 1 ELSE 0 END) pms_nowr,");

        if (STATUS_COMPLETED.equalsIgnoreCase(status)) {
            
            sql.append("       SUM(CASE WHEN wr_completed>0 AND wr_completed=wr_total THEN 1 ELSE 0 END) pms_completed,");
            sql.append("       SUM(eq_nopms) eq_nopms");
            
        } else if (STATUS_CANCELLED.equalsIgnoreCase(status)) {

            sql.append("       SUM(CASE WHEN wr_cancelled>0 AND wr_cancelled=wr_total THEN 1 ELSE 0 END) pms_cancelled");

        } else {
            
            sql.append("       SUM(CASE WHEN wr_stopped>0 AND wr_stopped=wr_total THEN 1 ELSE 0 END) pms_stopped");
        }
        
        sql.append("        FROM (");
        
        sql.append("              SELECT ");
        sql.append("                DISTINCT act.activity_log_id, pms.pmp_id, pms.pms_id,");

        sql.append("                (SELECT COUNT(wr_id) FROM afm.wrhwr WHERE wrhwr.pms_id=pms.pms_id ");
        appendDateFieldCompareClauses(sql, status);
        sql.append("                 ) wr_total,    ");

        sql.append("                (SELECT COUNT(wr_id) FROM afm.wrhwr WHERE wrhwr.pms_id=pms.pms_id");
        appendDateFieldCompareClauses(sql, status);

        if (STATUS_COMPLETED.equalsIgnoreCase(status)) {

            sql.append("             AND wrhwr.status IN ('Com','Clo') ) wr_completed,    ");

            sql.append("            (SELECT COUNT(eq2.eq_id) FROM afm.eq eq2");
            sql.append("             LEFT JOIN afm.pms pms2 ON eq2.eq_id=pms2.eq_id");
            sql.append("             WHERE eq2.eq_std = cl.eq_std AND cl.eq_id IS NULL AND pms2.pms_id IS NULL) eq_nopms ");
            
        } else if (STATUS_CANCELLED.equalsIgnoreCase(status)) {

            sql.append("            AND wrhwr.status = 'Can') wr_cancelled");

        } else {
            
            sql.append("            AND wrhwr.status = 'S') wr_stopped");
        }
        
        sql.append("               FROM afm.regreq_pmp rp");
    }

    /**
     * Add the sql clauses for comparing the date field values.
     *
     * @param sql StringBuilder update sql
     * @param status String work request status
     */
    private static void appendDateFieldCompareClauses(final StringBuilder sql, final String status) {
        
        String dateAssigned = "wrhwr.date_assigned";
        if (STATUS_IN_PROGRESS.equalsIgnoreCase(status)) {
            dateAssigned = "wr.date_assigned";
        }
        sql.append("                 AND ").append(dateAssigned).append(" IS NOT NULL");
        if (SqlUtils.isOracle()) {
            sql.append("                 AND NVL((").append(dateAssigned)
                .append(" - date_required_prev),1) > 0   ");
            sql.append("                 AND NVL((date_start_next - ").append(dateAssigned)
                .append("),1) > 0   ");

        } else {
            sql.append("                 AND ISNULL(DATEDIFF(dd, date_required_prev, ")
                .append(dateAssigned).append("),1) > 0   ");
            sql.append("                 AND ISNULL(DATEDIFF(dd, ").append(dateAssigned)
                .append(", date_start_next),1) > 0   ");
        }
    }

    /**
     * Add the sql clauses of alias and where condition as the final of whole sql sentence by given
     * status.
     *
     * @param sql StringBuilder update sql
     * @param status String 'IN PROGRESS', 'COMPLETED', 'CANCELLED' or 'STOPPED'
     */
    private static void appendFinalAliasAndWhereClausesByStatus(final StringBuilder sql,
            final String status) {

        sql.append("        ) tbl1");
        sql.append("        GROUP BY activity_log_id");
        sql.append("     ) tbl2 ");

        if (!SqlUtils.isOracle()) {
            sql.append("  ON activity_log.activity_log_id = tbl2.activity_log_id ");
        }
        
        if (STATUS_COMPLETED.equalsIgnoreCase(status)) {
            sql.append("    WHERE pms_completed=pms_count AND eq_nopms=0 ");
            
        } else if (STATUS_CANCELLED.equalsIgnoreCase(status)) {
            sql.append("    WHERE pms_cancelled>0 AND (pms_cancelled+pms_nowr)=pms_count ");

        } else {
            sql.append("    WHERE pms_stopped>0 AND (pms_stopped+pms_nowr)=pms_count ");
        }
        
        if (SqlUtils.isOracle()) {
            sql.append(") ");
        }
    }
}
