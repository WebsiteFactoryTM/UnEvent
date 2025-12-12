"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export type SwipeDirection = "up" | "down" | "left" | "right" | "all";

const SwipeDirectionContext = React.createContext<SwipeDirection>(
  "all" as SwipeDirection,
);

const ToastProvider: React.FC<
  Omit<
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Provider>,
    "swipeDirection"
  > & {
    swipeDirection?: SwipeDirection;
  }
> = ({ swipeDirection = "all" as SwipeDirection, ...props }) => {
  // Radix UI only supports single direction, so for "all" we default to "right"
  // but the CSS will handle all directions
  const radixSwipeDirection: "up" | "down" | "left" | "right" =
    swipeDirection === "all"
      ? "right"
      : (swipeDirection as "up" | "down" | "left" | "right");

  return (
    <SwipeDirectionContext.Provider value={swipeDirection as SwipeDirection}>
      <ToastPrimitives.Provider
        swipeDirection={radixSwipeDirection}
        {...props}
      />
    </SwipeDirectionContext.Provider>
  );
};
ToastProvider.displayName = ToastPrimitives.Provider.displayName;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-foreground",
        success: "success group border-success bg-success text-foreground",
        warning: "warning group border-warning bg-warning text-foreground",
        info: "info group border-info bg-info text-foreground",
      },
      swipeDirection: {
        right:
          "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:slide-out-to-right-full",
        left: "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:slide-out-to-left-full",
        up: "data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[state=closed]:slide-out-to-top-full",
        down: "data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[state=closed]:slide-out-to-bottom-full",
        all: "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)]",
      },
    },
    defaultVariants: {
      variant: "default",
      swipeDirection: "all",
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(
  (
    { className, variant, swipeDirection: swipeDirectionProp, ...props },
    ref,
  ) => {
    const swipeDirectionFromContext = React.useContext(SwipeDirectionContext);
    // Use prop if provided, otherwise use context, otherwise default to "all"
    const swipeDirection =
      swipeDirectionProp ?? swipeDirectionFromContext ?? "all";

    // For CSS variant: if "all", use "right" since Radix only supports one direction at a time
    // and we configured Radix Provider to use "right" when "all" is selected
    // Map to valid CSS variant values
    const cssSwipeDirection: "up" | "down" | "left" | "right" | "all" =
      swipeDirection === "all" ? "right" : swipeDirection;

    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(
          toastVariants({ variant, swipeDirection: cssSwipeDirection }),
          className,
        )}
        {...props}
      />
    );
  },
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/30 group-[.destructive]:hover:border-destructive/50 group-[.destructive]:hover:bg-destructive/20 group-[.destructive]:hover:text-destructive group-[.destructive]:focus:ring-destructive",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-hover:opacity-100 group-[.destructive]:text-destructive/70 group-[.destructive]:hover:text-destructive group-[.destructive]:focus:ring-destructive",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
