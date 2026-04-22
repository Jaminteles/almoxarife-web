import { useState, useEffect } from "react";
import {
  Home, Users, Store, Package, Download, Upload, ArrowLeftRight,
  FileBarChart, Settings, Bell, Moon, Calendar, AlertTriangle,
  Clock, ClipboardList, PlusCircle, UserPlus, Building2, FileText,
  ArrowRight, Search, Filter, Pencil, Ban, Plus
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid
} from "recharts";

/* ============================================================
 *  Preview visual do "Sistema de Almoxarifado" pós-reformulação
 *  Reproduz o layout em Tailwind (os arquivos reais usam MUI).
 *  Troque a tela pelo menu lateral para ver Dashboard / Lista.
 * ============================================================ */

const menuItems = [
  { label: "Início",           icon: Home,          key: "dashboard", enabled: true  },
  { label: "Funcionários",     icon: Users,         key: "funcionarios", enabled: true  },
  { label: "Fornecedores",     icon: Store,         key: "fornecedores", enabled: true  },
  { label: "Produtos / Itens", icon: Package,       key: "produtos",  enabled: false },
  { label: "Entradas",         icon: Download,      key: "entradas",  enabled: false },
  { label: "Saídas",           icon: Upload,        key: "saidas",    enabled: false },
  { label: "Movimentações",    icon: ArrowLeftRight, key: "movimentacoes", enabled: false },
  { label: "Relatórios",       icon: FileBarChart,  key: "relatorios", enabled: false },
  { label: "Configurações",    icon: Settings,      key: "configuracoes", enabled: false }
];

const chartData = [
  { dia: "18/05", Entradas: 62, Saidas: 35 },
  { dia: "19/05", Entradas: 45, Saidas: 52 },
  { dia: "20/05", Entradas: 48, Saidas: 50 },
  { dia: "21/05", Entradas: 88, Saidas: 60 },
  { dia: "22/05", Entradas: 60, Saidas: 72 },
  { dia: "23/05", Entradas: 55, Saidas: 40 },
  { dia: "24/05", Entradas: 42, Saidas: 50 }
];

const movimentacoes = [
  { data: "24/05/2025 14:21", tipo: "Entrada", produto: "Parafuso 4.0 x 40mm", qtd: "200 un", resp: "João Silva" },
  { data: "24/05/2025 13:47", tipo: "Saida",   produto: "Chave Phillips",     qtd: "10 un",  resp: "Maria Santos" },
  { data: "24/05/2025 11:15", tipo: "Entrada", produto: "Luva de Segurança",  qtd: "50 un",  resp: "Carlos Oliveira" },
  { data: "24/05/2025 10:02", tipo: "Saida",   produto: "Fita Isolante",       qtd: "5 un",   resp: "Ana Costa" },
  { data: "24/05/2025 09:30", tipo: "Entrada", produto: "Cabo Flexível 2,5mm", qtd: "100 m",  resp: "João Silva" }
];

const funcionariosMock = [
  { nome: "João Silva",       cpf: "123.456.789-00", cargo: "Administrador", email: "joao@empresa.com" },
  { nome: "Maria Santos",     cpf: "234.567.890-11", cargo: "Almoxarife",    email: "maria@empresa.com" },
  { nome: "Carlos Oliveira",  cpf: "345.678.901-22", cargo: "Auxiliar",      email: "carlos@empresa.com" },
  { nome: "Ana Costa",        cpf: "456.789.012-33", cargo: "Assistente",    email: "ana@empresa.com" },
  { nome: "Pedro Almeida",    cpf: "567.890.123-44", cargo: "Auxiliar",      email: "pedro@empresa.com" }
];

