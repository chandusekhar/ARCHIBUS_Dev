<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->

	<xsl:output method="html" indent="no" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-navigator-all-levels.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-dp.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" onload="onPageLoad()" onselectstart="return false" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:variable name="executeTransaction" select="/*/afmTableGroup[@name='transaction_form']/afmAction[@type='executeTransaction']/@serialized"/>
			<xsl:variable name="em_message" select="//message[@name='em']"/>
			<xsl:variable name="dp_message" select="//message[@name='dp']"/>
			<xsl:variable name="dv_message" select="//message[@name='dv']"/>
			<xsl:variable name="message_message" select="//message[@name='message']"/>
			<!-- overwrite javascript variable values -->
			<script language="javascript">
				abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
				strExecuteTransaction='<xsl:value-of select="$executeTransaction"/>';
				em_message='<xsl:value-of select="$em_message"/>';
				dp_message='<xsl:value-of select="$dp_message"/>';
				dv_message='<xsl:value-of select="$dv_message"/>';
				message_message='<xsl:value-of select="$message_message"/>';
			</script>

			<table  align="left" valign="top">
				<tr valign="top">
					<td valign="top">
						<!-- assgined rm: dv and dp as parent: tree -->
						<xsl:call-template name="assigned">
							<xsl:with-param name="afmTableGroupNodes" select="/*/afmTableGroup[@name='assigned']"/>
							<xsl:with-param name="isTreeExpanded" select="/*/afmXmlView/@isTreeExpanded"/>
						</xsl:call-template>
					</td>
				</tr>
			</table>

			<!-- calling common.xsl -->
			<!--xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template-->
			<script language="javascript">
				top.document.title="<xsl:value-of select='/*/title'/>";

				<xsl:if test="$afmInputsForm != ''">
					afmInputsFormName='<xsl:value-of select="$afmInputsForm"/>';
				</xsl:if>
			</script>
			<!-- a hidden form to send a xml string to server for processing -->

			<form method="get" name="{$afmHiddenForm}" style="margin:0">
				<input type="hidden" name="{$xml}" value=""/>
			</form>

		</body>
		</html>
	</xsl:template>
	<xsl:template name="assigned">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="isTreeExpanded"/>
		<!-- going through each afmTableGroup with assigned rm -->
		<xsl:if test="count($afmTableGroupNodes/dataSource/data/records/record) &gt; 0">
			<xsl:for-each select="$afmTableGroupNodes">
				<xsl:variable name="temp_node_id" select="concat(dataSource/data/records/record/@dp.dp_id,'_',dataSource/data/records/record/@dp.dv_id)"/>
				<xsl:variable name="temp_node_id1" select="translate($temp_node_id,' ','_')"/>
				<xsl:variable name="temp_node_id2" select="translate($temp_node_id1,'-','_')"/>
				<xsl:variable name="temp_node_id3" select="translate($temp_node_id2,'/','_')"/>
				<xsl:variable name="temp_node_id4" select="translate($temp_node_id3,'.','_')"/>
				<xsl:call-template name="tree-model">
					<xsl:with-param name="afmTableGroupNodes" select="."/>
					<xsl:with-param name="margin-left" select="1"/>
					<xsl:with-param name="hasChildren" select="'false'"/>
					<xsl:with-param name="nodeID" select="concat($temp_node_id4,'_',position())"/>
				</xsl:call-template>
			</xsl:for-each>
			<!-- if tree view has attr isTreeExpanded='false' or hasn't such attr -->
			<!-- the tree will not dafultly be expanded -->
			<xsl:variable name="temp_isTreeExpanded">
				<xsl:choose>
					<xsl:when test="@isTreeExpanded"><xsl:value-of select="@isTreeExpanded"/></xsl:when>
					<xsl:otherwise>false</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:if test="$temp_isTreeExpanded='false'">
				<script language="javascript">
					ShrinkAllParentNodes();
					if(window.parent.ab_ex_em_open_node_id){
						var temp_parentNodeObj=document.getElementById(window.parent.ab_ex_em_open_node_id);
						var temp_imgObj=document.getElementById("IMG_1_"+window.parent.ab_ex_em_open_node_id);
						if(temp_parentNodeObj!=null)
							temp_parentNodeObj.style.display="";
						if(temp_imgObj!=null)
							temp_imgObj.src=abSchemaSystemGraphicsFolder + "/ab-icon-tree-exp.gif";
						var temp_em_node_obj =document.getElementById(window.parent.ab_ex_em_open_em_id);
						if(temp_em_node_obj!=null)
							temp_em_node_obj.style.background="yellow";
					}
				</script>
			</xsl:if>
		</xsl:if>
		<xsl:if test="count($afmTableGroupNodes/dataSource/data/records/record) = 0">
			<div>
				<table style="margin-left:10">
					<tr><td class="instruction">
						<span translatable="false">No Items.</span>
					</td></tr>
				</table>
			</div>
		</xsl:if>
	</xsl:template>

	<!-- xsl template: tree-model -->
	<xsl:template name="tree-model">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="hasChildren"/>
		<xsl:param name="nodeID"/>
		<xsl:choose>
			<!-- there are subnodes under currently-processing node-->
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup)>0">
				<xsl:variable name="parent_PKS"><xsl:for-each select="$afmTableGroupNodes/dataSource/data/records/record[position()=1]/@*"><xsl:value-of select="."/>;</xsl:for-each></xsl:variable>
				<script language="javascript">
					var temp_array_<xsl:value-of select="$nodeID"/>=new Array();
					<xsl:for-each select="$afmTableGroupNodes/afmTableGroup/dataSource/data/records/record">
						<xsl:variable name="child_PKS" select="@em.em_id"/>
						temp_array_<xsl:value-of select="$nodeID"/>['<xsl:value-of select="$child_PKS"/>']=0;
					</xsl:for-each>
					arrAssginedRMS2DP['<xsl:value-of select="$parent_PKS"/>']=temp_array_<xsl:value-of select="$nodeID"/>;
				</script>
				<!-- processing the individual afmTableGroup -->
				<xsl:call-template name="detailedContent">
					<xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
					<xsl:with-param name="hasChildren" select="'true'"/>
					<xsl:with-param name="nodeID" select="$nodeID"/>
				</xsl:call-template>
				<div ID='{$nodeID}'>
					<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
					<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
						<xsl:call-template name="tree-model">
							<xsl:with-param name="afmTableGroupNodes" select="."/>
							<xsl:with-param name="margin-left" select="$margin-left+1"/>
							<xsl:with-param name="hasChildren" select="'false'"/>
							<xsl:with-param name="nodeID" select="$nodeID"/>
						</xsl:call-template>
					</xsl:for-each>
				</div>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="detailedContent">
					<xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
					<xsl:with-param name="hasChildren" select="$hasChildren"/>
					<xsl:with-param name="nodeID" select="$nodeID"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: detailedContent -->
	<xsl:template name="detailedContent">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="hasChildren"/>
	<xsl:param name="margin-left"/>
	<xsl:param name="nodeID"/>
		<xsl:variable name="table_name" select="$afmTableGroupPath/dataSource/database/tables/table[@role='main']/@name"/>
		<table valign="top" nowrap="1" style='margin-left:{$margin-left*10}pt;'>
			<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
				<xsl:choose>
					<xsl:when test="$hasChildren='false'">
						<xsl:if test="$table_name='em'">
							<xsl:variable name="ID_PKS_Assigned" select="@em.em_id"/>
							<tr nowrap="1" style="cursor:hand;" id="{$ID_PKS_Assigned}"   bgcolor="#FFFFFF"  onMouseOut="this.bgColor='#FFFFFF'" onmousemove="this.bgColor='#33FFFF';handleMouseMove('{$ID_PKS_Assigned}')" ondragstart="window.parent.ab_ex_em_open_node_id='{$nodeID}';handleDragStart('{$ID_PKS_Assigned}')">
								<xsl:for-each select="@*">
									<td nowrap="1" class="treeParentNodeTitles">
										<xsl:value-of select="."/>
									</td>
								</xsl:for-each>
							</tr>
						</xsl:if>
						<xsl:if test="$table_name='dp'">
							<xsl:variable name="ID_PKS_DP_NONE"><xsl:for-each select="@*"><xsl:value-of select="."/>;</xsl:for-each></xsl:variable>
							<tr nowrap="1"  id="{$ID_PKS_DP_NONE}"   ondragenter="handleDragEnter()" ondragover="this.bgColor='#33FFFF';cancelEvent()" ondragleave="this.bgColor='#FAF0E6';handleDragLeave()" ondrop="this.bgColor='#FAF0E6';drop('{$ID_PKS_DP_NONE}','{$nodeID}')">
								<xsl:for-each select="@*">
									<td nowrap="1" class="treeParentNodeTitles">
										<xsl:value-of select="."/>
									</td>
								</xsl:for-each>
							</tr>
						</xsl:if>
					</xsl:when>
					<xsl:otherwise>
						<xsl:variable name="ID_PKS_DP"><xsl:for-each select="@*"><xsl:value-of select="."/>;</xsl:for-each></xsl:variable>
						<!-- bgcolor="#FFFFFF" onMouseOver="this.bgColor='#C0C0C0'" onMouseOut="this.bgColor='#FFFFFF'" -->
						<tr nowrap="1" id="{$ID_PKS_DP}"   ondragenter="handleDragEnter()" ondragover="this.bgColor='#33FFFF';cancelEvent()" ondragleave="this.bgColor='#FAF0E6';handleDragLeave()" ondrop="this.bgColor='#FAF0E6';drop('{$ID_PKS_DP}','{$nodeID}')">
							<script language="javascript">
								<xsl:text>AddParentNodeToArray('</xsl:text><xsl:value-of select="$nodeID"/><xsl:text>');</xsl:text>
							</script>
							<td nowrap="1" class="cursorSelector" onclick='HiddenIt(this, "{$nodeID}");'>
                                <xsl:variable name="task_icon" translatable="true">Task Icon</xsl:variable>
								<img alt="{$task_icon}" ondragstart="cancelEvent();" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-norm.gif"  BORDER="0" ID='IMG_1_{$nodeID}'/>
							</td>

							<xsl:for-each select="@*">
								<td class="treeParentNodeTitles" nowrap="1">
									<xsl:value-of select="."/>
								</td>
							</xsl:for-each>
						</tr>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>
			<xsl:if test="count($afmTableGroupPath/dataSource/data/records/record)=0">
				<tr><td class="instruction"><span translatable="false">No Items.</span></td></tr>
			</xsl:if>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


