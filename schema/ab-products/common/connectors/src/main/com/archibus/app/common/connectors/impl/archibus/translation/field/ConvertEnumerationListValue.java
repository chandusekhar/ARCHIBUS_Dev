package com.archibus.app.common.connectors.impl.archibus.translation.field;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.context.ContextStore;
import com.archibus.db.ViewFieldImpl;
import com.archibus.schema.FieldDefBase.Immutable;
import com.archibus.schema.*;

/**
 * Convert a field's value to a mapped value specified in the ARCHIBUS data dictionary.
 *
 * @author cole
 *
 */
public class ConvertEnumerationListValue implements IFieldTranslator {

    /**
     * The map of old field values to new field values.
     */
    private final Map<String, String> mapping = new HashMap<String, String>();

    /**
     * Initialize the enumeration <-> value map by parsing the enum_list field from the connector
     * field.
     *
     * @param connectorField the field with the enumerated list to parse.
     */
    @Override
    public void init(final ConnectorFieldConfig connectorField) {
        final Immutable fieldDef = DataSourceUtil.getFieldDef(connectorField);
        FieldEnumImpl fieldEnumDef = null;
        final boolean isExport = connectorField.getConnector().getExport();
        if (fieldDef instanceof FieldEnumImpl) {
            fieldEnumDef = (FieldEnumImpl) fieldDef;
        } else if (fieldDef instanceof ViewFieldImpl) {
            fieldEnumDef = (FieldEnumImpl) ((ViewFieldImpl) fieldDef).getFieldDef();
        }
        if (fieldDef != null) {
            for (final Object enumMappingObject : fieldEnumDef.getValues(ContextStore.get()
                .getUserSession().getLocale())) {
                final List<?> enumMapping = (List<?>) enumMappingObject;
                this.mapping.put(enumMapping.get(isExport ? 0 : 1).toString(),
                    (String) enumMapping.get(isExport ? 1 : 0));
            }
        }
    }

    /**
     * @param value the value to be replaced.
     * @return the new value for the value in the map.
     */
    @Override
    public Object applyRule(final Object value) {
        return this.mapping.get(value);
    }

    /**
     * A value must exist to be converted.
     *
     * @return true.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }
}
