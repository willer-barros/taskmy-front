"use client"

import React, { useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  Award,
  AlertTriangle,
  Zap,
  BarChart3,
  Filter,
  Download,
  ChevronDown,
  Activity,
  Flame,
  Star,
  MessageSquare,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

export default function ProductivityDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const teamMembers = [
    {
      id: 1,
      name: 'João Silva',
      avatar: 'JS',
      role: 'Senior Developer',
      tasksCompleted: 28,
      tasksInProgress: 5,
      productivity: 94,
      trend: 'up',
      trendValue: 12,
      hoursWorked: 38,
      velocity: 32,
      quality: 96,
      onTime: 89,
      status: 'high'
    },
    {
      id: 2,
      name: 'Maria Santos',
      avatar: 'MS',
      role: 'Product Designer',
      tasksCompleted: 24,
      tasksInProgress: 3,
      productivity: 88,
      trend: 'up',
      trendValue: 5,
      hoursWorked: 40,
      velocity: 28,
      quality: 92,
      onTime: 95,
      status: 'high'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      avatar: 'PC',
      role: 'Frontend Dev',
      tasksCompleted: 18,
      tasksInProgress: 7,
      productivity: 72,
      trend: 'down',
      trendValue: 8,
      hoursWorked: 35,
      velocity: 22,
      quality: 85,
      onTime: 78,
      status: 'medium'
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      avatar: 'AO',
      role: 'Backend Dev',
      tasksCompleted: 22,
      tasksInProgress: 4,
      productivity: 85,
      trend: 'stable',
      trendValue: 0,
      hoursWorked: 38,
      velocity: 26,
      quality: 90,
      onTime: 88,
      status: 'high'
    },
    {
      id: 5,
      name: 'Carlos Lima',
      avatar: 'CL',
      role: 'QA Engineer',
      tasksCompleted: 15,
      tasksInProgress: 8,
      productivity: 65,
      trend: 'down',
      trendValue: 15,
      hoursWorked: 32,
      velocity: 18,
      quality: 88,
      onTime: 70,
      status: 'alert'
    },
  ];

  const overallStats = {
    teamProductivity: 81,
    tasksCompleted: 107,
    averageVelocity: 25.2,
    onTimeDelivery: 84,
    qualityScore: 90,
    activeMembers: 5,
    totalHours: 183,
    burnoutRisk: 2
  };

  const activityData = [
    { day: 'Seg', value: 85 },
    { day: 'Ter', value: 92 },
    { day: 'Qua', value: 78 },
    { day: 'Qui', value: 88 },
    { day: 'Sex', value: 95 },
    { day: 'Sáb', value: 45 },
    { day: 'Dom', value: 20 },
  ];

  return (
    <div className="min-h-screen bg-[#1e293b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Produtividade</h1>
              <p className="text-gray-300">Acompanhamento em tempo real</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
                <option value="quarter">Trimestre</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter size={16} />
                <span>Filtros</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                <Download size={16} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <span className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUp size={16} />
                +5%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Produtividade Geral</p>
            <p className="text-3xl font-bold text-gray-800">{overallStats.teamProductivity}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${overallStats.teamProductivity}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-white" size={24} />
              </div>
              <span className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUp size={16} />
                +12
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tarefas Concluídas</p>
            <p className="text-3xl font-bold text-gray-800">{overallStats.tasksCompleted}</p>
            <p className="text-xs text-gray-500 mt-2">Esta semana</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <span className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUp size={16} />
                +2.3
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Velocity Média</p>
            <p className="text-3xl font-bold text-gray-800">{overallStats.averageVelocity}</p>
            <p className="text-xs text-gray-500 mt-2">Story points/sprint</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
              <span className="flex items-center text-red-600 text-sm font-semibold">
                <ArrowDown size={16} />
                -3%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Entrega no Prazo</p>
            <p className="text-3xl font-bold text-gray-800">{overallStats.onTimeDelivery}%</p>
            <p className="text-xs text-gray-500 mt-2">Últimos 30 dias</p>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Atividade da Semana</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Meta:</span>
              <span className="font-bold text-indigo-600">85%</span>
            </div>
          </div>
          <div className="flex items-end justify-between space-x-3 h-48">
            {activityData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                      item.value >= 85 ? 'bg-green-500' : item.value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${item.value}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                      {item.value}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Estatísticas Rápidas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Membros Ativos</p>
                    <p className="font-bold text-gray-800">{overallStats.activeMembers}</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">100%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Horas Trabalhadas</p>
                    <p className="font-bold text-gray-800">{overallStats.totalHours}h</p>
                  </div>
                </div>
                <span className="text-gray-600 text-sm">Esta semana</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Qualidade</p>
                    <p className="font-bold text-gray-800">{overallStats.qualityScore}%</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">Excelente</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risco Burnout</p>
                    <p className="font-bold text-gray-800">{overallStats.burnoutRisk} pessoas</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-semibold text-sm">Atenção</span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Star className="text-yellow-500 mr-2" size={18} />
              Top Performers
            </h3>
            <div className="space-y-3">
              {teamMembers
                .sort((a, b) => b.productivity - a.productivity)
                .slice(0, 3)
                .map((member, idx) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.tasksCompleted} tarefas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{member.productivity}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="text-orange-500 mr-2" size={18} />
              Alertas e Atenção
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Flame className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Carlos Lima - Baixa Produtividade</p>
                    <p className="text-xs text-red-700 mt-1">Queda de 15% na última semana</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Pedro Costa - Carga Alta</p>
                    <p className="text-xs text-yellow-700 mt-1">7 tarefas em progresso simultâneas</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">João Silva - Destaque!</p>
                    <p className="text-xs text-blue-700 mt-1">Aumento de 12% em produtividade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Desempenho Individual</h3>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Todos</button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Alta Performance</button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Necessita Atenção</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Colaborador</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Produtividade</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Tarefas</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Velocity</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Qualidade</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">No Prazo</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Tendência</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-800 mb-1">{member.productivity}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              member.productivity >= 85 ? 'bg-green-500' : 
                              member.productivity >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${member.productivity}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div>
                        <p className="font-bold text-green-600">{member.tasksCompleted}</p>
                        <p className="text-xs text-gray-500">{member.tasksInProgress} em progresso</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-indigo-600">{member.velocity}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${
                        member.quality >= 90 ? 'text-green-600' : 
                        member.quality >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {member.quality}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${
                        member.onTime >= 85 ? 'text-green-600' : 
                        member.onTime >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {member.onTime}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-1">
                        {member.trend === 'up' && <ArrowUp className="text-green-600" size={16} />}
                        {member.trend === 'down' && <ArrowDown className="text-red-600" size={16} />}
                        {member.trend === 'stable' && <Minus className="text-gray-400" size={16} />}
                        <span className={`text-sm font-semibold ${
                          member.trend === 'up' ? 'text-green-600' : 
                          member.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {member.trendValue > 0 ? '+' : ''}{member.trendValue}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        member.status === 'high' ? 'bg-green-100 text-green-700' :
                        member.status === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {member.status === 'high' ? 'Ótimo' : member.status === 'medium' ? 'Bom' : 'Atenção'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}