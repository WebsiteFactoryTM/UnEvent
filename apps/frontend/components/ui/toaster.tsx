"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type SwipeDirection,
} from "@/components/ui/toast";

export function Toaster({
  swipeDirection = "all" as SwipeDirection,
}: {
  swipeDirection?: SwipeDirection;
}) {
  const { toasts } = useToast();
  const swipeDir = swipeDirection as SwipeDirection;

  return (
    <ToastProvider swipeDirection={swipeDir}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
