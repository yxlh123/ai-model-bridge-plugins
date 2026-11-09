# 网页 AI 桥（qwen-bridge）

把网页版通义千问（chat.qwen.ai）包装成本地 OpenAI 兼容接口，供其他程序当模型用。

## 原理

用 Playwright（浏览器自动化库）驱动本机 Edge：

1. 打开 chat.qwen.ai
2. 把问题填进输入框、按回车
3. 等回复稳定后，把文字抓回来

对外提供 OpenAI 兼容的三个接口：

- `POST /v1/chat/completions`
- `GET /v1/models`
- `GET /health`

## 你要自己改的地方

打开 `bridge.mjs`，看文件开头的几行：

| 变量 | 默认值 | 改成什么 |
| --- | --- | --- |
| `EDGE` | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` | 你自己电脑上的 Edge 路径 |
| `PORT` | `18765` | 端口被占用了就换一个 |
| `MODEL` | `qwen3.7-plus` | 你想在网页上用的模型名 |
| `PROFILE` | 脚本同目录下的 `edge-profile` | 登录态存放目录，一般不用动 |

也可以用环境变量覆盖：`WEBQWEN_PORT`、`WEBQWEN_PROFILE`、`WEBQWEN_MODEL`。

## 使用步骤

```bash
npm i
node bridge.mjs
```

第一次运行会弹出 Edge，**手动登录一次通义千问**，登录态会存进 `edge-profile/`。之后其他程序把 `http://127.0.0.1:18765/v1` 当 OpenAI 接口用即可。

## 注意

- `edge-profile/` 是登录态，**绝对不要提交到仓库**；
- 网页改版可能导致抓取失效，到时候要改选择器；
- 仅供学习，请遵守网站的使用条款。

## 目录里的其它脚本

`check-*.mjs`、`click-*.mjs`、`test-*.mjs`、`open-*.mjs` 这些是当时调试登录、找按钮、测接口时的一次性脚本，不保证还能跑，留着当过程记录看。
