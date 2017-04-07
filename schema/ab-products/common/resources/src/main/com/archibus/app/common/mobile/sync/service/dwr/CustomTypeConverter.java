package com.archibus.app.common.mobile.sync.service.dwr;

import java.util.Map;

import junit.framework.Assert;

import org.directwebremoting.ConversionException;
import org.directwebremoting.convert.BeanConverter;
import org.directwebremoting.extend.*;

/**
 * Converts values of custom JavaScript objects.
 * <p>
 * 
 * Used by DWR to convert DTOs for mobile services. Configured in dwr.xml file.
 * <p>
 * For custom JavaScript classes DWR provides className=<ClassName> attribute. Uses this attribute
 * to determine Java object of which type to create. Does custom conversion for Date, Time, Integer
 * JavaScript custom classes.
 * <p>
 * Custom JavaScript class Integer must have property "value" which is a Number object, that
 * represents the value of the custom type. Custom JavaScript classes Date and Time must have
 * property "formatted" which is a String object, that represents the value of the custom type. Date
 * is expected to be a string in ISO format yyyy-mm-dd. Time is expected to be a string in format
 * HH:mm.ss.SSS.
 * 
 * 
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
public class CustomTypeConverter extends BeanConverter {
    
    /**
     * Represents server-side Java type or [converted] value. The value can be null. If value was
     * converted, then valueConverted is true.
     * 
     * @author Valery Tydykov
     * @since 21.1
     * 
     */
    static class TypeAndValue {
        /**
         * Property: Java type of value.
         */
        private Class<?> type;
        
        /**
         * Property: converted [from JavaScript value] value. Can be null.
         */
        private Object value;
        
        /**
         * Property: valueConverted. True if value was converted from JavaScript.
         */
        private boolean valueConverted;
        
        /**
         * Getter for the type property.
         * 
         * @see type
         * @return the type property.
         */
        public Class<?> getType() {
            return this.type;
        }
        
        /**
         * Getter for the value property.
         * 
         * @see value
         * @return the value property.
         */
        public Object getValue() {
            return this.value;
        }
        
        /**
         * Getter for the valueConverted property.
         * 
         * @see valueConverted
         * @return the valueConverted property.
         */
        public boolean isValueConverted() {
            return this.valueConverted;
        }
        
        /**
         * Setter for the type property.
         * 
         * @see type
         * @param type the type to set
         */
        
        public void setType(final Class<?> type) {
            this.type = type;
        }
        
        /**
         * Setter for the value property.
         * 
         * @see value
         * @param value the value to set
         */
        
        public void setValue(final Object value) {
            this.value = value;
        }
        
        /**
         * Setter for the valueConverted property.
         * 
         * @see valueConverted
         * @param valueConverted the valueConverted to set
         */
        
        public void setValueConverted(final boolean valueConverted) {
            this.valueConverted = valueConverted;
        }
    }
    
    /**
     * Extracts JavaScript custom class name from the inboundVariable. Expects
     * "className=<ClassName>" token.
     * <p>
     * The custom JavaScript class name is provided by the DWR.
     * 
     * @param inboundVariable variable to be processed.
     * @return class name, or null if "className" token was not found.
     */
    static String extractJavaScriptClassName(final InboundVariable inboundVariable) {
        String javaScriptClassName = null;
        
        final String value = CustomTypeConverterUtilities.stripBraces(inboundVariable.getValue());
        final Map<String, String> tokens = extractInboundTokens(null, value);
        
        final String classNameValue = tokens.get("%24className");
        if (classNameValue != null) {
            final String[] split = ConvertUtil.splitInbound(classNameValue);
            final String splitValue = split[ConvertUtil.INBOUND_INDEX_VALUE];
            final String splitType = split[ConvertUtil.INBOUND_INDEX_TYPE];
            
            final InboundVariable classNameVariable =
                    new InboundVariable(inboundVariable.getContext(), null, splitType, splitValue);
            classNameVariable.dereference();
            javaScriptClassName = classNameVariable.getValue();
        }
        
        return javaScriptClassName;
    }
    
    /**
     * Overrides method to add special case when bean propertyType is Object, which means DWR does
     * not know Java object of which type to create.
     * <p>
     * {@inheritDoc}
     */
    @Override
    protected Object convert(final String val, final Class<?> propType,
            final InboundContext inboundContext, final Property property) {
        final String[] split = ConvertUtil.splitInbound(val);
        final String splitValue = split[ConvertUtil.INBOUND_INDEX_VALUE];
        final String splitType = split[ConvertUtil.INBOUND_INDEX_TYPE];
        
        final InboundVariable nested =
                new InboundVariable(inboundContext, null, splitType, splitValue);
        nested.dereference();
        
        // try to determine type of the value from the propType; if not supplied, then from the
        // property
        Class<?> propertyType = propType;
        if (propertyType == null) {
            propertyType = property.getPropertyType();
        }
        
        Object returnValue = null;
        boolean valueConverted = false;
        // special case when bean propertyType is Object
        if (propertyType.equals(java.lang.Object.class)) {
            // bean propertyType is Object, which means DWR does not know Java object of which type
            // to create
            final TypeAndValue typeAndValue = determineTypeOrValueOfObjectValue(nested);
            if (typeAndValue.isValueConverted()) {
                // value converted
                valueConverted = true;
                returnValue = typeAndValue.getValue();
            } else {
                // type determined
                propertyType = typeAndValue.getType();
            }
        }
        
        if (!valueConverted) {
            // value was not converted yet, ask converterManager to convert the value using the
            // propertyType
            final Property incc = createTypeHintContext(inboundContext, property);
            
            returnValue = this.converterManager.convertInbound(propertyType, nested, incc);
        }
        
        return returnValue;
    }
    
    /**
     * Converts value of JavaScript variable to Java server-side value. The JavaScript variable can
     * have type Date, Time, Integer.
     * 
     * @param javaScriptVariable to be converted.
     * @param javaScriptClassName class name of the variable to be converted.
     * @return converted value.
     */
    Object convertValue(final InboundVariable javaScriptVariable, final String javaScriptClassName) {
        Assert.assertTrue("javaScriptVariable must be not null", javaScriptVariable != null);
        Assert.assertTrue("javaScriptClassName must be not null", javaScriptClassName != null);
        
        String value = javaScriptVariable.getValue();
        Assert.assertTrue("value of javaScriptVariable must be not null", value != null);
        
        value = CustomTypeConverterUtilities.stripBraces(value);
        
        final Map<String, String> tokens = extractInboundTokens(null, value);
        
        Class<?> objectType =
                CustomTypeConverterUtilities.mapJavaScriptClassNameToJavaType(javaScriptClassName);
        
        String valueTokenName = "_value";
        if (objectType.equals(java.util.Date.class)) {
            // Date and Time values are marshaled from JavaScript as "formatted" property of the
            // Common.type.Date or Common.type.Time object.
            valueTokenName = "formatted";
            objectType = String.class;
        }
        
        final String valueToken = tokens.get(valueTokenName);
        
        // use standard DWR converters for Date, Time, Integer
        final Object convertedValue =
                convert(valueToken, objectType, javaScriptVariable.getContext(),
                    preparePropertyWithObjectType());
        
        final Object returnValue =
                CustomTypeConverterUtilities.mapConvertedValueToArchibusValue(javaScriptClassName,
                    convertedValue);
        
        return returnValue;
    }
    
    /**
     * Prepares Property with Object Java type. The only method used in the created object is
     * getPropertyType().
     * 
     * @return prepared Property.
     */
    private Property preparePropertyWithObjectType() {
        final Property property = new Property() {
            
            public Property createChild(final int index) {
                return null;
            }
            
            public String getName() {
                return null;
            }
            
            public Class<?> getPropertyType() {
                // Object type
                return java.lang.Object.class;
            }
            
            public Object getValue(final Object bean) throws ConversionException {
                return null;
            }
            
            public void setValue(final Object bean, final Object value) throws ConversionException {
                // not implemented - should never be used
            }
        };
        
        return property;
    }
    
    /**
     * Determines Java type or converts value of JavaScript variable of DWR Java type Object.
     * 
     * @param variableOfObjectType JavaScript variable of DWR Java type Object.
     * @return typeAndValue of the variable.
     */
    TypeAndValue determineTypeOrValueOfObjectValue(final InboundVariable variableOfObjectType) {
        final TypeAndValue typeAndValue = new TypeAndValue();
        
        // get DWR javaScriptType
        final String javaScriptType = variableOfObjectType.getType();
        if (javaScriptType.equals(CustomTypeConverterUtilities.OBJECT_OBJECT)) {
            // DWR says variable is a custom JavaScript object
            final String javaScriptClassName = extractJavaScriptClassName(variableOfObjectType);
            
            // convert Date, Time, Integer types here
            if (javaScriptClassName.contains(CustomTypeConverterUtilities.DATE)
                    || javaScriptClassName.contains(CustomTypeConverterUtilities.TIME)
                    || javaScriptClassName.contains(CustomTypeConverterUtilities.INTEGER)) {
                typeAndValue.setValue(convertValue(variableOfObjectType, javaScriptClassName));
                
                typeAndValue.setValueConverted(true);
            }
        }
        
        // if value is not converted yet, try to determine type
        if (!typeAndValue.isValueConverted()) {
            final Class<?> propertyType =
                    CustomTypeConverterUtilities.determineObjectType(javaScriptType);
            if (propertyType == null) {
                // the value is null
                typeAndValue.setValueConverted(true);
            } else {
                // type determined
                typeAndValue.setType(propertyType);
            }
        }
        
        Assert.assertTrue(
            "Failed to map JavaScript Object type to Java type or to convert the object value",
            typeAndValue.isValueConverted() || typeAndValue.getType() != null);
        
        return typeAndValue;
    }
}
