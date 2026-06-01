export function useShare(options = {}) {
    onShareAppMessage(() => {
        const config = typeof options === 'function' ? options() : options
        return { title: config.title || '向内倾听', path: config.path || '', imageUrl: config.imageUrl || '' }
    })

    onShareTimeline(() => {
        const config = typeof options === 'function' ? options() : options
        return { title: config.title || '向内倾听', query: config.query || '', imageUrl: config.imageUrl || '' }
    })
}
