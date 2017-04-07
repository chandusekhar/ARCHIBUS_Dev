package com.archibus.eventhandler.waste;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Class for WasteCommonHelper unit test.
 * 
 * 
 * @author ASC-BJ
 */
public final class WasteCommonHelperTest extends DataSourceTestBase {
    
    /**
     * Define String WASTE_OUT_GENERATOR_ID.
     */
    static final String WASTE_OUT_GENERATOR_ID = "waste_out.generator_id";
    
    /**
     * Define String WASTE_OUT_CONTAINER_CAT.
     */
    static final String WASTE_OUT_CONTAINER_CAT = "waste_out.container_cat";
    
    /**
     * Define String WASTE_OUT_QUANTITY.
     */
    static final String WASTE_OUT_QUANTITY = "waste_out.quantity";
    
    /**
     * Define String WASTE_OUT_PR_ID.
     */
    static final String WASTE_OUT_PR_ID = "waste_out.pr_id";
    
    /**
     * Define String WASTE_OUT_DATE_SHIPPED.
     */
    static final String WASTE_OUT_DATE_SHIPPED = "waste_out.date_shipped";
    
    /**
     * Define String WASTE_OUT_TIME_END.
     */
    static final String WASTE_OUT_TIME_END = "waste_out.time_end";
    
    /**
     * Define String WASTE_OUT_SITE_ID.
     */
    static final String WASTE_OUT_SITE_ID = "waste_out.site_id";
    
    /**
     * Define String WASTE_OUT_RM_ID.
     */
    static final String WASTE_OUT_RM_ID = "waste_out.rm_id";
    
    /**
     * Define String WASTE_OUT_FL_ID.
     */
    static final String WASTE_OUT_FL_ID = "waste_out.fl_id";
    
    /**
     * Define String WASTE_OUT_UNITS.
     */
    static final String WASTE_OUT_UNITS = "waste_out.units";
    
    /**
     * Define String WASTE_OUT_UNITS_TYPE.
     */
    static final String WASTE_OUT_UNITS_TYPE = "waste_out.units_type";
    
    /**
     * Define String WASTE_OUT_WASTE_DISPOSITION.
     */
    static final String WASTE_OUT_WASTE_DISPOSITION = "waste_out.waste_disposition";
    
    /**
     * Define String WASTE_OUT_STORAGE_LOCATION.
     */
    static final String WASTE_OUT_STORAGE_LOCATION = "waste_out.storage_location";
    
    /**
     * Define String WASTE_OUT_DATE_END.
     */
    static final String WASTE_OUT_DATE_END = "waste_out.date_end";
    
    /**
     * Define String WASTE_OUT_FACILITY_ID.
     */
    static final String WASTE_OUT_FACILITY_ID = "waste_out.facility_id";
    
    /**
     * Define String WASTE_OUT_TIME_START.
     */
    static final String WASTE_OUT_TIME_START = "waste_out.time_start";
    
    /**
     * Define String WASTE_OUT_BL_ID.
     */
    static final String WASTE_OUT_BL_ID = "waste_out.bl_id";
    
    /**
     * Define String WASTE_OUT_NUMBER_CONTAINERS.
     */
    static final String WASTE_OUT_NUMBER_CONTAINERS = "waste_out.number_containers";
    
    /**
     * Define String WASTE_OUT_EQ_ID.
     */
    static final String WASTE_OUT_EQ_ID = "waste_out.eq_id";
    
    /**
     * Define String WASTE_OUT_DISPOSITION_TYPE.
     */
    static final String WASTE_OUT_DISPOSITION_TYPE = "waste_out.disposition_type";
    
    /**
     * Define String WASTE_OUT_CONTAINER_ID.
     */
    static final String WASTE_OUT_CONTAINER_ID = "waste_out.container_id";
    
    /**
     * Define String WASTE_OUT_SHIPMENT_ID.
     */
    static final String WASTE_OUT_SHIPMENT_ID = "waste_out.shipment_id";
    
    /**
     * Define String WASTE_OUT_METHOD_CODE.
     */
    static final String WASTE_OUT_METHOD_CODE = "waste_out.method_code";
    
    /**
     * Define String WASTE_OUT_WASTE_PROFILE.
     */
    static final String WASTE_OUT_WASTE_PROFILE = "waste_out.waste_profile";
    
