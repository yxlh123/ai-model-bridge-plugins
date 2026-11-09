# coyote-hand · 郊狼手柄

只做执行的一层壳。**不做决策、不带人设**——谁想按，谁在外面想好了再来按。

- 监听：`127.0.0.1:3210`（只本机）
- 令牌：`config.json` 里的 `token`，请求带 `Authorization: Bearer <token>`（也认 `x-hand-token` 和 `?token=`）
- 网页：`http://127.0.0.1:3210/?token=<token>`

## 启动

双击 `start.cmd`（已在运行则直接跳过），或：

```
node server.ts
```

依赖只两个：`dglab-kit`（官方中继协议）和 `qrcode`（配对码）。

## 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/state` | 设备状态、强度、上限、通道波形、护栏值 |
| GET | `/api/waveforms` | 内置波形清单（24 条） |
| POST | `/api/connect` | `{"protocol":"v4"}` 或 `"v3"` 或 `"simulator"` |
| POST | `/api/select` | `{"clientId":"…","slotId":"…"}`，一般不用手动调 |
| POST | `/api/disconnect` | 断开中继 |
| POST | `/api/set` | `{"A":30}` / `{"B":12}`，只写要改的通道 |
| POST | `/api/pulse` | `{"channel":"A","waveform":"builtin-0-挤压"}`，`null` 停止波形 |
| POST | `/api/stop` | 立即归零（相当于紧急停止） |
| POST | `/api/keepalive` | 喂看门狗；超过 `watchdogMs` 没人喂就自动归零 |

返回统一 `{ok:true,data:…}` 或 `{ok:false,code,error}`。

## 护栏（config.json）

```json
{
  "port": 3210,
  "token": "…",
  "hardMax": 60,
  "stepMax": 10,
  "minIntervalMs": 1500,
  "watchdogMs": 60000
}
```

- `hardMax`：单通道绝对上限，超过直接拒绝（`OUT_OF_RANGE`）
- `stepMax`：一次调用最多变多少（`STEP_TOO_LARGE`），防跳变
- `minIntervalMs`：两次改动的最小间隔（`RATE_LIMITED`），防爬升过快
- `watchdogMs`：多久没 `keepalive` 就归零

改完重启生效。**先照抄的四条不是建议值，是你要亲手填的那四个数。**

## 边界

- 它不判断"该不该"，只管"能不能"：所有拒绝都在服务端，绕不过去。
- 它不认识安全词；安全词要在调用它的那一侧先拦，别送进模型。
- `stop` 永远是安全的：不受间隔限制，任意时刻立即生效。
- 真实设备还要在郊狼 APP 里另设一道上限，软件封顶挡不住硬件层面的误操作。
