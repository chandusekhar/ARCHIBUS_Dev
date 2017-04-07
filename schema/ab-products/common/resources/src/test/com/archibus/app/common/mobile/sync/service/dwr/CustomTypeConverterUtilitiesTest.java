package com.archibus.app.common.mobile.sync.service.dwr;

import java.sql.*;
import java.text.*;

import junit.framework.TestCase;

import org.directwebremoting.ConversionException;
import org.directwebremoting.extend.InboundVariable;

/**
 * Tests for CustomTypeConverterUtilities.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class CustomTypeConverterUtilitiesTest extends TestCase {
    private static final String CONTAINS_INTEGER_CONTAINS = "containsIntegerContains";
    
    private static final String _345 = "345";
    
    private static final String CONTAINS_TIME_CONTAINS = "containsTimeContains";
    
    private static final String CONTAINS_DATE_CONTAINS = "containsDateContains";
    
    private static final String NO_MAPPING_FOR_JAVA_SCRIPT_TYPE_JUNK =
            "No mapping for javaScriptType=[Junk]";
    
    private static final String EXCEPTION_EXPECTED = "Exception expected";
    
    private static final String JUNK = "Junk";
    
    private static final String NULL = "null";
    
    private static final String TIMESTAMP = "timestamp";
    
    private static final String TIME = "time";
    
    private static final String DATE = "date";
    
    private static final String NUMBER = "number";
    
    private static final String STRING = "string";
    
    private static final String INT = "int";
    
    /**
     * Test method for {@link CustomTypeConverterUtilities#determineObjectType(String)} .
     */
    public final void testDetermineObjectType() {
        assertEquals(Integer.class, CustomTypeConverterUtilities.determineObjectType(INT));
        assertEquals(String.class, CustomTypeConverterUtilities.determineObjectType(STRING));
        assertEquals(Double.class, CustomTypeConverterUtilities.determineObjectType(NUMBER));
        assertEquals(Date.class, CustomTypeConverterUtilities.determineObjectType(DATE));
        assertEquals(Time.class, CustomTypeConverterUtilities.determineObjectType(TIME));
        assertEquals(Timestamp.class, CustomTypeConverterUtilities.determineObjectType(TIMESTAMP));
        assertEquals(null, CustomTypeConverterUtilities.determineObjectType(NULL));
        assertEquals(null,
            CustomTypeConverterUtilities
                .determineObjectType(CustomTypeConverterUtilities.OBJECT_OBJECT));
        try {
            CustomTypeConverterUtilities.determineObjectType(JUNK);
            fail(EXCEPTION_EXPECTED);
        } catch (final ConversionException exception) {
            assertEquals(NO_MAPPING_FOR_JAVA_SCRIPT_TYPE_JUNK, exception.getMessage());
        }
    }
    
    /**
     * Test method for {@link CustomTypeConverterUtilities#javaScriptToArchibusType(String)} .
     */
    public final void testJavaScriptToArchibusType() {
        assertEquals("INTEGER", CustomTypeConverterUtilities.javaScriptToArchibusType(INT));
        assertEquals("STRING", CustomTypeConverterUtilities.javaScriptToArchibusType(STRING));
        assertEquals("DOUBLE", CustomTypeConverterUtilities.javaScriptToArchibusType(NUMBER));
        assertEquals("DATE", CustomTypeConverterUtilities.javaScriptToArchibusType(DATE));
        assertEquals("TIME", CustomTypeConverterUtilities.javaScriptToArchibusType(TIME));
        assertEquals("TIMESTAMP", CustomTypeConverterUtilities.javaScriptToArchibusType(TIMESTAMP));
        assertEquals(null, CustomTypeConverterUtilities.javaScriptToArchibusType(NULL));
        assertEquals(null,
            CustomTypeConverterUtilities
                .javaScriptToArchibusType(CustomTypeConverterUtilities.OBJECT_OBJECT));
        
        try {
            CustomTypeConverterUtilities.javaScriptToArchibusType(JUNK);
            fail(EXCEPTION_EXPECTED);
        } catch (final ConversionException exception) {
            assertEquals(NO_MAPPING_FOR_JAVA_SCRIPT_TYPE_JUNK, exception.getMessage());
        }
    }
    
    /**
     * Test method for
     * {@link CustomTypeConverterUtilities#mapConvertedValueToArchibusValue(String, Object)} .
     * 
     * @throws ParseException
     */
    public final void testMapConvertedValueToArchibusValue() throws ParseException {
        {
            final String expected = "01-13-1999";
            final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            
            final Object actual =
                    CustomTypeConverterUtilities.mapConvertedValueToArchibusValue(
                        CONTAINS_DATE_CONTAINS, expected);
            
            assertEquals(new java.sql.Date(format.parse(expected).getTime()), actual);
        }
        {
            final String expected = "12:45:59.123";
            final SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS");
            
            final Object actual =
                    CustomTypeConverterUtilities.mapConvertedValueToArchibusValue(
                        CONTAINS_TIME_CONTAINS, expected);
            
            assertEquals(new java.sql.Date(format.parse(expected).getTime()), actual);
        }
        {
            assertEquals(new Integer(_345),
                CustomTypeConverterUtilities.mapConvertedValueToArchibusValue(
                    CONTAINS_INTEGER_CONTAINS, new Integer(_345)));
        }
        {
            assertEquals(null, CustomTypeConverterUtilities.mapConvertedValueToArchibusValue(
                CONTAINS_INTEGER_CONTAINS, null));
        }
    }
    
    /**
     * Test method for {@link CustomTypeConverterUtilities#mapJavaScriptClassNameToJavaType(String)}
     * .
     */
    public final void testMapJavaScriptClassNameToJavaType() {
        {
            assertEquals(java.util.Date.class,
                CustomTypeConverterUtilities
                    .mapJavaScriptClassNameToJavaType(CONTAINS_DATE_CONTAINS));
        }
        {
            assertEquals(java.util.Date.class,
                CustomTypeConverterUtilities
                    .mapJavaScriptClassNameToJavaType(CONTAINS_TIME_CONTAINS));
        }
        {
            assertEquals(java.lang.Integer.class,
                CustomTypeConverterUtilities
                    .mapJavaScriptClassNameToJavaType(CONTAINS_INTEGER_CONTAINS));
        }
        try {
            CustomTypeConverterUtilities.mapJavaScriptClassNameToJavaType(JUNK);
            fail(EXCEPTION_EXPECTED);
        } catch (final ConversionException exception) {
            assertEquals("No mapping for javaScriptClassName=[Junk]", exception.getMessage());
        }
    }
    
    /**
     * Test method for {@link CustomTypeConverter#convertValue(InboundVariable, String)} .
     */
    public final void testStripBraces() {
        {
            final String value = "{abc}";
            final String actual = CustomTypeConverterUtilities.stripBraces(value);
            assertEquals("abc", actual);
        }
        
        {
            final String value = "abc}";
            final String actual = CustomTypeConverterUtilities.stripBraces(value);
            assertEquals("abc", actual);
        }
        {
            final String value = "{abc";
            final String actual = CustomTypeConverterUtilities.stripBraces(value);
            assertEquals("abc", actual);
        }
        {
            final String value = "abc";
            final String actual = CustomTypeConverterUtilities.stripBraces(value);
            assertEquals("abc", actual);
        }
    }
}
