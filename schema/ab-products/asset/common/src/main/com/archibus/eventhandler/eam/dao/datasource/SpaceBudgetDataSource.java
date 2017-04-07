package com.archibus.eventhandler.eam.dao.datasource;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.ViewField;
import com.archibus.eventhandler.eam.dao.ISpaceBudgetDao;
import com.archibus.eventhandler.eam.domain.SpaceBudget;

/**
 *
 * Space budget datasource.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class SpaceBudgetDataSource extends ObjectDataSourceImpl<SpaceBudget> implements
ISpaceBudgetDao<SpaceBudget> {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "sb_name", "name" },
        { "sb_desc", "description" }, { "sb_level", "level" }, { "sb_type", "type" },
        { "sb_from", "createdFrom" }, { "sb_as", "createdAs" },
        { "alloc_period", "allocPeriod" }, { "alloc_score", "allocScore" },
        { "alloc_score_ext", "allocScoreExt" } };
    
    /**
     * Constructs SpaceBudgetDataSource, mapped to <code>sb</code> table, using
     * <code>spaceBudget</code> bean.
     *
     */
    public SpaceBudgetDataSource() {
        super("spaceBudget", "sb");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public SpaceBudget getSpaceBudget(final String name) {
        final DataSourceImpl dataSource = (DataSourceImpl) this.createCopy();
        dataSource.checkSetContext();
        
        final ViewField.Immutable firstPkField = dataSource.getPrimaryKeyFields().get(0);
        dataSource.addRestriction(Restrictions.eq(this.tableName, firstPkField.getName(), name));
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<SpaceBudget>().convertRecordToObject(record,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

}
