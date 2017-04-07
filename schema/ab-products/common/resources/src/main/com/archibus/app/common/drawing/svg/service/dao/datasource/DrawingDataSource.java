package com.archibus.app.common.drawing.svg.service.dao.datasource;

import java.util.List;

import com.archibus.app.common.drawing.svg.service.dao.IDrawingDao;
import com.archibus.app.common.drawing.svg.service.domain.Drawing;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.ExceptionBase;

/**
 * DataSource for Drawing.
 * <p>
 * A bean class named as "svgDrawingDataSource".
 * <p>
 * configured in /schema/ab-products/common/resources/appContext-services.xml
 * 
 * <p>
 * Designed to have prototype scope.
 * 
 * @author Shao
 * @since 21.1
 */
public class DrawingDataSource extends ObjectDataSourceImpl<Drawing> implements IDrawingDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.DRAWING_FIELD_NAME, "drawingName" },
            { Constants.SPACE_HIER_FIELD_VALUES_FIELD_NAME, "spaceHierarchyValues" } };
    
    /**
     * Constructs SiteDataSource, mapped to <code>afm_dwgs</code> table, using
     * <code>svgDrawing</code> bean.
     */
    public DrawingDataSource() {
        super("svgDrawing", Constants.DRAWING_TABLE_NAME);
    }
    
    /**
     * 
     * Gets Drawing object by specified space field Hierarchy Values.
     * 
     * @param spaceHierarchyValues space field Hierarchy Values.
     * @return Drawing object.
     * 
     * @throws ExceptionBase if DataSource throws an exception.
     */
    public Drawing getBySpaceHierarchyValues(final String spaceHierarchyValues)
            throws ExceptionBase {
        Drawing result = null;
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constants.DRAWING_TABLE_NAME,
            Constants.SPACE_HIER_FIELD_VALUES_FIELD_NAME, spaceHierarchyValues, Operation.EQUALS);
        final List<DataRecord> records = this.getRecords(restriction);
        if (records != null && !records.isEmpty()) {
            result = this.convertRecordToObject(records.get(0));
        }
        return result;
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
