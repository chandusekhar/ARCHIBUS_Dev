package com.archibus.app.common.space.dao.datasource;

import com.archibus.app.common.space.dao.IRoomCategoryDao;
import com.archibus.app.common.space.domain.RoomCategory;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;

/**
 * 
 * @see ObjectDataSourceImpl.
 * 
 * @author Zhang Yi
 * 
 */
public class RoomCategoryDataSource extends ObjectDataSourceImpl<RoomCategory> implements
        IRoomCategoryDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.RM_CAT, "id" },
            { "supercat", "superCategory" }, { Constants.OCCUPIABLE, Constants.OCCUPIABLE } };
    
    /**
     * Constructs RoomCategoryDataSource, mapped to <code>rmcat</code> table, using
     * <code>roomcategory</code> bean.
     */
    public RoomCategoryDataSource() {
        super("roomCategory", "rmcat");
    }
    
    /** {@inheritDoc} */
    public RoomCategory getByPrimaryKey(final String categoryId) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.RM_CAT);
            pkField.setValue(categoryId);
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        return this.get(primaryKeysValues);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
