/**
 * @swagger
 * components:
 *   schemas:
 *     TaskList:
 *       type: object
 *       required:
 *         - TaskName
 *         - DataType
 *         - StartTime
 *         - EndTime
 *       properties:
 *         TaskID:
 *           type: integer
 *           format: int64
 *           description: 任务ID
 *         TaskName:
 *           type: string
 *           description: 任务名称
 *         DataType:
 *           type: string
 *           enum: [MRO, MDT]
 *           description: 解析数据类型
 *         StartTime:
 *           type: string
 *           format: date-time
 *           description: 任务数据开始时间
 *         EndTime:
 *           type: string
 *           format: date-time
 *           description: 任务数据结束时间
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 * 
 * @swagger
 * /api/task/add:
 *   post:
 *     tags: [任务管理]
 *     summary: 创建任务
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - TaskName
 *               - DataType
 *               - StartTime
 *               - EndTime
 *               - eNodeBIDs
 *             properties:
 *               TaskName:
 *                 type: string
 *                 description: 任务名称
 *               DataType:
 *                 type: string
 *                 enum: [MRO, MDT]
 *                 description: 解析数据类型
 *               StartTime:
 *                 type: string
 *                 format: date-time
 *                 description: 任务数据开始时间
 *               EndTime:
 *                 type: string
 *                 format: date-time
 *                 description: 任务数据结束时间
 *               eNodeBIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 基站ID列表
 *     responses:
 *       200:
 *         description: 任务创建成功
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
 *                     TaskID:
 *                       type: integer
 *                       description: 任务ID
 *                 message:
 *                   type: string
 *                   example: 任务创建成功
 * 
 * @swagger
 * /api/task/list:
 *   get:
 *     tags: [任务管理]
 *     summary: 获取任务列表
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
 *         name: DataType
 *         schema:
 *           type: string
 *           enum: [MRO, MDT]
 *         description: 数据类型过滤
 *     responses:
 *       200:
 *         description: 成功获取任务列表
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
 *                         $ref: '#/components/schemas/TaskList'
 * 
 * @swagger
 * /api/task/detail/{taskId}:
 *   get:
 *     tags: [任务管理]
 *     summary: 获取任务详情
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 成功获取任务详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/TaskList'
 *                     - type: object
 *                       properties:
 *                         enbTasks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ID:
 *                                 type: integer
 *                               eNodeBID:
 *                                 type: integer
 * 
 * @swagger
 * /api/task/{taskId}/enbs:
 *   put:
 *     tags: [任务管理]
 *     summary: 更新任务的基站列表
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addEnbs:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要添加的基站ID列表
 *               removeEnbs:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要删除的基站ID列表
 *     responses:
 *       200:
 *         description: 基站列表更新成功
 * 
 * @swagger
 * /api/task/{taskId}:
 *   delete:
 *     tags: [任务管理]
 *     summary: 删除任务
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 任务删除成功
 */
