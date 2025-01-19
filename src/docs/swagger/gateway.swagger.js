/**
 * @swagger
 * components:
 *   schemas:
 *     GatewayList:
 *       type: object
 *       required:
 *         - ID
 *       properties:
 *         ID:
 *           type: integer
 *           description: 网关ID
 *         nodeName:
 *           type: string
 *           maxLength: 255
 *           description: 网关名称
 *         host:
 *           type: string
 *           maxLength: 255
 *           description: 主机地址
 *         port:
 *           type: integer
 *           minimum: 1
 *           maximum: 65535
 *           description: 端口号
 *         status:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *           description: 状态：0=离线 1=在线
 *         switch:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *           description: 开关：0=关闭 1=开启
 */

/**
 * @swagger
 * /api/gateway/register:
 *   post:
 *     summary: 注册网关
 *     description: 注册新网关或更新现有网关信息
 *     tags: [Gateway]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - port
 *             properties:
 *               ID:
 *                 type: integer
 *                 description: 网关ID（可选，-1表示新建）
 *               port:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 65535
 *                 description: 端口号（必需）
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/GatewayList'
 *                 message:
 *                   type: string
 *                   example: 操作成功
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /api/gateway:
 *   get:
 *     summary: 获取网关列表
 *     description: 获取所有网关的列表，支持分页和关键字搜索
 *     tags: [Gateway]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键字
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GatewayList'
 *                 message:
 *                   type: string
 *                   example: 操作成功
 */

/**
 * @swagger
 * /api/gateway/{ID}:
 *   get:
 *     summary: 获取单个网关
 *     description: 获取指定ID的网关信息
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: 网关ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/GatewayList'
 *                 message:
 *                   type: string
 *                   example: 操作成功
 *       404:
 *         description: 网关不存在
 *   put:
 *     summary: 更新网关配置
 *     description: 更新指定网关的配置信息
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: 网关ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nodeName:
 *                 type: string
 *                 maxLength: 255
 *                 description: 网关名称
 *               port:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 65535
 *                 description: 端口号
 *               switch:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 开关状态
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/GatewayList'
 *                 message:
 *                   type: string
 *                   example: 操作成功
 *       404:
 *         description: 网关不存在
 *   delete:
 *     summary: 删除网关
 *     description: 删除指定ID的网关
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: 网关ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 网关不存在
 */

/**
 * @swagger
 * /api/gateway/{ID}/logout:
 *   post:
 *     summary: 注销网关
 *     description: 将指定ID的网关状态设置为离线
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: 网关ID
 *     responses:
 *       200:
 *         description: 注销成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 网关注销成功
 *       404:
 *         description: 网关不存在
 */

/**
 * @swagger
 * /api/gateway/{ID}/nds:
 *   get:
 *     summary: 获取网关关联的NDS列表
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: 网关ID
 *     responses:
 *       200:
 *         description: 成功返回NDS列表
 * 
 *   put:
 *     summary: 更新网关关联的NDS
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: 网关ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ndsIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: NDS ID列表
 *     responses:
 *       200:
 *         description: 更新成功
 *
 *   post:
 *     summary: 添加网关关联的NDS
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: 网关ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ndsId:
 *                 type: integer
 *                 description: 要关联的NDS ID
 *     responses:
 *       200:
 *         description: 添加成功
 *       400:
 *         description: 该关联已存在
 *       404:
 *         description: 网关或NDS不存在
 */

/**
 * @swagger
 * /api/gateway/{ID}/nds/{ndsId}:
 *   delete:
 *     summary: 删除网关关联的NDS
 *     description: 删除网关与指定NDS的关联
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: 网关ID
 *       - in: path
 *         name: ndsId
 *         required: true
 *         schema:
 *           type: integer
 *         description: NDS ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 网关、NDS或关联不存在
 */
