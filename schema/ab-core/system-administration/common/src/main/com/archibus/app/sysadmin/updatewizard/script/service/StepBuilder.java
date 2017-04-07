package com.archibus.app.sysadmin.updatewizard.script.service;

import com.archibus.app.sysadmin.updatewizard.script.IStep;
import com.archibus.app.sysadmin.updatewizard.script.exception.StepException;
import com.archibus.app.sysadmin.updatewizard.script.impl.*;
import com.archibus.app.sysadmin.updatewizard.script.impl.comment.CommentStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.dt.*;
import com.archibus.app.sysadmin.updatewizard.script.impl.method.MethodStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.nested.NestedFileStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.sql.SqlCommandStep;
import com.archibus.jobmanager.JobStatus;

/**
 *
 * Builds the steps to be executed.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 *        CHECKSTYLE:OFF Max class number coupling.
 *
 *        Justification: This class builds the command steps for execution and it suppose to get
 *        together many classes.
 */
public final class StepBuilder {
    /**
     * CHECKSTYLE:ON JAVA_PACKAGE_METHOD_CALL.
     */
    public static final String JAVA_PACKAGE_METHOD_CALL =
            "com.archibus.app.sysadmin.updatewizard.script.impl.method.MethodCall";
    
    /**
     * Apostrophe.
     */
    public static final String APOS = "'";

    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private StepBuilder() {
    }

    /**
     *
     * Builds the step to execute.
     *
     * @param requestType request type.
     * @param parameters parameters if any
     * @return IStep
     * @throws StepException if there is a configuration issue preventing instantiation of a step.
     */
    public static IStep<ResponseMessage> buildStep(final CommandRequestsType requestType,
        final Object[] parameters) throws StepException {

        IStep<ResponseMessage> step;

        if (requestType == CommandRequestsType.UNSUPPORTED) {
            step = new Unsupported(requestType.getCommandType().getName());
        } else {
            
            switch (requestType) {
                case COMMENT:
                    step =
                    new CommentStep(requestType.getCommandType().getName(),
                        parameters[0].toString());
                    break;
                case DATA_TRANSFER_IMPORT:
                    step =
                    new TransferStep(requestType.getCommandType().getName(),
                        new TransferIn(parameters[0].toString().replace(APOS, "")));
                    break;
                case DATA_TRANSFER_EXPORT:
                    step =
                    new TransferStep(requestType.getCommandType().getName(),
                        new TransferOut());
                    break;
                case UPDATE_SCHEMA_ALTER:
                    step =
                            createMethodStep(requestType.getCommandType().getName(),
                                JAVA_PACKAGE_METHOD_CALL, "alterTable", new Class[] { String.class,
                        Boolean.class }, parameters);
                    break;
                case UPDATE_SCHEMA_RE_CREATE:
                    step =
                    createMethodStep(requestType.getCommandType().getName(),
                                JAVA_PACKAGE_METHOD_CALL, "recreateTable", new Class[] {
                                        String.class, Boolean.class }, parameters);
                    break;
                case REFRESH_DATA_DICTIONARY:
                    step =
                    createMethodStep(requestType.getCommandType().getName(),
                                JAVA_PACKAGE_METHOD_CALL, "refreshDataDictionary", new Class[] {},
                                new Object[] {});
                    break;
                case RELOAD_WORKFLOW_RULES:
                    step =
                            createMethodStep(requestType.getCommandType().getName(),
                                JAVA_PACKAGE_METHOD_CALL, "refreshWorflowRules", new Class[] {},
                                new Object[] {});
                    break;
                default:
                    step =
                    new SqlCommandStep(requestType.getCommandType().getName(),
                        parameters[0].toString());
            }
        }
        
        return step;
    }

    /**
     *
     * Converts parameter objects to concrete objects.
     *
     * @param parameters parameter objects
     * @return array of concrete objects
     */
    private static Object[] genericToConcretObject(final Object[] parameters) {
        final Object[] parametersObjects = new Object[parameters.length];

        for (int i = 0; i < parameters.length; i++) {
            final String parameter = parameters[i].toString().trim();
            if (Boolean.TRUE.toString().equalsIgnoreCase(parameter)) {
                parametersObjects[i] = Boolean.TRUE;
            } else if (Boolean.FALSE.toString().equalsIgnoreCase(parameter)) {
                parametersObjects[i] = Boolean.FALSE;
            } else if (parameter.startsWith(APOS) && parameter.endsWith(APOS)) {
                parametersObjects[i] = parameter.replace(APOS, "");
            }
        }
        return parametersObjects;
    }
    
    /**
     * Creates step java method.
     *
     * @param name Name of the step.
     * @param className class name
     * @param parameterTypes parameters types
     * @param arguments arguments.
     * @param methodName specified method.
     * @return MethodStep
     *
     * @throws StepException if for some reason the method cannot be found or accessed.
     */
    private static MethodStep createMethodStep(final String name, final String className,
            final String methodName, final Class<?>[] parameterTypes, final Object[] arguments)
                    throws StepException {
        return new MethodStep(name, className, methodName, parameterTypes,
            genericToConcretObject(arguments));
    }
    
    /**
     *
     * Build Nested File Step.
     *
     * @param requestType request type
     * @param parameters file name
     * @param status job status
     * @return IStep
     */
    public static IStep<ResponseMessage> buildNestedFileStep(final CommandRequestsType requestType,
            final Object[] parameters, final JobStatus status) {
        return new NestedFileStep(requestType.getCommandType().getName(), parameters[0].toString()
            .replace(APOS, ""), status);
    }
}
