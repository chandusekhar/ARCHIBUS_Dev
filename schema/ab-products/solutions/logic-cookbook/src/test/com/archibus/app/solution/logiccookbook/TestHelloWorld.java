package com.archibus.app.solution.logiccookbook;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests HelloWorld example event handler.
 */
public class TestHelloWorld extends DataSourceTestBase {
    
    @Override
    protected String[] getConfigLocations() {
        // TODO: avoid copy-and-paste for this code in other test classes - add base class support
        // for adding per-test XML configuration files
        final String[] defaultConfigLocations = super.getConfigLocations();
        final int defaultLocationsCount = defaultConfigLocations.length;
        final String[] configLocations = new String[defaultLocationsCount + 1];
        System.arraycopy(defaultConfigLocations, 0, configLocations, 0, defaultLocationsCount);
        configLocations[defaultLocationsCount] = "helloWorld.xml";
        return configLocations;
    }
    
    /**
     * Test for HelloWorld method on a new instance.
     * 
     * @throws ExceptionBase
     */
    public void testHelloWorld() {
        final HelloWorld handler = new HelloWorld();
        final String message = handler.sayHello();
        assertTrue(message.startsWith("Hello World"));
    }
    
    /**
     * Test for HelloWorld method on a Spring bean.
     * 
     * @throws ExceptionBase
     */
    public void testHelloWorldBean() {
        final HelloWorld bean = (HelloWorld) this.context.getBean("HelloWorld");
        final String message = bean.sayHello();
        assertTrue(message.startsWith("Ciao Mondo"));
    }
    
    /**
     * Test for HelloWorld method on a workflow rule.
     * 
     * @throws ExceptionBase
     */
    public void testHelloWorldRule() {
        final WorkflowRulesContainer.ThreadSafe container =
                this.context.getConfigManager().findFirstActiveProject().loadWorkflowRules();
        final WorkflowRule.Immutable rule =
                container.getWorkflowRule("AbSolutionsLogicAddIns-HelloWorld");
        container.runRule(rule, "sayHello", this.c);
        final String message = this.c.getString("message");
        assertTrue(message.startsWith("Ciao Mondo"));
    }
}
