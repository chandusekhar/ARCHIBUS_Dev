package com.archibus.app.common.mobile.sync.service.dwr;

import java.util.*;

import org.directwebremoting.ConversionException;
import org.directwebremoting.convert.DateConverter;
import org.directwebremoting.extend.*;

/**
 * Converter for Date types.
 * <p>
 * Overrides outbound conversion to marshal Date/Time as formatted string
 * "EEE, d MMM yyyy HH:mm:ss.SSS" instead of long value (number of milliseconds), to avoid problem:
 * date/time values do not survive roundtrip client-server-client when client and server are in
 * different timezones.
 * <p>
 * The inbound conversion is overriden in CustomTypeConverter.
 * <p>
 * 
 * Used by DWR to marshal Date/Time values for mobile clients. Configured in dwr.xml file.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 *        Suppress PMD warning "SimpleDateFormatNeedsLocale".
 *        <p>
 *        Justification: This constructor uses default locale, as intended.
 * 
 *        Suppress Java warning "Using deprecated method".
 *        <p>
 *        Justification: TODO: Refactor the code later.
 */
@SuppressWarnings({ "PMD.SimpleDateFormatNeedsLocale", "deprecation" })
public class CustomDateConverter extends DateConverter {
    
    /**
     * Constant: 1900.
     */
    private static final int YEAR_1900 = 1900;
    
    /** {@inheritDoc} */
    @Override
    public OutboundVariable convertOutbound(final Object data, final OutboundContext outctx)
            throws ConversionException {
        long millis;
        
        if (data instanceof Calendar) {
            final Calendar cal = (Calendar) data;
            millis = cal.getTime().getTime();
        } else if (data instanceof java.util.Date) {
            final java.util.Date date = (java.util.Date) data;
            millis = date.getTime();
        } else {
            throw new ConversionException(data.getClass());
        }
        
        final Date valueAsDate = new Date(millis);
        final Date valueWithoutMilliseconds =
                new Date(valueAsDate.getYear(), valueAsDate.getMonth(), valueAsDate.getDate(),
                    valueAsDate.getHours(), valueAsDate.getMinutes(), valueAsDate.getSeconds());
        
        final int milliseconds = (int) (millis - valueWithoutMilliseconds.getTime());
        final String formattedValue =
                String.format("new Date(%d,%d,%d,%d,%d,%d,%d)", valueAsDate.getYear() + YEAR_1900,
                    valueAsDate.getMonth(), valueAsDate.getDate(), valueAsDate.getHours(),
                    valueAsDate.getMinutes(), valueAsDate.getSeconds(), milliseconds);
        
        // send string in format "new Date(year, month, day, hours, minutes, seconds, milliseconds)"
        // to JavaScript client
        return new NonNestedOutboundVariable(formattedValue);
    }
}
