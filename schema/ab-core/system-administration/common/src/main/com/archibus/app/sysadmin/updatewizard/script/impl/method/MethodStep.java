package com.archibus.app.sysadmin.updatewizard.script.impl.method;

import java.lang.reflect.*;

import com.archibus.app.sysadmin.updatewizard.script.AbstractStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.utility.ExceptionBase;

/**
 * A step for executing a static java method.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class MethodStep extends AbstractStep<ResponseMessage> {
    
    /**
     * The method to be invoked.
     */
    private final Method method;
    
    /**
     * The arguments to the method, or null if there are no arguments.
     */
    private Object[] methodArguments;
    
    /**
     * Create a step for executing a static java method that takes no arguments.
     *
     * @param stepName a descriptive name for this step.
     * @param className the fully qualified class name for the class on which the method is defined
     * @param methodName the method name for a method on the class specified by className that is
     *            public, static and takes as it's arguments the same parameters as the execute
     *            method on this class.
     * @param parameterTypes an array of classes that the method takes as parameters.
     * @param methodArguments method arguments that will contain the arguments to the method, or
     *            null if there are no arguments.
     * @throws ExceptionBase if for some reason the method cannot be found or accessed.
     */
    public MethodStep(final String stepName, final String className, final String methodName,
            final Class<?>[] parameterTypes, final Object[] methodArguments) throws ExceptionBase {
        super(stepName);
        try {
            final Class<?> clazz = Class.forName(className);
            this.method = clazz.getMethod(methodName, parameterTypes);
            this.methodArguments = methodArguments.clone();
        } catch (final ClassNotFoundException e) {
            final String message = "Class for java method not found : " + className;
            throw new ExceptionBase(message, e);
        } catch (final NoSuchMethodException e) {
            final String message = "Method for java not found : " + className + '#' + methodName;
            throw new ExceptionBase(message, e);
        } catch (final SecurityException e) {
            final String message = "Method for java inaccessible : " + className + '#' + methodName;
            throw new ExceptionBase(message, e);
        }
    }
    
    /**
     * Execute the method specified to the constructor.
     *
     * @return the result of the method, what it returns.
     */
    @Override
    public ResponseMessage execute() {
        String message = "";
        ResponseMessage.Level type = ResponseMessage.Level.INFO;

        try {
            message = this.method.invoke(null, this.methodArguments).toString();
        } catch (final IllegalAccessException e) {
            message =
                    "Unable to execute method: " + this.method.getDeclaringClass().getName() + '#'
                            + this.method.getName();
            type = ResponseMessage.Level.ERROR;
        } catch (final IllegalArgumentException e) {
            message =
                    "Method should not require parameters, but does: "
                            + this.method.getDeclaringClass().getName() + '#'
                            + this.method.getName();
            type = ResponseMessage.Level.ERROR;
        } catch (final InvocationTargetException e) {
            message =
                    "Error executing method: " + this.method.getDeclaringClass().getName() + '#'
                            + this.method.getName();
            type = ResponseMessage.Level.ERROR;
        }
        return new ResponseMessage(message, type);
    }
}