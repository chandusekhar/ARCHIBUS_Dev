package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import com.archibus.app.common.space.dao.IRoomDao;
import com.archibus.app.common.space.domain.Room;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for Room.
 * 
 * @see ObjectDataSourceImpl.
 * 
 * @author Valery Tydykov
 * 
 */
public class RoomDataSource extends ObjectDataSourceImpl<Room> implements IRoomDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.RM_ID, Constants.ID },
            { Constants.BL_ID, Constants.BUILDING_ID }, { Constants.FL_ID, Constants.FLOOR_ID },
            { Constants.DP_ID, Constants.DEPARTMENT_ID },
            { Constants.DV_ID, Constants.DIVISION_ID }, { Constants.PRORATE, Constants.PRORATE },
            { Constants.RM_TYPE, Constants.TYPE }, { Constants.RM_CAT, Constants.CATEGORY },
            { Constants.NAME, Constants.NAME }, { Constants.CAP_EM, Constants.EMPLOYEE_CAPACITY },
            { Constants.RM_STD, Constants.STANDARD } };
    
    /**
     * Constructs RoomDataSource, mapped to <code>rm</code> table, using <code>roomBean</code> bean.
     */
    public RoomDataSource() {
        super(Constants.ROOM, Constants.RM);
    }
    
    /** {@inheritDoc} */
    public Room getByPrimaryKey(final Room room) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.RM_ID);
            pkField.setValue(room.getId());
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.BL_ID);
            pkField.setValue(room.getBuildingId());
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.FL_ID);
            pkField.setValue(room.getFloorId());
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        return this.get(primaryKeysValues);
    }
    
    /**
     * Find by floor.
     * 
     * @param blId the bl id
     * @param flId the fl id
     * @return the list
     */
    public final List<Room> findByFloor(final String blId, final String flId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(this.tableName, "bl_id", blId, Operation.EQUALS);
        restriction.addClause(this.tableName, "fl_id", flId, Operation.EQUALS);
        return this.find(restriction);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
