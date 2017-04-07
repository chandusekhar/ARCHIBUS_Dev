package com.archibus.app.common.mobile.sync.service.dwr;

import java.text.*;

import org.directwebremoting.ConversionException;

import com.archibus.model.view.AbstractViewFieldDef.DataType;
import com.archibus.schema.FieldJavaTypeBaseImpl;

/**
 * Utilities for CustomTypeConverter. Provides methods for mapping between JavaScript types and
 * values and Java types and values.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1 Suppress PMD warning "SimpleDateFormatNeedsLocale".
 *        <p>
 *        Justification: This constructor uses default locale, as intended.
 */
@SuppressWarnings("PMD.SimpleDateFormatNeedsLocale")
final class CustomTypeConverterUtilities {
    /**
     * Constant: JavaScript custom class name "Date".
     */
    static final String DATE = "Date";
    
    /**
     * Constant: JavaScript custom class name "Integer".
     */
    static final String INTEGER = "Integer";
    
    /**
     * Constant: DWR representation of custom JavaScript object type.
     */
    static final String OBJECT_OBJECT = "Object_Object";
    
    /**
     * Constant: JavaScript custom class name "Time".
     */
    static final String TIME = "Time";
    
    /**
     * Constant: Error message.
     */
    private static final String ERROR_MESSAGE_FAILED_TO_PARSE_VALUE = "Failed to parse value=[%s]";
    
    /**
     * Constant: mapping JavaScript types to ARCHIBUS server-side types. ARCHIBUS type null means
     * that the value to be returned is null.
     * <p>
     * ARCHIBUS server-side data types are defined in
     * com.archibus.model.view.AbstractViewFieldDef$DataType.
     */
    private static final String[][] JS_TYPES_TO_ARCHIBUS_TYPES = { { "int", "INTEGER" },
            { "string", "STRING" }, { "number", "DOUBLE" }, { "date", "DATE" }, { "time", "TIME" },
            { "timestamp", "TIMESTAMP" }, { "null", null }, { OBJECT_OBJECT, null } };
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private CustomTypeConverterUtilities() {
    }
    
    /**
     * Determines type of Java object to create based on the JavaScript type.
     * <p>
     * Supported JavaScript types: "int", "number", "string", "date", "time", "timestamp". The
     * "boolean" type is not supported. JavaScript type "null" means that the value is null.
     * 
     * @param javaScriptType type of the javaScript variable.
     * @return Java type, or null if the object value is null.
     */
    static Class<?> determineObjectType(final String javaScriptType) {
        Class<?> type = null;
        
        final String archibusType = javaScriptToArchibusType(javaScriptType);
        if (archibusType != null) {
            // map ARCHIBUS type name to Java type
            type = FieldJavaTypeBaseImpl.toJavaClass(DataType.fromString(archibusType));
        }
        
        return type;
    }
    
    /**
     * Converts JavaScript type to ARCHIBUS server-side data type.
     * <p>
     * Supported JavaScript types: "int", "number", "string", "date", "time", "timestamp". The
     * "boolean" type is not supported. JavaScript type "null" means that the value is null.
     * <p>
     * ARCHIBUS server-side data types are defined in
     * com.archibus.model.view.AbstractViewFieldDef$DataType.
     * 
     * @param javaScriptType to be converted.
     * @return ARCHIBUS data type name, or null if javaScriptType is "null" or Object.
     */
    static String javaScriptToArchibusType(final String javaScriptType) {
        String archibusType = null;
        boolean found = false;
        for (final String[] jsTypeToArchibusType : JS_TYPES_TO_ARCHIBUS_TYPES) {
            if (jsTypeToArchibusType[0].equals(javaScriptType)) {
                archibusType = jsTypeToArchibusType[1];
                found = true;
                break;
            }
        }
        
        if (!found) {
            // @non-translatable
            final String errorMessage =
                    String.format("No mapping for javaScriptType=[%s]", javaScriptType);
            throw new ConversionException(null, errorMessage);
        }
        
        return archibusType;
    }
    
    /**
     * Maps value converted by DWR to value of ARCHIBUS type. Supported Java script class names are
     * Date, Time, Integer.
     * <p>
     * Date is expected to be a string in ISO format "yyyy-MM-dd".
     * <p>
     * Time is expected to be a string in format "HH:mm.ss.SSS".
     * 
     * @param javaScriptClassName class name of the variable to be converted.
     * @param convertedValue value converted by DWR from JavaScript value.
     * @return value of ARCHIBUS type.
     */
    static Object mapConvertedValueToArchibusValue(final String javaScriptClassName,
            final Object convertedValue) {
        Object returnValue = null;
        if (javaScriptClassName.contains(DATE)) {
            // Date is expected to be a string in ISO format yyyy-MM-dd
            final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            try {
                returnValue = new java.sql.Date(format.parse((String) convertedValue).getTime());
            } catch (final ParseException e) {
                // @non-translatable
                final String errorMessage =
                        String.format(ERROR_MESSAGE_FAILED_TO_PARSE_VALUE, convertedValue);
                throw new ConversionException(null, errorMessage);
            }
        } else if (javaScriptClassName.contains(TIME)) {
            // Time is expected to be a string in format HH:mm.ss.SSS
            final SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS");
            try {
                returnValue = new java.sql.Time(format.parse((String) convertedValue).getTime());
            } catch (final ParseException e) {
                // @non-translatable
                final String errorMessage =
                        String.format(ERROR_MESSAGE_FAILED_TO_PARSE_VALUE, convertedValue);
                throw new ConversionException(null, errorMessage);
            }
        } else if (javaScriptClassName.contains(INTEGER)) {
            returnValue = convertedValue;
        }
        
        return returnValue;
    }
    
    /**
     * Maps JavaScript class name to Java type. Supported Java script class names are Date, Time,
     * Integer.
     * 
     * @param javaScriptClassName to be mapped.
     * @return Java type
     */
    static Class<?> mapJavaScriptClassNameToJavaType(final String javaScriptClassName) {
        Class<?> javaType = null;
        if (javaScriptClassName.contains(DATE)) {
            javaType = java.util.Date.class;
        } else if (javaScriptClassName.contains(TIME)) {
            javaType = java.util.Date.class;
        } else if (javaScriptClassName.contains(INTEGER)) {
            javaType = java.lang.Integer.class;
        }
        
        if (javaType == null) {
            // @non-translatable
            final String errorMessage =
                    String.format("No mapping for javaScriptClassName=[%s]", javaScriptClassName);
            throw new ConversionException(null, errorMessage);
        }
        
        return javaType;
    }
    
    /**
     * Strips braces at the beginning and the end of the string, for example converts "{abc}" to
     * "abc".
     * 
     * @param value string to be stripped from the braces.
     * @return converted value without braces.
     */
    static String stripBraces(final String value) {
        String returnValue = value;
        // strip "{" at the beginning
        if (returnValue.startsWith("{")) {
            returnValue = returnValue.substring(1);
        }
        
        // strip "}" at the end
        final int indexOfBrace = returnValue.lastIndexOf('}');
        if (indexOfBrace > 0) {
            returnValue = returnValue.substring(0, indexOfBrace);
        }
        
        return returnValue;
    }
}