function SummaryCard({ icon: Icon, color, value, label, footer }) {
  return (
    <div className="bg-[#1a1f2a] border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-white/10 hover:-translate-y-0.5 transition-all">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}22`, color }}>
        <Icon size={22} />
      </div>
      <div className="text-3xl font-bold text-gray-100">{value}</div>
      <div className="text-xs text-gray-400 -mt-1">{label}</div>
      {footer && <div className="mt-auto pt-1 text-xs">{footer}</div>}
    </div>
  );
}

function QuickAction({ icon: Icon, color, label, disabled }) {
  return (
    <button
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${disabled ? "opacity-45 cursor-not-allowed" : "hover:bg-white/5"}`}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}22`, color }}>
        <Icon size={18} />
      </div>
      <span className="text-sm font-medium text-gray-200">{label}</span>
    </button>
  );
}

function AlertItem({ icon: Icon, color, title, description, actionLabel = "Ver itens" }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[.02]">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}22`, color }}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-100">{title}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
      <button className="text-xs px-3 py-1.5 rounded-lg border flex-shrink-0 transition-colors" style={{ color, borderColor: color }}>
        {actionLabel}
      </button>
    </div>
  );
}

function Sidebar({ current, setCurrent, now }) {
  return (
    <aside className="w-60 bg-[#171b24] border-r border-white/5 flex flex-col fixed h-full top-0 left-0 pt-16">
      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = current === item.key;
          const base = "flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer";
          return (
            <div
              key={item.key}
              onClick={() => setCurrent(item.key)}
              title={item.enabled ? "" : "Em desenvolvimento"}
              className={`${base} ${active ? "bg-red-500/10 text-red-400 font-semibold" : "text-gray-300 hover:bg-white/5"} ${item.enabled ? "" : "opacity-45"}`}
            >
              <Icon size={18} className={active ? "text-red-400" : "text-gray-400"} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/5 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
          <Calendar size={16} className="text-red-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500">Data e hora</div>
          <div className="text-xs font-semibold text-gray-100">
            {now.toLocaleDateString("pt-BR")} {now.toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#171b24] border-b border-white/5 z-20 flex items-center px-6">
      <div className="text-lg font-bold text-gray-100 flex-1">Sistema de Almoxarifado</div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-300"><Moon size={18} /></button>
        <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-300 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white font-bold">3</span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">JS</div>
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-semibold text-gray-100">Olá, João Silva</div>
            <div className="text-xs text-gray-400">Administrador</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Bem-vindo, João Silva! 👋</h1>
        <p className="text-gray-400 text-sm">Aqui está o resumo do seu almoxarifado hoje.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-[#171b24] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-100 mb-4">Painel de Resumo</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard icon={Package}        color="#3b82f6" value="1.245" label="Total de itens em estoque" />
            <SummaryCard icon={AlertTriangle}  color="#f59e0b" value="23"    label="Itens com estoque baixo" />
            <SummaryCard icon={ArrowLeftRight} color="#10b981" value="58"    label="Movimentações hoje"
              footer={<span className="text-gray-400">Entradas: 32 | Saídas: 26</span>} />
            <SummaryCard icon={Store}          color="#a855f7" value="18"    label="Fornecedores cadastrados"
              footer={<span className="text-red-400 cursor-pointer">Ver fornecedores →</span>} />
            <SummaryCard icon={Users}          color="#06b6d4" value="42"    label="Funcionários ativos"
              footer={<span className="text-red-400 cursor-pointer">Ver funcionários →</span>} />
          </div>
        </div>

        <div className="bg-[#171b24] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-100 mb-4">Ações rápidas</h3>
          <div className="grid grid-cols-2 gap-1">
            <QuickAction icon={PlusCircle}  color="#ef4444" label="Cadastrar item" disabled />
            <QuickAction icon={Download}    color="#10b981" label="Registrar entrada" disabled />
            <QuickAction icon={Upload}      color="#f59e0b" label="Registrar saída" disabled />
            <QuickAction icon={UserPlus}    color="#06b6d4" label="Novo funcionário" />
            <QuickAction icon={Building2}   color="#a855f7" label="Novo fornecedor" />
            <QuickAction icon={FileText}    color="#3b82f6" label="Gerar relatório" disabled />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-[#171b24] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-100 mb-4">Alertas importantes</h3>
          <div className="flex flex-col gap-2">
            <AlertItem icon={AlertTriangle}  color="#ef4444" title="Estoque baixo"    description="23 itens estão com estoque abaixo do mínimo." />
            <AlertItem icon={Clock}          color="#f59e0b" title="Itens vencendo"   description="7 itens vencem nos próximos 30 dias." />
            <AlertItem icon={ClipboardList}  color="#3b82f6" title="Pedidos pendentes" description="5 pedidos de compra estão pendentes." actionLabel="Ver pedidos" />
          </div>
        </div>

        <div className="bg-[#171b24] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-100 mb-4">Entradas vs Saídas (últimos 7 dias)</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="dia" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ background: "#171b24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saidas"   fill="#ef4444" radius={[4, 4, 0, 0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#171b24] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-100 mb-4">Últimas movimentações</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/5">
                <th className="py-2 px-3 font-semibold">Data / Hora</th>
                <th className="py-2 px-3 font-semibold">Tipo</th>
                <th className="py-2 px-3 font-semibold">Produto</th>
                <th className="py-2 px-3 font-semibold">Quantidade</th>
                <th className="py-2 px-3 font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((m, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[.02]">
                  <td className="py-3 px-3 text-gray-200">{m.data}</td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{
                      backgroundColor: m.tipo === "Entrada" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color:           m.tipo === "Entrada" ? "#10b981"               : "#ef4444"
                    }}>
                      {m.tipo === "Entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-200">{m.produto}</td>
                  <td className="py-3 px-3 text-gray-200">{m.qtd}</td>
                  <td className="py-3 px-3 text-gray-200">{m.resp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-3">
          <a className="text-xs text-red-400 flex items-center gap-1 cursor-pointer">Ver todas movimentações <ArrowRight size={14} /></a>
        </div>
      </div>
    </>
  );
}

function ListaFuncionarios() {
  return (
    <div className="bg-[#171b24] border border-white/5 rounded-xl p-6">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Funcionários</h2>
          <p className="text-sm text-gray-400">Gerencie os registros de funcionários.</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Buscar funcionários..." className="w-full bg-[#0f131a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50" />
        </div>
        <button className="border border-white/10 hover:bg-white/5 text-gray-300 text-sm px-4 py-2 rounded-lg flex items-center gap-1.5">
          <Filter size={16} /> Filtros
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-white/5">
            <th className="py-2 px-3 font-semibold">Nome</th>
            <th className="py-2 px-3 font-semibold">CPF</th>
            <th className="py-2 px-3 font-semibold">Cargo</th>
            <th className="py-2 px-3 font-semibold">Email</th>
            <th className="py-2 px-3 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionariosMock.map((f, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[.02]">
              <td className="py-3 px-3 text-gray-200">{f.nome}</td>
              <td className="py-3 px-3 text-gray-200">{f.cpf}</td>
              <td className="py-3 px-3 text-gray-200">{f.cargo}</td>
              <td className="py-3 px-3 text-gray-200">{f.email}</td>
              <td className="py-3 px-3 text-right">
                <div className="flex justify-end gap-1">
                  <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-red-400" title="Editar"><Pencil size={15} /></button>
                  <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-amber-400" title="Inativar"><Ban size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComingSoonView({ title }) {
  return (
    <div className="bg-[#171b24] border border-white/5 rounded-xl p-12 text-center max-w-2xl mx-auto">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
        <Settings size={40} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-100 mb-2">{title}</h2>
      <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
        Este módulo ainda está em desenvolvimento. Em breve você poderá gerenciar todas as funcionalidades relacionadas a <strong>{title}</strong> por aqui.
      </p>
    </div>
  );
}

export default function PreviewApp() {
  const [current, setCurrent] = useState("dashboard");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const view = (() => {
    if (current === "dashboard")     return <Dashboard />;
    if (current === "funcionarios")  return <ListaFuncionarios />;
    if (current === "fornecedores")  return <ComingSoonView title="Fornecedores (lista idêntica à de funcionários)" />;
    return <ComingSoonView title={menuItems.find(m => m.key === current)?.label || "Módulo"} />;
  })();

  return (
    <div className="min-h-screen bg-[#0f131a] text-gray-200" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <TopBar />
      <Sidebar current={current} setCurrent={setCurrent} now={now} />
      <main className="ml-60 pt-20 px-6 pb-6">
        {view}
      </main>
    </div>
  );
}
