import React, { useState, useEffect, useCallback } from 'react';
import {
  Header,
  ActiveTabType
} from './components/Header';
import {
  SignInScreen
} from './components/SignInScreen';
import {
  AgentPipelineTracker
} from './components/AgentPipelineTracker';
import {
  ForecastChart
} from './components/ForecastChart';
import {
  SeasonalityDecomposition
} from './components/SeasonalityDecomposition';
import {
  AnomalyInspector
} from './components/AnomalyInspector';
import {
  ExecutiveReportPanel
} from './components/ExecutiveReportPanel';
import {
  ConfigModal
} from './components/ConfigModal';
import {
  UploadCSVModal
} from './components/UploadCSVModal';
import {
  SavedForecastsModal
} from './components/SavedForecastsModal';
import {
  generateSuperstoreData,
  generateGroceryData,
  generateTechRetailData,
  PRESET_DATASETS
} from './services/dataPresets';
import {
  DataPreprocessingAgent,
  ForecastingAgent,
  AnomalyDetectionAgent,
  ExplanationAgent
} from './services/agentEngine';
import {
  useAuth
} from './context/AuthContext';
import {
  RawSalesRow,
  PipelineExecutionResult,
  AgentStep,
  AgentLog
} from './types';

export default function App() {
  const { user, loading } = useAuth();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // Dataset State
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('superstore');
  const [datasetName, setDatasetName] = useState<string>('Superstore Sales (Kaggle Standard)');
  const [rawData, setRawData] = useState<RawSalesRow[]>([]);
  const [dateColumn, setDateColumn] = useState<string>('Order_Date');
  const [salesColumn, setSalesColumn] = useState<string>('Sales');

  // Hyperparameters
  const [forecastPeriods, setForecastPeriods] = useState<number>(30);
  const [testDays, setTestDays] = useState<number>(30);
  const [anomalyWindow, setAnomalyWindow] = useState<number>(30);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(2.5);

  // Pipeline Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<AgentStep>('idle');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [result, setResult] = useState<PipelineExecutionResult | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // Initialize dataset on load
  const loadPreset = useCallback((presetId: string) => {
    let data: RawSalesRow[] = [];
    let name = 'Superstore Sales';
    const dCol = 'Order_Date';
    const sCol = 'Sales';

    if (presetId === 'superstore') {
      data = generateSuperstoreData();
      name = 'Superstore Sales (Kaggle Standard)';
    } else if (presetId === 'grocery') {
      data = generateGroceryData();
      name = 'FreshMart Supermarket Chain';
    } else if (presetId === 'electronics') {
      data = generateTechRetailData();
      name = 'NovaTech Consumer Electronics';
    }

    setCurrentDatasetId(presetId);
    setDatasetName(name);
    setDateColumn(dCol);
    setSalesColumn(sCol);
    setRawData(data);
    return data;
  }, []);

  // Run the 4-Agent Pipeline
  const runPipelineWithData = useCallback(
    async (
      inputData: RawSalesRow[],
      dCol: string,
      sCol: string,
      dName: string
    ) => {
      setIsRunning(true);
      setLogs([]);
      const startTime = performance.now();
      const collectedLogs: AgentLog[] = [];

      const addLog = (log: AgentLog) => {
        collectedLogs.push(log);
        setLogs([...collectedLogs]);
      };

      try {
        // AGENT 1: Data Preprocessing Agent
        setCurrentStep('preprocessing');
        const prepAgent = new DataPreprocessingAgent();
        const { cleaned } = prepAgent.preprocess(inputData, dCol, sCol, addLog);

        await new Promise(r => setTimeout(r, 100));

        // AGENT 2: Forecasting Agent
        setCurrentStep('forecasting');
        const forecastAgent = new ForecastingAgent();
        const { futureOnly, fullForecast, metrics, seasonality } = forecastAgent.forecast(
          cleaned,
          forecastPeriods,
          testDays,
          addLog
        );

        await new Promise(r => setTimeout(r, 100));

        // AGENT 3: Anomaly Detection Agent
        setCurrentStep('anomaly');
        const anomalyAgent = new AnomalyDetectionAgent();
        const anomalies = anomalyAgent.detect(
          cleaned,
          anomalyWindow,
          anomalyThreshold,
          addLog
        );

        await new Promise(r => setTimeout(r, 100));

        // AGENT 4: Explanation Agent
        setCurrentStep('explanation');
        const explanationAgent = new ExplanationAgent();
        const templateExplanation = explanationAgent.explainTemplate(
          futureOnly,
          metrics,
          anomalies
        );

        addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Agent 4 (Explanation)',
          message: 'Synthesized plain-English executive summary.',
          level: 'success'
        });

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Pipeline Orchestrator',
          message: `All 4 agents completed successfully in ${duration}ms!`,
          level: 'success'
        });

        const initialResult: PipelineExecutionResult = {
          cleanedData: cleaned,
          forecastFuture: futureOnly,
          forecastFull: fullForecast,
          metrics,
          anomalies,
          templateExplanation,
          aiExplanation: explanationAgent.explainExecutiveNarrative(futureOnly, metrics, anomalies, dName),
          seasonality,
          logs: [...collectedLogs],
          executionTimeMs: duration
        };

        setResult(initialResult);
        setCurrentStep('completed');
        setIsRunning(false);

        // Fetch AI or executive narrative asynchronously in background
        explanationAgent.explainLLM(futureOnly, metrics, anomalies, dName).then(aiRes => {
          if (aiRes.text) {
            setResult(prev => (prev ? { ...prev, aiExplanation: aiRes.text } : null));
          }
        }).catch(() => {
          // Graceful fallback
        });
      } catch (err: any) {
        addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Pipeline Orchestrator',
          message: `Execution failed: ${err.message || 'Unknown error'}`,
          level: 'error'
        });
        setCurrentStep('idle');
        setIsRunning(false);
      }
    },
    [forecastPeriods, testDays, anomalyWindow, anomalyThreshold]
  );

  // Initial load
  useEffect(() => {
    const data = loadPreset('superstore');
    runPipelineWithData(data, 'Order_Date', 'Sales', 'Superstore Sales (Kaggle Standard)');
  }, []);

  const handleSelectDataset = (id: string) => {
    if (id === 'custom') {
      setIsUploadOpen(true);
      return;
    }
    const data = loadPreset(id);
    const preset = PRESET_DATASETS.find(p => p.id === id);
    runPipelineWithData(data, preset?.dateColumn || 'Order_Date', preset?.salesColumn || 'Sales', preset?.name || id);
  };

  const handleCustomDataLoaded = (
    data: RawSalesRow[],
    name: string,
    dCol: string,
    sCol: string
  ) => {
    setCurrentDatasetId('custom');
    setDatasetName(name);
    setRawData(data);
    setDateColumn(dCol);
    setSalesColumn(sCol);
    runPipelineWithData(data, dCol, sCol, name);
  };

  const handleRunPipeline = () => {
    if (rawData.length === 0) return;
    runPipelineWithData(rawData, dateColumn, salesColumn, datasetName);
  };

  const handleRegenerateAiExplanation = async () => {
    if (!result) return;
    setIsGeneratingAi(true);
    try {
      const explanationAgent = new ExplanationAgent();
      const aiRes = await explanationAgent.explainLLM(
        result.forecastFuture,
        result.metrics,
        result.anomalies,
        datasetName
      );
      if (aiRes.text) {
        setResult(prev => (prev ? { ...prev, aiExplanation: aiRes.text } : null));
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Show loading state while checking Firebase Auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center text-xs font-mono">
        Initializing Forecasting Security Context...
      </div>
    );
  }

  // Gate the web application behind the Sign-In Screen first
  if (!user) {
    return <SignInScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-cyan-500/5 to-transparent pointer-events-none -z-10" />

      {/* Top Header */}
      <Header
        currentDatasetId={currentDatasetId}
        onSelectDataset={handleSelectDataset}
        onRunPipeline={handleRunPipeline}
        isRunning={isRunning}
        agentStep={currentStep}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSavedForecasts={() => setIsSavedModalOpen(true)}
        recordCount={result?.cleanedData.length || rawData.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Agent Sequential Flow Bar */}
        <AgentPipelineTracker
          currentStep={currentStep}
          result={result}
          logs={logs}
          isRunning={isRunning}
        />

        {/* Tab View 1: Main Forecast & Visualizer Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {result ? (
              <ForecastChart
                forecastData={result.forecastFull}
                cleanedData={result.cleanedData}
                anomalies={result.anomalies}
                metrics={result.metrics}
                forecastPeriods={forecastPeriods}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                Executing forecasting model...
              </div>
            )}
          </div>
        )}

        {/* Tab View 2: Prophet Seasonality Decomposition */}
        {activeTab === 'decomposition' && (
          <div>
            {result ? (
              <SeasonalityDecomposition
                seasonality={result.seasonality}
                forecastData={result.forecastFull}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                Please run the pipeline to view Prophet trend and seasonality decomposition.
              </div>
            )}
          </div>
        )}

        {/* Tab View 3: Anomaly Audit Log */}
        {activeTab === 'anomalies' && (
          <div>
            {result ? (
              <AnomalyInspector
                anomalies={result.anomalies}
                totalDataPoints={result.cleanedData.length}
                anomalyWindow={anomalyWindow}
                anomalyThreshold={anomalyThreshold}
                onOpenConfig={() => setIsConfigOpen(true)}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                Please run the pipeline to detect anomalies.
              </div>
            )}
          </div>
        )}

        {/* Tab View 4: Agent 4 Executive Briefing & Chat */}
        {activeTab === 'report' && (
          <div>
            <ExecutiveReportPanel
              result={result}
              datasetName={datasetName}
              onRegenerateAiExplanation={handleRegenerateAiExplanation}
              isGeneratingAi={isGeneratingAi}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md py-4 mt-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <div>
            Multi-Agent Sales Forecasting System · Facebook Prophet Additive Modeling &amp; Rolling Z-Score Intelligence
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-cyan-400">Agent 1</span>
            <span>→</span>
            <span className="text-indigo-400">Agent 2</span>
            <span>→</span>
            <span className="text-amber-400">Agent 3</span>
            <span>→</span>
            <span className="text-emerald-400">Agent 4</span>
          </div>
        </div>
      </footer>

      {/* Hyperparameter Config Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        forecastPeriods={forecastPeriods}
        setForecastPeriods={setForecastPeriods}
        testDays={testDays}
        setTestDays={setTestDays}
        anomalyWindow={anomalyWindow}
        setAnomalyWindow={setAnomalyWindow}
        anomalyThreshold={anomalyThreshold}
        setAnomalyThreshold={setAnomalyThreshold}
        onApplyAndRerun={handleRunPipeline}
      />

      {/* Upload CSV Modal */}
      <UploadCSVModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleCustomDataLoaded}
      />

      {/* Cloud Firestore Saved Forecasts Modal */}
      <SavedForecastsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        currentResult={result}
        datasetName={datasetName}
        forecastPeriods={forecastPeriods}
      />
    </div>
  );
}
