<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle solution explorer XML data -->
<!-- javascript variables or functions used here are in common.js  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
    <xsl:variable name="down" translatable="true">Down</xsl:variable>
    <xsl:variable name="up" translatable="true">Up</xsl:variable>

	<xsl:output method="html" indent="no" />
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-solution-explorer.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="sol_body" onload="preparingLoad();">
	
		<!-- overwrite javascript variable values -->
		<script language="javascript">
			strSchemaPath='<xsl:value-of select="$schemaPath"/>';
			abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
		</script>
		<xsl:variable name="view_title" select="/*/title"/>
		<!-- PARENT TITLE -->
		<xsl:for-each select="/*/afmTableGroup[@type='navigator']">
			<xsl:call-template name="top-title">
				<xsl:with-param name="afmTableGroupNodes" select="."/>
				<xsl:with-param name="parentNode" select="//afmXmlView"/>
				<xsl:with-param name="index" select="position()"/>
				<xsl:with-param name="view_title" select="$view_title"/>
			</xsl:call-template>
		</xsl:for-each>

		<!-- GREETING -->
		<xsl:variable name="em_em_id" select="/*/preferences/@em_em_id"/>
		<xsl:variable name="em_honorific" select="/*/preferences/@em_honorific"/>
		<xsl:variable name="em_image_file" select="/*/preferences/@em_image_file"/>
		<div id="employee_info_area" name="employee_info_area" style="white-space: nowrap">
			<xsl:choose>
				<xsl:when test="$em_image_file!=''">
					<img border="0" ALT="{$em_em_id}" title="{$em_em_id}" src="{$projectGraphicsFolder}/{$em_image_file}"/>
				</xsl:when>
				<xsl:otherwise><xsl:value-of select="$whiteSpace"/></xsl:otherwise>
			</xsl:choose>
			<span>
				<xsl:value-of select="//message[@name='hello']"/><xsl:value-of select="$whiteSpace"/>
				<xsl:if test="$em_em_id!=''">
					<xsl:value-of select="$em_honorific"/><xsl:value-of select="$whiteSpace"/><xsl:value-of select="$em_em_id"/>,<xsl:value-of select="$whiteSpace"/>
				</xsl:if>
				<xsl:value-of select="//message[@name='hello_message']"/>
			</span>
		</div>

		<!-- going through each afmTableGroup -->
		<xsl:for-each select="/*/afmTableGroup[@type='navigator']">
			<xsl:call-template name="table-model">
				<xsl:with-param name="afmTableGroupNodes" select="."/>
				<xsl:with-param name="parentNode" select="//afmXmlView"/>
				<xsl:with-param name="index" select="position()"/>
				<xsl:with-param name="nodeID" select="generate-id()"/>
			</xsl:call-template>
		</xsl:for-each>
		<!-- return to parents afmActions -->
		<xsl:if test="count(/*/afmTableGroup[@type='navigator']/afmTableGroup) &gt; 0">
			<script language="javascript">
				var obj_employee_info_area=document.getElementById("employee_info_area");
				if(obj_employee_info_area!=null)
					obj_employee_info_area.style.display="none";
			</script>
			<xsl:for-each select="/*/afmTableGroup">
				<xsl:call-template name="parents">
					<xsl:with-param name="afmTableGroupNodes" select="."/>
					<xsl:with-param name="parentNode" select="//afmXmlView"/>
					<xsl:with-param name="index" select="position()"/>
					<xsl:with-param name="view_title" select="$view_title"/>
				</xsl:call-template>
			</xsl:for-each>
		</xsl:if>
		<!-- calling common.xsl -->
		<xsl:call-template name="common">
			<xsl:with-param name="title" select="/*/title"/>
			<xsl:with-param name="debug" select="//@debug"/>
			<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
			<xsl:with-param name="xml" select="$xml"/>
		</xsl:call-template>

		</body>
		</html>
	</xsl:template>

	<!-- xsl template: top-title -->
	<xsl:template name="top-title">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="parentNode"/>
		<xsl:param name="index"/>
		<xsl:param name="view_title"/>
		<xsl:choose>
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup) &gt; 0">
				<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
					<xsl:call-template name="top-title">
						<xsl:with-param name="afmTableGroupNodes" select="."/>
						<xsl:with-param name="parentNode" select="$afmTableGroupNodes"/>
						<xsl:with-param name="index" select="position()"/>
						<xsl:with-param name="view_title" select="$view_title"/>
					</xsl:call-template>
				</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="($index=1 and $afmTableGroupNodes/title!='')">
					<div class="sol_parents_title"><xsl:value-of select="$view_title"/> - <xsl:value-of select="$afmTableGroupNodes/title"/></div>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>


	<!-- xsl template: table-model -->
	<xsl:template name="table-model">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="parentNode"/>
		<xsl:param name="index"/>
		<xsl:param name="nodeID"/>
		<xsl:choose>
			<!-- there are subnodes under currently-processing node-->
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup) &gt; 0">
				<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
				<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
					<xsl:call-template name="table-model">
						<xsl:with-param name="afmTableGroupNodes" select="."/>
						<xsl:with-param name="parentNode" select="$afmTableGroupNodes"/>
						<xsl:with-param name="index" select="position()"/>
						<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
					</xsl:call-template>
				</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<!-- leaf node with url link to the view -->
				<xsl:if test="$index=1">
					<xsl:variable name="table" select="$afmTableGroupNodes/dataSource/database/tables/table[@role='main']"/>
					<xsl:variable name="hotlist" select="$afmTableGroupNodes/dataSource/data/fields//field[@role='hotlist']"/>
					<xsl:choose>
						<xsl:when test="count($hotlist) &gt; 0">
							<xsl:for-each select="$parentNode/afmTableGroup">
								<xsl:call-template name="task-detail">
									<xsl:with-param name="afmTableGroupPath" select="."/>
									<xsl:with-param name="nodeID" select="concat(position(),'_',generate-id())"/>
								</xsl:call-template>
							</xsl:for-each>
                            <xsl:variable name="hasAnyHotlistRecord" select="$afmTableGroupNodes/dataSource/data/records/record[@hotlist=1]"/>
							<xsl:if test="$afmTableGroupNodes/title!='' and count($hasAnyHotlistRecord) &gt; 0">
								<div class="hotlist_title"><xsl:text>HotList:</xsl:text></div>
							</xsl:if>
							<xsl:for-each select="$parentNode/afmTableGroup">
									<xsl:call-template name="task-detail-hotlist">
										<xsl:with-param name="afmTableGroupPath" select="."/>
										<xsl:with-param name="nodeID" select="concat(position(),'_',generate-id())"/>
									</xsl:call-template>
							</xsl:for-each>
						</xsl:when>
						<xsl:otherwise>
							<script language="javascript">
								resizingNavigatorFrame(100);
								var obj_employee_info_area=document.getElementById("employee_info_area");
								if(obj_employee_info_area!=null)
									obj_employee_info_area.style.display="";
							</script>

							<xsl:if test="count($parentNode/afmTableGroup/dataSource/data/records/record) &gt; 0">
								<!-- CONTAINER TABLE -->
								<table class="table-model" cellspacing="4">
									<!-- total number of fields except for memo fields -->
									<xsl:variable name="iTotalNormalFields">
										<xsl:for-each select="$parentNode/afmTableGroup">
											<xsl:if test="position()=last()">
												<xsl:value-of select="last()"/>
											</xsl:if>
										</xsl:for-each>
									</xsl:variable>
									<!-- divide all normal fields into two columns -->
									<xsl:variable name="iDividedNumber">
										<xsl:choose>
											<xsl:when test="($iTotalNormalFields mod 2)=0">
												<xsl:value-of select="($iTotalNormalFields div 2)"/>
											</xsl:when>
											<xsl:otherwise>
												<xsl:value-of select="ceiling($iTotalNormalFields div 2)"/>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:variable>

									<xsl:for-each select="$parentNode/afmTableGroup">
										<xsl:variable name="index" select="position()"/>
										<xsl:if test="$index &lt;= $iDividedNumber">
											<tr><td><xsl:call-template name="table-cell">
														<xsl:with-param name="afmTableGroupPath" select="."/>
														<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
													</xsl:call-template>
												</td>
												<xsl:choose>
													<xsl:when test="$index &lt; last()">
														<!-- there is a field left for sencod column-->
														<xsl:for-each select="$parentNode/afmTableGroup[position()=($index+$iDividedNumber)]">
															<td><xsl:call-template name="table-cell">
																	<xsl:with-param name="afmTableGroupPath" select="."/>
																	<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
																</xsl:call-template>
															</td>
														</xsl:for-each>
													</xsl:when>
													<xsl:otherwise>
														<!-- there is no field left for second column-->
														<td><br /></td>
													</xsl:otherwise>
												</xsl:choose>
											</tr>
										</xsl:if>
									</xsl:for-each>
								</table>
                        	</xsl:if>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: table-cell -->
	<xsl:template name="table-cell">
		<xsl:param name="afmTableGroupPath"/>
		<xsl:param name="nodeID"/>

		<xsl:variable name="title_role" select="$afmTableGroupPath/dataSource/data/fields//field[@role='title']"/>
		<xsl:variable name="icon_large" select="$afmTableGroupPath/dataSource/data/fields//field[@role='icon']"/>
		<xsl:variable name="icon_small" select="$afmTableGroupPath/dataSource/data/fields//field[@role='icon_small']"/>
		<xsl:variable name="summary_role" select="$afmTableGroupPath/dataSource/data/fields//field[@role='summary']"/>
		<xsl:variable name="hotlist" select="$afmTableGroupPath/dataSource/data/fields//field[@role='hotlist']"/>
		<xsl:variable name="leafNodeIMGID" select="concat('IMG','_',$nodeID)"/>

		<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
			<xsl:variable name="title">
				<xsl:choose>
					<xsl:when test="count($title_role) &gt; 0">
						<xsl:for-each select="@*">
							<xsl:variable name="index" select="position()"/>
							<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
							<xsl:if test="$field/@role='title'">
								<xsl:value-of select="."/>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="@*[position()=1]"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="icon_small_value">
				<xsl:if test="count($icon_small) &gt; 0">
					<xsl:for-each select="@*">
						<xsl:variable name="index" select="position()"/>
						<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
						<xsl:if test="$field/@role='icon_small'"><xsl:value-of select="."/></xsl:if>
					</xsl:for-each>
				</xsl:if>
			</xsl:variable>
			<xsl:variable name="icon_small_link">
				<xsl:choose>
					<xsl:when test="contains($icon_small_value,'.gif') or contains($icon_small_value,'.GIF') or contains($icon_small_value,'.Gif')">
						<xsl:value-of select="concat($abSchemaSystemGraphicsFolder,'/',$icon_small_value)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="concat($abSchemaSystemGraphicsFolder,'/','ab-icon-tree-task.gif')"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<div class="table-cell">
			    <!-- GRAPHIC -->
			    <xsl:variable name="graphics-src">
				<xsl:if test="count($icon_large) &gt; 0">
					<xsl:for-each select="@*">
						<xsl:variable name="index" select="position()"/>
						<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
						<xsl:if test="$field/@role='icon'">
							<xsl:value-of select="."/>
						</xsl:if>
					</xsl:for-each>
				</xsl:if>
			    </xsl:variable>
		    	<img class="table-cell-graphic" alt="{$title}" src="{$abSchemaSystemGraphicsFolder}/{$graphics-src}"
			    	 onError="this.src='{$abSchemaSystemGraphicsFolder}/ab-navsol-blank.gif'" />

				<div class="table-cell-info">
				    <!-- TITLE -->
				    <div class="nodetitle"><xsl:value-of select="$title"/></div>
	
				    <!-- SUMMARY -->
					<xsl:variable name="summary">
						<xsl:if test="count($summary_role) &gt; 0">
							<xsl:for-each select="@*">
								<xsl:variable name="index" select="position()"/>
								<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
								<xsl:if test="$field/@role='summary'">
									<xsl:value-of select="."/>
								</xsl:if>
							</xsl:for-each>
						</xsl:if>
					</xsl:variable>
					<div class="nodesummary"><xsl:value-of select="$summary"/></div>
	
					<!-- HELP --> 
					<xsl:variable name="help-afmAction" select="afmAction[@role='help']"/>
					<xsl:variable name="help_target">
						<xsl:choose>
							<xsl:when test="@newWindow='true'">_blank</xsl:when>
							<xsl:otherwise><xsl:value-of select="@frame"/></xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<div>
						<img src="{$abSchemaSystemGraphicsFolder}/ab-icon-navsol-help.gif" onclick='openNewContent("{$help-afmAction/@request}", "{$help_target}")' border="0" />
						<a href="#" onclick='openNewContent("{$help-afmAction/@request}", "{$help_target}")'>
							<span translatable="true">Read more...</span></a>
					</div>
	
					<!-- ACTIONS --> 
					<xsl:variable name="afmAction" select="afmAction[@role='url']"/>
					<div>
					<xsl:choose>
						<xsl:when test="count($hotlist) &gt; 0">
							<img id="{$leafNodeIMGID}" name="{$leafNodeIMGID}" src="{$icon_small_link}"
								 onclick='ChangeItToActiveItem("{$leafNodeIMGID}", "", "{$afmAction/@serialized}", "{$afmAction/@frame}");return false;' border="0" />
							<a href="#" onclick='ChangeItToActiveItem("{$leafNodeIMGID}", "", "{$afmAction/@serialized}", "{$afmAction/@frame}");return false;'>
								<xsl:value-of select="$afmAction/title"/></a>
						</xsl:when>
						<xsl:otherwise>
							<img alt="{$down}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-navsol-level-down.gif"
								 onclick='sendingDataFromHiddenForm("", "{$afmAction/@serialized}", "{$afmAction/@frame}", "", false,""); return false;' border="0" />
							<a class="nodeactionlink" href="#" onclick='sendingDataFromHiddenForm("", "{$afmAction/@serialized}", "{$afmAction/@frame}", "", false,""); return false;'>
								<xsl:value-of select="$afmAction/title"/></a>
						</xsl:otherwise>
					</xsl:choose>
					</div>
				</div>
			</div>
		</xsl:for-each>
	</xsl:template>

	<!-- xsl template: parents -->
	<xsl:template name="parents">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="parentNode"/>
		<xsl:param name="index"/>
		<xsl:param name="view_title"/>
		<xsl:choose>
			<!-- there are subnodes under currently-processing node-->
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup) &gt; 0">
				<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
				<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
					<xsl:call-template name="parents">
						<xsl:with-param name="afmTableGroupNodes" select="."/>
						<xsl:with-param name="parentNode" select="$afmTableGroupNodes"/>
						<xsl:with-param name="index" select="position()"/>
						<xsl:with-param name="view_title" select="$view_title"/>
					</xsl:call-template>
				</xsl:for-each>

			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$index=1">
					<xsl:call-template name="parent-detail">
						<xsl:with-param name="afmTableGroupPath" select="$parentNode"/>
						<xsl:with-param name="view_title" select="$view_title"/>
					</xsl:call-template>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: parent-detail -->
	<xsl:template name="parent-detail">
		<xsl:param name="afmTableGroupPath"/>
		<xsl:param name="view_title"/>
		<xsl:variable name="UpAfmAction" select="$afmTableGroupPath/afmAction[@role='showParent']"/>

		<!-- PARENT RETURN LINKS -->
		<xsl:choose>
		<xsl:when test="count($UpAfmAction) &gt; 0">
			<div class="parent-detail" title="{$UpAfmAction/title}"
				 onclick='sendingDataFromHiddenForm("","{$UpAfmAction/@serialized}","{$UpAfmAction/@frame}","",false,"");return false;'>
				<img alt="{$up}" src="{$abSchemaSystemGraphicsFolder}/ab-pnav-uparrow.gif" style="margin-right: 12px" />
				<span class="parent-detail_title" style="margin-right: 3px" translatable="true">Return to</span>
				<span class="parent-detail_title"><xsl:value-of select="$UpAfmAction/title"/></span>
			</div>
		</xsl:when>
		<xsl:otherwise>
			<!-- return to products -->
			<xsl:variable name="productAction" select="/*/afmTableGroup/afmAction[@role='showParent']"/>
			<xsl:if test="count($productAction) &gt; 0">
			<div class="parent-detail" title="{$productAction/title}"
				 onclick='sendingDataFromHiddenForm("","{$productAction/@serialized}","{$productAction/@frame}","",false,"");return false;'>
				<img alt="{$up}" src="{$abSchemaSystemGraphicsFolder}/ab-pnav-uparrow.gif" style="margin-right: 12px" />
				<span class="parent-detail_title" style="margin-right: 3px" translatable="true">Return to</span>
				<span class="parent-detail_title"><xsl:value-of select="$productAction/title"/></span>
			</div>
			</xsl:if>
		</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: task-detail -->
	<xsl:template name="task-detail">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="nodeID"/>
		<xsl:variable name="title" select="$afmTableGroupPath/dataSource/data/fields/field[@role='title']"/>
		<xsl:variable name="hotlist" select="$afmTableGroupPath/dataSource/data/fields/field[@role='hotlist']"/>
		<!-- filter out activity_cat_id when its record value = NONE -->
		<xsl:variable name="ID" select="$afmTableGroupPath/dataSource/data/fields/field[@role='ID']"/>
		<xsl:variable name="icon_small" select="$afmTableGroupPath/dataSource/data/fields/field[@role='icon_small']"/>
		<!-- TASKS -->
		<table class="sol_tasks" cellpadding="0" cellspacing="0">
			<!-- field order must be matched with record order -->
			<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
				<xsl:variable name="urlLinkFile" select="@url"/>
				<xsl:variable name="urlLinkFile_length" select="string-length($urlLinkFile)"/>
				<xsl:variable name="urlLinkFile_lowercase" select="translate($urlLinkFile, 'AXVW' ,'axvw')"/>
				<xsl:variable name="containAXVW" select="contains($urlLinkFile_lowercase, '.axvw')"/>
				<xsl:variable name="urlLinkFile_afteraxvw" select="substring-after($urlLinkFile_lowercase, '.axvw')"/>
				<xsl:variable name="urlLinkFile_afteraxvw_length" select="string-length($urlLinkFile_afteraxvw)"/>
				<xsl:variable name="isAXVW">
					<xsl:choose>
						<xsl:when test="$urlLinkFile_length=0"><xsl:value-of select="true()"/></xsl:when>
						<xsl:otherwise><xsl:value-of select="$containAXVW and $urlLinkFile_afteraxvw_length=0"/></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="IDRecordValue">
					<xsl:if test="count($ID) &gt; 0">
						<xsl:for-each select="@*">
							<xsl:variable name="index" select="position()"/>
							<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
							<xsl:if test="$field/@role='ID'"><xsl:value-of select="."/></xsl:if>
						</xsl:for-each>
					</xsl:if>
				</xsl:variable>
				<xsl:variable name="icon_small_value">
					<xsl:if test="count($icon_small) &gt; 0">
						<xsl:for-each select="@*">
							<xsl:variable name="index" select="position()"/>
							<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
							<xsl:if test="$field/@role='icon_small'"><xsl:value-of select="."/></xsl:if>
						</xsl:for-each>
					</xsl:if>
				</xsl:variable>
				<xsl:variable name="icon_small_link">
					<xsl:choose>
						<!-- defined in DB -->
						<!-- ???????????  icon_small empty value in record ?????????? -->
						<xsl:when test="contains($icon_small_value,'.gif') or contains($icon_small_value,'.GIF') or contains($icon_small_value,'.Gif')"><xsl:value-of select="concat($abSchemaSystemGraphicsFolder,'/',$icon_small_value)"/></xsl:when>
						<!-- default: defined in axvw -->
						<xsl:otherwise><xsl:value-of select="$afmTableGroupPath/icon/@request"/></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
	
				<xsl:variable name="hotlistField">
					<xsl:choose>
						<xsl:when test="count($hotlist) &gt; 0">
							<xsl:for-each select="@*">
								<xsl:variable name="index" select="position()"/>
								<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
								<xsl:if test="$field/@role='hotlist'"><xsl:value-of select="."/></xsl:if>
							</xsl:for-each>
						</xsl:when>
						<xsl:otherwise>0</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<!-- filter out all hotlist items -->
				<xsl:if test="$hotlistField=0">
					<script language="javascript">
						resizingNavigatorFrame(25);
						var obj_employee_info_area=document.getElementById("employee_info_area");
						if(obj_employee_info_area!=null)
						obj_employee_info_area.style.display="none";
					</script>
					<xsl:variable name="afmAction" select="afmAction[@role='url']"/>
					<xsl:variable name="ID" select="concat($nodeID,'_',position())"/>
					<tr><xsl:choose>
							<xsl:when test="count($hotlist) &gt; 0">
								<xsl:if test="$isAXVW='true'">
									<td class="leafnodes"
										onclick='ChangeItToActiveItem("IMG_{$ID}","","{$afmAction/@serialized}","{$afmAction/@frame}"); return false;'
										onMouseover= "this.className='leafnodes_over'"
										onMouseout = "this.className='leafnodes'">
										<img  alt="IMG_{$ID}" class="leafnodes_img" src="{$icon_small_link}" border="0" id="IMG_{$ID}" />
										<div class="leafnodes_text"><xsl:value-of select="$afmAction/title"/></div>
									</td>
								</xsl:if>
								<xsl:if test="$isAXVW='false'">
									<td class="leafnodes">
										<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("IMG_{$ID}","","","{$afmAction/@frame}"); return true;'>
											<IMG  ALT="IMG_{$ID}" class="leafnodes_img" SRC="{$icon_small_link}" BORDER="0" ID="IMG_{$ID}" /></a>
										<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("IMG_{$ID}","","","{$afmAction/@frame}"); return true;'>
											<div class="leafnodes_text"><xsl:value-of select="$afmAction/title"/></div></a>
									</td>
								</xsl:if>
							</xsl:when>
							<xsl:otherwise>
								<xsl:if test="$isAXVW='true'">
									<td class="leafnodes"
										onclick='ChangeItToActiveItem("","","{$afmAction/@serialized}","{$afmAction/@frame}"); return false;'
										onMouseover= "this.className='leafnodes_over'"
										onMouseout = "this.className='leafnodes'">
										<img alt="IMG_{$ID}" class="leafnodes_img" src="{$icon_small_link}" border="0" id="IMG_{$ID}" />
										<div class="leafnodes_text"><xsl:value-of select="$afmAction/title"/></div>
									</td>
								</xsl:if>
								<xsl:if test="$isAXVW='false'">
									<td class="leafnodes">
										<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("","","","{$afmAction/@frame}"); return true;'>
											<IMG alt="IMG_{$ID}" class="leafnodes_img" SRC="{$icon_small_link}" BORDER="0" ID="IMG_{$ID}" /></a>
										<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("","","","{$afmAction/@frame}"); return true;'>
											<div class="leafnodes_text"><xsl:value-of select="$afmAction/title"/></div></a>
									</td>
								</xsl:if>
							</xsl:otherwise>
						</xsl:choose>
					</tr>
				</xsl:if>
			</xsl:for-each>
		</table>
	</xsl:template>

		<!-- xsl template: task-detail-hotlist -->
	<xsl:template name="task-detail-hotlist">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="nodeID"/>
		<xsl:variable name="title" select="$afmTableGroupPath/dataSource/data/fields/field[@role='title']"/>
		<xsl:variable name="hotlist" select="$afmTableGroupPath/dataSource/data/fields/field[@role='hotlist']"/>
		<!-- field order must be matched with record order -->
		<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
			<xsl:variable name="urlLinkFile" select="@url"/>
			<xsl:variable name="urlLinkFile_length" select="string-length($urlLinkFile)"/>
			<xsl:variable name="urlLinkFile_lowercase" select="translate($urlLinkFile, 'AXVW' ,'axvw')"/>
			<xsl:variable name="containAXVW" select="contains($urlLinkFile_lowercase, '.axvw')"/>
			<xsl:variable name="urlLinkFile_afteraxvw" select="substring-after($urlLinkFile_lowercase, '.axvw')"/>
			<xsl:variable name="urlLinkFile_afteraxvw_length" select="string-length($urlLinkFile_afteraxvw)"/>
			<xsl:variable name="isAXVW">
				<xsl:choose>
					<xsl:when test="$urlLinkFile_length=0"><xsl:value-of select="true()"/></xsl:when>
					<xsl:otherwise><xsl:value-of select="$containAXVW and $urlLinkFile_afteraxvw_length=0"/></xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="hotlistField">
				<xsl:choose>
					<xsl:when test="count($hotlist) &gt; 0">
						<xsl:for-each select="@*">
							<xsl:variable name="index" select="position()"/>
							<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
							<xsl:if test="$field/@role='hotlist'"><xsl:value-of select="."/></xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>0</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:if test="$hotlistField=1">
				<!-- ????xml structure????? -->
				<tr><td align="left">s103
					<script language="javascript">
						resizingNavigatorFrame(25);
						var obj_employee_info_area=document.getElementById("employee_info_area");
						if(obj_employee_info_area!=null)
							obj_employee_info_area.style.display="none";
					</script>
					<table style='margin-left:10pt;'>
						<xsl:variable name="afmAction" select="afmAction[@role='url']"/>
						<tr>
							<xsl:variable name="ID" select="concat($nodeID,'_',position())"/>
							<td>s104
								<IMG alt="IMG_{$ID}" SRC="{$afmTableGroupPath/icon/@request}" BORDER="0" ID="IMG_{$ID}" />
							</td>

							<td  class="explorer_leafNodeTitles">s105
								<xsl:if test="$isAXVW='true'">
									<a href="#" onclick='ChangeItToActiveItem("IMG_{$ID}","","{$afmAction/@serialized}","{$afmAction/@frame}");return false;'>
										<xsl:value-of select="$afmAction/title"/>
									</a>
								</xsl:if>
								<xsl:if test="$isAXVW='false'">
									<a href="{$urlLinkFile}"  target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("IMG_{$ID}","","","{$afmAction/@frame}");return true;'>
										<xsl:value-of select="$afmAction/title"/>
									</a>
								</xsl:if>

							</td>
						</tr>
					</table>
				</td></tr>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
</xsl:stylesheet>


