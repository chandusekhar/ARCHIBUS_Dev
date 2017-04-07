package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * DataSource for RecurringCost.
 *
 * @author Ioan Draghici
 * @author Valery Tydykov
 */
public class RecurringCostDataSource extends AbstractCostDataSource<RecurringCost> {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Only fields specific to RecurringCost are specified here, the common fields are specified in
     * the base class.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "cost_tran_recur_id", "id" },
            { Constants.DATE_START, "dateStart" }, { Constants.DATE_END, "dateEnd" },
            { "date_seasonal_start", "dateSeasonalStart" },
            { "date_seasonal_end", "dateSeasonalEnd" }, { Constants.PERIOD, Constants.PERIOD },
            { "period_custom", "periodCustom" }, { "yearly_factor", "yearlyFactor" },
            { "status_active", "statusActive" } };

    /**
     * Constructs RecurringCostDataSource, mapped to <code>cost_tran_recur</code> table, using
     * <code>recurringCost</code> bean.
     */
    public RecurringCostDataSource() {
        super("recurringCost", "cost_tran_recur");
        setApplyVpaRestrictions(false);
    }

    @Override
    public List<RecurringCost> findByAssetKeyAndDateRange(final String assetKey,
            final Date startDate, final Date endDate, final String clientRestriction) {
        final DataSource dataSource = this.createCopy();
        // apply vpa restriction using binding parameters
        dataSource.addTable("bl");
        dataSource.addTable("property");
        dataSource.setApplyVpaRestrictions(false);

        if (StringUtil.notNullOrEmpty(assetKey)) {
            final String[] keys = Utility.stringToArray(assetKey, ",");
            for (final String key2 : keys) {
                final String key = key2.trim();
                dataSource.addRestriction(Restrictions.isNotNull(this.tableName, key));
            }
        }

        if (StringUtil.notNullOrEmpty(startDate)) {
            dataSource.addRestriction(
                Restrictions.or(Restrictions.gte(this.tableName, Constants.DATE_END, startDate),
                    Restrictions.isNull(this.tableName, Constants.DATE_END)));
        }

        if (StringUtil.notNullOrEmpty(endDate)) {
            dataSource
                .addRestriction(Restrictions.lte(this.tableName, Constants.DATE_START, endDate));
        }

        final List<DataRecord> records = dataSource.getRecords(clientRestriction);

        return new DataSourceObjectConverter<RecurringCost>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    @Override
    public List<RecurringCost> findByCostIds(final List<Integer> costIds) {
        final DataSourceImpl dataSource = (DataSourceImpl) this.createCopy();
        dataSource.setApplyVpaRestrictions(false);
        dataSource.checkSetContext();

        final String costIdRestriction = this.tableName + ".status_active = '1' AND ("
                + createSqlRestrictionForCosts(costIds) + ")";
        final List<DataRecord> records = dataSource.getRecords(costIdRestriction);

        return new DataSourceObjectConverter<RecurringCost>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);

        return fieldsToPropertiesMerged;
    }
}
