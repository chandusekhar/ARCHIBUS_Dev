package com.archibus.app.solution.di;

import java.util.Locale;

import com.archibus.config.*;
import com.archibus.jobmanager.*;
import com.archibus.model.config.*;
import com.archibus.security.UserAccount;
import com.aspose.slides.p883e881b.job;

/**
 * Example demonstrates Dependency Injection with WebCentral core beans. The WebCentral core beans
 * are defined in core-infrastruture.xml.
 *
 * To test this example in WebCentral:
 * <p>
 * - copy bean configurations from config.xml to
 * WEB-INF/config/context/applications/applications-child-context.xml,
 * <p>
 * - enable EmployeesJob WFR, modify EmployeesJob.java: add propertiesValuesFromContextExample
 * property/getter/setter, in importAllEmployees() method invoke
 * propertiesValuesFromContextExample.printProperties();
 * <p>
 * - run ab-ex-webservice.axvw.
 * <p>
 * SpEL expressions that use project and userAccount beans in XML files will break integration tests
 * that use IntegrationTestBase. Reason: IntegrationTestBase has bug - it creates Context in setUp()
 * method, but IntegrationTestBase loads Spring context from XML before that in prepareInstance()
 * method.
 *
 * Managed by Spring, has prototype scope. Configured in config.xml file.
 *
 * @author Valery Tydykov
 * @since 23.1
 *
 */
public class PropertiesValuesFromContextExample {
    /**
     * Constant: string with closing bracket.
     */
    private static final String CLOSING_BRACKET = "]";

    /**
     * Property: current units (from current project).
     */
    private Units baseUnits;

    /**
     * Property: configManager.
     */
    private ConfigManager.Immutable configManager;

    /**
     * Property: current currency (from current project).
     */
    private Currency currency;

    /**
     * Property: current currencyConversions (from current project).
     */
    private CurrencyConversions currencyConversions;

    /**
     * Property: jobManager.
     */
    private JobManager.ThreadSafe jobManager;

    /**
     * Property: current locale (from current userAccount).
     */
    private Locale locale;

    /**
     * Property: current project.
     */
    private Project.Immutable project;

    /**
     * Property: current userAccount.
     */
    private UserAccount.Immutable userAccount;

    /**
     * Property: webAppPath (from configManager).
     */
    private String webAppPath;

    /**
     * Property: Job to be started.
     */
    private Job job;

    /**
     * Getter for the baseUnits property.
     *
     * @see baseUnits
     * @return the baseUnits property.
     */
    public Units getBaseUnits() {
        return this.baseUnits;
    }

    /**
     * Getter for the configManager property.
     *
     * @see configManager
     * @return the configManager property.
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }

    /**
     * Getter for the currency property.
     *
     * @see currency
     * @return the currency property.
     */
    public Currency getCurrency() {
        return this.currency;
    }

    /**
     * Getter for the currencyConversions property.
     *
     * @see currencyConversions
     * @return the currencyConversions property.
     */
    public CurrencyConversions getCurrencyConversions() {
        return this.currencyConversions;
    }

    /**
     * Getter for the jobManager property.
     *
     * @see jobManager
     * @return the jobManager property.
     */
    public JobManager.ThreadSafe getJobManager() {
        return this.jobManager;
    }

    /**
     * Setter for the jobManager property.
     *
     * @see jobManager
     * @param jobManager the jobManager to set
     */

    public void setJobManager(final JobManager.ThreadSafe jobManager) {
        this.jobManager = jobManager;
    }

    /**
     * Getter for the job property.
     *
     * @see job
     * @return the job property.
     */
    public Job getJob() {
        return this.job;
    }

    /**
     * Setter for the job property.
     *
     * @see job
     * @param job the job to set
     */

    public void setJob(final Job job) {
        this.job = job;
    }

    /**
     * Getter for the locale property.
     *
     * @see locale
     * @return the locale property.
     */
    public Locale getLocale() {
        return this.locale;
    }

    /**
     * Getter for the project property.
     *
     * @see project
     * @return the project property.
     */
    public Project.Immutable getProject() {
        return this.project;
    }

    /**
     * Getter for the userAccount property.
     *
     * @see userAccount
     * @return the userAccount property.
     */
    public UserAccount.Immutable getUserAccount() {
        return this.userAccount;
    }

    /**
     * Getter for the webAppPath property.
     *
     * @see webAppPath
     * @return the webAppPath property.
     */
    public String getWebAppPath() {
        return this.webAppPath;
    }

    /**
     * Prints properties of this object.
     */
    // Justification: this is a simplified example. Do not do this in production.
    @SuppressWarnings("PMD.SystemPrintln")
    public void printProperties() {
        System.out.println("=================PropertiesValuesFromContextExample");
        System.out.println("Locale=[" + this.locale + CLOSING_BRACKET);
        System.out.println("WebAppPath=[" + this.webAppPath + CLOSING_BRACKET);
        System.out.println("BaseUnits=[" + this.baseUnits + CLOSING_BRACKET);
        System.out.println("Currency=[" + this.currency + CLOSING_BRACKET);
        System.out.println("CurrencyConversions=[" + this.currencyConversions + CLOSING_BRACKET);

        // Don't do this: this is not DI
        System.out.println("ConfigManager.getWebAppPath()=[" + this.configManager.getWebAppPath()
                + CLOSING_BRACKET);
        System.out.println("Project.getName()=[" + this.project.getName() + CLOSING_BRACKET);
        System.out.println("UserAccount.getUserCurrency()=[" + this.userAccount.getUserCurrency()
                + CLOSING_BRACKET);
    }

    /**
     * Starts job specified by job property.
     */
    public void startJob() {
        this.jobManager.startJob(this.job);
    }

    /**
     * Setter for the baseUnits property.
     *
     * @see baseUnits
     * @param baseUnits the baseUnits to set
     */

    public void setBaseUnits(final Units baseUnits) {
        this.baseUnits = baseUnits;
    }

    /**
     * Setter for the configManager property.
     *
     * @see configManager
     * @param configManager the configManager to set
     */

    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }

    /**
     * Setter for the currency property.
     *
     * @see currency
     * @param currency the currency to set
     */

    public void setCurrency(final Currency currency) {
        this.currency = currency;
    }

    /**
     * Setter for the currencyConversions property.
     *
     * @see currencyConversions
     * @param currencyConversions the currencyConversions to set
     */

    public void setCurrencyConversions(final CurrencyConversions currencyConversions) {
        this.currencyConversions = currencyConversions;
    }

    /**
     * Setter for the locale property.
     *
     * @see locale
     * @param locale the locale to set
     */

    public void setLocale(final Locale locale) {
        this.locale = locale;
    }

    /**
     * Setter for the project property.
     *
     * @see project
     * @param project the project to set
     */

    public void setProject(final Project.Immutable project) {
        this.project = project;
    }

    /**
     * Setter for the userAccount property.
     *
     * @see userAccount
     * @param userAccount the userAccount to set
     */

    public void setUserAccount(final UserAccount.Immutable userAccount) {
        this.userAccount = userAccount;
    }

    /**
     * Setter for the webAppPath property.
     *
     * @see webAppPath
     * @param webAppPath the webAppPath to set.
     */
    public void setWebAppPath(final String webAppPath) {
        this.webAppPath = webAppPath;
    }
}
