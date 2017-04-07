package com.archibus.app.common.connectors.translation.common.outbound.impl;

import java.util.*;

/**
 * A transaction definition where the values come from an ARCHIBUS data source.
 *
 * @author cole
 *
 */
public class DataSourceRequestTxDef extends RequestDef<DataSourceFieldDefinition> {
    /**
     * Create a foreign transaction definition.
     *
     * @param foreignFieldDefinitions fields are properties used to create a transaction, and the
     *            foreign field definitions hold information on interpreting them. The order may be
     *            significant, and these fields should be extracted in the order specified by the
     *            list.
     */
    public DataSourceRequestTxDef(
            final List<? extends DataSourceFieldDefinition> foreignFieldDefinitions) {
        super(foreignFieldDefinitions);
    }
    
    @Override
    protected Object getDatabaseValue(final DataSourceFieldDefinition foreignFieldDefinition,
            final Map<String, Object> databaseParameters) {
        return databaseParameters.get(foreignFieldDefinition.getDataSourceFieldName());
    }
}
