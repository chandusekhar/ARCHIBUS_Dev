package com.archibus.app.common.mobile.sync.service.impl;

import java.util.*;

import junit.framework.TestCase;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.mobile.sync.dao.ISyncDao;
import com.archibus.app.common.mobile.sync.domain.MobileAppConfig;
import com.archibus.app.common.mobile.sync.service.*;
import com.archibus.app.common.util.Callback;
import com.archibus.context.*;
import com.archibus.core.dao.IDao;
import com.archibus.model.view.datasource.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.ExceptionBase;

/**
 * Tests for MobileSyncService.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class MobileSyncServiceTest extends TestCase {
    private String methodInvoked;

    private MobileSyncService mobileSyncService;

    /**
     * Test method for
     * {@link MobileSyncService#checkInRecords(java.lang.String, java.util.List, java.util.List)} .
     */
    public final void testCheckInRecords() {
        this.mobileSyncService.setSyncDao(prepareSyncDao(new Callback() {

            @Override
            public Object doWithContext(final Context context) throws ExceptionBase {

                return null;
            }
        }));

        this.mobileSyncService.setProject(MockUtilities.createMockProject(null));
        this.mobileSyncService.setUserAccount(MockUtilities.createMockUserAccount());

        {
            // case #1: records is empty
            final String tableName = "TestTableName";
            final List<Record> records = new ArrayList<Record>();
            final List<String> inventoryKeyNames = new ArrayList<String>();

            this.mobileSyncService.checkInRecords(tableName, inventoryKeyNames, records);

            assertEquals(null, MobileSyncServiceTest.this.methodInvoked);
        }

        {
            // case #2: records is not empty
            final String tableName = "TestTableName";
            final List<Record> records = new ArrayList<Record>();
            records.add(new Record());
            final List<String> inventoryKeyNames = new ArrayList<String>();

            this.mobileSyncService.checkInRecords(tableName, inventoryKeyNames, records);

            assertEquals("checkInRecords", MobileSyncServiceTest.this.methodInvoked);
        }
    }

    /**
     * Test method for
     * {@link MobileSyncService#checkOutRecords(java.lang.String, java.util.List, com.archibus.model.view.datasource.ParsedRestrictionDef)}
     * .
     */
    public final void testCheckOutRecords() {
        this.mobileSyncService.setSyncDao(prepareSyncDao(new Callback() {

            @Override
            public Object doWithContext(final Context context) throws ExceptionBase {

                return null;
            }
        }));

        this.mobileSyncService.setProject(MockUtilities.createMockProject(null));
        this.mobileSyncService.setUserAccount(MockUtilities.createMockUserAccount());

        {
            // case #2: records is not empty
            final String tableName = "TestTableName";
            final List<String> fieldNames = new ArrayList<String>();

            final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
            final List<Record> actual =
                    this.mobileSyncService.checkOutRecords(tableName, fieldNames, restrictionDef);

            assertEquals(1, actual.size());
            assertEquals("checkOutRecords", MobileSyncServiceTest.this.methodInvoked);
        }
    }

    /**
     * Test method for {@link MobileSyncService#getEnabledApplications()} .
     */
    public final void testGetEnabledApplications() {
        this.mobileSyncService.setUserAccount(MockUtilities.createMockUserAccount());
        this.mobileSyncService.setMobileAppConfigDao(prepareMobileAppConfigDao());

        final List<AppConfig> dtos = this.mobileSyncService.getEnabledApplications();

        assertEquals(1, dtos.size());
        assertEquals("TestTitle", dtos.get(0).getTitle());
        assertEquals("TestUrl", dtos.get(0).getUrl());
    }

    /**
     * Test method for
     * {@link MobileSyncService#retrieveRecords(java.lang.String, java.util.List, com.archibus.model.view.datasource.ParsedRestrictionDef)}
     * .
     */
    public final void testRetrieveRecords() {
        this.mobileSyncService.setSyncDao(prepareSyncDao(new Callback() {

            @Override
            public Object doWithContext(final Context context) throws ExceptionBase {

                return null;
            }
        }));

        this.mobileSyncService.setProject(MockUtilities.createMockProject(null));
        this.mobileSyncService.setUserAccount(MockUtilities.createMockUserAccount());

        {
            // case #2: records is not empty
            final String tableName = "TestTableName";
            final List<String> fieldNames = new ArrayList<String>();

            final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
            final List<Record> actual =
                    this.mobileSyncService.retrieveRecords(tableName, fieldNames, restrictionDef);

            assertEquals(1, actual.size());
            assertEquals("retrieveRecords", MobileSyncServiceTest.this.methodInvoked);
        }
    }

    /** {@inheritDoc} */

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.mobileSyncService = new MobileSyncService();
    }

    private IDao<MobileAppConfig> prepareMobileAppConfigDao() {
        return new IDao<MobileAppConfig>() {

            @Override
            public void delete(final MobileAppConfig bean) {
            }

            @Override
            public List<MobileAppConfig> find(final AbstractRestrictionDef restriction) {
                final List<MobileAppConfig> mobileAppConfigs = new ArrayList<MobileAppConfig>();

                {
                    final MobileAppConfig config = new MobileAppConfig();
                    config.setSecurityGroup("MatchingSecurityGroup");
                    config.setTitle("TestTitle");
                    config.setUrl("TestUrl");

                    mobileAppConfigs.add(config);
                }
                {
                    final MobileAppConfig config = new MobileAppConfig();
                    config.setSecurityGroup("NotMatchingSecurityGroup");

                    mobileAppConfigs.add(config);
                }

                return mobileAppConfigs;
            }

            @Override
            public MobileAppConfig get(final Object id) {
                return null;
            }

            @Override
            public MobileAppConfig save(final MobileAppConfig bean) {
                return null;
            }

            @Override
            public void update(final MobileAppConfig bean) {

            }

            @Override
            public void update(final MobileAppConfig bean, final MobileAppConfig oldBean) {
            }
        };
    }

    private ISyncDao prepareSyncDao(final Callback callback) {
        return new ISyncDao() {

            @Override
            public List<Record> checkInRecords(final List<String> inventoryKeyNames,
                    final List<Record> records, final ThreadSafe tableDef, final String username)
                    throws ExceptionBase {
                final Context context = ContextStore.get();
                MobileSyncServiceTest.this.methodInvoked = "checkInRecords";

                callback.doWithContext(context);

                final List<Record> failedRecords = new ArrayList<Record>();
                failedRecords.add(new Record());

                return failedRecords;
            }

            @Override
            public List<Record> checkOutRecords(final List<String> fieldNames,
                final ParsedRestrictionDef restrictionDef, final ThreadSafe tableDef,
                    final String username, final boolean includeDocumentData) throws ExceptionBase {
                final Context context = ContextStore.get();
                MobileSyncServiceTest.this.methodInvoked = "checkOutRecords";

                callback.doWithContext(context);

                final List<Record> records = new ArrayList<Record>();
                records.add(new Record());

                return records;
            }

            @Override
            public List<Record> retrieveRecords(final List<String> fieldNames,
                final ParsedRestrictionDef restrictionDef, final ThreadSafe tableDef,
                    final int pageSize, final boolean includeDocumentData) throws ExceptionBase {
                final Context context = ContextStore.get();
                MobileSyncServiceTest.this.methodInvoked = "retrieveRecords";

                callback.doWithContext(context);

                final List<Record> records = new ArrayList<Record>();
                records.add(new Record());

                return records;
            }

            @Override
            public List<Record> retrieveModifiedRecords(final List<String> fieldNames,
                    final ParsedRestrictionDef restrictionDef, final ThreadSafe tableDef,
                final int pageSize, final boolean includeDocumentData, final double timestamp)
                        throws ExceptionBase {
                final Context context = ContextStore.get();
                MobileSyncServiceTest.this.methodInvoked = "retrieveModifiedRecords";

                callback.doWithContext(context);

                final List<Record> records = new ArrayList<Record>();
                records.add(new Record());

                return records;
            }
        };
    }
}
