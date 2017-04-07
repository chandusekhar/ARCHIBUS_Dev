package com.archibus.eventhandler.compliance;

import java.util.Map;

import org.json.JSONArray;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 * Compliance Helper Class contains all workflow rule methods using SQL.
 *
 *
 * @author ASC-BJ:Zhang Yi
 *
 *         Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings({ "PMD.AvoidUsingSql", "PMD.ConfusingTernary" })
public final class ComplianceSqlHelper {
    
    /**
     * Constructor.
     *
     */
    private ComplianceSqlHelper() {
    }
    
    /**
     * Delete unused or empty compliance_locations records.
     *
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void cleanUpLocations() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" DELETE FROM compliance_locations WHERE ");
        sql.append(" NOT EXISTS (select 1 from activity_log ");
        sql.append("    WHERE activity_log.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from regloc ");
        sql.append("    WHERE regloc.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from regviolation ");
        sql.append("    WHERE regviolation.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from docs_assigned ");
        sql.append("    WHERE docs_assigned.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from ls_comm ");
        sql.append("    WHERE ls_comm.location_id=compliance_locations.location_id )");
        
        SqlUtils.executeUpdate(Constant.COMPLIANCE_LOCATIONS, sql.toString());
    }
    
    /**
     * Takes a String format restriction to activity_log and delete all matched activity_log
     * records.
     *
     * @param restriction SQL restriction to deleted activity_logs
     *
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteEvents(final String restriction) {
        
        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, " DELETE FROM activity_log WHERE "
                + restriction);
    }
    
    /**
     * Takes a String format restriction to notifications and delete all matched notifications
     * records.
     *
     * @param restriction SQL restriction to deleted notifications
     *
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteNotifications(final String restriction) {
        
        SqlUtils
        .executeUpdate(
            Constant.NOTIFICATIONS,
            " DELETE FROM notifications WHERE EXISTS (SELECT 1 FROM activity_Log where activity_log.activity_log_id=notifications.activity_log_id and "
                    + restriction + ")");
    }
    
    /**
     * This WFR takes a Compliance Event ID (activity_log.activity_log_id) and creates records in
     * notifications table using the settings in regnotify table for the Event�s Requirement or
     * Program.
     *
     * @param eventId Activity Log ID
     *
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteNotificationsByEvent(final String eventId) {
        
        SqlUtils.executeUpdate(Constant.NOTIFICATIONS,
            " DELETE FROM notifications WHERE notifications.activity_log_id=" + eventId);
    }
    
    /**
     * Takes a String format restriction to regloc and delete all matched regloc records.
     *
     * @param restriction SQL restriction to deleted reglocs
     *
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteReglocs(final String restriction) {
        
        SqlUtils.executeUpdate(Constant.REGLOC, " DELETE FROM regloc WHERE " + restriction);
        
    }
    
    /**
     * @return found existed location id in compliance_locations table.
     *
     * @param restriction restriction String contains clauses from location field values
     *
     *            Justification: Case #1: Statement with subquerys - IN (SElECT ... ) pattern.
     */
    public static int getMaxMatchedCompliancelocId(final String restriction) {
        
        int loctionId =
                DataStatistics.getInt(Constant.COMPLIANCE_LOCATIONS, Constant.LOCATION_ID, "MAX",
                    restriction + " AND  "
                            + " location_id NOT IN (SELECT location_id FROM regloc) ");
        
        if (loctionId <= 0) {
            loctionId = -1;
        }
        
        return loctionId;
    }
    
