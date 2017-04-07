package com.archibus.app.bldgops.express;

import com.archibus.datasource.SqlUtils;

/**
 * Class holds methods for inserting records for Bldgops Express Application.
 *
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 *
 * @author Zhang Yi
 *
 *
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class BldgopsExpressTasksSwitch {

    /**
     * Indicates the activity 'AbBldgOpsOnDemandWork'.
     *
     */
    private static final String ACTIVITY_OD = "AbBldgOpsOnDemandWork";

    /**
     * Indicates the activity 'AbBldgOpsPM'.
     *
     */
    private static final String ACTIVITY_PM = "AbBldgOpsPM";

    /**
     * Indicates the old process 'Service Desk Manager'.
     *
     */
    private static final String SDM = "Service Desk Manager";

    /**
     * Indicates the new process 'Service Desk Mgr BldgOpsConsole'.
     *
     */
    private static final String SDM_CONSOLE = "Service Desk Mgr BldgOpsConsole";

    /**
     * Indicates the new process Bucket FM 2 – Building Ops.
     *
     */
    private static final String BBO = "Bucket FM 2 – Building Ops";

    /**
     * Indicates the new task 'Current Parts Inventory'.
     *
     */
    private static final String CPI = "Current Parts Inventory";

    /**
     * Indicates the new task FILE 'Current Parts Inventory'.
     *
     */
    private static final String CPI_FILE = "ab-parts-in-store-loc-crosstab.axvw";

    /**
     * Indicates the new process 'Operational Reports'.
     *
     */
    private static final String OR_P = "Operational Reports";

    /**
     * Indicates the new task 'Physical Inventory Variance'.
     *
     */
    private static final String PIV = "Physical Inventory Variance";

    /**
     * Indicates the new task FILE 'Physical Inventory Variance'.
     *
     */
    private static final String PIV_FILE = "ab-bldgops-report-inv-variance-mpsl.axvw";

    /**
     * Indicates the new task 'Define PM Schedules'.
     *
     */
    private static final String DPS = "Define PM Schedules";

    /**
     * Indicates the new task FILE 'Define PM Schedules'.
     *
     */
    private static final String DPS_FILE = "ab-pm-def-sched-mpsl.axvw";

    /**
     * Indicates the new task 'Parts Usage History'.
     *
     */
    private static final String PUH = "Parts Usage History";

    /**
     * Indicates the new task FILE 'Parts Usage History'.
     *
     */
    private static final String PUH_FILE = "ab-bldgops-report-pt-hist-mpsl.axvw";

    /**
     * Indicates the new task 'Reserved Parts'.
     *
     */
    private static final String RP_T = "Reserved Parts";

    /**
     * Indicates the new task FILE 'Reserved Parts'.
     *
     */
    private static final String RP_FILE = "ab-bldgops-report-reserved-pt-mpsl.axvw";

    /**
     * Indicates the new task FILE 'Current Parts Inventory'.
     *
     * /** Array of legacy process and new process maps. For each map, first string element is
     * activity, second string element is new process and third one is its corresponding legacy
     * process.
     *
     */
    private static final String[][] PROCESS_MAP =
            new String[][] { { ACTIVITY_OD, "Call Center BldgOpsConsole", "Call Center" },
                    { ACTIVITY_OD, "Craftsperson_WEB BldgOpsConsole", "Craftsperson_WEB" },
                    { ACTIVITY_OD, "Requestor_WEB BldgOpsConsole", "Requestor_WEB" },
                    { ACTIVITY_OD, "Supervisor_WEB BldgOpsConsole", "Supervisor_WEB" },
                    { ACTIVITY_PM, "Supervisor BldgOpsConsole", "Supervisor" },
                    { ACTIVITY_PM, "Craftsperson BldgOpsConsole", "Craftsperson" },
                    { ACTIVITY_OD, "Business Manager BldgOpsConsole", "Business Manager" },
                    { ACTIVITY_OD, "Dispatcher_WEB BldgOpsConsole", "Dispatcher_WEB" },
                    { ACTIVITY_OD, SDM_CONSOLE, SDM }, { ACTIVITY_PM, SDM_CONSOLE, SDM },
                    { ACTIVITY_OD, "Inventory Manager MPSL", "Inventory Manager" },
                    { ACTIVITY_PM, "Maintenance MPSL", "Maintenance" } };

    /**
     * Array of legacy task that need update task file name.
     */
    private static final String[][] TASK_MAP = new String[][] { { ACTIVITY_OD, BBO, CPI, CPI_FILE },
            { ACTIVITY_OD, OR_P, CPI, CPI_FILE }, { ACTIVITY_PM, OR_P, CPI, CPI_FILE },
            { ACTIVITY_OD, BBO, PIV, PIV_FILE }, { ACTIVITY_OD, OR_P, PIV, PIV_FILE },
            { ACTIVITY_PM, OR_P, PIV, PIV_FILE },
            { ACTIVITY_PM, "Maintenance Manager", DPS, DPS_FILE },
            { ACTIVITY_PM, "Define Schedules (Web Dashboard)", DPS, DPS_FILE },
            { ACTIVITY_PM, "Bucket FM 2 – PM", DPS, DPS_FILE },
            { ACTIVITY_OD, OR_P, PUH, PUH_FILE }, { ACTIVITY_PM, OR_P, PUH, PUH_FILE },
            { ACTIVITY_OD, OR_P, RP_T, RP_FILE }, { ACTIVITY_PM, OR_P, RP_T, RP_FILE } };

    /**
     * Indicates the table 'afm_roleprocs'.
     *
     */
    private static final String AFM_ROLEPROCS = "afm_roleprocs";

    /**
     * Indicates the table 'afm_ptasks'.
     *
     */
    private static final String AFM_PTASKS = "afm_ptasks";

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private BldgopsExpressTasksSwitch() {

    }

    /**
     * As part of the upgrade to the Building Operations console, the system will now replace
     * existing processes with other processes that contain those tasks that are specific to use
     * with console. The system should no longer create new afm_ptask data.
     *
     */
    public static void enableBuildingOperationConsoleTasks() {

        connectRoleToNewProcess();

        disconnectRoleFromOldProcess();

        updateTaskFileName();

        deleteUnusedProcesses();

        deleteUnusedTasks();
    }

    /**
     * For each of the process/role records of afm_roleprocs for the activities and legacy-processes
     * defined in PROCESS_MAP, insert a new record into afm_roleprocs, mapping to the new processes.
     *
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    private static void connectRoleToNewProcess() {

        StringBuilder insertSql;

        for (final String[] element : PROCESS_MAP) {

            insertSql = new StringBuilder();

            insertSql.append("INSERT INTO afm_roleprocs (activity_id, process_id, role_name) ");
            insertSql.append(" SELECT '").append(element[0]).append("', '").append(element[1])
                .append("', role_name from afm_roleprocs ");
            insertSql.append(" WHERE activity_id ='").append(element[0])
                .append("'      AND process_id ='").append(element[2]).append("'");
            insertSql
                .append(
                    "           AND NOT EXISTS ( SELECT 1 FROM afm_roleprocs ${sql.as} ar WHERE ar.activity_id ='")
                .append(element[0]).append("' and ar.process_id ='").append(element[1])
                .append("'                    and ar.role_name=afm_roleprocs.role_name) ");

            SqlUtils.executeUpdate(AFM_ROLEPROCS, insertSql.toString());
        }
    }

    /**
     * Delete from afm_roleprocs where activities and processes are listed in the PROCESS_MAP as
     * "Process - legacy".
     *
     * Justification: Case #2.2: Statement with DELETE ... WHERE pattern.
     */
    private static void disconnectRoleFromOldProcess() {

        StringBuilder deleteSql;

        for (final String[] element : PROCESS_MAP) {

            deleteSql = new StringBuilder();

            deleteSql.append("DELETE FROM afm_roleprocs ");
            deleteSql.append(" WHERE activity_id='").append(element[0]).append("' AND process_id='")
                .append(element[2]).append("' ");

            SqlUtils.executeUpdate(AFM_ROLEPROCS, deleteSql.toString());
        }

        SqlUtils.executeUpdate(AFM_ROLEPROCS,
            "DELETE FROM afm_roleprocs WHERE activity_id IN ('AbBldgOpsOnDemandWork','AbBldgOpsPM') "
                    + " AND process_id IN('Supervisor_WR','Craftsperson_WR','Supervisor(Work Requests)','Craftsperson(Work Requests)')");
    }

    /**
     * Update task file name.
     *
     * Justification: Case #2.2: Statement with Update ... WHERE pattern.
     */
    private static void updateTaskFileName() {

        StringBuilder updateSql;

        for (final String[] element : TASK_MAP) {

            updateSql = new StringBuilder();

            updateSql.append("UPDATE afm_ptasks SET task_file = '").append(element[2 + 1]);
            updateSql.append("' WHERE activity_id='").append(element[0])
                .append("'  AND process_id='").append(element[1]).append("'  AND task_id='")
                .append(element[2]).append("'   ");

            SqlUtils.executeUpdate(AFM_PTASKS, updateSql.toString());
        }
    }

    /**
     * Delete from not used tasks
     *
     * Justification: Case #2.2: Statement with DELETE ... WHERE pattern.
     */
    private static void deleteUnusedTasks() {

        StringBuilder deleteSql;
        deleteSql = new StringBuilder();

        deleteSql.append("DELETE FROM afm_ptasks ");
        deleteSql.append(" WHERE activity_id IN ('AbBldgOpsOnDemandWork','AbBldgOpsPM')"
                + " AND process_id = 'Operational Reports' AND task_id = 'Understocked Parts'");
        SqlUtils.executeUpdate(AFM_PTASKS, deleteSql.toString());

    }

    /**
     * Delete from not used processes
     *
     * Justification: Case #2.2: Statement with DELETE ... WHERE pattern.
     */
    private static void deleteUnusedProcesses() {

        StringBuilder deleteSql;
        deleteSql = new StringBuilder();

        deleteSql.append("DELETE FROM afm_processes ");
        deleteSql.append(" WHERE activity_id IN ('AbBldgOpsOnDemandWork','AbBldgOpsPM') "
                + " AND process_id IN ('Craftsperson_WR BldgOpsConsole','Supervisor_WR BldgOpsConsole','Supervisor(WR) BldgOpsConsole','Craftsperson(WR) BldgOpsConsole')");
        SqlUtils.executeUpdate(AFM_PTASKS, deleteSql.toString());

    }
}
