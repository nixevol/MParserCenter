# MParser Center API 文档

## 目录

- [基础信息](#基础信息)
- [扫描器管理](#扫描器管理)
- [网关管理](#网关管理)
- [NDS服务器管理](#nds服务器管理)
- [小区数据管理](#小区数据管理)
- [任务管理](#任务管理)

## 基础信息

### 服务器信息
- 基础URL: `http://localhost:9002`
- API文档: `http://localhost:9002/api-docs`

### 响应格式

所有API响应都遵循以下格式：

```json
{
  "code": 200,      // 状态码
  "message": "",    // 消息
  "data": {}        // 数据
}
```

### 状态码说明

- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

## 扫描器管理

### 获取扫描器列表

```http
GET /api/scanner
```

**查询参数：**
- `Status` (可选): 扫描器状态，0=离线，1=在线

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "ID": 1,
      "NodeName": "Scanner-1",
      "GatewayID": 1,
      "Host": "192.168.1.100",
      "Port": 8080,
      "Status": 1,
      "Switch": 1,
      "ndsList": [],
      "gateway": {}
    }
  ]
}
```

### 获取单个扫描器

```http
GET /api/scanner/{id}
```

**路径参数：**
- `id`: 扫描器ID

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "ID": 1,
    "NodeName": "Scanner-1",
    "GatewayID": 1,
    "Host": "192.168.1.100",
    "Port": 8080,
    "Status": 1,
    "Switch": 1,
    "ndsList": [],
    "gateway": {}
  }
}
```

### 注册扫描器

```http
POST /api/scanner/register
```

**请求体：**
```json
{
  "ID": 1,        // 可选，如果提供则更新现有扫描器
  "Port": 8080    // 必需，扫描器端口
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "扫描器注册成功",
  "data": {
    "ID": 1,
    "NodeName": "Scanner-1",
    "Host": "192.168.1.100",
    "Port": 8080,
    "Status": 1
  }
}
```

### 设置扫描器网关

```http
POST /api/scanner/gateway
```

**请求体：**
```json
{
  "scannerId": 1,    // 必需，扫描器ID
  "gatewayId": 1     // 必需，网关ID
}
```

### 添加NDS服务器映射

```http
POST /api/scanner/nds
```

**请求体：**
```json
{
  "scannerId": 1,           // 必需，扫描器ID
  "ndsIds": [1, 2, 3]       // 必需，NDS服务器ID数组
}
```

### 删除NDS服务器映射

```http
DELETE /api/scanner/nds
```

**请求体：**
```json
{
  "scannerId": 1,           // 必需，扫描器ID
  "ndsIds": [1, 2, 3]       // 必需，NDS服务器ID数组
}
```

### 更新扫描器

```http
PUT /api/scanner/{id}
```

**路径参数：**
- `id`: 扫描器ID

**请求体：**
```json
{
  "NodeName": "Scanner-1",    // 可选，扫描器名称
  "Status": 1,               // 可选，状态
  "Switch": 1                // 可选，开关
}
```

### 删除扫描器

```http
DELETE /api/scanner/{id}
```

**路径参数：**
- `id`: 扫描器ID

## 网关管理

### 获取网关列表

```http
GET /api/gateway
```

**查询参数：**
- `Status` (可选): 网关状态，0=离线，1=在线

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "ID": 1,
      "NodeName": "Gateway-1",
      "Host": "192.168.1.100",
      "Port": 8080,
      "Status": 1,
      "Switch": 1,
      "ndsList": [],
      "scanners": []
    }
  ]
}
```

### 获取单个网关

```http
GET /api/gateway/{id}
```

**路径参数：**
- `id`: 网关ID

### 注册网关

```http
POST /api/gateway/register
```

**请求体：**
```json
{
  "ID": 1,        // 可选，如果提供则更新现有网关
  "Port": 8080    // 必需，网关端口
}
```

### 添加NDS服务器映射

```http
POST /api/gateway/nds
```

**请求体：**
```json
{
  "gatewayId": 1,           // 必需，网关ID
  "ndsIds": [1, 2, 3]       // 必需，NDS服务器ID数组
}
```

### 删除NDS服务器映射

```http
DELETE /api/gateway/nds
```

**请求体：**
```json
{
  "gatewayId": 1,           // 必需，网关ID
  "ndsIds": [1, 2, 3]       // 必需，NDS服务器ID数组
}
```

### 更新网关

```http
PUT /api/gateway/{id}
```

**路径参数：**
- `id`: 网关ID

**请求体：**
```json
{
  "NodeName": "Gateway-1",    // 可选，网关名称
  "Status": 1,               // 可选，状态
  "Switch": 1                // 可选，开关
}
```

### 删除网关

```http
DELETE /api/gateway/{id}
```

**路径参数：**
- `id`: 网关ID

## NDS服务器管理

### 获取NDS服务器列表

```http
GET /api/nds
```

**查询参数：**
- `Switch` (可选): 开关状态，0=关闭，1=开启

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "ID": 1,
      "Name": "NDS-1",
      "Address": "192.168.1.200",
      "Port": 2121,
      "Protocol": "SFTP",
      "Account": "user",
      "Password": "******",
      "MRO_Path": "/MR/MRO/",
      "MRO_Filter": "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
      "MDT_Path": "/MDT/",
      "MDT_Filter": "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
      "Switch": 1
    }
  ]
}
```

