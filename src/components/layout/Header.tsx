import { useAppState } from '../../state/AppState';

export function Header() {
  const { data } = useAppState();
  return (
    <header className="pf-header">
      <div className="pf-header-brand">
        <div className="pf-logo-badge">P</div>
        <div className="pf-header-wordmark">PERFORMANCE</div>
      </div>
      <div className="pf-header-meta">
        {data.profile.weekLabel.toUpperCase()}
        <br />
        {data.profile.phase.toUpperCase()}
      </div>
    </header>
  );
}
