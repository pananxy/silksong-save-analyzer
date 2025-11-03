/**
 * @typedef {Object} FlagParsingInfo
 * @property {"flag"} type
 * @property {string} internalId - name of flag
 */

/**
 * @typedef {Object} QuestParsingInfo
 * @property {"quest"} type
 * @property {string} internalId - name of quest
 */

/**
 * @typedef {Object} SceneDataParsingInfo
 * @property {"sceneData"} type
 * @property {[string, string]} internalId - tuple: [sceneLoc, ID]
 */

/**
 * @typedef {Object} ToolParsingInfo
 * @property {"tool"} type
 * @property {string} internalId - name of tool
 */

/**
 * @typedef {Object} UpgradableToolParsingInfo
 * @property {"upgradeabletool"} type
 * @property {[string]} internalId - names of tool variants
 */

/**
 * @typedef {Object} CrestParsingInfo
 * @property {"crest"} type
 * @property {string} internalId - name of crest
 */

/**
 * @typedef {Object} CollectableParsingInfo
 * @property {"collectable"} type
 * @property {string} internalId - name of collectable
 */

/**
 * @typedef {FlagParsingInfo | QuestParsingInfo | SceneDataParsingInfo | ToolParsingInfo | UpgradableToolParsingInfo | CrestParsingInfo} ParsingInfo
 */

/**
 * @typedef {Object} CategoryItem
 * @property {string} name - display name, e.g. "Mask Shard 1"
 * @property {1 | 2 | 3} whichAct - earliest act you can acquire it
 * @property {string[]} prereqs - required abilities or conditions
 * @property {string} location - description of how to get it
 * @property {ParsingInfo} parsingInfo - internal parsing information
 */

/**
 * @typedef {"main"|"essential"} NecessityType - main directly counts, essential is indirectly needed for main
 */

/**
 * @typedef {Object} CollectableCategory
 * @property {string} name - name of the category
 * @property {NecessityType} necessity - how the category contributes to completion
 * @property {string} tooltip - description for the category
 * @property {(acquiredItems: CategoryItem[]) => number} [formula] - calculates completion % for this category, only for necessity === "main"
 * @property {CategoryItem[]} items - items in this category
 */

/**
 * @param {ParsingInfo} itemParsingInfo
 * @param {Object} saveData
 * @returns {boolean}
 */
export function isItemUnlockedInPlayerSave(itemParsingInfo, saveData) {
	const playerData = saveData.playerData ?? {};
	const sceneData = saveData.sceneData?.persistentBools?.serializedList ?? [];

	const typeHandlers = {
		flag: (flagName) => !!playerData[flagName],

		tempintflag: ([flagName, reqValue]) => {
			return !!playerData[flagName] && playerData[flagName] >= reqValue;
		},

		quest: (questName) => {
			const questEntry = playerData.QuestCompletionData?.savedData?.find(
				(x) => x.Name === questName,
			);

			return questEntry?.Data?.IsCompleted ?? false;
		},

		sceneData: ([sceneName, Id]) => {
			const scene = sceneData.find(
				(x) => x.SceneName === sceneName && x.ID === Id,
			);
			return scene?.Value ?? false;
		},

		tool: (toolName) => {
			const toolEntry = playerData.Tools?.savedData?.find(
				(x) => x.Name === toolName,
			);
			return (
				!!toolEntry && toolEntry.Data.IsUnlocked && !toolEntry.Data.IsHidden
			);
		},

		upgradabletool: (listOfVariantNames) => {
			return listOfVariantNames.some((variantName) =>
				typeHandlers.tool(variantName),
			);
		},

		crest: (crestName) => {
			const crestEntry = playerData.ToolEquips?.savedData?.find(
				(x) => x.Name === crestName,
			);
			return !!crestEntry && crestEntry.Data.IsUnlocked;
		},

		collectable: (itemName) => {
			const collectableEntry = playerData.Collectables?.savedData?.find(
				(x) => x.Name === itemName,
			);
			return !!collectableEntry && collectableEntry.Data.Amount > 0;
		},
	};

	const handler = typeHandlers[itemParsingInfo.type];
	if (!handler)
		throw new Error(`Unknown ParsingInfo type:${itemParsingInfo.type}`);

	return handler(itemParsingInfo.internalId);
}

