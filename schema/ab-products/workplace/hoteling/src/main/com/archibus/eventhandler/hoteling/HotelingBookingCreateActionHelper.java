package com.archibus.eventhandler.hoteling;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * Helper class for create booking.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public final class HotelingBookingCreateActionHelper {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private HotelingBookingCreateActionHelper() {
    }
    
    /**
     * Create new activity_log record.
     * 
     * @param emId employee name
     * @param visitor visitor name
     * @param recurringRule recurring Rule
     * @param dvId division code
     * @param dpId department name
     * @param status status
     * @param confirmed the original status
     * 
     * @return DataRecord Object
     */
    public static DataRecord createActivityLogRecord(final String emId, final String visitor,
            final String recurringRule, final String dvId, final String dpId, final String status) {
        
        // get activity_log table DataSource
        final DataSource activityLogDS = HotelingUtility.getActivityLogDataSource();
        
        // create new record
        final DataRecord newActivityLog = activityLogDS.createNewRecord();
        
        // set field values for the new record
        newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.ACTIVITY_TYPE, HotelingConstants.HOTELING_ACTIVITY_TYPE);
        newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.DATE_REQUESTED, Utility.currentDate());
        newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.TIME_REQUESTED, Utility.currentTime());
        newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.REQUESTER, emId);
        newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.RECURRING_RULE, recurringRule);
        newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.STATUS, status);
        if (HotelingConstants.ACTIVITY_LOG_APPROVED.equals(status)) {
            newActivityLog.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                    + HotelingConstants.DATE_APPROVED, Utility.currentDate());
        }
        
        // return the new record
        return activityLogDS.saveRecord(newActivityLog);
        
    }
    
    /**
     * Create new rmpct record.
     * 
     * @param booking booking json object
     * @param activityLogId activity Log Id
     * @param parentPctId parent Pct Id
     * @param dayPart day part
     * @param dateStart date Start
     * @param dateEnd date End
     * 
     * @return DataRecord Object
     */
    public static DataRecord createRmpctRecord(final JSONObject booking, final int activityLogId,
            final int parentPctId, final String dayPart, final Date dateStart, final Date dateEnd) {
        
        // get location info from the booking object
        final String blId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.BL_ID);
        final String flId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.FL_ID);
        final String rmId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.RM_ID);
        
        // get employee info from the booking object
        final String emId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.EM_ID);
        final String dvId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DV_ID);
        final String dpId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DP_ID);
        
        // get account code
        String acId = null;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.AC_ID)) {
            acId =
                    booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.AC_ID);
        }
        
        // get the confirmed value if it exists
        int confirmed = 0;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.CONFIRMED)) {
            confirmed =
                    booking.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.CONFIRMED);
        }
        
        // get visitor code
        String visitor = null;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.VISITOR_ID)) {
            visitor =
                    booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.VISITOR_ID);
        }
        
        // get resources code
        String resources = null;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.RESOURCES)) {
            resources =
                    booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.RESOURCES);
        }
        
        // insert base line record if no rmpct records exists
        insertBaseLineIfNoRmpctExists(blId, flId, rmId);
        
        // create new rmpct record
        final DataSource rmpctDS = HotelingUtility.getRmpctDataSource();
        final DataRecord newRmpct = rmpctDS.createNewRecord();
        
        // set confirmed value for new rmpct record
        final DataSource afmFldsDs = HotelingUtility.createAfmFieldsDataSource();
        afmFldsDs.addRestriction(Restrictions.eq("afm_flds", "table_name", "rmpct"));
        afmFldsDs.addRestriction(Restrictions.eq("afm_flds", "field_name", "confirmed"));
        final DataRecord confirmedRecord = afmFldsDs.getRecord();
        if (confirmedRecord != null) {
            newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.CONFIRMED, confirmed);
        }
        
        // set request values for the new record
        HotelingBookingCreateActionHelper.setRequestForNewRmpct(activityLogId, parentPctId,
            newRmpct);
        // set date info for new rmpct record
        HotelingBookingCreateActionHelper.setDateForNewRmpct(dayPart, dateStart, dateEnd, newRmpct);
        // set employee for new rmpct record
        HotelingBookingCreateActionHelper.setEmployeeForNewRmpct(emId, acId, resources, newRmpct);
        // set location info
        HotelingBookingCreateActionHelper.setLocationForNewRmpct(blId, flId, rmId, newRmpct);
        // KB3035709 - set primary_rm and primary_em both to 0
        HotelingBookingCreateActionHelper.setPrimaryRmAndEmForNewRmpct(newRmpct);
        // set visitor
        HotelingBookingCreateActionHelper.setVisitorForNewRmpct(visitor, newRmpct);
        // set division and department
        HotelingBookingCreateActionHelper.setDivisionAndDepartmentForNewRmpct(dvId, dpId, newRmpct);
        // Calculate and set pct_time
        HotelingBookingCreateActionHelper.setPctTimeForNewRmpct(dayPart, newRmpct);
        
        // get room
        final DataRecord rmRec = HotelingUtility.getRmRecord(blId, flId, rmId);
        
        // Set rm_cat and rm_type value to rmpct record
        HotelingBookingCreateActionHelper.setRoomCatAndTypeForNewRmpct(newRmpct, rmRec);
        
        // save record and get again to get all new values
        
        final DataRecord keyRecord = rmpctDS.saveRecord(newRmpct);
        
        final DataRecord currentRmpct =
                rmpctDS.getRecord(" pct_id="
                        + keyRecord.getValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                                + HotelingConstants.PCT_ID));
        // Calculate and set pct_space
        HotelingBookingCreateActionHelper.setPctSpaceForNewRmpct(currentRmpct, rmRec);
        // Set parent_pct_id
        HotelingBookingCreateActionHelper.setParentPctForNewRmpct(parentPctId, currentRmpct);
        
        // save the new rmpct record
        if (confirmedRecord != null) {
            currentRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.CONFIRMED, confirmed);
        }
        rmpctDS.saveRecord(currentRmpct);
        return currentRmpct;
    }
    
    /**
     * Insert base line record for case that there are no rmpct exist for the given room.
     * 
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     */
    public static void insertBaseLineIfNoRmpctExists(final String blId, final String flId,
            final String rmId) {
        
        // Query the rmpct list
        final DataSource rmpctDS = HotelingUtility.getRmpctDataSource();
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(HotelingConstants.RMPCT, HotelingConstants.BL_ID, blId,
            Operation.EQUALS);
        restriction.addClause(HotelingConstants.RMPCT, HotelingConstants.FL_ID, flId,
            Operation.EQUALS);
        restriction.addClause(HotelingConstants.RMPCT, HotelingConstants.RM_ID, rmId,
            Operation.EQUALS);
        final List<DataRecord> records = rmpctDS.getRecords(restriction);
        
        // get the room object
        final DataRecord room = HotelingUtility.getRmRecord(blId, flId, rmId);
        
        // if no rmpct records exist for the given room, create new rmpct record as base line record
        if (records.isEmpty()) {
            final int roomCapacity =
                    room.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.CAP_EM);
            for (int i = 0; i < roomCapacity; i++) {
                final DataRecord record = rmpctDS.createNewRecord();
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.BL_ID,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.BL_ID));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.FL_ID,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.FL_ID));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_ID,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.RM_ID));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.PRORATE,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.PRORATE));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DV_ID,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.DV_ID));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DP_ID,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.DP_ID));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_CAT,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.RM_CAT));
                record.setValue(
                    HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_TYPE,
                    room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.RM_TYPE));
                record.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.STATUS, 1);
                record.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DATE_START, Utility.currentDate());
                record.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.PCT_TIME, HotelingConstants.NUMBER_100);
                record.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.PCT_SPACE, HotelingConstants.NUMBER_100);
                
                HotelingBookingCreateActionHelper.setPctSpaceForNewRmpct(record, room);
                rmpctDS.saveRecord(record);
            }
        }
    }
    
    /**
     * set employee for new rmpct record.
     * 
     * @param emId employee
     * @param acId account code
     * @param resources resources
     * @param newRmpct rmpct record
     */
    public static void setEmployeeForNewRmpct(final String emId, final String acId,
            final String resources, final DataRecord newRmpct) {
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.EM_ID, emId);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.RESOURCES, resources);
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.AC_ID, acId);
    }
    
    /**
     * set date info for new rmpct record.
     * 
     * @param dayPart day part
     * @param dateStart date start
     * @param dateEnd date end
     * @param newRmpct rmpct record
     */
    public static void setDateForNewRmpct(final String dayPart, final Date dateStart,
            final Date dateEnd, final DataRecord newRmpct) {
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DATE_START, dateStart);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DATE_END, dateEnd);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DAY_PART, Integer.parseInt(dayPart));
    }
    
    /**
     * set request values for the new record.
     * 
     * @param activityLogId day part
     * @param parentPctId date start
     * @param newRmpct rmpct record
     */
    public static void setRequestForNewRmpct(final int activityLogId, final int parentPctId,
            final DataRecord newRmpct) {
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.ACTIVITY_LOG_ID, activityLogId);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.STATUS, 0);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PARENT_PCT_ID, parentPctId);
    }
    
    /**
     * set division and department.
     * 
     * @param dvId division
     * @param dpId department
     * @param newRmpct rmpct record
     */
    public static void setDivisionAndDepartmentForNewRmpct(final String dvId, final String dpId,
            final DataRecord newRmpct) {
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DV_ID, dvId);
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DP_ID, dpId);
    }
    
    /**
     * set parent pct to himself if no parent specified.
     * 
     * @param parentPctId parent pct
     * @param newRmpct rmpct record
     */
    public static void setParentPctForNewRmpct(final int parentPctId, final DataRecord newRmpct) {
        if (parentPctId < 0) {
            newRmpct.setValue(
                HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.PARENT_PCT_ID,
                newRmpct.getValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.PCT_ID));
        }
    }
    
    /**
     * set pct_space for the new rmpct.
     * 
     * @param newRmpct rmpct record
     * @param rmRec rm record
     */
    public static void setPctSpaceForNewRmpct(final DataRecord newRmpct, final DataRecord rmRec) {
        final double pctSpace =
                HotelingConstants.NUMBER_100
                        / rmRec.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                                + HotelingConstants.CAP_EM);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PCT_SPACE, pctSpace);
    }
    
    /**
     * set pct_time for the new rmpct.
     * 
     * @param dayPart day part
     * @param newRmpct rmpct record
     */
    public static void setPctTimeForNewRmpct(final String dayPart, final DataRecord newRmpct) {
        if (Integer.parseInt(dayPart) == 0) {
            newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.PCT_SPACE, HotelingConstants.NUMBER_100);
        } else {
            newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.PCT_TIME, HotelingConstants.NUMBER_50);
        }
    }
    
    /**
     * set rm_cat and rm_type for the new rmpct.
     * 
     * @param newRmpct rmpct record
     * @param rmRec rm record
     */
    public static void setRoomCatAndTypeForNewRmpct(final DataRecord newRmpct,
            final DataRecord rmRec) {
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_CAT,
            rmRec.getValue(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.RM_CAT));
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_TYPE,
            rmRec.getValue(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.RM_TYPE));
    }
    
    /**
     * set location for the new rmpct.
     * 
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     * @param newRmpct rmpct record
     */
    public static void setLocationForNewRmpct(final String blId, final String flId,
            final String rmId, final DataRecord newRmpct) {
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.BL_ID, blId);
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.FL_ID, flId);
        newRmpct.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_ID, rmId);
    }
    
    /**
     * set visitor for the new rmpct.
     * 
     * @param visitor visitor
     * @param newRmpct rmpct record
     */
    public static void setVisitorForNewRmpct(final String visitor, final DataRecord newRmpct) {
        if (StringUtil.notNullOrEmpty(visitor)) {
            newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.VISITOR_ID, Integer.parseInt(visitor));
        } else {
            newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.VISITOR_ID, null);
        }
    }
    
    /**
     * set primary_rm and primary_em both to 0.
     * 
     * @param newRmpct rmpct record
     */
    public static void setPrimaryRmAndEmForNewRmpct(final DataRecord newRmpct) {
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PRIMARY_RM, 0);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PRIMARY_EM, 0);
    }
    
}
