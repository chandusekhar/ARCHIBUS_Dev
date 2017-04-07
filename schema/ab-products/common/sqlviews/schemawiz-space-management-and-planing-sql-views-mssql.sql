IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('gpc')) DROP VIEW gpc

CREATE VIEW gpc AS SELECT gp.gp_id AS gp_id, fl.fl_id AS fl_id, bl.bl_id AS bl_id, site.site_id AS site_id, ( gp.area * fl.area_fl_comn_gp /  CASE fl.area_gp_dp WHEN 0 THEN 9999999999  ELSE fl.area_gp_dp END ) AS flcomgp, ( gp.area * bl.area_bl_comn_gp /  CASE bl.area_gp_dp WHEN 0 THEN 9999999999  ELSE bl.area_gp_dp END ) AS blcomgp, ISNULL( ( gp.area * site.area_st_comn_gp /  CASE site.area_gp_dp WHEN 0 THEN 9999999999  ELSE site.area_gp_dp END ),0) AS stcomgp, ( gp.area * fl.area_fl_comn_serv /  CASE fl.area_gp_dp WHEN 0 THEN 9999999999  ELSE fl.area_gp_dp END ) AS flcomsrv, ( gp.area * bl.area_bl_comn_serv /  CASE bl.area_gp_dp WHEN 0 THEN 9999999999  ELSE bl.area_gp_dp END ) AS blcomsrv, ISNULL( ( gp.area * site.area_st_comn_serv /  CASE site.area_gp_dp WHEN 0 THEN 9999999999  ELSE site.area_gp_dp END ),0) AS stcomsrv FROM gp, fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id WHERE gp.dp_id IS NOT NULL AND gp.fl_id = fl.fl_id AND gp.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('rmc')) DROP VIEW rmc

CREATE VIEW rmc AS SELECT rm.rm_id AS rm_id, rm.fl_id AS fl_id, rm.bl_id AS bl_id, site.site_id AS site_id, ( rm.area * fl.area_fl_comn_rm /  CASE fl.area_rm_dp WHEN 0 THEN 9999999999  ELSE fl.area_rm_dp END ) AS flcomrm, ( rm.area * bl.area_bl_comn_rm /  CASE bl.area_rm_dp WHEN 0 THEN 9999999999  ELSE bl.area_rm_dp END ) AS blcomrm, ISNULL( ( rm.area * site.area_st_comn_rm /  CASE site.area_rm_dp WHEN 0 THEN 9999999999  ELSE site.area_rm_dp END ),0) AS stcomrm, ( rm.area * fl.area_fl_comn_serv /  CASE fl.area_rm_dp WHEN 0 THEN 9999999999  ELSE fl.area_rm_dp END ) AS flcomsrv, ( rm.area * bl.area_bl_comn_serv /  CASE bl.area_rm_dp WHEN 0 THEN 9999999999  ELSE bl.area_rm_dp END ) AS blcomsrv, ISNULL( ( rm.area * site.area_st_comn_serv /  CASE site.area_rm_dp WHEN 0 THEN 9999999999  ELSE site.area_rm_dp END ),0) AS stcomsrv FROM rm, fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id WHERE rm.dp_id IS NOT NULL AND rm.fl_id = fl.fl_id AND rm.bl_id = fl.bl_id AND rm.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('rmpctc')) DROP VIEW rmpctc

