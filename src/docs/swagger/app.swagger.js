/**
 * @swagger
 * tags:
 *   - name: 系统状态
 *     description: 系统相关的API接口
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [系统状态]
 *     summary: 获取服务状态
 *     description: 返回服务运行状态
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Status:
 *                   type: string
 *                   description: 服务状态信息
 *                   example: 程序运行中
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 错误信息
 *                   example: 服务器内部错误
 */

/**
 * @swagger
 * /restart:
 *   post:
 *     tags: [系统状态]
 *     summary: 重启服务
 *     description: 重启整个应用程序服务
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Status:
 *                   type: string
 *                   description: 重启状态信息
 *                   example: 正在重启服务...
 *       500:
 *         description: 重启失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 错误信息
 *                   example: 重启失败
 */
