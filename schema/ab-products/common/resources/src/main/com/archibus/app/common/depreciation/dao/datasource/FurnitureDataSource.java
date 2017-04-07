package com.archibus.app.common.depreciation.dao.datasource;

import java.util.List;

import com.archibus.app.common.depreciation.Constants;
import com.archibus.app.common.depreciation.dao.IFurnitureDao;
import com.archibus.app.common.depreciation.domain.Furniture;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Furniture data source. Mapped to <code>ta</code> table
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FurnitureDataSource extends ObjectDataSourceImpl<Furniture>
        implements IFurnitureDao<Furniture> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.TA_ID, "taId" },
            { "property_type", "propertyType" }, { "value_original", "valueOriginal" },
            { "value_salvage", "valueSalvage" }, { "date_delivery", "dateDelivery" } };

    /**
     * Constructs FurnitureDataSource, mapped to <code>ta</code> table, using
     * <code>depreciableFurniture</code> bean.
     */
    public FurnitureDataSource() {
        super("depreciableFurniture", "ta");
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public List<Furniture> getDepreciableFurnitureList() {
        final DataSource dataSource = this.createCopy();
        dataSource.setApplyVpaRestrictions(false);
        dataSource.addRestriction(
            Restrictions.and(Restrictions.isNotNull(this.tableName, Constants.DATE_DELIVERY),
                Restrictions.isNull(this.tableName, Constants.TA_LEASE_ID),
                Restrictions.gt(this.tableName, Constants.VALUE_ORIGINAL, 0.0)));
        final List<DataRecord> records = dataSource.getRecords();

        return new DataSourceObjectConverter<Furniture>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */

    @Override
    public int getCountOfDepreciableFurniture() {
        return DataStatistics.getInt(this.tableName, Constants.TA_ID, Constants.FORMULA_COUNT,
            Restrictions.and(Restrictions.isNotNull(this.tableName, Constants.DATE_DELIVERY),
                Restrictions.isNull(this.tableName, Constants.TA_LEASE_ID),
                Restrictions.gt(this.tableName, Constants.VALUE_ORIGINAL, 0.0)));

    }
}
