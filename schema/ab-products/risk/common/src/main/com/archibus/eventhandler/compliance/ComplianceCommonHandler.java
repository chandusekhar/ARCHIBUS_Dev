package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.*;

/**
 * Compliance Common Handler.
 *
 * Justification: This class contains all public Workflow rule entries. It need to contain all entry
 * WFR methods and reference to actual methods
 *
 * @author ASC-BJ:Zhang Yi
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class ComplianceCommonHandler extends JobBase {
    // CHECKSTYLE:ON

    /**
     * This WFR is just an interface method for ComplianceLevelCalculator.calculateCompLevel. It is
     * used in the afm_wf_rules entry for scheduling.
     *
     */
    public static void calculateComplianceLevels() {
        ComplianceLevelCalculator.calculateCompLevel();
    }

    /**
     * This WFR takes a Compliance Event ID (activity_log.activity_log_id) and creates records in
     * notifications table using the settings in regnotify table for the Event�s Requirement or
     * Program.
     *
     * @param eventId Activity Log ID
     */
    public static void createNotifications(final String eventId) {

        // KB#3036301: check value of ACTIVITY PARAMETER createNotifications .
        // If not equal to 1, then do not create any notifications.
        final boolean createNotify =
                ComplianceUtility
                .loadBooleanActivityParameter(Constant.ACTIVITY_PARAMETER_CREATENOTIFICATIONS);

        if (createNotify) {

            new ComplianceNotifyProcessor().createNotifications(eventId);
        }

    }

    /**
     * This WFR is just an interface method for ComplianceSqlHelper.toggleNotifications.
     *
     * @param regulation regulation
     * @param program reg_program
     * @param requirement reg_requirement
     * @param isActive table requirement field is_active
     */
    public static void toggleNotifications(final String regulation, final String program,
            final String requirement, final int isActive) {

        ComplianceSqlHelper.toggleNotifications(regulation, program, requirement, isActive);

    }

    /**
     * This WFR assigns selected templates to activity defaults, programs, or requirements.
     *
     * @param templates List of notification template ids
     * @param assignTo String : assignTo is �requirement? if pkey is a reg_requirement, �program? if
     *            pkey is a reg_program, and NULL if pkey is NULL Activity Log ID
     * @param key key value
     */
    public void assignNotifyTemplates(final List<String> templates, final String assignTo,
            final Map<String, String> key) {

        new ComplianceNotifyProcessor().assignNotifyTemplates(templates, assignTo, key);

    }

    /**
     * This WFR checks to make sure that a new Compliance Location (regloc table) record (before
     * saving) is not a duplicate of an existing record.
     *
     * @param record one of Compliance Regulation/Compliance Program/Compliance Requirement, use
     *            only field name( no table name ) as keys in JSON object.
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * @param locationId -1 if new record, or PK of existing record
     */
    public void chkDupLocations(final JSONObject record, final JSONObject location,
            final String type, final Integer locationId) {

        final ComplianceLocationProcessor helper = new ComplianceLocationProcessor();

        helper.checkOrReturnDuplicateLocations(record, location, type, locationId);

    }

    /**
     * This WFR is just an interface method for ComplianceSqlHelper.cleanUpLocations. It is used in
     * the afm_wf_rules entry for scheduling.This Schedule WFR is to delete unused or empty
     * compliance_locations records.
     *
     */
    public void cleanUpLocations() {

        ComplianceSqlHelper.cleanUpLocations();

    }

    /**
     * This WFR takes a list of locations and a list of regulations, programs, and/or requirements
     * and creates records in table regloc.
     *
     * @param regulations List of Regulation for Compliance Program
     * @param programs List of Compliance Program Code
     * @param requirments List of Compliance Requirements
     * @param locations JSONObject contains lists of Country Code, Region Code, State Code, City
     *            Code, County Code, Site Code, Property Code, Building Code, Floor Code, Room Code,
     *            Equipment Code, Equipment Standard, Employee Code.
     */
    public void createComplianceLocations(final JSONArray regulations, final JSONArray programs,
            final JSONArray requirments, final JSONObject locations) {

        new ComplianceLocationProcessor().createComplianceLocations(regulations, programs,
            requirments, locations);

    }

    /**
     * This WFR assigns selected templates to activity defaults, programs, or requirements.
     *
     * @param templates List of notification template ids
     * @param records list of records of requirement or programs
     * @param assignTo assignTo is �requirement? if pkey is a reg_requirement, �program? if pkey is
     *            a reg_program
     */
    public void createNotifyTemplateAssignments(final List<String> templates,
            final JSONArray records, final String assignTo) {

        new ComplianceNotifyProcessor().createNotifyTemplateAssignments(templates, records,
            assignTo);

    }

    /**
     * If any compliance location field is changed, call locid = createOrUpdateLocation(existing
     * location_id, compliance_locations record CL, reg/prog/req record RL) WFR.
     *
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param locationId location id.
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     *
     */
    public void createOrUpdateLocation(final JSONObject location, final Integer locationId,
            final String regulation, final String program, final String requirement) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(Constant.JSON_EXPRESSION, String
            .valueOf(new ComplianceLocationProcessor().createOrUpdateLocation(location, locationId,
                regulation, program, requirement)));
    }

    /**
     * This WFR takes a Compliance Requirement record (regrequirement.reg_requirement) that is to be
     * deleted and removes all associated future events and notifications.
     *
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     *
     */
    public void deleteComplianceCleanup(final String regulation, final String program,
            final String requirement) {

        new ComplianceRequirementProcessor().deleteComplianceRequirement(regulation, program,
            requirement);
    }

    /**
     * This WFR will delete compliance_locations record by location_id.
     *
     * @param locationId location id.
     * @param limit count limit used to check if delete given location.
     *
     */
    public void deleteLocation(final Integer locationId, final Integer limit) {
        new ComplianceLocationProcessor().deleteLocation(locationId, limit);
    }

    /**
     * This WFR will delete compliance_locations records by location_id list .
     *
     * @param locationIds location id list.
     *
     */
    public void deleteLocations(final List<Integer> locationIds) {
        new ComplianceLocationProcessor().deleteLocations(locationIds);
    }

    /**
     * This WFR takes a Compliance Event ID (activity_log.activity_log_id) and creates records in
     * notifications table using the settings in regnotify table for the Event�s Requirement or
     * Program.
     *
     * @param eventId Activity Log ID
     *
     */
    public void deleteNotifications(final String eventId) {

        ComplianceSqlHelper.deleteNotificationsByEvent(eventId);

    }

    /**
     * This WFR takes a Compliance Requirement record (regrequirement.reg_requirement) and generates
     * or regenerates the scheduled events in activity_log according to the recurrence pattern and
     * other settings in the Requirement record.
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

        new ComplianceEventProcessor().generateEvents(regulation, program, requirement, replace,
            notify);

    }

    /**
     * This WFR will take and construct some field values for event record from Compliance
     * Requirement record.
     *
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * @param event record
     *
     */
    public void setEventRecordByRequirement(final String regulation, final String program,
            final String requirement, final DataRecord event) {

        new ComplianceEventFiller().fillRequirementInfoToEvent(regulation, program, requirement,
            event);

    }

    /**
     * Update Regulation, Program, Requirement and Location ID of event's associated docs_assigned
     * and communication logs when saving an event record in ab-comp-event-all-edit as soon as
     * event's Requirement PK or Location ID is changed.
     *
     *
     * @param eventId activity_log id
     * @param regulation Regulation Code
     * @param program Program Code
     * @param requirement Requirement Code
     * @param locId Location ID
     *
     */
    public void updateDocAndLogByEvent(final String eventId, final String regulation,
            final String program, final String requirement, final String locId) {

        ComplianceSqlHelper
        .updateDocAndLogByEvent(eventId, regulation, program, requirement, locId);
    }

    /**
     * This WFR takes a list of Compliance Event IDs (activity_log.activity_log_id) and a list of
     * field-value pairs to update all specified activity_log records with the specified values.
     *
     * @param events List of activity_log
     * @param values JSONObject of field's name-value pairs
     */
    public void updateEvents(final JSONArray events, final DataRecord values) {

        new ComplianceEventProcessor().updateEvents(events, values);

    }
    
    /**
     * This WFR assign a list of Procedures to a single Compliance Requirement.
     *
     * Added for 22.1 Compliance Bldgops Integration, by Zhang Yi.
     *
     * @param requirement JSONObject of field's name-value pairs
     * @param procedures List of Procedures
     */
    public void assignProceduresToRequirement(final JSONObject requirement,
            final JSONArray procedures) {

        new ComplianceProcedureProcessor().assignProcedures(requirement, procedures);

    }

    /**
     * This scheduled workflow rule will check on the status of all PM Schedules linked to active
     * events, and update event status based on status of its associated PM Schedules.
     *
     * Added for 22.1 Compliance Bldgops Integration, by Zhang Yi.
     *
     */
    public void updateEventStatusFromPM() {

        ComplianceEventStatusUpdate.update();

    }
    
    /**
     * This workflow rule will create a batch of service requests for the given event records and
     * service request value user input.
     *
     * Added for 22.1 Compliance Bldgops Integration, by Zhang Yi.
     *
     * @param eventIDs JSONArray selected events require creating service request
     * @param requestRecord DataRecord service request record with values user enter
     */
    public void createServiceRequests(final JSONArray eventIDs, final DataRecord requestRecord) {

        new ComplianceServiceRequestGenerator().createServiceRequests(eventIDs, requestRecord,
            this.status);

    }

    /**
     * Copy selected child items (programs, requirements, locations, notify templates, events,
     * notifications) from one regulation, program, or requirement to another
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param fromProgram Source Program Code
     * @param fromRequirement Source Requirement Code
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     * @param toRequirement Destination Requirement Code
     * @param config Selected Items and Options for copy
     *
     */
    public void copyChildComplianceRecords(final String fromRegulation, final String fromProgram,
            final String fromRequirement, final String toRegulation, final String toProgram,
            final String toRequirement, final Map<String, Object> config) {

        ComplianceSqlHelper.copyChildComplianceRecords(fromRegulation, fromProgram,
            fromRequirement, toRegulation, toProgram, toRequirement, config);
    }

}
