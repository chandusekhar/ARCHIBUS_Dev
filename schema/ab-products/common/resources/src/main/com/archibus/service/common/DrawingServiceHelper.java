package com.archibus.service.common;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * Utility class. Provides helper functions for the drawing service
 * 
 * @author ec
 * @since 20.1
 * 
 */

public final class DrawingServiceHelper {
    
    /**
     * drawingName (in json).
     */
    private static final String DRAWINGNAME = "drawingName";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     * 
     * @throws InstantiationException always, since this constructor should never be called.
     */
    private DrawingServiceHelper() throws InstantiationException {
        throw new InstantiationException("Never instantiate " + this.getClass().getName()
                + "; use static methods!");
    }
    
    /**
     * Save redmarks as json.
     * 
     * @param redmarks JSONObject to save
     * @return redlines.id
     */
    static int saveRedmarksAsJSON(final JSONObject redmarks) {
        final DataSource redlineDS =
                DataSourceFactory.createDataSourceForFields(DrawingService.REDLINESTABLENAME,
                    DrawingService.REDLINES_FIELDS);
        
        final List<Restrictions.Restriction.Clause> clauses =
                new ArrayList<Restrictions.Restriction.Clause>();
        
        DataRecord record = redlineDS.createNewRecord();
        record.setValue(DrawingService.USERNAME_FULL_FIELDNAME, ContextStore.get().getUser()
            .getName());
        clauses.add(new Restriction.Clause(DrawingService.REDLINESTABLENAME,
            DrawingService.USERNAME_FIELDNAME, ContextStore.get().getUser().getName(),
            Restrictions.OP_EQUALS));
        
        // dwgname seems to be never null or empty? UPPER-CASE for all three databases.
        final String dwgname = redmarks.getString(DRAWINGNAME).toUpperCase();
        record.setValue(DrawingService.DWGNAME_FULL_FIELDNAME, dwgname);
        clauses.add(new Restriction.Clause(DrawingService.REDLINESTABLENAME,
            DrawingService.DWGNAME_FIELDNAME, dwgname, Restrictions.OP_EQUALS));
        
        final JSONObject position = redmarks.getJSONObject(DrawingService.POSITION_NAME);
        record
            .setValue(
                DrawingService.POSITION_LUX_FULL_FIELDNAME,
                position.getJSONObject(DrawingService.LEFT_UPPER_ABBR).getDouble(
                    DrawingService.CHAR_X));
        record
            .setValue(
                DrawingService.POSITION_LUY_FULL_FIELDNAME,
                position.getJSONObject(DrawingService.LEFT_UPPER_ABBR).getDouble(
                    DrawingService.CHAR_Y));
        record.setValue(DrawingService.POSITION_RLX_FULL_FIELDNAME,
            position.getJSONObject(DrawingService.RIGHT_LOWER_ABBR)
                .getDouble(DrawingService.CHAR_X));
        record.setValue(DrawingService.POSITION_RLY_FULL_FIELDNAME,
            position.getJSONObject(DrawingService.RIGHT_LOWER_ABBR)
                .getDouble(DrawingService.CHAR_Y));
        if (redmarks.has(DrawingService.COMMENTS_FIELD_NAME)) {
            record.setValue(DrawingService.COMMENTS_FULL_FIELD_NAME,
                redmarks.getString(DrawingService.COMMENTS_FIELD_NAME));
            
        }
        if (redmarks.has(DrawingService.HIGHLIGHTDS_FIELDNAME)) {
            record.setValue(DrawingService.HIGHLIGHTDS_FULL_FIELDNAME,
                redmarks.getString(DrawingService.HIGHLIGHTDS_FIELDNAME));
            clauses.add(new Restriction.Clause(DrawingService.REDLINESTABLENAME,
                DrawingService.HIGHLIGHTDS_FIELDNAME, redmarks
                    .getString(DrawingService.HIGHLIGHTDS_FIELDNAME), Restrictions.OP_EQUALS));
        }
        if (redmarks.has(DrawingService.LABELDS_FIELDNAME)) {
            record.setValue(DrawingService.LABELDS_FULL_FIELDNAME,
                redmarks.getString(DrawingService.LABELDS_FIELDNAME));
            clauses.add(new Restriction.Clause(DrawingService.REDLINESTABLENAME,
                DrawingService.LABELDS_FIELDNAME, redmarks
                    .getString(DrawingService.LABELDS_FIELDNAME), Restrictions.OP_EQUALS));
        }
        if (redmarks.has(DrawingService.HIGHLIGHTDSVIEW_FIELDNAME)) {
            record.setValue(DrawingService.HIGHLIGHTDS_VIEWNAME_FULL_FIELDNAME,
                redmarks.getString(DrawingService.HIGHLIGHTDSVIEW_FIELDNAME));
            clauses.add(new Restriction.Clause(DrawingService.REDLINESTABLENAME,
                DrawingService.HIGHLIGHTDSVIEW_FIELDNAME, redmarks
                    .getString(DrawingService.HIGHLIGHTDSVIEW_FIELDNAME), Restrictions.OP_EQUALS));
        }
        if (redmarks.has(DrawingService.LABELDSVIEW_FIELDNAME)) {
            record.setValue(DrawingService.LABELDS_VIEW_NAME_FULL_FIELDNAME,
                redmarks.getString(DrawingService.LABELDSVIEW_FIELDNAME));
            clauses.add(new Restriction.Clause(DrawingService.REDLINESTABLENAME,
                DrawingService.LABELDSVIEW_FIELDNAME, redmarks
                    .getString(DrawingService.LABELDSVIEW_FIELDNAME), Restrictions.OP_EQUALS));
        }
        
        final JSONArray redlines = redmarks.getJSONArray("redmarks");
        record.setValue(DrawingService.REDLINES_FULL_FIELD_NAME, redlines.toString());
        record = redlineDS.saveRecord(record);
        int redlinesId = record.getInt(DrawingService.ID_FULL_FIELD_NAME);
        // autonumbered id should never be 0, if so, the right one isn't found with the standard
        // getMax function, retry with less restrictions (only strings, since the numbers might be
        // rounded in the database
        if (redlinesId == 0) {
            redlinesId =
                    DataStatistics.getInt(DrawingService.REDLINESTABLENAME,
                        DrawingService.ID_FIELD_NAME, "MAX", new Restrictions.Restriction(
                            Restrictions.REL_OP_AND, clauses));
            
        }
        return redlinesId;
    }
}