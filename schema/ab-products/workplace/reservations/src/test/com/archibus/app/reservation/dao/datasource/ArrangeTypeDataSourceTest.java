package com.archibus.app.reservation.dao.datasource;

import java.util.List;

import com.archibus.app.reservation.domain.ArrangeType;
import com.archibus.datasource.data.DataRecord;

import junit.framework.Assert;

/**
 * Test for ArrangeTypeDataSource.
 */
public class ArrangeTypeDataSourceTest extends ReservationDataSourceTestBase {

    /** A large number used to change the display order. */
    private static final int LARGE_NUMBER = 999;

    /** test. */
    private static final String TEST = "TEST";

    /**
     * The data source under test.
     */
    private ArrangeTypeDataSource arrangeTypeDataSource;

    /**
     * Test getting all arrange types.
     */
    public final void testGetAll() {
        final List<DataRecord> records = this.arrangeTypeDataSource.getRecords();
        final List<ArrangeType> objects = this.arrangeTypeDataSource.find(null);

        Assert.assertEquals(records.size(), objects.size());
    }

    /**
     * Verify the sort order for arrange types.
     */
    public final void testSortOrder() {
        // remove existing sort
        this.arrangeTypeDataSource.getSortFields().clear();

        // change the display order for the first record
        this.arrangeTypeDataSource.addField(ArrangeTypeDataSource.DISPLAY_ORDER);
        final List<DataRecord> records = this.arrangeTypeDataSource.getRecords();

        final DataRecord firstRecord = records.get(0);
        firstRecord.setValue(this.arrangeTypeDataSource.getMainTableName() + Constants.DOT
                + ArrangeTypeDataSource.DISPLAY_ORDER,
            LARGE_NUMBER);
        this.arrangeTypeDataSource.updateRecord(firstRecord);

        // sort by display order and retrieve the sorted records
        this.arrangeTypeDataSource.sortByDisplayOrder();
        final List<ArrangeType> objects = this.arrangeTypeDataSource.find(null);

        // the record which was first before shouldn't be first now
        final String firstId = firstRecord.getString(this.arrangeTypeDataSource.getMainTableName()
                + Constants.DOT + Constants.RM_ARRANGE_TYPE_ID_FIELD_NAME);
        Assert.assertEquals(records.size(), objects.size());
        Assert.assertNotSame(firstId, objects.get(0).getArrangeTypeId());
    }

    /**
     * test save.
     */
    public final void testSave() {
        ArrangeType arrangeType = new ArrangeType(TEST, "test description");
        this.arrangeTypeDataSource.save(arrangeType);

        arrangeType = this.arrangeTypeDataSource.get(TEST);

        Assert.assertNotNull(arrangeType);
    }

    /**
     * Sets the arrange type data source.
     *
     * @param arrangeTypeDataSource the new arrange type data source
     */
    public final void setArrangeTypeDataSource(final ArrangeTypeDataSource arrangeTypeDataSource) {
        this.arrangeTypeDataSource = arrangeTypeDataSource;
    }
}
