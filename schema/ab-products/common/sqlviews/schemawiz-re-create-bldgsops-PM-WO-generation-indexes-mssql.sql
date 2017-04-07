IF EXISTS (SELECT 1 FROM sysindexes WHERE name = 'HWR_PMS_ID') DROP INDEX hwr.HWR_PMS_ID;

CREATE INDEX hwr_pms_id ON hwr (pms_id);