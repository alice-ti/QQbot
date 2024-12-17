# XAKU

## QQ

- [QQ机器人管理端](https://q.qq.com/qqbot/#/developer/publish-config/function-config)
- [QQ机器人文档](https://bot.q.qq.com/wiki/)

### 事件监听

### 注意事项

`websocket` 事件推送链路将在24年年底前逐步下线，后续官方不再维护。
新的 `webhook` 事件回调链路目前在灰度验证，灰度用户可体验通过页面配置事件监听及回调地址。

灰度期间，原有机器人仍可使用 `websocket` 事件链路接收事件推送。

### 事件订阅

```md
GUILDS (1 << 0)
  - GUILD_CREATE           // 当机器人加入新guild时
  - GUILD_UPDATE           // 当guild资料发生变更时
  - GUILD_DELETE           // 当机器人退出guild时
  - CHANNEL_CREATE         // 当channel被创建时
  - CHANNEL_UPDATE         // 当channel被更新时
  - CHANNEL_DELETE         // 当channel被删除时

GUILD_MEMBERS (1 << 1)
  - GUILD_MEMBER_ADD       // 当成员加入时
  - GUILD_MEMBER_UPDATE    // 当成员资料变更时
  - GUILD_MEMBER_REMOVE    // 当成员被移除时

GUILD_MESSAGES (1 << 9)    // 消息事件，仅 *私域* 机器人能够设置此 intents。
  - MESSAGE_CREATE         // 发送消息事件，代表频道内的全部消息，而不只是 at 机器人的消息。内容与 AT_MESSAGE_CREATE 相同
  - MESSAGE_DELETE         // 删除（撤回）消息事件

GUILD_MESSAGE_REACTIONS (1 << 10)
  - MESSAGE_REACTION_ADD    // 为消息添加表情表态
  - MESSAGE_REACTION_REMOVE // 为消息删除表情表态

DIRECT_MESSAGE (1 << 12)
  - DIRECT_MESSAGE_CREATE   // 当收到用户发给机器人的私信消息时
  - DIRECT_MESSAGE_DELETE   // 删除（撤回）消息事件


GROUP_AND_C2C_EVENT (1 << 25)
  - C2C_MESSAGE_CREATE      // 用户单聊发消息给机器人时候
  - FRIEND_ADD              // 用户添加使用机器人
  - FRIEND_DEL              // 用户删除机器人
  - C2C_MSG_REJECT          // 用户在机器人资料卡手动关闭"主动消息"推送
  - C2C_MSG_RECEIVE         // 用户在机器人资料卡手动开启"主动消息"推送开关
  - GROUP_AT_MESSAGE_CREATE // 用户在群里@机器人时收到的消息
  - GROUP_ADD_ROBOT         // 机器人被添加到群聊
  - GROUP_DEL_ROBOT         // 机器人被移出群聊
  - GROUP_MSG_REJECT        // 群管理员主动在机器人资料页操作关闭通知
  - GROUP_MSG_RECEIVE       // 群管理员主动在机器人资料页操作开启通知

INTERACTION (1 << 26)
  - INTERACTION_CREATE     // 互动事件创建时

MESSAGE_AUDIT (1 << 27)
  - MESSAGE_AUDIT_PASS     // 消息审核通过
  - MESSAGE_AUDIT_REJECT   // 消息审核不通过

FORUMS_EVENT (1 << 28)  // 论坛事件，仅 *私域* 机器人能够设置此 intents。
  - FORUM_THREAD_CREATE     // 当用户创建主题时
  - FORUM_THREAD_UPDATE     // 当用户更新主题时
  - FORUM_THREAD_DELETE     // 当用户删除主题时
  - FORUM_POST_CREATE       // 当用户创建帖子时
  - FORUM_POST_DELETE       // 当用户删除帖子时
  - FORUM_REPLY_CREATE      // 当用户回复评论时
  - FORUM_REPLY_DELETE      // 当用户回复评论时
  - FORUM_PUBLISH_AUDIT_RESULT      // 当用户发表审核通过时

AUDIO_ACTION (1 << 29)
  - AUDIO_START             // 音频开始播放时
  - AUDIO_FINISH            // 音频播放结束时
  - AUDIO_ON_MIC            // 上麦时
  - AUDIO_OFF_MIC           // 下麦时

PUBLIC_GUILD_MESSAGES (1 << 30) // 消息事件，此为公域的消息事件
  - AT_MESSAGE_CREATE       // 当收到@机器人的消息时
  - PUBLIC_MESSAGE_DELETE   // 当频道的消息被删除时
```

事件接收响应结果如下

```typescript
{
 eventType: 'GROUP_AT_MESSAGE_CREATE',
 eventId: 'GROUP_AT_MESSAGE_CREATE:qdtawy6rufj9ziciulptyfvpd84zm7lk9q6pumnyjuv957wseidnfe0ixfc6s',
 msg: {
  author: {
   id: '7193745BFE7C7D3C30C96678ABBB5F48',
   member_openid: '7193745BFE7C7D3C30C96678ABBB5F48'
  },
  content: ' 12434',
  group_id: 'A85B11B27A39FB0C238B0F19FA09DDF7',
  group_openid: 'A85B11B27A39FB0C238B0F19FA09DDF7',
  id: 'ROBOT1.0_QD.TAWY6RUfJ9ZicIULpTzch-F9MKMiKg1RG04Gel8V2I.0HgXgR0D8UfhgqMN2Jy0bzWi8-PDzwfCMemkroZw!!',
  timestamp: '2023-11-10T10:44:07+08:00'
 }
}
```

### 参考文章

- [nodejs开发QQ群聊机器人-wf](https://blog.csdn.net/weixin_53932236/article/details/140794468)
- [2023 年最新QQ群机器人](https://blog.csdn.net/qq_47452807/article/details/134317472)

## Azure TTS

- [Azure 快速入门：将文本转换为语音](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-javascript)

- [快速入门：安装语音 SDK](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/quickstarts/setup-platform?tabs=windows%2Cubuntu%2Cdotnetcli%2Cdotnet%2Cjre%2Cmaven%2Cnodejs%2Cmac%2Cpypi&pivots=programming-language-javascript)

### 接入流程

  `window` 下使用步骤，`linux` 待补充(TODO)

1. 使用 Azure 订阅帐户创建一个语音服务资源。
  `.env` 文件中配置 `AZURE_SPEECH_KEY` 和 `AZURE_SPEECH_REGION`。

2. 安装语音 SDK。

    ```bash
    npm install @azure/cognitiveservices-speech-sdk
    ```

3. 发送群聊语音
  使用 `ffmpeg` 进行转换
      1. 下载 `ffmpeg`
            - 下载 `ffmpeg` [下载地址](https://github.com/BtbN/FFmpeg-Builds/releases)
            - 解压到 `X:\16-Soft\ffmpeg-master-latest-win64-gpl\bin`
            - 配置环境变量 **此电脑-属性-高级属性设置-环境变量-PATH中新增** `X:\16-Soft\ffmpeg-master-latest-win64-gpl\bin`
            - 使用 `ffmpeg -i input.mp3 output.wav` 进行转换

      2. 下载 [`silk-v3-decoder`](https://github.com/kn007/silk-v3-decoder/releases)

            - 下载后解压到 `ffmpeg` 目录下

示例

``` typescript
const encodeSilk = () => {
    execSync('ffmpeg -i "initaudio.mp3" -f s16le -ar 24000 -ac 1 -acodec pcm_s16le "outaudio.pcm"');
    execSync('silk_v3_encoder "outaudio.pcm" "qq.silk" -tencent')
}
```
