import { request } from '@/utils/request'

export const matchApi = {
    /** 获取邀请信息（B 打开分享链接时调用） */
    getInviteInfo: (inviterId) => request('match.getInviteInfo', { inviterId }),

    /** 确认匹配 */
    confirm: (inviterId) => request('match.confirm', { inviterId }),

    /** 获取我的匹配列表 */
    list: () => request('match.list'),

    /** 获取匹配报告详情 */
    getDetail: (matchId) => request('match.getDetail', { matchId })
}
