IF EXISTS (SELECT 1 FROM sysindex where index_name='HWR_PMS_ID') DROP INDEX hwr.HWR_PMS_ID;

CREATE INDEX hwr_pms_id ON hwr (pms_id);