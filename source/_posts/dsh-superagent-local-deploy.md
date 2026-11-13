---
title: 服务全绿，Issue 却没人接：DeepSeek Superagent 本机部署踩坑记
date: 2026-11-13 12:14:00
updated: 2026-11-13 12:14:00
tags:
  - AI 工程化
  - Agent
  - DeepSeek Harness
  - GitHub
categories:
  - AI 工程化
description: 本机部署 DeepSeek Harness Superagent 后服务全绿，连续测试三个 Issue 却只有第三个被接单。记录账号配置、准入判断和从消息到回复的实际过程。
---

> 本文的 Superagent 指 DeepSeek Harness（dsh）上的官方研究原型 [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)，不是 npm 上那个 superagent HTTP 客户端。

## 我先在助手对话里 @ 了它

服务启动后，我先在当时协助部署的助手对话里发了一句「@Agent 小号，讲一下 superagent 的使用」，没有收到回复。面板上的 `running` 和 `queued` 都是 0。

这次部署只启用了 GitHub 来源，助手对话里的消息不会进入它的处理流程。请求需要从配置好的 GitHub 入口发出。

换到 GitHub 后，我连续测试了三个 Issue，只有第三个收到了回复。

<picture>
  <source media="(max-width: 640px)" srcset="/img/superagent/issues-stack.png">
  <img src="/img/superagent/issues.png" alt="三个 Issue，为什么只有一个被接？">
</picture>

## 装起来其实不难

真正的安装步骤很朴素，我把骨架列在这里，细节看官方仓库的部署文档：

```sh
npm install -g @deepseek-ai/dsh@0.2.1-rc.3   # 我用的版本
# clone 插件源码后
pnpm install && pnpm build
# 新建 superagent profile 挂上插件，再 clone 一份练手仓当工单 worktree 的来源
gh auth login          # 我自己的账号
gh-agent auth login    # Agent 专用账号
scripts/dsh-superagent status
```

`gh-agent` 不是系统自带的命令。官方部署文档让你在 `~/.local/bin/gh-agent` 放一个包装脚本，单独设置 `GH_CONFIG_DIR`，再调用 `gh`，这样 Agent 账号的登录不会和我自己的 `gh` 搅在一起。上面那行 `gh-agent auth login`，就是在给这个脚本登录 Agent 账号。

练手仓我是直接 fork 官方仓库的。Agent 要的其实只是一个它有写权限的 `owner/name`，新建空仓也行，fork 只是自带一份代码可以拿来问。

最后 `status` 里 `runtime` 和 `github` 都是 `ready`。我当时以为最难的部分结束了。安装完成后，时间主要花在账号、权限和接单排查上。

直接访问 `127.0.0.1:3082` 会提示 `dsh web authentication required`，使用服务启动时输出的带 token 地址即可进入面板。

## 坑一：我把「提需求的人」和「干活的 Agent」配成了同一个账号

一开始，我觉得给 Agent 单独注册 GitHub 账号有点麻烦：反正只是自己测试，让它用我的账号不就行了？

后来才发现，这个省事的决定，把几件本来应该分开的事搅在了一起：

| 身份 | 在这套部署里负责什么 |
|---|---|
| 提需求的人 | 在 Issue 里提出请求，需要进入白名单 |
| Agent 账号 | 接收通知、读取请求、发表评论，需要相应的仓库权限 |
| 仓库所有者 | 管理仓库和协作者，不一定要和前两个身份绑定 |

我当时把它们都当成了「GitHub 登录好了没有」。但登录成功，只能证明某个账号能用，不能证明服务正在用正确的账号接单。

后来的 Issue #1 就是用 Agent 小号自己创建的，没有被接单。源码中有跳过 Agent 自身发言的逻辑，因此测试时需要由大号发需求、小号执行。

账号有了，权限还有下一关。我给小号发了仓库的 write 协作邀请，才意识到：发出邀请不等于已经获得权限，还得登录小号接受。

最后采用小号持有仓库、大号提需求的配置，并同步修改了 Source 中的仓库名和本地 remote。仓库转移不是必要步骤，关键是执行账号有仓库权限，提需求的账号在白名单内。

另外，终端一度提示 `gh-agent: command not found`。这次不是认证失败：脚本已经在 `~/.local/bin`，只是当前终端的 PATH 没包含这个目录，用完整路径就能执行。

