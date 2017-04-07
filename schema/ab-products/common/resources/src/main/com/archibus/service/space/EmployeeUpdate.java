package com.archibus.service.space;

import com.archibus.datasource.*;
import com.archibus.jobmanager.JobStatus;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.StringUtil;

public class EmployeeUpdate {

    /**
     * Employee update calculations.
     *
     * @see emup.abs
     */
    public static void updateEmployeeHeadcounts() {
        
        String useRoomTransactions = Configuration.getActivityParameterString("AbSpaceRoomInventoryBAR", "UseWorkspaceTransactions");
        if(useRoomTransactions.equals("0")) {
            
            // COUNT number of EMPLOYEES in each RM

            new FieldOperation("rm", "em")
                .calculate("rm.count_em", "COUNT", "em.em_id");
            
            // COUNT number of EMPLOYEES on each FL

            new FieldOperation("fl", "em")
                .calculate("fl.count_em", "COUNT", "em.em_id");

            // SUM number of EMPLOYEES from FL to BL

            new FieldOperation("bl", "fl")
                .calculate("bl.count_em", "SUM", "fl.count_em");

            // SUM number of EMPLOYEES from BL to SITE

            new FieldOperation("site", "bl")
                .calculate("site.count_em", "SUM", "bl.count_em");
            
           // SUM number of EMPLOYEES from RM to RMTYPE

            new FieldOperation("rmtype", "rm")
                .calculate("rmtype.count_em", "SUM", "rm.count_em");

            // SUM number of EMPLOYEES from RMTYPE to RMCAT

            new FieldOperation("rmcat", "rm")
                .calculate("rmcat.count_em", "SUM", "rm.count_em");
        }

        // Equal Division of room area among employees

        new FieldFormula("rm", "em")
            .setAssignedRestriction("em.pct_rm = 0 AND em.rm_id IS NOT NULL")
            .calculate("em.area_rm", "rm.area / " + SqlUtils.formatSqlReplace0WithHuge("rm.count_em"));
       

        // COUNT number of EMPLOYEES on each DP

        new FieldOperation("dp", "em")
            .calculate("dp.count_em", "COUNT", "em.em_id");

        // COUNT number of EMPLOYEES in each DV

        new FieldOperation("dv", "em")
            .calculate("dv.count_em", "COUNT", "em.em_id");

        // SUM number of EMPLOYEES from DV to BU

        new FieldOperation("bu", "dv")
            .calculate("bu.count_em", "SUM", "dv.count_em");

        
        // SUM number of EMPLOYEES from RM to RMSTD

        new FieldOperation("rmstd", "rm")
            .calculate("rmstd.count_em", "SUM", "rm.count_em");

        // COUNT number of EMPLOYEES for each EMSTD

        new FieldOperation("emstd", "em")
            .calculate("emstd.count_em", "COUNT", "em.em_id");
    }

    /**
     * Infers Department Assignments from Employees.
     *
     * @see emdbtorm.abs
     */
    public static void inferRoomDepartmentsFromEmployees(String restriction, JobStatus status) {
        status.setResult(new JobResult("Infer room Depertments from Employees"));
        status.setTotalNumber(100);
        String emForRmRestriction = " em.bl_id = rm.bl_id" +
                 " AND em.fl_id = rm.fl_id" +
                 " AND em.rm_id = rm.rm_id";

        // Update those rooms with NO employee assigned IF
        // rm.prorate = 'NONE'
        // AND rmcat.occupiable = 1
        // AND ( rm.cap_em > 0  OR rmstd.std_em > 0 )

        String sql = "UPDATE rm SET dv_id = NULL, dp_id = NULL" +
             " WHERE 0 = (SELECT COUNT(*) FROM em WHERE " + emForRmRestriction + ")" +
             " AND rm.prorate = 'NONE'" +
             " AND 1 = (SELECT occupiable FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat )" +
             " AND ( 0 < rm.cap_em OR 0 < (SELECT std_em FROM rmstd WHERE rmstd.rm_std = rm.rm_std ) )";
        if (StringUtil.notNullOrEmpty(restriction)) {
            sql = sql + " AND " + restriction;
        }
        SqlUtils.executeUpdate("rm", sql);
        status.setCurrentNumber(30);

        // Update those rooms with ONLY ONE employee assigned
        sql = "UPDATE rm SET" +
            " dv_id = (SELECT dv_id FROM em WHERE " + emForRmRestriction + ")," +
            " dp_id = (SELECT dp_id FROM em WHERE " + emForRmRestriction + ")" +
             " WHERE 1 = ( SELECT COUNT(*) FROM em WHERE " + emForRmRestriction + ")";
        if (StringUtil.notNullOrEmpty(restriction)) {
            sql = sql + " AND " + restriction;
        }
        SqlUtils.executeUpdate("rm", sql);
        status.setCurrentNumber(60);

        // Update those rooms with MORE THAN ONE employee assigned
        sql = "UPDATE rm SET" +
            " dv_id = (SELECT dv_id FROM em ${sql.as} em_outer" +
                    " WHERE em_outer.em_id = (SELECT MIN( em_id ) FROM em" +
                                     " WHERE " + emForRmRestriction + " ) )," +
            " dp_id = (SELECT dp_id FROM em ${sql.as} em_outer" +
                    " WHERE em_outer.em_id = (SELECT MIN( em_id ) FROM em" +
                                        " WHERE " + emForRmRestriction + " ) )" +
             " WHERE 1 < ( SELECT COUNT(*) FROM em WHERE " + emForRmRestriction + ")";
        if (StringUtil.notNullOrEmpty(restriction)) {
            sql = sql + " AND " + restriction;
        }
        SqlUtils.executeUpdate("rm", sql);
        status.setCurrentNumber(100);
    }
}
