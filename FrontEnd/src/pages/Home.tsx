import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Starter Stack</h1>
      <p className="text-sm text-neutral-600">
        Today is <span className="font-medium">{format(new Date(), "PPP")}</span>
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => toast.success("Stack initialized!")}>
          Show Toast
        </Button>
        <Button variant="secondary" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Icon Demo
        </Button>
      </div>
      <p className="text-sm text-neutral-600">
        Explore the Form and Chart demos using the navigation.
      </p>
    </div>
  );
}

