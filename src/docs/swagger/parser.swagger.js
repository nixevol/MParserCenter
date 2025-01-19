/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           description: 错误代码
 *         message:
 *           type: string
 *           description: 错误信息
 *     Parser:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: 解析器ID
 *         NodeName:
 *           type: string
 *           description: 节点名称
 *         GatewayID:
 *           type: integer
 *           description: 网关ID
 *         Host:
 *           type: string
 *           description: IP地址
 *         Port:
 *           type: integer
 *           description: 端口
 *         Threads:
 *           type: integer
 *           description: 线程数
 *           default: 4
 *         Status:
 *           type: integer
 *           description: 状态（0=离线，1=在线）
 *         Switch:
 *           type: integer
 *           description: 开关（0=关闭，1=开启）
 *         gateway:
 *           $ref: '#/components/schemas/Gateway'
 */

/**
 * @swagger
 * /api/parser:
 *   get:
 *     summary: 获取解析器列表
 *     description: 获取所有解析器的列表，可以通过状态进行筛选
 *     tags: [Parser]
 *     parameters:
 *       - in: query
 *         name: Status
 *         schema:
 *           type: integer
 *         description: 状态（0=离线，1=在线）
 *     responses:
 *       200:
 *         description: 成功获取解析器列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parser'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/parser/{id}:
 *   get:
 *     summary: 获取单个解析器
 *     description: 根据ID获取单个解析器的详细信息
 *     tags: [Parser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 解析器ID
 *     responses:
 *       200:
 *         description: 成功获取解析器信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Parser'
 *       404:
 *         description: 解析器不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/parser/register:
 *   post:
 *     summary: 注册解析器
 *     description: 注册新的解析器或更新现有解析器
 *     tags: [Parser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID:
 *                 type: integer
 *                 description: 解析器ID（可选，如果提供则更新现有解析器）
 *               Port:
 *                 type: integer
 *                 description: 端口号
 *               Threads:
 *                 type: integer
 *                 description: 线程数（可选，默认为4）
 *     responses:
 *       200:
 *         description: 解析器注册成功
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
 *                   example: 解析器注册成功
 *                 data:
 *                   $ref: '#/components/schemas/Parser'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/parser/gateway:
 *   post:
 *     summary: 设置解析器的网关
 *     description: 为指定的解析器设置网关
 *     tags: [Parser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parserId:
 *                 type: integer
 *                 description: 解析器ID
 *               gatewayId:
 *                 type: integer
 *                 description: 网关ID
 *     responses:
 *       200:
 *         description: 网关设置成功
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
 *                   example: 网关设置成功
 *                 data:
 *                   $ref: '#/components/schemas/Parser'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 解析器或网关不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/parser/{id}:
 *   put:
 *     summary: 更新解析器
 *     description: 更新指定解析器的信息
 *     tags: [Parser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 解析器ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NodeName:
 *                 type: string
 *                 description: 节点名称
 *               Status:
 *                 type: integer
 *                 description: 状态（0=离线，1=在线）
 *               Switch:
 *                 type: integer
 *                 description: 开关（0=关闭，1=开启）
 *               Threads:
 *                 type: integer
 *                 description: 线程数
 *     responses:
 *       200:
 *         description: 解析器更新成功
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
 *                   example: 解析器更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Parser'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 解析器不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: 删除解析器
 *     description: 删除指定的解析器
 *     tags: [Parser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 解析器ID
 *     responses:
 *       200:
 *         description: 解析器删除成功
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
 *                   example: 解析器删除成功
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 解析器不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