    /**
     * When assign a template to a program, remove from regnotify all current assignments of the
     * template to any of the program's requirements.
     *
     * @param regulation String Regulation Code
     * @param program String Compliance Program Code
     * @param templateId String Notify Template id
     *
     *            Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    public static void removeRequirementsAssignmentOfProgram(final String regulation,
            final String program, final String templateId) {
        
        // Delete from regnotify rn where rn.regulation=prog.regulation and
        // rn.reg_program=prog.reg_program and rn.reg_requirement is not null and rn.template_id=tid
        
        SqlUtils.executeUpdate(Constant.REGNOTIFY,
            " DELETE  FROM regnotify WHERE reg_requirement is not null and reg_program = '"
                    + program + "'  and regulation = '" + regulation + "' and template_id='"
                    + templateId + "'    ");
    }
    
    /**
     * When assign multiple templates to a program, remove from regnotify all current assignments of
     * the templates to any of the program's requirements.
     *
     * @param regulation String Regulation Code
     * @param program String Compliance Program Code
     * @param templateIds StringBuilder Notify Template id list
     *
     *            Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    public static void removeRequirementsAssignmentOfProgram(final String regulation,
            final String program, final StringBuilder templateIds) {
        
        // Delete from regnotify rn where rn.regulation=prog.regulation and
        // rn.reg_program=prog.reg_program and rn.reg_requirement is not null and rn.template_id in
        // templateIds
        
        SqlUtils.executeUpdate(
            Constant.REGNOTIFY,
            " DELETE FROM regnotify WHERE reg_requirement is not null and reg_program ='" + program
            + "' and regulation = '" + regulation + "' and template_id IN "
            + templateIds.toString() + "  ");
    }
    
    /**
     * This WFR takes a Compliance Requirement (regulation;reg_program;reg_requirement) and turns
     * notifications on/off (notifications.is_active) depending on regrequirement.is_active setting.
     *
     * @param regulation regulation
     * @param program reg_program
     * @param requirement reg_requirement
     * @param isActive table requirement field is_active
     *
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void toggleNotifications(final String regulation, final String program,
            final String requirement, final int isActive) {
        
        // UPDATE notifications, activity_log, regrequirementSET
        // notifications.is_active=regrequirement.is_active
        // WHERE notifications.activity_log_id = activity_log.activity_log_id
        // AND regrequirement.regulation;reg_program;reg_requirement
        // =activity_log.regulation;reg_program;reg_requirement;
        
        String sql = " UPDATE notifications SET notifications.is_active= " + isActive + " WHERE ";
        
        // Do not turn on notifications that have already been sent
        if (isActive == 1) {
            sql += " date_sent IS NULL AND ";
        }
        sql +=
                " EXISTS (select 1 from regrequirement,activity_log "
                        + " WHERE notifications.activity_log_id = activity_log.activity_log_id "
                        + " AND activity_log.regulation = '" + regulation + "' "
                        + " AND activity_log.reg_program = '" + program + "'  "
                        + " AND activity_log.reg_requirement = '" + requirement + "')";
        
        SqlUtils.executeUpdate(Constant.NOTIFICATIONS, sql);
    }
    
    /**
     * Update Regulation, Program, Requirement and Location ID of docs_assigned and communication
     * logs associated to event.
     *
     *
     * @param eventId activity_log id
     * @param regulation Regulation Code
     * @param program Program Code
     * @param requirement Requirement Code
     * @param locId Location ID
     *
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void updateDocAndLogByEvent(final String eventId, final String regulation,
            final String program, final String requirement, final String locId) {
        
        // UPDATE docs_assigned SET reg/prog/req/locid = activity_log.reg/prog/req/locid WHERE
        // docs_assigned.activity_log_id=activity_log.activity_log_id AND
        // docs_assigned.activity_log_id=eventid
        String locIdVal = locId;
        if (!StringUtil.notNullOrEmpty(locId)) {
            locIdVal = "NULL";
        }
        SqlUtils.executeUpdate(Constant.DOCS_ASSIGNED, "UPDATE docs_assigned SET regulation='"
                + regulation + "',  reg_program='" + program + "',  reg_requirement='"
                + requirement + "',  location_id=  " + locIdVal
                + "  WHERE docs_assigned.activity_log_id=" + eventId);
        
        SqlUtils.executeUpdate(Constant.LS_COMM, "UPDATE ls_comm SET regulation='" + regulation
            + "', reg_program='" + program + "', reg_requirement='" + requirement
            + "',  location_id=" + locIdVal + " WHERE ls_comm.activity_log_id=" + eventId);
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
    public static void copyChildComplianceRecords(final String fromRegulation,
            final String fromProgram, final String fromRequirement, final String toRegulation,
            final String toProgram, final String toRequirement, final Map<String, Object> config) {

        // Need at least both a source and destination regulation
        if ("".equals(fromRegulation) || "".equals(toRegulation)) {
            return;
        }

        // Get the child items that the user selected for copying
        final String compItems = ((JSONArray) config.get("compItems")).toString();
        final String compLocations = ((JSONArray) config.get("compLocations")).toString();
        final String compNotifyTemplates =
                ((JSONArray) config.get("compNotifyTemplates")).toString();
        final String compEvents = ((JSONArray) config.get("compEvents")).toString();

        // Copy Programs from one regulation to another
        if (compItems.contains("programs")) {
            copyRegulationPrograms(fromRegulation, toRegulation);
        }
        
        // Copy Requirements from one Program to another, or from one Regulation to another
        if (compItems.contains("requirements")) {
            copyRequirements(fromRegulation, fromProgram, toRegulation, toProgram);
        }

        // Copy Regulation Locations from one Regulation to another
        if (compLocations.contains("regLocations")) {
            copyLocations(fromRegulation, "", "", toRegulation, "", "", Constant.REGULATION);
        }
        // Copy Program Locations from one Program or Regulation to another
        if (compLocations.contains("progLocations")) {
            copyLocations(fromRegulation, fromProgram, "", toRegulation, toProgram, "",
                Constant.REGPROGRAM);
        }
        // Copy Requirement Locations from one Requirement, Program, or Regulation to another
        if (compLocations.contains("reqLocations")) {
            copyLocations(fromRegulation, fromProgram, fromRequirement, toRegulation, toProgram,
                toRequirement, Constant.REGREQUIREMENT);
        }
        
        // Copy Program Notify Templates from one Program or Regulation to another
        if (compNotifyTemplates.contains("progTemplates")) {
            copyNotifyTemplates(fromRegulation, fromProgram, "", toRegulation, toProgram, "",
                Constant.REGPROGRAM);
        }
        // Copy Requirement Notify Templates from one Requirement, Program, or Regulation to another
        if (compNotifyTemplates.contains("reqTemplates")) {
            copyNotifyTemplates(fromRegulation, fromProgram, fromRequirement, toRegulation,
                toProgram, toRequirement, Constant.REGREQUIREMENT);
        }

        if (compEvents.contains("events")) {
            copyEvents(fromRegulation, fromProgram, fromRequirement, toRegulation, toProgram,
                toRequirement);
            if (compEvents.contains("notifications")) {
                copyNotifications(fromRegulation, fromProgram, fromRequirement, toRegulation,
                    toProgram, toRequirement);
            }
        }
        
        advanceDates(toRegulation, toProgram, toRequirement, config);
    }
    
    /**
     * Copy programs from one regulation to another
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param toRegulation Destination Regulation Code
     *
     */
    public static void copyRegulationPrograms(final String fromRegulation, final String toRegulation) {
        
        final String progFields =
                " comp_level, comp_level_calc, comp_level_number_calc, contact_id, criteria, criteria_type, date_end"
                        + ", date_start, description, em_id, hold_reason, priority, project_id, reqs_inherit_locs, status"
                        + ", summary, vn_id, regprog_cat, regprog_type, reg_program";
        
        SqlUtils.executeUpdate(Constant.REGPROGRAM, "INSERT INTO regprogram" + " (" + progFields
            + ", regulation)" + " SELECT" + progFields + ", '" + toRegulation + "'"
            + " FROM regprogram WHERE regulation='" + fromRegulation + "'");
    }

