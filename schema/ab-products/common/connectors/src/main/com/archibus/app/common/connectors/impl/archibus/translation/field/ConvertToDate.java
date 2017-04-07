package com.archibus.app.common.connectors.impl.archibus.translation.field;

import java.text.*;
import java.util.Date;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.translation.common.DateUtil;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.context.ContextStore;
import com.archibus.db.ViewField.Immutable;
import com.archibus.schema.DataType;
import com.archibus.utility.StringUtil;

/**
 * Convert a string to a java.sql.Timestamp, java.sql.Date or a java.sql.Time depending on the
 * connector field.
 *
 * @author cole
 * @since 21.3
 *
 */
public class ConvertToDate implements IFieldTranslator {
    
    /**
     * The format of a date for the foreign system.
     */
    private SimpleDateFormat foreignDateFormat;
    
    /**
     * Whether we're exporting or importing data (converting ARCHIBUS to foreign or visa versa).
     */
    private boolean isExport;
    
    /**
     * Whether this field is a time field (as opposed to a timestamp).
     */
    private boolean isTime;
    
    /**
     * Whether this field is a date field (as opposed to a timestamp).
     */
    private boolean isDate;
    
    /**
     * Create a convert to date object with some default values.
     */
    public ConvertToDate() {
        this.foreignDateFormat = new SimpleDateFormat();
        this.isExport = true;
        this.isTime = false;
    }
    
    /**
     * Instantiate this rule based on a connector field, using the date format from the connector
     * field parameters for the foreign date and the type of the target field to determine if a date
     * or time is needed (inbound only).
     *
     * @param connectorField represents the field whose value is updated, with configuration for how
     *            the date/time should be formatted.
     */
    @Override
    public void init(final ConnectorFieldConfig connectorField) {
        if (StringUtil.isNullOrEmpty(connectorField.getParameter())) {
            this.foreignDateFormat = new SimpleDateFormat();
        } else {
            this.foreignDateFormat =
                    new SimpleDateFormat(connectorField.getParameter(), ContextStore.get()
                        .getUserSession().getLocale());
        }
        this.isExport = connectorField.getConnector().getExport();
        final Immutable fieldDef = DataSourceUtil.getFieldDef(connectorField);
        final DataType sqlType = fieldDef == null ? null : DataType.get(fieldDef.getSqlType());
        this.isTime = sqlType == DataType.TIME;
        this.isDate = sqlType == DataType.DATE;
    }
    
    /**
     * Parse the date and reformat it for the target system.
     *
     * ARCHIBUS expects a Date object, the foreign system is assumed to expect a String.
     *
     * @param value the date or time.
     * @return the reformatted date or time.
     * @throws TranslationException if the date does not conform to the specified format.
     */
    @Override
    public Object applyRule(final Object value) throws TranslationException {
        Object dateValue = null;
        if (value != null && !"".equals(value.toString())) {
            try {
                if (this.isExport) {
                    dateValue = this.foreignDateFormat.format((Date) value);
                } else {
                    if (value instanceof Date) {
                        dateValue = convertToTargetClass((Date) value);
                    } else if (!StringUtil.isNullOrEmpty(value)) {
                        final Date date = this.foreignDateFormat.parse(value.toString());
                        dateValue = convertToTargetClass(date);
                    }
                }
            } catch (final ParseException e) {
                throw new TranslationException("Unable to parse date: " + value.toString()
                        + " of class " + value.getClass().getName() + " using pattern: "
                        + this.foreignDateFormat.toPattern(), e);
            }
        }
        return dateValue;
    }
    
    /**
     * Converts the parsed date to a Date or Time object depending on configuration.
     *
     * @param date the parsed date.
     * @return the Date or Time object depending on isTime.
     */
    public Date convertToTargetClass(final Date date) {
        Date dateValue = null;
        if (this.isTime) {
            dateValue = DateUtil.getSqlTimeFromDate(date);
        } else if (this.isDate) {
            dateValue = DateUtil.getSqlDateFromDate(date);
        } else {
            dateValue = DateUtil.getSqlTimestampFromDate(date);
        }
        return dateValue;
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
