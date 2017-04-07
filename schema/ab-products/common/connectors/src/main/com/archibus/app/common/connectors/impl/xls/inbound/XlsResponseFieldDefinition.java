package com.archibus.app.common.connectors.impl.xls.inbound;

import java.sql.Time;
import java.util.Date;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.ListResponseFieldDefinition;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.datasource.DataSourceFieldDefLoader;
import com.archibus.schema.DataType;
import com.aspose.cells.DateTime;

/**
 * A field definition for Excel values.
 *
 * @author cole
 *
 */
public class XlsResponseFieldDefinition extends ListResponseFieldDefinition<Object> {
    /**
     * The data type for the ARCHIBUS field.
     */
    private final DataType fieldDataType;
    
    /**
     * @param connectorField the field associated with the afm_connector record that describes this
     *            field.
     * @param fieldDefLoader a means to retrieve the afm_flds data about this field.
     * @param position the position of this field relative to others on the connector.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public XlsResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader, final int position)
            throws ConfigurationException {
        super(connectorField, fieldDefLoader, position);
        this.fieldDataType =
                getFieldDef() == null ? null : DataType.get(getFieldDef().getSqlType());
    }
    
    @Override
    public Object translateToDatabase(final Object extractedForeignValue)
            throws TranslationException {
        final DataType dataType =
                getFieldDef() == null ? null : DataType.get(getFieldDef().getSqlType());
        Object translatedValue = super.translateToDatabase(extractedForeignValue);
        if (extractedForeignValue instanceof DateTime) {
            translatedValue = ((DateTime) extractedForeignValue).toDate();
            if (this.fieldDataType == DataType.TIME) {
                translatedValue = new Time(((Date) translatedValue).getTime());
            }
        } else if ((dataType == DataType.INTEGER || dataType == DataType.SMALLINT)
                && extractedForeignValue instanceof Double) {
            translatedValue = ((Double) extractedForeignValue).intValue();
        }
        return translatedValue;
    }
}
