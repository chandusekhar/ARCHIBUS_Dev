package com.archibus.app.sysadmin.event.data;

import java.util.*;

import org.springframework.beans.BeansException;
import org.springframework.context.*;

import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe;

/**
 * Listener which is configured to be called by the core when there is a DataEvent. Invokes all
 * active workflow rules of DataEvent type. The security group of the WFRs is ignored.
 * <p>
 * This is a singleton bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * This bean is shared across multiple threads, so it must be thread-safe.
 * 
 * @author Valery Tydykov
 */
// TODO: make WorkflowRuleInvokerDataEventListener thread-safe
// TODO: make Project.getWorkflowRulesOfType thread-safe
public class WorkflowRuleInvokerDataEventListener implements IDataEventListener,
        ApplicationContextAware {
    /**
     * Spring context.
     */
    private ApplicationContext applicationContext;
    
    /**
     * Project, required to access WFRs container.
     */
    private Project.Immutable project;
    
    /**
     * @return the project.
     */
    public Project.Immutable getProject() {
        return this.project;
    }
    
    /** {@inheritDoc} */
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof DataEvent) {
            // get all active WFRs of DataEvent type
            final List<WorkflowRule.Immutable> workflowRules = getDataEventWorkflowRules();
            
            // TODO move this code to WFR container?
            // for each rule:
            for (final WorkflowRule.Immutable workflowRule : workflowRules) {
                // get bean name from the WFR
                final String beanName = workflowRule.getKey();
                // get bean from the Spring context, bean must be of IDataEventListener type
                // TODO move this code to WFR container, cache bean in WFR
                // TODO is applicationContext thread-safe?
                final IDataEventListener dataEventListener =
                        (IDataEventListener) this.applicationContext.getBean(beanName,
                            IDataEventListener.class);
                
                if (dataEventListener != null) {
                    // delegate event to the rule
                    dataEventListener.onApplicationEvent(event);
                }
            }
        }
    }
    
    /** {@inheritDoc} */
    public void setApplicationContext(final ApplicationContext applicationContext)
            throws BeansException {
        this.applicationContext = applicationContext;
    }
    
    /**
     * @param project the project to set.
     */
    public void setProject(final Project.Immutable project) {
        this.project = project;
    }
    
    /**
     * Gets list of active WFRs of DataEvent type from the WFR container.
     * 
     * @return List of WFRs of DataEvent type.
     */
    private List<WorkflowRule.Immutable> getDataEventWorkflowRules() {
        List<WorkflowRule.Immutable> workflowRules = new ArrayList<WorkflowRule.Immutable>();
        
        final ThreadSafe workflowRulesContainer = this.project.getWorkflowRules();
        if (workflowRulesContainer != null) {
            workflowRules =
                    workflowRulesContainer
                        .getWorkflowRulesOfType(WorkflowRuleType.DATA_EVENT, true);
        }
        
        return workflowRules;
    }
}
