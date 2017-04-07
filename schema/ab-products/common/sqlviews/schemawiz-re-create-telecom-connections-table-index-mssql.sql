IF EXISTS (SELECT 1 FROM sysindexes WHERE name = 'afm_tccn_up') DROP INDEX afm_tccn.AFM_TCCN_DOWN;

IF EXISTS (SELECT 1 FROM sysindexes WHERE name = 'afm_tccn_up') DROP INDEX afm_tccn.AFM_TCCN_UP;

CREATE INDEX afm_tccn_down ON afm_tccn (downhill_table, downhill_key);

CREATE INDEX afm_tccn_up ON afm_tccn (uphill_table, uphill_key);