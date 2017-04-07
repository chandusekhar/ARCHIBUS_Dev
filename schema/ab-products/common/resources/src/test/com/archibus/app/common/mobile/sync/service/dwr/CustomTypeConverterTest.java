package com.archibus.app.common.mobile.sync.service.dwr;

import java.text.*;

import junit.framework.TestCase;

import org.directwebremoting.convert.PrimitiveConverter;
import org.directwebremoting.extend.*;
import org.directwebremoting.impl.DefaultConverterManager;

import com.archibus.app.common.mobile.sync.service.dwr.CustomTypeConverter.TypeAndValue;

/**
 * Tests for CustomTypeConverter.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class CustomTypeConverterTest extends TestCase {
    
    /**
     * Test method for {@link CustomTypeConverter#extractJavaScriptClassName(InboundVariable)} .
     */
    public final void testExtractJavaScriptClassName() {
        {
            // case #1: className=Integer
            final InboundVariable inboundVariable =
                    new InboundVariable(null, null, null, "%24className:Integer");
            
            final String actual = CustomTypeConverter.extractJavaScriptClassName(inboundVariable);
            
            assertEquals("Integer", actual);
        }
        {
            // case #1: no className
            final InboundVariable inboundVariable = new InboundVariable(null, null, null, "");
            
            final String actual = CustomTypeConverter.extractJavaScriptClassName(inboundVariable);
            
            assertEquals(null, actual);
        }
    }
    
    /**
     * Test method for {@link CustomTypeConverter#convert(String, Class, InboundContext, Property)}
     * .
     * 
     * @throws ParseException
     */
    public final void testConvertStringClassOfQInboundContextProperty() throws ParseException {
        // Case #1: Custom JavaScript object of type Common.type.Integer
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.Integer", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            context.createInboundVariable(0, "c0-e1", "number", "123");
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Integer");
            context.createInboundVariable(0, "c0-e3", "Object_Object",
                "{_value:reference:c0-e1, %24className:reference:c0-e2}");
            
            final String val = "reference:c0-e3";
            final Property property = null;
            final Class<?> propType = java.lang.Object.class;
            final Object actual = converter.convert(val, propType, context, property);
            
            assertEquals(Integer.valueOf(123), actual);
        }
        
        // Case #2: Custom JavaScript object of type Common.type.Date
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.String", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            final String expected = "01-13-1999";
            context.createInboundVariable(0, "c0-e1", "string", expected);
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Date");
            context.createInboundVariable(0, "c0-e3", "Object_Object",
                "{formatted:reference:c0-e1, %24className:reference:c0-e2}");
            
            final String val = "reference:c0-e3";
            final Property property = null;
            final Class<?> propType = java.lang.Object.class;
            final Object actual = converter.convert(val, propType, context, property);
            
            final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            
            assertEquals(new java.sql.Date(format.parse(expected).getTime()), actual);
        }
        
        // Case #3: Custom JavaScript object of type Common.type.Time
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.String", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            final String expected = "12:45:59.123";
            context.createInboundVariable(0, "c0-e1", "string", expected);
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Time");
            context.createInboundVariable(0, "c0-e3", "Object_Object",
                "{formatted:reference:c0-e1, %24className:reference:c0-e2}");
            
            final String val = "reference:c0-e3";
            final Property property = null;
            final Class<?> propType = java.lang.Object.class;
            final Object actual = converter.convert(val, propType, context, property);
            
            final SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS");
            
            assertEquals(new java.sql.Date(format.parse(expected).getTime()), actual);
        }
    }
    
    /**
     * Test method for {@link CustomTypeConverter#convertValue(InboundVariable, String)} .
     * 
     * @throws ParseException
     */
    public final void testConvertValue() throws ParseException {
        // Case #1: Custom JavaScript object of type Common.type.Integer
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.Integer", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            context.createInboundVariable(0, "c0-e1", "number", "123");
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Integer");
            
            final InboundVariable javaScriptVariable =
                    new InboundVariable(context, "c0-e12", "Object_Object",
                        "{_value:reference:c0-e1, %24className:reference:c0-e2}");
            
            final String javaScriptClassName = "Common.type.Integer";
            final Object actual = converter.convertValue(javaScriptVariable, javaScriptClassName);
            
            assertEquals(Integer.valueOf(123), actual);
        }
        
        // Case #2: Custom JavaScript object of type Common.type.Date
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.String", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            final String expected = "01-13-1999";
            context.createInboundVariable(0, "c0-e1", "string", expected);
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Date");
            
            final InboundVariable javaScriptVariable =
                    new InboundVariable(context, "c0-e12", "Object_Object",
                        "{formatted:reference:c0-e1, %24className:reference:c0-e2}");
            
            final String javaScriptClassName = "Common.type.Date";
            final Object actual = converter.convertValue(javaScriptVariable, javaScriptClassName);
            
            final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            
            assertEquals(new java.sql.Date(format.parse(expected).getTime()), actual);
        }
        
        // Case #3: Custom JavaScript object of type Common.type.Time
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.String", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            final String expected = "12:45:59.123";
            context.createInboundVariable(0, "c0-e1", "string", expected);
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Time");
            
            final InboundVariable javaScriptVariable =
                    new InboundVariable(context, "c0-e12", "Object_Object",
                        "{formatted:reference:c0-e1, %24className:reference:c0-e2}");
            
            final String javaScriptClassName = "Common.type.Time";
            final Object actual = converter.convertValue(javaScriptVariable, javaScriptClassName);
            
            final SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS");
            
            assertEquals(new java.sql.Date(format.parse(expected).getTime()), actual);
        }
    }
    
    /**
     * Test method for
     * {@link CustomTypeConverter#determineTypeOrValueOfObjectValue(InboundVariable)} .
     */
    public final void testDetermineTypeOrValueOfObjectValue() {
        // Case #1: Custom JavaScript object of type Common.type.Integer
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            final ConverterManager converterManager = new DefaultConverterManager();
            converterManager.addConverter("java.lang.Integer", new PrimitiveConverter());
            converter.setConverterManager(converterManager);
            
            final InboundContext context = new InboundContext();
            context.createInboundVariable(0, "c0-e1", "number", "123");
            context.createInboundVariable(0, "c0-e2", "string", "Common.type.Integer");
            
            final InboundVariable variableOfObjectType =
                    new InboundVariable(context, "c0-e12", "Object_Object",
                        "{_value:reference:c0-e1, %24className:reference:c0-e2}");
            
            final TypeAndValue actual =
                    converter.determineTypeOrValueOfObjectValue(variableOfObjectType);
            
            assertEquals(true, actual.isValueConverted());
            assertEquals(Integer.valueOf("123"), actual.getValue());
        }
        
        // Case #2: null value
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            
            final InboundContext context = new InboundContext();
            
            final InboundVariable variableOfObjectType =
                    new InboundVariable(context, "c0-e12", "null", "null");
            
            final TypeAndValue actual =
                    converter.determineTypeOrValueOfObjectValue(variableOfObjectType);
            
            assertEquals(true, actual.isValueConverted());
            assertEquals(null, actual.getValue());
        }
        
        // Case #3: JavaScript value of type number
        {
            final CustomTypeConverter converter = new CustomTypeConverter();
            
            final InboundContext context = new InboundContext();
            
            final InboundVariable variableOfObjectType =
                    new InboundVariable(context, "c0-e12", "number", "0");
            
            final TypeAndValue actual =
                    converter.determineTypeOrValueOfObjectValue(variableOfObjectType);
            
            assertEquals(false, actual.isValueConverted());
            assertEquals(Double.class, actual.getType());
        }
    }
}