    /**
     * Copy requirements from one regulation or program to another
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param fromProgram Source Program Code
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     *
     */
    public static void copyRequirements(final String fromRegulation, final String fromProgram,
            final String toRegulation, final String toProgram) {

        final Boolean hasProgram = !"".equals(fromProgram) && !"".equals(toProgram);
        
        final String reqFields =
                " citation, comp_level, comp_level_calc, comp_level_number_calc, completion_criteria"
                        + ", contact_id, criteria_type, date_end, date_expire, date_initial, date_recurrence_end"
                        + ", date_required, date_start, description, em_id, event_duration, event_sched_buffer"
                        + ", event_title, hold_reason, notes, notify_active, priority, recurring_rule, sched_loc"
                        + ", status, summary, vn_id, regreq_cat, regreq_type, reg_requirement";

        String sqlStr =
                "INSERT INTO regrequirement" + " (" + reqFields + ", regulation, reg_program)"
                        + " SELECT" + reqFields + ", '" + toRegulation + "'";
        
        if (hasProgram) {
            sqlStr += ", '" + toProgram + "'";
        } else {
            sqlStr += ", reg_program";
        }
        sqlStr += " FROM regrequirement WHERE regulation='" + fromRegulation + "'";
        if (hasProgram) {
            sqlStr += " AND reg_program='" + fromProgram + "'";
        }
        
        SqlUtils.executeUpdate(Constant.REGREQUIREMENT, sqlStr);
    }

