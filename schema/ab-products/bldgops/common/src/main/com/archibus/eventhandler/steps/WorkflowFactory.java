package com.archibus.eventhandler.steps;

import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Helper functions for steps.
 * 
 * Use a static logger for static method logging.
 * 
 */
public class WorkflowFactory extends HelpdeskEventHandlerBase {

    /**
     * 
     * Get stepmanager instance for given activity_id
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select stepmanager classname from database for given activity</li>
     * <li>Create stepmanager instance from given classname</li>
     * </ol>
     * </p>
     * 
     * 2008-7-23 bv: removed print stack trace in console and add static logger methods.
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @return Instance of stepmanager
     *         </p>
     * 
     */
    public static StepManager getStepManager(EventHandlerContext context, String activity_id, int id) {
        String stepManagerClassName = (String) selectDbValue(
                                                             context,
                                                             "afm_activities",
                                                             "workflow_stepmanager",
                                                             "activity_id = "
                                                                     + literal(context, activity_id));
        stepManagerClassName = stepManagerClassName.trim();

        try {
            // Class clazz = Class.forName(stepManagerClassName);
            // StepManager stepManager = (StepManager) clazz.newInstance();
            // TRIM !!!!!
            Class clazz = Thread.currentThread().getContextClassLoader()
                    .loadClass(stepManagerClassName);
            StepManager stepManager = (StepManager) clazz.newInstance();

            stepManager.init(context, activity_id, id);
            return stepManager;

        } catch (ClassNotFoundException e) {
            // @translatable
            String errorMessage = "ClassNotFoundException, unknown step manager for activity [{0}], [{1}]";
            final Object[] args = { stepManagerClassName, activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        } catch (InstantiationException e) {
            // @translatable
            String errorMessage = "Initiation Error, unknown step manager for activity [{0}], [{1}]";
            final Object[] args = { stepManagerClassName, activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        } catch (IllegalAccessException e) {
            // @translatable
            String errorMessage = "Illegal Access, unknown step manager for activity [{0}], [{1}]";
            final Object[] args = { stepManagerClassName, activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        } catch (Exception e) {
            // @translatable
            String errorMessage = "Step manager '[{0}]' for activity [{1}], [{2}]";
            final Object[] args = { stepManagerClassName, activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        }
    }

    /**
     * 
     * Get status manager instance for given <code>activity_id</code> and primary key value
     * 
     * <p>
     * This is a static method for getting the status manager using configuration parameter in the
     * database
     * 
     * <p>
     * This method uses a factory method and the class loader to create an instance of the status
     * manager. It used the init method to initialize the instance.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select statusmanager classname from database for given activity</li>
     * <li>Create statusmanager instance from given classname</li>
     * </ol>
     * </p>
     * 
     * 2008-7-23 bv: removed print stack trace in console and add static logger methods.
     * 
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param activity_id
     * @return Instance of statusmanager
     *         </p>
     * 
     */
    public static StatusManager getStatusManager(EventHandlerContext context, String activity_id,
            int id) {
        String statusManagerClass = (String) selectDbValue(context, "afm_activities",
                                                           "workflow_statusmanager",
                                                           "activity_id = "
                                                                   + literal(context, activity_id));
        statusManagerClass = statusManagerClass.trim();

        try {
            // Class clazz = Class.forName(statusManagerClass);

            Class clazz = Thread.currentThread().getContextClassLoader()
                    .loadClass(statusManagerClass);
            StatusManager statusManager = (StatusManager) clazz.newInstance();
            statusManager.init(context, activity_id, id);
            return statusManager;
        } catch (ClassNotFoundException e) {
            // @translatable
            String errorMessage = "ClassNotFoundException, unknown status manager for activity [{0}], [{1}]";
            final Object[] args = { activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        } catch (InstantiationException e) {
            // @translatable
            String errorMessage = "Initiation Error, unknown status manager for activity [{0}], [{1}]";
            final Object[] args = { activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        } catch (IllegalAccessException e) {
            // @translatable
            String errorMessage = "Illegal Access, unknown status manager for activity [{0}], [{1}]";
            final Object[] args = { activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        } catch (Exception e) {
            // @translatable
            String errorMessage = "Status manager '[{0}]' for activity [{1}], [{2}]";
            final Object[] args = { statusManagerClass, activity_id, e.getMessage() };
            ExceptionBase exception = new ExceptionBase(errorMessage, args, true);
            exception.setNested(e);
            throw exception;
        }
    }
}
