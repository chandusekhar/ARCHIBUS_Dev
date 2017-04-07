UPDATE afm.afm_ptasks
   SET task_file = 'ab-project-actions-est-base-sched-edit.axvw'
 WHERE task_file = 'brg-project-actions-est-base-sched-edit.axvw';

UPDATE afm.afm_ptasks
   SET task_file = 'ab-proj-projects-calendar.axvw'
 WHERE task_file = 'brg-proj-projects-calendar.axvw';


UPDATE afm.afm_ptasks
   SET task_file = 'ab-proj-projects-map.axvw'
 WHERE task_file = 'brg-proj-projects-map.axvw';

update afm.afm_ptasks
   set task_file = replace(task_file, 'ab-', 'brg-')
 where task_file like 'ab-proj-console-%'

insert into afm_ptasks(comments,display_order,help_link,hot_user_name,icon_large,icon_small,iframe_height,iframe_width,internal_use1,is_hotlist,security_group,task_01,task_02,task_03,task_action,task_ch,task_de,task_es,task_file,task_fr,task_it,task_jp,task_ko,task_nl,task_no,task_type,task_zh,view_type_override,activity_id,process_id,task_id,transfer_status) select
NULL,'1350',NULL,NULL,NULL,'ab-icon-task-console.gif','0','0','0','0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'brg-proj-work-requests.axvw',NULL,NULL,NULL,NULL,NULL,NULL,'WEB URL',NULL,'N/A','AbProjectManagement','UC-Monitor','View Projects Work Requests','NO CHANGE'
 where not exists (select 1 from afm_ptasks where activity_id = 'AbProjectManagement' and process_id = 'UC-Monitor' and task_id = 'View Projects Work Requests')
go