    /**
     * Copy compliance locations from one regulation, program, or requirement to another
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param fromProgram Source Program Code
     * @param fromRequirement Source Requirement Code
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     * @param toRequirement Destination Requirement Code
     * @param compLocation Which location type to copy (regulation, program, requirement)
     *
     */
    public static void copyLocations(final String fromRegulation, final String fromProgram,
            final String fromRequirement, final String toRegulation, final String toProgram,
            final String toRequirement, final String compLocation) {
        
        // Get current MAX primary key value of compliance_locations table
        final DataSource dsLoc = DataSourceFactory.createDataSource();
        dsLoc.addTable(Constant.COMPLIANCE_LOCATIONS);
        dsLoc.addQuery("SELECT MAX(location_id) AS location_id FROM compliance_locations",
            SqlExpressions.DIALECT_GENERIC);
        final DataRecord rec = dsLoc.getRecord();
        final String maxLocationId = rec.getFields().get(0).getValue().toString();
        
        String sqlStr1 =
                "INSERT INTO "
                        + Constant.COMPLIANCE_LOCATIONS
                        + " (bl_id, city_id, county_id, ctry_id, em_id, eq_id, eq_std, fl_id, geo_objectid"
                        + ", geo_region_id, lat, lon, pr_id, regn_id, rm_id, site_id, state_id)"
                        + " SELECT"
                        + " bl_id, city_id, county_id, ctry_id, em_id, eq_id, eq_std, fl_id, geo_objectid"
                        + ", geo_region_id, lat, lon, pr_id, regn_id, rm_id, site_id, state_id"
                        + " FROM " + Constant.COMPLIANCE_LOCATIONS + ", " + Constant.REGLOC
                        + " WHERE regloc.location_id=compliance_locations.location_id"
                        + " AND regulation='" + fromRegulation + "'";

        String sqlStr2 =
                "INSERT INTO "
                        + Constant.REGLOC
                        + " (comp_level, comp_level_calc, comp_level_number_calc, description, event_offset"
                        + ", resp_person, vn_id, location_id, regulation, reg_program, reg_requirement)"
                        + " SELECT"
                        + " comp_level, comp_level_calc, comp_level_number_calc, description, event_offset"
                        + ", resp_person, vn_id, ROW_NUMBER() OVER(ORDER BY location_id)+maxLocationId-1"
                        + ", '" + toRegulation + "', XprogramX, XrequirementX" + " FROM "
                        + Constant.REGLOC + " WHERE regulation='" + fromRegulation + "'";

        // Copy requirement locations from one requirement to another
        if (!"".equals(fromRequirement) && !"".equals(toRequirement)) {
            sqlStr1 += " AND reg_program = '" + fromProgram + "'";
            sqlStr1 += " AND reg_requirement = '" + fromRequirement + "'";
            
            sqlStr2 = sqlStr2.replaceAll("XprogramX", "'" + toProgram + "'");
            sqlStr2 = sqlStr2.replaceAll("XrequirementX", "'" + toRequirement + "'");
            sqlStr2 += " AND reg_program = '" + fromProgram + "'";
            sqlStr2 += " AND reg_requirement = '" + fromRequirement + "'";
        } else if (!"".equals(fromProgram) && !"".equals(toProgram)) {
            // Copy program or requirement locations from one program to another
            sqlStr1 += " AND reg_program = '" + fromProgram + "'";
            sqlStr2 = sqlStr2.replaceAll("XprogramX", "'" + toProgram + "'");
            sqlStr2 = sqlStr2.replaceAll("XrequirementX", "reg_requirement");
            sqlStr2 += " AND reg_program = '" + fromProgram + "'";
            if (Constant.REGPROGRAM.equals(compLocation)) {
                sqlStr1 += " AND reg_requirement IS NULL";
                sqlStr2 += " AND reg_requirement IS NULL";
            } else if (Constant.REGREQUIREMENT.equals(compLocation)) {
                sqlStr1 += " AND reg_requirement IS NOT NULL";
                sqlStr2 += " AND reg_requirement IS NOT NULL";
            }
        } else if (!"".equals(fromRegulation) && !"".equals(toRegulation)) {
            // Copy regulation, program, or requirement locations from one regulation to another
            sqlStr2 = sqlStr2.replaceAll("XprogramX", "reg_program");
            sqlStr2 = sqlStr2.replaceAll("XrequirementX", "reg_requirement");
            if (Constant.REGULATION.equals(compLocation)) {
                sqlStr1 += " AND reg_program IS NULL AND reg_requirement IS NULL";
                sqlStr2 += " AND reg_program IS NULL AND reg_requirement IS NULL";
            } else if (Constant.REGPROGRAM.equals(compLocation)) {
                sqlStr1 += " AND reg_program IS NOT NULL AND reg_requirement IS NULL";
                sqlStr2 += " AND reg_program IS NOT NULL AND reg_requirement IS NULL";
            } else if (Constant.REGREQUIREMENT.equals(compLocation)) {
                sqlStr1 += " AND reg_program IS NOT NULL AND reg_requirement IS NOT NULL";
                sqlStr2 += " AND reg_program IS NOT NULL AND reg_requirement IS NOT NULL";
            }
        }

        SqlUtils.executeUpdate(Constant.COMPLIANCE_LOCATIONS, sqlStr1);
        
        dsLoc.addQuery(
            "SELECT MIN(location_id) AS location_id FROM (SELECT location_id FROM compliance_locations"
                    + " WHERE location_id > " + maxLocationId + ") tbl",
            SqlExpressions.DIALECT_GENERIC);
        final Object locationId = dsLoc.getRecord().getFields().get(0).getValue();
        if (locationId != null) {
            final String maxLocationId2 = locationId.toString();
            sqlStr2 = sqlStr2.replaceAll("maxLocationId", maxLocationId2);
            SqlUtils.executeUpdate(Constant.REGLOC, sqlStr2);
        }
        
    }
    
