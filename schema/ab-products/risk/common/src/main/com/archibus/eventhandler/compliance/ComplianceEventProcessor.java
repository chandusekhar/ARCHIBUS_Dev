package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Helper Classes for Compliance Event related business logic.
 *
 *
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceEventProcessor extends JobBase {

    /**
     * DataSource of Compliance Event( table: activity_log ).
     *
     */
    private final DataSource activityLogDs;

    /**
     * DataSource of Compliance Locations( table: compliance_locations ).
     *
     */
    private final DataSource dsComplianceLocations;

    /**
     * DataSource of Compliance Location Assignments( table: regloc ).
     *
     */
    private final DataSource dsRegloc;

    /**
     * ComplianceEventFiller Object.
     *
     */
    private final ComplianceEventFiller filler;

    /**
     * ComplianceEventFiller Object.
     *
     */
    private final ComplianceNotifyProcessor notifyProcessor;

    /**
     * Constructor.
     *
     */
    public ComplianceEventProcessor() {
        super();

        this.dsRegloc =
                DataSourceFactory.createDataSourceForFields("regloc", new String[] {
                        Constant.LOCATION_ID, "event_offset", Constant.REGULATION,
                        Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });

        this.dsComplianceLocations =
                DataSourceFactory.createDataSourceForFields("compliance_locations", new String[] {
                        Constant.LOCATION_ID, "site_id", "pr_id", "bl_id", "fl_id", "rm_id",
                "eq_id" });

        this.activityLogDs = ComplianceUtility.getDataSourceEvent();

        this.filler = new ComplianceEventFiller();

        this.notifyProcessor = new ComplianceNotifyProcessor();

    }

    /**
     * delete existed events and notifications.
     *
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement compliance requirement id
     * @param replace sign indicate if replace current eixsted events and notifications
     *
     *            Justification: Case#2.3 : Statement with DELETE ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void deleteEventsAndNotifications(final String regulation, final String program,
            final String requirement, final boolean replace) {

        final String isReplaceAll = replace ? " 1=1 " : " 1=0 ";

        // Construct event restriction
        final StringBuilder eventRes = new StringBuilder();
        eventRes
        .append(" activity_log.regulation=${parameters['regulation']} AND activity_log.reg_program=${parameters['reg_program']}  ");
        eventRes
        .append(" AND activity_log.reg_requirement=${parameters['reg_requirement']} AND activity_log.date_scheduled >${sql.currentDate} ");
        eventRes.append(" AND activity_log.status='SCHEDULED' AND (activity_log.hcm_labeled=0 OR ");
        eventRes.append(isReplaceAll);
        eventRes.append(" )");

        // 1. delete notifications associated with events restricted by above restriction
        final StringBuilder deleteSql1 = new StringBuilder();
        deleteSql1
        .append("  DELETE FROM notifications WHERE exists( select 1 from activity_log where activity_log.activity_log_id = notifications.activity_log_id and ");
        deleteSql1.append(eventRes).append(")");
        executeSqlWithEventRestriction(Constant.NOTIFICATIONS, deleteSql1, regulation, program,
            requirement);

        // 2. clear foreign key activity_log_id of docs_assigned associated with events restricted
        // by above restriction
        final StringBuilder clearSql1 = new StringBuilder();
        clearSql1
        .append(" UPDATE docs_assigned SET activity_log_id=NULL WHERE EXISTS( select 1 from activity_log where activity_log.activity_log_id = docs_assigned.activity_log_id and ");
        clearSql1.append(eventRes).append(") ");
        executeSqlWithEventRestriction(Constant.DOCS_ASSIGNED, clearSql1, regulation, program,
            requirement);

        // 3. clear foreign key activity_log_id of ls_comm associated with events restricted by
        // above restriction
        final StringBuilder clearSql2 = new StringBuilder();
        clearSql2
        .append(" UPDATE ls_comm SET activity_log_id=NULL WHERE EXISTS(  select 1 from activity_log where activity_log.activity_log_id = ls_comm.activity_log_id and ");
        clearSql2.append(eventRes).append(" ) ");
        executeSqlWithEventRestriction(Constant.LS_COMM, clearSql2, regulation, program,
            requirement);

        // 4. delete events restricted by above restriction
        final StringBuilder deleteSql2 = new StringBuilder();
        deleteSql2.append(" DELETE FROM activity_log WHERE ");
        deleteSql2.append(eventRes).toString();
        executeSqlWithEventRestriction(Constant.ACTIVITY_LOG, deleteSql2, regulation, program,
            requirement);
    }

    /**
     * set proper SQL parameter values and then execute the SQL.
     *
     * @param table on which the batch SQL will run
     * @param sql batch update SQL
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement compliance requirement id
     *
     */
    private static void executeSqlWithEventRestriction(final String table, final StringBuilder sql,
            final String regulation, final String program, final String requirement) {

        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(table,
                    new String[] { Constant.ACTIVITY_LOG_ID });

        dataSource.addQuery(sql.toString());

        dataSource.addParameter(Constant.REG_REQUIREMENT, "", DataSource.DATA_TYPE_TEXT);
        dataSource.addParameter(Constant.REG_PROGRAM, "", DataSource.DATA_TYPE_TEXT);
        dataSource.addParameter(Constant.REGULATION, "", DataSource.DATA_TYPE_TEXT);
        dataSource.setParameter(Constant.REG_REQUIREMENT, requirement);
        dataSource.setParameter(Constant.REG_PROGRAM, program);
        dataSource.setParameter(Constant.REGULATION, regulation);
        dataSource.executeUpdate();
    }

    /**
     * This WFR takes a list of Compliance Event IDs (activity_log.activity_log_id) and a list of
     * field-value pairs to update all specified activity_log records with the specified values.
     *
     * @param events List of activity_log
     * @param values JSONObject of field's name-value pairs
     */
    public void updateEvents(final JSONArray events, final DataRecord values) {

        final String[] fieldNames =
                EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                    Constant.ACTIVITY_LOG);
        final DataSource eventDs =
                DataSourceFactory.createDataSourceForFields(Constant.ACTIVITY_LOG, fieldNames);

        for (int i = 0; i < events.length(); i++) {

            final DataRecord eventRecord =
                    eventDs.getRecord(" activity_log.activity_log_id=" + events.getInt(i));
            for (final DataValue value : values.getFields()) {
                if (StringUtil.notNullOrEmpty(value.getNeutralValue())) {
                    eventRecord.setValue(value.getName(), value.getValue());
                }
            }
            eventDs.saveRecord(eventRecord);
        }

    }

    /**
     * Takes a Compliance Requirement record (regrequirement.reg_requirement) and generates or
     * regenerates the scheduled events in activity_log according to the recurrence pattern and
     * other settings in the Requirement record.
     *
     * Generate events for given date, requirement record and program record; meanwhile create
     * notifications when createNotify is true.
     *
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * @param replace sign indicates if to replace all existed events, 0/1
     * @param notify sign indicates if to generate notifications, 0/1
     *
     */
    public void generateEvents(final String regulation, final String program,
            final String requirement, final boolean replace, final Integer notify) {

        boolean createNotify =
                ComplianceUtility
                .loadBooleanActivityParameter(Constant.ACTIVITY_PARAMETER_CREATENOTIFICATIONS);
        if (createNotify && notify == 1) {
            createNotify = true;
        } else {
            createNotify = false;
        }

        final DataRecord regRequirement =
                ComplianceUtility.getDataSourceRequirement().getRecord(
                    " regrequirement.reg_requirement= '" + requirement
                    + "' and regrequirement.regulation='" + regulation
                    + "' and regrequirement.reg_program='" + program + "'  ");

        final DataRecord regProgram =
                ComplianceUtility.getDataSourceProgram().getRecord(
                    " regprogram.regulation= '" + regulation + "' and regprogram.reg_program='"
                            + program + "'   ");

        final ParsedRestrictionDef reglocRestriction = new ParsedRestrictionDef();
        reglocRestriction.addClause(Constant.REGLOC, Constant.REGULATION, regulation,
            Operation.EQUALS);
        reglocRestriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM, program,
            Operation.EQUALS);
        reglocRestriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT, requirement,
            Operation.EQUALS);

        if (regRequirement != null && regProgram != null) {

            final Object[] result =
                    this.createComplianceEvents(regRequirement, regProgram, reglocRestriction,
                        createNotify, replace);
            final JSONObject json = new JSONObject();
            json.put("count", result[0]);
            json.put("hasPastDate", result[1]);
            // set return result
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            context.setResponse(json);
        }

    }

    /**
     * Generate events for given date, requirement record and program record; meanwhile create
     * notifications when createNotify is true.
     *
     * @param regRequirement Compliance Requirement Record
     * @param regProgram Compliance Program Record
     * @param reglocRestriction restriction composed of regulation code, rogram code and requirement
     *            code for querying regloc records
     * @param createNotify boolean value of activity parameter "createNotifications"
     * @param replace sign indicates if to replace all existed events, 0/1
     *
     * @return count and pastDate sign of generated events
     */
    private Object[] createComplianceEvents(final DataRecord regRequirement,
            final DataRecord regProgram, final ParsedRestrictionDef reglocRestriction,
            final boolean createNotify, final boolean replace) {

        int count = 0;

        // 1. Remove all future event occurrences and associated notifications
        deleteEventsAndNotifications(regRequirement.getString(Constant.REGREQUIREMENT_REGULATION),
            regRequirement.getString(Constant.REGREQUIREMENT_REG_PROGRAM),
            regRequirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT), replace);
        
        // DateStart = date_initial OR today(), whichever is greater (i.e. if date_initial >=
        // today, DateStart=date_initial, else DateStart=today). This means do not generate
        // events in the past.
        Date lastCompletionDateOfFirstRound =
                regRequirement
                .getDate(Constant.REGREQUIREMENT + Constant.DOT + Constant.DATE_START);
        final Date dateInitial =
                regRequirement.getDate(Constant.REGREQUIREMENT + Constant.DOT
                    + Constant.DATE_INITIAL);

        if (dateInitial != null) {
            lastCompletionDateOfFirstRound = dateInitial;
        }

        // kb 3037289 - Compare dates without times
        final Date todayWithZeroTime = ComplianceUtility.getDateWithoutTime(new Date());
        if (!lastCompletionDateOfFirstRound.after(todayWithZeroTime)) {
            lastCompletionDateOfFirstRound = todayWithZeroTime;
        }
        
        final int eventDuration =
                regRequirement.getInt(Constant.REGREQUIREMENT + Constant.DOT
                    + Constant.EVENT_DURATION);
        final Calendar eventCal = Calendar.getInstance();
        eventCal.setTime(lastCompletionDateOfFirstRound);
        eventCal.add(Calendar.DAY_OF_MONTH, eventDuration - 1);
        
        lastCompletionDateOfFirstRound = eventCal.getTime();
        
        // DateEnd = date_recurrence_end (but if date_recurrence_end is NULL, then DateEnd =
        // date_end.
        final Date dataRecurrenceEnd =
                regRequirement.getDate(Constant.REGREQUIREMENT + Constant.DOT
                    + Constant.DATE_RECURRENCE_END);
        Date dataEnd =
                regRequirement.getDate(Constant.REGREQUIREMENT + Constant.DOT + Constant.DATE_END);
        dataEnd = dataRecurrenceEnd == null ? dataEnd : dataRecurrenceEnd;

        // 2. Call the generateRecurringSchedules(recurrence_rule, DateStart, DateEnd) WFR to
        // get a list of dates on which to schedule the events.
        final RecurringScheduleService recurringService = new RecurringScheduleService();
        final String recurringRule =
                regRequirement.getString(Constant.REGREQUIREMENT + Constant.DOT
                    + Constant.RECURRING_RULE);
        final List<Date> dates =
                recurringService.getDatesList(lastCompletionDateOfFirstRound, dataEnd,
                    recurringRule);

        // 3. For each date in the list returned by WFR above (nextDate), create activity_log
        // record(s) as follows
        for (final Date date : dates) {
            count =
                    count
                    + this.createEvent(regRequirement, regProgram, reglocRestriction,
                        createNotify, date);

        }

        return new Object[] { count, this.filler.isHadPastDate() };
    }

    /**
     * Create activity log records for specified requirement and date.
     *
     * @param requirement compliance requirement record
     * @param program Compliance Program record
     * @param reglocRestriction restriction composed of regulation code, rogram code and requirement
     *            code for querying regloc records
     * @param createNotify boolean value of activity parameter "createNotifications"
     * @param date date
     *
     * @return count of created activity log records
     */
    private int createEvent(final DataRecord requirement, final DataRecord program,
            final ParsedRestrictionDef reglocRestriction, final boolean createNotify,
            final Date date) {

        int count = 0;

        final int scheLoc = requirement.getInt("regrequirement.sched_loc");

        if (scheLoc == 0) {
            // If regrequirement.sched_loc=0, create one record for requirement.
            this.createSingleEvent(requirement, program, date, createNotify);
            count++;

        } else {
            // kb#3046860:generate compliance events for more locations than the recordLimi.
            this.dsRegloc.setMaxRecords(0);
            // Else if regrequirement.sched_loc=1, create one event record for each regloc record
            // where regloc.regulation,reg_program,reg_requirement =
            // regulation,reg_program,reg_requirement.
            final List<DataRecord> regLocs = this.dsRegloc.getRecords(reglocRestriction);
            count += regLocs.size();
            for (final DataRecord record : regLocs) {

                // �If this is for a regloc record (sched_loc=1), nextDate = nextDate +
                // event_offset;
                final Date locDate = (Date) date.clone();
                locDate.setTime(date.getTime() + record.getInt("regloc.event_offset")
                    * Constant.MILLSECONDS);

                final DataRecord activityLog =
                        this.createSingleEvent(requirement, program, locDate, createNotify);

                this.filler.fillRegLocInformationToEvent(
                    this.dsComplianceLocations.getRecord(Constant.LOCATION_ID + "="
                            + record.getInt("regloc.location_id")), activityLog);

                this.activityLogDs.updateRecord(activityLog);
            }
        }
        return count;
    }

    /**
     * @return new saved event record.
     *
     * @param requirement compliance requirement record
     * @param program Compliance Program record
     * @param date date
     * @param createNotify boolean value of activity parameter "createNotifications"
     */
    private DataRecord createSingleEvent(final DataRecord requirement, final DataRecord program,
            final Date date, final boolean createNotify) {

        final DataRecord event = this.activityLogDs.createNewRecord();

        // fill basic information
        this.filler.fillBasicInfoToEvent(requirement, event);

        // fill date field values
        this.filler.fillDateValuesToEvent(requirement, date, event);

        // fill information constructed from requirement and program
        this.filler.fillRequirementInfoToEvent(requirement, program, event);

        // since API saveRecord() only return reocrd with pk fields, so below have to set saved pk
        // values to original record
        final DataRecord savedRecord = this.activityLogDs.saveRecord(event);

        if (savedRecord != null && savedRecord.getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID) != 0) {
            event.setValue(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID,
                savedRecord.getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID));

            if (createNotify) {
                this.notifyProcessor.createNotifications(String.valueOf(savedRecord
                    .getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID)));
            }
        }

        return event;
    }

}
