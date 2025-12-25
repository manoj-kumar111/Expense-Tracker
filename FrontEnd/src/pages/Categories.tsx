import React, { useState } from 'react';
import { useExpenses } from '@/contexts/useExpenses';
import type { Category } from '@/contexts/ExpenseContext';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, Tags, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

const colorOptions = [
  'hsl(173, 80%, 45%)',
  'hsl(280, 65%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 75%, 55%)',
  'hsl(200, 75%, 50%)',
  'hsl(160, 84%, 39%)',
  'hsl(25, 95%, 53%)',
  'hsl(262, 83%, 58%)',
];

export default function Categories() {
  const { categories, expenses, addCategory, updateCategory, deleteCategory } = useExpenses();
  const { formatUSD, formatINR } = useCurrencyRate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: colorOptions[0],
    icon: 'tag',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: colorOptions[0],
      icon: 'tag',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter a category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      toast.success('Category updated');
      setEditingCategory(null);
    } else {
      addCategory(formData);
      toast.success('Category created');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
    }
  };

  const getCategoryExpenseCount = (categoryName: string) => {
    return expenses.filter(exp => exp.category === categoryName).length;
  };

  const getCategoryTotal = (categoryName: string) => {
    return expenses
      .filter(exp => exp.category === categoryName)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your expenses into categories</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="glow" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Travel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" className="flex-1">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const expenseCount = getCategoryExpenseCount(category.name);
          const totalAmount = getCategoryTotal(category.name);

          return (
            <div
              key={category.id}
              className={`glass-card-hover rounded-2xl p-6 animate-slide-up stagger-${(index % 4) + 1}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.name === 'Other' ? (
                    <MoreHorizontal className="w-7 h-7" style={{ color: category.color }} />
                  ) : (
                    <Tags className="w-7 h-7" style={{ color: category.color }} />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                {category.name}
              </h3>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
                </span>
                <div className="text-right">
                  <span className="font-medium block" style={{ color: category.color }}>
                    {formatUSD(totalAmount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatINR(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Progress bar showing relative spending */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: category.color,
                    width: `${Math.min((totalAmount / 1000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Expenses using this category will keep
              their current category label.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