    /**
     * Copy compliance notify templates from one program or requirement to another
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param fromProgram Source Program Code
     * @param fromRequirement Source Requirement Code
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     * @param toRequirement Destination Requirement Code
     * @param compNotifyTemplate Which template type to copy (program, requirement)
     *
     */
    public static void copyNotifyTemplates(final String fromRegulation, final String fromProgram,
            final String fromRequirement, final String toRegulation, final String toProgram,
            final String toRequirement, final String compNotifyTemplate) {

        String sqlStr =
                "INSERT INTO " + Constant.REGNOTIFY
                + " (template_id, is_active, regulation, reg_program, reg_requirement)"
                + " SELECT template_id, is_active, '" + toRegulation + "'"
                + ", XprogramX, XrequirementX" + " FROM " + Constant.REGNOTIFY
                + " WHERE regulation='" + fromRegulation + "'";
        
        // Copy requirement notify templates from one requirement to another
        if (!"".equals(fromRequirement) && !"".equals(toRequirement)) {
            sqlStr = sqlStr.replaceAll("XprogramX", "'" + toProgram + "'");
            sqlStr = sqlStr.replaceAll("XrequirementX", "'" + toRequirement + "'");
            sqlStr += " AND reg_program = '" + fromProgram + "'";
            sqlStr += " AND reg_requirement = '" + fromRequirement + "'";
        } else if (!"".equals(fromProgram) && !"".equals(toProgram)) {
            // Copy program or requirement notify templates from one program to another
            sqlStr = sqlStr.replaceAll("XprogramX", "'" + toProgram + "'");
            sqlStr = sqlStr.replaceAll("XrequirementX", "reg_requirement");
            sqlStr += " AND reg_program = '" + fromProgram + "'";
            if (Constant.REGPROGRAM.equals(compNotifyTemplate)) {
                sqlStr += " AND reg_requirement IS NULL";
            } else if (Constant.REGREQUIREMENT.equals(compNotifyTemplate)) {
                sqlStr += " AND reg_requirement IS NOT NULL";
            }
        } else if (!"".equals(fromRegulation) && !"".equals(toRegulation)) {
            // Copy program or requirement notify templates when copy one regulation to another
            sqlStr = sqlStr.replaceAll("XprogramX", "reg_program");
            sqlStr = sqlStr.replaceAll("XrequirementX", "reg_requirement");
            if (Constant.REGPROGRAM.equals(compNotifyTemplate)) {
                sqlStr += " AND reg_program IS NOT NULL AND reg_requirement IS NULL";
            } else if (Constant.REGREQUIREMENT.equals(compNotifyTemplate)) {
                sqlStr += " AND reg_program IS NOT NULL AND reg_requirement IS NOT NULL";
            }
        }

        SqlUtils.executeUpdate(Constant.REGNOTIFY, sqlStr);
        
    }
    