### 获取单个NDS服务器

```http
GET /api/nds/{id}
```

**路径参数：**
- `id`: NDS服务器ID

### 创建NDS服务器

```http
POST /api/nds
```

**请求体：**
```json
{
  "Name": "NDS-1",
  "Address": "192.168.1.200",
  "Port": 2121,
  "Protocol": "SFTP",
  "Account": "user",
  "Password": "password",
  "MRO_Path": "/MR/MRO/",
  "MRO_Filter": "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
  "MDT_Path": "/MDT/",
  "MDT_Filter": "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
  "Switch": 1
}
```

### 更新NDS服务器

```http
PUT /api/nds/{id}
```

**路径参数：**
- `id`: NDS服务器ID

**请求体：**
```json
{
  "Name": "NDS-1",
  "Address": "192.168.1.200",
  "Port": 2121,
  "Protocol": "SFTP",
  "Account": "user",
  "Password": "password",
  "MRO_Path": "/MR/MRO/",
  "MRO_Filter": "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
  "MDT_Path": "/MDT/",
  "MDT_Filter": "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
  "Switch": 1
}
```

### 删除NDS服务器

```http
DELETE /api/nds/{id}
```

**路径参数：**
- `id`: NDS服务器ID

## 小区数据管理

### 获取小区数据列表

```http
GET /api/celldata
```

**查询参数：**
- `page` (可选): 页码，默认1
- `pageSize` (可选): 每页数量，默认10
- `cellId` (可选): 小区ID
- `enbId` (可选): 基站ID

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "total": 100,
    "items": [
      {
        "ID": 1,
        "CellID": "460001234567",
        "EnbID": "123456",
        "CellName": "Cell-1",
        "Longitude": 116.123456,
        "Latitude": 39.123456
      }
    ]
  }
}
```

### 获取单个小区数据

```http
GET /api/celldata/{id}
```

**路径参数：**
- `id`: 小区数据ID

### 创建小区数据

```http
POST /api/celldata
```

**请求体：**
```json
{
  "CellID": "460001234567",
  "EnbID": "123456",
  "CellName": "Cell-1",
  "Longitude": 116.123456,
  "Latitude": 39.123456
}
```

### 更新小区数据

```http
PUT /api/celldata/{id}
```

**路径参数：**
- `id`: 小区数据ID

**请求体：**
```json
{
  "CellID": "460001234567",
  "EnbID": "123456",
  "CellName": "Cell-1",
  "Longitude": 116.123456,
  "Latitude": 39.123456
}
```

### 删除小区数据

```http
DELETE /api/celldata/{id}
```

**路径参数：**
- `id`: 小区数据ID

## 任务管理

### 获取任务列表

```http
GET /api/task
```

**查询参数：**
- `page` (可选): 页码，默认1
- `pageSize` (可选): 每页数量，默认10
- `status` (可选): 任务状态，0=待执行，1=执行中，2=已完成，3=失败

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "total": 100,
    "items": [
      {
        "ID": 1,
        "TaskName": "Task-1",
        "TaskType": "MRO",
        "Status": 1,
        "Progress": 50,
        "StartTime": "2025-01-19T08:00:00Z",
        "EndTime": null
      }
    ]
  }
}
```

### 获取单个任务

```http
GET /api/task/{id}
```

**路径参数：**
- `id`: 任务ID

### 创建任务

```http
POST /api/task
```

**请求体：**
```json
{
  "TaskName": "Task-1",
  "TaskType": "MRO",
  "Parameters": {
    "startTime": "2025-01-19T08:00:00Z",
    "endTime": "2025-01-19T09:00:00Z",
    "cellIds": ["460001234567"]
  }
}
```

### 取消任务

```http
POST /api/task/{id}/cancel
```

**路径参数：**
- `id`: 任务ID

### 删除任务

```http
DELETE /api/task/{id}
```

**路径参数：**
- `id`: 任务ID
