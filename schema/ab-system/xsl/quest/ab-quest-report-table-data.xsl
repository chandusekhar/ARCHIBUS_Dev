<?xml version="1.0" encoding="UTF-8"?>
<!-- processing questionnaire data in reports -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="ReportTable_data">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>
		<xsl:param name="level"/>
		
		<!-- setting up variables which will be used in xsl -->
		<!-- don't change "bSelect", it is used in reports.js -->
		<xsl:variable name="bSelect" select="'bSelect'"/>
		<xsl:variable name="levelMod" select="$level mod 3"/>
		<!-- making sure that tgrp levels will be 1,2,3,1,2,3... -->
		<xsl:variable name="CssClassLevel">
			<xsl:choose>
				<xsl:when test="$levelMod=0">3</xsl:when>
				<xsl:otherwise><xsl:value-of select="$levelMod"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="showGrid">
			<xsl:choose>
				<!-- check if there is showGrid in axvw -->
				<xsl:when test="$afmTableGroup/@showGrid">
					<xsl:value-of select="$afmTableGroup/@showGrid"/>
				</xsl:when>
				<!-- there is no showGrid in axvw, false is used as default -->
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="printable">
			<xsl:choose>
				<!-- check if there is printable in axvw -->
				<xsl:when test="$afmTableGroup/afmReport/@printable">
					<xsl:value-of select="$afmTableGroup/afmReport/@printable"/>
				</xsl:when>
				<!-- there is no printable in axvw, false is used as default -->
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="hasRowAction" select="$afmTableGroup/dataSource/data/records/record/afmAction"/>
		<xsl:variable name="hasRowSelectionAction" select="$afmTableGroup/rows/selection/afmAction"/>
		<xsl:variable name="fieldNodes" select="$afmTableGroup/dataSource/data/fields/field"/>
		<xsl:variable name="tgrpType" select="$afmTableGroup/@type"/>
		<xsl:variable name="selectedPosition" select="$afmTableGroup/dataSource/data/records/@selectedPosition"/>
		
		<!-- if there is no record in current tgrp, don't show field titles -->
		<!--xsl:if test="count($afmTableGroup/dataSource/data/records/record) &gt; 0"-->
		<!-- overwritting js variable in reports.js -->
		<script language="javascript">
			abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
		</script>

		<xsl:if test="$level=1">
			<table cellspacing="0">
				<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>
				<!-- Show the table-style header -->
				<xsl:variable name="HeadClass">
					<xsl:choose>
						<xsl:when test="$printable='false'"><xsl:value-of select="concat('AbHeaderTable',$CssClassLevel)"/></xsl:when>
						<xsl:otherwise>AbHeaderTable_print</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<tr class="{$HeadClass}">
					<xsl:if test="count($hasRowAction) &gt; 0  and ($hasRowAction/title!='')">
						<td><br /></td>
					</xsl:if>

					<!-- Use a blank column as a place holder for selection toggle if there is any selection action-->
					<xsl:if test="count($hasRowSelectionAction) &gt; 0  and ($hasRowSelectionAction/title!='')">
						<td><br /></td>
					</xsl:if>
					<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field">
						<!--xsl:if test="position() != count($afmTableGroup/dataSource/data/fields/field)"-->
						<xsl:if test="position() != last()">
						<td>	
							<!-- numeric fields are right-justified -->
							<xsl:attribute name="align">
								<xsl:choose>
									<xsl:when test="@type='java.lang.Float' or @type='java.lang.Double' or @type='java.lang.Integer'">right</xsl:when>
									<xsl:otherwise>left</xsl:otherwise>
								</xsl:choose>
							</xsl:attribute>
							<!--xsl:for-each select="multiLineHeadings/multiLineHeading">
								<xsl:value-of select="@multiLineHeading"/><xsl:value-of select="$whiteSpace"/>
							</xsl:for-each-->
							<xsl:value-of select="@singleLineHeading"/>
						</td>
						</xsl:if>
					</xsl:for-each>
					<xsl:for-each select="$afmTableGroup/LicenseHeadings/LicenseHeading">
						<td>	
							<!-- numeric fields are right-justified -->
							<xsl:attribute name="align">
								<xsl:choose>
									<xsl:when test="@type='java.lang.Float' or @type='java.lang.Double' or @type='java.lang.Integer'">right</xsl:when>
									<xsl:otherwise>left</xsl:otherwise>
								</xsl:choose>
							</xsl:attribute>
							<xsl:value-of select="@Name"/>
						</td>
					</xsl:for-each>

				</tr>
				<!-- Show each row of table data with action linkings -->
				<xsl:variable name="DataClass">
					<xsl:choose>
						<xsl:when test="$printable='false'">AbDataTable</xsl:when>
						<xsl:otherwise>AbDataTable_print</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
					<xsl:variable name="recordRowIndex" select="position()"/>
					<xsl:variable name="recordID" select="concat($afmTableGroupID,'_',generate-id())"/>
					<tr class="{$DataClass}">
						<!-- set up a variable to hold each row's data (only PKs)-->
						<xsl:variable name="TableRowValues">
							<xsl:for-each select="@*">
								<xsl:variable name="counter" select="position()"/>
								<xsl:if test="$fieldNodes[position()=$counter]/@primaryKey='true'">
									<xsl:value-of select="$whiteSpace"/>
									<xsl:value-of select="name()"/>
									<xsl:text>="</xsl:text>
									<xsl:value-of select="."/>
									<xsl:text>"</xsl:text>
								</xsl:if>
							</xsl:for-each>
						</xsl:variable>

						<!-- action links for each row -->
						<!-- if there is no title for afmAction, don't show  -->
						<xsl:if test="(count(afmAction[@type!='executeTransaction']) &gt; 0) and (afmAction/title!='')">
							<td>
								<table><tr>
									<xsl:for-each select="afmAction">
										<xsl:variable name="Index" select="concat($recordRowIndex,'_', position())"/>
										<td nowrap="1">
											<!-- ???action must have a title??? -->
											<xsl:choose>
											<xsl:when test="title!=''">
												<xsl:if test="$recordRowIndex=($selectedPosition+1)">
													<script language="javascript">
														previouSelectedNodeImgID='IMG_'+'<xsl:value-of select="$Index"/>';
													</script>
												</xsl:if>
												<!-- ChangeItToActiveItem() in reports.js -->
												<A href="#" onclick='ChangeItToActiveItem("{$Index}","","{@serialized}","{@frame}");return false;' title="{title}" ><!-- onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}", false); return false;' title="{title}" -->
													<xsl:choose>
														<xsl:when test="$recordRowIndex=($selectedPosition+1)">
															<img ALT="IMG_{$Index}" ID="IMG_{$Index}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-exp.gif" border="0"/>
														</xsl:when>
														<xsl:otherwise>
															<img ALT="IMG_{$Index}" ID="IMG_{$Index}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dflt.gif" border="0"/>
														</xsl:otherwise>
													</xsl:choose>
												</A>	
											</xsl:when>
											<xsl:otherwise><br /></xsl:otherwise>
											</xsl:choose>
										</td>
									</xsl:for-each>
								</tr></table>
							</td>
						</xsl:if>
						<!-- select box for each data row-->
						<!--xsl:if test="count($hasRowSelectionAction) &gt; 0 and ($hasRowSelectionAction/title!='')">
							<td>
								<input type="checkbox" name="{$bSelect}" value="{$TableRowValues}" onclick='EnableSelectionActionButtons("{$afmTableGroupID}")'/>
							</td>
						</xsl:if-->
						<!-- data row -->
						<xsl:for-each select="@*">
							<xsl:variable name="recordValue" select="."/>
							<xsl:variable name="index" select="position()"/>
							<xsl:variable name="currentField" select="$fieldNodes[position()=$index]"/>
							<!--xsl:if test="count($fieldNodes)=position()"-->
							<xsl:if test="position()=last()">
								<span style="display:none;">
									<textarea name="{$afmTableGroupID}.questions_data"><xsl:value-of select="$recordValue"/><xsl:value-of select="$whiteSpace"/></textarea>
								</span>
							</xsl:if>
							<!--xsl:if test="count($fieldNodes)!=position()"-->
							<xsl:if test="position()!=last()">
							<!-- showing autocolor -->
							<xsl:variable name="Autocolor">
								<xsl:if test="$recordRowIndex mod 2 = 0 and $printable='false'">AbDataTableAutocolor</xsl:if>
							</xsl:variable>

							<td class="{$Autocolor}">
								<!-- numeric fields are right-justified -->
								<xsl:attribute name="align">
									<xsl:choose>
										<xsl:when test="$currentField/@type='java.lang.Float' or $currentField/@type='java.lang.Double' or $currentField/@type='java.lang.Integer'">Right</xsl:when>
										<xsl:otherwise>left</xsl:otherwise>
									</xsl:choose>
								</xsl:attribute>
								<xsl:choose>
									<!-- force a white space: -->
									<xsl:when test="$recordValue=''"><br /></xsl:when>
									<xsl:otherwise>
										<xsl:choose>
											<!-- XmlGeneratorForm; type="form" why type="form" in floors-rooms-room-form.axvw????? -->
											<xsl:when test="$tgrpType='form'">
												<!-- could be enum fields??? -->
												<xsl:variable name="field_enum" select="$currentField/enumeration"/>
												<xsl:variable name="field_enum_value">
												<xsl:choose>
													<xsl:when test="count($field_enum) &gt; 0">
														<xsl:for-each select="$field_enum/item">
															<xsl:if test="@value=$recordValue"><xsl:value-of select="@displayValue"/></xsl:if>
														</xsl:for-each>
													</xsl:when>
													<xsl:otherwise><xsl:value-of select="$recordValue"/></xsl:otherwise>
												</xsl:choose>
												</xsl:variable>
												<xsl:value-of select="$field_enum_value"/>
											</xsl:when>
											<xsl:otherwise>
												<xsl:choose>
													<xsl:when test="$currentField/@format='Memo'">
														<xsl:call-template name="memo_field_value_handler">
															<xsl:with-param name="memo_value" select="$recordValue"/>
														</xsl:call-template>
													</xsl:when>
													<xsl:otherwise>
														<xsl:value-of select="$recordValue"/>
													</xsl:otherwise>
												</xsl:choose>

											</xsl:otherwise>
										</xsl:choose>
									</xsl:otherwise>
								</xsl:choose>

								<!-- since XML has fully-formatted data, XSLT will not handle them at all  -->
								<!--xsl:call-template name="RecordDataFormatting">
									<xsl:with-param name="fieldNode" select="$currentField"/>
									<xsl:with-param name="recordValue" select="$recordValue"/>
								</xsl:call-template-->
							</td>
							</xsl:if>
						</xsl:for-each>
					</tr>
				</xsl:for-each>
			</table>
		</xsl:if>

		<xsl:if test="$level!=1">
			<table cellspacing="0">
				<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>
				<xsl:variable name="HeadClass">
					<xsl:choose>
						<xsl:when test="$printable='false'"><xsl:value-of select="concat('AbHeaderTable',$CssClassLevel)"/></xsl:when>
						<xsl:otherwise>AbHeaderTable_print</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<tr class="{$HeadClass}">
					<td>Questionnaire Questions</td>
					<td>Answers</td>
				</tr>
				<!-- Show each row of table data with action linkings -->
				<xsl:variable name="DataClass">
					<xsl:choose>
						<xsl:when test="$printable='false'">AbDataTable</xsl:when>
						<xsl:otherwise>AbDataTable_print</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<input type="hidden" name="{$afmTableGroupID}.questions_id" value="{$afmTableGroupID}"/>
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
					<xsl:variable name="recordRowIndex" select="position()"/>
					<xsl:variable name="recordID" select="concat($afmTableGroupID,'_',generate-id())"/>
					<tr class="{$DataClass}">
						<!-- set up a variable to hold each row's data (only PKs)-->
						<xsl:variable name="TableRowValues">
							<xsl:for-each select="@*">
								<xsl:variable name="counter" select="position()"/>
								<xsl:if test="$fieldNodes[position()=$counter]/@primaryKey='true'">
									<xsl:value-of select="$whiteSpace"/>
									<xsl:value-of select="name()"/>
									<xsl:text>="</xsl:text>
									<xsl:value-of select="."/>
									<xsl:text>"</xsl:text>
								</xsl:if>
							</xsl:for-each>
						</xsl:variable>

						<!-- action links for each row -->
						<!-- if there is no title for afmAction, don't show  -->
						<xsl:if test="(count(afmAction[@type!='executeTransaction']) &gt; 0) and (afmAction/title!='')">
							<td>
								<table><tr>
									<xsl:for-each select="afmAction">
										<xsl:variable name="Index" select="concat($recordRowIndex,'_', position())"/>
										<td nowrap="1">
											<!-- ???action must have a title??? -->
											<xsl:choose>
											<xsl:when test="title!=''">
												<xsl:if test="$recordRowIndex=($selectedPosition+1)">
													<script language="javascript">
														previouSelectedNodeImgID='IMG_'+'<xsl:value-of select="$Index"/>';
													</script>
												</xsl:if>
												<!-- ChangeItToActiveItem() in reports.js -->
												<A href="#" onclick='ChangeItToActiveItem("{$Index}","","{@serialized}","{@frame}");return false;' title="{title}" ><!-- onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}", false); return false;' title="{title}" -->
													<xsl:choose>
														<xsl:when test="$recordRowIndex=($selectedPosition+1)">
															<img ALT="IMG_{$Index}" ID="IMG_{$Index}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-exp.gif" border="0"/>
														</xsl:when>
														<xsl:otherwise>
															<img ALT="IMG_{$Index}" ID="IMG_{$Index}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dflt.gif" border="0"/>
														</xsl:otherwise>
													</xsl:choose>
												</A>	
											</xsl:when>
											<xsl:otherwise><br /></xsl:otherwise>
											</xsl:choose>
										</td>
									</xsl:for-each>
								</tr></table>
							</td>
						</xsl:if>
						<!-- select box for each data row-->
						<!--xsl:if test="count($hasRowSelectionAction) &gt; 0 and ($hasRowSelectionAction/title!='')">
							<td>
								<input type="checkbox" name="{$bSelect}" value="{$TableRowValues}" onclick='EnableSelectionActionButtons("{$afmTableGroupID}")'/>
							</td>
						</xsl:if-->
						<xsl:if test="$level=2">
							<xsl:variable name="questText" select="@questions.quest_text"/>
							<xsl:variable name="questName" select="@questions.quest_name"/>
							<xsl:variable name="Autocolor">
								<xsl:if test="$recordRowIndex mod 2 = 0 and $printable='false'">AbDataTableAutocolor</xsl:if>
							</xsl:variable>
								<td class="{$Autocolor}">
									<xsl:value-of select="$questText"/>
								</td>
							<td class="{$Autocolor}">
								<xsl:variable name="formatType" select="@questions.format_type"/>
								<input name="{$afmTableGroupID}.format_type" type="hidden" value="{$formatType}"/>
								<xsl:if test="$formatType='Enumerated'">
									<input name="{$afmTableGroupID}.enum_list" type="hidden" value="{@questions.enum_list}"/>
								</xsl:if>
								<input name="{$afmTableGroupID}.quest_name" type="hidden" value="{$questName}"/>
								<span id="{$afmTableGroupID}.{$questName}">
									<xsl:value-of select="$whiteSpace"/>
								</span>
							</td>
						</xsl:if>
					</tr>
				</xsl:for-each>
			</table>
		</xsl:if>

		<xsl:if test="not (count($afmTableGroup/dataSource/data/records/record) &gt; 0)">
			<div style='margin-left:5pt;'>
				<table><tr>
					<td  class="instruction" align="center" valign="top">
						<p><span translatable="true">No Items.</span></p>
					</td>	
				</tr></table>
			</div>
		</xsl:if>
		<div>
			<!-- check if there is a report records max limitaion -->
			<xsl:variable name="moreRecords" select="$afmTableGroup/dataSource/data/records/@moreRecords"/>
			<xsl:if test="$moreRecords='true'">
				<table><tr>
					<td  class="instruction" align="center" valign="top">
						<p><span translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data</span></p>
					</td>	
				</tr></table>
			</xsl:if>
		</div>
	</xsl:template>
</xsl:stylesheet>