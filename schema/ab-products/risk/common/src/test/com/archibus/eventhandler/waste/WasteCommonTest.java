package com.archibus.eventhandler.waste;

import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Waste Management Common Test.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteCommonTest extends DataSourceTestBase {
    
    /**
     * Indicates a sring.
     */
    private static final String MANIFEST_NUMBER_IS_NOT_NULL = "manifest_number is not null";
    
    /**
     * Waste Management Common Class.
     */
    private final WasteCommon wasteCommon = new WasteCommon();
    
    /**
     * Waste Out Datasource.
     */
    private final DataSource wasteoutDS = DataSourceFactory.createDataSourceForFields("waste_out",
        new String[] { "waste_id", "manifest_number", "status", "generator_id" });
    
    /**
     * Test updateWasteManifestSet .
     * 
     */
    public void testUpdateWasteManifest() {
        final JSONArray records = new JSONArray();
        final DataRecord wasteRecord = this.wasteoutDS.getRecord(MANIFEST_NUMBER_IS_NOT_NULL);
        String manifestNum = "";
        if (wasteRecord != null) {
            manifestNum = wasteRecord.getString(WasteConstants.WASTE_OUT_MANIFEST_NUMBER);
            final int wasteId = wasteRecord.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID);
            final JSONObject rec = new JSONObject();
            rec.put(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID, wasteId);
            records.put(rec);
        }
        this.wasteCommon.updateWasteManifest(manifestNum, records);
        
    }
    
    /**
     * Test updateWasteManifestSet .
     * 
     */
    public void testCheckFieldVlauesExist() {
        final JSONArray records = new JSONArray();
        
        final JSONObject blRec = new JSONObject();
        blRec.put("tableName", "bl");
        blRec.put("fieldName", "bl_id");
        blRec.put("fieldValue", "HQ");
        records.put(blRec);
        
        this.wasteCommon.checkFieldVlauesExist(records);
        
    }
    
    /**
     * Test GenerateManifestPdf .
     * 
     * @throws Exception e
     * 
     */
    public void testGenerateManifestPdf() throws Exception {
        final DataRecord wasteRecord = this.wasteoutDS.getRecord(MANIFEST_NUMBER_IS_NOT_NULL);
        final JSONArray records = new JSONArray();
        String manifestNum = "";
        if (wasteRecord != null) {
            manifestNum = wasteRecord.getString(WasteConstants.WASTE_OUT_MANIFEST_NUMBER);
            final JSONObject rec = new JSONObject();
            rec.put(WasteConstants.WASTE_OUT_MANIFEST_NUMBER, manifestNum);
            records.put(rec);
        }
        this.wasteCommon.generateManifestPdf(records);
    }
    
    /**
     * Test checkGenId .
     * 
     * @throws Exception e
     * 
     */
    public void testCheckGenId() throws Exception {
        final DataRecord wasteRecord = this.wasteoutDS.getRecord(MANIFEST_NUMBER_IS_NOT_NULL);
        String manifestNum = "";
        if (wasteRecord != null) {
            manifestNum = wasteRecord.getString(WasteConstants.WASTE_OUT_MANIFEST_NUMBER);
        }
        WasteCommonHelper.checkGenId(manifestNum);
    }
    
    /**
     * Test GenerateSelectedLabels .
     * 
     * @throws Exception e
     * 
     */
    public void testGenerateSelectedLabels() throws Exception {
        final DataRecord wasteRecord = this.wasteoutDS.getRecord(MANIFEST_NUMBER_IS_NOT_NULL);
        final JSONArray records = new JSONArray();
        if (wasteRecord != null) {
            final int wasteId = wasteRecord.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID);
            final JSONObject rec = new JSONObject();
            rec.put(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID, wasteId);
            records.put(rec);
        }
        this.wasteCommon.generateSelectedLabels(records);
    }
    
}
