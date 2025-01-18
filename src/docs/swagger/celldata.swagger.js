/**
 * @swagger
 * components:
 *   schemas:
 *     CellData:
 *       type: object
 *       required:
 *         - CGI
 *         - eNodeBID
 *         - PCI
 *         - Earfcn
 *       properties:
 *         CGI:
 *           type: string
 *           description: 小区全局标识
 *           example: '460-00-1234-5678'
 *         eNodeBID:
 *           type: integer
 *           description: 基站ID
 *           example: 1234
 *         PCI:
 *           type: integer
 *           description: 物理小区标识
 *           example: 123
 *         Azimuth:
 *           type: integer
 *           description: 方位角
 *           example: 90
 *         Earfcn:
 *           type: integer
 *           description: 频点编号
 *           example: 38400
 *         Freq:
 *           type: integer
 *           description: 频率
 *           example: 1800
 *         eNBName:
 *           type: string
 *           description: 基站名称
 *           example: 'SZ_NS_001'
 *         userLabel:
 *           type: string
 *           description: 用户标签
 *           example: '深圳南山01'
 *         Longitude:
 *           type: number
 *           format: float
 *           description: 经度
 *           example: 113.923456
 *         Latitude:
 *           type: number
 *           format: float
 *           description: 纬度
 *           example: 22.543211
 * 
 * @swagger
 * /api/cell/list:
 *   get:
 *     summary: 获取小区列表
 *     description: 分页获取小区数据，支持按字段搜索
 *     tags: [小区管理]
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
 *           default: 50
 *         description: 每页数量
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *           enum: [CGI, eNBName, userLabel, all]
 *         description: 搜索字段
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 成功获取列表
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
 *                       example: 100
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CellData'
 * 
 * @swagger
 * /api/cell/add:
 *   post:
 *     summary: 添加小区
 *     description: 添加新的小区数据
 *     tags: [小区管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CellData'
 *     responses:
 *       200:
 *         description: 添加成功
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
 *                   example: '新增成功'
 * 
 * @swagger
 * /api/cell/update:
 *   post:
 *     summary: 更新小区
 *     description: 更新小区数据
 *     tags: [小区管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CellData'
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
 *                 message:
 *                   type: string
 *                   example: '更新成功'
 * 
 * @swagger
 * /api/cell/remove/{cgi}:
 *   delete:
 *     summary: 删除小区
 *     description: 根据CGI删除小区
 *     tags: [小区管理]
 *     parameters:
 *       - in: path
 *         name: cgi
 *         required: true
 *         schema:
 *           type: string
 *         description: 小区CGI
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: '删除成功'
 * 
 * @swagger
 * /api/cell/batch-delete:
 *   post:
 *     summary: 批量删除小区
 *     description: 批量删除多个小区
 *     tags: [小区管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cgis:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['460-00-1234-5678', '460-00-1234-5679']
 *     responses:
 *       200:
 *         description: 批量删除成功
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
 *                     deletedCount:
 *                       type: integer
 *                       example: 2
 * 
 * @swagger
 * /api/cell/check/{cgi}:
 *   get:
 *     summary: 检查CGI是否存在
 *     description: 检查指定的CGI是否已存在
 *     tags: [小区管理]
 *     parameters:
 *       - in: path
 *         name: cgi
 *         required: true
 *         schema:
 *           type: string
 *         description: 小区CGI
 *     responses:
 *       200:
 *         description: 检查成功
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
 *                     exists:
 *                       type: boolean
 *                       example: true
 * 
 * @swagger
 * /api/cell/upload:
 *   post:
 *     summary: 导入Excel文件
 *     description: 从Excel文件导入小区数据
 *     tags: [小区管理]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 导入成功
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
 *                       example: 100
 *                     inserted:
 *                       type: integer
 *                       example: 80
 *                     updated:
 *                       type: integer
 *                       example: 20
 *                     unchanged:
 *                       type: integer
 *                       example: 0
 *                     failed:
 *                       type: integer
 *                       example: 0
 *                     success:
 *                       type: integer
 *                       example: 100
 *                     successRate:
 *                       type: string
 *                       example: '100%'
 * 
 * @swagger
 * /api/cell/export:
 *   get:
 *     summary: 导出Excel文件
 *     description: 导出小区数据到Excel文件
 *     tags: [小区管理]
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
