package com.archibus.app.common.connectors.impl.archibus.translation.segregate;

import java.text.ParseException;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Populates field values on a record using field values from records from a data table.
 *
 * @author cole
 * @since 22.1
 *
 */
public class SegregateByData implements ISegregateRule {
    
    /**
     * The parameter for the map from field names in the ARCHIBUS table to fields on the transaction
     * record for fields that should match.
     */
    private static final String RESTRICTION_PARAM = "restrictionMap";
    
    /**
     * The parameter for the map from field names on the ARCHIBUS table to fields on the transaction
     * record for fields that should be set.
     */
    private static final String VALUE_PARAM = "valueMap";
    
    /**
     * The name of the data table.
     */
    private String tableName;

    /**
     * The list of fields on the table involved either in a restriction or an assignment.
     */
    private String[] fieldNames;
    
    /**
     * The map from field names in the data table to fields on the transaction record for fields
     * that should match.
     */
    private JSONObject restrictionMapping;
    
    /**
     * The map from field names on the data table to fields on the transaction record for fields
     * that should be set.
     */
    private JSONObject fieldMapping;
    
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        JSONObject parameters;
        try {
            parameters = new JSONObject(connectorField.getParameter());
        } catch (final ParseException e) {
            throw new ConfigurationException("Unable to parse parameter for "
                    + connectorField.getFieldId(), e);
        }
        this.tableName = connectorField.getValidateTbl();
        this.restrictionMapping = parameters.getJSONObject(RESTRICTION_PARAM);
        this.fieldMapping = parameters.getJSONObject(VALUE_PARAM);
        final Set<String> fieldNameSet = new HashSet<String>();
        final Iterator<String> restrictionMappingKeys = this.restrictionMapping.keys();
        while (restrictionMappingKeys.hasNext()) {
            fieldNameSet.add(this.restrictionMapping.getString(restrictionMappingKeys.next()));
        }
        final Iterator<String> fieldMappingKeys = this.fieldMapping.keys();
        while (fieldMappingKeys.hasNext()) {
            fieldNameSet.add(this.fieldMapping.getString(fieldMappingKeys.next()));
        }
        this.fieldNames = fieldNameSet.toArray(new String[fieldNameSet.size()]);
    }

    /**
     * @return false, since this sets the value of one or more fields based on something other than
     *         data.
     */
    @Override
    public boolean requiresExistingValue() {
        return false;
    }

    @Override
    public List<Map<String, Object>> segregate(final Map<String, Object> record) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(this.tableName, this.fieldNames);
        final Iterator<String> restrictionFields = this.restrictionMapping.keys();
        while (restrictionFields.hasNext()) {
            final String fieldKey = restrictionFields.next();
            final Object sourceValue = record.get(this.restrictionMapping.get(fieldKey));
            if (sourceValue == null) {
                dataSource.addRestriction(Restrictions.isNull(this.tableName, fieldKey));
            } else {
                dataSource.addRestriction(Restrictions.eq(this.tableName, fieldKey, sourceValue));
            }
        }
        final List<Map<String, Object>> records = new ArrayList<Map<String, Object>>();
        for (final DataRecord dataRecord : dataSource.getRecords()) {
            final List<DataValue> fieldValues = dataRecord.getFields();
            for (final DataValue fieldValue : fieldValues) {
                if (this.fieldMapping.has(fieldValue.getName())) {
                    record.put(this.fieldMapping.getString(fieldValue.getName()),
                        fieldValue.getValue());
                }
            }
            records.add(record);
        }
        return records;
    }
}
