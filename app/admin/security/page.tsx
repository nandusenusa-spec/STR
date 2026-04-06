import { createClient } from '@/lib/supabase/server'
import { Shield, AlertTriangle, Activity, FileWarning } from 'lucide-react'

export const dynamic = 'force-dynamic'

type AuditRow = {
  id: string
  table_name: string
  operation: string
  row_id: string | null
  actor_id: string | null
  created_at: string
}

type SecurityEventRow = {
  id: string
  event_type: string
  severity: 'info' | 'warning' | 'critical'
  ip_address: string | null
  path: string | null
  created_at: string
}

type SecurityAlertRow = {
  id: string
  event_type: string
  severity: 'warning' | 'critical'
  delivered: boolean
  channel: string
  created_at: string
}

async function getAuditLogs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, table_name, operation, row_id, actor_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return { rows: (data || []) as AuditRow[], error }
}

async function getSecurityEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('security_events')
    .select('id, event_type, severity, ip_address, path, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  return { rows: (data || []) as SecurityEventRow[], error }
}

async function getSecurityAlerts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('security_alerts')
    .select('id, event_type, severity, delivered, channel, created_at')
    .order('created_at', { ascending: false })
    .limit(40)
  return { rows: (data || []) as SecurityAlertRow[], error }
}

function fmtDate(v: string) {
  return new Date(v).toLocaleString('es-UY')
}

export default async function AdminSecurityPage() {
  const [
    { rows, error },
    { rows: secRows, error: secError },
    { rows: alertRows, error: alertError },
  ] = await Promise.all([
    getAuditLogs(),
    getSecurityEvents(),
    getSecurityAlerts(),
  ])

  const last24h = Date.now() - 24 * 60 * 60 * 1000
  const total24h = rows.filter((r) => new Date(r.created_at).getTime() >= last24h).length
  const deletes24h = rows.filter(
    (r) => r.operation === 'DELETE' && new Date(r.created_at).getTime() >= last24h,
  ).length
  const updates24h = rows.filter(
    (r) => r.operation === 'UPDATE' && new Date(r.created_at).getTime() >= last24h,
  ).length
  const critical24h = secRows.filter(
    (r) =>
      r.severity === 'critical' &&
      new Date(r.created_at).getTime() >= last24h,
  ).length
  const warning24h = secRows.filter(
    (r) =>
      r.severity === 'warning' &&
      new Date(r.created_at).getTime() >= last24h,
  ).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-4xl mb-2">SEGURIDAD</h1>
        <p className="text-muted-foreground">
          Auditoria de cambios sensibles y actividad administrativa
        </p>
      </div>

      {error ? (
        <div className="border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="h-5 w-5" />
            <p className="font-semibold">No se pudo cargar audit_logs</p>
          </div>
          <p className="text-sm">
            Ejecuta `scripts/015_security_hardening.sql` en Supabase para habilitar auditoria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Eventos 24h</span>
              </div>
              <p className="text-3xl font-[var(--font-display)]">{total24h}</p>
            </div>
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Updates 24h</span>
              </div>
              <p className="text-3xl font-[var(--font-display)]">{updates24h}</p>
            </div>
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Deletes 24h</span>
              </div>
              <p className="text-3xl font-[var(--font-display)]">{deletes24h}</p>
            </div>
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Warnings 24h</span>
              </div>
              <p className="text-3xl font-[var(--font-display)]">{warning24h}</p>
            </div>
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Critical 24h</span>
              </div>
              <p className="text-3xl font-[var(--font-display)]">{critical24h}</p>
            </div>
          </div>

          {(critical24h > 0 || warning24h > 20) && (
            <div className="mb-6 border border-yellow-500/40 bg-yellow-500/10 p-4 text-yellow-500">
              <p className="font-semibold">Alerta de seguridad operativa</p>
              <p className="text-sm">
                Se detecto actividad sospechosa reciente. Revisar eventos y bloquear IPs si es
                necesario.
              </p>
            </div>
          )}

          <div className="border border-border bg-card overflow-hidden mb-8">
            <div className="p-3 border-b border-border">
              <h2 className="font-semibold">Eventos de seguridad</h2>
              {secError && (
                <p className="text-xs text-muted-foreground mt-1">
                  Si no aparecen datos, ejecuta `scripts/016_security_events.sql`.
                </p>
              )}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Evento</th>
                  <th className="text-left p-3">Severidad</th>
                  <th className="text-left p-3">IP</th>
                  <th className="text-left p-3">Path</th>
                </tr>
              </thead>
              <tbody>
                {secRows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={5}>
                      Sin eventos de seguridad.
                    </td>
                  </tr>
                ) : (
                  secRows.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                      <td className="p-3">{r.event_type}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold ${
                            r.severity === 'critical'
                              ? 'bg-red-500/10 text-red-500'
                              : r.severity === 'warning'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{r.ip_address || '-'}</td>
                      <td className="p-3 font-mono">{r.path || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border border-border bg-card overflow-hidden mb-8">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Alertas enviadas</h2>
              <a
                href="/api/admin/security/health"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neon-cyan hover:underline"
              >
                Ver health JSON
              </a>
            </div>
            {alertError && (
              <p className="p-3 text-xs text-muted-foreground">
                Si no aparecen alertas, ejecuta `scripts/017_security_alerts.sql`.
              </p>
            )}
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Evento</th>
                  <th className="text-left p-3">Severidad</th>
                  <th className="text-left p-3">Canal</th>
                  <th className="text-left p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alertRows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={5}>
                      Sin alertas registradas.
                    </td>
                  </tr>
                ) : (
                  alertRows.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="p-3 whitespace-nowrap">{fmtDate(a.created_at)}</td>
                      <td className="p-3">{a.event_type}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold ${
                            a.severity === 'critical'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-3">{a.channel}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold ${
                            a.delivered
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {a.delivered ? 'entregada' : 'fallida'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Tabla</th>
                  <th className="text-left p-3">Operacion</th>
                  <th className="text-left p-3">Fila</th>
                  <th className="text-left p-3">Actor</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={5}>
                      Sin eventos de auditoria.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                      <td className="p-3">{r.table_name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold ${
                            r.operation === 'DELETE'
                              ? 'bg-red-500/10 text-red-500'
                              : r.operation === 'UPDATE'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {r.operation}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{r.row_id ? r.row_id.slice(0, 8) : '-'}</td>
                      <td className="p-3 font-mono">
                        {r.actor_id ? `${r.actor_id.slice(0, 8)}...` : 'system'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
