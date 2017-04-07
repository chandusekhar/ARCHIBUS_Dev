package com.archibus.eventhandler.hoteling;

import java.text.*;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.*;

/**
 * Helper class for search booking.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public final class HotelingBookingSearchAction {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private HotelingBookingSearchAction() {
    }
    
    /**
     * This method serve as a WFR to search all available spaces and return result as data records
     * list, by which the JS code will manually create a Building-Floor-Room tree.
     * 
     * @param searchParameter search parameter from the console in the client
     * @param recurringRule recurring rule
     * 
     * @return available spaces dataSet
     */
    public static DataSetList searchAvailableSpaces(final JSONObject searchParameter,
            final String recurringRule) {
        // get search DataSource
        final DataSource rmDS = getSearchDataSource(searchParameter);
        
        // get the possible available rooms
        final List<DataRecord> possibleRooms = rmDS.getRecords();
        
        // calculate available space for possible rooms
        try {
            calculateAvailSpaceForPossibleRooms(possibleRooms, searchParameter, recurringRule);
        } catch (final NoSuchElementException e) {
            throw new ExceptionBase(null, e);
        } catch (final ParseException e) {
            throw new ExceptionBase(null, e);
        }
        
        // remove all un-available rooms
        List<DataRecord> availableRooms = removeUnAvailableRoomFromPossibleRooms(possibleRooms);
        
        // apply min space restriction if filterParameters contain minBlSpace or minFlSpace to get
        // the final available rooms
        availableRooms = applyMinSpaceRestriction(availableRooms, searchParameter);
        
        // put the available rooms to the DataSetList
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(availableRooms);
        return dataSet;
    }
    
    /**
     * get search dataSource.
     * 
     * @param searchParameter search parameters from client view
     * 
     * @return search dataSource
     *         <p>
     *         Suppress warning PMD.AvoidUsingSql.
     *         <p>
     *         Justification: Case #3: Calculations with conditional logic.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static DataSource getSearchDataSource(final JSONObject searchParameter) {
        
        // build the sql restriction for the search query
        final String restriction = buildRestrictionFromSearchParameter(searchParameter);
        
        // construct possible available room sql
        final String possibleRmQuery =
                "SELECT rm.bl_id, rm.fl_id, rm.rm_id, rm.dwgname, rm.cap_em, rm.bl_id ${sql.concat}'-' ${sql.concat} rm.fl_id ${sql.as} bl_fl ,"
                        + "0 ${sql.as}  em_occupy , 0 ${sql.as} avail_space, 0 ${sql.as} bl_avail_space, 0 ${sql.as} fl_avail_space FROM rm WHERE "
                        + restriction;
        
        // build query DataSource
        final DataSource rmDS =
                DataSourceFactory.createDataSource().addTable(HotelingConstants.T_RM)
                    .addQuery(possibleRmQuery)
                    .addSort(HotelingConstants.T_RM, HotelingConstants.BL_ID)
                    .addSort(HotelingConstants.T_RM, HotelingConstants.FL_ID)
                    .addSort(HotelingConstants.T_RM, HotelingConstants.RM_ID);
        
        // add virtual field definitions
        rmDS.addVirtualField(HotelingConstants.T_RM, "dwgname", DataSource.DATA_TYPE_TEXT)
            .addVirtualField(HotelingConstants.T_RM, "bl_fl", DataSource.DATA_TYPE_TEXT)
            .addVirtualField(HotelingConstants.T_RM, "cap_em", DataSource.DATA_TYPE_INTEGER)
            .addVirtualField(HotelingConstants.T_RM, "em_occupy", DataSource.DATA_TYPE_INTEGER)
            .addVirtualField(HotelingConstants.T_RM, "avail_space", DataSource.DATA_TYPE_INTEGER)
            .addVirtualField(HotelingConstants.T_RM, "bl_avail_space", DataSource.DATA_TYPE_INTEGER)
            .addVirtualField(HotelingConstants.T_RM, "fl_avail_space", DataSource.DATA_TYPE_INTEGER);
        
        // return the search DataSource Object
        return rmDS;
    }
    
    /**
     * calculate available space for possible rooms.
     * 
     * @param possibleRooms possible room list
     * @param filterParameters filter parameters from client view
     * @param recurringRule recurring rule
     * @throws ParseException parse date exception
     *             <p>
     *             Suppress warning PMD.AvoidUsingSql.
     *             <p>
     *             Justification: Case #1: SQL statements with subqueries.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static void calculateAvailSpaceForPossibleRooms(final List<DataRecord> possibleRooms,
            final JSONObject filterParameters, final String recurringRule) throws ParseException {
        
        final SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
        final Date dateStart = formatter.parse(filterParameters.getString("date_start"));
        final Date dateEnd = formatter.parse(filterParameters.getString("date_end"));
        final String dayPart = filterParameters.getString("dayPart");
        String sqlDayPart = "1=1";
        if (!"0".equals(dayPart)) {
            sqlDayPart = "(rmpct.day_part=0 OR rmpct.day_part=" + dayPart + ") ";
        }
        
        // construct sql to query single date occupy
        final String singleDateOccupyQuery =
                "SELECT rmpct.pct_id, rmpct.bl_id, rmpct.fl_id,rmpct.rm_id from rmpct "
                        + "  WHERE (rmpct.bl_id ${sql.concat}'-' ${sql.concat} rmpct.fl_id ${sql.concat} '-' ${sql.concat} rmpct.rm_id) IN "
                        + "         (SELECT rm.bl_id ${sql.concat}'-' ${sql.concat} rm.fl_id ${sql.concat}'-' ${sql.concat} rm.rm_id FROM rm WHERE rm.hotelable=1)"
                        + "     AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${parameters['date_start']}) "
                        + "     AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${parameters['date_start']}) "
                        + "     AND rmpct.em_id IS NOT NULL AND rmpct.status IN(0,1)  "
                        + "     AND " + sqlDayPart;
        
        // build query datasource
        final DataSource rmpctDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(HotelingConstants.RMPCT)
                    .addField(
                        new String[] { HotelingConstants.PCT_ID, HotelingConstants.BL_ID,
                                HotelingConstants.FL_ID, HotelingConstants.RM_ID })
                    .addQuery(singleDateOccupyQuery);
        rmpctDS.addParameter(HotelingConstants.DATE_START, null, DataSource.DATA_TYPE_DATE);
        
        // Call method getDateList () to get the date list from recurring rule
        List<Date> datesList = null;
        if (recurringRule != null && !"".equals(recurringRule.trim())) {
            final RecurringScheduleService recurringScheduleService =
                    new RecurringScheduleService();
            recurringScheduleService.setRecurringSchedulePattern(dateStart, dateEnd, recurringRule);
            datesList = recurringScheduleService.getDatesList();
        } else {
            datesList = HotelingUtility.getRegularHotelingDateList(dateStart, dateEnd);
        }
        // loop all dates to get max singleDateOccupy
        for (final Date date : datesList) {
            rmpctDS.setParameter(HotelingConstants.DATE_START, date);
            final List<DataRecord> rmpcts = rmpctDS.getRecords();
            
            for (final DataRecord possibleRoom : possibleRooms) {
                int singleDateOccupy = 0;
                for (final DataRecord rmpct : rmpcts) {
                    if ((rmpct.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.BL_ID).equals(possibleRoom
                        .getString(HotelingConstants.T_RM + HotelingConstants.DOT
                                + HotelingConstants.BL_ID)))
                            && (rmpct.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                                    + HotelingConstants.FL_ID).equals(possibleRoom
                                .getString(HotelingConstants.T_RM + HotelingConstants.DOT
                                        + HotelingConstants.FL_ID)))
                            && (rmpct.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                                    + HotelingConstants.RM_ID).equals(possibleRoom
                                .getString(HotelingConstants.T_RM + HotelingConstants.DOT
                                        + HotelingConstants.RM_ID)))) {
                        singleDateOccupy++;
                    }
                }
                if (singleDateOccupy > possibleRoom.getInt(HotelingConstants.T_RM
                        + HotelingConstants.DOT + HotelingConstants.EM_OCCUPY)) {
                    possibleRoom.setValue(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.EM_OCCUPY, singleDateOccupy);
                }
                
                possibleRoom.setValue(
                    HotelingConstants.T_RM + HotelingConstants.DOT + HotelingConstants.AVAIL_SPACE,
                    possibleRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.CAP_EM)
                            - possibleRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                                    + HotelingConstants.EM_OCCUPY));
            }
        }
    }
    
    /**
     * Remove un-available rooms from possible rooms.
     * 
     * @param possibleRooms < List<DataRecord > possible rooms
     * @return the rooms list after removed the unavailable rooms
     */
    private static List<DataRecord> removeUnAvailableRoomFromPossibleRooms(
            final List<DataRecord> possibleRooms) {
        final List<DataRecord> availableRooms = new ArrayList<DataRecord>();
        for (final DataRecord possibleRoom : possibleRooms) {
            if (possibleRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.CAP_EM)
                    - possibleRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.EM_OCCUPY) > 0) {
                availableRooms.add(possibleRoom);
            }
        }
        
        return availableRooms;
    }
    
    /**
     * apply min building space and min floor space restriction from console filter.
     * 
     * @param availableRooms < List<DataRecord> > availableRooms
     * @param filterParameters < JSONObject > filter parameters
     * @return the rooms list after apply the min space restriction
     */
    private static List<DataRecord> applyMinSpaceRestriction(final List<DataRecord> availableRooms,
            final JSONObject filterParameters) {
        
        List<DataRecord> matchMinSpaceRooms = availableRooms;
        if (filterParameters.has(HotelingConstants.MIN_BL_SPACE)
                && StringUtil.notNullOrEmpty(filterParameters
                    .getString(HotelingConstants.MIN_BL_SPACE))) {
            matchMinSpaceRooms = applyBlMinSpaceRestriction(matchMinSpaceRooms, filterParameters);
        }
        
        if (filterParameters.has(HotelingConstants.MIN_BL_SPACE)
                && StringUtil.notNullOrEmpty(filterParameters
                    .getString(HotelingConstants.MIN_FL_SPACE))) {
            matchMinSpaceRooms = applyFlMinSpaceRestriction(matchMinSpaceRooms, filterParameters);
        }
        
        return matchMinSpaceRooms;
    }
    
    /**
     * apply min building space and min floor space restriction from console filter.
     * 
     * @param availableRooms < List<DataRecord> > availableRooms
     * @param filterParameters < JSONObject > filter parameters
     * @return the rooms list after apply the min space restriction
     */
    private static List<DataRecord> applyBlMinSpaceRestriction(
            final List<DataRecord> availableRooms, final JSONObject filterParameters) {
        final int minBlSpace =
                Integer.parseInt(filterParameters.getString(HotelingConstants.MIN_BL_SPACE));
        final HashSet<String> blSet = new HashSet<String>();
        for (final DataRecord availableRoom : availableRooms) {
            blSet.add(availableRoom.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.BL_ID));
        }
        
        for (final String blId : blSet) {
            int totalSpace = 0;
            for (final DataRecord availableRoom : availableRooms) {
                if (blId.equals(availableRoom.getString(HotelingConstants.T_RM
                        + HotelingConstants.DOT + HotelingConstants.BL_ID))) {
                    totalSpace +=
                            availableRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                                    + HotelingConstants.AVAIL_SPACE);
                }
            }
            
            for (final DataRecord availableRoom : availableRooms) {
                if (blId.equals(availableRoom.getString(HotelingConstants.T_RM
                        + HotelingConstants.DOT + HotelingConstants.BL_ID))) {
                    availableRoom.setValue(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.BL_AVAIL_SPACE, totalSpace);
                }
            }
        }
        
        final List<DataRecord> matchMinBlSpaceRooms = new ArrayList<DataRecord>();
        for (final DataRecord availableRoom : availableRooms) {
            if (availableRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.BL_AVAIL_SPACE) >= minBlSpace) {
                matchMinBlSpaceRooms.add(availableRoom);
            }
        }
        
        return matchMinBlSpaceRooms;
    }
    
    /**
     * apply min building space and min floor space restriction from console filter.
     * 
     * @param availableRooms < List<DataRecord> > availableRooms
     * @param filterParameters < JSONObject > filter parameters
     * @return the rooms list after apply the min space restriction
     */
    private static List<DataRecord> applyFlMinSpaceRestriction(
            final List<DataRecord> availableRooms, final JSONObject filterParameters) {
        final int minFlSpace =
                Integer.parseInt(filterParameters.getString(HotelingConstants.MIN_FL_SPACE));
        final HashSet<String> flSet = new HashSet<String>();
        for (final DataRecord availableRoom : availableRooms) {
            flSet.add(availableRoom.getString(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.BL_FL));
        }
        
        for (final String flId : flSet) {
            int totalSpace = 0;
            for (final DataRecord availableRoom : availableRooms) {
                if (flId.equals(availableRoom.getString(HotelingConstants.T_RM
                        + HotelingConstants.DOT + HotelingConstants.BL_FL))) {
                    totalSpace +=
                            availableRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                                    + HotelingConstants.AVAIL_SPACE);
                }
            }
            
            for (final DataRecord availableRoom : availableRooms) {
                if (flId.equals(availableRoom.getString(HotelingConstants.T_RM
                        + HotelingConstants.DOT + HotelingConstants.BL_FL))) {
                    availableRoom.setValue(HotelingConstants.T_RM + HotelingConstants.DOT
                            + HotelingConstants.FL_AVAIL_SPACE, totalSpace);
                }
            }
        }
        
        final List<DataRecord> matchMinFlSpaceRooms = new ArrayList<DataRecord>();
        for (final DataRecord availableRoom : availableRooms) {
            if (availableRoom.getInt(HotelingConstants.T_RM + HotelingConstants.DOT
                    + HotelingConstants.FL_AVAIL_SPACE) >= minFlSpace) {
                matchMinFlSpaceRooms.add(availableRoom);
            }
        }
        
        return matchMinFlSpaceRooms;
        
    }
    
    /**
     * Build sql restriction from the search parameter in the client side .
     * 
     * @param filterParameters < JSONObject > filter values
     * @return restriction
     */
    private static String buildRestrictionFromSearchParameter(final JSONObject filterParameters) {
        
        final StringBuilder restriction = new StringBuilder(" rm.hotelable=1 ");
        
        addRestrictionByFieldName(filterParameters, HotelingConstants.BL_ID, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.FL_ID, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.RM_ID, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.RM_CAT, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.RM_TYPE, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.RM_STD, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.DV_ID, restriction);
        addRestrictionByFieldName(filterParameters, HotelingConstants.DP_ID, restriction);
        
        final String emId = filterParameters.getString("emId");
        
        if (StringUtil.notNullOrEmpty(emId)) {
            restriction.append(" AND  " + getRoomStandardRestrictionForEmployee(emId));
        }
        
        return restriction.toString();
    }
    
    /**
     * Add restriction by field name.
     * 
     * @param filterParameters < JSONObject > filter values
     * @param fieldName field name
     * @param restriction restriction
     */
    private static void addRestrictionByFieldName(final JSONObject filterParameters,
            final String fieldName, final StringBuilder restriction) {
        if (filterParameters.has(fieldName)) {
            final String value = filterParameters.getString(fieldName);
            if (StringUtil.notNullOrEmpty(value)) {
                restriction.append(" AND rm." + fieldName + "= ").append(
                    HotelingUtility.literal(value));
            }
        }
        
    }
    
    /**
     * get room standard restriction followed rmstd_emstd table for given employee.
     * 
     * @param emId employee
     * @return restriction
     *         <p>
     *         Suppress warning PMD.AvoidUsingSql.
     *         <p>
     *         Justification: Case #1: SQL statements with subqueries.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String getRoomStandardRestrictionForEmployee(final String emId) {
        String restriction = " 1=1 ";
        String emStd = "";
        if (StringUtil.notNullOrEmpty(emId)) {
            emStd = HotelingUtility.getEmployeeStandard(emId);
            if (StringUtil.notNullOrEmpty(emStd)) {
                restriction =
                        " rm.rm_std IN ( " + " SELECT rmstd_emstd.rm_std " + " FROM rmstd_emstd "
                                + " WHERE rmstd_emstd.em_std = " + HotelingUtility.literal(emStd)
                                + " ) " + " OR rm.rm_std NOT IN ("
                                + " SELECT rmstd_emstd.rm_std FROM rmstd_emstd  " + " )" + " OR "
                                + HotelingUtility.literal(emStd)
                                + " NOT IN (SELECT rmstd_emstd.em_std FROM rmstd_emstd)";
                restriction = "(" + restriction + ")";
            }
        }
        return restriction;
    }
    
}
