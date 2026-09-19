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
      description: "上半部維持 SpreadsheetGrid，下半部提供圖表檢視與峰值提交。",
      spreadsheet: "試算表",
      note: "筆記"
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
      description: "雙擊星圖空白建立新筆記，或雙擊既有筆記節點開啟編輯器。"
    },
    rightPanel: {
      eyebrow: "右側面板",
      title: "知識圖譜星圖",
      description: "保留獨立寬面板，讓力導向佈局與節點互動有足夠的觀察空間。"
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
    instructions: "雙擊空白建立筆記，雙擊節點開啟內容，按住 Alt 從 A 拖到 B 可手動建立血緣連線。",
    nodeCount: "{{count}} 個節點",
    tooltipType: "類型：{{type}}",
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