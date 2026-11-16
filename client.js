/* Work / Chat browser half. Loaded through the DSH client module table. */
window.__ModuleLoader__.load({
  id: 'dsh-work-or-chat',
  factory(require) {
    const React = require('react')
    const {
      useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore,
    } = React
    const h = React.createElement

    /** Locale namespace owned by this plugin. */
    const NS = 'workOrChat'
    /** Browser key remembering the last mode. */
    const MODE_KEY = 'dsh-work-or-chat:mode'
    /** Browser key remembering the last open conversation. */
    const LAST_KEY = 'dsh-work-or-chat:last'
    /** Browser key remembering the measured host sidebar width. */
    const WIDTH_KEY = 'dsh-work-or-chat:sidebar-width'
    /** Marker used by the markdown parser instead of a literal backtick. */
    const BT = String.fromCharCode(96)
    /** Official DeepSeek wordmark (brand asset of the product this plugin integrates). */
    const WORDMARK = "<svg width=\"143\" height=\"23\" viewBox=\"0 0 143 23\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M78.6785 18.6823H77.1078V16.2472H78.6785C79.6513 16.2472 80.6342 16.0047 81.2672 15.3308C81.9009 14.6569 82.14 13.6232 82.14 12.59C82.14 11.5569 81.9109 10.5231 81.2672 9.84981C80.6247 9.17594 79.6513 8.93343 78.6785 8.93343C77.7056 8.93343 76.7228 9.17594 76.0886 9.84981C75.4549 10.5237 75.2158 11.5569 75.2158 12.59V22.5909H72.4605V6.50781H75.2158V7.53204H75.7209C75.7757 7.4689 75.8304 7.41525 75.8857 7.36161C76.5752 6.73244 77.6308 6.50781 78.6684 6.50781C80.2944 6.50781 81.9193 6.91236 82.9849 8.03549C84.0499 9.15861 84.4265 10.8835 84.4265 12.6001C84.4265 14.3166 84.0404 16.0326 82.9849 17.1647C81.9288 18.2967 80.2944 18.6834 78.6785 18.6834V18.6823Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M36.7486 6.94097H38.3188V9.37609H36.7486C35.7753 9.37609 34.7929 9.61859 34.1593 10.2925C33.5257 10.9663 33.2871 12.0001 33.2871 13.0332C33.2871 14.0664 33.5167 15.0996 34.1593 15.7734C34.8019 16.4473 35.7753 16.6898 36.7486 16.6898C37.722 16.6898 38.7049 16.4473 39.3385 15.7734C39.9722 15.0996 40.2108 14.0664 40.2108 13.0332V3.02344H42.9655V19.116H40.2108V18.0918H39.7057C39.6503 18.1544 39.5956 18.2086 39.5403 18.2622C38.8513 18.8908 37.7952 19.116 36.7576 19.116C35.1321 19.116 33.5067 18.712 32.4416 17.5889C31.3766 16.4658 31 14.7403 31 13.0243C31 11.3083 31.3856 9.59177 32.4416 8.45971C33.5067 7.33658 35.1321 6.94097 36.7486 6.94097Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M56.7855 12.8155V13.795H49.4483V11.8454H54.3152C54.2051 11.1358 53.9481 10.4709 53.4887 9.9853C52.8277 9.2846 51.808 9.03316 50.7983 9.03316C49.7886 9.03316 48.7688 9.2846 48.1078 9.9853C47.4468 10.686 47.2076 11.7555 47.2076 12.816C47.2076 13.8766 47.4462 14.9544 48.1078 15.6462C48.7688 16.338 49.788 16.5989 50.7983 16.5989C51.8085 16.5989 52.8277 16.3475 53.4887 15.6462C53.5804 15.5473 53.6631 15.4395 53.7458 15.3316H56.4642C56.2256 16.1765 55.849 16.9403 55.2796 17.5332C54.1777 18.692 52.479 19.1145 50.7983 19.1145C49.1175 19.1145 47.4188 18.701 46.3169 17.5332C45.215 16.3653 44.8111 14.5862 44.8111 12.816C44.8111 11.0458 45.2061 9.25778 46.3169 8.0989C47.4283 6.94001 49.1175 6.51758 50.7983 6.51758C52.479 6.51758 54.1777 6.93107 55.2796 8.0989C56.3904 9.26672 56.7855 11.0458 56.7855 12.816V12.8155Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M70.6151 12.8155V13.795H63.2779V11.8454H68.1448C68.0341 11.1358 67.7776 10.4709 67.3183 9.9853C66.6573 9.2846 65.6376 9.03316 64.6279 9.03316C63.6182 9.03316 62.5984 9.2846 61.9374 9.9853C61.2764 10.686 61.0372 11.7555 61.0372 12.816C61.0372 13.8766 61.2758 14.9544 61.9374 15.6462C62.5984 16.338 63.6182 16.5989 64.6279 16.5989C65.6376 16.5989 66.6573 16.3475 67.3183 15.6462C67.4105 15.5473 67.4927 15.4395 67.5748 15.3316H70.2938C70.0546 16.1765 69.678 16.9403 69.1086 17.5332C68.0067 18.692 66.3081 19.1145 64.6279 19.1145C62.9476 19.1145 61.2484 18.701 60.1465 17.5332C59.0446 16.3653 58.6406 14.5862 58.6406 12.816C58.6406 11.0458 59.0357 9.25778 60.1465 8.0989C61.2579 6.94001 62.9471 6.51758 64.6279 6.51758C66.3086 6.51758 68.0067 6.93107 69.1086 8.0989C70.22 9.26672 70.6151 11.0458 70.6151 12.816V12.8155Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M92.2781 19.1156C93.9589 19.1156 95.657 18.8731 96.7589 18.1813C97.8608 17.4896 98.2653 16.438 98.2653 15.3959C98.2653 14.3538 97.8697 13.2932 96.7589 12.6104C95.657 11.9276 93.9583 11.6756 92.2781 11.6756C91.5612 11.6756 90.9002 11.5767 90.4319 11.3163C89.9637 11.0464 89.7893 10.6424 89.7893 10.2379C89.7893 9.83332 89.9547 9.42039 90.4319 9.15944C90.9002 8.88955 91.626 8.80015 92.3418 8.80015C93.0576 8.80015 93.7834 8.89905 94.2528 9.15944C94.721 9.42933 94.8954 9.83332 94.8954 10.2379H97.6959C97.6959 9.1952 97.3383 8.13522 96.3376 7.4524C95.3368 6.76958 93.803 6.51758 92.2787 6.51758C90.7543 6.51758 89.2211 6.76008 88.2198 7.4524C87.219 8.14416 86.8603 9.1952 86.8603 10.2379C86.8603 11.2805 87.2185 12.3405 88.2198 13.0233C89.2205 13.7061 90.7538 13.9582 92.2787 13.9582C93.0682 13.9582 93.941 14.0571 94.464 14.3174C94.9881 14.5784 95.1714 14.9913 95.1714 15.3959C95.1714 15.8004 94.9881 16.2133 94.464 16.4743C93.941 16.7347 93.142 16.8336 92.3524 16.8336C91.5629 16.8336 90.7543 16.7347 90.2397 16.4743C89.7256 16.2139 89.5323 15.8004 89.5323 15.3959H86.2998C86.2998 16.4385 86.6943 17.4985 87.8063 18.1813C88.9171 18.8641 90.5979 19.1156 92.2787 19.1156H92.2781Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M112.094 12.8155V13.795H104.757V11.8454H109.624C109.514 11.1358 109.257 10.4709 108.798 9.9853C108.136 9.2846 107.117 9.03316 106.106 9.03316C105.095 9.03316 104.077 9.2846 103.416 9.9853C102.755 10.686 102.517 11.7555 102.517 12.816C102.517 13.8766 102.755 14.9544 103.416 15.6462C104.077 16.338 105.097 16.5989 106.106 16.5989C107.116 16.5989 108.136 16.3475 108.798 15.6462C108.889 15.5473 108.972 15.4395 109.054 15.3316H111.772C111.533 16.1765 111.157 16.9403 110.588 17.5332C109.486 18.692 107.787 19.1145 106.106 19.1145C104.425 19.1145 102.727 18.701 101.625 17.5332C100.524 16.3653 100.12 14.5862 100.12 12.816C100.12 11.0458 100.515 9.25778 101.625 8.0989C102.737 6.94001 104.427 6.51758 106.106 6.51758C107.786 6.51758 109.486 6.93107 110.588 8.0989C111.699 9.26672 112.093 11.0458 112.093 12.816L112.094 12.8155Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M125.924 12.8155V13.795H118.586V11.8454H123.453C123.344 11.1358 123.086 10.4709 122.627 9.9853C121.966 9.2846 120.947 9.03316 119.936 9.03316C118.926 9.03316 117.907 9.2846 117.246 9.9853C116.585 10.686 116.346 11.7555 116.346 12.816C116.346 13.8766 116.585 14.9544 117.246 15.6462C117.907 16.338 118.927 16.5989 119.936 16.5989C120.946 16.5989 121.966 16.3475 122.627 15.6462C122.719 15.5473 122.801 15.4395 122.885 15.3316H125.602C125.363 16.1765 124.987 16.9403 124.418 17.5332C123.316 18.692 121.617 19.1145 119.936 19.1145C118.256 19.1145 116.558 18.701 115.456 17.5332C114.354 16.3653 113.949 14.5862 113.949 12.816C113.949 11.0458 114.344 9.25778 115.456 8.0989C116.567 6.94001 118.256 6.51758 119.936 6.51758C121.617 6.51758 123.315 6.93107 124.418 8.0989C125.529 9.26672 125.924 11.0458 125.924 12.816V12.8155Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M130.524 3.02344H127.77V19.116H130.524V3.02344Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><path d=\"M135.227 12.4384L139.744 19.1146H136.337L131.819 12.4384L136.337 7.07422H139.744L135.227 12.4384Z\" fill=\"var(--dsw-alias-brand-primary)\"></path><g clip-path=\"url(#clip0_4329_19769)\"><path d=\"M26.5174 3.39471C26.235 3.2567 26.1137 3.52006 25.9487 3.65346C25.8923 3.69659 25.8446 3.75294 25.7969 3.80469C25.3846 4.24516 24.9027 4.53439 24.2737 4.49989C23.3536 4.44814 22.5682 4.73737 21.8735 5.44119C21.7258 4.57349 21.2353 4.0554 20.4889 3.72304C20.0985 3.55054 19.7034 3.37746 19.4297 3.00197C19.2388 2.73459 19.1865 2.43673 19.091 2.14289C19.0301 1.96579 18.9697 1.78466 18.7656 1.75418C18.5442 1.71968 18.4574 1.90541 18.3705 2.06067C18.0232 2.69549 17.8887 3.39471 17.9019 4.10313C17.9324 5.6965 18.6051 6.96556 19.9421 7.86834C20.0939 7.97184 20.133 8.07535 20.0852 8.22658C19.9938 8.53766 19.8857 8.83955 19.7903 9.15063C19.7293 9.34901 19.6385 9.39271 19.4257 9.30588C18.692 8.9994 18.0583 8.54571 17.4982 7.99772C16.5477 7.07827 15.6881 6.06336 14.6162 5.26869C14.3644 5.08296 14.1125 4.91045 13.8521 4.746C12.7584 3.68394 13.9952 2.81164 14.2816 2.70814C14.5812 2.60003 14.3857 2.22857 13.4179 2.23317C12.4502 2.2372 11.5646 2.56151 10.4359 2.99335C10.2708 3.05832 10.0972 3.10547 9.91951 3.14457C8.8954 2.95022 7.83162 2.90709 6.72069 3.03245C4.62877 3.26533 2.95777 4.25436 1.72954 5.94261C0.254043 7.97184 -0.0932679 10.2777 0.33167 12.6824C0.778458 15.2171 2.07225 17.3153 4.06008 18.9558C6.12152 20.6567 8.49577 21.4905 11.2047 21.3306C12.8498 21.2358 14.6812 21.0155 16.7473 19.2669C17.2682 19.5262 17.8151 19.6297 18.7219 19.7074C19.4205 19.7724 20.0933 19.6729 20.6143 19.5648C21.4302 19.3923 21.3739 18.6367 21.0789 18.4981C18.6874 17.3843 19.2124 17.8374 18.7351 17.4706C19.9501 16.033 21.8063 13.4776 22.379 9.99821C22.4353 9.61409 22.5072 9.073 22.4986 8.76192C22.494 8.57216 22.5377 8.49856 22.7545 8.47671C23.3536 8.40771 23.935 8.24383 24.4692 7.94999C26.0188 7.10357 26.6439 5.71318 26.7911 4.04678C26.8129 3.79204 26.7865 3.52869 26.5174 3.39471ZM13.0143 18.3946C10.6964 16.5724 9.5722 15.9726 9.10816 15.9985C8.67402 16.0244 8.75222 16.5212 8.84768 16.8449C8.94773 17.1646 9.07768 17.3849 9.25996 17.6655C9.38589 17.8512 9.47272 18.1272 9.13404 18.3348C8.38766 18.7965 7.08985 18.1796 7.0289 18.1491C5.51833 17.2595 4.25559 16.0853 3.36546 14.4793C2.50581 12.9337 2.0067 11.2753 1.92447 9.50542C1.90262 9.07818 2.02855 8.92695 2.45406 8.84932C3.01413 8.74582 3.59144 8.72397 4.15093 8.80619C6.51656 9.15178 8.53027 10.2092 10.2185 11.8848C11.1822 12.8388 11.9114 13.979 12.6623 15.0929C13.461 16.2757 14.3201 17.4027 15.4144 18.3268C15.8008 18.6505 16.109 18.8966 16.404 19.0783C15.5144 19.1778 14.0297 19.1991 13.0143 18.3958V18.3946ZM14.1252 11.2489C14.1252 11.0591 14.277 10.9079 14.4679 10.9079C14.511 10.9079 14.5501 10.9165 14.5852 10.9292C14.6329 10.9464 14.6766 10.9723 14.7111 11.0114C14.7721 11.0718 14.8066 11.158 14.8066 11.2489C14.8066 11.4386 14.6548 11.5899 14.4639 11.5899C14.273 11.5899 14.1252 11.4386 14.1252 11.2489ZM17.5759 13.0188C17.3545 13.1096 17.1331 13.1873 16.9203 13.1959C16.5903 13.2131 16.2303 13.0791 16.0348 12.9153C15.7312 12.6605 15.5139 12.5179 15.423 12.0734C15.3839 11.8837 15.4057 11.5899 15.4402 11.4214C15.5185 11.0585 15.4316 10.8257 15.1757 10.614C14.9676 10.4415 14.7025 10.3938 14.4115 10.3938C14.3029 10.3938 14.2034 10.3461 14.1292 10.3076C14.0079 10.2472 13.9078 10.096 14.0033 9.91023C14.0338 9.84985 14.1815 9.70322 14.216 9.67734C14.6111 9.45251 15.0665 9.52612 15.488 9.6946C15.8784 9.85445 16.174 10.1477 16.5989 10.5623C17.033 11.0631 17.1112 11.2011 17.3585 11.5772C17.554 11.871 17.7317 12.1729 17.8536 12.5185C17.9272 12.7341 17.8317 12.9107 17.5759 13.0188Z\" fill=\"var(--dsw-alias-brand-primary)\"></path></g><defs><clipPath id=\"clip0_4329_19769\"><rect width=\"26.634\" height=\"19.6\" fill=\"white\" transform=\"translate(0.163086 1.75)\"></rect></clipPath></defs></svg>"

    const cx = (...values) => values.filter(Boolean).join(' ')

    const zh = {
      'toggle.chat': '对话',
      'toggle.work': '工作',
      'toggle.chatHint': '切换到 DeepSeek 对话模式',
      'toggle.workHint': '切换到 Harness 工作模式',
      'sidebar.new': '开启新对话',
      'sidebar.search': '搜索对话',
      'sidebar.searchPlaceholder': '搜索对话',
      'sidebar.noResults': '没有匹配的对话',
      'sidebar.settings': '设置',
      'sidebar.today': '今天',
      'sidebar.yesterday': '昨天',
      'sidebar.week': '7 天内',
      'sidebar.earlier': '更早',
      'sidebar.empty': '还没有对话',
      'sidebar.emptyHint': '在右侧输入第一条消息，或导入网页版导出记录。',
      'sidebar.rename': '重命名',
      'sidebar.delete': '删除',
      'sidebar.deleteTitle': '删除这个对话？',
      'sidebar.deleteBody': '只会删除本机保存的记录，不影响 DeepSeek 网页版或 App。',
      'sidebar.deleteAction': '删除',
      'sidebar.clearTitle': '清空所有对话？',
      'sidebar.clearBody': '本机保存的全部对话和导入记录都会被删除，此操作不可撤销。',
      'chat.newChat': '新对话',
      'chat.placeholder': '给 DeepSeek 发送消息',
      'chat.hint': 'Enter 发送 · Shift+Enter 换行',
      'chat.disclaimer': '内容由 AI 生成，请仔细甄别',
      'chat.send': '发送',
      'chat.stop': '停止生成',
      'chat.thinking': '深度思考',
      'chat.search': '智能搜索',
      'chat.model': '模型',
      'chat.demoStarting': '正在启动对话…',
      'chat.demoUnavailable': '对话界面启动失败，请刷新页面重试。',
      'chat.attachmentsUnavailable': '当前版本不支持附件',
      'chat.modelFlash': 'Flash',
      'chat.modelPro': 'Pro',
      'chat.emptyTitle': '你好，让我们开始聊天吧',
      'chat.emptyBody': '纯对话模式 · 不使用 Harness 工具、文件或工作区',
      'chat.suggestion1': '帮我写一封简洁的邮件',
      'chat.suggestion2': '解释一个我不懂的概念',
      'chat.suggestion3': '把下面这段话整理成要点',
      'chat.suggestion4': '把这段中文翻译成英文',
      'chat.copy': '复制',
      'chat.copied': '已复制',
      'chat.regenerate': '重新生成',
      'chat.retry': '重试',
      'chat.stopped': '已停止',
      'chat.thinkingLabel': '已深度思考',
      'chat.thinkingSeconds': '用时 {seconds} 秒',
      'chat.searched': '搜索到 {count} 个来源',
      'chat.readLink': '阅读了链接',
      'chat.sources': '来源',
      'chat.you': '你',
      'chat.loading': '正在加载对话…',
      'chat.noCredentialTitle': '先配置 DeepSeek 凭证',
      'chat.noCredentialBody': '当前模式没有可用的凭证。登录 DSH 的 DeepSeek 账号，或在设置里填写 API Key。',
      'chat.openSettings': '打开设置',
      'chat.copiedToast': '已复制到剪贴板',
      'chat.stoppedToast': '已停止生成',
      'settings.title': '对话设置',
      'settings.credential': '凭证',
      'settings.mode': '使用方式',
      'settings.model': '模型',
      'settings.modelHint': '新对话默认使用这个模型；已有对话在发送下一条消息时沿用当前选择。',
      'settings.auto': '自动',
      'settings.account': 'DSH 账号',
      'settings.apiKey': 'API Key',
      'settings.modeHint': '自动：优先使用已登录的 DSH DeepSeek 账号，其次使用本插件保存的 API Key，最后使用 DEEPSEEK_API_KEY。',
      'settings.accountState': 'DSH 账号',
      'settings.pluginKey': '插件 API Key',
      'settings.envKey': 'DEEPSEEK_API_KEY',
      'settings.available': '可用',
      'settings.unavailable': '未配置',
      'settings.keyPlaceholder': 'sk-…',
      'settings.saveKey': '保存并验证',
      'settings.clearKey': '清除插件 Key',
      'settings.keySaved': 'API Key 已保存并通过验证',
      'settings.data': '数据',
      'settings.import': '导入网页版导出 ZIP',
      'settings.importHint': '选择 chat.deepseek.com 导出的 deepseek_data-*.zip。导入的是本机副本，不会反向同步。',
      'settings.importing': '正在导入…',
      'settings.importResult': '已导入 {imported} 个对话，跳过 {skipped} 个',
      'settings.clearAll': '清空本机对话',
      'settings.about': '关于',
      'settings.aboutBody': '对话通过官方 DeepSeek Messages API 发送到 api.deepseek.com；不使用 Harness 工具、文件或工作区。历史保存在本机 DSH_HOME/work-or-chat，不写入 DSH 会话。',
      'settings.version': '版本 {version}',
      'settings.close': '关闭',
      'settings.saved': '设置已保存',
      'common.cancel': '取消',
      'common.delete': '删除',
      'common.close': '关闭',
      'common.retry': '重试',
      'error.loadFailed': '加载失败：{message}',
      'error.sendFailed': '发送失败：{message}',
      'error.importFailed': '导入失败：{message}',
      'error.noCredential': '没有可用的 DeepSeek 凭证',
      'error.auth': '凭证被拒绝，请检查账号状态或更换 API Key',
      'error.rateLimit': '请求过于频繁或额度不足，请稍后再试',
      'error.network': '网络连接失败',
      'error.copy': '复制失败',
    }

    const en = {
      'toggle.chat': 'Chat',
      'toggle.work': 'Work',
      'toggle.chatHint': 'Switch to DeepSeek chat mode',
      'toggle.workHint': 'Switch to Harness work mode',
      'sidebar.new': 'New chat',
      'sidebar.search': 'Search chats',
      'sidebar.searchPlaceholder': 'Search chats',
      'sidebar.noResults': 'No matching chats',
      'sidebar.settings': 'Settings',
      'sidebar.today': 'Today',
      'sidebar.yesterday': 'Yesterday',
      'sidebar.week': 'Previous 7 days',
      'sidebar.earlier': 'Earlier',
      'sidebar.empty': 'No conversations yet',
      'sidebar.emptyHint': 'Send the first message on the right, or import a website export.',
      'sidebar.rename': 'Rename',
      'sidebar.delete': 'Delete',
      'sidebar.deleteTitle': 'Delete this conversation?',
      'sidebar.deleteBody': 'Only the local copy is removed. The DeepSeek website and app are not changed.',
      'sidebar.deleteAction': 'Delete',
      'sidebar.clearTitle': 'Delete all conversations?',
      'sidebar.clearBody': 'Every conversation stored on this machine, including imported ones, is removed. This cannot be undone.',
      'chat.newChat': 'New chat',
      'chat.placeholder': 'Message DeepSeek',
      'chat.hint': 'Enter to send · Shift+Enter for a new line',
      'chat.disclaimer': 'AI-generated content. Verify important information.',
      'chat.send': 'Send',
      'chat.stop': 'Stop generating',
      'chat.thinking': 'DeepThink',
      'chat.search': 'Smart search',
      'chat.model': 'Model',
      'chat.demoStarting': 'Starting chat…',
      'chat.demoUnavailable': 'The chat client could not start. Refresh the page and try again.',
      'chat.attachmentsUnavailable': 'Attachments are not supported in this version',
      'chat.modelFlash': 'Flash',
      'chat.modelPro': 'Pro',
      'chat.emptyTitle': "Hi, let's start chatting",
      'chat.emptyBody': 'Chat only · no Harness tools, files, or workspace',
      'chat.suggestion1': 'Write a concise email for me',
      'chat.suggestion2': 'Explain a concept I do not understand',
      'chat.suggestion3': 'Turn the text below into bullet points',
      'chat.suggestion4': 'Translate this Chinese text into English',
      'chat.copy': 'Copy',
      'chat.copied': 'Copied',
      'chat.regenerate': 'Regenerate',
      'chat.retry': 'Retry',
      'chat.stopped': 'Stopped',
      'chat.thinkingLabel': 'Thought for a moment',
      'chat.thinkingSeconds': '{seconds}s',
      'chat.searched': 'Searched {count} sources',
      'chat.readLink': 'Opened a link',
      'chat.sources': 'Sources',
      'chat.you': 'You',
      'chat.loading': 'Loading conversation…',
      'chat.noCredentialTitle': 'Set up a DeepSeek credential',
      'chat.noCredentialBody': 'No credential is available in this mode. Sign in to a DeepSeek account in DSH, or save an API key in Settings.',
      'chat.openSettings': 'Open settings',
      'chat.copiedToast': 'Copied to clipboard',
      'chat.stoppedToast': 'Generation stopped',
      'settings.title': 'Chat settings',
      'settings.credential': 'Credential',
      'settings.mode': 'Source',
      'settings.model': 'Model',
      'settings.modelHint': 'New chats use this model. An open chat keeps the selected model for the next message.',
      'settings.auto': 'Automatic',
      'settings.account': 'DSH account',
      'settings.apiKey': 'API key',
      'settings.modeHint': 'Automatic uses the signed-in DSH DeepSeek account first, then this plugin’s API key, then DEEPSEEK_API_KEY.',
      'settings.accountState': 'DSH account',
      'settings.pluginKey': 'Plugin API key',
      'settings.envKey': 'DEEPSEEK_API_KEY',
      'settings.available': 'Available',
      'settings.unavailable': 'Not configured',
      'settings.keyPlaceholder': 'sk-…',
      'settings.saveKey': 'Save and verify',
      'settings.clearKey': 'Clear plugin key',
      'settings.keySaved': 'API key saved and verified',
      'settings.data': 'Data',
      'settings.import': 'Import website export ZIP',
      'settings.importHint': 'Choose the deepseek_data-*.zip exported from chat.deepseek.com. The import is a local copy and does not sync back.',
      'settings.importing': 'Importing…',
      'settings.importResult': 'Imported {imported} conversations, skipped {skipped}',
      'settings.clearAll': 'Delete local conversations',
      'settings.about': 'About',
      'settings.aboutBody': 'Chat requests go to api.deepseek.com through the official DeepSeek Messages API. No Harness tools, files, or workspace context are used. History is stored locally under DSH_HOME/work-or-chat, not in DSH sessions.',
      'settings.version': 'Version {version}',
      'settings.close': 'Close',
      'settings.saved': 'Settings saved',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.close': 'Close',
      'common.retry': 'Retry',
      'error.loadFailed': 'Could not load: {message}',
      'error.sendFailed': 'Could not send: {message}',
      'error.importFailed': 'Could not import: {message}',
      'error.noCredential': 'No DeepSeek credential is available',
      'error.auth': 'The credential was rejected. Check the account or replace the API key.',
      'error.rateLimit': 'Rate limited or out of quota. Try again later.',
      'error.network': 'Network request failed',
      'error.copy': 'Copy failed',
    }

    /* ------------------------------------------------------------------ */
    /* Mode store                                                          */
    /* ------------------------------------------------------------------ */

    function readMode() {
      try {
        return window.localStorage.getItem(MODE_KEY) === 'chat' ? 'chat' : 'work'
      } catch {
        return 'work'
      }
    }

    let currentMode = readMode()
    const modeListeners = new Set()

    function setMode(next) {
      if (next !== 'chat' && next !== 'work') return
      if (next === currentMode) return
      currentMode = next
      try {
        window.localStorage.setItem(MODE_KEY, next)
      } catch {
        // Mode preference is optional.
      }
      for (const listener of modeListeners) listener()
    }

    function subscribeMode(listener) {
      modeListeners.add(listener)
      return () => modeListeners.delete(listener)
    }

    function useMode() {
      return useSyncExternalStore(subscribeMode, () => currentMode)
    }

    /* ------------------------------------------------------------------ */
    /* Sidebar geometry                                                    */
    /* ------------------------------------------------------------------ */

    // The host sidebar is resizable (264–420px). Chat mode mirrors its width so
    // the mode switch and the column edge do not jump between modes.
    let currentSidebarWidth = (() => {
      try {
        const value = Number(window.localStorage.getItem(WIDTH_KEY))
        return value >= 240 && value <= 420 ? value : 280
      } catch {
        return 280
      }
    })()
    const sidebarWidthListeners = new Set()

    function setSidebarWidth(value) {
      const next = Math.min(420, Math.max(240, Math.round(value)))
      if (next === currentSidebarWidth) return
      currentSidebarWidth = next
      try {
        window.localStorage.setItem(WIDTH_KEY, String(next))
      } catch {
        // The measured width is only a layout hint.
      }
      for (const listener of sidebarWidthListeners) listener()
    }

    function subscribeSidebarWidth(listener) {
      sidebarWidthListeners.add(listener)
      return () => sidebarWidthListeners.delete(listener)
    }

    function useSidebarWidth() {
      return useSyncExternalStore(subscribeSidebarWidth, () => currentSidebarWidth)
    }

    /* ------------------------------------------------------------------ */
    /* API                                                                 */
    /* ------------------------------------------------------------------ */

    const routeUrl = (path) => new URL(`api/work-or-chat/${path}`, document.baseURI).toString()
    const relativeRoute = (path) => `api/work-or-chat/${path}`

    /**
     * Fetch a plugin route through the page's own carrier when the Host runs in
     * another execution context (the desktop shell), otherwise through the
     * ordinary same-origin fetch.
     */
    function requestRoute(path, init) {
      const carrier = window.__DSH_TRANSPORT__?.fetch
      if (typeof carrier === 'function') return carrier(relativeRoute(path), init)
      return fetch(routeUrl(path), init)
    }

    async function callApi(action, payload = {}, signal) {
      let response
      try {
        response = await requestRoute('api', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action, ...payload }),
          signal,
        })
      } catch (error) {
        if (error && error.name === 'AbortError') throw error
        throw new Error('network')
      }
      let data = null
      try {
        data = await response.json()
      } catch {
        // Fall through to the status message.
      }
      if (!response.ok || data?.error) {
        const failure = new Error(data?.error?.message || `HTTP ${response.status}`)
        failure.code = data?.error?.code
        failure.status = response.status
        throw failure
      }
      return data
    }

    const uid = () => {
      try {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID()
      } catch {
        // Fall through.
      }
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    }

    const messageText = (message) => (message.blocks || [])
      .filter((block) => block.type === 'text' && block.text)
      .map((block) => block.text)
      .join('\n\n')

    const deriveTitle = (text) => text.replace(/\s+/g, ' ').trim().slice(0, 40) || 'New chat'

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    const Svg = ({ children, size = 16, viewBox = '0 0 16 16', ...rest }) => h('svg', {
      width: size, height: size, viewBox, fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...rest,
    }, children)

    const ChatIcon = (props) => h(Svg, props, h('path', { d: 'M2.2 6.2c0-1.6 1.3-2.9 2.9-2.9h5.8c1.6 0 2.9 1.3 2.9 2.9v3c0 1.6-1.3 2.9-2.9 2.9H7.6l-2.9 2.6v-2.6H5.1a2.9 2.9 0 0 1-2.9-2.9z' }))
    const WhaleIcon = ({ size = 24, ...rest }) => h('svg', {
      width: Math.round(size * 35 / 26), height: size, viewBox: '0 0 35 26', fill: 'currentColor',
      'aria-hidden': true, ...rest,
    }, h('path', { d: 'M33.615 2.598c-.36-.176-.515.16-.726.33-.072.055-.132.127-.193.193-.526.562-1.14.93-1.943.887-1.174-.067-2.176.302-3.062 1.2-.188-1.107-.814-1.767-1.766-2.191-.498-.22-1.002-.441-1.35-.92-.244-.341-.31-.721-.433-1.096-.077-.226-.154-.457-.415-.496-.282-.044-.393.193-.504.391-.443.81-.614 1.702-.598 2.605.04 2.033.898 3.652 2.603 4.803.193.132.243.264.182.457-.116.397-.254.782-.376 1.179-.078.253-.194.308-.465.198-.936-.391-1.744-.97-2.458-1.669-1.213-1.173-2.31-2.467-3.676-3.48a16.254 16.254 0 0 0-.975-.668c-1.395-1.354.183-2.467.548-2.599.382-.138.133-.612-1.102-.606-1.234.005-2.364.42-3.803.97a4.34 4.34 0 0 1-.66.193 13.577 13.577 0 0 0-4.08-.143c-2.667.297-4.799 1.558-6.365 3.712C.116 8.436-.327 11.378.215 14.444c.57 3.233 2.22 5.91 4.755 8.002 2.63 2.17 5.658 3.233 9.113 3.03 2.098-.122 4.434-.403 7.07-2.633.664.33 1.362.463 2.518.562.892.083 1.75-.044 2.414-.182 1.04-.22.97-1.184.593-1.36-3.05-1.421-2.38-.843-2.99-1.311 1.55-1.834 3.918-5.093 4.648-9.531.072-.49.164-1.18.153-1.577-.006-.242.05-.336.326-.364a5.903 5.903 0 0 0 2.187-.672c1.977-1.08 2.774-2.853 2.962-4.978.028-.325-.006-.661-.35-.832ZM16.39 21.73c-2.956-2.324-4.39-3.089-4.982-3.056-.554.033-.454.667-.332 1.08.127.407.293.688.526 1.046.16.237.271.59-.161.854-.952.589-2.607-.198-2.685-.237-1.927-1.134-3.537-2.632-4.673-4.68-1.096-1.972-1.733-4.087-1.838-6.345-.028-.545.133-.738.676-.837A6.643 6.643 0 0 1 5.086 9.5c3.017.441 5.586 1.79 7.74 3.927 1.229 1.217 2.159 2.671 3.116 4.092 1.02 1.509 2.115 2.946 3.51 4.125.494.413.887.727 1.263.958-1.135.127-3.028.154-4.324-.87v-.002Zm1.417-9.114a.434.434 0 0 1 .587-.408c.06.022.117.055.16.105a.426.426 0 0 1 .122.303.434.434 0 0 1-.437.435.43.43 0 0 1-.432-.435Zm4.402 2.257c-.283.116-.565.215-.836.226-.421.022-.88-.149-1.13-.358-.387-.325-.664-.506-.78-1.073-.05-.242-.022-.617.022-.832.1-.463-.011-.76-.338-1.03-.265-.22-.603-.28-.974-.28a.8.8 0 0 1-.36-.11c-.155-.078-.283-.27-.161-.508.039-.077.227-.264.271-.297.504-.286 1.085-.193 1.623.022.498.204.875.578 1.417 1.107.553.639.653.815.968 1.295.25.374.476.76.632 1.2.094.275-.028.5-.354.638Z' }))
    const CodeIcon = (props) => h(Svg, props, h('path', { d: 'M5.6 4.5 2.1 8l3.5 3.5M10.4 4.5 13.9 8l-3.5 3.5' }))
    const PlusIcon = (props) => h(Svg, props, h('path', { d: 'M8 3v10M3 8h10' }))
    const GearIcon = (props) => h(Svg, props, h('circle', { cx: 8, cy: 8, r: 2.2 }), h('path', { d: 'M8 1.8v1.5M8 12.7v1.5M1.8 8h1.5M12.7 8h1.5M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1' }))
    const TrashIcon = (props) => h(Svg, props, h('path', { d: 'M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.6 8h5.8l.6-8' }))
    const PencilIcon = (props) => h(Svg, props, h('path', { d: 'M3 13l.7-3.1 7-7a1.4 1.4 0 0 1 2 0l.4.4a1.4 1.4 0 0 1 0 2l-7 7z' }))
    const SendIcon = (props) => h(Svg, props, h('path', { d: 'M2.5 8 13.5 2.5 10 13.5 8 9.5z' }))
    const PaperclipIcon = (props) => h(Svg, props, h('path', { d: 'M9.8 3.2 4.6 8.4a2.6 2.6 0 0 0 3.7 3.7l5.3-5.3a3.9 3.9 0 0 0-5.5-5.5L2.4 6.9a5.2 5.2 0 0 0 7.4 7.4l4.3-4.3' }))
    const StopIcon = (props) => h(Svg, props, h('rect', { x: 4, y: 4, width: 8, height: 8, rx: 1.5, fill: 'currentColor', stroke: 'none' }))
    const SearchIcon = (props) => h(Svg, props, h('circle', { cx: 7, cy: 7, r: 4.2 }), h('path', { d: 'M10.2 10.2 14 14' }))
    const BrainIcon = (props) => h(Svg, props, h('path', { d: 'M6 3.2a2.4 2.4 0 0 1 4 1.8v6a2.4 2.4 0 0 1-4 1.8M6 3.2A2.4 2.4 0 0 0 2 5.5c0 1 .5 1.8 1.3 2.3M6 12.8A2.4 2.4 0 0 0 2 10.5c0-1 .5-1.8 1.3-2.3M10 3.2a2.4 2.4 0 0 1 4 2.3c0 1-.5 1.8-1.3 2.3M10 12.8a2.4 2.4 0 0 1 4-2.3c0 1-.5 1.8-1.3 2.3' }))
    const CopyIcon = (props) => h(Svg, props, h('rect', { x: 5, y: 5, width: 8, height: 8, rx: 1.6 }), h('path', { d: 'M11 5V3.6A1.6 1.6 0 0 0 9.4 2H3.6A1.6 1.6 0 0 0 2 3.6v5.8A1.6 1.6 0 0 0 3.6 11H5' }))
    const RefreshIcon = (props) => h(Svg, props, h('path', { d: 'M13 8a5 5 0 1 1-1.5-3.5M13 2.5V6h-3.5' }))
    const ChevronIcon = ({ open, ...props }) => h(Svg, props, h('path', { d: open ? 'M4 6.5 8 10l4-3.5' : 'M6.5 4 10 8l-3.5 4' }))
    const MenuIcon = (props) => h(Svg, props, h('path', { d: 'M2 4.5h12M2 8h12M2 11.5h12' }))
    const CloseIcon = (props) => h(Svg, props, h('path', { d: 'M3.5 3.5l9 9M12.5 3.5l-9 9' }))
    const ArrowIcon = (props) => h(Svg, props, h('path', { d: 'M3 8h10M9 4l4 4-4 4' }))

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
.dsh-woc-toggle{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.12));border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.18));height:26px;box-sizing:border-box;flex:0 0 auto;font-family:var(--dsw-font-family);}
.dsh-woc-toggle-btn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary,currentColor));width:30px;height:20px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background .15s var(--ds-ease-in-out, ease),color .15s var(--ds-ease-in-out, ease);}
.dsh-woc-toggle-btn:hover{color:var(--dsw-alias-label-primary);}
.dsh-woc-toggle-btn[data-active="true"]{background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base,#fff));color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.16);}
.dsh-woc-toggle-btn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px;}
.dsh-woc-brand-toggle{display:inline-flex;align-items:center;margin:0 0 0 2px;}
.dsh-woc-root{position:fixed;top:var(--dsh-frame-top-clearance,0px);right:0;bottom:0;left:0;z-index:2147483000;display:none;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#111);font-family:var(--dsw-font-family);font-size:14px;line-height:1.5;overflow:hidden;pointer-events:auto;margin:0;padding:0;border:0;width:100%;height:auto;max-width:none;max-height:none;}
.dsh-woc-root[open]{display:flex;}
.dsh-woc-root::backdrop{background:transparent;}
.dsh-woc-root *{box-sizing:border-box;}
.dsh-woc-root button,.dsh-woc-root input,.dsh-woc-root textarea,.dsh-woc-root select{font:inherit;color:inherit;}
.dsh-woc-shell{display:flex;width:100%;height:100%;min-height:0;}
.dsh-woc-sidebar{width:264px;flex:0 0 264px;display:flex;flex-direction:column;min-height:0;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-layer-1,#f7f8fa));border-right:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06));}
.dsh-woc-side-top{display:flex;align-items:center;gap:8px;padding:10px 10px 4px;}
.dsh-woc-side-top .dsh-woc-toggle{flex:0 0 auto;}
.dsh-woc-icon-btn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:0 0 auto;}
.dsh-woc-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-primary);}
.dsh-woc-icon-btn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px;}
.dsh-woc-new{display:flex;align-items:center;gap:8px;margin:4px 10px 8px;padding:8px 10px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;width:calc(100% - 20px);}
.dsh-woc-new:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));}
.dsh-woc-history{flex:1 1 auto;overflow:auto;padding:2px 8px 12px;min-height:0;}
.dsh-woc-group{margin:10px 0 0;}
.dsh-woc-group-label{font-size:11px;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));padding:0 8px 6px;letter-spacing:.02em;}
.dsh-woc-row{display:flex;align-items:center;gap:4px;padding:0 7px;border-radius:8px;cursor:pointer;color:var(--dsw-alias-label-secondary);min-height:32px;}
.dsh-woc-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary);}
.dsh-woc-row[data-active="true"]{background:var(--dsw-specific-sidebar-nav-item-active,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);}
.dsh-woc-row-main{flex:1 1 auto;min-width:0;display:flex;align-items:center;border:0;background:transparent;color:inherit;padding:6px 0;cursor:pointer;text-align:left;font:inherit;border-radius:6px;}
.dsh-woc-row-main:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px;}
.dsh-woc-row-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;}
.dsh-woc-row-actions{display:none;align-items:center;gap:2px;flex:0 0 auto;}
.dsh-woc-row:hover .dsh-woc-row-actions,.dsh-woc-row:focus-within .dsh-woc-row-actions{display:flex;}
.dsh-woc-row-actions .dsh-woc-icon-btn{width:24px;height:24px;border-radius:6px;}
.dsh-woc-rename{flex:1 1 auto;min-width:0;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-layer-1);padding:3px 6px;font-size:13px;outline:none;}
.dsh-woc-empty-list{padding:18px 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.6;}
.dsh-woc-side-foot{padding:8px;border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06));display:flex;flex-direction:column;gap:4px;}
.dsh-woc-side-btn{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;text-align:left;width:100%;font-size:13px;}
.dsh-woc-side-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary);}
.dsh-woc-status-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary,#22c55e);flex:0 0 auto;}
.dsh-woc-status-dot[data-ok="false"]{background:var(--dsw-alias-state-warn-primary,#f59e0b);}
.dsh-woc-main{flex:1 1 auto;display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--dsw-alias-bg-base,#fff);}
.dsh-woc-main-head{height:52px;flex:0 0 52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06));}
.dsh-woc-title{font-size:14px;font-weight:600;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-woc-head-actions{display:flex;align-items:center;gap:4px;}
.dsh-woc-menu-btn{display:none;}
.dsh-woc-head-toggle{display:none;align-items:center;}
.dsh-woc-row-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;margin-left:2px;}
.dsh-woc-rail-toggle{width:36px;height:36px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;}
.dsh-woc-rail-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}
html[data-windows-titlebar] .dsh-woc-rail-toggle{display:none;}
.dsh-woc-scroll{flex:1 1 auto;overflow:auto;padding:24px 18px 8px;min-height:0;}
.dsh-woc-thread{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:22px;}
.dsh-woc-user{align-self:flex-end;max-width:86%;background:var(--dsw-specific-bubble,var(--dsw-alias-bg-layer-2));border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.04));border-radius:16px;padding:10px 14px;color:var(--dsw-alias-label-primary);}
.dsh-woc-user-text{white-space:pre-wrap;word-break:break-word;line-height:1.65;}
.dsh-woc-assistant{display:flex;flex-direction:column;gap:10px;max-width:100%;color:var(--dsw-alias-label-primary);}
.dsh-woc-assistant-head{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary);}
.dsh-woc-assistant-head strong{font-weight:600;color:var(--dsw-alias-label-secondary);}
.dsh-woc-actions{display:flex;align-items:center;gap:2px;margin-top:2px;opacity:.55;}
.dsh-woc-assistant:hover .dsh-woc-actions{opacity:1;}
.dsh-woc-action{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;padding:3px 6px;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;}
.dsh-woc-action:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary);}
.dsh-woc-md{font-size:14px;line-height:1.72;word-break:break-word;}
.dsh-woc-md > :first-child{margin-top:0;}
.dsh-woc-md > :last-child{margin-bottom:0;}
.dsh-woc-md p{margin:0 0 10px;white-space:pre-wrap;}
.dsh-woc-md h1,.dsh-woc-md h2,.dsh-woc-md h3,.dsh-woc-md h4{margin:18px 0 8px;line-height:1.35;font-weight:600;}
.dsh-woc-md h1{font-size:20px;}.dsh-woc-md h2{font-size:18px;}.dsh-woc-md h3{font-size:16px;}.dsh-woc-md h4{font-size:14px;}
.dsh-woc-md ul,.dsh-woc-md ol{margin:0 0 10px;padding-left:22px;}
.dsh-woc-md li{margin:3px 0;}
.dsh-woc-md blockquote{margin:0 0 10px;padding:2px 12px;border-left:3px solid var(--dsw-alias-border-l4);color:var(--dsw-alias-label-secondary);}
.dsh-woc-md hr{border:0;border-top:1px solid var(--dsw-alias-border-l2);margin:16px 0;}
.dsh-woc-md a{color:var(--dsw-alias-link,#4176e6);text-decoration:none;}
.dsh-woc-md a:hover{text-decoration:underline;}
.dsh-woc-md .dsh-woc-inline-code{background:var(--dsw-alias-markdown-inline-code,var(--dsw-alias-bg-layer-2));border:1px solid var(--dsw-alias-border-l1);border-radius:5px;padding:1px 5px;font-family:var(--ds-font-family-code);font-size:12px;}
.dsh-woc-md table{border-collapse:collapse;margin:0 0 12px;font-size:13px;max-width:100%;display:block;overflow:auto;}
.dsh-woc-md th,.dsh-woc-md td{border:1px solid var(--dsw-alias-border-l2);padding:5px 8px;text-align:left;vertical-align:top;}
.dsh-woc-md th{background:var(--dsw-alias-bg-layer-1);font-weight:600;}
.dsh-woc-code{margin:0 0 12px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));border-radius:10px;overflow:hidden;background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-layer-1));}
.dsh-woc-code-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:11px;color:var(--dsw-alias-label-tertiary);}
.dsh-woc-code-copy{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;cursor:pointer;padding:2px 6px;border-radius:5px;}
.dsh-woc-code-copy:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}
.dsh-woc-code pre{margin:0;padding:12px;overflow:auto;font-family:var(--ds-font-family-code);font-size:12px;line-height:1.6;}
.dsh-woc-code code{font-family:inherit;}
.dsh-woc-tok-com{color:var(--dsw-alias-label-tertiary);font-style:italic;}
.dsh-woc-tok-str{color:var(--dsw-alias-state-success-primary,#22c55e);}
.dsh-woc-tok-num{color:var(--dsw-alias-state-warn-primary,#f59e0b);}
.dsh-woc-tok-kw{color:var(--dsw-alias-state-business-primary,#4176e6);}
.dsh-woc-thinking{border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));border-radius:10px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));overflow:hidden;}
.dsh-woc-thinking-head{display:flex;align-items:center;gap:7px;width:100%;border:0;background:transparent;padding:7px 10px;cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px;text-align:left;}
.dsh-woc-thinking-head:hover{background:var(--dsw-alias-interactive-bg-hover);}
.dsh-woc-thinking-body{padding:0 12px 10px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word;max-height:360px;overflow:auto;}
.dsh-woc-muted{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));font-size:11px;}
.dsh-woc-tool{border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));border-radius:10px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));padding:7px 10px;font-size:12px;}
.dsh-woc-tool summary{cursor:pointer;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:6px;list-style:none;}
.dsh-woc-tool summary::-webkit-details-marker{display:none;}
.dsh-woc-tool-list{margin:8px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;}
.dsh-woc-tool-list li{line-height:1.5;}
.dsh-woc-tool-list a{color:var(--dsw-alias-link,#4176e6);text-decoration:none;font-weight:500;}
.dsh-woc-tool-list a:hover{text-decoration:underline;}
.dsh-woc-tool-list p{margin:2px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:pre-wrap;}
.dsh-woc-tool-head{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);margin-bottom:4px;}
.dsh-woc-tool-link{display:block;color:var(--dsw-alias-link,#4176e6);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
.dsh-woc-tool-link:hover{text-decoration:underline;}
.dsh-woc-cites{margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px;color:var(--dsw-alias-label-tertiary);}
.dsh-woc-cite{display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);text-decoration:none;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-woc-cite:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3);}
.dsh-woc-cursor{display:inline-block;width:7px;height:15px;background:var(--dsw-alias-label-secondary);vertical-align:-2px;margin-left:2px;animation:dsh-woc-blink 1s steps(2,start) infinite;}
@keyframes dsh-woc-blink{to{visibility:hidden;}}
.dsh-woc-typing{display:inline-flex;gap:4px;align-items:center;padding:6px 0;}
.dsh-woc-typing i{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary);animation:dsh-woc-bounce 1.2s infinite ease-in-out;}
.dsh-woc-typing i:nth-child(2){animation-delay:.15s;}
.dsh-woc-typing i:nth-child(3){animation-delay:.3s;}
@keyframes dsh-woc-bounce{0%,80%,100%{transform:translateY(0);opacity:.45;}40%{transform:translateY(-4px);opacity:1;}}
.dsh-woc-error{margin:0 auto;max-width:780px;border:1px solid var(--dsw-alias-state-error-primary);border-radius:10px;padding:8px 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;display:flex;align-items:flex-start;gap:8px;}
.dsh-woc-stopped{font-size:11px;color:var(--dsw-alias-label-tertiary);}
.dsh-woc-empty{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;min-height:0;}
.dsh-woc-empty-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-state-business-primary);margin-bottom:14px;}
.dsh-woc-empty h2{margin:0 0 6px;font-size:20px;font-weight:600;}
.dsh-woc-empty p{margin:0 0 18px;max-width:460px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.65;}
.dsh-woc-suggestions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:560px;}
.dsh-woc-suggestion{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:7px 12px;font-size:12px;cursor:pointer;}
.dsh-woc-suggestion:hover{border-color:var(--dsw-alias-border-l4);color:var(--dsw-alias-label-primary);}
.dsh-woc-compose-wrap{padding:8px 18px 18px;flex:0 0 auto;}
.dsh-woc-compose{max-width:780px;margin:0 auto;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12));border-radius:16px;background:var(--dsw-alias-bg-layer-1,#fff);padding:10px 10px 8px;box-shadow:0 6px 24px rgba(0,0,0,.05);}
.dsh-woc-compose:focus-within{border-color:var(--dsw-alias-border-l4);}
.dsh-woc-textarea{display:block;width:100%;border:0;outline:none;resize:none;background:transparent;color:var(--dsw-alias-label-primary);padding:2px 4px;min-height:24px;max-height:220px;overflow-y:auto;line-height:1.6;font-size:14px;}
.dsh-woc-textarea::placeholder{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));}
.dsh-woc-compose-bar{display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap;}
.dsh-woc-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-tertiary);border-radius:999px;height:26px;padding:0 9px;font-size:11px;cursor:pointer;}
.dsh-woc-chip:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l4);}
.dsh-woc-chip[data-active="true"]{background:var(--dsw-alias-state-business-tertiary,var(--dsw-alias-bg-layer-2));border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);}
.dsh-woc-spacer{flex:1 1 auto;}
.dsh-woc-model{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;height:26px;padding:0 8px;font-size:11px;cursor:pointer;outline:none;}
.dsh-woc-send{width:30px;height:30px;border-radius:50%;border:0;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-label-primary));color:var(--dsw-alias-label-on-color,#fff);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto;}
.dsh-woc-send:hover{background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-label-secondary));}
.dsh-woc-send:disabled{opacity:.35;cursor:default;}
.dsh-woc-send[data-stop="true"]{background:var(--dsw-alias-state-error-primary,#ef4444);}
.dsh-woc-hint{max-width:780px;margin:0 auto;padding:6px 4px 0;font-size:11px;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));text-align:center;}
.dsh-woc-modal-mask{position:fixed;inset:0;background:var(--dsw-alias-bg-mask-3,rgba(0,0,0,.48));display:flex;align-items:center;justify-content:center;padding:16px;z-index:3;}
.dsh-woc-modal{width:min(560px,100%);max-height:min(84vh,760px);overflow:auto;background:var(--dsw-alias-bg-layer-2,#fff);border:1px solid var(--dsw-alias-border-l3);border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.28);padding:20px;}
.dsh-woc-modal h3{margin:0 0 4px;font-size:16px;font-weight:600;}
.dsh-woc-modal-sub{margin:0 0 16px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.6;}
.dsh-woc-field{margin:0 0 16px;}
.dsh-woc-label{display:block;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);margin-bottom:6px;}
.dsh-woc-segment{display:flex;gap:2px;padding:2px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);}
.dsh-woc-segment button{flex:1 1 0;border:0;background:transparent;color:var(--dsw-alias-label-secondary);padding:6px 8px;border-radius:8px;font-size:12px;cursor:pointer;}
.dsh-woc-segment button[data-active="true"]{background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12);}
.dsh-woc-mode-hint{margin:6px 0 0;font-size:11px;line-height:1.55;color:var(--dsw-alias-label-tertiary);}
.dsh-woc-status-list{display:flex;flex-direction:column;gap:6px;margin-top:8px;}
.dsh-woc-status-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary);}
.dsh-woc-badge{font-size:10px;padding:1px 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);}
.dsh-woc-badge[data-ok="true"]{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary);}
.dsh-woc-key-row{display:flex;gap:6px;}
.dsh-woc-input{flex:1 1 auto;min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);padding:7px 9px;font-size:12px;outline:none;}
.dsh-woc-input:focus{border-color:var(--dsw-alias-border-l4);}
.dsh-woc-btn{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:7px 10px;font-size:12px;cursor:pointer;white-space:nowrap;}
.dsh-woc-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}
.dsh-woc-btn[data-primary="true"]{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-label-primary));color:var(--dsw-alias-label-on-color,#fff);border-color:transparent;}
.dsh-woc-btn[data-danger="true"]{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);}
.dsh-woc-btn:disabled{opacity:.45;cursor:default;}
.dsh-woc-error-text{margin:6px 0 0;font-size:11px;color:var(--dsw-alias-state-error-primary);}
.dsh-woc-settings-foot{display:flex;justify-content:flex-end;margin-top:18px;}
.dsh-woc-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:var(--dsw-alias-toast-bg,#333);color:var(--dsw-alias-toast-label,#fff);padding:8px 14px;border-radius:999px;font-size:12px;z-index:5;box-shadow:0 8px 24px rgba(0,0,0,.24);max-width:80vw;text-align:center;}
.dsh-woc-toast[data-tone="error"]{background:var(--dsw-alias-state-error-primary,#ef4444);}
.dsh-woc-loading{flex:1 1 auto;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;gap:8px;}
.dsh-woc-spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-border-l3);border-top-color:var(--dsw-alias-label-secondary);animation:dsh-woc-spin .8s linear infinite;}
@keyframes dsh-woc-spin{to{transform:rotate(360deg);}}
.dsh-woc-mobile-mask{display:none;}
@media (max-width:760px){
  .dsh-woc-sidebar{position:absolute;inset:0 auto 0 0;z-index:4;width:280px;flex-basis:280px;transform:translateX(-102%);transition:transform .18s var(--ds-ease-in-out,ease);box-shadow:12px 0 32px rgba(0,0,0,.18);}
  .dsh-woc-sidebar[data-open="true"]{transform:none;}
  .dsh-woc-menu-btn{display:inline-flex;}
  .dsh-woc-head-toggle{display:inline-flex;}
  .dsh-woc-mobile-mask{display:block;position:fixed;inset:0;background:var(--dsw-alias-bg-mask-2,rgba(0,0,0,.2));z-index:3;}
  .dsh-woc-scroll{padding:18px 14px 4px;}
  .dsh-woc-compose-wrap{padding:6px 12px 12px;}
  .dsh-woc-thread{gap:18px;}
  .dsh-woc-user{max-width:92%;}
}
@media (prefers-reduced-motion: reduce){
  .dsh-woc-toggle-btn,.dsh-woc-sidebar,.dsh-woc-cursor,.dsh-woc-typing i,.dsh-woc-spinner{transition:none;animation:none;}
}
/* v2: align the chat surface with the official DeepSeek chat layout. */
.dsh-woc-sidebar{width:280px;flex:0 0 auto;padding:6px 8px;background:var(--dsw-specific-sidebar-fill);border-right:0.5px solid var(--dsw-alias-border-l1);max-width:86vw;}
.dsh-woc-brandrow{flex:0 0 60px;height:60px;display:flex;align-items:center;gap:6px;padding:8px 4px 8px 8px;box-sizing:border-box;color:var(--dsw-alias-brand-primary);}
.dsh-woc-brandmark{display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);flex:0 0 auto;}
.dsh-woc-wordmark{display:inline-flex;align-items:center;flex:0 0 auto;color:var(--dsw-alias-brand-primary);}
.dsh-woc-wordmark svg{height:22px;width:auto;display:block;}
.dsh-woc-brandname{font-size:18px;font-weight:600;letter-spacing:.02em;line-height:24px;white-space:nowrap;color:var(--dsw-alias-brand-primary);}
.dsh-woc-brandbadge{font-size:8px;font-weight:600;line-height:14px;height:14px;padding:0 4px;border-radius:3px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);letter-spacing:.04em;display:inline-flex;align-items:center;flex:0 0 auto;}
.dsh-woc-brandsearch{margin-left:auto;flex:0 0 auto;color:var(--dsw-alias-label-secondary);}
.dsh-woc-brandsearch[data-active="true"]{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover);}
.dsh-woc-newrow{display:flex;align-items:center;gap:6px;margin:0 4px 8px;flex:0 0 auto;}
.dsh-woc-newchat{flex:1 1 auto;min-width:0;height:38px;display:flex;align-items:center;justify-content:center;gap:8px;border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-button-elevated-fill);color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;cursor:pointer;padding:8px 12px;box-sizing:border-box;overflow:hidden;}
.dsh-woc-newchat:hover{background:var(--dsw-alias-button-floating-hover);}
.dsh-woc-newrow .dsh-woc-toggle{height:26px;flex:0 0 auto;}
.dsh-woc-searchbox{display:flex;align-items:center;gap:6px;height:32px;flex:0 0 32px;margin:0 4px 8px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);box-sizing:border-box;}
.dsh-woc-searchinput{flex:1 1 auto;min-width:0;border:0;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;padding:0;height:100%;}
.dsh-woc-searchinput::placeholder{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));}
.dsh-woc-searchclear{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px;padding:0;flex:0 0 auto;}
.dsh-woc-searchclear:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}
.dsh-woc-history{flex:1 1 auto;overflow:auto;padding:2px 0 10px;min-height:0;}
.dsh-woc-group{margin:8px 0 0;}
.dsh-woc-group-label{font-size:11px;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));padding:0 8px 4px;letter-spacing:.02em;}
.dsh-woc-row{padding:0 6px;min-height:30px;border-radius:8px;color:var(--dsw-alias-label-secondary);}
.dsh-woc-row-main{padding:5px 2px;}
.dsh-woc-row-title{font-size:13px;}
.dsh-woc-side-foot{padding:6px 0 0;border-top:1px solid var(--dsw-alias-border-l1);}
.dsh-woc-account{display:flex;align-items:center;gap:8px;width:100%;border:0;background:transparent;color:var(--dsw-alias-label-secondary);padding:6px;border-radius:10px;cursor:pointer;text-align:left;font:inherit;}
.dsh-woc-account:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}
.dsh-woc-avatar{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--dsw-static-deepseek-500),var(--dsw-static-deepseek-400));color:#fff;flex:0 0 auto;}
.dsh-woc-accountname{flex:1 1 auto;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-woc-account .dsh-woc-status-dot{width:6px;height:6px;}
.dsh-woc-main{background-color:var(--dsw-alias-bg-base);background-image:radial-gradient(1100px 520px at 50% -8%, color-mix(in srgb, var(--dsw-static-deepseek-500) 7%, transparent), transparent 62%);}
.dsh-woc-main-head{height:44px;flex:0 0 44px;padding:0 16px;border-bottom:1px solid var(--dsw-alias-border-l1);}
.dsh-woc-main-head-empty{border-bottom-color:transparent;background:transparent;}
.dsh-woc-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary);}
.dsh-woc-head-actions .dsh-woc-icon-btn{width:28px;height:28px;}
.dsh-woc-scroll{padding:20px 24px 6px;}
.dsh-woc-thread{max-width:760px;gap:26px;}
.dsh-woc-user{max-width:80%;padding:10px 14px;border-radius:18px;background:var(--dsw-specific-bubble,var(--dsw-alias-bg-layer-2));border:1px solid var(--dsw-alias-border-l1);font-size:15px;line-height:1.7;}
.dsh-woc-user-text{line-height:1.7;}
.dsh-woc-assistant{gap:10px;font-size:15px;}
.dsh-woc-md{font-size:15px;line-height:1.8;}
.dsh-woc-md p{margin:0 0 12px;line-height:1.8;}
.dsh-woc-md h1{font-size:21px;}.dsh-woc-md h2{font-size:19px;}.dsh-woc-md h3{font-size:17px;}.dsh-woc-md h4{font-size:15px;}
.dsh-woc-md ul,.dsh-woc-md ol{margin:0 0 12px;padding-left:24px;}
.dsh-woc-md li{margin:4px 0;line-height:1.75;}
.dsh-woc-md blockquote{margin:0 0 12px;padding:4px 14px;}
.dsh-woc-thinking{border-radius:10px;background:var(--dsw-alias-bg-layer-1);}
.dsh-woc-tool{border-radius:10px;background:var(--dsw-alias-bg-layer-1);}
.dsh-woc-actions{opacity:0;transition:opacity .12s ease;}
.dsh-woc-assistant:hover .dsh-woc-actions,.dsh-woc-actions:focus-within{opacity:1;}
.dsh-woc-compose-wrap{padding:8px 24px 12px;}
.dsh-woc-compose-hero{padding:0;width:100%;max-width:720px;margin:0 auto;}
.dsh-woc-compose{max-width:720px;border-radius:18px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);padding:14px 14px 10px;box-shadow:0 8px 30px rgba(0,0,0,.08);}
.dsh-woc-compose:focus-within{border-color:var(--dsw-alias-border-l4);box-shadow:0 8px 30px rgba(0,0,0,.12);}
.dsh-woc-textarea{font-size:15px;line-height:1.65;min-height:32px;padding:2px 4px;}
.dsh-woc-compose-bar{margin-top:10px;gap:6px;}
.dsh-woc-chip{height:28px;padding:0 10px;font-size:12px;border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 38%, transparent);color:var(--dsw-alias-state-business-primary);}
.dsh-woc-chip[data-active="true"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);}
.dsh-woc-model{border-color:transparent;height:28px;padding:0 4px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;}
.dsh-woc-model:hover{color:var(--dsw-alias-label-primary);}
.dsh-woc-send{width:32px;height:32px;background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-on-color,#fff);}
.dsh-woc-send:hover{background:var(--dsw-static-deepseek-400);}
.dsh-woc-send[data-stop="true"]{background:var(--dsw-alias-state-error-primary);}
.dsh-woc-disclaimer{max-width:720px;margin:0 auto;padding:2px 4px 10px;text-align:center;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));}
.dsh-woc-hero{flex:1 1 auto;display:flex;align-items:center;justify-content:center;padding:24px 24px 70px;min-height:0;overflow:auto;}
.dsh-woc-hero-inner{width:100%;max-width:720px;display:flex;flex-direction:column;align-items:center;}
.dsh-woc-hero-title{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 24px;color:var(--dsw-alias-brand-primary);}
.dsh-woc-hero-title h1{margin:0;font-size:22px;line-height:1.4;font-weight:600;color:var(--dsw-alias-label-primary);letter-spacing:-.01em;}
.dsh-woc-hero-sub{margin:0 0 16px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-tertiary);text-align:center;}
.dsh-woc-hero .dsh-woc-compose-wrap{padding:0;width:100%;max-width:720px;}
.dsh-woc-hero .dsh-woc-disclaimer{padding-top:10px;}
html[data-windows-titlebar] .dsh-woc-brandrow{height:40px;flex-basis:40px;padding:0 4px 0 8px;}
html[data-windows-titlebar] .dsh-woc-newrow{margin-top:6px;}
html[data-platform='darwin'] .dsh-woc-sidebar{padding-top:10px;}
@media (hover: none){
  .dsh-woc-actions{opacity:1;}
  .dsh-woc-row-actions{display:flex;}
}
@media (max-width:760px){
  .dsh-woc-sidebar{width:280px;max-width:86vw;padding:6px 8px;}
  .dsh-woc-hero{padding:18px 14px 50px;}
  .dsh-woc-hero-title h1{font-size:19px;}
  .dsh-woc-main-head{height:48px;flex-basis:48px;padding:0 10px;}
  .dsh-woc-scroll{padding:16px 12px 4px;}
  .dsh-woc-compose-wrap{padding:6px 12px 8px;}
  .dsh-woc-user{max-width:90%;font-size:14px;}
  .dsh-woc-md{font-size:14.5px;}
}
/* v3: chat-demo component metrics. Sidebar width still follows the host and the
   mode switch floats over the full-width New chat row so its position stays put. */