CREATE VIEW rmpctc AS SELECT rmpct.pct_id AS pct_id, rmpct.rm_id AS rm_id, fl.fl_id AS fl_id, bl.bl_id AS bl_id, site.site_id AS site_id, ( rmpct.area_rm * fl.area_fl_comn_rm /  CASE fl.area_rm_dp WHEN 0 THEN 9999999999  ELSE fl.area_rm_dp END ) AS flcomrm, ( rmpct.area_rm * bl.area_bl_comn_rm /  CASE bl.area_rm_dp WHEN 0 THEN 9999999999  ELSE bl.area_rm_dp END ) AS blcomrm, ISNULL((rmpct.area_rm * site.area_st_comn_rm /  CASE site.area_rm_dp WHEN 0 THEN 9999999999  ELSE site.area_rm_dp END ),0) AS stcomrm, ( rmpct.area_rm * fl.area_fl_comn_serv /  CASE fl.area_rm_dp WHEN 0 THEN 9999999999  ELSE fl.area_rm_dp END ) AS flcomsrv, ( rmpct.area_rm * bl.area_bl_comn_serv /  CASE bl.area_rm_dp WHEN 0 THEN 9999999999  ELSE bl.area_rm_dp END ) AS blcomsrv, ISNULL((rmpct.area_rm * site.area_st_comn_serv/ CASE site.area_rm_dp WHEN 0 THEN 9999999999  ELSE site.area_rm_dp END ),0) AS stcomsrv FROM rmpct, fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id WHERE rmpct.dp_id IS NOT NULL AND rmpct.fl_id = fl.fl_id AND rmpct.bl_id = fl.bl_id AND rmpct.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('alrmc')) DROP VIEW alrmc

CREATE VIEW alrmc AS SELECT rm.rm_id AS rm_id, rm.fl_id AS fl_id, rm.bl_id AS bl_id, site.site_id AS site_id, ( rm.area * fl.area_fl_comn_ocup /  CASE fl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE fl.area_ocup_dp END ) AS flcomocup, ( rm.area * bl.area_bl_comn_ocup /  CASE bl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE bl.area_ocup_dp END ) AS blcomocup, ISNULL( ( rm.area * site.area_st_comn_ocup /  CASE site.area_ocup_dp WHEN 0 THEN 9999999999  ELSE site.area_ocup_dp END ),0) AS stcomocup, ( rm.area * fl.area_fl_comn_nocup /  CASE fl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE fl.area_ocup_dp END ) AS flcomnocup, ( rm.area * bl.area_bl_comn_nocup /  CASE bl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE bl.area_ocup_dp END ) AS blcomnocup, ISNULL( ( rm.area * site.area_st_comn_nocup /  CASE site.area_ocup_dp WHEN 0 THEN 9999999999  ELSE site.area_ocup_dp END ),0) AS stcomnocup FROM rm, rmcat, fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id WHERE rm.dp_id IS NOT NULL AND rmcat.occupiable = 1 AND rm.rm_cat = rmcat.rm_cat AND rm.fl_id = fl.fl_id AND rm.bl_id = fl.bl_id AND rm.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('alrmpctc')) DROP VIEW alrmpctc

CREATE VIEW alrmpctc AS SELECT rmpct.pct_id AS pct_id, rmpct.rm_id AS rm_id, rmpct.fl_id AS fl_id, rmpct.bl_id AS bl_id, site.site_id AS site_id, ( rmpct.area_rm * fl.area_fl_comn_ocup /  CASE fl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE fl.area_ocup_dp END ) AS flcomocup, ( rmpct.area_rm * bl.area_bl_comn_ocup /  CASE bl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE bl.area_ocup_dp END ) AS blcomocup, ISNULL((rmpct.area_rm * site.area_st_comn_ocup/ CASE site.area_ocup_dp WHEN 0 THEN 9999999999  ELSE site.area_ocup_dp END ),0) AS stcomocup, ( rmpct.area_rm * fl.area_fl_comn_nocup /  CASE fl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE fl.area_ocup_dp END ) AS flcomnocup, ( rmpct.area_rm * bl.area_bl_comn_nocup /  CASE bl.area_ocup_dp WHEN 0 THEN 9999999999  ELSE bl.area_ocup_dp END ) AS blcomnocup, ISNULL((rmpct.area_rm *site.area_st_comn_nocup/ CASE site.area_ocup_dp WHEN 0 THEN 9999999999  ELSE site.area_ocup_dp END ),0) AS stcomnocup FROM rmpct, rmcat, fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id WHERE rmpct.dp_id IS NOT NULL AND rmcat.occupiable = 1 AND rmpct.rm_cat = rmcat.rm_cat AND rmpct.fl_id = fl.fl_id AND rmpct.bl_id = fl.bl_id AND rmpct.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('emcic')) DROP VIEW emcic

