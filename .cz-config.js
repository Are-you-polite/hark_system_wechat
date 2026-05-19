module.exports = {
    // 可选类型
    types: [
        { value: 'feat', name: 'feat:      ✨  新功能 (A new feature)' },
        { value: 'fix', name: 'fix:       🐛  修复 Bug (A bug fix)' },
        { value: 'docs', name: 'docs:      📝  文档变更 (Documentation only changes)' },
        { value: 'style', name: 'style:     💄  代码格式 (Changes that do not affect the meaning of the code)' },
        { value: 'refactor', name: 'refactor:  ♻️   代码重构 (A code change that neither fixes a bug nor adds a feature)' },
        { value: 'perf', name: 'perf:      ⚡️  性能优化 (A code change that improves performance)' },
        { value: 'test', name: 'test:      ✅  测试 (Adding missing tests or correcting existing tests)' },
        { value: 'build', name: 'build:     📦️  构建系统/外部依赖 (Changes that affect the build system or external dependencies)' },
        { value: 'ci', name: 'ci:        👷  CI 配置 (Changes to our CI configuration files and scripts)' },
        { value: 'chore', name: "chore:     🎫  其他修改 (Other changes that don't modify src or test files)" },
        { value: 'revert', name: 'revert:    ⏪️  回退 (Reverts a previous commit)' }
    ],

    // 消息步骤
    messages: {
        type: '请选择提交的类型：',
        customScope: '请输入修改的范围（可选）：',
        subject: '请简要描述提交（必填）：',
        body: '请输入详细描述（可选）：',
        footer: '请输入要关闭的 issue（可选）：',
        confirmCommit: '确认要使用以上信息提交吗？（y/n）'
    },

    // 跳过步骤
    skipQuestions: ['body', 'footer'],

    // 默认长度
    subjectLimit: 72
}
