package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.List;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.app.common.mobile.sync.domain.MobileAppConfig;
import com.archibus.config.Project;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.AbstractRestrictionDef;
import com.archibus.utility.StringUtil;

/**
 * DataSource for MobileAppConfig.
 * <p>
 * Designed to have prototype scope.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
public class MobileAppConfigDataSource extends ObjectDataSourceImpl<MobileAppConfig>
        implements IDao<MobileAppConfig>, InitializingBean {

    /**
     * Constant: schema version that has display_order field.
     */
    private static final int DISPLAY_ORDER_FIELD_SCHEMA_VERSION = 139;

    /**
     * Constant: field name: "title".
     */
    private static final String TITLE = "title";

    /**
     * Constant: field name: "url".
     */
    private static final String URL = "url";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES =
            { { TITLE, TITLE }, { "main_page_url", URL }, { "security_group", "securityGroup" } };

    /**
     * Project, required to get databaseVersion value.
     */
    private Project.Immutable project;

    /**
     * Constructs MobileAppConfigDataSource, mapped to <code>afm_mobile_apps</code> table, using
     * <code>mobileAppConfig</code> bean.
     */
    public MobileAppConfigDataSource() {
        super("mobileAppConfig", "afm_mobile_apps");

        this.setDatabaseRole(DB_ROLE_SECURITY);
    }

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @Override
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.project, "project must be supplied");
    }

    /** {@inheritDoc} */
    @Override
    public List<MobileAppConfig> find(final AbstractRestrictionDef restriction) {
        // if database schema version supports display_order field: add sort by display_order field
        final int databaseVersion =
                StringUtil.toInt(this.project.getAttribute("/*/preferences/@afm_db_version_num"));
        if (databaseVersion >= DISPLAY_ORDER_FIELD_SCHEMA_VERSION) {
            // This logic assumes that this bean has prototype scope, so addSort will be invoked
            // only once for each instance. Each invocation of this method will create new instance
            // of this bean.
            this.addSort("display_order");
        }

        return super.find(restriction);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
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
     * Setter for the project property.
     *
     * @see project
     * @param project the project to set
     */

    public void setProject(final Project.Immutable project) {
        this.project = project;
    }
}
