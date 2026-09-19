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
      dashboard: "Dashboard",
      notes: "Notes",
      workbench: "Workbench",
      graphView: "Graph View"
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
    eyebrow: "Data Hub",
    title: "Experimental Data Hub",
    description: "Incoming graph nodes are rendered as traditional data cards so the team can scan datasets before entering analysis.",
    cardCount: "Data Cards",
    liveFeed: "Live Feed",
    liveConnected: "Listening",
    liveIdle: "Idle",
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
    emptyNotice: "No valid data yet or waiting for import...",
    openGraph: "View in Star Graph"
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