/**
 * @type {Record<string, CollectableCategory>}
 */
export const collectables = [
	{
		name: "面具碎片",
		necessity: "main",
		tooltip: "面具碎片可提高你的血量上限. 每4片提供1点血量上限及 1% 的收集度",
		formula: (acquiredItems) => Math.floor(acquiredItems.length / 4),
		items: [
			{
				name: "面具碎片 1",
				whichAct: 1,
				prereqs: [],
				location:
					'在骸底镇商人处花费300念珠购买 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477840">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "PurchasedBonebottomHeartPiece",
				},
			},
			{
				name: "面具碎片 2",
				whichAct: 1,
				prereqs: ["冲刺（疾跑）"],
				location:
					'在虫道中一堵易碎的墙后面 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478091">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Crawl_02", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 3",
				whichAct: 1,
				prereqs: ["流浪者披风（滑翔）"],
				location:
					'在织女虫（给流浪者披风的虫子）的左边 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477975">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Bone_East_20", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 4",
				whichAct: 1,
				prereqs: [],
				location:
					'在甲木林中部跑酷路段的尽头 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478177">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Shellwood_14", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 5",
				whichAct: 1,
				prereqs: ["蛛攀术（爬墙）"],
				location:
					'深坞与骸骨洞穴连接处 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477901">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Dock_08", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 6",
				whichAct: 1,
				prereqs: [],
				location:
					'阿特拉织巢最右侧的隐藏跳跳乐 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478233">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Weave_05b", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 7",
				whichAct: 1,
				prereqs: [],
				location:
					'完成钟心镇委托（二战残暴兽蝇）时获得 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478800">(地图链接)</a>',
				parsingInfo: {
					type: "quest",
					internalId: "Beastfly Hunt",
				},
			},
			{
				name: "面具碎片 8",
				whichAct: 2,
				prereqs: [],
				location:
					'机枢核心左侧房间获得 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478615">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Song_09", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 9",
				whichAct: 2,
				prereqs: [],
				location:
					'低语书库(击中下面走廊里的箱子，通过可破坏的天花板进入。) <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478671">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Library_05", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 10",
				whichAct: 2,
				prereqs: ["飞针冲刺（抓钩）"],
				location:
					'腐汁泽中间长廊最右侧 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478849">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Shadow_13", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 11",
				whichAct: 2,
				prereqs: ["飞针冲刺（抓钩）"],
				location:
					'原野最右侧骷髅头内部跳跳乐 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478841">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Bone_East_LavaChallenge", "Heart Piece (1)"],
				},
			},
			{
				name: "面具碎片 12",
				whichAct: 2,
				prereqs: [],
				location:
					'罪石监狱中间通道的右上方，跳跳乐后面，需要叛徒钥匙（位于腐殖渠左侧） <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479001">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Slab_17", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 13",
				whichAct: 2,
				prereqs: ["幻羽披风（二段跳）"],
				location:
					'费耶山最左边 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479038">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Peak_04c", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 14",
				whichAct: 2,
				prereqs: ["幻羽披风（二段跳）"],
				location:
					'火灵竹林右侧 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479151">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Wisp_07", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 15",
				whichAct: 2,
				prereqs: [],
				location:
					'圣歌盟地商人处花费750念珠购买 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478879">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "MerchantEnclaveShellFragment",
				},
			},
			{
				name: "面具碎片 16",
				whichAct: 2,
				prereqs: ["爬墙+二段跳+飞针冲刺 or 灵丝升腾（超级跳/飞天）"],
				location:
					'蚀阶左边 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478498">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Coral_19b", "Heart Piece"],
				},
			},
			{
				name: "面具碎片 17",
				whichAct: 3,
				prereqs: [],
				location:
					'远野最右侧与NPC飞毛腿奔跑比赛获胜的奖励 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479194">(地图链接)</a>',
				parsingInfo: {
					type: "quest",
					internalId: "Sprintmaster Race",
				},
			},
			{
				name: "面具碎片 18",
				whichAct: 3,
				prereqs: [],
				location:
					'钟心镇隐秘猎手任务奖励 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479447">(地图链接)</a>',
				parsingInfo: {
					type: "quest",
					internalId: "Ant Trapper",
				},
			},
			{
				name: "面具碎片 19",
				whichAct: 3,
				prereqs: [],
				location:
					'钟心镇暗蚀之心任务奖励 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479449">(地图链接)</a>',
				parsingInfo: {
					type: "quest",
					internalId: "Destroy Thread Cores",
				},
			},
			{
				name: "面具碎片 20",
				whichAct: 3,
				prereqs: ["灵丝升腾（超级跳）"],
				location:
					'费耶山的隐藏冰晶脉窟上面 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479460">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Peak_06", "Heart Piece"],
				},
			},
		],
	},
	{
		name: "丝线轴碎片",
		necessity: "main",
		tooltip:
			"丝线轴碎片可提高你的丝线轴上限. 每两片提供 1% 的收集度",
		formula: (acquiredItems) => Math.floor(acquiredItems.length / 2),
		items: [
			{
				name: "丝线轴碎片 1",
				whichAct: 1,
				prereqs: [],
				location:
					'骸底镇右上隐藏房间 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478080">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Bone_11b", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 2",
				whichAct: 1,
				prereqs: [],
				location:
					'深坞左中房间 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477926">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Bone_East_13", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 3",
				whichAct: 1,
				prereqs: ["蛛攀术（爬墙）"],
				location:
					'在灰沼腐囊虫泽跳跳乐左上方 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478263">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Greymoor_02", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 4",
				whichAct: 1,
				prereqs: ["蛛攀术（爬墙）"],
				location:
					'在罪石牢狱，左侧结霜部分 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478475">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Peak_01", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 5",
				whichAct: 1,
				prereqs: ["织忆弦针（弹琴）和蛛攀术（爬墙）"],
				location:
					'在阿特拉织巢的一堵破墙后面 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478230">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Weave_11", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 6",
				whichAct: 1,
				prereqs: ["织忆弦针"],
				location:
					'完成钟心镇任务《失踪售货员》后可话费270念珠购买 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478347">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "PurchasedBelltownSpoolSegment",
				},
			},
			{
				name: "丝线轴碎片 7",
				whichAct: 2,
				prereqs: [],
				location:
					'找到14只跳蚤后去找团长即可获得 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478820">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "MerchantEnclaveSpoolPiece",
				},
			},
			{
				name: "丝线轴碎片 8",
				whichAct: 2,
				prereqs: [],
				location:
					'机枢核心右下角 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478618">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Cog_07", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 9",
				whichAct: 2,
				prereqs: [],
				location:
					'圣堡工厂右下 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478704">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Library_11b", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 10",
				whichAct: 2,
				prereqs: [],
				location:
					'巨扉圣门的顶部 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478586">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Song_19_entrance", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 11",
				whichAct: 2,
				prereqs: [],
				location:
					'圣堡工厂的大熔釜左侧 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478931">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Under_10", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 12",
				whichAct: 2,
				prereqs: [],
				location:
					'白愈厅电梯井的底部。 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479317">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Ward_01", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 13",
				whichAct: 2,
				prereqs: [],
				location:
					'圣歌盟地《愈伤良方》任务的奖励 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479180">(地图链接)</a>',
				parsingInfo: {
					type: "quest",
					internalId: "Save Sherma",
				},
			},
			{
				name: "丝线轴碎片 14",
				whichAct: 2,
				prereqs: [],
				location:
					'深坞与远野隐藏路径交界处 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478825">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Dock_03c", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 15",
				whichAct: 2,
				prereqs: ["飞针冲刺（抓钩）"],
				location:
					'高庭中部顶端 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478909">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Hang_03_top", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 16",
				whichAct: 2,
				prereqs: ["幻羽披风（二段跳）"],
				location:
					'忆廊左侧跳跳乐 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479117">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Arborium_09", "Silk Spool"],
				},
			},
			{
				name: "丝线轴碎片 17",
				whichAct: 2,
				prereqs: ["幻羽披风（二段跳）"],
				location:
					'在蚀阶小偷格林德尔处花费680念珠购买 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478527">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "purchasedGrindleSpoolPiece",
				},
			},
			{
				name: "丝线轴碎片 18",
				whichAct: 2,
				prereqs: ["幻羽披风（二段跳）"],
				location:
					'完成圣歌盟地任务《再寻商贾》后，在商人（朱比拉娜）处花费500念珠购买 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479249">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "MerchantEnclaveSpoolPiece",
				},
			},
		],
	},
	{
		name: "技能",
		necessity: "main",
		tooltip: "消耗丝线的伤害技能。每项技能贡献1%收集度 ",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "丝之矛",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477871">(地图链接)</a>',
				parsingInfo: { type: "tool", internalId: "Silk Spear" },
			},
			{
				name: "灵丝风暴",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478061">(地图链接)</a>',
				parsingInfo: { type: "tool", internalId: "Thread Sphere" },
			},
			{
				name: "十字绣（弹反）",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478371">(地图链接)</a>',
				parsingInfo: { type: "tool", internalId: "Parry" },
			},
			{
				name: "符文之怒",
				whichAct: 2,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479025">(地图链接)</a>',
				parsingInfo: { type: "tool", internalId: "Silk Bomb" },
			},
			{
				name: "丝刃镖",
				whichAct: 2,
				prereqs: ["飞针冲刺（抓钩）"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479079">(地图链接)</a>',
				parsingInfo: { type: "tool", internalId: "Silk Charge" },
			},
			{
				name: "苍白之爪",
				whichAct: 3,
				prereqs: ["灵丝升腾（超级跳）"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479606">(地图链接)</a>',
				parsingInfo: { type: "tool", internalId: "Silk Boss Needle" },
			},
		],
	},
	{
		name: "工具",
		necessity: "main",
		tooltip:
			"红色、黄色和蓝色工具。每个工具计为1%。升级工具不会影响完成百分比。",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "碎壳坠",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Bone Necklace" },
			},
			{
				name: "罗盘",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Compass" },
			},

			{
				name: "德鲁伊之眼/德鲁伊双瞳",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "upgradabletool",
					internalId: ["Mosscreep Tool 1", "Mosscreep Tool 2"],
				},
			},
			{
				name: "直针",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Straight Pin" },
			},
			{
				name: "护佑钟",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Bell Bind" },
			},
			{
				name: "三重镖",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Tri Pin" },
			},

			{
				name: "长针",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Harpoon" },
			},
			{
				name: "亡虫囊 / 壳囊（钢魂）",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "upgradabletool",
					internalId: ["Dead Mans Purse", "Shell Satchel"],
				},
			},
			{
				name: "磁石胸针",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Rosary Magnet" },
			},
			{
				name: "熔岩钟",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Lava Charm" },
			},
			{
				name: "跳蚤酿造",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Flea Brew" },
			},
			{
				name: "荆棘手环",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Barbed Wire" },
			},
			{
				name: "钉刺",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Tack" },
			},
			{
				name: "爆燃囊",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Pimpilo" },
			},
			{
				name: "织光仪",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "White Ring" },
			},
			{
				name: "燧石板",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Flintstone" },
			},
			{
				name: "丝速脚环",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Sprintmaster" },
			},
			{
				name: "掘洞钻",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Screw Attack" },
			},
			{
				name: "花芯囊",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Poison Pouch" },
			},
			{
				name: "注丝套针",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Quickbind" },
			},
			{
				name: "生质液瓶",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Lifeblood Syringe" },
			},
			{
				name: "登极握爪",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Wallcling" },
			},
			{
				name: "记忆晶石",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Revenge Crystal" },
			},

			{
				name: "窃者印记",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Thief Charm" },
			},
			{
				name: "螺切刃",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Conch Drill" },
			},
			{
				name: "速射索",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Quick Sling" },
			},
			{
				name: "灵火提灯",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Wisp Lantern" },
			},
			{
				name: "齿轮蜂",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Cogwork Flier" },
			},
			{
				name: "念珠炮",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Rosary Cannon" },
			},
			{
				name: "净界花环",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Maggot Charm" },
			},
			{
				name: "储备缚丝",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Reserve Bind" },
			},
			{
				name: "负重环带",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Weighted Anklet" },
			},

			{
				name: "长爪",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Longneedle" },
			},
			{
				name: "投掷环",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Shakra Ring" },
			},
			{
				name: "迅捷骨锁",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Scuttlebrace" },
			},
			{
				name: "碎面甲",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Fractured Mask" },
			},
			{
				name: "伏特丝",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Zap Imbuement" },
			},
			{
				name: "丝弹",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "upgradabletool",
					internalId: ["WebShot Forge", "WebShot Architect", "WebShot Weaver"],
				},
			},
			{
				name: "蜇刺碎片",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Sting Shard" },
			},
			{
				name: "曲镰/弧爪",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "upgradabletool",
					internalId: ["Curve Claws", "Curve Claws Upgraded"],
				},
			},
			{
				name: "蛛丝弦",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Musician Charm" },
			},
			{
				name: "储线延展器",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Spool Extender" },
			},
			{
				name: "多重缚丝器",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Multibind" },
			},
			{
				name: "针徽",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Pinstress Tool" },
			},
			{
				name: "机轮刃",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Cogwork Saw" },
			},
			{
				name: "撬脏钩",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Thief Claw" },
			},
			{
				name: "磁石骰",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Magnetite Dice" },
			},
			{
				name: "锯齿环",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Brolly Spike" },
			},
			{
				name: "爪镜/双生爪镜",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "upgradabletool",
					internalId: ["Dazzle Bind", "Dazzle Bind Upgraded"],
				},
			},
			{
				name: "电枢球",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Lightning Rod" },
			},
			{
				name: "蚤母卵",
				whichAct: 0,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tool", internalId: "Flea Charm" },
			},
		],
	},
	{
		name: "钉刃升级",
		necessity: "main",
		tooltip: "每次刃钉升级提供 1% 的收集度",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "钉刃升级 1",
				whichAct: 1,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tempintflag", internalId: ["nailUpgrades", 1] },
			},
			{
				name: "钉刃升级 2",
				whichAct: 2,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tempintflag", internalId: ["nailUpgrades", 2] },
			},
			{
				name: "钉刃升级 3",
				whichAct: 2,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tempintflag", internalId: ["nailUpgrades", 3] },
			},
			{
				name: "钉刃升级 4",
				whichAct: 3,
				prereqs: [],
				location: "待更新",
				parsingInfo: { type: "tempintflag", internalId: ["nailUpgrades", 4] },
			},
		],
	},
	{
		name: "工具伤害升级",
		necessity: "main",
		tooltip: "每个制作套件升级提供 1% 的收集度.",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "工具伤害升级 1",
				whichAct: 1,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolKitUpgrades", 1],
				},
			},
			{
				name: "工具伤害升级 2",
				whichAct: 1,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolKitUpgrades", 2],
				},
			},
			{
				name: "工具伤害升级 3",
				whichAct: 2,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolKitUpgrades", 3],
				},
			},
			{
				name: "工具伤害升级 4",
				whichAct: 2,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolKitUpgrades", 4],
				},
			},
		],
	},
	{
		name: "工具袋升级",
		necessity: "main",
		tooltip: "每次工具包升级都提供 1% 的升级度.",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "工具袋升级 1",
				whichAct: 1,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolPouchUpgrades", 1],
				},
			},
			{
				name: "工具袋升级 2",
				whichAct: 1,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolPouchUpgrades", 2],
				},
			},
			{
				name: "工具袋升级 3",
				whichAct: 1,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolPouchUpgrades", 3],
				},
			},
			{
				name: "工具袋升级 4",
				whichAct: 2,
				prereqs: [],
				location: "待更新",
				parsingInfo: {
					type: "tempintflag",
					internalId: ["ToolPouchUpgrades", 4],
				},
			},
		],
	},
	{
		name: "纹章",
		necessity: "main",
		tooltip: "每个纹章 (除基础纹章) 提供 1% 收集度.",
		formula: (acquiredItems) => acquiredItems.length - 1,
		items: [
			{
				name: "猎手",
				whichAct: 1,
				prereqs: [],
				location: "初始",
				parsingInfo: {
					type: "crest",
					internalId: "Hunter",
				},
			},
			{
				name: "漫游者",
				whichAct: 1,
				prereqs: ["蛛攀术（爬墙）"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478240">(地图链接)</a>',
				parsingInfo: {
					type: "crest",
					internalId: "Wanderer",
				},
			},
			{
				name: "收割者",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478156">(地图链接)</a>',
				parsingInfo: {
					type: "crest",
					internalId: "Reaper",
				},
			},
			{
				name: "野兽",
				whichAct: 1,
				prereqs: ["冲刺", "滑翔"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478020">(地图链接)</a>',
				parsingInfo: {
					type: "crest",
					internalId: "Warrior",
				},
			},
			{
				name: "建筑师",
				whichAct: 2,
				prereqs: ["飞针冲刺（抓钩）"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478745">(地图链接)</a>',
				parsingInfo: {
					type: "crest",
					internalId: "Toolmaster",
				},
			},
			{
				name: "巫妪",
				whichAct: 2,
				prereqs: ["飞针冲刺（抓钩）"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478815">(地图链接)</a>',
				parsingInfo: {
					type: "crest",
					internalId: "Witch",
				},
			},
			{
				name: "萨满",
				whichAct: 3,
				prereqs: ["灵丝升腾（超级跳）"],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479384">(地图链接)</a>',
				parsingInfo: {
					type: "crest",
					internalId: "Spell",
				},
			},
		],
	},
	{
		name: "丝之心",
		necessity: "main",
		tooltip: "每个丝之心提供 1% 的收集度.",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "丝之心 1",
				whichAct: 1,
				prereqs: [],
				location:
					'击败钟道兽后获得 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477881">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Memory_Silk_Heart_BellBeast", "glow_rim_Remasker"],
				},
			},
			{
				name: "丝之心 2",
				whichAct: 2,
				prereqs: [],
				location:
					'在白愈厅的boss战后 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479082">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Memory_Silk_Heart_WardBoss", "glow_rim_Remasker"],
				},
			},
			{
				name: "丝之心 3",
				whichAct: 2,
				prereqs: [],
				location:
					'摇篮圣所下面二战蕾丝后获得 <a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479089">(地图链接)</a>',
				parsingInfo: {
					type: "sceneData",
					internalId: ["Memory_Silk_Heart_LaceTower", "glow_rim_Remasker"],
				},
			},
		],
	},
	{
		name: "能力",
		necessity: "main",
		tooltip: "每个能力提供 1% 的收集度.",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "疾风步（冲刺）",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=477915">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "hasDash",
				},
			},
			{
				name: "蛛攀术（爬墙）",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478189">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "hasWalljump",
				},
			},
			{
				name: "织忆弦针",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478199">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "hasNeedolin",
				},
			},
			{
				name: "蓄力斩",
				whichAct: 1,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478510">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "hasChargeSlash",
				},
			},
			{
				name: "飞针冲刺（抓钩）",
				whichAct: 2,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=478714">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "hasHarpoonDash",
				},
			},
			// {
			// 	name: "幻羽披风（二段跳）",
			// 	whichAct: 2,
			// 	prereqs: [],
			// 	location:
			// 		'<a>该能力不影响收集度</a>',
			// 	parsingInfo: {
			// 		type: "flag",
			// 		internalId: "hasDoubleJump",
			// 	},
			// },
			{
				name: "灵丝升腾（超级跳）",
				whichAct: 3,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479288">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "hasSuperJump",
				},
			},
			{
				name: "风灵谣",
				whichAct: 3,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479654">(地图链接)</a>',
				parsingInfo: {
					type: "flag",
					internalId: "HasBoundCrestUpgrader",
				},
			},
		],
	},
	{
		name: "其他类收集",
		necessity: "main",
		tooltip: "杂项",
		formula: (acquiredItems) => acquiredItems.length,
		items: [
			{
				name: "永绽花",
				whichAct: 3,
				prereqs: [],
				location:
					'<a href="https://mapgenie.io/hollow-knight-silksong/maps/pharloom?locationIds=479387">(地图链接)</a>',
				parsingInfo: {
					type: "collectable",
					internalId: "White Flower",
				},
			},
		],
	},
];
