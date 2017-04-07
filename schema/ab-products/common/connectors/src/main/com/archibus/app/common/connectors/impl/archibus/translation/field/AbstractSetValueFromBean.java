package com.archibus.app.common.connectors.impl.archibus.translation.field;

import java.lang.reflect.InvocationTargetException;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.utility.StringUtil;

/**
 * Uses the parameter as a series of attributes for an bean.
 *
 * @author cole
 *
 */
public abstract class AbstractSetValueFromBean extends SetValue {
    /**
     * @param parameter a . separated path of attributes.
     * @param object the object on which the attributes are set.
     * @throws ConfigurationException if the attributes are invalid.
     */
    public void init(final String parameter, final Object object) throws ConfigurationException {
        if (StringUtil.isNullOrEmpty(parameter)) {
            throw new ConfigurationException("Set Value From User requires a parameter", null);
        } else {
            final String[] attributes = parameter.split("\\.");
            Object currentEntity = object;
            for (final String attribute : attributes) {
                String attributeName;
                if (attribute.length() > 1) {
                    attributeName =
                            Character.toUpperCase(attribute.charAt(0)) + attribute.substring(1);
                } else {
                    attributeName = attribute.toUpperCase();
                }
                currentEntity = getAttribute(currentEntity, "get" + attributeName);
            }
            super.init(currentEntity);
        }
    }

    /**
     * @param currentEntity the entity from which to extract the attribute's value.
     * @param methodName the method for extracting the attribute's value.
     * @return the attribute's value.
     */
    private Object getAttribute(final Object currentEntity, final String methodName) {
        try {
            return currentEntity.getClass().getMethod(methodName, new Class<?>[0])
                    .invoke(currentEntity, new Object[0]);
        } catch (final IllegalArgumentException e) {
            throw new ConfigurationException("Set Value From Bean: invalid method signature for: "
                    + methodName, e);
        } catch (final SecurityException e) {
            throw new ConfigurationException("Set Value From Bean: security violation for: "
                    + methodName, e);
        } catch (final IllegalAccessException e) {
            throw new ConfigurationException("Set Value From Bean: inaccessible method: "
                    + methodName, e);
        } catch (final InvocationTargetException e) {
            throw new ConfigurationException(e.getCause().getLocalizedMessage(), e);
        } catch (final NoSuchMethodException e) {
            throw new ConfigurationException("Set Value From Bean: invalid method: " + methodName,
                e);
        }
    }
}
