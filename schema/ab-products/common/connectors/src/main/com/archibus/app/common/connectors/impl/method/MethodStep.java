package com.archibus.app.common.connectors.impl.method;

import java.lang.reflect.*;
import java.util.Map;

import com.archibus.app.common.connectors.AbstractStep;
import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.impl.method.exception.MethodExecutionException;

/**
 * A connector step for executing a static java method that takes no arguments.
 *
 * @author cole
 *
 */
public class MethodStep extends AbstractStep<Object> {

    /**
     * The method to be invoked.
     */
    private final Method method;

    /**
     * The name of the entry in the previousResults passed to the execute method that will contain
     * the arguments to the method, or null if there are no arguments.
     */
    private String methodArgumentsName;

    /**
     * Create a connector step for executing a static java method that takes no arguments.
     *
     * @param stepName a descriptive name for this step.
     * @param className the fully qualified class name for the class on which the method is defined
     * @param methodName the method name for a method on the class specified by className that is
     *            public, static and takes as it's arguments the same parameters as the execute
     *            method on this class.
     * @param parameterTypes an array of classes that the method takes as parameters.
     * @param methodArgumentsName the name of the entry in the previousResults passed to the execute
     *            method that will contain the arguments to the method, or null if there are no
     *            arguments.
     * @throws ConfigurationException if for some reason the method cannot be found or accessed.
     */
    public MethodStep(final String stepName, final String className, final String methodName,
            final Class<?>[] parameterTypes, final String methodArgumentsName)
            throws ConfigurationException {
        super(stepName);
        try {
            final Class<?> clazz = Class.forName(className);
            this.method = clazz.getMethod(methodName, parameterTypes);
            this.methodArgumentsName = methodArgumentsName;
        } catch (final ClassNotFoundException e) {
            final String message =
                    "Class for java method step in connector not found : " + className;
            throw new ConfigurationException(message, e);
        } catch (final NoSuchMethodException e) {
            final String message =
                    "Method for java method step in connector not found : " + className + '#'
                            + methodName;
            throw new ConfigurationException(message, e);
        } catch (final SecurityException e) {
            final String message =
                    "Method for java method step in connector inaccessible : " + className + '#'
                            + methodName;
            throw new ConfigurationException(message, e);
        }
    }

    /**
     * Execute the method specified to the constructor.
     *
     * @param previousResults results of previous steps by step name.
     * @return the result of the method, what it returns.
     * @throws StepException of the following types: ConfigurationException if the method cannot be
     *             called. MethodExecutionException wraps an InvocationTargetException if an
     *             exception is thrown from the method.
     */
    @Override
    public Object execute(final Map<String, Object> previousResults) throws StepException {
        try {
            return this.method.invoke(null,
                (Object[]) previousResults.get(this.methodArgumentsName));
        } catch (final IllegalAccessException e) {
            final String message =
                    "Unable to execute method: " + this.method.getDeclaringClass().getName() + '#'
                            + this.method.getName();
            throw new ConfigurationException(message, e);
        } catch (final IllegalArgumentException e) {
            final String message =
                    "Method should not require parameters, but does: "
                            + this.method.getDeclaringClass().getName() + '#'
                            + this.method.getName();
            throw new ConfigurationException(message, e);
        } catch (final InvocationTargetException e) {
            final String message =
                    "Error executing method: " + this.method.getDeclaringClass().getName() + '#'
                            + this.method.getName();
            throw new MethodExecutionException(message, e.getCause());
        }
    }

}
