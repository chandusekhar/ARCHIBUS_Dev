package com.archibus.eventhandler.steps;

import java.lang.reflect.*;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Class for SLA automation workflow rules
 */
public class AutoRule extends EventHandlerBase {
    
    /**
     * Activity id
     */
    private final String activity_id;
    
    /**
     * Request status
     */
    private final String status;
    
    /**
     * Workflow rule execution context
     */
    private final EventHandlerContext context;
    
    /**
     * Service Level Agreement
     */
    private final ServiceLevelAgreement sla;
    
    private final String table;
    
    private final String field;
    
    /**
     * Auto rule eventhandler per request status
     */
    
    private static Map eventHandlerClasses = new HashMap();
    
    private static Map autoRules = new HashMap();
    
    // private static Map autoRulesForState = new HashMap();
    
    static {
        
        eventHandlerClasses.put(Constants.ONDEMAND_ACTIVITY_ID,
            "com.archibus.eventhandler.ondemandwork.WorkRequestHandler");
        eventHandlerClasses.put(Constants.HELPDESK_ACTIVITY_ID,
            "com.archibus.eventhandler.helpdesk.RequestHandler");
        
        Map autoRulesForState = new HashMap();
        
        // for activity_log
        autoRulesForState.put("REQUESTED", "checkAutoApprove");
        autoRulesForState.put("APPROVED", "checkAutoRulesStatusApproved");
        autoRulesForState.put("CLOSED", "checkAutoArchive");
        
        // when Service Request is COMPLETED, the assmentId should be completed.
        autoRulesForState.put("COMPLETED", "checkConditionAssessmentStatus");
        // when Service Request is COMPLETED-V, the assmentId should be completed.
        autoRulesForState.put("COMPLETED-V", "checkConditionAssessmentStatus");
        
        autoRules.put(Constants.HELPDESK_ACTIVITY_ID, autoRulesForState);
        
        autoRulesForState = new HashMap();
        // for wr
        autoRulesForState.put("AA", "checkAutoSchedule");
        
        autoRules.put(Constants.ONDEMAND_ACTIVITY_ID, autoRulesForState);
        
    }
    
    /**
     * Constructor.
     * <p>
     * Pass the SLA to be applied
     * 
     * @param context Workflow rule execution context
     * @param newStatus new status
     * @param sla Service Level Agreement
     */
    public AutoRule(EventHandlerContext context, String activity_id, String newStatus,
            ServiceLevelAgreement sla) {
        this.activity_id = activity_id;
        this.status = newStatus;
        this.context = context;
        this.sla = sla;
        
        this.table =
                ((String) selectDbValue(context, "afm_activities", "workflow_table",
                    "activity_id = " + literal(context, activity_id))).trim();
        this.field =
                notNull(com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(context,
                    this.table)[0]);
        
    }
    
    /**
     * Invoke the Auto-Rule for this status.
     * <p>
     * Pseudo-code:
     * <ol>
     * <li>Check auto-rule for this status</li>
     * <li>Copy SLA to context</li>
     * <li>Run Auto-Rule</li>
     * </ol>
     * </p>
     * 
     * @throws IllegalAccessException
     * @throws InvocationTargetException
     * @throws IllegalArgumentException
     */
    public void invoke() {
        
        if (this.activity_id == null) {
            // @translatable
            String errorMessage =
                    localizeString(this.context, "No activity defined when running auto rules !");
            throw new ExceptionBase(errorMessage, true);
        }
        
        Map autoRulesForState = (Map) autoRules.get(this.activity_id);
        String eventHandlerClassName = (String) eventHandlerClasses.get(this.activity_id);
        String methodName = null;
        
        try {
            
            Class eventHandlerClass =
                    Thread.currentThread().getContextClassLoader().loadClass(eventHandlerClassName);
            Class contextClass =
                    Thread.currentThread().getContextClassLoader().loadClass(
                        "com.archibus.jobmanager.EventHandlerContext");
            
            if (autoRulesForState.containsKey(this.status)) {
                this.context.addResponseParameter("sla", this.sla);
                this.context.addResponseParameter("tableName", this.table);
                this.context.addResponseParameter("fieldName", this.field);
                //KB3044816 - Response By fields are not filled in helpdesk_step_log for basic status changes
                this.context.addResponseParameter("response_user", ContextStore.get().getConfigManager().getAttribute("descendant::preferences/core/@userId"));
                
                methodName = (String) autoRulesForState.get(this.status);
                
                if (methodName == null) {
                    // @translatable
                    String errorMessage = "No method found for status [{0}]";
                    final Object[] args = { this.status };
                    throw new ExceptionBase(errorMessage, args, true);
                }
                
                Method workflowRuleMethod =
                        eventHandlerClass.getDeclaredMethod(methodName,
                            new Class[] { contextClass });
                
                Object object = eventHandlerClass.newInstance();
                
                workflowRuleMethod.invoke(object, new Object[] { this.context });
            }
            
        } catch (ClassNotFoundException e) {
            this.log.error("Class '" + eventHandlerClassName + "' or method '" + methodName
                    + "' not found");
        } catch (NoSuchMethodException e) {
            this.log.error("Class '" + eventHandlerClassName + "' or method '" + methodName
                    + "' not found");
        } catch (InstantiationException e) {
            this.log.error("Class '" + eventHandlerClassName + "' or method '" + methodName
                    + "' not found");
            
            // log exception
            ExceptionHandlerBase exceptionHandler = new ExceptionHandlerBase();
            exceptionHandler.setLogger(this.log);
            
            exceptionHandler.logExceptionIfNot(e);
        } catch (InvocationTargetException e) {
            // log exception
            ExceptionHandlerBase exceptionHandler = new ExceptionHandlerBase();
            exceptionHandler.setLogger(this.log);
            
            exceptionHandler.logExceptionIfNot(e.getTargetException());
        } catch (Exception e) {
            this.log.error("Class '" + eventHandlerClassName + "' or method '" + methodName
                    + "' threw exception ");
            
            // log exception
            ExceptionHandlerBase exceptionHandler = new ExceptionHandlerBase();
            exceptionHandler.setLogger(this.log);
            
            exceptionHandler.logExceptionIfNot(e);
        }
    }
    
}