    /**
     * Copy compliance events when copy regulation, program, or requirement
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param fromProgram Source Program Code
     * @param fromRequirement Source Requirement Code
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     * @param toRequirement Destination Requirement Code
     *
     */
    public static void copyEvents(final String fromRegulation, final String fromProgram,
            final String fromRequirement, final String toRegulation, final String toProgram,
            final String toRequirement) {

        String sqlStr =
                "INSERT INTO "
                        + Constant.ACTIVITY_LOG
                        + " (status, activity_type, location_id, contact_id, action_title, date_required"
                        + ", date_scheduled, date_scheduled_end, manager, hcm_labeled, description"
                        + ", hcm_loc_notes, vn_id, copied_from, regulation, reg_program, reg_requirement)"
                        + " SELECT 'SCHEDULED', activity_type, location_id, contact_id, action_title, date_required"
                        + ", date_scheduled, date_scheduled_end, manager, hcm_labeled, description"
                        + ", hcm_loc_notes, vn_id, activity_log_id" + ", '" + toRegulation + "'"
                        + ", XprogramX, XrequirementX" + " FROM " + Constant.ACTIVITY_LOG
                        + " WHERE activity_type = 'COMPLIANCE - EVENT' AND regulation = '"
                        + fromRegulation + "'";
        
        // Copy requirement events from one requirement to another
        if (!"".equals(fromRequirement) && !"".equals(toRequirement)) {
            sqlStr = sqlStr.replaceAll("XprogramX", "'" + toProgram + "'");
            sqlStr = sqlStr.replaceAll("XrequirementX", "'" + toRequirement + "'");
            sqlStr += " AND reg_program = '" + fromProgram + "'";
            sqlStr += " AND reg_requirement = '" + fromRequirement + "'";
        } else if (!"".equals(fromProgram) && !"".equals(toProgram)) {
            // Copy requirement events when copy one program to another
            sqlStr = sqlStr.replaceAll("XprogramX", "'" + toProgram + "'");
            sqlStr = sqlStr.replaceAll("XrequirementX", "reg_requirement");
            sqlStr += " AND reg_program = '" + fromProgram + "'";
        } else if (!"".equals(fromRegulation) && !"".equals(toRegulation)) {
            // Copy requirement events when copy one regulation to another
            sqlStr = sqlStr.replaceAll("XprogramX", "reg_program");
            sqlStr = sqlStr.replaceAll("XrequirementX", "reg_requirement");
        }

        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sqlStr);

