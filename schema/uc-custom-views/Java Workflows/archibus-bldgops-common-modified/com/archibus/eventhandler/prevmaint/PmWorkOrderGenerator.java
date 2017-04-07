package com.archibus.eventhandler.prevmaint;

import java.sql.Time;
import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.app.bldgops.partinv.*;
import com.archibus.app.common.util.SchemaUtils;
import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.ondemandwork.*;
import com.archibus.eventhandler.sla.*;
import com.archibus.eventhandler.steps.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;

/**
 * PmWorkOrderGenerator - Long running job that generates Preventive Maintenance work orders and
 * work requests.
 *
 * <p>
 * History:
 * <li>Initial implementation for PM release 1.
 * <li>Modified implementation for PM release 2 new functionality: enforce SLA. By Zhang Yi.
 *
 * @author Sergey, Zhang Yi
 */
public class PmWorkOrderGenerator extends JobBase implements DataSource.RecordHandler {

    // ----------------------- constants for pmType parameter -------------------------------------

    // Constants that indicates two PM types.
    public static final String PMTYPE_EQWO = "EQPM";

    public static final String PMTYPE_HSWO = "HSPM";

    // ----------------------- constants for groupOption parameter --------------------------------

    public static final int GROUP_BY_PM_SCHEDULE = 0;

    public static final int GROUP_BY_SITE = 1;

    public static final int GROUP_BY_EQUIPMENT_CODE = 2;

    public static final int GROUP_BY_EQUIPMENT_SUBCOMPONENT = 3;

    public static final int GROUP_BY_EQUIPMENT_STANDARD = 4;

    public static final int GROUP_BY_BUILDING = 5;

    public static final int GROUP_BY_FLOOR = 6;

    public static final int GROUP_BY_ROOM = 7;

    public static final int GROUP_BY_TRADE = 8;

    public static final int GROUP_BY_PM_PROCEDURE = 9;

    // ----------------------- properties that define WO generation -------------------------------

    /**
     * Preventive maintenance type: housekeeping or equipment.
     */
    private final String pmType;

    /**
     * Start date of the date range for which the work orders are generated.
     */
    private final Date dateFrom;

    /**
     * End date of the date range for which the work orders are generated.
     */
    private final Date dateTo;

    /**
     * CSV string list of fields that define pms records groupings - work orders are generated for
     * each distinct grouping value.
     */
    private final String[] groupByFields;

    /**
     * Translatable title for the grouping description.
     */
    private final String groupByTitle;

    private final String groupCodeTitle;

    private final String pmsidRestriction;

    /**
     * If true, pms.pm_group distinct values are used to group pms records for work order
     * generation.
     */
    private final boolean useGroupingCodes;

    // ----------------------- localized messages -------------------------------------------------

    // @translatable
    private final String WR_PROBLEM_TYPE = "PREVENTIVE MAINT";

    // @translatable
    private final String MESSAGE_PREVENTIVE_MAINTENANCE = "Preventive Maintenance for";

    // @translatable
    private final String MESSAGE_FOR = "for";

    // @translatable
    private final String[] GROUP_BY_MESSAGES = { "PM Schedule", "Site", "Equipment Code",
            "Equipment Subcomponent", "Equipment Standard", "Building", "Floor", "Room",
            "Primary Trade", "PM Procedure" };

    private final String[][] GROUP_BY_FIELDS_HK = { {}, { "pms.site_id" }, { "pms.eq_id" },
            { "eq.subcomponent_of", "pms.eq_id" }, { "eq.eq_std", "pms.eq_id" },
            { "pms.site_id", "pms.bl_id" }, { "pms.site_id", "pms.bl_id", "pms.fl_id" },
            { "pms.site_id", "pms.bl_id", "pms.fl_id", "pms.rm_id" },
            { "pmp.tr_id", "pms.pmp_id" }, { "pms.pmp_id" } };

    private final String[][] GROUP_BY_FIELDS_EQ = { {}, { "eq.site_id" }, { "pms.eq_id" },
            { "eq.subcomponent_of", "pms.eq_id" }, { "eq.eq_std", "pms.eq_id" },
            { "eq.site_id", "eq.bl_id" }, { "eq.site_id", "eq.bl_id", "eq.fl_id" },
            { "eq.site_id", "eq.bl_id", "eq.fl_id", "eq.rm_id" }, { "pmp.tr_id", "pms.pmp_id" },
            { "pms.pmp_id" } };

    // @translatable
    private final String MESSAGE_JOBSTATUS = "work orders generated.";

    // @translatable
    private final String MESSAGE_NOWO = "No work order generated.";

    // @translatable
    private final String MESSAGE_ViewWO = "View Generated Work Orders and Work Requests";

    // ----------------------- process status properties ------------------------------------------

    private long startWrId = -1;

    private long endWrId = 0;

    private int totalRecords;

    private int currentRecord;

    private String prevPmGroupCode;

    private String prevPmGroupBy;

    private Date prevDateAssigned;

    private String prevSiteId;

    private String prevBuildingId;

    private String prevFloorId;

    private String prevRoomId;

    private int prevWoId;

    private DataRecord prevWoRecord;

    private boolean isGroupByBlFlRm = false;

    // number of the created work orders
    private int totalWoNum;

    private DataRecord attachedSlaResponse = null;

    private List<Integer> notifyWoListForCF = null;

    private List<Integer> notifyWoListForSupervisor = null;

    // ----------------------- implementation methods ---------------------------------------------

    private final Logger log = Logger.getLogger(this.getClass());

    private int startWoId = -1;

    private int endWoId = -1;

    private final String fileUrlStr = "ab-pm-rpt-pm-wo.axvw";

    // KB#3030758: use LocalDateTimeUtil methods to improve performance for getting local date and
    // time of timezone.
    private final LocalDateTime localDateTime;

    // KB#3035463: put generate schedule date and generate work order to one job.
    PmScheduleGenerator pmScheduleGenerator;

    private String restriction;

    private final String narrowPmsRestriction =
            " AND EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pms.pms_id in (select pms_id from pms where pms_id not in (select pms_id from pms where (interval_freq = 1 and interval_1 = 0) or "
                    + "(interval_freq = 2 and interval_2 = 0) or "
                    + "(interval_freq = 3 and interval_3 = 0) or "
                    + "(interval_freq = 4 and interval_4 = 0)))) ";

    /*
     * Constructor.
     *
     * @param pmType Preventive maintenance type: housekeeping or equipment.
     *
     * @param dateFrom Start date of the date range for which the work orders are generated.
     *
     * @param dateTo End date of the date range for which the work orders are generated.
     *
     * @param groupOption Defines which fields should be used to group pms records - work orders are
     * generated for each distinct grouping value.
     *
     * @param useGroupingCodes If true, pms.pm_group distinct values are used to group pms records.
     *
     * @param pmsidRestriction Restriction on PM SChedule id.
     */
    public PmWorkOrderGenerator(final String pmType, final Date dateFrom, final Date dateTo,
            final int groupOption, final boolean useGroupingCodes, final String pmsidRestriction,
            final PmScheduleGenerator pmScheduleGenerator) {

        this.localDateTime = LocalDateTimeStore.get();

        this.pmType = pmType;
        this.dateFrom = dateFrom;

        // kb#3037837: add 1 ms to parameter 'date_end' so that calculator in Period.java can return
        // date_end if it match the interval setting and calculating.
        this.dateTo = new Date();
        this.dateTo.setTime(dateTo.getTime() + 1);

        this.useGroupingCodes = useGroupingCodes;
        this.pmsidRestriction = pmsidRestriction + this.narrowPmsRestriction;
        this.pmScheduleGenerator = pmScheduleGenerator;

        if (this.pmType.equalsIgnoreCase(PMTYPE_EQWO)) {
            this.groupByFields = this.GROUP_BY_FIELDS_EQ[groupOption];
        } else {
            this.groupByFields = this.GROUP_BY_FIELDS_HK[groupOption];
        }

        // Determine if group by location.
        if (this.groupByFields.length > 0) {
            for (final String element : this.groupByFields) {
                if (element.indexOf("bl_id") > 0 || element.indexOf("fl_id") > 0
                        || element.indexOf("rm_id") > 0) {
                    this.isGroupByBlFlRm = true;
                }
            }
        }

        this.groupByTitle = this.GROUP_BY_MESSAGES[groupOption];

        if (this.useGroupingCodes) {
            this.groupCodeTitle = " PM Group ";
        } else {
            this.groupCodeTitle = "";
        }

        // kb#3042456:add the problem type of PREVENTIVE MAINT if it doesn't exist
        addProblemTypeForPM();

        createDataSources();
    }