CREATE VIEW emcic AS SELECT rm.rm_id AS rm_id, rm.fl_id AS fl_id, rm.bl_id AS bl_id, site.site_id AS site_id, ( rm.area * fl.area_fl_comn_rm /  CASE fl.area_em_dp WHEN 0 THEN 9999999999  ELSE fl.area_em_dp END ) AS flcomrm, ( rm.area * bl.area_bl_comn_rm /  CASE bl.area_em_dp WHEN 0 THEN 9999999999  ELSE bl.area_em_dp END ) AS blcomrm, ( rm.area * site.area_st_comn_rm /  CASE site.area_em_dp WHEN 0 THEN 9999999999  ELSE site.area_em_dp END ) AS stcomrm, ( rm.area * fl.area_fl_comn_serv /  CASE fl.area_em_dp WHEN 0 THEN 9999999999  ELSE fl.area_em_dp END ) AS flcomsrv, ( rm.area * bl.area_bl_comn_serv /  CASE bl.area_em_dp WHEN 0 THEN 9999999999  ELSE bl.area_em_dp END ) AS blcomsrv, ( rm.area * site.area_st_comn_serv /  CASE site.area_em_dp WHEN 0 THEN 9999999999  ELSE site.area_em_dp END ) AS stcomsrv FROM rm,fl,bl,site WHERE rm.count_em > 0 AND rm.fl_id = fl.fl_id AND rm.bl_id = fl.bl_id AND rm.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id AND bl.site_id = site.site_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('emarc')) DROP VIEW emarc

CREATE VIEW emarc AS SELECT rm.rm_id AS rm_id, rm.fl_id AS fl_id, rm.bl_id AS bl_id, site.site_id AS site_id, ( rm.area * fl.area_fl_comn_ocup /  CASE fl.area_em_dp WHEN 0 THEN 9999999999  ELSE fl.area_em_dp END ) AS flcomocup, ( rm.area * bl.area_bl_comn_ocup /  CASE bl.area_em_dp WHEN 0 THEN 9999999999  ELSE bl.area_em_dp END ) AS blcomocup, ( rm.area * site.area_st_comn_ocup /  CASE site.area_em_dp WHEN 0 THEN 9999999999  ELSE site.area_em_dp END ) AS stcomocup, ( rm.area * fl.area_fl_comn_nocup /  CASE fl.area_em_dp WHEN 0 THEN 9999999999  ELSE fl.area_em_dp END ) AS flcomnocup, ( rm.area * bl.area_bl_comn_nocup /  CASE bl.area_em_dp WHEN 0 THEN 9999999999  ELSE bl.area_em_dp END ) AS blcomnocup, ( rm.area * site.area_st_comn_nocup /  CASE site.area_em_dp WHEN 0 THEN 9999999999  ELSE site.area_em_dp END ) AS stcomnocup FROM rm,fl,bl,site WHERE rm.count_em > 0 AND rm.fl_id = fl.fl_id AND rm.bl_id = fl.bl_id AND rm.bl_id = bl.bl_id AND fl.bl_id = bl.bl_id AND bl.site_id = site.site_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('rmpctbdd')) DROP VIEW rmpctbdd

CREATE VIEW rmpctbdd AS SELECT DISTINCT site_id,rmpct.bl_id,rmpct.fl_id,rmpct.rm_id,rmpct.dv_id,rmpct.dp_id,rm_std FROM rmpct,rm,bl WHERE rmpct.bl_id = bl.bl_id AND rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('rmpcttc')) DROP VIEW rmpcttc

CREATE VIEW rmpcttc AS SELECT DISTINCT site_id,rmpct.bl_id,fl_id,rm_id,rm_cat,rm_type  FROM rmpct,bl WHERE rmpct.bl_id = bl.bl_id