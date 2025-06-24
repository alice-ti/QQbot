// 消息类型枚举
enum MsgType {
  Text = 0,
  Markdown = 2,
  Ark = 3,
  Embed = 4,
  Media = 7,
}

// 按钮类型枚举
enum ButtonType {
  Link = 0, // 跳转按钮
  Return = 1, // 回传按钮
  Form = 2, // 表单按钮
}

// 按钮风格枚举
enum ButtonStyle {
  Primary = 0, // 主要
  Secondary = 1, // 次要
}

// 按钮对象
interface Button {
  id?: string;
  render_data: {
    label: string; // 按钮上的文字
    visited_label?: string; // 点击后按钮上文字
    style: ButtonStyle; // 按钮风格
  };
  action: {
    type: ButtonType; // 按钮类型
    permission?: {
      // 按钮的权限
      type: 0 | 1; // 0: 指定用户可操作 1: 仅管理者可操作
      specify_role_ids?: string[]; // 身份组ID的列表
      specify_user_ids?: string[]; // 用户ID的列表
    };
    click_limit?: number; // 点击次数限制
    data?: string; // 回传数据
    at_bot_show_channel_list?: boolean; // 是否弹出子频道选择器
    unsupport_tips?: string; // 客户端不支持时的提示文案
    url?: string; // 跳转链接
  };
}

// 按钮组
interface ButtonGroup {
  buttons: Button[];
}

// 消息按钮组件
interface InlineKeyboard {
  rows: ButtonGroup[];
}

// 基础消息接口
export interface BaseMessage {
  content: string;
  msg_type: MsgType;
  markdown?: {
    content: string;
    template_id?: number;
    params?: Array<{
      key: string;
      values: string[];
    }>;
  };
  keyboard?: InlineKeyboard;
  media?: {
    file_info: string;
  };
  ark?: {
    template_id: number;
    kv: Array<{
      key: string;
      value: string;
      obj?: Array<{
        [key: string]: string;
      }>;
    }>;
  };
  message_reference?: {
    message_id: string;
    ignore_get_message_error?: boolean;
  };
  event_id?: string;
  msg_id?: string;
  msg_seq?: number;
}

// 文本消息特定类型
interface TextMessage extends BaseMessage {
  msg_type: MsgType.Text;
  markdown?: never;
  ark?: never;
  media?: never;
}

// 回复文本消息的具体类型
export interface ReplyTextMessage extends TextMessage {
  msg_id: string; // 回复时必须包含原消息ID
}
