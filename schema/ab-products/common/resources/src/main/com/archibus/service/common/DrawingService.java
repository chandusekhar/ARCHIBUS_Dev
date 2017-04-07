package com.archibus.service.common;

import java.io.*;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * DrawingService. Provides workflow rules for redlining in the Drawing Control.
 * 
 * @author ec
 * @since 20.1
 * 
 */
public class DrawingService {
    
    /**
     * y.
     */
    static final String CHAR_Y = "y";
    
    /**
     * x.
     */
    static final String CHAR_X = "x";
    
    /**
     * Right lower.
     */
    static final String RIGHT_LOWER_ABBR = "rl";
    
    /**
     * Left upper.
     */
    static final String LEFT_UPPER_ABBR = "lu";
    
    /**
     * Position.
     */
    static final String POSITION_NAME = "position";
    
    /**
     * Field name.
     */
    static final String LABELDS_FIELDNAME = "labelds";
    
    /**
     * Field name.
     */
    static final String HIGHLIGHTDS_FIELDNAME = "highlightds";
    
    /**
     * Field name.
     */
    static final String COMMENTS_FIELD_NAME = "comments";
    
    /**
     * redlines table name.
     */
    static final String REDLINESTABLENAME = "afm_redlines";
    
    /**
     * Field name.
     */
    static final String COMMENTS_FULL_FIELD_NAME = "afm_redlines.comments";
    
    /**
     * Field name.
     */
    static final String USERNAME_FULL_FIELDNAME = "afm_redlines.user_name";
    
    /**
     * Field name.
     */
    static final String DWGNAME_FULL_FIELDNAME = "afm_redlines.dwg_name";
    
    /**
     * Field name.
     */
    static final String HIGHLIGHTDS_FULL_FIELDNAME = "afm_redlines.highlightds";
    
    /**
     * Field name.
     */
    static final String LABELDS_FULL_FIELDNAME = "afm_redlines.labelds";
    
    /**
     * Field name.
     */
    static final String HIGHLIGHTDS_VIEWNAME_FULL_FIELDNAME = "afm_redlines.highlightds_view_name";
    
    /**
     * Field name.
     */
    static final String LABELDS_VIEW_NAME_FULL_FIELDNAME = "afm_redlines.labelds_view_name";
    
    /**
     * Field name.
     */
    static final String POSITION_LUX_FULL_FIELDNAME = "afm_redlines.position_lux";
    
    /**
     * Field name.
     */
    static final String POSITION_LUY_FULL_FIELDNAME = "afm_redlines.position_luy";
    
    /**
     * Field name.
     */
    static final String POSITION_RLX_FULL_FIELDNAME = "afm_redlines.position_rlx";
    
    /**
     * Field name.
     */
    static final String POSITION_RLY_FULL_FIELDNAME = "afm_redlines.position_rly";
    
    /**
     * Field name.
     */
    static final String REDLINES_FULL_FIELD_NAME = "afm_redlines.redlines";
    
    /**
     * Field name.
     */
    static final String ID_FULL_FIELD_NAME = "afm_redlines.auto_number";
    
    /**
     * Field name.
     */
    static final String REDLINES_ACTIVITY_LOG_ID_FULL_FIELD_NAME = "afm_redlines.activity_log_id";
    
    /**
     * id field name.
     */
    static final String ID_FIELD_NAME = "auto_number";
    
    /**
     * redline field name.
     */
    static final String REDLINES_FIELD_NAME = "redlines";
    
    /**
     * ActivityLogId field name.
     */
    static final String ACTIVITY_LOG_ID_FIELD_NAME = "activity_log_id";
    
    /**
     * ActivityLog Table name.
     */
    static final String ACTIVITY_LOG_TABLE_NAME = "activity_log";
    
    /**
     * Field name.
     */
    static final String HIGHLIGHTDSVIEW_FIELDNAME = "highlightds_view_name";
    
    /**
     * Field name.
     */
    static final String LABELDSVIEW_FIELDNAME = "labelds_view_name";
    
    /**
     * Number of document fields.
     */
    static final int NR_DOCS_FIELDS = 4;
    
