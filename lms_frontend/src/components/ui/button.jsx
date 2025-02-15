import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = {
  // Primary gradient buttons
  primary: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md",
  
  // Secondary gradient buttons
  secondary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md",
  
  // Ghost buttons
  ghost: "text-gray-400 hover:text-red-500 hover:bg-red-50 bg-transparent hover:bg-opacity-90",
  
  // Outline buttons
  outline: "border-2 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent",
  
  // Destructive buttons
  destructive: "bg-red-500 hover:bg-red-600 text-white",
  
  // Disabled state
  disabled: "opacity-50 cursor-not-allowed pointer-events-none",
  
  // Size variations
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg"
};

const Button = React.forwardRef(({ 
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  disabled,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium",
        "ring-offset-background transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
        
        // Apply variant styles
        buttonVariants[variant],
        
        // Apply size styles
        buttonVariants[size],
        
        // Apply disabled styles if needed
        disabled && buttonVariants.disabled,
        
        // Allow custom classes to override
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});

Button.displayName = "Button";

// Loading Button Component
const LoadingButton = React.forwardRef(({ 
  children, 
  loading = false, 
  loadingText = "Loading...",
  ...props 
}, ref) => {
  return (
    <Button
      ref={ref}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
});

LoadingButton.displayName = "LoadingButton";

// IconButton Component
const IconButton = React.forwardRef(({ 
  children, 
  className,
  ...props 
}, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "p-2", // Square padding for icon buttons
        "h-auto w-auto", // Auto dimensions
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
});

IconButton.displayName = "IconButton";

export { Button, LoadingButton, IconButton, buttonVariants };