.dsh-woc-sidebar{padding:6px 12px 0;}
.dsh-woc-brandrow{padding-left:4px;}
.dsh-woc-newrow{position:relative;display:block;height:40px;margin:0 0 8px;}
.dsh-woc-newchat{width:100%;height:40px;border-radius:100px;padding:0 16px;justify-content:center;box-shadow:0 -2px 2px rgba(72,104,178,.04),0 2px 2px rgba(106,111,117,.09),0 1px 2px rgba(72,104,178,.08);}
.dsh-woc-newchat:hover{box-shadow:0 4px 4px rgba(72,104,178,.04),0 -3px 4px rgba(72,104,178,.04),0 6px 6px rgba(106,111,117,.1);}
.dsh-woc-newrow .dsh-woc-toggle{position:absolute;top:50%;right:0;transform:translateY(-50%);z-index:2;background:var(--dsw-alias-button-elevated-fill);}
.dsh-woc-history{margin-top:16px;padding:0 0 10px;}
.dsh-woc-group{margin-top:16px;padding-top:4px;}
.dsh-woc-group-label{font-size:12px;font-weight:500;line-height:18px;padding:2px 10px;}
.dsh-woc-row{height:40px;min-height:40px;padding:9px 6px 9px 10px;border-radius:12px;font-size:14px;line-height:22px;}
.dsh-woc-row-main{height:100%;padding:0;}
.dsh-woc-row-title{font-size:14px;line-height:18px;}
.dsh-woc-side-foot{height:64px;display:flex;align-items:center;padding:0;border-top:0;}
.dsh-woc-account{padding:6px 2px 6px 6px;border-radius:12px;}
.dsh-woc-main-head{height:60px;flex-basis:60px;padding:12px 18px 0;border-bottom:0;}
.dsh-woc-main-head-empty{height:0;flex-basis:0;padding:0;overflow:hidden;border:0;}
.dsh-woc-title{font-size:14px;font-weight:600;line-height:22px;padding:8px 12px;color:var(--dsw-alias-label-primary);}
.dsh-woc-scroll{padding:0 0 6px;}
.dsh-woc-thread{width:calc(840px - 88px);max-width:calc(100% - 40px);margin:0 auto;padding:0;gap:0;}
.dsh-woc-thread > :first-child{margin-top:34px;}
.dsh-woc-user{max-width:calc(100% - 88px);padding:10px 16px;border-radius:22px;border:0;background:var(--dsw-specific-bubble);font-size:16px;line-height:24px;margin-bottom:16px;}
.dsh-woc-user-text{line-height:24px;}
.dsh-woc-assistant{font-size:16px;gap:10px;margin-bottom:24px;}
.dsh-woc-md{font-size:16px;line-height:26px;}
.dsh-woc-md p{margin:0 0 12px;line-height:26px;}
.dsh-woc-md h1{font-size:22px;}.dsh-woc-md h2{font-size:20px;}.dsh-woc-md h3{font-size:18px;}.dsh-woc-md h4{font-size:16px;}
.dsh-woc-md ul,.dsh-woc-md ol{padding-left:24px;margin-bottom:12px;}
.dsh-woc-md li{margin:4px 0;line-height:26px;}
.dsh-woc-compose-wrap{padding:0 18px 12px;}
.dsh-woc-compose{max-width:776px;border-radius:24px;background:var(--dsw-specific-input-major,var(--dsw-alias-bg-layer-2));border:1px solid var(--dsw-alias-border-l2-darkmode-thin,var(--dsw-alias-border-l2));padding:0;box-shadow:0 4px 10px rgba(0,0,0,.02),0 2px 4px rgba(0,0,0,.04);overflow:hidden;}
.dsh-woc-compose-hero{padding:0;width:100%;max-width:776px;margin:0 auto;}
.dsh-woc-textarea{min-height:60px;padding:12px 12px 0 16px;font-size:16px;line-height:24px;}
.dsh-woc-compose-bar{padding:12px;margin-top:0;gap:8px;}
.dsh-woc-chip{height:34px;border-radius:18px;padding:0 12px;font-size:13px;font-weight:500;gap:4px;}
.dsh-woc-send{width:34px;height:34px;margin-left:0;}
.dsh-woc-attach{width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary);display:inline-flex;align-items:center;justify-content:center;padding:0;opacity:.55;cursor:not-allowed;}
.dsh-woc-disclaimer{padding:6px 0 0;font-size:11px;line-height:16px;}
.dsh-woc-hero{padding:24px 24px 70px;}
.dsh-woc-hero-inner{max-width:776px;}
.dsh-woc-hero-title{margin-bottom:24px;}
.dsh-woc-hero .dsh-woc-compose-wrap{padding:0;max-width:776px;}
.dsh-woc-hero .dsh-woc-disclaimer{padding-top:10px;}
@media (max-width:760px){
  .dsh-woc-sidebar{padding:6px 8px 0;}
  .dsh-woc-main-head-empty{height:48px;flex-basis:48px;padding:0 10px;overflow:visible;}
  .dsh-woc-thread{width:100%;max-width:100%;padding:0 12px;}
  .dsh-woc-scroll{padding:0 0 4px;}
  .dsh-woc-compose-wrap{padding:0 12px 8px;}
  .dsh-woc-user{max-width:92%;font-size:15px;}
  .dsh-woc-md{font-size:15px;line-height:24px;}
}
/* The real chat-demo app runs in this iframe. */
.dsh-woc-demo-root{position:fixed;inset:0;top:var(--dsh-frame-top-clearance,0px);width:100vw;height:calc(100vh - var(--dsh-frame-top-clearance,0px));max-width:none;max-height:none;margin:0;padding:0;border:0;background:var(--dsw-alias-bg-base);overflow:hidden;}
.dsh-woc-demo-root::backdrop{background:transparent;}
.dsh-woc-demo-frame{position:absolute;inset:0;display:block;width:100%;height:100%;border:0;background:var(--dsw-alias-bg-base);}
.dsh-woc-demo-status{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-tertiary);font-size:14px;}
.dsh-woc-demo-toggle{position:absolute;z-index:30;display:flex;align-items:center;justify-content:center;}
.dsh-woc-demo-toggle-dim{opacity:.3;pointer-events:none;}
`

    function Styles() {
      return h('style', { 'data-work-or-chat': 'styles' }, CSS)
    }

    /* ------------------------------------------------------------------ */
    /* Markdown                                                            */
    /* ------------------------------------------------------------------ */

    const isBlockStart = (line) => {
      const trimmed = line.trimStart()
      return trimmed.startsWith(BT + BT + BT)
        || /^#{1,6}\s+/.test(trimmed)
        || /^([-*+]|\d+\.)\s+/.test(trimmed)
        || /^>\s?/.test(trimmed)
        || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)
        || /^\|.*\|$/.test(trimmed)
    }

    const safeHref = (value) => {
      const url = String(value || '').trim()
      if (/^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('#')) return url
      return undefined
    }

    const inlinePattern = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s<>)]+)/g

    function renderInline(text, keyPrefix) {
      const nodes = []
      let index = 0
      let match
      let key = 0
      inlinePattern.lastIndex = 0
      while ((match = inlinePattern.exec(text)) !== null) {
        if (match.index > index) nodes.push(text.slice(index, match.index))
        const token = match[0]
        const nodeKey = `${keyPrefix}-i${key++}`
        if (token.startsWith('**') || token.startsWith('__')) {
          nodes.push(h('strong', { key: nodeKey }, token.slice(2, -2)))
        } else if (token.startsWith('*') || token.startsWith('_')) {
          nodes.push(h('em', { key: nodeKey }, token.slice(1, -1)))
        } else if (token.startsWith(BT)) {
          nodes.push(h('code', { key: nodeKey, className: 'dsh-woc-inline-code' }, token.slice(1, -1)))
        } else if (token.startsWith('[')) {
          const close = token.indexOf('](')
          const label = token.slice(1, close)
          const href = safeHref(token.slice(close + 2, -1))
          nodes.push(href
            ? h('a', { key: nodeKey, href, target: '_blank', rel: 'noreferrer noopener' }, label)
            : label)
        } else {
          nodes.push(h('a', { key: nodeKey, href: token, target: '_blank', rel: 'noreferrer noopener' }, token))
        }
        index = match.index + token.length
      }
      if (index < text.length) nodes.push(text.slice(index))
      return nodes
    }

    const KEYWORDS = new Set([
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
      'continue', 'import', 'from', 'export', 'default', 'class', 'extends', 'async', 'await', 'new', 'try', 'catch',
      'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'this', 'super', 'yield', 'def', 'elif', 'lambda',
      'with', 'as', 'not', 'and', 'or', 'pass', 'raise', 'None', 'True', 'False', 'public', 'private', 'protected',
      'static', 'void', 'int', 'float', 'str', 'bool', 'true', 'false', 'null', 'undefined', 'interface', 'type',
      'enum', 'implements', 'readonly', 'package', 'struct', 'fn', 'match', 'impl', 'use', 'mod', 'pub', 'mut',
    ])

    function highlight(code, language) {
      const lang = String(language || '').toLowerCase()
      const hashComment = ['py', 'python', 'sh', 'bash', 'shell', 'yaml', 'yml', 'toml', 'rb', 'ruby'].includes(lang)
      const pattern = new RegExp(
        '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*'
        + (hashComment ? '|#[^\\n]*' : '')
        + '|"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`'
        + '|\\b\\d+(?:\\.\\d+)?\\b'
        + '|\\b[A-Za-z_$][A-Za-z0-9_$]*\\b)',
        'g',
      )
      const nodes = []
      let index = 0
      let key = 0
      let match
      while ((match = pattern.exec(code)) !== null) {
        if (match.index > index) nodes.push(code.slice(index, match.index))
        const token = match[0]
        let className
        if (token.startsWith('//') || token.startsWith('/*') || (hashComment && token.startsWith('#'))) className = 'dsh-woc-tok-com'
        else if (/^["'`]/.test(token)) className = 'dsh-woc-tok-str'
        else if (/^\d/.test(token)) className = 'dsh-woc-tok-num'
        else if (KEYWORDS.has(token)) className = 'dsh-woc-tok-kw'
        if (className) nodes.push(h('span', { key: `h${key++}`, className }, token))
        else nodes.push(token)
        index = match.index + token.length
      }
      if (index < code.length) nodes.push(code.slice(index))
      return nodes
    }

    function CodeBlock({ code, language, t }) {
      const [copied, setCopied] = useState(false)
      const copy = async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard can be unavailable; the code stays selectable.
        }
      }
      return h('div', { className: 'dsh-woc-code' },
        h('div', { className: 'dsh-woc-code-head' },
          h('span', null, language || 'text'),
          h('button', { type: 'button', className: 'dsh-woc-code-copy', onClick: copy }, copied ? t('chat.copied') : t('chat.copy'))),
        h('pre', null, h('code', null, highlight(code, language))))
    }

    function renderMarkdown(text, t) {
      const source = String(text || '').replace(/\r\n/g, '\n')
      const lines = source.split('\n')
      const blocks = []
      let index = 0
      let key = 0
      while (index < lines.length) {
        const line = lines[index]
        if (line.trim() === '') {
          index += 1
          continue
        }
        if (line.trimStart().startsWith(BT + BT + BT)) {
          const language = line.trimStart().slice(3).trim()
          index += 1
          const code = []
          while (index < lines.length && !lines[index].trimStart().startsWith(BT + BT + BT)) {
            code.push(lines[index])
            index += 1
          }
          index += 1
          blocks.push(h(CodeBlock, { key: `b${key++}`, code: code.join('\n'), language, t }))
          continue
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line)
        if (heading) {
          const level = Math.min(6, heading[1].length)
          blocks.push(h(`h${level}`, { key: `b${key++}` }, renderInline(heading[2].trim(), `b${key}`)))
          index += 1
          continue
        }
        if (/^\s*([-*+])\s+/.test(line)) {
          const items = []
          while (index < lines.length && /^\s*([-*+])\s+/.test(lines[index])) {
            items.push(h('li', { key: `l${key++}` }, renderInline(lines[index].replace(/^\s*[-*+]\s+/, ''), `l${key}`)))
            index += 1
          }
          blocks.push(h('ul', { key: `b${key++}` }, items))
          continue
        }
        if (/^\s*\d+\.\s+/.test(line)) {
          const items = []
          while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
            items.push(h('li', { key: `l${key++}` }, renderInline(lines[index].replace(/^\s*\d+\.\s+/, ''), `l${key}`)))
            index += 1
          }
          blocks.push(h('ol', { key: `b${key++}` }, items))
          continue
        }
        if (/^>\s?/.test(line)) {
          const quoted = []
          while (index < lines.length && /^>\s?/.test(lines[index])) {
            quoted.push(lines[index].replace(/^>\s?/, ''))
            index += 1
          }
          blocks.push(h('blockquote', { key: `b${key++}` }, h('p', null, renderInline(quoted.join('\n'), `q${key}`))))
          continue
        }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
          blocks.push(h('hr', { key: `b${key++}` }))
          index += 1
          continue
        }
        if (/^\|.*\|$/.test(line.trim()) && index + 1 < lines.length && /^\s*\|?[\s:|-]+\|?[\s:|-]*$/.test(lines[index + 1].trim())) {
          const parseRow = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
          const header = parseRow(line)
          index += 2
          const rows = []
          while (index < lines.length && /^\|.*\|$/.test(lines[index].trim())) {
            rows.push(parseRow(lines[index]))
            index += 1
          }
          blocks.push(h('table', { key: `b${key++}` },
            h('thead', null, h('tr', null, header.map((cell, cellIndex) => h('th', { key: cellIndex }, renderInline(cell, `th${cellIndex}`))))),
            h('tbody', null, rows.map((row, rowIndex) => h('tr', { key: rowIndex }, row.map((cell, cellIndex) => h('td', { key: cellIndex }, renderInline(cell, `td${rowIndex}-${cellIndex}`))))))))
          continue
        }
        const paragraph = []
        while (index < lines.length && lines[index].trim() !== '' && !isBlockStart(lines[index])) {
          paragraph.push(lines[index])
          index += 1
        }
        if (paragraph.length === 0) {
          paragraph.push(lines[index])
          index += 1
        }
        blocks.push(h('p', { key: `b${key++}` }, renderInline(paragraph.join('\n'), `p${key}`)))
      }
      return blocks
    }

    function Markdown({ text, t }) {
      const blocks = useMemo(() => renderMarkdown(text, t), [text, t])
      return h('div', { className: 'dsh-woc-md' }, blocks)
    }

    /* ------------------------------------------------------------------ */
    /* Streaming                                                           */
    /* ------------------------------------------------------------------ */

    function toDisplayBlock(contentBlock) {
      if (!contentBlock || typeof contentBlock !== 'object') return null
      switch (contentBlock.type) {
        case 'text':
          return {
            type: 'text',
            text: typeof contentBlock.text === 'string' ? contentBlock.text : '',
            citations: Array.isArray(contentBlock.citations) ? contentBlock.citations : [],
          }
        case 'thinking':
          return {
            type: 'thinking',
            thinking: typeof contentBlock.thinking === 'string' ? contentBlock.thinking : '',
            signature: typeof contentBlock.signature === 'string' ? contentBlock.signature : '',
          }
        case 'web_search_tool_result': {
          const items = Array.isArray(contentBlock.content)
            ? contentBlock.content
              .filter((item) => item && item.type === 'web_search_result' && typeof item.url === 'string')
              .slice(0, 20)
              .map((item) => ({
                title: typeof item.title === 'string' && item.title ? item.title : item.url,
                url: item.url,
                snippet: typeof item.snippet === 'string' ? item.snippet : '',
              }))
            : []
          return items.length > 0 ? { type: 'search', queries: [], results: items } : null
        }
        case 'web_fetch_tool_result': {
          const result = contentBlock.content
          if (result && typeof result === 'object' && result.type !== 'web_fetch_tool_result_error') {
            const url = typeof result.url === 'string' ? result.url : ''
            const title = typeof result.content?.title === 'string' && result.content.title ? result.content.title : url
            if (url) return { type: 'open', url, title }
          }
          return null
        }
        default:
          return null
      }
    }

    function applyStreamEvent(assistant, event, indexMap, onTitle) {
      switch (event.type) {
        case 'content_block_start': {
          const block = toDisplayBlock(event.content_block)
          if (!block) {
            indexMap.set(event.index, -1)
            return
          }
          indexMap.set(event.index, assistant.blocks.length)
          assistant.blocks.push(block)
          return
        }
        case 'content_block_delta': {
          const target = indexMap.get(event.index)
          if (target === undefined || target < 0) return
          const block = assistant.blocks[target]
          if (!block) return
          const delta = event.delta || {}
          if (block.type === 'text') {
            if (delta.type === 'text_delta' && typeof delta.text === 'string') block.text += delta.text
            else if (delta.type === 'citations_delta' && delta.citation) {
              block.citations = [...(block.citations || []), delta.citation]
            }
          } else if (block.type === 'thinking') {
            if (delta.type === 'thinking_delta' && typeof delta.thinking === 'string') block.thinking += delta.thinking
            else if (delta.type === 'signature_delta' && typeof delta.signature === 'string') {
              block.signature = (block.signature || '') + delta.signature
            }
          }
          return
        }
        case 'content_block_stop':
          indexMap.delete(event.index)
          return
        case 'message_delta': {
          if (event.delta?.title) {
            const title = String(event.delta.title).trim()
            if (title) onTitle(title)
          }
          if (event.delta?.stop_reason) assistant.stopReason = event.delta.stop_reason
          if (event.usage) assistant.usage = event.usage
          return
        }
        default:
          return
      }
    }

    async function consumeStream(response, assistant, onUpdate, onTitle) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const indexMap = new Map()
      let buffer = ''
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let boundary = buffer.indexOf('\n\n')
          while (boundary >= 0) {
            const frame = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            const data = frame
              .split(/\r?\n/)
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).replace(/^ /, ''))
              .join('\n')
            if (data && data !== '[DONE]') {
              let event
              try {
                event = JSON.parse(data)
              } catch {
                event = null
              }
              if (event?.type === 'error') {
                const failure = new Error(event.error?.message || event.message || 'Stream error')
                failure.code = 'stream'
                throw failure
              }
              if (event) {
                applyStreamEvent(assistant, event, indexMap, onTitle)
                onUpdate()
              }
            }
            boundary = buffer.indexOf('\n\n')
          }
        }
      } finally {
        try {
          reader.releaseLock()
        } catch {
          // Already released.
        }
        onUpdate()
      }
    }

    function buildHistory(messages) {
      const out = []
      for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index]
        if (message.role !== 'user') continue
        const next = messages[index + 1]
        const last = index === messages.length - 1
        const question = messageText(message)
        if (next?.role === 'assistant' && next.status === 'done') {
          const answer = messageText(next)
          if (question && answer) {
            out.push({ role: 'user', content: question }, { role: 'assistant', content: answer })
            index += 1
            continue
          }
        }
        if (last && question) out.push({ role: 'user', content: question })
      }
      if (out.length === 0 && messages.length > 0) {
        const question = messageText(messages[messages.length - 1])
        if (question) out.push({ role: 'user', content: question })
      }
      let total = out.reduce((sum, message) => sum + message.content.length, 0)
      while (total > 300_000 && out.length > 2) {
        total -= out.shift().content.length
        if (out[0]?.role === 'assistant') total -= out.shift().content.length
      }
      while (out.length > 200) out.shift()
      while (out[0]?.role === 'assistant') out.shift()
      return out
    }

    /* ------------------------------------------------------------------ */
    /* Small components                                                    */
    /* ------------------------------------------------------------------ */

    function ModeToggle({ t }) {
      const mode = useMode()
      return h('div', { className: 'dsh-woc-toggle', role: 'group', 'aria-label': t('toggle.chat') },
        h('button', {
          type: 'button',
          'aria-pressed': mode === 'chat',
          'data-active': mode === 'chat',
          className: 'dsh-woc-toggle-btn',
          title: t('toggle.chatHint'),
          onClick: (event) => {
            event.stopPropagation()
            setMode('chat')
          },
          onPointerDown: (event) => event.stopPropagation(),
        }, h(ChatIcon, { size: 14 })),
        h('button', {
          type: 'button',
          'aria-pressed': mode === 'work',
          'data-active': mode === 'work',
          className: 'dsh-woc-toggle-btn',
          title: t('toggle.workHint'),
          onClick: (event) => {
            event.stopPropagation()
            setMode('work')
          },
          onPointerDown: (event) => event.stopPropagation(),
        }, h(CodeIcon, { size: 14 })))
    }

    const Wordmark = () => h('span', {
      className: 'dsh-woc-wordmark',
      dangerouslySetInnerHTML: { __html: WORDMARK },
    })

    function NewSessionToggle({ t, children, wide }) {
      const anchorRef = useRef(null)

      useEffect(() => {
        if (!wide) return undefined
        const anchor = anchorRef.current
        if (!anchor) return undefined
        const measure = () => {
          let node = anchor
          let best = 0
          while (node && node !== document.body) {
            const rect = node.getBoundingClientRect()
            if (rect.height >= window.innerHeight * 0.7 && rect.width >= 240 && rect.width <= 480) {
              best = Math.max(best, rect.width)
            }
            node = node.parentElement
          }
          if (best > 0) setSidebarWidth(best)
        }
        measure()
        const row = anchor.closest('[data-slot="sidebar.session.action"]')?.parentElement ?? anchor.parentElement
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
        if (row && observer) observer.observe(row)
        window.addEventListener('resize', measure)
        return () => {
          observer?.disconnect()
          window.removeEventListener('resize', measure)
        }
      }, [wide])

      if (!wide) {
        return h(React.Fragment, null,
          children,
          h('button', {
            type: 'button',
            className: 'dsh-woc-rail-toggle',
            title: t('toggle.chatHint'),
            'aria-label': t('toggle.chatHint'),
            onClick: () => setMode('chat'),
          }, h(ChatIcon, { size: 18 })))
      }
      return h(React.Fragment, null,
        children,
        h('span', { ref: anchorRef, className: 'dsh-woc-row-toggle' },
          h(Styles),
          h(ModeToggle, { t })))
    }

    function Toast({ toast, onDone }) {
      useEffect(() => {
        if (!toast) return undefined
        const timer = setTimeout(onDone, 3200)
        return () => clearTimeout(timer)
      }, [toast, onDone])
      if (!toast) return null
      return h('div', { className: 'dsh-woc-toast', 'data-tone': toast.tone || 'info', role: 'status' }, toast.message)
    }

    function ConfirmDialog({ t, confirm, onClose }) {
      useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [onClose])
      if (!confirm) return null
      return h('div', { className: 'dsh-woc-modal-mask', onClick: onClose },
        h('div', {
          className: 'dsh-woc-modal',
          role: 'alertdialog',
          'aria-modal': 'true',
          onClick: (event) => event.stopPropagation(),
        },
        h('h3', null, confirm.title),
        h('p', { className: 'dsh-woc-modal-sub' }, confirm.body),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
          h('button', { type: 'button', className: 'dsh-woc-btn', onClick: onClose }, t('common.cancel')),
          h('button', {
            type: 'button',
            className: 'dsh-woc-btn',
            'data-danger': 'true',
            onClick: async () => {
              const action = confirm.action
              onClose()
              if (action) {
                try {
                  await action()
                } catch {
                  // The caller reports its own failure.
                }
              }
            },
          }, confirm.label || t('common.delete')))))
    }

    function ThinkingBlock({ block, streaming, t }) {
      const [open, setOpen] = useState(streaming)
      useEffect(() => {
        if (streaming) setOpen(true)
        else setOpen(false)
      }, [streaming])
      return h('div', { className: 'dsh-woc-thinking' },
        h('button', {
          type: 'button',
          className: 'dsh-woc-thinking-head',
          onClick: () => setOpen((value) => !value),
          'aria-expanded': open,
        },
        h(ChevronIcon, { size: 12, open }),
        h(BrainIcon, { size: 13 }),
        h('span', null, t('chat.thinkingLabel')),
        typeof block.elapsed === 'number' && block.elapsed > 0
          ? h('span', { className: 'dsh-woc-muted' }, t('chat.thinkingSeconds', { seconds: Math.round(block.elapsed) }))
          : null),
        open ? h('div', { className: 'dsh-woc-thinking-body' }, block.thinking) : null)
    }

    function SearchCard({ block, t }) {
      return h('details', { className: 'dsh-woc-tool' },
        h('summary', null, h(SearchIcon, { size: 13 }), h('span', null, t('chat.searched', { count: block.results.length }))),
        block.queries?.length > 0 ? h('div', { className: 'dsh-woc-muted', style: { marginTop: 6 } }, block.queries.join(' · ')) : null,
        h('ul', { className: 'dsh-woc-tool-list' },
          block.results.map((result, index) => h('li', { key: index },
            h('a', { href: result.url, target: '_blank', rel: 'noreferrer noopener' }, result.title || result.url),
            result.snippet ? h('p', null, result.snippet) : null))))
    }

    function OpenCard({ block, t }) {
      const href = safeHref(block.url)
      return h('div', { className: 'dsh-woc-tool' },
        h('div', { className: 'dsh-woc-tool-head' }, h(ArrowIcon, { size: 13 }), h('span', null, t('chat.readLink'))),
        href
          ? h('a', { className: 'dsh-woc-tool-link', href, target: '_blank', rel: 'noreferrer noopener', title: block.url }, block.title || block.url)
          : h('span', { className: 'dsh-woc-tool-link' }, block.title || block.url))
    }

    function LinksCard({ block, t }) {
      return h('details', { className: 'dsh-woc-tool' },
        h('summary', null, h(ArrowIcon, { size: 13 }), h('span', null, t('chat.readLink'))),
        h('ul', { className: 'dsh-woc-tool-list' },
          block.links.map((link, index) => h('li', { key: index },
            h('a', { href: link.url, target: '_blank', rel: 'noreferrer noopener' }, link.title || link.url)))))
    }

    function CitationList({ citations, t }) {
      const seen = new Set()
      const items = citations.filter((citation) => {
        if (!citation || typeof citation.url !== 'string' || seen.has(citation.url)) return false
        seen.add(citation.url)
        return true
      }).slice(0, 8)
      if (items.length === 0) return null
      return h('div', { className: 'dsh-woc-cites' },
        h('span', null, t('chat.sources')),
        items.map((citation, index) => h('a', {
          key: index,
          className: 'dsh-woc-cite',
          href: citation.url,
          target: '_blank',
          rel: 'noreferrer noopener',
          title: citation.url,
        }, citation.title || citation.url)))
    }

    function Block({ block, streaming, t, hideCitations }) {
      switch (block.type) {
        case 'text':
          return h('div', null,
            h(Markdown, { text: block.text, t }),
            block.citations?.length > 0 && !hideCitations ? h(CitationList, { citations: block.citations, t }) : null)
        case 'thinking':
          return h(ThinkingBlock, { block, streaming, t })
        case 'search':
          return h(SearchCard, { block, t })
        case 'open':
          return h(OpenCard, { block, t })
        case 'links':
          return h(LinksCard, { block, t })
        default:
          return null
      }
    }

    function UserMessage({ message }) {
      const text = messageText(message)
      return h('div', { className: 'dsh-woc-user' },
        h('div', { className: 'dsh-woc-user-text' }, text || '…'))
    }

    function AssistantMessage({ message, streaming, t, onCopy, onRegenerate }) {
      const text = messageText(message)
      const isStreaming = message.status === 'streaming'
      const hideCitations = message.blocks.some((block) => block.type === 'text' && /(来源|source)\s*[:：]/i.test(block.text))
      return h('div', { className: 'dsh-woc-assistant' },
        message.blocks.length === 0 && isStreaming
          ? h('div', { className: 'dsh-woc-typing' }, h('i'), h('i'), h('i'))
          : null,
        message.blocks.map((block, index) => h(Block, { key: `${message.id}-${index}`, block, streaming: isStreaming, t, hideCitations })),
        isStreaming && text ? h('span', { className: 'dsh-woc-cursor' }) : null,
        message.status === 'error'
          ? h('div', { className: 'dsh-woc-error' }, message.error || t('error.sendFailed', { message: '' }))
          : null,
        message.status === 'stopped' ? h('div', { className: 'dsh-woc-stopped' }, t('chat.stopped')) : null,
        text || message.status === 'error'
          ? h('div', { className: 'dsh-woc-actions' },
            text ? h('button', {
              type: 'button',
              className: 'dsh-woc-action',
              onClick: () => onCopy(text),
            }, h(CopyIcon, { size: 12 }), t('chat.copy')) : null,
            !isStreaming && onRegenerate
              ? h('button', { type: 'button', className: 'dsh-woc-action', onClick: onRegenerate }, h(RefreshIcon, { size: 12 }), t('chat.regenerate'))
              : null)
          : null)
    }

    function Composer({
      t, draft, setDraft, onSend, streaming, onStop, thinking, setThinking,
      search, setSearch, disabled, inputRef, onOpenSettings, hero,
    }) {
      useEffect(() => {
        const element = inputRef.current
        if (!element) return
        element.style.height = 'auto'
        element.style.height = `${Math.min(element.scrollHeight, 220)}px`
      }, [draft, inputRef])

      const submit = () => {
        if (streaming || disabled) return
        const value = draft.trim()
        if (!value) return
        onSend(value)
      }

      return h('div', { className: cx('dsh-woc-compose-wrap', hero && 'dsh-woc-compose-hero') },
        h('div', { className: 'dsh-woc-compose' },
          disabled
            ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', color: 'var(--dsw-alias-label-tertiary)', fontSize: 13 } },
              h('span', { style: { flex: '1 1 auto' } }, t('chat.noCredentialBody')),
              h('button', { type: 'button', className: 'dsh-woc-btn', onClick: onOpenSettings }, t('chat.openSettings')))
            : h('textarea', {
              ref: inputRef,
              className: 'dsh-woc-textarea',
              rows: 1,
              value: draft,
              placeholder: t('chat.placeholder'),
              'aria-label': t('chat.placeholder'),
              onChange: (event) => setDraft(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  submit()
                }
              },
            }),
          h('div', { className: 'dsh-woc-compose-bar' },
            h('button', {
              type: 'button',
              className: 'dsh-woc-chip',
              'data-active': thinking,
              onClick: () => setThinking((value) => !value),
              title: t('chat.thinking'),
            }, h(BrainIcon, { size: 12 }), t('chat.thinking')),
            h('button', {
              type: 'button',
              className: 'dsh-woc-chip',
              'data-active': search,
              onClick: () => setSearch((value) => !value),
              title: t('chat.search'),
            }, h(SearchIcon, { size: 12 }), t('chat.search')),
            h('span', { className: 'dsh-woc-spacer' }),
            h('button', { type: 'button', className: 'dsh-woc-attach', title: t('chat.attachmentsUnavailable'), disabled: true }, h(PaperclipIcon, { size: 16 })),
            streaming
              ? h('button', { type: 'button', className: 'dsh-woc-send', 'data-stop': 'true', title: t('chat.stop'), onClick: onStop }, h(StopIcon, { size: 14 }))
              : h('button', { type: 'button', className: 'dsh-woc-send', title: t('chat.send'), disabled: disabled || !draft.trim(), onClick: submit }, h(SendIcon, { size: 14 })))))
    }

    function groupSessions(sessions) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const today = start.getTime()
      const day = 86_400_000
      const groups = [
        { id: 'today', labelKey: 'sidebar.today', items: [] },
        { id: 'yesterday', labelKey: 'sidebar.yesterday', items: [] },
        { id: 'week', labelKey: 'sidebar.week', items: [] },
        { id: 'earlier', labelKey: 'sidebar.earlier', items: [] },
      ]
      for (const session of sessions) {
        const time = session.updatedAt || session.createdAt || 0
        const target = time >= today ? groups[0] : time >= today - day ? groups[1] : time >= today - 7 * day ? groups[2] : groups[3]
        target.items.push(session)
      }
      return groups.filter((group) => group.items.length > 0)
    }

    function Sidebar({
      t, sessions, activeId, onSelect, onNew, onRename, onDelete, onSettings,
      credential, open, onClose,
    }) {
      const [renaming, setRenaming] = useState(null)
      const [renameValue, setRenameValue] = useState('')
      const [searchOpen, setSearchOpen] = useState(false)
      const [query, setQuery] = useState('')
      const searchRef = useRef(null)
      const sidebarWidth = useSidebarWidth()
      const configured = credential.kind !== 'none'

      useEffect(() => {
        if (!searchOpen) return undefined
        const timer = setTimeout(() => searchRef.current?.focus(), 30)
        return () => clearTimeout(timer)
      }, [searchOpen])

      const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (!needle) return sessions
        return sessions.filter((session) => (session.title || '').toLowerCase().includes(needle))
      }, [sessions, query])
      const groups = useMemo(() => groupSessions(filtered), [filtered])

      const commit = (id) => {
        const value = renameValue.trim()
        setRenaming(null)
        if (value) onRename(id, value)
      }

      return h('aside', {
        className: 'dsh-woc-sidebar',
        'data-open': open,
        'aria-label': t('toggle.chat'),
        style: { width: sidebarWidth, flexBasis: sidebarWidth },
      },
        h('div', { className: 'dsh-woc-brandrow' },
          h(Wordmark),
          h('span', { className: 'dsh-woc-brandbadge' }, 'CHAT'),
          h('button', {
            type: 'button',
            className: 'dsh-woc-icon-btn dsh-woc-brandsearch',
            'data-active': searchOpen,
            title: t('sidebar.search'),
            'aria-label': t('sidebar.search'),
            onClick: () => {
              setSearchOpen((value) => !value)
              if (searchOpen) setQuery('')
            },
          }, h(SearchIcon, { size: 15 }))),
        h('div', { className: 'dsh-woc-newrow' },
          h('button', { type: 'button', className: 'dsh-woc-newchat', onClick: onNew },
            h(PlusIcon, { size: 16 }),
            h('span', null, t('sidebar.new'))),
          h(ModeToggle, { t })),
        searchOpen
          ? h('div', { className: 'dsh-woc-searchbox' },
            h(SearchIcon, { size: 14 }),
            h('input', {
              ref: searchRef,
              className: 'dsh-woc-searchinput',
              value: query,
              placeholder: t('sidebar.searchPlaceholder'),
              'aria-label': t('sidebar.search'),
              onChange: (event) => setQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setQuery('')
                  setSearchOpen(false)
                }
              },
            }),
            query
              ? h('button', {
                type: 'button',
                className: 'dsh-woc-searchclear',
                title: t('common.close'),
                'aria-label': t('common.close'),
                onClick: () => setQuery(''),
              }, h(CloseIcon, { size: 12 }))
              : null)
          : null,
        h('div', { className: 'dsh-woc-history' },
          groups.length === 0
            ? h('div', { className: 'dsh-woc-empty-list' },
              h('div', null, query ? t('sidebar.noResults') : t('sidebar.empty')),
              query ? null : h('div', null, t('sidebar.emptyHint')))
            : groups.map((group) => h('div', { className: 'dsh-woc-group', key: group.id },
              h('div', { className: 'dsh-woc-group-label' }, t(group.labelKey)),
              group.items.map((session) => h('div', {
                key: session.id,
                className: 'dsh-woc-row',
                'data-active': session.id === activeId,
              },
              renaming === session.id
                ? h('input', {
                  className: 'dsh-woc-rename',
                  value: renameValue,
                  autoFocus: true,
                  onChange: (event) => setRenameValue(event.target.value),
                  onBlur: () => commit(session.id),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      commit(session.id)
                    } else if (event.key === 'Escape') {
                      event.preventDefault()
                      setRenaming(null)
                    }
                  },
                })
                : h('button', {
                  type: 'button',
                  className: 'dsh-woc-row-main',
                  title: session.title,
                  onClick: () => onSelect(session.id),
                }, h('span', { className: 'dsh-woc-row-title' }, session.title || t('chat.newChat'))),
              h('span', { className: 'dsh-woc-row-actions' },
                h('button', {
                  type: 'button',
                  className: 'dsh-woc-icon-btn',
                  title: t('sidebar.rename'),
                  onClick: (event) => {
                    event.stopPropagation()
                    setRenaming(session.id)
                    setRenameValue(session.title || '')
                  },
                }, h(PencilIcon, { size: 12 })),
                h('button', {
                  type: 'button',
                  className: 'dsh-woc-icon-btn',
                  title: t('sidebar.delete'),
                  onClick: (event) => {
                    event.stopPropagation()
                    onDelete(session)
                  },
                }, h(TrashIcon, { size: 12 })))))))),
        h('div', { className: 'dsh-woc-side-foot' },
          h('button', { type: 'button', className: 'dsh-woc-account', onClick: onSettings },
            h('span', { className: 'dsh-woc-avatar' }, h(ChatIcon, { size: 14 })),
            h('span', { className: 'dsh-woc-accountname' }, configured ? 'DeepSeek' : t('settings.unavailable')),
            h('span', { className: 'dsh-woc-status-dot', 'data-ok': configured }),
            h(GearIcon, { size: 14 }))))
    }

    function SettingsDialog({
      t, credential, settings, onClose, onMode, onModel, onSaveKey, onClearKey,
      onImport, onClearAll, importing, version,
    }) {
      const [key, setKey] = useState('')
      const [busy, setBusy] = useState(false)
      const [keyError, setKeyError] = useState('')
      const fileRef = useRef(null)

      useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [onClose])

      const save = async () => {
        if (!key.trim() || busy) return
        setBusy(true)
        setKeyError('')
        try {
          await onSaveKey(key.trim())
          setKey('')
        } catch (error) {
          setKeyError(error?.message || String(error))
        } finally {
          setBusy(false)
        }
      }

      const status = (label, available) => h('div', { className: 'dsh-woc-status-row' },
        h('span', { className: 'dsh-woc-status-dot', 'data-ok': available }),
        h('span', { style: { flex: '1 1 auto' } }, label),
        h('span', { className: 'dsh-woc-badge', 'data-ok': available }, available ? t('settings.available') : t('settings.unavailable')))

      return h('div', { className: 'dsh-woc-modal-mask', onClick: onClose },
        h('div', { className: 'dsh-woc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settings.title'), onClick: (event) => event.stopPropagation() },
          h('h3', null, t('settings.title')),
          h('p', { className: 'dsh-woc-modal-sub' }, t('settings.modeHint')),

          h('div', { className: 'dsh-woc-field' },
            h('span', { className: 'dsh-woc-label' }, t('settings.mode')),
            h('div', { className: 'dsh-woc-segment' },
              ['auto', 'account', 'api-key'].map((mode) => h('button', {
                key: mode,
                type: 'button',
                'data-active': settings.credentialMode === mode,
                onClick: () => onMode(mode),
              }, t(mode === 'auto' ? 'settings.auto' : mode === 'account' ? 'settings.account' : 'settings.apiKey')))),
            h('p', { className: 'dsh-woc-mode-hint' }, t('settings.modeHint'))),

          h('div', { className: 'dsh-woc-field' },
            h('span', { className: 'dsh-woc-label' }, t('settings.model')),
            h('div', { className: 'dsh-woc-segment' },
              ['deepseek-flash', 'deepseek-v4-pro'].map((value) => h('button', {
                key: value,
                type: 'button',
                'data-active': settings.model === value,
                onClick: () => onModel(value),
              }, t(value === 'deepseek-flash' ? 'chat.modelFlash' : 'chat.modelPro')))),
            h('p', { className: 'dsh-woc-mode-hint' }, t('settings.modelHint'))),

          h('div', { className: 'dsh-woc-field' },
            h('span', { className: 'dsh-woc-label' }, t('settings.credential')),
            h('div', { className: 'dsh-woc-status-list' },
              status(t('settings.accountState'), credential.available?.account),
              status(t('settings.pluginKey'), credential.available?.pluginKey),
              status(t('settings.envKey'), credential.available?.environmentKey))),
          h('div', { className: 'dsh-woc-field' },
            h('div', { className: 'dsh-woc-key-row' },
              h('input', {
                className: 'dsh-woc-input',
                type: 'password',
                value: key,
                autoComplete: 'off',
                placeholder: t('settings.keyPlaceholder'),
                onChange: (event) => setKey(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    save()
                  }
                },
              }),
              h('button', { type: 'button', className: 'dsh-woc-btn', 'data-primary': 'true', disabled: busy || !key.trim(), onClick: save }, busy ? '…' : t('settings.saveKey'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 } },
              h('button', { type: 'button', className: 'dsh-woc-btn', disabled: !credential.available?.pluginKey, onClick: onClearKey }, t('settings.clearKey')),
              keyError ? h('span', { className: 'dsh-woc-error-text' }, keyError) : null)),

          h('div', { className: 'dsh-woc-field' },
            h('span', { className: 'dsh-woc-label' }, t('settings.data')),
            h('p', { className: 'dsh-woc-mode-hint', style: { margin: '0 0 8px' } }, t('settings.importHint')),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
              h('button', { type: 'button', className: 'dsh-woc-btn', disabled: importing, onClick: () => fileRef.current?.click() }, importing ? t('settings.importing') : t('settings.import')),
              h('button', { type: 'button', className: 'dsh-woc-btn', 'data-danger': 'true', onClick: onClearAll }, t('settings.clearAll')),
              h('input', {
                ref: fileRef,
                type: 'file',
                accept: '.zip,application/zip',
                style: { display: 'none' },
                onChange: (event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) onImport(file)
                },
              }))),

          h('div', { className: 'dsh-woc-field', style: { marginBottom: 0 } },
            h('span', { className: 'dsh-woc-label' }, t('settings.about')),
            h('p', { className: 'dsh-woc-mode-hint', style: { margin: 0 } }, t('settings.aboutBody')),
            h('p', { className: 'dsh-woc-mode-hint', style: { margin: '6px 0 0' } }, t('settings.version', { version }))),

          h('div', { className: 'dsh-woc-settings-foot' },
            h('button', { type: 'button', className: 'dsh-woc-btn', onClick: onClose }, t('settings.close')))))
    }

    /* ------------------------------------------------------------------ */
    /* Overlay                                                             */
    /* ------------------------------------------------------------------ */

    function ChatOverlay({ t, version }) {
      const mode = useMode()
      const [booted, setBooted] = useState(false)
      const [fatal, setFatal] = useState(null)
      const [sessions, setSessions] = useState([])
      const [settings, setSettings] = useState({ model: 'deepseek-flash', credentialMode: 'auto' })
      const [credential, setCredential] = useState({ kind: 'none', available: { account: false, pluginKey: false, environmentKey: false } })
      const [activeId, setActiveId] = useState(null)
      const [session, setSession] = useState(null)
      const [streaming, setStreaming] = useState(false)
      const [error, setError] = useState(null)
      const [settingsOpen, setSettingsOpen] = useState(false)
      const [confirm, setConfirm] = useState(null)
      const [toast, setToast] = useState(null)
      const [draft, setDraft] = useState('')
      const [thinking, setThinking] = useState(false)
      const [search, setSearch] = useState(false)
      const [model, setModel] = useState('deepseek-flash')
      const [sidebarOpen, setSidebarOpen] = useState(false)
      const [importing, setImporting] = useState(false)

      const sessionRef = useRef(null)
      const abortRef = useRef(null)
      const flushTimer = useRef(0)
      const stickRef = useRef(true)
      const scrollRef = useRef(null)
      const inputRef = useRef(null)
      const dialogRef = useRef(null)

      const showToast = (message, tone = 'info') => setToast({ message, tone, id: Date.now() })
      const dismissToast = useCallback(() => setToast(null), [])

      const upsert = (summary) => {
        if (!summary) return
        setSessions((list) => {
          const next = list.filter((item) => item.id !== summary.id)
          next.push(summary)
          next.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          return next
        })
      }

      const publish = (force) => {
        if (!force) {
          if (flushTimer.current) return
          flushTimer.current = setTimeout(() => {
            flushTimer.current = 0
            const current = sessionRef.current
            if (current) setSession({ ...current, messages: current.messages.slice() })
          }, 40)
          return
        }
        if (flushTimer.current) {
          clearTimeout(flushTimer.current)
          flushTimer.current = 0
        }
        const current = sessionRef.current
        if (current) setSession({ ...current, messages: current.messages.slice() })
      }

      const loadSession = async (id) => {
        setError(null)
        try {
          const data = await callApi('session-get', { id })
          if (!data?.session) return
          sessionRef.current = data.session
          setSession(data.session)
          setActiveId(id)
          setThinking(Boolean(data.session.thinking))
          setSearch(Boolean(data.session.search))
          setModel(data.session.model || 'deepseek-flash')
          try {
            localStorage.setItem(LAST_KEY, id)
          } catch {
            // Preference is optional.
          }
          stickRef.current = true
        } catch (failure) {
          showToast(t('error.loadFailed', { message: failure.message }), 'error')
        }
      }

      const newChat = () => {
        if (abortRef.current) abortRef.current.abort()
        setActiveId(null)
        sessionRef.current = null
        setSession(null)
        setDraft('')
        setError(null)
        setSidebarOpen(false)
        try {
          localStorage.removeItem(LAST_KEY)
        } catch {
          // Preference is optional.
        }
        setTimeout(() => inputRef.current?.focus(), 30)
      }

      const send = async (rawText) => {
        const prompt = String(rawText || '').trim()
        if (!prompt || streaming) return
        if (credential.kind === 'none') {
          setError(new Error(t('error.noCredential')))
          setSettingsOpen(true)
          return
        }
        let base = sessionRef.current
        if (!base) {
          base = {
            id: uid(),
            title: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            model,
            thinking,
            search,
            messages: [],
          }
          sessionRef.current = base
          setActiveId(base.id)
          try {
            localStorage.setItem(LAST_KEY, base.id)
          } catch {
            // Preference is optional.
          }
        }
        const now = Date.now()
        const derivedTitle = deriveTitle(prompt)
        const hadTitle = Boolean(base.title)
        const user = { id: `u-${uid()}`, role: 'user', createdAt: now, blocks: [{ type: 'text', text: prompt }] }
        const assistant = { id: `a-${uid()}`, role: 'assistant', createdAt: now, status: 'streaming', blocks: [] }
        base.messages = [...base.messages, user, assistant]
        base.model = model
        base.thinking = thinking
        base.search = search
        base.updatedAt = now
        if (!base.title) base.title = derivedTitle
        sessionRef.current = base
        setActiveId(base.id)
        setDraft('')
        setError(null)
        publish(true)
        setStreaming(true)
        const controller = new AbortController()
        abortRef.current = controller
        try {
          const history = buildHistory(base.messages.slice(0, -1))
          const response = await requestRoute('messages', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ model, thinking, search, title: !hadTitle, messages: history }),
            signal: controller.signal,
          })
          if (!response.ok) {
            let data = null
            try {
              data = await response.json()
            } catch {
              // Status-only failure.
            }
            const failure = new Error(data?.error?.message || `HTTP ${response.status}`)
            failure.code = data?.error?.code
            throw failure
          }
          await consumeStream(
            response,
            assistant,
            () => publish(false),
            (title) => {
              if (title && (!base.title || base.title === derivedTitle)) base.title = title.slice(0, 200)
            },
          )
          assistant.status = 'done'
        } catch (failure) {
          if (failure?.name === 'AbortError') {
            assistant.status = 'stopped'
            showToast(t('chat.stoppedToast'))
          } else {
            assistant.status = 'error'
            assistant.error = failure?.message || String(failure)
            if (failure?.code === 'no-credential') {
              setError(failure)
              setSettingsOpen(true)
            } else if (failure?.code === 'auth') {
              showToast(t('error.auth'), 'error')
            } else if (failure?.code === 'rate-limit') {
              showToast(t('error.rateLimit'), 'error')
            } else {
              showToast(t('error.sendFailed', { message: assistant.error }), 'error')
            }
          }
        } finally {
          setStreaming(false)
          abortRef.current = null
          base.updatedAt = Date.now()
          publish(true)
          try {
            const saved = await callApi('session-save', { session: base })
            if (saved?.summary) upsert(saved.summary)
          } catch (failure) {
            showToast(t('error.sendFailed', { message: failure.message }), 'error')
          }
        }
      }

      const stop = () => {
        if (abortRef.current) abortRef.current.abort()
      }

      const regenerate = () => {
        const base = sessionRef.current
        if (!base || streaming) return
        let index = base.messages.length - 1
        while (index >= 0 && base.messages[index].role !== 'user') index -= 1
        if (index < 0) return
        const prompt = messageText(base.messages[index])
        base.messages = base.messages.slice(0, index)
        sessionRef.current = base
        publish(true)
        if (prompt) send(prompt)
      }

      const copy = async (text) => {
        try {
          await navigator.clipboard.writeText(text)
          showToast(t('chat.copiedToast'))
        } catch {
          showToast(t('error.copy'), 'error')
        }
      }

      const renameSession = async (id, title) => {
        try {
          let target = sessionRef.current?.id === id ? sessionRef.current : null
          if (!target) {
            const data = await callApi('session-get', { id })
            target = data?.session
          }
          if (!target) return
          target.title = title
          target.updatedAt = Date.now()
          const saved = await callApi('session-save', { session: target })
          if (sessionRef.current?.id === id) {
            sessionRef.current = target
            setSession({ ...target })
          }
          if (saved?.summary) upsert(saved.summary)
        } catch (failure) {
          showToast(t('error.sendFailed', { message: failure.message }), 'error')
        }
      }

      const deleteSession = (summary) => {
        setConfirm({
          title: t('sidebar.deleteTitle'),
          body: t('sidebar.deleteBody'),
          label: t('sidebar.deleteAction'),
          action: async () => {
            try {
              await callApi('session-delete', { id: summary.id })
              setSessions((list) => list.filter((item) => item.id !== summary.id))
              if (sessionRef.current?.id === summary.id) newChat()
            } catch (failure) {
              showToast(t('error.sendFailed', { message: failure.message }), 'error')
            }
          },
        })
      }

      const updateSettings = async (patch) => {
        const data = await callApi('settings-save', { settings: { ...settings, ...patch } })
        setSettings(data.settings)
        setCredential(data.credential)
        return data
      }

      const changeMode = async (nextMode) => {
        try {
          await updateSettings({ credentialMode: nextMode })
        } catch (failure) {
          showToast(failure.message, 'error')
        }
      }

      const changeModel = async (nextModel) => {
        setModel(nextModel)
        try {
          await updateSettings({ model: nextModel })
        } catch (failure) {
          showToast(failure.message, 'error')
        }
      }

      const saveKey = async (key) => {
        const data = await callApi('api-key-set', { key })
        setCredential(data.credential)
        showToast(t('settings.keySaved'))
      }

      const clearKey = async () => {
        try {
          const data = await callApi('api-key-clear')
          setCredential(data.credential)
        } catch (failure) {
          showToast(failure.message, 'error')
        }
      }

      const importFile = async (file) => {
        setImporting(true)
        try {
          const response = await requestRoute('import', {
            method: 'POST',
            headers: { 'content-type': 'application/zip' },
            body: file,
          })
          let data = null
          try {
            data = await response.json()
          } catch {
            // Status-only failure.
          }
          if (!response.ok || data?.error) throw new Error(data?.error?.message || `HTTP ${response.status}`)
          const boot = await callApi('bootstrap')
          setSessions(boot.sessions || [])
          setCredential(boot.credential)
          setSettings(boot.settings)
          showToast(t('settings.importResult', { imported: data.imported, skipped: data.skipped }))
        } catch (failure) {
          showToast(t('error.importFailed', { message: failure.message }), 'error')
        } finally {
          setImporting(false)
        }
      }

      const clearAll = () => {
        setConfirm({
          title: t('sidebar.clearTitle'),
          body: t('sidebar.clearBody'),
          label: t('common.delete'),
          action: async () => {
            try {
              await callApi('sessions-clear')
              setSessions([])
              newChat()
            } catch (failure) {
              showToast(failure.message, 'error')
            }
          },
        })
      }

      useEffect(() => {
        if (mode !== 'chat' || booted || fatal) return undefined
        let cancelled = false
        callApi('bootstrap')
          .then(async (data) => {
            if (cancelled) return
            setSessions(data.sessions || [])
            setSettings(data.settings)
            setCredential(data.credential)
            setModel(data.settings.model || 'deepseek-flash')
            setBooted(true)
            let last = null
            try {
              last = localStorage.getItem(LAST_KEY)
            } catch {
              last = null
            }
            if (last && (data.sessions || []).some((item) => item.id === last)) {
              await loadSession(last)
            }
          })
          .catch((failure) => {
            if (!cancelled) setFatal(failure)
          })
        return () => {
          cancelled = true
        }
      }, [mode, booted, fatal])

      useEffect(() => {
        if (mode !== 'chat') return undefined
        const element = dialogRef.current
        if (element && !element.open) {
          try {
            element.showModal()
          } catch {
            element.setAttribute('open', '')
          }
        }
        return () => {
          try {
            if (element?.open) element.close()
          } catch {
            // The dialog is being removed with the overlay.
          }
        }
      }, [mode])

      useEffect(() => {
        if (mode !== 'chat') return undefined
        const timer = setTimeout(() => inputRef.current?.focus(), 60)
        return () => clearTimeout(timer)
      }, [mode, booted, activeId])

      useEffect(() => {
        if (mode !== 'chat') return undefined
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (confirm) {
            event.preventDefault()
            setConfirm(null)
          } else if (settingsOpen) {
            event.preventDefault()
            setSettingsOpen(false)
          } else if (sidebarOpen) {
            event.preventDefault()
            setSidebarOpen(false)
          } else if (!streaming) {
            event.preventDefault()
            setMode('work')
          }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [mode, settingsOpen, confirm, sidebarOpen, streaming])

      useEffect(() => {
        if (!stickRef.current) return
        const element = scrollRef.current
        if (element) element.scrollTop = element.scrollHeight
      }, [session, streaming])

      if (mode !== 'chat') return null

      const disabled = credential.kind === 'none'
      const title = session?.title || t('chat.newChat')
      const lastIndex = session?.messages.length ? session.messages.length - 1 : -1
      const empty = !session || session.messages.length === 0
      const composer = h(Composer, {
        t,
        draft,
        setDraft,
        onSend: send,
        streaming,
        onStop: stop,
        thinking,
        setThinking,
        search,
        setSearch,
        disabled,
        inputRef,
        onOpenSettings: () => setSettingsOpen(true),
        hero: empty,
      })

      return h('dialog', {
        className: 'dsh-woc-root',
        ref: dialogRef,
        'aria-modal': 'true',
        'aria-label': t('toggle.chat'),
        onCancel: (event) => {
          event.preventDefault()
          if (confirm) setConfirm(null)
          else if (settingsOpen) setSettingsOpen(false)
          else if (!streaming) setMode('work')
        },
      },
        h(Styles),
        h('div', { className: 'dsh-woc-shell' },
          h(Sidebar, {
            t,
            sessions,
            activeId,
            onSelect: (id) => {
              setSidebarOpen(false)
              loadSession(id)
            },
            onNew: newChat,
            onRename: renameSession,
            onDelete: deleteSession,
            onSettings: () => setSettingsOpen(true),
            credential,
            open: sidebarOpen,
            onClose: () => setSidebarOpen(false),
          }),
          h('div', { className: 'dsh-woc-main' },
            h('div', { className: cx('dsh-woc-main-head', empty && 'dsh-woc-main-head-empty') },
              h('button', {
                type: 'button',
                className: 'dsh-woc-icon-btn dsh-woc-menu-btn',
                title: t('toggle.chat'),
                onClick: () => setSidebarOpen(true),
              }, h(MenuIcon, { size: 16 })),
              h('div', { className: 'dsh-woc-title' }, empty ? '' : title)),
            fatal
              ? h('div', { className: 'dsh-woc-loading', style: { flexDirection: 'column' } },
                h('div', null, t('error.loadFailed', { message: fatal.message })),
                h('button', {
                  type: 'button',
                  className: 'dsh-woc-btn',
                  onClick: () => {
                    setFatal(null)
                    setBooted(false)
                  },
                }, t('common.retry')))
              : !booted
                ? h('div', { className: 'dsh-woc-loading' }, h('span', { className: 'dsh-woc-spinner' }), t('chat.loading'))
                : empty
                  ? h('div', { className: 'dsh-woc-hero' },
                    h('div', { className: 'dsh-woc-hero-inner' },
                      h('div', { className: 'dsh-woc-hero-title' },
                        h(WhaleIcon, { size: 26 }),
                        h('h1', null, disabled ? t('chat.noCredentialTitle') : t('chat.emptyTitle'))),
                      disabled ? h('p', { className: 'dsh-woc-hero-sub' }, t('chat.noCredentialBody')) : null,
                      disabled
                        ? h('button', {
                          type: 'button',
                          className: 'dsh-woc-btn',
                          'data-primary': 'true',
                          onClick: () => setSettingsOpen(true),
                        }, t('chat.openSettings'))
                        : composer,
                      disabled ? null : h('div', { className: 'dsh-woc-disclaimer' }, t('chat.disclaimer'))))
                  : h(React.Fragment, null,
                    h('div', {
                      className: 'dsh-woc-scroll',
                      ref: scrollRef,
                      onScroll: (event) => {
                        const element = event.currentTarget
                        stickRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 90
                      },
                    },
                    h('div', { className: 'dsh-woc-thread' },
                      session.messages.map((message, index) => message.role === 'user'
                        ? h(UserMessage, { key: message.id, message })
                        : h(AssistantMessage, {
                          key: message.id,
                          message,
                          streaming: streaming && index === lastIndex,
                          t,
                          onCopy: copy,
                          onRegenerate: index === lastIndex && !streaming ? regenerate : undefined,
                        })))),
                    error ? h('div', { className: 'dsh-woc-error', style: { margin: '0 18px 8px' } },
                      h('span', { style: { flex: '1 1 auto' } }, error.message),
                      h('button', {
                        type: 'button',
                        className: 'dsh-woc-action',
                        onClick: () => {
                          setError(null)
                          setSettingsOpen(true)
                        },
                      }, t('chat.openSettings'))) : null,
                    composer,
                    h('div', { className: 'dsh-woc-disclaimer' }, t('chat.disclaimer')))),
          sidebarOpen ? h('div', { className: 'dsh-woc-mobile-mask', onClick: () => setSidebarOpen(false) }) : null),
        settingsOpen
          ? h(SettingsDialog, {
            t,
            credential,
            settings,
            onClose: () => setSettingsOpen(false),
            onMode: changeMode,
            onModel: changeModel,
            onSaveKey: saveKey,
            onClearKey: clearKey,
            onImport: importFile,
            onClearAll: clearAll,
            importing,
            version,
          })
          : null,
        confirm
          ? h(ConfirmDialog, { t, confirm, onClose: () => setConfirm(null) })
          : null,
        toast
          ? h(Toast, { toast, onDone: dismissToast })
          : null)
    }

    /* ------------------------------------------------------------------ */
    /* Plugin entry                                                        */
    /* ------------------------------------------------------------------ */

    /**
     * Chat mode is the official chat-demo build, served same-origin and shown
     * in an iframe so its CSS, icons, settings, history, voice and message
     * actions are the real demo implementation rather than a re-creation.
     *
     * The only added control is the Work / Chat switch. It is positioned over
     * the exact host toggle rectangle, and the demo's New chat button is
     * shortened by the injected CSS to leave room for it.
     */
    function DemoOverlay({ t }) {
      const mode = useMode()
      const sidebarWidth = useSidebarWidth()
      const dialogRef = useRef(null)
      const frameRef = useRef(null)
      const [box, setBox] = useState(null)
      const [info, setInfo] = useState(null)
      const [error, setError] = useState(null)
      const [center, setCenter] = useState(null)
      const [siderCollapsed, setSiderCollapsed] = useState(false)
      const [modalOpen, setModalOpen] = useState(false)
      const [theme] = useState(() => {
        const root = document.documentElement
        const body = document.body
        const dark = root.hasAttribute('data-ds-dark-theme')
          || body?.hasAttribute('data-ds-dark-theme')
          || root.classList.contains('dark')
          || body?.classList.contains('dark')
          || window.matchMedia?.('(prefers-color-scheme: dark)').matches
        return dark ? 'dark' : 'light'
      })

      const hostRect = () => {
        const element = document.querySelector('[data-slot="sidebar.session.action"] .dsh-woc-toggle')
          ?? document.querySelector('.dsh-woc-rail-toggle')
        const rect = element?.getBoundingClientRect()
        return rect && rect.width > 0 ? rect : null
      }

      const updateBox = () => {
        const dialog = dialogRef.current
        if (!dialog) return
        const dialogRect = dialog.getBoundingClientRect()
        const host = hostRect()
        if (host) {
          setCenter(host.top + host.height / 2 - dialogRect.top)
          setBox(siderCollapsed
            ? { left: 110, top: 12 }
            : { left: host.left - dialogRect.left, top: host.top - dialogRect.top })
        } else {
          setCenter(85)
          setBox(siderCollapsed
            ? { left: 110, top: 12 }
            : { left: Math.max(12, sidebarWidth - 76), top: 72 })
        }
      }

      useEffect(() => {
        const onMessage = (event) => {
          if (event.source !== frameRef.current?.contentWindow) return
          if (event.data?.type === 'dsh-woc-sider') {
            setSiderCollapsed(Boolean(event.data.collapsed))
          }
          if (event.data?.type === 'dsh-woc-modal') {
            setModalOpen(Boolean(event.data.open))
          }
        }
        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage)
      }, [])

      useEffect(() => {
        if (mode !== 'chat') return
        updateBox()
      }, [mode, sidebarWidth, siderCollapsed])

      useEffect(() => {
        if (mode !== 'chat') return
        let cancelled = false
        setInfo(null)
        setError(null)
        callApi('demo-info')
          .then((data) => {
            if (!cancelled) setInfo(data)
          })
          .catch((reason) => {
            if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason))
          })
        return () => {
          cancelled = true
        }
      }, [mode])

      useEffect(() => {
        if (mode !== 'chat') return
        const dialog = dialogRef.current
        if (!dialog) return
        if (!dialog.open) {
          try {
            dialog.showModal()
          } catch {
            // A previous dialog instance may still be in the top layer.
          }
        }
        updateBox()
        window.addEventListener('resize', updateBox)
        return () => {
          window.removeEventListener('resize', updateBox)
          if (dialog.open) dialog.close()
        }
      }, [mode, sidebarWidth])

      if (mode !== 'chat') return null

      const src = info && center
        ? `${info.url}/index.html?dsh=1&token=${encodeURIComponent(info.token)}&siderWidth=${Math.round(sidebarWidth)}&toggleCenter=${center.toFixed(1)}&theme=${theme}`
        : null

      return h('dialog', {
        ref: dialogRef,
        className: 'dsh-woc-demo-root',
        'aria-label': 'DeepSeek chat',
        onCancel: (event) => event.preventDefault(),
      },
      src
        ? h('iframe', {
          ref: frameRef,
          className: 'dsh-woc-demo-frame',
          src,
          title: 'DeepSeek',
          allow: 'microphone; clipboard-write',
        })
        : h('div', { className: 'dsh-woc-demo-status' },
          error ? t('chat.demoUnavailable') : t('chat.demoStarting')),
      box
        ? h('div', {
          className: `dsh-woc-demo-toggle${modalOpen ? ' dsh-woc-demo-toggle-dim' : ''}`,
          style: { left: `${box.left}px`, top: `${box.top}px` },
        }, h(ModeToggle, { t }))
        : null)
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'work-or-chat: dictionaries')
      const bound = ctx.locale.bind(NS)
      const t = (key, params) => {
        let value = bound(key)
        if (value === undefined || value === null) value = key
        if (params) {
          for (const [name, replacement] of Object.entries(params)) {
            value = String(value).split(`{${name}}`).join(String(replacement))
          }
        }
        return String(value)
      }
      const injected = { t, version: '0.2.0' }

      ctx.slots.inject('sidebar.session.action', () => ctx.slots.register({
        name: 'sidebar.session.action',
        id: 'work-or-chat-toggle',
        locale: NS,
        inject: () => injected,
      }, NewSessionToggle))

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'work-or-chat',
        order: 40,
        locale: NS,
        inject: () => injected,
      }, DemoOverlay))
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