    /**
     * Define String WASTE_OUT_DV_ID.
     */
    static final String WASTE_OUT_DV_ID = "waste_out.dv_id";
    
    /**
     * Define String WASTE_OUT_EM_ID.
     */
    static final String WASTE_OUT_EM_ID = "waste_out.em_id";
    
    /**
     * Define String WASTE_OUT_STATUS.
     */
    static final String WASTE_OUT_STATUS = "waste_out.status";
    
    /**
     * Define String WASTE_OUT_WASTE_ID.
     */
    static final String WASTE_OUT_WASTE_ID = "waste_out.waste_id";
    
    /**
     * Define String WASTE_OUT_NOTES.
     */
    static final String WASTE_OUT_NOTES = "waste_out.notes";
    
    /**
     * Define String WASTE_OUT_DATE_START.
     */
    static final String WASTE_OUT_DATE_START = "waste_out.date_start";
    
    /**
     * Define String WASTE_OUT_TRANSPORTER_ID.
     */
    static final String WASTE_OUT_TRANSPORTER_ID = "waste_out.transporter_id";
    
    /**
     * Define String WASTE_OUT_CONTACT_ID.
     */
    static final String WASTE_OUT_CONTACT_ID = "waste_out.contact_id";
    
    /**
     * Define String WASTE_OUT_MANIFEST_NUMBER.
     */
    static final String WASTE_OUT_MANIFEST_NUMBER = "waste_out.manifest_number";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String WASTE_OUT_DP_ID = "waste_out.dp_id";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String CONSTRING = "342GHFT24";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final int CON61 = 61;
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String D = "D";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String XC = "XC";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String S = "S";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String OFF_SITE_DISPOSAL = "OFF-SITE DISPOSAL";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String WASTE_DOCK_01 = "WASTE DOCK 01";
    
    /**
     * Define String WASTE_OUT_DP_ID.
     */
    static final String PA22108447 = "PA22108447";
    
    /**
     * Test checkGenId method.
     */
    public static void testCheckGenId() {
        WasteCommonHelper.checkGenId(CONSTRING);
    }
    
    /**
     * Test createNewWaste method.
     */
    public static void testCreateNewWaste() {
        final JSONObject wasteObject = getNewWasteRecords();
        
        WasteCommonHelper.createNewWaste(wasteObject, false, false);
    }
    
    /**
     * Test getWasteById method.
     */
    public static void testGetWasteById() {
        
        WasteCommonHelper.getWasteById(CON61);
        
    }
    
    /**
     * Test getMatchedWaste method.
     */
    public static void testGetMatchedWaste() {
        
        final JSONObject wasteObject = getOldWasteRecords();
        final DataRecord record = WasteCommonHelper.getMatchedWaste(wasteObject);
        if (record == null) {
            System.out.println("Success");
        }
        
    }
    
    /**
     * Test updateOrDeleteWasteByQuantity method.
     */
    public static void testUpdateOrDeleteWasteByQuantity() {
        
        final JSONObject wasteObject = getOldWasteRecords();
        final DataSource wasteOutDS =
                DataSourceFactory.loadDataSourceFromFile(
                    WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW, WasteConstants.DS_WASTE_OUT);
        
        final DataRecord wasteOut = WasteCommonHelper.getMatchedWaste(wasteObject);
        
        final Double quantity = 0.0;
        WasteCommonHelper
            .updateOrDeleteWasteByQuantity(wasteObject, wasteOutDS, wasteOut, quantity);
        
    }
    
