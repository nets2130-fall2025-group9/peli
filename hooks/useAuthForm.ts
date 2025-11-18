import { useState } from "react";
import { z } from "zod";

interface UseAuthFormOptions<T extends z.ZodTypeAny> {
  schema: T;
  initialValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  isLoaded?: boolean;
}

export function useAuthForm<T extends z.ZodType<any, any>>({
  schema,
  initialValues,
  onSubmit,
  isLoaded = true,
}: UseAuthFormOptions<T>) {
  const [formData, setFormData] = useState<z.infer<T>>(initialValues);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = schema.safeParse(formData);

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    if (!isLoaded) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    error,
    setError,
    isLoading,
    setIsLoading,
    handleChange,
    handleSubmit,
  };
}
