package com.archibus.app.common.connectors.impl.archibus.translation.field;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.context.ContextStore;
import com.archibus.utility.StringUtil;

/**
 * A basis for a connector rule to set the value of the date or time field to a string
 * representation of the java.util.Date value.
 * 
 * @author cole
 * 
 */
public abstract class AbstractFormatDate implements IFieldTranslator {
    /**
     * The format for the date or time.
     */
    protected SimpleDateFormat dateFormat;
    
    /**
     * Instantiate the translator with the format for the date or time string.
     * 
     * @param connectorField the configuration for the field, including the format of the date or
     *            time in parameters.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        final String parameter = connectorField.getParameter();
        if (!StringUtil.isNullOrEmpty(parameter)) {
            this.dateFormat =
                    new SimpleDateFormat(parameter, ContextStore.get().getUserSession().getLocale());
        }
    }
    
    /**
     * @param value a java.util.Date value.
     * @return a string representation of the value in the provided format.
     */
    public Object applyRule(final Object value) {
        return this.dateFormat == null ? value : this.dateFormat.format((Date) value);
    }
}