    /**
     * Get exists waste records.
     * 
     * @return Waste records JSONObject.
     */
    private static JSONObject getOldWasteRecords() {
        
        final JSONObject json = new JSONObject();
        json.put(WASTE_OUT_GENERATOR_ID, "PA22108447");
        json.put(WASTE_OUT_CONTAINER_CAT, "");
        json.put(WASTE_OUT_QUANTITY, "31.0");
        json.put(WASTE_OUT_PR_ID, "OLD CITY");
        json.put(WASTE_OUT_DATE_SHIPPED, "");
        json.put(WASTE_OUT_TIME_END, "");
        json.put(WASTE_OUT_SITE_ID, "OLDCITY");
        json.put(WASTE_OUT_RM_ID, "");
        json.put(WASTE_OUT_FL_ID, "");
        
        json.put(WASTE_OUT_UNITS, "gallon");
        json.put(WASTE_OUT_UNITS_TYPE, "VOLUME-LIQUID");
        json.put(WASTE_OUT_WASTE_DISPOSITION, OFF_SITE_DISPOSAL);
        json.put(WASTE_OUT_STORAGE_LOCATION, WASTE_DOCK_01);
        json.put(WASTE_OUT_DATE_END, "");
        json.put(WASTE_OUT_FACILITY_ID, "");
        json.put(WASTE_OUT_TIME_START, "");
        
        json.put(WASTE_OUT_BL_ID, XC);
        json.put(WASTE_OUT_NUMBER_CONTAINERS, "1");
        json.put(WASTE_OUT_EQ_ID, "");
        
        json.put(WASTE_OUT_DISPOSITION_TYPE, S);
        json.put(WASTE_OUT_CONTAINER_ID, PA22108447);
        json.put(WASTE_OUT_SHIPMENT_ID, "");
        
        json.put(WASTE_OUT_METHOD_CODE, "");
        json.put(WASTE_OUT_WASTE_PROFILE, "DCM");
        json.put(WASTE_OUT_DV_ID, "ELECTRONIC SYS");
        json.put(WASTE_OUT_EM_ID, "");
        
        json.put(WASTE_OUT_STATUS, D);
        json.put(WASTE_OUT_WASTE_ID, "63");
        json.put(WASTE_OUT_NOTES, "");
        json.put(WASTE_OUT_DATE_START, "2012-05-09");
        
        json.put(WASTE_OUT_TRANSPORTER_ID, "");
        
        json.put(WASTE_OUT_CONTACT_ID, "");
        json.put(WASTE_OUT_MANIFEST_NUMBER, "342GHFT24");
        json.put(WASTE_OUT_DP_ID, "OPERATIONS-MAINT");
        return json;
    }
    
    /**
     * Get new waste records will be created.
     * 
     * @return new waste records will be created.
     */
    private static JSONObject getNewWasteRecords() {
        final JSONObject json = new JSONObject();
        json.put(WASTE_OUT_GENERATOR_ID, "");
        json.put(WASTE_OUT_CONTAINER_CAT, "");
        json.put(WASTE_OUT_QUANTITY, "2");
        json.put(WASTE_OUT_PR_ID, "");
        json.put(WASTE_OUT_DATE_SHIPPED, "2012-11-15");
        json.put(WASTE_OUT_TIME_END, "");
        json.put(WASTE_OUT_SITE_ID, "ATLSTE");
        json.put(WASTE_OUT_RM_ID, "");
        json.put(WASTE_OUT_FL_ID, "");
        
        json.put(WASTE_OUT_UNITS, "kg");
        json.put(WASTE_OUT_UNITS_TYPE, "MASS");
        json.put(WASTE_OUT_WASTE_DISPOSITION, OFF_SITE_DISPOSAL);
        json.put(WASTE_OUT_STORAGE_LOCATION, "");
        json.put(WASTE_OUT_DATE_END, "");
        json.put(WASTE_OUT_FACILITY_ID, "");
        json.put(WASTE_OUT_TIME_START, "");
        
        json.put(WASTE_OUT_BL_ID, "XC");
        json.put(WASTE_OUT_NUMBER_CONTAINERS, "");
        json.put(WASTE_OUT_EQ_ID, "");
        
        json.put(WASTE_OUT_DISPOSITION_TYPE, "S");
        json.put(WASTE_OUT_CONTAINER_ID, "");
        json.put(WASTE_OUT_SHIPMENT_ID, "");
        
        json.put(WASTE_OUT_METHOD_CODE, "");
        json.put(WASTE_OUT_WASTE_PROFILE, "60142");
        json.put(WASTE_OUT_DV_ID, "");
        json.put(WASTE_OUT_EM_ID, "");
        
        json.put(WASTE_OUT_STATUS, "D");
        json.put(WASTE_OUT_WASTE_ID, "");
        json.put(WASTE_OUT_NOTES, "");
        json.put(WASTE_OUT_DATE_START, "");
        
        json.put(WASTE_OUT_TRANSPORTER_ID, "");
        
        json.put(WASTE_OUT_CONTACT_ID, "");
        json.put(WASTE_OUT_MANIFEST_NUMBER, "342GHFT24");
        json.put(WASTE_OUT_DP_ID, "");
        return json;
    }
}
