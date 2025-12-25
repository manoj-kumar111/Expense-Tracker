import { useMemo } from 'react';
import { useExpenses } from '@/contexts/useExpenses';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  Plus,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const { expenses, categories } = useExpenses();
  const { formatUSD, formatINR, USD_TO_INR, lastUpdated, isLoading: rateLoading } = useCurrencyRate();

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonth = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);
    
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    return {
      total,
      monthlyTotal,
      highestCategory: highestCategory ? { name: highestCategory[0], amount: highestCategory[1] } : null,
      expenseCount: expenses.length,
    };
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, i) => {
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === i;
      });
      return {
        name: month,
        amount: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });
    return data;
  }, [expenses]);

  const categoryData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => {
      const cat = categories.find(c => c.name === name);
      return {
        name,
        value,
        color: cat?.color || 'hsl(var(--chart-1))',
      };
    });
  }, [expenses, categories]);

  const recentExpenses = expenses.slice(0, 5);

  const statCards = [
    {
      title: 'Total Expenses',
      value: formatUSD(stats.total),
      subtitle: formatINR(stats.total),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: false,
      color: 'from-primary/20 to-primary/5',
    },
    {
      title: 'This Month',
      value: formatUSD(stats.monthlyTotal),
      subtitle: formatINR(stats.monthlyTotal),
      icon: CreditCard,
      trend: '-8.2%',
      trendUp: true,
      color: 'from-chart-2/20 to-chart-2/5',
    },
    {
      title: 'Highest Category',
      value: stats.highestCategory?.name || 'N/A',
      subtitle: stats.highestCategory ? `${formatUSD(stats.highestCategory.amount)} / ${formatINR(stats.highestCategory.amount)}` : '',
      icon: PiggyBank,
      color: 'from-chart-3/20 to-chart-3/5',
    },
    {
      title: 'Total Transactions',
      value: stats.expenseCount.toString(),
      icon: TrendingUp,
      trend: '+5',
      trendUp: true,
      color: 'from-chart-5/20 to-chart-5/5',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your spending at a glance
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Rate: 1 USD = ₹{USD_TO_INR.toFixed(2)}
                {rateLoading && <RefreshCw className="w-3 h-3 inline ml-1 animate-spin" />}
              </span>
            )}
          </p>
        </div>
        <Link to="/expenses">
          <Button variant="glow" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className={`stat-card animate-slide-up stagger-${index + 1}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">Monthly Trends</h2>
              <p className="text-sm text-muted-foreground">Expense overview for the year</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Amount']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-heading font-semibold text-foreground">By Category</h2>
            <p className="text-sm text-muted-foreground">Spending distribution</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Amount']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Recent Expenses</h2>
            <p className="text-sm text-muted-foreground">Your latest transactions</p>
          </div>
          <Link to="/expenses">
            <Button variant="ghost" className="gap-2 text-primary">
              View all
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {recentExpenses.map((expense, index) => {
            const category = categories.find(c => c.name === expense.category);
            return (
              <div
                key={expense.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up stagger-${index + 1}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category?.color}20` }}
                  >
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{expense.title}</p>
                    <p className="text-sm text-muted-foreground">{expense.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    -{formatUSD(expense.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(expense.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
