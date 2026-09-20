import { AlimentacaoTab } from './components/alimentacao/AlimentacaoTab';
import { EvolucaoTab } from './components/evolucao/EvolucaoTab';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { SidePanel } from './components/layout/SidePanel';
import { HojeTab } from './components/hoje/HojeTab';
import { MaisTab } from './components/mais/MaisTab';
import { SemanaTab } from './components/semana/SemanaTab';
import { SessionCompleteModal } from './components/session/SessionCompleteModal';
import { SessionOverlay } from './components/session/SessionOverlay';
import { AppStateProvider, useAppState } from './state/AppState';

function TabContent() {
  const { tab } = useAppState();
  switch (tab) {
    case 'hoje':
      return <HojeTab />;
    case 'semana':
      return <SemanaTab />;
    case 'food':
      return <AlimentacaoTab />;
    case 'evo':
      return <EvolucaoTab />;
    case 'mais':
      return <MaisTab />;
    default:
      return null;
  }
}

function AppShell() {
  const { sessionBlockId } = useAppState();

  return (
    <div className="pf-app">
      <div className="pf-app-inner">
        <div className="pf-body">
          <div className="pf-main-col">
            <Header />
            <TabContent />
          </div>
          <SidePanel />
        </div>
        <BottomNav />

        {sessionBlockId && <SessionOverlay />}
        <SessionCompleteModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
