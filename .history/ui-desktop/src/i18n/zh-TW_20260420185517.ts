const zhTW = {
  common: {
    language: "語言",
    theme: "主題",
    languages: {
      en: "English",
      "zh-TW": "繁體中文"
    },
    themes: {
      dark: "深色",
      light: "亮色"
    },
    unknown: "未知",
    na: "N/A",
    loading: "載入中..."
  },
  app: {
    brand: {
      eyebrow: "LabFlow 控制台",
      title: "專業科學工作台",
      description: "以深色儀表板整合資料匯入、峰值分析、試算表工作流與星圖推理。"
    },
    navigation: {
      dashboard: "數據中樞",
      notes: "傳統筆記",
      workbench: "分析工作台",
      graphView: "知識星圖",
      modules: "分析模組庫",
      settings: "設定中心"
    },
    toolbar: {
      import: "匯入實驗數據",
      importing: "匯入中...",
      analyzePeak: "分析峰值",
      syncGraph: "同步星圖狀態",
      syncing: "同步中..."
    },
    sidebar: {
      eyebrow: "側欄",
      title: "矩陣儀表板",
      description: "用於監看實驗流程、運算層級與卡片式工作摘要。",
      currentSelection: "目前選取"
    },
    mainView: {
      eyebrow: "主視圖",
      title: "科學工作區",
      description: "數據分析分頁專注於試算表、圖表檢視與筆記編修，不再和星圖互相擠壓。",
      spreadsheet: "試算表",
      note: "筆記"
    },
    tabs: {
      analysis: "數據分析",
      graph: "知識星圖"
    },
    instrument: {
      currentFormat: "目前格式：",
      noMetadata: "尚未收到 Metadata",
      graphOp: "圖譜操作"
    },
    chart: {
      eyebrow: "圖表檢視",
      title: "科學圖表",
      description: "峰值偵測結果會同步高亮，並可寫回右側星圖。",
      commit: "確認並寫入星圖"
    },
    noteEmpty: {
      title: "尚未選取筆記節點",
      description: "請先在星圖工具列建立筆記，再從知識星圖開啟並在此編輯。"
    },
    rightPanel: {
      eyebrow: "星圖工作區",
      title: "知識圖譜星圖",
      description: "切到獨立星圖分頁後，可專注於力導向導航、手動連線與節點管理。"
    },
    graphStats: {
      nodes: "節點 {{count}}",
      edges: "邊 {{count}}",
      operations: "操作 {{count}}"
    },
    graphEmpty: {
      title: "尚未載入星圖",
      description: "同步後將在此顯示 CRDT snapshot 轉換出的關聯網路。"
    }
  },
  dashboard: {
    eyebrow: "首頁",
    title: "總覽與快速筆記",
    description: "首頁維持輕量，只看幾個核心統計、快速記下一段內容，然後再進入真正的工作空間。",
    cardCount: "資料卡數量",
    noteCount: "本地筆記數",
    graphCoverage: "圖譜節點數",
    graphCoverageDetail: "邊 {{edges}} 條",
    liveFeed: "即時事件",
    liveConnected: "監聽中",
    liveIdle: "待命",
    autoSyncEnabled: "目前已啟用自動同步",
    autoSyncDisabled: "目前為手動同步模式",
    focusEyebrow: "下一步",
    focusTitle: "前往主要工作空間",
    focusReady: "資料已就緒，可直接進入 Workbench 進行表格與圖表分析，或到星圖檢視血緣關係。",
    openWorkbench: "開啟工作台",
    openGraph: "開啟星圖",
    emptyTitle: "目前沒有資料卡",
    emptyDescription: "請先匯入實驗數據，Dashboard 會自動建立可點擊的資料卡。"
  },
  notes: {
    eyebrow: "Traditional Notes",
    title: "Markdown 筆記工作區",
    description: "提供不依賴星圖的獨立筆記空間，支援完整 Markdown、工具列排版與公式編寫。",
    quickNoteEyebrow: "快速紀錄",
    quickNoteTitle: "快速紀錄 (Quick Note)",
    quickNoteDescription: "先在首頁快速記下一段內容，儲存後即可跳到完整編輯器繼續整理。",
    quickNotePlaceholder: "用 Markdown 記錄觀察、待辦實驗、公式或會議摘要...",
    quickNoteSave: "儲存",
    listEyebrow: "筆記清單",
    listTitle: "筆記列表",
    editorEyebrow: "Markdown 編輯器",
    editorTitle: "詳細筆記編修",
    editorDescription: "可用工具列快速插入粗體、清單、程式碼區塊、連結，以及行內或區塊公式。",
    titleLabel: "筆記標題",
    titlePlaceholder: "未命名 Markdown 筆記",
    contentPlaceholder: "# 觀察\n\n在這裡輸入 Markdown。行內公式可用 $E = mc^2$，區塊公式可用 $$\n\\int_0^1 x^2 \\mathrm{d}x\n$$。",
    create: "新增筆記",
    newShort: "新增",
    delete: "刪除",
    emptyTitle: "目前還沒有獨立筆記",
    emptyDescription: "可從首頁快速紀錄建立第一則筆記，或直接在這裡開一張空白 Markdown 頁面。",
    emptyContentPreview: "尚未填寫內容",
    newNoteTitle: "未命名 Markdown 筆記",
    inlineFormula: "插入行內公式",
    blockFormula: "插入區塊公式"
  },
  workbench: {
    eyebrow: "分析工作台",
    title: "試算表與科學圖表",
    description: "一次只處理一筆資料，讓試算表與圖表不再與其他視圖競爭空間。",
    currentDataset: "目前資料集：",
    noDataset: "尚未選取資料",
    openGraph: "在星圖中查看",
    runModule: "調用分析模組",
    modal: {
      eyebrow: "模組調用",
      title: "調用分析模組",
      description: "先選擇模組，再調整參數，最後將請求打包後執行。",
      moduleLabel: "分析模組",
      parametersTitle: "動態參數區",
      parametersDescription: "下方表單會依照目前選取的模組自動切換。",
      noParameters: "這個模組目前沒有可編輯參數。",
      cancel: "取消",
      run: "確認執行"
    }
  },
  graphView: {
    eyebrow: "Knowledge Star Map",
    title: "全螢幕圖譜工作區",
    description: "以獨立的全螢幕星圖進行知識導覽，右側保留筆記編輯與節點摘要。",
    selectionEyebrow: "目前選取",
    selectionTitle: "請選取節點",
    selectionDescription: "選取筆記即可直接編輯；選取資料節點可切回分析工作台。",
    openWorkbench: "在工作台開啟"
  },
  settings: {
    eyebrow: "控制中心",
    title: "設定中心",
    description: "集中管理 LabFlow 桌面工作區的語言、視覺主題與效能配置。",
    nav: {
      eyebrow: "分類",
      title: "設定選單",
      description: "從固定的控制面板切換語言、外觀與效能設定。"
    },
    sections: {
      language: {
        kicker: "語言設定",
        title: "語言設定",
        description: "切換整個工作區的字典與共用標籤。",
        body: "選擇桌面應用程式在導航、頁面文案與操作標籤中使用的語言。"
      },
      appearance: {
        kicker: "外觀設定",
        title: "主題設定",
        description: "選擇頁面、圖表與編輯面板的視覺風格。",
        body: "主題偏好會儲存在本機，並立即套用到整個應用程式殼層。"
      },
      performance: {
        kicker: "效能配置",
        title: "效能配置",
        description: "檢視目前的渲染與同步設定姿態。",
        body: "以下設定摘要用來說明目前桌面工作區在圖譜渲染、資料匯入與同步節奏上的優先策略。"
      },
      workspace: {
        kicker: "工作空間",
        title: "工作空間行為",
        description: "決定 LabFlow 啟動頁與圖譜事件是否自動同步。",
        body: "這些偏好會立即影響執行行為，並儲存在本機供下次啟動沿用。"
      },
      navigation: {
        kicker: "導覽設定",
        title: "側欄行為",
        description: "控制左側導覽欄如何展開，以及是否固定顯示標籤。",
        body: "左側側欄現在會在懸浮三秒後展開。若你偏好持續展開，可直接固定開啟。"
      }
    },
    workspace: {
      startupPage: "啟動頁面",
      autoSyncTitle: "圖譜自動同步",
      autoSyncEnabled: "收到圖譜事件時會自動刷新目前狀態。",
      autoSyncDisabled: "仍會接收事件，但需要手動同步才會刷新圖譜狀態。"
    },
    navigation: {
      pinSidebarTitle: "固定展開側欄",
      pinSidebarEnabled: "側欄會持續展開並顯示所有頁面名稱。",
      pinSidebarDisabled: "側欄維持緊湊，懸浮三秒後才展開顯示名稱。",
      hoverDelayLabel: "懸浮展開延遲",
      hoverDelayValue: "3 秒",
      hoverDelayDescription: "將滑鼠停在左側導覽欄三秒，即可展開並看到各分頁名稱。"
    },
    theme: {
      darkDescription: "提高圖表、星圖巡覽與長時間分析時的對比度。",
      lightDescription: "提供較明亮的表面，適合文件審閱與白天環境。"
    },
    performance: {
      renderMode: {
        label: "畫布渲染",
        value: "平衡 GPU 模式",
        description: "星圖與圖表畫布針對互動巡覽做最佳化，同時避免過度堆疊視覺效果。"
      },
      pipeline: {
        label: "資料管線",
        value: "漸進式匯入",
        description: "匯入資料會先完成解析，再經驗證後推送到工作台與圖譜檢視。"
      },
      syncPolicy: {
        label: "圖譜同步",
        value: "手動刷新 + 事件串流",
        description: "應用程式會監聽 graph-updated 事件，同時保留明確的手動刷新控制。"
      }
    }
  },
  modules: {
    eyebrow: "分析目錄",
    title: "分析模組庫",
    description: "在模組接入 LabFlow 流程前，先瀏覽已封裝的分析模組與測試工具。",
    catalog: {
      eyebrow: "模組清單",
      title: "可用模組",
      defaultValue: "預設值",
      numberOnlyHint: "僅接受數字輸入，可使用小數。",
      parameterHint: "若維持不變，模組執行時會採用預設值。",
      description: "目前先以 mock 資料定義版面、metadata 結構與模組分類方式。"
    },
    stats: {
      total: "模組總數",
      ready: "Mock 項目"
    },
    labels: {
      formats: "支援格式",
      parameters: "參數"
    },
    actions: {
      viewDetails: "查看詳情"
    },
    badges: {
      analysis: "分析模組",
      test: "測試工具"
    },
    detail: {
      eyebrow: "模組規格",
      backToCatalog: "返回模組清單",
      runtimeTitle: "執行環境",
      runtimeDescription: "此模組會在 Python 分析執行環境中運作，並接受結構化參數 payload。",
      overviewEyebrow: "總覽",
      overviewTitle: "模組檔案",
      overviewDescription: "在接到 Workbench 前，先確認模組用途、支援輸入格式、執行語言與參數契約。",
      capabilityTitle: "功能描述",
      capabilityDescription: "這份功能說明保持精簡，方便操作者快速判斷模組是否符合目前資料集與後續流程。",
      schemaTitle: "參數 Schema",
      schemaDescription: "這份 schema 會對應 Workbench 的動態表單，定義後端模組主機預期接收的執行參數。",
      profileEyebrow: "部署資訊",
      profileTitle: "執行設定",
      profileDescription: "提供模組治理與目錄檢視所需的營運 metadata。",
      moduleId: "模組 ID",
      developmentLanguage: "開發語言",
      languageLabel: "語言",
      languageDescription: "以 Python 實作並由 Python 模組執行環境載入。",
      formatsSummary: "可接受的輸入檔案格式",
      parametersSummary: "可調整的執行參數數量",
      parameterType: "型別",
      parameterDefault: "預設值",
      notFoundEyebrow: "找不到模組",
      notFoundTitle: "模組不存在",
      notFoundDescription: "目前目錄快照中沒有這個模組 id。"
    },
    items: {
      findMaxPeak: {
        title: "峰值分析",
        summary: "從匯入的實驗序列中找出主要峰值，並提供 Threshold 參數進行調整。",
        parameters: {
          threshold: "Threshold（閾值）"
        }
      },
      generateSineWave: {
        title: "正弦波生成",
        summary: "建立測試用的正弦波資料，驗證模組流程與圖表管線。",
        testOnly: "測試資料",
        parameters: {
          frequency: "Frequency（頻率）",
          amplitude: "Amplitude（振幅）"
        }
      }
    }
  },
  errors: {
    noPlotData: "Rust payload 沒有可繪製的 x / y 數據",
    noSpreadsheetData: "A、B 欄沒有可用數據"
  },
  metadata: {
    parser: "解析器",
    scan_rate: "掃描速率",
    x_label: "X 軸",
    y_label: "Y 軸"
  },
  note: {
    untitled: "未命名筆記",
    editorTitle: "筆記編輯器",
    editorDescription: "雙擊星圖上的筆記節點可直接開啟，內容會回寫到 Rust CRDT。",
    backToGrid: "返回表格",
    titleLabel: "標題",
    contentLabel: "內容",
    titlePlaceholder: "未命名筆記",
    contentPlaceholder: "在這裡輸入研究筆記、假設、實驗備註...",
    save: "儲存筆記",
    saving: "儲存中..."
  },
  graph: {
    title: "知識圖譜",
    instructions: "單擊可選取節點，雙擊可在分析分頁開啟內容，按住 Alt 從 A 拖到 B 可手動建立血緣連線。",
    nodeCount: "{{count}} 個節點",
    tooltipType: "類型：{{type}}",
    actions: {
      createNote: "新增筆記",
      deleteNode: "刪除節點"
    },
    nodeTypes: {
      agent_analysis: "代理分析",
      note: "筆記",
      cv: "CV",
      xrd: "XRD",
      instrument_data: "儀器資料",
      unknown: "未知"
    }
  },
  spreadsheet: {
    toolbarTitle: "試算表畫布",
    focusRow: "定位到第 {{row}} 列",
    ariaLabel: "Office 畫布試算表格線",
    linked: "已連結",
    demo: {
      time: "時間",
      sensorA: "感測器_A",
      sensorB: "感測器_B"
    }
  },
  chartLabels: {
    cv: {
      title: "循環伏安圖",
      x: "電壓 (V)",
      y: "電流 (A)"
    },
    xrd: {
      title: "XRD 圖譜",
      x: "2Theta",
      y: "強度"
    },
    default: {
      title: "科學資料",
      x: "X 軸",
      y: "Y 軸"
    }
  },
  matrix: {
    title: "對稱三層矩陣",
    hardwareTier: "硬體層級",
    fallback: "WebGL 無法使用，回退至 L2 畫布。",
    tiers: {
      L1_Skeleton: "L1 骨架",
      L2_Tooling: "L2 工具層",
      L3_Advanced: "L3 進階層"
    },
    cards: {
      topologicalDeltaStream: {
        title: "拓樸增量流",
        items: ["節點變動", "邊熵", "副本延遲", "衝突率"]
      },
      consensusControlPlane: {
        title: "共識控制平面",
        items: ["選舉視界", "時鐘偏移", "狀態轉移", "檢查點"]
      },
      starGraphFocus: {
        title: "星圖焦點",
        items: ["扇區 A", "扇區 B", "扇區 C", "扇區 D", "扇區 E"]
      },
      agentRuntimeLanes: {
        title: "代理執行通道",
        items: ["L1 骨架", "L2 工具層", "L3 進階層", "IPC 健康度"]
      }
    }
  }
} as const;

export default zhTW;