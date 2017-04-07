

<view version="2.0">
	<dataSource id="ds_myAudit">
		<table name="wrcf" role="main" />
		<table name="wr" role="standard"/>
		
		<field table="wrcf" name="wr_id"/>
		<field table="wr" name="bl_id"/>
		<field table="wr" name="fl_id"/>
		<field table="wr" name="date_requested"/>
	</dataSource>


	<panel type="grid" id="nav_search" dataSource="ds_myAudit" showOnLoad="true" controlType="reportGrid">
		<sortField table="wr" name="wr_id" ascending="false"/>
		<title translatable="true">My Audits</title>
		
		<action id="refresh">
                    <title translatable="true">Refresh</title> 
                    <command type="showPanel" panelId="nav_search"/>
        </action>    
		
		<field table="wrcf" name="wr_id" controlType="link" >
			<title>WR</title>
		</field>
		<field table="wr" name="bl_id"/>
		<field table="wr" name="fl_id"/>
		<field table="wr" name="date_requested"/>
		
		
	</panel>
</view>
