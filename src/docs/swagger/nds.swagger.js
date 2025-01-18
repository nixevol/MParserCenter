/**
 * @swagger
 * components:
 *   schemas:
 *     NDSList:
 *       type: object
 *       required:
 *         - Name
 *         - Address
 *         - Account
 *         - Password
 *       properties:
 *         ID:
 *           type: integer
 *           description: NDS ID
 *         Name:
 *           type: string
 *           maxLength: 150
 *           description: NDS服务器名称
 *         Address:
 *           type: string
 *           maxLength: 100
 *           description: NDS服务器地址
 *         Port:
 *           type: integer
 *           default: 2121
 *           description: NDS服务器端口
 *         Protocol:
 *           type: string
 *           enum: [FTP, SFTP]
 *           default: SFTP
 *           description: 连接协议
 *         Account:
 *           type: string
 *           maxLength: 100
 *           description: 账号
 *         Password:
 *           type: string
 *           maxLength: 100
 *           description: 密码
 *         MRO_Path:
 *           type: string
 *           maxLength: 250
 *           default: /MR/MRO/
 *           description: MRO文件路径
 *         MRO_Filter:
 *           type: string
 *           maxLength: 250
 *           default: ^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$
 *           description: MRO文件过滤规则
 *         MDT_Path:
 *           type: string
 *           maxLength: 250
 *           default: /MDT/
 *           description: MDT文件路径
 *         MDT_Filter:
 *           type: string
 *           maxLength: 250
 *           default: ^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$
 *           description: MDT文件过滤规则
 *         Switch:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *           description: 开关状态
 * 
 * @swagger
 * /api/nds/list:
 *   get:
 *     tags: [NDS服务器管理]
 *     summary: 获取NDS服务器列表
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
 *         description: 搜索关键词（服务器名称或地址）
 *     responses:
 *       200:
 *         description: 成功获取NDS服务器列表
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
 *                         $ref: '#/components/schemas/NDSList'
 *
 * @swagger
 * /api/nds/{id}:
 *   get:
 *     tags: [NDS服务器管理]
 *     summary: 获取单个NDS服务器详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: NDS ID
 *     responses:
 *       200:
 *         description: 成功获取NDS服务器详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/NDSList'
 * 
 * @swagger
 * /api/nds/add:
 *   post:
 *     tags: [NDS服务器管理]
 *     summary: 添加NDS服务器
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NDSList'
 *     responses:
 *       200:
 *         description: NDS服务器添加成功
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
 *                     ID:
 *                       type: integer
 *                       description: 新创建的NDS ID
 * 
 * @swagger
 * /api/nds/{id}:
 *   put:
 *     tags: [NDS服务器管理]
 *     summary: 更新NDS服务器
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: NDS ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NDSList'
 *     responses:
 *       200:
 *         description: NDS服务器更新成功
 *   delete:
 *     tags: [NDS服务器管理]
 *     summary: 删除NDS服务器
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: NDS ID
 *     responses:
 *       200:
 *         description: NDS服务器删除成功
 * 
 * @swagger
 * /api/nds/{id}/test:
 *   post:
 *     tags: [NDS服务器管理]
 *     summary: 测试NDS服务器连接
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: NDS ID
 *     responses:
 *       200:
 *         description: 连接测试结果
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
 *                     isConnected:
 *                       type: boolean
 *                       description: 是否连接成功
 *                     message:
 *                       type: string
 *                       description: 连接结果信息
 */
