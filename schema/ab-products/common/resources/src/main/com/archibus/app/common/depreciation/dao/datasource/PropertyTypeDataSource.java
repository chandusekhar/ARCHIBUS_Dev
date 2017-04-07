package com.archibus.app.common.depreciation.dao.datasource;

import static com.archibus.app.common.depreciation.Constants.*;

import com.archibus.app.common.depreciation.dao.IPropertyTypeDao;
import com.archibus.app.common.depreciation.domain.PropertyType;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Property type data source. Mapped to property_type database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class PropertyTypeDataSource extends ObjectDataSourceImpl<PropertyType>
        implements IPropertyTypeDao<PropertyType> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { PROPERTY_TYPE, "type" },
            { "deprec_period", "deprecPeriod" }, { "deprec_method", "deprecMethod" } };

    /**
     * Constructs PropertyTypeDataSource, mapped to <code>property_type</code> table, using
     * <code>propertyType</code> bean.
     */
    public PropertyTypeDataSource() {
        super(CONST_PROPERTYTYPE, PROPERTY_TYPE);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public PropertyType getPropertyTypeByName(final String propertyType) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(PROPERTY_TYPE, PROPERTY_TYPE, propertyType));
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<PropertyType>().convertRecordToObject(record,
            this.beanName, this.fieldToPropertyMapping, null);
    }
}
