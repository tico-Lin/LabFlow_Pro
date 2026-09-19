const en = {
  common: {
    language: "Language",
    theme: "Theme",
    languages: {
      en: "English",
      "zh-TW": "Traditional Chinese"
    },
    themes: {
      dark: "Dark",
      light: "Light"
    },
    unknown: "Unknown",
    na: "N/A",
    loading: "Loading..."
  },
  app: {
    brand: {
      eyebrow: "LabFlow Control Surface",
      title: "Professional Scientific Workspace",
      description: "A dark operations dashboard that unifies data ingestion, peak analysis, spreadsheet workflows, and star-graph reasoning."
    },
    navigation: {
      dashboard: "Home",
      notes: "Notes",
      workbench: "Workbench",
      graphView: "Graph View",
      modules: "Module Store",
      settings: "Settings"
    },
    toolbar: {
      import: "Import Experimental Data",
      importing: "Importing...",
      analyzePeak: "Analyze Peak",
      syncGraph: "Sync Star Graph",
      syncing: "Syncing..."
    },
    sidebar: {
      eyebrow: "Sidebar",
      title: "Matrix Dashboard",
      description: "Monitor experiment flow, compute tiers, and card-based work summaries.",
      currentSelection: "Current Selection"
    },
    mainView: {
      eyebrow: "Main View",
      title: "Scientific Workbench",
      description: "Use the analysis tab for spreadsheet work, chart inspection, and note editing without competing with the graph canvas.",
      spreadsheet: "Spreadsheet",
      note: "Note"
    },
    tabs: {
      analysis: "Data Analysis",
      graph: "Knowledge Star Graph"
    },
    instrument: {
      currentFormat: "Current format:",
      noMetadata: "No metadata received yet",
      graphOp: "Graph Op"
    },
    chart: {
      eyebrow: "Chart View",
      title: "Scientific Chart",
      description: "Peak detection results are highlighted in sync and can be written back to the star graph.",
      commit: "Confirm and Write to Star Graph"
    },
    noteEmpty: {
      title: "No note node selected",
      description: "Create a note from the graph toolbar, then open it from the star graph to edit here."
    },
    rightPanel: {
      eyebrow: "Graph Workspace",
      title: "Knowledge Graph Star Map",
      description: "Use the dedicated graph tab for force-directed navigation, manual linking, and direct node management."
    },
    graphStats: {
      nodes: "Nodes {{count}}",
      edges: "Edges {{count}}",
      operations: "Ops {{count}}"
    },
    graphEmpty: {
      title: "Star graph not loaded",
      description: "After sync, the relationship network converted from the CRDT snapshot will appear here."
    }
  },
  dashboard: {
    eyebrow: "Home",
    title: "Overview and Quick Notes",
    description: "Keep the landing page lightweight: monitor a few key numbers, capture a note, and jump into the active workspace when needed.",
    cardCount: "Data Cards",
    noteCount: "Local Notes",
    graphCoverage: "Graph Nodes",
    graphCoverageDetail: "Edges {{edges}}",
    liveFeed: "Live Feed",
    liveConnected: "Listening",
    liveIdle: "Idle",
    autoSyncEnabled: "Automatic sync is enabled",
    autoSyncDisabled: "Automatic sync is disabled",
    focusEyebrow: "Next Step",
    focusTitle: "Open an active workspace",
    focusReady: "Datasets are ready. Continue in the workbench for table and chart analysis, or open the graph to inspect lineage.",
    openWorkbench: "Open Workbench",
    openGraph: "Open Graph",
    emptyTitle: "No data cards yet",
    emptyDescription: "Import experimental data to populate the dashboard and route each dataset into the workbench."
  },
  notes: {
    eyebrow: "Traditional Notes",
    title: "Markdown Notes Workspace",
    description: "Keep standalone lab notes outside the star graph, with a full Markdown editor, live formatting toolbar, and formula support.",
    quickNoteEyebrow: "Quick Note",
    quickNoteTitle: "Quick Note",
    quickNoteDescription: "Capture a thought from the dashboard, save it immediately, then continue refining it in the full editor.",
    quickNotePlaceholder: "Record observations, pending experiments, equations, or meeting notes in Markdown...",
    quickNoteSave: "Save",
    listEyebrow: "Note List",
    listTitle: "Notebook",
    editorEyebrow: "Markdown Editor",
    editorTitle: "Detailed Note Editing",
    editorDescription: "Use the toolbar for bold text, checklists, code blocks, links, and inline or block formulas.",
    titleLabel: "Note Title",
    titlePlaceholder: "Untitled Markdown Note",
    contentPlaceholder: "# Observation\n\nWrite Markdown here. Use $E = mc^2$ for inline math or $$\n\\int_0^1 x^2 \\mathrm{d}x\n$$ for block formulas.",
    create: "New Note",
    newShort: "New",
    delete: "Delete",
    emptyTitle: "No standalone notes yet",
    emptyDescription: "Create your first note from the dashboard quick note box or start a blank Markdown page here.",
    emptyContentPreview: "No content yet",
    newNoteTitle: "Untitled Markdown Note",
    inlineFormula: "Insert inline formula",
    blockFormula: "Insert block formula"
  },
  workbench: {
    eyebrow: "Analysis Workbench",
    title: "Spreadsheet and Scientific Chart",
    description: "Focus on one dataset at a time with a dedicated spreadsheet surface and analysis chart.",
    currentDataset: "Current dataset:",
    noDataset: "No dataset selected",
    openGraph: "View in Star Graph",
    runModule: "Run Analysis Module",
    modal: {
      eyebrow: "Module Runner",
      title: "Run Analysis Module",
      description: "Select a module, tune its parameters, then package the request before execution.",
      moduleLabel: "Analysis Module",
      parametersTitle: "Dynamic Parameters",
      parametersDescription: "The parameter form changes with the selected module.",
      noParameters: "This module does not expose editable parameters yet.",
      cancel: "Cancel",
      run: "Run"
    }
  },
  graphView: {
    eyebrow: "Knowledge Star Map",
    title: "Full-Screen Graph Workspace",
    description: "Navigate the knowledge graph in a dedicated full-screen canvas while keeping note editing close at hand.",
    selectionEyebrow: "Selection",
    selectionTitle: "Select a node",
    selectionDescription: "Choose a note to edit it here, or open a data node in the workbench.",
    openWorkbench: "Open in Workbench"
  },
  settings: {
    eyebrow: "Control Center",
    title: "Settings Center",
    description: "Manage language, visual appearance, and performance profiles for the LabFlow desktop workspace.",
    nav: {
      eyebrow: "Categories",
      title: "Configuration Menu",
      description: "Move between language, appearance, and performance controls from one fixed control surface."
    },
    sections: {
      language: {
        kicker: "Language",
        title: "Language Settings",
        description: "Switch the workspace dictionary and shared labels.",
        body: "Choose the language used by navigation, page copy, and operational labels throughout the desktop app."
      },
      appearance: {
        kicker: "Appearance",
        title: "Theme Settings",
        description: "Choose the surface treatment for charts, pages, and editor panels.",
        body: "The theme preference is stored locally and updates the entire application shell immediately."
      },
      performance: {
        kicker: "Performance",
        title: "Performance Profile",
        description: "Review the active rendering and synchronization posture.",
        body: "These profiles summarize how the current desktop workspace prioritizes graph rendering, data ingestion, and synchronization cadence."
      },
      workspace: {
        kicker: "Workspace",
        title: "Workspace Behavior",
        description: "Choose how LabFlow starts up and whether graph changes should sync automatically.",
        body: "These preferences change runtime behavior immediately and are stored locally for subsequent launches."
      },
      navigation: {
        kicker: "Navigation",
        title: "Sidebar Behavior",
        description: "Control how the left navigation expands and whether labels remain visible.",
        body: "The sidebar expands after a three-second hover. Pin it open if you want page names visible at all times."
      }
    },
    workspace: {
      startupPage: "Startup Page",
      autoSyncTitle: "Automatic Graph Synchronization",
      autoSyncEnabled: "Incoming graph events refresh the current state automatically.",
      autoSyncDisabled: "Graph events are observed, but refresh stays manual until you sync explicitly."
    },
    navigation: {
      pinSidebarTitle: "Pin Sidebar Open",
      pinSidebarEnabled: "The sidebar stays expanded with labels visible at all times.",
      pinSidebarDisabled: "The sidebar stays compact and expands only after a three-second hover.",
      hoverDelayLabel: "Hover Expansion Delay",
      hoverDelayValue: "3 seconds",
      hoverDelayDescription: "Hover the left navigation for three seconds to expand and reveal page names."
    },
    theme: {
      darkDescription: "Higher contrast for charts, graph inspection, and extended analysis sessions.",
      lightDescription: "Brighter surfaces for documentation, review passes, and daylight environments."
    },
    performance: {
      renderMode: {
        label: "Canvas Rendering",
        value: "Balanced GPU Mode",
        description: "Star graph and chart canvases stay optimized for interactive navigation without pushing maximum effects."
      },
      pipeline: {
        label: "Data Pipeline",
        value: "Progressive Ingestion",
        description: "Imported datasets are parsed first, then promoted into the workbench and graph views after validation."
      },
      syncPolicy: {
        label: "Graph Sync",
        value: "Manual Refresh + Event Feed",
        description: "The app listens for graph-updated events and still exposes explicit refresh for controlled synchronization."
      }
    }
  },
  modules: {
    eyebrow: "Analysis Catalog",
    title: "Module Store",
    description: "Browse packaged analysis modules and test utilities before wiring them into the LabFlow pipeline.",
    catalog: {
      eyebrow: "Library",
      title: "Available Modules",
      defaultValue: "Default",
      numberOnlyHint: "Numeric input only. Decimal values are supported.",
      parameterHint: "If left unchanged, the module runtime will use the default value.",
      description: "This catalog currently uses mocked entries to define layout, metadata structure, and module taxonomy."
    },
    stats: {
      total: "Total Modules",
      ready: "Mocked Entries"
    },
    labels: {
      formats: "Supported Formats",
      parameters: "Parameters"
    },
    actions: {
      viewDetails: "View Details"
    },
    badges: {
      analysis: "Analysis Module",
      test: "Test Utility"
    },
    detail: {
      eyebrow: "Module Specification",
      backToCatalog: "Back to Catalog",
      runtimeTitle: "Execution Runtime",
      runtimeDescription: "This module is packaged for the Python analysis runtime and accepts structured parameter payloads.",
      overviewEyebrow: "Overview",
      overviewTitle: "Module Profile",
      overviewDescription: "Review the module intent, supported input formats, execution language, and parameter contract before wiring it into the workbench.",
      capabilityTitle: "Functional Description",
      capabilityDescription: "The functional brief is kept concise so operators can evaluate whether the module matches the current dataset and downstream pipeline.",
      schemaTitle: "Parameters Schema",
      schemaDescription: "This schema mirrors the dynamic form in the workbench and defines the runtime payload expected by the backend module host.",
      profileEyebrow: "Deployment",
      profileTitle: "Runtime Profile",
      profileDescription: "Operational metadata for catalog review and module governance.",
      moduleId: "Module ID",
      developmentLanguage: "Development Language",
      languageLabel: "Language",
      languageDescription: "Implemented and executed through the Python module runtime.",
      formatsSummary: "Accepted input file formats",
      parametersSummary: "Editable runtime parameters",
      parameterType: "Type",
      parameterDefault: "Default",
      notFoundEyebrow: "Module Missing",
      notFoundTitle: "Module not found",
      notFoundDescription: "The requested module id does not exist in the current catalog snapshot."
    },
    items: {
      findMaxPeak: {
        title: "Find Max Peak",
        summary: "Detect the dominant peak from imported experiment series and expose a threshold parameter for tuning.",
        parameters: {
          threshold: "Threshold"
        }
      },
      generateSineWave: {
        title: "Generate Sine Wave",
        summary: "Generate synthetic sine-wave data for module and chart pipeline testing.",
        testOnly: "Test Data",
        parameters: {
          frequency: "Frequency",
          amplitude: "Amplitude"
        }
      }
    }
  },
  errors: {
    noPlotData: "The Rust payload does not contain plottable x / y data",
    noSpreadsheetData: "Columns A and B do not contain usable data"
  },
  metadata: {
    parser: "Parser",
    scan_rate: "Scan Rate",
    x_label: "X Axis",
    y_label: "Y Axis"
  },
  note: {
    untitled: "Untitled Note",
    editorTitle: "Note Editor",
    editorDescription: "Double-click a note node in the star graph to open it directly. Content is written back to the Rust CRDT.",
    backToGrid: "Back to Spreadsheet",
    titleLabel: "Title",
    contentLabel: "Content",
    titlePlaceholder: "Untitled Note",
    contentPlaceholder: "Write research notes, hypotheses, and experiment remarks here...",
    save: "Save Note",
    saving: "Saving..."
  },
  graph: {
    title: "Knowledge Graph",
    instructions: "Single-click selects a node. Double-click opens it in analysis. Hold Alt and drag from A to B to create a lineage link manually.",
    nodeCount: "{{count}} nodes",
    tooltipType: "Type: {{type}}",
    actions: {
      createNote: "Add Note",
      deleteNode: "Delete Node"
    },
    nodeTypes: {
      agent_analysis: "Agent Analysis",
      note: "Note",
      cv: "CV",
      xrd: "XRD",
      instrument_data: "Instrument Data",
      unknown: "Unknown"
    }
  },
  spreadsheet: {
    toolbarTitle: "Spreadsheet Canvas",
    focusRow: "Focused on row {{row}}",
    ariaLabel: "Office canvas spreadsheet grid",
    linked: "linked",
    demo: {
      time: "time",
      sensorA: "sensor_A",
      sensorB: "sensor_B"
    }
  },
  chartLabels: {
    cv: {
      title: "Cyclic Voltammetry",
      x: "Voltage (V)",
      y: "Current (A)"
    },
    xrd: {
      title: "XRD Pattern",
      x: "2Theta",
      y: "Intensity"
    },
    default: {
      title: "Scientific Data",
      x: "X Axis",
      y: "Y Axis"
    }
  },
  matrix: {
    title: "Symmetric Triple-Tier Matrix",
    hardwareTier: "Hardware Tier",
    fallback: "WebGL unavailable, fallback to L2 canvas.",
    tiers: {
      L1_Skeleton: "L1 Skeleton",
      L2_Tooling: "L2 Tooling",
      L3_Advanced: "L3 Advanced"
    },
    cards: {
      topologicalDeltaStream: {
        title: "Topological Delta Stream",
        items: ["Node churn", "Edge entropy", "Replica lag", "Conflict rate"]
      },
      consensusControlPlane: {
        title: "Consensus Control Plane",
        items: ["Election horizon", "Clock skew", "State transfer", "Checkpoint"]
      },
      starGraphFocus: {
        title: "Star Graph Focus",
        items: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E"]
      },
      agentRuntimeLanes: {
        title: "Agent Runtime Lanes",
        items: ["L1 skeleton", "L2 tooling", "L3 advanced", "IPC health"]
      }
    }
  }
} as const;

export default en;