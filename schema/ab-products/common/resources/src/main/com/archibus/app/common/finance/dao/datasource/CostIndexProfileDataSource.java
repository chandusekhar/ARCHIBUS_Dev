package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.CostIndexProfile;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Data source for Cost index profile.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostIndexProfileDataSource extends AbstractCostIndexDataSource<CostIndexProfile> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.DATE_INDEX_END, "dateIndexEnd" },
            { Constants.DATE_INDEX_START, "dateIndexStart" }, { "limit_max", "limitMax" },
            { "limit_min", "limitMin" }, { "max_rent", "maxRent" }, { "min_rent", "minRent" } };
    
    /**
     * Constructs CostIndexProfileDataSource, mapped to <code>ls_index_profile</code> table, using
     * <code>costIndexProfile</code> bean.
     * 
     */
    public CostIndexProfileDataSource() {
        super("costIndexProfile", "ls_index_profile");
    }
    
    /**
     * Get all cost index profiles that are valid for specified date.
     * 
     * @param date date value
     * @param sqlRestriction custom restriction
     * 
     * @return cost index profile list
     * 
     */
    public List<CostIndexProfile> findByDate(final Date date, final String sqlRestriction) {
        final DataSource dataSource = this.createCopy();
        // date_index_start <= today/ls.date_end
        // date_index_next <= today/ls.date_end OR date_index_next IS NULL
        // date_index_end >= today/ls.date_end OR date_index_end IS NULL
        
        dataSource.addRestriction(Restrictions
            .lte(this.tableName, Constants.DATE_INDEX_START, date));
        dataSource.addRestriction(Restrictions.or(
            Restrictions.lte(this.tableName, Constants.DATE_INDEX_NEXT, date),
            Restrictions.isNull(this.tableName, Constants.DATE_INDEX_NEXT)));
        /*
         * dataSource.addRestriction(Restrictions.or( Restrictions.gte(this.tableName,
         * Constants.DATE_INDEX_END, date), Restrictions.isNull(this.tableName,
         * Constants.DATE_INDEX_END)));
         */
        dataSource.addRestriction(Restrictions.sql(sqlRestriction));
        
        final List<DataRecord> records = dataSource.getRecords();
        
        return new DataSourceObjectConverter<CostIndexProfile>().convertRecordsToObjects(records,
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
