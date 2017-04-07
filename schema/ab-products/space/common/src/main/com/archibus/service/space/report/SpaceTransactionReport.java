package com.archibus.service.space.report;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.helper.SpaceTransactionUtil;

/**
 * <p>
 * Space Transaction Report Class, Added by ASC-BJ, Guo Jiangtao.<br>
 * 
 * <p>
 * 
 */
public class SpaceTransactionReport {
    /**
     * the record size of occupancy summary grid of Space Planning Console report.
     */
    static final int OCCUPANCY_SUMMARY_GRID_RECORD_SIZE = 5;
    
    /**
     * field "rm.occupancy".
     */
    static final String RM_OCCUPANCY = "rm.occupancy";
    
    /**
     * field "rm.hpattern_acad".
     */
    static final String RM_HAPATTERN_ACAD = "rm.hpattern_acad";
    
    /**
     * field "rm.count_rm".
     */
    static final String RM_COUNT_RM = "rm.count_rm";
    
    /**
     * field "rm.area_rm_total".
     */
    static final String RM_AREA_RM_TOTAL = "rm.area_rm_total";
    
    /**
     * field "rm.cap_em".
     */
    static final String RM_CAP_EM = "rm.cap_em";
    
    /**
     * field "rm.count_em".
     */
    static final String RM_COUNT_EM = "rm.count_em";
    
    /**
     * field "rm.available".
     */
    static final String RM_AVAILABLE = "rm.available";
    
    /**
     * occupiable level - 1:Non-occupiable.
     */
    static final String LEVEL_NON_OCCUPAIABLE = "1";
    
    /**
     * occupiable level - 2:Vacant.
     */
    static final String LEVEL_VACANT = "2";
    
    /**
     * occupiable level -3:Available.
     */
    static final String LEVEL_AVAILABLE = "3";
    
    /**
     * occupiable level - 4:At capacity.
     */
    static final String LEVEL_AT_CAPACITY = "4";
    
    /**
     * occupiable level - 5:Exceeds capacity.
     */
    static final String LEVEL_EXCEEDS_CAPACITY = "5";
    
    /**
     * parameter name :date.
     */
    static final String PARAMETER_DATE = "date";
    
    /**
     * rmpct record list.
     */
    private List<DataRecord> rmpctList;
    
    /**
     * rm record list.
     */
    private List<DataRecord> rmList;
    
    /**
     * Grid Refresh WFR for Occupancy Summary grid in Space Planing Console view.
     * 
     * @param parameters WFR parameters
     * @return data list
     */
    public final DataSetList getOccupancySumaryGridRecordsForSpacePlaningConsole(
            final Map<String, Object> parameters) {
        
        // load the data source form the view
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-sp-hl-rm-by-attribute.axvw",
                    "abSpHlRmByAttribute_rmSummary6DS");
        
        final String blId = (String) parameters.get(SpaceConstants.BLID);
        final String flId = (String) parameters.get(SpaceConstants.FLID);
        final Date date = java.sql.Date.valueOf((String) parameters.get(PARAMETER_DATE));
        
        getRmpctListOfFloor(blId, flId, date);
        getRmListOfFloor(blId, flId);
        
        // retrieve data records
        final List<DataRecord> records = new ArrayList<DataRecord>();
        // 1:Non-occupiable|2:Vacant|3:Available|4:At capacity|5:Exceeds capacity
        records.add(getNonOccupiableRecord(dataSource));
        records.add(getVacantRecord(dataSource));
        records.add(getAvaiableRecord(dataSource));
        records.add(getAtCapacityRecord(dataSource));
        records.add(getExceedsCapacityRecord(dataSource));
        
        // return data records as data set
        final DataSetList dataSet = new DataSetList(records);
        dataSet.setHasMoreRecords(false);
        
