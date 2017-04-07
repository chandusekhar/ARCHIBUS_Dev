package com.archibus.app.common.connectors.translation.xls.outbound;

import com.archibus.app.common.connectors.translation.common.outbound.impl.ListField;
import com.archibus.schema.DataType;

/**
 * A field to be written to an Excel file.
 * 
 * @author cole
 */
public class XlsField extends ListField {
    /**
     * The data type of the field.
     */
    private final DataType dataType;
    
    /**
     * @param fieldName the name of the field.
     * @param position the zero based position of the field in the record.
     * @param dataType the data type of the field's values.
     */
    public XlsField(final String fieldName, final int position, final DataType dataType) {
        super(fieldName, position);
        this.dataType = dataType;
    }
    
    /**
     * @return the data type of the field's values.
     */
    public DataType getDataType() {
        return this.dataType;
    }
}