    /**
     * user_name fieldname.
     */
    static final String USERNAME_FIELDNAME = "user_name";
    
    /**
     * dwg_name fieldname.
     */
    static final String DWGNAME_FIELDNAME = "dwg_name";
    
    /**
     * fields of the redlines table. used to create datasource
     */
    static final String[] REDLINES_FIELDS = { DWGNAME_FIELDNAME, "position_lux", "position_luy",
            "position_rlx", "position_rly", COMMENTS_FIELD_NAME, HIGHLIGHTDS_FIELDNAME,
            LABELDS_FIELDNAME, ID_FIELD_NAME, USERNAME_FIELDNAME, HIGHLIGHTDSVIEW_FIELDNAME,
            LABELDSVIEW_FIELDNAME, REDLINES_FIELD_NAME, ACTIVITY_LOG_ID_FIELD_NAME };
    
    /**
     * doc1.
     */
    static final String DOC1 = "doc1";
    
    /**
     * Doc fields array.
     */
    static final String[] DOC_FIELDS = { DOC1, "doc2", "doc3", "doc4" };
    
    /**
     * Logger.
     */
    private final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Save redmarks for service request. saves redmarks in the database as vectors and as image
     * file attached to a service request
     * 
     * @param redmarks json object
     * @param activityLogId service request id
     * @param data image file
     * @param docField document field to save image in
     * @throws ParseException
     */
    public void saveRedMarksForServiceRequest(final JSONObject redmarks, final int activityLogId,
            final String data, final String docField) {
        ContextStore.get().getEventHandlerContext();
        
        // save redlines in db
        final int redlinesId = DrawingServiceHelper.saveRedmarksAsJSON(redmarks);
        
        // link redlines record to activity_log
        final DataSource redlineDS =
                DataSourceFactory.createDataSourceForFields(REDLINESTABLENAME, REDLINES_FIELDS);
        redlineDS.addRestriction(Restrictions.eq(REDLINESTABLENAME, ID_FIELD_NAME, redlinesId));
        final DataRecord record = redlineDS.getRecord();
        record.setValue(REDLINES_ACTIVITY_LOG_ID_FULL_FIELD_NAME, activityLogId);
        redlineDS.saveRecord(record);
        
        String documentField = null;
        // if docField is null, look for 1st empty document field in record
        if (StringUtil.notNullOrEmpty(docField)) {
            documentField = docField;
        } else {
            final DataSource activityLogDS =
                    DataSourceFactory
                        .createDataSourceForFields(ACTIVITY_LOG_TABLE_NAME, DOC_FIELDS);
            activityLogDS.addRestriction(Restrictions.eq(ACTIVITY_LOG_TABLE_NAME,
                ACTIVITY_LOG_ID_FIELD_NAME, activityLogId));
            final DataRecord activityLogRecord = activityLogDS.getRecord();
            for (int i = 1; i < NR_DOCS_FIELDS + 1; i++) {
                if (activityLogRecord.getValue(ACTIVITY_LOG_TABLE_NAME + ".doc" + i) == null) {
                    documentField = "doc" + i;
                    break;
                }
            }
        }
        if (StringUtil.notNullOrEmpty(documentField)) {
            DrawingServiceImageHelper.checkInRedlinesDoc(data, activityLogId, documentField);
        } else {
            throw new ExceptionBase("No empty document field found to save redlined drawing in");
        }
        
    }
    
    /**
     * Save redmarks as service request. Creates a new service request and attaches the redmarks to
     * it
     * 
     * @param redmarks jsonobject with the redmarks info
     * @param data image file
     * @param viewName view file
     * 
     */
    public void prepareRedmarksForServiceRequest(final JSONObject redmarks, final String data,
            final String viewName) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // save redlines in db
        final int redlinesId = DrawingServiceHelper.saveRedmarksAsJSON(redmarks);
        final String fullFilePath = DrawingServiceImageHelper.writeImageToFile(viewName, data);
        
