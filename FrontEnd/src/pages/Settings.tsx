import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useExpenses } from '@/contexts/useExpenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Lock,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';

export default function Settings() {
  const { user } = useAuth();
  const { expenses, deleteExpense } = useExpenses();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [editName, setEditName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveName = () => {
    if (editName.trim()) {
      // Update name in localStorage
      const storedUser = localStorage.getItem('expense_tracker_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = editName.trim();
        localStorage.setItem('expense_tracker_user', JSON.stringify(userData));
        setDisplayName(editName.trim());
        toast.success('Name updated successfully');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await api.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      const message = (() => {
        const raw = (e as Error)?.message || 'Failed to change password';
        try {
          const parsed = JSON.parse(raw);
          return parsed?.message || raw;
        } catch {
          return raw;
        }
      })();
      toast.error(message);
    }
  };

  const handleExportData = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const headers = ['Title', 'Amount', 'Category', 'Date', 'Description'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(exp => 
        [
          `"${exp.title}"`,
          exp.amount,
          `"${exp.category}"`,
          `"${exp.date}"`,
          `"${exp.description || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Expenses exported successfully');
  };

  const handleDeleteAllExpenses = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to delete');
      return;
    }
    expenses.forEach(exp => deleteExpense(exp.id));
    toast.success('All expenses deleted successfully');
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-heading font-bold text-primary-foreground">
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground">{displayName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input 
              id="name" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
            />
          </div>
          <Button variant="glow" onClick={handleSaveName}>Save Name</Button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button variant="glow" onClick={handleChangePassword}>Change Password</Button>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-heading font-semibold text-foreground">Data Management</h2>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-3" onClick={handleExportData}>
            <Download className="w-5 h-5" />
            Export All Data (CSV)
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <Trash2 className="w-5 h-5" />
                Delete All Expenses
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {expenses.length} expenses. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAllExpenses}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>ExpenseFlow v1.0.0</p>
        <p className="mt-1">Made with ❤️ for smart financial management</p>
      </div>
    </div>
  );
}
