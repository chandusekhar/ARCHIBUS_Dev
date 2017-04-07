package com.archibus.app.common.extensionsarcgis;

import java.text.ParseException;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 *
 * Provides methods to import or export drawing georeference parameters to or from database.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 *
 */
public final class GeoreferenceManager {
    
    /**
     * Cannot import georeference parameters from file error message.
     */
    private static final String ERROR_CANNOT_IMPORT_GEOREFERENCE_PARAMETERS =
            "Cannot import georeference parameters from file. ";
    
    /**
     * Record not found in afm_dwgs error message.
     */
    private static final String ERROR_RECORD_NOT_FOUND_IN_AFM_DWGS =
            "Record not found in afm_dwgs.";
    
    /**
     * Parsing geoInfo error message.
     */
    private static final String ERROR_PARSING_GEO_INFO = "Error parsing geoInfo: ";
    
    /**
     * Cannot save georeference parameters error message.
     */
    private static final String ERROR_CANNOT_SAVE_GEOREFERENCE_PARAMETERS =
            "Cannot save georeference parameters. ";
    
    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(GeoreferenceManager.class);
    
    /**
     *
     * Constructor not called.
     */
    private GeoreferenceManager() {
        
    }
    
    /**
     * Save the drawing georeference parameters to the database from the Smart Client Extension. The
     * drawing name will be obtained from the event handler context.
     */
    public static void saveDrawingGeoreferenceParametersToDatabaseFromSmartClientExtension() {
        
        /*
         * Get the dwgname and geoInfo parameters from the context.
         */
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        String dwgname = null;
        JSONObject geoInfo = null;
        
        if (context.parameterExists(ArcgisExtensionsConstants.DWGNAME)) {
            dwgname = (String) context.getParameter(ArcgisExtensionsConstants.DWGNAME);
        }
        if (context.parameterExists(ArcgisExtensionsConstants.PARAMETER_GEOINFO)) {
            final String geoInfoStr =
                    (String) context.getParameter(ArcgisExtensionsConstants.PARAMETER_GEOINFO);
            try {
                geoInfo = new JSONObject(geoInfoStr);
            } catch (final ParseException err) {
                log.error(ERROR_CANNOT_SAVE_GEOREFERENCE_PARAMETERS + ERROR_PARSING_GEO_INFO
                    + err.getMessage());
            }
        }
        
        if (StringUtil.notNullOrEmpty(dwgname) && StringUtil.notNullOrEmpty(geoInfo)) {
            
            /*
             * Create the datasource for afm_dwgs.
             */
            final DataSource afmDwgsDs = createDrawingDataSource(dwgname);
            
            /*
             * Get the record.
             */
            final DataRecord dwgRecord = afmDwgsDs.getRecord();
            
            /*
             * Update the record.
             */
            if (StringUtil.notNullOrEmpty(dwgRecord)) {
                /*
                 * Add the values.
                 */
                dwgRecord.setValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_X,
                    geoInfo.get(ArcgisExtensionsConstants.JSON_GEOX));
                dwgRecord.setValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_Y,
                    geoInfo.get(ArcgisExtensionsConstants.JSON_GEOY));
                dwgRecord.setValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SCALE,
                    geoInfo.get(ArcgisExtensionsConstants.JSON_GEOSCALE));
                dwgRecord.setValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_ROTATE,
                    geoInfo.get(ArcgisExtensionsConstants.JSON_GEOROTATE));
                dwgRecord.setValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SRS,
                    geoInfo.get(ArcgisExtensionsConstants.JSON_GEOSRS));
                dwgRecord.setValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_LEVEL,
                    geoInfo.get(ArcgisExtensionsConstants.JSON_GEOLEVEL));
                
                /*
                 * Update the record.
                 */
                afmDwgsDs.updateRecord(dwgRecord);
            } else {
                log.error(ERROR_CANNOT_SAVE_GEOREFERENCE_PARAMETERS
                        + ERROR_RECORD_NOT_FOUND_IN_AFM_DWGS);
            }
            
        }
        
    }
    
    /**
     * Save the drawing georeference parameters to the database.
     *
     * @param dwgname The drawing name.
     * @param geoInfo The georeference parameters.
     */
    public static void saveDrawingGeoreferenceParametersToDatabase(final String dwgname,
            final JSONObject geoInfo) {
        
        if (StringUtil.notNullOrEmpty(dwgname) && StringUtil.notNullOrEmpty(geoInfo)) {
            
            /*
             * Create the datasource for afm_dwgs.
             */
            final DataSource dwgsDs = createDrawingDataSource(dwgname);
            
            /*
             * Get the record.
             */
            final DataRecord dwgRecord = dwgsDs.getRecord();
            
            /*
             * Update the record.
             */
            if (StringUtil.notNullOrEmpty(dwgRecord)) {
                /*
                 * Add the values.
                 */
                setDrawingRecordValue(geoInfo, ArcgisExtensionsConstants.JSON_GEOX, dwgRecord,
                    ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_X);
                setDrawingRecordValue(geoInfo, ArcgisExtensionsConstants.JSON_GEOY, dwgRecord,
                    ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_Y);
                setDrawingRecordValue(geoInfo, ArcgisExtensionsConstants.JSON_GEOSCALE, dwgRecord,
                    ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SCALE);
                setDrawingRecordValue(geoInfo, ArcgisExtensionsConstants.JSON_GEOROTATE, dwgRecord,
                    ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_ROTATE);
                setDrawingRecordValue(geoInfo, ArcgisExtensionsConstants.JSON_GEOSRS, dwgRecord,
                    ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SRS);
                setDrawingRecordValue(geoInfo, ArcgisExtensionsConstants.JSON_GEOLEVEL, dwgRecord,
                    ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_LEVEL);
                
                /*
                 * Update the record.
                 */
                dwgsDs.updateRecord(dwgRecord);
                
            } else {
                log.error(ERROR_CANNOT_IMPORT_GEOREFERENCE_PARAMETERS
                    + ERROR_RECORD_NOT_FOUND_IN_AFM_DWGS);
            }
            
        }
        
    }
    
    /**
     * Get the drawing georeference parameters from the database.
     *
     * @param dwgname The drawing name.
     * @return The drawing georeference parameters.
     */
    public static JSONObject getDrawingGeoreferenceParametersFromDatabase(final String dwgname) {
        
        JSONObject geoInfo = new JSONObject();
        
        if (StringUtil.notNullOrEmpty(dwgname)) {
            /*
             * Get the record.
             */
            final DataRecord dwgRecord = getDrawingRecordFromDatabase(dwgname);
            
            /*
             * Create geoInfo from record.
             */
            geoInfo = createGeoInfoFromRecord(dwgRecord);
        }
        
        return geoInfo;
    }
    
    /**
     *
     * Get the space hierarchy values for the drawing from the afm_dwgs table..
     * 
     * @param dwgname The drawing name.
     * @return The space hierarchy values.
     */
    public static String getSpaceHierFieldValuesFromDatabase(final String dwgname) {

        String spaceHierFieldValues = null;

        final DataRecord dwgRecord = getDrawingRecordFromDatabase(dwgname);

        if (StringUtil.notNullOrEmpty(dwgRecord
            .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_SPACE_HIER_FIELD_VALUES))) {
            spaceHierFieldValues =
                    (String) dwgRecord
                    .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_SPACE_HIER_FIELD_VALUES);
        }

        return spaceHierFieldValues;
    }

    /**
     *
     * Get the record for the drawing from the afm_dwgs table.
     * 
     * @param dwgname The drawing name.
     * @return The record for the drawing.
     */
    private static DataRecord getDrawingRecordFromDatabase(final String dwgname) {

        DataRecord dwgRecord = null;

        if (StringUtil.notNullOrEmpty(dwgname)) {
            /*
             * Create the datasource for afm_dwgs.
             */
            final DataSource dwgsDs = createDrawingDataSource(dwgname);
            
            /*
             * Get the record.
             */
            dwgRecord = dwgsDs.getRecord();
        }

        return dwgRecord;

    }

    /**
     *
     * Set the drawing record value.
     *
     * @param jsonObject the JSON object.
     * @param jsonKey the data key.
     * @param dataRecord the data record.
     * @param recordKey the data record key.
     */
    private static void setDrawingRecordValue(final JSONObject jsonObject, final String jsonKey,
            final DataRecord dataRecord, final String recordKey) {
        
        if (jsonObject.has(jsonKey)) {
            dataRecord.setValue(recordKey, jsonObject.get(jsonKey));
        }
        
    }
    
    /**
     *
     * Create the geoinfo object from a data record.
     *
     * @param dwgRecord The data record containing the geoinfo.
     * @return The geoinfo object.
     */
    private static JSONObject createGeoInfoFromRecord(final DataRecord dwgRecord) {
        
        final JSONObject geoInfo = new JSONObject();
        /*
         * Create geoInfo from record.
         */
        if (StringUtil.notNullOrEmpty(dwgRecord)) {
            /*
             * Add values.
             */
            if (StringUtil.notNullOrEmpty(dwgRecord
                .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_X))) {
                geoInfo.put(ArcgisExtensionsConstants.JSON_GEOX,
                    dwgRecord.getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_X));
            }
            if (StringUtil.notNullOrEmpty(dwgRecord
                .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_Y))) {
                geoInfo.put(ArcgisExtensionsConstants.JSON_GEOY,
                    dwgRecord.getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_Y));
            }
            if (StringUtil.notNullOrEmpty(dwgRecord
                .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SCALE))) {
                geoInfo.put(ArcgisExtensionsConstants.JSON_GEOSCALE,
                    dwgRecord.getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SCALE));
            }
            if (StringUtil.notNullOrEmpty(dwgRecord
                .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_ROTATE))) {
                geoInfo.put(ArcgisExtensionsConstants.JSON_GEOROTATE,
                    dwgRecord.getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_ROTATE));
            }
            if (StringUtil.notNullOrEmpty(dwgRecord
                .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SRS))) {
                geoInfo.put(ArcgisExtensionsConstants.JSON_GEOSRS,
                    dwgRecord.getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_SRS));
            }
            if (StringUtil.notNullOrEmpty(dwgRecord
                .getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_LEVEL))) {
                geoInfo.put(ArcgisExtensionsConstants.JSON_GEOLEVEL,
                    dwgRecord.getOldValue(ArcgisExtensionsConstants.RECORD_AFM_DWGS_GEO_LEVEL));
            }
        }
        
        return geoInfo;
    }
    
    /**
     *
     * Create afm_dwgs datasource to access the geoInfo.
     *
     * @param dwgname The ARCHIBUS drawing name.
     * @return The afm_dwgs datasource.
     */
    private static DataSource createDrawingDataSource(final String dwgname) {
        final DataSource dwgsDs =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ArcgisExtensionsConstants.TABLE_AFM_DWGS, DataSource.ROLE_MAIN)
                    .addField(ArcgisExtensionsConstants.FIELD_DWG_NAME)
                    .addField(ArcgisExtensionsConstants.FIELD_SPACE_HIER_FIELD_VALUES)
                    .addField(ArcgisExtensionsConstants.FIELD_GEO_X)
                    .addField(ArcgisExtensionsConstants.FIELD_GEO_Y)
                    .addField(ArcgisExtensionsConstants.FIELD_GEO_SCALE)
                    .addField(ArcgisExtensionsConstants.FIELD_GEO_ROTATE)
                    .addField(ArcgisExtensionsConstants.FIELD_GEO_SRS)
                    .addField(ArcgisExtensionsConstants.FIELD_GEO_LEVEL)
                    .addRestriction(
                        Restrictions.eq(ArcgisExtensionsConstants.TABLE_AFM_DWGS,
                            ArcgisExtensionsConstants.FIELD_DWG_NAME, dwgname));
        return dwgsDs;
    }
    
}
