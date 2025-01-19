/**
 * @swagger
 * components:
 *   schemas:
 *     Scanner:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: 扫描器ID
 *         GatewayID:
 *           type: integer
 *           description: 所属网关ID
 *         NodeName:
 *           type: string
 *           description: 扫描器名称
 *         Host:
 *           type: string
 *           description: 主机地址
 *         Port:
 *           type: integer
 *           description: 端口号
 *         Status:
 *           type: integer
 *           description: 状态：0=离线 1=在线
 *           enum: [0, 1]
 *         Switch:
 *           type: integer
 *           description: 开关：0=关闭 1=开启
 *           enum: [0, 1]
 *         gateway:
 *           $ref: '#/components/schemas/Gateway'
 *         ndsList:
 *           type: array
 *           description: 关联的NDS服务器列表
 *           items:
 *             $ref: '#/components/schemas/NDS'
 *     Gateway:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: 网关ID
 *         NodeName:
 *           type: string
 *           description: 网关名称
 *         Host:
 *           type: string
 *           description: 网关主机地址
 *         Port:
 *           type: integer
 *           description: 网关端口号
 *         Status:
 *           type: integer
 *           description: 网关状态
 *     NDS:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: NDS服务器ID
 *         NodeName:
 *           type: string
 *           description: NDS服务器名称
 *         Host:
 *           type: string
 *           description: NDS服务器主机地址
 *         Port:
 *           type: integer
 *           description: NDS服务器端口号
 *         Status:
 *           type: integer
 *           description: NDS服务器状态
 */

/**
 * @swagger
 * /api/scanner:
 *   get:
 *     tags:
 *       - Scanner
 *     summary: 获取扫描器列表
 *     description: 获取所有扫描器的列表，包含关联的网关和NDS服务器信息
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scanner'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 内部服务器错误
 *                 code:
 *                   type: integer
 *                   example: 500
 */

/**
 * @swagger
 * /api/scanner/{id}:
 *   get:
 *     tags:
 *       - Scanner
 *     summary: 获取单个扫描器信息
 *     description: 根据ID获取扫描器的详细信息，包含关联的网关和NDS服务器信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 扫描器ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Scanner'
 *       404:
 *         description: 扫描器不存在
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /api/scanner/register:
 *   post:
 *     tags:
 *       - Scanner
 *     summary: 注册扫描器
 *     description: 注册新扫描器或更新已存在的扫描器信息
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Port
 *             properties:
 *               ID:
 *                 type: integer
 *                 description: 扫描器ID（可选，用于更新已存在的扫描器）
 *               Port:
 *                 type: integer
 *                 description: 端口号
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Scanner'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 扫描器不存在（当更新时）
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /api/scanner/gateway:
 *   post:
 *     tags:
 *       - Scanner
 *     summary: 设置扫描器的网关
 *     description: 为扫描器设置关联的网关
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scannerId
 *               - gatewayId
 *             properties:
 *               scannerId:
 *                 type: integer
 *                 description: 扫描器ID
 *               gatewayId:
 *                 type: integer
 *                 description: 网关ID
 *     responses:
 *       200:
 *         description: 设置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 设置网关成功
 *       404:
 *         description: 扫描器或网关不存在
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /api/scanner/nds:
 *   post:
 *     tags:
 *       - Scanner
 *     summary: 批量添加NDS服务器映射
 *     description: 为扫描器批量添加NDS服务器映射关系（不会清除原有关联）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scannerId
 *               - ndsIds
 *             properties:
 *               scannerId:
 *                 type: integer
 *                 description: 扫描器ID
 *               ndsIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: NDS服务器ID列表
 *     responses:
 *       200:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Scanner'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 参数类型错误
 *                 code:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: 扫描器或NDS服务器不存在
 *       500:
 *         description: 服务器错误
 *   delete:
 *     tags:
 *       - Scanner
 *     summary: 批量删除NDS服务器映射
 *     description: 批量删除扫描器与NDS服务器的映射关系
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scannerId
 *               - ndsIds
 *             properties:
 *               scannerId:
 *                 type: integer
 *                 description: 扫描器ID
 *               ndsIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要删除的NDS服务器ID列表
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Scanner'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 参数类型错误
 *                 code:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: 扫描器不存在
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /api/scanner/{id}:
 *   put:
 *     tags:
 *       - Scanner
 *     summary: 更新扫描器信息
 *     description: 更新扫描器的基本信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 扫描器ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NodeName:
 *                 type: string
 *                 description: 扫描器名称
 *               Port:
 *                 type: integer
 *                 description: 端口号
 *               Status:
 *                 type: integer
 *                 description: 状态
 *               Switch:
 *                 type: integer
 *                 description: 开关状态
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Scanner'
 *       404:
 *         description: 扫描器不存在
 *       500:
 *         description: 服务器错误
 *
 *   delete:
 *     tags:
 *       - Scanner
 *     summary: 删除扫描器
 *     description: 删除指定的扫描器及其关联信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 扫描器ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 删除扫描器成功
 *       404:
 *         description: 扫描器不存在
 *       500:
 *         description: 服务器错误
 */
