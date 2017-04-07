package com.archibus.eventhandler.waste;

import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Constants for Waste Management Activity.
 * 
 * 
 * @author ASC-BJ
 */
public final class WasteCommonHelper {
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteCommonHelper() {
        
    }
    
    /**
     * check generator id.
     * 
     * @param manifestNum String
     * @return boolean
     */
    public static boolean checkGenId(final String manifestNum) {
        final DataSource wasteoutDS =
                DataSourceFactory.createDataSourceForFields(WasteConstants.WASTE_OUT, new String[] {
                        WasteConstants.WASTE_ID, WasteConstants.MANIFEST_NUMBER,
                        WasteConstants.STATUS, WasteConstants.GENERATOR_ID });
        final List<DataRecord> wasteWithGenarator =
                wasteoutDS.getRecords(WasteConstants.MANIFEST_NUMBER_EQUAL + manifestNum
                        + WasteConstants.AND_GENERATOR_ID_IS_NOT_NULL);
        boolean check = true;
        if (!wasteWithGenarator.isEmpty()) {
            final String genId =
                    wasteWithGenarator.get(0).getString(WasteConstants.WASTE_OUT_GENERATOR_ID);
            for (int i = 1; i < wasteWithGenarator.size(); i++) {
                if (!genId.equals(wasteWithGenarator.get(i).getString(
                    WasteConstants.WASTE_OUT_GENERATOR_ID))) {
                    check = false;
                    break;
                }
            }
        }
        return check;
    }
    
