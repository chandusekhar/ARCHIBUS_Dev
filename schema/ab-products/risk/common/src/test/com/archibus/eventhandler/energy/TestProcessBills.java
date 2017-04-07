package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;

public class TestProcessBills extends DataSourceTestBase {
    static String billId = "1201";

    static String vnId = "ELECTRICAL CO-OP";

    public void testAddNewBillLineItem() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.addNewBillLineItem(billId, vnId, 1));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testPopulateQTYs() {
        try {
            ProcessBills pb = new ProcessBills();
            pb.populateQTYs(billId, vnId, 1);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testSumBillTotals() {
        try {
            ProcessBills pb = new ProcessBills();
            pb.sumBillTotals(billId, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testSumBillLineTotals() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.sumBillLineTotals(billId, vnId) instanceof DataRecord);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testGetBillLineCount() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.getBillLineCount(billId, vnId) instanceof Integer);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testGetBillCount() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.getBillCount("123-456-789", vnId) instanceof Integer);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testGetBillArchiveCount() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.getBillArchiveCount("123-456-789", vnId) instanceof Integer);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCheckServiceGap() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.checkServiceGap("1B", vnId, "123-456-789", "1/16/2009", "2009-02"));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCheckArchiveServiceGap() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.checkArchiveServiceGap("1B", vnId, "123-456-789", "1/16/2009", "2009-02"));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testApproveBill() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.approveBill(billId, vnId));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalculateCostPerEnergy() {
        try {
            /* new ProcessBills(); */
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testGetCostCat() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.getCostCat("ELECTRIC") instanceof String);
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testArchiveBills() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.archiveBill(billId, vnId));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testUpdateBillDoc() {
        try {
            ProcessBills pb = new ProcessBills();
            assertTrue(pb.updateBillDoc(billId, vnId));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }
}
