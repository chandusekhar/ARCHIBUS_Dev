package com.archibus.app.common.organization.dao.datasource;

import java.util.List;

import com.archibus.app.common.organization.dao.IDivisionDao;
import com.archibus.app.common.organization.domain.Division;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * DataSource for Division.
 * 
 * @author Valery Tydykov
 * 
 */
public class DivisionDataSource extends ObjectDataSourceImpl<Division> implements IDivisionDao {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "dv_id", "id" } };
    
    /**
     * Constructs DivisionDataSource, mapped to <code>dv</code> table, using <code>division</code>
     * bean.
     */
    public DivisionDataSource() {
        super("division", "dv");
    }
    
    /** {@inheritDoc} */
    public List<Division> getAllDivisions() {
        final DataSource dataSource = this.createCopy();
        final List<DataRecord> records = dataSource.getRecords();
        
        return new DataSourceObjectConverter<Division>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
