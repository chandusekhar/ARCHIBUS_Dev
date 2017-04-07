package com.archibus.eventhandler.waste;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.waste.label.*;
import com.archibus.eventhandler.waste.pdf.WasteManifestPdf;
import com.archibus.ext.pdflivecycle.PdfFormExportJob;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Waste Management Common Handler.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteCommon extends JobBase {
    
    /**
     * Indicates the result text context of "Selected Container Labels generated".
     * 
     */
    // @translatable
    private static final String RESULT_TEXT = "Selected Container Labels generated";
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updateWasteManifest WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * Set manifest number to all waste out records contained in array.
     * 
     * @param manifestNum string manifest number
     * @param records JSONArray selected records
     */
    public void updateWasteManifest(final String manifestNum, final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONObject json = new JSONObject();
        if (WasteCommonHelper.checkGenId(manifestNum)) {
            json.put(WasteConstants.CHECK_GEN_ID, WasteConstants.TRUE);
            final DataSource wasteoutDS =
                    DataSourceFactory.loadDataSourceFromFile(
                        WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW,
                        WasteConstants.DS_WASTE_OUT);
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                final DataRecord wasteRecord =
                        wasteoutDS.getRecord(WasteConstants.WASTE_ID_EQUAL
                                + record.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID));
                if (wasteRecord != null) {
                    wasteRecord.setValue(WasteConstants.WASTE_OUT_MANIFEST_NUMBER, manifestNum);
                    wasteRecord.setValue(WasteConstants.F_WASTE_OUT_DOT_STATUS,
                        WasteConstants.STATUS_D);
                    final List<String> fieldNames = wasteoutDS.getFieldNames();
                    final JSONObject wasteObject = new JSONObject();
                    for (int num = 0; num < fieldNames.size(); num++) {
                        final Object fieldValue = wasteRecord.getValue(fieldNames.get(num));
                        final String convertValue = null == fieldValue ? "" : fieldValue.toString();
                        wasteObject.put(fieldNames.get(num), convertValue);
                    }
                    this.saveWaste(wasteObject, false);
                }
            }
            updateWasteout(manifestNum);
        } else {
            json.put(WasteConstants.CHECK_GEN_ID, WasteConstants.FALSE);
        }
        context.addResponseParameter(WasteConstants.JSON_EXPRESSION, json.toString());
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updateWasteManifest WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN checkFieldVlauesExist WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * Check if all field values are existed in their reference tables.
     * 
     * 
     * @param fieldArray JSONArray JSON Object array, each JSON Object contains three key-value
     *            pairs: table name, field name and field value.
     */
    public void checkFieldVlauesExist(final JSONArray fieldArray) {
        final JSONArray results = new JSONArray();
        for (int i = 0; i < fieldArray.length(); i++) {
            final JSONObject field = fieldArray.getJSONObject(i);
            final String tableName = field.getString("tableName");
            final String fieldName = field.getString("fieldName");
            final String fieldValue = field.getString("fieldValue");
            final DataSource validateDS = DataSourceFactory.createDataSource();
            validateDS.addTable(tableName);
            validateDS.addField(fieldName);
            final List<DataRecord> records =
                    validateDS.getRecords(fieldName + "='" + fieldValue + WasteConstants.STRING_1);
            if (records.isEmpty()) {
                results.put(WasteConstants.FALSE);
            } else {
                results.put(WasteConstants.TRUE);
            }
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(WasteConstants.JSON_EXPRESSION, results.toString());
    }
    
    // ---------------------------------------------------------------------------------------------
    // END checkFieldVlauesExist WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN generateManifestPdf WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * generate manifest pdf form.
     * 
     * 
     * @param records JSONArray
     */
    public void generateManifestPdf(final JSONArray records) {
        this.status.setTotalNumber(WasteConstants.MAX_STATUS_NUMBER);
        this.status.setCurrentNumber(0);
        final StringBuffer manifests = new StringBuffer();
        final StringBuffer blankes = new StringBuffer();
        boolean check = true;
        for (int s = 0; s < records.length(); s++) {
            final JSONObject record = records.getJSONObject(s);
            final String manifestNumber = record.getString("waste_manifests.manifest_number");
            if (WasteCommonHelper.checkGenId(manifestNumber)) {
                updateWasteout(manifestNumber);
                final WasteManifestPdf singleManiForm = new WasteManifestPdf(manifestNumber);
                final JobResult result = singleManiForm.generateSingleManifestPdf();
                if (singleManiForm.isBlank()) {
                    blankes.append(manifestNumber + WasteConstants.SPACE);
                }
                if (records.length() == 1) {
                    this.status.setResult(result);
                } else {
                    this.status.addPartialResult(result);
                }
            } else {
                manifests.append(manifestNumber + WasteConstants.SPACE);
                check = false;
            }
        }
        if (!check) {
            manifests.insert(0, "(");
            manifests.append(")can't generate");
            this.status.setMessage(manifests.toString());
        }
        this.status.setMessage(this.status.getMessage() + "." + blankes.toString());
    }
    
    // ---------------------------------------------------------------------------------------------
    // END generateManifestPdf WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN generateSelectedLabels WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * generate lable.
     * 
     * 
     * @param records JSONArray selected records
     */
    public void generateSelectedLabels(final JSONArray records) {
        // Init status
        this.status.setTotalNumber(WasteConstants.MAX_STATUS_NUMBER);
        this.status.setCurrentNumber(0);
        
        // Load aspose word license
        DocxUtility.loadDocxLibraryLicense();
        
        // Define dataSource for waste out table
        final DataSource wasteoutDS = DataSourceFactory.createDataSource();
        final DataSource generatorDS = DataSourceFactory.createDataSource();
        
        // Init dataSorce ,add field
        WasteUtility.initialDatsaSourcesForLabels(wasteoutDS, generatorDS);
        
        // Set status's scale
        final int countStep =
                WasteConstants.MAX_STATUS_NUMBER
                        / ((records != null && records.length() > 0) ? records.length() : 1);
        
        // Loop selected record to fetch data and generate word
        for (int i = 0; records != null && i < records.length(); i++) {
            final JSONObject record = records.getJSONObject(i);
            final int wasteId = record.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID);
            final DataRecord wasteRecord =
                    wasteoutDS.getRecord(WasteConstants.WASTE_ID_EQUAL + wasteId);
            // Determine whether hazardous waste or not
            final String wasteType =
                    wasteRecord.getString(WasteConstants.WASTE_PROFILES_WASTE_TYPE);
            final String generatorId =
                    wasteRecord.getString(WasteConstants.WASTE_GENERATORS_GENERATOR_ID);
            final DataRecord generatorRecord =
                    generatorDS.getRecord("generator_id='" + generatorId + WasteConstants.STRING_1);
            
            // According to 'waste_profiles.waste_type' invoke different object
            // When waste_type field equal 'R;Residual/Non-Hazardous' and 'M;Municipal' will use the
            // same word template and class.
            if (("R".equals(wasteType)) || ("M".equals(wasteType))) {
                final WasteLabelNonHazardous nonHazWaste =
                        new WasteLabelNonHazardous(wasteId, wasteRecord, generatorRecord);
                nonHazWaste.generateLabel();
            } else {
                final WasteLabelHazardous hazWaste =
                        new WasteLabelHazardous(wasteId, wasteRecord, generatorRecord);
                hazWaste.generateLabel();
            }
            
            // fix KB3031549 - get localized string
            final JobResult result =
                    new JobResult(EventHandlerBase.localizeString(ContextStore.get()
                        .getCurrentContext(), RESULT_TEXT, this.getClass().getName()), wasteId
                            + WasteConstants.DOCX_SUFFIX_NAME,
                        PdfFormExportJob.getPdfOutputFileContextPathAndName(wasteId
                                + WasteConstants.DOCX_SUFFIX_NAME));
            if (records.length() == 1) {
                this.status.setResult(result);
            } else {
                this.status.addPartialResult(result);
            }
            // when one word generate then status add countStep one times
            this.status.setCurrentNumber(countStep + this.status.getCurrentNumber());
        }
        // Set status 100
        this.status.setCurrentNumber(WasteConstants.MAX_STATUS_NUMBER);
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END generateSelectedLabels WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updateGeneratorCode WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * Update generator code.
     * 
     * @param manifestNumber manifest number from client js
     * @param genId genrator code from clent js
     */
    public void updateGeneratorCode(final String manifestNumber, final String genId) {
        
        final DataSource wasteoutDS =
                DataSourceFactory.createDataSourceForFields(WasteConstants.WASTE_OUT, new String[] {
                        WasteConstants.WASTE_ID, WasteConstants.MANIFEST_NUMBER,
                        WasteConstants.STATUS, WasteConstants.GENERATOR_ID });
        
        final List<DataRecord> wastesWithoutGenarator =
                wasteoutDS.getRecords(WasteConstants.MANIFEST_NUMBER_EQUAL + manifestNumber
                        + "' and generator_id is null and status='D'");
        if (!wastesWithoutGenarator.isEmpty()) {
            for (final DataRecord record : wastesWithoutGenarator) {
                record.setValue(WasteConstants.WASTE_OUT_GENERATOR_ID, genId);
                wasteoutDS.saveRecord(record);
            }
        }
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updateGeneratorCode WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * update Wasteout.
     * 
     * @param manifestNum String
     * 
     */
    public static void updateWasteout(final String manifestNum) {
        final DataSource wasteoutDS =
                DataSourceFactory.createDataSourceForFields(WasteConstants.WASTE_OUT, new String[] {
                        WasteConstants.WASTE_ID, WasteConstants.MANIFEST_NUMBER,
                        WasteConstants.STATUS, WasteConstants.GENERATOR_ID });
        final List<DataRecord> wasteWithGenarator =
                wasteoutDS.getRecords(WasteConstants.MANIFEST_NUMBER_EQUAL + manifestNum
                        + WasteConstants.AND_GENERATOR_ID_IS_NOT_NULL);
        final List<DataRecord> wastesWithoutGenarator =
                wasteoutDS.getRecords(WasteConstants.MANIFEST_NUMBER_EQUAL + manifestNum
                        + "' and generator_id is null");
        if (!wasteWithGenarator.isEmpty()) {
            final String genId =
                    wasteWithGenarator.get(0).getString(WasteConstants.WASTE_OUT_GENERATOR_ID);
            for (final DataRecord record : wastesWithoutGenarator) {
                record.setValue(WasteConstants.WASTE_OUT_GENERATOR_ID, genId);
                wasteoutDS.saveRecord(record);
            }
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // saveWaste WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * It will be called in response to an onSave event in any of the Track Waste views.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param isFromGenerationView boolean
     */
    public void saveWaste(final JSONObject wasteObject, final boolean isFromGenerationView) {
        final DataSource wasteOutDS =
                DataSourceFactory.loadDataSourceFromFile(
                    WasteConstants.VW_AB_WASTE_TRACK_SHIPMENTS_AXVW, WasteConstants.DS_WASTE_OUT);
        // Get waste code from waste object
        // If waste code is null, then call
        // WasteCommonHelper.createGeneratedWaste
        // to create a new waste record with status= Generated
        if ("".equals(wasteObject.get(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID))) {
            WasteCommonHelper.createNewWaste(wasteObject, true, isFromGenerationView);
            final DataRecord matchWaste = WasteCommonHelper.getMatchedWaste(wasteObject);
            if (matchWaste == null) {
                WasteCommonHelper.createNewWaste(wasteObject, false, isFromGenerationView);
            } else {
                WasteCommonHelper
                    .processMatchedWaste(wasteObject, matchWaste, isFromGenerationView);
            }
        } else {
            // get new status from waste object
            final String status = wasteObject.getString(WasteConstants.F_WASTE_OUT_DOT_STATUS);
            
            // get source waste record(source_waste_record) from database by waste code( call
            // WasteCommonHelper.getWasteById), and then get old status from this waste record
            int wasteId =
                    Integer
                        .parseInt(wasteObject.getString(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID));
            final DataRecord wasteOut = WasteCommonHelper.getWasteById(wasteId);
            final String oldStatus = wasteOut.getString(WasteConstants.F_WASTE_OUT_DOT_STATUS);
            // compare new status from waste object to old status from source waste record:
            if (status.equals(oldStatus)) {
                wasteOut.fromJSON(wasteObject);
                // update field values of waste object to according fields of source waste record
                wasteOutDS.saveRecord(wasteOut);
            } else {
                
                processWasteWithStatusUnchanged(wasteObject, wasteOut, oldStatus);
                wasteId = updateMatchedWaste(wasteObject, wasteOutDS, isFromGenerationView);
            }
            final JSONObject json = new JSONObject();
            json.put(WasteConstants.WASTE_ID, wasteId);
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            context.addResponseParameter("jsonExpression", json.toString());
        }
        
    }
    
    /**
     * Perform business logic for saving an existed waste.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param wasteOut DataRecord existed waste
     * @param oldStatus String status of existed waste
     * 
     */
    private void processWasteWithStatusUnchanged(final JSONObject wasteObject,
            final DataRecord wasteOut, final String oldStatus) {
        final Double newQuantity = wasteObject.getDouble(WasteConstants.F_WASTE_OUT_DOT_QUANTITY);
        final Double oldQuantity = wasteOut.getDouble(WasteConstants.F_WASTE_OUT_DOT_QUANTITY);
        final Double quantity = oldQuantity - newQuantity;
        if (WasteConstants.STATUS_G.equals(oldStatus)) {
            wasteOut.setValue(WasteConstants.F_WASTE_OUT_DOT_QUANTITY, quantity);
        }
        final Date endDate = wasteOut.getDate(WasteConstants.F_WASTE_OUT_DOT_DATE_END);
        if (null == endDate) {
            final String startDate = wasteObject.getString("waste_out.date_start");
            wasteOut.setValue(WasteConstants.F_WASTE_OUT_DOT_DATE_END, startDate);
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END saveWaste WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * Perform business logic for saving an existed waste.
     * 
     * @param wasteObject JSON Object contains field values in edit form
     * @param wasteOutDS DataSource waste out datasource
     * @param isFromGenerationView boolean
     * @return int
     */
    private int updateMatchedWaste(final JSONObject wasteObject, final DataSource wasteOutDS,
            final boolean isFromGenerationView) {
        // get new status from waste object
        final String status = wasteObject.getString(WasteConstants.F_WASTE_OUT_DOT_STATUS);
        
        // get source waste record(source_waste_record) from database by waste code( call
        // WasteCommonHelper.getWasteById), and then get old status from this waste record
        int wasteId = wasteObject.getInt(WasteConstants.F_WASTE_OUT_DOT_WASTE_ID);
        final DataRecord wasteOut = WasteCommonHelper.getWasteById(wasteId);
        wasteOut.getString(WasteConstants.F_WASTE_OUT_DOT_STATUS);
        
        final Double newQuantity = wasteObject.getDouble(WasteConstants.F_WASTE_OUT_DOT_QUANTITY);
        final Double oldQuantity = wasteOut.getDouble(WasteConstants.F_WASTE_OUT_DOT_QUANTITY);
        final Double quantity = oldQuantity - newQuantity;
        final boolean isDelete =
                WasteCommonHelper.updateOrDeleteWasteByQuantity(wasteObject, wasteOutDS, wasteOut,
                    quantity);
        int wasteCode = 0;
        // check disposition type is Discharge or Shipment
        final DataSource disDS =
                DataSourceFactory.createDataSourceForFields(WasteConstants.T_WASTE_DISPOSITIONS,
                    new String[] { "waste_dispositions.waste_disposition",
                            WasteConstants.F_WASTE_DISPOSITIONS_DISPOSITION_TYPE });
        final String dispos = wasteObject.getString("waste_out.waste_disposition");
        disDS.addRestriction(Restrictions.eq(WasteConstants.T_WASTE_DISPOSITIONS,
            "waste_disposition", dispos));
        final DataRecord disRecord = disDS.getRecord();
        final String disType =
                disRecord == null ? "" : disRecord
                    .getString(WasteConstants.F_WASTE_DISPOSITIONS_DISPOSITION_TYPE);
        final boolean disTypeFlagS =
                WasteConstants.STATUS_S.equals(disType) || "Shipment".equals(disType);
        wasteCode =
                WasteCommonHelper.updateWasteByStatus(wasteObject, status, disTypeFlagS,
                    isFromGenerationView);
        final boolean disTypeFlagD =
                WasteConstants.STATUS_D.equals(disType) || "Discharge".equals(disType);
        if (WasteConstants.STATUS_D.equals(status) && disTypeFlagD) {
            // update wasteOut
            wasteObject.put(WasteConstants.F_WASTE_OUT_DOT_STATUS, WasteConstants.STATUS_D);
            wasteCode = WasteCommonHelper.createNewWaste(wasteObject, false, isFromGenerationView);
            
        }
        if (isDelete) {
            wasteId = wasteCode;
        }
        return wasteId;
    }
}
