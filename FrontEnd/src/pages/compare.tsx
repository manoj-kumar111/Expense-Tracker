import { useState, useMemo, useCallback } from 'react';
import { useExpenses } from '@/contexts/useExpenses';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Compare() {
  const { expenses, categories } = useExpenses();
  const { formatUSD, formatINR } = useCurrencyRate();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [period1Start, setPeriod1Start] = useState<Date | undefined>();
  const [period1End, setPeriod1End] = useState<Date | undefined>();
  const [period2Start, setPeriod2Start] = useState<Date | undefined>();
  const [period2End, setPeriod2End] = useState<Date | undefined>();

  const getExpensesInRange = useCallback((start: Date | undefined, end: Date | undefined) => {
    if (!start || !end) return [];
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesDate = isWithinInterval(expenseDate, { start, end });
      return matchesCategory && matchesDate;
    });
  }, [expenses, selectedCategory]);

  const period1Expenses = useMemo(() => getExpensesInRange(period1Start, period1End), [getExpensesInRange, period1Start, period1End]);
  const period2Expenses = useMemo(() => getExpensesInRange(period2Start, period2End), [getExpensesInRange, period2Start, period2End]);

  const period1Total = useMemo(() => period1Expenses.reduce((sum, e) => sum + e.amount, 0), [period1Expenses]);
  const period2Total = useMemo(() => period2Expenses.reduce((sum, e) => sum + e.amount, 0), [period2Expenses]);

  const difference = period2Total - period1Total;
  const percentChange = period1Total > 0 ? ((difference / period1Total) * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const allCategories = selectedCategory === 'all' ? categories : categories.filter(c => c.name === selectedCategory);
    return allCategories.map(cat => {
      const p1 = period1Expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
      const p2 = period2Expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
      return {
        name: cat.name,
        period1: p1,
        period2: p2,
        color: cat.color,
      };
    }).filter(c => c.period1 > 0 || c.period2 > 0);
  }, [categories, period1Expenses, period2Expenses, selectedCategory]);

  const formatDateRange = (start: Date | undefined, end: Date | undefined) => {
    if (!start || !end) return 'Select dates';
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const canCompare = period1Start && period1End && period2Start && period2End;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Compare Expenses</h1>
        <p className="text-muted-foreground mt-1">Compare your spending across different time periods</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Comparison Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period 1 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Period 1</Label>
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('justify-start text-left font-normal', !period1Start && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {period1Start ? format(period1Start, 'MMM d, yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={period1Start} onSelect={setPeriod1Start} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('justify-start text-left font-normal', !period1End && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {period1End ? format(period1End, 'MMM d, yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={period1End} onSelect={setPeriod1End} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Period 2 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Period 2</Label>
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('justify-start text-left font-normal', !period2Start && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {period2Start ? format(period2Start, 'MMM d, yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={period2Start} onSelect={setPeriod2Start} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('justify-start text-left font-normal', !period2End && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {period2End ? format(period2End, 'MMM d, yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={period2End} onSelect={setPeriod2End} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {canCompare && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Period 1 Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatUSD(period1Total)}</p>
                <p className="text-sm text-muted-foreground">{formatINR(period1Total)}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDateRange(period1Start, period1End)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Period 2 Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatUSD(period2Total)}</p>
                <p className="text-sm text-muted-foreground">{formatINR(period2Total)}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDateRange(period2Start, period2End)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Difference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {difference > 0 ? (
                    <TrendingUp className="w-5 h-5 text-destructive" />
                  ) : difference < 0 ? (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  ) : (
                    <Minus className="w-5 h-5 text-muted-foreground" />
                  )}
                  <p className={cn('text-2xl font-bold', difference > 0 ? 'text-destructive' : difference < 0 ? 'text-green-500' : '')}>
                    {difference > 0 ? '+' : ''}{formatUSD(difference)}
                  </p>
                </div>
                <p className={cn('text-sm', difference > 0 ? 'text-destructive' : difference < 0 ? 'text-green-500' : 'text-muted-foreground')}>
                  {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}% change
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown Chart */}
          {categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tickFormatter={(v) => `$${v}`} className="text-xs" />
                      <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                      <Tooltip
                        formatter={(value) => formatUSD(Number(value ?? 0))}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend />
                      <Bar dataKey="period1" name="Period 1" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="period2" name="Period 2" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expense Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Period 1 Expenses ({period1Expenses.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {period1Expenses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No expenses in this period</p>
                ) : (
                  <div className="space-y-2">
                    {period1Expenses.map(expense => (
                      <div key={expense.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-sm">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
                        </div>
                        <p className="font-semibold text-sm">{formatUSD(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Period 2 Expenses ({period2Expenses.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {period2Expenses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No expenses in this period</p>
                ) : (
                  <div className="space-y-2">
                    {period2Expenses.map(expense => (
                      <div key={expense.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-sm">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
                        </div>
                        <p className="font-semibold text-sm">{formatUSD(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!canCompare && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Select date ranges for both periods to compare your expenses</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