        // Store the newly created event IDs above in the source events
        String commonSubQry =
                " WHERE al2.copied_from=al1.activity_log_id AND al1.activity_type = 'COMPLIANCE - EVENT'"
                        + " AND al2.activity_type = 'COMPLIANCE - EVENT'"
                        + " AND al2.regulation = '" + toRegulation + "'";
        if (SqlUtils.isOracle()) {
            sqlStr =
                    "UPDATE activity_log al1 SET al1.related_id="
                            + " (SELECT al2.activity_log_id FROM activity_log al2";
        } else {
            sqlStr =
                    "UPDATE activity_log SET activity_log.related_id=al2.activity_log_id"
                            + " FROM activity_log, activity_log al2";
            commonSubQry = commonSubQry.replaceAll("al1.", "activity_log.");
        }
        
        sqlStr += commonSubQry;
        
        if (!"".equals(fromProgram) && !"".equals(toProgram)) {
            sqlStr += " AND al2.reg_program = '" + toProgram + "'";
        }
        if (!"".equals(fromRequirement) && !"".equals(toRequirement)) {
            sqlStr += " AND al2.reg_requirement = '" + toRequirement + "'";
        }

        if (SqlUtils.isOracle()) {
            sqlStr += ") WHERE EXISTS (SELECT 1 FROM activity_log al2" + commonSubQry + ")";
        }

        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sqlStr);
        
    }
    
    /**
     * Copy compliance event notifications when copy regulation, program, or requirement
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param fromRegulation Source Regulation Code
     * @param fromProgram Source Program Code
     * @param fromRequirement Source Requirement Code
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     * @param toRequirement Destination Requirement Code
     *
     */
    public static void copyNotifications(final String fromRegulation, final String fromProgram,
            final String fromRequirement, final String toRegulation, final String toProgram,
            final String toRequirement) {

        String sqlStr =
                "INSERT INTO "
                        + Constant.NOTIFICATIONS
                        + " (activity_log_id, date_notify, date_sent, is_active, metric_value_id, notify_count"
                        + ", notify_type, status_previous, template_id, time_notify, time_sent, view_pkeys, view_url)"
                        + " SELECT related_id, date_notify, NULL, 1, metric_value_id, 0, notify_type"
                        + ", status_previous, template_id, time_notify, NULL, view_pkeys, view_url"
                        + " FROM " + Constant.NOTIFICATIONS + "," + Constant.ACTIVITY_LOG
                        + " WHERE notifications.activity_log_id=activity_log.activity_log_id"
                        + " AND regulation = '" + fromRegulation + "'";
        
        // Copy requirement event notifications from one requirement to another
        if (!"".equals(fromProgram) && !"".equals(toProgram)) {
            // Copy requirement event notifications when copy one program to another
            sqlStr += " AND reg_program = '" + fromProgram + "'";
        }
        if (!"".equals(fromRequirement) && !"".equals(toRequirement)) {
            sqlStr += " AND reg_requirement = '" + fromRequirement + "'";
        }
        
        SqlUtils.executeUpdate(Constant.NOTIFICATIONS, sqlStr);

    }
    
    /**
     * Advance Dates of copies items (programs, requirements, events, notifications)
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param toRegulation Destination Regulation Code
     * @param toProgram Destination Program Code
     * @param toRequirement Destination Requirement Code
     * @param config Selected Items and Options for advancing dates
     *
     */
    public static void advanceDates(final String toRegulation, final String toProgram,
            final String toRequirement, final Map<String, Object> config) {

        final Boolean advanceDates = (Boolean) config.get("advanceDates");
        final String advanceDatesByNum = (String) config.get("advanceDatesByNum");
        
        // Need at least a regulation
        if ("".equals(toRegulation) || !advanceDates || "0".equals(advanceDatesByNum)) {
            return;
        }

        // Get the child items that the user selected for copying
        final String compItems = ((JSONArray) config.get("compItems")).toString();
        final String compEvents = ((JSONArray) config.get("compEvents")).toString();
        final String advanceDatesByInterval = (String) config.get("advanceDatesByInterval");
        
        String sqlStr;
        
        // Copy Programs from one regulation to another
        if (compItems.contains("programs")) {
            sqlStr =
                    "UPDATE regprogram SET date_start = "
                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum, "date_start")
                            + ", date_end = "
                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum, "date_end")
                            + " WHERE regulation = '" + toRegulation + "'";

            SqlUtils.executeUpdate(Constant.REGPROGRAM, sqlStr);
        }
        
        // Copy Requirements from one Program to another, or from one Regulation to another
        if (compItems.contains("requirements")) {
            sqlStr =
                    "UPDATE regrequirement SET date_start = "
                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum, "date_start")
                            + ", date_end = "
                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum, "date_end")
                            + ", date_required = "
                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                    "date_required")
                                    + ", date_initial = "
                                    + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                            "date_initial")
                                            + ", date_expire = "
                                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                                    "date_expire")
                                                    + ", date_recurrence_end = "
                                                    + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                                            "date_recurrence_end") + " WHERE regulation = '" + toRegulation
                                                            + "'";

            if (!"".equals(toProgram)) {
                sqlStr += " AND reg_program='" + toProgram + "'";
            }

            SqlUtils.executeUpdate(Constant.REGREQUIREMENT, sqlStr);
        }
        
        if (compEvents.contains("events")) {
            sqlStr =
                    "UPDATE activity_log SET date_scheduled = "
                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                    "date_scheduled")
                                    + ", date_scheduled_end = "
                                    + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                            "date_scheduled_end")
                                            + ", date_required = "
                                            + getAddDateSQL(advanceDatesByInterval, advanceDatesByNum,
                                                    "date_required") + " WHERE regulation = '" + toRegulation + "'";

            if (!"".equals(toProgram)) {
                sqlStr += " AND reg_program='" + toProgram + "'";
            }
            if (!"".equals(toRequirement)) {
                sqlStr += " AND reg_requirement='" + toRequirement + "'";
            }

            SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, sqlStr);
        }
    }
    
    /**
     * Get SQL for Advancing a date field
     *
     * Added for 22.1 KB 3047003, by Angel Delacruz.
     *
     * @param advanceDatesByInterval Interval string (YEAR, MONTH, DAY)
     * @param advanceDatesByNum Number of Intervals to advance by
     * @param fieldName Name of field to advance
     * @return SQL string for SQL Server, Sybase, or Oracle.
     *
     */
    public static String getAddDateSQL(final String advanceDatesByInterval,
            final String advanceDatesByNum, final String fieldName) {

        String sqlStr;
        if (SqlUtils.isOracle()) {
            sqlStr =
                    fieldName + " + INTERVAL '" + advanceDatesByNum + "' " + advanceDatesByInterval
                            + "(6)";
        } else {
            sqlStr =
                    "DATEADD(" + advanceDatesByInterval + "," + advanceDatesByNum + "," + fieldName
                            + ")";
        }
        return sqlStr;
    }
    
}
