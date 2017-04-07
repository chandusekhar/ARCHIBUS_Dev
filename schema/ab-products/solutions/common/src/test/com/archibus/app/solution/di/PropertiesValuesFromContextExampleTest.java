package com.archibus.app.solution.di;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.archibus.fixture.IntegrationTestBase;
import com.archibus.model.config.Units;

/**
 * Integration tests for PropertiesValuesFromContextExample.
 * <p>
 *
 * @author Valery Tydykov
 *
 */
public class PropertiesValuesFromContextExampleTest extends IntegrationTestBase {
    private PropertiesValuesFromContextExample propertiesValuesFromContextExample;

    /**
     * Getter for the propertiesValuesFromContextExample property.
     *
     * @see propertiesValuesFromContextExample
     * @return the propertiesValuesFromContextExample property.
     */
    public PropertiesValuesFromContextExample getPropertiesValuesFromContextExample() {
        return this.propertiesValuesFromContextExample;
    }

    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        // IntegrationTestBase has bug - it creates Context in setUp() method, but
        // IntegrationTestBase loads Spring context from XML before that in prepareInstance()
        // method. So we have to load config.xml with SpEL expressions here, when Context already
        // exists, and parent ApplicationContext with core beans already exists.
        final ApplicationContext childApplicationContext = new ClassPathXmlApplicationContext(
            new String[] { "/com/archibus/app/solution/di/di-example-config.xml" },
            this.context.getApplicationContext());

        this.propertiesValuesFromContextExample =
                (PropertiesValuesFromContextExample) childApplicationContext
                    .getBean("propertiesValuesFromContextExample");
    }

    /**
     * Setter for the propertiesValuesFromContextExample property.
     *
     * @see propertiesValuesFromContextExample
     * @param propertiesValuesFromContextExample the propertiesValuesFromContextExample to set.
     */
    public void setPropertiesValuesFromContextExample(
            final PropertiesValuesFromContextExample propertiesValuesFromContextExample) {
        this.propertiesValuesFromContextExample = propertiesValuesFromContextExample;
    }

    public void testGetLocale() {
        assertEquals("en_US", this.propertiesValuesFromContextExample.getLocale().toString());
    }

    public void testGetBaseUnits() {
        assertEquals(Units.Imperial, this.propertiesValuesFromContextExample.getBaseUnits());
    }

    public void testGetCurrency() {
        assertEquals("USD", this.propertiesValuesFromContextExample.getCurrency().getCode());
    }

    public void testGetWebAppPath() {
        assertTrue(this.propertiesValuesFromContextExample.getWebAppPath().contains("WebCentral"));
    }

    public void testProject() {
        assertTrue(this.propertiesValuesFromContextExample.getProject().getName().contains("HQ"));
    }

    public void testStartJob() {
        this.propertiesValuesFromContextExample.startJob();
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml" };
    }
}