    /**
     * Create a new waste out record according to field values in transferred waste object.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param isGenerated boolean whether set the new record status to G(Generated)
     * @param isFromGenerationView boolean
     * @return int
     */
    public static int createNewWaste(final JSONObject wasteObject, final boolean isGenerated,
            final boolean isFromGenerationView) {
        // get dataSource from axvw file
        final DataSource wasteOutDS =
                DataSourceFactory.loadDataSourceFromFile(
                    WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW, WasteConstants.DS_WASTE_OUT);
        final DataRecord wasteOut = wasteOutDS.createRecord();
        final Iterator<String> fieldNames = wasteObject.keys();
        // set value to new waste record
        while (fieldNames.hasNext()) {
            final String fieldName = fieldNames.next();
            if (null != wasteOut.findField(fieldName)) {
                final Object formValue = WasteUtility.convertField(fieldName, wasteObject);
                wasteOut.setValue(fieldName, formValue);
            }
        }
        wasteOut.setValue(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID, "");
        wasteOut.setNew(true);
        DataRecord record = null;
        if (isGenerated) {
            wasteOut.setValue("waste_out.status", "G");
            record = wasteOutDS.saveRecord(wasteOut);
            if (isFromGenerationView) {
                returnWasteCode(record);
            }
            
        } else {
            record = wasteOutDS.saveRecord(wasteOut);
            if (!isFromGenerationView) {
                returnWasteCode(record);
            }
        }
        return record.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID);
    }
    
    /**
     * return waste code for view.
     * 
     * @param record DataRecord
     */
    private static void returnWasteCode(final DataRecord record) {
        final JSONObject json = new JSONObject();
        json.put(WasteConstants.WASTE_ID, record.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID));
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * Get waste record object by given PK waste_id.
     * 
     * @param wasteId waste code
     * @return DataRecord
     */
    public static DataRecord getWasteById(final int wasteId) {
        
        // create waste out datasource, add necessary fields such as waste_id, status, quantity,
        // date_end, etc.
        final DataSource wasteOutDS =
                DataSourceFactory.loadDataSourceFromFile(
                    WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW, WasteConstants.DS_WASTE_OUT);
        // pass wasteId as restriction and get a waste out record by using datasource API.
        wasteOutDS.addParameter("waste_out.waste_id", wasteId, DataSource.DATA_TYPE_INTEGER);
        wasteOutDS.addRestriction(Restrictions.eq(WasteConstants.WASTE_OUT, "waste_id", wasteId));
        // Return waste out record
        
        return wasteOutDS.getRecord();
    }
    
    /**
     * Get waste record that matching the field values of given waste object.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @return DataRecord
     */
    public static DataRecord getMatchedWaste(final JSONObject wasteObject) {
        
        final DataSource wasteOutDS =
                DataSourceFactory.loadDataSourceFromFile(
                    WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW, WasteConstants.DS_WASTE_OUT);
        // the array for different status and dispostion type to get match waste
        final String[] fieldNamesForAS =
                new String[] { WasteConstants.F_WASTE_OUT_DOT_STATUS, "waste_out.generator_id",
                        "waste_out.storage_location", WasteConstants.F_WASTE_OUT_WASTE_PROFILE,
                        WasteConstants.F_WASTE_OUT_DOT_UNITS_TYPE,
                        WasteConstants.F_WASTE_OUT_DOT_CONTAINER_CODE,
                        WasteConstants.F_WASTE_OUT_WASTE_DISPOSITION };
        final String[] fieldNamesForDD =
                new String[] { WasteConstants.F_WASTE_OUT_DOT_STATUS,
                        WasteConstants.F_WASTE_OUT_WASTE_DISPOSITION,
                        WasteConstants.F_WASTE_OUT_WASTE_PROFILE,
                        WasteConstants.F_WASTE_OUT_DOT_UNITS_TYPE,
                        WasteConstants.F_WASTE_OUT_SITE_ID,
                        WasteConstants.F_WASTE_OUT_DOT_CONTAINER_CODE, "waste_out.date_start",
                        WasteConstants.F_WASTE_OUT_DOT_DATE_END, "waste_out.time_start",
                        "waste_out.time_end" };
        final String[] fieldNamesForDS =
                new String[] { WasteConstants.F_WASTE_OUT_DOT_STATUS,
                        WasteConstants.F_WASTE_OUT_WASTE_DISPOSITION, "waste_out.shipment_id",
                        WasteConstants.F_WASTE_OUT_WASTE_PROFILE,
                        WasteConstants.F_WASTE_OUT_DOT_UNITS_TYPE,
                        WasteConstants.F_WASTE_OUT_SITE_ID, "waste_out.date_shipped",
                        "waste_out.manifest_number", WasteConstants.F_WASTE_OUT_DOT_CONTAINER_CODE };
        final String status = wasteObject.getString(WasteConstants.F_WASTE_OUT_DOT_STATUS);
        // check dispotion type for status "D"
        final DataSource disDS =
                DataSourceFactory.createDataSourceForFields(WasteConstants.T_WASTE_DISPOSITIONS,
                    new String[] { "waste_dispositions.waste_disposition",
                            WasteConstants.F_WASTE_DISPOSITIONS_DISPOSITION_TYPE });
        final String dispos = wasteObject.getString("waste_out.waste_disposition");
        disDS.addRestriction(Restrictions.eq(WasteConstants.T_WASTE_DISPOSITIONS,
            "waste_disposition", dispos));
        final DataRecord disRecord = disDS.getRecord();
        String disType = null;
        if (null != disRecord) {
            disType = disRecord.getString(WasteConstants.F_WASTE_DISPOSITIONS_DISPOSITION_TYPE);
        }
        // add restriction for match
        final boolean isAccumulatedOrStored =
                WasteConstants.STATUS_A.equals(status) || WasteConstants.STATUS_S.equals(status);
        if (isAccumulatedOrStored) {
            
            addRestrictionForMatch(wasteObject, wasteOutDS, fieldNamesForAS);
        } else if (WasteConstants.STATUS_D.equals(status)
                && (WasteConstants.STATUS_S.equals(disType) || "Shipment".equals(disType))) {
            
            addRestrictionForMatch(wasteObject, wasteOutDS, fieldNamesForDS);
            
        } else if (WasteConstants.STATUS_D.equals(status)
                && (WasteConstants.STATUS_D.equals(disType) || "Discharge".equals(disType))) {
            
            addRestrictionForMatch(wasteObject, wasteOutDS, fieldNamesForDD);
            
        }
        
        return wasteOutDS.getRecord();
    }
    
    /**
     * add Restriction For Match.
     * 
     * @param wasteObject JSONObject
     * @param wasteOutDS DataSource
     * @param fieldNamesForAS String[]
     */
    private static void addRestrictionForMatch(final JSONObject wasteObject,
            final DataSource wasteOutDS, final String[] fieldNamesForAS) {
        for (final String element : fieldNamesForAS) {
            final String[] names = element.split(WasteConstants.DOT_SEPERATOR);
            if ("".equals(wasteObject.getString(element))) {
                wasteOutDS.addRestriction(Restrictions.isNull(names[0], names[1]));
            } else {
                wasteOutDS.addRestriction(Restrictions.eq(names[0], names[1],
                    WasteUtility.convertField(element, wasteObject)));
            }
        }
    }
    
    /**
     * Process matched waste record.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param matchedWaste DataRecord matched waste record
     * @param isFromGenerationView the flag of whether the value is from the Track Generation view
     * @return int
     */
    public static int processMatchedWaste(final JSONObject wasteObject,
            final DataRecord matchedWaste, final boolean isFromGenerationView) {
        // get dataSourse from axvw file
        final DataSource wasteOutDS =
                DataSourceFactory.loadDataSourceFromFile(
                    WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW, WasteConstants.DS_WASTE_OUT);
        
        final double matchQuantity =
                matchedWaste.getDouble(WasteConstants.F_WASTE_OUT_DOT_QUANTITY);
        
        final Date newStartDate =
                WasteUtility.getDateByString(wasteObject
                    .getString(WasteConstants.F_WASTE_OUT_DOT_DATE_START));
        
        final Date matchStartDate = matchedWaste.getDate(WasteConstants.F_WASTE_OUT_DOT_DATE_START);
        final String unitsType = wasteObject.getString(WasteConstants.F_WASTE_OUT_DOT_UNITS_TYPE);
        final String sourceUnit = wasteObject.getString(WasteConstants.F_WASTE_OUT_DOT_UNITS);
        final String destUnit = matchedWaste.getString(WasteConstants.F_WASTE_OUT_DOT_UNITS);
        // convert quantity value by unit
        final double quantity =
                WasteUtility.getConvertedValueByUnit(unitsType, sourceUnit, destUnit,
                    wasteObject.getDouble(WasteConstants.F_WASTE_OUT_DOT_QUANTITY));
        // update values to matched waste record
        updateValuesToMatchedWaste(wasteObject, matchedWaste);
        
        matchedWaste.setValue(WasteConstants.F_WASTE_OUT_DOT_DATE_START, matchStartDate);
        if (0.00 == matchQuantity) {
            matchedWaste.setValue(WasteConstants.F_WASTE_OUT_DOT_DATE_START, newStartDate);
        } else if (matchQuantity > 0 && null != matchStartDate && null != newStartDate
                && newStartDate.before(matchStartDate)) {
            matchedWaste.setValue(WasteConstants.F_WASTE_OUT_DOT_DATE_START, newStartDate);
        }
        
        matchedWaste.setValue(WasteConstants.F_WASTE_OUT_DOT_QUANTITY, quantity + matchQuantity);
        
        wasteOutDS.saveRecord(matchedWaste);
        if (!isFromGenerationView) {
            returnWasteCode(matchedWaste);
        }
        // retrun waste code for refresh form panel
        return matchedWaste.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID);
    }
    
    /**
     * Process matched waste record.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param matchedWaste DataRecord matched waste record
     * 
     */
    private static void updateValuesToMatchedWaste(final JSONObject wasteObject,
            final DataRecord matchedWaste) {
        final Iterator<String> fieldNames = wasteObject.keys();
        // update Values To Matched Waste
        while (fieldNames.hasNext()) {
            final String fieldName = fieldNames.next();
            if (null != matchedWaste.findField(fieldName)) {
                compareAndSetFieldValue(wasteObject, matchedWaste, fieldName);
            }
        }
    }
    
    /**
     * Process matched waste record.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param matchedWaste DataRecord matched waste record
     * @param fieldName String field name
     * 
     */
    private static void compareAndSetFieldValue(final JSONObject wasteObject,
            final DataRecord matchedWaste, final String fieldName) {
        
        final Object matchValue = matchedWaste.getValue(fieldName);
        final Object formValue = WasteUtility.convertField(fieldName, wasteObject);
        // setting conflicting, not null, non-required fields to null and updating database
        // fields currently having null values with values from the form. Update date_end with
        // the oldest date_end.
        final boolean isAllowNull = matchedWaste.findField(fieldName).getFieldDef().getAllowNull();
        if (formValue != null && !"".equals(formValue) && null == matchValue) {
            matchedWaste.setValue(fieldName, formValue);
        } else if (isAllowNull && null != formValue && null != matchValue
                && !matchValue.equals(formValue)) {
            matchedWaste.setValue(fieldName, null);
        }
        
        setDateEndValue(wasteObject, matchedWaste, fieldName, formValue, matchValue);
    }
    
    /**
     * Process matched waste record.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param matchedWaste DataRecord matched waste record
     * @param fieldName String field name
     * @param fieldValue Object field value from client form
     * @param matchValue Object field value from matched waste
     * 
     */
    private static void setDateEndValue(final JSONObject wasteObject,
            final DataRecord matchedWaste, final String fieldName, final Object fieldValue,
            final Object matchValue) {
        if (WasteConstants.F_WASTE_OUT_DOT_DATE_END.equals(fieldName) && fieldValue != null
                && null != matchValue) {
            
            final Date dateFieldValue =
                    WasteUtility.getDateByString(wasteObject.getString(fieldName));
            matchedWaste.setValue(fieldName, matchValue);
            if (null != dateFieldValue && dateFieldValue.after((Date) matchValue)) {
                matchedWaste.setValue(fieldName, dateFieldValue);
            }
        }
    }
    
    /**
     * update WasteOut By Status.
     * 
     * @param wasteObject JSONObject
     * @param status String
     * @param disTypeFlagS boolean
     * @param isFromGenerationView boolean
     * @return int
     */
    public static int updateWasteByStatus(final JSONObject wasteObject, final String status,
            final boolean disTypeFlagS, final boolean isFromGenerationView) {
        int wasteCode = 0;
        if (WasteConstants.STATUS_A.equals(status) || WasteConstants.STATUS_S.equals(status)
                || (WasteConstants.STATUS_D.equals(status) && disTypeFlagS)) {
            final DataRecord matchWaste = WasteCommonHelper.getMatchedWaste(wasteObject);
            if (matchWaste == null) {
                wasteCode = WasteCommonHelper.createNewWaste(wasteObject, false, false);
            } else {
                wasteCode =
                        WasteCommonHelper.processMatchedWaste(wasteObject, matchWaste,
                            isFromGenerationView);
            }
        }
        return wasteCode;
    }
    
    /**
     * Update or deleteWaste by quantity.
     * 
     * @param wasteObject JSONObject
     * @param wasteOutDS DataSource
     * @param wasteOut DataRecord
     * @param quantity Double
     * @return boolean
     */
    public static boolean updateOrDeleteWasteByQuantity(final JSONObject wasteObject,
            final DataSource wasteOutDS, final DataRecord wasteOut, final Double quantity) {
        boolean isDelete = false;
        if (Double.valueOf(0.00).equals(quantity)) {
            // IOAN KB 3041593
            final DataSource delDs =
                    DataSourceFactory.createDataSourceForFields(WasteConstants.WASTE_OUT,
                        new String[] { WasteConstants.WASTE_ID });
            final String wasteOutPkField = WasteConstants.WASTE_OUT + "." + WasteConstants.WASTE_ID;
            final DataRecord delRecord = delDs.createRecord();
            delRecord.setNew(false);
            delRecord.setValue(wasteOutPkField, wasteOut.getValue(wasteOutPkField));
            delDs.deleteRecord(delRecord);
            // // set disposition type to null for delete record
            wasteOut.setValue(WasteConstants.F_WASTE_DISPOSITIONS_DISPOSITION_TYPE, null);
            // wasteOutDS.deleteRecord(wasteOut);
            isDelete = true;
        } else {
            // set quantity value and save record
            wasteOut.setValue(WasteConstants.F_WASTE_OUT_DOT_QUANTITY, quantity);
            wasteOutDS.saveRecord(wasteOut);
        }
        return isDelete;
    }
    
}
