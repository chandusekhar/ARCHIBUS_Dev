INSERT INTO afm_flds_lang (table_name, field_name) SELECT table_name, field_name FROM afm_flds WHERE NOT EXISTS (SELECT 1 FROM afm_flds_lang afm_flds_lang_inner WHERE afm_flds_lang_inner.table_name = afm_flds.table_name AND afm_flds_lang_inner.field_name = afm_flds.field_name) AND afm_flds.table_name IN ('resview','resrmview','resrsview','rrdayrmresplus','rrwrrestr','rrdayrmres','rrcostdet','rrmoncostdp','rrmonusearr','rrdayrmocc','rrmonresrej','rrdayrresplus','rrdayresocc','rrmonthresquant','rrmonnumrres','rrressheet','rrressheetplus','rrappdet','rrmonrmcap','rrmonreq');

CREATE OR REPLACE VIEW resview AS (SELECT ac_id,attendees,comments,contact,cost_res,date_cancelled,date_created,date_end,date_last_modified,date_start,doc_event,dp_id,dv_id,email,phone,recurring_date_modified,recurring_rule,res_id,res_parent,res_type,reservation_name,status,time_end,time_start,user_created_by,user_last_modified_by,user_requested_by,user_requested_for,res_conference FROM reserve) UNION ALL (SELECT ac_id,attendees,comments,contact,cost_res,date_cancelled,date_created,date_end,date_last_modified,date_start,doc_event,dp_id,dv_id,email,phone,recurring_date_modified,recurring_rule,res_id,res_parent,res_type,reservation_name,status,time_end,time_start,user_created_by,user_last_modified_by,user_requested_by,user_requested_for,res_conference FROM hreserve);
CREATE OR REPLACE VIEW resrmview AS (SELECT bl_id,comments,config_id,cost_rmres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,guests_external,guests_internal,recurring_order,res_id,rm_arrange_type_id,rm_id,rmres_id,status,time_end,time_start,user_last_modified_by,verified, attendees_in_room FROM reserve_rm) UNION ALL (SELECT bl_id,comments,config_id,cost_rmres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,guests_external,guests_internal,recurring_order,res_id,rm_arrange_type_id,rm_id,rmres_id,status,time_end,time_start,user_last_modified_by,verified, attendees_in_room FROM hreserve_rm);
CREATE OR REPLACE VIEW resrsview AS (SELECT bl_id,comments,cost_rsres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,quantity,recurring_order,res_id,resource_id,rm_id,rsres_id,status,time_end,time_start,user_last_modified_by FROM reserve_rs) UNION ALL (SELECT bl_id,comments,cost_rsres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,quantity,recurring_order,res_id,resource_id,rm_id,rsres_id,status,time_end,time_start,user_last_modified_by FROM hreserve_rs);
CREATE OR REPLACE VIEW rrdayrmresplus AS (SELECT resrmview.bl_id,resrmview.date_start,resrmview.time_start,resrmview.time_end,     resview.res_id,resrmview.fl_id,resrmview.rm_id,'' AS resource_id,0 AS quantity,     resview.user_requested_for,resview.phone,resview.dv_id,resview.dp_id,resrmview.comments,     resrmview.rm_arrange_type_id,resrmview.guests_internal+resrmview.guests_external AS total_guest,resrmview.status,  	 bl.ctry_id,bl.site_id, resview.reservation_name, rm_arrange_type.tr_id,rm_arrange_type.vn_id FROM     resrmview LEFT OUTER JOIN     resview ON resrmview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrmview.bl_id = bl.bl_id LEFT OUTER JOIN     rm_arrange_type ON resrmview.rm_arrange_type_id =     rm_arrange_type.rm_arrange_type_id) UNION ALL (SELECT resrsview.bl_id,resrsview.date_start,resrsview.time_start,resrsview.time_end,resview.res_id,     resrsview.fl_id,resrsview.rm_id,resrsview.resource_id,resrsview.quantity,resview.user_requested_for,     resview.phone,resview.dv_id,resview.dp_id,resrsview.comments,'' AS rm_arrange_type_id,0 AS total_guests, resrsview.status ,     bl.ctry_id,bl.site_id, resview.reservation_name, resource_std.tr_id, resource_std.vn_id FROM     resrsview LEFT OUTER JOIN     resview ON resrsview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id LEFT OUTER JOIN     resources ON resrsview.resource_id = resources.resource_id LEFT OUTER JOIN     resource_std ON resources.resource_std = resource_std.resource_std LEFT OUTER JOIN     resrmview ON resrsview.res_id = resrmview.res_id);
CREATE OR REPLACE VIEW rrmonreq AS SELECT      Bl.ctry_id, bl.site_id, resrmview.bl_id, resrmview.fl_id, resrmview.rm_id, resrmview.rm_arrange_type_id,      resrmview.date_start, resview.dv_id, resview.dp_id, resview.status, resrmview.config_id, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt,  DECODE('RESERVATION MANAGER',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name =   afm_groupsforroles.role_name and group_name='RESERVATION MANAGER'),   'RESERVATION MANAGER',   DECODE('RESERVATION SERVICE DESK',(SELECT group_name FROM afm_groupsforroles  WHERE afm_users.role_name =    afm_groupsforroles.role_name and group_name='RESERVATION SERVICE DESK'), 	'RESERVATION SERVICE DESK', 	DECODE('RESERVATION APPROVER',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name = 	 afm_groupsforroles.role_name and group_name='RESERVATION APPROVER'), 	 'RESERVATION APPROVER', 	 DECODE('RESERVATION ASSISTANT',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name = 	  afm_groupsforroles.role_name and group_name='RESERVATION ASSISTANT'), 	  'RESERVATION ASSISTANT', 	  DECODE('RESERVATION TRADES',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name = 	   afm_groupsforroles.role_name and group_name='RESERVATION TRADES'), 	   'RESERVATION TRADES', 	   'RESERVATION HOST' 	   ) 	  )     )    )   ) AS usertype FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id      LEFT OUTER JOIN em ON resview.user_created_by = em.em_id      LEFT OUTER JOIN afm_users ON afm_users.email = em.email;
CREATE OR REPLACE VIEW rrmonrmcap AS SELECT      Bl.ctry_id, bl.site_id, resrmview.bl_id,resrmview.fl_id,resrmview.rm_id, resrmview.rm_arrange_type_id, resrmview.config_id,      resrmview.date_start, resview.dv_id, resview.dp_id, resrmview.time_start, resrmview.time_end, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt, 	  ROUND(CAST(resrmview.attendees_in_room AS real)/rm_arrange.max_capacity * 100,2) AS capacity_use, resview.status FROM      resrmview      LEFT OUTER JOIN rm_arrange ON rm_arrange.bl_id = resrmview.bl_id AND rm_arrange.fl_id = resrmview.fl_id  AND      rm_arrange.rm_id = resrmview.rm_id  AND  rm_arrange.config_id = resrmview.config_id  AND      rm_arrange.rm_arrange_type_id = resrmview.rm_arrange_type_id      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id;
CREATE OR REPLACE VIEW rrmonresrej AS SELECT      Bl.ctry_id, bl.site_id, resrsview.bl_id,resrsview.fl_id,resrsview.resource_id, resources.resource_std,      resrsview.date_start,resview.dv_id, resview.dp_id,resrsview.status, TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM') AS monthtxt FROM      resrsview      LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrsview.bl_id      LEFT OUTER JOIN resources ON resrsview.resource_id = resources.resource_id;
CREATE OR REPLACE VIEW rrmonnumrres AS SELECT      Bl.ctry_id, bl.site_id, TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM') AS monthtxt, 	 resrsview.date_start, resrsview.bl_id, resrsview.time_start, resrsview.time_end, resrsview.fl_id, resources.resource_id,     resources.resource_std, resview.dv_id, resview.dp_id,resview.status FROM      resrsview LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN bl ON resrsview.bl_id = bl.bl_id      LEFT OUTER JOIN resources ON resrsview.resource_id  = resources.resource_id;
CREATE OR REPLACE VIEW rrmonusearr AS SELECT      Bl.ctry_id, bl.site_id, resrmview.bl_id,resrmview.fl_id,resrmview.rm_id,resrmview.date_start,      resrmview.time_start, resrmview.time_end, resrmview.rm_arrange_type_id, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt,       resview.dv_id, resview.dp_id, resview.status, resrmview.config_id FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id;
CREATE OR REPLACE VIEW rrappdet AS (SELECT      resrmview.res_id, resrmview.date_start, resrmview.time_start, resrmview.time_end,      resview.user_requested_by, resrmview.bl_id, resrmview.fl_id, resrmview.rm_id,      resrmview.rm_arrange_type_id, '' AS resource_id, (resrmview.guests_internal+resrmview.guests_external) AS quantity,      resrmview.status, bl.ctry_id, bl.site_id, resrmview.config_id FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id      LEFT OUTER JOIN rm_arrange ON rm_arrange.bl_id = resrmview.bl_id  AND  rm_arrange.fl_id = resrmview.fl_id  AND      rm_arrange.rm_id = resrmview.rm_id AND rm_arrange.config_id = resrmview.config_id AND      rm_arrange.rm_arrange_type_id = resrmview.rm_arrange_type_id WHERE    resrmview.date_start - sysdate <= rm_arrange.announce_days AND resrmview.date_start - sysdate >= 0 ) UNION ALL ( SELECT      resrsview.res_id, resrsview.date_start, resrsview.time_start, resrsview.time_end,      resview.user_requested_by, resrsview.bl_id, resrsview.fl_id, resrsview.rm_id,      '' AS rm_arrange_type_id, resrsview.resource_id, resrsview.quantity AS quantity, resrsview.status      , bl.ctry_id, bl.site_id,'' AS config_id FROM      resrsview      LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrsview.bl_id      LEFT OUTER JOIN resources ON resources.resource_id = resrsview.resource_id WHERE resrsview.date_start - sysdate <= resources.announce_days AND resrsview.date_start - sysdate >= 0 );
CREATE OR REPLACE VIEW rrressheetplus AS (SELECT 	resview.res_id,	resview.date_start,bl.ctry_id,	bl.site_id,	resrmview.bl_id, 	resrmview.fl_id,resrmview.rm_id,resview.user_created_by,resview.user_requested_by,resview.user_requested_for, 	resview.dv_id,resview.dp_id,resview.reservation_name,resview.status FROM    resview LEFT OUTER JOIN    resrmview ON resview.res_id = resrmview.res_id LEFT OUTER JOIN    bl ON resrmview.bl_id = bl.bl_id) UNION ALL (SELECT resview.res_id,resview.date_start,     bl.ctry_id,bl.site_id,resrsview.bl_id,resrsview.fl_id,resrsview.rm_id,resview.user_created_by,     resview.user_requested_by,resview.user_requested_for,resview.dv_id,resview.dp_id,     resview.reservation_name,resview.status FROM     resview LEFT OUTER JOIN     resrsview ON resview.res_id = resrsview.res_id LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id);
CREATE OR REPLACE VIEW rrressheet AS SELECT DISTINCT res_id, date_start FROM rrressheetplus;
CREATE OR REPLACE VIEW rrdayrmres AS SELECT 	resrmview.bl_id,bl.name,resrmview.date_start,resrmview.time_start, 	resrmview.time_end,resrmview.fl_id,resrmview.rm_id,resrmview.rm_arrange_type_id, 	resrmview.guests_internal+resrmview.guests_external AS total_guest,resview.res_id, 	resview.user_requested_for,resview.phone,resview.dv_id, 	resview.dp_id,resrmview.comments,bl.ctry_id,bl.site_id,resview.reservation_name, 	rm_arrange_type.tr_id,rm_arrange_type.vn_id,resview.status,resrmview.config_id, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt  FROM     resrmview LEFT OUTER JOIN     resview ON resrmview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrmview.bl_id = bl.bl_id LEFT OUTER JOIN     rm_arrange_type ON resrmview.rm_arrange_type_id = rm_arrange_type.rm_arrange_type_id;
CREATE OR REPLACE VIEW rrcostdet AS   (SELECT 		Resview.dv_id,resview.dp_id,resview.res_id,	resrmview.date_start,resrmview.time_start,resrmview.time_end,resview.user_requested_by, 		resrmview.bl_id,resrmview.fl_id,resrmview.rm_id,resrmview.rm_arrange_type_id, '' AS resource_id, 		(resrmview.guests_internal+resrmview.guests_external) AS quantity,resrmview.cost_rmres AS cost,resrmview.status,bl.ctry_id, 		bl.site_id,	resview.reservation_name, resrmview.config_id FROM     resrmview LEFT OUTER JOIN     resview ON resrmview.res_id = resview.res_id LEFT OUTER JOIN     bl ON bl.bl_id = resrmview.bl_id )	UNION ALL   (SELECT Resview.dv_id,resview.dp_id,resview.res_id,resrsview.date_start,resrsview.time_start,     resrsview.time_end,resview.user_requested_by,resrsview.bl_id,resrsview.fl_id,resrsview.rm_id,     '' AS rm_arrange_type_id, resrsview.resource_id,resrsview.quantity AS quantity,resrsview.cost_rsres AS cost,     resrsview.status,     bl.ctry_id,bl.site_id, resview.reservation_name, '' AS config_id FROM     resrsview LEFT OUTER JOIN     resview ON resrsview.res_id = resview.res_id LEFT OUTER JOIN     bl ON bl.bl_id = resrsview.bl_id );
CREATE OR REPLACE VIEW rrmoncostdp AS (SELECT      bl.ctry_id, bl.site_id, resrmview.bl_id,resrmview.fl_id, resrmview.rm_id, resrmview.rm_arrange_type_id, resrmview.config_id,  	  resrmview.date_start, resview.dv_id, resview.dp_id, RTRIM(resview.dv_id) || ' - ' || RTRIM(resview.dp_id) AS dv_dp_id, 	resrmview.res_id, '' AS resource_id,  resrmview.cost_rmres AS cost, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN resrsview ON resrsview.res_id = resrmview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id GROUP BY      bl.ctry_id, bl.site_id,      resrmview.bl_id, resrmview.fl_id, resrmview.date_start,      resview.dv_id, resview.dp_id, resview.dv_id, resrmview.cost_rmres,     resrmview.res_id, resrmview.rm_id, resrmview.rm_arrange_type_id, resrmview.config_id,      resrmview.rm_arrange_type_id)  UNION (SELECT      bl.ctry_id, bl.site_id, resrsview.bl_id,resrsview.fl_id, resrsview.rm_id, '' AS rm_arrange_type_id, '' AS config_id,      resrsview.date_start, resview.dv_id, resview.dp_id, RTRIM(resview.dv_id) || ' - ' || RTRIM(resview.dp_id) AS dv_dp_id,  resrsview.res_id, resrsview.resource_id, 	resrsview.cost_rsres AS cost, TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM') AS monthtxt FROM      resrsview      LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN resrmview ON resrsview.res_id = resrmview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrsview.bl_id GROUP BY      bl.ctry_id, bl.site_id, resrsview.bl_id,resrsview.fl_id, resrsview.rm_id, rm_arrange_type_id, config_id,      resrsview.date_start, resview.dv_id, resview.dp_id,resrsview.cost_rsres,resrsview.res_id, resrsview.resource_id);
CREATE OR REPLACE VIEW rrdayrresplus AS SELECT resrsview.bl_id,bl.name,resrsview.date_start,resrsview.time_start,resrsview.time_end,resrsview.fl_id,     resrsview.rm_id,resources.resource_name,resrsview.quantity,resview.user_requested_for,resview.phone,     resview.dv_id,resview.dp_id,resrsview.comments,resrsview.status,bl.ctry_id,bl.site_id, resrsview.res_id,     resview.reservation_name,resource_std.tr_id,resource_std.vn_id,resources.resource_std,resources.resource_id FROM     resrsview LEFT OUTER JOIN     resview ON resrsview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id LEFT OUTER JOIN     resources ON resrsview.resource_id = resources.resource_id LEFT OUTER JOIN     resource_std ON resources.resource_std = resource_std.resource_std;
CREATE OR REPLACE VIEW rrwrrestr AS (SELECT wrhwr.bl_id,bl.name,wrhwr.tr_id,wrhwr.date_assigned,wrhwr.time_assigned,wrhwr.prob_type,wrhwr.fl_id, wrhwr.rm_id,'' AS resource_name,0 AS quantity,resrmview.rm_arrange_type_id,resrmview.guests_internal+resrmview.guests_external AS total_guest, wrhwr.requestor,wrhwr.phone,wrhwr.dv_id,wrhwr.dp_id,wrhwr.description,bl.ctry_id,bl.site_id,wrhwr.res_id,wrhwr.status, wrhwr.vn_id,resrmview.config_id FROM     wrhwr LEFT OUTER JOIN     resview ON wrhwr.res_id = resview.res_id LEFT OUTER JOIN     resrmview ON wrhwr.rmres_id = resrmview.rmres_id LEFT OUTER JOIN     bl ON wrhwr.bl_id = bl.bl_id WHERE      (wrhwr.tr_id IS NOT NULL OR wrhwr.vn_id IS NOT NULL) AND      wrhwr.rmres_id IS NOT NULL) UNION ALL (SELECT    wrhwr.bl_id,bl.name,wrhwr.tr_id,wrhwr.date_assigned,wrhwr.time_assigned,wrhwr.prob_type,wrhwr.fl_id,wrhwr.rm_id, 	resources.resource_name,resrsview.quantity,'' AS rm_arrange_type_id, 0 AS total_guest,wrhwr.requestor,wrhwr.phone,wrhwr.dv_id, 	wrhwr.dp_id,wrhwr.description,bl.ctry_id,bl.site_id,wrhwr.res_id,wrhwr.status, wrhwr.vn_id,'' AS config_id FROM     wrhwr LEFT OUTER JOIN     resview ON wrhwr.res_id = resview.res_id LEFT OUTER JOIN     resrsview ON wrhwr.rsres_id = resrsview.rsres_id LEFT OUTER JOIN     bl ON wrhwr.bl_id = bl.bl_id LEFT OUTER JOIN     resources ON resrsview.resource_id = resources.resource_id WHERE     (wrhwr.tr_id IS NOT NULL OR wrhwr.vn_id IS NOT NULL) AND 	 wrhwr.rsres_id IS NOT NULL);
CREATE OR REPLACE VIEW rrdayrmocc  AS SELECT  NVL(resrmview.status,'') AS status,						(CASE WHEN TO_CHAR(resrmview.date_start, 'YYYY') IS NULL THEN NULL 						ELSE 						TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') 						END ) AS monthtxt,						(CASE WHEN  to_char(resrmview.time_end, 'HH24:MI:SS') = '00:00:00' THEN 						(resrmview.time_end + 1 - resrmview.time_start)*24  						ELSE  (resrmview.time_end - resrmview.time_start)*24 END) AS total_hours,	rm_arrange.rm_arrange_type_id,resrmview.rmres_id,resrmview.res_id,rm_arrange.config_id,resrmview.date_start,    (rm_arrange.bl_id || ' ' || rm_arrange.fl_id || ' ' || rm_arrange.rm_id || ' ' || rm_arrange.config_id || ' ' || rm_arrange.rm_arrange_type_id) AS rm_arrange_type,    resrmview.time_start,resrmview.time_end,bl.ctry_id,bl.site_id,rm_arrange.bl_id,	rm_arrange.fl_id,rm_arrange.rm_id FROM     rm_arrange LEFT OUTER JOIN     resrmview ON rm_arrange.bl_id = resrmview.bl_id AND 	rm_arrange.fl_id = resrmview.fl_id AND 	rm_arrange.rm_id = resrmview.rm_id AND    rm_arrange.config_id = resrmview.config_id 	 AND rm_arrange.rm_arrange_type_id = resrmview.rm_arrange_type_id 	LEFT OUTER JOIN rm ON rm.bl_id = resrmview.bl_id AND 	rm.fl_id = resrmview.fl_id AND rm.rm_id = resrmview.rm_id 	LEFT OUTER JOIN bl ON rm_arrange.bl_id = bl.bl_id;
CREATE OR REPLACE VIEW rrdayresocc AS SELECT  (CASE WHEN TO_CHAR(resrsview.date_start, 'YYYY') IS NULL THEN NULL  ELSE  TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM')  END ) AS monthtxt,  resource_std.resource_name || ' (' || (SELECT COUNT(resource_id) FROM resources res2  WHERE res2.resource_std = resources.resource_std) || ')' AS resource_name,(CASE WHEN  to_char(resrsview.time_end, 'HH24:MI:SS') = '00:00:00' THEN 						(resrsview.time_end + 1 - resrsview.time_start)*24  						ELSE  (resrsview.time_end - resrsview.time_start)*24 END) AS total_hours,	resrsview.resource_id,resrsview.status,resrsview.time_start,resrsview.time_end,bl.ctry_id,bl.site_id,resrsview.bl_id, 	resrsview.date_start,resrsview.rsres_id,resrsview.res_id,resource_std.resource_std FROM    resrsview LEFT OUTER JOIN     resources ON resources.resource_id = resrsview.resource_id LEFT OUTER JOIN     resource_std ON resource_std.resource_std = resources.resource_std LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id;
CREATE OR REPLACE VIEW rrmonthresquant AS SELECT  (CASE WHEN TO_CHAR(resrsview.date_start, 'YYYY') IS NULL THEN NULL  ELSE  TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM')  END ) AS monthtxt,  resource_std.resource_name || ' (' || (SELECT COUNT(resource_id) FROM resources res2  WHERE res2.resource_std = resources.resource_std) || ')' AS resource_name, resrsview.quantity as total_quantity,	resrsview.resource_id,resrsview.status,resrsview.time_start,resrsview.time_end,bl.ctry_id,bl.site_id,resrsview.bl_id, 	resrsview.date_start,resrsview.rsres_id,resrsview.res_id,resource_std.resource_std FROM    resrsview LEFT OUTER JOIN     resources ON resources.resource_id = resrsview.resource_id LEFT OUTER JOIN     resource_std ON resource_std.resource_std = resources.resource_std LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id;