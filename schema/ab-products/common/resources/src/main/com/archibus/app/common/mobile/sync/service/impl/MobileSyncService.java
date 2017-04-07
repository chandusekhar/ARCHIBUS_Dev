package com.archibus.app.common.mobile.sync.service.impl;

import java.util.*;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.app.common.mobile.sync.dao.*;
import com.archibus.app.common.mobile.sync.domain.MobileAppConfig;
import com.archibus.app.common.mobile.sync.service.*;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.core.dao.IDao;
import com.archibus.model.schema.TableDef;
import com.archibus.model.schema.converter.TableDefConverter;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.security.UserAccount;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * Implementation of <code>IMobileSyncService</code>.
 * <p>
 * This is a bean managed by Spring, configured in
 * /schema/ab-products/common/resources/src/main/com/archibus/app/common/mobile/services.xml.
 * Exposed to JavaScript clients through DWR, configured in /WEB-INF/dwr.xml.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 *        <p>
 *        Suppress Warning "PMD.TooManyMethods". Justification: All methods belong in the
 *        MobileSyncService
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class MobileSyncService implements IMobileSyncService, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * DAO for MobileAppConfig.
     */
    private IDao<MobileAppConfig> mobileAppConfigDao;

    /**
     * Current project.
     */
    private Project.Immutable project;

    /**
     * DAO for sync operations.
     */
    private ISyncDao syncDao;

    /**
     * Current user account.
     */
    private UserAccount.Immutable userAccount;

    /**
     * DAO for sync history operations.
     */
    private ISyncHistoryDao syncHistoryDao;

    /**
     * DAO for table transactions.
     */
    private ITableTransactionDao tableTransactionDao;

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
        Assert.notNull(this.mobileAppConfigDao, "mobileAppConfigDao must be supplied");
        Assert.notNull(this.project, "project must be supplied");
        Assert.notNull(this.syncDao, "syncDao must be supplied");
        Assert.notNull(this.userAccount, "userAccount must be supplied");
        Assert.notNull(this.syncHistoryDao, "syncHistoryDao must be supplied");
        Assert.notNull(this.tableTransactionDao, "tableTransactionDao must be supplied");
    }

    /** {@inheritDoc} */
    @Override
    public void checkInRecords(final String tableName, final List<String> inventoryKeyNames,
            final List<Record> records) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "checkInRecords with tableName=[%s], inventoryKeyNames=[%s], records=[%s]",
                tableName, inventoryKeyNames, records));
        }

        // if caller did not supply any records to checkin, do nothing
        if (records == null || records.isEmpty()) {
            return;
        }

        final List<Record> failedRecords =
                this.syncDao.checkInRecords(inventoryKeyNames, records,
                    this.project.loadTableDef(tableName), this.userAccount.getName());

        reportFailedCheckins(tableName, failedRecords);
    }

    /** {@inheritDoc} */
    @Override
    public List<Record> checkOutRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "checkOutRecords with tableName=[%s], restrictionDef=[%s]", tableName,
                restrictionDef));
        }

        return this.syncDao.checkOutRecords(fieldNames, restrictionDef,
            this.project.loadTableDef(tableName), this.userAccount.getName(), true);

    }

    /** {@inheritDoc} */
    @Override
    public List<AppConfig> getEnabledApplications() throws ExceptionBase {
        final List<AppConfig> dtos = new ArrayList<AppConfig>();

        // get all records
        final List<MobileAppConfig> appConfigs = this.mobileAppConfigDao.find(null);
        for (final MobileAppConfig appConfig : appConfigs) {
            /**
             * Enable the app if its required security group is assigned to the user. Ignore
             * wildcards, e.g. if a user has a % security group, it does not permit any mobile apps.
             * if (this.userAccount.isMemberOfGroup(appConfig.getSecurityGroup())) {
             */
            if (this.userAccount.getGroups().contains(appConfig.getSecurityGroup())) {
                // convert domain object to DTO
                final AppConfig dto = new AppConfig();
                dto.setTitle(appConfig.getTitle());
                dto.setUrl(appConfig.getUrl());
                dtos.add(dto);
            }
        }

        return dtos;
    }

    // CHECKSTYLE:ON

    // CHECKSTYLE:OFF Justification: Suppress "Strict duplicate code" warning: several classes have
    // "mobileAppConfigDao" property.
    /**
     * @return the mobileAppConfigDao
     */
    public IDao<MobileAppConfig> getMobileAppConfigDao() {
        return this.mobileAppConfigDao;
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
     * Getter for the syncDao property.
     *
     * @see syncDao
     * @return the syncDao property.
     */
    public ISyncDao getSyncDao() {
        return this.syncDao;
    }

    /**
     * Getter for the syncHistoryDao property.
     *
     * @see syncHistoryDao
     * @return the syncHistoryDao property.
     */
    public ISyncHistoryDao getSyncHistoryDao() {
        return this.syncHistoryDao;
    }

    /**
     * Setter for the syncHistoryDao property.
     *
     * @see syncHistoryDao
     * @param syncHistoryDao the syncHistoryDao to set
     */

    public void setSyncHistoryDao(final ISyncHistoryDao syncHistoryDao) {
        this.syncHistoryDao = syncHistoryDao;
    }

    public void setSyncHistoryDataSource(final ISyncHistoryDao syncHistoryDao) {
        this.syncHistoryDao = syncHistoryDao;
    }

    /** {@inheritDoc} */
    @Override
    public TableDef getTableDef(final String tableName) throws ExceptionBase {
        // load TableDef from the current project
        final com.archibus.schema.TableDef.ThreadSafe tableDef =
                this.getProject().loadTableDef(tableName);

        // convert the TableDef to the model object and return it
        // include only fields for which user has review right
        final Locale locale = ContextStore.get().getUserSession().getLocale();

        return TableDefConverter.toDTO(tableDef, locale, this.getUserAccount());
    }

    /**
     * Getter for the userAcoount property.
     *
     * @see userAccount
     * @return the userAccount property.
     */
    public UserAccount.Immutable getUserAccount() {
        return this.userAccount;
    }

    @Override
    public List<Record> retrievePagedRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, final int pageSize) throws ExceptionBase {
        return this.retrievePagedRecords(tableName, fieldNames, restrictionDef, pageSize, true);
    }

    /** {@inheritDoc} */
    @Override
    public List<Record> retrievePagedRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, final int pageSize,
            final boolean includeDocumentData) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "retrievePagedRecords with tableName=[%s], restrictionDef=[%s]", tableName,
                restrictionDef));
        }

        return this.syncDao.retrieveRecords(fieldNames, restrictionDef,
            this.project.loadTableDef(tableName), pageSize, includeDocumentData);
    }

    /** {@inheritDoc} */
    @Override
    public List<Record> retrieveRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef) throws ExceptionBase {

        return this.retrievePagedRecords(tableName, fieldNames, restrictionDef, 0, true);
    }

    /**
     * @param mobileAppConfigDao the mobileAppConfigDao to set
     */
    public void setMobileAppConfigDao(final IDao<MobileAppConfig> mobileAppConfigDao) {
        this.mobileAppConfigDao = mobileAppConfigDao;
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
     * Setter for the syncDao property.
     *
     * @see syncDao
     * @param syncDao the syncDao to set
     */

    public void setSyncDao(final ISyncDao syncDao) {
        this.syncDao = syncDao;
    }

    /**
     * Setter for the syncDataSource property.
     *
     * @see syncDataSource
     * @param syncDataSource the syncDataSource to set
     */

    public void setSyncDataSource(final ISyncDao syncDataSource) {
        this.syncDao = syncDataSource;
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

    public ITableTransactionDao getTableTransactionDao() {
        return this.tableTransactionDao;
    }

    public void setTableTransactionDao(final ITableTransactionDao tableTransactionDao) {
        this.tableTransactionDao = tableTransactionDao;
    }

    /**
     * Reports failed check-in of failedRecords into tableName.
     *
     * @param tableName into which there was attempt to check-in.
     * @param failedRecords which there was attempt to check-in.
     */
    private void reportFailedCheckins(final String tableName, final List<Record> failedRecords) {
        for (final Record failedRecord : failedRecords) {
            // Log the attempted change as an error.
            // @non-translatable
            final String errorMessage =
                    String
                    .format(
                        "Attempt to check-in record=[%s] to table=[%s] failed: user is not allowed to lock the record.",
                        failedRecord, tableName);
            this.logger.error(errorMessage);
        }
    }

    @Override
    public void recordTableDownloadTime(final String userName, final String deviceId,
            final String clientTableName, final String serverTableName) throws ExceptionBase {

        this.getSyncHistoryDao().recordTableDownloadTime(userName, deviceId, serverTableName,
            clientTableName);

    }

    @Override
    public java.sql.Timestamp retrieveTableDownloadTime(final String userName,
            final String deviceId, final String clientTableName) throws ExceptionBase {

        return this.getSyncHistoryDao().retrieveTableDownloadTime(userName, deviceId,
            clientTableName);

    }

    @Override
    public List<Record> retrieveModifiedRecords(final String tableName,
            final List<String> fieldNames, final ParsedRestrictionDef restrictionDef,
            final int pageSize, final boolean includeDocumentData, final double timestamp)
                throws ExceptionBase {

        return this.syncDao.retrieveModifiedRecords(fieldNames, restrictionDef,
            this.project.loadTableDef(tableName), pageSize, includeDocumentData, timestamp);
    }

    @Override
    public List<Record> retrieveDeletedRecords(final String tableName, final double timestamp)
            throws ExceptionBase {

        return this.tableTransactionDao.retrieveDeletedRecords(tableName, timestamp);
    }

}