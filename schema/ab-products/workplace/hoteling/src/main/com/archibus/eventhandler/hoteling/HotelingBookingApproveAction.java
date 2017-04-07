package com.archibus.eventhandler.hoteling;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.DateTime;

/**
 * Helper class for approve booking.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public final class HotelingBookingApproveAction {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private HotelingBookingApproveAction() {
    }
    
    /**
     * Handle base line records when approve the booking.
     * 
     * @param rmpctRecords bookings
     * 
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.3: Statements with DELETE FROM ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void handleBaseLineRecords(final List<DataRecord> rmpctRecords) {
        // create dataSources
        final DataSource rmpctDS = HotelingUtility.getRmpctDataSource();
        final DataSource rmDS = HotelingUtility.getRmDataSource();
        
        // define the parameters of the two datasource
        defineDataSouceParameters(rmpctDS, rmDS);
        
        // for every reocrds handle base line records
        for (final DataRecord rmpctRecord : rmpctRecords) {
            // get values and set dataSource parameters
            final int bookingId =
                    rmpctRecord.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.PCT_ID);
            final String blId =
                    rmpctRecord.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.BL_ID);
            final String flId =
                    rmpctRecord.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.FL_ID);
            final String rmId =
                    rmpctRecord.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.RM_ID);
            final Date dateStart =
                    rmpctRecord.getDate(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.DATE_START);
            final Date dateEnd =
                    rmpctRecord.getDate(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.DATE_END);
            final int dayPart =
                    rmpctRecord.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.DAY_PART);
            final int anotherDayPart = dayPart == 1 ? 2 : 1;
            rmpctDS.setParameter(HotelingConstants.BL_ID, blId);
            rmpctDS.setParameter(HotelingConstants.FL_ID, flId);
            rmpctDS.setParameter(HotelingConstants.RM_ID, rmId);
            rmpctDS.setParameter(HotelingConstants.DATE_START, dateStart);
            rmpctDS.setParameter(HotelingConstants.DATE_END, dateEnd);
            rmpctDS.setParameter(HotelingConstants.DAY_PART, dayPart);
            rmpctDS.setParameter(HotelingConstants.PARAMETER_NAME_ANOTHER_DAY_PART, anotherDayPart);
            rmpctDS.setParameter(HotelingConstants.PCT_ID, bookingId);
            rmDS.setParameter(HotelingConstants.BL_ID, blId);
            rmDS.setParameter(HotelingConstants.FL_ID, flId);
            rmDS.setParameter(HotelingConstants.RM_ID, rmId);
            
            // select one empty room part to occupied
            selectEmptyRoomPartToOccupied(rmpctDS, dateStart, dateEnd);
            
            // get room
            final DataRecord room =
                    rmDS.getRecord("rm.bl_id =${parameters['bl_id']} AND rm.fl_id =${parameters['fl_id']} AND rm.rm_id =${parameters['rm_id']} ");
            
            // if not full day hoteling, check and create empty room part for another day part
            if (dayPart != 0) {
                // create empty room part for another day part
                createEmptyRoomPartForAnotherDayPart(rmpctDS, room, dateStart, dateEnd,
                    anotherDayPart);
            }
            
            // delete all base line record that rmpct.date_start> rmpct.date_end which may caused by
            // the action above
            SqlUtils
                .executeUpdate(
                    HotelingConstants.RMPCT,
                    "DELETE FROM rmpct"
                            + " WHERE rmpct.bl_id= '"
                            + blId
                            + "' AND rmpct.fl_id = '"
                            + flId
                            + "' AND rmpct.rm_id='"
                            + rmId
                            + "'"
                            + " AND rmpct.status=1 AND rmpct.em_id IS NULL AND rmpct.date_start> rmpct.date_end");
        }
        
    }
    
    /**
     * set activity_log status to APPROVED.
     * 
     * @param parentPctId parent_pct_id
     * 
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.2: Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void setActivityLogToApproved(final int parentPctId) {
        final DataSource updateActivityLogDS =
                DataSourceFactory.createDataSource().addTable("activity_log");
        final String updateActivityStatus =
                " UPDATE activity_log " + " SET status='APPROVED' " + " WHERE activity_log_id="
                        + "( SELECT activity_log_id FROM RMPCT " + "  WHERE parent_pct_id=pct_id "
                        + "    AND parent_pct_id= ${parameters['parentPctId']} " + ")";
        updateActivityLogDS.addQuery(updateActivityStatus).addParameter("parentPctId", parentPctId,
            DataSource.DATA_TYPE_INTEGER);
        updateActivityLogDS.executeUpdate();
    }
    
    /**
     * set recurring activity_log status to APPROVED.
     * 
     * @param parentPctId parent_pct_id
     */
    public static void setRecurringActivityLogToApproved(final String parentPctId) {
        final int rmpctCount =
                DataStatistics.getInt("rmpct", "pct_id", "COUNT", " status=0 AND parent_pct_id="
                        + Integer.parseInt(parentPctId));
        if (rmpctCount < 1) {
            setActivityLogToApproved(Integer.parseInt(parentPctId));
        }
    }
    
    /**
     * Select one empty room part for new book to occupied.
     * 
     * @param rmpctDS rmpctDS
     * @param dateStart dateStart
     * @param dateEnd dateEnd
     */
    private static void selectEmptyRoomPartToOccupied(final DataSource rmpctDS,
            final Date dateStart, final Date dateEnd) {
        
        boolean isSelected = false;
        rmpctDS.addSort(HotelingConstants.RMPCT, HotelingConstants.DAY_PART, DataSource.SORT_DESC);
        // select full cross empty room part for new book to occupied
        isSelected = selectFullCrossEmptyRoomPartForNewBook(rmpctDS, dateStart, dateEnd);
        
        // If there is not full cross empty room part , then select one previous and
        // one after empty room part to occupied
        if (!isSelected) {
            Date date = dateStart;
            while (!date.after(dateEnd)) {
                selectEmptyRoomPartByDate(rmpctDS, date);
                date = DateTime.addDays(date, 1);
                
            }
        }
        
    }
    
    /**
     * select one fully crossed empty rmpct record for the new booking to occupied.
     * 
     * @param rmpctDS RMPCT DataSource
     * @param dateStart date_start
     * @param dateEnd date_end
     * @return isSelected
     */
    private static boolean selectFullCrossEmptyRoomPartForNewBook(final DataSource rmpctDS,
            final Date dateStart, final Date dateEnd) {
        boolean isSelect = false;
        final String fullCrossRmpctsRes =
                " rmpct.bl_id = ${parameters['bl_id']} AND rmpct.fl_id =  ${parameters['fl_id']} AND rmpct.rm_id =  ${parameters['rm_id']}  "
                        + " AND rmpct.status= 1 AND rmpct.em_id IS NULL  "
                        + " AND (rmpct.day_part=0 OR rmpct.day_part =${parameters['day_part']}) "
                        + " AND (rmpct.date_start IS NULL OR rmpct.date_start<=${parameters['date_start']})   "
                        + " AND (rmpct.date_end IS NULL OR rmpct.date_end>=${parameters['date_end']})  ";
        final List<DataRecord> fullCrossRmpcts = rmpctDS.getRecords(fullCrossRmpctsRes);
        
        // select one full cross empty rmpct record to update
        for (final DataRecord fullCrossRmpct : fullCrossRmpcts) {
            updateEmptyRoomPartForNewBook(rmpctDS, dateStart, dateEnd, fullCrossRmpct);
            isSelect = true;
            break;
        }
        
        // if not exist one full cross empty rmpct record, and the booking is full day, get one
        // morning empty rmpct record and one afternoon empty rmpct record to update
        if (fullCrossRmpcts.isEmpty()
                && 0 == (Integer) rmpctDS.getParameters().get(HotelingConstants.DAY_PART)
                    .getValue()) {
            
            final String morningEmptyRmpctsRes =
                    "rmpct.bl_id = ${parameters['bl_id']} AND rmpct.fl_id =${parameters['fl_id']} AND rmpct.rm_id = ${parameters['rm_id']}"
                            + " AND rmpct.status= 1 AND rmpct.em_id IS NULL AND rmpct.day_part = 1 "
                            + " AND ( rmpct.date_start IS NULL OR rmpct.date_start<=${parameters['date_start']} )"
                            + " AND ( rmpct.date_end IS NULL OR rmpct.date_end>=${parameters['date_end']})";
            
            final String afternoonEmptyRmpctsRes =
                    " rmpct.bl_id = ${parameters['bl_id']} AND rmpct.fl_id =${parameters['fl_id']} AND rmpct.rm_id = ${parameters['rm_id']}  "
                            + " AND rmpct.status= 1 AND rmpct.em_id IS NULL AND rmpct.day_part = 2 "
                            + " AND (rmpct.date_start IS NULL OR rmpct.date_start<=${parameters['date_start']})"
                            + " AND (rmpct.date_end IS NULL OR rmpct.date_end>=${parameters['date_end']})";
            
            final List<DataRecord> morningEmptyRmpcts = rmpctDS.getRecords(morningEmptyRmpctsRes);
            final List<DataRecord> afternoonEmptyRmpcts =
                    rmpctDS.getRecords(afternoonEmptyRmpctsRes);
            
            if (!morningEmptyRmpcts.isEmpty() && !afternoonEmptyRmpcts.isEmpty()) {
                updateEmptyRoomPartForNewBook(rmpctDS, dateStart, dateEnd,
                    morningEmptyRmpcts.get(0));
                updateEmptyRoomPartForNewBook(rmpctDS, dateStart, dateEnd,
                    afternoonEmptyRmpcts.get(0));
                
                isSelect = true;
            }
            
        }
        
        return isSelect;
    }
    
    /**
     * update empty room part for the new book.
     * 
     * @param rmpctDS rmpctDS
     * @param dateStart dateStart
     * @param dateEnd dateEnd
     * @param emptyRmpct empty room part
     */
    private static void updateEmptyRoomPartForNewBook(final DataSource rmpctDS,
            final Date dateStart, final Date dateEnd, final DataRecord emptyRmpct) {
        // divide the emptyRmpct to two rmpct base line reocrds, one is before the hoteling record,
        // the other is after the hoteling record
        final DataRecord newRmpct = rmpctDS.createNewRecord();
        newRmpct.setFieldValues(emptyRmpct.getFieldValues());
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PCT_ID, null);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PARENT_PCT_ID, null);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.ACTIVITY_LOG_ID, null);
        newRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DATE_START, DateTime.addDays(dateEnd, 1));
        rmpctDS.saveRecord(newRmpct);
        
        emptyRmpct.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DATE_END, DateTime.addDays(dateStart, -1));
        rmpctDS.saveRecord(emptyRmpct);
    }
    
    /**
     * select empty rmpct record for the new booking to occupied by given date.
     * 
     * @param rmpctDS RMPCT DataSource
     * @param date test date
     */
    private static void selectEmptyRoomPartByDate(final DataSource rmpctDS, final Date date) {
        final String rmpctsRes =
                "rmpct.bl_id = ${parameters['bl_id']} AND rmpct.fl_id =${parameters['fl_id']} AND rmpct.rm_id =${parameters['rm_id']} "
                        + " AND rmpct.status= 1 AND rmpct.em_id IS NULL "
                        + " AND (rmpct.day_part=0 OR rmpct.day_part =${parameters['day_part']})"
                        + " AND (rmpct.date_start IS NULL OR rmpct.date_start<= ${parameters['dateTest']})"
                        + " AND (rmpct.date_end IS NULL OR rmpct.date_end>= ${parameters['dateTest']})";
        rmpctDS.setParameter(HotelingConstants.PARAMETER_NAME_DATE_TEST, date);
        final List<DataRecord> rmpcts = rmpctDS.getRecords(rmpctsRes);
        
        // if exists full cross empty rmpct records, pick one empty rmpct and divide the rmpct to
        // two rmpct base line reocrds, one is before the hoteling record, ther other is after
        for (final DataRecord emptyRmpct : rmpcts) {
            updateEmptyRoomPartForNewBook(rmpctDS, date, date, emptyRmpct);
            break;
        }
        
        // if not exist one full cross empty rmpct record, and the booking is full day, get one
        // morning empty rmpct record and one afternoon empty rmpct record to update
        if (rmpcts.isEmpty()
                && 0 == (Integer) rmpctDS.getParameters().get(HotelingConstants.DAY_PART)
                    .getValue()) {
            
            final String morningEmptyRmpctsRes =
                    "rmpct.bl_id = ${parameters['bl_id']} AND rmpct.fl_id = ${parameters['fl_id']} AND rmpct.rm_id=${parameters['rm_id']}  "
                            + " AND rmpct.status= 1 AND rmpct.em_id IS NULL AND rmpct.day_part = 1"
                            + " AND (rmpct.date_start IS NULL OR rmpct.date_start<=${parameters['dateTest']}) "
                            + " AND (rmpct.date_end IS NULL OR rmpct.date_end>=${parameters['dateTest']}) ";
            
            final String afternoonEmptyRmpctsRes =
                    "rmpct.bl_id = ${parameters['bl_id']} AND rmpct.fl_id =${parameters['fl_id']} AND rmpct.rm_id =${parameters['rm_id']}  "
                            + " AND rmpct.status= 1 AND rmpct.em_id IS NULL AND rmpct.day_part = 2"
                            + " AND (rmpct.date_start IS NULL  OR rmpct.date_start<=${parameters['dateTest']})"
                            + " AND (rmpct.date_end IS NULL  OR rmpct.date_end>=${parameters['dateTest']})";
            
            final List<DataRecord> morningEmptyRmpcts = rmpctDS.getRecords(morningEmptyRmpctsRes);
            final List<DataRecord> afternoonEmptyRmpcts =
                    rmpctDS.getRecords(afternoonEmptyRmpctsRes);
            
            if (!morningEmptyRmpcts.isEmpty() && !afternoonEmptyRmpcts.isEmpty()) {
                updateEmptyRoomPartForNewBook(rmpctDS, date, date, morningEmptyRmpcts.get(0));
                updateEmptyRoomPartForNewBook(rmpctDS, date, date, afternoonEmptyRmpcts.get(0));
            }
            
        }
        
    }
    
    /**
     * Handle another day_part base line records.
     * 
     * @param rmpctDS RMPCT DataSource
     * @param room room record
     * @param dateStart date_start
     * @param dateEnd date_end
     * @param anotherDayPart another day_part
     */
    private static void createEmptyRoomPartForAnotherDayPart(final DataSource rmpctDS,
            final DataRecord room, final Date dateStart, final Date dateEnd,
            final int anotherDayPart) {
        Date newDateStart = dateStart;
        Date date = dateStart;
        while (!date.after(dateEnd)) {
            final boolean isCurrentDateAtCapacity =
                    isAnotherDayPartAtCapacityForGivenDate(rmpctDS, date, room);
            
            boolean isNextDateAtCapacity = true;
            // when test date is not the end date, check if the next date at capacity
            if (date.before(dateEnd)) {
                isNextDateAtCapacity =
                        isAnotherDayPartAtCapacityForGivenDate(rmpctDS, DateTime.addDays(date, 1),
                            room);
            }
            
            if (isCurrentDateAtCapacity) {
                newDateStart = DateTime.addDays(date, 1);
            } else {
                if (isNextDateAtCapacity) {
                    createNewBaseLineRecord(rmpctDS, room, newDateStart, date, anotherDayPart);
                }
            }
            
            date = DateTime.addDays(date, 1);
        }
    }
    
    /**
     * create new base line record.
     * 
     * @param rmpctDS RMPCT DataSource
     * @param room room record
     * @param dateStart date_start
     * @param dateEnd date_end
     * @param dayPart day_part
     */
    private static void createNewBaseLineRecord(final DataSource rmpctDS, final DataRecord room,
            final Date dateStart, final Date dateEnd, final int dayPart) {
        final DataRecord rmpctRecord = rmpctDS.createNewRecord();
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.BL_ID, room.getString(HotelingConstants.T_RM
                + HotelingConstants.DOT + HotelingConstants.BL_ID));
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.FL_ID, room.getString(HotelingConstants.T_RM
                + HotelingConstants.DOT + HotelingConstants.FL_ID));
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.RM_ID, room.getString(HotelingConstants.T_RM
                + HotelingConstants.DOT + HotelingConstants.RM_ID));
        rmpctRecord.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.PRORATE,
            room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.PRORATE));
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DV_ID, room.getString(HotelingConstants.T_RM
                + HotelingConstants.DOT + HotelingConstants.DV_ID));
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DP_ID, room.getString(HotelingConstants.T_RM
                + HotelingConstants.DOT + HotelingConstants.DP_ID));
        rmpctRecord.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_CAT,
            room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.RM_CAT));
        rmpctRecord.setValue(
            HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.RM_TYPE,
            room.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.RM_TYPE));
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DAY_PART, dayPart);
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.STATUS, 1);
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DATE_START, dateStart);
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.DATE_END, dateEnd);
        rmpctRecord.setValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PCT_TIME, dayPart == 0 ? HotelingConstants.NUMBER_100
                : HotelingConstants.NUMBER_50);
        HotelingBookingCreateActionHelper.setPctSpaceForNewRmpct(rmpctRecord, room);
        rmpctDS.saveRecord(rmpctRecord);
    }
    
    /**
     * get available pct_space for the other part of the given date.
     * 
     * @param rmpctDS RMPCT DataSource
     * @param date given date
     * @param room room
     * @return available pct_space
     */
    private static boolean isAnotherDayPartAtCapacityForGivenDate(final DataSource rmpctDS,
            final Date date, final DataRecord room) {
        final String restriction =
                "rmpct.bl_id =${parameters['bl_id']} AND rmpct.fl_id =${parameters['fl_id']} AND rmpct.rm_id =${parameters['rm_id']} "
                        + " AND rmpct.status=1"
                        + " AND (rmpct.day_part = 0 OR rmpct.day_part = ${parameters['anotherDayPart']})"
                        + " AND (rmpct.date_start IS NULL OR rmpct.date_start<=${parameters['dateTest']})"
                        + " AND (rmpct.date_end IS NULL OR rmpct.date_end>=${parameters['dateTest']})";
        rmpctDS.setParameter(HotelingConstants.PARAMETER_NAME_DATE_TEST, date);
        final List<DataRecord> rmpcts = rmpctDS.getRecords(restriction);
        return rmpcts.size() == room.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                + HotelingConstants.CAP_EM);
    }
    
    /**
     * Define the parameters of the rmpct datasource and rm datasource.
     * 
     * @param rmpctDS rmpctDS
     * @param rmDS rmDS
     */
    private static void defineDataSouceParameters(final DataSource rmpctDS, final DataSource rmDS) {
        rmpctDS.addParameter(HotelingConstants.BL_ID, null, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(HotelingConstants.FL_ID, null, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(HotelingConstants.RM_ID, null, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(HotelingConstants.DATE_START, null, DataSource.DATA_TYPE_DATE);
        rmpctDS.addParameter(HotelingConstants.DATE_END, null, DataSource.DATA_TYPE_DATE);
        rmpctDS.addParameter(HotelingConstants.PARAMETER_NAME_DATE_TEST, null,
            DataSource.DATA_TYPE_DATE);
        rmpctDS.addParameter(HotelingConstants.DAY_PART, null, DataSource.DATA_TYPE_INTEGER);
        rmpctDS.addParameter(HotelingConstants.PARAMETER_NAME_ANOTHER_DAY_PART, null,
            DataSource.DATA_TYPE_INTEGER);
        rmpctDS.addParameter(HotelingConstants.PCT_ID, null, DataSource.DATA_TYPE_INTEGER);
        rmDS.addParameter(HotelingConstants.BL_ID, null, DataSource.DATA_TYPE_TEXT);
        rmDS.addParameter(HotelingConstants.FL_ID, null, DataSource.DATA_TYPE_TEXT);
        rmDS.addParameter(HotelingConstants.RM_ID, null, DataSource.DATA_TYPE_TEXT);
        
    }
    
}
