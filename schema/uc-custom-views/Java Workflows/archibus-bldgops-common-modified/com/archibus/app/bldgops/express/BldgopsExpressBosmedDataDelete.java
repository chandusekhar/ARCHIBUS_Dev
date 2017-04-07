package com.archibus.app.bldgops.express;

import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.*;

/**
 * Class contains methods for deleting sample data of BOSMED by SQL.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 * 
 *         Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class BldgopsExpressBosmedDataDelete extends JobBase {
    
    /**
     * Constant number 100.
     */
    private static final int ONE_HUNDRED = 100;
    
    /**
     * Constant number 5.
     */
    private static final int STEP = 5;
    
    /**
     * Indicate table name 'helpdesk_step_log'.
     */
    private static final String HELPDESK_STEP_LOG = "helpdesk_step_log";
    
    /**
     * Count of already executed SQL.
     */
    private int count;
    
    /**
     * Boolean sign indicates if the job is stopped.
     */
    private boolean isJobStopped;
    
    @Override
    public void run() {
        
        this.status.setTotalNumber(ONE_HUNDRED);
        this.isJobStopped = false;
        
        this.deleteRequests();
        
        this.deleteRmpct();
        
        this.deleteLlocation();
        
        this.deleteOrganization();
        
        this.deleteMetrics();
        
        if (this.isJobStopped) {
            
            this.status.setCode(JobStatus.JOB_STOPPED);
            
        } else {
            
            this.status.setCurrentNumber(ONE_HUNDRED);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Run SQL of deleting request related information.
     * 
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public void deleteRequests() {
        
        this.runSimpleSQL("wrcf",
            " delete wrcf from wrcf left outer join wr on wr.wr_id = wrcf.wr_id  where wr.bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("wrtr",
            " delete wrtr from wrtr inner join wr on wr.wr_id = wrtr.wr_id  where wr.bl_id = 'BOSMED' ");
        
        this.runSimpleSQL(
            HELPDESK_STEP_LOG,
            " delete helpdesk_step_log from helpdesk_step_log inner join wr on wr.wr_id = helpdesk_step_log.pkey_value  "
                    + " where helpdesk_step_log.table_name = 'wr' and wr.bl_id = 'BOSMED' ");
        
        this.runSimpleSQL(
            HELPDESK_STEP_LOG,
            " delete helpdesk_step_log from helpdesk_step_log inner join activity_log on activity_log.activity_log_id = helpdesk_step_log.pkey_value"
                    + " where helpdesk_step_log.table_name = 'activity_log' and activity_log.bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("wo", "  delete wo from wo where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("wr", " delete wr from wr where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("activity_log",
            " delete activity_log from activity_log where bl_id = 'BOSMED'  ");
        
        this.runSimpleSQL(
            "helpdesk_sla_steps",
            " delete helpdesk_sla_steps from helpdesk_sla_steps inner join helpdesk_sla_request "
                    + " on helpdesk_sla_request.ordering_seq = helpdesk_sla_steps.ordering_seq  and helpdesk_sla_request.activity_type = helpdesk_sla_steps.activity_type "
                    + "  where helpdesk_sla_steps.activity_id = 'AbBldgOpsOnDemandWork' and helpdesk_sla_request.bl_id = 'BOSMED'  ");
        
        this.runSimpleSQL(
            "helpdesk_sla_response",
            " delete helpdesk_sla_response from helpdesk_sla_response inner join helpdesk_sla_request "
                    + " on helpdesk_sla_request.ordering_seq = helpdesk_sla_response.ordering_seq  and helpdesk_sla_request.activity_type = helpdesk_sla_response.activity_type  "
                    + " where helpdesk_sla_request.bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("helpdesk_sla_request",
            " delete helpdesk_sla_request from helpdesk_sla_request where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("cf",
            "  delete cf from cf where option1='Quick-Start' and cf_id not in ('AISTART', 'AFMSTART') ");
    }
    
    /**
     * Run SQL of deleting location information.
     * 
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public void deleteLlocation() {
        
        this.runSimpleSQL("afm_dwgs",
            " delete afm_dwgs from afm_dwgs where dwg_name like '%BOSMED%' ");
        
        this.runSimpleSQL("gros", " delete gros from gros where bl_id like '%BOSMED%' ");
        
        this.runSimpleSQL("rm", " delete rm from rm where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("fl", " delete fl from fl where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("bl", " delete bl from bl where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("em",
            " delete em from em where comments = 'Quick-Start' and em_id not in ('AISTART', 'AFMSTART') ");
        
        this.runSimpleSQL("site", " delete site from site where site_id = 'BOSSTE' ");
    }
    
    /**
     * Run SQL of deleting organization information.
     * 
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public void deleteOrganization() {
        
        this.runSimpleSQL(
            "dp",
            " delete dp from dp where dv_id in ('ACCESSORIES', 'ELECTRONIC SYS.', 'EXECUTIVE', 'FACILITIES', 'FINANCE', 'HUMAN RESOURCES', 'MANAGEMENT CONS.', 'SOFTWARE APP.', 'SOFTWARE SOLN.') ");
        
        this.runSimpleSQL(
            "dv",
            " delete dv from dv where dv_id in ('ACCESSORIES', 'ELECTRONIC SYS.', 'EXECUTIVE', 'FACILITIES', 'FINANCE', 'HUMAN RESOURCES', 'MANAGEMENT CONS.', 'SOFTWARE APP.', 'SOFTWARE SOLN.') ");
    }
    
    /**
     * Run SQL of deleting metric trend value sample data.
     * 
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public void deleteMetrics() {
        final StringBuilder sqlRstriction = new StringBuilder();
        sqlRstriction
            .append(" metric_name IN ('occ_Area_perOccupant_monthly', 'occ_Density_monthly', 'occ_Occupancy_percent_monthly', ");
        sqlRstriction
            .append("                 'ops_alert_WorkOpen_weekly', 'ops_Costs-Maintenance_monthly', 'ops_WorkCompleted_monthly', ");
        sqlRstriction
            .append("                 'ops_WorkRequested_monthly', 'spac_VacantRooms_count_monthly', 'occ_Occupants_monthly', ");
        sqlRstriction
            .append("                 'spac_Area_Occupied_monthly', 'spac_GrossArea_monthly', 'spac_Seats_monthly')");
        
        this.runSimpleSQL("afm_metric_trend_values", " DELETE FROM afm_metric_trend_values WHERE "
                + sqlRstriction.toString());
        
        this.runSimpleSQL("afm_metric_definitions",
            " UPDATE afm_metric_definitions SET metric_status = 'A', metric_status_test = 'T' WHERE "
                    + sqlRstriction.toString());
        
    }
    
    /**
     * Run SQL of deleting space historical data for the BOSMED building.
     * 
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public void deleteRmpct() {
        
        this.runSimpleSQL("rmpct", " delete rmpct from rmpct where bl_id = 'BOSMED' ");
        
        this.runSimpleSQL("hrmpct", " delete hrmpct from hrmpct where bl_id = 'BOSMED' ");
    }
    
    /**
     * Run the sql passed in.
     * 
     * @param table String table to run the sql on.
     * @param sentence String sql sentence.
     */
    private void runSimpleSQL(final String table, final String sentence) {
        
        if (!this.isJobStopped) {
            
            StringBuilder sql;
            sql = new StringBuilder();
            sql.append(sentence);
            SqlUtils.executeUpdate(table, sql.toString());
            
            this.status.setCurrentNumber(this.count++ * STEP);
            
            if (this.status.isStopRequested()) {
                this.isJobStopped = true;
            }
        }
        
    }
    
}
