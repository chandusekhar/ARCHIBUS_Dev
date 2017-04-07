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
			<!--script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-navigator-all-levels.js"><xsl:value-of select="$whiteSpace"/></script-->
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-em.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body"  onload="onPageLoad()" onselectstart="return false" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:variable name="executeTransaction" select="/*/afmTableGroup[@name='transaction_form']/afmAction[@type='executeTransaction']/@serialized"/>
			<!-- overwrite javascript variable values -->
			<xsl:variable name="em_message" select="//message[@name='em']"/>
			<xsl:variable name="dp_message" select="//message[@name='dp']"/>
			<xsl:variable name="dv_message" select="//message[@name='dv']"/>
			<xsl:variable name="message_message" select="//message[@name='message']"/>

			<script language="javascript">
				strExecuteTransaction='<xsl:value-of select="$executeTransaction"/>';
				<xsl:for-each select="/*/afmTableGroup[@name='not_assigned']/dataSource/data/records/record">
					arrUnAssignedEMS['<xsl:value-of select="@em.em_id"/>']=0;
				</xsl:for-each>
				em_message='<xsl:value-of select="$em_message"/>';
				dp_message='<xsl:value-of select="$dp_message"/>';
				dv_message='<xsl:value-of select="$dv_message"/>';
				message_message='<xsl:value-of select="$message_message"/>';
			</script>

			<table  align="left" valign="top">
				<tr valign="top">
					<td    valign="top">
						<!-- unassigned em: table -->
						<xsl:call-template name="unassigned">
							<xsl:with-param name="afmTableGroupNodes" select="/*/afmTableGroup[@name='not_assigned']"/>
						</xsl:call-template>
						<script language="javascript">
							var temp_em_node_obj=document.getElementById(window.parent.ab_ex_em_open_em_id);
							if(temp_em_node_obj!=null)
								temp_em_node_obj.style.background="yellow";
						</script>
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
	<xsl:template name="unassigned">
		<xsl:param name="afmTableGroupNodes"/>
		<table nowrap="1" style="margin-left:10pt;" valign="top" ondragenter="handleDragEnter()" ondragover="cancelEvent()" ondragleave="handleDragLeave()" ondrop="drop('')">
			<xsl:for-each select="$afmTableGroupNodes/dataSource/data/records/record">
				<xsl:variable name="ID_PKS_Unassigned" select="@em.em_id"/>
				<tr valign="top" id="{$ID_PKS_Unassigned}" style="cursor:hand;" bgcolor="#FFFFFF" onMouseOut="this.bgColor='#FFFFFF'" onmousemove="this.bgColor='#33FFFF';handleMouseMove('{$ID_PKS_Unassigned}')" ondragstart="handleDragStart('{$ID_PKS_Unassigned}')">
					<xsl:for-each select="@*">
						<td  nowrap="1" class="treeParentNodeTitles"><xsl:value-of select="."/></td>
					</xsl:for-each>
				</tr>
			</xsl:for-each>
		</table>
		<xsl:if test="count($afmTableGroupNodes/dataSource/data/records/record) = 0">
			<div>
				<table style="margin-left:10" valign="top">
					<tr valign="top"><td class="instruction" valign="top">
						<span translatable="false">No Items.</span>
					</td></tr>
				</table>
			</div>
		</xsl:if>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


