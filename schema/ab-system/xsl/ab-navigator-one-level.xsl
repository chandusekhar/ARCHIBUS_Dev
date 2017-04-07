<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle Navigator XML data with one level???-->
<!-- javascript variables or functions used here are in common.js and navigator.js -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="up" translatable="true">Up</xsl:variable>	
	<xsl:variable name="help" translatable="true">Help</xsl:variable>	
	<xsl:variable name="small_icon" translatable="true">Small Icon</xsl:variable>	
	<xsl:output method="html" indent="no" />
	<xsl:variable name="HelpFolder" select="//preferences/@abSchemaSystemHelpFolder"/>
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
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-navigator-one-level.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="nav_body" onload='overwrittingJSVariables("{$abSchemaSystemGraphicsFolder}")'>
			<xsl:variable name="title" select="/*/afmTableGroup/title"/>
			<div class="nav_wrapper">
				<table cellpadding="0" cellspacing="0" width="100%">
					<!-- going through each afmTableGroup -->
					<!-- parents -->
					<xsl:if test="count(/*/afmTableGroup/afmTableGroup) &gt; 0">
						<tr><td>
							<table cellpadding="0" cellspacing="0" width="100%">
								<xsl:for-each select="/*/afmTableGroup">
									<xsl:call-template name="parents">
										<xsl:with-param name="afmTableGroupNodes" select="."/>
										<xsl:with-param name="margin-left" select="0"/>
										<xsl:with-param name="hasChildren" select="'false'"/>
										<xsl:with-param name="nodeID" select="generate-id()"/>
										<xsl:with-param name="parentNode" select="//afmXmlView"/>
										<xsl:with-param name="index" select="position()"/>
									</xsl:call-template>
								</xsl:for-each>
							</table>
							</td>
						</tr>
					</xsl:if>
					<!-- leaf-nodes: tasks -->
					<xsl:for-each select="/*/afmTableGroup">
						<xsl:call-template name="tasks">
							<xsl:with-param name="afmTableGroupNodes" select="."/>
							<xsl:with-param name="margin-left" select="0"/>
							<xsl:with-param name="hasChildren" select="'false'"/>
							<xsl:with-param name="nodeID" select="generate-id()"/>
							<xsl:with-param name="parentNode" select="//afmXmlView"/>
							<xsl:with-param name="index" select="position()"/>
						</xsl:call-template>
					</xsl:for-each>
					<!-- XML structure: each record divided to table group?? after its change, xslt could be much simple -->
					<!-- host lists -->
					<xsl:for-each select="/*/afmTableGroup">
						<xsl:call-template name="tasks-hotlist">
							<xsl:with-param name="afmTableGroupNodes" select="."/>
							<xsl:with-param name="margin-left" select="0"/>
							<xsl:with-param name="hasChildren" select="'false'"/>
							<xsl:with-param name="nodeID" select="generate-id()"/>
							<xsl:with-param name="parentNode" select="//afmXmlView"/>
							<xsl:with-param name="index" select="0"/>
						</xsl:call-template>
					</xsl:for-each>
				</table>
			</div>
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


	<!-- xsl template: parents -->
	<xsl:template name="parents">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="hasChildren"/>
		<xsl:param name="nodeID"/>
		<xsl:param name="parentNode"/>
		<xsl:param name="index"/>

		<!-- there are subnodes under currently-processing node-->
		<xsl:if test="count($afmTableGroupNodes/afmTableGroup) &gt; 0">
			<!-- which is parent node with UP action button -->
			<xsl:call-template name="parent-detail">
				<xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
				<xsl:with-param name="parentNode" select="$parentNode"/>
				<xsl:with-param name="nodeID" select="$nodeID"/>
			</xsl:call-template>

			<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
			<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
				<xsl:call-template name="parents">
					<xsl:with-param name="afmTableGroupNodes" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="hasChildren" select="'false'"/>
					<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
					<xsl:with-param name="parentNode" select="$afmTableGroupNodes"/>
					<xsl:with-param name="index" select="position()"/>
				</xsl:call-template>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>

	<!-- xsl template: tasks -->
	<xsl:template name="tasks">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="hasChildren"/>
		<xsl:param name="nodeID"/>
		<xsl:param name="parentNode"/>
		<xsl:param name="index"/>
		<xsl:choose>
			<!-- there are subnodes under currently-processing node-->
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup) &gt; 0">
				<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
				<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
					<xsl:call-template name="tasks">
						<xsl:with-param name="afmTableGroupNodes" select="."/>
						<xsl:with-param name="margin-left" select="$margin-left+1"/>
						<xsl:with-param name="hasChildren" select="'false'"/>
						<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
						<xsl:with-param name="parentNode" select="$afmTableGroupNodes"/>
						<xsl:with-param name="index" select="position()"/>
					</xsl:call-template>
				</xsl:for-each>

			</xsl:when>
			<xsl:otherwise>
				<!-- leaf node with url link to the view --> 
				<xsl:if test="$index=1">
					<!--xsl:variable name="ID" select="$afmTableGroupNodes/dataSource/data/fields//field[@role='ID']"/-->
					<xsl:if test="count($afmTableGroupNodes/title) &gt; 0 and $afmTableGroupNodes/title != 'Domains'">
						<tr><td class="nav_parents_title"><xsl:value-of select="$afmTableGroupNodes/title"/> :</td></tr>
						<!-- Padding above top of Task links -->
						<xsl:if test="$afmTableGroupNodes/title='Tasks'">
							<tr><td style="height: 4px"></td></tr>
						</xsl:if>
					</xsl:if>
					<tr><td>
						<table style="width: 100%" cellpadding="0" cellspacing="0">
							<xsl:for-each select="$parentNode/afmTableGroup">
								<tr><td>
									<!--xsl:variable name="hotlist" select="dataSource/data/fields//field[@role='hotlist']"/-->
									<xsl:call-template name="task-detail">
										<xsl:with-param name="afmTableGroupPath" select="."/>
										<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
										<xsl:with-param name="isHostlist" select="0"/>
									</xsl:call-template>
									</td>
								</tr>
							</xsl:for-each>
						</table>
						</td>
					</tr>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: tasks-hotlist -->
	<xsl:template name="tasks-hotlist">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="hasChildren"/>
		<xsl:param name="nodeID"/>
		<xsl:param name="parentNode"/>
		<xsl:param name="index"/>
		<xsl:choose>
			<!-- there are subnodes under currently-processing node-->
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup) &gt; 0">
				<xsl:call-template name="tasks-hotlist">
					<xsl:with-param name="afmTableGroupNodes" select="$afmTableGroupNodes/afmTableGroup"/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="hasChildren" select="'false'"/>
					<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
					<xsl:with-param name="parentNode" select="$afmTableGroupNodes"/>
					<xsl:with-param name="index" select="position()"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<!-- leaf node with url link to the view -->
				<xsl:for-each select="$parentNode/afmTableGroup[dataSource/data/fields/field[@role='hotlist'] and dataSource/data/records/record[@hotlist=1]]">
					<xsl:if test="position()=1">
						<tr><td>
							<table style="margin-top: 8px; margin-bottom: 2px" cellpadding="0" cellspacing="0">
								<tr><td><span class="leafgrouptitles" translatable="true">HotList:</span></td></tr>
							</table>
							</td>
						</tr>
					</xsl:if>
				</xsl:for-each>
				<tr><td>
					<table cellpadding="0" cellspacing="0">
						<xsl:for-each select="$parentNode/afmTableGroup[dataSource/data/fields/field[@role='hotlist'] and dataSource/data/records/record[@hotlist=1]]">
							<tr><td>
								<xsl:call-template name="task-detail-hotlist">
									<xsl:with-param name="afmTableGroupPath" select="."/>
									<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
								</xsl:call-template>
								</td>
							</tr>
						</xsl:for-each>
					</table>
				</td></tr>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: parent-detail -->
	<xsl:template name="parent-detail">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="parentNode"/>
	<xsl:param name="nodeID"/>
		<xsl:variable name="UpAfmAction" select="$afmTableGroupPath/afmAction[@role='showParent']"/>
		<xsl:variable name="title" select="$afmTableGroupPath/dataSource/data/fields/field[@role='title']"/>
		<xsl:variable name="ID_PK" select="$afmTableGroupPath/dataSource/data/fields/field[@role='ID']"/>
		<xsl:variable name="help_title"  translatable="true">Help</xsl:variable>
		<xsl:variable name="table" select="$afmTableGroupPath/dataSource/database/tables/table/@name"/>

		<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
			<xsl:variable name="afmAction" select="afmAction[@type='select']"/>

			<xsl:variable name="IDRecordValue">
				<xsl:if test="count($ID_PK) &gt; 0">
					<xsl:for-each select="@*">
						<xsl:variable name="index" select="position()"/>
						<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
						<xsl:if test="$field/@role='ID'"><xsl:value-of select="."/></xsl:if>
					</xsl:for-each>
				</xsl:if>
			</xsl:variable>

			<xsl:if test="not ($IDRecordValue='NONE') and count($UpAfmAction) &gt; 0">
				<tr><td class="selectedparents" 
						onMouseover= "this.className='selectedparents_over'"
						onMouseout = "this.className='selectedparents'">
						<table cellspacing="0" cellpadding="0">
						<tr><td onclick='sendingDataFromHiddenForm("","{$UpAfmAction/@serialized}","{$UpAfmAction/@frame}","",false,""); return false;'>
								<input type="image" title="{$up}" alt="{$up}" src="{$abSchemaSystemGraphicsFolder}/ab-pnav-uparrow.gif"/></td>
							<td class="selectedparents_text" onclick='sendingDataFromHiddenForm("","{$UpAfmAction/@serialized}","{$UpAfmAction/@frame}","",false,""); return false;'>
								<xsl:value-of select="afmAction/title"/></td>
							<xsl:if test="(count($afmTableGroupPath/dataSource/data/fields/field[@table='afm_processes']) &gt; 0) and (@afm_processes.help_link !='')">
							<td style="text-align: right">
								<xsl:variable name="HelpExtension" select="//preferences/userAccount/@helpExtension"/>
	                            <xsl:variable name="helpUrl" select="concat($HelpFolder, translate(@afm_processes.help_link, '\\', '/'))"/>
	                            <xsl:variable name="helpUrlLower" select="translate($helpUrl, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
	                            <input type="image" title="{$help}" alt="{$help}" src="{$afmTableGroupPath/icon/@help}" onclick='openNewContent("{$helpUrlLower}", "_blank"); return false' border="0"/>
	                        </td>
	                        </xsl:if>
                        </tr>
                        </table>
					</td>
				</tr>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>
	
	<!-- xsl template: task-detail -->
	<xsl:template name="task-detail">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="nodeID"/>
	<xsl:param name="isHostlist"/>
		<xsl:variable name="storedValueForHotlist">
			<xsl:choose>
				<xsl:when test="$isHostlist=1">1</xsl:when>
				<xsl:otherwise>0</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="title" select="$afmTableGroupPath/dataSource/data/fields/field[@role='title']"/>
		<xsl:variable name="hotlist" select="$afmTableGroupPath/dataSource/data/fields/field[@role='hotlist']"/>
		<!-- filter out activity_cat_id when its record value = NONE -->
		<xsl:variable name="ID" select="$afmTableGroupPath/dataSource/data/fields/field[@role='ID']"/>
		<xsl:variable name="icon_small" select="$afmTableGroupPath/dataSource/data/fields/field[@role='icon_small']"/>
		<xsl:variable name="task_type" select="$afmTableGroupPath/dataSource/data/fields/field[@role='type']"/>

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

			<xsl:variable name="TypeRecordValue">
				<xsl:if test="count($task_type) &gt; 0">
					<xsl:for-each select="@*">
						<xsl:variable name="index" select="position()"/>
						<xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
						<xsl:if test="$field/@role='type'"><xsl:value-of select="."/></xsl:if>
					</xsl:for-each>
				</xsl:if>
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
					<xsl:when test="contains($icon_small_value,'.gif') or contains($icon_small_value,'.GIF') or contains($icon_small_value,'.Gif')">
						<xsl:value-of select="concat($abSchemaSystemGraphicsFolder,'/',$icon_small_value)"/>
					</xsl:when>
					<!-- default: defined in axvw -->
					<xsl:otherwise>
						<xsl:choose>
							<xsl:when test="count($hotlist) &gt; 0">
								<xsl:text></xsl:text>
							</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="$afmTableGroupPath/icon/@request"/>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<!-- filter out all items when activity_cat_id's record value = NONE  -->
			<xsl:if test="not ($IDRecordValue='NONE')">
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
				<xsl:if test="$hotlistField=$storedValueForHotlist">
					<xsl:variable name="afmAction" select="afmAction[@role='url']"/>
					<!-- NODES -->
					<table class="nav_nodes" width="100%" cellpadding="0" cellspacing="0">
						<tr><xsl:variable name="ID_Node" select="concat($nodeID,'_',position())"/>
							<xsl:choose>
								<xsl:when test="not (starts-with($afmAction/title, '-'))">
									<xsl:choose>
										<xsl:when test="count($hotlist) &gt; 0">
											<!-- LEAF NODES -->
											<xsl:choose>
												<xsl:when test="$TypeRecordValue='LABEL'">
													<span class="leafgrouptitles"><xsl:value-of select="$afmAction/title"/>:</span>
												</xsl:when>
												<xsl:otherwise>
													<xsl:if test="$isAXVW='true'">
														<td class="leafnodes"
															onclick='ChangeItToActiveItem("IMG_{$ID_Node}","","{$afmAction/@serialized}","{$afmAction/@frame}");return false;'
															onMouseover= "this.className='leafnodes_over'"
															onMouseout = "this.className='leafnodes'">
															<input type="image" title="{$small_icon}" alt="{$small_icon}" class="leafnodes_img" src="{$icon_small_link}" border="0" id="IMG_{$ID_Node}" />
															<div class="leafnodes_text"><xsl:value-of select="$afmAction/title"/></div>
														</td>
													</xsl:if>
													<xsl:if test="$isAXVW='false'">
														<td class="leafnodes">
															<a href="{$urlLinkFile}"  target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("IMG_{$ID_Node}","","","{$afmAction/@frame}");return true;'>
																<img alt="{$small_icon}" class="leafnodes_img" SRC="{$icon_small_link}" BORDER="0" ID="IMG_{$ID_Node}" /></a>
															<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("IMG_{$ID_Node}","","","{$afmAction/@frame}");return true;'>
																<div class="leafnodes_text"><xsl:value-of select="$afmAction/title"/></div></a>
														</td>
													</xsl:if>
												</xsl:otherwise>
											</xsl:choose>
										</xsl:when>
										<xsl:otherwise>
											<!-- PARENT NODES -->
											<xsl:if test="$isAXVW='true'">
												<td class="parentnodes" 
													onMouseover= "this.className='parentnodes_over'"
													onMouseout = "this.className='parentnodes'">
													<table cellspacing="0" cellpadding="0">
													<tr><td onclick='ChangeItToActiveItem("","","{$afmAction/@serialized}","{$afmAction/@frame}"); return false;'>
															<input type="image" title="{$small_icon}" alt="{$small_icon}" src="{$icon_small_link}" border="0" id="IMG_{$ID_Node}" /></td>
														<td class="selectedparents_text" onclick='ChangeItToActiveItem("","","{$afmAction/@serialized}","{$afmAction/@frame}"); return false;'>
															<xsl:value-of select="$afmAction/title"/></td>
							                        </tr>
							                        </table>
												</td>
											</xsl:if>
											<xsl:if test="$isAXVW='false'">
												<td class="parentnodes"
													onMouseover="this.className = 'parentnodes_over'" 
													onMouseout= "this.className = 'parentnodes'">
													<a href="{$urlLinkFile}"  target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("","","","{$afmAction/@frame}");return true;'>
														<input type="image" title="{$small_icon}" alt="{$small_icon}" class="parentnodes_img" src="{$icon_small_link}" border="0" id="IMG_{$ID_Node}" /></a>
													<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("","","","{$afmAction/@frame}");return true;'>
														<xsl:value-of select="$afmAction/title"/></a>
												</td>
											</xsl:if>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:when>
								<xsl:otherwise><br /></xsl:otherwise>
							</xsl:choose>
						</tr>
					</table>
				</xsl:if>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>

	<!-- xsl template: task-detail-hotlist -->
	<xsl:template name="task-detail-hotlist">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="nodeID"/>
		<xsl:variable name="title" select="$afmTableGroupPath/dataSource/data/fields/field[@role='title']"/>
		<xsl:variable name="hotlist" select="$afmTableGroupPath/dataSource/data/fields/field[@role='hotlist']"/>
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
				<table cellpadding="0" cellspacing="0" style='margin-left: 5px;'>
					<xsl:variable name="afmAction" select="afmAction[@role='url']"/>
					<tr><xsl:variable name="ID_Node" select="concat($nodeID,'_',position())"/>
						<td>
							<input type="image" title="IMG_{$ID_Node}" alt="IMG_{$ID_Node}" style="margin-right: 4px" src="{$afmTableGroupPath/icon/@request}" border="0" id="IMG_{$ID_Node}" />
						</td>
						<td class="nav_leafNodeTitles">
							<xsl:if test="$isAXVW='true'">
								<a href="#" onclick='ChangeItToActiveItem("IMG_{$ID_Node}","","{$afmAction/@serialized}","{$afmAction/@frame}");return false;'>
									<xsl:value-of select="$afmAction/title"/>
								</a>
							</xsl:if>
							<xsl:if test="$isAXVW='false'">
								<a href="{$urlLinkFile}" target="{$afmAction/@frame}" onclick='ChangeItToActiveItem("IMG_{$ID_Node}","","","{$afmAction/@frame}");return true;'>
									<xsl:value-of select="$afmAction/title"/>
								</a>
							</xsl:if>
						</td>
					</tr>
				</table>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
</xsl:stylesheet>


