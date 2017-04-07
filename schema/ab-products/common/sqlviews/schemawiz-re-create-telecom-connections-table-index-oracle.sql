BEGIN EXECUTE IMMEDIATE 'DROP INDEX AFM_TCCN_DOWN'; EXCEPTION WHEN OTHERS THEN null;END;;

BEGIN EXECUTE IMMEDIATE 'DROP INDEX AFM_TCCN_UP'; EXCEPTION WHEN OTHERS THEN null;END;;

CREATE INDEX afm_tccn_down ON afm_tccn (downhill_table, downhill_key);

CREATE INDEX afm_tccn_up ON afm_tccn (uphill_table, uphill_key);