这一圈绕下来，我才不再把「账号配好了」当成一个状态。至少要分别确认：

- 当前执行 GitHub 操作的是不是 Agent 小号；
- 小号是否已经拥有仓库权限；
- 提需求的大号是否在白名单里；
- Source 配置是否指向这次测试的仓库。

其中任何一个没对齐，都可能表现成同一句话：怎么没反应？

我的配置最后是这样，偏保守：

| 项 | 取值 |
|---|---|
| 来源 | 只启用 GitHub，监听练手仓（飞书没配） |
| 白名单 | 只有我的大号 |
| auto-merge | 关 |
| 分支前缀 | `agent/` |

## 坑二：状态全绿，为什么三个 Issue 只接了一个？

`status` 里 `runtime` 和 `github` 都显示 `ready` 时，我以为已经可以用了。

接下来三个 Issue，让我发现这个判断下得太早。

服务 `ready` 和某条消息被接成工单，中间还隔着好几步。

按后面读到的代码，一条新请求要先被 GitHub 来源读到，再经过身份和准入判断，才有机会进入路由、建立工单。面板里没有 `running` 或 `queued`，只能说明当时没看到正在运行或排队的任务，不能直接告诉我消息卡在了哪里。

Issue #1 比较好解释：发消息的就是 Agent 自己，来源层有明确的跳过逻辑。`src/sources/github.ts` 里，不管是读通知后的 `readNotified()`，还是读评论的 `intakeComments()`、按仓库扫的 `readStream()`，都会先跳过 Agent 自己写的东西：

```ts
// src/sources/github.ts  readNotified()
const opened = Date.parse(issue.created_at) >= Date.parse(since)
  && !sameName(issue.user.login, login)
if (opened) await ctx.receive(issueTrigger(issue, login))
```

Issue #2 才是这次真正没查完的坑。它是大号开的，正文第一句也 @ 了小号，表面条件看起来都满足，但没有回应。

后来翻源码，我找到几个值得核对的方向：

第一，Issue 是不是开得太早了。来源第一次开始轮询时会建立时间起点 `since`，`readNotified()` 只收 `created_at >= since` 的 Issue 正文。如果 #2 早于这个起点，正文可能就没有进入接收流程。#3 的标题是「开启开关后测试」，和这个方向相符，但我已经记不清当时打开的是哪个开关，所以还不能把它当成结论。

第二，消息是否已经被接收过。同一个 Issue 正文使用固定的 Trigger id，在 `issueTrigger()` 里是 `key('github-issue', 编号)`；如果已经被记录过，Engine 的 `Intake.receive()` 会返回 `duplicate`，再关闭、重开，不一定会产生一次新的处理机会。这里的前提是「之前已经接收过」，不能只凭重开后没反应，就认定是去重拦住了。

第三，当时的白名单是不是已经生效。现在配置正确，不代表 #2 发出时也正确。如果它当时被准入规则拒绝，后来补好名单，也不会自动回头重评这一条（`policyChanged` 只重启正在进行的评估）。

这几种情况在外面看都一样：Issue 安安静静，没有回复。但下一步要查的东西完全不同。

如果重新排查，我会先找 #2 对应的 Trigger：有记录，再看 Decision 的结果和原因；找不到记录，就继续查来源读取、时间起点和监听范围。没有记录本身，还不足以判定是哪一步出了问题。

另外，项目文档提醒过：编辑旧 Issue 正文补一个 @，不会按新消息读取。需要继续测试时，可以用白名单账号新发一条评论并 @ Agent。不过这只能验证当前链路，不能反过来证明 #2 当时为什么失败。

Issue #3 最后接到了。从创建 Issue 到小号回「收到」，大概一分钟；又过两三分钟，完整回答出来了。

我当时还在问「为什么还没有监听到」，其实它已经回了。后来读代码，才知道这里默认按分钟轮询 GitHub 通知。这次等待时长与轮询机制相符，并不是聊天机器人那种发完就立即响应的体验。