    /**
     * Runs the work order generation process.
     */
    @Override
    public void run() {
        this.status.setTotalNumber(100);

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Work Order generator: type [{0}], from [{1}] to [{2}], group by [{3}]",
                new Object[] { this.pmType, this.dateFrom, this.dateTo, this.groupByFields }));
        }

        if (this.pmScheduleGenerator != null) {
            this.pmScheduleGenerator.run();
        }

        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true

        deleteFutureFloatingPmsd();
        this.status.setCurrentNumber(5);

        updatePmsDateNextTodo(this.pmType, this.dateFrom);
        this.status.setCurrentNumber(10);

        // the standard restriction limits pms records to those coming due in the selected date
        // range,
        // which do not already have Work Requests assigned or closed for their due date,
        // and which are either housekeeping or equipment pms's as specified by the calling routine.
        // pms.date_next_todo is updated to be pms.date_next_alt_todo so if PM is to be deferred
        // only those pms coming due past the deferred date will be used.
        this.restriction =
                "     pmsd.date_todo >= ${parameters['dateFrom']} AND pmsd.date_todo <= ${parameters['dateTo']}"
                        + " AND ( pmsd.date_todo >= pms.date_next_todo or pms.date_next_todo is null ) "
                        + " AND NOT EXISTS (SELECT wr.pms_id FROM wr"
                        + "                  WHERE wr.pms_id = pmsd.pms_id"
                        + "                    AND wr.date_assigned = pmsd.date_todo)"
                        + " AND NOT EXISTS (SELECT hwr.pms_id FROM hwr"
                        + "                  WHERE hwr.pms_id = pmsd.pms_id"
                        + "                    AND hwr.date_assigned = pmsd.date_todo)"
                        + " AND pms.pms_id = pmsd.pms_id"
                        // KB 3024446: Filter out the pm schedules that attached pm procedure
                        // contains no pm procedure steps
                        + " AND EXISTS ( SELECT 1 FROM pmps where pmps.pmp_id = pms.pmp_id ) ";

        if (this.pmType.equalsIgnoreCase(PMTYPE_EQWO)) {
            this.restriction += " AND pms.eq_id IS NOT NULL";
        } else if (this.pmType.equalsIgnoreCase(PMTYPE_HSWO)) {
            this.restriction += " AND pms.eq_id IS NULL";
        }

        if (this.pmsidRestriction != null && this.pmsidRestriction.length() > 0) {
            this.restriction += " AND " + this.pmsidRestriction;
        }

        // determine the number of work orders to be generated
        this.totalRecords = getNumberOfPmsToGenerate(this.restriction, this.dateFrom, this.dateTo);
        this.totalWoNum = 0;
        if (this.log.isDebugEnabled()) {
            this.log.debug("Creating work orders for all PM schedules...");
        }

        createWorkOrders(this.restriction);

        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
            return;
        }
        this.status.setCurrentNumber(100);
        this.status.setCode(JobStatus.JOB_COMPLETE);

        // kb#3042513: Pass to client side the correct start Work order id and end work order id of
        // newly generated ones, as well as the pm type.
        this.status.addProperty("startWo", String.valueOf(this.startWoId));
        this.status.addProperty("endWo", String.valueOf(this.endWoId));
        this.status.addProperty("pmType", this.pmType);

        String fileUrl = this.fileUrlStr;
        fileUrl = fileUrl + "?startWo=" + this.startWoId + "&endWo=" + this.endWoId;
        if (this.pmType != null && this.pmType != "") {
            fileUrl += "&pmType=" + this.pmType;
        }

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String className = this.getClass().getName();

        this.status.setResult(new JobResult(EventHandlerBase.localizeString(context,
            this.MESSAGE_ViewWO, className), "ab-pm-rpt-pm-wo.axvw", fileUrl));

        if (this.totalWoNum == 0) {
            this.status.setMessage(EventHandlerBase.localizeString(context, this.MESSAGE_NOWO,
                className));
        } else {
            this.status.setMessage(this.totalWoNum + " "
                    + EventHandlerBase.localizeString(context, this.MESSAGE_JOBSTATUS, className));
        }
    }

    /**
     * Delete extraneous future pmsd records for floating PMs that may have been created for
     * forecasting. These should NOT be used for generating work orders/requests since only one PM
     * WR should be open at a time.
     */
    private void deleteFutureFloatingPmsd() {
        if (this.log.isDebugEnabled()) {
            this.log.debug("Deleting future pmsd records...");
        }

        final String sql =
                "DELETE FROM pmsd "
                        + " WHERE 0 = (SELECT fixed FROM pms WHERE pms.pms_id = pmsd.pms_id) "
                        + "   AND (EXISTS (SELECT 1 FROM wr WHERE wr.pms_id = pmsd.pms_id AND wr.status IN ('R','Rev','A','AA','I','HP','HA','HL')) OR "
                        + "        EXISTS (SELECT 1 FROM pmsd ${sql.as} pmsd_inner WHERE pmsd_inner.pms_id = pmsd.pms_id AND pmsd_inner.date_todo < pmsd.date_todo AND pmsd_inner.date_todo >= ${sql.currentDate}))";
        final DataSource ds = DataSourceFactory.createDataSource().addTable("pmsd").addQuery(sql);
        ds.setApplyVpaRestrictions(false);
        ds.executeUpdate();

        if (this.log.isDebugEnabled()) {
            this.log.debug("Deleting future pmsd records done");
        }
    }

    /**
     * Check all pms records: if alt_next_todo_date has been entered, update date_next_todo if the
     * alternate date is greater than the From date the user is scheduling for.
     *
     * @param pmType
     * @param dateFrom
     */
    private void updatePmsDateNextTodo(final String pmType, final Date dateFrom) {
        if (this.log.isDebugEnabled()) {
            this.log.debug("Updating pms.date_next_todo...");
        }

        String sql =
                "UPDATE pms SET date_next_todo = date_next_alt_todo"
                        + " WHERE date_next_alt_todo IS NOT NULL AND date_next_alt_todo >= ${parameters['dateFrom']}";
        if (pmType.equalsIgnoreCase(PmWorkOrderGenerator.PMTYPE_EQWO)) {
            sql += " AND pms.eq_id IS NOT NULL";
        } else {
            sql += " AND pms.eq_id IS NULL";
        }
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("pms").addQuery(sql)
                .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                .setParameter("dateFrom", dateFrom);
        ds.setApplyVpaRestrictions(false);
        ds.executeUpdate();

        if (this.log.isDebugEnabled()) {
            this.log.debug("Updating pms.date_next_todo done");
        }
    }

    /**
     * Returns the number of work orders to be generated.
     *
     * @param standardRestriction
     * @param dateFrom
     * @param dateTo
     * @return
     */
    private int getNumberOfPmsToGenerate(final String standardRestriction, final Date dateFrom,
            final Date dateTo) {
        final DataSource ds =
                DataSourceFactory
                .createDataSource()
                .addTable("pms", DataSource.ROLE_MAIN)
                .addTable("pmsd", DataSource.ROLE_STANDARD)
                .addVirtualField("pms", "numberOfRecords", DataSource.DATA_TYPE_INTEGER)
                .addQuery(
                    "SELECT COUNT(*) ${sql.as} numberOfRecords FROM pms, pmsd WHERE "
                            + standardRestriction)
                            .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                            .setParameter("dateFrom", dateFrom)
                            .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                            .setParameter("dateTo", dateTo);
        ds.setApplyVpaRestrictions(false);
        final DataRecord record = ds.getRecord();
        return record.getInt("pms.numberOfRecords");
    }

    /**
     * Call two sub methods to Generate work orders and work requests for all scheduled dates that
     * meet the restriction.
     *
     * @param restriction
     * @return
     */
    public void createWorkOrders(final String restriction) {

        this.notifyWoListForCF = new ArrayList<Integer>();
        this.notifyWoListForSupervisor = new ArrayList<Integer>();

        this.cachePmProcedureStep();
        this.cacheParts();
        if (this.pmType.equalsIgnoreCase(PMTYPE_EQWO)) {
            createEQPMWorkOrders(restriction);
        }

        else if (this.pmType.equalsIgnoreCase(PMTYPE_HSWO)) {
            createHSPMWorkOrders(restriction);
        }

        this.createWorkRequestTrades();
        this.createWorkRequestParts();
        this.createWorkRequestTools();
        this.calculateWorkRequestCostEstimates();

        this.updateWorkOrders();

        // Modified for kb #3024551: for each wr, set it's activity id.
        this.updateWorkRequests();
        
        //update work team from supervisor
        new WorkRequestHandler().updateWorkTeamFromSupervisor();

        this.status.setCurrentNumber(95);
        final boolean useBldgOpsConsole =
                EventHandlerBase.getActivityParameterInt(
                    ContextStore.get().getEventHandlerContext(), "AbBldgOpsOnDemandWork",
                        "UseBldgOpsConsole").intValue() > 0;
                        this.notifyCraftPerson(useBldgOpsConsole);
                        this.notifySupervisior(useBldgOpsConsole);
    }

    /**
     * This method create work orders for Equipment PM.
     *
     * @param restriction : Restrict PM Schedules for generating work orders
     */
    public void createEQPMWorkOrders(final String restriction) {

        final String[] tables = { "pmsd", "pms", "pmp", "eq" };
        final String[] fields =
            { "pms.pms_id", "pms.pmp_id", "pms.pm_group", "pms.dv_id", "pms.dp_id",
                "pms.eq_id", "pms.priority", "pmp.ac_id", "pmp.tr_id", "eq.site_id",
                "eq.bl_id", "eq.fl_id", "eq.rm_id", "eq.eq_std", "eq.subcomponent_of" };

        final String sql =
                "SELECT pmsd.date_todo, pms.pms_id, pms.pm_group, pms.dv_id, pms.dp_id, eq.site_id, eq.bl_id, eq.fl_id, eq.rm_id, pms.eq_id, pms.priority, pmp.pmp_id, pmp.ac_id, pmp.tr_id, eq.eq_std, eq.subcomponent_of "
                        + "FROM pmsd JOIN pms ON pmsd.pms_id = pms.pms_id JOIN pmp ON pms.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms.eq_id = eq.eq_id WHERE "
                        + restriction;

        if (this.log.isDebugEnabled()) {
            this.log.debug("Query for pms records: " + sql);
        }

        final DataSource ds =
                DataSourceFactory.createDataSourceForFields(tables, fields).addQuery(sql)
                .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                .setParameter("dateFrom", this.dateFrom).setParameter("dateTo", this.dateTo)
                .addSort("pmsd", "date_todo");

        if (this.useGroupingCodes) {
            ds.addSort("pmsd", "pm_group");

        }
        for (final String element : this.groupByFields) {
            ds.addSort("pmsd", element.substring(element.indexOf(".") + 1));
        }

        // execute the query and iterate through all records in the result set
        // call this.handleRecord() for each record in the result set
        ds.setApplyVpaRestrictions(false);

        this.cacheEquipment();

        ds.queryRecords(null, this);

        // commit all create/update operations
        // ds.commit();
    }

    /**
     * This method create work orders for HouseKeeping(Location) PM.
     *
     * @param restriction : Restrict PM Schedules for generating work orders
     */
    public void createHSPMWorkOrders(final String restriction) {

        final String[] tables = { "pmsd", "pms", "pmp", "bl", "eq" };
        final String[] fields =
            { "pms.pms_id", "pms.pmp_id", "pms.pm_group", "pms.dv_id", "pms.dp_id",
                "pms.site_id", "pms.bl_id", "pms.fl_id", "pms.rm_id", "pms.priority",
                "pmp.ac_id", "pmp.tr_id" };

        final String sql =
                "SELECT pmsd.date_todo, pms.pms_id, pms.pm_group, pms.dv_id, pms.dp_id, pms.site_id, pms.bl_id, pms.fl_id, pms.rm_id, pms.priority, pmp.pmp_id, pmp.ac_id, pmp.tr_id "
                        + "FROM pmsd JOIN pms ON pmsd.pms_id = pms.pms_id JOIN pmp ON pms.pmp_id = pmp.pmp_id WHERE "
                        + restriction;

        if (this.log.isDebugEnabled()) {
            this.log.debug("Query for pms records: " + sql);
        }

        final DataSource ds =
                DataSourceFactory.createDataSourceForFields(tables, fields).addQuery(sql)
                .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                .setParameter("dateFrom", this.dateFrom).setParameter("dateTo", this.dateTo)
                .addSort("pmsd", "date_todo");

        if (this.useGroupingCodes) {
            ds.addSort("pmsd", "pm_group");

        }
        for (final String element : this.groupByFields) {
            ds.addSort("pmsd", element.substring(element.indexOf(".") + 1));
        }

        ds.setApplyVpaRestrictions(false);
        // execute the query and iterate through all records in the result set
        // call this.handleRecord() for each record in the result set
        ds.queryRecords(null, this);

        // commit all create/update operations
        // ds.commit();
    }

    /**
     * This method is called for each scheduled date (pmsd + pms + pmp record) retrieved by
     * createWorkOrders(). For each scheduled date it creates:
     *
     * @param record, pms + pmsd + eq union record object.
     */
    @Override
    public boolean handleRecord(final DataRecord record) {
        if (this.stopRequested) {
            return false;
        }

        final int pmsId = record.getInt("pms.pms_id");
        final Date dateAssigned = record.getDate("pmsd.date_todo");

        String siteId = "";
        String buildingId = "";
        String floorId = "";
        String roomId = "";

        // Get location values from record according to different PM type.
        if (this.pmType.equalsIgnoreCase(PMTYPE_EQWO)) {
            siteId = StringUtil.notNull(record.getString("eq.site_id"));
            buildingId = StringUtil.notNull(record.getString("eq.bl_id"));
            floorId = StringUtil.notNull(record.getString("eq.fl_id"));
            roomId = StringUtil.notNull(record.getString("eq.rm_id"));
        }

        else if (this.pmType.equalsIgnoreCase(PMTYPE_HSWO)) {
            siteId = StringUtil.notNull(record.getString("pms.site_id"));
            buildingId = StringUtil.notNull(record.getString("pms.bl_id"));
            floorId = StringUtil.notNull(record.getString("pms.fl_id"));
            roomId = StringUtil.notNull(record.getString("pms.rm_id"));
        }

        int woId = -1;
        DataRecord woRecord = null;
        boolean enforceSLA = false;
        final String pmGroupCode = record.getString("pms.pm_group");

        // If use pm_group code.
        if (this.useGroupingCodes) {
            woRecord =
                    createWorkOrderWithGroupCode(record, pmsId, dateAssigned, siteId, buildingId,
                        floorId, roomId, pmGroupCode);
        } // End if use pm_group code.

        // If does not use PM group code, use group by field to generate work order.
        else {
            woRecord =
                    createWorkOrderWithoutGroupCode(record, pmsId, dateAssigned, siteId,
                        buildingId, floorId, roomId);
        }

        // if work order was created, store its id
        if (woRecord != null) {
            woId = woRecord.getInt("wo.wo_id");
            if (this.startWoId == -1) {
                this.startWoId = woId;
                this.endWoId = woId;
            } else {
                this.endWoId = woId;
            }

            this.prevWoId = woId;
            this.prevWoRecord = woRecord;
            this.totalWoNum++;
            enforceSLA = true;
        }

        // create work request for the last created work order
        final int woIdForWr = (woId > 0) ? woId : this.prevWoId;
        final DataRecord wrRecord = createWorkRequest(woIdForWr, dateAssigned, record);

        if (woRecord == null) {
            woRecord = this.prevWoRecord;
        }
        if (enforceSLA && this.attachedSlaResponse != null) {
            enforceSLAtoPM(woRecord, wrRecord);
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
       
        this.currentRecord++;

        // @translatable
        final String recordMsg = "Record ";
        final String className = this.getClass().getName();
        final String localizedRecordMsg =
                EventHandlerBase.localizeString(context, recordMsg, className);

        if (this.currentRecord % 1000 == 0) {
            System.out.println(localizedRecordMsg + this.currentRecord);
        }

        this.status.setCurrentNumber(10 + 85 * this.currentRecord / this.totalRecords);
        return true;
    }

    /**
     * This method create work orders when do not use grouping code.
     *
     * @param record : Retrieved record contains pms and pmsd information
     * @param pmsId : Restrict PM Schedules for generating work orders
     * @param dateAssigned : calculated date assigned value
     * @param siteId : Site code
     * @param buildingId : Building Code
     * @param floorId : Floor Code
     * @param roomId : Room Code
     *
     * @return
     */
    private DataRecord createWorkOrderWithoutGroupCode(final DataRecord record, final int pmsId,
            final Date dateAssigned, final String siteId, final String buildingId,
            final String floorId, final String roomId) {

        DataRecord woRecord = null;

        String pmGroupBy, groupTitle;
        if (this.groupByFields.length == 0) {
            pmGroupBy = null;
        } else {
            pmGroupBy = StringUtil.notNull(record.getString(this.groupByFields[0]));
            // Determine whether group by location such as building,floor or room.
            final int length = this.groupByFields.length;
            // If group by location get location value.
            if (this.isGroupByBlFlRm) {
                pmGroupBy = StringUtil.notNull(record.getString(this.groupByFields[length - 1]));
            }
        }

        if (pmGroupBy != null && pmGroupBy.length() > 0) {
            groupTitle = this.groupByTitle + " " + pmGroupBy;
        } else {
            groupTitle = this.GROUP_BY_MESSAGES[0] + " " + pmsId;
        }

        // If date changed
        if (!DateTime.sameDay(dateAssigned, this.prevDateAssigned)) {
            // if the date has changed or group by field has null value, create WO for new
            // date
            woRecord = createWorkOrder(groupTitle, dateAssigned);
            this.prevDateAssigned = dateAssigned;
            updateLocation(siteId, buildingId, floorId, roomId);
            this.prevPmGroupBy = pmGroupBy;

        } else {

            // If groupBy field is not used, make a new WO because this is grouping by schedule
            if (this.groupByFields.length == 0) {
                woRecord = createWorkOrder(groupTitle, dateAssigned);
            }
            // else create a new Work Order for each new date_todo according to different
            // conditions.
            else {

                // if current groupBy value is null, create a new Work Order.
                if (pmGroupBy == null || pmGroupBy.length() == 0) {
                    woRecord = createWorkOrder(groupTitle, dateAssigned);
                    updateLocation(siteId, buildingId, floorId, roomId);
                    this.prevPmGroupBy = pmGroupBy;

                } else {
                    // if is not group by location and group by value changed, create a new Work
                    // Order.
                    if (!this.isGroupByBlFlRm && !pmGroupBy.equals(this.prevPmGroupBy)) {
                        woRecord = createWorkOrder(groupTitle, dateAssigned);
                        this.prevPmGroupBy = pmGroupBy;
                        // updateLocation(siteId, buildingId, floorId, roomId);
                    }
                    // else if is group by location and location changed, create a new Work
                    // Order.
                    else if (this.isGroupByBlFlRm
                            && !isSameLocation(pmGroupBy, siteId, buildingId, floorId, roomId)) {
                        woRecord = createWorkOrder(groupTitle, dateAssigned);
                        this.prevPmGroupBy = pmGroupBy;
                        updateLocation(siteId, buildingId, floorId, roomId);
                    }
                }// End if current groupBy value is null
            }// End if groupBy field is not used
        }// End if date changed
        return woRecord;
    }

    /**
     * This method fills the SLA related information from work request into work order.
     *
     * By Zhang Yi
     *
     * @param woRecord : Work order record
     * @param wrRecord : Work request record
     *
     */
    private void enforceSLAtoPM(final DataRecord woRecord, final DataRecord wrRecord) {

        if (woRecord != null && wrRecord != null) {
            woRecord.setValue("wo.bl_id", wrRecord.getString("wr.bl_id"));
            woRecord.setValue(
                "wo.date_created",
                this.localDateTime.currentLocalDate(null, null, null,
                    wrRecord.getString("wr.bl_id")));
            woRecord.setValue(
                "wo.time_created",
                this.localDateTime.currentLocalTime(null, null, null,
                    wrRecord.getString("wr.bl_id")));
            woRecord.setValue("wo.supervisor", wrRecord.getString("wr.supervisor"));
            woRecord.setValue("wo.work_team_id", wrRecord.getString("wr.work_team_id"));
            if (this.attachedSlaResponse != null
                    && this.attachedSlaResponse.getInt("helpdesk_sla_response.autoissue") == 1) {
                woRecord.setValue("wo.date_issued", Utility.currentDate());
                woRecord.setValue("wo.time_issued", Utility.currentTime());
            }
            woRecord.setValue("wo.supervisor", wrRecord.getString("wr.supervisor"));
            this.woUpdateDS.updateRecord(woRecord);

            final DataRecord serviceRequest = this.createNewActivityLog(woRecord, wrRecord);
            this.createStepLogForServiceRequest(serviceRequest);
        }

    }

    /**
     * This method create a new service request record by filling information from work order and
     * work request.
     *
     * By Zhang Yi
     *
     * @param woRecord : Work order record
     * @param wrRecord : Work request record
     *
     * @return newly created service request
     *
     */
    private DataRecord createNewActivityLog(final DataRecord woRecord, final DataRecord wrRecord) {

        DataRecord alRecord = this.alUpdateDS.createNewRecord();
        alRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        alRecord.setValue("activity_log.pmp_id", wrRecord.getString("wr.pmp_id"));
        alRecord.setValue("activity_log.eq_id", wrRecord.getString("wr.eq_id"));
        alRecord.setValue("activity_log.escalated_completion", 0);
        alRecord.setValue("activity_log.escalated_response", 0);
        alRecord.setValue("activity_log.prob_type", "PREVENTIVE MAINT");
        alRecord.setValue("activity_log.autocreate_wr", 0);
        alRecord.setValue("activity_log.site_id", wrRecord.getString("wr.site_id"));
        alRecord.setValue("activity_log.bl_id", wrRecord.getString("wr.bl_id"));
        alRecord.setValue("activity_log.fl_id", wrRecord.getString("wr.fl_id"));
        alRecord.setValue("activity_log.rm_id", wrRecord.getString("wr.rm_id"));
        alRecord.setValue("activity_log.dv_id", wrRecord.getString("wr.dv_id"));
        alRecord.setValue("activity_log.dp_id", wrRecord.getString("wr.dp_id"));
        alRecord.setValue("activity_log.cost_estimated", woRecord.getDouble("wo.cost_estimated"));
        alRecord.setValue("activity_log.date_scheduled", wrRecord.getDate("wr.date_assigned"));

        alRecord.setValue("activity_log.date_requested", woRecord.getDate("wo.date_created"));
        alRecord.setValue("activity_log.time_requested", woRecord.getValue("wo.time_created"));
        alRecord.setValue("activity_log.wo_id", woRecord.getInt("wo.wo_id"));
        alRecord.setValue("activity_log.supervisor", woRecord.getString("wo.supervisor"));
        alRecord.setValue("activity_log.work_team_id", woRecord.getString("wo.work_team_id"));
        if (this.attachedSlaResponse != null
                && this.attachedSlaResponse.getInt("helpdesk_sla_response.notify_craftsperson") == 1) {
            this.notifyWoListForCF.add(woRecord.getInt("wo.wo_id"));
        }
        if (this.attachedSlaResponse != null
                && this.attachedSlaResponse.getInt("helpdesk_sla_response.notify_service_provider") == 1) {
            this.notifyWoListForSupervisor.add(woRecord.getInt("wo.wo_id"));
        }
        alRecord.setValue("activity_log.date_escalation_response",
            wrRecord.getValue("wr.date_escalation_response"));
        alRecord.setValue("activity_log.time_escalation_response",
            wrRecord.getValue("wr.time_escalation_response"));
        alRecord.setValue("activity_log.date_escalation_completion",
            wrRecord.getValue("wr.date_escalation_completion"));
        alRecord.setValue("activity_log.time_escalation_completion",
            wrRecord.getValue("wr.time_escalation_completion"));
        alRecord.setValue("activity_log.manager", wrRecord.getValue("wr.manager"));

        if (this.attachedSlaResponse != null
                && this.attachedSlaResponse.getInt("helpdesk_sla_response.autoissue") == 0) {
            alRecord.setValue("activity_log.status", "APPROVED");
            alRecord.setValue("activity_log.date_approved", woRecord.getDate("wo.date_created"));
        } else {
            alRecord.setValue("activity_log.status", "IN PROGRESS");
            alRecord.setValue("activity_log.date_issued", woRecord.getDate("wo.date_created"));
        }

        final DataRecord serviceRequest = alRecord;
        alRecord = this.alUpdateDS.saveRecord(alRecord);
        serviceRequest.setValue("activity_log.activity_log_id",
            alRecord.getValue("activity_log.activity_log_id"));

        return serviceRequest;
    }

    private final String cfReferencedBy = "NOTIFY_CF_WFR";

    // @translatable
    private final String CF_NOTIFY_TITLE = "New Work Requests assigned";

    // @translatable
    private final String CF_NOTIFY_BODY =
            "New Work Requests have been assigned to you.  Please login and navigate to Building Operations / Preventive Maintenance / Craftsperson for more detail.";

    // @translatable
    private final String CF_NOTIFY_BODY_EASY_PM =
            "New Work Requests have been assigned to you.  Please login and navigate to 'Building Operations Console'.";

    /**
     * This method notifies craft person after all work orders, work request, service requests are
     * created
     *
     * By Zhang Yi
     *
     */
    private void notifyCraftPerson(final boolean isUseConsole) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Go through each work order in notify waiting list to retrieve a craft person list
        final List<String> craftPersonList = new ArrayList<String>();
        for (int i = 0; i < this.notifyWoListForCF.size(); i++) {
            final int wo_id = this.notifyWoListForCF.get(i);
            final List<DataRecord> workRequests = this.wrUpdateDS.getRecords(" wr.wo_id=" + wo_id);
            // For each work request of current work order
            for (final DataRecord wrRecord : workRequests) {
                final Integer wr_id = wrRecord.getInt("wr.wr_id");

                final List<DataRecord> wrcf = this.wrcfSelectDS.getRecords(" wr_id =" + wr_id);
                for (final DataRecord wrcfRecord : wrcf) {
                    final String cf_id = wrcfRecord.getString("wrcf.cf_id");
                    if (cf_id == null || craftPersonList.contains(cf_id)) {
                        continue;
                    } else {
                        craftPersonList.add(cf_id);
                    }
                }
            }
        }
        // For each assigned craft person of current work request, send the email.
        for (final String cf : craftPersonList) {

            final Message message = new Message(context);
            message.setActivityId(Constants.PM_ACTIVITY_ID);
            message.setReferencedBy(this.cfReferencedBy);

            final String email =
                    this.cfSelectDS.getRecord(" cf.cf_id ='" + cf + "'").getString("cf.email");

            if (email != null && !email.equals("")) {
                message.setSubject(this.CF_NOTIFY_TITLE);
                message.setBody(isUseConsole ? this.CF_NOTIFY_BODY_EASY_PM : this.CF_NOTIFY_BODY);

                message.setMailTo(email);
                message.setNameto(cf);
            }
            message.sendMessage();
        }
    }

    private final String svReferencedBy = "NOTIFY_SUPERVISOR_WFR";

    // @translatable
    private final String SV_NOTIFY_TITLE = "New Work Requests generated and assigned";

    // @translatable
    private final String SV_NOTIFY_BODY =
            "New Work Requests have been generated and assigned.  Please login and navigate to Building Operations / Preventive Maintenance / Supervisor for more detail.";

    // @translatable
    private final String SV_NOTIFY_BODY_EASY_PM =
            "New Work Requests have been generated and assigned.  Please login and navigate to 'Building Operations Console'.";

    /**
     * This method notifies craft person after all work orders, work request, service requests are
     * created
     *
     * By Zhang Yi
     *
     */
    private void notifySupervisior(final boolean isUseConsole) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        // Go through each work order in notify waiting list to retrieve a craft person list
        final List<String> supervisiorList = new ArrayList<String>();
        for (int i = 0; i < this.notifyWoListForSupervisor.size(); i++) {
            final int wo_id = this.notifyWoListForSupervisor.get(i);
            final List<DataRecord> workRequests = this.wrUpdateDS.getRecords(" wr.wo_id=" + wo_id);
            // For each work request of current work order, add it's supervisior to supervisior list
            for (final DataRecord wrRecord : workRequests) {
                final String supervisior = wrRecord.getString("wr.supervisor");
                if (supervisior == null || supervisiorList.contains(supervisior)) {
                    continue;
                } else {
                    supervisiorList.add(supervisior);
                }
            }
        }
        // For each supervisior , send the email.
        for (final String supervisior : supervisiorList) {

            final Message message = new Message(context);
            message.setActivityId(Constants.PM_ACTIVITY_ID);
            message.setReferencedBy(this.svReferencedBy);

            final String email =
                    this.emSelectDS.getRecord(
                        " em.em_id ="
                                + EventHandlerBase.literal(ContextStore.get()
                                    .getEventHandlerContext(), supervisior)).getString("em.email");

            if (email != null && !email.equals("")) {
                message.setSubject(this.SV_NOTIFY_TITLE);
                message.setBody(isUseConsole ? this.SV_NOTIFY_BODY_EASY_PM : this.SV_NOTIFY_BODY);

                message.setMailTo(email);
                message.setNameto(supervisior);
            }
            message.sendMessage();
        }
    }

    /**
     * This method create work orders when use grouping code is true.
     *
     * @param record : Retrieved record contains pms and pmsd information
     * @param pmsId : Restrict PM Schedules for generating work orders
     * @param dateAssigned : calculated date assigned value
     * @param siteId : Site code
     * @param buildingId : Building Code
     * @param floorId : Floor Code
     * @param roomId : Room Code
     * @param pmGroupCode : PM Schedule Code
     *
     * @return
     */
    private DataRecord createWorkOrderWithGroupCode(final DataRecord record, final int pmsId,
            final Date dateAssigned, final String siteId, final String buildingId,
            final String floorId, final String roomId, final String pmGroupCode) {

        String pmGroupBy, groupTitle;
        DataRecord woRecord = null;
        if (this.groupByFields.length == 0) {
            pmGroupBy = null;
        } else {
            pmGroupBy = StringUtil.notNull(record.getString(this.groupByFields[0]));
            // Determine whether group by location such as building,floor or room.
            final int length = this.groupByFields.length;
            // If group by location get location value.
            if (this.isGroupByBlFlRm) {
                pmGroupBy = StringUtil.notNull(record.getString(this.groupByFields[length - 1]));
            }
        }

        if (pmGroupCode != null && pmGroupCode.length() > 0) {
            groupTitle = this.groupCodeTitle + " " + pmGroupCode;
        } else if (pmGroupBy != null && pmGroupBy.length() > 0) {
            groupTitle = this.groupByTitle + " " + pmGroupBy;
        } else {
            groupTitle = this.GROUP_BY_MESSAGES[0] + " " + pmsId;
        }

        // if date changed
        if (!DateTime.sameDay(dateAssigned, this.prevDateAssigned)) {
            // if the date has changed or group by field has null value, create WO for new
            // date
            woRecord = createWorkOrder(groupTitle, dateAssigned);

            this.prevDateAssigned = dateAssigned;
            this.prevPmGroupCode = pmGroupCode;
            this.prevPmGroupBy = pmGroupBy;
            updateLocation(siteId, buildingId, floorId, roomId);
        }
        // if in same day
        else {
            // if PM Group exists
            if ((pmGroupCode != null) && (pmGroupCode.length() > 0)) {
                // if is not same PM Group
                if (!pmGroupCode.equals(this.prevPmGroupCode)) {
                    // or if the PM group has changed, create new WO for that PM group
                    woRecord = createWorkOrder(groupTitle, dateAssigned);

                    this.prevPmGroupCode = pmGroupCode;
                }// End if is not same PM Group

                this.prevPmGroupBy = null;

            }// End if PM Group exists

            // else if PM Group does not exist
            else {
                // if groupBy field is not used, make a new WO because this is grouping by
                // schedule
                if (this.groupByFields.length == 0) {
                    woRecord = createWorkOrder(groupTitle, dateAssigned);
                }
                // else create a new Work Order for each new date_todo according to different
                // conditions.
                else {
                    // if current pmGroupBy value is null, create a new Work Order.
                    if (pmGroupBy == null || pmGroupBy.length() == 0) {
                        woRecord = createWorkOrder(groupTitle, dateAssigned);
                        updateLocation(siteId, buildingId, floorId, roomId);
                        this.prevPmGroupBy = pmGroupBy;

                    }// End if current pmGroupBy value is null.

                    else { // if current pmGroupBy value is not null
                        // if is not group by location and the groupBy value is changed,
                        // create a new Work Order for each change in the groupBy fields.
                        if (!this.isGroupByBlFlRm && !pmGroupBy.equals(this.prevPmGroupBy)) {
                            woRecord = createWorkOrder(groupTitle, dateAssigned);
                            this.prevPmGroupBy = pmGroupBy;
                            // updateLocation(siteId, buildingId, floorId, roomId);
                        }
                        // else if is group by location and location is changed,
                        // create a new Work Order for each change of location .
                        else if (this.isGroupByBlFlRm
                                && !isSameLocation(pmGroupBy, siteId, buildingId, floorId, roomId)) {
                            woRecord = createWorkOrder(groupTitle, dateAssigned);
                            this.prevPmGroupBy = pmGroupBy;
                            updateLocation(siteId, buildingId, floorId, roomId);
                        }
                    }// End if current pmGroupBy value is not null
                }// End if groupBy field is not used
            }// End if PM Group exists
        } // End if date changed
        return woRecord;
    }

    /**
     * This method is called to determine whether current record had same location with previous
     * one. If have not same location, update previous location values.
     *
     * @param pmGroup : PM Schedule Code
     * @param siteId : Site code
     * @param buildingId : Building Code
     * @param floorId : Floor Code
     * @param roomId : Room Code
     * @return
     */
    private boolean isSameLocation(final String pmGroup, final String siteId,
            final String buildingId, final String floorId, final String roomId) {

        boolean isSameLocation = false;
        final int length = this.groupByFields.length - 1;

        if (this.groupByFields[length].indexOf("rm_id") > 0) {
            isSameLocation =
                    roomId.equals(this.prevRoomId) && floorId.equals(this.prevFloorId)
                    && buildingId.equals(this.prevBuildingId)
                    && siteId.equals(this.prevSiteId);
        }

        else if (this.groupByFields[length].indexOf("fl_id") > 0) {
            isSameLocation =
                    floorId.equals(this.prevFloorId) && buildingId.equals(this.prevBuildingId)
                    && siteId.equals(this.prevSiteId);
        }

        else if (this.groupByFields[length].indexOf("bl_id") > 0) {
            isSameLocation =
                    buildingId.equals(this.prevBuildingId) && siteId.equals(this.prevSiteId);
        }

        if (!isSameLocation) {
            // update other previous values if they are being grouped by
            updateLocation(siteId, buildingId, floorId, roomId);
        }
        return isSameLocation;
    }

    /**
     * This method is called to update current location information.
     *
     * @param siteId : Site code
     * @param buildingId : Building Code
     * @param floorId : Floor Code
     * @param roomId : Room Code
     * @return
     */
    private void updateLocation(final String siteId, final String buildingId, final String floorId,
            final String roomId) {
        this.prevSiteId = siteId;
        this.prevBuildingId = buildingId;
        this.prevFloorId = floorId;
        this.prevRoomId = roomId;
    }

    /**
     * Create new work order record.
     *
     * @param pmGroup : PM Schedule Code
     * @param dateAssigned : Date Assigned
     * @return
     */
    private DataRecord createWorkOrder(final String pmGroup, final Date dateAssigned) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Creating work order for [{0}], date [{1}]",
                new Object[] { pmGroup, dateAssigned }));
        }

        final ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        final String description =
                EventHandlerBase.localizeString(context, this.MESSAGE_PREVENTIVE_MAINTENANCE, this
                    .getClass().getName())
                    + " "
                    + new SimpleDateFormat("EEEEEEEEE, MMMMMMMMMM dd, yyyy")
        .format(dateAssigned)
        + " "
        + EventHandlerBase.localizeString(context, this.MESSAGE_FOR, this
            .getClass().getName()) + " " + StringUtil.notNull(pmGroup);

        DataRecord record = this.woUpdateDS.createNewRecord();
        record.setValue("wo.date_assigned", dateAssigned);
        record.setValue("wo.wo_type", this.pmType);
        record.setValue("wo.description", description);
        record.setValue("wo.name_of_contact", getLogInName());

        final DataRecord woRecord = record;
        record = this.woUpdateDS.saveRecord(record);

        woRecord.setNew(false);
        woRecord.setValue("wo.wo_id", record.getValue("wo.wo_id"));
        return woRecord;
    }

    /**
     * Generate Work Requests for each PM Schedule's Procedure's Steps. Create a Work Request for
     * each Procedure Step associated with the procedure for the pms record. The created WR records
     * reference both the pms_id and the wo_id it is associated with. A number of data fields from
     * the pmps are copied to the WR.
     *
     * NOTE: If a WR already exists for a pms for the date requested then it was omitted from the
     * initial recordset (selected in Generate_PM_WO) so that no WR is created.
     *
     * @param woId : Work Order id
     * @param dateAssigned : date assigned
     * @param pmsRecord : PM Schedule record
     * @return
     */
    private DataRecord createWorkRequest(final int woId, final Date dateAssigned,
            final DataRecord pmsRecord) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Creating work request for work order [{0}], date [{1}]", new Object[] {
                        new Integer(woId), dateAssigned }));
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final int pmsId = pmsRecord.getInt("pms.pms_id");
        final String pmpId = pmsRecord.getString("pms.pmp_id");
        final String acId = pmsRecord.getString("pmp.ac_id");
        final String trId = pmsRecord.getString("pmp.tr_id");

        String siteId = "";
        String blId = "";
        String flId = "";
        String rmId = "";
        String eqId = "";
        String dvId = "";
        String dpId = "";
        if (this.pmType.equalsIgnoreCase(PMTYPE_EQWO)) {

            eqId = pmsRecord.getString("pms.eq_id");
            final DataRecord eqRecord = this.cacheEquipments.get(eqId);

            siteId = eqRecord.getString("eq.site_id");
            blId = eqRecord.getString("eq.bl_id");
            flId = eqRecord.getString("eq.fl_id");
            rmId = eqRecord.getString("eq.rm_id");
            dvId = eqRecord.getString("eq.dv_id");
            dpId = eqRecord.getString("eq.dp_id");
        } else {
            siteId = pmsRecord.getString("pms.site_id");
            blId = pmsRecord.getString("pms.bl_id");
            flId = pmsRecord.getString("pms.fl_id");
            rmId = pmsRecord.getString("pms.rm_id");
        }

        // If dv_id has been entered in the pms record then that dv and dp will be used for the wr.
        // Otherwise, if the eq dv and dp are not null then use those dv and dp. Else null.
        if (StringUtil.notNullOrEmpty(pmsRecord.getValue("pms.dv_id"))) {
            dvId = pmsRecord.getString("pms.dv_id");
            dpId = pmsRecord.getString("pms.dp_id");
        }

        final List<DataRecord> pmpsRecords = this.cachePmpSteps.get(pmpId);

        int counter = 0;
        DataRecord firstWr = null;
        for (final DataRecord pmpsRecord : pmpsRecords) {
            final String description = pmpsRecord.getString("pmps.instructions");

            // Fields for the Work Request:
            // From pms - pms_id, bl_id, fl_id, rm_id (and for EQ PM eq_id)
            // From pmp - ac_id, tr_id
            // From pmps - wr.description = pmps.instructions,
            // From routine - wr_id, wo_id, wr.date_assigned = pmsd.date_todo,
            // By Default: status = 'AA', date_requested = current date, time_requested = current
            // time

            DataRecord wrRecord = this.wrUpdateDS.createNewRecord();
            wrRecord.setValue("wr.wo_id", woId);
            wrRecord.setValue("wr.pms_id", pmsId);
            wrRecord.setValue("wr.pmp_id", pmpId);
            wrRecord.setValue("wr.site_id", siteId);
            wrRecord.setValue("wr.bl_id", blId);
            wrRecord.setValue("wr.fl_id", flId);
            wrRecord.setValue("wr.rm_id", rmId);
            wrRecord.setValue("wr.dv_id", dvId);
            wrRecord.setValue("wr.dp_id", dpId);
            wrRecord.setValue("wr.eq_id", eqId);
            wrRecord.setValue("wr.ac_id", acId);
            wrRecord.setValue("wr.tr_id", trId);
            // make the wr.priority ALWAYS '1', for PM Release 2.
            wrRecord.setValue("wr.priority", 1);
            // Fix for kb3024589: use status manager to update wr.status
            wrRecord.setValue("wr.status", "A");

            wrRecord.setValue("wr.prob_type", this.WR_PROBLEM_TYPE);
            wrRecord.setValue("wr.requestor", getLogInName());

            final Date localDate = this.localDateTime.currentLocalDate(null, null, siteId, blId);
            if (localDate != null) {
                wrRecord.setValue("wr.date_requested", localDate);
            } else {
                wrRecord.setValue("wr.date_requested", new Date());
            }
            final Time localTime = this.localDateTime.currentLocalTime(null, null, siteId, blId);
            if (localTime != null) {
                wrRecord.setValue("wr.time_requested", localTime);
            } else {
                wrRecord.setValue("wr.time_requested", new Date());
            }

            wrRecord.setValue("wr.date_assigned", dateAssigned);
            wrRecord.setValue("wr.description", description);
            final DataRecord slaResponse = enforceSLAtoWorkRequest(wrRecord, pmpId);

            final DataRecord oldRecord = wrRecord;
            wrRecord = this.wrUpdateDS.saveRecord(wrRecord);
            
            final OnDemandWorkStatusManager statusmgr =
                    new OnDemandWorkStatusManager(context, wrRecord.getInt("wr.wr_id"));
            // manually set status of work request
            if (slaResponse.getInt("helpdesk_sla_response.autoissue") == 0) {
                statusmgr.updateStatus("AA");
            } else {
                statusmgr.updateStatus("AA");
                statusmgr.updateStatus("I");
            }

            final int wrId = wrRecord.getInt("wr.wr_id");
            oldRecord.setNew(false);
            oldRecord.setValue("wr.wr_id", wrId);

            // insert step log record for work request
            //this.createStepLogForWorkRequest(oldRecord);

            if (this.startWrId == -1) {
                this.startWrId = wrId;
            }
            this.endWrId = wrId;

            if (wrId > 0) {
                wrRecord = oldRecord;
                final String cfId = slaResponse.getString("helpdesk_sla_response.cf_id");
                String cfRole = null;
                if (SchemaUtils.fieldExistsInSchema(Constants.SLA_RESPONSE_TABLE, "cf_role")) {
                    cfRole = slaResponse.getString("helpdesk_sla_response.cf_role");
                }
                        
                this.wrcfSelectForPmsDateDS.setParameter("pmsId", pmsId)
                .setParameter("dateAssigned", dateAssigned);
                
                if (slaResponse != null && cfId != null && !"".equals(cfId)) {
                        // Only create just one craftsperson assignment for the entire procedure
                        // (set of work requests),
                        createWorkRequestCraftperson(wrRecord, cfId, slaResponse);
                }else if (slaResponse != null && cfRole != null && !"".equals(cfRole)) {
                    final List<String> cfs = HelpdeskRoles.getEmployeesFromHelpdeskRole(
                        ContextStore.get().getEventHandlerContext(), cfRole, "wr", "wr_id",
                        wrId);
                    for (final String cfCode : cfs) {
                        createWorkRequestCraftperson(wrRecord, cfCode, slaResponse);
                    }
                }
                
                if (counter++ == 0) {
                    firstWr = wrRecord;
                    this.attachedSlaResponse = slaResponse;
                }

            } else {
                // @non-translatable
                throw new ExceptionBase("Work request was not created for work order " + woId);
            }
        }
        return firstWr;
    }

    /**
     * Insert STEP LOG for work request.
     *
     * @param wrRecord : Work request record
     *
     */
    private void createStepLogForWorkRequest(final DataRecord wrRecord) {

        final StringBuilder insertStepLogSql = new StringBuilder();

        final String requestedDateTime =
                EventHandlerBase.formatSqlDateTime(ContextStore.get().getEventHandlerContext(),
                    wrRecord.getDate("wr.date_requested").toString(),
                    wrRecord.getDate("wr.time_requested").toString());

        insertStepLogSql
        .append(" insert into helpdesk_step_log  (activity_id, table_name, field_name, pkey_value, date_created, time_created, date_response,time_response, status,  step, step_code ) ");
        insertStepLogSql.append(" values ('AbBldgOpsOnDemandWork', 'wr', 'wr_id',");
        insertStepLogSql.append(wrRecord.getValue("wr.wr_id")).append(",");
        insertStepLogSql.append(requestedDateTime).append(",");
        insertStepLogSql.append(requestedDateTime).append(",");
        insertStepLogSql.append(requestedDateTime).append(",");
        insertStepLogSql.append(requestedDateTime).append(",'");
        insertStepLogSql.append(wrRecord.getValue("wr.status")).append("',");
        insertStepLogSql.append("'Basic', '");
        insertStepLogSql.append(Common.generateUUID()).append("')");

        SqlUtils.executeUpdate("helpdesk_step_log", insertStepLogSql.toString());
    }

    /**
     * Insert STEP LOG for service request.
     *
     * @param alRecord : Service request record
     *
     */
    private void createStepLogForServiceRequest(final DataRecord alRecord) {

        final StringBuilder insertStepLogSql = new StringBuilder();

        final String requestedDateTime =
                EventHandlerBase.formatSqlDateTime(ContextStore.get().getEventHandlerContext(),
                    alRecord.getDate("activity_log.date_requested").toString(),
                    alRecord.getDate("activity_log.time_requested").toString());

        insertStepLogSql
        .append(" insert into helpdesk_step_log  (activity_id, table_name, field_name, pkey_value, date_created, time_created, date_response,time_response, status,  step, step_code ) ");
        insertStepLogSql.append(" values ('AbBldgOpsHelpDesk', 'activity_log', 'activity_log_id',");
        insertStepLogSql.append(alRecord.getValue("activity_log.activity_log_id")).append(",");
        insertStepLogSql.append(requestedDateTime).append(",");
        insertStepLogSql.append(requestedDateTime).append(",");
        insertStepLogSql.append(requestedDateTime).append(",");
        insertStepLogSql.append(requestedDateTime).append(",'");
        insertStepLogSql.append(alRecord.getValue("activity_log.status")).append("',");
        insertStepLogSql.append("'Basic', '");
        insertStepLogSql.append(Common.generateUUID()).append("')");

        SqlUtils.executeUpdate("helpdesk_step_log", insertStepLogSql.toString());
    }

    /**
     * Enforces SLA information to Work Requests by matching the SLA.
     *
     * @param wrRecord : Work request record
     * @param pmpId : PM Procedure id
     * @return
     */
    private DataRecord enforceSLAtoWorkRequest(final DataRecord wrRecord, final String pmpId) {

        final String siteId = getSiteIdByBlId(wrRecord);
        wrRecord.setValue("wr.site_id", siteId);

        final DataRecord SLAResponse = retrieveSlaResponse(wrRecord, pmpId, siteId);
        if (SLAResponse == null) {
            return null;
        }
        final Time start = (Time) SLAResponse.getValue("helpdesk_sla_response.serv_window_start");
        final Time end = (Time) SLAResponse.getValue("helpdesk_sla_response.serv_window_end");
        final String days = SLAResponse.getString("helpdesk_sla_response.serv_window_days");
        boolean allow_work_on_holidays = false;
        if (SLAResponse.getInt("helpdesk_sla_response.allow_work_on_holidays") > 0) {
            allow_work_on_holidays = true;
        }

        final ServiceWindow sw =
                new ServiceWindow(ContextStore.get().getEventHandlerContext(), start, end, days,
                    allow_work_on_holidays, siteId);
        Map<String, Object> escResponse = null;
        Map<String, Object> escComplete = null;

        escResponse =
                sw.calculateEscalationDate((java.sql.Date) wrRecord.getValue("wr.date_assigned"),
                    null, SLAResponse.getInt("helpdesk_sla_response.time_to_respond"),
                    SLAResponse.getString("helpdesk_sla_response.interval_to_respond"));
        if (escResponse != null) {
            wrRecord.setValue("wr.date_escalation_response", escResponse.get("date"));
            wrRecord.setValue("wr.time_escalation_response", escResponse.get("time"));
        }

        escComplete =
                sw.calculateEscalationDate((java.sql.Date) wrRecord.getValue("wr.date_assigned"),
                    null, SLAResponse.getInt("helpdesk_sla_response.time_to_complete"),
                    SLAResponse.getString("helpdesk_sla_response.interval_to_complete"));
        if (escComplete != null) {
            wrRecord.setValue("wr.date_escalation_completion", escComplete.get("date"));
            wrRecord.setValue("wr.time_escalation_completion", escComplete.get("time"));
        }

        wrRecord.setValue("wr.manager", SLAResponse.getString("helpdesk_sla_response.manager"));
        wrRecord.setValue("wr.serv_window_start",
            SLAResponse.getValue("helpdesk_sla_response.serv_window_start"));
        wrRecord.setValue("wr.serv_window_end",
            SLAResponse.getValue("helpdesk_sla_response.serv_window_end"));
        wrRecord.setValue("wr.serv_window_days",
            SLAResponse.getString("helpdesk_sla_response.serv_window_days"));
        wrRecord.setValue("wr.supervisor",
            SLAResponse.getString("helpdesk_sla_response.supervisor"));
        wrRecord.setValue("wr.work_team_id",
            SLAResponse.getString("helpdesk_sla_response.work_team_id"));

        // 3024589: remove code manually set status of work request
        // if(SLAResponse.getInt("helpdesk_sla_response.autoissue")==0){
        // wrRecord.setValue("wr.status", "AA");
        // }
        // else {
        // wrRecord.setValue("wr.status", "I");
        // }

        return SLAResponse;

    }

    private final Map<String, DataRecord> cacheSlaReponses = new HashMap<String, DataRecord>();

    /**
     * Retrieves SLA response by given work request, pm procedure and site code.
     *
     * @param wrRecord : Work request record
     * @param pmpId : PM Procedure id
     * @param siteId : Site code
     * @return
     */
    private DataRecord retrieveSlaResponse(final DataRecord wrRecord, final String pmpId,
            final String siteId) {
        final String key = this.constructKeyForFindSlaResponse(wrRecord, pmpId, siteId);
        DataRecord slaResponse = this.cacheSlaReponses.get(key);
        if (slaResponse != null) {

            return slaResponse;

        }

        DataRecord slaRequest = null;
        List<DataRecord> slaRequestList = null;

        final String eqId = wrRecord.getString("wr.eq_id");

        final JSONObject fieldsValue = new JSONObject();
        fieldsValue.put("activity_type", PM_ACTIVITY_TYPE);
        fieldsValue.put("prob_type", PM_PROB_TYPE);
        fieldsValue.put("pmp_id", pmpId);

        // For kb#3024571, change code to include location fields even for equipment procedure.
        fieldsValue.put("site_id", siteId);
        fieldsValue.put("bl_id", wrRecord.getString("wr.bl_id"));
        fieldsValue.put("fl_id", wrRecord.getString("wr.fl_id"));
        fieldsValue.put("rm_id", wrRecord.getString("wr.rm_id"));
        if (StringUtil.notNullOrEmpty(eqId)) {
            fieldsValue.put("eq_id", eqId);
            final DataRecord eqRecord = this.cacheEquipments.get(eqId);

            if (eqRecord != null) {
                fieldsValue.put("eq_std", eqRecord.getString("eq.eq_std"));
            } else {
                fieldsValue.put("eq_std", null);
            }
            slaRequestList = this.getMatchSlaFromFieldValues(fieldsValue, false);
        } else {
            slaRequestList = this.getMatchSlaFromFieldValues(fieldsValue, true);
        }

        if (slaRequestList != null && slaRequestList.size() > 0) {
            slaRequest = slaRequestList.get(slaRequestList.size() - 1);
        }

        int orderingSeq = -1;
        if (slaRequest == null) {
            return null;
        } else {
            orderingSeq = slaRequest.getInt("helpdesk_sla_request.ordering_seq");
        }
        slaResponse =
                this.slaResponseSelectDS.getRecord(" activity_type = 'SERVICE DESK - MAINTENANCE' "
                        + " AND priority=1 " + " AND ordering_seq=" + orderingSeq + " ");

        this.cacheSlaReponses.put(key, slaResponse);
        return slaResponse;
    }

    /**
     * Below CONSTANTS are used for method getMatchSlaFromFields() to construct sql, get matched
     * records and remove unmatched records.
     */
    public static final String[] PM_REQUEST_PARAMETER_NAMES_EQ = { "activity_type", "prob_type",
        "pmp_id", "eq_id", "eq_std", "site_id", "bl_id", "fl_id", "rm_id" };

    public static final String[] PM_REQUEST_PARAMETER_NAMES_HK = { "activity_type", "prob_type",
        "pmp_id", "site_id", "bl_id", "fl_id", "rm_id" };

    public static final String PM_ACTIVITY_TYPE = "SERVICE DESK - MAINTENANCE";

    public static final String PM_PROB_TYPE = "PREVENTIVE MAINT";

    public static final String SLA_REQUEST_TABLE_NAME = "helpdesk_sla_request";

    /**
     * Construct a restriction sql used to find all SLA_HELPREQUESTs, then delete unmatched records.
     *
     * For example below sql to match the case that equipment is not null: wr.activity_type =
     * hsr.activity_type OR wr.prob_type = hsr.prob_type OR wr.pmp_id = hsr.pmp_id OR wr.eq_id =
     * hsr.eq_id OR wr.eq_std = hsr.eq_std Then go through all found hsr records: DELETE {those hsr
     * records just obtained} WHERE hsr.prob_type IS NOT NULL AND wr.prob_type != hsr.prob_type
     * DELETE {those hsr records just obtained} WHERE hsr.eq_id IS NOT NULL AND wr.eq_id !=
     * hsr.eq_id DELETE {those hsr records just obtained} WHERE hsr.eq_std IS NOT NULL AND wr.eq_std
     * != hsr.eq_std DELETE {those hsr records just obtained} WHERE hsr.pmp_id IS NOT NULL AND
     * wr.pmp_id != hsr.pmp_id
     *
     * @param isEqNull : Indicates whether the equipment is null
     * @param fieldValues : An JSON Object contains fields value used to match the SLA_HELPREQUEST
     * @return
     */
    private List<DataRecord> getMatchSlaFromFieldValues(final JSONObject fieldValues,
        final boolean isEqNull) {

        String fieldName = null;
        final String[] currentFieldNameArray =
                isEqNull ? PM_REQUEST_PARAMETER_NAMES_HK : PM_REQUEST_PARAMETER_NAMES_EQ;

        // Construct match sql string
        final String matchSql = ServiceLevelAgreement.getMatchSqlForPmSLA(fieldValues, isEqNull);

        List<DataRecord> slaRequestList = null;
        List<DataRecord> returnedSlaRequestList = new ArrayList<DataRecord>();

        // KB3045495 - Remove record limit from match SLA PM generation query
        this.slaRequestSelectDS.setMaxRecords(0);
        slaRequestList = this.slaRequestSelectDS.getRecords(matchSql);
        // Go through records to delete unmatched record
        if (slaRequestList != null) {
            returnedSlaRequestList.addAll(slaRequestList);
            for (final String element : currentFieldNameArray) {
                fieldName = element;
                for (final DataRecord hsr : slaRequestList) {
                    final String hsrFieldValue =
                            hsr.getString(SLA_REQUEST_TABLE_NAME + "." + fieldName);
                    if (hsrFieldValue != null
                            && (!fieldValues.has(fieldName) || !fieldValues.get(fieldName).equals(
                                hsrFieldValue))) {
                        returnedSlaRequestList.remove(hsr);
                    }
                }
            }
        }
        if (returnedSlaRequestList.size() == 0) {
            returnedSlaRequestList =
                    this.slaRequestSelectDS.getRecords(" activity_type='" + PM_ACTIVITY_TYPE
                        + "' AND ordering_seq=1 ");
        }

        return returnedSlaRequestList;
    }

    /**
     * Creates wrcf record for given work request and SLA response record
     *
     * @param wrRecord : Work request record
     * @param cfId : Work request record
     * @param slaResponse : SLA response record
     */
    private void createWorkRequestCraftperson(final DataRecord wrRecord, final String cfId,
            final DataRecord slaResponse) {
        
        if (this.wrcfSelectForPmsDateDS.setParameter("cfId", cfId).getRecord() == null) {
            // Only create just one craftsperson assignment for the entire procedure
            // (set of work requests),
            final String siteId = getSiteIdByBlId(wrRecord);
            final Time start = (Time) slaResponse.getValue("helpdesk_sla_response.serv_window_start");
            final Time end = (Time) slaResponse.getValue("helpdesk_sla_response.serv_window_end");
            final String days = slaResponse.getString("helpdesk_sla_response.serv_window_days");
            boolean allow_work_on_holidays = false;
            if (slaResponse.getInt("helpdesk_sla_response.allow_work_on_holidays") > 0) {
                allow_work_on_holidays = true;
            }

            final ServiceWindow sw =
                    new ServiceWindow(ContextStore.get().getEventHandlerContext(), start, end, days,
                        allow_work_on_holidays, siteId);
            final Date date_assigned = wrRecord.getDate("wr.date_assigned");

            final DataRecord wrcfRec = this.wrCfUpdateDS.createNewRecord();
            wrcfRec.setValue("wrcf.wr_id", wrRecord.getInt("wr.wr_id"));
            wrcfRec.setValue("wrcf.date_assigned",
                sw.getServiceDay(new java.sql.Date(date_assigned.getTime())));
            wrcfRec.setValue("wrcf.time_assigned", wrRecord.getDate("wr.serv_window_start"));
            wrcfRec.setValue("wrcf.cf_id", cfId);
            wrcfRec.setValue("wrcf.hours_est",
                (double) slaResponse.getInt("helpdesk_sla_response.default_duration"));
            this.wrCfUpdateDS.saveRecord(wrcfRec);
            this.wrCfUpdateDS.setParameter("wrId", wrRecord.getInt("wr.wr_id"));
            this.wrCfUpdateDS.executeUpdate();
        }
       
    }

    /**
     * For newly created wrpt, update quantity fields of pt as well as update wrpt's status
     * according to quantity cpmparision.
     *
     */
    private void reserveParts() {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Check if upgrade to multiple warehouse
        final String isUseMultipleWH = EventHandlerBase.getActivityParameterString(context,
            "AbBldgOpsOnDemandWork", "UseBldgOpsConsole");

        final DataSource selectWrptDs = DataSourceFactory.createDataSourceForFields("wrpt",
            new String[] { "wr_id", "part_id", "qty_estimated", "status" });

        if ("1".equals(isUseMultipleWH)) {
            selectWrptDs.addField("pt_store_loc_id");
        }

        selectWrptDs.setApplyVpaRestrictions(false);
        for (long i = this.startWrId; i <= this.endWrId; i++) {

            final List<DataRecord> wrptList = selectWrptDs.getRecords("wr_id=" + i);
            for (final DataRecord wrpt : wrptList) {

                String status = null;

                if ("1".equals(isUseMultipleWH)) {
                    status = this.reservePart(wrpt.getString("wrpt.part_id"),
                        wrpt.getString("wrpt.pt_store_loc_id"),
                        wrpt.getDouble("wrpt.qty_estimated"));
                } else {
                    status = this.reservePart(wrpt.getString("wrpt.part_id"),
                        wrpt.getDouble("wrpt.qty_estimated"));
                }
                wrpt.setValue("wrpt.status", status);
                selectWrptDs.updateRecord(wrpt);

                // KB#3042273: modified for Bali3 Part Inventory Improvement
                if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                    if ("R".equalsIgnoreCase(status)) {

                        if ("1".equals(isUseMultipleWH)) {
                            final BldgopsPartInventoryMultiplePartStorageLocation partInv =
                                    new BldgopsPartInventoryMultiplePartStorageLocation(
                                        wrpt.getString("wrpt.part_id"),
                                        wrpt.getString("wrpt.pt_store_loc_id"));
                            partInv.updateWrptStatusForMpsl(-wrpt.getDouble("wrpt.qty_estimated"));
                        } else {
                            final BldgopsPartInventory partInv =
                                    new BldgopsPartInventory(wrpt.getString("wrpt.part_id"));
                            partInv.updateWRPTStatus(-wrpt.getDouble("wrpt.qty_estimated"));
                        }
                    }
                }

            }
        }

    }

    /**
     * Attempts to reserve required quantity of specified part. If there are enough parts on hand to
     * reserve, updates the part record. Returns status: "R" if reserved, "NI" if not.
     *
     * @param partId
     * @param quantityRequired
     * @return
     */
    private String reservePart(final String partId, final double quantityRequired) {
        String reserveStatus = "NI";

        // load the part record
        final DataRecord part = this.partDS.getRecord("part_id = '"+partId+"'");

        final double quantityOnHand = part.getDouble("pt.qty_on_hand");
        final double quantityOnReserve = part.getDouble("pt.qty_on_reserve");

        // If the required Part quantity is not greater than the inventory quantity on-hand then
        // decrement the inventory on-hand quantity and increment the inventory on-reserve quantity.
        if (quantityRequired <= quantityOnHand) {
            part.setValue("pt.qty_on_hand", quantityOnHand - quantityRequired);
            part.setValue("pt.qty_on_reserve", quantityOnReserve + quantityRequired);
            reserveStatus = "R";
        }

        return reserveStatus;
    }
    
    /**
     * Attempts to reserve required quantity of specified part. If there are enough parts on hand to
     * reserve, updates the part record. Returns status: "R" if reserved, "NI" if not.
     *
     * @param partId
     * @param quantityRequired
     * @return
     */
    private String reservePart(final String partId, final String ptLocId, final double quantityRequired) {
        String reserveStatus = "NI";

        // load the part record
        BldgopsPartInventorySupplyRequisition.addNewPartToStoreLocIfNotExists(ptLocId, partId);
        final DataRecord partLocRecord = this.partLocDS.getRecord("part_id ='"+partId+"' and pt_store_loc_id='"+ptLocId+"'");

        final double quantityOnHand = partLocRecord.getDouble("pt_store_loc_pt.qty_on_hand");

        // If the required Part quantity is not greater than the inventory quantity on-hand then
        // decrement the inventory on-hand quantity and increment the inventory on-reserve quantity.
        if (quantityRequired <= quantityOnHand) {
            
            reserveStatus = "R";
        }

        return reserveStatus;
    }

    private final Map<String, String> cacheSites = new HashMap<String, String>();

    /**
     * Retrieves SIte id from building id of a work request
     *
     * @param wrRecord : Work request record
     * @return
     */
    private String getSiteIdByBlId(final DataRecord wrRecord) {
        final String blId = wrRecord.getString("wr.bl_id");
        if (this.cacheSites.containsKey(blId)) {
            return this.cacheSites.get(blId);
        }

        // kb#3037705: in case of eq has not building code but has site code, keep its original site
        // code.
        String siteId = wrRecord.getString("wr.site_id");

        if (blId != null && blId != "") {
            final DataRecord blRecord = this.siteSelectDS.getRecord(" bl_id='" + blId + "' ");
            siteId = blRecord.getString("bl.site_id");
        }

        this.cacheSites.put(blId, siteId);
        return siteId;
    }

    private String getLogInName() {
        final String logInUserName = ContextStore.get().getUser().getName();
        final String emName = ContextStore.get().getUser().getEmployee().getId();

        if (("AFM".equalsIgnoreCase(logInUserName)) || (emName == null) || (emName.length() == 0)) {
            return "";
        } else {
            return emName;
        }
    }

    // ----------------------- data sources used to retrieve or create records --------------------

    private DataSource woUpdateDS;

    private DataSource wrUpdateDS;

    private DataSource ptUpdateDS;

    private DataSource alUpdateDS;

    private DataSource wrCfUpdateDS;

    private DataSource siteSelectDS;

    private DataSource slaRequestSelectDS;

    private DataSource slaResponseSelectDS;

    private DataSource cfSelectDS;

    private DataSource emSelectDS;

    private DataSource wrcfSelectDS;

    private DataSource wrcfSelectForPmsDateDS;

    private DataSource timezoneDS;

    private DataSource stepLogDS;

    /**
     * Performs data source creation initially
     *
     */
    private void createDataSources() {
        this.woUpdateDS =
                DataSourceFactory.createDataSourceForFields("wo", new String[] { "wo_id", "bl_id",
                        "date_created", "time_created", "date_assigned", "wo_type", "description",
                        "name_of_contact", "supervisor", "work_team_id", "cost_estimated",
                        "date_issued", "time_issued" });
        this.woUpdateDS.setApplyVpaRestrictions(false);

        this.wrUpdateDS =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "wr_id", "wo_id",
                        "prob_type", "requestor", "date_requested", "time_requested", "status",
                        "pms_id", "pmp_id", "site_id", "bl_id", "fl_id", "rm_id", "dv_id", "dp_id",
                        "priority", "ac_id", "tr_id", "date_assigned", "eq_id", "description",
                        "date_escalation_response", "time_escalation_response",
                        "date_escalation_completion", "time_escalation_completion", "manager",
                        "serv_window_start", "serv_window_end", "serv_window_days", "supervisor",
                        "work_team_id", "status" });
        this.wrUpdateDS.setApplyVpaRestrictions(false);

        this.ptUpdateDS =
                DataSourceFactory
                .createDataSourceForFields("pt",
                    new String[] { "part_id", "qty_on_hand", "qty_on_reserve" })
                    .addRestriction(Restrictions.sql("pt.part_id = ${parameters['ptId']}"))
                    .addParameter("ptId", "", DataSource.DATA_TYPE_TEXT);
        this.ptUpdateDS.setApplyVpaRestrictions(false);

        this.alUpdateDS =
                DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                        "activity_log_id", "activity_type", "pmp_id", "autocreate_wr", "site_id",
                        "bl_id", "fl_id", "rm_id", "eq_id", "cost_estimated", "date_scheduled",
                        "dv_id", "dp_id", "escalated_completion", "escalated_response",
                        "prob_type", "status ", "date_approved", "date_issued", "date_requested",
                        "time_requested", "wo_id", "wr_id", "supervisor", "work_team_id",
                        "manager", "date_escalation_response", "time_escalation_response",
                        "date_escalation_completion", "time_escalation_completion" });
        this.alUpdateDS.setApplyVpaRestrictions(false);

        this.wrCfUpdateDS =
                DataSourceFactory
                .createDataSourceForFields(
                    "wrcf",
                    new String[] { "wr_id", "date_assigned", "time_assigned", "cf_id",
                            "hours_est", "cost_estimated", "scheduled_from_tr_id" })
                            .addQuery(
                                " UPDATE wrcf SET wrcf.cost_estimated= "
                                        + " wrcf.hours_est * "
                                        + EventHandlerBase
                                        .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                "(SELECT cf.rate_hourly FROM cf WHERE cf.cf_id = wrcf.cf_id),0")
                                                + ", " + "wrcf.scheduled_from_tr_id="
                                                + " (SELECT cf.tr_id from cf WHERE cf.cf_id = wrcf.cf_id) "
                                                + " WHERE wrcf.wr_id = ${parameters['wrId']}")
                                                .addParameter("wrId", "", DataSource.DATA_TYPE_INTEGER);
        this.wrCfUpdateDS.setApplyVpaRestrictions(false);

        this.siteSelectDS =
                DataSourceFactory.createDataSourceForFields("bl",
                    new String[] { "site_id", "bl_id" });
        this.siteSelectDS.setApplyVpaRestrictions(false);

        this.slaRequestSelectDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_sla_request", new String[] { "activity_type", "prob_type", "pmp_id", "eq_std",
                    "eq_id", "site_id", "bl_id", "fl_id", "rm_id", "ordering_seq" });

        if (SchemaUtils.fieldExistsInSchema("helpdesk_sla_request", "match_ordering_seq")) {
            this.slaRequestSelectDS.addSort("match_ordering_seq");
        } else {
            this.slaRequestSelectDS.addSort("ordering_seq");
        }
        
        this.slaRequestSelectDS.setApplyVpaRestrictions(false);

        this.slaResponseSelectDS =
                DataSourceFactory.createDataSourceForFields("helpdesk_sla_response",
                    new String[] { "activity_type", "priority", "ordering_seq", "autoissue",
                        "serv_window_start", "serv_window_end", "serv_window_days",
                        "supervisor", "work_team_id", "manager", "time_to_respond",
                        "interval_to_respond", "time_to_complete", "interval_to_complete",
                        "cf_id", "default_duration", "notify_craftsperson",
                        "notify_service_provider", "allow_work_on_holidays" });
        
        if (SchemaUtils.fieldExistsInSchema(Constants.SLA_RESPONSE_TABLE, "cf_role")) {
            this.slaResponseSelectDS.addField("cf_role");
        }
        
        this.slaResponseSelectDS.setApplyVpaRestrictions(false);

        this.cfSelectDS =
                DataSourceFactory
                .createDataSourceForFields("cf", new String[] { "cf_id", "email" });
        this.cfSelectDS.setApplyVpaRestrictions(false);

        this.emSelectDS =
                DataSourceFactory
                .createDataSourceForFields("em", new String[] { "em_id", "email" });
        this.emSelectDS.setApplyVpaRestrictions(false);

        this.wrcfSelectDS =
                DataSourceFactory.createDataSourceForFields("wrcf",
                    new String[] { "wr_id", "cf_id" });
        this.wrcfSelectDS.setApplyVpaRestrictions(false);

        this.wrcfSelectForPmsDateDS =
                DataSourceFactory
                .createDataSourceForFields("wrcf", new String[] { "wr_id", "cf_id" })
                .addQuery(
                    "SELECT cf_id, wr_id FROM wrcf WHERE EXISTS" + "  ( SELECT 1 FROM wr "
                            + " WHERE wr.pms_id=${parameters['pmsId']} "
                            + " AND wr.date_assigned=${parameters['dateAssigned']} "
                            + " AND wrcf.cf_id=${parameters['cfId']} "
                            + " AND wr.wr_id=wrcf.wr_id " + " ) ")
                            .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER)
                            .addParameter("cfId", "", DataSource.DATA_TYPE_TEXT)
                            .addParameter("dateAssigned", "", DataSource.DATA_TYPE_DATE);
        this.wrcfSelectForPmsDateDS.setApplyVpaRestrictions(false);

        this.timezoneDS =
                DataSourceFactory.createDataSourceForFields("city", new String[] { "timezone_id" });
        this.timezoneDS.setApplyVpaRestrictions(false);

        this.stepLogDS =
                DataSourceFactory.createDataSourceForFields("helpdesk_step_log", new String[] {
                        "field_name", "date_response", "status", "activity_id", "pkey_value",
                        "time_created", "time_response", "table_name", "step", "step_code",
                "date_created" });
        this.stepLogDS.setApplyVpaRestrictions(false);

    }

    private final Map<String, String> timezones = new HashMap<String, String>();

    /**
     * Return time zone code
     *
     * @param siteId
     * @param blId
     */
    private String getTimezoneCode(final String siteId, final String blId) {
        if (this.timezones.containsKey("building" + "_" + blId)) {
            return this.timezones.get("building" + "_" + blId);
        } else if (this.timezones.containsKey("site" + "_" + siteId)) {
            return this.timezones.get("site" + "_" + siteId);
        } else {
            String keyId = "";
            String sql = "";
            if (StringUtil.notNullOrEmpty(blId)) {
                sql =
                        " SELECT city.timezone_id" + " FROM bl LEFT OUTER JOIN city "
                                + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                + " WHERE bl.bl_id ='" + blId + "' ";
                keyId = "building" + "_" + blId;

            } else if (StringUtil.notNullOrEmpty(siteId)) {
                sql =
                        " SELECT city.timezone_id" + " FROM site LEFT OUTER JOIN city "
                                + " ON city.city_id=site.city_id AND city.state_id=site.state_id"
                                + " WHERE site.site_id ='" + siteId + "' ";
                keyId = "site" + "_" + siteId;
            }
            this.timezoneDS.addQuery(sql);
            this.timezoneDS.setApplyVpaRestrictions(false);
            final DataRecord tzRec = this.timezoneDS.getRecord();
            if (tzRec != null) {
                this.timezones.put(keyId, tzRec.getString("city.timezone_id"));
                return tzRec.getString("city.timezone_id");
            } else {
                return null;
            }
        }
    }

    private Map<String, DataRecord> cacheEquipments;

    private void cacheEquipment() {
        this.cacheEquipments = new HashMap<String, DataRecord>();

        final DataSource eqDS =
                DataSourceFactory
                .createDataSourceForFields(
                    "eq",
                    new String[] { "eq.eq_id", "eq.site_id", "eq.bl_id", "eq.fl_id",
                            "eq.rm_id", "eq.dv_id", "eq.dp_id", "eq.eq_std" })
                            .addQuery(
                                "       SELECT distinct pms.eq_id, eq.site_id, eq.bl_id, eq.fl_id, eq.rm_id, eq.dv_id, eq.dp_id, eq.eq_std "
                                        + " from pmsd left outer join pms on pms.pms_id=pmsd.pms_id left outer join eq on eq.eq_id=pms.eq_id "
                                        + " where pms.eq_id IS NOT NULL and " + this.restriction)
                                        .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                                        .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                                        .setParameter("dateFrom", this.dateFrom).setParameter("dateTo", this.dateTo);
        eqDS.setApplyVpaRestrictions(false);

        final List<DataRecord> records = eqDS.getAllRecords();
        for (final DataRecord record : records) {
            this.cacheEquipments.put(record.getString("eq.eq_id"), record);
        }
    }

    private Map<String, DataRecord> cacheParts;

    private DataSource partDS;
    private DataSource partLocDS;

    private void cacheParts() {
        this.cacheParts = new HashMap<String, DataRecord>();

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Check if upgrade to multiple warehouse
        final String isUseMultipleWH = EventHandlerBase.getActivityParameterString(context,
            "AbBldgOpsOnDemandWork", "UseBldgOpsConsole");
        String insertWrptSql = "";

        if ("1".equals(isUseMultipleWH)) {
            this.partLocDS = DataSourceFactory.createDataSourceForFields("pt_store_loc_pt",
                new String[] { "pt_store_loc_pt.part_id", "pt_store_loc_pt.pt_store_loc_id",
                        "pt_store_loc_pt.qty_on_hand", "pt_store_loc_pt.qty_on_reserve" });
        }

        this.partDS =
                DataSourceFactory
                .createDataSourceForFields("pt",
                    new String[] { "pt.part_id", "pt.qty_on_hand", "pt.qty_on_reserve" })
                    .addQuery(
                        "       SELECT distinct pmpspt.part_id, pt.qty_on_hand, pt.qty_on_reserve "
                                + " from pmpspt left outer join pmp on pmp.pmp_id=pmpspt.pmp_id  "
                                + "             left outer join pmps on pmps.pmps_id=pmpspt.pmps_id and pmps.pmp_id=pmpspt.pmp_id "
                                + "             left outer join pt on pmpspt.part_id=pt.part_id  "
                                + " where exists (select 1 from pmsd left outer join pms on pms.pms_id=pmsd.pms_id   "
                                + " where pms.pmp_id=pmp.pmp_id and " + this.restriction + ") ")
                                .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                                .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                                .setParameter("dateFrom", this.dateFrom).setParameter("dateTo", this.dateTo);
        this.partDS.setApplyVpaRestrictions(false);

        final List<DataRecord> records = this.partDS.getAllRecords();
        for (final DataRecord record : records) {
            this.cacheParts.put(record.getString("pt.part_id"), record);
        }
    }

    private Map<String, List<DataRecord>> cachePmpSteps;

    private void cachePmProcedureStep() {

        this.cachePmpSteps = new HashMap<String, List<DataRecord>>();

        final DataSource pmpsDS =
                DataSourceFactory
                .createDataSourceForFields("pmps",
                    new String[] { "pmps.pmp_id", "pmps.pmps_id", "pmps.instructions" })
                    .addQuery(
                        "       SELECT pmps.pmp_id, pmps.pmps_id, pmps.instructions "
                                + " from pmps left outer join pmp on pmp.pmp_id=pmps.pmp_id "
                                + " where exists (select 1 from pmsd left outer join pms on pms.pms_id=pmsd.pms_id   "
                                + " where pms.pmp_id=pmp.pmp_id and " + this.restriction + ") ")
                                .addSort("pmps_id").addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                                .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                                .setParameter("dateFrom", this.dateFrom).setParameter("dateTo", this.dateTo);
        pmpsDS.setApplyVpaRestrictions(false);

        final List<DataRecord> records = pmpsDS.getAllRecords();
        for (final DataRecord record : records) {
            final String key = record.getString("pmps.pmp_id");
            if (this.cachePmpSteps.containsKey(key)) {
                this.cachePmpSteps.get(key).add(record);
            } else {
                final List<DataRecord> newList = new ArrayList<DataRecord>();
                newList.add(record);
                this.cachePmpSteps.put(key, newList);
            }
        }
    }

    /**
     * Performs cost calculations for new created work request
     *
     * @param wrId : Work request record
     * @param hadCf : if current work request having assigned craft person the value is true, else
     *            value is false.
     *
     */
    public void calculateWorkRequestCostEstimates() {
        final String calculateTradeCostEstimates =
                " UPDATE wrtr SET wrtr.cost_estimated = "
                        + EventHandlerBase
                        .formatSqlIsNull(
                            ContextStore.get().getEventHandlerContext(),
                            " ( SELECT wrtr.hours_est * tr.rate_hourly "
                                    + "FROM wrtr a_inner, tr WHERE a_inner.wr_id = wrtr.wr_id  AND a_inner.tr_id = wrtr.tr_id  AND a_inner.tr_id = tr.tr_id ),0 ")
                                    + " WHERE wrtr.wr_id>= " + this.startWrId + "      AND wrtr.wr_id<= "
                                    + this.endWrId;
        final DataSource wrtrCalculateDS =
                DataSourceFactory.createDataSourceForFields("wrtr",
                    new String[] { "wrtr.wr_id", "wrtr.tr_id" }).addQuery(
                        calculateTradeCostEstimates);
        wrtrCalculateDS.setApplyVpaRestrictions(false);
        wrtrCalculateDS.executeUpdate();

        final String calculateToolCostEstimates =
                " UPDATE wrtt SET wrtt.cost_estimated = "
                        + EventHandlerBase
                        .formatSqlIsNull(
                            ContextStore.get().getEventHandlerContext(),
                            " ( SELECT wrtt.hours_est * tt.rate_hourly "
                                    + "FROM wrtt a_inner, tt WHERE a_inner.wr_id = wrtt.wr_id  AND a_inner.tool_type = wrtt.tool_type  AND a_inner.tool_type = tt.tool_type ) , 0 ")
                                    + " WHERE wrtt.wr_id>= " + this.startWrId + "      AND wrtt.wr_id<= "
                                    + this.endWrId;
        final DataSource wrttCalculateDS =
                DataSourceFactory.createDataSourceForFields("wrtt",
                    new String[] { "wrtt.wr_id", "wrtt.tool_type" }).addQuery(
                        calculateToolCostEstimates);
        wrttCalculateDS.setApplyVpaRestrictions(false);
        wrttCalculateDS.executeUpdate();

        // kb#3039268: The Cost of Parts estimation should be calculated using the part's average
        // cost (pt.cost_unit_avg).
        final String calculatePartCostEstimates =
                " UPDATE wrpt SET wrpt.cost_estimated = "
                        + EventHandlerBase
                        .formatSqlIsNull(
                            ContextStore.get().getEventHandlerContext(),
                            " ( SELECT wrpt.qty_estimated * pt.cost_unit_avg "
                                    + "     FROM wrpt a_inner, pt WHERE a_inner.wr_id = wrpt.wr_id  AND a_inner.part_id = wrpt.part_id  AND a_inner.part_id = pt.part_id ) , 0 ")
                                    + " WHERE wrpt.wr_id>= " + this.startWrId + "      AND wrpt.wr_id<= "
                                    + this.endWrId;
        final DataSource wrptCalculateDS =
                DataSourceFactory.createDataSourceForFields("wrpt",
                    new String[] { "wrpt.wr_id", "wrpt.part_id" }).addQuery(
                        calculatePartCostEstimates);
        wrptCalculateDS.setApplyVpaRestrictions(false);
        wrptCalculateDS.executeUpdate();

        final String calculateWrCostEstimates =
                "UPDATE wr SET cost_est_labor= "
                        + EventHandlerBase
                        .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                " (SELECT sum(wrcf.cost_estimated) FROM wrcf WHERE wrcf.wr_id = wr.wr_id), 0 ")
                                + "+"
                                + EventHandlerBase
                                .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                        " (SELECT sum(wrtr.cost_estimated) FROM wrtr WHERE wrtr.wr_id = wr.wr_id),0")
                                        + ", "
                                        + "     est_labor_hours= "
                                        + EventHandlerBase
                                        .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                " (SELECT sum(wrcf.hours_est) FROM wrcf WHERE wrcf.wr_id = wr.wr_id),0 ")
                                                + "+"
                                                + EventHandlerBase
                                                .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                        " (SELECT sum(wrtr.hours_est) FROM wrtr WHERE wrtr.wr_id = wr.wr_id),0 ")
                                                        + ", "
                                                        + "     cost_est_tools= "
                                                        + EventHandlerBase
                                                        .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                                " (SELECT sum(wrtt.cost_estimated) FROM wrtt WHERE wrtt.wr_id = wr.wr_id),0 ")
                                                                + ", "
                                                                + "     cost_est_parts="
                                                                + EventHandlerBase
                                                                .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                                        " (SELECT sum(wrpt.cost_estimated) FROM wrpt WHERE wrpt.wr_id = wr.wr_id),0 ")
                                                                        + "WHERE  wr.wr_id>= " + this.startWrId + "      AND wr.wr_id<= "
                                                                        + this.endWrId;

        final DataSource wrCalculateDS =
                DataSourceFactory.createDataSourceForFields(
                    "wr",
                    new String[] { "wr.wr_id", "wr.cost_est_labor", "wr.est_labor_hours",
                            "wr.cost_est_tools", "wr.cost_est_parts" }).addQuery(
                                calculateWrCostEstimates);
        wrCalculateDS.setApplyVpaRestrictions(false);
        wrCalculateDS.executeUpdate();

        final String calculateWrTotalCostEstimates =
                " UPDATE wr SET cost_est_total= "
                        + EventHandlerBase
                        .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                "  (SELECT sum(wrcf.cost_estimated) FROM wrcf WHERE wrcf.wr_id = wr.wr_id),0 ")
                                + "+"
                                + EventHandlerBase
                                .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                        "  (SELECT sum(wrtr.cost_estimated) FROM wrtr WHERE wrtr.wr_id = wr.wr_id),0 ")
                                        + "+"
                                        + EventHandlerBase
                                        .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                "  (SELECT sum(wrtt.cost_estimated) FROM wrtt WHERE wrtt.wr_id = wr.wr_id),0 ")
                                                + "+"
                                                + EventHandlerBase
                                                .formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                                                        "  (SELECT sum(wrpt.cost_estimated) FROM wrpt WHERE wrpt.wr_id = wr.wr_id),0 ")
                                                        + "WHERE  wr.wr_id>= " + this.startWrId + "      AND wr.wr_id<= "
                                                        + this.endWrId;

        final DataSource wrTotalCostCalculateDS =
                DataSourceFactory.createDataSourceForFields(
                    "wr",
                    new String[] { "wr.wr_id", "wr.cost_est_labor", "wr.est_labor_hours",
                            "wr.cost_est_tools", "wr.cost_est_parts" }).addQuery(
                                calculateWrTotalCostEstimates);
        wrTotalCostCalculateDS.setApplyVpaRestrictions(false);
        wrTotalCostCalculateDS.executeUpdate();

    }

    /**
     * Update some fields of all generated work orders
     *
     */
    public void updateWorkOrders() {

        final String updateWorkOrders =
                " UPDATE wo SET wo.priority = "
                        + "         ( SELECT MAX(wr.priority) FROM wr WHERE wr.wo_id = wo.wo_id),  "
                        + "     wo.cost_estimated= "
                        + "         ( SELECT sum(wr.cost_est_total) From wr  WHERE wr.wo_id= wo.wo_id )  "
                        + " WHERE wo.wo_id>=" + this.startWoId + " and wo.wo_id<=" + this.endWoId;
        final DataSource woUpdateDS =
                DataSourceFactory.createDataSourceForFields("wo",
                    new String[] { "priority", "cost_estimated" }).addQuery(updateWorkOrders);
        woUpdateDS.setApplyVpaRestrictions(false);
        woUpdateDS.executeUpdate();
    }

    /**
     * Update activity log id to all generated work requests
     *
     */
    public void updateWorkRequests() {

        final String updateWorkRequests =
                " UPDATE wr SET wr.activity_log_id= "
                        + "          ( SELECT activity_log.activity_log_id From activity_log  WHERE activity_log.wo_id= wr.wo_id )  "
                        + "WHERE  wr.wr_id>= " + this.startWrId + "      AND wr.wr_id<= "
                        + this.endWrId;

        final DataSource wrUpdateDS =
                DataSourceFactory.createDataSourceForFields("wr",
                    new String[] { "activity_log_id" }).addQuery(updateWorkRequests);
        wrUpdateDS.setApplyVpaRestrictions(false);
        wrUpdateDS.executeUpdate();
    }

    private void createWorkRequestParts() {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Check if upgrade to multiple warehouse
        final String isUseMultipleWH =
                EventHandlerBase.getActivityParameterString(context, "AbBldgOpsOnDemandWork",
                        "UseBldgOpsConsole");
        String insertWrptSql = "";

        if ("1".equals(isUseMultipleWH)) {
            insertWrptSql =
                    " INSERT INTO wrpt ( wr_id, pt_store_loc_id,date_assigned, time_assigned,  part_id, qty_estimated, status ) "
                            + " select wr.wr_id,pms.pt_store_loc_id, wr.date_assigned, ${sql.currentTime}, "
                            + " pmpspt.part_id, pmpspt.qty_required "
                            + ", 'NI' "
                            + "from wr     left outer join pmsd on pmsd.pms_id=wr.pms_id and pmsd.date_todo=wr.date_assigned "
                            + "            left outer join pms on pms.pms_id=pmsd.pms_id "
                            + "            left outer join pmp on pms.pmp_id=pmp.pmp_id "
                            + "            left outer join pmps on pms.pmp_id=pmps.pmp_id and LTRIM(RTRIM(pmps.instructions))= LTRIM(RTRIM(wr.description)) "
                            + "            left outer join pmpspt on pmps.pmp_id=pmpspt.pmp_id and pmps.pmps_id=pmpspt.pmps_id "
                            + "            left outer join pt on pmpspt.part_id=pt.part_id "
                            + "where pmpspt.part_id is not null and wr.wr_id>="
                            + this.startWrId
                            + "      AND wr.wr_id<=" + this.endWrId;
        } else {
            insertWrptSql =
                    " INSERT INTO wrpt ( wr_id,date_assigned, time_assigned,  part_id, qty_estimated, status ) "
                            + " select wr.wr_id, wr.date_assigned, ${sql.currentTime}, "
                            + " pmpspt.part_id, pmpspt.qty_required "
                            + ", 'NI' "
                            + "from wr     left outer join pmsd on pmsd.pms_id=wr.pms_id and pmsd.date_todo=wr.date_assigned "
                            + "            left outer join pms on pms.pms_id=pmsd.pms_id "
                            + "            left outer join pmp on pms.pmp_id=pmp.pmp_id "
                            + "            left outer join pmps on pms.pmp_id=pmps.pmp_id and LTRIM(RTRIM(pmps.instructions))= LTRIM(RTRIM(wr.description)) "
                            + "            left outer join pmpspt on pmps.pmp_id=pmpspt.pmp_id and pmps.pmps_id=pmpspt.pmps_id "
                            + "            left outer join pt on pmpspt.part_id=pt.part_id "
                            + "where pmpspt.part_id is not null and wr.wr_id>=" + this.startWrId
                            + "      AND wr.wr_id<=" + this.endWrId;
        }

        final DataSource wrptDS =
                DataSourceFactory.createDataSourceForFields("wrpt",
                    new String[] { "wrpt.wr_id", "wrpt.part_id" }).addQuery(insertWrptSql);
        wrptDS.setApplyVpaRestrictions(false);
        wrptDS.executeUpdate();

        this.reserveParts();

    }

    private void createWorkRequestTools() {

        final String insertWrttSql =
                " INSERT INTO wrtt ( wr_id, date_assigned, time_assigned, tool_type, hours_est ) "
                        + " select wr.wr_id, wr.date_assigned, ${sql.currentTime}, "
                        + " pmpstt.tool_type, pmpstt.hours_req "
                        + "from wr     left outer join pmsd on pmsd.pms_id=wr.pms_id and pmsd.date_todo=wr.date_assigned "
                        + "            left outer join pms on pms.pms_id=pmsd.pms_id "
                        + "            left outer join pmp on pms.pmp_id=pmp.pmp_id "
                        + "            left outer join pmps on pms.pmp_id=pmps.pmp_id and LTRIM(RTRIM(pmps.instructions))= LTRIM(RTRIM(wr.description)) "
                        + "            left outer join pmpstt on pmps.pmp_id=pmpstt.pmp_id and pmps.pmps_id=pmpstt.pmps_id "
                        + "where  pmpstt.tool_type is not null and wr.wr_id>=" + this.startWrId
                        + "       AND wr.wr_id<=" + this.endWrId;

        // SqlUtils.executeUpdate("wrtr", insertWrtrSql);

        final DataSource wrttDS =
                DataSourceFactory.createDataSourceForFields("wrtt",
                    new String[] { "wrtt.wr_id", "wrtt.tool_type" }).addQuery(insertWrttSql);
        wrttDS.setApplyVpaRestrictions(false);
        wrttDS.executeUpdate();

    }

    private void createWorkRequestTrades() {

        final String insertWrtrSql =
                " INSERT INTO wrtr ( wr_id, date_assigned, time_assigned, tr_id, hours_est ) "
                        + " select wr.wr_id, wr.date_assigned, ${sql.currentTime}, "
                        + " pmpstr.tr_id, pmpstr.hours_req "
                        + "from wr     left outer join pmsd on pmsd.pms_id=wr.pms_id and pmsd.date_todo=wr.date_assigned "
                        + "            left outer join pms on pms.pms_id=pmsd.pms_id "
                        + "            left outer join pmp on pms.pmp_id=pmp.pmp_id "
                        + "            left outer join pmps on pms.pmp_id=pmps.pmp_id and LTRIM(RTRIM(pmps.instructions))= LTRIM(RTRIM(wr.description)) "
                        + "            left outer join pmpstr on pmps.pmp_id=pmpstr.pmp_id and pmps.pmps_id=pmpstr.pmps_id "
                        + "where not exists(select 1 from wrtr a where a.wr_id = wr.wr_id and a.tr_id = pmpstr.tr_id) and pmpstr.tr_id is not null and wr.wr_id>=" + this.startWrId
                        + "      AND wr.wr_id<=" + this.endWrId;

        // SqlUtils.executeUpdate("wrtr", insertWrtrSql);

        final DataSource wrtrDS =
                DataSourceFactory.createDataSourceForFields("wrtr",
                    new String[] { "wrtr.wr_id", "wrtr.tr_id" }).addQuery(insertWrtrSql);
        wrtrDS.setApplyVpaRestrictions(false);
        wrtrDS.executeUpdate();

    }

    private String constructKeyForFindSlaResponse(final DataRecord wrRecord, final String pmpId,
            final String siteId) {
        String keyStr = pmpId + (siteId == null ? "null" : siteId);
        keyStr += wrRecord.getString("wr.bl_id") == null ? "null" : wrRecord.getString("wr.bl_id");
        keyStr += wrRecord.getString("wr.fl_id") == null ? "null" : wrRecord.getString("wr.fl_id");
        keyStr += wrRecord.getString("wr.rm_id") == null ? "null" : wrRecord.getString("wr.rm_id");

        final String eqId = wrRecord.getString("wr.eq_id");

        final JSONObject fieldsValue = new JSONObject();
        fieldsValue.put("activity_type", PM_ACTIVITY_TYPE);
        fieldsValue.put("prob_type", PM_PROB_TYPE);
        fieldsValue.put("pmp_id", pmpId);

        // For kb#3024571, change code to include location fields even for equipment procedure.
        fieldsValue.put("site_id", siteId);
        fieldsValue.put("bl_id", wrRecord.getString("wr.bl_id"));
        fieldsValue.put("fl_id", wrRecord.getString("wr.fl_id"));
        fieldsValue.put("rm_id", wrRecord.getString("wr.rm_id"));
        if (StringUtil.notNullOrEmpty(eqId)) {
            keyStr += eqId;

            final DataRecord eqRecord = this.cacheEquipments.get(eqId);
            if (eqRecord != null) {
                keyStr +=
                        eqRecord.getString("eq.eq_std") == null ? "null" : eqRecord
                                .getString("eq.eq_std");
            }
        }

        return keyStr;
    }

    /**
     * While running the scheduling or WO generation routine - to add the problem type of PREVENTIVE
     * MAINT if it doesn't exist.
     *
     * By Zhang Yi
     */
    private void addProblemTypeForPM() {

        final DataSource probDS =
                DataSourceFactory.createDataSourceForFields("probtype", new String[] { "prob_type",
                        "hierarchy_ids", "description", "prob_class" });

        if (probDS.getRecord(" prob_type='PREVENTIVE MAINT' ") == null) {

            final DataRecord record = probDS.createNewRecord();
            record.setValue("probtype.prob_type", "PREVENTIVE MAINT");
            record.setValue("probtype.hierarchy_ids", "PREVENTIVE MAINT|");
            record.setValue("probtype.description", "Preventive Maintenance");
            record.setValue("probtype.prob_class", "OD");

            probDS.saveRecord(record);
        }
    }
}