        final JSONObject result = new JSONObject();
        result.put("redlinesImagePath", fullFilePath);
        result.put("redlinesId", redlinesId);
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Attach redlines to service request.
     * 
     * @param activityLogId service request id
     * @param redlinesId redlines id
     * @param imageFilePath full filename of redlined image
     * @throws ExceptionBase if image file not found
     */
    public void attachRedlinesToServiceRequest(final int activityLogId, final int redlinesId,
            final String imageFilePath) throws ExceptionBase {
        // link redlines record to activity_log
        final DataSource redlineDS =
                DataSourceFactory.createDataSourceForFields(REDLINESTABLENAME, new String[] {
                        ID_FIELD_NAME, ACTIVITY_LOG_ID_FIELD_NAME });
        redlineDS.addRestriction(Restrictions.eq(REDLINESTABLENAME, ID_FIELD_NAME, redlinesId));
        final DataRecord record = redlineDS.getRecord();
        record.setValue(REDLINES_ACTIVITY_LOG_ID_FULL_FIELD_NAME, activityLogId);
        redlineDS.saveRecord(record);
        
        // attach image file to service request
        try {
            final FileInputStream inputStream = new FileInputStream(imageFilePath);
            DrawingServiceImageHelper.checkInRedlinesDoc(inputStream, activityLogId, DOC1);
            try {
                inputStream.close();
            } catch (IOException ex) {
                this.logger.error("InputStream close error " + ex.getMessage());
            }
            // remove file from server
            final File file = new File(imageFilePath);
            if (file.exists() && !file.isDirectory()) {
                final boolean success = file.delete();
                
                if (!success) {
                    this.logger.error("Deletion of image file " + imageFilePath + " failed.");
                }
            }
        } catch (FileNotFoundException e) {
            throw new ExceptionBase("Redlines Image file not found for request with id "
                    + activityLogId);
        }
    }
    
    /**
     * save Redmarks.
     * 
     * @param redmarks JSONObject with redlines to save
     */
    public void saveRedMarks(final JSONObject redmarks) {
        DrawingServiceHelper.saveRedmarksAsJSON(redmarks);
    }
    
    /**
     * Get redmarks to draw.
     * 
     * @param redlinesId redlines id of redlines to draw
     * @return JSONObject with redmarks to draw
     */
    public JSONObject getRedmarksToDraw(final int redlinesId) {
        final DataSource redlineDS =
                DataSourceFactory.createDataSourceForFields(REDLINESTABLENAME, REDLINES_FIELDS);
        redlineDS.addRestriction(Restrictions.eq(REDLINESTABLENAME, ID_FIELD_NAME, redlinesId));
        
        final DataRecord redlineRecord = redlineDS.getRecord();
        final JSONObject result = new JSONObject();
        result.put("dwgname", redlineRecord.getString(DWGNAME_FULL_FIELDNAME));
        result.put(HIGHLIGHTDS_FIELDNAME, redlineRecord.getString(HIGHLIGHTDS_FULL_FIELDNAME));
        result.put(LABELDS_FIELDNAME, redlineRecord.getString(LABELDS_FULL_FIELDNAME));
        result.put(HIGHLIGHTDSVIEW_FIELDNAME,
            redlineRecord.getString(HIGHLIGHTDS_VIEWNAME_FULL_FIELDNAME));
        result
            .put(LABELDSVIEW_FIELDNAME, redlineRecord.getString(LABELDS_VIEW_NAME_FULL_FIELDNAME));
        
        final JSONObject position = new JSONObject();
        position.put("lux", redlineRecord.getDouble(POSITION_LUX_FULL_FIELDNAME));
        position.put("luy", redlineRecord.getDouble(POSITION_LUY_FULL_FIELDNAME));
        position.put("rlx", redlineRecord.getDouble(POSITION_RLX_FULL_FIELDNAME));
        position.put("rly", redlineRecord.getDouble(POSITION_RLY_FULL_FIELDNAME));
        
        result.put(POSITION_NAME, position.toString());
        result.put(REDLINES_FIELD_NAME, redlineRecord.getValue(REDLINES_FULL_FIELD_NAME));
        return result;
    }
}
