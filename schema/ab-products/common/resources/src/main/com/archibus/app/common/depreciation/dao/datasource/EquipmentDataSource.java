package com.archibus.app.common.depreciation.dao.datasource;

import java.util.List;

import com.archibus.app.common.depreciation.Constants;
import com.archibus.app.common.depreciation.dao.IEquipmentDao;
import com.archibus.app.common.depreciation.domain.Equipment;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Equipment data source. Mapped to <code>eq</code> table
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class EquipmentDataSource extends ObjectDataSourceImpl<Equipment>
        implements IEquipmentDao<Equipment> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES =
            { { Constants.EQ_ID, "eqId" }, { "property_type", "propertyType" },
                    { "cost_dep_value", "costDepValue" }, { "cost_purchase", "costPurchase" },
                    { "value_salvage", "valueSalvage" }, { "date_installed", "dateInstalled" } };

    /**
     * Constructs EquipmentDataSource, mapped to <code>eq</code> table, using
     * <code>depreciableEquipment</code> bean.
     */
    public EquipmentDataSource() {
        super("depreciableEquipment", "eq");
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public List<Equipment> getDepreciableEquipmentList() {
        final DataSource dataSource = this.createCopy();
        dataSource.setApplyVpaRestrictions(false);
        dataSource.addRestriction(
            Restrictions.and(Restrictions.isNotNull(this.tableName, Constants.DATE_INSTALLED),
                Restrictions.isNull(this.tableName, Constants.TA_LEASE_ID),
                Restrictions.gt(this.tableName, Constants.COST_PURCHASE, 0.0)));
        final List<DataRecord> records = dataSource.getRecords();

        return new DataSourceObjectConverter<Equipment>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */

    @Override
    public int getCountOfDepreciableEquipment() {
        return DataStatistics.getInt(this.tableName, Constants.EQ_ID, Constants.FORMULA_COUNT,
            Restrictions.and(Restrictions.isNotNull(this.tableName, Constants.DATE_INSTALLED),
                Restrictions.isNull(this.tableName, Constants.TA_LEASE_ID),
                Restrictions.gt(this.tableName, Constants.COST_PURCHASE, 0.0)));

    }
}
