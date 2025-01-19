/**
 * 获取客户端真实IP
 * @param {Object} req - 请求对象
 * @returns {string} 客户端IP
 */
const getClientIP = (req) => {
  // 尝试从X-Forwarded-For获取
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // 取第一个IP（最原始的客户端IP）
    const ips = forwardedFor.split(",");
    const clientIP = ips[0].trim();
    if (clientIP && clientIP !== "::1" && clientIP !== "127.0.0.1") {
      return clientIP;
    }
  }

  // 尝试从X-Real-IP获取
  const realIP = req.headers["x-real-ip"];
  if (realIP && realIP !== "::1" && realIP !== "127.0.0.1") {
    return realIP;
  }

  // 从socket获取
  const ip = req.socket.remoteAddress;
  if (ip) {
    // 去除IPv6前缀
    const realIP = ip.replace(/^::ffff:/, "");
    if (realIP && realIP === "::1") {
      return "127.0.0.1";
    }
    return realIP;
  }

  return "127.0.0.1";
};

module.exports = {
  getClientIP,
};