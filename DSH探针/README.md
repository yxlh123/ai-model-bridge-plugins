# DSH 探针脚本

调查 DeepSeek Harness（DSH）内部结构时写的一次性脚本合集。**不是能直接用的产品，是查东西用的工具。**

## 里面有什么

| 类别 | 文件 | 干嘛的 |
| --- | --- | --- |
| 解包 asar | `asar_*.py`、`ls_asar_*.py`、`scan_asar*.py` | 把 DSH 的 `app.asar` 拆开，看里面有哪些文件 |
| 找配置 | `find-*.py`、`check-yaml*.js` | 在 DSH 的配置里翻某个选项 |
| 读会话 / 工作区 | `read-proj*.py`、`read-sess*.py`、`ls_acp.py` | 读 DSH 的会话缓存与工作区索引 |
| 提取代码 | `extract_*.py` | 从 asar 里提取指定模块，存成独立文件 |
| 网络探测 | `net_probe.py`、`gh_*.py` | 测网络连通性、取 GitHub 资源 |

## 你要自己改的地方

**所有脚本里的路径都是示例路径，直接跑会找不到文件。** 跑之前把下面这几类改成本机实际位置：

| 脚本里的写法 | 含义 | 你要改成 |
| --- | --- | --- |
| `C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar` | DSH 的安装目录 | 你自己的 DSH 安装位置 |
| `C:\Users\<用户名>\.dsh\...` | DSH 的用户数据目录 | 你自己的用户数据目录 |
| `C:\Users\<用户名>\Documents\deepseek-harness\...` | 工作区目录 | 你自己的项目路径 |

另外，`<用户名>` 这个占位符本身也要换成你电脑的用户名。

## 注意

- 这些脚本是**一次性调查用的**，不是长期维护的项目；DSH 版本一变就可能跑不通；
- 从 DSH 应用里提取出来的第三方代码（`ui-workspace-client.js`、`pi-ai-index.js`、`model-selection-client.js`、`dsh-workspace-index.js` 等）**没有放进这个仓库**，避免版权问题；
- 脚本只读本地文件，不联网（`gh_*.py` 除外）。