        return dataSet;
    }
    
    /**
     * get rmpct records of given floor.
     * 
     * @param blId building code
     * @param flId floor code
     * @param date query date
     * 
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     * 
     *            Justification: Case #1 : Statement with SELECT ... Exists sub-sql pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void getRmpctListOfFloor(final String blId, final String flId, final Date date) {
        
        final DataSource rmpctDS =
                SpaceTransactionUtil.getRmpctHrmpctJoinBlAndRmAndRmcat(SpaceConstants.RMPCT);
        
        rmpctDS.setApplyVpaRestrictions(false);
        
        // CHECKSTYLE:OFF Justification: Keep the sql completed and readable
        final String query =
                "select rm_id, sum(1* (case when day_part = 0 then 1 else 0.5 end)) ${sql.as} count_em from rmpct "
                        + " where ${sql.vpaRestriction} and bl_id = ${parameters['blId']}  and fl_id = ${parameters['flId']} "
                        + " and (date_start IS NULL OR date_start &lt;= ${parameters['date']}) "
                        + " and (date_end IS NULL OR date_end &gt;= ${parameters['date']}) "
                        + " and em_id is not null and status = 1 group by rm_id "
                        + "union select rm_id, sum(1* (case when day_part = 0 then 1 else 0.5 end)) ${sql.as} count_em from (select * from hrmpct ) ${sql.as} rmpct "
                        + " where ${sql.vpaRestriction} and bl_id = ${parameters['blId']}  and fl_id = ${parameters['flId']}"
                        + " and (date_start IS NULL OR date_start &lt;= ${parameters['date']}) "
                        + " and (date_end IS NULL OR date_end &gt;= ${parameters['date']}) "
                        + " and em_id is not null and status = 1 group by rm_id ";
        // CHECKSTYLE:ON
        rmpctDS.addQuery(query);
        rmpctDS.addVirtualField(SpaceConstants.RMPCT, SpaceConstants.RM_ID,
            DataSource.DATA_TYPE_TEXT);
        rmpctDS.addVirtualField(SpaceConstants.RMPCT, "count_em", DataSource.DATA_TYPE_NUMBER);
        rmpctDS.addParameter(SpaceConstants.BLID, blId, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(SpaceConstants.FLID, flId, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(PARAMETER_DATE, date, DataSource.DATA_TYPE_DATE);
        rmpctDS.setMaxRecords(0);
        
        this.rmpctList = rmpctDS.getAllRecords();
        
    }
    
    /**
     * get rm records of given floor.
     * 
     * @param blId building code
     * @param flId floor code
     */
    private void getRmListOfFloor(final String blId, final String flId) {
        final DataSource rmDS = SpaceTransactionUtil.getRmDataSource();
        rmDS.addRestriction(Restrictions.eq(SpaceConstants.T_RM, SpaceConstants.BL_ID, blId));
        rmDS.addRestriction(Restrictions.eq(SpaceConstants.T_RM, SpaceConstants.FL_ID, flId));
        rmDS.setMaxRecords(0);
        
        this.rmList = rmDS.getAllRecords();
        for (final DataRecord rm : this.rmList) {
            double countEm = 0;
            
            final List<DataRecord> excludeRmpctList = new ArrayList<DataRecord>();
            for (final DataRecord rmpct : this.rmpctList) {
                if (rm.getString(SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_ID)
                    .equals(
                        rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                                + SpaceConstants.RM_ID))) {
                    
                    countEm += rmpct.getDouble("rmpct.count_em");
                } else {
                    excludeRmpctList.add(rmpct);
                }
            }
            
            rm.setValue(RM_COUNT_EM, countEm);
            this.rmpctList = excludeRmpctList;
        }
    }
    
    /**
     * get non occupiable record.
     * 
     * @param dataSource dataSource Object
     * @return non occupiable record
     */
    private DataRecord getNonOccupiableRecord(final DataSource dataSource) {
        return getOccupancyLevelRecord(dataSource, LEVEL_NON_OCCUPAIABLE, "14 0 7 10066329");
    }
    
    /**
     * get vacant record.
     * 
     * @param dataSource dataSource Object
     * @return vacant record
     */
    private DataRecord getVacantRecord(final DataSource dataSource) {
        return getOccupancyLevelRecord(dataSource, LEVEL_VACANT, "14 0 3 65280");
    }
    
    /**
     * get Avaiable record.
     * 
     * @param dataSource dataSource Object
     * @return Avaiable record
     */
    private DataRecord getAvaiableRecord(final DataSource dataSource) {
        return getOccupancyLevelRecord(dataSource, LEVEL_AVAILABLE, "14 0 5 255");
    }
    
    /**
     * get At Capacity record.
     * 
     * @param dataSource dataSource Object
     * @return At Capacity record
     */
    private DataRecord getAtCapacityRecord(final DataSource dataSource) {
        return getOccupancyLevelRecord(dataSource, LEVEL_AT_CAPACITY, "14 0 7 16763904");
    }
    
    /**
     * get Exceeds Capacity record.
     * 
     * @param dataSource dataSource Object
     * @return Exceeds Capacity record
     */
    private DataRecord getExceedsCapacityRecord(final DataSource dataSource) {
        return getOccupancyLevelRecord(dataSource, LEVEL_EXCEEDS_CAPACITY, "14 0 1 16711680");
    }
    
    /**
     * get occupancy level record.
     * 
     * @param dataSource occupancy level dataSource
     * @param level occupancy level
     * @param hPattern hatch pattern
     * @return occupancy level record;
     */
    private DataRecord getOccupancyLevelRecord(final DataSource dataSource, final String level,
            final String hPattern) {
        final DataRecord occupancyLevelRecord = dataSource.createRecord();
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_OCCUPANCY));
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_HAPATTERN_ACAD));
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_COUNT_RM));
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_COUNT_EM));
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_CAP_EM));
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_AVAILABLE));
        occupancyLevelRecord.addField(dataSource.findVirtualField(RM_AREA_RM_TOTAL));
        
        final Map<String, Object> values = getOccupancyLevelRecordValues(level);
        occupancyLevelRecord.setValue(RM_OCCUPANCY, level);
        occupancyLevelRecord.setValue(RM_HAPATTERN_ACAD, hPattern);
        occupancyLevelRecord.setValue(RM_COUNT_RM, values.get(RM_COUNT_RM));
        occupancyLevelRecord.setValue(RM_COUNT_EM, values.get(RM_COUNT_EM));
        occupancyLevelRecord.setValue(RM_CAP_EM, values.get(RM_CAP_EM));
        occupancyLevelRecord.setValue(RM_AVAILABLE, values.get(RM_AVAILABLE));
        occupancyLevelRecord.setValue(RM_AREA_RM_TOTAL, values.get(RM_AREA_RM_TOTAL));
        
        return occupancyLevelRecord;
    }
    
    /**
     * get field values of occupancy level record.
     * 
     * @param level occupancy level
     * @return values
     */
    private Map<String, Object> getOccupancyLevelRecordValues(final String level) {
        
        Map<String, Object> values = new HashMap<String, Object>();
        
        final int levelNum = level.charAt(0);
        switch (levelNum) {
            case '1':
                values = getNonOccupiableRecordValues();
                break;
            case '2':
                values = getVacantRecordValues();
                break;
            case '3':
                values = getAvailableRecordValues();
                break;
            case '4':
                values = getAtCapacityRecordValues();
                break;
            case '5':
                values = getExceedsCapacityRecordValues();
                break;
            default:
                
        }
        
        return values;
    }
    
    /**
     * get field values of Non Occupiable record.
     * 
     * @return values
     */
    private Map<String, Object> getNonOccupiableRecordValues() {
        final Map<String, Object> values = getDefaultOccupancyLevelRecordValues();
        
        for (final DataRecord rm : this.rmList) {
            final boolean isNonOccupiable =
                    rm.getInt(SpaceConstants.RMCAT + SpaceConstants.DOT + SpaceConstants.OCCUPIABLE) == 0;
            if (isNonOccupiable) {
                addOccupancyLevelRecordValuesFromRm(rm, values);
            }
        }
        return values;
    }
    
    /**
     * get field values of vacant record.
     * 
     * @return values
     */
    private Map<String, Object> getVacantRecordValues() {
        final Map<String, Object> values = getDefaultOccupancyLevelRecordValues();
        
        for (final DataRecord rm : this.rmList) {
            final boolean isVacant =
                    rm.getInt(SpaceConstants.RMCAT + SpaceConstants.DOT + SpaceConstants.OCCUPIABLE) == 1
                            && rm.getDouble(RM_COUNT_EM) == 0;
            if (isVacant) {
                addOccupancyLevelRecordValuesFromRm(rm, values);
            }
        }
        
        return values;
    }
    
    /**
     * get field values of Available record.
     * 
     * @return values
     */
    private Map<String, Object> getAvailableRecordValues() {
        final Map<String, Object> values = getDefaultOccupancyLevelRecordValues();
        
        for (final DataRecord rm : this.rmList) {
            final boolean isAvailable =
                    rm.getInt(SpaceConstants.RMCAT + SpaceConstants.DOT + SpaceConstants.OCCUPIABLE) == 1
                            && rm.getDouble(RM_COUNT_EM) > 0
                            && (rm.getInt(RM_CAP_EM) - rm.getDouble(RM_COUNT_EM)) > 0;
            if (isAvailable) {
                addOccupancyLevelRecordValuesFromRm(rm, values);
            }
        }
        
        return values;
    }
    
    /**
     * get field values of At Capacity record.
     * 
     * @return values
     */
    private Map<String, Object> getAtCapacityRecordValues() {
        final Map<String, Object> values = getDefaultOccupancyLevelRecordValues();
        
        for (final DataRecord rm : this.rmList) {
            final boolean isAtCapacity =
                    rm.getInt(SpaceConstants.RMCAT + SpaceConstants.DOT + SpaceConstants.OCCUPIABLE) == 1
                            && rm.getInt(RM_CAP_EM) > 0
                            && (rm.getInt(RM_CAP_EM) - rm.getDouble(RM_COUNT_EM)) == 0;
            if (isAtCapacity) {
                addOccupancyLevelRecordValuesFromRm(rm, values);
            }
        }
        
        return values;
    }
    
    /**
     * get field values of Exceeds Capacity record.
     * 
     * @return values
     */
    private Map<String, Object> getExceedsCapacityRecordValues() {
        final Map<String, Object> values = getDefaultOccupancyLevelRecordValues();
        
        for (final DataRecord rm : this.rmList) {
            final boolean isExceedsCapacity =
                    rm.getInt(SpaceConstants.RMCAT + SpaceConstants.DOT + SpaceConstants.OCCUPIABLE) == 1
                            && (rm.getInt(RM_CAP_EM) - rm.getDouble(RM_COUNT_EM)) < 0;
            
            if (isExceedsCapacity) {
                addOccupancyLevelRecordValuesFromRm(rm, values);
            }
        }
        
        return values;
    }
    
    /**
     * get default field values.
     * 
     * @return values
     */
    private Map<String, Object> getDefaultOccupancyLevelRecordValues() {
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put(RM_COUNT_RM, 0);
        values.put(RM_COUNT_EM, 0.0);
        values.put(RM_CAP_EM, 0);
        values.put(RM_AVAILABLE, 0.0);
        values.put(RM_AREA_RM_TOTAL, 0.0);
        return values;
    }
    
    /**
     * add occupancy level record from rm record.
     * 
     * @param room room record
     * @param values record values
     */
    private void addOccupancyLevelRecordValuesFromRm(final DataRecord room,
            final Map<String, Object> values) {
        values.put(RM_COUNT_RM, (Integer) values.get(RM_COUNT_RM) + 1);
        values.put(
            RM_AREA_RM_TOTAL,
            (Double) values.get(RM_AREA_RM_TOTAL)
                    + room
                        .getDouble(SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.AREA));
        values.put(RM_CAP_EM, (Integer) values.get(RM_CAP_EM) + room.getInt(RM_CAP_EM));
        values.put(RM_COUNT_EM, (Double) values.get(RM_COUNT_EM) + room.getDouble(RM_COUNT_EM));
    }
}
