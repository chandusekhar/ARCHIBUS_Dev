package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.*;

import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.*;

/**
 * A cache of ARCHIBUS data records based on source records.
 *
 * @author cole
 * @since 22.1
 *
 */
public class RecordCache {

    /**
     * The table to cache records from.
     */
    private final String table;
    
    /**
     * A map of field names from the table to the field names on the source record.
     */
    private final Map<String, String> tableToRecordFields;
    
    /**
     * Whether to use the cache.
     */
    private final boolean isCaching;

    /**
     * For acquiring field definitions.
     */
    private final DataSourceFieldDefLoader fieldDefLoader;
    
    /**
     * Cache for table.
     */
    private final Map<String, DataRecord> cache;

    /**
     * @param table the table to cache records from.
     * @param tableToRecordFields a map of field names from the table to the field names on the
     *            source record.
     * @param isCaching whether to actually cache values.
     */
    public RecordCache(final String table, final Map<String, String> tableToRecordFields,
            final boolean isCaching) {
        this.cache = new HashMap<String, DataRecord>();
        this.fieldDefLoader = new DataSourceFieldDefLoader();
        this.table = table;
        this.tableToRecordFields = tableToRecordFields;
        this.isCaching = isCaching;
    }
    
    /**
     * Retrieve the record from the cache or from the given data source, using the record to create
     * a restriction. NOTE: applies the restriction to the data source, and does not remove it.
     *
     * @param record the record to be matched.
     * @param dataSource the data source to retrieve the record from, with no restrictions.
     * @return the record, either from the cache or the dataSource.
     * @throws TranslationException if one of the values being restricted on is inappropriate for
     *             the field restricted.
     */
    public DataRecord get(final Map<String, Object> record, final DataSource dataSource)
            throws TranslationException {
        final StringBuilder cacheKeyBuilder = new StringBuilder();
        final Restriction restriction = getValidatingTableRestriction(record);
        dataSource.addRestriction(restriction);
        for (final Clause clause : restriction.clauses) {
            cacheKeyBuilder.append(clause.objectValue).append('|');
        }
        return get(cacheKeyBuilder.toString(), dataSource);
    }
    
    /**
     * Retrieve the record from the cache or from the given data source, using the restriction on
     * the data source.
     *
     * @param cacheKey the key for the record in the cache.
     * @param dataSource the data source to retrieve the record from, with a restriction already
     *            applied for the record.
     * @return the record, either from the cache or the dataSource.
     */
    public DataRecord get(final String cacheKey, final DataSource dataSource) {
        DataRecord cacheEntry = this.cache.get(cacheKey);
        if (cacheEntry == null) {
            cacheEntry = dataSource.getRecord();
            if (this.isCaching) {
                this.cache.put(cacheKey, cacheEntry);
            }
        }
        return cacheEntry;
    }

    /**
     * @param record the record ready to be inserted into the ARCHIBUS database
     * @return a restriction on ref_table against the primary keys of that referenced table as taken
     *         from the record.
     * @throws TranslationException if one of the values being restricted on is inappropriate for
     *             the field restricted.
     */
    protected Restriction getValidatingTableRestriction(final Map<String, Object> record)
            throws TranslationException {
        final List<Clause> validatingTableKeyClauses = new ArrayList<Clause>();
        for (final String tableKeyField : this.tableToRecordFields.keySet()) {
            Object recordKeyValue = record.get(this.tableToRecordFields.get(tableKeyField));
            if (!StringUtil.isNullOrEmpty(recordKeyValue)) {
                final DataValue dataValue =
                        new DataValue(this.fieldDefLoader.loadFieldDef(this.table, tableKeyField));
                if (recordKeyValue instanceof String) {
                    try {
                        dataValue.setUiValue((String) recordKeyValue);
                    } catch (final ExceptionBase e) {
                        throw new TranslationException("Inappropriate value for field. "
                                + this.table + '.' + tableKeyField + ':' + (String) recordKeyValue,
                            e);
                    }
                    recordKeyValue = dataValue.getValue();
                }
                validatingTableKeyClauses.add(Restrictions.eq(this.table, tableKeyField,
                    recordKeyValue));
            }
        }
        return Restrictions.and(validatingTableKeyClauses
            .toArray(new Clause[validatingTableKeyClauses.size()]));
    }
}
