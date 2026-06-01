import { request } from '@/utils/request'

export const questionsApi = {
    list() {
        return request('questions.list', { page: 1, pageSize: 50 })
    }
}
