package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import com.archibus.app.common.space.domain.Floor;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * The Class FloorDataSource.
 * 
 * @author Bart Vanderschoot
 */
public class FloorDataSource extends ObjectDataSourceImpl<Floor> {
    
    /**
     * Site ID field name.
     */
    private static final String BUILDING_ID_FIELD = "bl_id";
    
    /**
     * Floor name field name.
     */
    private static final String FLOOR_NAME_FIELD = "name";
    
    /** fields mapping for version 20. */
    private static final String[][] FIELDS_TO_PROPERTIES = { { BUILDING_ID_FIELD, "buildingId" },
            { "fl_id", "floorId" }, { FLOOR_NAME_FIELD, FLOOR_NAME_FIELD } };
    
    /**
     * Default constructor.
     */
    public FloorDataSource() {
        super("floor", "fl");
    }
    
    /**
     * Find by building.
     * 
     * @param blId the bl id
     * @return the list
     */
    public final List<Floor> findByBuilding(final String blId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(this.tableName, BUILDING_ID_FIELD, blId, Operation.EQUALS);
        return this.find(restriction);
    }
    
    /**
     * Field to properties mapping for version 20.
     * 
     * @return array of arrays.
     */
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
}
