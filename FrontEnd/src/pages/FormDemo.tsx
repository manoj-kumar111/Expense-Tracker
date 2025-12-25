import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18, "Must be 18+"),
});

type FormValues = z.infer<typeof schema>;

export default function FormDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Form & Validation</h2>
      <form
        onSubmit={handleSubmit((v) => alert(JSON.stringify(v, null, 2)))}
        className="space-y-3 max-w-sm"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-[var(--radius)] border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-400"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Age</label>
          <input
            type="number"
            className="w-full rounded-[var(--radius)] border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-400"
            {...register("age", { valueAsNumber: true })}
          />
          {errors.age && (
            <p className="text-sm text-red-600">{errors.age.message}</p>
          )}
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