我在 #3 里请它介绍这个项目的整体架构、监听机制和运行过程。「收到」之后贴出的那篇说明，内容是基于仓库代码和文档写的，并且带了「This is by an automated agent, not a human」这行身份说明。我接着在同一个 Issue 里追问：面板上的「轨迹」是什么意思、路由是干嘛用的。没有再 @，它照样先回一句「收到」，一两分钟后给出了第二份解答。

![Issue #3：约一分钟确认，随后返回完整回答](/img/superagent/timeline.png)

请求、回答和后续追问集中在同一个 Issue，便于异步处理和回看。

没回复只是现象。先找到消息走到了哪一步，再判断该改账号、权限、来源配置，还是继续等执行结果。

## 从消息到工单的处理流程

Issue 被读到之后，还要经过哪些判断？下面依据官方仓库 [8c32a9d](https://github.com/deepseek-ai/dsh-superagent-prototype/commit/8c32a9dc5d72c033816c6a8110b37f40cf94fba4)（2026-10-31）这一版源码来看，以下为关键代码节选，省略部分分支，文件路径照抄。画图用的是 [Excalidraw](https://excalidraw.com)。

一条新请求从提出到得到回答，可以先看成这五步。同一 Issue 上的追问会优先交给已经建立的工单：

<picture>
  <source media="(max-width: 640px)" srcset="/img/superagent/flow-stack.png">
  <img src="/img/superagent/flow.png" alt="从一条 Issue 到一条回答，中间发生了什么？">
</picture>

图中「检查与接单」是先由代码检查，再由主 Session 路由；「执行任务」由 Worker 完成。工单范围内的追问由原 Worker 继续处理；超出范围的请求可以退回路由，重新评估。文件路径和函数名写在下面各节。

当时在 #3 里，我追问过「路由是干嘛用的」。对照文档和 `src/policy.ts`、`prompts/` 之后可以看到：请求到达模型之前，会先经过来源过滤和准入判断。通过这些检查后，才交给模型路由；模型决定接单后，仍需通过相应的代码校验。

下面按四个问题来看：消息从哪里进来，为什么会被跳过或拒绝，谁决定接单、谁执行，以及回答怎么回到 Issue。更细的准入判断、提示词拼装、状态枚举和存储结构放到文末附录。

### 消息从哪里进来

入口是一个 dsh 插件。真正「听」消息的是另外挂的 Source，`cordis.patch.yml` 里写得很直白：

```yaml
# cordis.patch.yml
- id: dsh-superagent
- id: dsh-superagent-github
  name: dsh-superagent/github-watch
- id: dsh-superagent-feishu
  name: dsh-superagent/feishu-watch
  disabled: true
```

主插件一个，GitHub 一个，飞书一个，飞书默认关着。代码里也只有这两套实现。所以开头那件事就清楚了：**我在助手对话里 @ 它，根本没有哪段代码在听。**

我原以为 GitHub 是 Webhook，实际是轮询。`src/sources/github.ts` 里的 `watch()` 每一轮调 `pollRound()`，默认间隔 60 秒，配置里最小也是 60：

```ts
// src/sources/github.ts  pollRound()
const notified = await pollNotifications(ctx, round)  // Agent 账号的通知
await pollRepository(ctx, round)   // 打开了「接收仓库里的…」开关才读
await pollTicketPulls(ctx, signal, round)  // 工单 PR 的 CI
await pollThreads(ctx, signal, round)      // 已订阅的 Issue/PR
```

关键是第一行：它读的是 **Agent 账号的 GitHub 通知**。你在 Issue 里 @ 了小号，小号就会收到一条通知，下一轮轮询看到通知，再去读那个 Issue。这和 #3 大约一分钟才回「收到」对得上。

读到的 Issue 会被翻译成一个 `Trigger`，顺手打两个标记：`human` 表示是不是人写的（Agent 自己写的不算），`addressed` 表示有没有 @ 它。后面的准入判断会用到这两个标记。

```ts
// src/sources/github-trigger.ts
const author = (user, agent) =>
  ({ actor: { source: SOURCE, id: user.login },
     human: isHumanLogin(user) && !sameName(user.login, agent) })
// issueTrigger()：正文里 @ 了 Agent 账号才算 addressed
...(mentions(body, agent) ? { addressed: 'mention' as const } : {}),
```

### 模型出场前：来源过滤、准入判断，以及已有工单的跟进

先是来源自己滤。GitHub 插件在进 Engine 之前就会丢掉 Agent 自己写的内容，不在监听范围的也不收。助手对话里的 @ 更是连这都排不上——那里没有 Source。#1 就是停在这里的。

再是准入门 `Policy.gate()`，写在 `src/policy.ts` 里，纯函数，不调模型。Trigger 进来之后交给 Engine，先存档，再排队评估，第一步就是 `gate()`：

```ts
// src/policy.ts  settingsPolicy() → gate()
const allowed = allowedSender(settings, trigger.actor)
if (allowed && trigger.addressed)
  return { admissible: true, strength: 'explicit', ... }
...
return { admissible: false,
  reason: !allowed ? 'not_a_member' : ... : 'no_mention' }
```

人的消息进来，它按固定规则给一个强度：

- 在白名单里，并且 @ 了它（或私信），记成 `explicit`，这是「明确请求」。**白名单 + @，是默认配置下明确请求的那条路，不是进门的唯一方式。**
- 其余的看一张「准入表」（`src/admission.ts`）。默认值很狠：名单外的人就算 @ 了，单元格 `unlistedAddressed` 默认是 `ignore`；名单外且没 @ 的，默认也是 `ignore`。只有「名单里的人没 @」这一格默认是 `inferred`（推断候选），而且有前提：对尚未归属已有工单的新消息，只有来源开启了对应范围的全量接收，白名单账号未 @ 的消息才可能成为推断候选；在默认 `observe` 模式下，研判通过也不会真正建单。
- 机器人走另一条路：不在机器人名单里的直接 `not_human`；在名单里的最多也只是 `inferred`，永远当不成明确请求。

部署文档（`docs/006-deployment.md`）里还有一句我当时没留意：名单是空的时候，任何请求都变不成工单。过不了这道门的，原因码就是 `not_a_member`、`no_mention`、`not_human`、`admission_ignored`，到不了主 Session。

还有一个总开关：接受模式，默认是 `observe`。`off` 时所有推断候选直接丢掉；`observe` 时模型可以研判，就算研判通过，也只记一条「本来会接」（`would_accept`），不会真的建工单；只有切到 `auto`，主动接单才会发生。明确请求不受这个开关影响。文档里写得很明白：先在 `observe` 里看它会怎么判，觉得对了再开 `auto`。

这就是我那张保守配置表的意义：白名单只放大号，等于只有大号发出的明确请求能通过这层准入判断，是否建单还要经过路由；已有工单上的跟进，会继续交给对应工单处理。名单里没 @ 的消息，即使来源开了全量接收、成为推断候选，默认也只观察、不真接。

已有工单还有另一条路。工单一建立就会订阅那个 Issue，之后上面的新消息会直接交给这张工单的 Worker，人写的跟进不重新排队评估，主 Session 只能在被要求停工时插手。

这里要分开看：需要评估的新请求，会进入候选卡片和路由流程；已经订阅的线程跟进，则交给已有工单处理。#3 的第二轮提问属于后者，不能把它理解成重新接了一次单。更细的判断步骤见附录里的准入流程。

### 谁决定接单、谁执行

过了准入、需要评估的新请求，会变成一张候选卡片，交给常驻的主 Session 去路由。它用的预设叫 `dsh-superagent-router`。系统提示词一开头就把角色定死了，`prompts/orchestrator.md` 原文是：

> You are the orchestrator: assess and route requests for the deployment's repository.
> Workers investigate and implement; never add implementation plans.

翻译成人话：你是调度，不是干活的。不要给请求加方案。核心工具是 `orchestrator_route`，每条决定只能是四种之一：`accept` 开一张新工单，`attach` 挂到已有工单（必须明确指向那张工单，光是「话题像」不行），`stop` 是人明确要求停，`ignore` 则记下原因。

明确请求走这条工具直接分拣。推断候选一般要再走一遍研判。提示词要求模型先确认三件事：讨论针对的是这个项目、参与者明确希望落地某一处改动、方向已经稳定到可以做一次小的本地修改。拿不准就安静地 `ignore`。

就算模型说 accept，`src/policy.ts` 里的 `assessmentOutcome()` 和 `directionAllowed()` 还会再验一遍：改动请求必须成立，目标不能是未确定，也不能还在做设计决定，还得提交带出处的意图证据，并且至少命中一条启用中的规则。如果当前是 `observe` 模式，再对也只记 `would_accept`。**模型给出 accept，并不意味着一定建单，还要通过代码校验。**

默认启用的规则只有两条，都很窄：改文案（`copy`）和局部样式（`visual`）。明确请求不走这些规则，由路由层直接分拣。

我在 #3 里请它介绍架构，走的就是明确请求的路：过闸 → 候选卡片 → `orchestrator_route accept` → 建工单、回「收到」。主 Session 没有自己去读代码写那篇长文，那是下一层 Worker 的事。

`accept` 之后，Engine 在一个事务里建好工单、授权和第一个 Assignment，再把一句确认语丢进 Outbox。**Issue 里那句「收到」就是这么来的**，发送在 `src/core/replies.ts` 的 `acknowledgeAccepted()`。

面板上的 `queued` 对应的是 `working / queued`。这两个数都是 0，只能说明没有正在运行或排队的任务；是否存在其他状态的工单，还要看工单列表。

真正干活的是每张工单自己的 Worker Session，预设 `dsh-superagent-worker`，在独立目录里做技术工作。目录不存在时，先跑配置里的 prepare 命令；官方示例是 `git worktree add`，所以「每单一个 worktree」其实是 prepare 做的，不是写死在代码里的。PR 要跟工单对上，代码匹配的是分支最后一段；`agent/` 前缀用于区分 Agent 创建的分支。不过 PR 这条路我还没实际跑过。

Worker 的提示词还叮嘱：编排器接了单，不等于方向已经成立。对主动规则接来的工单，Worker 还要核对改动是否符合规则范围；不符合时报告 dropped，不自行扩大任务。

### 回答怎么回到 Issue

Worker 不直接往 GitHub 写长评。开工前的确认由它调用 `orchestrator_ack`，由宿主发到原帖；进展写在内部；要问人一个具体决定，只能走结构化的 `human_action`。主 Session 再用 `orchestrator_reply`，按用途交给 Outbox：确认收到、回答原问题、交付结果，或者把 Worker 记下的问题转出去。对外回复按用途校验；交付结果需要满足可交付或已结束的状态条件，普通执行进展不能冒充结果发送。

`src/app/outbox.ts` 是唯一对外写信的出口。发出去的 GitHub 评论末尾会藏一段 HTML 注释当标记，发送前先检查这个标记，用来减少重试造成的重复评论：

```ts
// src/sources/github-channel.ts  sendGithub()
const marker = `<!-- dsh-superagent:${message.id} -->`
if ((await commands.pages(CommentSchema, path)).some(mine)) return 'sent'
await commands.api(z.unknown(), target, '--method', 'POST', '-f', `body=${message.text}\n\n${marker}`)
```

Issue #3 里先一句「收到」、过一会儿再贴长文，就是确认消息先发出，完整回答在执行完成后返回。团队提示词规定，GitHub 上每条消息都以 `This is by an automated agent, not a human` 开头。第二句「收到」按代码应是 Worker 用 `orchestrator_ack` 发的，第一句来自主 Session 接单。这一点是按代码推的，我没去翻 Session 记录核对。

它的大部分代码不在调模型，在管「谁能让它干活、干到哪一步、话该回到哪」。模型只在主 Session 路由和 Worker 干活这两处出场，剩下的是白名单、状态机、队列和去重。这和我一开始以为的「模型看一眼 Issue，决定要不要干」不是一回事。

## 验证范围

本次验证覆盖 GitHub 接单和两轮问答，尚未测试改代码和开 PR 的流程。这次一个 PR 都没有。

- **没试**：飞书来源。
- **读代码弄清了**：#1 没被接，是因为代码会跳过 Agent 账号自己写的内容；路由层、转发层、研判提示词和默认规则，也是对源码和 `prompts/` 原文整理的。
- **还没搞清**：#2 到底卡在哪一步，代码里有几种可能，没在面板上核对。
- **没验证**：推断候选那条路。我没有在开启全量接收后，专门用一条「没 @ 的消息」去看 `observe` 模式下会不会留下 `would_accept`，也没把接受模式切到 `auto` 试过主动接单。

另外它本身就是研究原型，官方也是这么说的。本机部署时，服务跑在我自己电脑上，电脑一关，Agent 就停了。

## 后续验证

这些都还只是计划：

1. **走一遍 PR 流程**：提一个很小的改动需求（比如改一行 README），看它会不会从 `agent/` 分支开 PR，我再手动 review、合并。auto-merge 继续关着。
2. **把 #2 核对清楚**：源码已经读过了，下次直接在面板上看 #2 那条 Trigger 的记录和原因码。
3. **看一眼主动研判**：先在来源上开启对应范围的全量接收，再用一条白名单账号发的、但没 @ 它的消息，看 `observe` 模式下会不会留下 `would_accept`。
4. **试试飞书来源**：看看换个入口，体验有什么不一样。

试完了再来写续篇。

## 附录：源码里还可以再看的细节

下面这些不直接回答「为什么没接单」，但读源码时用得上。

### 排查时的准入流程

一条 GitHub 消息要经过哪些判断，可以顺着这张图看。#1 停在跳过自身发言；#3 走通了明确请求这条路。#2 尚未定位到哪一步，所以没有标在某一个关卡上。

![一条 GitHub 消息要过的几道关](/img/superagent/gate.png)

### 提示词是怎么拼出来的

系统提示词不是一整篇写死的文章，是 `src/app/prompts.ts` 按固定顺序拼出来的（`docs/004-prompts.md`）。两边都会读共用说明、团队说明、订阅与回复、交接和执行环境；角色文件不同，主 Session 读 `orchestrator.md`，Worker 读 `worker.md`。差别在于各自多出来的段落：

![两类 Session 的提示词有何不同？](/img/superagent/prompts.png)

主 Session 额外会拼调度说明（`dispatch.md`）、研判说明（`admission.md`），并把当前 Policy 放在最后，这样改规则时前面的文本可以保持不动。Worker 额外会拼接活说明（`work.md`），还会读 DeepSeek Harness 自己的编码提示词，以及仓库里的 `AGENTS.md`；主 Session 不读这两份，免得调度的人自己去想怎么改代码。

团队能改的是那三块说明、自己加的 skill，以及内置各段的覆盖文本。改提示词不会改门禁、Mandate 和工具校验，那些仍然由代码强制。优先级从强到弱写在文档里：工具和宿主强制的事实 > 内置或覆盖后的提示词 > 主动工单命中规则里的额外要求 > 团队说明 > 外面来的消息、评论、文档——那些只是数据，不能改规则。

### 工单状态，以及 Worker 会话怎么命名

`AssignmentState` 是 `pending / running / ended`，Worker 汇报的 `ReportState` 是 `progress / waiting / ready / blocked / failed / dropped`（`src/core/model.ts`）。面板上看到的阶段，是 `ticketStage()` 按顺序算出来的（`src/core/stage.ts`）：

```ts
// src/core/stage.ts  ticketStage()
if (ticket.ended) return { stage: 'ended' }
...
if (report === 'ready') return { stage: 'person', action: 'review' }
if (!assignment || assignment.state === 'pending') return { stage: 'working', action: 'queued' }
if (report === 'waiting' || assignment.state === 'ended') return { stage: 'idle' }
return { stage: 'working' }
```

每张工单对应一个 Worker Session，名字是写死的：

```ts
// src/executor/dsh.ts
export const workerSessionId = (ticketId: string): string => `worker-${ticketId}`
```

并发也有上限：`WorkerSlots` 默认 `maxWorkers: 3`，而且给「人发来的消息」多留一个位子，新活再多也不会挡住追问。

### 存储、面板和模块地图

所有状态都在一个 SQLite 文件 `orchestrator.sqlite` 里，只有 `Store`（`src/app/store.ts`）能打开它；要往外发的东西（发评论、启动 Worker、投递消息）都先写进 `effect` 表，提交后再执行，失败了按退避重试（`src/app/effects.ts`）。所以服务重启之后，没做完的事还在队列里。

面板是 `src/client/` 下的一套 React 页面，调的是 `/orchestrator/api/*`（`src/app/http.ts`），带同源和回环地址检查。

想自己读源码的，可以按这个顺序：先 `src/core`，再 `src/sources/github*.ts`，最后 `src/executor/dsh.ts`。

![源码模块地图](/img/superagent/modules.png)
